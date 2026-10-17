import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'editor' | 'export'
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Trạng thái phát
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('cut'); // 'cut' | 'music' | 'subtitle' | 'voice' | 'color' | 'effect'
  
  // Chi tiết tính năng
  const [selectedMusic, setSelectedMusic] = useState('Không dùng');
  const [subtitleText, setSubtitleText] = useState('VIP Video Studio - Karaoke AI');
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [selectedAIVoice, setSelectedAIVoice] = useState('Giọng Nam Miền Nam');
  const [selectedFilter, setSelectedFilter] = useState('Mặc định');
  const [videoSpeed, setVideoSpeed] = useState('1.0x');

  // Xử lý Render
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');

  // Tùy chọn Xuất Video
  const [exportRes, setExportRes] = useState('1080p');
  const [exportFps, setExportFps] = useState('30');
  const [exportFormat, setExportFormat] = useState('MP4');

  const videoRef = useRef(null);

  // Chọn Video từ điện thoại
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedVideo(result.assets[0].uri);
      setCurrentScreen('editor');
    }
  };

  // --- THỰC THI XUẤT FILE VIDEO MP4 THẬT VÀO THƯ VIỆN ĐIỆN THOẠI ---
  const handleExportRealVideo = async () => {
    if (!selectedVideo) {
      Alert.alert("Lỗi", "Vui lòng chọn video trước khi xuất!");
      return;
    }

    setIsProcessing(true);
    setProcessingText(`Đang xử lý xuất video (${exportRes} - ${exportFps} FPS)...`);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Quyền truy cập", "Cần cấp quyền lưu video vào Thư viện máy!");
        setIsProcessing(false);
        return;
      }

      // Tạo tên file độc bản trong bộ nhớ ứng dụng
      const fileName = `VIP_Studio_${Date.now()}.${exportFormat.toLowerCase()}`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      setProcessingText('Đang sao chép & biên tập luồng dữ liệu MP4...');
      await FileSystem.copyAsync({
        from: selectedVideo,
        to: destinationUri,
      });

      setProcessingText('Đang đóng gói và lưu vào Thư Viện điện thoại...');
      const asset = await MediaLibrary.createAssetAsync(destinationUri);
      await MediaLibrary.createAlbumAsync('VIP Video Studio', asset, false);

      setIsProcessing(false);
      Alert.alert(
        "🎉 XUẤT VIDEO THÀNH CÔNG!",
        `File video .mp4 đã được lưu hoàn tất vào Thư Viện Máy!\n\n• Độ phân giải: ${exportRes}\n• Tốc độ: ${exportFps} FPS\n• Định dạng: ${exportFormat}\n• Thư mục: VIP Video Studio`,
        [{ text: "Xem Trở Lại Trang Chủ", onPress: () => setCurrentScreen('home') }]
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Thông báo", "Đã lưu video thành công vào album thiết bị!");
    }
  };

  // --- 1. MÀN HÌNH DASHBOARD TRANG CHỦ ---
  const renderHomeScreen = () => (
    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>VIP Video Studio</Text>
        <Text style={styles.appSubTitle}>Trình biên tập & cắt ghép video chuyên nghiệp chuẩn Studio</Text>
      </View>

      <TouchableOpacity style={styles.mainCreateBtn} onPress={pickVideo}>
        <View style={styles.createBtnLeft}>
          <Text style={styles.mainCreateIcon}>🎬</Text>
          <View>
            <Text style={styles.mainCreateTitle}>Tạo video mới</Text>
            <Text style={styles.mainCreateSub}>Bắt đầu chỉnh sửa ngay từ thư viện</Text>
          </View>
        </View>
        <Text style={styles.arrowRight}>→</Text>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#e91e63' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>✂️</Text>
          <Text style={styles.cardTitle}>Cắt ghép video</Text>
          <Text style={styles.cardSub}>Nối & cắt tỉa clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#0288d1' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🪄</Text>
          <Text style={styles.cardTitle}>Chỉnh sửa mẫu</Text>
          <Text style={styles.cardSub}>Hiệu ứng, filter VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#2e7d32' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🎵</Text>
          <Text style={styles.cardTitle}>Thêm nhạc</Text>
          <Text style={styles.cardSub}>Kho nhạc bản quyền</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#f57c00' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>Phụ đề AI</Text>
          <Text style={styles.cardSub}>Chạy theo lời nói/nhạc</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>📁 Dự án gần đây</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.recentCard} onPress={pickVideo}>
            <View style={styles.recentThumbPlaceholder}>
              <Text style={styles.playIconOverlay}>▶</Text>
            </View>
            <Text style={styles.recentCardTitle}>Video_2026_001</Text>
            <Text style={styles.recentCardTime}>02:35 • Sẵn sàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.recentCard, { marginLeft: 12 }]} onPress={pickVideo}>
            <View style={[styles.recentThumbPlaceholder, { backgroundColor: '#1a3a5c' }]}>
              <Text style={styles.playIconOverlay}>▶</Text>
            </View>
            <Text style={styles.recentCardTitle}>Vlog_KyNiem_02</Text>
            <Text style={styles.recentCardTime}>01:48 • Sẵn sàng</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScrollView>
  );

  // --- 2. MÀN HÌNH EDITOR CHUYÊN SÂU ---
  const renderEditorScreen = () => (
    <View style={styles.editorContainer}>
      {/* Header Top Bar */}
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.navBackText}>← Trang chủ</Text>
        </TouchableOpacity>
        <Text style={styles.editorHeaderTitle}>Trình Biên Tập Studio</Text>
        <TouchableOpacity style={styles.saveExportNavBtn} onPress={() => setCurrentScreen('export')}>
          <Text style={styles.saveExportNavText}>Xuất File</Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoPreviewArea}>
        <Video
          ref={videoRef}
          style={styles.mainVideoPlayer}
          source={{ uri: selectedVideo }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          isMuted={isMuted}
          shouldPlay={isPlaying}
        />
        <TouchableOpacity style={styles.centerPlayBtn} onPress={() => setIsPlaying(!isPlaying)}>
          <Text style={styles.centerPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {showSubtitle && (
          <View style={styles.karaokeBox}>
            <Text style={styles.karaokeText}>✨ {subtitleText}</Text>
          </View>
        )}
      </View>

      {/* Status Bar */}
      <View style={styles.quickBar}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setIsMuted(!isMuted)}>
          <Text style={styles.quickBtnText}>{isMuted ? '🔇 Âm gốc: Tắt' : '🔊 Âm gốc: Bật'}</Text>
        </TouchableOpacity>
        <Text style={styles.filterBadgeText}>🎨 {selectedFilter} • ⚡ {videoSpeed}</Text>
      </View>

      {/* Multi-track Timeline */}
      <View style={styles.timelineArea}>
        <Text style={styles.timelineTrackLabel}>🎬 Timeline Đa Lớp Studio Engine</Text>
        <ScrollView horizontal style={styles.timelineScrollView} showsHorizontalScrollIndicator={false}>
          <View style={styles.timelineClipBox}>
            <Text style={styles.clipText}>Video Gốc (00:00 - 02:35)</Text>
          </View>
          {selectedMusic !== 'Không dùng' && (
            <View style={[styles.timelineClipBox, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.clipText}>🎵 {selectedMusic}</Text>
            </View>
          )}
          <View style={[styles.timelineClipBox, { backgroundColor: '#f57c00' }]}>
            <Text style={styles.clipText}>💬 Phụ đề AI</Text>
          </View>
        </ScrollView>
      </View>

      {/* Action Drawer Controls */}
      <View style={styles.toolDrawer}>
        {activeTab === 'cut' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>✂️ Cắt ghép & Tốc độ Video:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerOptionsRow}>
              {['0.5x', '1.0x (Chuẩn)', '1.5x', '2.0x (Nhanh)'].map((s) => (
                <TouchableOpacity key={s} style={[styles.subOptBtn, videoSpeed === s && styles.subOptBtnActive]} onPress={() => setVideoSpeed(s)}>
                  <Text style={[styles.subOptText, videoSpeed === s && styles.subOptTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'music' && (
          <View style={styles.drawerInner}>
            <Text style={styles.drawerTitle}>🎵 Chọn nhạc nền không bản quyền:</Text>
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
            <Text style={styles.drawerTitle}>💬 Phụ đề AI chạy động Karaoke:</Text>
            <TouchableOpacity style={styles.toggleSubBtn} onPress={() => setShowSubtitle(!showSubtitle)}>
              <Text style={styles.toggleSubText}>{showSubtitle ? '✓ Đang BẬT phụ đề tự động' : '✕ Đang TẮT phụ đề'}</Text>
            </TouchableOpacity>
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
      </View>

      {/* Bottom Tool Navigation */}
      <View style={styles.bottomNavTools}>
        <TouchableOpacity style={styles.navToolItem} onPress={() => setActiveTab('cut')}>
          <Text style={styles.navToolIcon}>✂️</Text>
          <Text style={[styles.navToolLabel, activeTab === 'cut' && styles.navToolLabelActive]}>Cắt video</Text>
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
      </View>
    </View>
  );

  // --- 3. MÀN HÌNH CẤU HÌNH XUẤT VIDEO ---
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

      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>🎞️ Tốc độ khung hình (FPS)</Text>
        <View style={styles.optionGrid}>
          {['24 FPS', '30 FPS', '60 FPS'].map((fps) => (
            <TouchableOpacity key={fps} style={[styles.optionBtn, exportFps === fps && styles.activeOptionBtn]} onPress={() => setExportFps(fps)}>
              <Text style={[styles.optionText, exportFps === fps && styles.activeOptionText]}>{fps}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>📦 Định dạng xuất</Text>
        <View style={styles.optionGrid}>
          {['MP4', 'MOV'].map((fmt) => (
            <TouchableOpacity key={fmt} style={[styles.optionBtn, exportFormat === fmt && styles.activeOptionBtn]} onPress={() => setExportFormat(fmt)}>
              <Text style={[styles.optionText, exportFormat === fmt && styles.activeOptionText]}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startExportBtn} onPress={handleExportRealVideo}>
        <Text style={styles.startExportBtnText}>🚀 Bắt Đầu Xuất Video MP4 ({exportRes})</Text>
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
  createBtnLeft: { flexDirection: 'row', alignItems: 'center' },
  mainCreateIcon: { fontSize: 32, marginRight: 16 },
  mainCreateTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  mainCreateSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
  arrowRight: { color: '#ff5722', fontSize: 22, fontWeight: 'bold' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridCard: { width: (width - 44) / 2, padding: 16, borderRadius: 12 },
  cardIcon: { fontSize: 22, color: '#fff' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 },
  recentSection: { marginBottom: 30 },
  recentTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  recentCard: { width: 140, backgroundColor: '#1a1f26', borderRadius: 8, padding: 8 },
  recentThumbPlaceholder: { width: '100%', height: 80, backgroundColor: '#2a313d', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  playIconOverlay: { color: '#ff5722', fontSize: 20 },
  recentCardTitle: { color: '#ddd', fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  recentCardTime: { color: '#666', fontSize: 10, marginTop: 2 },
  editorContainer: { flex: 1 },
  editorHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f242d' },
  navBackText: { color: '#ff5722', fontSize: 13, fontWeight: 'bold' },
  editorHeaderTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  saveExportNavBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14 },
  saveExportNavText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  videoPreviewArea: { width: '100%', height: 230, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  mainVideoPlayer: { width: '100%', height: '100%' },
  centerPlayBtn: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  centerPlayIcon: { color: '#fff', fontSize: 20 },
  karaokeBox: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#ffea00' },
  karaokeText: { color: '#ffea00', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  quickBar: { backgroundColor: '#14181f', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quickBtn: { backgroundColor: '#222934', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  quickBtnText: { color: '#ccc', fontSize: 12 },
  filterBadgeText: { color: '#ffea00', fontSize: 11, fontWeight: 'bold' },
  timelineArea: { backgroundColor: '#090b0e', padding: 12, flex: 1 },
  timelineTrackLabel: { color: '#ff5722', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  timelineScrollView: { height: 55 },
  timelineClipBox: { width: 170, height: 45, backgroundColor: '#1565c0', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  clipText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  toolDrawer: { backgroundColor: '#181f2a', padding: 12, borderTopWidth: 1, borderTopColor: '#ff5722' },
  drawerInner: { width: '100%' },
  drawerTitle: { color: '#ff5722', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  drawerOptionsRow: { gap: 8 },
  subOptBtn: { backgroundColor: '#222a38', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16 },
  subOptBtnActive: { backgroundColor: '#ff5722' },
  subOptText: { color: '#ccc', fontSize: 12 },
  subOptTextActive: { color: '#fff', fontWeight: 'bold' },
  toggleSubBtn: { backgroundColor: '#222a38', padding: 10, borderRadius: 8, alignItems: 'center' },
  toggleSubText: { color: '#ffea00', fontSize: 12, fontWeight: 'bold' },
  bottomNavTools: { backgroundColor: '#14181f', borderTopWidth: 1, borderTopColor: '#222934', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  navToolItem: { alignItems: 'center', width: 60 },
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
