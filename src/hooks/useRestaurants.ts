import { useQuery } from '@tanstack/react-query';
import { fetchAllRestaurants } from '@/services/restaurant.service';

export const RESTAURANTS_QUERY_KEY = ['restaurants'] as const;

export function useRestaurants() {
  return useQuery({
    queryKey: RESTAURANTS_QUERY_KEY,
    queryFn: fetchAllRestaurants,
  });
}
