import { useState, useCallback } from 'react';
import { UserLocation } from '@/types/restaurant';
import { fetchWalkingRoute, RouteData } from '@/services/routing.service';

export type { RouteData } from '@/services/routing.service';

interface UseWalkingRouteReturn {
  route: RouteData | null;
  isLoading: boolean;
  error: string | null;
  fetchRoute: (destination: { latitude: number; longitude: number }) => Promise<void>;
  clearRoute: () => void;
}

export function useWalkingRoute(userLocation: UserLocation | null): UseWalkingRouteReturn {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async (destination: { latitude: number; longitude: number }) => {
    if (!userLocation) {
      setError('User location not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const routeData = await fetchWalkingRoute(userLocation, destination);
      setRoute(routeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
      setRoute(null);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, isLoading, error, fetchRoute, clearRoute };
}
