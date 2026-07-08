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

# --- source_hash integrity layer (XSPEC-072 bundle-parity, applied to translations) ---
# Probe whether `git hash-object` is usable. It computes a blob hash from file
# CONTENT and does not require the file to be tracked, but it does require the
# git binary. If unavailable we degrade gracefully and skip hash validation.
$script:GitAvailable = $false
try {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $null = & git hash-object $PSCommandPath 2>$null
        if ($LASTEXITCODE -eq 0) { $script:GitAvailable = $true }
    }
}
catch { $script:GitAvailable = $false }

# Compute first 12 chars of `git hash-object <file>` — the convention for the
# `source_hash` frontmatter field (see core/documentation-writing-standards.md).
# Returns $null when git is unavailable or the hash cannot be computed.
function Get-SourceHash {
    param([string]$SourceFile)
    if (-not $script:GitAvailable) { return $null }
    try {
        $h = & git hash-object $SourceFile 2>$null
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($h)) { return $null }
        return $h.Trim().Substring(0, [Math]::Min(12, $h.Trim().Length))
    }
    catch { return $null }
}

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
$script:GlobalDrift = 0    # source_hash present but mismatches source content (the "lie")
$script:GlobalNoHash = 0   # managed translation with no source_hash field (advisory)

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
    $Drift = 0
    $NoHash = 0

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
        $declaredHash = Get-YamlValue -FilePath $transFile.FullName -Key "source_hash"

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

        # --- source_hash verdict (content integrity layer) ---
        # Many source files expose no parseable version, making the version
        # comparison pass vacuously. source_hash is the real integrity signal:
        # it catches a translation that declares a matching version while its
        # source content has moved on.
        $actualHash = $null
        $hashVerdict = "skip"   # skip | match | mismatch | nohash
        if ([string]::IsNullOrWhiteSpace($declaredHash)) {
            $hashVerdict = "nohash"
        }
        elseif (-not $script:GitAvailable) {
            $hashVerdict = "skip"   # git unavailable — cannot verify, degrade gracefully
        }
        else {
            # Normalize declared hash: leading token, hex-only, first 12 chars
            $normDeclared = ($declaredHash -split '\s+')[0]
            $normDeclared = (($normDeclared -replace '[^0-9a-fA-F]', ''))
            if ($normDeclared.Length -gt 12) { $normDeclared = $normDeclared.Substring(0, 12) }
            $actualHash = Get-SourceHash -SourceFile $fullSourcePath
            if ([string]::IsNullOrWhiteSpace($actualHash)) {
                $hashVerdict = "skip"
            }
            elseif ($normDeclared -eq $actualHash) {
                $hashVerdict = "match"
            }
            else {
                $hashVerdict = "mismatch"
                $declaredHash = $normDeclared
            }
        }

        # Layered decision: version gap (existing) OR hash drift → outdated.
        if (($sourceVersion -eq $currentSourceVersion) -or (-not $currentSourceVersion)) {
            # Version comparison reports "in sync" (possibly vacuously).
            if ($hashVerdict -eq "mismatch") {
                Write-Host "[DRIFT]   " -ForegroundColor DarkYellow -NoNewline
                Write-Host $relPath
                Write-Host "          source_hash: $declaredHash (declared) -> $actualHash (actual)  content drift - version claims sync but source changed"
                Write-Host "          Translation: $transVersion"
                $Drift++
            }
            elseif ($hashVerdict -eq "nohash") {
                # Advisory only: majority of managed translations lack source_hash.
                $NoHash++
                if ($status -eq "current") {
                    Write-Host "[CURRENT] " -ForegroundColor Green -NoNewline
                    Write-Host "$relPath " -NoNewline
                    Write-Host "(no source_hash - drift undetectable)" -ForegroundColor Yellow
                }
                else {
                    Write-Host "[CHECK]   " -ForegroundColor Yellow -NoNewline
                    Write-Host $relPath
                    Write-Host "          Status: $status (should be 'current'?)"
                }
                $Current++
            }
            elseif ($status -eq "current") {
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
    if ($Drift -gt 0) {
        Write-Host "    Content drift (hash mismatch): " -NoNewline
        Write-Host $Drift -ForegroundColor DarkYellow
    }
    if ($NoHash -gt 0) {
        Write-Host "    No source_hash (drift undetectable): " -NoNewline
        Write-Host $NoHash -ForegroundColor Yellow
    }
    Write-Host ""

    # Update global counters
    $script:GlobalTotal += $Total
    $script:GlobalCurrent += $Current
    $script:GlobalOutdated += $Outdated
    $script:GlobalMissingMeta += $MissingMeta
    $script:GlobalMissingSource += $MissingSource
    $script:GlobalDrift += $Drift
    $script:GlobalNoHash += $NoHash

    # Return success/failure. Hash drift is advisory (matches .sh): it does not
    # fail the locale. Version-based $Outdated and missing sources still do.
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
Write-Host "Content drift:      " -NoNewline
Write-Host "$($script:GlobalDrift)  (source_hash mismatch - version claims sync but source changed)" -ForegroundColor DarkYellow
Write-Host "No source_hash:     " -NoNewline
Write-Host "$($script:GlobalNoHash)  (advisory - drift undetectable until hash added)" -ForegroundColor Yellow
Write-Host "Missing metadata:   " -NoNewline
Write-Host $script:GlobalMissingMeta -ForegroundColor Yellow
Write-Host "Missing source:     " -NoNewline
Write-Host $script:GlobalMissingSource -ForegroundColor Red
if (-not $script:GitAvailable) {
    Write-Host "Note: git hash-object unavailable - source_hash validation was SKIPPED." -ForegroundColor Yellow
}
Write-Host ""

# Exit codes mirror check-translation-sync.sh:
#   Hash drift and missing source_hash are ADVISORY (do not fail the run).
#   Version-based outdated / missing source remain blockers.
if ($script:GlobalDrift -gt 0) {
    Write-Host "$($script:GlobalDrift) translation(s) have source_hash content drift (advisory). Re-translate and refresh source_hash." -ForegroundColor DarkYellow
}
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
