export interface DeliveryPoint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Location {
  latitude: number;
  longitude: number;
}
