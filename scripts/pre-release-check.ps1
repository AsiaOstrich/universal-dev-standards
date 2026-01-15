#!/usr/bin/env pwsh
#
# Pre-release Check Script (PowerShell Version)
# 發布前檢查腳本 (PowerShell 版本)
#
# This script runs all pre-release checks in one command.
# 此腳本一次執行所有發布前檢查。
#
# Usage: .\scripts\pre-release-check.ps1 [options]
#
# Options:
#   -FailFast     Stop on first failure
#   -SkipTests    Skip running tests (faster validation)
#   -Help         Show this help message
#

param(
    [switch]$FailFast,
    [switch]$SkipTests,
    [switch]$Help
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# Show help
if ($Help) {
    Write-Host "Usage: .\scripts\pre-release-check.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -FailFast     Stop on first failure"
    Write-Host "  -SkipTests    Skip running tests (faster validation)"
    Write-Host "  -Help         Show this help message"
    exit 0
}

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$CliDir = Join-Path $RootDir "cli"

# Counters
$Passed = 0
$Failed = 0
$Skipped = 0
$Total = 8

if ($SkipTests) {
    $Total = 7
}

# Function to run a check
function Run-Check {
    param(
        [int]$Step,
        [string]$Name,
        [string]$Command
    )

    Write-Host "[$Step/$Total] " -ForegroundColor Cyan -NoNewline
    Write-Host "$Name..."

    try {
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            Write-Host "      " -NoNewline
            Write-Host "[OK] Passed" -ForegroundColor Green
            $script:Passed++
            return $true
        }
        else {
            Write-Host "      " -NoNewline
            Write-Host "[X] Failed" -ForegroundColor Red
            Write-Host ""
            $output | ForEach-Object { Write-Host "      $_" }
            Write-Host ""
            $script:Failed++

            if ($FailFast) {
                Write-Host "Stopping due to -FailFast" -ForegroundColor Red
                Show-Summary
                exit 1
            }
            return $false
        }
    }
    catch {
        Write-Host "      " -NoNewline
        Write-Host "[X] Failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "      $_" -ForegroundColor Red
        Write-Host ""
        $script:Failed++

        if ($FailFast) {
            Write-Host "Stopping due to -FailFast" -ForegroundColor Red
            Show-Summary
            exit 1
        }
        return $false
    }
}

# Function to show summary
function Show-Summary {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "  Summary | 摘要"
    Write-Host "=========================================="
    Write-Host ""

    if ($script:Failed -eq 0) {
        Write-Host "[OK] All pre-release checks passed!" -ForegroundColor Green
        Write-Host "  Ready to release." -ForegroundColor Green
    }
    else {
        Write-Host "[X] $($script:Failed) check(s) failed!" -ForegroundColor Red
        Write-Host "  Please fix the issues above before releasing." -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "  Passed:  " -NoNewline
    Write-Host $script:Passed -ForegroundColor Green
    Write-Host "  Failed:  " -NoNewline
    Write-Host $script:Failed -ForegroundColor Red
    if ($script:Skipped -gt 0) {
        Write-Host "  Skipped: " -NoNewline
        Write-Host $script:Skipped -ForegroundColor Yellow
    }
    Write-Host ""
}

# Header
Write-Host ""
Write-Host "=========================================="
Write-Host "  Pre-release Check"
Write-Host "  發布前檢查"
Write-Host "=========================================="
Write-Host ""

if ($SkipTests) {
    Write-Host "Note: Tests will be skipped (-SkipTests)" -ForegroundColor Yellow
    Write-Host ""
}

# Change to root directory
Push-Location $RootDir

try {
    # Step 1: Git status
    Write-Host "[1/$Total] " -ForegroundColor Cyan -NoNewline
    Write-Host "Checking git status..."
    $gitStatus = git status --porcelain 2>&1
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "      " -NoNewline
        Write-Host "[OK] Working directory clean" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "      " -NoNewline
        Write-Host "[!] Uncommitted changes detected" -ForegroundColor Yellow
        Write-Host ""
        $gitStatus | ForEach-Object { Write-Host "      $_" }
        Write-Host ""
        Write-Host "      (This is a warning, not a failure)" -ForegroundColor Yellow
        $Passed++
    }

    # Step 2: Version sync
    Run-Check -Step 2 -Name "Running version sync check" -Command "$ScriptDir\check-version-sync.ps1"

    # Step 3: Standards sync
    Run-Check -Step 3 -Name "Running standards sync check" -Command "$ScriptDir\check-standards-sync.ps1"

    # Step 4: Translation sync
    Run-Check -Step 4 -Name "Running translation sync check" -Command "$ScriptDir\check-translation-sync.ps1"

    # Step 5: CLI-docs sync
    Run-Check -Step 5 -Name "Running CLI-docs sync check" -Command "$ScriptDir\check-cli-docs-sync.ps1"

    # Step 6: Documentation sync
    Run-Check -Step 6 -Name "Running documentation sync check" -Command "$ScriptDir\check-docs-sync.ps1"

    # Step 7: Linting
    Run-Check -Step 7 -Name "Running linting" -Command "npm run lint --prefix `"$CliDir`""

    # Step 8: Tests (unless skipped)
    if ($SkipTests) {
        $Skipped++
    }
    else {
        Run-Check -Step 8 -Name "Running tests" -Command "npm test --prefix `"$CliDir`""
    }

    # Show summary
    Show-Summary

    # Exit with appropriate code
    if ($Failed -gt 0) {
        exit 1
    }
    else {
        exit 0
    }
}
finally {
    Pop-Location
}
