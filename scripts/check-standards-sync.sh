#!/bin/bash
#
# Standards Consistency Checker
# 標準一致性檢查器
#
# This script checks if human-readable standards (.md) have corresponding
# AI-optimized versions (.ai.yaml) and vice versa.
#
# Checks:
# 1. core/ ↔ ai/standards/ - Core standards consistency
# 2. options/ ↔ ai/options/ - Option standards consistency
# 3. ai/standards/ → registry - Registry source.ai references
#
# Usage: ./scripts/check-standards-sync.sh
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

# Directories
CORE_DIR="$ROOT_DIR/core"
AI_STANDARDS_DIR="$ROOT_DIR/ai/standards"
OPTIONS_DIR="$ROOT_DIR/options"
AI_OPTIONS_DIR="$ROOT_DIR/ai/options"

# Temp files for counting (to avoid subshell issues)
ERROR_FILE=$(mktemp)
WARNING_FILE=$(mktemp)
echo "0" > "$ERROR_FILE"
echo "0" > "$WARNING_FILE"

# Cleanup on exit
cleanup() {
    rm -f "$ERROR_FILE" "$WARNING_FILE"
}
trap cleanup EXIT

# Helper functions
inc_errors() {
    local count
    count=$(cat "$ERROR_FILE")
    echo $((count + 1)) > "$ERROR_FILE"
}

inc_warnings() {
    local count
    count=$(cat "$WARNING_FILE")
    echo $((count + 1)) > "$WARNING_FILE"
}

get_errors() {
    cat "$ERROR_FILE"
}

get_warnings() {
    cat "$WARNING_FILE"
}

echo ""
echo "=========================================="
echo "  Standards Consistency Checker"
echo "  標準一致性檢查器"
echo "=========================================="
echo ""

# =============================================================================
# Name Mapping Functions
# =============================================================================

# Map core/*.md filename to ai/standards/*.ai.yaml filename
map_core_to_ai() {
    local core_name="$1"
    case "$core_name" in
        "changelog-standards")    echo "changelog" ;;
        "code-review-checklist")  echo "code-review" ;;
        "commit-message-guide")   echo "commit-message" ;;
        "error-code-standards")   echo "error-codes" ;;
        "logging-standards")      echo "logging" ;;
        "testing-standards")      echo "testing" ;;
        *)                        echo "$core_name" ;;
    esac
}

# Map ai/standards/*.ai.yaml filename to core/*.md filename
map_ai_to_core() {
    local ai_name="$1"
    case "$ai_name" in
        "changelog")      echo "changelog-standards" ;;
        "code-review")    echo "code-review-checklist" ;;
        "commit-message") echo "commit-message-guide" ;;
        "error-codes")    echo "error-code-standards" ;;
        "logging")        echo "logging-standards" ;;
        "testing")        echo "testing-standards" ;;
        *)                echo "$ai_name" ;;
    esac
}

# =============================================================================
# Check 1: core/ ↔ ai/standards/
# =============================================================================

echo -e "${BLUE}[1/3] Checking core/ ↔ ai/standards/${NC}"
echo "----------------------------------------"
echo ""

# Check each core/*.md has corresponding ai/standards/*.ai.yaml
echo -e "${CYAN}Checking core/ → ai/standards/:${NC}"
if [ -d "$CORE_DIR" ]; then
    for md_file in "$CORE_DIR"/*.md; do
        if [ -f "$md_file" ]; then
            base_name=$(basename "$md_file" .md)
            ai_name=$(map_core_to_ai "$base_name")
            ai_file="$AI_STANDARDS_DIR/$ai_name.ai.yaml"

            if [ -f "$ai_file" ]; then
                echo -e "  ${GREEN}[OK]${NC}      $base_name.md → $ai_name.ai.yaml"
            else
                echo -e "  ${RED}[MISSING]${NC} $base_name.md → $ai_name.ai.yaml (not found)"
                inc_errors
            fi
        fi
    done
else
    echo -e "  ${RED}[ERROR]${NC} core/ directory not found"
    inc_errors
fi

echo ""

# Check each ai/standards/*.ai.yaml has corresponding core/*.md
echo -e "${CYAN}Checking ai/standards/ → core/:${NC}"
if [ -d "$AI_STANDARDS_DIR" ]; then
    for yaml_file in "$AI_STANDARDS_DIR"/*.ai.yaml; do
        if [ -f "$yaml_file" ]; then
            base_name=$(basename "$yaml_file" .ai.yaml)
            core_name=$(map_ai_to_core "$base_name")
            core_file="$CORE_DIR/$core_name.md"

            if [ -f "$core_file" ]; then
                echo -e "  ${GREEN}[OK]${NC}      $base_name.ai.yaml → $core_name.md"
            else
                echo -e "  ${YELLOW}[WARN]${NC}    $base_name.ai.yaml → $core_name.md (not found)"
                inc_warnings
            fi
        fi
    done
else
    echo -e "  ${RED}[ERROR]${NC} ai/standards/ directory not found"
    inc_errors
fi

echo ""

# =============================================================================
# Check 2: options/ ↔ ai/options/
# =============================================================================

echo -e "${BLUE}[2/3] Checking options/ ↔ ai/options/${NC}"
echo "----------------------------------------"
echo ""

# Get all categories from both directories
OPTION_CATEGORIES=""
AI_OPTION_CATEGORIES=""

if [ -d "$OPTIONS_DIR" ]; then
    OPTION_CATEGORIES=$(find "$OPTIONS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)
fi

if [ -d "$AI_OPTIONS_DIR" ]; then
    AI_OPTION_CATEGORIES=$(find "$AI_OPTIONS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)
fi

# Combine and deduplicate categories
ALL_CATEGORIES=$(echo -e "$OPTION_CATEGORIES\n$AI_OPTION_CATEGORIES" | sort -u | grep -v '^$')

for category in $ALL_CATEGORIES; do
    echo -e "${CYAN}Category: $category${NC}"

    option_cat_dir="$OPTIONS_DIR/$category"
    ai_option_cat_dir="$AI_OPTIONS_DIR/$category"

    # Check if category exists in both
    if [ ! -d "$option_cat_dir" ]; then
        echo -e "  ${YELLOW}[WARN]${NC}    options/$category/ directory missing"
        inc_warnings
    fi

    if [ ! -d "$ai_option_cat_dir" ]; then
        echo -e "  ${YELLOW}[WARN]${NC}    ai/options/$category/ directory missing"
        inc_warnings
    fi

    # Check options/*.md → ai/options/*.ai.yaml
    if [ -d "$option_cat_dir" ]; then
        md_files=$(find "$option_cat_dir" -maxdepth 1 -name "*.md" -type f 2>/dev/null | sort)
        if [ -n "$md_files" ]; then
            while IFS= read -r md_file; do
                if [ -f "$md_file" ]; then
                    base_name=$(basename "$md_file" .md)
                    ai_file="$ai_option_cat_dir/$base_name.ai.yaml"

                    if [ -f "$ai_file" ]; then
                        echo -e "  ${GREEN}[OK]${NC}      $base_name.md → $base_name.ai.yaml"
                    else
                        echo -e "  ${RED}[MISSING]${NC} $base_name.md → $base_name.ai.yaml (AI version not found)"
                        inc_errors
                    fi
                fi
            done <<< "$md_files"
        fi
    fi

    # Check ai/options/*.ai.yaml → options/*.md (only warn, not error)
    if [ -d "$ai_option_cat_dir" ]; then
        yaml_files=$(find "$ai_option_cat_dir" -maxdepth 1 -name "*.ai.yaml" -type f 2>/dev/null | sort)
        if [ -n "$yaml_files" ]; then
            while IFS= read -r yaml_file; do
                if [ -f "$yaml_file" ]; then
                    base_name=$(basename "$yaml_file" .ai.yaml)
                    md_file="$option_cat_dir/$base_name.md"

                    if [ ! -f "$md_file" ]; then
                        echo -e "  ${YELLOW}[WARN]${NC}    $base_name.ai.yaml → $base_name.md (human version not found)"
                        inc_warnings
                    fi
                fi
            done <<< "$yaml_files"
        fi
    fi

    echo ""
done

# =============================================================================
# Check 3: ai/standards/ → standards-registry.json references
# =============================================================================

echo -e "${BLUE}[3/3] Checking registry source.ai references${NC}"
echo "----------------------------------------"
echo ""

REGISTRY_FILE="$ROOT_DIR/cli/standards-registry.json"

echo -e "${CYAN}Checking ai/standards/*.ai.yaml → registry:${NC}"
if [ -f "$REGISTRY_FILE" ]; then
    for yaml_file in "$AI_STANDARDS_DIR"/*.ai.yaml; do
        if [ -f "$yaml_file" ]; then
            base_name=$(basename "$yaml_file")

            if grep -q "\"ai/standards/$base_name\"" "$REGISTRY_FILE"; then
                echo -e "  ${GREEN}[OK]${NC}      $base_name → referenced in registry"
            else
                echo -e "  ${RED}[MISSING]${NC} $base_name → NOT in registry source.ai!"
                inc_errors
            fi
        fi
    done
else
    echo -e "  ${RED}[ERROR]${NC} Registry file not found: $REGISTRY_FILE"
    inc_errors
fi

echo ""

# =============================================================================
# Summary
# =============================================================================

ERRORS=$(get_errors)
WARNINGS=$(get_warnings)

echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ "$ERRORS" -gt 0 ] || [ "$WARNINGS" -gt 0 ]; then
    if [ "$ERRORS" -gt 0 ]; then
        echo -e "${RED}Errors: $ERRORS${NC} (Missing AI files or registry references)"
    fi
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}Warnings: $WARNINGS${NC} (Missing human-readable versions or categories)"
    fi
    echo ""
    echo "To fix errors:"
    echo "  - Create missing .ai.yaml files in ai/standards/ or ai/options/"
    echo "  - Ensure each core/*.md has a corresponding ai/standards/*.ai.yaml"
    echo "  - Ensure each options/<cat>/*.md has a corresponding ai/options/<cat>/*.ai.yaml"
    echo "  - Update cli/standards-registry.json with source.ai reference for each .ai.yaml file:"
    echo '      "source": { "human": "core/example.md", "ai": "ai/standards/example.ai.yaml" }'
    echo ""

    if [ "$ERRORS" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
else
    echo -e "${GREEN}All standards are consistent!${NC}"
    echo ""
    exit 0
fi
