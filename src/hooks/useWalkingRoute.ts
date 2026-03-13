import { useState, useCallback } from 'react';
import { UserLocation } from '@/types/restaurant';

export interface RouteData {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

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
      const url = `https://router.project-osrm.org/route/v1/foot/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch route');

      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found');

      const routeData = data.routes[0];
      const coordinates: [number, number][] = routeData.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]],
      );

      setRoute({
        coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
      });
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
