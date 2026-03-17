import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Restaurant } from '@/types/restaurant';
import { createRestaurant, updateRestaurant, deleteRestaurant } from '@/services/restaurant.service';
import { RESTAURANTS_QUERY_KEY } from './useRestaurants';
import { useToast } from '@/hooks/use-toast';

export function useRestaurantCrud() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async ({ data, existingId }: { data: Partial<Restaurant>; existingId?: string }) => {
      if (existingId) {
        await updateRestaurant(existingId, data);
      } else {
        await createRestaurant(data);
      }
      return { name: data.name, isUpdate: !!existingId };
    },
    onSuccess: ({ name, isUpdate }) => {
      queryClient.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEY });
      toast({
        title: isUpdate ? 'Restaurant updated' : 'Restaurant added',
        description: `${name} has been ${isUpdate ? 'updated' : 'created'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save restaurant',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      await deleteRestaurant(restaurant.id);
      return restaurant.name;
    },
    onSuccess: (name) => {
      queryClient.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEY });
      toast({
        title: 'Restaurant deleted',
        description: `${name} has been removed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
    },
  });

  const saveRestaurant = async (data: Partial<Restaurant>, existingId?: string): Promise<boolean> => {
    try {
      await saveMutation.mutateAsync({ data, existingId });
      return true;
    } catch {
      return false;
    }
  };

  const removeRestaurant = async (restaurant: Restaurant): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(restaurant);
      return true;
    } catch {
      return false;
    }
  };

  return {
    saveRestaurant,
    deleteRestaurant: removeRestaurant,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
