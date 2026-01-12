#!/usr/bin/env pwsh
#
# Translation Sync Checker (PowerShell Version)
# 翻譯同步檢查器 (PowerShell 版本)
#
# This script checks if translations are in sync with their source files
# by comparing version numbers in YAML front matter.
#
# Usage: .\scripts\check-translation-sync.ps1 [locale|--all]
# Example: .\scripts\check-translation-sync.ps1              # Check ALL locales
#          .\scripts\check-translation-sync.ps1 -Locale zh-TW  # Check only zh-TW
#          .\scripts\check-translation-sync.ps1 -Locale zh-CN  # Check only zh-CN
#          .\scripts\check-translation-sync.ps1 --all          # Explicitly check all
#

param(
    [string]$Locale = ""
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$LocalesDir = Join-Path $RootDir "locales"

# Determine which locales to check
$CheckAll = $false
$LocalesToCheck = @()

if ([string]::IsNullOrEmpty($Locale) -or $Locale -eq "--all" -or $Locale -eq "-a") {
    $CheckAll = $true
    $LocalesToCheck = Get-ChildItem -Path $LocalesDir -Directory | Select-Object -ExpandProperty Name | Sort-Object
}
else {
    $LocalesToCheck = @($Locale)
}

# Global counters
$script:GlobalTotal = 0
$script:GlobalCurrent = 0
$script:GlobalOutdated = 0
$script:GlobalMissingMeta = 0
$script:GlobalMissingSource = 0
$script:GlobalErrors = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Translation Sync Checker"
Write-Host "  翻譯同步檢查器"
Write-Host "=========================================="
Write-Host ""

if ($CheckAll) {
    Write-Host "Mode: " -NoNewline
    Write-Host "Checking ALL locales" -ForegroundColor Cyan
    Write-Host "Locales found: " -NoNewline
    Write-Host ($LocalesToCheck -join ", ") -ForegroundColor Cyan
}
else {
    Write-Host "Mode: " -NoNewline
    Write-Host "Single locale" -ForegroundColor Cyan
    Write-Host "Locale: " -NoNewline
    Write-Host $LocalesToCheck[0] -ForegroundColor Cyan
}
Write-Host ""

# Function to extract YAML front matter value
function Get-YamlValue {
    param(
        [string]$FilePath,
        [string]$Key
    )

    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    foreach ($line in $content) {
        if ($line -match "^${Key}:\s*(.+)$") {
            return $matches[1].Trim()
        }
    }
    return $null
}

# Function to get source file version
function Get-SourceVersion {
    param([string]$SourceFile)

    if (-not (Test-Path $SourceFile)) {
        return $null
    }

    # Get first 20 lines
    $header = Get-Content $SourceFile -TotalCount 20 -ErrorAction SilentlyContinue
    if ($null -eq $header) {
        return $null
    }
    $headerText = $header -join "`n"

    # Try YAML front matter first
    if ($headerText -match "(?m)^version:\s*(.+)$") {
        return $matches[1].Trim()
    }

    # Try **Version**: pattern
    if ($headerText -match "\*\*Version\*\*:\s*(.+)$") {
        return $matches[1].Trim()
    }

    # Try > Version: pattern
    if ($headerText -match "^>\s*Version:\s*([^\|]+)") {
        return $matches[1].Trim()
    }

    return $null
}

# Function to check a single locale
function Check-Locale {
    param([string]$LocaleName)

    $LocaleDir = Join-Path $LocalesDir $LocaleName

    # Local counters
    $Total = 0
    $Current = 0
    $Outdated = 0
    $MissingMeta = 0
    $MissingSource = 0

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  Locale: $LocaleName" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    # Check if locale directory exists
    if (-not (Test-Path $LocaleDir -PathType Container)) {
        Write-Host "Error: Locale directory not found: $LocaleDir" -ForegroundColor Red
        $script:GlobalErrors++
        return $false
    }

    # Find all markdown files in locale directory
    $mdFiles = Get-ChildItem -Path $LocaleDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Sort-Object FullName

    foreach ($transFile in $mdFiles) {
        $Total++

        # Get relative path from locale dir
        $relPath = $transFile.FullName.Substring($LocaleDir.Length + 1)

        # Extract metadata from translation file
        $sourcePath = Get-YamlValue -FilePath $transFile.FullName -Key "source"
        $sourceVersion = Get-YamlValue -FilePath $transFile.FullName -Key "source_version"
        $transVersion = Get-YamlValue -FilePath $transFile.FullName -Key "translation_version"
        $status = Get-YamlValue -FilePath $transFile.FullName -Key "status"

        # Skip files without YAML front matter
        if (-not $sourcePath) {
            Write-Host "[NO META] " -ForegroundColor Yellow -NoNewline
            Write-Host $relPath
            Write-Host "          No YAML front matter found"
            $MissingMeta++
            continue
        }

        # Construct full source path
        $transDir = Split-Path -Parent $transFile.FullName
        if ($sourcePath.StartsWith("../")) {
            $fullSourcePath = [System.IO.Path]::GetFullPath((Join-Path $transDir $sourcePath))
        }
        else {
            $fullSourcePath = Join-Path $RootDir $sourcePath
        }

        # Check if source file exists
        if (-not (Test-Path $fullSourcePath)) {
            Write-Host "[MISSING] " -ForegroundColor Red -NoNewline
            Write-Host $relPath
            Write-Host "          Source not found: $sourcePath"
            $MissingSource++
            continue
        }

        # Get current source version
        $currentSourceVersion = Get-SourceVersion -SourceFile $fullSourcePath

        # Compare versions
        if (($sourceVersion -eq $currentSourceVersion) -or (-not $currentSourceVersion)) {
            if ($status -eq "current") {
                Write-Host "[CURRENT] " -ForegroundColor Green -NoNewline
                Write-Host $relPath
                $Current++
            }
            else {
                Write-Host "[CHECK]   " -ForegroundColor Yellow -NoNewline
                Write-Host $relPath
                Write-Host "          Status: $status (should be 'current'?)"
                $Current++
            }
        }
        else {
            Write-Host "[OUTDATED] " -ForegroundColor Red -NoNewline
            Write-Host $relPath
            Write-Host "          Source: $sourceVersion -> $currentSourceVersion"
            Write-Host "          Translation: $transVersion"
            $Outdated++
        }
    }

    # Locale summary
    Write-Host ""
    Write-Host "  $LocaleName Summary:" -ForegroundColor Cyan
    Write-Host "    Total: $Total | " -NoNewline
    Write-Host "Current: " -NoNewline
    Write-Host $Current -ForegroundColor Green -NoNewline
    Write-Host " | Outdated: " -NoNewline
    Write-Host $Outdated -ForegroundColor Red -NoNewline
    Write-Host " | Missing: " -NoNewline
    Write-Host $MissingSource -ForegroundColor Red
    Write-Host ""

    # Update global counters
    $script:GlobalTotal += $Total
    $script:GlobalCurrent += $Current
    $script:GlobalOutdated += $Outdated
    $script:GlobalMissingMeta += $MissingMeta
    $script:GlobalMissingSource += $MissingSource

    # Return success/failure
    return (($Outdated -eq 0) -and ($MissingSource -eq 0))
}

# Main execution: iterate through all locales
$LocaleErrors = 0
foreach ($locale in $LocalesToCheck) {
    $result = Check-Locale -LocaleName $locale
    if (-not $result) {
        $LocaleErrors++
    }
}

# Final summary
Write-Host "=========================================="
Write-Host "  Final Summary | 總結"
Write-Host "=========================================="
Write-Host ""
Write-Host "Locales checked:    " -NoNewline
Write-Host $LocalesToCheck.Count -ForegroundColor Cyan
Write-Host "Total files:        " -NoNewline
Write-Host $script:GlobalTotal -ForegroundColor Cyan
Write-Host "Current:            " -NoNewline
Write-Host $script:GlobalCurrent -ForegroundColor Green
Write-Host "Outdated:           " -NoNewline
Write-Host $script:GlobalOutdated -ForegroundColor Red
Write-Host "Missing metadata:   " -NoNewline
Write-Host $script:GlobalMissingMeta -ForegroundColor Yellow
Write-Host "Missing source:     " -NoNewline
Write-Host $script:GlobalMissingSource -ForegroundColor Red
Write-Host ""

# Exit with error if there are issues
if (($script:GlobalOutdated -gt 0) -or ($script:GlobalMissingSource -gt 0) -or ($script:GlobalErrors -gt 0)) {
    Write-Host "Some translations need attention!" -ForegroundColor Red
    Write-Host ""
    exit 1
}
else {
    Write-Host "All translations are in sync!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
