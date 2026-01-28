import { X, Footprints, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteData, formatWalkingTime, formatWalkingDistance } from '@/hooks/useWalkingRoute';

interface RouteInfoProps {
  route: RouteData;
  restaurantName: string;
  onClose: () => void;
}

export function RouteInfo({ route, restaurantName, onClose }: RouteInfoProps) {
  return (
    <div className="absolute bottom-32 left-4 right-4 z-[1000] bg-card rounded-2xl shadow-xl p-4 border border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Footprints className="h-5 w-5" />
            <span className="font-semibold">Walking Route</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            To: {restaurantName}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{formatWalkingTime(route.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">
                {formatWalkingDistance(route.distance)}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
