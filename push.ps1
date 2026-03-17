#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de push automatise avec validation Conventional Commits.
.DESCRIPTION
    Automatise le workflow git add > commit > push avec :
    - Verification de l'etat du depot avant toute action
    - Selection interactive du type de commit (Conventional Commits)
    - Validation du message avant execution
    - Gestion d'erreurs avec messages explicites
    - Option de rollback en cas de probleme
.EXAMPLE
    ./push.ps1
    ./push.ps1 -Force
#>

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$CommitTypes = @(
    @{ Type = "feat";     Desc = "Nouvelle fonctionnalite" }
    @{ Type = "fix";      Desc = "Correction de bug" }
    @{ Type = "docs";     Desc = "Documentation uniquement" }
    @{ Type = "chore";    Desc = "Maintenance (deps, config)" }
    @{ Type = "refactor"; Desc = "Refactoring sans changement fonctionnel" }
    @{ Type = "test";     Desc = "Ajout ou modification de tests" }
    @{ Type = "ci";       Desc = "Configuration CI/CD" }
    @{ Type = "style";    Desc = "Formatage, espaces, points-virgules" }
)

function Write-Step { param([string]$Message) Write-Host "`n>> $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error-Custom { param([string]$Message) Write-Host "[ERREUR] $Message" -ForegroundColor Red }

Write-Step "Verification de l'environnement"
if (-not (Test-Path ".git")) { Write-Error-Custom "Pas un depot Git."; exit 1 }
$remote = git remote 2>&1
if (-not $remote) { Write-Error-Custom "Aucun remote configure."; exit 1 }
$branch = git branch --show-current 2>&1
if (-not $branch) { Write-Error-Custom "Impossible de determiner la branche."; exit 1 }
Write-Success "Depot Git OK | Branche : $branch"

Write-Step "Etat du depot"
$status = git status --porcelain 2>&1
if (-not $status) { Write-Host "Rien a commiter." -ForegroundColor Yellow; exit 0 }
Write-Host "Fichiers modifies :" -ForegroundColor White
git status --short
Write-Host ""

Write-Step "Type de commit (Conventional Commits)"
for ($i = 0; $i -lt $CommitTypes.Count; $i++) {
    $entry = $CommitTypes[$i]
    Write-Host "  [$($i + 1)] $($entry.Type) -- $($entry.Desc)"
}
Write-Host ""
do {
    $choice = Read-Host "Choix (1-$($CommitTypes.Count))"
    $index = [int]$choice - 1
} while ($index -lt 0 -or $index -ge $CommitTypes.Count)
$selectedType = $CommitTypes[$index].Type
Write-Success "Type selectionne : $selectedType"

$scope = Read-Host "Scope optionnel (ex: 01-demarrage). Entree pour ignorer"
$message = Read-Host "Message du commit (sans le prefixe)"
if (-not $message) { Write-Error-Custom "Message vide."; exit 1 }

if ($scope) { $fullMessage = "$($selectedType)($scope): $message" }
else { $fullMessage = "$($selectedType): $message" }

Write-Step "Recapitulatif"
Write-Host "  Message  : $fullMessage" -ForegroundColor White
Write-Host "  Branche  : $branch" -ForegroundColor White
Write-Host "  Fichiers : $($status.Count) modification(s)" -ForegroundColor White
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "Confirmer le push ? (o/N)"
    if ($confirm -notin @("o", "O", "oui", "OUI")) { Write-Host "Abandon." -ForegroundColor Yellow; exit 0 }
}

Write-Step "Execution du workflow Git"
try {
    Write-Host "  git add -A" -ForegroundColor DarkGray
    git add -A
    Write-Host "  git commit -m `"$fullMessage`"" -ForegroundColor DarkGray
    git commit -m $fullMessage
    Write-Host "  git push origin $branch" -ForegroundColor DarkGray
    git push origin $branch
    Write-Host ""
    Write-Success "Push effectue avec succes !"
    Write-Host "  Commit : $fullMessage"
    Write-Host "  Vers   : origin/$branch"
}
catch {
    Write-Host ""
    Write-Error-Custom "Le push a echoue : $_"
    $rollback = Read-Host "Annuler le dernier commit ? (o/N)"
    if ($rollback -in @("o", "O", "oui", "OUI")) {
        git reset --soft HEAD~1
        Write-Success "Commit annule. Fichiers toujours stages."
    }
    exit 1
}
