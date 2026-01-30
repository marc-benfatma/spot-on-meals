import { useState } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { RestaurantForm } from '@/components/admin/RestaurantForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, MapPin, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRestaurants() {
  const { isAdmin } = useAuth();
  const { data: restaurants = [], isLoading } = useRestaurants();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingRestaurant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRestaurant) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', deletingRestaurant.id);

      if (error) throw error;

      toast({
        title: 'Restaurant deleted',
        description: `${deletingRestaurant.name} has been removed.`,
      });

      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
    } finally {
      setDeletingRestaurant(null);
    }
  };

  const handleSave = async (data: Partial<Restaurant>) => {
    setIsSaving(true);

    try {
      if (editingRestaurant) {
        const { error } = await supabase
          .from('restaurants')
          .update(data)
          .eq('id', editingRestaurant.id);

        if (error) throw error;

        toast({
          title: 'Restaurant updated',
          description: `${data.name} has been updated.`,
        });
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
        
        const { error } = await supabase
          .from('restaurants')
          .insert([insertData]);

        if (error) throw error;

        toast({
          title: 'Restaurant added',
          description: `${data.name} has been created.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save restaurant',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant listings</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading restaurants...
            </div>
          ) : restaurants.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No restaurants yet</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Restaurant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cuisine</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{restaurant.cuisine_type}</TableCell>
                    <TableCell>{'$'.repeat(restaurant.price_level)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {restaurant.rating}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {restaurant.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(restaurant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* Only show delete button for admins */}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingRestaurant(restaurant)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Form Sheet */}
      <RestaurantForm
        restaurant={editingRestaurant}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        isLoading={isSaving}
      />

      {/* Delete Confirmation - Only for admins */}
      {isAdmin && (
        <AlertDialog open={!!deletingRestaurant} onOpenChange={() => setDeletingRestaurant(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingRestaurant?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
