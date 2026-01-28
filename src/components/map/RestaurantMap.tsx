import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant, UserLocation } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Navigation, Plus, Minus } from 'lucide-react';
import { RouteData } from '@/hooks/useWalkingRoute';
import { RouteInfo } from './RouteInfo';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const userIcon = L.divIcon({
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const restaurantIcon = L.divIcon({
  className: 'restaurant-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:hsl(160 60% 40%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);color:white;font-size:14px;">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface RestaurantMapProps {
  userLocation: UserLocation | null;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  route: RouteData | null;
  routeRestaurantName: string | null;
  onClearRoute: () => void;
}

export function RestaurantMap({
  userLocation,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  route,
  routeRestaurantName,
  onClearRoute,
}: RestaurantMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Default to Paris if no user location
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation) {
      const pos: [number, number] = [userLocation.latitude, userLocation.longitude];
      
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(pos);
      } else {
        userMarkerRef.current = L.marker(pos, { icon: userIcon })
          .addTo(mapRef.current)
          .bindPopup('<span style="font-weight:500;">You are here</span>');
      }

      // Center on user location initially
      mapRef.current.setView(pos, 14);
    }
  }, [userLocation]);

  // Update restaurant markers
  useEffect(() => {
    if (!mapRef.current) return;

    const currentMarkers = restaurantMarkersRef.current;
    const restaurantIds = new Set(restaurants.map(r => r.id));

    // Remove markers that are no longer in the list
    currentMarkers.forEach((marker, id) => {
      if (!restaurantIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    restaurants.forEach((restaurant) => {
      const pos: [number, number] = [restaurant.latitude, restaurant.longitude];
      const priceLevel = '$'.repeat(restaurant.price_level);

      if (currentMarkers.has(restaurant.id)) {
        currentMarkers.get(restaurant.id)!.setLatLng(pos);
      } else {
        const marker = L.marker(pos, { icon: restaurantIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width:180px;padding:4px;">
              <h3 style="font-weight:600;font-size:14px;margin-bottom:4px;">${restaurant.name}</h3>
              <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#666;margin-bottom:4px;">
                <span>${restaurant.cuisine_type}</span>
                <span style="color:hsl(160 60% 40%);font-weight:500;">${priceLevel}</span>
              </div>
              <div style="display:flex;align-items:center;gap:4px;font-size:12px;">
                <span style="color:#facc15;">★</span>
                <span style="font-weight:500;">${restaurant.rating}</span>
              </div>
            </div>
          `);

        marker.on('click', () => {
          onSelectRestaurant(restaurant);
        });

        currentMarkers.set(restaurant.id, marker);
      }
    });
  }, [restaurants, onSelectRestaurant]);

  // Fly to selected restaurant
  useEffect(() => {
    if (!mapRef.current || !selectedRestaurant) return;
    mapRef.current.flyTo(
      [selectedRestaurant.latitude, selectedRestaurant.longitude],
      16,
      { duration: 0.8 }
    );
  }, [selectedRestaurant]);

  // Display route on map
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Add new route if available
    if (route && route.coordinates.length > 0) {
      routeLayerRef.current = L.polyline(route.coordinates, {
        color: 'hsl(160, 60%, 40%)',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Fit map to show entire route
      const bounds = routeLayerRef.current.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 1 });
    }
  }, [userLocation]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Map Controls */}
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

      {/* Route Info */}
      {route && routeRestaurantName && (
        <RouteInfo
          route={route}
          restaurantName={routeRestaurantName}
          onClose={onClearRoute}
        />
      )}
    </div>
  );
}
