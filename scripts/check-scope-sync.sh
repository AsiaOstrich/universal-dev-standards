#!/bin/bash
#
# Scope Consistency Check Script
# Scope 一致性檢查腳本
#
# This script verifies that all Skills and Core Standards have valid scope markers.
# 此腳本驗證所有 Skills 和 Core Standards 都有有效的 scope 標記。
#
# Valid scope values: universal, partial, uds-specific
# 有效的 scope 值：universal, partial, uds-specific
#
# Usage: ./scripts/check-scope-sync.sh [--verbose]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$ROOT_DIR/skills"
CORE_DIR="$ROOT_DIR/core"

VERBOSE=false
if [ "$1" = "--verbose" ] || [ "$1" = "-v" ]; then
    VERBOSE=true
fi

# Valid scope values
VALID_SCOPES="universal partial uds-specific"

# Counters
SKILLS_TOTAL=0
SKILLS_VALID=0
SKILLS_MISSING=0
SKILLS_INVALID=0
CORE_TOTAL=0
CORE_VALID=0
CORE_MISSING=0
CORE_INVALID=0

# Scope distribution counters
SKILLS_UNIVERSAL=0
SKILLS_PARTIAL=0
SKILLS_UDS_SPECIFIC=0
CORE_UNIVERSAL=0
CORE_PARTIAL=0
CORE_UDS_SPECIFIC=0

echo ""
echo "=========================================="
echo "  Scope Consistency Check"
echo "  Scope 一致性檢查"
echo "=========================================="
echo ""

# Function to check if a value is a valid scope
is_valid_scope() {
    local value="$1"
    for scope in $VALID_SCOPES; do
        if [ "$value" = "$scope" ]; then
            return 0
        fi
    done
    return 1
}

# Function to extract scope from Skill YAML frontmatter
get_skill_scope() {
    local file="$1"
    # Extract scope from YAML frontmatter (between --- markers)
    local scope=$(sed -n '/^---$/,/^---$/p' "$file" | grep -E "^scope:" | sed 's/^scope:[[:space:]]*//' | tr -d '\r\n')
    echo "$scope"
}

# Function to extract scope from Core Standard markdown
get_core_scope() {
    local file="$1"
    # Extract **Scope**: value
    local scope=$(grep -E '^\*\*Scope\*\*:' "$file" | sed 's/^\*\*Scope\*\*:[[:space:]]*//' | tr -d '\r\n')
    echo "$scope"
}

# Check Skills
echo -e "${CYAN}Checking Skills scope markers...${NC}"
echo ""

if [ -d "$SKILLS_DIR" ]; then
    for skill_dir in "$SKILLS_DIR"/*/; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")
            skill_file="$skill_dir/SKILL.md"

            # Skip special directories
            if [ "$skill_name" = "commands" ] || [ "$skill_name" = "agents" ] || [ "$skill_name" = "workflows" ]; then
                continue
            fi

            # Check if SKILL.md exists
            if [ ! -f "$skill_file" ]; then
                continue
            fi

            SKILLS_TOTAL=$((SKILLS_TOTAL + 1))
            scope=$(get_skill_scope "$skill_file")

            if [ -z "$scope" ]; then
                echo -e "  ${RED}✗${NC} $skill_name ${RED}(scope field missing)${NC}"
                SKILLS_MISSING=$((SKILLS_MISSING + 1))
            elif is_valid_scope "$scope"; then
                if [ "$VERBOSE" = true ]; then
                    echo -e "  ${GREEN}✓${NC} $skill_name → ${BLUE}$scope${NC}"
                fi
                SKILLS_VALID=$((SKILLS_VALID + 1))

                # Count distribution
                case "$scope" in
                    universal) SKILLS_UNIVERSAL=$((SKILLS_UNIVERSAL + 1)) ;;
                    partial) SKILLS_PARTIAL=$((SKILLS_PARTIAL + 1)) ;;
                    uds-specific) SKILLS_UDS_SPECIFIC=$((SKILLS_UDS_SPECIFIC + 1)) ;;
                esac
            else
                echo -e "  ${RED}✗${NC} $skill_name ${RED}(invalid scope: '$scope')${NC}"
                SKILLS_INVALID=$((SKILLS_INVALID + 1))
            fi
        fi
    done
fi

if [ "$SKILLS_MISSING" -eq 0 ] && [ "$SKILLS_INVALID" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All $SKILLS_TOTAL Skills have valid scope markers"
fi

echo ""

# Check Core Standards
echo -e "${CYAN}Checking Core Standards scope markers...${NC}"
echo ""

if [ -d "$CORE_DIR" ]; then
    for core_file in "$CORE_DIR"/*.md; do
        if [ -f "$core_file" ]; then
            core_name=$(basename "$core_file")
            CORE_TOTAL=$((CORE_TOTAL + 1))

            scope=$(get_core_scope "$core_file")

            if [ -z "$scope" ]; then
                echo -e "  ${RED}✗${NC} $core_name ${RED}(Scope field missing)${NC}"
                CORE_MISSING=$((CORE_MISSING + 1))
            elif is_valid_scope "$scope"; then
                if [ "$VERBOSE" = true ]; then
                    echo -e "  ${GREEN}✓${NC} $core_name → ${BLUE}$scope${NC}"
                fi
                CORE_VALID=$((CORE_VALID + 1))

                # Count distribution
                case "$scope" in
                    universal) CORE_UNIVERSAL=$((CORE_UNIVERSAL + 1)) ;;
                    partial) CORE_PARTIAL=$((CORE_PARTIAL + 1)) ;;
                    uds-specific) CORE_UDS_SPECIFIC=$((CORE_UDS_SPECIFIC + 1)) ;;
                esac
            else
                echo -e "  ${RED}✗${NC} $core_name ${RED}(invalid scope: '$scope')${NC}"
                CORE_INVALID=$((CORE_INVALID + 1))
            fi
        fi
    done
fi

if [ "$CORE_MISSING" -eq 0 ] && [ "$CORE_INVALID" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All $CORE_TOTAL Core Standards have valid scope markers"
fi

# Summary
echo ""
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

TOTAL_ERRORS=$((SKILLS_MISSING + SKILLS_INVALID + CORE_MISSING + CORE_INVALID))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ Scope consistency check passed!${NC}"
else
    echo -e "${RED}${BOLD}✗ Scope consistency check failed!${NC}"
fi

echo ""
echo -e "${BOLD}Skills:${NC}"
echo -e "  Total:        $SKILLS_TOTAL"
echo -e "  Valid:        ${GREEN}$SKILLS_VALID${NC}"
echo -e "  Missing:      ${RED}$SKILLS_MISSING${NC}"
echo -e "  Invalid:      ${RED}$SKILLS_INVALID${NC}"
echo ""
echo -e "${BOLD}Core Standards:${NC}"
echo -e "  Total:        $CORE_TOTAL"
echo -e "  Valid:        ${GREEN}$CORE_VALID${NC}"
echo -e "  Missing:      ${RED}$CORE_MISSING${NC}"
echo -e "  Invalid:      ${RED}$CORE_INVALID${NC}"
echo ""

# Scope distribution
echo -e "${BOLD}Scope Distribution:${NC}"
echo ""
echo -e "  ${CYAN}Skills:${NC}"
echo -e "    universal:    ${GREEN}$SKILLS_UNIVERSAL${NC} ($((SKILLS_UNIVERSAL * 100 / SKILLS_TOTAL))%)"
echo -e "    partial:      ${YELLOW}$SKILLS_PARTIAL${NC} ($((SKILLS_PARTIAL * 100 / SKILLS_TOTAL))%)"
echo -e "    uds-specific: ${BLUE}$SKILLS_UDS_SPECIFIC${NC} ($((SKILLS_UDS_SPECIFIC * 100 / SKILLS_TOTAL))%)"
echo ""
echo -e "  ${CYAN}Core Standards:${NC}"
echo -e "    universal:    ${GREEN}$CORE_UNIVERSAL${NC} ($((CORE_UNIVERSAL * 100 / CORE_TOTAL))%)"
echo -e "    partial:      ${YELLOW}$CORE_PARTIAL${NC} ($((CORE_PARTIAL * 100 / CORE_TOTAL))%)"
echo -e "    uds-specific: ${BLUE}$CORE_UDS_SPECIFIC${NC} ($((CORE_UDS_SPECIFIC * 100 / CORE_TOTAL))%)"
echo ""

# Exit with error if there are issues
if [ "$TOTAL_ERRORS" -gt 0 ]; then
    exit 1
fi

exit 0
