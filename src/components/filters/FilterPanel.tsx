import { useState } from 'react';
import { Filters } from '@/types/restaurant';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { DEFAULT_FILTERS, DISTANCE_OPTIONS, RATING_OPTIONS } from '@/lib/constants';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  cuisineTypes: string[];
  resultCount: number;
}

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

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters({ ...DEFAULT_FILTERS });
    onApplyFilters({ ...DEFAULT_FILTERS });
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
                  onClick={() => setLocalFilters({ ...localFilters, maxDistance: option.value })}
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
                  onClick={() => setLocalFilters({ ...localFilters, minRating: option.value })}
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
