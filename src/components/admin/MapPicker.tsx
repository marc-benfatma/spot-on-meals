import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Force remount when container becomes visible
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (mapRef.current) {
            // Invalidate size when container is resized
            setTimeout(() => {
              mapRef.current?.invalidateSize();
            }, 100);
          }
        }
      }
    });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Cleanup any existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    if (!mapContainerRef.current) return;

    // Small delay to ensure container is visible and has dimensions
    const initTimeout = setTimeout(() => {
      if (!mapContainerRef.current) return;
      
      const containerRect = mapContainerRef.current.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        // Container not visible yet, retry
        setMapKey(prev => prev + 1);
        return;
      }

      const lat = latitude || 48.8566;
      const lng = longitude || 2.3522;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add initial marker
      const marker = L.marker([lat, lng], {
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      // Click to move marker
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapRef.current = map;

      // Force size invalidation after map is created
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }, 150);

    return () => {
      clearTimeout(initTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapKey]);

  // Update marker when coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Click on the map or drag the marker to set location</span>
      </div>
      <div 
        ref={mapContainerRef} 
        className="h-64 w-full rounded-lg border overflow-hidden"
        style={{ minHeight: '256px' }}
      />
      <div className="text-xs text-muted-foreground">
        Lat: {latitude?.toFixed(6) || 'N/A'}, Lng: {longitude?.toFixed(6) || 'N/A'}
      </div>
    </div>
  );
}
