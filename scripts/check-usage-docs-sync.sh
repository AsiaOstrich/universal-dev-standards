#!/bin/bash
# check-usage-docs-sync.sh
# Check if usage documentation needs to be regenerated
#
# Usage:
#   ./scripts/check-usage-docs-sync.sh         # Check sync status
#   ./scripts/check-usage-docs-sync.sh --fix   # Regenerate if needed
#
# Exit codes:
#   0 - All documents are up to date
#   1 - Documents need regeneration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse arguments
FIX_MODE=false
VERBOSE=false

for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --fix       Regenerate documents if out of sync"
      echo "  -v          Verbose output"
      echo "  -h, --help  Show this help"
      exit 0
      ;;
  esac
done

echo -e "${BOLD}${CYAN}━━━ Usage Documentation Sync Check ━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check if generator script exists
if [ ! -f "scripts/generate-usage-docs.mjs" ]; then
  echo -e "${RED}✗ Generator script not found: scripts/generate-usage-docs.mjs${NC}"
  exit 1
fi

# Check if output files exist
DOCS_FILES=(
  "docs/FEATURE-REFERENCE.md"
  "docs/CHEATSHEET.md"
  "locales/zh-TW/docs/FEATURE-REFERENCE.md"
  "locales/zh-TW/docs/CHEATSHEET.md"
  "locales/zh-CN/docs/FEATURE-REFERENCE.md"
  "locales/zh-CN/docs/CHEATSHEET.md"
)

MISSING_FILES=()
for file in "${DOCS_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠ Missing documentation files:${NC}"
  for file in "${MISSING_FILES[@]}"; do
    echo -e "  ${RED}✗ $file${NC}"
  done

  if [ "$FIX_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}Regenerating documentation...${NC}"
    node scripts/generate-usage-docs.mjs
    echo -e "${GREEN}✓ Documentation regenerated${NC}"
    exit 0
  else
    echo ""
    echo -e "${YELLOW}Run with --fix to regenerate${NC}"
    exit 1
  fi
fi

# Check if source files are newer than generated docs
SOURCE_DIRS=(
  "skills/claude-code"
  "core"
  "cli/bin/uds.js"
  "scripts"
)

# Get the oldest generated doc timestamp
OLDEST_DOC_TIME=0
for file in "${DOCS_FILES[@]}"; do
  if [ -f "$file" ]; then
    FILE_TIME=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
    if [ "$OLDEST_DOC_TIME" -eq 0 ] || [ "$FILE_TIME" -lt "$OLDEST_DOC_TIME" ]; then
      OLDEST_DOC_TIME=$FILE_TIME
    fi
  fi
done

# Check if any source is newer
NEEDS_UPDATE=false
NEWER_SOURCES=()

for source in "${SOURCE_DIRS[@]}"; do
  if [ -d "$source" ]; then
    # Find any file newer than the oldest doc
    while IFS= read -r -d '' file; do
      FILE_TIME=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
      if [ "$FILE_TIME" -gt "$OLDEST_DOC_TIME" ]; then
        NEEDS_UPDATE=true
        NEWER_SOURCES+=("$file")
        if [ "$VERBOSE" = false ]; then
          break 2  # Exit both loops if not verbose
        fi
      fi
    done < <(find "$source" -name "*.md" -o -name "*.js" -o -name "*.yaml" -print0 2>/dev/null)
  elif [ -f "$source" ]; then
    FILE_TIME=$(stat -f %m "$source" 2>/dev/null || stat -c %Y "$source" 2>/dev/null)
    if [ "$FILE_TIME" -gt "$OLDEST_DOC_TIME" ]; then
      NEEDS_UPDATE=true
      NEWER_SOURCES+=("$source")
    fi
  fi
done

if [ "$NEEDS_UPDATE" = true ]; then
  echo -e "${YELLOW}⚠ Documentation may be out of date${NC}"

  if [ "$VERBOSE" = true ] && [ ${#NEWER_SOURCES[@]} -gt 0 ]; then
    echo -e "${YELLOW}  Modified sources:${NC}"
    for src in "${NEWER_SOURCES[@]:0:5}"; do
      echo "    - $src"
    done
    if [ ${#NEWER_SOURCES[@]} -gt 5 ]; then
      echo "    ... and $((${#NEWER_SOURCES[@]} - 5)) more"
    fi
  fi

  if [ "$FIX_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}Regenerating documentation...${NC}"
    node scripts/generate-usage-docs.mjs
    echo -e "${GREEN}✓ Documentation regenerated${NC}"
    exit 0
  else
    echo ""
    echo -e "${YELLOW}Run with --fix to regenerate, or run:${NC}"
    echo -e "  node scripts/generate-usage-docs.mjs"
    exit 1
  fi
fi

# All checks passed
echo -e "${GREEN}✓ All documentation files exist${NC}"
echo -e "${GREEN}✓ Documentation appears up to date${NC}"
echo ""
echo -e "${GREEN}${BOLD}✓ Usage documentation sync check passed${NC}"
exit 0
