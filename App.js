// Lưu Video vào thư viện máy an toàn tuyệt đối
  const applyExport = async () => {
    if (!videoUri) return Alert.alert("Thông báo", "Vui lòng chọn video trước khi lưu!");
    
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Cần cấp quyền", "Anh Duy vui lòng cấp quyền Lưu trữ cho ứng dụng nhé!");
        return;
      }

      // Lưu trực tiếp file video vào Thư viện chung của máy (Không tạo album riêng để tránh lỗi)
      await MediaLibrary.createAssetAsync(videoUri);
      
      Alert.alert(
        "🎉 ĐÃ LƯU VIDEO THÀNH CÔNG!", 
        "Video đã được lưu vào Bộ Sưu Tập / Thư Viện ảnh trên điện thoại của anh Duy!"
      );
    } catch (error) {
      Alert.alert("Lỗi lưu video", error.message);
    }
  };
