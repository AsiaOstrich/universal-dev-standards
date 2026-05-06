#!/bin/bash
# DEPRECATED: Use 'npx tsx scripts/check-ai-behavior-sync.ts' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# AI Agent Behavior Sync Checker
# AI Agent Behavior 覆蓋率檢查器
#
# This script checks that all multi-step command definition files
# include an "AI Agent Behavior" section.
#
# 此腳本檢查所有多步驟指令定義檔是否包含
# 「AI Agent Behavior」段落。
#
# Usage: ./scripts/check-ai-behavior-sync.sh [options]
#
# Options:
#   --verbose    Show details for each file
#   --help       Show this help message
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COMMANDS_DIR="$ROOT_DIR/skills/commands"

# Whitelist: files that do NOT need AI Agent Behavior
# - README.md, COMMAND-FAMILY-OVERVIEW.md: non-command files
# - guide.md: single-action, pure query command
WHITELIST=(
    "README.md"
    "COMMAND-FAMILY-OVERVIEW.md"
    "guide.md"
)

# Parse arguments
VERBOSE=false

for arg in "$@"; do
    case $arg in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: ./scripts/check-ai-behavior-sync.sh [options]"
            echo ""
            echo "Checks that all multi-step command definition files include"
            echo "an 'AI Agent Behavior' section."
            echo ""
            echo "Options:"
            echo "  --verbose    Show details for each file"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $arg${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Counters
TOTAL=0
COVERED=0
MISSING=0
SKIPPED=0
MISSING_FILES=""

echo ""
echo -e "${BOLD}AI Agent Behavior Coverage Check${NC}"
echo -e "${BOLD}AI Agent Behavior 覆蓋率檢查${NC}"
echo "=========================================="

# Check each command file
for file in "$COMMANDS_DIR"/*.md; do
    filename=$(basename "$file")

    # Check whitelist
    is_whitelisted=false
    for wl in "${WHITELIST[@]}"; do
        if [ "$filename" = "$wl" ]; then
            is_whitelisted=true
            break
        fi
    done

    if [ "$is_whitelisted" = true ]; then
        SKIPPED=$((SKIPPED + 1))
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${YELLOW}⏭ $filename (whitelisted)${NC}"
        fi
        continue
    fi

    TOTAL=$((TOTAL + 1))

    if grep -q "## AI Agent Behavior" "$file"; then
        COVERED=$((COVERED + 1))
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${GREEN}✓ $filename${NC}"
        fi
    else
        MISSING=$((MISSING + 1))
        MISSING_FILES="$MISSING_FILES\n  - $filename"
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${RED}✗ $filename (missing AI Agent Behavior)${NC}"
        fi
    fi
done

echo ""

# Show summary
COVERAGE=0
if [ $TOTAL -gt 0 ]; then
    COVERAGE=$((COVERED * 100 / TOTAL))
fi

echo -e "Coverage: ${BOLD}$COVERED/$TOTAL${NC} ($COVERAGE%)"
echo -e "  Covered:  ${GREEN}$COVERED${NC}"
echo -e "  Missing:  ${RED}$MISSING${NC}"
echo -e "  Skipped:  ${YELLOW}$SKIPPED${NC} (whitelisted)"

if [ $MISSING -gt 0 ]; then
    echo ""
    echo -e "${RED}Missing AI Agent Behavior section:${NC}"
    echo -e "$MISSING_FILES"
    echo ""
    echo -e "${YELLOW}These command files need an 'AI Agent Behavior' section.${NC}"
    echo -e "${YELLOW}See core/ai-command-behavior.md for the required format.${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✓ All command files have AI Agent Behavior sections${NC}"
    exit 0
fi
