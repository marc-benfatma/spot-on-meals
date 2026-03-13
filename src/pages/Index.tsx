import { useState } from 'react';
import { Restaurant, Filters } from '@/types/restaurant';
import { RestaurantMap } from '@/components/map/RestaurantMap';
import { BottomSheet } from '@/components/BottomSheet';
import { RestaurantDetail } from '@/components/restaurant/RestaurantDetail';
import { LocationPermission } from '@/components/LocationPermission';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useWalkingRoute } from '@/hooks/useWalkingRoute';
import { useFilteredRestaurants } from '@/hooks/useFilteredRestaurants';
import { DEFAULT_FILTERS } from '@/lib/constants';
import { toast } from 'sonner';

const Index = () => {
  const { location, error: locationError, isLoading: locationLoading, refetch: refetchLocation } = useUserLocation();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { route, isLoading: routeLoading, fetchRoute, clearRoute } = useWalkingRoute(location);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeRestaurantName, setRouteRestaurantName] = useState<string | null>(null);

  const sortedRestaurants = useFilteredRestaurants({
    restaurants,
    filters,
    searchQuery,
    userLocation: location,
  });

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailOpen(true);
  };

  const handleGetDirections = async (restaurant: Restaurant) => {
    if (!location) {
      toast.error('Location not available');
      return;
    }
    setDetailOpen(false);
    setRouteRestaurantName(restaurant.name);
    try {
      await fetchRoute({ latitude: restaurant.latitude, longitude: restaurant.longitude });
    } catch {
      toast.error('Failed to get walking directions');
    }
  };

  const handleClearRoute = () => {
    clearRoute();
    setRouteRestaurantName(null);
  };

  if (locationLoading || locationError) {
    return (
      <LocationPermission
        isLoading={locationLoading}
        error={locationError}
        onRetry={refetchLocation}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <RestaurantMap
        userLocation={location}
        restaurants={sortedRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        route={route}
        routeRestaurantName={routeRestaurantName}
        onClearRoute={handleClearRoute}
      />

      <BottomSheet
        restaurants={sortedRestaurants}
        userLocation={location}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        filters={filters}
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={restaurantsLoading}
      />

      <RestaurantDetail
        restaurant={selectedRestaurant}
        userLocation={location}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onGetDirections={handleGetDirections}
        isLoadingRoute={routeLoading}
      />
    </div>
  );
};

export default Index;
