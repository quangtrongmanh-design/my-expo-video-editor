import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState('Chưa chọn nhạc');
  const [selectedFrame, setSelectedFrame] = useState('tiktok_standard'); // Mặc định chuẩn TikTok 9:16
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Bật/tắt âm thanh gốc
  const [isPlaying, setIsPlaying] = useState(true); // Trạng thái chạy thử / tạm dừng
  const [selectedAIVoice, setSelectedAIVoice] = useState('Giọng Nam Miền Nam');
  const [activeTab, setActiveTab] = useState('edit');
  const videoRef = useRef(null);

  // Chọn video từ thư viện
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  // Chọn hình ảnh chèn vào video
  const pickImageOverlay = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert("Thành công", "Đã thêm hình ảnh/logo phủ lên video!");
    }
  };

  // Các chuẩn khung hình TikTok & mạng xã hội
  const frames = [
    { id: 'tiktok_standard', name: '📱 Chuẩn TikTok 9:16 (Full)' },
    { id: 'tiktok_neon', name: '🔥 Viền Neon TikTok' },
    { id: 'cinema', name: '🎬 Khung Điện Ảnh 2.35:1' },
    { id: 'none', name: '⬜ Không khung' },
  ];

  const musicList = [
    '🎵 Chill Lo-Fi Beat (Không bản quyền)',
    '🎵 Upbeat Summer Vlog',
    '🎵 Acoustic Guitar Travel',
  ];

  const aiVoices = [
    '🤖 Giọng Nam Miền Nam (Truyền cảm)',
    '🤖 Giọng Nữ Miền Bắc (Review phim)',
    '🤖 Giọng Nam Trầm Ấm (Thuyết minh)',
  ];

  // Thực thi xuất video giả lập thông minh
  const handleExport = () => {
    Alert.alert(
      "🚀 Đang Xuất Video Chuẩn TikTok",
      `Đang render hoàn tất:\n- Khung: [${selectedFrame}]\n- Âm thanh gốc: [${isMuted ? 'Tắt' : 'Bật'}]\n- Nhạc nền: [${selectedMusic}]\n- Phụ đề AI & Giọng đọc: [${selectedAIVoice}]\n\nVideo đã được lưu vào thư viện máy thành công!`,
      [{ text: "OK tuyệt vời" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VIP Video Editor Pro</Text>
        {selectedVideo && (
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportBtnText}>Xuất Video</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        {!selectedVideo ? (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Trình Chỉnh Sửa Video Chuẩn TikTok</Text>
            <Text style={styles.welcomeSub}>Hỗ trợ khung chuẩn, chạy thử, âm thanh gốc & AI Voice</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
              <Text style={styles.pickBtnText}>+ Chọn Video Từ Máy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editorContainer}>
            {/* Trình xem Video (Video Player) kèm Khung chuẩn TikTok & Chạy thử */}
            <View style={[
              styles.videoWrapper,
              selectedFrame === 'tiktok_neon' && styles.frameTiktokNeon,
              selectedFrame === 'cinema' && styles.frameCinema,
              selectedFrame === 'tiktok_standard' && styles.frameTiktokStandard
            ]}>
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{ uri: selectedVideo }}
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                isMuted={isMuted}
                shouldPlay={isPlaying}
              />

              {/* Lớp phủ Hình ảnh/Logo nếu có */}
              {selectedImage && (
                <View style={styles.imageOverlayBadge}>
                  <Text style={styles.overlayBadgeText}>🖼️ Logo/Ảnh</Text>
                </View>
              )}

              {/* Hiển thị Phụ đề trực quan */}
              {showSubtitle && (
                <View style={styles.subtitleBox}>
                  <Text style={styles.subtitleText}>💬 Chào mừng bạn đến với VIP Video Editor!</Text>
                </View>
              )}

              {/* Nút Chạy thử / Tạm dừng trực tiếp trên màn hình */}
              <TouchableOpacity 
                style={styles.playPauseOverlayBtn} 
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Text style={styles.playPauseText}>{isPlaying ? '⏸️ Tạm Dừng' : '▶️ Chạy Thử'}</Text>
              </TouchableOpacity>
            </View>

            {/* Thanh trạng thái bật/tắt nhanh âm thanh gốc */}
            <View style={styles.quickStatusBar}>
              <TouchableOpacity 
                style={[styles.muteToggleBtn, isMuted && styles.mutedActive]} 
                onPress={() => setIsMuted(!isMuted)}
              >
                <Text style={styles.muteToggleText}>{isMuted ? '🔇 Đã Tắt Âm Gốc' : '🔊 Đang Bật Âm Gốc'}</Text>
              </TouchableOpacity>
              <Text style={styles.statusInfoText} numberOfLines={1}>🎵 {selectedMusic}</Text>
            </View>

            {/* Khu vực công cụ theo Tab */}
            <ScrollView style={styles.toolContent}>
              {activeTab === 'edit' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>📐 Khung Hình Chuẩn TikTok & Mạng Xã Hội</Text>
                  <View style={styles.frameContainer}>
                    {frames.map((f) => (
                      <TouchableOpacity 
                        key={f.id} 
                        style={[styles.frameBtn, selectedFrame === f.id && styles.activeFrameBtn]}
                        onPress={() => setSelectedFrame(f.id)}
                      >
                        <Text style={[styles.frameText, selectedFrame === f.id && styles.activeFrameText]}>{f.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.subHeaderTitle}>🖼️ Chèn Hình Ảnh / Logo</Text>
                  <TouchableOpacity style={styles.actionRow} onPress={pickImageOverlay}>
                    <Text style={styles.actionText}>📁 Chọn ảnh từ bộ nhớ điện thoại</Text>
                    <Text style={styles.badgeText}>{selectedImage ? 'Đã thêm ✓' : 'Thêm'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'music' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>🎵 Kho Nhạc Không Bản Quyền Lồng Video</Text>
                  {musicList.map((m, idx) => (
                    <TouchableOpacity key={idx} style={styles.itemRow} onPress={() => setSelectedMusic(m)}>
                      <Text style={styles.itemText}>{m}</Text>
                      <Text style={styles.selectText}>{selectedMusic === m ? '✓ Đang dùng' : 'Chọn'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeTab === 'subtitle' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>💬 Phụ Đề Tự Động & Giọng Đọc AI</Text>
                  
                  <TouchableOpacity 
                    style={[styles.actionRow, showSubtitle && { borderColor: '#ff5722', borderWidth: 1 }]} 
                    onPress={() => setShowSubtitle(!showSubtitle)}
                  >
                    <Text style={styles.actionText}>📺 Bật/Tắt Hiển Thị Phụ Đề</Text>
                    <Text style={styles.badgeText}>{showSubtitle ? 'BẬT' : 'TẮT'}</Text>
                  </TouchableOpacity>

                  <Text style={styles.subHeaderTitle}>🎙️ Lựa Chọn Giọng Đọc AI</Text>
                  {aiVoices.map((voice, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.itemRow, selectedAIVoice === voice && { borderColor: '#ff5722', borderWidth: 1 }]} 
                      onPress={() => setSelectedAIVoice(voice)}
                    >
                      <Text style={styles.itemText}>{voice}</Text>
                      <Text style={styles.selectText}>{selectedAIVoice === voice ? '✓ Đã chọn' : 'Dùng'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Thanh Tab điều hướng */}
            <View style={styles.tabBar}>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'edit' && styles.activeTab]} onPress={() => setActiveTab('edit')}>
                <Text style={styles.tabIcon}>📐</Text>
                <Text style={styles.tabLabel}>Khung & Cắt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'music' && styles.activeTab]} onPress={() => setActiveTab('music')}>
                <Text style={styles.tabIcon}>🎵</Text>
                <Text style={styles.tabLabel}>Nhạc Nền</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'subtitle' && styles.activeTab]} onPress={() => setActiveTab('subtitle')}>
                <Text style={styles.tabIcon}>💬</Text>
                <Text style={styles.tabLabel}>Phụ Đề & AI</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.changeVideoBtn} onPress={pickVideo}>
              <Text style={styles.changeVideoText}>← Chọn Video Khác</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { height: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#ff5722', fontSize: 18, fontWeight: 'bold' },
  exportBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16 },
  exportBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  body: { flex: 1 },
  welcomeBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  welcomeSub: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 30 },
  pickBtn: { backgroundColor: '#ff5722', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  pickBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editorContainer: { flex: 1 },
  videoWrapper: { width: '100%', height: 220, backgroundColor: '#000', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  frameTiktokStandard: { borderWidth: 3, borderColor: '#ffea00' },
  frameTiktokNeon: { borderWidth: 4, borderColor: '#00e676' },
  frameCinema: { borderWidth: 10, borderColor: '#111' },
  videoPlayer: { width: '100%', height: '100%' },
  imageOverlayBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  overlayBadgeText: { color: '#ffea00', fontSize: 11, fontWeight: 'bold' },
  subtitleBox: { position: 'absolute', bottom: 42, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  subtitleText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  playPauseOverlayBtn: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  playPauseText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  quickStatusBar: { backgroundColor: '#1a1a1a', paddingVertical: 8, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#262626' },
  muteToggleBtn: { backgroundColor: '#2a2a2a', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  mutedActive: { backgroundColor: '#c62828' },
  muteToggleText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statusInfoText: { color: '#aaa', fontSize: 11, maxWidth: '50%' },
  toolContent: { flex: 1, padding: 14 },
  toolSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  subHeaderTitle: { color: '#ccc', fontSize: 13, fontWeight: 'bold', marginTop: 14, marginBottom: 8 },
  actionRow: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  actionText: { color: '#ddd', fontSize: 13 },
  badgeText: { color: '#ff5722', fontWeight: 'bold', fontSize: 12 },
  frameContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  frameBtn: { backgroundColor: '#1a1a1a', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6 },
  activeFrameBtn: { backgroundColor: '#ff5722' },
  frameText: { color: '#aaa', fontSize: 12 },
  activeFrameText: { color: '#fff', fontWeight: 'bold' },
  itemRow: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemText: { color: '#ddd', fontSize: 13 },
  selectText: { color: '#ff5722', fontSize: 12, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', height: 56, backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#282828' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#ff5722', backgroundColor: '#222' },
  tabIcon: { fontSize: 16 },
  tabLabel: { color: '#aaa', fontSize: 10, marginTop: 2 },
  changeVideoBtn: { paddingVertical: 8, alignItems: 'center', backgroundColor: '#111' },
  changeVideoText: { color: '#ff5722', fontSize: 12 }
});
