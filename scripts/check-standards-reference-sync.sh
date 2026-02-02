#!/bin/bash

# check-standards-reference-sync.sh
# Validates STANDARDS-REFERENCE.md consistency with standards-registry.json
#
# Usage: ./scripts/check-standards-reference-sync.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Standards Reference Sync Checker"
echo "  標準參照同步檢查器"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# 1. Count core standards in core/ directory
CORE_COUNT=$(ls -1 "$ROOT_DIR/core/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo -e "${BLUE}[1/4] Core standards in core/*.md:${NC} $CORE_COUNT"

# 2. Count standards documented in STANDARDS-REFERENCE.md
REF_FILE="$ROOT_DIR/docs/STANDARDS-REFERENCE.md"
if [ -f "$REF_FILE" ]; then
  # Count lines starting with "#### " followed by a number
  REF_COUNT=$(grep -c "^#### [0-9]" "$REF_FILE" || echo "0")
  echo -e "${BLUE}[2/4] Standards documented in STANDARDS-REFERENCE.md:${NC} $REF_COUNT"

  # Extract the count from Overview table
  STATED_COUNT=$(grep "Core Standards" "$REF_FILE" | grep -oE '[0-9]+' | head -1)
  echo -e "${BLUE}[3/4] Stated count in Overview:${NC} $STATED_COUNT"

  # Compare counts
  if [ "$CORE_COUNT" -ne "$REF_COUNT" ]; then
    echo -e "${RED}[ERROR]${NC} Mismatch: core/ has $CORE_COUNT files, but STANDARDS-REFERENCE.md documents $REF_COUNT"
    ERRORS=$((ERRORS + 1))
  elif [ "$CORE_COUNT" -ne "$STATED_COUNT" ]; then
    echo -e "${RED}[ERROR]${NC} Mismatch: core/ has $CORE_COUNT files, but Overview states $STATED_COUNT"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}[OK]${NC} All counts match: $CORE_COUNT standards"
  fi
else
  echo -e "${RED}[ERROR]${NC} STANDARDS-REFERENCE.md not found"
  ERRORS=$((ERRORS + 1))
fi

# 4. Check Industry Standards metadata in core/*.md
echo ""
echo -e "${BLUE}[4/4] Checking Industry Standards metadata in core/*.md${NC}"

MISSING_META=0
for file in "$ROOT_DIR/core/"*.md; do
  filename=$(basename "$file")
  if ! grep -q "^\*\*Industry Standards\*\*:" "$file" 2>/dev/null; then
    echo -e "${YELLOW}[WARN]${NC} $filename missing Industry Standards metadata"
    MISSING_META=$((MISSING_META + 1))
    WARNINGS=$((WARNINGS + 1))
  fi
done

if [ "$MISSING_META" -eq 0 ]; then
  echo -e "${GREEN}[OK]${NC} All core standards have Industry Standards metadata"
fi

# 5. Check translation sync
echo ""
echo -e "${BLUE}[5/5] Checking translation versions${NC}"

for locale in zh-TW zh-CN; do
  LOCALE_FILE="$ROOT_DIR/locales/$locale/docs/STANDARDS-REFERENCE.md"
  if [ -f "$LOCALE_FILE" ]; then
    LOCALE_COUNT=$(grep "Core Standards\|核心標準\|核心标准" "$LOCALE_FILE" | grep -oE '[0-9]+' | head -1)
    if [ "$LOCALE_COUNT" -eq "$STATED_COUNT" ]; then
      echo -e "${GREEN}[OK]${NC} $locale version matches ($LOCALE_COUNT)"
    else
      echo -e "${RED}[ERROR]${NC} $locale version mismatch: $LOCALE_COUNT vs $STATED_COUNT"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo -e "${YELLOW}[WARN]${NC} $locale translation not found"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# Summary
echo ""
echo "=========================================="
echo "  Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Passed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s)${NC}"
  exit 1
fi
