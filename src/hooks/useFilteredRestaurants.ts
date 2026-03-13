import { useMemo } from 'react';
import { Restaurant, Filters, UserLocation } from '@/types/restaurant';
import { getDistanceFromUser } from '@/lib/distance';

interface UseFilteredRestaurantsOptions {
  restaurants: Restaurant[];
  filters: Filters;
  searchQuery: string;
  userLocation: UserLocation | null;
}

export function useFilteredRestaurants({
  restaurants,
  filters,
  searchQuery,
  userLocation,
}: UseFilteredRestaurantsOptions): Restaurant[] {
  const filtered = useMemo(() => {
    return restaurants.filter((restaurant) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.cuisine_type.toLowerCase().includes(query) ||
          restaurant.address.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.cuisineTypes.length > 0 && !filters.cuisineTypes.includes(restaurant.cuisine_type)) {
        return false;
      }

      if (filters.priceRange.length > 0 && !filters.priceRange.includes(restaurant.price_level)) {
        return false;
      }

      if (filters.minRating > 0 && restaurant.rating < filters.minRating) {
        return false;
      }

      if (userLocation) {
        const distance = getDistanceFromUser(userLocation, restaurant.latitude, restaurant.longitude);
        if (distance !== null && distance > filters.maxDistance) return false;
      }

      return true;
    });
  }, [restaurants, searchQuery, filters, userLocation]);

  // Sort by distance if location available
  return useMemo(() => {
    if (!userLocation) return filtered;
    return [...filtered].sort((a, b) => {
      const distA = getDistanceFromUser(userLocation, a.latitude, a.longitude) || Infinity;
      const distB = getDistanceFromUser(userLocation, b.latitude, b.longitude) || Infinity;
      return distA - distB;
    });
  }, [filtered, userLocation]);
}
