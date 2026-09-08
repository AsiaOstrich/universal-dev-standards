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
# ⚠️ SCOPE — THIS CHECKS THIS REPOSITORY'S TEMPLATES, NOT WHAT ADOPTERS RECEIVE.
# ⚠️ 範圍——本腳本檢查的是本 repo 的樣板，不是採用者實際拿到的檔案。
#
# `get_agent_file()` below maps every agent to a file inside this repo:
# `codex` -> `integrations/codex/AGENTS.md`, and so on. Adopters never receive
# those. They receive whatever `uds init` writes, which is a different document
# produced by different code (cli/src/utils/integration-generator.js).
#
# Measured 2026-08-18 (XSPEC-357 R7): the generated AGENTS.md was 5,667 bytes
# with 69 filename references and zero rule statements, against a 6,457-byte
# template with 2. Measured again 2026-08-20 with the same rule patterns this
# script uses: the templates score 6-7 of 7, an adopter's files score 0-2 of 7.
# The spec's phrasing: "a rule can be present for the checker and absent for
# every user, with nothing going red."
#
# That is not a defect in the generated files — `.standards/` is ~248k tokens
# and cannot be inlined into an instruction file. It is a defect in reading a
# green run here as a statement about adopters. It is not one.
#
# The adopter side is checked by:
#   tsx scripts/check-adopter-instruction-files.ts     (npm run check:adopter-files)
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
    # Clean up Windows /dev/null artifact
    if [ -f "NULL" ]; then rm -f "NULL"; fi
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
    echo -e "${YELLOW}Scope: this repository's integrations/ templates.${NC}"
    echo -e "${YELLOW}範圍：本 repo 的 integrations/ 樣板。${NC}"
    echo "  Adopters do not receive these files. They receive what \`uds init\`"
    echo "  writes, which these rule patterns score 0-2 of 7 against (templates"
    echo "  score 6-7). A pass here says nothing about any adopter's project."
    echo "  For that: npm run check:adopter-files"
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
# 🔴 Read from the registry, never listed here. The nine entries this used to hardcode
# matched the registry exactly, so switching changes nothing for them — and it adds the
# five it had silently omitted (aider, continue-dev, roo-code, spec-kit, openspec).
#
# `check-integration-liveness.ts` had been WARNING about two of those omissions for
# long enough that the warning was background noise, and the omission that mattered
# most was not in the warning at all: `roo-code` is tier "complete" (7 rules) and the
# tier lookup below defaulted unknown agents to "minimal" (2 rules) — so had it been
# in the list, it would have been checked, quietly, at the loosest tier there is.
registry_field() {
    local agent_id="$1"
    local field="$2"
    local result
    if ! result=$(node -e '
        const registry = require(process.argv[1]);
        const agent = registry.agents[process.argv[2]];
        process.stdout.write(agent && agent[process.argv[3]] != null ? String(agent[process.argv[3]]) : "");
    ' "$REGISTRY_FILE" "$agent_id" "$field"); then
        echo -e "${RED}ERROR: cannot read '$field' for '$agent_id' from $REGISTRY_FILE${NC}" >&2
        exit 1
    fi
    printf '%s' "$result"
}

get_agent_file() {
    registry_field "$1" "instructionFile"
}

# Function to get agent tier
# 🔴 The old `*) echo "minimal"` was the dangerous line: an agent this function did not
# recognise was not skipped and did not error — it was checked at the LOOSEST tier,
# and the report said it passed. Reading the registry removes the guess; an agent with
# no tier there now fails loudly instead of being quietly downgraded.
get_agent_tier() {
    local agent_id="$1"
    local tier
    tier=$(registry_field "$agent_id" "tier")
    if [ -z "$tier" ]; then
        echo -e "${RED}ERROR: '$agent_id' has no tier in $REGISTRY_FILE — refusing to guess one${NC}" >&2
        exit 1
    fi
    printf '%s' "$tier"
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

# Function to read deprecation status from the registry (the SSOT for it)
#
# A deprecated integration target is frozen: its files are kept for reference but are
# no longer required to satisfy tier rules. Without this, a tool that no longer exists
# keeps generating maintenance work -- and because dead tools sit in the lowest tiers,
# whose rule sets are small enough to always pass, no check ever goes red to say so.
#
# Deliberately not silenced: if node or the registry is broken we must fail loudly
# rather than treat "cannot tell" as "not deprecated".
is_deprecated() {
    local agent_id="$1"
    local result
    if ! result=$(node -e '
        const registry = require(process.argv[1]);
        const agent = registry.agents[process.argv[2]];
        process.stdout.write(agent && agent.deprecated === true ? "true" : "false");
    ' "$REGISTRY_FILE" "$agent_id"); then
        echo -e "${RED}ERROR: cannot read deprecation status for '$agent_id' from $REGISTRY_FILE${NC}" >&2
        exit 1
    fi
    [ "$result" = "true" ]
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

    # Frozen targets are reported, not enforced.
    if is_deprecated "$agent_id"; then
        if [ "$JSON_OUTPUT" = false ]; then
            echo -e "${CYAN}Checking ${BOLD}$agent_id${NC}${CYAN} (${tier})${NC}"
            echo -e "  ${YELLOW}[FROZEN]${NC} Deprecated in REGISTRY.json -- rules not enforced"
            echo ""
        fi
        inc_skipped
        return 0
    fi

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

# 🔴 Walked from the registry, never enumerated — and the denominator is printed, so a
# walk that quietly shrinks cannot report green over less than it did yesterday.
# Agents with no instruction file are excluded, and the exclusion is COUNTED and NAMED:
# an exclusion that is silent is just a shorter list with extra steps.
AGENTS=$(node -e '
    const registry = require(process.argv[1]);
    process.stdout.write(Object.keys(registry.agents).join(" "));
' "$REGISTRY_FILE")
if [ -z "$AGENTS" ]; then
    echo -e "${RED}ERROR: walked $REGISTRY_FILE and found 0 agents — nothing would be checked${NC}" >&2
    exit 1
fi

CHECKED=0
EXCLUDED=""
REPORTED_ONLY=""
for agent_id in $AGENTS; do
    if [ -z "$(get_agent_file "$agent_id")" ]; then
        EXCLUDED="$EXCLUDED $agent_id"
        continue
    fi
    tier=$(get_agent_tier "$agent_id")
    if [ "$tier" = "tool" ]; then
        # 🔴 Reported, not enforced — the same treatment this script already gives
        # deprecated targets, and for the same reason: enforcing a rule set nobody
        # decided on is worse than naming the gap.
        #
        # The scope decision already exists, in check-integration-liveness.ts:
        # "`tier: tool` entries are SDD tools, not AI assistants — they carry no rule
        # set." This line makes that decision visible HERE, where the skipping happens,
        # instead of leaving it implicit in another file's filter.
        #
        # ⚠️ No expiry, deliberately: an expiry is a clock on debt, and a recorded
        # decision is not debt. (I first wrote one here claiming nobody had decided —
        # that was wrong, and the decision was two files away.)
        #
        # What WOULD be debt: `tool` has no case in get_tier_rules, so if this skip
        # were ever removed they would fall to the `*` default and be judged against a
        # rule set chosen by a fallthrough. Both fail AH-001/AH-002 today.
        REPORTED_ONLY="$REPORTED_ONLY $agent_id"
        continue
    fi
    check_agent "$agent_id"
    CHECKED=$((CHECKED + 1))
done

if [ "$JSON_OUTPUT" = false ]; then
    TOTAL_AGENTS=$(printf '%s' "$AGENTS" | wc -w | tr -d ' ')
    echo ""
    echo -e "${BLUE}Walked ${TOTAL_AGENTS} agents in the registry, enforced on ${CHECKED}.${NC}"
    [ -n "$EXCLUDED" ] && echo -e "${YELLOW}  Excluded (no instructionFile):${EXCLUDED}${NC}"
    if [ -n "$REPORTED_ONLY" ]; then
        echo -e "${YELLOW}  Reported, not enforced (tier 'tool' — SDD tools, out of scope by decision):${REPORTED_ONLY}${NC}"
    fi
fi

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
  "scope": "integrations/ templates in this repository, NOT the files uds init writes for adopters. See scripts/check-adopter-instruction-files.ts.",
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
        echo -e "${GREEN}${BOLD}✓ All agent templates in integrations/ are in sync!${NC}"
        echo -e "${YELLOW}  This says nothing about what \`uds init\` writes into an adopter's${NC}"
        echo -e "${YELLOW}  project — a different document from different code. Check that with:${NC}"
        echo -e "${YELLOW}    npm run check:adopter-files${NC}"
        echo ""
        exit 0
    fi
fi
