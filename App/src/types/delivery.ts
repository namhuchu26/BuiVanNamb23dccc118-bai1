export interface DeliveryPoint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'completed';
}
