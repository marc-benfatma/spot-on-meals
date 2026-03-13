import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useRestaurantCrud() {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveRestaurant = async (data: Partial<Restaurant>, existingId?: string) => {
    setIsSaving(true);
    try {
      if (existingId) {
        const { error } = await supabase
          .from('restaurants')
          .update(data)
          .eq('id', existingId);
        if (error) throw error;
        toast({ title: 'Restaurant updated', description: `${data.name} has been updated.` });
      } else {
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
        toast({ title: 'Restaurant added', description: `${data.name} has been created.` });
      }
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save restaurant',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRestaurant = async (restaurant: Restaurant) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id);
      if (error) throw error;
      toast({ title: 'Restaurant deleted', description: `${restaurant.name} has been removed.` });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { saveRestaurant, deleteRestaurant, isSaving };
}
