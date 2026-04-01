#!/bin/bash
#
# Integration Commands Sync Checker
# 整合命令同步檢查器
#
# This script checks if AI Agent integration files reference all required
# slash commands based on their tier level and COMMAND-INDEX.json registry.
#
# 此腳本檢查 AI Agent 整合檔案是否依 tier 層級引用所有必要的斜線命令。
#
# Usage: ./scripts/check-integration-commands-sync.sh [options]
#
# Options:
#   --verbose    Show detailed matching per agent
#   --json       Output in JSON format
#   --help       Show this help message
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
REGISTRY_FILE="$ROOT_DIR/integrations/REGISTRY.json"
INDEX_FILE="$ROOT_DIR/skills/commands/COMMAND-INDEX.json"
COMMANDS_DIR="$ROOT_DIR/skills/commands"

# Parse arguments
VERBOSE=false
JSON_OUTPUT=false

for arg in "$@"; do
    case $arg in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --help)
            echo "Usage: ./scripts/check-integration-commands-sync.sh [options]"
            echo ""
            echo "Options:"
            echo "  --verbose    Show detailed matching per agent"
            echo "  --json       Output in JSON format"
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

# Temp files for counting
ERROR_FILE=$(mktemp)
WARNING_FILE=$(mktemp)
PASSED_FILE=$(mktemp)
SKIPPED_FILE=$(mktemp)
echo "0" > "$ERROR_FILE"
echo "0" > "$WARNING_FILE"
echo "0" > "$PASSED_FILE"
echo "0" > "$SKIPPED_FILE"

# Cleanup on exit
cleanup() {
    rm -f "$ERROR_FILE" "$WARNING_FILE" "$PASSED_FILE" "$SKIPPED_FILE"
    if [ -f "NULL" ]; then rm -f "NULL"; fi
}
trap cleanup EXIT

# Helper functions
inc_errors() { echo $(( $(cat "$ERROR_FILE") + 1 )) > "$ERROR_FILE"; }
inc_warnings() { echo $(( $(cat "$WARNING_FILE") + 1 )) > "$WARNING_FILE"; }
inc_passed() { echo $(( $(cat "$PASSED_FILE") + 1 )) > "$PASSED_FILE"; }
inc_skipped() { echo $(( $(cat "$SKIPPED_FILE") + 1 )) > "$SKIPPED_FILE"; }
get_errors() { cat "$ERROR_FILE"; }
get_warnings() { cat "$WARNING_FILE"; }
get_passed() { cat "$PASSED_FILE"; }
get_skipped() { cat "$SKIPPED_FILE"; }

# Check required files
if [ ! -f "$REGISTRY_FILE" ]; then
    echo -e "${RED}ERROR: Registry file not found: $REGISTRY_FILE${NC}"
    exit 1
fi

if [ ! -f "$INDEX_FILE" ]; then
    echo -e "${RED}ERROR: Command index file not found: $INDEX_FILE${NC}"
    exit 1
fi

# Header
if [ "$JSON_OUTPUT" = false ]; then
    echo ""
    echo "=========================================="
    echo "  Integration Commands Sync Checker"
    echo "  整合命令同步檢查器"
    echo "=========================================="
    echo ""
fi

# ─── Phase 1: Check for unregistered commands ───

if [ "$JSON_OUTPUT" = false ]; then
    echo -e "${BLUE}Phase 1: Checking for unregistered commands${NC}"
    echo -e "${BLUE}階段 1: 檢查未登記的命令${NC}"
    echo ""
fi

# Get all indexed commands and excluded files from COMMAND-INDEX.json using node
INDEXED_COMMANDS=$(node -e "
const idx = require('$INDEX_FILE');
const cmds = Object.values(idx.categories).flatMap(c => c.commands);
console.log(cmds.join('\n'));
")

EXCLUDED_FILES=$(node -e "
const idx = require('$INDEX_FILE');
console.log(idx.excluded.join('\n'));
")

UNREGISTERED_COUNT=0
for file in "$COMMANDS_DIR"/*.md; do
    filename=$(basename "$file")

    # Skip excluded files
    is_excluded=false
    while IFS= read -r excl; do
        if [ "$filename" = "$excl" ]; then
            is_excluded=true
            break
        fi
    done <<< "$EXCLUDED_FILES"
    if [ "$is_excluded" = true ]; then
        continue
    fi

    cmd_name="${filename%.md}"

    # Check if command is in index
    is_registered=false
    while IFS= read -r indexed_cmd; do
        if [ "$cmd_name" = "$indexed_cmd" ]; then
            is_registered=true
            break
        fi
    done <<< "$INDEXED_COMMANDS"

    if [ "$is_registered" = false ]; then
        if [ "$JSON_OUTPUT" = false ]; then
            echo -e "  ${YELLOW}⚠️  Unregistered command: ${BOLD}$cmd_name${NC}"
        fi
        inc_warnings
        UNREGISTERED_COUNT=$((UNREGISTERED_COUNT + 1))
    fi
done

if [ "$UNREGISTERED_COUNT" -eq 0 ] && [ "$JSON_OUTPUT" = false ]; then
    echo -e "  ${GREEN}✅ All command files are registered in COMMAND-INDEX.json${NC}"
fi

echo ""

# ─── Phase 2: Check agent integration files for slash command references ───

if [ "$JSON_OUTPUT" = false ]; then
    echo -e "${BLUE}Phase 2: Checking agent integration files for /command references${NC}"
    echo -e "${BLUE}階段 2: 檢查 Agent 整合檔的 /command 引用${NC}"
    echo ""
fi

# Get agent info from REGISTRY.json using node
AGENT_DATA=$(node -e "
const reg = require('$REGISTRY_FILE');
const idx = require('$INDEX_FILE');
const allCategories = Object.keys(idx.categories);
const allCommands = Object.values(idx.categories).flatMap(c => c.commands);

for (const [agentId, agent] of Object.entries(reg.agents)) {
    const tier = agent.tier;
    const tierDef = reg.tiers[tier];
    const reqCats = tierDef.requiredCategories || [];
    const instrFile = agent.instructionFile || '';
    // Output: agentId|tier|instructionFile|requiredCategories(comma-sep)|allCommandsForCategories(comma-sep)
    if (reqCats.length === 0) {
        console.log(agentId + '|' + tier + '|' + instrFile + '|NONE|NONE');
    } else {
        const reqCommands = reqCats.flatMap(cat => idx.categories[cat]?.commands || []);
        console.log(agentId + '|' + tier + '|' + instrFile + '|' + reqCats.join(',') + '|' + reqCommands.join(','));
    }
}
")

while IFS='|' read -r agent_id tier instr_file req_cats req_commands; do
    if [ -z "$agent_id" ]; then continue; fi

    # Skip agents with no command requirements
    if [ "$req_cats" = "NONE" ]; then
        if [ "$JSON_OUTPUT" = false ]; then
            echo -e "${CYAN}Checking ${BOLD}$agent_id${NC}${CYAN} (${tier})${NC}"
            echo -e "  ${BLUE}ℹ️  Skipped (no command requirements for $tier tier)${NC}"
            echo ""
        fi
        inc_skipped
        continue
    fi

    # Check if instruction file exists
    full_path="$ROOT_DIR/$instr_file"
    if [ ! -f "$full_path" ]; then
        if [ "$JSON_OUTPUT" = false ]; then
            echo -e "${CYAN}Checking ${BOLD}$agent_id${NC}${CYAN} (${tier})${NC}"
            echo -e "  ${YELLOW}[SKIP]${NC} File not found: $instr_file"
            echo ""
        fi
        inc_skipped
        continue
    fi

    file_content=$(cat "$full_path")
    agent_missing=()
    agent_found=0
    agent_total=0

    # Check each required command with strict /command matching
    IFS=',' read -ra COMMANDS <<< "$req_commands"
    for cmd in "${COMMANDS[@]}"; do
        agent_total=$((agent_total + 1))
        # Strict match: /command followed by non-alphanumeric-dash or end of line
        if echo "$file_content" | grep -qE "/${cmd}([^a-z0-9-]|$)" 2>/dev/null; then
            agent_found=$((agent_found + 1))
        else
            agent_missing+=("$cmd")
        fi
    done

    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${CYAN}Checking ${BOLD}$agent_id${NC}${CYAN} (${tier})${NC}"

        if [ ${#agent_missing[@]} -eq 0 ]; then
            echo -e "  ${GREEN}✅ All $agent_total commands referenced${NC}"
            inc_passed
        else
            echo -e "  ${RED}❌ Missing ${#agent_missing[@]}/$agent_total commands:${NC}"
            for missing_cmd in "${agent_missing[@]}"; do
                echo -e "     ${RED}• /${missing_cmd}${NC}"
                inc_errors
            done

            if [ "$VERBOSE" = true ]; then
                echo -e "  ${GREEN}Found $agent_found/$agent_total:${NC}"
                for cmd in "${COMMANDS[@]}"; do
                    is_missing=false
                    for m in "${agent_missing[@]}"; do
                        if [ "$cmd" = "$m" ]; then is_missing=true; break; fi
                    done
                    if [ "$is_missing" = false ]; then
                        echo -e "     ${GREEN}✓ /${cmd}${NC}"
                    fi
                done
            fi
        fi
        echo ""
    else
        if [ ${#agent_missing[@]} -gt 0 ]; then
            inc_errors
        else
            inc_passed
        fi
    fi

done <<< "$AGENT_DATA"

# ─── Summary ───

errors=$(get_errors)
warnings=$(get_warnings)
passed=$(get_passed)
skipped=$(get_skipped)

if [ "$JSON_OUTPUT" = false ]; then
    echo "=========================================="
    echo -e "  ${GREEN}Passed: $passed${NC}"
    echo -e "  ${RED}Errors: $errors${NC}"
    echo -e "  ${YELLOW}Warnings: $warnings${NC}"
    echo -e "  ${BLUE}Skipped: $skipped${NC}"
    echo "=========================================="
    echo ""
fi

# Exit with error if any errors found
if [ "$errors" -gt 0 ]; then
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${RED}FAIL: $errors missing command references found${NC}"
    fi
    exit 1
fi

if [ "$warnings" -gt 0 ]; then
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${YELLOW}WARN: $warnings warnings found (unregistered commands)${NC}"
    fi
    exit 0
fi

if [ "$JSON_OUTPUT" = false ]; then
    echo -e "${GREEN}PASS: All integration files are in sync${NC}"
fi
exit 0
