#!/usr/bin/env pwsh
#
# CLI-to-Documentation Sync Checker (PowerShell Version)
# CLI 與文件同步檢查器 (PowerShell 版本)
#
# This script validates that all CLI options defined in cli/bin/uds.js
# are properly documented in docs/CLI-INIT-OPTIONS.md
#
# Usage: .\scripts\check-cli-docs-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

$CliFile = Join-Path $RootDir "cli\bin\uds.js"
$DocsFile = Join-Path $RootDir "docs\CLI-INIT-OPTIONS.md"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  CLI-to-Documentation Sync Checker" -ForegroundColor Cyan
Write-Host "  CLI 與文件同步檢查器" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
if (-not (Test-Path $CliFile)) {
    Write-Host "ERROR: CLI file not found: $CliFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DocsFile)) {
    Write-Host "ERROR: Documentation file not found: $DocsFile" -ForegroundColor Red
    exit 1
}

Write-Host "Checking: cli\bin\uds.js <-> docs\CLI-INIT-OPTIONS.md" -ForegroundColor Blue
Write-Host ""

# Extract CLI options from uds.js for 'init' command
Write-Host "Step 1: Extracting CLI options from uds.js..." -ForegroundColor Cyan

$cliContent = Get-Content $CliFile -Raw

# Find init command block (between .command('init') and next .command()
$initBlock = [regex]::Match($cliContent, "\.command\('init'\)[\s\S]*?(?=\.command\('|program\.parse)").Value

# Extract all .option() definitions
$optionMatches = [regex]::Matches($initBlock, "\.option\('([^']+)'")

$cliLongOptions = @()
foreach ($match in $optionMatches) {
    $optStr = $match.Groups[1].Value
    # Extract long option (--xxx)
    if ($optStr -match '--([a-z\-]+)') {
        $cliLongOptions += "--$($Matches[1])"
    }
}

$cliLongOptions = $cliLongOptions | Sort-Object -Unique
Write-Host "  Found $($cliLongOptions.Count) long options in CLI"
Write-Host ""

# Extract documented options from CLI-INIT-OPTIONS.md
Write-Host "Step 2: Extracting documented options from CLI-INIT-OPTIONS.md..." -ForegroundColor Cyan

$docsContent = Get-Content $DocsFile -Raw

# Look for options in markdown tables (format: `--option`)
$docMatches = [regex]::Matches($docsContent, '\`--([a-z\-]+)\`')

$docLongOptions = @()
foreach ($match in $docMatches) {
    $docLongOptions += "--$($match.Groups[1].Value)"
}

$docLongOptions = $docLongOptions | Sort-Object -Unique
Write-Host "  Found $($docLongOptions.Count) long options in documentation"
Write-Host ""

# Check CLI options against documentation
Write-Host "Step 3: Checking CLI options are documented..." -ForegroundColor Cyan

$errors = 0
$warnings = 0
$missingInDocs = 0

foreach ($opt in $cliLongOptions) {
    if ($docLongOptions -notcontains $opt) {
        Write-Host "  ERROR: CLI option '$opt' is not documented" -ForegroundColor Red
        $errors++
        $missingInDocs++
    }
}

if ($missingInDocs -eq 0) {
    Write-Host "  OK: All CLI options are documented" -ForegroundColor Green
}
Write-Host ""

# Check documentation against CLI (stale docs)
Write-Host "Step 4: Checking for stale documentation..." -ForegroundColor Cyan

$staleDocs = 0
foreach ($docOpt in $docLongOptions) {
    if ($cliLongOptions -notcontains $docOpt) {
        Write-Host "  WARNING: Documented option '$docOpt' not found in CLI" -ForegroundColor Yellow
        $warnings++
        $staleDocs++
    }
}

if ($staleDocs -eq 0) {
    Write-Host "  OK: No stale documentation found" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "  CLI options:   $($cliLongOptions.Count)"
Write-Host "  Documented:    $($docLongOptions.Count)"
Write-Host ""

if ($errors -gt 0) {
    Write-Host "  Errors:   $errors" -ForegroundColor Red
}

if ($warnings -gt 0) {
    Write-Host "  Warnings: $warnings" -ForegroundColor Yellow
}

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "  OK: CLI and documentation are in sync!" -ForegroundColor Green
}

Write-Host ""

# Exit with error if there are errors
if ($errors -gt 0) {
    Write-Host "CLI-docs sync check failed with $errors error(s)" -ForegroundColor Red
    exit 1
}

Write-Host "CLI-docs sync check passed" -ForegroundColor Green
exit 0
