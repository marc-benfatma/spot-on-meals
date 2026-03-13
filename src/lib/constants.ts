import { Filters } from '@/types/restaurant';

export const DEFAULT_FILTERS: Filters = {
  cuisineTypes: [],
  maxDistance: 10,
  priceRange: [],
  minRating: 0,
};

export const DEFAULT_COORDINATES: { latitude: number; longitude: number } = {
  latitude: 48.8566,
  longitude: 2.3522,
};

export const CUISINE_TYPES = [
  'Italian', 'French', 'Japanese', 'Chinese', 'Mexican',
  'Indian', 'Thai', 'American', 'Mediterranean', 'Other',
] as const;

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const;

export const DISTANCE_OPTIONS = [
  { value: 0.5, label: '500m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
] as const;

export const RATING_OPTIONS = [
  { value: 0, label: 'All' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
] as const;
