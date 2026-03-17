# Projet 1 — Demarrage de la formation Expert DevOps

> **Date** : 17 Mars 2026
> **Duree estimee** : 17 heures supervisees
> **Competence evaluee** : Definir le cadre de votre formation
> **Bloc RNCP** : BC02 — Piloter le developpement, les tests et la maintenance

---

## Objectifs

Ce premier projet pose les fondations de l'ensemble de la formation. Il s'agit de :

- Mettre en place un environnement de developpement **reproductible et versionne**.
- Adopter des le depart les **bonnes pratiques DevOps** (automatisation, conventions, tracabilite).
- Structurer le depot Git pour accueillir les 9 projets de la certification RNCP.
- Planifier la progression sur l'ensemble du parcours.

---

## Prerequis

| Outil | Version | Role |
|-------|---------|------|
| Git | 2.x+ | Versioning du code et des livrables |
| Node.js | 18+ | Execution de Husky et Commitlint |
| VS Code | Latest | Editeur principal |
| PowerShell | 7.x+ | Scripts d'automatisation (Windows) |
| GitHub | — | Hebergement distant du depot |

---

## Architecture du depot

```
Formation_Expert_DevOps/
├── 01-demarrage/          # P1 — Cadrage et setup (ce projet)
├── 02-test-app/           # P2 — Tests et amelioration d'une application
├── 03-pilotage-dev/       # P3 — Pilotage du developpement full-stack
├── 04-cicd-conteneurs/    # P4 — CI/CD avec GitLab, Docker, Kubernetes
├── 05-iac-monitoring/     # P5 — IaC (Terraform, Ansible) + ELK
├── 06-demarche-devops/    # P6 — Gestion complete d'une demarche DevOps
├── 07-audit-solutions/    # P7 — Audit d'infrastructure et veille techno
├── 08-management/         # P8 — Management d'equipes DevOps (Agile)
├── 09-strategie/          # P9 — Conception d'une strategie DevOps
├── .husky/                # Hooks Git (commit-msg)
├── .gitignore             # Exclusion de node_modules, .env, etc.
├── commitlint.config.js   # Regles Conventional Commits
├── package.json           # Dependances (husky, commitlint)
├── push.ps1               # Script d'automatisation Git
└── rollback.ps1           # Script de rollback Git securise
```

**Pourquoi cette structure ?** Chaque dossier correspond a un bloc de competences RNCP. Cette organisation permet de naviguer facilement entre les projets et de maintenir une tracabilite claire pour le jury.

---

## Mapping des blocs RNCP

| Bloc RNCP | Intitule | Projets |
|-----------|----------|---------|
| BC01 | Analyser et concevoir des solutions logicielles | P7, P9 |
| BC02 | Piloter le developpement, les tests et la maintenance | P1, P2, P3 |
| BC03 | Planifier, organiser et preparer l'integration et le deploiement continu | P4, P5, P6 |
| BC04 | Manager et encadrer les equipes | P8 |

---

## Vue d'ensemble des 9 projets

| # | Projet | Heures | Competences cles |
|---|--------|--------|------------------|
| 1 | Demarrage de la formation | 17h | Cadrage, planification |
| 2 | Tester et ameliorer une application existante | 30h | Back-end, front-end, tests, debogage |
| 3 | Piloter le developpement d'une solution | 50h | API, architecture full-stack, doc technique |
| 4 | CI/CD avec GitLab, Docker et Kubernetes | 60h | Docker, K8s, GitLab CI, scripts Python/Bash |
| 5 | IaC avec Terraform, Ansible et ELK | 60h | Terraform, Ansible, ELK, AWS |
| 6 | Gerer une demarche DevOps | 65h | DevSecOps, CI/CD, IaC, monitoring, release |
| 7 | Analyser une infra et definir des solutions | 30h | Audit, veille techno, specifications |
| 8 | Manager les equipes d'un projet DevOps | 30h | Agile, roadmap, montee en competences |
| 9 | Concevoir une strategie DevOps | 60h | Architecture, amelioration continue |

**Total : 402 heures supervisees**

---

## Journal de configuration

### 1. Initialisation Git et structure

```bash
git init
mkdir 01-demarrage 02-test-app 03-pilotage-dev 04-cicd-conteneurs 05-iac-monitoring 06-demarche-devops 07-audit-solutions 08-management 09-strategie
```

**Pourquoi ?** Un depot unique plutot que 9 depots separes. Cela simplifie le suivi global de la formation et permet au jury de voir l'ensemble du parcours d'un seul coup.

### 2. Mise en place de Husky (hooks Git)

```bash
npm init -y
npm install --save-dev husky
npx husky init
```

**Pourquoi Husky ?** Il automatise l'execution de verifications avant chaque commit. Ici, il intercepte le hook `commit-msg` pour valider que le message respecte la norme Conventional Commits. Cela garantit un historique Git propre et exploitable sans intervention manuelle.

### 3. Configuration de Commitlint

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Fichier `commitlint.config.js` :
```javascript
module.exports = { extends: ['@commitlint/config-conventional'] };
```

Hook `.husky/commit-msg` :
```bash
npx --no -- commitlint --edit "$1"
```

**Pourquoi Conventional Commits ?** Cette norme (`feat:`, `fix:`, `docs:`, `chore:`, etc.) apporte trois benefices concrets :
- **Lisibilite** : l'historique Git devient auto-documente.
- **Automatisation** : permet la generation automatique de changelogs et le versioning semantique (SemVer).
- **Collaboration** : tout contributeur comprend immediatement la nature d'un changement.

### 4. Configuration du .gitignore

```
node_modules/
.env
*.log
```

**Pourquoi ?** Exclure `node_modules` (dependances lourdes et reconstituables via `npm install`), les variables d'environnement sensibles (`.env`) et les fichiers de log temporaires.

### 5. Synchronisation GitHub

```bash
git remote add origin https://github.com/Jallalben/Formation_Expert_DevOps.git
git branch -M main
git push -u origin main
```

**Depot distant** : [https://github.com/Jallalben/Formation_Expert_DevOps](https://github.com/Jallalben/Formation_Expert_DevOps)
**Branche par defaut** : `main`

---

## Scripts d'automatisation

### push.ps1

Script interactif qui remplace les commandes manuelles `git add` / `git commit` / `git push` :

| Fonctionnalite | Description |
|----------------|-------------|
| Verification pre-push | Verifie `.git`, remote et branche |
| Menu interactif | Selection du type Conventional Commits |
| Scope optionnel | Cible un projet (ex: `docs(01-demarrage): ...`) |
| Confirmation | Recapitulatif complet avant execution |
| Rollback integre | `git reset --soft HEAD~1` en cas d'echec |
| Mode Force | `./push.ps1 -Force` pour sauter la confirmation |

### rollback.ps1

Script de rollback securise avec trois modes :

| Mode | Commande | Effet |
|------|----------|-------|
| Soft | `./rollback.ps1 -Soft` | Annule le commit, garde les fichiers stages |
| Mixed | `./rollback.ps1` | Annule le commit, garde les modifications |
| Hard | `./rollback.ps1 -Hard` | Annule tout (double confirmation requise) |

---

## Prochaines etapes

- [ ] Demarrer le Projet 2 : Tests et amelioration d'une application existante
- [ ] Mettre en place un template de README reutilisable pour les projets suivants
- [ ] Explorer la generation automatique de changelog via `standard-version` ou `semantic-release`

---

## Ressources

- [Conventional Commits — Specification](https://www.conventionalcommits.org/fr/)
- [Husky — Documentation](https://typicode.github.io/husky/)
- [Commitlint — Documentation](https://commitlint.js.org/)

---

**Statut** : Environnement operationnel et documente.
