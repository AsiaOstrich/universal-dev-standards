#!/bin/bash
#
# CLI-to-Documentation Sync Checker
# CLI 與文件同步檢查器
#
# This script validates that all CLI options defined in cli/bin/uds.js
# are properly documented in docs/CLI-INIT-OPTIONS.md
#
# Checks:
# 1. CLI options in uds.js → docs/CLI-INIT-OPTIONS.md
# 2. Reports missing documentation for CLI options
# 3. Reports documented options that don't exist in CLI (stale docs)
#
# Usage: ./scripts/check-cli-docs-sync.sh
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

# Files to check
CLI_FILE="$ROOT_DIR/cli/bin/uds.js"
DOCS_FILE="$ROOT_DIR/docs/CLI-INIT-OPTIONS.md"

# Temp files for counting
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

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  CLI-to-Documentation Sync Checker${NC}"
echo -e "${CYAN}  CLI 與文件同步檢查器${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if files exist
if [[ ! -f "$CLI_FILE" ]]; then
    echo -e "${RED}ERROR: CLI file not found: $CLI_FILE${NC}"
    exit 1
fi

if [[ ! -f "$DOCS_FILE" ]]; then
    echo -e "${RED}ERROR: Documentation file not found: $DOCS_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}Checking: cli/bin/uds.js ↔ docs/CLI-INIT-OPTIONS.md${NC}"
echo ""

# Extract CLI options from uds.js for 'init' command
# Look for .option() calls between 'init' command and next command
echo -e "${CYAN}Step 1: Extracting CLI options from uds.js...${NC}"

# Extract init command block and find all .option() definitions
CLI_OPTIONS=$(sed -n "/\.command('init')/,/\.command('/p" "$CLI_FILE" | \
    grep -oE "\.option\('[^']+'" | \
    sed "s/\.option('//g" | \
    sed "s/'$//g" | \
    sort -u)
# Note: grep patterns below avoid \` and [a-z\-] which are undefined in POSIX ERE

# Parse option names (both short and long forms)
declare -a CLI_LONG_OPTIONS=()
declare -a CLI_SHORT_OPTIONS=()

while IFS= read -r opt; do
    # Extract long option (--xxx)
    long_opt=$(echo "$opt" | grep -oE -- '--[-a-z]+' | head -1)
    if [[ -n "$long_opt" ]]; then
        CLI_LONG_OPTIONS+=("$long_opt")
    fi

    # Extract short option (-x)
    short_opt=$(echo "$opt" | grep -oE '^-[a-zA-Z]' | head -1)
    if [[ -n "$short_opt" ]]; then
        CLI_SHORT_OPTIONS+=("$short_opt")
    fi
done <<< "$CLI_OPTIONS"

echo -e "  Found ${#CLI_LONG_OPTIONS[@]} long options in CLI"
echo ""

# Extract documented options from CLI-INIT-OPTIONS.md
echo -e "${CYAN}Step 2: Extracting documented options from CLI-INIT-OPTIONS.md...${NC}"

# Look for options in markdown tables (format: `--option` or `-o, --option`)
DOCS_OPTIONS=$(grep -oE '`--[-a-z]+`|`-[a-zA-Z], --[-a-z]+`' "$DOCS_FILE" | \
    grep -oE -- '--[-a-z]+' | \
    sort -u)

declare -a DOC_LONG_OPTIONS=()
while IFS= read -r opt; do
    if [[ -n "$opt" ]]; then
        DOC_LONG_OPTIONS+=("$opt")
    fi
done <<< "$DOCS_OPTIONS"

echo -e "  Found ${#DOC_LONG_OPTIONS[@]} long options in documentation"
echo ""

# Check CLI options against documentation
echo -e "${CYAN}Step 3: Checking CLI options are documented...${NC}"

missing_in_docs=0
for opt in "${CLI_LONG_OPTIONS[@]}"; do
    found=0
    for doc_opt in "${DOC_LONG_OPTIONS[@]}"; do
        if [[ "$opt" == "$doc_opt" ]]; then
            found=1
            break
        fi
    done

    if [[ $found -eq 0 ]]; then
        echo -e "  ${RED}ERROR: CLI option '$opt' is not documented${NC}"
        inc_errors
        missing_in_docs=$((missing_in_docs + 1))
    fi
done

if [[ $missing_in_docs -eq 0 ]]; then
    echo -e "  ${GREEN}✓ All CLI options are documented${NC}"
fi
echo ""

# Check documentation against CLI (stale docs)
echo -e "${CYAN}Step 4: Checking for stale documentation...${NC}"

stale_docs=0
for doc_opt in "${DOC_LONG_OPTIONS[@]}"; do
    found=0
    for opt in "${CLI_LONG_OPTIONS[@]}"; do
        if [[ "$opt" == "$doc_opt" ]]; then
            found=1
            break
        fi
    done

    if [[ $found -eq 0 ]]; then
        echo -e "  ${YELLOW}WARNING: Documented option '$doc_opt' not found in CLI${NC}"
        inc_warnings
        stale_docs=$((stale_docs + 1))
    fi
done

if [[ $stale_docs -eq 0 ]]; then
    echo -e "  ${GREEN}✓ No stale documentation found${NC}"
fi
echo ""

# Summary
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

errors=$(cat "$ERROR_FILE")
warnings=$(cat "$WARNING_FILE")

echo -e "  CLI options:   ${#CLI_LONG_OPTIONS[@]}"
echo -e "  Documented:    ${#DOC_LONG_OPTIONS[@]}"
echo ""

if [[ $errors -gt 0 ]]; then
    echo -e "  ${RED}Errors:   $errors${NC}"
fi

if [[ $warnings -gt 0 ]]; then
    echo -e "  ${YELLOW}Warnings: $warnings${NC}"
fi

if [[ $errors -eq 0 && $warnings -eq 0 ]]; then
    echo -e "  ${GREEN}✓ CLI and documentation are in sync!${NC}"
fi

echo ""

# Exit with error if there are errors
if [[ $errors -gt 0 ]]; then
    echo -e "${RED}CLI-docs sync check failed with $errors error(s)${NC}"
    exit 1
fi

echo -e "${GREEN}CLI-docs sync check passed${NC}"
exit 0
