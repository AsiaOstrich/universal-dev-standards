#
# AI Agent Sync Checker (PowerShell)
# AI Agent 同步檢查器 (PowerShell 版本)
#
# This script checks if AI Agent integration files maintain consistent
# core rules (Anti-Hallucination, SDD Priority, Commit Format).
#
# 此腳本檢查 AI Agent 整合檔案是否維持一致的核心規則
# （反幻覺、SDD 優先級、提交格式）。
#
# Usage: .\scripts\check-ai-agent-sync.ps1 [-Verbose] [-Json]
#
# Parameters:
#   -Verbose    Show detailed pattern matching
#   -Json       Output in JSON format
#

param(
    [switch]$Verbose,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$RegistryFile = Join-Path $RootDir "integrations\REGISTRY.json"

# Counters
$script:Errors = 0
$script:Warnings = 0
$script:Passed = 0
$script:Skipped = 0

# Define rule patterns
$RulePatterns = @{
    "AH-001" = "read.*file.*before|must.*read|MUST read files before|Evidence-Based"
    "AH-002" = "\[Source:|Source Attribution|cite.*source"
    "AH-003" = "\[Confirmed\]|\[Inferred\]|\[Assumption\]|\[Unknown\]|Certainty Classification"
    "AH-004" = "recommend.*option|Recommended.*choice|MUST.*recommend|explicitly state.*Recommended"
    "SDD-001" = "OpenSpec|Spec Kit|openspec/|specs/|\.speckit"
    "SDD-002" = "prioritize.*command|MUST prioritize|SDD.*Priority|Spec-Driven Development.*Priority"
    "CMT-001" = "type.*scope.*subject|<type>.*<scope>|Conventional Commits|feat.*fix.*docs"
}

$RuleSeverity = @{
    "AH-001" = "error"
    "AH-002" = "error"
    "AH-003" = "warning"
    "AH-004" = "warning"
    "SDD-001" = "error"
    "SDD-002" = "warning"
    "CMT-001" = "warning"
}

$RuleNames = @{
    "AH-001" = "Evidence-Based Analysis"
    "AH-002" = "Source Attribution"
    "AH-003" = "Certainty Classification"
    "AH-004" = "Recommendation Required"
    "SDD-001" = "SDD Tool Detection"
    "SDD-002" = "SDD Command Priority"
    "CMT-001" = "Conventional Commits Format"
}

# Define agents and their instruction files
$AgentFiles = @{
    "claude-code" = "CLAUDE.md"
    "opencode" = "integrations\opencode\AGENTS.md"
    "cursor" = "integrations\cursor\.cursorrules"
    "cline" = "integrations\cline\.clinerules"
    "windsurf" = "integrations\windsurf\.windsurfrules"
    "copilot" = "integrations\github-copilot\copilot-instructions.md"
    "codex" = "integrations\codex\AGENTS.md"
    "gemini-cli" = "integrations\gemini-cli\GEMINI.md"
    "antigravity" = "integrations\google-antigravity\INSTRUCTIONS.md"
}

$AgentTiers = @{
    "claude-code" = "complete"
    "opencode" = "complete"
    "cursor" = "partial"
    "cline" = "partial"
    "windsurf" = "partial"
    "copilot" = "partial"
    "codex" = "partial"
    "gemini-cli" = "preview"
    "antigravity" = "minimal"
}

# Define required rules per tier
$TierRequiredRules = @{
    "complete" = @("AH-001", "AH-002", "AH-003", "AH-004", "SDD-001", "SDD-002", "CMT-001")
    "partial" = @("AH-001", "AH-002", "AH-003", "AH-004", "SDD-001", "CMT-001")
    "minimal" = @("AH-001", "AH-002")
    "preview" = @("AH-001", "AH-002", "AH-003")
}

# Function to check a single rule in a file
function Test-Rule {
    param(
        [string]$FilePath,
        [string]$RuleId
    )

    $pattern = $RulePatterns[$RuleId]
    $content = Get-Content -Path $FilePath -Raw -ErrorAction SilentlyContinue

    if ($content -match $pattern) {
        return $true
    }
    return $false
}

# Function to check an agent
function Test-Agent {
    param(
        [string]$AgentId
    )

    $relativePath = $AgentFiles[$AgentId]
    $filePath = Join-Path $RootDir $relativePath
    $tier = $AgentTiers[$AgentId]
    $requiredRules = $TierRequiredRules[$tier]

    $agentErrors = 0
    $agentWarnings = 0
    $agentPassed = 0

    if (-not $Json) {
        Write-Host "Checking " -NoNewline -ForegroundColor Cyan
        Write-Host "$AgentId" -NoNewline -ForegroundColor White
        Write-Host " ($tier)" -ForegroundColor Cyan
    }

    # Check if file exists
    if (-not (Test-Path $filePath)) {
        if (-not $Json) {
            Write-Host "  [SKIP] File not found: $relativePath" -ForegroundColor Yellow
        }
        $script:Skipped++
        return
    }

    # Check each required rule
    foreach ($ruleId in $requiredRules) {
        $severity = $RuleSeverity[$ruleId]
        $ruleName = $RuleNames[$ruleId]

        if (Test-Rule -FilePath $filePath -RuleId $ruleId) {
            if (-not $Json -and $Verbose) {
                Write-Host "  [PASS] ${ruleId}: $ruleName" -ForegroundColor Green
            }
            $agentPassed++
            $script:Passed++
        }
        else {
            if ($severity -eq "error") {
                if (-not $Json) {
                    Write-Host "  [FAIL] ${ruleId}: $ruleName (required)" -ForegroundColor Red
                }
                $agentErrors++
                $script:Errors++
            }
            else {
                if (-not $Json) {
                    Write-Host "  [WARN] ${ruleId}: $ruleName (recommended)" -ForegroundColor Yellow
                }
                $agentWarnings++
                $script:Warnings++
            }
        }
    }

    # Summary for this agent
    if (-not $Json) {
        $total = $agentErrors + $agentWarnings + $agentPassed
        if ($agentErrors -eq 0 -and $agentWarnings -eq 0) {
            Write-Host "  ✓ All $total rules passed" -ForegroundColor Green
        }
        else {
            Write-Host "  Summary: " -NoNewline
            Write-Host "$agentPassed passed" -NoNewline -ForegroundColor Green
            Write-Host ", " -NoNewline
            Write-Host "$agentErrors errors" -NoNewline -ForegroundColor Red
            Write-Host ", " -NoNewline
            Write-Host "$agentWarnings warnings" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# Header
if (-not $Json) {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "  AI Agent Sync Checker"
    Write-Host "  AI Agent 同步檢查器"
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "Checking AI Agent rule compliance..." -ForegroundColor Blue
    Write-Host ""
}

# Check each agent
foreach ($agentId in $AgentFiles.Keys) {
    Test-Agent -AgentId $agentId
}

# Summary
$Total = $script:Errors + $script:Warnings + $script:Passed

if ($Json) {
    # JSON output
    $status = if ($script:Errors -eq 0) { "pass" } else { "fail" }
    $compliance = if ($Total -gt 0) { [math]::Round(($script:Passed * 100 / $Total), 1) } else { 0 }

    $output = @{
        status = $status
        summary = @{
            passed = $script:Passed
            errors = $script:Errors
            warnings = $script:Warnings
            skipped = $script:Skipped
            total = $Total
        }
        compliance = $compliance
    }
    $output | ConvertTo-Json
}
else {
    Write-Host "=========================================="
    Write-Host "  Summary | 摘要"
    Write-Host "=========================================="
    Write-Host ""

    # Calculate compliance percentage
    if ($Total -gt 0) {
        $Compliance = [math]::Round(($script:Passed * 100 / $Total), 1)
    }
    else {
        $Compliance = "N/A"
    }

    Write-Host "  Compliance: " -NoNewline
    Write-Host "${Compliance}%" -ForegroundColor White
    Write-Host ""
    Write-Host "  Passed:   $($script:Passed)" -ForegroundColor Green
    Write-Host "  Errors:   $($script:Errors)" -ForegroundColor Red
    Write-Host "  Warnings: $($script:Warnings)" -ForegroundColor Yellow
    Write-Host "  Skipped:  $($script:Skipped)" -ForegroundColor Cyan
    Write-Host ""

    if ($script:Errors -gt 0) {
        Write-Host "✗ Sync check failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "To fix errors:"
        Write-Host "  - Ensure each integration file contains all required rules"
        Write-Host "  - Reference: integrations\REGISTRY.json for rule patterns"
        Write-Host "  - Reference: core\anti-hallucination.md for rule definitions"
        Write-Host ""
        exit 1
    }
    elseif ($script:Warnings -gt 0) {
        Write-Host "⚠ Sync check passed with warnings" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    else {
        Write-Host "✓ All agents are in sync!" -ForegroundColor Green
        Write-Host ""
        exit 0
    }
}
