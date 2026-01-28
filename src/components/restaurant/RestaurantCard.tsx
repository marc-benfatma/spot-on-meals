import { Restaurant, UserLocation } from '@/types/restaurant';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Phone } from 'lucide-react';
import { formatDistance, getDistanceFromUser } from '@/lib/distance';

interface RestaurantCardProps {
  restaurant: Restaurant;
  userLocation: UserLocation | null;
  onSelect: (restaurant: Restaurant) => void;
  isSelected?: boolean;
}

export function RestaurantCard({
  restaurant,
  userLocation,
  onSelect,
  isSelected = false,
}: RestaurantCardProps) {
  const distance = getDistanceFromUser(
    userLocation,
    restaurant.latitude,
    restaurant.longitude
  );
  const priceLevel = '$'.repeat(restaurant.price_level);

  return (
    <Card
      onClick={() => onSelect(restaurant)}
      className={`flex gap-3 p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-accent/50' : ''
      }`}
    >
      {/* Restaurant Image */}
      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {restaurant.photo_urls[0] ? (
          <img
            src={restaurant.photo_urls[0]}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">{restaurant.cuisine_type}</span>
          <span className="text-sm font-medium text-primary">{priceLevel}</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
          
          {distance !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-sm">{formatDistance(distance)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
