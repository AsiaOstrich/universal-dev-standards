#!/usr/bin/env pwsh
#
# Install Scripts Sync Checker (PowerShell Version)
# 安裝腳本同步檢查器 (PowerShell 版本)
#
# This script verifies that install.sh and install.ps1 contain all skill directories.
# 此腳本驗證 install.sh 和 install.ps1 包含所有 skill 目錄。
#
# Usage: .\scripts\check-install-scripts-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$SkillsDir = Join-Path $RootDir "skills" "claude-code"
$InstallSh = Join-Path $SkillsDir "install.sh"
$InstallPs1 = Join-Path $SkillsDir "install.ps1"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Install Scripts Sync Checker"
Write-Host "  安裝腳本同步檢查器"
Write-Host "=========================================="
Write-Host ""

# Check if files exist
if (-not (Test-Path $InstallSh)) {
    Write-Host "Error: install.sh not found: $InstallSh" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $InstallPs1)) {
    Write-Host "Error: install.ps1 not found: $InstallPs1" -ForegroundColor Red
    exit 1
}

# Get actual skill directories (exclude non-skill items like 'commands')
$ActualSkills = Get-ChildItem -Path $SkillsDir -Directory |
    Where-Object { $_.Name -ne "commands" -and $_.Name -notmatch "^\." } |
    Select-Object -ExpandProperty Name |
    Sort-Object

# Extract skills from install.sh
$ShContent = Get-Content $InstallSh -Raw
$ShSkills = [regex]::Matches($ShContent, '^\s+"([a-z][^"]+)"', [System.Text.RegularExpressions.RegexOptions]::Multiline) |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object

# Extract skills from install.ps1
$Ps1Content = Get-Content $InstallPs1 -Raw
$Ps1Skills = [regex]::Matches($Ps1Content, '^\s+"([a-z][^"]+)"', [System.Text.RegularExpressions.RegexOptions]::Multiline) |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object

# Count skills
$ActualCount = $ActualSkills.Count
$ShCount = $ShSkills.Count
$Ps1Count = $Ps1Skills.Count

Write-Host "Skills Directory: " -NoNewline
Write-Host $SkillsDir -ForegroundColor Cyan
Write-Host ""
Write-Host "Skill counts:" -ForegroundColor Blue
Write-Host "  Actual directories: $ActualCount"
Write-Host "  install.sh:         $ShCount"
Write-Host "  install.ps1:        $Ps1Count"
Write-Host ""

$HasError = $false

# Check install.sh
Write-Host "Checking install.sh..." -ForegroundColor Blue
$ShMissing = $ActualSkills | Where-Object { $_ -notin $ShSkills }
$ShExtra = $ShSkills | Where-Object { $_ -notin $ActualSkills }

if ($ShMissing) {
    Write-Host "  X Missing from install.sh:" -ForegroundColor Red
    foreach ($skill in $ShMissing) {
        Write-Host "    - $skill" -ForegroundColor Yellow
    }
    $HasError = $true
}
elseif ($ShExtra) {
    Write-Host "  ! Extra in install.sh (directory not found):" -ForegroundColor Yellow
    foreach ($skill in $ShExtra) {
        Write-Host "    - $skill" -ForegroundColor Yellow
    }
    $HasError = $true
}
else {
    Write-Host "  OK install.sh is in sync" -ForegroundColor Green
}

Write-Host ""

# Check install.ps1
Write-Host "Checking install.ps1..." -ForegroundColor Blue
$Ps1Missing = $ActualSkills | Where-Object { $_ -notin $Ps1Skills }
$Ps1Extra = $Ps1Skills | Where-Object { $_ -notin $ActualSkills }

if ($Ps1Missing) {
    Write-Host "  X Missing from install.ps1:" -ForegroundColor Red
    foreach ($skill in $Ps1Missing) {
        Write-Host "    - $skill" -ForegroundColor Yellow
    }
    $HasError = $true
}
elseif ($Ps1Extra) {
    Write-Host "  ! Extra in install.ps1 (directory not found):" -ForegroundColor Yellow
    foreach ($skill in $Ps1Extra) {
        Write-Host "    - $skill" -ForegroundColor Yellow
    }
    $HasError = $true
}
else {
    Write-Host "  OK install.ps1 is in sync" -ForegroundColor Green
}

Write-Host ""

# Check if sh and ps1 are in sync with each other
Write-Host "Checking install.sh vs install.ps1..." -ForegroundColor Blue
$ShVsPs1Diff = Compare-Object -ReferenceObject $ShSkills -DifferenceObject $Ps1Skills -PassThru
if ($ShVsPs1Diff) {
    Write-Host "  X install.sh and install.ps1 are not in sync" -ForegroundColor Red
    $ShVsPs1Diff | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    $HasError = $true
}
else {
    Write-Host "  OK install.sh and install.ps1 are in sync" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================="

if ($HasError) {
    Write-Host "X Sync check failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix, update the SKILLS array in:"
    Write-Host "  - $InstallSh"
    Write-Host "  - $InstallPs1"
    Write-Host ""
    exit 1
}
else {
    Write-Host "OK All install scripts are in sync" -ForegroundColor Green
    Write-Host ""
    exit 0
}
