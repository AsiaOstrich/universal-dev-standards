#!/bin/bash
# DEPRECATED: Use 'npx tsx scripts/check-registry-completeness.ts' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# Registry Completeness Checker
# 註冊表完整性檢查器
#
# Ensures every core standard has all required sync artifacts:
# 1. core/*.md exists → ai/standards/*.ai.yaml exists
# 2. core/*.md exists → standards-registry.json has entry
# 3. core/*.md exists → .standards/*.ai.yaml exists (installed copy)
#
# This script catches the "added core standard but forgot to sync" problem.
#
# Usage: ./scripts/check-registry-completeness.sh
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
DOT_STANDARDS_DIR="$ROOT_DIR/.standards"
REGISTRY_FILE="$ROOT_DIR/cli/standards-registry.json"

# Temp files for counting
ERROR_FILE=$(mktemp)
WARNING_FILE=$(mktemp)
echo "0" > "$ERROR_FILE"
echo "0" > "$WARNING_FILE"

# Cleanup on exit
cleanup() {
    rm -f "$ERROR_FILE" "$WARNING_FILE"
    if [ -f "NULL" ]; then rm -f "NULL"; fi
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

# Name mapping (reuse from check-standards-sync.sh)
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

# Standards that are reference-only (no separate .standards/ install needed)
# These are protocol-type standards loaded via context-aware-loading
is_reference_only() {
    local name="$1"
    case "$name" in
        "requirement-checklist"|"requirement-template"|"requirement-document-template")
            return 0 ;;
        *)
            return 1 ;;
    esac
}

echo ""
echo "=========================================="
echo "  Registry Completeness Checker"
echo "  註冊表完整性檢查器"
echo "=========================================="
echo ""

# =============================================================================
# Check 1: core/*.md → ai/standards/*.ai.yaml
# =============================================================================

echo -e "${BLUE}[1/3] Checking core/ → ai/standards/ completeness${NC}"
echo "----------------------------------------"

CORE_COUNT=0
AI_MISSING=0

for core_file in "$CORE_DIR"/*.md; do
    [ -f "$core_file" ] || continue

    core_basename=$(basename "$core_file" .md)

    # Skip guide directories and template files
    if is_reference_only "$core_basename"; then
        continue
    fi

    CORE_COUNT=$((CORE_COUNT + 1))

    ai_name=$(map_core_to_ai "$core_basename")
    ai_file="$AI_STANDARDS_DIR/${ai_name}.ai.yaml"

    if [ -f "$ai_file" ]; then
        echo -e "  ${GREEN}[OK]${NC}      $core_basename.md → ${ai_name}.ai.yaml"
    else
        echo -e "  ${RED}[MISSING]${NC} $core_basename.md → ${ai_name}.ai.yaml (not found)"
        inc_errors
        AI_MISSING=$((AI_MISSING + 1))
    fi
done

echo ""
echo -e "  Core standards: $CORE_COUNT | AI YAML missing: $AI_MISSING"
echo ""

# =============================================================================
# Check 2: core/*.md → standards-registry.json
# =============================================================================

echo -e "${BLUE}[2/3] Checking core/ → standards-registry.json completeness${NC}"
echo "----------------------------------------"

REGISTRY_MISSING=0

for core_file in "$CORE_DIR"/*.md; do
    [ -f "$core_file" ] || continue

    core_basename=$(basename "$core_file" .md)

    if is_reference_only "$core_basename"; then
        continue
    fi

    ai_name=$(map_core_to_ai "$core_basename")

    # Check if registry has an entry with source.human or source.ai matching
    if grep -q "\"core/${core_basename}.md\"" "$REGISTRY_FILE" 2>/dev/null || \
       grep -q "\"ai/standards/${ai_name}.ai.yaml\"" "$REGISTRY_FILE" 2>/dev/null; then
        echo -e "  ${GREEN}[OK]${NC}      $core_basename.md → registry entry found"
    else
        echo -e "  ${RED}[MISSING]${NC} $core_basename.md → no registry entry"
        inc_errors
        REGISTRY_MISSING=$((REGISTRY_MISSING + 1))
    fi
done

echo ""
echo -e "  Registry missing: $REGISTRY_MISSING"
echo ""

# =============================================================================
# Check 3: ai/standards/*.ai.yaml → .standards/*.ai.yaml (installed copy)
# =============================================================================

echo -e "${BLUE}[3/3] Checking ai/standards/ → .standards/ installed copies${NC}"
echo "----------------------------------------"

DOT_MISSING=0
DOT_TOTAL=0

for ai_file in "$AI_STANDARDS_DIR"/*.ai.yaml; do
    [ -f "$ai_file" ] || continue

    ai_basename=$(basename "$ai_file")
    DOT_TOTAL=$((DOT_TOTAL + 1))

    dot_file="$DOT_STANDARDS_DIR/$ai_basename"

    if [ -f "$dot_file" ]; then
        echo -e "  ${GREEN}[OK]${NC}      $ai_basename → .standards/ installed"
    else
        echo -e "  ${YELLOW}[WARN]${NC}    $ai_basename → not in .standards/ (run 'uds update' to sync)"
        inc_warnings
        DOT_MISSING=$((DOT_MISSING + 1))
    fi
done

echo ""
echo -e "  AI standards: $DOT_TOTAL | .standards/ missing: $DOT_MISSING"
echo ""

# =============================================================================
# Summary
# =============================================================================

echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="

ERRORS=$(get_errors)
WARNINGS=$(get_warnings)

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}Errors: $ERRORS${NC} (Missing AI files or registry entries)"
    echo ""
    echo "To fix errors:"
    echo "  - Create missing .ai.yaml files in ai/standards/"
    echo "  - Add missing entries to cli/standards-registry.json"
    echo "  - Run: ./scripts/check-standards-sync.sh for detailed sync info"
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC} (Missing .standards/ copies)"
    echo ""
    echo "To fix warnings:"
    echo "  - Run 'uds update' in this project to sync .standards/"
    echo "  - Or manually copy ai/standards/*.ai.yaml to .standards/"
fi

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    echo "  Core standards: $CORE_COUNT"
    echo "  AI YAML files: $DOT_TOTAL"
    echo "  Registry entries: complete"
    echo "  .standards/ copies: complete"
fi

echo ""

# Exit with error if there are errors (not warnings)
if [ "$ERRORS" -gt 0 ]; then
    exit 1
fi

exit 0
