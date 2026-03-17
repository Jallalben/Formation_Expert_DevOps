# Projet 1 — Demarrage de la formation Expert DevOps

> **Date** : 17 Mars 2026
> **Duree estimee** : 17 heures supervisees
> **Competence evaluee** : Definir le cadre de votre formation

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
├── 01-demarrage/          # Cadrage et setup (ce projet)
├── 02-test-app/           # Tests et amelioration d'une application
├── 03-pilotage-dev/       # Pilotage du developpement full-stack
├── 04-cicd-conteneurs/    # CI/CD avec GitLab, Docker, Kubernetes
├── 05-iac-monitoring/     # IaC (Terraform, Ansible) + ELK
├── 06-demarche-devops/    # Gestion complete d'une demarche DevOps
├── 07-audit-solutions/    # Audit d'infrastructure et veille techno
├── 08-management/         # Management d'equipes DevOps (Agile)
├── 09-strategie/          # Conception d'une strategie DevOps
├── .husky/                # Hooks Git (commit-msg)
├── .gitignore             # Exclusion de node_modules, .env, etc.
├── commitlint.config.js   # Regles Conventional Commits
├── package.json           # Dependances (husky, commitlint)
├── push.ps1               # Script d'automatisation Git
└── rollback.ps1           # Script de rollback Git securise
```

**Pourquoi cette structure ?** Chaque dossier correspond a un bloc de competences RNCP. Cette organisation permet de naviguer facilement entre les projets et de maintenir une tracabilite claire pour le jury.

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
