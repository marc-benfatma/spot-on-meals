import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPermissionProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LocationPermission({ isLoading, error, onRetry }: LocationPermissionProps) {
  return (
    <div className="fixed inset-0 bg-background z-[2000] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <MapPin className="h-10 w-10 text-primary" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-3">
          {isLoading ? 'Finding your location...' : 'Location Access Required'}
        </h2>
        
        {error ? (
          <>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={onRetry} size="lg" className="w-full">
              Try Again
            </Button>
          </>
        ) : isLoading ? (
          <p className="text-muted-foreground">
            Please wait while we get your current location to show nearby restaurants.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              We need access to your location to show you restaurants nearby. Your location data stays on your device.
            </p>
            <Button onClick={onRetry} size="lg" className="w-full">
              Enable Location
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
