#!/bin/bash
#
# Commands Sync Checker
# 指令同步檢查器
#
# This script validates that all entries in AVAILABLE_COMMANDS (ai-agent-paths.js)
# have corresponding .md files in skills/commands/, and vice versa.
#
# Checks:
# 1. AVAILABLE_COMMANDS → skills/commands/*.md (missing files)
# 2. skills/commands/*.md → AVAILABLE_COMMANDS (unregistered commands)
#
# Usage: ./scripts/check-commands-sync.sh
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

# Files and directories to check
AGENT_PATHS_FILE="$ROOT_DIR/cli/src/config/ai-agent-paths.js"
COMMANDS_DIR="$ROOT_DIR/skills/commands"

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
echo -e "${CYAN}  Commands Sync Checker${NC}"
echo -e "${CYAN}  指令同步檢查器${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if files/directories exist
if [[ ! -f "$AGENT_PATHS_FILE" ]]; then
    echo -e "${RED}ERROR: ai-agent-paths.js not found: $AGENT_PATHS_FILE${NC}"
    exit 1
fi

if [[ ! -d "$COMMANDS_DIR" ]]; then
    echo -e "${RED}ERROR: Commands directory not found: $COMMANDS_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}Checking: AVAILABLE_COMMANDS ↔ skills/commands/*.md${NC}"
echo ""

# Step 1: Extract command names from AVAILABLE_COMMANDS in ai-agent-paths.js
echo -e "${CYAN}Step 1: Extracting commands from AVAILABLE_COMMANDS...${NC}"

# Extract { name: 'xxx' } patterns from the AVAILABLE_COMMANDS array
REGISTERED_COMMANDS=$(sed -n '/^export const AVAILABLE_COMMANDS/,/^];/p' "$AGENT_PATHS_FILE" | \
    grep -oE "name: '[^']+'" | \
    sed "s/name: '//g" | \
    sed "s/'//g" | \
    sort -u)

REGISTERED_COUNT=0
declare -a REGISTERED_ARRAY=()
while IFS= read -r cmd; do
    if [[ -n "$cmd" ]]; then
        REGISTERED_ARRAY+=("$cmd")
        REGISTERED_COUNT=$((REGISTERED_COUNT + 1))
    fi
done <<< "$REGISTERED_COMMANDS"

echo -e "  Found ${REGISTERED_COUNT} commands in AVAILABLE_COMMANDS"
echo ""

# Step 2: List .md files in skills/commands/ (excluding README.md and COMMAND-FAMILY-OVERVIEW.md)
echo -e "${CYAN}Step 2: Listing command files in skills/commands/...${NC}"

declare -a FILE_COMMANDS=()
FILE_COUNT=0
for f in "$COMMANDS_DIR"/*.md; do
    basename=$(basename "$f" .md)
    # Skip non-command files
    if [[ "$basename" == "README" || "$basename" == "COMMAND-FAMILY-OVERVIEW" ]]; then
        continue
    fi
    FILE_COMMANDS+=("$basename")
    FILE_COUNT=$((FILE_COUNT + 1))
done

# Sort the array
IFS=$'\n' FILE_COMMANDS=($(printf '%s\n' "${FILE_COMMANDS[@]}" | sort -u)); unset IFS

echo -e "  Found ${FILE_COUNT} command files in skills/commands/"
echo ""

# Step 3: Check A→B: every AVAILABLE_COMMANDS entry has a matching .md file
echo -e "${CYAN}Step 3: Checking AVAILABLE_COMMANDS → command files...${NC}"

missing_files=0
for cmd in "${REGISTERED_ARRAY[@]}"; do
    found=0
    for file_cmd in "${FILE_COMMANDS[@]}"; do
        if [[ "$cmd" == "$file_cmd" ]]; then
            found=1
            break
        fi
    done

    if [[ $found -eq 0 ]]; then
        echo -e "  ${RED}ERROR: Command '${cmd}' registered in AVAILABLE_COMMANDS but no file: skills/commands/${cmd}.md${NC}"
        inc_errors
        missing_files=$((missing_files + 1))
    fi
done

if [[ $missing_files -eq 0 ]]; then
    echo -e "  ${GREEN}✓ All registered commands have matching files${NC}"
fi
echo ""

# Step 4: Check B→A: every .md file has a matching AVAILABLE_COMMANDS entry
echo -e "${CYAN}Step 4: Checking command files → AVAILABLE_COMMANDS...${NC}"

unregistered=0
for file_cmd in "${FILE_COMMANDS[@]}"; do
    found=0
    for cmd in "${REGISTERED_ARRAY[@]}"; do
        if [[ "$cmd" == "$file_cmd" ]]; then
            found=1
            break
        fi
    done

    if [[ $found -eq 0 ]]; then
        echo -e "  ${RED}ERROR: File 'skills/commands/${file_cmd}.md' exists but '${file_cmd}' not in AVAILABLE_COMMANDS${NC}"
        inc_errors
        unregistered=$((unregistered + 1))
    fi
done

if [[ $unregistered -eq 0 ]]; then
    echo -e "  ${GREEN}✓ All command files are registered in AVAILABLE_COMMANDS${NC}"
fi
echo ""

# Summary
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

errors=$(cat "$ERROR_FILE")
warnings=$(cat "$WARNING_FILE")

echo -e "  Registered commands: ${REGISTERED_COUNT}"
echo -e "  Command files:       ${FILE_COUNT}"
echo ""

if [[ $errors -gt 0 ]]; then
    echo -e "  ${RED}Errors:   $errors${NC}"
fi

if [[ $warnings -gt 0 ]]; then
    echo -e "  ${YELLOW}Warnings: $warnings${NC}"
fi

if [[ $errors -eq 0 && $warnings -eq 0 ]]; then
    echo -e "  ${GREEN}✓ Commands and files are in sync!${NC}"
fi

echo ""

# Exit with error if there are errors
if [[ $errors -gt 0 ]]; then
    echo -e "${RED}Commands sync check failed with $errors error(s)${NC}"
    exit 1
fi

echo -e "${GREEN}Commands sync check passed${NC}"
exit 0
