export interface AreaCoordinate {
  lat: number;
  lng: number;
}

export interface Area {
  id: number;
  value: number;
  label: string;
  center_latitude: string | null;
  center_longitude: string | null;
  coordinates: AreaCoordinate[];
}
