#!/bin/bash
#
# Translation Sync Checker
# 翻譯同步檢查器
#
# This script checks if translations are in sync with their source files
# by comparing version numbers in YAML front matter.
#
# Usage: ./scripts/check-translation-sync.sh [locale|--all]
# Example: ./scripts/check-translation-sync.sh           # Check ALL locales
#          ./scripts/check-translation-sync.sh zh-TW     # Check only zh-TW
#          ./scripts/check-translation-sync.sh zh-CN     # Check only zh-CN
#          ./scripts/check-translation-sync.sh --all     # Explicitly check all
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOCALES_DIR="$ROOT_DIR/locales"

# Determine which locales to check
if [ -z "$1" ] || [ "$1" = "--all" ] || [ "$1" = "-a" ]; then
    # Check all locales
    CHECK_ALL=true
    LOCALES=$(find "$LOCALES_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)
else
    # Check specific locale
    CHECK_ALL=false
    LOCALES="$1"
fi

echo ""
echo "=========================================="
echo "  Translation Sync Checker"
echo "  翻譯同步檢查器"
echo "=========================================="
echo ""

if [ "$CHECK_ALL" = true ]; then
    echo -e "${BLUE}Mode:${NC} Checking ALL locales"
    echo -e "${BLUE}Locales found:${NC} $(echo $LOCALES | tr '\n' ' ')"
else
    echo -e "${BLUE}Mode:${NC} Single locale"
    echo -e "${BLUE}Locale:${NC} $LOCALES"
fi
echo ""

# Global counters for summary
GLOBAL_TOTAL=0
GLOBAL_CURRENT=0
GLOBAL_OUTDATED=0
GLOBAL_MISSING_META=0
GLOBAL_MISSING_SOURCE=0
GLOBAL_ERRORS=0

# Function to check a single locale
check_locale() {
    local LOCALE="$1"
    local LOCALE_DIR="$LOCALES_DIR/$LOCALE"

    # Local counters
    local TOTAL=0
    local CURRENT=0
    local OUTDATED=0
    local MISSING_META=0
    local MISSING_SOURCE=0

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  Locale: $LOCALE${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Check if locale directory exists
    if [ ! -d "$LOCALE_DIR" ]; then
        echo -e "${RED}Error:${NC} Locale directory not found: $LOCALE_DIR"
        GLOBAL_ERRORS=$((GLOBAL_ERRORS + 1))
        return 1
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

    # Locale summary
    echo ""
    echo -e "  ${BLUE}$LOCALE Summary:${NC}"
    echo -e "    Total: $TOTAL | Current: ${GREEN}$CURRENT${NC} | Outdated: ${RED}$OUTDATED${NC} | Missing: ${RED}$MISSING_SOURCE${NC}"
    echo ""

    # Update global counters
    GLOBAL_TOTAL=$((GLOBAL_TOTAL + TOTAL))
    GLOBAL_CURRENT=$((GLOBAL_CURRENT + CURRENT))
    GLOBAL_OUTDATED=$((GLOBAL_OUTDATED + OUTDATED))
    GLOBAL_MISSING_META=$((GLOBAL_MISSING_META + MISSING_META))
    GLOBAL_MISSING_SOURCE=$((GLOBAL_MISSING_SOURCE + MISSING_SOURCE))

    # Return error status if this locale has issues
    if [ $OUTDATED -gt 0 ] || [ $MISSING_SOURCE -gt 0 ]; then
        return 1
    fi
    return 0
}

# Main execution: iterate through all locales
LOCALE_ERRORS=0
for locale in $LOCALES; do
    if ! check_locale "$locale"; then
        LOCALE_ERRORS=$((LOCALE_ERRORS + 1))
    fi
done

# Final summary
echo "=========================================="
echo "  Final Summary | 總結"
echo "=========================================="
echo ""
echo -e "Locales checked:    ${BLUE}$(echo $LOCALES | wc -w | tr -d ' ')${NC}"
echo -e "Total files:        ${BLUE}$GLOBAL_TOTAL${NC}"
echo -e "Current:            ${GREEN}$GLOBAL_CURRENT${NC}"
echo -e "Outdated:           ${RED}$GLOBAL_OUTDATED${NC}"
echo -e "Missing metadata:   ${YELLOW}$GLOBAL_MISSING_META${NC}"
echo -e "Missing source:     ${RED}$GLOBAL_MISSING_SOURCE${NC}"
echo ""

# Exit with error if there are issues
if [ $GLOBAL_OUTDATED -gt 0 ] || [ $GLOBAL_MISSING_SOURCE -gt 0 ] || [ $GLOBAL_ERRORS -gt 0 ]; then
    echo -e "${RED}Some translations need attention!${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}All translations are in sync!${NC}"
    echo ""
    exit 0
fi
