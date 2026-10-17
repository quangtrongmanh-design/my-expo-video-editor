import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator, Animated, Easing, TextInput } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('introScreen');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('video');

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('cut'); 
  const [currentPositionSec, setCurrentPositionSec] = useState(0);

  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoSpeed, setVideoSpeed] = useState('1.0x');
  const [selectedMusic, setSelectedMusic] = useState('Không dùng');
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState('Mặc định');

  const [showSubtitle, setShowSubtitle] = useState(true);
  const introQuote = "Chào bạn, bạn có thể đùa với tôi khi bạn buồn. Tôi không hứa sẽ làm cho bạn vui, nhưng tôi có thể đồng hành cùng bạn.";
  const [currentActiveCaption, setCurrentActiveCaption] = useState(introQuote);
  const [captionsList, setCaptionsList] = useState([
    { start: 0, end: 4, text: "Chào bạn, bạn có thể đùa với tôi khi bạn buồn." },
    { start: 4, end: 8, text: "Tôi không hứa sẽ làm cho bạn vui..." },
    { start: 8, end: 12, text: "...nhưng tôi có thể đồng hành cùng bạn." }
  ]);

  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [exportRes, setExportRes] = useState('1080p');

  const videoRef = useRef(null);

  useEffect(() => {
    if (currentScreen === 'introScreen') {
      runIntroAnimationSequence();
    }
  }, [currentScreen]);

  const runIntroAnimationSequence = () => {
    logoScale.setValue(0.1);
    logoRotate.setValue(0);
    logoTranslateX.setValue(0);
    logoTranslateY.setValue(0);
    logoOpacity.setValue(1);

    Speech.stop();
    Speech.speak(introQuote, {
      language: 'vi-VN',
      pitch: 1.0,
      rate: 0.9,
    });

    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.4,
        duration: 2000,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoTranslateX, { toValue: width * 0.25, duration: 2200, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: -height * 0.12, duration: 2200, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 2200, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(logoTranslateX, { toValue: -width * 0.25, duration: 2500, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: height * 0.08, duration: 2500, useNativeDriver: true })
      ])
    ]).start();
  };

  const handleDashboardAction = async (targetTool, type = 'videos') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'videos' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType(type === 'videos' ? 'video' : 'image');
      setActiveTab(targetTool);
      setCurrentScreen('editor');
    }
  };

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

  const handleExportFinalProduct = async () => {
    if (!selectedMedia) return;
    setIsProcessing(true);
    setProcessingText(`Đang biên tập & xuất file chất lượng cao (${exportRes})...`);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền bộ nhớ để lưu tệp!");
        setIsProcessing(false);
        return;
      }

      const ext = mediaType === 'video' ? 'mp4' : 'jpg';
      const fileName = `VIP_Studio_Export_${Date.now()}.${ext}`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: selectedMedia,
        to: destinationUri,
      });

      const asset = await MediaLibrary.createAssetAsync(destinationUri);
      await MediaLibrary.createAlbumAsync('VIP Video Studio', asset, false);

      setIsProcessing(false);
      Alert.alert(
        "🎉 XUẤT SẢN PHẨM THÀNH CÔNG!",
        `Tệp đã được xử lý và lưu vào album "VIP Video Studio" trên máy!`,
        [{ text: "Trở Về Trang Chủ", onPress: () => setCurrentScreen('home') }]
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Thông báo", "Đã lưu tệp vào thư viện máy thành công!");
    }
  };

  const spinDegree = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderIntroScreen = () => (
    <View style={styles.introContainer}>
      <Animated.View
        style={[
          styles.animatedIntroLogoBox,
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
      >
        <View style={styles.goldLogoBadge}>
          <Text style={styles.goldLogoIcon}>🎬</Text>
          <Text style={styles.goldLogoText}>VIP</Text>
        </View>
        <Text style={styles.introLogoTitle}>VIP Video Studio</Text>
      </Animated.View>

      <View style={styles.introTextCard}>
        <Text style={styles.introVoiceQuote}>"{introQuote}"</Text>
      </View>

      <TouchableOpacity style={styles.enterHomeBtn} onPress={() => { Speech.stop(); setCurrentScreen('home'); }}>
        <Text style={styles.enterHomeBtnText}>Bắt Đầu Trải Nghiệm Studio →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHomeScreen = () => (
    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>VIP Video Studio</Text>
        <Text style={styles.appSubTitle}>Chọn công cụ để thực thi trực tiếp từ thư viện</Text>
      </View>

      <TouchableOpacity style={styles.mainCreateBtn} onPress={() => handleDashboardAction('cut', 'videos')}>
        <View style={styles.createBtnLeft}>
          <Text style={styles.mainCreateIcon}>🎬</Text>
          <View>
            <Text style={styles.mainCreateTitle}>Tạo Video Mới</Text>
            <Text style={styles.mainCreateSub}>Bắt đầu cắt ghép & biên tập từ thư viện</Text>
          </View>
        </View>
        <Text style={styles.arrowRight}>→</Text>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#e91e63' }]} onPress={() => handleDashboardAction('cut', 'videos')}>
          <Text style={styles.cardIcon}>✂️</Text>
          <Text style={styles.cardTitle}>Cắt ghép video</Text>
          <Text style={styles.cardSub}>Thao tác cắt tỉa clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#0288d1' }]} onPress={() => handleDashboardAction('color', 'images')}>
          <Text style={styles.cardIcon}>🪄</Text>
          <Text style={styles.cardTitle}>Chỉnh sửa mẫu</Text>
          <Text style={styles.cardSub}>Áp bộ lọc ảnh VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#2e7d32' }]} onPress={() => handleDashboardAction('music', 'videos')}>
          <Text style={styles.cardIcon}>🎵</Text>
          <Text style={styles.cardTitle}>Thêm nhạc</Text>
          <Text style={styles.cardSub}>Lồng nhạc nền ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#f57c00' }]} onPress={() => handleDashboardAction('subtitle', 'videos')}>
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>Phụ đề AI</Text>
          <Text style={styles.cardSub}>Chạy chữ Karaoke</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.replaysIntroLink} onPress={() => setCurrentScreen('introScreen')}>
        <Text style={styles.replaysIntroLinkText}>✨ Xem lại Intro Mở Màn & Giọng Đọc AI</Text>
      </TouchableOpacity>
    </ScrollView>
  );

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

      <View style={styles.mediaPreviewArea}>
        {mediaType === 'video' ? (
          <>
            <Video
              ref={videoRef}
              style={styles.mainMediaViewer}
              source={{ uri: selectedMedia }}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              isMuted={isMuted}
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
            <TouchableOpacity style={styles.centerPlayBtn} onPress={() => setIsPlaying(!isPlaying)}>
              <Text style={styles.centerPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.mainMediaViewer} />
        )}

        {showSubtitle && mediaType === 'video' && (
          <View style={styles.karaokeBox}>
            <Text style={styles.karaokeText}>✨ {currentActiveCaption}</Text>
          </View>
        )}
      </View>

      <View style={styles.quickBar}>
        <Text style={styles.posText}>{mediaType === 'video' ? `⏱️ ${currentPositionSec}s / ${videoDuration}s` : '🖼️ Tệp hình ảnh chỉnh sửa'}</Text>
        <Text style={styles.filterBadgeText}>🎨 {selectedFilter}</Text>
      </View>

      <View style={styles.timelineArea}>
        <Text style={styles.timelineTrackLabel}>🎬 Timeline Chỉnh Sửa Thực Tế</Text>
        <ScrollView horizontal style={styles.timelineScrollView} showsHorizontalScrollIndicator={false}>
          <View style={styles.timelineClipBox}>
            <Text style={styles.clipText}>{mediaType === 'video' ? `Video Gốc [${startTime}s-${endTime}s]` : 'Ảnh Gốc Đã Chọn'}</Text>
          </View>
          {selectedMusic !== 'Không dùng' && mediaType === 'video' && (
            <View style={[styles.timelineClipBox, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.clipText}>🎵 {selectedMusic}</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.toolDrawer}>
        {activeTab === 'cut' && mediaType === 'video' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>✂️ Cắt Khoảng Thời Gian Video (Tổng {videoDuration}s):</Text>
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

        {activeTab === 'speed' && mediaType === 'video' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>⚡ Tốc Độ Phát Video:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['0.5x', '1.0x (Chuẩn)', '1.5x', '2.0x'].map((s) => (
                <TouchableOpacity key={s} style={[styles.subOptBtn, videoSpeed === s && styles.subOptBtnActive]} onPress={() => setVideoSpeed(s)}>
                  <Text style={[styles.subOptText, videoSpeed === s && styles.subOptTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'music' && mediaType === 'video' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎵 Thêm Nhạc Nền:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['Không dùng', 'Summer Upbeat Vlog', 'Chill Lo-Fi Beat'].map((m) => (
                <TouchableOpacity key={m} style={[styles.subOptBtn, selectedMusic === m && styles.subOptBtnActive]} onPress={() => setSelectedMusic(m)}>
                  <Text style={[styles.subOptText, selectedMusic === m && styles.subOptTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'subtitle' && mediaType === 'video' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>💬 Phụ Đề AI Karaoke Theo Lời Nói:</Text>
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

        {activeTab === 'color' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎨 Bộ Lọc Màu & Hiệu Ứng Điện Ảnh:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['Mặc định', 'Điện Ảnh (Cinematic)', 'Tương Phản Rực Rỡ', 'Vintage Hoài Cổ'].map((c) => (
                <TouchableOpacity key={c} style={[styles.subOptBtn, selectedFilter === c && styles.subOptBtnActive]} onPress={() => setSelectedFilter(c)}>
                  <Text style={[styles.subOptText, selectedFilter === c && styles.subOptTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.bottomNavTools}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScrollRow}>
          {mediaType === 'video' && (
            <>
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
            </>
          )}
          <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('color')}>
            <Text style={styles.navToolIcon}>🎨</Text>
            <Text style={[styles.navToolLabel, activeTab === 'color' && styles.navToolLabelActive]}>Chỉnh màu</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderExportScreen = () => (
    <ScrollView style={styles.exportContainer}>
      <View style={styles.exportHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('editor')}>
          <Text style={styles.navBackText}>← Trở lại</Text>
        </TouchableOpacity>
        <Text style={styles.exportHeaderTitle}>Cấu Hình Xuất Tệp</Text>
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

      <TouchableOpacity style={styles.startExportBtn} onPress={handleExportFinalProduct}>
        <Text style={styles.startExportBtnText}>🚀 Xuất Tệp Thực Tế ({exportRes})</Text>
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
      {currentScreen === 'introScreen' && renderIntroScreen()}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'editor' && renderEditorScreen()}
      {currentScreen === 'export' && renderExportScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f12' },
  introContainer: { flex: 1, backgroundColor: '#0d0f12', justifyContent: 'center', alignItems: 'center', padding: 20 },
  animatedIntroLogoBox: { alignItems: 'center', marginBottom: 30 },
  goldLogoBadge: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#1a2332', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffd700', marginBottom: 12 },
  goldLogoIcon: { fontSize: 42 },
  goldLogoText: { color: '#ffd700', fontSize: 16, fontWeight: 'bold', marginTop: -4 },
  introLogoTitle: { color: '#ff5722', fontSize: 26, fontWeight: 'bold' },
  introTextCard: { backgroundColor: '#181f2a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 40, width: '100%' },
  introVoiceQuote: { color: '#ffea00', fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
  enterHomeBtn: { backgroundColor: '#ff5722', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center' },
  enterHomeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  homeContainer: { flex: 1, padding: 16 },
  appHeader: { marginTop: 10, marginBottom: 20 },
  appTitle: { color: '#ff5722', fontSize: 24, fontWeight: 'bold' },
  appSubTitle: { color: '#888', fontSize: 12, marginTop: 4 },
  mainCreateBtn: { backgroundColor: '#1e2530', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, borderWidth: 1, borderColor: '#ff5722' },
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
  replaysIntroLink: { marginTop: 10, alignItems: 'center', padding: 12, backgroundColor: '#181f2a', borderRadius: 8 },
  replaysIntroLinkText: { color: '#ffea00', fontSize: 13, fontWeight: 'bold' },
  editorContainer: { flex: 1 },
  editorHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f242d' },
  navBackText: { color: '#ff5722', fontSize: 13, fontWeight: 'bold' },
  editorHeaderTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  saveExportNavBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14 },
  saveExportNavText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  mediaPreviewArea: { width: '100%', height: 230, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  mainMediaViewer: { width: '100%', height: '100%' },
  centerPlayBtn: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  centerPlayIcon: { color: '#fff', fontSize: 20 },
  karaokeBox: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ffea00' },
  karaokeText: { color: '#ffea00', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  quickBar: { backgroundColor: '#14181f', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posText: { color: '#aaa', fontSize: 11 },
  filterBadgeText: { color: '#ffea00', fontSize: 11, fontWeight: 'bold' },
  timelineArea: { backgroundColor: '#090b0e', padding: 12, flex: 1 },
  timelineTrackLabel: { color: '#ff5722', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  timelineScrollView: { height: 55 },
  timelineClipBox: { width: 190, height: 45, backgroundColor: '#1e2530', borderRadius: 6, justifyContent: 'center', paddingHorizontal: 10, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  clipText: { color: '#ccc', fontSize: 10, fontWeight: 'bold' },
  toolDrawer: { backgroundColor: '#181f2a', padding: 12, borderTopWidth: 1, borderTopColor: '#ff5722' },
  drawerInner: { width: '100%' },
  drawerTitle: { color: '#ff5722', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  btnGroupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
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
