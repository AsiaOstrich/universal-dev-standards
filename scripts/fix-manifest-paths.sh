#!/bin/bash
#
# Manifest Path Fixer
# Manifest 路徑修正器
#
# This script fixes incorrect file paths in manually edited manifest.json files
# that cause GitHub 404 errors during `uds update`.
#
# Usage: ./scripts/fix-manifest-paths.sh <project-directory>
# Example: ./scripts/fix-manifest-paths.sh /path/to/project
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Usage function
show_usage() {
    echo ""
    echo "Manifest Path Fixer | Manifest 路徑修正器"
    echo ""
    echo "Usage: $0 <project-directory>"
    echo ""
    echo "This script fixes incorrect file paths in .standards/manifest.json"
    echo "that cause GitHub 404 errors during 'uds update'."
    echo ""
    echo "Paths to be fixed:"
    echo "  1. core/ai-collaboration-standards.md → core/anti-hallucination.md"
    echo "  2. extensions/languages/csharp/csharp-style.md → extensions/languages/csharp-style.md"
    echo "  3. extensions/languages/php/php-style.md → extensions/languages/php-style.md"
    echo ""
    exit 1
}

# Check arguments
if [ -z "$1" ]; then
    show_usage
fi

PROJECT_DIR="$1"
MANIFEST_FILE="$PROJECT_DIR/.standards/manifest.json"

echo ""
echo "=========================================="
echo "  Manifest Path Fixer"
echo "  Manifest 路徑修正器"
echo "=========================================="
echo ""

# Check if manifest exists
if [ ! -f "$MANIFEST_FILE" ]; then
    echo -e "${RED}Error:${NC} manifest.json not found: $MANIFEST_FILE"
    echo "  Please verify the project path is correct."
    exit 1
fi

echo -e "${BLUE}Project:${NC}  $PROJECT_DIR"
echo -e "${BLUE}Manifest:${NC} $MANIFEST_FILE"
echo ""

# Define path mappings (old → new)
# Using parallel arrays since associative arrays may not work on older bash versions
OLD_PATHS=(
    "core/ai-collaboration-standards.md"
    "extensions/languages/csharp/csharp-style.md"
    "extensions/languages/php/php-style.md"
)
NEW_PATHS=(
    "core/anti-hallucination.md"
    "extensions/languages/csharp-style.md"
    "extensions/languages/php-style.md"
)

# Additional filename mappings for fileHashes keys
# (only needed when filename changes, not just path)
OLD_FILENAMES=(
    "ai-collaboration-standards.md"
)
NEW_FILENAMES=(
    "anti-hallucination.md"
)

# Backup original file
BACKUP_FILE="$MANIFEST_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$MANIFEST_FILE" "$BACKUP_FILE"
echo -e "${GREEN}[BACKUP]${NC}  Created: $BACKUP_FILE"
echo ""

# Counter
FIXES_APPLIED=0

echo "----------------------------------------"
echo "Scanning for incorrect paths..."
echo "----------------------------------------"
echo ""

# Read file content
CONTENT=$(cat "$MANIFEST_FILE")

# Process each path mapping (for standards and extensions arrays)
for i in "${!OLD_PATHS[@]}"; do
    OLD_PATH="${OLD_PATHS[$i]}"
    NEW_PATH="${NEW_PATHS[$i]}"

    # Check if old path exists in file
    if echo "$CONTENT" | grep -q "$OLD_PATH"; then
        echo -e "${YELLOW}[FOUND]${NC}   $OLD_PATH"
        echo -e "          → ${GREEN}$NEW_PATH${NC}"

        # Perform replacement (escape special characters for sed)
        # Using | as delimiter to avoid issues with / in paths
        CONTENT=$(echo "$CONTENT" | sed "s|$OLD_PATH|$NEW_PATH|g")
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    fi
done

# Process filename mappings (for fileHashes keys)
for i in "${!OLD_FILENAMES[@]}"; do
    OLD_FILENAME="${OLD_FILENAMES[$i]}"
    NEW_FILENAME="${NEW_FILENAMES[$i]}"

    # Check if old filename exists in fileHashes keys (format: ".standards/filename")
    if echo "$CONTENT" | grep -q "\.standards/$OLD_FILENAME"; then
        echo -e "${YELLOW}[FOUND]${NC}   .standards/$OLD_FILENAME (in fileHashes)"
        echo -e "          → ${GREEN}.standards/$NEW_FILENAME${NC}"

        # Perform replacement
        CONTENT=$(echo "$CONTENT" | sed "s|\.standards/$OLD_FILENAME|.standards/$NEW_FILENAME|g")
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    fi
done

# Write back if changes were made
if [ $FIXES_APPLIED -gt 0 ]; then
    echo "$CONTENT" > "$MANIFEST_FILE"
fi

# Summary
echo ""
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ $FIXES_APPLIED -gt 0 ]; then
    echo -e "${GREEN}Fixed $FIXES_APPLIED path(s) successfully!${NC}"
    echo ""
    echo "Changes applied to: $MANIFEST_FILE"
    echo "Backup saved to:    $BACKUP_FILE"
    echo ""
    echo "Next steps:"
    echo "  1. Verify: grep -E 'anti-hallucination|csharp-style|php-style' \"$MANIFEST_FILE\""
    echo "  2. Update: cd \"$PROJECT_DIR\" && uds update"
    echo ""
else
    echo -e "${CYAN}No incorrect paths found.${NC}"
    echo "The manifest appears to be already correct."
    echo ""
    # Remove unnecessary backup
    rm "$BACKUP_FILE"
    echo -e "${GRAY}Removed unnecessary backup file.${NC}"
    echo ""
fi

exit 0
