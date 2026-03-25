# Etape 4 — APIs CRUD sécurisées pour la gestion des étudiants

> **Projet** : P2 — Tester et améliorer une application existante
> **Compétence évaluée** : Implémenter des APIs CRUD sécurisées par JWT
> **Bloc RNCP** : BC02 — Piloter le développement, les tests et la maintenance

---

## Objectif

Ajouter les APIs CRUD pour gérer les étudiants de la bibliothèque, sécurisées par Bearer Token JWT :

| Opération | Méthode | Endpoint |
|-----------|---------|----------|
| Ajouter un étudiant | `POST` | `/api/etudiants` |
| Consulter la liste | `GET` | `/api/etudiants` |
| Consulter un étudiant | `GET` | `/api/etudiants/{id}` |
| Modifier un étudiant | `PUT` | `/api/etudiants/{id}` |
| Supprimer un étudiant | `DELETE` | `/api/etudiants/{id}` |

---

## Architecture en couches

```
HTTP Request (Bearer Token)
  │
  ▼
JwtAuthenticationFilter          ← Valide le token, hydrate le SecurityContext
  │
  ▼
EtudiantController               ← Entrées/sorties uniquement (DTO)
  │
  ▼
EtudiantService                  ← Logique métier (validations, règles)
  │
  ▼
EtudiantRepository               ← Accès BDD (JPA)
  │
  ▼
Etudiant (Entity)                ← Table `etudiant` en base
```

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `entities/Etudiant.java` | Créé | Entité JPA (table `etudiant`) |
| `repository/EtudiantRepository.java` | Créé | Accès BDD |
| `dto/EtudiantDTO.java` | Créé | DTO d'entrée (create/update) |
| `dto/EtudiantResponseDTO.java` | Créé | DTO de sortie (réponses) |
| `mapper/EtudiantDtoMapper.java` | Créé | Mapping MapStruct entity ↔ DTO |
| `service/EtudiantService.java` | Créé | Logique métier CRUD |
| `controller/EtudiantController.java` | Créé | Endpoints REST |
| `security/JwtAuthenticationFilter.java` | Créé | Filtre JWT (activé) |
| `service/JwtService.java` | Modifié | Ajout `extractUsername()` + `isTokenValid()` |
| `security/SpringSecurityConfig.java` | Modifié | Enregistrement du filtre JWT |
| `handler/RestExceptionHandler.java` | Modifié | Ajout handler `EntityNotFoundException` (404) |

---

## Entité — `Etudiant.java`

```java
@Entity
@Table(name = "etudiant")
public class Etudiant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank @Email
    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String studentNumber;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Séparation des responsabilités** : `Etudiant` est une entité métier distincte de `User` (authentification). Les entités n'apparaissent jamais dans les controllers.

---

## DTOs

### `EtudiantDTO` (entrée — create / update)

```java
@Data
public class EtudiantDTO {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank @Email private String email;
    private String studentNumber;
}
```

### `EtudiantResponseDTO` (sortie — réponses API)

```java
@Data
public class EtudiantResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String studentNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Pourquoi deux DTOs ?** L'entrée ne contient jamais `id` ni les timestamps (générés côté serveur). La sortie les expose pour que le client puisse les utiliser.

---

## Mapper — `EtudiantDtoMapper.java`

MapStruct génère automatiquement l'implémentation à la compilation.

```java
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EtudiantDtoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Etudiant toEntity(EtudiantDTO etudiantDTO);

    EtudiantResponseDTO toResponseDTO(Etudiant etudiant);
}
```

---

## Service — `EtudiantService.java`

Règles métier appliquées :
- **create** : vérifie qu'aucun étudiant n'a déjà cet email
- **findById** : lève `EntityNotFoundException` si introuvable (→ HTTP 404)
- **update** : vérifie le conflit email uniquement si l'email change
- **delete** : vérifie l'existence avant de supprimer

---

## Filtre JWT — `JwtAuthenticationFilter.java`

Le filtre était commenté dans `SpringSecurityConfig`. Il est maintenant implémenté et activé.

```java
// Lecture du header
String authHeader = request.getHeader("Authorization");
// "Bearer eyJhbGci..."

// Extraction + validation du token
String username = jwtService.extractUsername(token);
UserDetails userDetails = customUserDetailService.loadUserByUsername(username);

if (jwtService.isTokenValid(token, userDetails)) {
    // Hydratation du SecurityContext → requête autorisée
    SecurityContextHolder.getContext().setAuthentication(authToken);
}
```

**Sans ce filtre**, Spring Security rejetait toutes les requêtes protégées avec 401 même avec un token valide, car il ne savait pas comment le valider.

---

## Mises à jour de `JwtService`

```java
// Lire le username depuis un token
public String extractUsername(String token) {
    return Jwts.parser().verifyWith(buildKey()).build()
            .parseSignedClaims(token).getPayload().getSubject();
}

// Vérifier que le token appartient bien à cet utilisateur
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return username.equals(userDetails.getUsername());
}
```

---

## Gestion des erreurs

| Exception | HTTP | Cas |
|-----------|------|-----|
| `EntityNotFoundException` | 404 | Etudiant introuvable par id |
| `IllegalArgumentException` | 400 | Email déjà existant, données invalides |
| `JwtException` | 401 | Token invalide ou expiré |

---

## Tests Postman

### Étape 1 — Obtenir un token (login)

```
POST http://localhost:8080/api/login
Content-Type: application/json

{ "login": "jean.dupont", "password": "motdepasse123" }
```

Copier le token reçu pour les étapes suivantes.

---

### Étape 2 — Ajouter un étudiant

```
POST http://localhost:8080/api/etudiants
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice.martin@email.com",
  "studentNumber": "ETU-001"
}
```

Réponse attendue : **HTTP 201 Created**

```json
{
  "id": 1,
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice.martin@email.com",
  "studentNumber": "ETU-001",
  "createdAt": "2026-03-25T10:00:00",
  "updatedAt": "2026-03-25T10:00:00"
}
```

---

### Étape 3 — Liste de tous les étudiants

```
GET http://localhost:8080/api/etudiants
Authorization: Bearer <token>
```

Réponse attendue : **HTTP 200 OK** — tableau JSON

---

### Étape 4 — Détail d'un étudiant

```
GET http://localhost:8080/api/etudiants/1
Authorization: Bearer <token>
```

Réponse attendue : **HTTP 200 OK**
Etudiant introuvable : **HTTP 404 Not Found**

---

### Étape 5 — Modifier un étudiant

```
PUT http://localhost:8080/api/etudiants/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Dupont",
  "email": "alice.dupont@email.com",
  "studentNumber": "ETU-001"
}
```

Réponse attendue : **HTTP 200 OK** — étudiant mis à jour

---

### Étape 6 — Supprimer un étudiant

```
DELETE http://localhost:8080/api/etudiants/1
Authorization: Bearer <token>
```

Réponse attendue : **HTTP 204 No Content**

---

### Test de sécurité (sans token)

```
GET http://localhost:8080/api/etudiants
```

Réponse attendue : **HTTP 401 Unauthorized** — accès refusé sans token

---

## Statut

| Fonctionnalité | Statut |
|----------------|--------|
| Entité `Etudiant` créée | ✅ |
| Repository CRUD | ✅ |
| DTOs entrée/sortie séparés | ✅ |
| Mapper MapStruct | ✅ |
| Service avec règles métier | ✅ |
| Controller REST 5 endpoints | ✅ |
| Filtre JWT activé et fonctionnel | ✅ |
| Routes CRUD protégées (Bearer Token) | ✅ |
| Erreur 404 sur étudiant introuvable | ✅ |
| Erreur 401 sans token | ✅ |
