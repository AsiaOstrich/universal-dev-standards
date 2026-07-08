#!/bin/bash
#
# Translation Sync Checker
# 翻譯同步檢查器
#
# This script checks if translations are in sync with their source files
# by comparing version numbers in YAML front matter.
#
# Usage: ./scripts/check-translation-sync.sh [locale|--all]
# Example: ./scripts/check-translation-sync.sh           # Check ALL locales
#          ./scripts/check-translation-sync.sh zh-TW     # Check only zh-TW
#          ./scripts/check-translation-sync.sh zh-CN     # Check only zh-CN
#          ./scripts/check-translation-sync.sh --all     # Explicitly check all
#

set -e

# Cross-platform /dev/null protection for Windows
_cleanup_null_file() {
  if [ -f "NULL" ]; then rm -f "NULL"; fi
}
trap _cleanup_null_file EXIT

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Semver difference classifier
# Returns: PATCH | MINOR | MAJOR | UNKNOWN
semver_diff() {
    local v1="${1%%-*}"  # strip pre-release suffix
    local v2="${2%%-*}"
    local maj1 min1 pat1 maj2 min2 pat2
    IFS='.' read -r maj1 min1 pat1 <<< "$v1"
    IFS='.' read -r maj2 min2 pat2 <<< "$v2"
    # Guard: non-numeric or empty → UNKNOWN
    if ! [[ "$maj1" =~ ^[0-9]+$ ]] || ! [[ "$maj2" =~ ^[0-9]+$ ]]; then
        echo "UNKNOWN"; return
    fi
    if [ "$maj1" != "$maj2" ]; then echo "MAJOR"
    elif [ "$min1" != "$min2" ]; then echo "MINOR"
    else echo "PATCH"
    fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOCALES_DIR="$ROOT_DIR/locales"

# --- source_hash integrity layer (XSPEC-072 bundle-parity, applied to translations) ---
# Probe whether `git hash-object` is usable. It computes a blob hash from file
# CONTENT and does not require the file to be tracked, but it does require the
# git binary. If unavailable (non-git environment / git missing) we degrade
# gracefully and skip hash validation instead of crashing.
GIT_AVAILABLE=false
if command -v git >/dev/null 2>&1 && git hash-object "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
    GIT_AVAILABLE=true
fi

# Compute the first 12 chars of `git hash-object <file>` — the established
# convention for the `source_hash` frontmatter field (see
# core/documentation-writing-standards.md). Echoes empty string when git is
# unavailable or the hash cannot be computed.
compute_source_hash() {
    local f="$1"
    [ "$GIT_AVAILABLE" = "true" ] || { echo ""; return; }
    git hash-object "$f" 2>/dev/null | cut -c1-12
}

# Determine which locales to check
if [ -z "$1" ] || [ "$1" = "--all" ] || [ "$1" = "-a" ]; then
    # Check all locales
    CHECK_ALL=true
    LOCALES=$(find "$LOCALES_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)
else
    # Check specific locale
    CHECK_ALL=false
    LOCALES="$1"
fi

echo ""
echo "=========================================="
echo "  Translation Sync Checker"
echo "  翻譯同步檢查器"
echo "=========================================="
echo ""

if [ "$CHECK_ALL" = true ]; then
    echo -e "${BLUE}Mode:${NC} Checking ALL locales"
    echo -e "${BLUE}Locales found:${NC} $(echo $LOCALES | tr '\n' ' ')"
else
    echo -e "${BLUE}Mode:${NC} Single locale"
    echo -e "${BLUE}Locale:${NC} $LOCALES"
fi
echo ""

# Global counters for summary
GLOBAL_TOTAL=0
GLOBAL_CURRENT=0
GLOBAL_OUTDATED=0
GLOBAL_OUTDATED_PATCH=0
GLOBAL_OUTDATED_MINOR=0
GLOBAL_OUTDATED_MAJOR=0
GLOBAL_MISSING_META=0
GLOBAL_MISSING_SOURCE=0
GLOBAL_ERRORS=0
GLOBAL_DRIFT=0          # source_hash present but mismatches source content (the "lie")
GLOBAL_NOHASH=0         # managed translation with no source_hash field (advisory)

# Function to check a single locale
check_locale() {
    local LOCALE="$1"
    local LOCALE_DIR="$LOCALES_DIR/$LOCALE"

    # Local counters
    local TOTAL=0
    local CURRENT=0
    local OUTDATED=0
    local OUTDATED_MAJOR=0
    local MISSING_META=0
    local MISSING_SOURCE=0
    local DRIFT=0
    local NOHASH=0

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  Locale: $LOCALE${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Check if locale directory exists
    if [ ! -d "$LOCALE_DIR" ]; then
        echo -e "${RED}Error:${NC} Locale directory not found: $LOCALE_DIR"
        GLOBAL_ERRORS=$((GLOBAL_ERRORS + 1))
        return 1
    fi

    # Function to extract YAML front matter value
    get_yaml_value() {
        local file="$1"
        local key="$2"
        grep "^${key}:" "$file" 2>/dev/null | head -1 | sed "s/^${key}:[[:space:]]*//" | tr -d '\r'
    }

    # Function to get source file version from its own YAML front matter or Version line
    # Only searches the first 20 lines to avoid matching code blocks
    get_source_version() {
        local source_file="$1"

        if [ ! -f "$source_file" ]; then
            echo ""
            return
        fi

        # Get first 20 lines for version detection (avoids code blocks)
        local header=$(head -20 "$source_file")

        # Try YAML front matter first (only in header)
        local version=$(echo "$header" | grep "^version:" 2>/dev/null | head -1 | sed 's/^version:[[:space:]]*//' | tr -d '\r')

        # If not found, try **Version**: pattern (only in header)
        if [ -z "$version" ]; then
            version=$(echo "$header" | grep -E "^\*\*Version\*\*:" 2>/dev/null | head -1 | sed 's/.*:[[:space:]]*//' | tr -d '\r')
        fi

        # If still not found, try > Version: pattern (inline version)
        if [ -z "$version" ]; then
            version=$(echo "$header" | grep -E "^> Version:" 2>/dev/null | head -1 | sed 's/.*Version:[[:space:]]*//' | cut -d'|' -f1 | tr -d ' \r')
        fi

        echo "$version"
    }

    # Find all markdown files in locale directory
    while IFS= read -r trans_file; do
        TOTAL=$((TOTAL + 1))

        # Get relative path from locale dir
        rel_path="${trans_file#$LOCALE_DIR/}"

        # Extract metadata from translation file
        source_path=$(get_yaml_value "$trans_file" "source")
        source_version=$(get_yaml_value "$trans_file" "source_version")
        trans_version=$(get_yaml_value "$trans_file" "translation_version")
        status=$(get_yaml_value "$trans_file" "status")
        declared_hash=$(get_yaml_value "$trans_file" "source_hash")

        # Skip files without YAML front matter
        if [ -z "$source_path" ]; then
            echo -e "${YELLOW}[NO META]${NC} $rel_path"
            echo "          No YAML front matter found"
            MISSING_META=$((MISSING_META + 1))
            continue
        fi

        # Construct full source path (handle relative paths from translation file location)
        trans_dir="$(dirname "$trans_file")"
        if [[ "$source_path" == ../* ]]; then
            # Relative path - resolve from translation file location
            full_source_path="$(cd "$trans_dir" && cd "$(dirname "$source_path")" 2>/dev/null && pwd)/$(basename "$source_path")"
        else
            # Absolute path from root
            full_source_path="$ROOT_DIR/$source_path"
        fi

        # Check if source file exists
        if [ ! -f "$full_source_path" ]; then
            echo -e "${RED}[MISSING]${NC} $rel_path"
            echo "          Source not found: $source_path"
            MISSING_SOURCE=$((MISSING_SOURCE + 1))
            continue
        fi

        # Get current source version
        current_source_version=$(get_source_version "$full_source_path")

        # --- source_hash verdict (content integrity layer) ---
        # Many source files expose NO parseable version in their header, which
        # makes the version comparison below pass vacuously. The source_hash is
        # therefore the real integrity signal: it catches a translation that
        # declares a matching version while its source content has moved on.
        actual_hash=""
        hash_verdict="skip"   # skip | match | mismatch | nohash
        if [ -z "$declared_hash" ]; then
            hash_verdict="nohash"
        elif [ "$GIT_AVAILABLE" != "true" ]; then
            hash_verdict="skip"   # git unavailable — cannot verify, degrade gracefully
        else
            # Normalize declared hash: keep leading token, hex-only, first 12 chars
            declared_hash="${declared_hash%% *}"
            declared_hash=$(printf '%s' "$declared_hash" | tr -cd '0-9a-fA-F' | cut -c1-12)
            actual_hash=$(compute_source_hash "$full_source_path")
            if [ -z "$actual_hash" ]; then
                hash_verdict="skip"
            elif [ "$declared_hash" = "$actual_hash" ]; then
                hash_verdict="match"
            else
                hash_verdict="mismatch"
            fi
        fi

        # Layered decision: version gap (existing) OR hash drift → outdated.
        if [ "$source_version" = "$current_source_version" ] || [ -z "$current_source_version" ]; then
            # Version comparison reports "in sync" (possibly vacuously).
            # Hash drift under a matching version is the silent-lie case.
            if [ "$hash_verdict" = "mismatch" ]; then
                echo -e "${ORANGE}[DRIFT]${NC}   $rel_path"
                echo "          source_hash: $declared_hash (declared) -> $actual_hash (actual)  ⚠️  content drift — version claims sync but source changed"
                echo "          Translation: $trans_version"
                DRIFT=$((DRIFT + 1))
                OUTDATED=$((OUTDATED + 1))
            elif [ "$hash_verdict" = "nohash" ]; then
                # Advisory only: majority of managed translations lack source_hash.
                # Keep the green line to avoid churn; surface the gap in the summary.
                NOHASH=$((NOHASH + 1))
                if [ "$status" = "current" ]; then
                    echo -e "${GREEN}[CURRENT]${NC} $rel_path  ${YELLOW}(no source_hash — drift undetectable)${NC}"
                else
                    echo -e "${YELLOW}[CHECK]${NC}  $rel_path"
                    echo "          Status: $status (should be 'current'?)"
                fi
                CURRENT=$((CURRENT + 1))
            elif [ "$status" = "current" ]; then
                echo -e "${GREEN}[CURRENT]${NC} $rel_path"
                CURRENT=$((CURRENT + 1))
            else
                echo -e "${YELLOW}[CHECK]${NC}  $rel_path"
                echo "          Status: $status (should be 'current'?)"
                CURRENT=$((CURRENT + 1))
            fi
        else
            local diff_level
            diff_level=$(semver_diff "$source_version" "$current_source_version")
            case "$diff_level" in
                MAJOR)
                    echo -e "${RED}[MAJOR]${NC}   $rel_path"
                    echo "          Source: $source_version -> $current_source_version  ⛔ MAJOR version gap — release blocker"
                    echo "          Translation: $trans_version"
                    OUTDATED=$((OUTDATED + 1))
                    OUTDATED_MAJOR=$((OUTDATED_MAJOR + 1))
                    ;;
                MINOR)
                    echo -e "${ORANGE}[MINOR]${NC}   $rel_path"
                    echo "          Source: $source_version -> $current_source_version  ⚠️  MINOR version gap — update before release"
                    echo "          Translation: $trans_version"
                    OUTDATED=$((OUTDATED + 1))
                    ;;
                *)
                    echo -e "${YELLOW}[PATCH]${NC}   $rel_path"
                    echo "          Source: $source_version -> $current_source_version  💡 PATCH gap — advisory"
                    echo "          Translation: $trans_version"
                    OUTDATED=$((OUTDATED + 1))
                    ;;
            esac
        fi

    done < <(find "$LOCALE_DIR" -name "*.md" -type f | sort)

    # Check skills/commands translation completeness
    local COMMANDS_SOURCE_DIR="$ROOT_DIR/skills/commands"
    local COMMANDS_LOCALE_DIR="$LOCALE_DIR/skills/commands"
    local COMMANDS_MISSING=0
    local COMMANDS_TOTAL=0

    if [ -d "$COMMANDS_SOURCE_DIR" ]; then
        echo ""
        echo -e "  ${BLUE}Commands Translation Completeness:${NC}"

        for source_cmd in "$COMMANDS_SOURCE_DIR"/*.md; do
            [ -f "$source_cmd" ] || continue
            local cmd_name=$(basename "$source_cmd")
            # Skip non-command files
            case "$cmd_name" in
                COMMAND-FAMILY-OVERVIEW.md|README.md) continue ;;
            esac
            COMMANDS_TOTAL=$((COMMANDS_TOTAL + 1))
            if [ ! -f "$COMMANDS_LOCALE_DIR/$cmd_name" ]; then
                echo -e "    ${RED}[MISSING]${NC} skills/commands/$cmd_name"
                COMMANDS_MISSING=$((COMMANDS_MISSING + 1))
            fi
        done

        if [ $COMMANDS_MISSING -eq 0 ]; then
            echo -e "    ${GREEN}✓ All $COMMANDS_TOTAL commands have translations${NC}"
        else
            echo -e "    ${RED}✗ $COMMANDS_MISSING/$COMMANDS_TOTAL commands missing translations${NC}"
            OUTDATED=$((OUTDATED + COMMANDS_MISSING))
        fi
    fi

    # Check skills SKILL.md translation completeness
    local SKILLS_SOURCE_DIR="$ROOT_DIR/skills"
    local SKILLS_LOCALE_DIR="$LOCALE_DIR/skills"
    local SKILLS_MISSING=0
    local SKILLS_TOTAL=0

    echo ""
    echo -e "  ${BLUE}Skills Translation Completeness:${NC}"

    for skill_dir in "$SKILLS_SOURCE_DIR"/*/; do
        [ -d "$skill_dir" ] || continue
        local skill_name=$(basename "$skill_dir")
        # Skip non-skill directories
        case "$skill_name" in
            commands|workflows|agents|tools) continue ;;
        esac
        [ -f "$skill_dir/SKILL.md" ] || continue
        SKILLS_TOTAL=$((SKILLS_TOTAL + 1))
        if [ ! -f "$SKILLS_LOCALE_DIR/$skill_name/SKILL.md" ]; then
            echo -e "    ${RED}[MISSING]${NC} skills/$skill_name/SKILL.md"
            SKILLS_MISSING=$((SKILLS_MISSING + 1))
        fi
    done

    if [ $SKILLS_MISSING -eq 0 ]; then
        echo -e "    ${GREEN}✓ All $SKILLS_TOTAL skills have translations${NC}"
    else
        echo -e "    ${RED}✗ $SKILLS_MISSING/$SKILLS_TOTAL skills missing translations${NC}"
        OUTDATED=$((OUTDATED + SKILLS_MISSING))
    fi

    # Check core standards translation completeness
    local CORE_SOURCE_DIR="$ROOT_DIR/core"
    local CORE_LOCALE_DIR="$LOCALE_DIR/core"
    local CORE_MISSING=0
    local CORE_TOTAL=0

    echo ""
    echo -e "  ${BLUE}Core Standards Translation Completeness:${NC}"

    for core_file in "$CORE_SOURCE_DIR"/*.md; do
        [ -f "$core_file" ] || continue
        local core_name=$(basename "$core_file")
        CORE_TOTAL=$((CORE_TOTAL + 1))
        if [ ! -f "$CORE_LOCALE_DIR/$core_name" ]; then
            echo -e "    ${RED}[MISSING]${NC} core/$core_name"
            CORE_MISSING=$((CORE_MISSING + 1))
        fi
    done

    if [ $CORE_MISSING -eq 0 ]; then
        echo -e "    ${GREEN}✓ All $CORE_TOTAL core standards have translations${NC}"
    else
        echo -e "    ${RED}✗ $CORE_MISSING/$CORE_TOTAL core standards missing translations${NC}"
        OUTDATED=$((OUTDATED + CORE_MISSING))
    fi

    # Locale summary
    echo ""
    echo -e "  ${BLUE}$LOCALE Summary:${NC}"
    echo -e "    Total: $TOTAL | Current: ${GREEN}$CURRENT${NC} | Outdated: ${RED}$OUTDATED${NC} | Missing: ${RED}$MISSING_SOURCE${NC}"
    if [ $DRIFT -gt 0 ]; then
        echo -e "    Content drift (hash mismatch): ${ORANGE}$DRIFT${NC}"
    fi
    if [ $NOHASH -gt 0 ]; then
        echo -e "    No source_hash (drift undetectable): ${YELLOW}$NOHASH${NC}"
    fi
    if [ $COMMANDS_MISSING -gt 0 ]; then
        echo -e "    Commands missing: ${RED}$COMMANDS_MISSING${NC}"
    fi
    if [ $SKILLS_MISSING -gt 0 ]; then
        echo -e "    Skills missing: ${RED}$SKILLS_MISSING${NC}"
    fi
    if [ $CORE_MISSING -gt 0 ]; then
        echo -e "    Core standards missing: ${RED}$CORE_MISSING${NC}"
    fi
    echo ""

    # Update global counters
    GLOBAL_TOTAL=$((GLOBAL_TOTAL + TOTAL))
    GLOBAL_CURRENT=$((GLOBAL_CURRENT + CURRENT))
    GLOBAL_OUTDATED=$((GLOBAL_OUTDATED + OUTDATED))
    GLOBAL_OUTDATED_MAJOR=$((GLOBAL_OUTDATED_MAJOR + OUTDATED_MAJOR))
    GLOBAL_MISSING_META=$((GLOBAL_MISSING_META + MISSING_META))
    GLOBAL_MISSING_SOURCE=$((GLOBAL_MISSING_SOURCE + MISSING_SOURCE))
    GLOBAL_DRIFT=$((GLOBAL_DRIFT + DRIFT))
    GLOBAL_NOHASH=$((GLOBAL_NOHASH + NOHASH))

    # Return error status if this locale has blocking issues
    if [ $OUTDATED_MAJOR -gt 0 ] || [ $MISSING_SOURCE -gt 0 ]; then
        return 1
    fi
    return 0
}

# Main execution: iterate through all locales
LOCALE_ERRORS=0
for locale in $LOCALES; do
    if ! check_locale "$locale"; then
        LOCALE_ERRORS=$((LOCALE_ERRORS + 1))
    fi
done

# Final summary
echo "=========================================="
echo "  Final Summary | 總結"
echo "=========================================="
echo ""
echo -e "Locales checked:    ${BLUE}$(echo $LOCALES | wc -w | tr -d ' ')${NC}"
echo -e "Total files:        ${BLUE}$GLOBAL_TOTAL${NC}"
echo -e "Current:            ${GREEN}$GLOBAL_CURRENT${NC}"
echo -e "Outdated (MAJOR):   ${RED}$GLOBAL_OUTDATED_MAJOR${NC}  ← release blocker if > 0"
echo -e "Outdated (total):   ${YELLOW}$GLOBAL_OUTDATED${NC}"
echo -e "Content drift:      ${ORANGE}$GLOBAL_DRIFT${NC}  (source_hash mismatch — version claims sync but source changed)"
echo -e "No source_hash:     ${YELLOW}$GLOBAL_NOHASH${NC}  (advisory — drift undetectable until hash added)"
echo -e "Missing metadata:   ${YELLOW}$GLOBAL_MISSING_META${NC}"
echo -e "Missing source:     ${RED}$GLOBAL_MISSING_SOURCE${NC}"
if [ "$GIT_AVAILABLE" != "true" ]; then
    echo -e "${YELLOW}Note:${NC} git hash-object unavailable — source_hash validation was SKIPPED."
fi
echo ""
echo -e "Severity legend:"
echo -e "  ${RED}[MAJOR]${NC}  Major version gap — release blocker (exit 1)"
echo -e "  ${ORANGE}[MINOR]${NC}  Minor version gap — update before release (advisory)"
echo -e "  ${YELLOW}[PATCH]${NC}  Patch version gap — update when convenient (advisory)"
echo -e "  ${ORANGE}[DRIFT]${NC}  source_hash mismatch — source content changed (advisory; the anti-lie check)"
echo -e "  ${YELLOW}[NO HASH]${NC} No source_hash field — add one to enable drift detection (advisory)"
echo -e "  ${RED}[MISSING]${NC} Source file missing — release blocker (exit 1)"
echo ""

# Exit codes:
#   1 = release blocker (MISSING or MAJOR version gap)
#   0 = clean or advisory-only (MINOR/PATCH outdated)
if [ $GLOBAL_MISSING_SOURCE -gt 0 ] || [ $GLOBAL_ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Some translations are MISSING — release blocker!${NC}"
    echo ""
    exit 1
elif [ $GLOBAL_OUTDATED_MAJOR -gt 0 ]; then
    echo -e "${RED}❌ Some translations have MAJOR version gaps — release blocker!${NC}"
    echo -e "   Update the affected translations before publishing a stable release."
    echo ""
    exit 1
elif [ $GLOBAL_OUTDATED -gt 0 ]; then
    VERSION_GAP_COUNT=$((GLOBAL_OUTDATED - GLOBAL_OUTDATED_MAJOR - GLOBAL_DRIFT))
    if [ $VERSION_GAP_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $VERSION_GAP_COUNT translation(s) have MINOR/PATCH version gaps (advisory). Update when convenient.${NC}"
    fi
    if [ $GLOBAL_DRIFT -gt 0 ]; then
        echo -e "${ORANGE}⚠️  $GLOBAL_DRIFT translation(s) have source_hash content drift (advisory). Re-translate and refresh source_hash.${NC}"
    fi
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ All translations are in sync!${NC}"
    echo ""
    exit 0
fi
