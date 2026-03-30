# Plan d'implémentation initial — SophiaServices

> Ce document est le plan de développement original fourni au démarrage du projet.

---

## Vue d'ensemble

Application web mobile-first aidant les utilisateurs à découvrir les restaurants à proximité via une carte interactive plein écran avec géolocalisation temps réel.

---

## Phase 1 : Expérience carte

### Carte interactive plein écran
- Affichage OpenStreetMap via Leaflet
- Position GPS de l'utilisateur avec un point bleu
- Auto-centrage sur la position utilisateur au chargement
- Contrôles de zoom et bouton "recentrer"

### Marqueurs restaurants
- Marqueurs personnalisés sur la carte
- Couleurs/icônes différentes selon le type de cuisine
- Popup rapide au tap : nom + note

---

## Phase 2 : Bottom Sheet — Liste de restaurants

### Tiroir bas swipeable
- Bottom sheet moderne avec swipe vers le haut
- Trois positions : réduit (aperçu), mi-hauteur, plein écran
- Barre de recherche et bouton filtre en haut

### Cartes restaurants
- Photo miniature
- Nom, type de cuisine, niveau de prix ($, $$, $$$)
- Note en étoiles
- Distance depuis l'utilisateur (ex : « 0.3 km »)
- Tap sur une carte → la carte scroll vers le restaurant

---

## Phase 3 : Vue détail restaurant

### Informations détaillées
- Page complète au tap sur un restaurant
- Galerie photo (1-2 images)
- Adresse complète
- Horaires d'ouverture par jour
- Numéro de téléphone (tap-to-call)
- Distance depuis la position actuelle

### Affichage de l'itinéraire
- Bouton « Itinéraire » affiche le trajet piéton sur la carte
- Ligne colorée de la position utilisateur au restaurant
- Distance et temps de marche estimés

---

## Phase 4 : Système de filtres

### Panneau de filtres
- Accessible via une icône filtre
- **Type de cuisine** : sélection multiple (chips)
- **Distance** : slider ou options prédéfinies (500m, 1km, 2km, 5km)
- **Prix** : boutons toggle $, $$, $$$
- **Note minimum** : sélection étoiles (3+, 4+, 4.5+)
- Boutons « Appliquer » et « Tout effacer »
- Compteur de restaurants correspondants

---

## Phase 5 : Backend (Lovable Cloud)

### Gestion des données restaurants
- Table base de données :
  - Nom, adresse, type de cuisine
  - Coordonnées GPS (latitude/longitude)
  - Niveau de prix, note
  - Horaires d'ouverture (format JSON)
  - Numéro de téléphone
  - URLs de photos (stockage cloud)

### Fonctionnalité admin
- Interface simple d'ajout, modification et suppression
- Formulaire avec tous les détails + upload photo
- Sélecteur de position sur la carte (map picker)

---

## Design visuel

### Interface optimisée mobile
- Design épuré et moderne
- Carte plein écran avec éléments UI flottants
- Ombres douces et coins arrondis
- Boutons dimensionnés pour le tactile
- Demande de permission de localisation avec explication claire

### Palette de couleurs
- Thème clair avec accents verts/teal
- Contraste élevé pour la lisibilité
- Marqueurs distinctifs sur la carte
