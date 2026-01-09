#!/usr/bin/env pwsh
#
# Standards Consistency Checker (PowerShell Version)
# 標準一致性檢查器 (PowerShell 版本)
#
# This script checks if human-readable standards (.md) have corresponding
# AI-optimized versions (.ai.yaml) and vice versa.
#
# Checks:
# 1. core/ ↔ ai/standards/ - Core standards consistency
# 2. options/ ↔ ai/options/ - Option standards consistency
#
# Usage: .\scripts\check-standards-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

# Directories
$CoreDir = Join-Path $RootDir "core"
$AiStandardsDir = Join-Path $RootDir "ai" "standards"
$OptionsDir = Join-Path $RootDir "options"
$AiOptionsDir = Join-Path $RootDir "ai" "options"

# Counters
$script:Errors = 0
$script:Warnings = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Standards Consistency Checker"
Write-Host "  標準一致性檢查器"
Write-Host "=========================================="
Write-Host ""

# =============================================================================
# Name Mapping Functions
# =============================================================================

function Map-CoreToAi {
    param([string]$CoreName)
    switch ($CoreName) {
        "changelog-standards"    { return "changelog" }
        "code-review-checklist"  { return "code-review" }
        "commit-message-guide"   { return "commit-message" }
        "error-code-standards"   { return "error-codes" }
        "logging-standards"      { return "logging" }
        "testing-standards"      { return "testing" }
        default                  { return $CoreName }
    }
}

function Map-AiToCore {
    param([string]$AiName)
    switch ($AiName) {
        "changelog"      { return "changelog-standards" }
        "code-review"    { return "code-review-checklist" }
        "commit-message" { return "commit-message-guide" }
        "error-codes"    { return "error-code-standards" }
        "logging"        { return "logging-standards" }
        "testing"        { return "testing-standards" }
        default          { return $AiName }
    }
}

# =============================================================================
# Check 1: core/ ↔ ai/standards/
# =============================================================================

Write-Host "[1/2] Checking core/ ↔ ai/standards/" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

# Check each core/*.md has corresponding ai/standards/*.ai.yaml
Write-Host "Checking core/ → ai/standards/:" -ForegroundColor Cyan
if (Test-Path $CoreDir) {
    $mdFiles = Get-ChildItem -Path $CoreDir -Filter "*.md" -File | Sort-Object Name
    foreach ($mdFile in $mdFiles) {
        $baseName = $mdFile.BaseName
        $aiName = Map-CoreToAi -CoreName $baseName
        $aiFile = Join-Path $AiStandardsDir "$aiName.ai.yaml"

        if (Test-Path $aiFile) {
            Write-Host "  [OK]      " -ForegroundColor Green -NoNewline
            Write-Host "$baseName.md → $aiName.ai.yaml"
        }
        else {
            Write-Host "  [MISSING] " -ForegroundColor Red -NoNewline
            Write-Host "$baseName.md → $aiName.ai.yaml (not found)"
            $script:Errors++
        }
    }
}
else {
    Write-Host "  [ERROR] core/ directory not found" -ForegroundColor Red
    $script:Errors++
}

Write-Host ""

# Check each ai/standards/*.ai.yaml has corresponding core/*.md
Write-Host "Checking ai/standards/ → core/:" -ForegroundColor Cyan
if (Test-Path $AiStandardsDir) {
    $yamlFiles = Get-ChildItem -Path $AiStandardsDir -Filter "*.ai.yaml" -File | Sort-Object Name
    foreach ($yamlFile in $yamlFiles) {
        $baseName = $yamlFile.Name -replace "\.ai\.yaml$", ""
        $coreName = Map-AiToCore -AiName $baseName
        $coreFile = Join-Path $CoreDir "$coreName.md"

        if (Test-Path $coreFile) {
            Write-Host "  [OK]      " -ForegroundColor Green -NoNewline
            Write-Host "$baseName.ai.yaml → $coreName.md"
        }
        else {
            Write-Host "  [WARN]    " -ForegroundColor Yellow -NoNewline
            Write-Host "$baseName.ai.yaml → $coreName.md (not found)"
            $script:Warnings++
        }
    }
}
else {
    Write-Host "  [ERROR] ai/standards/ directory not found" -ForegroundColor Red
    $script:Errors++
}

Write-Host ""

# =============================================================================
# Check 2: options/ ↔ ai/options/
# =============================================================================

Write-Host "[2/2] Checking options/ ↔ ai/options/" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

# Get all categories from both directories
$optionCategories = @()
$aiOptionCategories = @()

if (Test-Path $OptionsDir) {
    $optionCategories = Get-ChildItem -Path $OptionsDir -Directory | ForEach-Object { $_.Name }
}

if (Test-Path $AiOptionsDir) {
    $aiOptionCategories = Get-ChildItem -Path $AiOptionsDir -Directory | ForEach-Object { $_.Name }
}

# Combine and deduplicate categories
$allCategories = ($optionCategories + $aiOptionCategories) | Sort-Object -Unique

foreach ($category in $allCategories) {
    Write-Host "Category: $category" -ForegroundColor Cyan

    $optionCatDir = Join-Path $OptionsDir $category
    $aiOptionCatDir = Join-Path $AiOptionsDir $category

    # Check if category exists in both
    if (-not (Test-Path $optionCatDir)) {
        Write-Host "  [WARN]    options/$category/ directory missing" -ForegroundColor Yellow
        $script:Warnings++
    }

    if (-not (Test-Path $aiOptionCatDir)) {
        Write-Host "  [WARN]    ai/options/$category/ directory missing" -ForegroundColor Yellow
        $script:Warnings++
    }

    # Check options/*.md → ai/options/*.ai.yaml
    if (Test-Path $optionCatDir) {
        $mdFiles = Get-ChildItem -Path $optionCatDir -Filter "*.md" -File -ErrorAction SilentlyContinue | Sort-Object Name
        foreach ($mdFile in $mdFiles) {
            $baseName = $mdFile.BaseName
            $aiFile = Join-Path $aiOptionCatDir "$baseName.ai.yaml"

            if (Test-Path $aiFile) {
                Write-Host "  [OK]      " -ForegroundColor Green -NoNewline
                Write-Host "$baseName.md → $baseName.ai.yaml"
            }
            else {
                Write-Host "  [MISSING] " -ForegroundColor Red -NoNewline
                Write-Host "$baseName.md → $baseName.ai.yaml (AI version not found)"
                $script:Errors++
            }
        }
    }

    # Check ai/options/*.ai.yaml → options/*.md (only warn, not error)
    if (Test-Path $aiOptionCatDir) {
        $yamlFiles = Get-ChildItem -Path $aiOptionCatDir -Filter "*.ai.yaml" -File -ErrorAction SilentlyContinue | Sort-Object Name
        foreach ($yamlFile in $yamlFiles) {
            $baseName = $yamlFile.Name -replace "\.ai\.yaml$", ""
            $mdFile = Join-Path $optionCatDir "$baseName.md"

            if (-not (Test-Path $mdFile)) {
                Write-Host "  [WARN]    " -ForegroundColor Yellow -NoNewline
                Write-Host "$baseName.ai.yaml → $baseName.md (human version not found)"
                $script:Warnings++
            }
        }
    }

    Write-Host ""
}

# =============================================================================
# Summary
# =============================================================================

Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($script:Errors -gt 0 -or $script:Warnings -gt 0) {
    if ($script:Errors -gt 0) {
        Write-Host "Errors: $($script:Errors)" -ForegroundColor Red -NoNewline
        Write-Host " (Missing AI-optimized versions)"
    }
    if ($script:Warnings -gt 0) {
        Write-Host "Warnings: $($script:Warnings)" -ForegroundColor Yellow -NoNewline
        Write-Host " (Missing human-readable versions or categories)"
    }
    Write-Host ""
    Write-Host "To fix errors:"
    Write-Host "  - Create missing .ai.yaml files in ai/standards/ or ai/options/"
    Write-Host "  - Ensure each core/*.md has a corresponding ai/standards/*.ai.yaml"
    Write-Host "  - Ensure each options/<cat>/*.md has a corresponding ai/options/<cat>/*.ai.yaml"
    Write-Host ""

    if ($script:Errors -gt 0) {
        exit 1
    }
    else {
        exit 0
    }
}
else {
    Write-Host "All standards are consistent!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
