#!/usr/bin/env pwsh
#
# Universal Dev Skills - Installation Script (PowerShell Version)
# https://github.com/AsiaOstrich/universal-dev-standards/tree/main/skills/claude-code
#
# Usage: .\install.ps1
#
# ⚠️  DEPRECATED: This script is deprecated and will be removed in a future version.
#     Please use the Plugin Marketplace instead:
#
#     /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md
#
#     Benefits of Plugin Marketplace:
#     - Automatic updates on Claude Code restart
#     - Better integration with Claude Code
#     - No manual git pull required
#

$ErrorActionPreference = "Stop"

$SkillsDir = Join-Path $env:USERPROFILE ".claude" "skills"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=================================="
Write-Host "Universal Dev Skills Installer"
Write-Host "=================================="
Write-Host ""
Write-Host "⚠️  DEPRECATED: This installation method is deprecated." -ForegroundColor Yellow
Write-Host ""
Write-Host "Recommended: Use Plugin Marketplace instead:"
Write-Host "  /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Benefits:"
Write-Host "  • Automatic updates on Claude Code restart"
Write-Host "  • Better integration with Claude Code"
Write-Host "  • No manual git pull required"
Write-Host ""
$confirm = Read-Host "Continue with manual installation anyway? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host ""
    Write-Host "Installation cancelled. Use Plugin Marketplace for the best experience." -ForegroundColor Green
    exit 0
}
Write-Host ""

# Create skills directory if it doesn't exist
if (-not (Test-Path $SkillsDir)) {
    New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
}

# List of available skills (15 total)
$Skills = @(
    "ai-collaboration-standards"
    "changelog-guide"
    "code-review-assistant"
    "commit-standards"
    "documentation-guide"
    "error-code-guide"
    "git-workflow-guide"
    "logging-guide"
    "project-structure-guide"
    "release-standards"
    "requirement-assistant"
    "spec-driven-dev"
    "tdd-assistant"
    "test-coverage-assistant"
    "testing-guide"
)

Write-Host "Available skills:"
for ($i = 0; $i -lt $Skills.Count; $i++) {
    Write-Host "  [$($i + 1)] $($Skills[$i])"
}
Write-Host "  [A] All skills"
Write-Host ""

$selection = Read-Host "Select skills to install (e.g., 1,2,3 or A for all)"

$selectedSkills = @()

if ($selection -eq "A" -or $selection -eq "a") {
    $selectedSkills = $Skills
}
else {
    $indices = $selection -split "," | ForEach-Object { $_.Trim() }
    foreach ($index in $indices) {
        if ($index -match '^\d+$') {
            $idx = [int]$index - 1
            if ($idx -ge 0 -and $idx -lt $Skills.Count) {
                $selectedSkills += $Skills[$idx]
            }
        }
    }
}

if ($selectedSkills.Count -eq 0) {
    Write-Host "No valid skills selected. Exiting." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing skills to: " -NoNewline
Write-Host $SkillsDir -ForegroundColor Cyan
Write-Host ""

foreach ($skill in $selectedSkills) {
    $skillPath = Join-Path $ScriptDir $skill
    if (Test-Path $skillPath -PathType Container) {
        Write-Host "  Installing: " -NoNewline
        Write-Host $skill -ForegroundColor Green
        Copy-Item -Path $skillPath -Destination $SkillsDir -Recurse -Force
    }
    else {
        Write-Host "  Warning: $skill not found, skipping" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Skills installed to: $SkillsDir"
Write-Host ""
Write-Host "To verify installation, run:"
Write-Host "  Get-ChildItem $SkillsDir" -ForegroundColor Cyan
Write-Host ""
