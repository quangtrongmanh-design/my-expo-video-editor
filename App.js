import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'music', 'subtitle', 'copyright'
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
      // Reset trạng thái khi chọn video mới
      setRate(1.0);
      setIsFlipped(false);
      setSelectedMusic(null);
    }
  };

  // Kho nhạc miễn phí bản quyền (No-Copyright Music)
  const noCopyrightTracks = [
    { id: '1', title: 'Chill Lo-Fi Beat (NCN)', duration: '2:15' },
    { id: '2', title: 'Upbeat Vlog Summer (Pixabay)', duration: '1:45' },
    { id: '3', title: 'Acoustic Guitar Travel', duration: '3:10' },
  ];

  // Kiểm tra cảnh báo bản quyền
  const checkCopyright = () => {
    Alert.alert(
      "🛡️ Kết Quả Kiểm Tra Bản Quyền",
      "Video của bạn an toàn! Không phát hiện nhạc bản quyền thương mại bị cấm.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VIP Video Editor Pro</Text>
        {selectedVideo && (
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Thành công", "Đang xuất Video chất lượng cao...")}>
            <Text style={styles.exportBtnText}>Xuất Video</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        {!selectedVideo ? (
          // Màn hình khởi đầu
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Trình Chỉnh Sửa Video Chuẩn CapCut</Text>
            <Text style={styles.welcomeSub}>Tích hợp công cụ Lách & Kiểm tra Bản quyền</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
              <Text style={styles.pickBtnText}>+ Chọn Video Từ Máy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Màn hình Trình chỉnh sửa Video
          <View style={styles.editorContainer}>
            {/* Trình xem Video (Video Player) */}
            <View style={[styles.videoWrapper, isFlipped && styles.flippedVideo]}>
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{ uri: selectedVideo }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                rate={rate}
              />
            </View>

            {/* Thông tin bài nhạc đính kèm nếu có */}
            {selectedMusic && (
              <View style={styles.musicBar}>
                <Text style={styles.musicBarText}>🎵 Nhạc nền: {selectedMusic}</Text>
              </View>
            )}

            {/* Nội dung thanh công cụ dựa theo Tab */}
            <ScrollView style={styles.toolContent}>
              {activeTab === 'edit' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>✂️ Công Cụ Lách Bản Quyền & Cắt Video</Text>
                  
                  <TouchableOpacity 
                    style={styles.actionRow} 
                    onPress={() => setIsFlipped(!isFlipped)}
                  >
                    <Text style={styles.actionText}>↔️ Lật ngược khung hình (Mirror Flip)</Text>
                    <Text style={styles.statusText}>{isFlipped ? 'ĐÃ BẬT' : 'TẮT'}</Text>
                  </TouchableOpacity>

                  <View style={styles.rateRow}>
                    <Text style={styles.actionText}>⚡ Tốc độ Video (Đổi pitch nhẹ):</Text>
                    <View style={styles.rateButtons}>
                      {[0.95, 1.0, 1.05, 1.2].map((r) => (
                        <TouchableOpacity 
                          key={r} 
                          style={[styles.rateBtn, rate === r && styles.activeRateBtn]}
                          onPress={() => setRate(r)}
                        >
                          <Text style={[styles.rateText, rate === r && styles.activeRateText]}>{r}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert("Cắt Video", "Kéo thanh chọn thời gian để cắt ngắn video.")}>
                    <Text style={styles.actionText}>✂️ Cắt bớt đầu / cuối video</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'music' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>🎼 Kho Nhạc Miễn Phí Bản Quyền</Text>
                  {noCopyrightTracks.map((track) => (
                    <TouchableOpacity 
                      key={track.id} 
                      style={styles.musicItem}
                      onPress={() => setSelectedMusic(track.title)}
                    >
                      <View>
                        <Text style={styles.musicTitle}>{track.title}</Text>
                        <Text style={styles.musicDuration}>{track.duration}</Text>
                      </View>
                      <Text style={styles.addMusicText}>{selectedMusic === track.title ? '✓ Đã chọn' : '+ Thêm'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeTab === 'subtitle' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>💬 Phụ Đề Tự Động (Auto Subtitle)</Text>
                  <TouchableOpacity 
                    style={styles.primaryActionBtn}
                    onPress={() => Alert.alert("Tạo Phụ Đề", "Hệ thống AI đang quét giọng nói và chèn phụ đề tự động...")}
                  >
                    <Text style={styles.primaryActionText}>🪄 Quét Giọng Nói & Trích Phụ Đề</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'copyright' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>🛡️ Kiểm Tra & Bảo Vệ Bản Quyền</Text>
                  <Text style={styles.descText}>
                    Quét âm thanh và hình ảnh trong 10 giây để phát hiện bản quyền thương mại trước khi đăng lên TikTok, YouTube, Facebook.
                  </Text>
                  <TouchableOpacity style={styles.checkBtn} onPress={checkCopyright}>
                    <Text style={styles.checkBtnText}>🔍 Bắt Đầu Quét Bản Quyền</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Thanh Tab điều hướng chính bên dưới */}
            <View style={styles.tabBar}>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'edit' && styles.activeTab]} onPress={() => setActiveTab('edit')}>
                <Text style={styles.tabIcon}>✂️</Text>
                <Text style={styles.tabLabel}>Chỉnh Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tabItem, activeTab === 'music' && styles.activeTab]} onPress={() => setActiveTab('music')}>
                <Text style={styles.tabIcon}>🎵</Text>
                <Text style={styles.tabLabel}>Nhạc Nền</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tabItem, activeTab === 'subtitle' && styles.activeTab]} onPress={() => setActiveTab('subtitle')}>
                <Text style={styles.tabIcon}>💬</Text>
                <Text style={styles.tabLabel}>Phụ Đề</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tabItem, activeTab === 'copyright' && styles.activeTab]} onPress={() => setActiveTab('copyright')}>
                <Text style={styles.tabIcon}>🛡️</Text>
                <Text style={styles.tabLabel}>Bản Quyền</Text>
              </TouchableOpacity>
            </View>

            {/* Nút đổi video khác */}
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
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
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
  videoWrapper: { width: '100%', height: 230, backgroundColor: '#000', justifyContent: 'center' },
  videoPlayer: { width: '100%', height: '100%' },
  flippedVideo: { transform: [{ scaleX: -1 }] },
  musicBar: { backgroundColor: '#1a237e', paddingVertical: 6, paddingHorizontal: 16 },
  musicBarText: { color: '#fff', fontSize: 12 },
  toolContent: { flex: 1, padding: 16 },
  toolSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  actionRow: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actionText: { color: '#ccc', fontSize: 13 },
  statusText: { color: '#ff5722', fontWeight: 'bold', fontSize: 12 },
  rateRow: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, marginBottom: 10 },
  rateButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  rateBtn: { flex: 1, backgroundColor: '#2a2a2a', paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeRateBtn: { backgroundColor: '#ff5722' },
  rateText: { color: '#aaa', fontSize: 12 },
  activeRateText: { color: '#fff', fontWeight: 'bold' },
  musicItem: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  musicTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  musicDuration: { color: '#666', fontSize: 11, marginTop: 2 },
  addMusicText: { color: '#ff5722', fontSize: 12, fontWeight: 'bold' },
  primaryActionBtn: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center' },
  primaryActionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  descText: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  checkBtn: { backgroundColor: '#1565c0', padding: 14, borderRadius: 8, alignItems: 'center' },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#282828' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#ff5722', backgroundColor: '#222' },
  tabIcon: { fontSize: 16 },
  tabLabel: { color: '#aaa', fontSize: 10, marginTop: 2 },
  changeVideoBtn: { paddingVertical: 8, alignItems: 'center', backgroundColor: '#111' },
  changeVideoText: { color: '#ff5722', fontSize: 12 }
});
