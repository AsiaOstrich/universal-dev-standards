#!/bin/bash
# test-refactoring.sh - Verify UDS CLI core module refactoring
#
# This script validates that the core module refactoring is complete and working.
# Run this script after making changes to cli/src/core/*.js files.
#
# Usage: ./scripts/test-refactoring.sh
# Or from cli directory: ./scripts/test-refactoring.sh

# Don't use set -e as we want to continue after failed checks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory and navigate to cli root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}       UDS CLI Core Module Refactoring Verification             ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$CLI_DIR"

# Track results
PASSED=0
FAILED=0

# Helper function to run a check
check() {
    local name="$1"
    shift
    if "$@" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((PASSED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $name"
        ((FAILED++))
        return 1
    fi
}

# ============================================================================
# Phase 1: Module Loading Verification
# ============================================================================
echo -e "${YELLOW}📦 Phase 1: Module Loading Verification${NC}"
echo ""

# Test constants.js
check "constants.js - PERMISSIONS.ALL = 7" node -e "
import('./src/core/constants.js').then(m => {
  if (m.PERMISSIONS.ALL !== 7) process.exit(1);
  if (!m.SUPPORTED_AI_TOOLS['claude-code']) process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test paths.js
check "paths.js - imports from constants.js" node -e "
import('./src/core/paths.js').then(m => {
  if (!m.DIRECTORIES || !m.DIRECTORIES.UDS) process.exit(1);
  if (!m.FILE_PATTERNS || !m.FILE_PATTERNS.STANDARDS) process.exit(1);
  if (typeof m.PathResolver.getStandardSource !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test manifest.js
check "manifest.js - schema v3.3.0" node -e "
import('./src/core/manifest.js').then(m => {
  if (m.CURRENT_SCHEMA_VERSION !== '3.3.0') process.exit(1);
  if (typeof m.writeManifest !== 'function') process.exit(1);
  if (typeof m.validateManifest !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test errors.js
check "errors.js - error handling system" node -e "
import('./src/core/errors.js').then(m => {
  if (typeof m.UDSError !== 'function') process.exit(1);
  if (typeof m.success !== 'function') process.exit(1);
  if (typeof m.failure !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test init.js command
check "init.js - command loads" node -e "
import('./src/commands/init.js').then(m => {
  if (typeof m.initCommand !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

echo ""

# ============================================================================
# Phase 2: CLI Functionality Verification
# ============================================================================
echo -e "${YELLOW}🖥️  Phase 2: CLI Functionality Verification${NC}"
echo ""

# Test CLI version
VERSION=$(node bin/uds.js --version 2>/dev/null || echo "error")
if [ "$VERSION" = "4.1.0" ]; then
    echo -e "  ${GREEN}✓${NC} CLI version: $VERSION"
    ((PASSED++))
else
    echo -e "  ${RED}✗${NC} CLI version: expected 4.1.0, got $VERSION"
    ((FAILED++))
fi

# Test list command
if node bin/uds.js list 2>&1 | grep -q "Skill (23)"; then
    echo -e "  ${GREEN}✓${NC} list command works"
    ((PASSED++))
else
    echo -e "  ${RED}✗${NC} list command failed"
    ((FAILED++))
fi

echo ""

# ============================================================================
# Phase 3: Unit Tests
# ============================================================================
echo -e "${YELLOW}🧪 Phase 3: Unit Tests${NC}"
echo ""

# Run unit tests and capture result
TEST_OUTPUT=$(npm test -- tests/unit/ 2>&1)
TEST_EXIT=$?

# Check for success
if [ $TEST_EXIT -eq 0 ]; then
    # Extract passed count
    PASSED_COUNT=$(echo "$TEST_OUTPUT" | grep -o '[0-9]* passed' | tail -1 | grep -o '[0-9]*' || echo "0")
    echo -e "  ${GREEN}✓${NC} Unit tests: ${PASSED_COUNT} passed"
    ((PASSED++))
else
    echo -e "  ${RED}✗${NC} Unit tests failed"
    echo "$TEST_OUTPUT" | tail -10
    ((FAILED++))
fi

echo ""

# ============================================================================
# Phase 4: Integration Verification (copier.js)
# ============================================================================
echo -e "${YELLOW}🔗 Phase 4: Module Integration Verification${NC}"
echo ""

# Test copier.js uses core modules
check "copier.js - core module integration" node -e "
import('./src/utils/copier.js').then(m => {
  if (typeof m.writeManifest !== 'function') process.exit(1);
  if (typeof m.readManifest !== 'function') process.exit(1);
  if (typeof m.isInitialized !== 'function') process.exit(1);
  if (typeof m.getRepoRoot !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test hasher.js uses constants
check "hasher.js - module loads" node -e "
import('./src/utils/hasher.js').then(m => {
  if (typeof m.computeFileHash !== 'function') process.exit(1);
  if (typeof m.compareFileHash !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

# Test integration-generator.js uses constants
check "integration-generator.js - module loads" node -e "
import('./src/utils/integration-generator.js').then(m => {
  if (typeof m.writeIntegrationFile !== 'function') process.exit(1);
  if (typeof m.integrationFileExists !== 'function') process.exit(1);
  process.exit(0);
}).catch(() => process.exit(1))
"

echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All $TOTAL checks passed!${NC}"
    echo -e "${GREEN}   Refactoring verification complete.${NC}"
    EXIT_CODE=0
else
    echo -e "${YELLOW}⚠️  $PASSED/$TOTAL checks passed, $FAILED failed${NC}"
    EXIT_CODE=1
fi
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

exit $EXIT_CODE
