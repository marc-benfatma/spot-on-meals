import { useState } from 'react';
import { Filters } from '@/types/restaurant';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  cuisineTypes: string[];
  resultCount: number;
}

const DISTANCE_OPTIONS = [
  { value: 0.5, label: '500m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'All' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  cuisineTypes,
  resultCount,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleCuisineToggle = (cuisine: string) => {
    const newCuisines = localFilters.cuisineTypes.includes(cuisine)
      ? localFilters.cuisineTypes.filter((c) => c !== cuisine)
      : [...localFilters.cuisineTypes, cuisine];
    setLocalFilters({ ...localFilters, cuisineTypes: newCuisines });
  };

  const handlePriceToggle = (values: string[]) => {
    setLocalFilters({ ...localFilters, priceRange: values.map(Number) });
  };

  const handleDistanceChange = (value: number) => {
    setLocalFilters({ ...localFilters, maxDistance: value });
  };

  const handleRatingChange = (value: number) => {
    setLocalFilters({ ...localFilters, minRating: value });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    const cleared: Filters = {
      cuisineTypes: [],
      maxDistance: 10,
      priceRange: [],
      minRating: 0,
    };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-24">
          {/* Cuisine Type */}
          <div>
            <h4 className="font-medium mb-3">Cuisine Type</h4>
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={localFilters.cuisineTypes.includes(cuisine) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => handleCuisineToggle(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <h4 className="font-medium mb-3">Maximum Distance</h4>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={localFilters.maxDistance === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => handleDistanceChange(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-medium mb-3">Price Range</h4>
            <ToggleGroup
              type="multiple"
              value={localFilters.priceRange.map(String)}
              onValueChange={handlePriceToggle}
              className="justify-start"
            >
              <ToggleGroupItem value="1" className="px-6">$</ToggleGroupItem>
              <ToggleGroupItem value="2" className="px-5">$$</ToggleGroupItem>
              <ToggleGroupItem value="3" className="px-4">$$$</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-medium mb-3">Minimum Rating</h4>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={localFilters.minRating === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 text-sm flex items-center gap-1"
                  onClick={() => handleRatingChange(option.value)}
                >
                  {option.value > 0 && <Star className="h-3 w-3 fill-current" />}
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
          <Button variant="outline" onClick={handleClearAll} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Show {resultCount} Results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
