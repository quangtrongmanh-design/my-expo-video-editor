import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Lệnh mở thư viện để chọn Video
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VIP Video Editor</Text>
      </View>

      <View style={styles.body}>
        {!selectedVideo ? (
          // Màn hình chính khi chưa chọn Video
          <View style={styles.centerBox}>
            <Text style={styles.welcomeText}>Chưa có video nào được chọn</Text>
            <TouchableOpacity style={styles.button} onPress={pickVideo}>
              <Text style={styles.buttonText}>+ Chọn Video Từ Máy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Màn hình Trình chỉnh sửa khi đã chọn Video
          <View style={styles.editorBox}>
            <Text style={styles.successText}>✓ Đã tải video thành công!</Text>
            <Text style={styles.pathText} numberOfLines={2}>Đường dẫn: {selectedVideo}</Text>

            <View style={styles.toolsContainer}>
              <TouchableOpacity style={styles.toolButton} onPress={() => alert('Tính năng Cắt Video đang phát triển!')}>
                <Text style={styles.toolText}>✂️ Cắt Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton} onPress={() => alert('Tính năng Chèn Nhạc đang phát triển!')}>
                <Text style={styles.toolText}>🎵 Chèn Nhạc</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedVideo(null)}>
              <Text style={styles.backText}>← Chọn Video Khác</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#ff5722', fontSize: 20, fontWeight: 'bold' },
  body: { flex: 1, padding: 20 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeText: { color: '#aaa', fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#ff5722', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editorBox: { flex: 1, alignItems: 'center', paddingTop: 30 },
  successText: { color: '#4caf50', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  pathText: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  toolsContainer: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  toolButton: { backgroundColor: '#262626', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  toolText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  backButton: { padding: 10 },
  backText: { color: '#ff5722', fontSize: 14 }
});
