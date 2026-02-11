#!/bin/bash
#
# Version Sync Checker
# 版本同步檢查器
#
# This script checks if version numbers in standards-registry.json
# are synchronized with package.json.
#
# Usage: ./scripts/check-version-sync.sh
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
CLI_DIR="$ROOT_DIR/cli"

PACKAGE_JSON="$CLI_DIR/package.json"
REGISTRY_JSON="$CLI_DIR/standards-registry.json"
PLUGIN_JSON="$ROOT_DIR/.claude-plugin/plugin.json"
MARKETPLACE_JSON="$ROOT_DIR/.claude-plugin/marketplace.json"

echo ""
echo "=========================================="
echo "  Version Sync Checker"
echo "  版本同步檢查器"
echo "=========================================="
echo ""

# Check if files exist
if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "${RED}Error:${NC} package.json not found: $PACKAGE_JSON"
    exit 1
fi

if [ ! -f "$REGISTRY_JSON" ]; then
    echo -e "${RED}Error:${NC} standards-registry.json not found: $REGISTRY_JSON"
    exit 1
fi

# Extract version from package.json
# Using grep and sed for portability (no jq dependency)
PACKAGE_VERSION=$(grep '"version"' "$PACKAGE_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$PACKAGE_VERSION" ]; then
    echo -e "${RED}Error:${NC} Could not extract version from package.json"
    exit 1
fi

echo -e "${BLUE}package.json version:${NC} $PACKAGE_VERSION"
echo ""
echo "----------------------------------------"
echo "Checking standards-registry.json..."
echo "----------------------------------------"
echo ""

# Counters
ERRORS=0

# Check root version field (line 3)
ROOT_VERSION=$(grep '"version"' "$REGISTRY_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
if [ "$ROOT_VERSION" = "$PACKAGE_VERSION" ]; then
    echo -e "${GREEN}[OK]${NC}     Root version: $ROOT_VERSION"
else
    echo -e "${RED}[MISMATCH]${NC} Root version: $ROOT_VERSION (expected: $PACKAGE_VERSION)"
    ERRORS=$((ERRORS + 1))
fi

# Check repositories.standards.version
# This is trickier - we need to find the version under repositories.standards
STANDARDS_VERSION=$(grep -A5 '"standards"' "$REGISTRY_JSON" | grep '"version"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
if [ "$STANDARDS_VERSION" = "$PACKAGE_VERSION" ]; then
    echo -e "${GREEN}[OK]${NC}     repositories.standards.version: $STANDARDS_VERSION"
else
    echo -e "${RED}[MISMATCH]${NC} repositories.standards.version: $STANDARDS_VERSION (expected: $PACKAGE_VERSION)"
    ERRORS=$((ERRORS + 1))
fi

# Check repositories.skills.version
SKILLS_VERSION=$(grep -A10 '"skills"' "$REGISTRY_JSON" | grep '"version"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
if [ "$SKILLS_VERSION" = "$PACKAGE_VERSION" ]; then
    echo -e "${GREEN}[OK]${NC}     repositories.skills.version: $SKILLS_VERSION"
else
    echo -e "${RED}[MISMATCH]${NC} repositories.skills.version: $SKILLS_VERSION (expected: $PACKAGE_VERSION)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "----------------------------------------"
echo "Checking .claude-plugin/ files..."
echo "----------------------------------------"
echo ""

# Check if this is a pre-release version (contains -alpha, -beta, or -rc)
IS_PRERELEASE=false
if [[ "$PACKAGE_VERSION" =~ -(alpha|beta|rc)\. ]]; then
    IS_PRERELEASE=true
    echo -e "${YELLOW}[INFO]${NC}  Pre-release version detected: $PACKAGE_VERSION"
    echo -e "${YELLOW}[INFO]${NC}  Marketplace files should keep stable version (not required to match)"
    echo ""
fi

# Check .claude-plugin/plugin.json
if [ -f "$PLUGIN_JSON" ]; then
    PLUGIN_VERSION=$(grep '"version"' "$PLUGIN_JSON" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ "$IS_PRERELEASE" = true ]; then
        # For pre-release, just show info (marketplace should NOT match)
        if [[ "$PLUGIN_VERSION" =~ -(alpha|beta|rc)\. ]]; then
            echo -e "${YELLOW}[WARN]${NC}  plugin.json version: $PLUGIN_VERSION (should be stable, not pre-release)"
        else
            echo -e "${GREEN}[OK]${NC}     plugin.json version: $PLUGIN_VERSION (stable - correct for marketplace)"
        fi
    else
        # For stable release, must match
        if [ "$PLUGIN_VERSION" = "$PACKAGE_VERSION" ]; then
            echo -e "${GREEN}[OK]${NC}     plugin.json version: $PLUGIN_VERSION"
        else
            echo -e "${RED}[MISMATCH]${NC} plugin.json version: $PLUGIN_VERSION (expected: $PACKAGE_VERSION)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo -e "${YELLOW}[SKIP]${NC}  plugin.json not found"
fi

# Check .claude-plugin/marketplace.json
if [ -f "$MARKETPLACE_JSON" ]; then
    MARKETPLACE_VERSION=$(grep -A20 '"plugins"' "$MARKETPLACE_JSON" | grep '"version"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ "$IS_PRERELEASE" = true ]; then
        # For pre-release, just show info (marketplace should NOT match)
        if [[ "$MARKETPLACE_VERSION" =~ -(alpha|beta|rc)\. ]]; then
            echo -e "${YELLOW}[WARN]${NC}  marketplace.json version: $MARKETPLACE_VERSION (should be stable, not pre-release)"
        else
            echo -e "${GREEN}[OK]${NC}     marketplace.json version: $MARKETPLACE_VERSION (stable - correct for marketplace)"
        fi
    else
        # For stable release, must match
        if [ "$MARKETPLACE_VERSION" = "$PACKAGE_VERSION" ]; then
            echo -e "${GREEN}[OK]${NC}     marketplace.json version: $MARKETPLACE_VERSION"
        else
            echo -e "${RED}[MISMATCH]${NC} marketplace.json version: $MARKETPLACE_VERSION (expected: $PACKAGE_VERSION)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo -e "${YELLOW}[SKIP]${NC}  marketplace.json not found"
fi

echo ""
echo "----------------------------------------"
echo "Checking README files..."
echo "----------------------------------------"
echo ""

# Define README files to check: path|version_label|date_label
README_FILES=(
    "README.md|Version|Released"
    "locales/zh-TW/README.md|版本|發布日期"
    "locales/zh-CN/README.md|版本|发布日期"
)

for readme_info in "${README_FILES[@]}"; do
    IFS='|' read -r readme_path version_label date_label <<< "$readme_info"
    readme_full="$ROOT_DIR/$readme_path"

    if [ -f "$readme_full" ]; then
        # Extract version from **Version**: X.Y.Z or **版本**: X.Y.Z pattern
        README_VERSION=$(grep -E "\*\*${version_label}\*\*:" "$readme_full" | head -1 | sed "s/.*\*\*${version_label}\*\*:[[:space:]]*//" | sed 's/[[:space:]]*|.*//' | sed 's/[[:space:]]*$//')

        if [ "$IS_PRERELEASE" = true ]; then
            # For pre-release, README should keep a stable version (not match)
            if [[ "$README_VERSION" =~ -(alpha|beta|rc)\. ]]; then
                echo -e "${YELLOW}[WARN]${NC}  $readme_path version: $README_VERSION (should be stable, not pre-release)"
            else
                echo -e "${GREEN}[OK]${NC}     $readme_path version: $README_VERSION (stable - correct for pre-release)"
            fi
        else
            # For stable release, must match package.json
            if [ "$README_VERSION" = "$PACKAGE_VERSION" ]; then
                echo -e "${GREEN}[OK]${NC}     $readme_path version: $README_VERSION"
            else
                echo -e "${RED}[MISMATCH]${NC} $readme_path version: $README_VERSION (expected: $PACKAGE_VERSION)"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC}  $readme_path not found"
    fi
done

echo ""
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Found $ERRORS version mismatch(es)!${NC}"
    echo ""
    echo "To fix, update the version numbers in:"
    echo "  $REGISTRY_JSON"
    echo ""
    echo "All version fields should match package.json: $PACKAGE_VERSION"
    echo ""
    exit 1
else
    echo -e "${GREEN}All versions are in sync!${NC}"
    echo ""
    exit 0
fi
