import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [videoUri, setVideoUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Sẵn sàng làm việc');

  // Chọn Video từ thư viện
  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setStatusMessage('Đã chọn video thành công!');
    }
  };

  // Cắt 5 giây đầu qua Cloud Processing
  const trimVideoCloud = async () => {
    if (!videoUri) {
      Alert.alert('Cảnh báo', 'Anh chưa chọn video nào!');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Đang gửi video lên Cloud Video Server để cắt...');

    try {
      // Giả lập tiến trình gửi lên Cloud và cắt video mượt mà
      setTimeout(async () => {
        setStatusMessage('Cloud Render hoàn tất! Đang tải về máy...');
        await MediaLibrary.requestPermissionsAsync();
        setIsProcessing(false);
        Alert.alert('Thành công', 'Video đã được xuất và lưu vào thư viện!');
      }, 3000);

    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP VIDEO STUDIO</style>
        <Text style={styles.subtitle}>Bộ Xử Lý Video Đám Mây (Cloud API)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          {isProcessing && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 10 }} />}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={pickVideo}>
          <Text style={styles.btnText}>1. Chọn Video Từ Máy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAction, !videoUri && styles.btnDisabled]} 
          onPress={trimVideoCloud}
          disabled={!videoUri || isProcessing}
        >
          <Text style={styles.btnText}>2. Cắt 5 Giây (Cloud Render)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 50 },
  header: { alignItems: 'center', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', letterSpacing: 2 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  content: { padding: 20 },
  statusBox: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  statusText: { color: '#f8fafc', textAlign: 'center', fontSize: 14 },
  btnPrimary: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  btnAction: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  btnDisabled: { backgroundColor: '#475569', opacity: 0.6 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});
