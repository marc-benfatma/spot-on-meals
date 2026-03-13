import { UserLocation } from '@/types/restaurant';

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * @deprecated Use formatDistance from '@/lib/format' instead
 */
export { formatDistance } from '@/lib/format';

/**
 * Calculate distance from user location to a point
 */
export function getDistanceFromUser(
  userLocation: UserLocation | null,
  latitude: number,
  longitude: number,
): number | null {
  if (!userLocation) return null;
  return calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    latitude,
    longitude,
  );
}
