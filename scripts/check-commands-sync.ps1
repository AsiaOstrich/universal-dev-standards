#!/usr/bin/env pwsh
#
# Commands Sync Checker (PowerShell Version)
# 指令同步檢查器 (PowerShell 版本)
#
# This script validates that all entries in AVAILABLE_COMMANDS (ai-agent-paths.js)
# have corresponding .md files in skills/commands/, and vice versa.
#
# Usage: .\scripts\check-commands-sync.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

$AgentPathsFile = Join-Path $RootDir "cli\src\config\ai-agent-paths.js"
$CommandsDir = Join-Path $RootDir "skills\commands"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Commands Sync Checker" -ForegroundColor Cyan
Write-Host "  指令同步檢查器" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if files/directories exist
if (-not (Test-Path $AgentPathsFile)) {
    Write-Host "ERROR: ai-agent-paths.js not found: $AgentPathsFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $CommandsDir)) {
    Write-Host "ERROR: Commands directory not found: $CommandsDir" -ForegroundColor Red
    exit 1
}

Write-Host "Checking: AVAILABLE_COMMANDS <-> skills\commands\*.md" -ForegroundColor Blue
Write-Host ""

# Step 1: Extract command names from AVAILABLE_COMMANDS
Write-Host "Step 1: Extracting commands from AVAILABLE_COMMANDS..." -ForegroundColor Cyan

$content = Get-Content $AgentPathsFile -Raw

# Extract AVAILABLE_COMMANDS block
$block = [regex]::Match($content, "export const AVAILABLE_COMMANDS = \[[\s\S]*?\];").Value

# Extract { name: 'xxx' } patterns
$nameMatches = [regex]::Matches($block, "name: '([^']+)'")

$registeredCommands = @()
foreach ($match in $nameMatches) {
    $registeredCommands += $match.Groups[1].Value
}

$registeredCommands = $registeredCommands | Sort-Object -Unique
Write-Host "  Found $($registeredCommands.Count) commands in AVAILABLE_COMMANDS"
Write-Host ""

# Step 2: List .md files in skills/commands/
Write-Host "Step 2: Listing command files in skills\commands\..." -ForegroundColor Cyan

$fileCommands = @()
$excludeFiles = @("README", "COMMAND-FAMILY-OVERVIEW")

Get-ChildItem -Path $CommandsDir -Filter "*.md" | ForEach-Object {
    $baseName = $_.BaseName
    if ($excludeFiles -notcontains $baseName) {
        $fileCommands += $baseName
    }
}

$fileCommands = $fileCommands | Sort-Object -Unique
Write-Host "  Found $($fileCommands.Count) command files in skills\commands\"
Write-Host ""

# Step 3: Check AVAILABLE_COMMANDS -> command files
Write-Host "Step 3: Checking AVAILABLE_COMMANDS -> command files..." -ForegroundColor Cyan

$errors = 0
$warnings = 0
$missingFiles = 0

foreach ($cmd in $registeredCommands) {
    if ($fileCommands -notcontains $cmd) {
        Write-Host "  ERROR: Command '$cmd' registered in AVAILABLE_COMMANDS but no file: skills\commands\$cmd.md" -ForegroundColor Red
        $errors++
        $missingFiles++
    }
}

if ($missingFiles -eq 0) {
    Write-Host "  OK: All registered commands have matching files" -ForegroundColor Green
}
Write-Host ""

# Step 4: Check command files -> AVAILABLE_COMMANDS
Write-Host "Step 4: Checking command files -> AVAILABLE_COMMANDS..." -ForegroundColor Cyan

$unregistered = 0
foreach ($fileCmd in $fileCommands) {
    if ($registeredCommands -notcontains $fileCmd) {
        Write-Host "  ERROR: File 'skills\commands\$fileCmd.md' exists but '$fileCmd' not in AVAILABLE_COMMANDS" -ForegroundColor Red
        $errors++
        $unregistered++
    }
}

if ($unregistered -eq 0) {
    Write-Host "  OK: All command files are registered in AVAILABLE_COMMANDS" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "  Registered commands: $($registeredCommands.Count)"
Write-Host "  Command files:       $($fileCommands.Count)"
Write-Host ""

if ($errors -gt 0) {
    Write-Host "  Errors:   $errors" -ForegroundColor Red
}

if ($warnings -gt 0) {
    Write-Host "  Warnings: $warnings" -ForegroundColor Yellow
}

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "  OK: Commands and files are in sync!" -ForegroundColor Green
}

Write-Host ""

# Exit with error if there are errors
if ($errors -gt 0) {
    Write-Host "Commands sync check failed with $errors error(s)" -ForegroundColor Red
    exit 1
}

Write-Host "Commands sync check passed" -ForegroundColor Green
exit 0
