import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import {getDirections} from './src/services/directionsService';
import type {DeliveryPoint, Location as LocationType} from './src/types/delivery';

// Dữ liệu mẫu các điểm giao hàng
const SAMPLE_DELIVERY_POINTS: DeliveryPoint[] = [
  {
    id: '1',
    title: 'Đơn hàng #001',
    description: '123 Nguyễn Huệ, Q.1',
    latitude: 10.7769,
    longitude: 106.7009,
    status: 'pending',
  },
  {
    id: '2',
    title: 'Đơn hàng #002',
    description: '456 Lê Lợi, Q.1',
    latitude: 10.7731,
    longitude: 106.6989,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Đơn hàng #003',
    description: '789 Pasteur, Q.3',
    latitude: 10.7809,
    longitude: 106.6959,
    status: 'pending',
  },
];

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [deliveryPoints] = useState<DeliveryPoint[]>(SAMPLE_DELIVERY_POINTS);
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{distance: string; duration: string} | null>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Yêu cầu quyền truy cập vị trí
  const requestLocationPermission = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập vị trí');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const {latitude, longitude} = location.coords;
      setCurrentLocation({latitude, longitude});

      // Di chuyển camera đến vị trí hiện tại
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          1000
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    }
  };

  // Bật/tắt theo dõi vị trí
  const toggleTracking = async () => {
    if (isTracking) {
      // Tắt theo dõi
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      setIsTracking(false);
    } else {
      // Bật theo dõi
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            const {latitude, longitude} = location.coords;
            setCurrentLocation({latitude, longitude});
          }
        );
        locationSubscription.current = subscription;
        setIsTracking(true);
      } catch (error) {
        console.error('Watch position error:', error);
        Alert.alert('Lỗi', 'Không thể theo dõi vị trí');
      }
    }
  };

  // Chọn điểm giao hàng và vẽ đường đi
  const handleMarkerPress = async (point: DeliveryPoint) => {
    if (!currentLocation) {
      Alert.alert('Lỗi', 'Vui lòng bật vị trí hiện tại trước');
      return;
    }

    setSelectedPoint(point);
    setLoading(true);

    try {
      const result = await getDirections(currentLocation, {
        latitude: point.latitude,
        longitude: point.longitude,
      });

      if (result) {
        setRouteCoordinates(result.coordinates);
        setRouteInfo({distance: result.distance, duration: result.duration});

        // Fit camera để hiển thị toàn bộ route
        if (mapRef.current && result.coordinates.length > 0) {
          mapRef.current.fitToCoordinates(result.coordinates, {
            edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
            animated: true,
          });
        }
      } else {
        Alert.alert('Lỗi', 'Không thể tìm đường đi');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Lỗi', 'Có lỗi khi tìm đường đi');
    } finally {
      setLoading(false);
    }
  };

  // Xóa route hiện tại
  const clearRoute = () => {
    setSelectedPoint(null);
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  useEffect(() => {
    getCurrentLocation();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 10.7769,
          longitude: 106.7009,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}>
        {/* Vị trí hiện tại */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Vị trí của bạn"
            pinColor="blue"
          />
        )}

        {/* Các điểm giao hàng */}
        {deliveryPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{latitude: point.latitude, longitude: point.longitude}}
            title={point.title}
            description={point.description}
            onPress={() => handleMarkerPress(point)}
            pinColor={selectedPoint?.id === point.id ? 'green' : 'red'}
          />
        ))}

        {/* Đường đi */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0066FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Nút điều khiển */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isTracking && styles.buttonActive]}
          onPress={toggleTracking}>
          <Text style={styles.buttonText}>
            {isTracking ? '⏸ Dừng theo dõi' : '▶ Theo dõi vị trí'}
          </Text>
        </TouchableOpacity>

        {selectedPoint && (
          <TouchableOpacity style={styles.buttonSecondary} onPress={clearRoute}>
            <Text style={styles.buttonText}>✕ Xóa tuyến đường</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thông tin route */}
      {routeInfo && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeInfoTitle}>{selectedPoint?.title}</Text>
          <Text style={styles.routeInfoText}>📍 {selectedPoint?.description}</Text>
          <Text style={styles.routeInfoText}>
            🚗 {routeInfo.distance} • ⏱ {routeInfo.duration}
          </Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Đang tìm đường...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#0066FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonActive: {
    backgroundColor: '#FF6B00',
  },
  buttonSecondary: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
});
