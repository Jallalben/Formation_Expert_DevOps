# Etape 2 — Corriger le service d'authentification back-end

> **Projet** : P2 — Tester et améliorer une application existante
> **Compétence évaluée** : Déboguer et corriger une API d'authentification JWT
> **Bloc RNCP** : BC02 — Piloter le développement, les tests et la maintenance

---

## Objectif

Corriger le service d'implémentation de l'API d'authentification des utilisateurs dans la partie back-end, en suivant le modèle de l'existant.

L'API `/api/login` doit retourner un **token JWT** lorsque l'authentification est réussie.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Back-end | Spring Boot 3.5.5, Java 21 |
| Sécurité | Spring Security, JJWT 0.12.6 |
| Base de données | MySQL 8 (Docker Compose) |
| Front-end | Angular 19.2, Angular Material |
| Tests | JUnit, TestContainers, Postman |

---

## Architecture back-end

```
controller/
└── UserController.java        POST /api/register, POST /api/login

service/
├── UserService.java           logique métier (register, login)
└── JwtService.java            génération du token JWT

dto/
├── RegisterDTO.java           payload inscription
└── LoginRequestDTO.java       payload connexion

entities/
└── User.java                  entité JPA

repository/
└── UserRepository.java        accès BDD (findByLogin)

configuration/security/
└── SpringSecurityConfig.java  configuration Spring Security
```

---

## Bugs identifiés et corrections

### Bug 1 — `UserService.java` : double accolade + builder incomplet

**Fichier** : [UserService.java](back-end/src/main/java/com/openclassrooms/etudiant/service/UserService.java)

```java
// AVANT — ne compile pas (double `{`) + builder Spring Security incomplet
if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) { {
    UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(login).build();

// APRÈS
if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
    UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(login).password("").build();
```

**Cause** : `{ {` → erreur de compilation. `.build()` sans `.password("")` → `IllegalStateException` à l'exécution (le builder Spring Security l'exige).

---

### Bug 2 — `JwtService.java` : méthode non implémentée

**Fichier** : [JwtService.java](back-end/src/main/java/com/openclassrooms/etudiant/service/JwtService.java)

```java
// AVANT — retournait null à chaque appel login
public String generateToken(UserDetails userDetails) {
    return null; // TODO
}

// APRÈS — implémentation JJWT complète (HMAC-SHA256, expiration 24h)
public String generateToken(UserDetails userDetails) {
    SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    return Jwts.builder()
            .subject(userDetails.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact();
}
```

**Cause** : méthode avec TODO → `NullPointerException` transmis au client à chaque tentative de login.

---

### Bug 3 — `UserController.java` : `@RequestBody` et `@Valid` manquants

**Fichier** : [UserController.java](back-end/src/main/java/com/openclassrooms/etudiant/controller/UserController.java)

```java
// AVANT — Spring ne lit pas le JSON, loginRequestDTO arrive null
public ResponseEntity<?> login(LoginRequestDTO loginRequestDTO) {

// APRÈS
public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
```

**Cause** : sans `@RequestBody`, Spring ne désérialise pas le body HTTP → objet `null` → `NullPointerException`. Sans `@Valid`, les contraintes de validation sont ignorées.

---

### Bug 4 — `LoginRequestDTO.java` : aucune validation

**Fichier** : [LoginRequestDTO.java](back-end/src/main/java/com/openclassrooms/etudiant/dto/LoginRequestDTO.java)

```java
// AVANT — credentials vides acceptés
private String login;
private String password;

// APRÈS — cohérent avec RegisterDTO
@NotBlank private String login;
@NotBlank private String password;
```

**Cause** : sans contrainte, un body `{"login": "", "password": ""}` atteignait la base de données.

---

### Bug 5 — `pom.xml` : dépendances JJWT manquantes

**Fichier** : [pom.xml](back-end/pom.xml)

```xml
<!-- AJOUTÉ -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

**Cause** : `JwtService` importait `io.jsonwebtoken.*` sans que la dépendance soit déclarée → erreur de compilation Maven.

---

### Bug 6 — `application.yml` : propriétés JWT manquantes

**Fichier** : [application.yml](back-end/src/main/resources/application.yml)

```yaml
# AJOUTÉ
jwt:
  secret: ${JWT_SECRET:changeit-replace-with-a-real-secret-in-production}
  expiration-ms: 86400000
```

**Cause** : `JwtService` lisait `${jwt.secret}` via `@Value` — sans cette propriété, Spring lève une `IllegalArgumentException` au démarrage.

---

## Flux complet de l'authentification

```
Client (Postman / Front-end)
  │
  └── POST /api/login  { "login": "...", "password": "..." }
        │
        ▼
  UserController.login()
    @Valid @RequestBody → désérialise et valide le JSON
        │
        ▼
  UserService.login()
    1. Cherche l'utilisateur en BDD par login
    2. Vérifie le mot de passe avec BCrypt
    3. Construit un objet UserDetails
        │
        ▼
  JwtService.generateToken()
    1. Récupère le secret depuis application.yml
    2. Signe le token (HMAC-SHA256)
    3. Retourne le JWT (expiration 24h)
        │
        ▼
  ResponseEntity.ok(jwtToken)   →   HTTP 200 + token JWT
```

---

## Lancer l'application

### 1. Démarrer la base de données

```bash
cd back-end
docker compose up -d
```

### 2. Lancer le back-end

```bash
./mvnw spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`.

### 3. Lancer le front-end

```bash
cd front-end
npm install
ng serve
```

Le front démarre sur `http://localhost:4200` et redirige automatiquement vers `/register`.

---

## Tests Postman

### Créer un utilisateur

```
POST http://localhost:8080/api/register
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "login": "jean.dupont",
  "password": "motdepasse123"
}
```

Réponse attendue : **HTTP 201 Created**

---

### S'authentifier

```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "login": "jean.dupont",
  "password": "motdepasse123"
}
```

Réponse attendue : **HTTP 200 OK**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqZWFuLmR1cG9udCIsImlhdCI6...
```

---

## Statut

| Correction | Statut |
|------------|--------|
| Erreur de compilation `UserService` (double `{`) | ✅ Corrigé |
| `JwtService.generateToken()` implémenté | ✅ Corrigé |
| `@RequestBody @Valid` sur `/api/login` | ✅ Corrigé |
| Validation `@NotBlank` sur `LoginRequestDTO` | ✅ Corrigé |
| Dépendances JJWT dans `pom.xml` | ✅ Corrigé |
| Propriétés JWT dans `application.yml` | ✅ Corrigé |
| Token JWT retourné au login | ✅ Fonctionnel |
