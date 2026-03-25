# Améliorations — Analyse et corrections du code

> **Projet** : P2 — Tester et améliorer une application existante
> **Objectif** : Identification et correction des problèmes de sécurité, robustesse et qualité du code

---

## Résumé des améliorations implémentées

| # | Fichier | Problème | Priorité |
|---|---------|----------|----------|
| 1 | `JwtService.java` | Expiration du token non vérifiée | Critique |
| 2 | `auth.interceptor.ts` | Réponse 401 non gérée | Critique |
| 3 | `UserService.java` | Création inutile d'un objet `UserDetails` | Haute |
| 4 | `RestExceptionHandler.java` | Validation `@Valid` sans handler + 500 renvoyait une String | Haute |
| 5 | `register.component.ts/html` | Pas d'état `isLoading`, pas de message d'erreur inline | Haute |
| 6 | `login.component.ts` | Propriété `token` inutilisée | Moyenne |
| 7 | `etudiant-list` + `user.service.ts` | Absence de bouton de déconnexion | Haute |
| 8 | `AppConfig.java` | Crash au démarrage si `.env` absent | Haute |

---

## 1. JwtService — Expiration du token non vérifiée

**Fichier** : [JwtService.java](back-end/src/main/java/com/openclassrooms/etudiant/service/JwtService.java)

**Problème** : `isTokenValid()` vérifiait uniquement que le username correspondait, mais pas que le token n'était pas expiré. Un token expiré était donc accepté comme valide.

```java
// AVANT — pas de vérification d'expiration
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return username.equals(userDetails.getUsername());
}

// APRÈS — vérifie username ET expiration
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
}

private boolean isTokenExpired(String token) {
    return Jwts.parser().verifyWith(buildKey()).build()
            .parseSignedClaims(token).getPayload()
            .getExpiration().before(new Date());
}
```

---

## 2. auth.interceptor.ts — Réponse 401 non gérée

**Fichier** : [auth.interceptor.ts](front-end/src/app/core/interceptors/auth.interceptor.ts)

**Problème** : L'intercepteur injectait le token dans les requêtes mais ignorait complètement les réponses d'erreur. Si le serveur renvoyait un `401`, l'utilisateur restait bloqué sur la page avec une erreur non gérée, sans être redirigé vers `/login`.

```typescript
// AVANT — aucune gestion de la réponse
return next(authReq);

// APRÈS — gestion du 401 : suppression du token + redirection
return next(authReq).pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
    }
    return throwError(() => error);
  })
);
```

**Impact** : si un token expiré est en localStorage, toute requête protégée déclenche maintenant une déconnexion automatique propre.

---

## 3. UserService.java — Création inutile d'un objet UserDetails

**Fichier** : [UserService.java](back-end/src/main/java/com/openclassrooms/etudiant/service/UserService.java)

**Problème** : La méthode `login()` créait manuellement un objet `UserDetails` intermédiaire alors que l'entité `User` implémente déjà `UserDetails`. C'est une violation de la séparation des responsabilités et du principe DRY.

```java
// AVANT — objet UserDetails créé manuellement (redondant)
if (user.isPresent() && passwordEncoder.matches(...)) {
    UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(login).password("").build();
    return jwtService.generateToken(userDetails);
}

// APRÈS — User implémente UserDetails, on le passe directement
if (user.isPresent() && passwordEncoder.matches(...)) {
    return jwtService.generateToken(user.get());
}
```

---

## 4. RestExceptionHandler — Deux problèmes corrigés

**Fichier** : [RestExceptionHandler.java](back-end/src/main/java/com/openclassrooms/etudiant/handler/RestExceptionHandler.java)

### 4a. Validation @Valid sans handler dédié

**Problème** : Aucun handler pour `MethodArgumentNotValidException` (levée quand `@Valid` échoue sur un `@RequestBody`). Spring renvoyait sa propre réponse d'erreur par défaut, incohérente avec le format `ErrorDetails` du projet.

```java
// AJOUTÉ — handler pour les erreurs de validation des DTOs
@Override
protected ResponseEntity<Object> handleMethodArgumentNotValid(
        MethodArgumentNotValidException ex, HttpHeaders headers,
        HttpStatusCode status, WebRequest request) {
    String errors = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
    return new ResponseEntity<>(
            new ErrorDetails(LocalDateTime.now(), errors, request.getDescription(false)),
            HttpStatus.BAD_REQUEST);
}
```

**Résultat** : une requête avec un champ `@NotBlank` vide renvoie maintenant un `400` avec le message de validation dans le format standard `ErrorDetails`.

### 4b. Handler 500 renvoyait une String

**Problème** : Le handler générique renvoyait la chaîne brute `"Internal Server error"` au lieu d'un objet `ErrorDetails` structuré, contrairement aux autres handlers.

```java
// AVANT — String brute
return handleExceptionInternal(ex, "Internal Server error", ...);

// APRÈS — ErrorDetails structuré
return handleExceptionInternal(ex, getErrorDetails(exception, request), ...);
```

---

## 5. RegisterComponent — État de chargement et erreurs inline

**Fichiers** : [register.component.ts](front-end/src/app/pages/register/register.component.ts) / [register.component.html](front-end/src/app/pages/register/register.component.html)

**Problèmes** :
- Le bouton "Register" restait actif pendant la requête → soumissions multiples possibles
- Les erreurs s'affichaient via `alert()` bloquant (mauvaise UX)

```typescript
// AVANT
error: (err) => {
  alert('Erreur lors de l\'inscription : ' + ...);
}

// APRÈS — isLoading + errorMessage inline
this.isLoading = true;
// ...
next: () => { this.isLoading = false; this.router.navigate(['/login']); },
error: (err) => { this.isLoading = false; this.errorMessage = ...; }
```

```html
<!-- AJOUTÉ dans le template -->
@if (errorMessage) {
  <div class="alert alert-danger mt-2">{{ errorMessage }}</div>
}
<button [disabled]="isLoading">
  {{ isLoading ? 'Inscription...' : 'Register' }}
</button>
```

---

## 6. LoginComponent — Propriété `token` inutilisée

**Fichier** : [login.component.ts](front-end/src/app/pages/login/login.component.ts)

**Problème** : La propriété `token: string = ''` était un vestige de la version précédente où le token était affiché dans le template. Depuis l'ajout de la navigation vers `/etudiants`, cette propriété n'était plus utilisée.

**Correction** : suppression de `token`, de ses assignations dans `onSubmit()` et `onReset()`.

---

## 7. Logout — Déconnexion manquante

**Fichiers** : [user.service.ts](front-end/src/app/core/service/user.service.ts) / [etudiant-list.component.ts](front-end/src/app/pages/etudiant-list/etudiant-list.component.ts)

**Problème** : aucune façon pour l'utilisateur de se déconnecter. Le token restait en `localStorage` indéfiniment.

```typescript
// AJOUTÉ dans UserService
logout(): void {
  localStorage.removeItem('token');
}

// AJOUTÉ dans EtudiantListComponent
logout(): void {
  this.userService.logout();
  this.router.navigate(['/login']);
}
```

Un bouton "Déconnexion" a été ajouté dans l'en-tête de la liste des étudiants.

---

## 8. AppConfig.java — Crash si .env absent

**Fichier** : [AppConfig.java](back-end/src/main/java/com/openclassrooms/etudiant/configuration/AppConfig.java)

**Problème** : Si le fichier `.env` était absent du répertoire courant au démarrage, Spring lançait une `FileNotFoundException` et l'application ne démarrait pas du tout.

```java
// AVANT — crash si .env absent
configurer.setLocation(new FileSystemResource(".env"));

// APRÈS — tolérant si .env absent (les variables viennent de l'environnement)
configurer.setLocation(new FileSystemResource(".env"));
configurer.setIgnoreResourceNotFound(true);
```

---

## Problèmes identifiés non implémentés (hors scope du projet)

| Problème | Raison de l'exclusion |
|----------|----------------------|
| Token en `localStorage` → vulnérable XSS | Nécessite une refonte complète avec httpOnly cookies + refresh token |
| Pas de mécanisme de refresh token | Complexité architecturale importante |
| CORS désactivé (`AbstractHttpConfigurer::disable`) | Requiert une configuration spécifique selon l'environnement de déploiement |
| Validations dupliquées entité + DTO | Changement architectural sans impact fonctionnel |
| Guard ne vérifie pas l'expiration du token côté client | Le 401 backend + l'intercepteur gèrent ce cas automatiquement |
| Tests unitaires insuffisants | Fait l'objet d'un exercice dédié |
