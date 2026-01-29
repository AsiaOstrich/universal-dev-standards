#!/bin/bash
#
# Core↔Skill Sync Check Script
# Core↔Skill 同步檢查腳本
#
# This script checks the synchronization between Core Standards, Skills, and Commands.
# 此腳本檢查 Core Standards、Skills 和 Commands 之間的同步狀態。
#
# Usage: ./scripts/check-spec-sync.sh [--verbose]
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

# Counters
SYNCED=0
WARNINGS=0
ERRORS=0
UNMAPPED=0

# Define Skill ↔ Core Standard mappings using simple format
# Each line: skill_name|core_standard_file
SKILL_CORE_MAPPINGS="
commit-standards|commit-message-guide.md
testing-guide|testing-standards.md
checkin-assistant|checkin-standards.md
code-review-assistant|code-review-checklist.md
spec-driven-dev|spec-driven-development.md
tdd-assistant|test-driven-development.md
bdd-assistant|behavior-driven-development.md
atdd-assistant|acceptance-test-driven-development.md
documentation-guide|documentation-structure.md
git-workflow-guide|git-workflow.md
ai-collaboration-standards|anti-hallucination.md
changelog-guide|changelog-standards.md
logging-guide|logging-standards.md
error-code-guide|error-code-standards.md
project-structure-guide|project-structure.md
refactoring-assistant|refactoring-standards.md
test-coverage-assistant|test-completeness-dimensions.md
reverse-engineer|reverse-engineering-standards.md
forward-derivation|forward-derivation-standards.md
ai-friendly-architecture|ai-friendly-architecture.md
ai-instruction-standards|ai-instruction-standards.md
release-standards|versioning.md
"

# Define utility skills (no Core Standard needed)
# Note: requirement-assistant is marked as utility until a core/requirement-engineering.md is created
UTILITY_SKILLS="docs-generator methodology-system requirement-assistant"

echo ""
echo "=========================================="
echo "  Core↔Skill Sync Check"
echo "  Core↔Skill 同步檢查"
echo "=========================================="
echo ""

# Function to check if skill has SKILL.md
check_skill() {
    local skill_name="$1"
    local skill_path="$SKILLS_DIR/$skill_name"

    if [ -f "$skill_path/SKILL.md" ]; then
        return 0
    fi
    return 1
}

# Function to check if core standard exists
check_core() {
    local core_file="$1"
    local core_path="$CORE_DIR/$core_file"

    if [ -f "$core_path" ]; then
        return 0
    fi
    return 1
}

# Function to check if skill is a utility skill
is_utility_skill() {
    local skill_name="$1"
    for utility in $UTILITY_SKILLS; do
        if [ "$skill_name" = "$utility" ]; then
            return 0
        fi
    done
    return 1
}

# Function to get core file for a skill
get_core_for_skill() {
    local skill_name="$1"
    echo "$SKILL_CORE_MAPPINGS" | while IFS='|' read -r skill core; do
        skill=$(echo "$skill" | tr -d ' \n\r')
        core=$(echo "$core" | tr -d ' \n\r')
        if [ "$skill" = "$skill_name" ]; then
            echo "$core"
            return 0
        fi
    done
}

# Check utility skills
echo -e "${CYAN}Checking utility skills (no Core Standard required)...${NC}"
for skill in $UTILITY_SKILLS; do
    if check_skill "$skill"; then
        echo -e "  ${GREEN}✓${NC} $skill ${YELLOW}(utility, no core standard required)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${YELLOW}⚠${NC} $skill (utility skill not found)"
        fi
    fi
done

echo ""
echo -e "${CYAN}Checking skill-to-core mappings...${NC}"

# Check skill-to-core mappings
echo "$SKILL_CORE_MAPPINGS" | while IFS='|' read -r skill core_file; do
    # Skip empty lines
    skill=$(echo "$skill" | tr -d ' \n\r')
    core_file=$(echo "$core_file" | tr -d ' \n\r')

    if [ -z "$skill" ] || [ -z "$core_file" ]; then
        continue
    fi

    skill_exists=false
    core_exists=false

    if check_skill "$skill"; then
        skill_exists=true
    fi

    if check_core "$core_file"; then
        core_exists=true
    fi

    if [ "$skill_exists" = true ] && [ "$core_exists" = true ]; then
        echo -e "  ${GREEN}✓${NC} $skill ↔ core/$core_file"
    elif [ "$skill_exists" = true ] && [ "$core_exists" = false ]; then
        echo -e "  ${RED}✗${NC} $skill → core/$core_file ${RED}(core standard missing)${NC}"
    elif [ "$skill_exists" = false ] && [ "$core_exists" = true ]; then
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${YELLOW}⚠${NC} core/$core_file → $skill ${YELLOW}(skill not yet created)${NC}"
        fi
    else
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${YELLOW}-${NC} $skill ↔ core/$core_file (both missing)"
        fi
    fi
done

# Count synced and errors by re-processing
echo "$SKILL_CORE_MAPPINGS" | while IFS='|' read -r skill core_file; do
    skill=$(echo "$skill" | tr -d ' \n\r')
    core_file=$(echo "$core_file" | tr -d ' \n\r')

    if [ -z "$skill" ] || [ -z "$core_file" ]; then
        continue
    fi

    if check_skill "$skill" && check_core "$core_file"; then
        echo "SYNCED"
    elif check_skill "$skill" && ! check_core "$core_file"; then
        echo "ERROR"
    fi
done > /tmp/spec_sync_results.txt

SYNCED=$(grep -c "SYNCED" /tmp/spec_sync_results.txt 2>/dev/null | tr -d '\n' || echo "0")
ERRORS=$(grep -c "ERROR" /tmp/spec_sync_results.txt 2>/dev/null | tr -d '\n' || echo "0")
# Ensure values are integers
SYNCED=${SYNCED:-0}
ERRORS=${ERRORS:-0}
rm -f /tmp/spec_sync_results.txt

echo ""

# Check for skills without mapping (potential issues)
echo -e "${CYAN}Checking for unmapped skills...${NC}"

# Get all mapped skills
MAPPED_SKILLS=$(echo "$SKILL_CORE_MAPPINGS" | cut -d'|' -f1 | tr -d ' \n\r' | tr '\n' ' ')

if [ -d "$SKILLS_DIR" ]; then
    for skill_dir in "$SKILLS_DIR"/*/; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")

            # Skip special directories
            if [ "$skill_name" = "commands" ] || [ "$skill_name" = "agents" ] || [ "$skill_name" = "workflows" ]; then
                continue
            fi

            # Check if skill has SKILL.md
            if [ ! -f "$skill_dir/SKILL.md" ]; then
                continue
            fi

            # Check if skill is in mapping or utility list
            is_mapped=false

            # Check mappings
            echo "$SKILL_CORE_MAPPINGS" | while IFS='|' read -r mapped_skill _; do
                mapped_skill=$(echo "$mapped_skill" | tr -d ' \n\r')
                if [ "$skill_name" = "$mapped_skill" ]; then
                    echo "FOUND"
                    break
                fi
            done | grep -q "FOUND" && is_mapped=true

            # Check utility skills
            if is_utility_skill "$skill_name"; then
                is_mapped=true
            fi

            if [ "$is_mapped" = false ]; then
                echo -e "  ${YELLOW}⚠${NC} $skill_name ${YELLOW}(not in mapping - add to SKILL_CORE_MAPPINGS or UTILITY_SKILLS)${NC}"
                UNMAPPED=$((UNMAPPED + 1))
            fi
        fi
    done
fi

if [ "$UNMAPPED" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All skills are mapped"
fi

# Summary
echo ""
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ Core↔Skill sync check passed!${NC}"
else
    echo -e "${RED}${BOLD}✗ Core↔Skill sync check failed!${NC}"
fi

echo ""
echo -e "  Synced:   ${GREEN}$SYNCED${NC}"
echo -e "  Warnings: ${YELLOW}$WARNINGS${NC} (utility skills)"
echo -e "  Errors:   ${RED}$ERRORS${NC}"
if [ "$UNMAPPED" -gt 0 ]; then
    echo -e "  Unmapped: ${YELLOW}$UNMAPPED${NC}"
fi
echo ""

# Exit with error if there are errors
if [ "$ERRORS" -gt 0 ]; then
    exit 1
fi

exit 0
