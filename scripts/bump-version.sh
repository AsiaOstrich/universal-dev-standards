#!/bin/bash
#
# Version Bump Script
# 版本升版腳本
#
# Updates ALL version files atomically for a UDS release.
# 一次性更新所有版本檔案，避免遺漏。
#
# Usage: ./scripts/bump-version.sh <version>
# Example:
#   ./scripts/bump-version.sh 5.1.0-beta.7   # Beta release
#   ./scripts/bump-version.sh 5.2.0           # Stable release
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CLI_DIR="$ROOT_DIR/cli"
TODAY=$(date +%Y-%m-%d)

# ── Validate argument ──────────────────────────────────────────────────────────
if [ -z "$1" ]; then
    echo -e "${RED}Error:${NC} Version argument required"
    echo "Usage: $0 <version>"
    echo "Examples:"
    echo "  $0 5.1.0-beta.7   # Beta release"
    echo "  $0 5.2.0          # Stable release"
    exit 1
fi

NEW_VERSION="$1"

# Validate semver format (basic check)
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
    echo -e "${RED}Error:${NC} Invalid version format: $NEW_VERSION"
    echo "Expected format: X.Y.Z or X.Y.Z-beta.N / X.Y.Z-alpha.N / X.Y.Z-rc.N"
    exit 1
fi

# Detect pre-release using bash built-in regex (avoids grep flag collision with leading -)
IS_PRERELEASE=false
RELEASE_TYPE="stable"
if [[ "$NEW_VERSION" =~ -(beta|alpha|rc)\. ]]; then
    IS_PRERELEASE=true
    RELEASE_TYPE="${BASH_REMATCH[1]}"
fi

echo ""
echo "=========================================="
echo "  UDS Version Bump"
echo "  版本升版工具"
echo "=========================================="
echo ""
echo -e "  New version : ${BLUE}${NEW_VERSION}${NC}"
echo -e "  Release type: ${BLUE}${RELEASE_TYPE}${NC}"
echo -e "  Date        : ${BLUE}${TODAY}${NC}"
echo ""

# ── Helper: portable sed -i ────────────────────────────────────────────────────
# macOS sed requires '' after -i; GNU sed does not.
sed_inplace() {
    local pattern="$1"
    local file="$2"
    if sed --version 2>/dev/null | grep -q GNU; then
        sed -i "$pattern" "$file"
    else
        sed -i '' "$pattern" "$file"
    fi
}

# ── Helper: update a file ─────────────────────────────────────────────────────
update_file() {
    local desc="$1"
    local file="$2"
    local pattern="$3"
    if [ -f "$file" ]; then
        sed_inplace "$pattern" "$file"
        echo -e "  ${GREEN}[OK]${NC} $desc"
    else
        echo -e "  ${YELLOW}[SKIP]${NC} $desc — file not found: $file"
    fi
}

echo "── Updating version files ─────────────────────────────────────────────────"
echo ""

# 1. cli/package.json
update_file "cli/package.json" \
    "$CLI_DIR/package.json" \
    "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/"

# 2. cli/standards-registry.json (3 occurrences)
if [ -f "$CLI_DIR/standards-registry.json" ]; then
    # Replace all "version": "..." occurrences
    sed_inplace "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/g" "$CLI_DIR/standards-registry.json"
    echo -e "  ${GREEN}[OK]${NC} cli/standards-registry.json (all 3 version fields)"
fi

# 3. uds-manifest.json
if [ -f "$ROOT_DIR/uds-manifest.json" ]; then
    sed_inplace "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/uds-manifest.json"
    sed_inplace "s/\"last_updated\": \"[^\"]*\"/\"last_updated\": \"$TODAY\"/" "$ROOT_DIR/uds-manifest.json"
    echo -e "  ${GREEN}[OK]${NC} uds-manifest.json (version + last_updated)"
fi

# Build the version label for README (with or without "(Pre-release)")
if [ "$IS_PRERELEASE" = true ]; then
    VERSION_LABEL="$NEW_VERSION (Pre-release)"
else
    VERSION_LABEL="$NEW_VERSION"
fi

# 4. README.md (English) — replace everything between "**Version**: " and the next " |"
update_file "README.md" \
    "$ROOT_DIR/README.md" \
    "s/\*\*Version\*\*:[^|]*/\*\*Version\*\*: $VERSION_LABEL /"

# 5. locales/zh-TW/README.md
update_file "locales/zh-TW/README.md" \
    "$ROOT_DIR/locales/zh-TW/README.md" \
    "s/\*\*版本\*\*:[^|]*/\*\*版本\*\*: $VERSION_LABEL /"

# 6. locales/zh-CN/README.md
update_file "locales/zh-CN/README.md" \
    "$ROOT_DIR/locales/zh-CN/README.md" \
    "s/\*\*版本\*\*:[^|]*/\*\*版本\*\*: $VERSION_LABEL /"

# 7. CHANGELOG frontmatter (zh-TW + zh-CN) — update source_version, translation_version, last_synced
for locale_changelog in "$ROOT_DIR/locales/zh-TW/CHANGELOG.md" "$ROOT_DIR/locales/zh-CN/CHANGELOG.md"; do
    if [ -f "$locale_changelog" ]; then
        sed_inplace "s/^source_version: .*/source_version: $NEW_VERSION/" "$locale_changelog"
        sed_inplace "s/^translation_version: .*/translation_version: $NEW_VERSION/" "$locale_changelog"
        sed_inplace "s/^last_synced: .*/last_synced: $TODAY/" "$locale_changelog"
        rel_path="${locale_changelog#$ROOT_DIR/}"
        echo -e "  ${GREEN}[OK]${NC} $rel_path (frontmatter)"
    fi
done

# 8. .claude-plugin/ — ONLY for stable releases
if [ "$IS_PRERELEASE" = false ]; then
    echo ""
    echo "── Stable release: updating marketplace files ────────────────────────────"
    echo ""

    update_file ".claude-plugin/plugin.json" \
        "$ROOT_DIR/.claude-plugin/plugin.json" \
        "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/"

    if [ -f "$ROOT_DIR/.claude-plugin/marketplace.json" ]; then
        sed_inplace "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/.claude-plugin/marketplace.json"
        echo -e "  ${GREEN}[OK]${NC} .claude-plugin/marketplace.json"
    fi
else
    echo ""
    echo -e "  ${YELLOW}[SKIP]${NC} .claude-plugin/ files (pre-release — marketplace keeps stable version)"
fi

# ── Verify with check-version-sync.sh ─────────────────────────────────────────
echo ""
echo "── Running version sync verification ────────────────────────────────────"
echo ""

if [ -f "$SCRIPT_DIR/check-version-sync.sh" ]; then
    bash "$SCRIPT_DIR/check-version-sync.sh" || {
        echo ""
        echo -e "${RED}Version sync check FAILED. Please fix the above mismatches before committing.${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}[WARN]${NC} check-version-sync.sh not found, skipping verification"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  Done! | 完成！"
echo "=========================================="
echo ""
echo -e "  Version bumped to: ${GREEN}${NEW_VERSION}${NC}"
echo ""
echo "  Next steps:"
echo "  1. Update CHANGELOG.md (EN + zh-TW + zh-CN) with release notes"
echo "  2. git add -A && git commit -m \"chore(release): $NEW_VERSION\""
echo "  3. git tag v$NEW_VERSION && git push origin main v$NEW_VERSION"
echo "  4. Create GitHub Release (pre-release: $IS_PRERELEASE)"
echo ""
