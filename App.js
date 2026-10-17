import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation: 'home' | 'editor' | 'export'
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Video Editor States
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState('Gốc');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState('edit'); // 'edit', 'color', 'effect', 'text', 'music'
  
  // Export Settings State
  const [exportRes, setExportRes] = useState('1080p');
  const [exportFps, setExportFps] = useState('30');
  const [exportFormat, setExportFormat] = useState('MP4');

  const videoRef = useRef(null);

  // Mở thư viện chọn video
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

  // Tiến hành Render / Xuất video
  const handleStartExport = () => {
    Alert.alert(
      "🚀 Đã Bắt Đầu Xuất Video!",
      `Đang khởi chạy tiến trình Render:\n• Độ phân giải: ${exportRes}\n• Tốc độ khung hình: ${exportFps} FPS\n• Định dạng: ${exportFormat}\n• Bộ lọc hiệu ứng: ${selectedEffect}\n\nFile video sẽ tự động lưu vào bộ nhớ máy sau khi hoàn tất.`,
      [{ text: "Hoàn tất", onPress: () => setCurrentScreen('home') }]
    );
  };

  // --- MÀN HÌNH 1: TRANG CHỦ DASHBOARD ---
  const renderHomeScreen = () => (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>VIP Video Studio</Text>
        <Text style={styles.appSubTitle}>Cắt ghép - Chỉnh sửa video dễ dàng, chuyên nghiệp</Text>
      </View>

      {/* Nút Tạo Video Mới nổi bật */}
      <TouchableOpacity style={styles.mainCreateBtn} onPress={pickVideo}>
        <Text style={styles.mainCreateIcon}>🎬</Text>
        <View>
          <Text style={styles.mainCreateTitle}>Tạo video mới</Text>
          <Text style={styles.mainCreateSub}>Bắt đầu chỉnh sửa ngay từ thư viện</Text>
        </View>
      </TouchableOpacity>

      {/* Grid Chức Năng Nhanh */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#e91e63' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>✂️</Text>
          <Text style={styles.cardTitle}>Cắt ghép video</Text>
          <Text style={styles.cardSub}>Nối & ghép clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#0288d1' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🪄</Text>
          <Text style={styles.cardTitle}>Chỉnh sửa mẫu</Text>
          <Text style={styles.cardSub}>Hiệu ứng, filter VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#2e7d32' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>🎵</Text>
          <Text style={styles.cardTitle}>Thêm nhạc</Text>
          <Text style={styles.cardSub}>Nhạc nền phong phú</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, { backgroundColor: '#f57c00' }]} onPress={pickVideo}>
          <Text style={styles.cardIcon}>T</Text>
          <Text style={styles.cardTitle}>Thêm chữ</Text>
          <Text style={styles.cardSub}>Chú thích, phụ đề AI</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách dự án gần đây */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>📁 Dự án gần đây</Text>
        <View style={styles.recentList}>
          <TouchableOpacity style={styles.recentCard} onPress={pickVideo}>
            <View style={styles.recentThumbPlaceholder}>
              <Text style={styles.playIconOverlay}>▶</Text>
            </View>
            <Text style={styles.recentCardTitle}>Video_2026_001</Text>
            <Text style={styles.recentCardTime}>02:35 • Vừa xong</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recentCard} onPress={pickVideo}>
            <View style={styles.recentThumbPlaceholder}>
              <Text style={styles.playIconOverlay}>▶</Text>
            </View>
            <Text style={styles.recentCardTitle}>Kỷ niệm du lịch</Text>
            <Text style={styles.recentCardTime}>01:48 • Hôm qua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // --- MÀN HÌNH 2: TRÌNH BIÊN TẬP TIMELINE CHUYÊN NGHIỆP ---
  const renderEditorScreen = () => (
    <View style={styles.editorContainer}>
      {/* Top Header */}
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.navBackText}>← Trang chủ</Text>
        </TouchableOpacity>
        <Text style={styles.editorHeaderTitle}>Chỉnh sửa video</Text>
        <TouchableOpacity style={styles.saveExportNavBtn} onPress={() => setCurrentScreen('export')}>
          <Text style={styles.saveExportNavText}>Lưu / Xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Trình Phát Video Preview */}
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
      </View>

      {/* Quick Action Bar (Bật tắt âm thanh, chuyển cảnh) */}
      <View style={styles.quickBar}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setIsMuted(!isMuted)}>
          <Text style={styles.quickBtnText}>{isMuted ? '🔇 Đã tắt âm gốc' : '🔊 Bật âm gốc'}</Text>
        </TouchableOpacity>
        <Text style={styles.timeCodeText}>00:15 / 02:30</Text>
        <TouchableOpacity style={styles.quickBtn} onPress={() => Alert.alert("Hiệu ứng", "Đã áp dụng chuyển cảnh mượt")}>
          <Text style={styles.quickBtnText}>✨ Chuyển cảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Mô phỏng Thanh Timeline Nhiều Lớp (CapCut Style) */}
      <View style={styles.timelineArea}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTrackLabel}>🎬 Track Video Gốc</Text>
        </View>
        <ScrollView horizontal style={styles.timelineScrollView} showsHorizontalScrollIndicator={false}>
          <View style={styles.timelineClipBox}>
            <Text style={styles.clipText}>Clip 1 (00:00 - 01:15)</Text>
          </View>
          <View style={[styles.timelineClipBox, { backgroundColor: '#1565c0' }]}>
            <Text style={styles.clipText}>Clip 2 (01:15 - 02:30)</Text>
          </View>
        </ScrollView>
        {selectedMusic && (
          <View style={styles.audioTrackBox}>
            <Text style={styles.audioTrackText}>🎵 Audio Track: {selectedMusic}</Text>
          </View>
        )}
      </View>

      {/* Icon Grid Bộ Công Cụ Chỉnh Sửa */}
      <View style={styles.toolsGridContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScroll}>
          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Cắt video", "Dùng hai đầu timeline để cắt bớt đoạn thừa")}>
            <Text style={styles.toolIcon}>✂️</Text>
            <Text style={styles.toolLabel}>Cắt video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={pickVideo}>
            <Text style={styles.toolIcon}>➕</Text>
            <Text style={styles.toolLabel}>Ghép video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setIsMuted(true)}>
            <Text style={styles.toolIcon}>🎵</Text>
            <Text style={styles.toolLabel}>Tách âm thanh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setSelectedEffect('Bộ lọc Chỉnh Màu')}>
            <Text style={styles.toolIcon}>🎨</Text>
            <Text style={styles.toolLabel}>Chỉnh màu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => setSelectedEffect('Hiệu ứng Cyber')}>
            <Text style={styles.toolIcon}>✨</Text>
            <Text style={styles.toolLabel}>Hiệu ứng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Bộ lọc", "Đã áp dụng Filter làm đẹp")}>
            <Text style={styles.toolIcon}>🎭</Text>
            <Text style={styles.toolLabel}>Bộ lọc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Văn bản", "Đã chèn thêm chữ tiêu đề AI")}>
            <Text style={styles.toolIcon}>T</Text>
            <Text style={styles.toolLabel}>Văn bản</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Nhãn dán", "Đã chèn Sticker độc quyền")}>
            <Text style={styles.toolIcon}>😊</Text>
            <Text style={styles.toolLabel}>Nhãn dán</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolIconItem} onPress={() => Alert.alert("Tốc độ", "Đổi tốc độ video 1.2x lách bản quyền")}>
            <Text style={styles.toolIcon}>⏱️</Text>
            <Text style={styles.toolLabel}>Tốc độ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  // --- MÀN HÌNH 3: XUẤT VIDEO NÂNG CAO (480P - 4K) ---
  const renderExportScreen = () => (
    <ScrollView style={styles.exportContainer}>
      <View style={styles.exportHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('editor')}>
          <Text style={styles.navBackText}>← Trở lại</Text>
        </TouchableOpacity>
        <Text style={styles.exportHeaderTitle}>Xuất video</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Video Preview nhỏ */}
      <View style={styles.exportPreviewBox}>
        <Video
          style={styles.exportSmallVideo}
          source={{ uri: selectedVideo }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={false}
        />
      </View>

      {/* Chọn Độ Phân Giải */}
      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>📐 Độ phân giải Video</Text>
        <View style={styles.optionGrid}>
          {['480p', '720p', '1080p', '4K'].map((res) => (
            <TouchableOpacity 
              key={res} 
              style={[styles.optionBtn, exportRes === res && styles.activeOptionBtn]}
              onPress={() => setExportRes(res)}
            >
              <Text style={[styles.optionText, exportRes === res && styles.activeOptionText]}>{res}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chọn Số Khung Hình (FPS) */}
      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>🎞️ Tốc độ khung hình (FPS)</Text>
        <View style={styles.optionGrid}>
          {['24', '30', '60'].map((fps) => (
            <TouchableOpacity 
              key={fps} 
              style={[styles.optionBtn, exportFps === fps && styles.activeOptionBtn]}
              onPress={() => setExportFps(fps)}
            >
              <Text style={[styles.optionText, exportFps === fps && styles.activeOptionText]}>{fps} FPS</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chọn Định Dạng Export */}
      <View style={styles.optionSection}>
        <Text style={styles.optionSectionTitle}>📁 Định dạng File</Text>
        <View style={styles.optionGrid}>
          {['MP4', 'MOV'].map((fmt) => (
            <TouchableOpacity 
              key={fmt} 
              style={[styles.optionBtn, exportFormat === fmt && styles.activeOptionBtn]}
              onPress={() => setExportFormat(fmt)}
            >
              <Text style={[styles.optionText, exportFormat === fmt && styles.activeOptionText]}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nút Render Xuất Video Lớn */}
      <TouchableOpacity style={styles.startExportBtn} onPress={handleStartExport}>
        <Text style={styles.startExportBtnText}>🚀 Xuất Video Ngay ({exportRes} - {exportFormat})</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'editor' && renderEditorScreen()}
      {currentScreen === 'export' && renderExportScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f12' },
  
  // Home Styles
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
  recentList: { flexDirection: 'row', gap: 12 },
  recentCard: { width: 140, backgroundColor: '#1a1f26', borderRadius: 8, padding: 8 },
  recentThumbPlaceholder: { width: '100%', height: 80, backgroundColor: '#2a313d', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  playIconOverlay: { color: '#ff5722', fontSize: 20 },
  recentCardTitle: { color: '#ddd', fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  recentCardTime: { color: '#666', fontSize: 10, marginTop: 2 },

  // Editor Styles
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
  quickBar: { backgroundColor: '#14181f', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quickBtn: { backgroundColor: '#222934', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  quickBtnText: { color: '#ccc', fontSize: 11 },
  timeCodeText: { color: '#888', fontSize: 11 },
  timelineArea: { flex: 1, backgroundColor: '#090b0e', padding: 12 },
  timelineHeader: { marginBottom: 6 },
  timelineTrackLabel: { color: '#ff5722', fontSize: 11, fontWeight: 'bold' },
  timelineScrollView: { height: 60 },
  timelineClipBox: { width: 160, height: 50, backgroundColor: '#2e7d32', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  clipText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  audioTrackBox: { backgroundColor: '#1565c0', padding: 8, borderRadius: 6, marginTop: 8 },
  audioTrackText: { color: '#fff', fontSize: 11 },
  toolsGridContainer: { backgroundColor: '#14181f', borderTopWidth: 1, borderTopColor: '#222934', paddingVertical: 10 },
  toolsScroll: { paddingHorizontal: 10, gap: 16 },
  toolIconItem: { alignItems: 'center', width: 60 },
  toolIcon: { fontSize: 22, color: '#fff' },
  toolLabel: { color: '#aaa', fontSize: 10, marginTop: 4, textAlign: 'center' },

  // Export Styles
  exportContainer: { flex: 1, padding: 16 },
  exportHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exportHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  exportPreviewBox: { width: '100%', height: 160, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  exportSmallVideo: { width: '100%', height: '100%' },
  optionSection: { marginBottom: 20 },
  optionSectionTitle: { color: '#ddd', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  optionGrid: { flexDirection: 'row', gap: 10 },
  optionBtn: { flex: 1, backgroundColor: '#1e2530', paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2a3240' },
  activeOptionBtn: { backgroundColor: '#ff5722', borderColor: '#ff5722' },
  optionText: { color: '#aaa', fontSize: 13 },
  activeOptionText: { color: '#fff', fontWeight: 'bold' },
  startExportBtn: { backgroundColor: '#ff5722', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  startExportBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
