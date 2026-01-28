import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
  position: [number, number];
}

const userIcon = L.divIcon({
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function UserLocationMarker({ position }: UserLocationMarkerProps) {
  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <span className="font-medium">You are here</span>
      </Popup>
    </Marker>
  );
}
