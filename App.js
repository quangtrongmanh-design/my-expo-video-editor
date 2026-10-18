import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const videoRef = useRef(null);
  const [videoUri, setVideoUri] = useState(null);
  const [rate, setRate] = useState(1.0);
  
  // Thời gian cắt (tính bằng Giây)
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("10");

  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#ef4444");
  const [filterMode, setFilterMode] = useState("none");

  // Chọn Video từ điện thoại
  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Cần cấp quyền", "Anh Duy vui lòng cấp quyền truy cập thư viện media nhé!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
        Alert.alert("Thành công!", "Đã nạp video vào trình phát VIP Video Studio.");
      }
    } catch (error) {
      Alert.alert("Lỗi chọn video", error.message);
    }
  };

  // Áp dụng cắt thời gian phát
  const applyCut = async () => {
    if (!videoUri) return Alert.alert("Thông báo", "Anh Duy hãy chọn video trước nhé!");
    
    const startSec = parseFloat(startTime) || 0;
    const endSec = parseFloat(endTime) || 10;

    if (startSec >= endSec) {
      return Alert.alert("Lỗi thời gian", "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!");
    }

    if (videoRef.current) {
      await videoRef.current.setPositionAsync(startSec * 1000);
      await videoRef.current.playAsync();
      Alert.alert("Đã Cắt Đoạn Video!", `Trình phát đã chuyển đến giây thứ ${startSec} và sẽ phát đến giây ${endSec}.`);
    }
  };

  // Lắng nghe tiến trình phát để tự lặp lại đúng khoảng thời gian đã cắt
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded && status.isPlaying) {
      const currentSec = status.positionMillis / 1000;
      const endSec = parseFloat(endTime) || 10;
      const startSec = parseFloat(startTime) || 0;

      if (currentSec >= endSec && videoRef.current) {
        videoRef.current.setPositionAsync(startSec * 1000);
      }
    }
  };

  // Lưu Video trực tiếp vào Thư viện máy an toàn tuyệt đối
  const applyExport = async () => {
    if (!videoUri) return Alert.alert("Thông báo", "Vui lòng chọn video trước khi lưu!");
    
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Cần cấp quyền", "Anh Duy vui lòng cấp quyền Lưu trữ cho ứng dụng trong Cài đặt nhé!");
        return;
      }

      // Lưu trực tiếp file video vào Thư viện chung của máy (Không tạo album riêng để tránh lỗi permission)
      await MediaLibrary.createAssetAsync(videoUri);
      
      Alert.alert(
        "🎉 ĐÃ LƯU VIDEO THÀNH CÔNG!", 
        "Video đã được lưu trực tiếp vào Bộ Sưu Tập / Thư Viện ảnh trên điện thoại của anh Duy!"
      );
    } catch (error) {
      Alert.alert("Lỗi lưu video", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>VIP VIDEO STUDIO</Text>
        <Text style={styles.subtitle}>Chỉnh Sửa & Cắt Đoạn Video Realtime</Text>
      </View>

      <View style={[
        styles.previewBox, 
        filterMode === 'bw' && styles.filterBW,
        filterMode === 'sepia' && styles.filterSepia,
        filterMode === 'warm' && styles.filterWarm,
      ]}>
        {videoUri ? (
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              rate={rate}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              useNativeControls
              style={styles.videoPlayer}
            />
            {overlayText !== "" && (
              <View style={styles.overlayContainer}>
                <Text style={[styles.overlayText, { color: textColor }]}>
                  {overlayText}
                </Text>
              </View>
            )}
          </View>
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

      <ScrollView style={styles.controlsScroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>✂️ Cắt Khoảng Thời Gian Video (Giây)</Text>
          <View style={styles.rowInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Từ (s):</Text>
              <TextInput 
                style={styles.textInput} 
                keyboardType="numeric" 
                value={startTime} 
                onChangeText={setStartTime} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đến (s):</Text>
              <TextInput 
                style={styles.textInput} 
                keyboardType="numeric" 
                value={endTime} 
                onChangeText={setEndTime} 
              />
            </View>
            <TouchableOpacity style={styles.actionSubBtn} onPress={applyCut}>
              <Text style={styles.actionSubText}>Cắt Ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>📝 Thêm Chữ Đè Lên Video (Watermark)</Text>
          <TextInput 
            style={styles.fullTextInput} 
            placeholder="Nhập chữ cần đè lên video..." 
            placeholderTextColor="#64748b"
            value={overlayText}
            onChangeText={setOverlayText}
          />
          <View style={styles.colorRow}>
            <Text style={styles.label}>Màu chữ:</Text>
            <TouchableOpacity style={[styles.colorChip, { backgroundColor: '#f59e0b' }]} onPress={() => setTextColor('#f59e0b')} />
            <TouchableOpacity style={[styles.colorChip, { backgroundColor: '#ffffff' }]} onPress={() => setTextColor('#ffffff')} />
            <TouchableOpacity style={[styles.colorChip, { backgroundColor: '#ef4444' }]} onPress={() => setTextColor('#ef4444')} />
            <TouchableOpacity style={[styles.colorChip, { backgroundColor: '#10b981' }]} onPress={() => setTextColor('#10b981')} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>🎨 Bộ Lọc Màu & Tốc Độ Phát</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterBtn, filterMode === 'none' && styles.activeFilter]} onPress={() => setFilterMode('none')}>
              <Text style={styles.filterText}>Gốc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, filterMode === 'bw' && styles.activeFilter]} onPress={() => setFilterMode('bw')}>
              <Text style={styles.filterText}>Đen Trắng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, filterMode === 'sepia' && styles.activeFilter]} onPress={() => setFilterMode('sepia')}>
              <Text style={styles.filterText}>Cổ Điển</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, filterMode === 'warm' && styles.activeFilter]} onPress={() => setFilterMode('warm')}>
              <Text style={styles.filterText}>Nắng Ấm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.speedRow}>
            <Text style={styles.label}>Tốc độ ({rate}x):</Text>
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <TouchableOpacity key={s} style={[styles.speedBtn, rate === s && styles.activeSpeed]} onPress={() => setRate(s)}>
                <Text style={styles.speedText}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={applyExport}>
          <Text style={styles.exportBtnText}>💾 LƯU VIDEO VÀO THƯ VIỆN MÁY</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 45,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  previewBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 4,
    borderRadius: 8,
  },
  overlayText: {
    fontWeight: 'bold',
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  filterBW: {
    opacity: 0.85,
  },
  filterSepia: {
    backgroundColor: '#3b2d1d',
  },
  filterWarm: {
    backgroundColor: '#2e1c14',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  previewText: {
    color: '#64748b',
    fontSize: 13,
  },
  mainBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  mainBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  controlsScroll: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    marginRight: 6,
  },
  textInput: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    width: 50,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  actionSubBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionSubText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  fullTextInput: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    fontSize: 13,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  activeFilter: {
    borderColor: '#f59e0b',
    backgroundColor: '#334155',
  },
  filterText: {
    color: '#e2e8f0',
    fontSize: 11,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  activeSpeed: {
    borderColor: '#2563eb',
    backgroundColor: '#1d4ed8',
  },
  speedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  exportBtn: {
    backgroundColor: '#d97706',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 30,
  },
  exportBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
