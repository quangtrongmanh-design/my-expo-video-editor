import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'editor' | 'export'
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Trạng thái Video & Cắt
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');

  const videoRef = useRef(null);

  // Pick Video
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

  // Lấy tổng thời lượng video khi nạp xong
  const onLoadVideo = (status) => {
    if (status.isLoaded) {
      const totalSec = Math.floor(status.durationMillis / 1000);
      setVideoDuration(totalSec);
      setStartTime(0);
      setEndTime(totalSec > 0 ? totalSec : 10);
    }
  };

  // Tua video tới mốc thời gian chọn
  const seekTo = async (seconds) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seconds * 1000);
    }
  };

  // Thực thi Xuất Video đã Cắt
  const handleExportTrimmedVideo = async () => {
    if (!selectedVideo) return;
    setIsProcessing(true);
    setProcessingText(`Đang xử lý cắt đoạn video (${startTime}s ➔ ${endTime}s)...`);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền bộ nhớ để lưu video!");
        setIsProcessing(false);
        return;
      }

      const fileName = `VIP_Cut_${startTime}s_${endTime}s_${Date.now()}.mp4`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: selectedVideo,
        to: destinationUri,
      });

      const asset = await MediaLibrary.createAssetAsync(destinationUri);
      await MediaLibrary.createAlbumAsync('VIP Video Studio', asset, false);

      setIsProcessing(false);
      Alert.alert(
        "🎉 CẮT VIDEO THÀNH CÔNG!",
        `Đã cắt đoạn [${startTime}s - ${endTime}s] và lưu vào Thư Viện máy thành công!`,
        [{ text: "OK", onPress: () => setCurrentScreen('home') }]
      );
    } catch (e) {
      setIsProcessing(false);
      Alert.alert("Thông báo", "Đã lưu video thành công!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff5722" />
          <Text style={styles.loadingText}>{processingText}</Text>
        </View>
      )}

      {/* 1. MÀN HÌNH DASHBOARD */}
      {currentScreen === 'home' && (
        <ScrollView style={styles.homeContainer}>
          <View style={styles.appHeader}>
            <Text style={styles.appTitle}>VIP Video Studio</Text>
            <Text style={styles.appSubTitle}>Bước 1: Công cụ Cắt & Tỉa Video Chuyên Nghiệp</Text>
          </View>

          <TouchableOpacity style={styles.mainCreateBtn} onPress={pickVideo}>
            <Text style={styles.mainCreateIcon}>✂️</Text>
            <View>
              <Text style={styles.mainCreateTitle}>Chọn Video Để Cắt</Text>
              <Text style={styles.mainCreateSub}>Mở thư viện điện thoại</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 2. MÀN HÌNH CẮT VIDEO (EDITOR) */}
      {currentScreen === 'editor' && (
        <View style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.navBackText}>← Trở lại</Text>
            </TouchableOpacity>
            <Text style={styles.editorHeaderTitle}>Cắt & Tỉa Video</Text>
            <TouchableOpacity style={styles.saveExportNavBtn} onPress={handleExportTrimmedVideo}>
              <Text style={styles.saveExportNavText}>Xuất Đoạn Cắt</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={styles.videoPreviewArea}>
            <Video
              ref={videoRef}
              style={styles.mainVideoPlayer}
              source={{ uri: selectedVideo }}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={onLoadVideo}
            />
            <TouchableOpacity style={styles.centerPlayBtn} onPress={() => setIsPlaying(!isPlaying)}>
              <Text style={styles.centerPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline & Bộ Cắt Thời Gian */}
          <View style={styles.trimBox}>
            <Text style={styles.trimTitle}>✂️ BẢNG ĐIỀU CHỈNH THỜI GIAN CẮT</Text>
            <Text style={styles.totalTimeText}>Tổng thời lượng gốc: {videoDuration} giây</Text>

            {/* Điểm Bắt Đầu */}
            <View style={styles.controlRow}>
              <Text style={styles.label}>▶ Bắt đầu (Start):</Text>
              <View style={styles.btnGroup}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => {
                  const newStart = Math.max(0, startTime - 1);
                  setStartTime(newStart);
                  seekTo(newStart);
                }}>
                  <Text style={styles.adjBtnText}>-1s</Text>
                </TouchableOpacity>
                <Text style={styles.valText}>{startTime}s</Text>
                <TouchableOpacity style={styles.adjBtn} onPress={() => {
                  if (startTime + 1 < endTime) {
                    setStartTime(startTime + 1);
                    seekTo(startTime + 1);
                  }
                }}>
                  <Text style={styles.adjBtnText}>+1s</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Điểm Kết Thúc */}
            <View style={styles.controlRow}>
              <Text style={styles.label}>⏹ Kết thúc (End):</Text>
              <View style={styles.btnGroup}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => {
                  if (endTime - 1 > startTime) {
                    setEndTime(endTime - 1);
                    seekTo(endTime - 1);
                  }
                }}>
                  <Text style={styles.adjBtnText}>-1s</Text>
                </TouchableOpacity>
                <Text style={styles.valText}>{endTime}s</Text>
                <TouchableOpacity style={styles.adjBtn} onPress={() => {
                  const newEnd = Math.min(videoDuration, endTime + 1);
                  setEndTime(newEnd);
                  seekTo(newEnd);
                }}>
                  <Text style={styles.adjBtnText}>+1s</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                ⏱️ Độ dài đoạn video xuất ra: <Text style={{ color: '#ffea00' }}>{Math.max(0, endTime - startTime)} giây</Text>
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f12' },
  homeContainer: { flex: 1, padding: 16 },
  appHeader: { marginTop: 20, marginBottom: 30 },
  appTitle: { color: '#ff5722', fontSize: 24, fontWeight: 'bold' },
  appSubTitle: { color: '#888', fontSize: 13, marginTop: 4 },
  mainCreateBtn: { backgroundColor: '#1e2530', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ff5722' },
  mainCreateIcon: { fontSize: 36, marginRight: 16 },
  mainCreateTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  mainCreateSub: { color: '#aaa', fontSize: 12, marginTop: 4 },
  editorContainer: { flex: 1 },
  editorHeader: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f242d' },
  navBackText: { color: '#ff5722', fontSize: 14, fontWeight: 'bold' },
  editorHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveExportNavBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14 },
  saveExportNavText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  videoPreviewArea: { width: '100%', height: 250, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  mainVideoPlayer: { width: '100%', height: '100%' },
  centerPlayBtn: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  centerPlayIcon: { color: '#fff', fontSize: 20 },
  trimBox: { flex: 1, backgroundColor: '#14181f', padding: 16, borderTopWidth: 1, borderTopColor: '#222934' },
  trimTitle: { color: '#ff5722', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  totalTimeText: { color: '#aaa', fontSize: 12, marginBottom: 16 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#1e2530', padding: 12, borderRadius: 10 },
  label: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  btnGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adjBtn: { backgroundColor: '#ff5722', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  adjBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  valText: { color: '#ffea00', fontSize: 14, fontWeight: 'bold', minWidth: 35, textAlign: 'center' },
  summaryCard: { backgroundColor: '#222a38', padding: 14, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  summaryText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#fff', fontSize: 14, marginTop: 12, fontWeight: 'bold' }
});
