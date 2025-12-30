#!/bin/bash
#
# Translation Sync Checker
# 翻譯同步檢查器
#
# This script checks if translations are in sync with their source files
# by comparing version numbers in YAML front matter.
#
# Usage: ./scripts/check-translation-sync.sh [locale]
# Example: ./scripts/check-translation-sync.sh zh-TW
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default locale
LOCALE="${1:-zh-TW}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOCALE_DIR="$ROOT_DIR/locales/$LOCALE"

# Counters
TOTAL=0
CURRENT=0
OUTDATED=0
MISSING_META=0
MISSING_SOURCE=0

echo ""
echo "=========================================="
echo "  Translation Sync Checker"
echo "  翻譯同步檢查器"
echo "=========================================="
echo ""
echo -e "${BLUE}Locale:${NC} $LOCALE"
echo -e "${BLUE}Checking:${NC} $LOCALE_DIR"
echo ""

# Check if locale directory exists
if [ ! -d "$LOCALE_DIR" ]; then
    echo -e "${RED}Error:${NC} Locale directory not found: $LOCALE_DIR"
    exit 1
fi

# Function to extract YAML front matter value
get_yaml_value() {
    local file="$1"
    local key="$2"
    grep "^${key}:" "$file" 2>/dev/null | head -1 | sed "s/^${key}:[[:space:]]*//" | tr -d '\r'
}

# Function to get source file version from its own YAML front matter or Version line
# Only searches the first 20 lines to avoid matching code blocks
get_source_version() {
    local source_file="$1"

    if [ ! -f "$source_file" ]; then
        echo ""
        return
    fi

    # Get first 20 lines for version detection (avoids code blocks)
    local header=$(head -20 "$source_file")

    # Try YAML front matter first (only in header)
    local version=$(echo "$header" | grep "^version:" 2>/dev/null | head -1 | sed 's/^version:[[:space:]]*//' | tr -d '\r')

    # If not found, try **Version**: pattern (only in header)
    if [ -z "$version" ]; then
        version=$(echo "$header" | grep -E "^\*\*Version\*\*:" 2>/dev/null | head -1 | sed 's/.*:[[:space:]]*//' | tr -d '\r')
    fi

    # If still not found, try > Version: pattern (inline version)
    if [ -z "$version" ]; then
        version=$(echo "$header" | grep -E "^> Version:" 2>/dev/null | head -1 | sed 's/.*Version:[[:space:]]*//' | cut -d'|' -f1 | tr -d ' \r')
    fi

    echo "$version"
}

echo "----------------------------------------"
echo "Checking translation files..."
echo "----------------------------------------"
echo ""

# Find all markdown files in locale directory
while IFS= read -r trans_file; do
    TOTAL=$((TOTAL + 1))

    # Get relative path from locale dir
    rel_path="${trans_file#$LOCALE_DIR/}"

    # Extract metadata from translation file
    source_path=$(get_yaml_value "$trans_file" "source")
    source_version=$(get_yaml_value "$trans_file" "source_version")
    trans_version=$(get_yaml_value "$trans_file" "translation_version")
    status=$(get_yaml_value "$trans_file" "status")

    # Skip files without YAML front matter
    if [ -z "$source_path" ]; then
        echo -e "${YELLOW}[NO META]${NC} $rel_path"
        echo "          No YAML front matter found"
        MISSING_META=$((MISSING_META + 1))
        continue
    fi

    # Construct full source path (handle relative paths from translation file location)
    trans_dir="$(dirname "$trans_file")"
    if [[ "$source_path" == ../* ]]; then
        # Relative path - resolve from translation file location
        full_source_path="$(cd "$trans_dir" && cd "$(dirname "$source_path")" 2>/dev/null && pwd)/$(basename "$source_path")"
    else
        # Absolute path from root
        full_source_path="$ROOT_DIR/$source_path"
    fi

    # Check if source file exists
    if [ ! -f "$full_source_path" ]; then
        echo -e "${RED}[MISSING]${NC} $rel_path"
        echo "          Source not found: $source_path"
        MISSING_SOURCE=$((MISSING_SOURCE + 1))
        continue
    fi

    # Get current source version
    current_source_version=$(get_source_version "$full_source_path")

    # Compare versions
    if [ "$source_version" = "$current_source_version" ] || [ -z "$current_source_version" ]; then
        if [ "$status" = "current" ]; then
            echo -e "${GREEN}[CURRENT]${NC} $rel_path"
            CURRENT=$((CURRENT + 1))
        else
            echo -e "${YELLOW}[CHECK]${NC}  $rel_path"
            echo "          Status: $status (should be 'current'?)"
            CURRENT=$((CURRENT + 1))
        fi
    else
        echo -e "${RED}[OUTDATED]${NC} $rel_path"
        echo "          Source: $source_version -> $current_source_version"
        echo "          Translation: $trans_version"
        OUTDATED=$((OUTDATED + 1))
    fi

done < <(find "$LOCALE_DIR" -name "*.md" -type f | sort)

echo ""
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""
echo -e "Total files:        ${BLUE}$TOTAL${NC}"
echo -e "Current:            ${GREEN}$CURRENT${NC}"
echo -e "Outdated:           ${RED}$OUTDATED${NC}"
echo -e "Missing metadata:   ${YELLOW}$MISSING_META${NC}"
echo -e "Missing source:     ${RED}$MISSING_SOURCE${NC}"
echo ""

# Exit with error if there are issues
if [ $OUTDATED -gt 0 ] || [ $MISSING_SOURCE -gt 0 ]; then
    echo -e "${RED}Some translations need attention!${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}All translations are in sync!${NC}"
    echo ""
    exit 0
fi
