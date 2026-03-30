# Contrôle d'accès basé sur les rôles (RBAC)

## Rôles disponibles

| Rôle | Restaurants | Utilisateurs | Description |
|------|-------------|--------------|-------------|
| `admin` | Créer, modifier, supprimer | Gérer les rôles | Accès complet |
| `editor` | Créer, modifier | — | Pas de suppression, pas de gestion utilisateurs |
| `viewer` | Lecture seule | — | Consultation uniquement, aucune modification |

## Implémentation

### Base de données
- Enum `app_role` : `admin`, `editor`, `viewer`
- Table `user_roles` : associe un `user_id` à un `role`
- Fonctions SQL `SECURITY DEFINER` : `has_role()`, `is_admin()`, `can_edit()`
- Politiques RLS sur `restaurants` et `user_roles`

### Frontend
- `AuthContext` expose `isAdmin`, `canEdit`, `isViewer`
- `ProtectedRoute` avec props `requireAdmin` et `requireEdit`
- Boutons d'action (ajouter, modifier, supprimer) conditionnellement affichés selon le rôle

## Compte démo

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `test@test.com` | `testtest` | `viewer` |

Un bouton « Demo » sur la page de connexion permet une connexion rapide en mode lecture seule.
