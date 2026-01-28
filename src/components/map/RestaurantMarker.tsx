import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Restaurant } from '@/types/restaurant';
import { Star, MapPin } from 'lucide-react';

interface RestaurantMarkerProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

const restaurantIcon = L.divIcon({
  className: 'restaurant-marker',
  html: `<div class="restaurant-marker">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function RestaurantMarker({ restaurant, onSelect }: RestaurantMarkerProps) {
  const priceLevel = '$'.repeat(restaurant.price_level);

  return (
    <Marker
      position={[restaurant.latitude, restaurant.longitude]}
      icon={restaurantIcon}
      eventHandlers={{
        click: () => onSelect(restaurant),
      }}
    >
      <Popup>
        <div className="min-w-[180px] p-1">
          <h3 className="font-semibold text-foreground text-sm mb-1">{restaurant.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{restaurant.cuisine_type}</span>
            <span className="text-primary font-medium">{priceLevel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{restaurant.rating}</span>
          </div>
          <button
            onClick={() => onSelect(restaurant)}
            className="mt-2 w-full text-xs bg-primary text-primary-foreground py-1.5 px-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
