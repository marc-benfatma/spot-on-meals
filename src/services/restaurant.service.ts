import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';

/**
 * Fetch all restaurants ordered by rating (descending).
 */
export async function fetchAllRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('rating', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Restaurant[];
}

/**
 * Create a new restaurant.
 */
export async function createRestaurant(data: Partial<Restaurant>): Promise<void> {
  const insertData = {
    name: data.name!,
    address: data.address!,
    cuisine_type: data.cuisine_type!,
    latitude: data.latitude!,
    longitude: data.longitude!,
    price_level: data.price_level!,
    rating: data.rating!,
    phone_number: data.phone_number,
    photo_urls: data.photo_urls,
    opening_hours: data.opening_hours,
  };

  const { error } = await supabase.from('restaurants').insert([insertData]);
  if (error) throw error;
}

/**
 * Update an existing restaurant by ID.
 */
export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete a restaurant by ID.
 */
export async function deleteRestaurant(id: string): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
