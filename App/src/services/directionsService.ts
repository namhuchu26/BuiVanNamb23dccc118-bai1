export interface Location {
  latitude: number;
  longitude: number;
}

export interface DirectionsResult {
  coordinates: Location[];
  distance: string;
  duration: string;
}

/**
 * Tạo đường đi đơn giản (đường thẳng) giữa 2 điểm
 * Không cần API Key, chỉ vẽ đường thẳng
 */
const createStraightLine = (origin: Location, destination: Location): Location[] => {
  const steps = 50; // Số điểm trung gian
  const latStep = (destination.latitude - origin.latitude) / steps;
  const lngStep = (destination.longitude - origin.longitude) / steps;
  
  const coordinates: Location[] = [];
  for (let i = 0; i <= steps; i++) {
    coordinates.push({
      latitude: origin.latitude + (latStep * i),
      longitude: origin.longitude + (lngStep * i),
    });
  }
  return coordinates;
};

/**
 * Tính khoảng cách theo công thức Haversine
 */
const calculateDistance = (origin: Location, destination: Location): number => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
  const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.latitude * Math.PI / 180) * 
    Math.cos(destination.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Lấy đường đi đơn giản (không cần Google API)
 */
export const getDirections = async (
  origin: Location,
  destination: Location
): Promise<DirectionsResult | null> => {
  try {
    // Tạo đường đi đơn giản
    const coordinates = createStraightLine(origin, destination);
    
    // Tính khoảng cách
    const distanceKm = calculateDistance(origin, destination);
    const distance = `${distanceKm.toFixed(2)} km`;
    
    // Ước tính thời gian (giả sử tốc độ trung bình 30 km/h)
    const durationMinutes = Math.round((distanceKm / 30) * 60);
    const duration = durationMinutes < 60 
      ? `${durationMinutes} phút` 
      : `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`;

    return {
      coordinates,
      distance,
      duration,
    };
  } catch (error) {
    console.error('Error calculating directions:', error);
    return null;
  }
};
