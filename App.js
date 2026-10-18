import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';

export default function App() {
  const [videoUri, setVideoUri] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Cần cấp quyền", "Anh Duy vui lòng cho phép ứng dụng truy cập Thư viện ảnh/video nhé!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
      Alert.alert("Thành công!", "Đã tải video vào trình phát VIP Video Studio.");
    }
  };

  const handleSpeedToggle = () => {
    const newRate = rate === 1.0 ? 1.5 : rate === 1.5 ? 2.0 : 0.5;
    setRate(newRate);
    Alert.alert("Chỉnh tốc độ", `Tốc độ phát hiện tại: ${newRate}x`);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    Alert.alert("Âm thanh", !isMuted ? "Đã tắt âm thanh video" : "Đã bật âm thanh video");
  };

  const handleToolAction = (name) => {
    if (!videoUri) {
      Alert.alert("Thông báo", "Anh Duy hãy tải video lên trước khi dùng công cụ này nhé!");
      return;
    }
    Alert.alert(`Công cụ ${name}`, `Đang xử lý ${name} cho video... (Phiên bản tính năng nâng cao)`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>VIP VIDEO STUDIO</Text>
        <Text style={styles.subtitle}>Hệ Thống Dựng Video Realtime</Text>
      </View>

      <View style={styles.previewBox}>
        {videoUri ? (
          <Video
            source={{ uri: videoUri }}
            rate={rate}
            volume={isMuted ? 0.0 : 1.0}
            isMuted={isMuted}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            useNativeControls
            style={styles.videoPlayer}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>🎬</Text>
            <Text style={styles.previewText}>Chưa có Video nào được chọn</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={pickVideo}>
        <Text style={styles.mainBtnText}>
          {videoUri ? "🔄 CHỌN VIDEO KHÁC" : "📂 TẢI VIDEO TỪ ĐIỆN THOẠI UP LÊN"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Bộ Công Cụ Xử Lý Video:</Text>
      
      <ScrollView contentContainerStyle={styles.toolsGrid}>
        <TouchableOpacity style={styles.toolCard} onPress={() => handleToolAction("Cắt & Ghép")}>
          <Text style={styles.toolIcon}>✂️</Text>
          <Text style={styles.toolText}>Cắt & Ghép</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={handleMuteToggle}>
          <Text style={styles.toolIcon}>{isMuted ? "🔇" : "🎵"}</Text>
          <Text style={styles.toolText}>{isMuted ? "Mở Âm Thanh" : "Tắt Âm Thanh"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={handleSpeedToggle}>
          <Text style={styles.toolIcon}>⚡</Text>
          <Text style={styles.toolText}>Tốc Độ ({rate}x)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={() => handleToolAction("Thêm Chữ & Sub")}>
          <Text style={styles.toolIcon}>📝</Text>
          <Text style={styles.toolText}>Thêm Chữ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={() => handleToolAction("Bộ Lọc Màu")}>
          <Text style={styles.toolIcon}>🎨</Text>
          <Text style={styles.toolText}>Lọc Màu VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolCard} onPress={() => handleToolAction("Xuất Video HD")}>
          <Text style={styles.toolIcon}>💾</Text>
          <Text style={styles.toolText}>Xuất File HD</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  previewBox: {
    width: '100%',
    height: 230,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  previewText: {
    color: '#64748b',
    fontSize: 14,
  },
  mainBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  mainBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  toolText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
  },
});
