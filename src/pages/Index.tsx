import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant, Filters, UserLocation } from '@/types/restaurant';
import { RestaurantMap } from '@/components/map/RestaurantMap';
import { BottomSheet } from '@/components/BottomSheet';
import { RestaurantDetail } from '@/components/restaurant/RestaurantDetail';
import { LocationPermission } from '@/components/LocationPermission';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useWalkingRoute } from '@/hooks/useWalkingRoute';
import { getDistanceFromUser } from '@/lib/distance';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

const defaultFilters: Filters = {
  cuisineTypes: [],
  maxDistance: 10,
  priceRange: [],
  minRating: 0,
};

const Index = () => {
  const navigate = useNavigate();
  const { location, error: locationError, isLoading: locationLoading, refetch: refetchLocation } = useUserLocation();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { route, isLoading: routeLoading, fetchRoute, clearRoute } = useWalkingRoute(location);
  
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeRestaurantName, setRouteRestaurantName] = useState<string | null>(null);

  // Filter restaurants based on search and filters
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.cuisine_type.toLowerCase().includes(query) ||
          restaurant.address.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Cuisine type filter
      if (filters.cuisineTypes.length > 0) {
        if (!filters.cuisineTypes.includes(restaurant.cuisine_type)) return false;
      }

      // Price range filter
      if (filters.priceRange.length > 0) {
        if (!filters.priceRange.includes(restaurant.price_level)) return false;
      }

      // Rating filter
      if (filters.minRating > 0) {
        if (restaurant.rating < filters.minRating) return false;
      }

      // Distance filter
      if (location) {
        const distance = getDistanceFromUser(location, restaurant.latitude, restaurant.longitude);
        if (distance !== null && distance > filters.maxDistance) return false;
      }

      return true;
    });
  }, [restaurants, searchQuery, filters, location]);

  // Sort by distance if location available
  const sortedRestaurants = useMemo(() => {
    if (!location) return filteredRestaurants;
    return [...filteredRestaurants].sort((a, b) => {
      const distA = getDistanceFromUser(location, a.latitude, a.longitude) || Infinity;
      const distB = getDistanceFromUser(location, b.latitude, b.longitude) || Infinity;
      return distA - distB;
    });
  }, [filteredRestaurants, location]);

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

  // Show location permission screen if still loading or has error
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
      {/* Admin Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigate('/admin')}
        className="absolute left-4 top-4 z-[1000] h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Map */}
      <RestaurantMap
        userLocation={location}
        restaurants={sortedRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        route={route}
        routeRestaurantName={routeRestaurantName}
        onClearRoute={handleClearRoute}
      />

      {/* Bottom Sheet */}
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

      {/* Restaurant Detail Sheet */}
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
