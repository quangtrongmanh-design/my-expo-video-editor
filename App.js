import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [videoUri, setVideoUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Sẵn sàng làm việc');

  // 1. Chọn Video từ thư viện điện thoại
  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện để chọn video!');
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

  // 2. Thao tác cắt 5 giây đầu của Video bằng FFmpeg Native
  const trimVideo = async () => {
    if (!videoUri) {
      Alert.alert('Cảnh báo', 'Anh chưa chọn video nào!');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Đang cắt 5s đầu bằng bộ xử lý C++ FFmpeg...');

    try {
      const outputPath = `${FileSystem.documentDirectory}trimmed_${Date.now()}.mp4`;
      // Lệnh FFmpeg Native: Cắt từ giây 00:00:00 lấy 5 giây
      const ffmpegCommand = `-ss 00:00:00 -i "${videoUri}" -to 00:00:05 -c copy "${outputPath}"`;

      const session = await FFmpegKit.execute(ffmpegCommand);
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        // Yêu cầu quyền lưu vào thư viện máy
        await MediaLibrary.requestPermissionsAsync();
        await MediaLibrary.createAssetAsync(outputPath);
        
        setStatusMessage('Cắt video thành công! Đã lưu vào thư viện máy.');
        Alert.alert('Thành công', 'Video 5 giây mới đã được xuất thành công!');
      } else {
        setStatusMessage('Lỗi khi xử lý video!');
        Alert.alert('Thất bại', 'Quá trình render FFmpeg bị gián đoạn.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi hệ thống', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header VIP Video Studio */}
      <View style={styles.header}>
        <Text style={styles.title}>VIP VIDEO STUDIO</style>
        <Text style={styles.subtitle}>Bộ xử lý Video Native Offline</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Khung trạng thái */}
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          {isProcessing && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 10 }} />}
        </View>

        {/* Các nút chức năng */}
        <TouchableOpacity style={styles.btnPrimary} onPress={pickVideo}>
          <Text style={styles.btnText}>1. Chọn Video Từ Máy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAction, !videoUri && styles.btnDisabled]} 
          onPress={trimVideo}
          disabled={!videoUri || isProcessing}
        >
          <Text style={styles.btnText}>2. Cắt 5 Giây Đầu (FFmpeg Native)</Text>
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
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statusBox: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: {
    color: '#f8fafc',
    textAlign: 'center',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnAction: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
