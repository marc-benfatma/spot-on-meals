import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Restaurant, UserLocation } from '@/types/restaurant';
import { UserLocationMarker } from './UserLocationMarker';
import { RestaurantMarker } from './RestaurantMarker';
import { MapControls } from './MapControls';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RestaurantMapProps {
  userLocation: UserLocation | null;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const initialCenterRef = useRef(false);

  useEffect(() => {
    if (!initialCenterRef.current && center) {
      map.setView(center, zoom);
      initialCenterRef.current = true;
    }
  }, [center, zoom, map]);

  return null;
}

function FlyToRestaurant({ restaurant }: { restaurant: Restaurant | null }) {
  const map = useMap();

  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.latitude, restaurant.longitude], 16, { duration: 0.8 });
    }
  }, [restaurant, map]);

  return null;
}

export function RestaurantMap({
  userLocation,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: RestaurantMapProps) {
  // Default to Paris if no user location
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  const userPosition: [number, number] | null = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : null;

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} zoom={14} />
      <FlyToRestaurant restaurant={selectedRestaurant} />
      <MapControls userLocation={userPosition} />
      
      {userPosition && <UserLocationMarker position={userPosition} />}
      
      {restaurants.map((restaurant) => (
        <RestaurantMarker
          key={restaurant.id}
          restaurant={restaurant}
          onSelect={onSelectRestaurant}
        />
      ))}
    </MapContainer>
  );
}
