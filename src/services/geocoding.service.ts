export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Search for addresses using OpenStreetMap Nominatim API.
 */
export async function searchAddress(query: string, limit = 5): Promise<GeocodingResult[]> {
  if (query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`,
    { headers: { 'Accept-Language': 'fr' } }
  );

  return res.json();
}
