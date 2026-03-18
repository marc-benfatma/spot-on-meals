import { useState, useRef } from 'react';
import { Restaurant, UserLocation, Filters } from '@/types/restaurant';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RestaurantList } from '@/components/restaurant/RestaurantList';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

interface BottomSheetProps {
  restaurants: Restaurant[];
  userLocation: UserLocation | null;
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

type SheetPosition = 'collapsed' | 'half' | 'full';

export function BottomSheet({
  restaurants,
  userLocation,
  selectedRestaurant,
  onSelectRestaurant,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  isLoading = false,
}: BottomSheetProps) {
  const [position, setPosition] = useState<SheetPosition>('collapsed');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // Get unique cuisine types from restaurants
  const cuisineTypes = [...new Set(restaurants.map((r) => r.cuisine_type))];

  const getHeight = () => {
    switch (position) {
      case 'collapsed':
        return 'h-32';
      case 'half':
        return 'h-[50vh]';
      case 'full':
        return 'h-[85vh]';
    }
  };

  const togglePosition = () => {
    if (position === 'collapsed') setPosition('half');
    else if (position === 'half') setPosition('full');
    else setPosition('collapsed');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = startYRef.current - currentYRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped up
        if (position === 'collapsed') setPosition('half');
        else if (position === 'half') setPosition('full');
      } else {
        // Swiped down
        if (position === 'full') setPosition('half');
        else if (position === 'half') setPosition('collapsed');
      }
    }
  };

  const activeFiltersCount =
    filters.cuisineTypes.length +
    (filters.priceRange.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistance < 10 ? 1 : 0);

  return (
    <>
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl border-t transition-all duration-300 z-[1000] ${getHeight()}`}
      >
        {/* Handle */}
        <div
          className="flex flex-col items-center pt-2 pb-3 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={togglePosition}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            {position === 'full' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            <span className="text-xs">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} nearby
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 pb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 rounded-full bg-muted border-none"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full relative"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Restaurant List */}
        {(position === 'half' || position === 'full') && (
          <div className="px-4 overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
            <RestaurantList
              restaurants={restaurants}
              userLocation={userLocation}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={onSelectRestaurant}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={onFiltersChange}
        cuisineTypes={cuisineTypes}
        resultCount={restaurants.length}
      />
    </>
  );
}
