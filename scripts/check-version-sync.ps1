#!/usr/bin/env pwsh
#
# Version Sync Checker (PowerShell Version)
# 版本同步檢查器 (PowerShell 版本)
#
# This script checks if version numbers in standards-registry.json
# are synchronized with package.json.
#
# Usage: .\scripts\check-version-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$CliDir = Join-Path $RootDir "cli"

$PackageJson = Join-Path $CliDir "package.json"
$RegistryJson = Join-Path $CliDir "standards-registry.json"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Version Sync Checker"
Write-Host "  版本同步檢查器"
Write-Host "=========================================="
Write-Host ""

# Check if files exist
if (-not (Test-Path $PackageJson)) {
    Write-Host "Error: package.json not found: $PackageJson" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $RegistryJson)) {
    Write-Host "Error: standards-registry.json not found: $RegistryJson" -ForegroundColor Red
    exit 1
}

# Extract version from package.json
$packageContent = Get-Content $PackageJson -Raw | ConvertFrom-Json
$packageVersion = $packageContent.version

if (-not $packageVersion) {
    Write-Host "Error: Could not extract version from package.json" -ForegroundColor Red
    exit 1
}

Write-Host "package.json version: " -NoNewline
Write-Host $packageVersion -ForegroundColor Cyan
Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Checking standards-registry.json..."
Write-Host "----------------------------------------"
Write-Host ""

# Parse registry JSON
$registryContent = Get-Content $RegistryJson -Raw | ConvertFrom-Json

# Counter for errors
$errors = 0

# Check root version field
$rootVersion = $registryContent.version
if ($rootVersion -eq $packageVersion) {
    Write-Host "[OK]     " -ForegroundColor Green -NoNewline
    Write-Host "Root version: $rootVersion"
}
else {
    Write-Host "[MISMATCH] " -ForegroundColor Red -NoNewline
    Write-Host "Root version: $rootVersion (expected: $packageVersion)"
    $errors++
}

# Check repositories.standards.version
$standardsVersion = $registryContent.repositories.standards.version
if ($standardsVersion -eq $packageVersion) {
    Write-Host "[OK]     " -ForegroundColor Green -NoNewline
    Write-Host "repositories.standards.version: $standardsVersion"
}
else {
    Write-Host "[MISMATCH] " -ForegroundColor Red -NoNewline
    Write-Host "repositories.standards.version: $standardsVersion (expected: $packageVersion)"
    $errors++
}

# Check repositories.skills.version
$skillsVersion = $registryContent.repositories.skills.version
if ($skillsVersion -eq $packageVersion) {
    Write-Host "[OK]     " -ForegroundColor Green -NoNewline
    Write-Host "repositories.skills.version: $skillsVersion"
}
else {
    Write-Host "[MISMATCH] " -ForegroundColor Red -NoNewline
    Write-Host "repositories.skills.version: $skillsVersion (expected: $packageVersion)"
    $errors++
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($errors -gt 0) {
    Write-Host "Found $errors version mismatch(es)!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix, update the version numbers in:"
    Write-Host "  $RegistryJson"
    Write-Host ""
    Write-Host "All version fields should match package.json: $packageVersion"
    Write-Host ""
    exit 1
}
else {
    Write-Host "All versions are in sync!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
