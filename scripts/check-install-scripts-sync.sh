#!/bin/bash
#
# Install Scripts Sync Checker
# 安裝腳本同步檢查器
#
# This script verifies that install.sh and install.ps1 contain all skill directories.
# 此腳本驗證 install.sh 和 install.ps1 包含所有 skill 目錄。
#
# Usage: ./scripts/check-install-scripts-sync.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$ROOT_DIR/skills/claude-code"
INSTALL_SH="$SKILLS_DIR/install.sh"
INSTALL_PS1="$SKILLS_DIR/install.ps1"

echo ""
echo "=========================================="
echo "  Install Scripts Sync Checker"
echo "  安裝腳本同步檢查器"
echo "=========================================="
echo ""

# Check if files exist
if [ ! -f "$INSTALL_SH" ]; then
    echo -e "${RED}Error:${NC} install.sh not found: $INSTALL_SH"
    exit 1
fi

if [ ! -f "$INSTALL_PS1" ]; then
    echo -e "${RED}Error:${NC} install.ps1 not found: $INSTALL_PS1"
    exit 1
fi

# Get actual skill directories (exclude non-skill items like 'commands', files, etc.)
# Skills are directories that contain SKILL.md or similar skill files
actual_skills=$(find "$SKILLS_DIR" -maxdepth 1 -type d | while read dir; do
    name=$(basename "$dir")
    # Skip the root directory, commands, ai (helper dir), and hidden directories
    if [ "$name" != "claude-code" ] && [ "$name" != "commands" ] && [ "$name" != "ai" ] && [[ ! "$name" =~ ^\. ]]; then
        echo "$name"
    fi
done | sort)

# Extract skills from install.sh (lines with quoted strings in SKILLS array)
sh_skills=$(grep -E '^\s+"[a-z]' "$INSTALL_SH" | sed 's/.*"\([^"]*\)".*/\1/' | sort)

# Extract skills from install.ps1 (lines with quoted strings in $Skills array)
ps1_skills=$(grep -E '^\s+"[a-z]' "$INSTALL_PS1" | sed 's/.*"\([^"]*\)".*/\1/' | sort)

# Count skills
actual_count=$(echo "$actual_skills" | wc -l | tr -d ' ')
sh_count=$(echo "$sh_skills" | wc -l | tr -d ' ')
ps1_count=$(echo "$ps1_skills" | wc -l | tr -d ' ')

echo -e "${BLUE}Skills Directory:${NC} $SKILLS_DIR"
echo ""
echo -e "${BLUE}Skill counts:${NC}"
echo "  Actual directories: $actual_count"
echo "  install.sh:         $sh_count"
echo "  install.ps1:        $ps1_count"
echo ""

# Compare
has_error=0

# Check install.sh
echo -e "${BLUE}Checking install.sh...${NC}"
sh_missing=$(comm -23 <(echo "$actual_skills") <(echo "$sh_skills"))
sh_extra=$(comm -13 <(echo "$actual_skills") <(echo "$sh_skills"))

if [ -n "$sh_missing" ]; then
    echo -e "${RED}  ✗ Missing from install.sh:${NC}"
    echo "$sh_missing" | while read skill; do
        echo -e "    ${YELLOW}- $skill${NC}"
    done
    has_error=1
elif [ -n "$sh_extra" ]; then
    echo -e "${YELLOW}  ⚠ Extra in install.sh (directory not found):${NC}"
    echo "$sh_extra" | while read skill; do
        echo -e "    ${YELLOW}- $skill${NC}"
    done
    has_error=1
else
    echo -e "${GREEN}  ✓ install.sh is in sync${NC}"
fi

echo ""

# Check install.ps1
echo -e "${BLUE}Checking install.ps1...${NC}"
ps1_missing=$(comm -23 <(echo "$actual_skills") <(echo "$ps1_skills"))
ps1_extra=$(comm -13 <(echo "$actual_skills") <(echo "$ps1_skills"))

if [ -n "$ps1_missing" ]; then
    echo -e "${RED}  ✗ Missing from install.ps1:${NC}"
    echo "$ps1_missing" | while read skill; do
        echo -e "    ${YELLOW}- $skill${NC}"
    done
    has_error=1
elif [ -n "$ps1_extra" ]; then
    echo -e "${YELLOW}  ⚠ Extra in install.ps1 (directory not found):${NC}"
    echo "$ps1_extra" | while read skill; do
        echo -e "    ${YELLOW}- $skill${NC}"
    done
    has_error=1
else
    echo -e "${GREEN}  ✓ install.ps1 is in sync${NC}"
fi

echo ""

# Check if sh and ps1 are in sync with each other
echo -e "${BLUE}Checking install.sh vs install.ps1...${NC}"
if [ "$sh_skills" != "$ps1_skills" ]; then
    echo -e "${RED}  ✗ install.sh and install.ps1 are not in sync${NC}"
    diff_output=$(diff <(echo "$sh_skills") <(echo "$ps1_skills") || true)
    echo "$diff_output" | head -20
    has_error=1
else
    echo -e "${GREEN}  ✓ install.sh and install.ps1 are in sync${NC}"
fi

echo ""
echo "=========================================="

if [ $has_error -eq 1 ]; then
    echo -e "${RED}✗ Sync check failed${NC}"
    echo ""
    echo "To fix, update the SKILLS array in:"
    echo "  - $INSTALL_SH"
    echo "  - $INSTALL_PS1"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ All install scripts are in sync${NC}"
    echo ""
    exit 0
fi
