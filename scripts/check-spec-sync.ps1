<#
.SYNOPSIS
    Core↔Skill Sync Check Script
    Core↔Skill 同步檢查腳本

.DESCRIPTION
    This script checks the synchronization between Core Standards, Skills, and Commands.
    此腳本檢查 Core Standards、Skills 和 Commands 之間的同步狀態。

.PARAMETER Verbose
    Show verbose output including missing items

.EXAMPLE
    .\scripts\check-spec-sync.ps1
    .\scripts\check-spec-sync.ps1 -Verbose
#>

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$SkillsDir = Join-Path $RootDir "skills\claude-code"
$CoreDir = Join-Path $RootDir "core"
$CommandsDir = Join-Path $SkillsDir "commands"

# Counters
$Synced = 0
$Warnings = 0
$Errors = 0
$Unmapped = 0

# Define Skill ↔ Core Standard mappings
$SkillCoreMap = @{
    "commit-standards" = "commit-message-guide.md"
    "testing-guide" = "testing-standards.md"
    "checkin-assistant" = "checkin-standards.md"
    "code-review-assistant" = "code-review-checklist.md"
    "spec-driven-dev" = "spec-driven-development.md"
    "tdd-assistant" = "test-driven-development.md"
    "bdd-assistant" = "behavior-driven-development.md"
    "atdd-assistant" = "acceptance-test-driven-development.md"
    "documentation-guide" = "documentation-structure.md"
    "git-workflow-guide" = "git-workflow.md"
    "ai-collaboration-standards" = "anti-hallucination.md"
    "changelog-guide" = "changelog-standards.md"
    "logging-guide" = "logging-standards.md"
    "error-code-guide" = "error-code-standards.md"
    "project-structure-guide" = "project-structure.md"
    "refactoring-assistant" = "refactoring-standards.md"
    "test-coverage-assistant" = "test-completeness-dimensions.md"
    "reverse-engineer" = "reverse-engineering-standards.md"
    "forward-derivation" = "forward-derivation-standards.md"
    "ai-friendly-architecture" = "ai-friendly-architecture.md"
    "ai-instruction-standards" = "ai-instruction-standards.md"
    "release-standards" = "versioning.md"
}

# Define utility skills (no Core Standard needed)
# Note: requirement-assistant is marked as utility until a core/requirement-engineering.md is created
$UtilitySkills = @(
    "docs-generator"
    "methodology-system"
    "requirement-assistant"
)

# Define reference-only core standards (no Skill needed - Always-On Protocol or static reference)
# These standards have skillName: null in the registry and use .ai.yaml as self-sufficient rule engines
$ReferenceOnlyStandards = @(
    "developer-memory.md"
    "documentation-writing-standards.md"
    "ai-agreement-standards.md"
    "virtual-organization-standards.md"
    "security-standards.md"
    "performance-standards.md"
    "accessibility-standards.md"
)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Core↔Skill Sync Check"
Write-Host "  Core↔Skill 同步檢查"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if skill has SKILL.md
function Test-Skill {
    param([string]$SkillName)
    $SkillPath = Join-Path $SkillsDir "$SkillName\SKILL.md"
    return Test-Path $SkillPath
}

# Function to check if core standard exists
function Test-Core {
    param([string]$CoreFile)
    $CorePath = Join-Path $CoreDir $CoreFile
    return Test-Path $CorePath
}

# Check utility skills
Write-Host "Checking utility skills (no Core Standard required)..." -ForegroundColor Cyan
foreach ($skill in $UtilitySkills) {
    if (Test-Skill $skill) {
        Write-Host "  " -NoNewline
        Write-Host "✓" -ForegroundColor Green -NoNewline
        Write-Host " $skill " -NoNewline
        Write-Host "(utility, no core standard required)" -ForegroundColor Yellow
        $Warnings++
    } elseif ($Verbose) {
        Write-Host "  " -NoNewline
        Write-Host "⚠" -ForegroundColor Yellow -NoNewline
        Write-Host " $skill (utility skill not found)"
    }
}

# Check reference-only core standards (no Skill needed)
Write-Host ""
Write-Host "Checking reference-only standards (no Skill required)..." -ForegroundColor Cyan
foreach ($std in $ReferenceOnlyStandards) {
    if (Test-Core $std) {
        Write-Host "  " -NoNewline
        Write-Host "✓" -ForegroundColor Green -NoNewline
        Write-Host " core/$std " -NoNewline
        Write-Host "(reference-only, no skill required)" -ForegroundColor Yellow
    } elseif ($Verbose) {
        Write-Host "  " -NoNewline
        Write-Host "⚠" -ForegroundColor Yellow -NoNewline
        Write-Host " core/$std (reference-only standard not found)"
    }
}

Write-Host ""
Write-Host "Checking skill-to-core mappings..." -ForegroundColor Cyan

# Check skill-to-core mappings
foreach ($skill in $SkillCoreMap.Keys) {
    $coreFile = $SkillCoreMap[$skill]
    $skillExists = Test-Skill $skill
    $coreExists = Test-Core $coreFile

    if ($skillExists -and $coreExists) {
        Write-Host "  " -NoNewline
        Write-Host "✓" -ForegroundColor Green -NoNewline
        Write-Host " $skill ↔ core/$coreFile"
        $Synced++
    } elseif ($skillExists -and -not $coreExists) {
        Write-Host "  " -NoNewline
        Write-Host "✗" -ForegroundColor Red -NoNewline
        Write-Host " $skill → core/$coreFile " -NoNewline
        Write-Host "(core standard missing)" -ForegroundColor Red
        $Errors++
    } elseif (-not $skillExists -and $coreExists) {
        if ($Verbose) {
            Write-Host "  " -NoNewline
            Write-Host "⚠" -ForegroundColor Yellow -NoNewline
            Write-Host " core/$coreFile → $skill " -NoNewline
            Write-Host "(skill not yet created)" -ForegroundColor Yellow
        }
    } else {
        if ($Verbose) {
            Write-Host "  " -NoNewline
            Write-Host "-" -ForegroundColor Yellow -NoNewline
            Write-Host " $skill ↔ core/$coreFile (both missing)"
        }
    }
}

Write-Host ""

# Check for skills without mapping (potential issues)
Write-Host "Checking for unmapped skills..." -ForegroundColor Cyan

if (Test-Path $SkillsDir) {
    $skillDirs = Get-ChildItem -Path $SkillsDir -Directory

    foreach ($skillDir in $skillDirs) {
        $skillName = $skillDir.Name

        # Skip special directories
        if ($skillName -in @("commands", "agents", "workflows")) {
            continue
        }

        # Check if skill has SKILL.md
        $skillMdPath = Join-Path $skillDir.FullName "SKILL.md"
        if (-not (Test-Path $skillMdPath)) {
            continue
        }

        # Check if skill is in mapping or utility list
        $isMapped = $SkillCoreMap.ContainsKey($skillName) -or ($skillName -in $UtilitySkills)

        if (-not $isMapped) {
            Write-Host "  " -NoNewline
            Write-Host "⚠" -ForegroundColor Yellow -NoNewline
            Write-Host " $skillName " -NoNewline
            Write-Host "(not in mapping - add to SkillCoreMap or UtilitySkills)" -ForegroundColor Yellow
            $Unmapped++
        }
    }
}

if ($Unmapped -eq 0) {
    Write-Host "  " -NoNewline
    Write-Host "✓" -ForegroundColor Green -NoNewline
    Write-Host " All skills are mapped"
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Summary | 摘要"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($Errors -eq 0) {
    Write-Host "✓ Core↔Skill sync check passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Core↔Skill sync check failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Synced:   " -NoNewline
Write-Host "$Synced" -ForegroundColor Green
Write-Host "  Warnings: " -NoNewline
Write-Host "$Warnings" -ForegroundColor Yellow -NoNewline
Write-Host " (utility skills)"
Write-Host "  Errors:   " -NoNewline
Write-Host "$Errors" -ForegroundColor Red
if ($Unmapped -gt 0) {
    Write-Host "  Unmapped: " -NoNewline
    Write-Host "$Unmapped" -ForegroundColor Yellow
}
Write-Host ""

# Exit with error if there are errors
if ($Errors -gt 0) {
    exit 1
}

exit 0
