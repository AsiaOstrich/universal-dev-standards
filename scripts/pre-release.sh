#!/bin/bash
#
# Pre-Release Preparation Script
#
# This script automates the pre-release preparation workflow:
# 1. Update version numbers across all files
# 2. Verify translation sync status
# 3. Run tests and linting
# 4. Display summary and next steps
#
# Usage:
#   ./scripts/pre-release.sh                           # Interactive mode
#   ./scripts/pre-release.sh --version 3.3.0           # Specify version
#   ./scripts/pre-release.sh --version 3.3.0 --dry-run # Preview changes
#   ./scripts/pre-release.sh --skip-translations       # Skip translation sync
#
# Author: Universal Development Standards
# License: MIT

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
VERSION=""
DRY_RUN=false
SKIP_TRANSLATIONS=false
SKIP_TESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version|-v)
            VERSION="$2"
            shift 2
            ;;
        --dry-run|-d)
            DRY_RUN=true
            shift
            ;;
        --skip-translations)
            SKIP_TRANSLATIONS=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help|-h)
            echo "Pre-Release Preparation Script"
            echo ""
            echo "Usage:"
            echo "  ./scripts/pre-release.sh [options]"
            echo ""
            echo "Options:"
            echo "  --version, -v <version>   Specify version (e.g., 3.3.0, 3.3.0-beta.1)"
            echo "  --dry-run, -d             Preview changes without modifying files"
            echo "  --skip-translations       Skip translation sync verification"
            echo "  --skip-tests              Skip running tests and linting"
            echo "  --help, -h                Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./scripts/pre-release.sh --version 3.3.0"
            echo "  ./scripts/pre-release.sh --version 3.3.0-beta.1 --skip-translations"
            echo "  ./scripts/pre-release.sh --version 3.3.0 --dry-run"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Header
echo "=========================================="
echo "  Pre-Release Preparation Script"
echo "  發布前準備腳本"
echo "=========================================="
echo ""

# Change to root directory
cd "$ROOT_DIR"

# Get version if not provided
if [ -z "$VERSION" ]; then
    CURRENT_VERSION=$(node -p "require('./cli/package.json').version" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}Current version:${NC} $CURRENT_VERSION"
    echo ""
    read -p "Enter new version (e.g., 3.3.0 or 3.3.0-beta.1): " VERSION

    if [ -z "$VERSION" ]; then
        echo -e "${RED}Error: Version is required${NC}"
        exit 1
    fi
fi

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z]+\.[0-9]+)?$ ]]; then
    echo -e "${RED}Error: Invalid version format. Expected: X.Y.Z or X.Y.Z-prerelease.N${NC}"
    exit 1
fi

# Get today's date
TODAY=$(date +%Y-%m-%d)

# Determine release type
if [[ "$VERSION" =~ -beta\. ]]; then
    RELEASE_TYPE="beta"
elif [[ "$VERSION" =~ -alpha\. ]]; then
    RELEASE_TYPE="alpha"
elif [[ "$VERSION" =~ -rc\. ]]; then
    RELEASE_TYPE="rc"
else
    RELEASE_TYPE="stable"
fi

echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Release Type:${NC} $RELEASE_TYPE"
echo -e "${BLUE}Date:${NC} $TODAY"
echo -e "${BLUE}Dry Run:${NC} $DRY_RUN"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}=== DRY RUN MODE - No files will be modified ===${NC}"
    echo ""
fi

# ============================================
# Step 1: Update Version Numbers
# ============================================
echo "----------------------------------------"
echo "Step 1: Update Version Numbers"
echo "----------------------------------------"
echo ""

VERSION_FILES=(
    "cli/package.json"
    ".claude-plugin/plugin.json"
    ".claude-plugin/marketplace.json"
    "cli/standards-registry.json"
    "README.md"
)

for file in "${VERSION_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}[OK]${NC} Found: $file"
    else
        echo -e "${RED}[MISSING]${NC} Not found: $file"
    fi
done

if [ "$DRY_RUN" = false ]; then
    echo ""
    echo "Updating version numbers..."

    # Update cli/package.json
    if [ -f "cli/package.json" ]; then
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" cli/package.json
        rm -f cli/package.json.bak
        echo -e "${GREEN}[UPDATED]${NC} cli/package.json"
    fi

    # Update .claude-plugin/plugin.json
    if [ -f ".claude-plugin/plugin.json" ]; then
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" .claude-plugin/plugin.json
        rm -f .claude-plugin/plugin.json.bak
        echo -e "${GREEN}[UPDATED]${NC} .claude-plugin/plugin.json"
    fi

    # Update .claude-plugin/marketplace.json
    if [ -f ".claude-plugin/marketplace.json" ]; then
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" .claude-plugin/marketplace.json
        rm -f .claude-plugin/marketplace.json.bak
        echo -e "${GREEN}[UPDATED]${NC} .claude-plugin/marketplace.json"
    fi

    # Update cli/standards-registry.json (multiple occurrences)
    if [ -f "cli/standards-registry.json" ]; then
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/g" cli/standards-registry.json
        rm -f cli/standards-registry.json.bak
        echo -e "${GREEN}[UPDATED]${NC} cli/standards-registry.json"
    fi

    # Update README.md (only for stable releases)
    if [ "$RELEASE_TYPE" = "stable" ] && [ -f "README.md" ]; then
        sed -i.bak "s/\*\*Version\*\*: [0-9]\+\.[0-9]\+\.[0-9]\+[^*]*/\*\*Version\*\*: $VERSION/" README.md
        sed -i.bak "s/\*\*Last Updated\*\*: [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/\*\*Last Updated\*\*: $TODAY/" README.md
        rm -f README.md.bak
        echo -e "${GREEN}[UPDATED]${NC} README.md"
    fi
fi

echo ""

# ============================================
# Step 2: Verify Version Consistency
# ============================================
echo "----------------------------------------"
echo "Step 2: Verify Version Consistency"
echo "----------------------------------------"
echo ""

echo "Checking for version $VERSION in files..."
grep -r "\"version\": \"$VERSION\"" cli/package.json .claude-plugin/ cli/standards-registry.json 2>/dev/null || true
echo ""

if [ "$RELEASE_TYPE" = "stable" ]; then
    echo "Checking for residual beta/alpha/rc versions..."
    RESIDUAL=$(grep -r "beta\|alpha\|-rc\." cli/package.json .claude-plugin/ cli/standards-registry.json 2>/dev/null | grep -v node_modules || true)
    if [ -n "$RESIDUAL" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Found pre-release version references:"
        echo "$RESIDUAL"
    else
        echo -e "${GREEN}[OK]${NC} No residual pre-release versions found"
    fi
fi

echo ""

# ============================================
# Step 3: Translation Sync Check
# ============================================
if [ "$SKIP_TRANSLATIONS" = false ]; then
    echo "----------------------------------------"
    echo "Step 3: Translation Sync Check"
    echo "----------------------------------------"
    echo ""

    # Check zh-TW
    echo -e "${BLUE}Checking zh-TW translations...${NC}"
    if [ -x "./scripts/check-translation-sync.sh" ]; then
        ./scripts/check-translation-sync.sh 2>&1 | tail -10
    else
        echo -e "${YELLOW}[SKIP]${NC} Translation sync script not found"
    fi
    echo ""

    # Check zh-CN
    echo -e "${BLUE}Checking zh-CN translations...${NC}"
    if [ -x "./scripts/check-translation-sync.sh" ]; then
        ./scripts/check-translation-sync.sh zh-CN 2>&1 | tail -10
    fi
    echo ""
else
    echo "----------------------------------------"
    echo "Step 3: Translation Sync Check (SKIPPED)"
    echo "----------------------------------------"
    echo ""
fi

# ============================================
# Step 4: Run Tests
# ============================================
if [ "$SKIP_TESTS" = false ]; then
    echo "----------------------------------------"
    echo "Step 4: Run Tests and Linting"
    echo "----------------------------------------"
    echo ""

    cd "$ROOT_DIR/cli"

    echo -e "${BLUE}Running tests...${NC}"
    if npm test 2>&1 | tail -5; then
        echo -e "${GREEN}[PASS]${NC} All tests passed"
    else
        echo -e "${RED}[FAIL]${NC} Tests failed"
        exit 1
    fi
    echo ""

    echo -e "${BLUE}Running linting...${NC}"
    if npm run lint 2>&1; then
        echo -e "${GREEN}[PASS]${NC} Linting passed"
    else
        echo -e "${RED}[FAIL]${NC} Linting failed"
        exit 1
    fi

    cd "$ROOT_DIR"
    echo ""
else
    echo "----------------------------------------"
    echo "Step 4: Run Tests and Linting (SKIPPED)"
    echo "----------------------------------------"
    echo ""
fi

# ============================================
# Summary and Next Steps
# ============================================
echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN COMPLETE - No files were modified${NC}"
    echo ""
    echo "To apply changes, run without --dry-run:"
    echo "  ./scripts/pre-release.sh --version $VERSION"
else
    echo -e "${GREEN}Pre-release preparation complete!${NC}"
    echo ""
    echo "Version: $VERSION"
    echo "Release Type: $RELEASE_TYPE"
    echo ""
    echo "Files updated:"
    echo "  - cli/package.json"
    echo "  - .claude-plugin/plugin.json"
    echo "  - .claude-plugin/marketplace.json"
    echo "  - cli/standards-registry.json"
    if [ "$RELEASE_TYPE" = "stable" ]; then
        echo "  - README.md"
    fi
fi

echo ""
echo "----------------------------------------"
echo "Next Steps | 下一步"
echo "----------------------------------------"
echo ""
echo "1. Update CHANGELOG.md with new version section"
echo "   更新 CHANGELOG.md 新增版本區段"
echo ""
echo "2. Update translation files (if needed):"
echo "   更新翻譯檔案（如需要）："
echo "   - locales/zh-TW/README.md"
echo "   - locales/zh-TW/CHANGELOG.md"
echo "   - locales/zh-CN/README.md"
echo "   - locales/zh-CN/CHANGELOG.md"
echo ""
echo "3. Commit changes:"
echo "   提交變更："
echo "   git add -A"
echo "   git commit -m \"chore(release): prepare v$VERSION\""
echo ""
echo "4. Follow release workflow:"
echo "   繼續執行發布流程："
echo "   See: skills/release-standards/release-workflow.md"
echo ""
