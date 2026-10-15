import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VIP Video Studio - Expo Edition</Text>
      <Text style={styles.subtitle}>Ứng dụng Chỉnh Sửa Video & Tích Hợp Quảng Cáo</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.compile({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00E676',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
