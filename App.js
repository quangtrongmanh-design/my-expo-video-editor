import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function App() {
  const [statusMessage, setStatusMessage] = useState('Sẵn sàng làm việc');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessVideo = () => {
    setIsProcessing(true);
    setStatusMessage('Đang kết nối Server Cloud Video...');

    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage('Đã chọn và xử lý video thành công!');
      Alert.alert('VIP Video Studio', 'Xử lý video hoàn tất thành công!');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP VIDEO STUDIO</Text>
        <Text style={styles.subtitle}>Hệ Thống Xử Lý Video Cloud</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          {isProcessing && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 10 }} />}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleProcessVideo} disabled={isProcessing}>
          <Text style={styles.btnText}>Bấm Thử Nghiệm Xử Lý Video</Text>
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
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
