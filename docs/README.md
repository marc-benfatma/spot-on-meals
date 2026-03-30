# SophiaServices — Documentation

## Présentation

Application web mobile-first de découverte de restaurants à proximité, construite avec React/TypeScript. L'utilisateur visualise les restaurants sur une carte interactive OpenStreetMap, filtre par critères et obtient un itinéraire piéton en temps réel.

**URL publiée** : [spot-on-meals.lovable.app](https://spot-on-meals.lovable.app)

---

## Architecture technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, TypeScript (strict), Vite |
| Styling | Tailwind CSS, shadcn/ui, design tokens HSL |
| Carte | Leaflet + OpenStreetMap + OSRM (routing) |
| Backend | Lovable Cloud (Supabase — PostgreSQL, Auth, RLS) |
| State management | TanStack Query (React Query v5) |
| Tests | Vitest + React Testing Library |
| Validation | Zod |

---

## Structure du projet

```
src/
├── assets/              # Images, logos (logo.svg, logo.png)
├── components/
│   ├── admin/           # RestaurantForm, AddressAutocomplete, MapPicker, AdminLayout
│   ├── filters/         # FilterPanel
│   ├── map/             # RestaurantMap, RouteInfo
│   ├── restaurant/      # RestaurantCard, RestaurantDetail, RestaurantList
│   ├── ui/              # shadcn/ui (button, card, dialog, etc.)
│   ├── BottomSheet.tsx
│   ├── LocationPermission.tsx
│   ├── NavLink.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx   # Auth state, rôle utilisateur, signIn/signUp/signOut
├── hooks/
│   ├── useFilteredRestaurants.ts
│   ├── useRestaurantCrud.ts
│   ├── useRestaurants.ts
│   ├── useUserLocation.ts
│   ├── useUserRoles.ts
│   └── useWalkingRoute.ts
├── lib/
│   ├── constants.ts     # Filtres par défaut, types de cuisine, jours de la semaine
│   ├── distance.ts      # Calcul de distance Haversine
│   ├── format.ts        # Formatage prix, etc.
│   ├── leaflet-config.ts
│   └── utils.ts         # cn() utility
├── pages/
│   ├── admin/
│   │   ├── AdminRestaurants.tsx
│   │   └── AdminUsers.tsx
│   ├── Admin.tsx
│   ├── Auth.tsx
│   ├── Index.tsx         # Page d'accueil (carte + bottom sheet)
│   └── NotFound.tsx
├── services/
│   ├── geocoding.service.ts   # Nominatim API (autocomplétion adresse)
│   ├── restaurant.service.ts  # CRUD restaurants via Supabase
│   ├── routing.service.ts     # OSRM (itinéraire piéton)
│   └── user-role.service.ts   # Gestion rôles utilisateurs
├── types/
│   └── restaurant.ts    # Restaurant, Filters, UserLocation
└── integrations/
    └── supabase/         # client.ts + types.ts (auto-générés)
```

---

## Routes

| Route | Description | Accès |
|-------|-------------|-------|
| `/` | Carte interactive + liste restaurants | Public |
| `/auth` | Connexion / Inscription + bouton démo | Public |
| `/admin` | Redirection vers `/admin/restaurants` | Authentifié |
| `/admin/restaurants` | Gestion CRUD des restaurants | Authentifié (viewer: lecture seule) |
| `/admin/users` | Gestion des rôles utilisateurs | Admin uniquement |

---

## Base de données

### Table `restaurants`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire (auto-générée) |
| `name` | text | Nom du restaurant |
| `address` | text | Adresse postale |
| `cuisine_type` | text | Type de cuisine |
| `latitude` | numeric | Coordonnée GPS |
| `longitude` | numeric | Coordonnée GPS |
| `price_level` | integer | Niveau de prix (1-3) |
| `rating` | numeric | Note (0-5) |
| `opening_hours` | jsonb | Horaires par jour `{ "monday": "9:00-22:00", ... }` |
| `phone_number` | text | Numéro de téléphone (nullable) |
| `photo_urls` | text[] | URLs des photos |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de mise à jour (auto) |

**RLS** : Lecture publique, insertion/modification par editors+admins, suppression par admins uniquement.

### Table `user_roles`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `user_id` | uuid | Référence à auth.users |
| `role` | app_role | `admin`, `editor` ou `viewer` |
| `created_at` | timestamptz | Date de création |

**RLS** : Les admins voient tous les rôles, les utilisateurs voient uniquement le leur.

### Enum `app_role`

- `admin` — Tous les droits (CRUD restaurants + gestion utilisateurs)
- `editor` — Ajout et modification de restaurants
- `viewer` — Lecture seule (pas d'ajout, modification ni suppression)

### Fonctions SQL (SECURITY DEFINER)

| Fonction | Description |
|----------|-------------|
| `has_role(user_id, role)` | Vérifie si un utilisateur a un rôle donné |
| `is_admin(user_id)` | Vérifie le rôle admin |
| `can_edit(user_id)` | Vérifie admin ou editor |

---

## Système d'authentification

- **Supabase Auth** avec email/mot de passe
- **Contexte React** (`AuthContext`) : expose `user`, `session`, `userRole`, `isAdmin`, `canEdit`, `isViewer`
- **ProtectedRoute** : composant de protection des routes avec options `requireAdmin` et `requireEdit`
- **Compte démo** : `test@test.com` / `testtest` (rôle `viewer`, lecture seule)
- Un bouton "Demo" sur la page de connexion permet une connexion rapide

---

## Fonctionnalités

### Page publique (carte)
- Carte plein écran OpenStreetMap (Leaflet)
- Géolocalisation GPS temps réel (point bleu)
- Marqueurs restaurants avec popup
- Bottom sheet swipeable avec liste de restaurants
- Filtres : type de cuisine, distance, prix, note minimum
- Vue détail restaurant (horaires, tap-to-call, photos)
- Itinéraire piéton (OSRM) avec distance et temps estimé

### Administration
- Formulaire d'ajout/édition avec :
  - Recherche d'adresse par autocomplétion (Nominatim)
  - Carte interactive pour sélection manuelle des coordonnées
- Liste tabulaire avec actions conditionnelles selon le rôle
- Gestion des utilisateurs et rôles (admin uniquement)
- Sidebar de navigation responsive

---

## Services externes

| Service | Usage | API |
|---------|-------|-----|
| OpenStreetMap | Fond de carte | Tiles gratuits |
| Nominatim | Géocodage / autocomplétion d'adresse | REST (gratuit, limité) |
| OSRM | Calcul d'itinéraire piéton | REST (gratuit) |

---

## Tests

Tests fonctionnels avec **Vitest** + **React Testing Library** :

| Suite | Fichier |
|-------|---------|
| RestaurantForm | `src/components/admin/__tests__/RestaurantForm.test.tsx` |
| AddressAutocomplete | `src/components/admin/__tests__/AddressAutocomplete.test.tsx` |
| Auth page | `src/pages/__tests__/Auth.test.tsx` |
| ProtectedRoute | `src/components/__tests__/ProtectedRoute.test.tsx` |
| useFilteredRestaurants | `src/hooks/__tests__/useFilteredRestaurants.test.ts` |
| useRestaurantCrud | `src/hooks/__tests__/useRestaurantCrud.test.ts` |

Exécution : `npm test` ou `npx vitest`

---

## Scripts

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm test             # Lancer les tests
npm run lint         # Linting ESLint
```
