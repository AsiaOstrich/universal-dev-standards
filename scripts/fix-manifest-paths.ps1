#!/usr/bin/env pwsh
#
# Manifest Path Fixer (PowerShell Version)
# Manifest 路徑修正器 (PowerShell 版本)
#
# This script fixes incorrect file paths in manually edited manifest.json files
# that cause GitHub 404 errors during `uds update`.
#
# Usage: .\scripts\fix-manifest-paths.ps1 -ProjectPath <project-directory>
# Example: .\scripts\fix-manifest-paths.ps1 -ProjectPath C:\Projects\MyProject
#

param(
    [Parameter(Position = 0)]
    [string]$ProjectPath = ""
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Usage function
function Show-Usage {
    Write-Host ""
    Write-Host "Manifest Path Fixer | Manifest 路徑修正器"
    Write-Host ""
    Write-Host "Usage: .\fix-manifest-paths.ps1 -ProjectPath <project-directory>"
    Write-Host ""
    Write-Host "This script fixes incorrect file paths in .standards\manifest.json"
    Write-Host "that cause GitHub 404 errors during 'uds update'."
    Write-Host ""
    Write-Host "Paths to be fixed:"
    Write-Host "  1. core/ai-collaboration-standards.md -> core/anti-hallucination.md"
    Write-Host "  2. extensions/languages/csharp/csharp-style.md -> extensions/languages/csharp-style.md"
    Write-Host "  3. extensions/languages/php/php-style.md -> extensions/languages/php-style.md"
    Write-Host ""
    exit 1
}

# Check arguments
if ([string]::IsNullOrEmpty($ProjectPath)) {
    Show-Usage
}

$ManifestFile = Join-Path $ProjectPath ".standards" "manifest.json"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Manifest Path Fixer"
Write-Host "  Manifest 路徑修正器"
Write-Host "=========================================="
Write-Host ""

# Check if manifest exists
if (-not (Test-Path $ManifestFile)) {
    Write-Host "Error: " -ForegroundColor Red -NoNewline
    Write-Host "manifest.json not found: $ManifestFile"
    Write-Host "  Please verify the project path is correct."
    exit 1
}

Write-Host "Project:  " -ForegroundColor Blue -NoNewline
Write-Host $ProjectPath
Write-Host "Manifest: " -ForegroundColor Blue -NoNewline
Write-Host $ManifestFile
Write-Host ""

# Define path mappings (old -> new)
$PathFixes = @{
    "core/ai-collaboration-standards.md" = "core/anti-hallucination.md"
    "extensions/languages/csharp/csharp-style.md" = "extensions/languages/csharp-style.md"
    "extensions/languages/php/php-style.md" = "extensions/languages/php-style.md"
}

# Backup original file
$BackupFile = "$ManifestFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $ManifestFile $BackupFile
Write-Host "[BACKUP]  " -ForegroundColor Green -NoNewline
Write-Host "Created: $BackupFile"
Write-Host ""

# Read and parse manifest
$manifestContent = Get-Content $ManifestFile -Raw
$manifest = $manifestContent | ConvertFrom-Json

# Counter
$script:FixesApplied = 0

Write-Host "----------------------------------------"
Write-Host "Scanning for incorrect paths..."
Write-Host "----------------------------------------"
Write-Host ""

# Function to fix array entries
function Fix-ArrayPaths {
    param(
        [array]$Array,
        [string]$ArrayName
    )

    $modified = $false
    $newArray = @()

    foreach ($item in $Array) {
        $newItem = $item
        foreach ($oldPath in $PathFixes.Keys) {
            if ($item -eq $oldPath) {
                $newPath = $PathFixes[$oldPath]
                Write-Host "[FOUND]   " -ForegroundColor Yellow -NoNewline
                Write-Host "$oldPath (in $ArrayName)"
                Write-Host "          -> " -NoNewline
                Write-Host $newPath -ForegroundColor Green
                $newItem = $newPath
                $script:FixesApplied++
                $modified = $true
            }
        }
        $newArray += $newItem
    }

    return @{
        Array = $newArray
        Modified = $modified
    }
}

# Fix standards array
if ($manifest.standards) {
    $result = Fix-ArrayPaths -Array $manifest.standards -ArrayName "standards"
    if ($result.Modified) {
        $manifest.standards = $result.Array
    }
}

# Fix extensions array
if ($manifest.extensions) {
    $result = Fix-ArrayPaths -Array $manifest.extensions -ArrayName "extensions"
    if ($result.Modified) {
        $manifest.extensions = $result.Array
    }
}

# Fix fileHashes keys
if ($manifest.fileHashes) {
    $newFileHashes = [PSCustomObject]@{}
    $hashesModified = $false

    foreach ($property in $manifest.fileHashes.PSObject.Properties) {
        $key = $property.Name
        $value = $property.Value
        $newKey = $key

        foreach ($oldPath in $PathFixes.Keys) {
            $newPath = $PathFixes[$oldPath]

            # Extract just the filename from paths for comparison
            $oldFileName = Split-Path -Leaf $oldPath
            $newFileName = Split-Path -Leaf $newPath

            # Check if key contains the old filename (handles .standards/ prefix)
            if ($key -match [regex]::Escape($oldFileName) -and $oldFileName -ne $newFileName) {
                $newKey = $key -replace [regex]::Escape($oldFileName), $newFileName
                if ($newKey -ne $key) {
                    Write-Host "[FOUND]   " -ForegroundColor Yellow -NoNewline
                    Write-Host "$key (in fileHashes)"
                    Write-Host "          -> " -NoNewline
                    Write-Host $newKey -ForegroundColor Green
                    $script:FixesApplied++
                    $hashesModified = $true
                }
            }
        }

        $newFileHashes | Add-Member -NotePropertyName $newKey -NotePropertyValue $value
    }

    if ($hashesModified) {
        $manifest.fileHashes = $newFileHashes
    }
}

# Write back if modified
if ($script:FixesApplied -gt 0) {
    $manifest | ConvertTo-Json -Depth 10 | Set-Content $ManifestFile -Encoding UTF8
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "  Summary | 摘要"
Write-Host "=========================================="
Write-Host ""

if ($script:FixesApplied -gt 0) {
    Write-Host "Fixed $($script:FixesApplied) path(s) successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Changes applied to: $ManifestFile"
    Write-Host "Backup saved to:    $BackupFile"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Verify: Get-Content `"$ManifestFile`" | Select-String 'anti-hallucination|csharp-style|php-style'"
    Write-Host "  2. Update: cd `"$ProjectPath`"; uds update"
    Write-Host ""
}
else {
    Write-Host "No incorrect paths found." -ForegroundColor Cyan
    Write-Host "The manifest appears to be already correct."
    Write-Host ""
    # Remove unnecessary backup
    Remove-Item $BackupFile
    Write-Host "Removed unnecessary backup file." -ForegroundColor Gray
    Write-Host ""
}

exit 0
