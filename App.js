import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [showSubtitle, setShowSubtitle] = useState(false);
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

  // Danh sách khung Frame hấp dẫn
  const frames = [
    { id: 'none', name: 'Không khung' },
    { id: 'neon', name: '🌟 Viền Neon Cyber' },
    { id: 'cinema', name: '🎬 Khung Điện Ảnh 2.35:1' },
    { id: 'tiktok', name: '🔥 Hot Trend TikTok' },
  ];

  // Kho nhạc nền
  const musicList = [
    '🎵 Chill Lo-Fi Beat (Không bản quyền)',
    '🎵 Upbeat Summer Vlog',
    '🎵 Acoustic Guitar Travel',
  ];

  // Danh sách giọng đọc AI
  const aiVoices = [
    '🤖 Giọng Nam Miền Nam (Truyền cảm)',
    '🤖 Giọng Nữ Miền Bắc (Review phim)',
    '🤖 Giọng Nam Trầm Ấm (Thuyết minh)',
    '🤖 Giọng Hoạt Hình Vui Nhộn',
  ];

  // Xuất video giả lập thực thi
  const handleExport = () => {
    Alert.alert(
      "🚀 Đang xuất Video",
      `Đang render video kèm khung [${selectedFrame}], phụ đề và âm thanh. Vui lòng đợi trong giây lát...`,
      [{ text: "OK" }]
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
            <Text style={styles.welcomeTitle}>Trình Chỉnh Sửa Video Đỉnh Cao</Text>
            <Text style={styles.welcomeSub}>Cắt ghép, chèn ảnh, khung frame, nhạc & AI Voice</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
              <Text style={styles.pickBtnText}>+ Chọn Video Từ Máy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editorContainer}>
            {/* Trình xem Video kèm khung Frame & Phụ đề */}
            <View style={[
              styles.videoWrapper, 
              selectedFrame === 'neon' && styles.frameNeon,
              selectedFrame === 'cinema' && styles.frameCinema,
              selectedFrame === 'tiktok' && styles.frameTiktok
            ]}>
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{ uri: selectedVideo }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
              {/* Hiển thị phụ đề trực quan khi bật */}
              {showSubtitle && (
                <View style={styles.subtitleBox}>
                  <Text style={styles.subtitleText}>💬 [Phụ đề AI]: Chào mừng bạn đến với VIP Video Editor!</Text>
                </View>
              )}
            </View>

            {/* Thanh trạng thái thông tin phụ / nhạc */}
            <View style={styles.statusBar}>
              <Text style={styles.statusTextInfo} numberOfLines={1}>
                {selectedMusic ? `🎵 ${selectedMusic}` : '🎵 Chưa có nhạc'} | {selectedImage ? '🖼️ Đã chèn ảnh' : '🖼️ Chưa chèn ảnh'}
              </Text>
            </View>

            {/* Khu vực công cụ theo Tab */}
            <ScrollView style={styles.toolContent}>
              {activeTab === 'edit' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>✂️ Cắt Ghép & Chèn Hình Ảnh</Text>
                  
                  <TouchableOpacity style={styles.actionRow} onPress={pickImageOverlay}>
                    <Text style={styles.actionText}>🖼️ Chèn Hình Ảnh / Logo Phủ Lên Video</Text>
                    <Text style={styles.badgeText}>{selectedImage ? 'Đã chọn' : 'Thêm'}</Text>
                  </TouchableOpacity>

                  <Text style={styles.subHeaderTitle}>🎨 Chọn Khung Frame Hấp Dẫn</Text>
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
                </View>
              )}

              {activeTab === 'music' && (
                <View style={styles.toolSection}>
                  <Text style={styles.sectionTitle}>🎵 Kho Nhạc Không Bản Quyền</Text>
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
                  <Text style={styles.sectionTitle}>💬 Phụ Đề Tự Động & Đọc AI</Text>
                  
                  <TouchableOpacity 
                    style={[styles.actionRow, showSubtitle && { borderColor: '#ff5722', borderWidth: 1 }]} 
                    onPress={() => setShowSubtitle(!showSubtitle)}
                  >
                    <Text style={styles.actionText}>📺 Hiển thị Phụ Đề Trên Video</Text>
                    <Text style={styles.badgeText}>{showSubtitle ? 'BẬT' : 'TẮT'}</Text>
                  </TouchableOpacity>

                  <Text style={styles.subHeaderTitle}>🎙️ Lựa Chọn Giọng Đọc AI (Text-To-Speech)</Text>
                  {aiVoices.map((voice, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.itemRow, selectedAIVoice === voice && { backgroundColor: '#222', borderColor: '#ff5722', borderWidth: 1 }]} 
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
                <Text style={styles.tabIcon}>✂️</Text>
                <Text style={styles.tabLabel}>Cắt & Frame</Text>
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
  videoWrapper: { width: '100%', height: 220, backgroundColor: '#000', justifyContent: 'center', overflow: 'hidden' },
  frameNeon: { borderWidth: 4, borderColor: '#00e676' },
  frameCinema: { borderWidth: 12, borderColor: '#111' },
  frameTiktok: { borderWidth: 4, borderColor: '#ffea00' },
  videoPlayer: { width: '100%', height: '100%' },
  subtitleBox: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
  subtitleText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  statusBar: { backgroundColor: '#1e1e1e', paddingVertical: 6, paddingHorizontal: 16 },
  statusTextInfo: { color: '#aaa', fontSize: 11 },
  toolContent: { flex: 1, padding: 14 },
  toolSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  subHeaderTitle: { color: '#ccc', fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
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
