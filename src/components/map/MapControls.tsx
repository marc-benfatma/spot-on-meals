import { Button } from '@/components/ui/button';
import { Navigation, Plus, Minus } from 'lucide-react';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  userLocation: [number, number] | null;
}

export function MapControls({ userLocation }: MapControlsProps) {
  const map = useMap();

  const handleRecenter = () => {
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomIn}
        className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleZoomOut}
        className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent"
      >
        <Minus className="h-5 w-5" />
      </Button>
      {userLocation && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="h-10 w-10 rounded-full shadow-lg bg-card hover:bg-accent mt-2"
        >
          <Navigation className="h-5 w-5 text-primary" />
        </Button>
      )}
    </div>
  );
}
