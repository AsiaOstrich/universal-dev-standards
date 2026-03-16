#
# Orphan Spec Detection Script (Windows PowerShell)
# 孤兒 Spec 偵測腳本
#
# Scans docs/specs/ for specs not in terminal states (Archived, Stable).
# 掃描 docs/specs/ 找出非終端狀態（Archived、Stable）的 spec。
#
# Usage: .\scripts\check-orphan-specs.ps1 [-Verbose] [-Strict]
#

param(
    [switch]$Verbose,
    [switch]$Strict
)

$RootDir = Split-Path -Parent $PSScriptRoot
$SpecsDir = Join-Path $RootDir "docs" "specs"

Write-Host "Orphan Spec Detection | 孤兒 Spec 偵測" -ForegroundColor White
Write-Host "=========================================="

# Check if specs directory exists
if (-not (Test-Path $SpecsDir)) {
    Write-Host "✓ No specs directory found — nothing to check" -ForegroundColor Green
    exit 0
}

# Find all spec markdown files
$OrphanCount = 0
$TotalCount = 0
$OrphanList = @()

$specFiles = Get-ChildItem -Path $SpecsDir -Filter "*.md" -Recurse | Where-Object {
    $_.Name -ne "README.md" -and $_.Name -ne "INDEX.md"
} | Sort-Object FullName

foreach ($specFile in $specFiles) {
    $TotalCount++

    # Extract Status field
    $content = Get-Content $specFile.FullName -Raw
    $statusMatch = [regex]::Match($content, '(?i)\*?\*?Status\*?\*?\s*:?\s*(\w+)')

    if ($statusMatch.Success) {
        $status = $statusMatch.Groups[1].Value
    } else {
        $status = "unknown"
    }

    $statusLower = $status.ToLower()
    $relPath = $specFile.FullName.Replace($RootDir + [IO.Path]::DirectorySeparatorChar, "")

    if ($statusLower -ne "archived" -and $statusLower -ne "stable") {
        $OrphanCount++
        if ($Verbose) {
            Write-Host "  ⚠ $relPath (Status: $status)" -ForegroundColor Yellow
        }
        $OrphanList += "  - $relPath ($status)"
    } else {
        if ($Verbose) {
            Write-Host "  ✓ $relPath (Status: $status)" -ForegroundColor Green
        }
    }
}

Write-Host ""

if ($TotalCount -eq 0) {
    Write-Host "✓ No spec files found — nothing to check" -ForegroundColor Green
    exit 0
}

if ($OrphanCount -eq 0) {
    Write-Host "✓ All $TotalCount specs are in terminal state (Archived/Stable)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠ Found $OrphanCount orphan spec(s) out of $TotalCount total" -ForegroundColor Yellow

    if (-not $Verbose) {
        $OrphanList | ForEach-Object { Write-Host $_ }
    }

    Write-Host ""
    Write-Host "Tip: Use '/sdd verify' to close completed specs, or '/sdd review' to progress stalled ones." -ForegroundColor Cyan

    if ($Strict) {
        Write-Host "Failing due to -Strict mode" -ForegroundColor Red
        exit 1
    } else {
        exit 0
    }
}
