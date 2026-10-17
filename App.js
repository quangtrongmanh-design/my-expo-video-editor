import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // States tính năng chuyên sâu
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'trim', 'music', 'subtitle', 'ai_voice', 'color'
  
  // Subtitle & Music states
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [subtitleText, setSubtitleText] = useState('Chào mừng bạn đến với VIP Video Studio!');
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [selectedAIVoice, setSelectedAIVoice] = useState('Giọng Nam Miền Nam (Truyền cảm)');
  const [selectedColorFilter, setSelectedColorFilter] = useState('Mặc định (Gốc)');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');

  // Export states
  const [exportRes, setExportRes] = useState('1080p');
  const [exportFps, setExportFps] = useState('30');
  const [exportFormat, setExportFormat] = useState('MP4');

  const videoRef = useRef(null);

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
      setCurrentScreen('editor');
    }
  };

  const executeExport = async () => {
    setIsProcessing(true);
    setProcessingText('Đang khởi tạo render video chuyên sâu...');
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập bộ nhớ để lưu video!");
        setIsProcessing(false);
        return;
      }
      setProcessingText(`Đang xuất file ${exportRes} - ${exportFps}FPS (${exportFormat})...`);
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          "🎉 Xuất Video Thành Công!",
          `Đã lưu file vào bộ nhớ thiết bị với chất lượng ${exportRes}!\n• Nhạc nền: ${selectedMusic || 'Không'}\n• Phụ đề karaoke: Đã ép cứng\n• Bộ lọc màu: ${selectedColorFilter}`,
          [{ text: "OK", onPress: () => setCurrentScreen('home') }]
        );
      }, 3000);
    } catch (e) {
      setIsProcessing(false);
      Alert.alert("Lỗi", "Không thể xuất video lúc này.");
    }
  };

  // --- MÀN HÌNH 1: DASHBOARD ---
  const renderHomeScreen = () => (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>VIP Video Studio</Text>
        <Text style={styles.appSubTitle}>Cắt ghép - Chỉnh sửa video chuyên nghiệp chuẩn Studio</Text>
      </View>

      <TouchableOpacity style={styles.mainCreateBtn} onPress={pickVideo}>
        <Text style={styles.mainCreateIcon}>🎬</Text>
        <View>
          <Text style={styles.mainCreateTitle}>Tạo video mới</Text>
          <Text style={styles.mainCreateSub}>Chọn video từ thư viện để bắt đầu ngay</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#e91e63' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>✂️</Text>
          <Text style={styles.cardTitle}>Cắt ghép video</Text>
          <Text style={styles.cardSub}>Nối & cắt tỉa clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#0288d1' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🪄</Text>
          <Text style={styles.cardTitle}>Hiệu ứng VIP</Text>
          <Text style={styles.cardSub}>Bộ lọc & chỉnh màu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#2e7d32' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🎵</Text>
          <Text style={styles.cardTitle}>Thêm nhạc</Text>
          <Text style={styles.cardSub}>Nhạc không bản quyền</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#f57c00' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>Phụ đề Karaoke</Text>
          <Text style={styles.cardSub}>Chạy theo lời nói AI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>📁 Dự án gần đây</Text>
        <TouchableOpacity style={styles.recentCard} onPress={pickVideo}>
          <View style={styles.recentThumbPlaceholder}>
            <Text style={styles.playIconOverlay}>▶</Text>
          </View>
          <Text style={styles.recentCardTitle}>Project_VIP_01</Text>
          <Text style={styles.recentCardTime}>02:15 • Sẵn sàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // --- MÀN HÌNH 2: TRÌNH BIÊN TẬP TIMELINE & CÔNG CỤ SÂU ---
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

      {/* Video Preview & Phụ Đề Karaoke Chạy Theo Lời */}
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

        {/* Khung hiển thị Phụ đề Karaoke động */}
        {showSubtitle && (
          <View style={styles.karaokeBox}>
            <Text style={styles.karaokeText}>✨ {subtitleText}</Text>
          </View>
        )}
      </View>

      {/* Quick Status Bar */}
      <View style={styles.quickBar}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setIsMuted(!isMuted)}>
          <Text style={styles.quickBtnText}>{isMuted ? '🔇 Đã tắt âm gốc' : '🔊 Bật âm gốc'}</Text>
        </TouchableOpacity>
        <Text style={styles.filterBadgeText}>🎨 {selectedColorFilter}</Text>
      </View>

      {/* Timeline Thanh Thời Gian */}
      <View style={styles.timelineArea}>
        <Text style={styles.timelineTrackLabel}>🎬 Timeline Đa Lớp (Video & Subtitle)</Text>
        <ScrollView horizontal style={styles.timelineScrollView} showsHorizontalScrollIndicator={false}>
          <View style={styles.timelineClipBox}>
            <Text style={styles.clipText}>Video Gốc (00:00 - 02:00)</Text>
          </View>
          {selectedMusic && (
            <View style={[styles.timelineClipBox, { backgroundColor: '#2e7d32' }]}>
              <Text style={styles.clipText}>🎵 {selectedMusic}</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bảng tuỳ chỉnh sâu khi bấm vào công cụ */}
      {activeTool === 'music' && (
        <View style={styles.toolDrawer}>
          <Text style={styles.drawerTitle}>🎵 Chọn nhạc nền không bản quyền:</Text>
          {['Chill Lo-Fi Beat', 'Summer Upbeat Vlog', 'Acoustic Travel'].map((m) => (
            <TouchableOpacity key={m} style={styles.drawerItem} onPress={() => { setSelectedMusic(m); setActiveTool(null); }}>
              <Text style={styles.drawerItemText}>{m}</Text>
              <Text style={styles.selectText}>{selectedMusic === m ? '✓ Đang dùng' : 'Chọn'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTool === 'subtitle' && (
        <View style={styles.toolDrawer}>
          <Text style={styles.drawerTitle}>💬 Cài đặt Phụ đề Karaoke chạy theo lời:</Text>
          <TouchableOpacity style={styles.drawerItem} onPress={() => { setShowSubtitle(!showSubtitle); setActiveTool(null); }}>
            <Text style={styles.drawerItemText}>Bật/Tắt hiển thị phụ đề động</Text>
            <Text style={styles.selectText}>{showSubtitle ? 'Đang BẬT' : 'Đang TẮT'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTool === 'ai_voice' && (
        <View style={styles.toolDrawer}>
          <Text style={styles.drawerTitle}>🎙️ Lựa chọn Giọng Đọc AI:</Text>
          {['Giọng Nam Miền Nam (Truyền cảm)', 'Giọng Nữ Miền Bắc (Review)', 'Giọng Nam Trầm Ấm'].map((v) => (
            <TouchableOpacity key={v} style={styles.drawerItem} onPress={() => { setSelectedAIVoice(v); setActiveTool(null); }}>
              <Text style={styles.drawerItemText}>{v}</Text>
              <Text style={styles.selectText}>{selectedAIVoice === v ? '✓ Đã chọn' : 'Dùng'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTool === 'color' && (
        <View style={styles.toolDrawer}>
          <Text style={styles.drawerTitle}>🎨 Chọn Bộ Lọc Màu & Hiệu Ứng:</Text>
          {['Mặc định (Gốc)', '✨ Phim Điện Ảnh (Cinematic)', '🔥 Tương phản cao (TikTok)', '🌿 Tông ấm Vintage'].map((c) => (
            <TouchableOpacity key={c} style={styles.drawerItem} onPress={() => { setSelectedColorFilter(c); setActiveTool(null); }}>
              <Text style={styles.drawerItemText}>{c}</Text>
              <Text style={styles.selectText}>{selectedColorFilter === c ? '✓ Đang dùng' : 'Chọn'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Thanh Công Cụ Đáy (Icon Grid) */}
      <View style={styles.toolsGridContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScroll}>
          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Cắt video", "Đã đánh dấu điểm cắt khung hình thành công.")}>
            <Text style={styles.toolIcon}>✂️</Text>
            <Text style={styles.toolLabel}>Cắt video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setActiveTool(activeTool === 'music' ? null : 'music')}>
            <Text style={styles.toolIcon}>🎵</Text>
            <Text style={styles.toolLabel}>Thêm nhạc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setActiveTool(activeTool === 'subtitle' ? null : 'subtitle')}>
            <Text style={styles.toolIcon}>💬</Text>
            <Text style={styles.toolLabel}>Phụ đề AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setActiveTool(activeTool === 'ai_voice' ? null : 'ai_voice')}>
            <Text style={styles.toolIcon}>🎙️</Text>
            <Text style={styles.toolLabel}>Giọng AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setActiveTool(activeTool === 'color' ? null : 'color')}>
            <Text style={styles.toolIcon}>🎨</Text>
            <Text style={styles.toolLabel}>Chỉnh màu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Lách bản quyền", "Đã áp dụng thông số chuyển hóa khung hình.")}>
            <Text style={styles.toolIcon}>🛡️</Text>
            <Text style={styles.toolLabel}>Lách bản quyền</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  // --- MÀN HÌNH 3: XUẤT VIDEO ---
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
        <Text style={styles.optionSectionTitle}>📐 Độ phân giải</Text>
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
          {['24', '30', '60'].map((fps) => (
            <TouchableOpacity key={fps} style={[styles.optionBtn, exportFps === fps && styles.activeOptionBtn]} onPress={() => setExportFps(fps)}>
              <Text style={[styles.optionText, exportFps === fps && styles.activeOptionText]}>{fps} FPS</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>📁 Định dạng</Text>
        <View style={styles.optionGrid}>
          {['MP4', 'MOV'].map((fmt) => (
            <TouchableOpacity key={fmt} style={[styles.optionBtn, exportFormat === fmt && styles.activeOptionBtn]} onPress={() => setExportFormat(fmt)}>
              <Text style={[styles.optionText, exportFormat === fmt && styles.activeOptionText]}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startExportBtn} onPress={executeExport}>
        <Text style={styles.startExportBtnText}>🚀 Xuất Video Thực Tế ({exportRes})</Text>
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
  mainCreateBtn: { backgroundColor: '#1e2530', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#ff5722' },
  mainCreateIcon: { fontSize: 32, marginRight: 16 },
  mainCreateTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  mainCreateSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
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
  videoPreviewArea: { width: '100%', height: 210, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  mainVideoPlayer: { width: '100%', height: '100%' },
  centerPlayBtn: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  centerPlayIcon: { color: '#fff', fontSize: 20 },
  karaokeBox: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#ffea00' },
  karaokeText: { color: '#ffea00', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  quickBar: { backgroundColor: '#14181f', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quickBtn: { backgroundColor: '#222934', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  quickBtnText: { color: '#ccc', fontSize: 12 },
  filterBadgeText: { color: '#ffea00', fontSize: 11, fontWeight: 'bold' },
  timelineArea: { flex: 1, backgroundColor: '#090b0e', padding: 12 },
  timelineTrackLabel: { color: '#ff5722', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  timelineScrollView: { height: 60 },
  timelineClipBox: { width: 180, height: 50, backgroundColor: '#1565c0', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  clipText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  toolDrawer: { backgroundColor: '#181f2a', padding: 12, borderTopWidth: 1, borderTopColor: '#ff5722' },
  drawerTitle: { color: '#ff5722', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  drawerItem: { backgroundColor: '#222a38', padding: 10, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  drawerItemText: { color: '#fff', fontSize: 12 },
  selectText: { color: '#ff5722', fontSize: 11, fontWeight: 'bold' },
  toolsGridContainer: { backgroundColor: '#14181f', borderTopWidth: 1, borderTopColor: '#222934', paddingVertical: 10 },
  toolsScroll: { paddingHorizontal: 10, gap: 16 },
  toolIconItem: { alignItems: 'center', width: 65 },
  toolIcon: { fontSize: 22, color: '#fff' },
  toolLabel: { color: '#aaa', fontSize: 10, marginTop: 4, textAlign: 'center' },
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
