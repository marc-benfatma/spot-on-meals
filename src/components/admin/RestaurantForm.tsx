import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { MapPicker } from './MapPicker';
import { Loader2 } from 'lucide-react';

interface RestaurantFormProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Restaurant>) => Promise<void>;
  isLoading: boolean;
}

const CUISINE_TYPES = [
  'Italian', 'French', 'Japanese', 'Chinese', 'Mexican', 
  'Indian', 'Thai', 'American', 'Mediterranean', 'Other'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function RestaurantForm({
  restaurant,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: RestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cuisine_type: 'Italian',
    latitude: 48.8566,
    longitude: 2.3522,
    price_level: 2,
    rating: 4.0,
    phone_number: '',
    photo_urls: [''],
    opening_hours: {} as Record<string, string>,
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        cuisine_type: restaurant.cuisine_type,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        price_level: restaurant.price_level,
        rating: restaurant.rating,
        phone_number: restaurant.phone_number || '',
        photo_urls: restaurant.photo_urls.length > 0 ? restaurant.photo_urls : [''],
        opening_hours: restaurant.opening_hours,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        cuisine_type: 'Italian',
        latitude: 48.8566,
        longitude: 2.3522,
        price_level: 2,
        rating: 4.0,
        phone_number: '',
        photo_urls: [''],
        opening_hours: {},
      });
    }
  }, [restaurant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhotoUrls = formData.photo_urls.filter(url => url.trim() !== '');
    await onSave({
      ...formData,
      photo_urls: cleanedPhotoUrls,
    });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: { ...prev.opening_hours, [day]: value },
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          {/* Cuisine Type */}
          <div className="space-y-2">
            <Label>Cuisine Type *</Label>
            <Select
              value={formData.cuisine_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUISINE_TYPES.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Level */}
          <div className="space-y-2">
            <Label>Price Level *</Label>
            <Select
              value={formData.price_level.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, price_level: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">$ - Budget</SelectItem>
                <SelectItem value="2">$$ - Moderate</SelectItem>
                <SelectItem value="3">$$$ - Expensive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5) *</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={formData.photo_urls[0] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, photo_urls: [e.target.value] }))}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Location Picker */}
          <div className="space-y-2">
            <Label>Location *</Label>
            <MapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
            />
          </div>

          {/* Opening Hours */}
          <div className="space-y-2">
            <Label>Opening Hours</Label>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="w-24 text-sm capitalize">{day}</span>
                  <Input
                    value={formData.opening_hours[day] || ''}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    placeholder="e.g., 11:00-22:00 or closed"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {restaurant ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
