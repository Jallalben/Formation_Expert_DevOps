#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de rollback Git securise.
.EXAMPLE
    ./rollback.ps1
    ./rollback.ps1 -Soft
    ./rollback.ps1 -Hard
#>

param(
    [switch]$Soft,
    [switch]$Hard
)

$ErrorActionPreference = "Stop"

function Write-Step { param([string]$Message) Write-Host "`n>> $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error-Custom { param([string]$Message) Write-Host "[ERREUR] $Message" -ForegroundColor Red }
function Write-Warning-Custom { param([string]$Message) Write-Host "[ATTENTION] $Message" -ForegroundColor Yellow }

Write-Step "Verification du depot"
if (-not (Test-Path ".git")) { Write-Error-Custom "Pas un depot Git."; exit 1 }
$branch = git branch --show-current 2>&1
$lastCommit = git log --oneline -1 2>&1
if (-not $lastCommit) { Write-Error-Custom "Aucun commit."; exit 1 }
Write-Success "Branche : $branch"
Write-Host "  Dernier commit : $lastCommit" -ForegroundColor White

Write-Step "Mode de rollback"
if ($Soft) { $mode = "soft" }
elseif ($Hard) { $mode = "hard" }
else {
    Write-Host "  [1] Soft  -- Annule le commit, garde les fichiers stages"
    Write-Host "  [2] Mixed -- Annule le commit, garde les fichiers modifies (non stages)"
    Write-Host "  [3] Hard  -- Annule le commit ET les modifications (irreversible)"
    Write-Host ""
    do { $choice = Read-Host "Choix (1-3)" } while ($choice -notin @("1","2","3"))
    $mode = switch ($choice) { "1" {"soft"} "2" {"mixed"} "3" {"hard"} }
}

Write-Warning-Custom "Vous allez annuler : $lastCommit"
Write-Host "  Mode : --$mode" -ForegroundColor White

if ($mode -eq "hard") {
    Write-Warning-Custom "MODE HARD : vos modifications locales seront PERDUES."
    $confirm = Read-Host "Tapez 'CONFIRMER' pour continuer"
    if ($confirm -ne "CONFIRMER") { Write-Host "Abandon." -ForegroundColor Yellow; exit 0 }
} else {
    $confirm = Read-Host "Confirmer ? (o/N)"
    if ($confirm -notin @("o","O","oui","OUI")) { Write-Host "Abandon." -ForegroundColor Yellow; exit 0 }
}

Write-Step "Rollback en cours"
try {
    git reset "--$mode" HEAD~1
    Write-Success "Rollback effectue (--$mode)."
    switch ($mode) {
        "soft"  { Write-Host "  Fichiers stages. Pret a re-commiter." }
        "mixed" { Write-Host "  Fichiers modifies mais non stages." }
        "hard"  { Write-Host "  Commit et modifications supprimes." }
    }
    Write-Host "`nEtat actuel :" -ForegroundColor Cyan
    git status --short
}
catch { Write-Error-Custom "Rollback echoue : $_"; exit 1 }
