#!/bin/bash
#
# Orphan Spec Detection Script
# 孤兒 Spec 偵測腳本
#
# Scans docs/specs/ for specs not in terminal states (Archived, Stable).
# 掃描 docs/specs/ 找出非終端狀態（Archived、Stable）的 spec。
#
# Usage: ./scripts/check-orphan-specs.sh [--verbose] [--strict]
#
# Options:
#   --verbose    Show details for each orphan spec
#   --strict     Exit with error code 1 if orphans found (default: warning only)
#

# Cross-platform /dev/null protection for Windows
_cleanup_null_file() {
  if [ -f "NULL" ]; then rm -f "NULL"; fi
}
trap _cleanup_null_file EXIT

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$ROOT_DIR/docs/specs"

VERBOSE=false
STRICT=false

for arg in "$@"; do
    case $arg in
        --verbose|-v)
            VERBOSE=true
            ;;
        --strict)
            STRICT=true
            ;;
    esac
done

echo -e "${BOLD}Orphan Spec Detection | 孤兒 Spec 偵測${NC}"
echo "=========================================="

# Check if specs directory exists
if [ ! -d "$SPECS_DIR" ]; then
    echo -e "${GREEN}✓ No specs directory found — nothing to check${NC}"
    exit 0
fi

# Find all spec markdown files
ORPHAN_COUNT=0
TOTAL_COUNT=0
ORPHAN_LIST=""

while IFS= read -r spec_file; do
    # Skip README files, index files, and ATDD-derived tables
    filename=$(basename "$spec_file")
    if [[ "$filename" == "README.md" ]] || [[ "$filename" == "INDEX.md" ]] || [[ "$filename" == *"-atdd.md" ]] || [[ "$filename" == *"-traceability.md" ]]; then
        continue
    fi

    TOTAL_COUNT=$((TOTAL_COUNT + 1))

    # Extract Status field from the spec
    # Match specific patterns:
    #   > **Status**: Draft       (blockquote metadata)
    #   **Status**: Stable        (bold metadata)
    #   | **Status** | Draft |    (table metadata)
    #   Status: Archived          (plain metadata)
    # Avoid false positives from headings like "# Status Display"
    status="unknown"

    # Try blockquote/bold/list pattern: > **Status**: Value  or  **Status**: Value  or  - **Status**: Value
    status_line=$(grep -m 1 -E '^\s*[-*>]?\s*\*?\*?Status\*?\*?\s*:' "$spec_file" 2>/dev/null || echo "")

    if [ -z "$status_line" ]; then
        # Try table pattern: | **Status** | Value |  or  | Status | Value |  or  | **狀態** | Value |
        status_line=$(grep -m 1 -E '^\s*\|.*([Ss]tatus|狀態).*\|.*\|' "$spec_file" 2>/dev/null || echo "")
        if [ -n "$status_line" ]; then
            # Extract value from second table cell: | Status | VALUE |
            status=$(echo "$status_line" | awk -F'|' '{gsub(/^[[:space:]]*|[[:space:]]*$/, "", $3); print $3}' | sed 's/\*//g' | awk '{print $1}')
        fi
    else
        # Extract value after colon
        status=$(echo "$status_line" | sed 's/.*[Ss]tatus[*]*[[:space:]]*:[[:space:]]*//' | sed 's/[[:space:]]*$//' | awk '{print $1}')
    fi

    # Normalize status to lowercase for comparison
    status_lower=$(echo "$status" | tr '[:upper:]' '[:lower:]')

    # Terminal states: archived, stable
    if [[ "$status_lower" != "archived" ]] && [[ "$status_lower" != "stable" ]]; then
        ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
        rel_path="${spec_file#$ROOT_DIR/}"

        if [ "$VERBOSE" = true ]; then
            echo -e "  ${YELLOW}⚠ $rel_path${NC} (Status: $status)"
        fi

        ORPHAN_LIST="${ORPHAN_LIST}\n  - ${rel_path} (${status})"
    else
        if [ "$VERBOSE" = true ]; then
            rel_path="${spec_file#$ROOT_DIR/}"
            echo -e "  ${GREEN}✓ $rel_path${NC} (Status: $status)"
        fi
    fi
done < <(find "$SPECS_DIR" -name "*.md" -type f 2>/dev/null | sort)

echo ""

if [ $TOTAL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No spec files found — nothing to check${NC}"
    exit 0
fi

if [ $ORPHAN_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All $TOTAL_COUNT specs are in terminal state (Archived/Stable)${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Found $ORPHAN_COUNT orphan spec(s) out of $TOTAL_COUNT total${NC}"

    if [ "$VERBOSE" = false ]; then
        echo -e "$ORPHAN_LIST"
    fi

    echo ""
    echo -e "${CYAN}Tip: Use '/sdd verify' to close completed specs, or '/sdd review' to progress stalled ones.${NC}"

    if [ "$STRICT" = true ]; then
        echo -e "${RED}Failing due to --strict mode${NC}"
        exit 1
    else
        # Warning only — exit 0 so pre-release check doesn't fail
        exit 0
    fi
fi
