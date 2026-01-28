export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  latitude: number;
  longitude: number;
  price_level: number;
  rating: number;
  opening_hours: Record<string, string>;
  phone_number: string | null;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Filters {
  cuisineTypes: string[];
  maxDistance: number;
  priceRange: number[];
  minRating: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
