#!/usr/bin/env pwsh
#
# Documentation Integrity Checker (PowerShell Version)
# 文件完整性檢查器 (PowerShell 版本)
#
# This script checks documentation accuracy and consistency across the project.
#
# Checks:
# 1. Command Table Coverage - skills/README.md lists all expected commands
# 2. Markdown Link Validation - internal links point to existing files/anchors
# 3. Feature Count Accuracy - claimed numbers match actual file counts
# 4. Cross-Language Table Parity - translation tables match EN source row counts
#
# Usage: .\scripts\check-docs-integrity.ps1
#

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# Get script directory and paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

# Counters
$script:Errors = 0
$script:Warnings = 0

Write-Host ""
Write-Host "=========================================="
Write-Host "  Documentation Integrity Checker"
Write-Host "  文件完整性檢查器"
Write-Host "=========================================="
Write-Host ""

# =============================================================================
# Check 1/4: Command Table Coverage / 命令表覆蓋
# =============================================================================

Write-Host "[1/4] Command Table Coverage / 命令表覆蓋" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

$AgentPathsFile = Join-Path $RootDir "cli\src\config\ai-agent-paths.js"
$SkillsReadme = Join-Path $RootDir "skills\README.md"

if (-not (Test-Path $AgentPathsFile)) {
    Write-Host "  [ERROR] ai-agent-paths.js not found" -ForegroundColor Red
    $script:Errors++
}
elseif (-not (Test-Path $SkillsReadme)) {
    Write-Host "  [ERROR] skills/README.md not found" -ForegroundColor Red
    $script:Errors++
}
else {
    $content = Get-Content $AgentPathsFile -Raw
    $block = [regex]::Match($content, "export const AVAILABLE_COMMANDS = \[[\s\S]*?\];").Value
    $nameMatches = [regex]::Matches($block, "name: '([^']+)'")

    $allCommands = @()
    foreach ($match in $nameMatches) {
        $allCommands += $match.Groups[1].Value
    }
    $allCommands = $allCommands | Sort-Object -Unique

    # CLI management and sub-commands to exclude
    $cliManagement = @("init", "update", "check", "config")

    $expectedCommands = @()
    foreach ($cmd in $allCommands) {
        if ($cliManagement -contains $cmd) { continue }
        if ($cmd -match "-") { continue }
        $expectedCommands += $cmd
    }

    # Extract commands from skills/README.md table
    $readmeContent = Get-Content $SkillsReadme -Raw
    $tableCommands = [regex]::Matches($readmeContent, '`/([a-z]+)`') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

    Write-Host "  Checking skills/README.md command table:" -ForegroundColor Cyan

    $missingCount = 0
    foreach ($cmd in $expectedCommands) {
        if ($tableCommands -notcontains $cmd) {
            Write-Host "  [ERROR] Command '/$cmd' missing from skills/README.md table" -ForegroundColor Red
            $script:Errors++
            $missingCount++
        }
    }

    if ($missingCount -eq 0) {
        Write-Host "  [OK] All $($expectedCommands.Count) expected commands listed in skills/README.md" -ForegroundColor Green
    }

    # Check for extra commands
    $extraCount = 0
    foreach ($tableCmd in $tableCommands) {
        if ($allCommands -notcontains $tableCmd) {
            Write-Host "  [WARN] Command '/$tableCmd' in skills/README.md but not in AVAILABLE_COMMANDS" -ForegroundColor Yellow
            $script:Warnings++
            $extraCount++
        }
    }

    if ($extraCount -eq 0 -and $missingCount -eq 0) {
        Write-Host "  [OK] No extraneous commands in table" -ForegroundColor Green
    }

    # Check adoption/DAILY-WORKFLOW-GUIDE.md
    $DailyGuide = Join-Path $RootDir "adoption\DAILY-WORKFLOW-GUIDE.md"
    if (Test-Path $DailyGuide) {
        Write-Host ""
        Write-Host "  Checking adoption/DAILY-WORKFLOW-GUIDE.md:" -ForegroundColor Cyan
        $guideContent = Get-Content $DailyGuide -Raw
        $guideCommands = [regex]::Matches($guideContent, '`/([a-z]+)`') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

        $guideInvalid = 0
        foreach ($guideCmd in $guideCommands) {
            if ($allCommands -notcontains $guideCmd) {
                Write-Host "  [WARN] Command '/$guideCmd' in DAILY-WORKFLOW-GUIDE.md but not in AVAILABLE_COMMANDS" -ForegroundColor Yellow
                $script:Warnings++
                $guideInvalid++
            }
        }

        if ($guideInvalid -eq 0) {
            Write-Host "  [OK] All commands in DAILY-WORKFLOW-GUIDE.md are valid" -ForegroundColor Green
        }
    }
}

Write-Host ""

# =============================================================================
# Check 2/4: Markdown Link Validation / Markdown 連結驗證
# =============================================================================

Write-Host "[2/4] Markdown Link Validation / Markdown 連結驗證" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

function Convert-HeadingToAnchor {
    param([string]$Heading)
    $anchor = $Heading -replace '^#{1,6}\s+', ''
    $anchor = $anchor.ToLower()
    $anchor = $anchor -replace '[^a-zA-Z0-9 _-]', ''
    $anchor = $anchor -replace '\s+', ' '
    $anchor = $anchor.Trim()
    $anchor = $anchor -replace ' ', '-'
    return $anchor
}

# Cache for file anchors
$anchorCache = @{}

function Get-FileAnchors {
    param([string]$FilePath)

    if ($anchorCache.ContainsKey($FilePath)) {
        return $anchorCache[$FilePath]
    }

    $anchors = @()
    $lines = Get-Content $FilePath -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        if ($line -match '^#{1,6}\s') {
            $anchor = Convert-HeadingToAnchor $line
            if ($anchor) {
                $anchors += $anchor
            }
        }
    }

    $anchorCache[$FilePath] = $anchors
    return $anchors
}

$linkErrors = 0
$linkWarnings = 0
$filesChecked = 0

function Test-PlaceholderLink {
    param([string]$Target)
    if ($Target -match '^path/') { return $true }
    if ($Target -eq 'link') { return $true }
    if ($Target -eq 'params') { return $true }
    if ($Target -match 'old-path') { return $true }
    if ($Target -match 'your-') { return $true }
    if ($Target -match 'example') { return $true }
    return $false
}

function Get-LinksOutsideCodeBlocks {
    param([string]$FilePath)
    $lines = Get-Content $FilePath -ErrorAction SilentlyContinue
    $inCodeBlock = $false
    $links = @()

    foreach ($line in $lines) {
        if ($line -match '^```') {
            $inCodeBlock = -not $inCodeBlock
            continue
        }
        if ($inCodeBlock) { continue }

        $lineMatches = [regex]::Matches($line, '\[[^\]]*\]\(([^)]+)\)')
        foreach ($m in $lineMatches) {
            $links += $m.Groups[1].Value
        }
    }
    return $links
}

$mdFiles = Get-ChildItem -Path $RootDir -Filter "*.md" -Recurse -File |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "[\\/]\.git[\\/]" -and
        $_.FullName -notmatch "[\\/]cli[\\/]bundled[\\/]" -and
        $_.Name -notmatch "template" -and
        $_.Name -notmatch "TEMPLATE"
    }

foreach ($mdFile in $mdFiles) {
    $filesChecked++
    $fileDir = $mdFile.DirectoryName
    $relPath = $mdFile.FullName.Replace("$RootDir\", "").Replace("$RootDir/", "")

    $linkTargets = Get-LinksOutsideCodeBlocks $mdFile.FullName

    foreach ($linkTarget in $linkTargets) {
        # Skip external links, mailto, and anchor-only
        if ($linkTarget -match '^https?://') { continue }
        if ($linkTarget -match '^mailto:') { continue }
        if ($linkTarget -match '^#') { continue }

        # Skip placeholder/example links
        if (Test-PlaceholderLink $linkTarget) { continue }

        # Split path and anchor
        $parts = $linkTarget -split '#', 2
        $filePath = $parts[0]
        $anchor = if ($parts.Count -gt 1) { $parts[1] } else { $null }

        if (-not $filePath) { continue }

        # Resolve relative path
        $resolvedPath = Join-Path $fileDir $filePath
        try {
            $resolvedPath = [System.IO.Path]::GetFullPath($resolvedPath)
        } catch { }

        # Check if target exists (WARNING, not ERROR — many pre-existing broken links)
        if (-not (Test-Path $resolvedPath)) {
            Write-Host "  [WARN] Broken link in ${relPath}: $linkTarget" -ForegroundColor Yellow
            $script:Warnings++
            $linkWarnings++
            continue
        }

        # Check anchor if present and target is a file
        if ($anchor -and (Test-Path $resolvedPath -PathType Leaf)) {
            $anchors = Get-FileAnchors $resolvedPath
            if ($anchors -notcontains $anchor) {
                Write-Host "  [WARN] Anchor '#$anchor' not found in target: $relPath -> $linkTarget" -ForegroundColor Yellow
                $script:Warnings++
                $linkWarnings++
            }
        }
    }
}

if ($linkErrors -eq 0 -and $linkWarnings -eq 0) {
    Write-Host "  [OK] All internal links valid across $filesChecked files" -ForegroundColor Green
}
else {
    Write-Host "  Checked $filesChecked files: $linkErrors error(s), $linkWarnings warning(s)"
}

Write-Host ""

# =============================================================================
# Check 3/4: Feature Count Accuracy / 功能數量準確性
# =============================================================================

Write-Host "[3/4] Feature Count Accuracy / 功能數量準確性" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

$coreDir = Join-Path $RootDir "core"
$skillsDir = Join-Path $RootDir "skills"
$commandsDir = Join-Path $RootDir "skills\commands"

$actualCore = (Get-ChildItem -Path $coreDir -Filter "*.md" -File | Where-Object { $_.DirectoryName -eq $coreDir }).Count
$actualSkills = (Get-ChildItem -Path $skillsDir -Filter "SKILL.md" -Recurse -File | Where-Object {
    $_.DirectoryName -ne $skillsDir
}).Count
$actualCommands = (Get-ChildItem -Path $commandsDir -Filter "*.md" -File |
    Where-Object { $_.BaseName -ne "README" -and $_.BaseName -ne "COMMAND-FAMILY-OVERVIEW" }).Count

Write-Host "  Actual counts:" -ForegroundColor Cyan
Write-Host "    Core standards:  $actualCore"
Write-Host "    Skills:          $actualSkills"
Write-Host "    Slash commands:  $actualCommands"
Write-Host ""

$countErrors = 0

function Check-CountClaim {
    param(
        [string]$File,
        [string]$Pattern,
        [int]$Expected,
        [string]$Label
    )

    if (-not (Test-Path $File)) { return }

    $relFile = $File.Replace("$RootDir\", "").Replace("$RootDir/", "")
    $content = Get-Content $File -Raw

    $matchResult = [regex]::Match($content, $Pattern)
    if (-not $matchResult.Success) { return }

    $line = $matchResult.Value
    $numberMatch = [regex]::Match($line, '\d+')
    if (-not $numberMatch.Success) { return }

    $claimed = [int]$numberMatch.Value

    if ($claimed -ne $Expected) {
        Write-Host "  [ERROR] ${relFile}: claims $claimed $Label, actual is $Expected" -ForegroundColor Red
        $script:Errors++
        $script:countErrors++
    }
    else {
        Write-Host "  [OK] ${relFile}: $Label count ($claimed) is accurate" -ForegroundColor Green
    }
}

Write-Host "  Verifying documented counts:" -ForegroundColor Cyan

# README.md
Check-CountClaim -File (Join-Path $RootDir "README.md") `
    -Pattern "Core Standards.*\|\s*\d+" -Expected $actualCore -Label "core standards"
Check-CountClaim -File (Join-Path $RootDir "README.md") `
    -Pattern "AI Skills.*\|\s*\d+" -Expected $actualSkills -Label "skills"

# CLAUDE.md
Check-CountClaim -File (Join-Path $RootDir "CLAUDE.md") `
    -Pattern "Core Standards.*core.*\d+ fundamental" -Expected $actualCore -Label "core standards"

# locales/zh-TW/CLAUDE.md
Check-CountClaim -File (Join-Path $RootDir "locales\zh-TW\CLAUDE.md") `
    -Pattern "核心規範.*core.*\d+" -Expected $actualCore -Label "core standards"

# locales/zh-CN/CLAUDE.md
Check-CountClaim -File (Join-Path $RootDir "locales\zh-CN\CLAUDE.md") `
    -Pattern "核心规范.*core.*\d+" -Expected $actualCore -Label "core standards"

if ($script:countErrors -eq 0) {
    Write-Host "  [OK] All feature counts are accurate" -ForegroundColor Green
}

Write-Host ""

# =============================================================================
# Check 4/4: Cross-Language Table Parity / 跨語言表格一致性
# =============================================================================

Write-Host "[4/4] Cross-Language Table Parity / 跨語言表格一致性" -ForegroundColor Blue
Write-Host "----------------------------------------"
Write-Host ""

function Get-TableRowCount {
    param(
        [string]$File,
        [int]$TableIndex
    )

    $lines = Get-Content $File
    $inTable = $false
    $currentTable = 0
    $rowCount = 0

    foreach ($line in $lines) {
        if ($line -match '^\|') {
            if (-not $inTable) {
                $inTable = $true
                $currentTable++
                $rowCount = 0
            }
            # Skip header separator lines
            if ($line -notmatch '^\|\s*[-:]+\s*\|') {
                $rowCount++
            }
        }
        else {
            if ($inTable) {
                if ($currentTable -eq $TableIndex) {
                    # Subtract 1 for header row
                    return [Math]::Max(0, $rowCount - 1)
                }
                $inTable = $false
            }
        }
    }

    # Handle table at end of file
    if ($inTable -and $currentTable -eq $TableIndex) {
        return [Math]::Max(0, $rowCount - 1)
    }

    return 0
}

function Get-TableCount {
    param([string]$File)

    $lines = Get-Content $File
    $inTable = $false
    $tableCount = 0

    foreach ($line in $lines) {
        if ($line -match '^\|') {
            if (-not $inTable) {
                $inTable = $true
                $tableCount++
            }
        }
        else {
            $inTable = $false
        }
    }

    return $tableCount
}

function Check-TableParity {
    param(
        [string]$EnFile,
        [string]$TransFile
    )

    $relEn = $EnFile.Replace("$RootDir\", "").Replace("$RootDir/", "")
    $relTrans = $TransFile.Replace("$RootDir\", "").Replace("$RootDir/", "")

    if (-not (Test-Path $EnFile)) {
        Write-Host "  [WARN] EN file not found: $relEn" -ForegroundColor Yellow
        $script:Warnings++
        return
    }

    if (-not (Test-Path $TransFile)) {
        Write-Host "  [WARN] Translation file not found: $relTrans" -ForegroundColor Yellow
        $script:Warnings++
        return
    }

    $enTables = Get-TableCount $EnFile
    $parityOk = $true

    for ($i = 1; $i -le $enTables; $i++) {
        $enRows = Get-TableRowCount -File $EnFile -TableIndex $i
        $transRows = Get-TableRowCount -File $TransFile -TableIndex $i

        if ($enRows -ne $transRows) {
            Write-Host "  [WARN] Table #$i row mismatch: $relEn ($enRows rows) vs $relTrans ($transRows rows)" -ForegroundColor Yellow
            $script:Warnings++
            $parityOk = $false
        }
    }

    if ($parityOk) {
        Write-Host "  [OK] $relEn <-> $relTrans ($enTables tables match)" -ForegroundColor Green
    }
}

# File pairs to check
$filePairs = @(
    @("skills\README.md", "locales\zh-TW\skills\README.md"),
    @("skills\README.md", "locales\zh-CN\skills\README.md"),
    @("adoption\DAILY-WORKFLOW-GUIDE.md", "locales\zh-TW\adoption\DAILY-WORKFLOW-GUIDE.md"),
    @("adoption\DAILY-WORKFLOW-GUIDE.md", "locales\zh-CN\adoption\DAILY-WORKFLOW-GUIDE.md"),
    @("docs\CHEATSHEET.md", "locales\zh-TW\docs\CHEATSHEET.md"),
    @("docs\CHEATSHEET.md", "locales\zh-CN\docs\CHEATSHEET.md"),
    @("docs\FEATURE-REFERENCE.md", "locales\zh-TW\docs\FEATURE-REFERENCE.md"),
    @("docs\FEATURE-REFERENCE.md", "locales\zh-CN\docs\FEATURE-REFERENCE.md")
)

foreach ($pair in $filePairs) {
    Check-TableParity -EnFile (Join-Path $RootDir $pair[0]) -TransFile (Join-Path $RootDir $pair[1])
}

Write-Host ""

# =============================================================================
# Summary
# =============================================================================

Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($script:Errors -gt 0 -or $script:Warnings -gt 0) {
    if ($script:Errors -gt 0) {
        Write-Host "Errors: $($script:Errors)" -ForegroundColor Red
    }
    if ($script:Warnings -gt 0) {
        Write-Host "Warnings: $($script:Warnings)" -ForegroundColor Yellow
    }
    Write-Host ""

    if ($script:Errors -gt 0) {
        Write-Host "Documentation integrity check failed with $($script:Errors) error(s)" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "Documentation integrity check passed (with $($script:Warnings) warning(s))" -ForegroundColor Green
        exit 0
    }
}
else {
    Write-Host "All documentation integrity checks passed!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
