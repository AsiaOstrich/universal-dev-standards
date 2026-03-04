#!/usr/bin/env pwsh
#
# Skill Next Steps Guidance Sync Checker (PowerShell Version)
# 技能「下一步引導」同步檢查器 (PowerShell 版本)
#
# Checks if English SKILL.md files containing "## Next Steps Guidance"
# have corresponding sections in zh-TW and zh-CN translations.
#
# Usage: .\scripts\check-skill-next-steps-sync.ps1
#

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

$SkillsDir = Join-Path $RootDir "skills"
$ZhTwDir = Join-Path $RootDir "locales" "zh-TW" "skills"
$ZhCnDir = Join-Path $RootDir "locales" "zh-CN" "skills"

# Counters
$Synced = 0
$Warnings = 0
$Total = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Skill Next Steps Guidance Sync Check"
Write-Host "  技能下一步引導同步檢查"
Write-Host "=========================================="
Write-Host ""
Write-Host "Checking Next Steps Guidance sync..."
Write-Host ""

# Find all English SKILL.md files with Next Steps Guidance
Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
    $skillName = $_.Name
    $enFile = Join-Path $_.FullName "SKILL.md"

    # Skip if no SKILL.md
    if (-not (Test-Path $enFile)) { return }

    # Check if English file has Next Steps Guidance
    $enContent = Get-Content $enFile -Raw -ErrorAction SilentlyContinue
    if ($enContent -notmatch "## Next Steps Guidance") { return }

    $script:Total++

    # Check zh-TW
    $twFile = Join-Path $ZhTwDir $skillName "SKILL.md"
    $twStatus = "X"
    $twNote = ""
    if (-not (Test-Path $twFile)) {
        $twNote = "(no translation file)"
    }
    else {
        $twContent = Get-Content $twFile -Raw -ErrorAction SilentlyContinue
        if ($twContent -match "## 下一步引導|## Next Steps Guidance") {
            $twStatus = "OK"
        }
        else {
            $twNote = "(missing section)"
        }
    }

    # Check zh-CN
    $cnFile = Join-Path $ZhCnDir $skillName "SKILL.md"
    $cnStatus = "X"
    $cnNote = ""
    if (-not (Test-Path $cnFile)) {
        $cnNote = "(no translation file)"
    }
    else {
        $cnContent = Get-Content $cnFile -Raw -ErrorAction SilentlyContinue
        if ($cnContent -match "## 下一步引导|## Next Steps Guidance") {
            $cnStatus = "OK"
        }
        else {
            $cnNote = "(missing section)"
        }
    }

    # Determine overall status
    if ($twStatus -eq "OK" -and $cnStatus -eq "OK") {
        Write-Host "  " -NoNewline
        Write-Host "[OK]" -ForegroundColor Green -NoNewline
        Write-Host " ${skillName}: EN OK | zh-TW OK | zh-CN OK"
        $script:Synced++
    }
    elseif ($cnNote -eq "(no translation file)" -or $twNote -eq "(no translation file)") {
        Write-Host "  " -NoNewline
        Write-Host "[!]" -ForegroundColor Yellow -NoNewline
        Write-Host " ${skillName}: EN OK | zh-TW $twStatus $twNote | zh-CN $cnStatus $cnNote"
        $script:Warnings++
        $script:Synced++
    }
    else {
        Write-Host "  " -NoNewline
        Write-Host "[X]" -ForegroundColor Red -NoNewline
        Write-Host " ${skillName}: EN OK | zh-TW $twStatus $twNote | zh-CN $cnStatus $cnNote"
    }
}

Write-Host ""
Write-Host "=========================================="

$FailedCount = $Total - $Synced

if ($FailedCount -eq 0) {
    if ($Warnings -gt 0) {
        Write-Host "Summary: $Synced/$Total synced" -ForegroundColor Green -NoNewline
        Write-Host ", $Warnings warning(s) (missing translation file)" -ForegroundColor Yellow
    }
    else {
        Write-Host "Summary: $Synced/$Total synced" -ForegroundColor Green
    }
    Write-Host ""
    exit 0
}
else {
    Write-Host "Summary: $Synced/$Total synced, $FailedCount failed" -ForegroundColor Red
    Write-Host ""
    exit 1
}
