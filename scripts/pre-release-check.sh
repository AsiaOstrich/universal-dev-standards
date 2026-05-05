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

# Cross-platform /dev/null protection for Windows
_cleanup_null_file() {
  if [ -f "NULL" ]; then rm -f "NULL"; fi
}
trap _cleanup_null_file EXIT

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
TOTAL=22

if [ "$SKIP_TESTS" = true ]; then
    TOTAL=18
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

# Step 1.5: Sync Documentation (Auto-fix)
echo -e "${CYAN}[1.5/$TOTAL]${NC} Syncing Documentation & Manifest..."
npm run docs:sync > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "      ${GREEN}✓ Documentation synchronized${NC}"
else
    echo -e "      ${RED}✗ Documentation sync failed${NC}"
    FAILED=$((FAILED + 1))
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

# Step 7: AI Agent sync
run_check "7" "Running AI Agent sync check" "$SCRIPT_DIR/check-ai-agent-sync.sh"

# Step 7.5: Integration commands sync (SPEC-INTSYNC-001)
run_check "7.5" "Running integration commands sync check" "$SCRIPT_DIR/check-integration-commands-sync.sh"

# Step 8: Usage docs sync
run_check "8" "Running usage docs sync check" "$SCRIPT_DIR/check-usage-docs-sync.sh"

# Step 9: Spec sync (Core↔Skill)
run_check "9" "Running spec sync check (Core↔Skill)" "$SCRIPT_DIR/check-spec-sync.sh"

# Step 10: Scope sync
run_check "10" "Running scope sync check" "$SCRIPT_DIR/check-scope-sync.sh"

# Step 11: Commands sync
run_check "11" "Running commands sync check" "$SCRIPT_DIR/check-commands-sync.sh"

# Step 12: Docs integrity
run_check "12" "Running docs integrity check | 文件完整性檢查" "$SCRIPT_DIR/check-docs-integrity.sh"

# Step 13: Skill Next Steps sync
run_check "13" "Running skill next steps sync check" "$SCRIPT_DIR/check-skill-next-steps-sync.sh"

# Step 14: Linting
run_check "14" "Running linting" "npm run lint --prefix $CLI_DIR"

# Step 15: Orphan Spec Detection
# Mandatory Closure: stable releases enforce --strict (orphans = FAILED)
# Alpha/Beta/RC releases keep warning-only behavior
echo -e "${CYAN}[15/$TOTAL]${NC} Running orphan spec detection | 孤兒 Spec 偵測..."
ORPHAN_STRICT=""
CLI_VERSION=$(node -p "require('$CLI_DIR/package.json').version" 2>/dev/null || echo "0.0.0")
if echo "$CLI_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    ORPHAN_STRICT="--strict"
    echo -e "      ${CYAN}Stable release detected (v$CLI_VERSION) — enforcing strict orphan check${NC}"
fi
orphan_output=$("$SCRIPT_DIR/check-orphan-specs.sh" $ORPHAN_STRICT 2>&1)
orphan_exit=$?
if [ $orphan_exit -ne 0 ] && [ -n "$ORPHAN_STRICT" ]; then
    echo -e "      ${RED}✗ Orphan specs detected (strict mode — stable release)${NC}"
    echo "$orphan_output" | grep -E "^\s*-" | sed 's/^/      /'
    FAILED=$((FAILED + 1))
elif echo "$orphan_output" | grep -q "orphan spec"; then
    echo -e "      ${YELLOW}⚠ Orphan specs detected (warning only — pre-release version)${NC}"
    echo "$orphan_output" | grep -E "^\s*-" | sed 's/^/      /'
    PASSED=$((PASSED + 1))
else
    echo -e "      ${GREEN}✓ No orphan specs${NC}"
    PASSED=$((PASSED + 1))
fi

# Step 16: AI Agent Behavior coverage
run_check "16" "Running AI Agent Behavior coverage check | AI Agent Behavior 覆蓋率檢查" "$SCRIPT_DIR/check-ai-behavior-sync.sh"

# Step 17: Workflow Compliance (warning only)
echo -e "${CYAN}[17/$TOTAL]${NC} Running workflow compliance check | 工作流程合規檢查..."
if [ -f "$SCRIPT_DIR/check-workflow-compliance.sh" ]; then
    wf_output=$("$SCRIPT_DIR/check-workflow-compliance.sh" 2>&1)
    wf_warnings=$(echo "$wf_output" | grep -c "⚠️" 2>/dev/null || echo "0")
    if [ "$wf_warnings" -gt 0 ]; then
        echo -e "      ${YELLOW}⚠ $wf_warnings workflow warning(s) (advisory only)${NC}"
        echo "$wf_output" | grep "⚠️\|Active workflows\|→" | sed 's/^/      /'
    else
        echo -e "      ${GREEN}✓ No workflow compliance issues${NC}"
    fi
    PASSED=$((PASSED + 1))
else
    echo -e "      ${YELLOW}⏭ check-workflow-compliance.sh not found${NC}"
    SKIPPED=$((SKIPPED + 1))
fi

# Step 18: Registry Completeness
run_check "18" "Running registry completeness check | 註冊表完整性檢查" "$SCRIPT_DIR/check-registry-completeness.sh"

# Step 19: Unit Tests
if [ "$SKIP_TESTS" = true ]; then
    echo -e "${CYAN}[19/$TOTAL]${NC} Running unit tests..."
    echo -e "      ${YELLOW}⏭ Skipped (--skip-tests flag)${NC}"
    SKIPPED=$((SKIPPED + 1))
else
    run_check "19" "Running unit tests | 單元測試" "npm run test:unit --prefix $CLI_DIR"
fi

# Step 20: E2E Tests (Bug Regression)
if [ "$SKIP_TESTS" = true ]; then
    echo -e "${CYAN}[20/$TOTAL]${NC} Running E2E tests..."
    echo -e "      ${YELLOW}⏭ Skipped (--skip-tests flag)${NC}"
    SKIPPED=$((SKIPPED + 1))
else
    run_check "20" "Running E2E tests | E2E 迴歸測試" "npm run test:e2e --prefix $CLI_DIR"
fi

# Step 21: Release Readiness Sign-off (warning-only until next minor release)
echo -e "${CYAN}[21/$TOTAL]${NC} Checking release readiness sign-off | 釋出準備簽核檢查..."
if [ -f "$SCRIPT_DIR/check-release-readiness-signoff.sh" ]; then
    signoff_output=$("$SCRIPT_DIR/check-release-readiness-signoff.sh" 2>&1)
    signoff_exit=$?
    if [ $signoff_exit -ne 0 ]; then
        echo -e "      ${YELLOW}⚠ Release readiness sign-off incomplete (advisory) | 釋出準備簽核不完整（僅警告）${NC}"
        echo "$signoff_output" | head -5 | sed 's/^/      /'
        PASSED=$((PASSED + 1))  # warning-only: does not count as failure
    else
        echo -e "      ${GREEN}✓ Release readiness sign-off present${NC}"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "      ${YELLOW}⏭ check-release-readiness-signoff.sh not found${NC}"
    SKIPPED=$((SKIPPED + 1))
fi

# Step 22: Flow Gate Report (warning-only until next minor release)
echo -e "${CYAN}[22/$TOTAL]${NC} Checking flow gate report | 流程閘門報告檢查..."
if [ -f "$SCRIPT_DIR/check-flow-gate-report.sh" ]; then
    flowgate_output=$("$SCRIPT_DIR/check-flow-gate-report.sh" 2>&1)
    flowgate_exit=$?
    if [ $flowgate_exit -ne 0 ]; then
        echo -e "      ${YELLOW}⚠ flow_gate_report.json missing or incomplete (advisory) | flow_gate_report.json 缺失或不完整（僅警告）${NC}"
        echo "$flowgate_output" | head -5 | sed 's/^/      /'
        PASSED=$((PASSED + 1))  # warning-only
    else
        echo -e "      ${GREEN}✓ Flow gate report valid${NC}"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "      ${YELLOW}⏭ check-flow-gate-report.sh not found${NC}"
    SKIPPED=$((SKIPPED + 1))
fi

# Show summary
show_summary

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
