import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Restaurant, UserLocation } from '@/types/restaurant';
import { UserLocationMarker } from './UserLocationMarker';
import { RestaurantMarker } from './RestaurantMarker';
import { Button } from '@/components/ui/button';
import { Navigation, Plus, Minus } from 'lucide-react';

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

// Internal component that uses useMap - must be child of MapContainer
function MapController({ 
  center, 
  selectedRestaurant,
  userLocation 
}: { 
  center: [number, number]; 
  selectedRestaurant: Restaurant | null;
  userLocation: [number, number] | null;
}) {
  const map = useMap();
  const initialCenterRef = useRef(false);

  // Initial centering
  useEffect(() => {
    if (!initialCenterRef.current && center) {
      map.setView(center, 14);
      initialCenterRef.current = true;
    }
  }, [center, map]);

  // Fly to selected restaurant
  useEffect(() => {
    if (selectedRestaurant) {
      map.flyTo([selectedRestaurant.latitude, selectedRestaurant.longitude], 16, { duration: 0.8 });
    }
  }, [selectedRestaurant, map]);

  const handleRecenter = () => {
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomIn}
        className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomOut}
        className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent"
      >
        <Minus className="h-5 w-5" />
      </Button>
      {userLocation && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent mt-2"
        >
          <Navigation className="h-5 w-5 text-primary" />
        </Button>
      )}
    </div>
  );
}

export function RestaurantMap({
  userLocation,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: RestaurantMapProps) {
  const [mapReady, setMapReady] = useState(false);
  
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
      whenReady={() => setMapReady(true)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {mapReady && (
        <>
          <MapController 
            center={center} 
            selectedRestaurant={selectedRestaurant}
            userLocation={userPosition}
          />
          
          {userPosition && <UserLocationMarker position={userPosition} />}
          
          {restaurants.map((restaurant) => (
            <RestaurantMarker
              key={restaurant.id}
              restaurant={restaurant}
              onSelect={onSelectRestaurant}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}
