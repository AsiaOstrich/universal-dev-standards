#!/bin/bash
#
# Pre-release Check Script
# 發布前檢查腳本
#
# This script runs all pre-release checks in one command.
# 此腳本一次執行所有發布前檢查。
#
# Usage: ./scripts/pre-release-check.sh [options]
#
# Options:
#   --fail-fast    Stop on first failure
#   --skip-tests   Skip running tests (faster validation)
#   --help         Show this help message
#

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
CLI_DIR="$ROOT_DIR/cli"

# Parse arguments
FAIL_FAST=false
SKIP_TESTS=false

for arg in "$@"; do
    case $arg in
        --fail-fast)
            FAIL_FAST=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help)
            echo "Usage: ./scripts/pre-release-check.sh [options]"
            echo ""
            echo "Options:"
            echo "  --fail-fast    Stop on first failure"
            echo "  --skip-tests   Skip running tests (faster validation)"
            echo "  --help         Show this help message"
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
PASSED=0
FAILED=0
SKIPPED=0
TOTAL=8

if [ "$SKIP_TESTS" = true ]; then
    TOTAL=7
fi

# Function to run a check
run_check() {
    local step=$1
    local name=$2
    local command=$3

    echo -e "${CYAN}[$step/$TOTAL]${NC} $name..."

    # Run the command and capture output
    output=$(eval "$command" 2>&1)
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo -e "      ${GREEN}✓ Passed${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "      ${RED}✗ Failed${NC}"
        echo ""
        echo "$output" | sed 's/^/      /'
        echo ""
        FAILED=$((FAILED + 1))

        if [ "$FAIL_FAST" = true ]; then
            echo -e "${RED}Stopping due to --fail-fast${NC}"
            show_summary
            exit 1
        fi
        return 1
    fi
}

# Function to show summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "  Summary | 摘要"
    echo "=========================================="
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}${BOLD}✓ All pre-release checks passed!${NC}"
        echo -e "  ${GREEN}Ready to release.${NC}"
    else
        echo -e "${RED}${BOLD}✗ $FAILED check(s) failed!${NC}"
        echo -e "  ${RED}Please fix the issues above before releasing.${NC}"
    fi

    echo ""
    echo -e "  Passed:  ${GREEN}$PASSED${NC}"
    echo -e "  Failed:  ${RED}$FAILED${NC}"
    if [ $SKIPPED -gt 0 ]; then
        echo -e "  Skipped: ${YELLOW}$SKIPPED${NC}"
    fi
    echo ""
}

# Header
echo ""
echo "=========================================="
echo "  Pre-release Check"
echo "  發布前檢查"
echo "=========================================="
echo ""

if [ "$SKIP_TESTS" = true ]; then
    echo -e "${YELLOW}Note: Tests will be skipped (--skip-tests)${NC}"
    echo ""
fi

# Change to root directory
cd "$ROOT_DIR"

# Step 1: Git status
echo -e "${CYAN}[1/$TOTAL]${NC} Checking git status..."
git_status=$(git status --porcelain 2>&1)
if [ -z "$git_status" ]; then
    echo -e "      ${GREEN}✓ Working directory clean${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "      ${YELLOW}⚠ Uncommitted changes detected${NC}"
    echo ""
    echo "$git_status" | sed 's/^/      /'
    echo ""
    echo -e "      ${YELLOW}(This is a warning, not a failure)${NC}"
    PASSED=$((PASSED + 1))
fi

# Step 2: Version sync
run_check "2" "Running version sync check" "$SCRIPT_DIR/check-version-sync.sh"

# Step 3: Standards sync
run_check "3" "Running standards sync check" "$SCRIPT_DIR/check-standards-sync.sh"

# Step 4: Translation sync
run_check "4" "Running translation sync check" "$SCRIPT_DIR/check-translation-sync.sh"

# Step 5: CLI-docs sync
run_check "5" "Running CLI-docs sync check" "$SCRIPT_DIR/check-cli-docs-sync.sh"

# Step 6: Documentation sync
run_check "6" "Running documentation sync check" "$SCRIPT_DIR/check-docs-sync.sh"

# Step 7: Linting
run_check "7" "Running linting" "npm run lint --prefix $CLI_DIR"

# Step 8: Tests
if [ "$SKIP_TESTS" = true ]; then
    echo -e "${CYAN}[8/$TOTAL]${NC} Running tests..."
    echo -e "      ${YELLOW}⏭ Skipped (--skip-tests flag)${NC}"
    SKIPPED=$((SKIPPED + 1))
else
    run_check "8" "Running tests" "npm test --prefix $CLI_DIR"
fi

# Show summary
show_summary

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
