<#
.SYNOPSIS
    Check if usage documentation needs to be regenerated

.DESCRIPTION
    Verifies that FEATURE-REFERENCE.md and CHEATSHEET.md are in sync
    with source files (skills, commands, agents, standards, etc.)

.PARAMETER Fix
    Regenerate documentation if out of sync

.PARAMETER Verbose
    Show detailed output

.EXAMPLE
    .\scripts\check-usage-docs-sync.ps1
    # Check sync status

.EXAMPLE
    .\scripts\check-usage-docs-sync.ps1 -Fix
    # Regenerate if needed
#>

param(
    [switch]$Fix,
    [switch]$VerboseOutput
)

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Get project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-ColorOutput "━━━ Usage Documentation Sync Check ━━━" $Cyan
Write-Host ""

Set-Location $ProjectRoot

# Check if generator script exists
$GeneratorScript = Join-Path $ProjectRoot "scripts\generate-usage-docs.mjs"
if (-not (Test-Path $GeneratorScript)) {
    Write-ColorOutput "✗ Generator script not found: scripts\generate-usage-docs.mjs" $Red
    exit 1
}

# Check if output files exist
$DocsFiles = @(
    "docs\FEATURE-REFERENCE.md",
    "docs\CHEATSHEET.md",
    "locales\zh-TW\docs\FEATURE-REFERENCE.md",
    "locales\zh-TW\docs\CHEATSHEET.md",
    "locales\zh-CN\docs\FEATURE-REFERENCE.md",
    "locales\zh-CN\docs\CHEATSHEET.md"
)

$MissingFiles = @()
foreach ($file in $DocsFiles) {
    $fullPath = Join-Path $ProjectRoot $file
    if (-not (Test-Path $fullPath)) {
        $MissingFiles += $file
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-ColorOutput "⚠ Missing documentation files:" $Yellow
    foreach ($file in $MissingFiles) {
        Write-ColorOutput "  ✗ $file" $Red
    }

    if ($Fix) {
        Write-Host ""
        Write-ColorOutput "Regenerating documentation..." $Blue
        node scripts\generate-usage-docs.mjs
        Write-ColorOutput "✓ Documentation regenerated" $Green
        exit 0
    } else {
        Write-Host ""
        Write-ColorOutput "Run with -Fix to regenerate" $Yellow
        exit 1
    }
}

# Check if source files are newer than generated docs
$SourceDirs = @(
    "skills\claude-code",
    "core",
    "cli\bin\uds.js",
    "scripts"
)

# Get the oldest generated doc timestamp
$OldestDocTime = $null
foreach ($file in $DocsFiles) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        $fileTime = (Get-Item $fullPath).LastWriteTime
        if ($null -eq $OldestDocTime -or $fileTime -lt $OldestDocTime) {
            $OldestDocTime = $fileTime
        }
    }
}

# Check if any source is newer
$NeedsUpdate = $false
$NewerSources = @()

foreach ($source in $SourceDirs) {
    $sourcePath = Join-Path $ProjectRoot $source
    if (Test-Path $sourcePath -PathType Container) {
        $files = Get-ChildItem -Path $sourcePath -Recurse -Include "*.md", "*.js", "*.yaml" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($file.LastWriteTime -gt $OldestDocTime) {
                $NeedsUpdate = $true
                $NewerSources += $file.FullName.Replace($ProjectRoot + "\", "")
                if (-not $VerboseOutput) {
                    break
                }
            }
        }
        if ($NeedsUpdate -and -not $VerboseOutput) {
            break
        }
    } elseif (Test-Path $sourcePath -PathType Leaf) {
        $fileTime = (Get-Item $sourcePath).LastWriteTime
        if ($fileTime -gt $OldestDocTime) {
            $NeedsUpdate = $true
            $NewerSources += $source
        }
    }
}

if ($NeedsUpdate) {
    Write-ColorOutput "⚠ Documentation may be out of date" $Yellow

    if ($VerboseOutput -and $NewerSources.Count -gt 0) {
        Write-ColorOutput "  Modified sources:" $Yellow
        $displayCount = [Math]::Min(5, $NewerSources.Count)
        for ($i = 0; $i -lt $displayCount; $i++) {
            Write-Host "    - $($NewerSources[$i])"
        }
        if ($NewerSources.Count -gt 5) {
            Write-Host "    ... and $($NewerSources.Count - 5) more"
        }
    }

    if ($Fix) {
        Write-Host ""
        Write-ColorOutput "Regenerating documentation..." $Blue
        node scripts\generate-usage-docs.mjs
        Write-ColorOutput "✓ Documentation regenerated" $Green
        exit 0
    } else {
        Write-Host ""
        Write-ColorOutput "Run with -Fix to regenerate, or run:" $Yellow
        Write-Host "  node scripts\generate-usage-docs.mjs"
        exit 1
    }
}

# All checks passed
Write-ColorOutput "✓ All documentation files exist" $Green
Write-ColorOutput "✓ Documentation appears up to date" $Green
Write-Host ""
Write-ColorOutput "✓ Usage documentation sync check passed" $Green
exit 0
