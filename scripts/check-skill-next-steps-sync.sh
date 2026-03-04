#!/bin/bash
#
# Skill Next Steps Guidance Sync Checker
# 技能「下一步引導」同步檢查器
#
# Checks if English SKILL.md files containing "## Next Steps Guidance"
# have corresponding sections in zh-TW and zh-CN translations.
#
# Usage: ./scripts/check-skill-next-steps-sync.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SKILLS_DIR="$ROOT_DIR/skills"
ZH_TW_DIR="$ROOT_DIR/locales/zh-TW/skills"
ZH_CN_DIR="$ROOT_DIR/locales/zh-CN/skills"

# Counters
SYNCED=0
WARNINGS=0
TOTAL=0

echo ""
echo "=========================================="
echo "  Skill Next Steps Guidance Sync Check"
echo "  技能下一步引導同步檢查"
echo "=========================================="
echo ""

echo "Checking Next Steps Guidance sync..."
echo ""

# Find all English SKILL.md files with Next Steps Guidance
for skill_dir in "$SKILLS_DIR"/*/; do
    skill_name=$(basename "$skill_dir")
    en_file="$skill_dir/SKILL.md"

    # Skip if no SKILL.md
    [ ! -f "$en_file" ] && continue

    # Check if English file has Next Steps Guidance
    if ! grep -q "## Next Steps Guidance" "$en_file" 2>/dev/null; then
        continue
    fi

    TOTAL=$((TOTAL + 1))

    # Check zh-TW
    tw_file="$ZH_TW_DIR/$skill_name/SKILL.md"
    tw_status="✗"
    tw_note=""
    if [ ! -f "$tw_file" ]; then
        tw_note="(no translation file)"
    elif grep -q "## 下一步引導\|## Next Steps Guidance" "$tw_file" 2>/dev/null; then
        tw_status="✓"
    else
        tw_note="(missing section)"
    fi

    # Check zh-CN
    cn_file="$ZH_CN_DIR/$skill_name/SKILL.md"
    cn_status="✗"
    cn_note=""
    if [ ! -f "$cn_file" ]; then
        cn_note="(no translation file)"
    elif grep -q "## 下一步引导\|## Next Steps Guidance" "$cn_file" 2>/dev/null; then
        cn_status="✓"
    else
        cn_note="(missing section)"
    fi

    # Determine overall status
    if [ "$tw_status" = "✓" ] && [ "$cn_status" = "✓" ]; then
        echo -e "  ${GREEN}✓${NC} ${skill_name}: EN ✓ | zh-TW ✓ | zh-CN ✓"
        SYNCED=$((SYNCED + 1))
    elif [ "$tw_status" = "✓" ] && [ -z "$cn_note" ] || [ "$cn_note" = "(no translation file)" ]; then
        # zh-CN file doesn't exist — warning, not error
        echo -e "  ${YELLOW}⚠${NC} ${skill_name}: EN ✓ | zh-TW ${tw_status} ${tw_note} | zh-CN ${cn_status} ${cn_note}"
        WARNINGS=$((WARNINGS + 1))
        SYNCED=$((SYNCED + 1))
    elif [ "$cn_status" = "✓" ] && [ "$tw_note" = "(no translation file)" ]; then
        echo -e "  ${YELLOW}⚠${NC} ${skill_name}: EN ✓ | zh-TW ${tw_status} ${tw_note} | zh-CN ${cn_status}"
        WARNINGS=$((WARNINGS + 1))
        SYNCED=$((SYNCED + 1))
    else
        echo -e "  ${RED}✗${NC} ${skill_name}: EN ✓ | zh-TW ${tw_status} ${tw_note} | zh-CN ${cn_status} ${cn_note}"
    fi
done

echo ""
echo "=========================================="

FAILED=$((TOTAL - SYNCED))

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${GREEN}Summary: ${SYNCED}/${TOTAL} synced${NC}, ${YELLOW}${WARNINGS} warning(s) (missing translation file)${NC}"
    else
        echo -e "${GREEN}Summary: ${SYNCED}/${TOTAL} synced${NC}"
    fi
    echo ""
    exit 0
else
    echo -e "${RED}Summary: ${SYNCED}/${TOTAL} synced, ${FAILED} failed${NC}"
    echo ""
    exit 1
fi
