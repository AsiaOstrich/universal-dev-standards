#
# Scope Consistency Check Script (PowerShell)
# Scope 一致性檢查腳本 (PowerShell)
#
# This script verifies that all Skills and Core Standards have valid scope markers.
# 此腳本驗證所有 Skills 和 Core Standards 都有有效的 scope 標記。
#
# Valid scope values: universal, partial, uds-specific
# 有效的 scope 值：universal, partial, uds-specific
#
# Usage: .\scripts\check-scope-sync.ps1 [-Verbose]
#

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$SkillsDir = Join-Path $RootDir "skills\claude-code"
$CoreDir = Join-Path $RootDir "core"

# Valid scope values
$ValidScopes = @("universal", "partial", "uds-specific")

# Counters
$SkillsTotal = 0
$SkillsValid = 0
$SkillsMissing = 0
$SkillsInvalid = 0
$CoreTotal = 0
$CoreValid = 0
$CoreMissing = 0
$CoreInvalid = 0

# Scope distribution counters
$SkillsUniversal = 0
$SkillsPartial = 0
$SkillsUdsSpecific = 0
$CoreUniversal = 0
$CorePartial = 0
$CoreUdsSpecific = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Scope Consistency Check"
Write-Host "  Scope 一致性檢查"
Write-Host "=========================================="
Write-Host ""

# Function to check if a value is a valid scope
function Test-ValidScope {
    param([string]$Value)
    return $ValidScopes -contains $Value
}

# Function to extract scope from Skill YAML frontmatter
function Get-SkillScope {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw
    if ($content -match '(?s)^---\s*\n(.*?)\n---') {
        $frontmatter = $matches[1]
        if ($frontmatter -match '(?m)^scope:\s*(.+)$') {
            return $matches[1].Trim()
        }
    }
    return $null
}

# Function to extract scope from Core Standard markdown
function Get-CoreScope {
    param([string]$FilePath)

    $content = Get-Content $FilePath
    foreach ($line in $content) {
        if ($line -match '^\*\*Scope\*\*:\s*(.+)$') {
            return $matches[1].Trim()
        }
    }
    return $null
}

# Check Skills
Write-Host "Checking Skills scope markers..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $SkillsDir) {
    $skillDirs = Get-ChildItem -Path $SkillsDir -Directory | Where-Object {
        $_.Name -notin @("commands", "agents", "workflows")
    }

    foreach ($skillDir in $skillDirs) {
        $skillFile = Join-Path $skillDir.FullName "SKILL.md"

        if (Test-Path $skillFile) {
            $SkillsTotal++
            $scope = Get-SkillScope $skillFile

            if ([string]::IsNullOrEmpty($scope)) {
                Write-Host "  X $($skillDir.Name) (scope field missing)" -ForegroundColor Red
                $SkillsMissing++
            }
            elseif (Test-ValidScope $scope) {
                if ($Verbose) {
                    Write-Host "  ✓ $($skillDir.Name) → " -NoNewline -ForegroundColor Green
                    Write-Host $scope -ForegroundColor Blue
                }
                $SkillsValid++

                switch ($scope) {
                    "universal" { $SkillsUniversal++ }
                    "partial" { $SkillsPartial++ }
                    "uds-specific" { $SkillsUdsSpecific++ }
                }
            }
            else {
                Write-Host "  X $($skillDir.Name) (invalid scope: '$scope')" -ForegroundColor Red
                $SkillsInvalid++
            }
        }
    }
}

if ($SkillsMissing -eq 0 -and $SkillsInvalid -eq 0) {
    Write-Host "  ✓ All $SkillsTotal Skills have valid scope markers" -ForegroundColor Green
}

Write-Host ""

# Check Core Standards
Write-Host "Checking Core Standards scope markers..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $CoreDir) {
    $coreFiles = Get-ChildItem -Path $CoreDir -Filter "*.md"

    foreach ($coreFile in $coreFiles) {
        $CoreTotal++
        $scope = Get-CoreScope $coreFile.FullName

        if ([string]::IsNullOrEmpty($scope)) {
            Write-Host "  X $($coreFile.Name) (Scope field missing)" -ForegroundColor Red
            $CoreMissing++
        }
        elseif (Test-ValidScope $scope) {
            if ($Verbose) {
                Write-Host "  ✓ $($coreFile.Name) → " -NoNewline -ForegroundColor Green
                Write-Host $scope -ForegroundColor Blue
            }
            $CoreValid++

            switch ($scope) {
                "universal" { $CoreUniversal++ }
                "partial" { $CorePartial++ }
                "uds-specific" { $CoreUdsSpecific++ }
            }
        }
        else {
            Write-Host "  X $($coreFile.Name) (invalid scope: '$scope')" -ForegroundColor Red
            $CoreInvalid++
        }
    }
}

if ($CoreMissing -eq 0 -and $CoreInvalid -eq 0) {
    Write-Host "  ✓ All $CoreTotal Core Standards have valid scope markers" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

$TotalErrors = $SkillsMissing + $SkillsInvalid + $CoreMissing + $CoreInvalid

if ($TotalErrors -eq 0) {
    Write-Host "✓ Scope consistency check passed!" -ForegroundColor Green
}
else {
    Write-Host "X Scope consistency check failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Skills:" -ForegroundColor White
Write-Host "  Total:        $SkillsTotal"
Write-Host "  Valid:        " -NoNewline
Write-Host $SkillsValid -ForegroundColor Green
Write-Host "  Missing:      " -NoNewline
Write-Host $SkillsMissing -ForegroundColor Red
Write-Host "  Invalid:      " -NoNewline
Write-Host $SkillsInvalid -ForegroundColor Red
Write-Host ""
Write-Host "Core Standards:" -ForegroundColor White
Write-Host "  Total:        $CoreTotal"
Write-Host "  Valid:        " -NoNewline
Write-Host $CoreValid -ForegroundColor Green
Write-Host "  Missing:      " -NoNewline
Write-Host $CoreMissing -ForegroundColor Red
Write-Host "  Invalid:      " -NoNewline
Write-Host $CoreInvalid -ForegroundColor Red
Write-Host ""

# Scope distribution
Write-Host "Scope Distribution:" -ForegroundColor White
Write-Host ""
Write-Host "  Skills:" -ForegroundColor Cyan
$SkillsUniversalPct = if ($SkillsTotal -gt 0) { [math]::Round($SkillsUniversal * 100 / $SkillsTotal) } else { 0 }
$SkillsPartialPct = if ($SkillsTotal -gt 0) { [math]::Round($SkillsPartial * 100 / $SkillsTotal) } else { 0 }
$SkillsUdsSpecificPct = if ($SkillsTotal -gt 0) { [math]::Round($SkillsUdsSpecific * 100 / $SkillsTotal) } else { 0 }
Write-Host "    universal:    " -NoNewline
Write-Host "$SkillsUniversal ($SkillsUniversalPct%)" -ForegroundColor Green
Write-Host "    partial:      " -NoNewline
Write-Host "$SkillsPartial ($SkillsPartialPct%)" -ForegroundColor Yellow
Write-Host "    uds-specific: " -NoNewline
Write-Host "$SkillsUdsSpecific ($SkillsUdsSpecificPct%)" -ForegroundColor Blue
Write-Host ""
Write-Host "  Core Standards:" -ForegroundColor Cyan
$CoreUniversalPct = if ($CoreTotal -gt 0) { [math]::Round($CoreUniversal * 100 / $CoreTotal) } else { 0 }
$CorePartialPct = if ($CoreTotal -gt 0) { [math]::Round($CorePartial * 100 / $CoreTotal) } else { 0 }
$CoreUdsSpecificPct = if ($CoreTotal -gt 0) { [math]::Round($CoreUdsSpecific * 100 / $CoreTotal) } else { 0 }
Write-Host "    universal:    " -NoNewline
Write-Host "$CoreUniversal ($CoreUniversalPct%)" -ForegroundColor Green
Write-Host "    partial:      " -NoNewline
Write-Host "$CorePartial ($CorePartialPct%)" -ForegroundColor Yellow
Write-Host "    uds-specific: " -NoNewline
Write-Host "$CoreUdsSpecific ($CoreUdsSpecificPct%)" -ForegroundColor Blue
Write-Host ""

# Exit with error if there are issues
if ($TotalErrors -gt 0) {
    exit 1
}

exit 0
