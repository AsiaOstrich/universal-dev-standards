#!/usr/bin/env pwsh
#
# Documentation Sync Checker (PowerShell Version)
# 文件同步檢查器 (PowerShell 版本)
#
# This script checks if documentation files are properly updated:
# 1. CHANGELOG.md has entry for current version
# 2. Version numbers are synchronized across key files
# 3. Reminds about other docs that may need updating
#
# Usage: .\scripts\check-docs-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$CliDir = Join-Path $RootDir "cli"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Documentation Sync Checker"
Write-Host "  文件同步檢查器"
Write-Host "=========================================="
Write-Host ""

# Extract version from package.json
$PackageJson = Join-Path $CliDir "package.json"
if (-not (Test-Path $PackageJson)) {
    Write-Host "Error: package.json not found: $PackageJson" -ForegroundColor Red
    exit 1
}

$PackageContent = Get-Content $PackageJson -Raw
if ($PackageContent -match '"version"\s*:\s*"([^"]+)"') {
    $Version = $Matches[1]
} else {
    Write-Host "Error: Could not extract version from package.json" -ForegroundColor Red
    exit 1
}

Write-Host "Current version: " -NoNewline
Write-Host $Version -ForegroundColor Blue

# Determine if this is a pre-release
$IsPrerelease = $Version -match "(alpha|beta|rc)"
if ($IsPrerelease) {
    Write-Host "Release type: " -NoNewline
    Write-Host "Pre-release (beta/alpha/rc)" -ForegroundColor Blue
} else {
    Write-Host "Release type: " -NoNewline
    Write-Host "Stable release" -ForegroundColor Blue
}
Write-Host ""

$Errors = 0
$Warnings = 0

# ==========================================
# Check 1: CHANGELOG.md
# ==========================================
Write-Host "----------------------------------------"
Write-Host "Check 1: CHANGELOG.md"
Write-Host "----------------------------------------"
Write-Host ""

$Changelog = Join-Path $RootDir "CHANGELOG.md"
if (-not (Test-Path $Changelog)) {
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host "CHANGELOG.md not found"
    $Errors++
} else {
    $ChangelogContent = Get-Content $Changelog -Raw

    # Check if current version has an entry
    if ($ChangelogContent -match "## \[$([regex]::Escape($Version))\]") {
        Write-Host "[OK]    " -ForegroundColor Green -NoNewline
        Write-Host "CHANGELOG has entry for [$Version]"
    } else {
        # Check for [Unreleased] section with content
        if ($ChangelogContent -match "## \[Unreleased\]") {
            # Check if there's content after [Unreleased]
            if ($ChangelogContent -match "## \[Unreleased\]\s*\n+### ") {
                Write-Host "[WARN]  " -ForegroundColor Yellow -NoNewline
                Write-Host "CHANGELOG has [Unreleased] section with content"
                Write-Host "        Consider moving content to [$Version] section before release"
                $Warnings++
            } else {
                Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
                Write-Host "CHANGELOG has empty [Unreleased] and no [$Version] entry"
                $Errors++
            }
        } else {
            Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
            Write-Host "CHANGELOG missing entry for [$Version]"
            $Errors++
        }
    }
}
Write-Host ""

# ==========================================
# Check 2: Version Sync in Key Files
# ==========================================
Write-Host "----------------------------------------"
Write-Host "Check 2: Version Sync"
Write-Host "----------------------------------------"
Write-Host ""

# Check plugin.json
$PluginJson = Join-Path $RootDir ".claude-plugin" "plugin.json"
if (Test-Path $PluginJson) {
    $PluginContent = Get-Content $PluginJson -Raw
    if ($PluginContent -match '"version"\s*:\s*"([^"]+)"') {
        $PluginVersion = $Matches[1]
        if ($PluginVersion -eq $Version) {
            Write-Host "[OK]    " -ForegroundColor Green -NoNewline
            Write-Host ".claude-plugin/plugin.json: $PluginVersion"
        } else {
            Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
            Write-Host ".claude-plugin/plugin.json: $PluginVersion (expected: $Version)"
            $Errors++
        }
    }
} else {
    Write-Host "[SKIP]  " -ForegroundColor Yellow -NoNewline
    Write-Host ".claude-plugin/plugin.json not found"
}

# Check marketplace.json
$MarketplaceJson = Join-Path $RootDir ".claude-plugin" "marketplace.json"
if (Test-Path $MarketplaceJson) {
    $MarketplaceContent = Get-Content $MarketplaceJson -Raw
    if ($MarketplaceContent -match '"version"\s*:\s*"([^"]+)"') {
        $MarketplaceVersion = $Matches[1]
        if ($MarketplaceVersion -eq $Version) {
            Write-Host "[OK]    " -ForegroundColor Green -NoNewline
            Write-Host ".claude-plugin/marketplace.json: $MarketplaceVersion"
        } else {
            Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
            Write-Host ".claude-plugin/marketplace.json: $MarketplaceVersion (expected: $Version)"
            $Errors++
        }
    }
} else {
    Write-Host "[SKIP]  " -ForegroundColor Yellow -NoNewline
    Write-Host ".claude-plugin/marketplace.json not found"
}

# Check README.md version (only for stable releases)
$Readme = Join-Path $RootDir "README.md"
if (Test-Path $Readme) {
    if ($IsPrerelease) {
        Write-Host "[INFO]  " -ForegroundColor Cyan -NoNewline
        Write-Host "README.md version check skipped (pre-release)"
    } else {
        $ReadmeContent = Get-Content $Readme -Raw
        if ($ReadmeContent -match "\*\*Version\*\*:\s*(\d+\.\d+\.\d+)") {
            $ReadmeVersion = $Matches[1]
            if ($ReadmeVersion -eq $Version) {
                Write-Host "[OK]    " -ForegroundColor Green -NoNewline
                Write-Host "README.md **Version**: $ReadmeVersion"
            } else {
                Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
                Write-Host "README.md **Version**: $ReadmeVersion (expected: $Version)"
                $Errors++
            }
        } else {
            Write-Host "[WARN]  " -ForegroundColor Yellow -NoNewline
            Write-Host "README.md: Could not find **Version** field"
            $Warnings++
        }
    }
} else {
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host "README.md not found"
    $Errors++
}
Write-Host ""

# ==========================================
# Check 3: Documentation Update Reminders
# ==========================================
Write-Host "----------------------------------------"
Write-Host "Check 3: Documentation Reminders"
Write-Host "----------------------------------------"
Write-Host ""
Write-Host "Review these files if relevant changes were made:" -ForegroundColor Cyan
Write-Host ""

$DocsToCheck = @(
    @{ Path = "docs/AI-AGENT-ROADMAP.md"; Desc = "New features or AI agent support" }
    @{ Path = "docs/CLI-INIT-OPTIONS.md"; Desc = "CLI option changes (has automated check)" }
    @{ Path = "docs/LOCALIZATION-ROADMAP.md"; Desc = "Translation or i18n changes" }
    @{ Path = "docs/OPERATION-WORKFLOW.md"; Desc = "Workflow or process changes" }
    @{ Path = "docs/USAGE-MODES-COMPARISON.md"; Desc = "Usage mode changes" }
    @{ Path = "docs/WINDOWS-GUIDE.md"; Desc = "Windows-specific changes" }
    @{ Path = "STANDARDS-MAPPING.md"; Desc = "Standard mapping changes" }
)

foreach ($doc in $DocsToCheck) {
    $fullPath = Join-Path $RootDir $doc.Path
    if (Test-Path $fullPath) {
        Write-Host "  * " -ForegroundColor Blue -NoNewline
        Write-Host $doc.Path
        Write-Host "    -> " -ForegroundColor Yellow -NoNewline
        Write-Host $doc.Desc
    } else {
        Write-Host "  * " -ForegroundColor Yellow -NoNewline
        Write-Host "$($doc.Path) (not found)"
    }
}

Write-Host ""

# ==========================================
# Summary
# ==========================================
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($Errors -gt 0) {
    Write-Host "Found $Errors error(s)!" -ForegroundColor Red
    if ($Warnings -gt 0) {
        Write-Host "Found $Warnings warning(s)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Please fix the errors above before releasing."
    Write-Host ""
    exit 1
} elseif ($Warnings -gt 0) {
    Write-Host "Found $Warnings warning(s)" -ForegroundColor Yellow
    Write-Host "No critical errors found." -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "All documentation checks passed!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
