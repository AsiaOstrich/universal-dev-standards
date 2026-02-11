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
Write-Host "----------------------------------------"
Write-Host "Checking .claude-plugin/ files..."
Write-Host "----------------------------------------"
Write-Host ""

# Check if this is a pre-release version
$isPrerelease = $packageVersion -match "-(alpha|beta|rc)\."
if ($isPrerelease) {
    Write-Host "[INFO]  Pre-release version detected: $packageVersion" -ForegroundColor Yellow
    Write-Host "[INFO]  Marketplace files should keep stable version (not required to match)" -ForegroundColor Yellow
    Write-Host ""
}

# Check .claude-plugin/plugin.json
$PluginJson = Join-Path $RootDir ".claude-plugin" "plugin.json"
if (Test-Path $PluginJson) {
    $pluginContent = Get-Content $PluginJson -Raw | ConvertFrom-Json
    $pluginVersion = $pluginContent.version
    if ($isPrerelease) {
        if ($pluginVersion -match "-(alpha|beta|rc)\.") {
            Write-Host "[WARN]  plugin.json version: $pluginVersion (should be stable, not pre-release)" -ForegroundColor Yellow
        } else {
            Write-Host "[OK]     plugin.json version: $pluginVersion (stable - correct for marketplace)" -ForegroundColor Green
        }
    } else {
        if ($pluginVersion -eq $packageVersion) {
            Write-Host "[OK]     plugin.json version: $pluginVersion" -ForegroundColor Green
        } else {
            Write-Host "[MISMATCH] plugin.json version: $pluginVersion (expected: $packageVersion)" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "[SKIP]  plugin.json not found" -ForegroundColor Yellow
}

# Check .claude-plugin/marketplace.json
$MarketplaceJson = Join-Path $RootDir ".claude-plugin" "marketplace.json"
if (Test-Path $MarketplaceJson) {
    $marketplaceContent = Get-Content $MarketplaceJson -Raw | ConvertFrom-Json
    # marketplace.json has version nested under plugins array
    $marketplaceVersion = $marketplaceContent.plugins[0].version
    if ($isPrerelease) {
        if ($marketplaceVersion -match "-(alpha|beta|rc)\.") {
            Write-Host "[WARN]  marketplace.json version: $marketplaceVersion (should be stable, not pre-release)" -ForegroundColor Yellow
        } else {
            Write-Host "[OK]     marketplace.json version: $marketplaceVersion (stable - correct for marketplace)" -ForegroundColor Green
        }
    } else {
        if ($marketplaceVersion -eq $packageVersion) {
            Write-Host "[OK]     marketplace.json version: $marketplaceVersion" -ForegroundColor Green
        } else {
            Write-Host "[MISMATCH] marketplace.json version: $marketplaceVersion (expected: $packageVersion)" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "[SKIP]  marketplace.json not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Checking README files..."
Write-Host "----------------------------------------"
Write-Host ""

# Check README files (EN: **Version**, zh-TW: **版本**, zh-CN: **版本**)
$readmeChecks = @(
    @{ Path = "README.md"; Label = "Version" },
    @{ Path = "locales/zh-TW/README.md"; Label = "版本" },
    @{ Path = "locales/zh-CN/README.md"; Label = "版本" }
)

foreach ($check in $readmeChecks) {
    $readmePath = Join-Path $RootDir $check.Path
    $label = $check.Label
    if (Test-Path $readmePath) {
        $readmeContent = Get-Content $readmePath -Raw
        if ($readmeContent -match "\*\*${label}\*\*:\s*([^\|]+)\|") {
            $readmeVersion = $Matches[1].Trim()
        } else {
            $readmeVersion = ""
        }

        if ($isPrerelease) {
            if ($readmeVersion -match "-(alpha|beta|rc)\.") {
                Write-Host "[WARN]  $($check.Path) version: $readmeVersion (should be stable, not pre-release)" -ForegroundColor Yellow
            } else {
                Write-Host "[OK]     $($check.Path) version: $readmeVersion (stable - correct for pre-release)" -ForegroundColor Green
            }
        } else {
            if ($readmeVersion -eq $packageVersion) {
                Write-Host "[OK]     $($check.Path) version: $readmeVersion" -ForegroundColor Green
            } else {
                Write-Host "[MISMATCH] $($check.Path) version: $readmeVersion (expected: $packageVersion)" -ForegroundColor Red
                $errors++
            }
        }
    } else {
        Write-Host "[SKIP]  $($check.Path) not found" -ForegroundColor Yellow
    }
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
