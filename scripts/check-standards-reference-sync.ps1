# check-standards-reference-sync.ps1
# Validates STANDARDS-REFERENCE.md consistency with standards-registry.json
#
# Usage: .\scripts\check-standards-reference-sync.ps1

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "=========================================="
Write-Host "  Standards Reference Sync Checker"
Write-Host "  標準參照同步檢查器"
Write-Host "=========================================="
Write-Host ""

$Errors = 0
$Warnings = 0

# 1. Count core standards in core/ directory
$CoreFiles = Get-ChildItem -Path "$RootDir\core\*.md" -File
$CoreCount = $CoreFiles.Count
Write-Host "[1/4] Core standards in core\*.md: " -NoNewline -ForegroundColor Blue
Write-Host $CoreCount

# 2. Count standards documented in STANDARDS-REFERENCE.md
$RefFile = "$RootDir\docs\STANDARDS-REFERENCE.md"
if (Test-Path $RefFile) {
    $Content = Get-Content $RefFile -Raw

    # Count lines starting with "#### " followed by a number
    $RefCount = ([regex]::Matches($Content, '(?m)^#### \d+')).Count
    Write-Host "[2/4] Standards documented in STANDARDS-REFERENCE.md: " -NoNewline -ForegroundColor Blue
    Write-Host $RefCount

    # Extract the count from Overview table
    $Match = [regex]::Match($Content, 'Core Standards[^\d]*(\d+)')
    $StatedCount = if ($Match.Success) { [int]$Match.Groups[1].Value } else { 0 }
    Write-Host "[3/4] Stated count in Overview: " -NoNewline -ForegroundColor Blue
    Write-Host $StatedCount

    # Compare counts
    if ($CoreCount -ne $RefCount) {
        Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
        Write-Host "Mismatch: core\ has $CoreCount files, but STANDARDS-REFERENCE.md documents $RefCount"
        $Errors++
    }
    elseif ($CoreCount -ne $StatedCount) {
        Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
        Write-Host "Mismatch: core\ has $CoreCount files, but Overview states $StatedCount"
        $Errors++
    }
    else {
        Write-Host "[OK] " -NoNewline -ForegroundColor Green
        Write-Host "All counts match: $CoreCount standards"
    }
}
else {
    Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
    Write-Host "STANDARDS-REFERENCE.md not found"
    $Errors++
}

# 4. Check Industry Standards metadata in core/*.md
Write-Host ""
Write-Host "[4/4] Checking Industry Standards metadata in core\*.md" -ForegroundColor Blue

$MissingMeta = 0
foreach ($file in $CoreFiles) {
    $FileContent = Get-Content $file.FullName -Raw
    if ($FileContent -notmatch '\*\*Industry Standards\*\*:') {
        Write-Host "[WARN] " -NoNewline -ForegroundColor Yellow
        Write-Host "$($file.Name) missing Industry Standards metadata"
        $MissingMeta++
        $Warnings++
    }
}

if ($MissingMeta -eq 0) {
    Write-Host "[OK] " -NoNewline -ForegroundColor Green
    Write-Host "All core standards have Industry Standards metadata"
}

# 5. Check translation sync
Write-Host ""
Write-Host "[5/5] Checking translation versions" -ForegroundColor Blue

foreach ($locale in @("zh-TW", "zh-CN")) {
    $LocaleFile = "$RootDir\locales\$locale\docs\STANDARDS-REFERENCE.md"
    if (Test-Path $LocaleFile) {
        $LocaleContent = Get-Content $LocaleFile -Raw
        $LocaleMatch = [regex]::Match($LocaleContent, '(?:Core Standards|核心標準|核心标准)[^\d]*(\d+)')
        $LocaleCount = if ($LocaleMatch.Success) { [int]$LocaleMatch.Groups[1].Value } else { 0 }

        if ($LocaleCount -eq $StatedCount) {
            Write-Host "[OK] " -NoNewline -ForegroundColor Green
            Write-Host "$locale version matches ($LocaleCount)"
        }
        else {
            Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
            Write-Host "$locale version mismatch: $LocaleCount vs $StatedCount"
            $Errors++
        }
    }
    else {
        Write-Host "[WARN] " -NoNewline -ForegroundColor Yellow
        Write-Host "$locale translation not found"
        $Warnings++
    }
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "  Summary"
Write-Host "=========================================="

if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "✓ All checks passed" -ForegroundColor Green
    exit 0
}
elseif ($Errors -eq 0) {
    Write-Host "⚠ Passed with $Warnings warning(s)" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "✗ $Errors error(s), $Warnings warning(s)" -ForegroundColor Red
    exit 1
}
