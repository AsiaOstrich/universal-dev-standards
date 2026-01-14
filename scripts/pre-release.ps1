<#
.SYNOPSIS
    Pre-Release Preparation Script for Universal Development Standards

.DESCRIPTION
    This script automates the pre-release preparation workflow:
    1. Update version numbers across all files
    2. Verify translation sync status
    3. Run tests and linting
    4. Display summary and next steps

.PARAMETER Version
    The version to release (e.g., 3.3.0, 3.3.0-beta.1)

.PARAMETER DryRun
    Preview changes without modifying files

.PARAMETER SkipTranslations
    Skip translation sync verification

.PARAMETER SkipTests
    Skip running tests and linting

.EXAMPLE
    .\scripts\pre-release.ps1 -Version 3.3.0

.EXAMPLE
    .\scripts\pre-release.ps1 -Version 3.3.0-beta.1 -SkipTranslations

.EXAMPLE
    .\scripts\pre-release.ps1 -Version 3.3.0 -DryRun

.NOTES
    Author: Universal Development Standards
    License: MIT
#>

param(
    [string]$Version = "",
    [switch]$DryRun,
    [switch]$SkipTranslations,
    [switch]$SkipTests,
    [switch]$Help
)

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

# Show help
if ($Help) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit 0
}

# Header
Write-Host "=========================================="
Write-Host "  Pre-Release Preparation Script"
Write-Host "  發布前準備腳本"
Write-Host "=========================================="
Write-Host ""

# Change to root directory
Set-Location $RootDir

# Get version if not provided
if ([string]::IsNullOrEmpty($Version)) {
    try {
        $packageJson = Get-Content "cli/package.json" -Raw | ConvertFrom-Json
        $currentVersion = $packageJson.version
    } catch {
        $currentVersion = "unknown"
    }

    Write-Host "Current version: $currentVersion" -ForegroundColor Blue
    Write-Host ""
    $Version = Read-Host "Enter new version (e.g., 3.3.0 or 3.3.0-beta.1)"

    if ([string]::IsNullOrEmpty($Version)) {
        Write-Host "Error: Version is required" -ForegroundColor Red
        exit 1
    }
}

# Validate version format
if ($Version -notmatch "^\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$") {
    Write-Host "Error: Invalid version format. Expected: X.Y.Z or X.Y.Z-prerelease.N" -ForegroundColor Red
    exit 1
}

# Get today's date
$Today = Get-Date -Format "yyyy-MM-dd"

# Determine release type
if ($Version -match "-beta\.") {
    $ReleaseType = "beta"
} elseif ($Version -match "-alpha\.") {
    $ReleaseType = "alpha"
} elseif ($Version -match "-rc\.") {
    $ReleaseType = "rc"
} else {
    $ReleaseType = "stable"
}

Write-Host "Version: $Version" -ForegroundColor Blue
Write-Host "Release Type: $ReleaseType" -ForegroundColor Blue
Write-Host "Date: $Today" -ForegroundColor Blue
Write-Host "Dry Run: $DryRun" -ForegroundColor Blue
Write-Host ""

if ($DryRun) {
    Write-Host "=== DRY RUN MODE - No files will be modified ===" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# Step 1: Update Version Numbers
# ============================================
Write-Host "----------------------------------------"
Write-Host "Step 1: Update Version Numbers"
Write-Host "----------------------------------------"
Write-Host ""

$VersionFiles = @(
    "cli/package.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "cli/standards-registry.json",
    "README.md"
)

foreach ($file in $VersionFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] Not found: $file" -ForegroundColor Red
    }
}

if (-not $DryRun) {
    Write-Host ""
    Write-Host "Updating version numbers..."

    # Update cli/package.json
    if (Test-Path "cli/package.json") {
        $content = Get-Content "cli/package.json" -Raw
        $content = $content -replace '"version": "[^"]*"', "`"version`": `"$Version`""
        Set-Content "cli/package.json" -Value $content -NoNewline
        Write-Host "[UPDATED] cli/package.json" -ForegroundColor Green
    }

    # Update .claude-plugin/plugin.json
    if (Test-Path ".claude-plugin/plugin.json") {
        $content = Get-Content ".claude-plugin/plugin.json" -Raw
        $content = $content -replace '"version": "[^"]*"', "`"version`": `"$Version`""
        Set-Content ".claude-plugin/plugin.json" -Value $content -NoNewline
        Write-Host "[UPDATED] .claude-plugin/plugin.json" -ForegroundColor Green
    }

    # Update .claude-plugin/marketplace.json
    if (Test-Path ".claude-plugin/marketplace.json") {
        $content = Get-Content ".claude-plugin/marketplace.json" -Raw
        $content = $content -replace '"version": "[^"]*"', "`"version`": `"$Version`""
        Set-Content ".claude-plugin/marketplace.json" -Value $content -NoNewline
        Write-Host "[UPDATED] .claude-plugin/marketplace.json" -ForegroundColor Green
    }

    # Update cli/standards-registry.json (multiple occurrences)
    if (Test-Path "cli/standards-registry.json") {
        $content = Get-Content "cli/standards-registry.json" -Raw
        $content = $content -replace '"version": "[^"]*"', "`"version`": `"$Version`""
        Set-Content "cli/standards-registry.json" -Value $content -NoNewline
        Write-Host "[UPDATED] cli/standards-registry.json" -ForegroundColor Green
    }

    # Update README.md (only for stable releases)
    if ($ReleaseType -eq "stable" -and (Test-Path "README.md")) {
        $content = Get-Content "README.md" -Raw
        $content = $content -replace '\*\*Version\*\*: \d+\.\d+\.\d+[^*]*', "**Version**: $Version"
        $content = $content -replace '\*\*Last Updated\*\*: \d{4}-\d{2}-\d{2}', "**Last Updated**: $Today"
        Set-Content "README.md" -Value $content -NoNewline
        Write-Host "[UPDATED] README.md" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# Step 2: Verify Version Consistency
# ============================================
Write-Host "----------------------------------------"
Write-Host "Step 2: Verify Version Consistency"
Write-Host "----------------------------------------"
Write-Host ""

Write-Host "Checking for version $Version in files..."
$filesToCheck = @("cli/package.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", "cli/standards-registry.json")
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        $matches = Select-String -Path $file -Pattern "`"version`": `"$Version`"" -AllMatches
        if ($matches) {
            Write-Host "  Found in: $file" -ForegroundColor Green
        }
    }
}
Write-Host ""

if ($ReleaseType -eq "stable") {
    Write-Host "Checking for residual beta/alpha/rc versions..."
    $hasResidual = $false
    foreach ($file in $filesToCheck) {
        if (Test-Path $file) {
            $residual = Select-String -Path $file -Pattern "beta|alpha|-rc\." -AllMatches
            if ($residual) {
                Write-Host "[WARNING] Found pre-release version in: $file" -ForegroundColor Yellow
                $hasResidual = $true
            }
        }
    }
    if (-not $hasResidual) {
        Write-Host "[OK] No residual pre-release versions found" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# Step 3: Translation Sync Check
# ============================================
if (-not $SkipTranslations) {
    Write-Host "----------------------------------------"
    Write-Host "Step 3: Translation Sync Check"
    Write-Host "----------------------------------------"
    Write-Host ""

    # Check zh-TW
    Write-Host "Checking zh-TW translations..." -ForegroundColor Blue
    if (Test-Path ".\scripts\check-translation-sync.ps1") {
        & ".\scripts\check-translation-sync.ps1" 2>&1 | Select-Object -Last 10
    } else {
        Write-Host "[SKIP] Translation sync script not found" -ForegroundColor Yellow
    }
    Write-Host ""

    # Check zh-CN
    Write-Host "Checking zh-CN translations..." -ForegroundColor Blue
    if (Test-Path ".\scripts\check-translation-sync.ps1") {
        & ".\scripts\check-translation-sync.ps1" -Locale "zh-CN" 2>&1 | Select-Object -Last 10
    }
    Write-Host ""
} else {
    Write-Host "----------------------------------------"
    Write-Host "Step 3: Translation Sync Check (SKIPPED)"
    Write-Host "----------------------------------------"
    Write-Host ""
}

# ============================================
# Step 4: Run Tests
# ============================================
if (-not $SkipTests) {
    Write-Host "----------------------------------------"
    Write-Host "Step 4: Run Tests and Linting"
    Write-Host "----------------------------------------"
    Write-Host ""

    Set-Location "$RootDir\cli"

    Write-Host "Running tests..." -ForegroundColor Blue
    $testResult = npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        $testResult | Select-Object -Last 5
        Write-Host "[PASS] All tests passed" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Tests failed" -ForegroundColor Red
        exit 1
    }
    Write-Host ""

    Write-Host "Running linting..." -ForegroundColor Blue
    $lintResult = npm run lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[PASS] Linting passed" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Linting failed" -ForegroundColor Red
        exit 1
    }

    Set-Location $RootDir
    Write-Host ""
} else {
    Write-Host "----------------------------------------"
    Write-Host "Step 4: Run Tests and Linting (SKIPPED)"
    Write-Host "----------------------------------------"
    Write-Host ""
}

# ============================================
# Summary and Next Steps
# ============================================
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN COMPLETE - No files were modified" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To apply changes, run without -DryRun:"
    Write-Host "  .\scripts\pre-release.ps1 -Version $Version"
} else {
    Write-Host "Pre-release preparation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Version: $Version"
    Write-Host "Release Type: $ReleaseType"
    Write-Host ""
    Write-Host "Files updated:"
    Write-Host "  - cli/package.json"
    Write-Host "  - .claude-plugin/plugin.json"
    Write-Host "  - .claude-plugin/marketplace.json"
    Write-Host "  - cli/standards-registry.json"
    if ($ReleaseType -eq "stable") {
        Write-Host "  - README.md"
    }
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Next Steps | 下一步"
Write-Host "----------------------------------------"
Write-Host ""
Write-Host "1. Update CHANGELOG.md with new version section"
Write-Host "   更新 CHANGELOG.md 新增版本區段"
Write-Host ""
Write-Host "2. Update translation files (if needed):"
Write-Host "   更新翻譯檔案（如需要）："
Write-Host "   - locales/zh-TW/README.md"
Write-Host "   - locales/zh-TW/CHANGELOG.md"
Write-Host "   - locales/zh-CN/README.md"
Write-Host "   - locales/zh-CN/CHANGELOG.md"
Write-Host ""
Write-Host "3. Commit changes:"
Write-Host "   提交變更："
Write-Host "   git add -A"
Write-Host "   git commit -m `"chore(release): prepare v$Version`""
Write-Host ""
Write-Host "4. Follow release workflow:"
Write-Host "   繼續執行發布流程："
Write-Host "   See: skills/claude-code/release-standards/release-workflow.md"
Write-Host ""
