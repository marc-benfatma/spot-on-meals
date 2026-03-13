import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const restaurantMarkerIcon = L.divIcon({
  className: 'restaurant-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:hsl(160 60% 40%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);color:white;font-size:14px;">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function createRestaurantPopupHtml(name: string, cuisineType: string, priceLevel: string, rating: number): string {
  return `
    <div style="min-width:180px;padding:4px;">
      <h3 style="font-weight:600;font-size:14px;margin-bottom:4px;">${name}</h3>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#666;margin-bottom:4px;">
        <span>${cuisineType}</span>
        <span style="color:hsl(160 60% 40%);font-weight:500;">${priceLevel}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;font-size:12px;">
        <span style="color:#facc15;">★</span>
        <span style="font-weight:500;">${rating}</span>
      </div>
    </div>
  `;
}
