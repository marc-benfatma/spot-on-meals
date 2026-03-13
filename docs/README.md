# Documentation du projet SophiaServices

## Architecture

Application React/TypeScript avec Vite, Tailwind CSS et Lovable Cloud (backend).

### Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/           # Interface d'administration
│   ├── filters/         # Filtres de recherche
│   ├── map/             # Carte et itinéraires
│   ├── restaurant/      # Cartes et détails restaurants
│   └── ui/              # Composants UI (shadcn)
├── contexts/            # Contextes React (Auth)
├── hooks/               # Hooks personnalisés
├── integrations/        # Client Supabase (auto-généré)
├── lib/                 # Utilitaires (distance, etc.)
├── pages/               # Pages de l'application
│   └── admin/           # Pages d'administration
├── types/               # Types TypeScript
└── assets/              # Images et logos
```

### Pages principales

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec carte des restaurants |
| `/auth` | Connexion / Inscription |
| `/admin` | Tableau de bord administration |
| `/admin/restaurants` | Gestion des restaurants |
| `/admin/users` | Gestion des utilisateurs |

### Base de données

- **restaurants** : Liste des restaurants (nom, adresse, coordonnées, cuisine, prix, note, horaires, photos)
- **user_roles** : Rôles utilisateurs (`admin`, `editor`)

### Fonctionnalités

- Carte interactive (Leaflet) avec géolocalisation
- Filtres par cuisine, prix, note, distance
- Calcul d'itinéraire piéton
- Interface d'administration protégée par rôles
- Authentification par email

### Technologies

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Carte** : Leaflet + OpenStreetMap
- **Backend** : Lovable Cloud (Supabase)
- **State** : TanStack Query
