#!/bin/bash
#
# Documentation Sync Checker
# 文件同步檢查器
#
# This script checks if documentation files are properly updated:
# 1. CHANGELOG.md has entry for current version
# 2. Version numbers are synchronized across key files
# 3. Reminds about other docs that may need updating
#
# Usage: ./scripts/check-docs-sync.sh
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
CLI_DIR="$ROOT_DIR/cli"

echo ""
echo "=========================================="
echo "  Documentation Sync Checker"
echo "  文件同步檢查器"
echo "=========================================="
echo ""

# Extract version from package.json
PACKAGE_JSON="$CLI_DIR/package.json"
if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "${RED}Error:${NC} package.json not found: $PACKAGE_JSON"
    exit 1
fi

VERSION=$(grep '"version"' "$PACKAGE_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
if [ -z "$VERSION" ]; then
    echo -e "${RED}Error:${NC} Could not extract version from package.json"
    exit 1
fi

echo -e "${BLUE}Current version:${NC} $VERSION"

# Determine if this is a pre-release
IS_PRERELEASE=false
if [[ "$VERSION" =~ (alpha|beta|rc) ]]; then
    IS_PRERELEASE=true
    echo -e "${BLUE}Release type:${NC} Pre-release (beta/alpha/rc)"
else
    echo -e "${BLUE}Release type:${NC} Stable release"
fi
echo ""

ERRORS=0
WARNINGS=0

# ==========================================
# Check 1: CHANGELOG.md
# ==========================================
echo "----------------------------------------"
echo "Check 1: CHANGELOG.md"
echo "----------------------------------------"
echo ""

CHANGELOG="$ROOT_DIR/CHANGELOG.md"
if [ ! -f "$CHANGELOG" ]; then
    echo -e "${RED}[ERROR]${NC} CHANGELOG.md not found"
    ERRORS=$((ERRORS + 1))
else
    # Check if current version has an entry
    if grep -q "## \[$VERSION\]" "$CHANGELOG"; then
        echo -e "${GREEN}[OK]${NC}    CHANGELOG has entry for [$VERSION]"
    else
        # Check for [Unreleased] section with content
        if grep -q "## \[Unreleased\]" "$CHANGELOG"; then
            # Check if [Unreleased] has any content before the next ## section
            UNRELEASED_CONTENT=$(sed -n '/## \[Unreleased\]/,/## \[/p' "$CHANGELOG" | grep -E "^### " | head -1)
            if [ -n "$UNRELEASED_CONTENT" ]; then
                echo -e "${YELLOW}[WARN]${NC}  CHANGELOG has [Unreleased] section with content"
                echo -e "        Consider moving content to [$VERSION] section before release"
                WARNINGS=$((WARNINGS + 1))
            else
                echo -e "${RED}[ERROR]${NC} CHANGELOG has empty [Unreleased] and no [$VERSION] entry"
                ERRORS=$((ERRORS + 1))
            fi
        else
            echo -e "${RED}[ERROR]${NC} CHANGELOG missing entry for [$VERSION]"
            ERRORS=$((ERRORS + 1))
        fi
    fi
fi
echo ""

# ==========================================
# Check 2: Version Sync in Key Files
# ==========================================
echo "----------------------------------------"
echo "Check 2: Version Sync"
echo "----------------------------------------"
echo ""

# Check plugin.json
PLUGIN_JSON="$ROOT_DIR/.claude-plugin/plugin.json"
if [ -f "$PLUGIN_JSON" ]; then
    PLUGIN_VERSION=$(grep '"version"' "$PLUGIN_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ "$PLUGIN_VERSION" = "$VERSION" ]; then
        echo -e "${GREEN}[OK]${NC}    .claude-plugin/plugin.json: $PLUGIN_VERSION"
    else
        echo -e "${RED}[ERROR]${NC} .claude-plugin/plugin.json: $PLUGIN_VERSION (expected: $VERSION)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}[SKIP]${NC}  .claude-plugin/plugin.json not found"
fi

# Check marketplace.json
MARKETPLACE_JSON="$ROOT_DIR/.claude-plugin/marketplace.json"
if [ -f "$MARKETPLACE_JSON" ]; then
    MARKETPLACE_VERSION=$(grep '"version"' "$MARKETPLACE_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ "$MARKETPLACE_VERSION" = "$VERSION" ]; then
        echo -e "${GREEN}[OK]${NC}    .claude-plugin/marketplace.json: $MARKETPLACE_VERSION"
    else
        echo -e "${RED}[ERROR]${NC} .claude-plugin/marketplace.json: $MARKETPLACE_VERSION (expected: $VERSION)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}[SKIP]${NC}  .claude-plugin/marketplace.json not found"
fi

# Check README.md version (only for stable releases)
README="$ROOT_DIR/README.md"
if [ -f "$README" ]; then
    if [ "$IS_PRERELEASE" = true ]; then
        echo -e "${CYAN}[INFO]${NC}  README.md version check skipped (pre-release)"
    else
        # Extract version from **Version**: X.Y.Z pattern
        README_VERSION=$(grep -E '\*\*Version\*\*:' "$README" | head -1 | sed 's/.*\*\*Version\*\*:[[:space:]]*\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/')
        if [ -n "$README_VERSION" ]; then
            if [ "$README_VERSION" = "$VERSION" ]; then
                echo -e "${GREEN}[OK]${NC}    README.md **Version**: $README_VERSION"
            else
                echo -e "${RED}[ERROR]${NC} README.md **Version**: $README_VERSION (expected: $VERSION)"
                ERRORS=$((ERRORS + 1))
            fi
        else
            echo -e "${YELLOW}[WARN]${NC}  README.md: Could not find **Version** field"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "${RED}[ERROR]${NC} README.md not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ==========================================
# Check 3: Documentation Update Reminders
# ==========================================
echo "----------------------------------------"
echo "Check 3: Documentation Reminders"
echo "----------------------------------------"
echo ""
echo -e "${CYAN}Review these files if relevant changes were made:${NC}"
echo ""

# List of docs that may need updating
DOCS_TO_CHECK=(
    "docs/AI-AGENT-ROADMAP.md:New features or AI agent support"
    "docs/CLI-INIT-OPTIONS.md:CLI option changes (has automated check)"
    "docs/LOCALIZATION-ROADMAP.md:Translation or i18n changes"
    "docs/OPERATION-WORKFLOW.md:Workflow or process changes"
    "docs/USAGE-MODES-COMPARISON.md:Usage mode changes"
    "docs/WINDOWS-GUIDE.md:Windows-specific changes"
    "STANDARDS-MAPPING.md:Standard mapping changes"
)

for doc_info in "${DOCS_TO_CHECK[@]}"; do
    doc_path="${doc_info%%:*}"
    doc_desc="${doc_info##*:}"
    full_path="$ROOT_DIR/$doc_path"

    if [ -f "$full_path" ]; then
        echo -e "  ${BLUE}*${NC} $doc_path"
        echo -e "    ${YELLOW}→${NC} $doc_desc"
    else
        echo -e "  ${YELLOW}*${NC} $doc_path (not found)"
    fi
done

echo ""

# ==========================================
# Summary
# ==========================================
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Found $ERRORS error(s)!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Found $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Please fix the errors above before releasing."
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Found $WARNINGS warning(s)${NC}"
    echo -e "${GREEN}No critical errors found.${NC}"
    echo ""
    exit 0
else
    echo -e "${GREEN}All documentation checks passed!${NC}"
    echo ""
    exit 0
fi
