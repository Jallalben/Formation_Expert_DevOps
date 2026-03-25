# Etape 5 — Écrans CRUD front-end pour la gestion des étudiants

> **Projet** : P2 — Tester et améliorer une application existante
> **Compétence évaluée** : Développer les écrans Angular CRUD sécurisés par Guard
> **Bloc RNCP** : BC02 — Piloter le développement, les tests et la maintenance

---

## Objectif

Développer les écrans front-end pour consommer les APIs CRUD de l'étape 4, protégés par un Guard Angular (utilisateur connecté obligatoire).

| Écran | Route | Protection |
|-------|-------|------------|
| Liste des étudiants | `/etudiants` | `authGuard` |
| Détail d'un étudiant | `/etudiants/:id` | `authGuard` |
| Ajouter un étudiant | `/etudiants/new` | `authGuard` |
| Modifier un étudiant | `/etudiants/:id/edit` | `authGuard` |
| Supprimer (inline) | dans la liste | `authGuard` |

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `core/models/Etudiant.ts` | Créé | Interface réponse API (= `EtudiantResponseDTO`) |
| `core/models/EtudiantRequest.ts` | Créé | Interface requête API (= `EtudiantDTO`) |
| `core/guards/auth.guard.ts` | Créé | Guard : redirige vers `/login` si non connecté |
| `core/interceptors/auth.interceptor.ts` | Créé | Intercepteur : injecte `Bearer <token>` dans chaque requête |
| `core/service/etudiant.service.ts` | Créé | Service CRUD (5 méthodes) |
| `pages/etudiant-list/` | Créé | Liste + suppression |
| `pages/etudiant-detail/` | Créé | Détail d'un étudiant |
| `pages/etudiant-form/` | Créé | Formulaire partagé create + edit |
| `app.routes.ts` | Modifié | 4 nouvelles routes protégées |
| `app.config.ts` | Modifié | Intercepteur HTTP enregistré |
| `login.component.ts` | Modifié | Redirige vers `/etudiants` après login |

---

## Guard — `auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;             // token présent → accès autorisé
  }

  router.navigate(['/login']); // pas de token → redirection login
  return false;
};
```

**Utilisé sur toutes les routes `/etudiants/**`** via `canActivate: [authGuard]`.

---

## Intercepteur HTTP — `auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
```

Enregistré dans `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`.

**Pourquoi un intercepteur ?** Sans lui, chaque appel HTTP devrait manuellement ajouter le header. L'intercepteur centralise cette logique en un seul endroit.

---

## Modèles TypeScript

### `Etudiant.ts` — réponse (= `EtudiantResponseDTO` back)
```typescript
export interface Etudiant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### `EtudiantRequest.ts` — requête (= `EtudiantDTO` back)
```typescript
export interface EtudiantRequest {
  firstName: string;
  lastName: string;
  email: string;
  studentNumber?: string;
}
```

---

## Service — `etudiant.service.ts`

```typescript
findAll(): Observable<Etudiant[]>             // GET  /api/etudiants
findById(id: number): Observable<Etudiant>    // GET  /api/etudiants/:id
create(e: EtudiantRequest): Observable<Etudiant>    // POST /api/etudiants
update(id, e: EtudiantRequest): Observable<Etudiant> // PUT  /api/etudiants/:id
delete(id: number): Observable<void>          // DELETE /api/etudiants/:id
```

Le header `Authorization: Bearer <token>` est ajouté automatiquement par l'intercepteur.

---

## Composant formulaire partagé — `EtudiantFormComponent`

Le même composant gère **create et edit** :

```typescript
// Détection du mode via paramètre de route
const idParam = this.route.snapshot.paramMap.get('id');
if (idParam) {
  this.editId = Number(idParam);  // → mode édition, préchargement du formulaire
}

// Appel dynamique selon le mode
const request$ = this.isEditMode
  ? this.etudiantService.update(this.editId!, payload)
  : this.etudiantService.create(payload);
```

---

## Navigation dans l'app

```
/register   → inscription → redirige vers /login
/login      → connexion  → redirige vers /etudiants
/etudiants  → liste      → Détail | Modifier | Supprimer | + Ajouter
               │
               ├── [Détail]   → /etudiants/:id       → affichage + bouton Modifier
               ├── [Modifier] → /etudiants/:id/edit  → formulaire prérempli
               ├── [Supprimer] → confirm() → DELETE → rechargement liste
               └── [+ Ajouter] → /etudiants/new     → formulaire vide
```

---

## Gestion des états dans chaque composant

| État | Variable | Comportement |
|------|----------|--------------|
| Chargement | `isLoading = true` | Message "Chargement..." affiché |
| Erreur | `errorMessage` | Alerte rouge avec le message serveur |
| Succès create/update | — | Redirection vers `/etudiants` |
| Succès delete | — | Rechargement de la liste |

---

## Flux complet (exemple : modifier un étudiant)

```
1. Utilisateur sur /etudiants
   → authGuard vérifie localStorage.getItem('token') ✓

2. Clic "Modifier" sur l'étudiant id=3
   → navigation vers /etudiants/3/edit

3. EtudiantFormComponent.ngOnInit()
   → GET /api/etudiants/3
   → authInterceptor injecte Authorization: Bearer <token>
   → formulaire prérempli avec les données

4. Utilisateur modifie et soumet
   → PUT /api/etudiants/3  { firstName, lastName, email, studentNumber }
   → authInterceptor injecte le token

5. Succès → navigation vers /etudiants (liste rafraîchie)
```

---

## Statut

| Fonctionnalité | Statut |
|----------------|--------|
| Guard `authGuard` protège les routes étudiants | ✅ |
| Intercepteur JWT injecte automatiquement le Bearer token | ✅ |
| Service `EtudiantService` (5 méthodes CRUD) | ✅ |
| Écran liste avec Détail / Modifier / Supprimer | ✅ |
| Écran détail d'un étudiant | ✅ |
| Formulaire partagé create + edit | ✅ |
| États chargement / erreur / succès gérés | ✅ |
| Redirection automatique vers `/login` si non connecté | ✅ |
| Redirection vers `/etudiants` après login | ✅ |
