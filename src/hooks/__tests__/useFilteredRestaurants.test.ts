import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredRestaurants } from '../useFilteredRestaurants';
import { Restaurant, Filters } from '@/types/restaurant';

const makeRestaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  id: '1',
  name: 'Le Bistrot',
  address: '10 Rue de Paris',
  cuisine_type: 'French',
  latitude: 48.8566,
  longitude: 2.3522,
  price_level: 2,
  rating: 4.2,
  opening_hours: {},
  phone_number: null,
  photo_urls: [],
  created_at: '',
  updated_at: '',
  ...overrides,
});

const defaultFilters: Filters = {
  cuisineTypes: [],
  maxDistance: 10,
  priceRange: [],
  minRating: 0,
};

describe('useFilteredRestaurants', () => {
  const restaurants: Restaurant[] = [
    makeRestaurant({ id: '1', name: 'Le Bistrot', cuisine_type: 'French', price_level: 2, rating: 4.5 }),
    makeRestaurant({ id: '2', name: 'Sakura', cuisine_type: 'Japanese', price_level: 3, rating: 4.0, address: '5 Rue Tokyo' }),
    makeRestaurant({ id: '3', name: 'Pizza Roma', cuisine_type: 'Italian', price_level: 1, rating: 3.5 }),
  ];

  it('returns all restaurants with no filters', () => {
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters: defaultFilters, searchQuery: '', userLocation: null })
    );
    expect(result.current).toHaveLength(3);
  });

  it('filters by search query on name', () => {
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters: defaultFilters, searchQuery: 'sakura', userLocation: null })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Sakura');
  });

  it('filters by search query on address', () => {
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters: defaultFilters, searchQuery: 'tokyo', userLocation: null })
    );
    expect(result.current).toHaveLength(1);
  });

  it('filters by cuisine type', () => {
    const filters = { ...defaultFilters, cuisineTypes: ['Italian'] };
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters, searchQuery: '', userLocation: null })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].cuisine_type).toBe('Italian');
  });

  it('filters by price range', () => {
    const filters = { ...defaultFilters, priceRange: [1, 2] };
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters, searchQuery: '', userLocation: null })
    );
    expect(result.current).toHaveLength(2);
  });

  it('filters by minimum rating', () => {
    const filters = { ...defaultFilters, minRating: 4.0 };
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters, searchQuery: '', userLocation: null })
    );
    expect(result.current).toHaveLength(2);
  });

  it('combines multiple filters', () => {
    const filters = { ...defaultFilters, cuisineTypes: ['French', 'Japanese'], minRating: 4.2 };
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters, searchQuery: '', userLocation: null })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Le Bistrot');
  });

  it('sorts by distance when user location provided', () => {
    const farRestaurant = makeRestaurant({ id: '4', name: 'Far Away', latitude: 49.0, longitude: 2.5 });
    const nearRestaurant = makeRestaurant({ id: '5', name: 'Close By', latitude: 48.857, longitude: 2.353 });
    const userLocation = { latitude: 48.8566, longitude: 2.3522 };

    const { result } = renderHook(() =>
      useFilteredRestaurants({
        restaurants: [farRestaurant, nearRestaurant],
        filters: defaultFilters,
        searchQuery: '',
        userLocation,
      })
    );
    expect(result.current[0].name).toBe('Close By');
    expect(result.current[1].name).toBe('Far Away');
  });

  it('filters by max distance', () => {
    const farRestaurant = makeRestaurant({ id: '4', name: 'Far Away', latitude: 49.5, longitude: 3.0 });
    const userLocation = { latitude: 48.8566, longitude: 2.3522 };
    const filters = { ...defaultFilters, maxDistance: 1 };

    const { result } = renderHook(() =>
      useFilteredRestaurants({
        restaurants: [restaurants[0], farRestaurant],
        filters,
        searchQuery: '',
        userLocation,
      })
    );
    expect(result.current).toHaveLength(1);
  });

  it('returns empty for no matches', () => {
    const { result } = renderHook(() =>
      useFilteredRestaurants({ restaurants, filters: defaultFilters, searchQuery: 'zzzzz', userLocation: null })
    );
    expect(result.current).toHaveLength(0);
  });
});
