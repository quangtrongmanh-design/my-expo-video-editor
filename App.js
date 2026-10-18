// Hàm xuất & lưu file video thật về điện thoại
  const applyExport = async () => {
    if (!videoUri) return Alert.alert("Thông báo", "Vui lòng chọn video trước khi xuất file!");
    
    try {
      // Xin quyền ghi file vào Thư viện máy
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Cần cấp quyền", "Anh Duy vui lòng vào Cài đặt điện thoại -> Ứng dụng -> Cấp quyền Lưu trữ/Bộ sưu tập cho VIP Video Studio nhé!");
        return;
      }

      // Lưu video trực tiếp vào Thư viện ảnh/video của máy
      const asset = await MediaLibrary.createAssetAsync(videoUri);
      
      Alert.alert(
        "🎉 XUẤT VIDEO THÀNH CÔNG!", 
        `Video đã được lưu thành công vào Bộ Sưu Tập / Thư Viện ảnh trên điện thoại của anh Duy!`
      );
    } catch (error) {
      Alert.alert("Lỗi xuất video", error.message);
    }
  };
