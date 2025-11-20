# Ứng dụng Giao hàng quanh tôi 🚚📍

Ứng dụng React Native hiển thị bản đồ Google Maps với các điểm giao hàng, tìm đường và theo dõi vị trí realtime.

## Tính năng ✨

- ✅ Hiển thị bản đồ Google Maps
- ✅ Đánh dấu các điểm giao hàng với markers
- ✅ Vẽ đường đi từ vị trí hiện tại → điểm giao bằng Polyline
- ✅ Gọi Google Directions API để tìm đường
- ✅ Theo dõi vị trí realtime (bật/tắt)
- ✅ Hiển thị khoảng cách và thời gian di chuyển

## Cài đặt 🔧

### 1. Cài đặt dependencies
```bash
cd ChatApp
npm install
```

### 2. Cấu hình Google Maps API Key

#### Lấy API Key từ Google Cloud Console:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật các API sau:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
4. Tạo API Key trong phần **Credentials**
5. Copy API Key của bạn

#### Cấu hình cho Android:
Mở file `android/app/src/main/AndroidManifest.xml` và thay `YOUR_GOOGLE_MAPS_API_KEY` bằng API key thực tế:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="AIzaSy...your-actual-key"/>
```

#### Cấu hình cho iOS:
Mở file `ios/Podfile` và thêm (nếu chưa có):
```ruby
pod 'GoogleMaps'
pod 'Google-Maps-iOS-Utils'
```

Sau đó chạy:
```bash
cd ios
pod install
cd ..
```

#### Cấu hình API Key cho Directions API:
Mở file `src/services/directionsService.ts` và thay thế:
```typescript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

## Chạy ứng dụng 🚀

### Android:
```bash
npm run android
```

### iOS:
```bash
npm run ios
```

## Cấu trúc dự án 📁

```
ChatApp/
├── App.tsx                              # Component chính
├── src/
│   ├── services/
│   │   └── directionsService.ts         # Service gọi Google Directions API
│   └── types/
│       └── delivery.ts                  # TypeScript types
├── android/
│   └── app/src/main/AndroidManifest.xml # Cấu hình Android
└── ios/
    └── ChatApp/Info.plist               # Cấu hình iOS
```

## Cách sử dụng 📱

1. **Khởi động ứng dụng**: Ứng dụng sẽ tự động lấy vị trí hiện tại của bạn
2. **Xem điểm giao hàng**: Các marker đỏ hiển thị các điểm giao hàng
3. **Chọn điểm giao hàng**: Nhấn vào marker để xem đường đi
4. **Bật theo dõi vị trí**: Nhấn nút "▶ Theo dõi vị trí" để theo dõi realtime
5. **Xóa tuyến đường**: Nhấn nút "✕ Xóa tuyến đường" để xóa đường đã vẽ

## Permissions 🔐

### Android:
- `ACCESS_FINE_LOCATION`: Vị trí chính xác
- `ACCESS_COARSE_LOCATION`: Vị trí gần đúng

### iOS:
- `NSLocationWhenInUseUsageDescription`: Truy cập vị trí khi dùng app
- `NSLocationAlwaysAndWhenInUseUsageDescription`: Truy cập vị trí luôn
- `NSLocationAlwaysUsageDescription`: Truy cập vị trí nền

## Dependencies 📦

- `react-native-maps`: Hiển thị bản đồ
- `@react-native-community/geolocation`: Lấy vị trí GPS
- `axios`: Gọi API

## Lưu ý quan trọng ⚠️

1. **API Key**: Nhớ thay thế `YOUR_GOOGLE_MAPS_API_KEY` bằng key thực tế ở 2 vị trí:
   - `android/app/src/main/AndroidManifest.xml`
   - `src/services/directionsService.ts`

2. **Billing**: Đảm bảo đã bật billing trên Google Cloud Console để sử dụng Directions API

3. **Testing trên thiết bị thật**: Tính năng GPS hoạt động tốt nhất trên thiết bị thật, không phải emulator

## Tùy chỉnh 🎨

### Thay đổi điểm giao hàng mẫu:
Mở `App.tsx` và chỉnh sửa mảng `SAMPLE_DELIVERY_POINTS`:
```typescript
const SAMPLE_DELIVERY_POINTS: DeliveryPoint[] = [
  {
    id: '1',
    title: 'Đơn hàng #001',
    description: 'Địa chỉ của bạn',
    latitude: 10.xxxx,
    longitude: 106.xxxx,
    status: 'pending',
  },
  // Thêm điểm giao hàng khác...
];
```

## Troubleshooting 🔍

### Lỗi "INVALID_REQUEST" khi gọi Directions API:
- Kiểm tra API Key đã đúng chưa
- Đảm bảo đã bật Directions API trên Google Cloud Console
- Kiểm tra billing đã được kích hoạt

### Không hiển thị bản đồ trên Android:
- Kiểm tra API Key trong `AndroidManifest.xml`
- Đảm bảo đã bật Maps SDK for Android

### Không lấy được vị trí:
- Kiểm tra permissions đã được cấp
- Bật GPS trên thiết bị
- Test trên thiết bị thật thay vì emulator

## License

MIT

---

Phát triển bởi GitHub Copilot 🤖
