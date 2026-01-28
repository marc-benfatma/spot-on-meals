

# Restaurant Finder App - Implementation Plan

## Overview
A mobile-first web application that helps users discover nearby restaurants using an interactive fullscreen map with their real-time location. The app features a modern, intuitive interface optimized for mobile browsers.

---

## Phase 1: Core Map Experience

### Fullscreen Interactive Map
- Display a fullscreen OpenStreetMap using the Leaflet library
- Show the user's current GPS position with a distinctive blue dot marker
- Auto-center the map on the user's location when the app loads
- Include zoom controls and a "recenter" button to jump back to the user's location

### Restaurant Markers
- Display restaurant locations as custom markers on the map
- Different marker colors or icons to distinguish restaurant types (cuisine)
- Tapping a marker shows a quick preview popup with restaurant name and rating

---

## Phase 2: Bottom Sheet Restaurant List

### Swipeable Bottom Drawer
- A modern bottom sheet that users can swipe up to see the full restaurant list
- Three positions: collapsed (peek), half-expanded, and fully expanded
- Shows a search bar and filter button at the top of the drawer

### Restaurant Cards
- Each restaurant displays:
  - Photo thumbnail
  - Restaurant name
  - Cuisine type and price level ($, $$, $$$)
  - Star rating
  - Distance from user (e.g., "0.3 km away")
- Tapping a card scrolls the map to that restaurant

---

## Phase 3: Restaurant Detail View

### Detailed Information
- Full restaurant page when a restaurant is selected
- Photo gallery (1-2 images)
- Complete address
- Opening hours for each day of the week
- Phone number with tap-to-call functionality
- Distance from user's current location

### Route Display
- "Get Directions" button shows the walking route on the map
- Route is drawn as a colored line from user's position to the restaurant
- Display estimated walking distance and time

---

## Phase 4: Filter System

### Filter Modal/Panel
- Accessible via a filter icon in the search area
- **Cuisine Type**: Multi-select chips (Italian, Asian, Mexican, French, etc.)
- **Distance Range**: Slider or preset options (500m, 1km, 2km, 5km)
- **Price Range**: Toggle buttons for $, $$, $$$
- **Minimum Rating**: Star selection (3+, 4+, 4.5+ stars)
- "Apply Filters" and "Clear All" buttons
- Show count of restaurants matching current filters

---

## Phase 5: Backend Database (Lovable Cloud)

### Restaurant Data Management
- Database table to store all restaurant information:
  - Name, address, cuisine type
  - GPS coordinates (latitude/longitude)
  - Price level, rating
  - Opening hours (JSON format)
  - Phone number
  - Photo URLs (stored in cloud storage)

### Admin Functionality
- Simple admin interface to add, edit, and delete restaurants
- Form to input all restaurant details including photo upload
- Map picker to set restaurant location by clicking on map

---

## Visual Design

### Mobile-Optimized Interface
- Clean, modern design following the UX mock style
- Map takes full screen with floating UI elements
- Soft shadows and rounded corners for cards and buttons
- Easy-to-tap buttons sized for touch interaction
- Location permission request with clear explanation

### Color Scheme
- Light theme with green/teal accents (matching the map aesthetic)
- High contrast for readability
- Restaurant markers that stand out against the map

