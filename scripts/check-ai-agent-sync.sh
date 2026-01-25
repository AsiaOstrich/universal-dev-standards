#!/bin/bash
#
# AI Agent Sync Checker
# AI Agent 同步檢查器
#
# This script checks if AI Agent integration files maintain consistent
# core rules (Anti-Hallucination, SDD Priority, Commit Format).
#
# 此腳本檢查 AI Agent 整合檔案是否維持一致的核心規則
# （反幻覺、SDD 優先級、提交格式）。
#
# Usage: ./scripts/check-ai-agent-sync.sh [options]
#
# Options:
#   --verbose    Show detailed pattern matching
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
            echo "Usage: ./scripts/check-ai-agent-sync.sh [options]"
            echo ""
            echo "Options:"
            echo "  --verbose    Show detailed pattern matching"
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

# Temp files for counting (to avoid subshell issues)
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

inc_passed() {
    local count
    count=$(cat "$PASSED_FILE")
    echo $((count + 1)) > "$PASSED_FILE"
}

inc_skipped() {
    local count
    count=$(cat "$SKIPPED_FILE")
    echo $((count + 1)) > "$SKIPPED_FILE"
}

get_errors() { cat "$ERROR_FILE"; }
get_warnings() { cat "$WARNING_FILE"; }
get_passed() { cat "$PASSED_FILE"; }
get_skipped() { cat "$SKIPPED_FILE"; }

# Check if registry file exists
if [ ! -f "$REGISTRY_FILE" ]; then
    echo -e "${RED}ERROR: Registry file not found: $REGISTRY_FILE${NC}"
    exit 1
fi

# Header
if [ "$JSON_OUTPUT" = false ]; then
    echo ""
    echo "=========================================="
    echo "  AI Agent Sync Checker"
    echo "  AI Agent 同步檢查器"
    echo "=========================================="
    echo ""
fi

# Function to get rule pattern by ID
get_rule_pattern() {
    local rule_id="$1"
    case "$rule_id" in
        "AH-001") echo "read.*file.*before|must.*read|MUST read files before|Evidence-Based" ;;
        "AH-002") echo "\\[Source:|Source Attribution|cite.*source" ;;
        "AH-003") echo "\\[Confirmed\\]|\\[Inferred\\]|\\[Assumption\\]|\\[Unknown\\]|Certainty Classification" ;;
        "AH-004") echo "recommend.*option|Recommended.*choice|MUST.*recommend|explicitly state.*Recommended" ;;
        "SDD-001") echo "OpenSpec|Spec Kit|openspec/|specs/|\\.speckit" ;;
        "SDD-002") echo "prioritize.*command|MUST prioritize|SDD.*Priority|Spec-Driven Development.*Priority" ;;
        "CMT-001") echo "type.*scope.*subject|<type>.*<scope>|Conventional Commits|feat.*fix.*docs" ;;
        *) echo "" ;;
    esac
}

# Function to get rule severity by ID
get_rule_severity() {
    local rule_id="$1"
    case "$rule_id" in
        "AH-001"|"AH-002"|"SDD-001") echo "error" ;;
        "AH-003"|"AH-004"|"SDD-002"|"CMT-001") echo "warning" ;;
        *) echo "warning" ;;
    esac
}

# Function to get rule name by ID
get_rule_name() {
    local rule_id="$1"
    case "$rule_id" in
        "AH-001") echo "Evidence-Based Analysis" ;;
        "AH-002") echo "Source Attribution" ;;
        "AH-003") echo "Certainty Classification" ;;
        "AH-004") echo "Recommendation Required" ;;
        "SDD-001") echo "SDD Tool Detection" ;;
        "SDD-002") echo "SDD Command Priority" ;;
        "CMT-001") echo "Conventional Commits Format" ;;
        *) echo "Unknown Rule" ;;
    esac
}

# Function to get agent file path
get_agent_file() {
    local agent_id="$1"
    case "$agent_id" in
        "claude-code") echo "CLAUDE.md" ;;
        "opencode") echo "integrations/opencode/AGENTS.md" ;;
        "cursor") echo "integrations/cursor/.cursorrules" ;;
        "cline") echo "integrations/cline/.clinerules" ;;
        "windsurf") echo "integrations/windsurf/.windsurfrules" ;;
        "copilot") echo "integrations/github-copilot/copilot-instructions.md" ;;
        "codex") echo "integrations/codex/AGENTS.md" ;;
        "gemini-cli") echo "integrations/gemini-cli/GEMINI.md" ;;
        "antigravity") echo "integrations/google-antigravity/INSTRUCTIONS.md" ;;
        *) echo "" ;;
    esac
}

# Function to get agent tier
get_agent_tier() {
    local agent_id="$1"
    case "$agent_id" in
        "claude-code"|"opencode") echo "complete" ;;
        "cursor"|"cline"|"windsurf"|"copilot"|"codex") echo "partial" ;;
        "gemini-cli") echo "preview" ;;
        "antigravity") echo "minimal" ;;
        *) echo "minimal" ;;
    esac
}

# Function to get required rules for tier
get_tier_rules() {
    local tier="$1"
    case "$tier" in
        "complete") echo "AH-001 AH-002 AH-003 AH-004 SDD-001 SDD-002 CMT-001" ;;
        "partial") echo "AH-001 AH-002 AH-003 AH-004 SDD-001 CMT-001" ;;
        "preview") echo "AH-001 AH-002 AH-003" ;;
        "minimal") echo "AH-001 AH-002" ;;
        *) echo "AH-001 AH-002" ;;
    esac
}

# Function to check a single rule in a file
check_rule() {
    local file="$1"
    local rule_id="$2"
    local pattern
    pattern=$(get_rule_pattern "$rule_id")

    if grep -qEi "$pattern" "$file" 2>/dev/null; then
        return 0  # Rule found
    else
        return 1  # Rule not found
    fi
}

# Function to check an agent
check_agent() {
    local agent_id="$1"
    local relative_path
    local file_path
    local tier
    local required_rules

    relative_path=$(get_agent_file "$agent_id")
    file_path="$ROOT_DIR/$relative_path"
    tier=$(get_agent_tier "$agent_id")
    required_rules=$(get_tier_rules "$tier")

    local agent_errors=0
    local agent_warnings=0
    local agent_passed=0

    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${CYAN}Checking ${BOLD}$agent_id${NC}${CYAN} (${tier})${NC}"
    fi

    # Check if file exists
    if [ ! -f "$file_path" ]; then
        if [ "$JSON_OUTPUT" = false ]; then
            echo -e "  ${YELLOW}[SKIP]${NC} File not found: $relative_path"
        fi
        inc_skipped
        return 0
    fi

    # Check each required rule
    for rule_id in $required_rules; do
        local severity
        local rule_name
        severity=$(get_rule_severity "$rule_id")
        rule_name=$(get_rule_name "$rule_id")

        if check_rule "$file_path" "$rule_id"; then
            if [ "$JSON_OUTPUT" = false ]; then
                if [ "$VERBOSE" = true ]; then
                    echo -e "  ${GREEN}[PASS]${NC} $rule_id: $rule_name"
                fi
            fi
            agent_passed=$((agent_passed + 1))
            inc_passed
        else
            if [ "$severity" = "error" ]; then
                if [ "$JSON_OUTPUT" = false ]; then
                    echo -e "  ${RED}[FAIL]${NC} $rule_id: $rule_name (required)"
                fi
                agent_errors=$((agent_errors + 1))
                inc_errors
            else
                if [ "$JSON_OUTPUT" = false ]; then
                    echo -e "  ${YELLOW}[WARN]${NC} $rule_id: $rule_name (recommended)"
                fi
                agent_warnings=$((agent_warnings + 1))
                inc_warnings
            fi
        fi
    done

    # Summary for this agent
    if [ "$JSON_OUTPUT" = false ]; then
        local total=$((agent_errors + agent_warnings + agent_passed))
        if [ $agent_errors -eq 0 ] && [ $agent_warnings -eq 0 ]; then
            echo -e "  ${GREEN}✓ All $total rules passed${NC}"
        else
            echo -e "  Summary: ${GREEN}$agent_passed passed${NC}, ${RED}$agent_errors errors${NC}, ${YELLOW}$agent_warnings warnings${NC}"
        fi
        echo ""
    fi
}

# Main check loop
if [ "$JSON_OUTPUT" = false ]; then
    echo -e "${BLUE}Checking AI Agent rule compliance...${NC}"
    echo ""
fi

# List of agents to check
AGENTS="claude-code opencode cursor cline windsurf copilot codex gemini-cli antigravity"

# Check each agent
for agent_id in $AGENTS; do
    check_agent "$agent_id"
done

# Summary
ERRORS=$(get_errors)
WARNINGS=$(get_warnings)
PASSED=$(get_passed)
SKIPPED=$(get_skipped)
TOTAL=$((ERRORS + WARNINGS + PASSED))

if [ "$JSON_OUTPUT" = true ]; then
    # JSON output
    if [ $TOTAL -gt 0 ]; then
        COMPLIANCE=$((PASSED * 100 / TOTAL))
    else
        COMPLIANCE=0
    fi
    cat << EOF
{
  "status": "$([ $ERRORS -eq 0 ] && echo "pass" || echo "fail")",
  "summary": {
    "passed": $PASSED,
    "errors": $ERRORS,
    "warnings": $WARNINGS,
    "skipped": $SKIPPED,
    "total": $TOTAL
  },
  "compliance": $COMPLIANCE
}
EOF
else
    echo "=========================================="
    echo "  Summary | 摘要"
    echo "=========================================="
    echo ""

    # Calculate compliance percentage
    if [ $TOTAL -gt 0 ]; then
        COMPLIANCE=$((PASSED * 100 / TOTAL))
    else
        COMPLIANCE=0
    fi

    echo -e "  Compliance: ${BOLD}${COMPLIANCE}%${NC}"
    echo ""
    echo -e "  ${GREEN}Passed:${NC}   $PASSED"
    echo -e "  ${RED}Errors:${NC}   $ERRORS"
    echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
    echo -e "  ${CYAN}Skipped:${NC}  $SKIPPED"
    echo ""

    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}${BOLD}✗ Sync check failed!${NC}"
        echo ""
        echo "To fix errors:"
        echo "  - Ensure each integration file contains all required rules"
        echo "  - Reference: integrations/REGISTRY.json for rule patterns"
        echo "  - Reference: core/anti-hallucination.md for rule definitions"
        echo ""
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}${BOLD}⚠ Sync check passed with warnings${NC}"
        echo ""
        exit 0
    else
        echo -e "${GREEN}${BOLD}✓ All agents are in sync!${NC}"
        echo ""
        exit 0
    fi
fi
