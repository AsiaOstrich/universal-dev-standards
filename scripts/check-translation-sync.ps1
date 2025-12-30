#!/usr/bin/env pwsh
#
# Translation Sync Checker (PowerShell Version)
# 翻譯同步檢查器 (PowerShell 版本)
#
# This script checks if translations are in sync with their source files
# by comparing version numbers in YAML front matter.
#
# Usage: .\scripts\check-translation-sync.ps1 [locale]
# Example: .\scripts\check-translation-sync.ps1 -Locale zh-TW
#

param(
    [string]$Locale = "zh-TW"
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$LocaleDir = Join-Path $RootDir "locales" $Locale

# Counters
$Total = 0
$Current = 0
$Outdated = 0
$MissingMeta = 0
$MissingSource = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Translation Sync Checker"
Write-Host "  翻譯同步檢查器"
Write-Host "=========================================="
Write-Host ""
Write-Host "Locale: " -NoNewline
Write-Host $Locale -ForegroundColor Cyan
Write-Host "Checking: " -NoNewline
Write-Host $LocaleDir -ForegroundColor Cyan
Write-Host ""

# Check if locale directory exists
if (-not (Test-Path $LocaleDir -PathType Container)) {
    Write-Host "Error: Locale directory not found: $LocaleDir" -ForegroundColor Red
    exit 1
}

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

Write-Host "----------------------------------------"
Write-Host "Checking translation files..."
Write-Host "----------------------------------------"
Write-Host ""

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

Write-Host ""
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""
Write-Host "Total files:        " -NoNewline
Write-Host $Total -ForegroundColor Cyan
Write-Host "Current:            " -NoNewline
Write-Host $Current -ForegroundColor Green
Write-Host "Outdated:           " -NoNewline
Write-Host $Outdated -ForegroundColor Red
Write-Host "Missing metadata:   " -NoNewline
Write-Host $MissingMeta -ForegroundColor Yellow
Write-Host "Missing source:     " -NoNewline
Write-Host $MissingSource -ForegroundColor Red
Write-Host ""

# Exit with error if there are issues
if (($Outdated -gt 0) -or ($MissingSource -gt 0)) {
    Write-Host "Some translations need attention!" -ForegroundColor Red
    Write-Host ""
    exit 1
}
else {
    Write-Host "All translations are in sync!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
