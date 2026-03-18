export interface RouteData {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  distance: number;
  duration: number;
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

/**
 * Fetch a walking route between two points using OSRM.
 */
export async function fetchWalkingRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<RouteData> {
  const url = `https://router.project-osrm.org/route/v1/foot/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch route');

  const data: OsrmResponse = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found');

  const route = data.routes[0];
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]],
  );

  return {
    coordinates,
    distance: route.distance,
    duration: route.duration,
  };
}
