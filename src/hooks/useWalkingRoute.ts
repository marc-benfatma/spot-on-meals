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
      // OSRM API for walking directions
      const url = `https://router.project-osrm.org/route/v1/foot/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const routeData = data.routes[0];
      const coordinates: [number, number][] = routeData.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng] for Leaflet
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

export function formatWalkingTime(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

export function formatWalkingDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
