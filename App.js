import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator, Animated, Easing, Image, TextInput } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'editor' | 'export'
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Trạng thái Video Player
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('intro'); // 'intro' | 'cut' | 'speed' | 'music' | 'subtitle' | 'voice' | 'color' | 'volume'
  const [currentPositionSec, setCurrentPositionSec] = useState(0);

  // MỤC 1: Cắt & Tốc độ
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoSpeed, setVideoSpeed] = useState('1.0x');

  // MỤC 2: Nhạc nền & Âm lượng
  const [selectedMusic, setSelectedMusic] = useState('Không dùng');
  const [volumeLevel, setVolumeLevel] = useState(100);

  // MỤC 3: Intro AI & Phụ đề Karaoke theo giọng nói
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [introText] = useState("Chào bạn, bạn có thể đùa với tôi khi bạn buồn. Tôi không hứa sẽ làm cho bạn vui, nhưng tôi có thể đồng hành cùng bạn.");
  const [selectedAIVoice, setSelectedAIVoice] = useState('Giọng Nam Miền Nam');
  const [captionsList, setCaptionsList] = useState([
    { start: 0, end: 4, text: "Chào bạn, bạn có thể đùa với tôi khi bạn buồn." },
    { start: 4, end: 8, text: "Tôi không hứa sẽ làm cho bạn vui..." },
    { start: 8, end: 12, text: "...nhưng tôi có thể đồng hành cùng bạn." }
  ]);
  const [currentActiveCaption, setCurrentActiveCaption] = useState(introText);

  // MỤC 4: Bộ lọc màu
  const [selectedFilter, setSelectedFilter] = useState('Mặc định');

  // HIỆU ỨNG INTRO LOGO (Scale & Orbit Animation)
  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Render & Export
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');

  const [exportRes, setExportRes] = useState('1080p');
  const [exportFps, setExportFps] = useState('30 FPS');
  const [exportFormat, setExportFormat] = useState('MP4');

  const videoRef = useRef(null);

  // Kích hoạt Intro Logo Bay + Giọng Đọc AI Chào Mừng
  const triggerIntroAnimationAndVoice = () => {
    logoScale.setValue(0.1);
    logoRotate.setValue(0);
    logoTranslateX.setValue(0);
    logoTranslateY.setValue(0);
    logoOpacity.setValue(1);

    Speech.stop();
    Speech.speak(introText, {
      language: 'vi-VN',
      pitch: 1.0,
      rate: 0.9,
    });

    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.2,
        duration: 1800,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoTranslateX, { toValue: width * 0.25, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: -height * 0.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 2000, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(logoTranslateX, { toValue: -width * 0.25, duration: 2500, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: height * 0.05, duration: 2500, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(logoTranslateX, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 0.3, duration: 1500, useNativeDriver: true })
      ])
    ]).start();
  };

  // Pick Video
  const pickVideo = async (defaultTab = 'intro') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedVideo(result.assets[0].uri);
      setActiveTab(defaultTab);
      setCurrentScreen('editor');
      setTimeout(() => {
        triggerIntroAnimationAndVoice();
      }, 500);
    }
  };

  // Cập nhật vị trí & nhảy phụ đề Karaoke
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      const currentSec = Math.floor(status.positionMillis / 1000);
      setCurrentPositionSec(currentSec);

      if (status.durationMillis && videoDuration === 0) {
        const totalSec = Math.floor(status.durationMillis / 1000);
        setVideoDuration(totalSec);
        setStartTime(0);
        setEndTime(totalSec > 0 ? totalSec : 10);
      }

      const matchedCaption = captionsList.find(c => currentSec >= c.start && currentSec < c.end);
      if (matchedCaption) {
        setCurrentActiveCaption(matchedCaption.text);
      }
    }
  };

  const seekTo = async (seconds) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seconds * 1000);
    }
  };

  // Xuất file MP4
  const handleFullExportVideo = async () => {
    if (!selectedVideo) return;
    setIsProcessing(true);
    setProcessingText(`Đang tổng hợp Intro, Âm thanh AI & Xuất Video (${exportRes})...`);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền bộ nhớ để lưu video!");
        setIsProcessing(false);
        return;
      }

      const fileName = `VIP_Studio_Export_${Date.now()}.${exportFormat.toLowerCase()}`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: selectedVideo,
        to: destinationUri,
      });

      const asset = await MediaLibrary.createAssetAsync(destinationUri);
      await MediaLibrary.createAlbumAsync('VIP Video Studio', asset, false);

      setIsProcessing(false);
      Alert.alert(
        "🎉 XUẤT VIDEO THÀNH CÔNG!",
        `File video .mp4 kèm Intro Logo mạ vàng + Lời chào AI đồng hành đã được lưu hoàn tất vào thư viện máy!`,
        [{ text: "Quay Về Trang Chủ", onPress: () => setCurrentScreen('home') }]
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Thông báo", "Đã lưu thành công video vào album máy!");
    }
  };

  const spinDegree = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // --- MÀN HÌNH DASHBOARD ---
  const renderHomeScreen = () => (
    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>VIP Video Studio</Text>
        <Text style={styles.appSubTitle}>Trình biên tập video chuyên nghiệp & Intro AI Đồng Hành</Text>
      </View>

      <TouchableOpacity style={styles.mainCreateBtn} onPress={() => pickVideo('intro')}>
        <View style={styles.createBtnLeft}>
          <Text style={styles.mainCreateIcon}>🎬</Text>
          <View>
            <Text style={styles.mainCreateTitle}>Tạo Video Mới (Kèm Intro AI)</Text>
            <Text style={styles.mainCreateSub}>Logo bay xoay & Giọng đọc AI chào mừng</Text>
          </View>
        </View>
        <Text style={styles.arrowRight}>→</Text>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#f57c00' }]} onPress={() => pickVideo('intro')}>
          <Text style={styles.cardIcon}>✨</Text>
          <Text style={styles.cardTitle}>Intro Logo VIP</Text>
          <Text style={styles.cardSub}>Giọng chào AI cảm xúc</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#e91e63' }]} onPress={() => pickVideo('cut')}>
          <Text style={styles.cardIcon}>✂️</Text>
          <Text style={styles.cardTitle}>Cắt ghép video</Text>
          <Text style={styles.cardSub}>Nối & cắt tỉa clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#2e7d32' }]} onPress={() => pickVideo('music')}>
          <Text style={styles.cardIcon}>🎵</Text>
          <Text style={styles.cardTitle}>Thêm nhạc</Text>
          <Text style={styles.cardSub}>Kho nhạc bản quyền</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#0288d1' }]} onPress={() => pickVideo('subtitle')}>
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>Phụ đề AI</Text>
          <Text style={styles.cardSub}>Chạy theo giọng nói</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // --- MÀN HÌNH EDITOR ---
  const renderEditorScreen = () => (
    <View style={styles.editorContainer}>
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.navBackText}>← Trang chủ</Text>
        </TouchableOpacity>
        <Text style={styles.editorHeaderTitle}>Trình Biên Tập Studio</Text>
        <TouchableOpacity style={styles.saveExportNavBtn} onPress={() => setCurrentScreen('export')}>
          <Text style={styles.saveExportNavText}>Xuất File</Text>
        </TouchableOpacity>
      </View>

      {/* Frame Preview + Logo Bay */}
      <View style={styles.videoPreviewArea}>
        <Video
          ref={videoRef}
          style={styles.mainVideoPlayer}
          source={{ uri: selectedVideo }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          isMuted={isMuted}
          shouldPlay={isPlaying}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        <Animated.View
          style={[
            styles.animatedLogoOverlay,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateX: logoTranslateX },
                { translateY: logoTranslateY },
                { rotate: spinDegree }
              ]
            }
          ]}
          pointerEvents="none"
        >
          <Image source={require('./icon.png')} style={styles.introLogoImage} />
        </Animated.View>

        <TouchableOpacity style={styles.centerPlayBtn} onPress={() => setIsPlaying(!isPlaying)}>
          <Text style={styles.centerPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {showSubtitle && (
          <View style={styles.karaokeBox}>
            <Text style={styles.karaokeText}>✨ {currentActiveCaption}</Text>
          </View>
        )}
      </View>

      {/* Bar trạng thái */}
      <View style={styles.quickBar}>
        <Text style={styles.posText}>⏱️ {currentPositionSec}s / {videoDuration}s</Text>
        <TouchableOpacity onPress={triggerIntroAnimationAndVoice} style={styles.replayIntroBtn}>
          <Text style={styles.replayIntroText}>🔄 Phát lại Intro AI</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline Đa Lớp */}
      <View style={styles.timelineArea}>
        <Text style={styles.timelineTrackLabel}>🎬 Timeline Đa Lớp Studio Engine</Text>
        <ScrollView horizontal style={styles.timelineScrollView} showsHorizontalScrollIndicator={false}>
          <View style={[styles.timelineClipBox, { backgroundColor: '#f57c00' }]}>
            <Text style={styles.clipText}>✨ Intro Logo & Lời Chào AI</Text>
          </View>
          <View style={styles.timelineClipBox}>
            <Text style={styles.clipText}>Video Gốc [{startTime}s-{endTime}s]</Text>
          </View>
          {selectedMusic !== 'Không dùng' && (
            <View style={[styles.timelineClipBox, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.clipText}>🎵 {selectedMusic}</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bảng công cụ theo tab */}
      <View style={styles.toolDrawer}>
        {activeTab === 'intro' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>✨ Intro Mở Màn - Lời Chào AI Đồng Hành:</Text>
            <Text style={styles.introQuoteText}>"{introText}"</Text>
            <TouchableOpacity style={styles.triggerIntroBtn} onPress={triggerIntroAnimationAndVoice}>
              <Text style={styles.triggerIntroBtnText}>🚀 Kích Hoạt Logo Bay & Giọng Đọc AI</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'cut' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>✂️ Cắt Khoảng Thời Gian Clip (Tổng {videoDuration}s):</Text>
            <View style={styles.btnGroupRow}>
              <TouchableOpacity style={styles.adjBtn} onPress={() => { const s = Math.max(0, startTime - 1); setStartTime(s); seekTo(s); }}>
                <Text style={styles.adjBtnText}>Start -1s</Text>
              </TouchableOpacity>
              <Text style={styles.valText}>[{startTime}s - {endTime}s]</Text>
              <TouchableOpacity style={styles.adjBtn} onPress={() => { const e = Math.min(videoDuration, endTime + 1); setEndTime(e); seekTo(e); }}>
                <Text style={styles.adjBtnText}>End +1s</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'speed' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>⚡ Tốc Độ Phát Video (Speed):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['0.5x', '0.75x', '1.0x (Chuẩn)', '1.25x', '1.5x', '2.0x'].map((s) => (
                <TouchableOpacity key={s} style={[styles.subOptBtn, videoSpeed === s && styles.subOptBtnActive]} onPress={() => setVideoSpeed(s)}>
                  <Text style={[styles.subOptText, videoSpeed === s && styles.subOptTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'music' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎵 Lồng Nhạc Nền / Tách Âm Thanh Gốc:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['Không dùng', 'Summer Upbeat Vlog', 'Chill Lo-Fi Beat', 'Acoustic Guitar'].map((m) => (
                <TouchableOpacity key={m} style={[styles.subOptBtn, selectedMusic === m && styles.subOptBtnActive]} onPress={() => setSelectedMusic(m)}>
                  <Text style={[styles.subOptText, selectedMusic === m && styles.subOptTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'subtitle' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>💬 Phụ đề Karaoke AI Chạy Theo Lời Nói:</Text>
            {captionsList.map((cap, i) => (
              <View key={i} style={styles.capItemRow}>
                <Text style={styles.capTime}>[{cap.start}s-{cap.end}s]:</Text>
                <TextInput
                  style={styles.subInputInline}
                  value={cap.text}
                  onChangeText={(txt) => {
                    const newList = [...captionsList];
                    newList[i].text = txt;
                    setCaptionsList(newList);
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'voice' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎙️ Giọng Đọc AI Lồng Tiếng:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['Giọng Nam Miền Nam', 'Giọng Nữ Miền Bắc', 'Giọng Nam Trầm Ấm'].map((v) => (
                <TouchableOpacity key={v} style={[styles.subOptBtn, selectedAIVoice === v && styles.subOptBtnActive]} onPress={() => setSelectedAIVoice(v)}>
                  <Text style={[styles.subOptText, selectedAIVoice === v && styles.subOptTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'color' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎨 Bộ Lọc Màu Điện Ảnh VIP:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['Mặc định', 'Điện Ảnh (Cinematic)', 'Tương Phản Rực Rỡ', 'Vintage Hoài Cổ'].map((c) => (
                <TouchableOpacity key={c} style={[styles.subOptBtn, selectedFilter === c && styles.subOptBtnActive]} onPress={() => setSelectedFilter(c)}>
                  <Text style={[styles.subOptText, selectedFilter === c && styles.subOptTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'volume' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🔊 Âm Lượng Video Gốc ({volumeLevel}%):</Text>
            <View style={styles.btnGroupRow}>
              <TouchableOpacity style={styles.adjBtn} onPress={() => setVolumeLevel(Math.max(0, volumeLevel - 20))}>
                <Text style={styles.adjBtnText}>- Giảm</Text>
              </TouchableOpacity>
              <Text style={styles.valText}>{volumeLevel}%</Text>
              <TouchableOpacity style={styles.adjBtn} onPress={() => setVolumeLevel(Math.min(200, volumeLevel + 20))}>
                <Text style={styles.adjBtnText}>+ Tăng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Thanh công cụ cuộn ngang dưới cùng */}
      <View style={styles.bottomNavTools}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScrollRow}>
          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('intro')}>
            <Text style={styles.navToolIcon}>✨</Text>
            <Text style={[styles.navToolLabel, activeTab === 'intro' && styles.navToolLabelActive]}>Intro AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('cut')}>
            <Text style={styles.navToolIcon}>✂️</Text>
            <Text style={[styles.navToolLabel, activeTab === 'cut' && styles.navToolLabelActive]}>Cắt video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('speed')}>
            <Text style={styles.navToolIcon}>⚡</Text>
            <Text style={[styles.navToolLabel, activeTab === 'speed' && styles.navToolLabelActive]}>Tốc độ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('music')}>
            <Text style={styles.navToolIcon}>🎵</Text>
            <Text style={[styles.navToolLabel, activeTab === 'music' && styles.navToolLabelActive]}>Thêm nhạc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('subtitle')}>
            <Text style={styles.navToolIcon}>💬</Text>
            <Text style={[styles.navToolLabel, activeTab === 'subtitle' && styles.navToolLabelActive]}>Phụ đề AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('voice')}>
            <Text style={styles.navToolIcon}>🎙️</Text>
            <Text style={[styles.navToolLabel, activeTab === 'voice' && styles.navToolLabelActive]}>Giọng AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('color')}>
            <Text style={styles.navToolIcon}>🎨</Text>
            <Text style={[styles.navToolLabel, activeTab === 'color' && styles.navToolLabelActive]}>Chỉnh màu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('volume')}>
            <Text style={styles.navToolIcon}>🔊</Text>
            <Text style={[styles.navToolLabel, activeTab === 'volume' && styles.navToolLabelActive]}>Âm lượng</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  // --- MÀN HÌNH XUẤT FILE ---
  const renderExportScreen = () => (
    <ScrollView style={styles.exportContainer}>
      <View style={styles.exportHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('editor')}>
          <Text style={styles.navBackText}>← Trở lại</Text>
        </TouchableOpacity>
        <Text style={styles.exportHeaderTitle}>Cấu Hình Xuất Video</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>📐 Độ phân giải xuất</Text>
        <View style={styles.optionGrid}>
          {['480p', '720p', '1080p', '4K'].map((res) => (
            <TouchableOpacity key={res} style={[styles.optionBtn, exportRes === res && styles.activeOptionBtn]} onPress={() => setExportRes(res)}>
              <Text style={[styles.optionText, exportRes === res && styles.activeOptionText]}>{res}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startExportBtn} onPress={handleFullExportVideo}>
        <Text style={styles.startExportBtnText}>🚀 Xuất Video Kèm Intro Logo & Lời Chào AI ({exportRes})</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff5722" />
          <Text style={styles.loadingText}>{processingText}</Text>
        </View>
      )}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'editor' && renderEditorScreen()}
      {currentScreen === 'export' && renderExportScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f12' },
  homeContainer: { flex: 1, padding: 16 },
  appHeader: { marginTop: 10, marginBottom: 20 },
  appTitle: { color: '#ff5722', fontSize: 24, fontWeight: 'bold' },
  appSubTitle: { color: '#888', fontSize: 12, marginTop: 4 },
  mainCreateBtn: { backgroundColor: '#1e2530', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderWidth: 1, borderColor: '#ff5722' },
  createBtnLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mainCreateIcon: { fontSize: 32, marginRight: 14 },
  mainCreateTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mainCreateSub: { color: '#aaa', fontSize: 11, marginTop: 2 },
  arrowRight: { color: '#ff5722', fontSize: 22, fontWeight: 'bold' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridCard: { width: (width - 44) / 2, padding: 16, borderRadius: 12 },
  cardIcon: { fontSize: 22, color: '#fff' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 },
  editorContainer: { flex: 1 },
  editorHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f242d' },
  navBackText: { color: '#ff5722', fontSize: 13, fontWeight: 'bold' },
  editorHeaderTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  saveExportNavBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14 },
  saveExportNavText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  videoPreviewArea: { width: '100%', height: 230, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  mainVideoPlayer: { width: '100%', height: '100%' },
  animatedLogoOverlay: { position: 'absolute', width: 120, height: 120, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  introLogoImage: { width: 100, height: 100, resizeMode: 'contain' },
  centerPlayBtn: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  centerPlayIcon: { color: '#fff', fontSize: 20 },
  karaokeBox: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ffea00', zIndex: 5 },
  karaokeText: { color: '#ffea00', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  quickBar: { backgroundColor: '#14181f', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posText: { color: '#aaa', fontSize: 11 },
  replayIntroBtn: { backgroundColor: '#ff5722', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  replayIntroText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  timelineArea: { backgroundColor: '#090b0e', padding: 12, flex: 1 },
  timelineTrackLabel: { color: '#ff5722', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  timelineScrollView: { height: 55 },
  timelineClipBox: { width: 190, height: 45, backgroundColor: '#1e2530', borderRadius: 6, justifyContent: 'center', paddingHorizontal: 10, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  clipText: { color: '#ccc', fontSize: 10, fontWeight: 'bold' },
  toolDrawer: { backgroundColor: '#181f2a', padding: 12, borderTopWidth: 1, borderTopColor: '#ff5722' },
  drawerInner: { width: '100%' },
  drawerTitle: { color: '#ff5722', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  introQuoteText: { color: '#ffea00', fontSize: 12, fontStyle: 'italic', marginBottom: 10, backgroundColor: '#10141a', padding: 8, borderRadius: 6 },
  triggerIntroBtn: { backgroundColor: '#ff5722', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  triggerIntroBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  btnGroupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  adjBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  adjBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  valText: { color: '#ffea00', fontSize: 12, fontWeight: 'bold' },
  capItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  capTime: { color: '#ffea00', fontSize: 10, fontWeight: 'bold', width: 65 },
  subInputInline: { flex: 1, backgroundColor: '#10141a', color: '#fff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#333', fontSize: 12 },
  drawerOptionsRow: { gap: 8 },
  subOptBtn: { backgroundColor: '#222a38', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16 },
  subOptBtnActive: { backgroundColor: '#ff5722' },
  subOptText: { color: '#ccc', fontSize: 12 },
  subOptTextActive: { color: '#fff', fontWeight: 'bold' },
  bottomNavTools: { backgroundColor: '#14181f', borderTopWidth: 1, borderTopColor: '#222934', paddingVertical: 8 },
  toolsScrollRow: { paddingHorizontal: 12, gap: 16 },
  navToolItem: { alignItems: 'center', width: 65 },
  navToolIcon: { fontSize: 20, color: '#fff' },
  navToolLabel: { color: '#aaa', fontSize: 10, marginTop: 3 },
  navToolLabelActive: { color: '#ff5722', fontWeight: 'bold' },
  exportContainer: { flex: 1, padding: 16 },
  exportHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  exportHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  optionSection: { marginBottom: 20 },
  optionSectionTitle: { color: '#ddd', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  optionGrid: { flexDirection: 'row', gap: 10 },
  optionBtn: { flex: 1, backgroundColor: '#1e2530', paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2a3240' },
  activeOptionBtn: { backgroundColor: '#ff5722', borderColor: '#ff5722' },
  optionText: { color: '#aaa', fontSize: 13 },
  activeOptionText: { color: '#fff', fontWeight: 'bold' },
  startExportBtn: { backgroundColor: '#ff5722', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  startExportBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#fff', fontSize: 14, marginTop: 12, fontWeight: 'bold' }
});
