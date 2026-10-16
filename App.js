import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VIP Video Editor</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.welcomeText}>Ứng dụng sẵn sàng tích hợp AdMob!</Text>
        <TouchableOpacity style={styles.button} onPress={() => alert('Đang mở trình tạo video...')}>
          <Text style={styles.buttonText}>+ Tạo Video Mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  welcomeText: { color: '#aaa', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#ff5722', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
