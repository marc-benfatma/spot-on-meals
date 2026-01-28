import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { RestaurantForm } from '@/components/admin/RestaurantForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, LogOut, MapPin, Star, ArrowLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Admin() {
  const { user, signOut } = useAuth();
  const { data: restaurants = [], isLoading } = useRestaurants();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
        // Update existing
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
        // Create new - ensure required fields are present
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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Restaurant Admin</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingRestaurant(restaurant)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Restaurant Form Sheet */}
      <RestaurantForm
        restaurant={editingRestaurant}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        isLoading={isSaving}
      />

      {/* Delete Confirmation */}
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
    </div>
  );
}
