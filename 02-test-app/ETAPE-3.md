# Etape 3 — Interface d'authentification front-end

> **Projet** : P2 — Tester et améliorer une application existante
> **Compétence évaluée** : Créer un composant de login Angular qui consomme l'API JWT
> **Bloc RNCP** : BC02 — Piloter le développement, les tests et la maintenance

---

## Objectif

Ajouter une interface utilisateur permettant d'authentifier un utilisateur et de consommer l'API `/api/login` développée à l'étape 2.

L'utilisateur peut saisir son login et son mot de passe, déclencher l'authentification, et recevoir un token JWT en retour.

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `core/models/Login.ts` | Créé | Interface TypeScript du DTO login |
| `core/service/user.service.ts` | Modifié | Ajout de la méthode `login()` |
| `pages/login/login.component.ts` | Créé | Logique du composant login |
| `pages/login/login.component.html` | Créé | Template du formulaire |
| `pages/login/login.component.css` | Créé | Styles (vide, cohérent avec l'existant) |
| `app.routes.ts` | Modifié | Ajout de la route `/login` |
| `pages/register/register.component.ts` | Modifié | Navigation vers `/login` après inscription |

---

## Modèle — `Login.ts`

Créé en suivant le même pattern que `Register.ts` existant.

```typescript
export interface Login {
  login: string;
  password: string;
}
```

**Pourquoi une interface ?** Elle représente le DTO envoyé au back-end. Le typage fort évite d'envoyer des champs manquants ou mal nommés à l'API.

---

## Service — `user.service.ts`

Ajout de la méthode `login()` au service existant.

```typescript
login(credentials: Login): Observable<string> {
  return this.httpClient.post('/api/login', credentials, { responseType: 'text' });
}
```

**Pourquoi `responseType: 'text'` ?** Le back-end retourne le token JWT en tant que `String` brut (pas un objet JSON). Sans cette option, Angular tenterait de parser le body en JSON et lèverait une erreur.

---

## Composant — `login.component.ts`

Même structure que `RegisterComponent` (standalone, inject, FormBuilder, takeUntilDestroyed).

```typescript
@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isLoading: boolean = false;    // état : chargement
  errorMessage: string = '';     // état : erreur
  token: string = '';            // état : succès
  ...
}
```

### Gestion des 3 états

| État | Variable | Déclenchement |
|------|----------|---------------|
| Chargement | `isLoading = true` | Dès le submit, avant l'appel HTTP |
| Erreur | `errorMessage` | Dans le handler `error` du subscribe |
| Succès | `token` | Dans le handler `next` du subscribe |

### Stockage du token

```typescript
next: (jwtToken: string) => {
  this.token = jwtToken;
  localStorage.setItem('token', jwtToken);  // persisté pour les futures requêtes
}
```

---

## Template — `login.component.html`

Formulaire minimaliste avec les champs obligatoires, cohérent avec `register.component.html`.

- Validation inline (`is-invalid` + messages d'erreur)
- Bloc `@if (errorMessage)` → affiche l'erreur serveur
- Bloc `@if (isLoading)` → message de chargement
- Bloc `@if (token)` → affiche le token JWT reçu
- Bouton désactivé (`[disabled]="isLoading"`) pendant l'appel

---

## Routes — `app.routes.ts`

```typescript
import { LoginComponent } from './pages/login/login.component';

{
  path: 'login',
  component: LoginComponent
}
```

La route commentée `// TODO` a été décommentée et raccordée au composant.

---

## Navigation register → login

Le TODO de `register.component.ts` est résolu. Après une inscription réussie, l'utilisateur est automatiquement redirigé vers la page de login.

```typescript
// AVANT
alert('SUCCESS!! :-)');
// TODO : router l'utilisateur vers la page de login

// APRÈS
this.router.navigate(['/login']);
```

---

## Flux complet

```
Utilisateur saisit login + password
  │
  ▼
LoginComponent.onSubmit()
  isLoading = true
  │
  ▼
UserService.login(credentials)
  POST /api/login  { login, password }
  │
  ├── Succès (200) ──▶ token reçu
  │     isLoading = false
  │     token = jwtToken
  │     localStorage.setItem('token', jwtToken)
  │     token affiché dans le template
  │
  └── Erreur (401/400) ──▶ message d'erreur
        isLoading = false
        errorMessage = message du serveur
        affiché dans le template
```

---

## Test avec Postman

### Prérequis : avoir un compte existant (via /api/register)

### Appel login

```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "login": "jean.dupont",
  "password": "motdepasse123"
}
```

**Réponse attendue : HTTP 200 + token JWT**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqZWFuLmR1cG9udCIsImlhdCI6...
```

### Test erreur (mauvais mot de passe)

```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "login": "jean.dupont",
  "password": "mauvais"
}
```

**Réponse attendue : HTTP 400 + message d'erreur**

---

## Navigation dans l'app

| URL | Composant | Description |
|-----|-----------|-------------|
| `localhost:4200/` | → redirect | Redirige vers `/register` |
| `localhost:4200/register` | `RegisterComponent` | Formulaire d'inscription |
| `localhost:4200/login` | `LoginComponent` | Formulaire d'authentification |

---

## Statut

| Fonctionnalité | Statut |
|----------------|--------|
| Modèle `Login.ts` créé | ✅ |
| Méthode `UserService.login()` ajoutée | ✅ |
| Composant `LoginComponent` créé | ✅ |
| Route `/login` configurée | ✅ |
| États chargement / erreur / succès gérés | ✅ |
| Token JWT stocké en `localStorage` | ✅ |
| Navigation register → login après inscription | ✅ |
| Erreurs serveur affichées dans le template | ✅ |
