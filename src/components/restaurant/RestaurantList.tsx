import { Restaurant, UserLocation } from '@/types/restaurant';
import { RestaurantCard } from './RestaurantCard';
import { Loader2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface RestaurantListProps {
  restaurants: Restaurant[];
  userLocation: UserLocation | null;
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  isLoading?: boolean;
}

export function RestaurantList({
  restaurants,
  userLocation,
  selectedRestaurant,
  onSelectRestaurant,
  isLoading = false,
}: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading restaurants...</span>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No restaurants found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          userLocation={userLocation}
          onSelect={onSelectRestaurant}
          isSelected={selectedRestaurant?.id === restaurant.id}
        />
      ))}
    </div>
  );
}
