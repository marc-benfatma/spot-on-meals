import { Restaurant, UserLocation } from '@/types/restaurant';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Clock, X, Navigation } from 'lucide-react';
import { formatDistance, getDistanceFromUser } from '@/lib/distance';
import { formatPriceLevel } from '@/lib/format';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface RestaurantDetailProps {
  restaurant: Restaurant | null;
  userLocation: UserLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onGetDirections: (restaurant: Restaurant) => void;
  isLoadingRoute?: boolean;
}

export function RestaurantDetail({
  restaurant,
  userLocation,
  isOpen,
  onClose,
  onGetDirections,
  isLoadingRoute = false,
}: RestaurantDetailProps) {
  if (!restaurant) return null;

  const distance = getDistanceFromUser(userLocation, restaurant.latitude, restaurant.longitude);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = restaurant.opening_hours[today] || 'Closed';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="overflow-y-auto h-full">
          {/* Header Image */}
          <div className="relative h-48 bg-muted">
            {restaurant.photo_urls[0] ? (
              <img src={restaurant.photo_urls[0]} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
            )}
            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-5">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold">{restaurant.name}</SheetTitle>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{restaurant.cuisine_type}</span>
                <span className="text-primary font-semibold">{formatPriceLevel(restaurant.price_level)}</span>
              </div>
            </SheetHeader>

            {/* Rating, Distance & Directions */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              {distance !== null && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{formatDistance(distance)} away</span>
                </div>
              )}
              <Button
                onClick={() => onGetDirections(restaurant)}
                className="w-full h-12 text-base font-semibold"
                size="lg"
                disabled={isLoadingRoute}
              >
                <Navigation className="h-5 w-5 mr-2" />
                {isLoadingRoute ? 'Loading route...' : 'Show Walking Route'}
              </Button>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-muted-foreground">{restaurant.address}</p>
              </div>
            </div>

            {/* Phone */}
            {restaurant.phone_number && (
              <div className="flex items-start gap-3 mb-4">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href={`tel:${restaurant.phone_number}`} className="text-primary hover:underline">
                    {restaurant.phone_number}
                  </a>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            <div className="flex items-start gap-3 mb-6">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-2">Opening Hours</p>
                <div className="space-y-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const hours = restaurant.opening_hours[day] || 'Closed';
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={`flex justify-between text-sm ${
                          isToday ? 'font-medium text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
