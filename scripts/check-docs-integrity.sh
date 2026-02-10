#!/bin/bash
#
# Documentation Integrity Checker
# 文件完整性檢查器
#
# This script checks documentation accuracy and consistency across the project.
#
# Checks:
# 1. Command Table Coverage - skills/README.md lists all expected commands
# 2. Markdown Link Validation - internal links point to existing files/anchors
# 3. Feature Count Accuracy - claimed numbers match actual file counts
# 4. Cross-Language Table Parity - translation tables match EN source row counts
#
# Usage: ./scripts/check-docs-integrity.sh
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

# Temp files for counting (to avoid subshell issues)
ERROR_FILE=$(mktemp)
WARNING_FILE=$(mktemp)
echo "0" > "$ERROR_FILE"
echo "0" > "$WARNING_FILE"

# Cleanup on exit
cleanup() {
    rm -f "$ERROR_FILE" "$WARNING_FILE"
}
trap cleanup EXIT

# Helper functions
inc_errors() {
    local count
    count=$(cat "$ERROR_FILE")
    echo $((count + 1)) > "$ERROR_FILE"
}

inc_warnings() {
    local count
    count=$(cat "$WARNING_FILE")
    echo $((count + 1)) > "$WARNING_FILE"
}

get_errors() {
    cat "$ERROR_FILE"
}

get_warnings() {
    cat "$WARNING_FILE"
}

echo ""
echo "=========================================="
echo "  Documentation Integrity Checker"
echo "  文件完整性檢查器"
echo "=========================================="
echo ""

# =============================================================================
# Check 1/4: Command Table Coverage / 命令表覆蓋
# =============================================================================

echo -e "${BLUE}[1/4] Command Table Coverage / 命令表覆蓋${NC}"
echo "----------------------------------------"
echo ""

AGENT_PATHS_FILE="$ROOT_DIR/cli/src/config/ai-agent-paths.js"
SKILLS_README="$ROOT_DIR/skills/README.md"

if [[ ! -f "$AGENT_PATHS_FILE" ]]; then
    echo -e "  ${RED}[ERROR] ai-agent-paths.js not found${NC}"
    inc_errors
elif [[ ! -f "$SKILLS_README" ]]; then
    echo -e "  ${RED}[ERROR] skills/README.md not found${NC}"
    inc_errors
else
    # Extract all command names from AVAILABLE_COMMANDS
    ALL_COMMANDS=$(sed -n '/^export const AVAILABLE_COMMANDS/,/^];/p' "$AGENT_PATHS_FILE" | \
        grep -oE "name: '[^']+'" | \
        sed "s/name: '//g" | \
        sed "s/'//g" | \
        sort -u)

    # Build expected commands list (exclude CLI-management and sub-commands with -)
    CLI_MANAGEMENT="init update check config"
    EXPECTED_COMMANDS=""
    EXPECTED_COUNT=0

    while IFS= read -r cmd; do
        [[ -z "$cmd" ]] && continue

        # Skip CLI management commands
        skip=false
        for cli_cmd in $CLI_MANAGEMENT; do
            if [[ "$cmd" == "$cli_cmd" ]]; then
                skip=true
                break
            fi
        done
        $skip && continue

        # Skip sub-commands (contain -)
        if [[ "$cmd" == *-* ]]; then
            continue
        fi

        EXPECTED_COMMANDS="$EXPECTED_COMMANDS $cmd"
        EXPECTED_COUNT=$((EXPECTED_COUNT + 1))
    done <<< "$ALL_COMMANDS"

    # Extract commands listed in skills/README.md table (lines matching | ... | `/command` | ... |)
    TABLE_COMMANDS=$(grep -oE '`/[a-z]+`' "$SKILLS_README" | \
        sed 's/`\///g' | \
        sed 's/`//g' | \
        sort -u)

    echo -e "${CYAN}  Checking skills/README.md command table:${NC}"

    # Check each expected command is in the table
    missing_count=0
    for cmd in $EXPECTED_COMMANDS; do
        found=false
        while IFS= read -r table_cmd; do
            if [[ "$cmd" == "$table_cmd" ]]; then
                found=true
                break
            fi
        done <<< "$TABLE_COMMANDS"

        if ! $found; then
            echo -e "  ${RED}[ERROR] Command '/$cmd' missing from skills/README.md table${NC}"
            inc_errors
            missing_count=$((missing_count + 1))
        fi
    done

    if [[ $missing_count -eq 0 ]]; then
        echo -e "  ${GREEN}[OK] All $EXPECTED_COUNT expected commands listed in skills/README.md${NC}"
    fi

    # Check for extra commands in table that aren't in AVAILABLE_COMMANDS
    extra_count=0
    while IFS= read -r table_cmd; do
        [[ -z "$table_cmd" ]] && continue
        found=false
        while IFS= read -r all_cmd; do
            if [[ "$table_cmd" == "$all_cmd" ]]; then
                found=true
                break
            fi
        done <<< "$ALL_COMMANDS"

        if ! $found; then
            echo -e "  ${YELLOW}[WARN] Command '/$table_cmd' in skills/README.md but not in AVAILABLE_COMMANDS${NC}"
            inc_warnings
            extra_count=$((extra_count + 1))
        fi
    done <<< "$TABLE_COMMANDS"

    if [[ $extra_count -eq 0 && $missing_count -eq 0 ]]; then
        echo -e "  ${GREEN}[OK] No extraneous commands in table${NC}"
    fi

    # Check adoption/DAILY-WORKFLOW-GUIDE.md (only verify listed commands exist, not completeness)
    DAILY_GUIDE="$ROOT_DIR/adoption/DAILY-WORKFLOW-GUIDE.md"
    if [[ -f "$DAILY_GUIDE" ]]; then
        echo ""
        echo -e "${CYAN}  Checking adoption/DAILY-WORKFLOW-GUIDE.md:${NC}"
        GUIDE_COMMANDS=$(grep -oE '`/[a-z]+`' "$DAILY_GUIDE" | \
            sed 's/`\///g' | \
            sed 's/`//g' | \
            sort -u)

        guide_invalid=0
        while IFS= read -r guide_cmd; do
            [[ -z "$guide_cmd" ]] && continue
            found=false
            while IFS= read -r all_cmd; do
                if [[ "$guide_cmd" == "$all_cmd" ]]; then
                    found=true
                    break
                fi
            done <<< "$ALL_COMMANDS"

            if ! $found; then
                echo -e "  ${YELLOW}[WARN] Command '/$guide_cmd' in DAILY-WORKFLOW-GUIDE.md but not in AVAILABLE_COMMANDS${NC}"
                inc_warnings
                guide_invalid=$((guide_invalid + 1))
            fi
        done <<< "$GUIDE_COMMANDS"

        if [[ $guide_invalid -eq 0 ]]; then
            echo -e "  ${GREEN}[OK] All commands in DAILY-WORKFLOW-GUIDE.md are valid${NC}"
        fi
    fi
fi

echo ""

# =============================================================================
# Check 2/4: Markdown Link Validation / Markdown 連結驗證
# =============================================================================

echo -e "${BLUE}[2/4] Markdown Link Validation / Markdown 連結驗證${NC}"
echo "----------------------------------------"
echo ""

# Cache for heading anchors per file (using temp directory)
ANCHOR_CACHE_DIR=$(mktemp -d)
trap "rm -rf '$ANCHOR_CACHE_DIR' '$ERROR_FILE' '$WARNING_FILE'" EXIT

get_file_anchors() {
    local target_file="$1"
    local cache_key
    cache_key=$(echo "$target_file" | sed 's/[\/.]/_/g')
    local cache_file="$ANCHOR_CACHE_DIR/$cache_key"

    if [[ -f "$cache_file" ]]; then
        cat "$cache_file"
        return
    fi

    # Extract headings, convert to anchors
    # Use perl for Unicode-safe anchor conversion (supports CJK characters)
    grep -E '^#{1,6} ' "$target_file" 2>/dev/null | \
        sed 's/^ *#* *//' | \
        perl -CSD -pe '$_ = lc $_; s/[^\w\s-]//g; s/\s+/-/g; s/^-|-$//g; $_ .= "\n" unless /\n$/' > "$cache_file"

    cat "$cache_file"
}

link_warnings=0
files_checked=0

# Collect all file:link pairs first, then validate (faster than per-line processing)
LINK_PAIRS_FILE=$(mktemp)

# Find all markdown files, excluding node_modules, .git, and template files
find "$ROOT_DIR" -name "*.md" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/cli/node_modules/*" \
    ! -path "*/cli/bundled/*" 2>/dev/null | \
while IFS= read -r md_file; do
    [[ -z "$md_file" ]] && continue

    # Skip template files (contain example/placeholder links by design)
    rel_path="${md_file#$ROOT_DIR/}"
    case "$rel_path" in
        *template*|*TEMPLATE*) continue ;;
    esac

    # Strip fenced code blocks using sed, then extract links (fast)
    # sed pattern: delete everything between ``` markers
    links=$(sed '/^```/,/^```/d' "$md_file" 2>/dev/null | \
        grep -oE '\[[^]]*\]\([^)]+\)' 2>/dev/null | \
        sed -n 's/.*](\([^)]*\)).*/\1/p' || true)

    [[ -z "$links" ]] && continue

    while IFS= read -r link_target; do
        [[ -z "$link_target" ]] && continue
        echo "$md_file|$link_target"
    done <<< "$links"
done > "$LINK_PAIRS_FILE"

files_checked=$(find "$ROOT_DIR" -name "*.md" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/cli/node_modules/*" \
    ! -path "*/cli/bundled/*" \
    ! -path "*template*" ! -path "*TEMPLATE*" 2>/dev/null | wc -l | tr -d ' ')

# Validate collected links
while IFS='|' read -r md_file link_target; do
    [[ -z "$md_file" || -z "$link_target" ]] && continue

    rel_path="${md_file#$ROOT_DIR/}"
    file_dir=$(dirname "$md_file")

    # Skip external links, mailto, and anchors-only
    [[ "$link_target" =~ ^https?:// ]] && continue
    [[ "$link_target" =~ ^mailto: ]] && continue
    [[ "$link_target" =~ ^# ]] && continue

    # Skip placeholder/example links
    [[ "$link_target" =~ ^path/ ]] && continue
    [[ "$link_target" == "link" ]] && continue
    [[ "$link_target" == "params" ]] && continue
    [[ "$link_target" =~ old-path ]] && continue
    [[ "$link_target" =~ your- ]] && continue
    [[ "$link_target" =~ example ]] && continue

    # Split path and anchor
    file_path="${link_target%%#*}"
    anchor=""
    if [[ "$link_target" == *"#"* ]]; then
        anchor="${link_target#*#}"
    fi

    # Skip empty file paths
    [[ -z "$file_path" ]] && continue

    # Resolve relative path
    resolved_path=$(cd "$file_dir" 2>/dev/null && realpath -m "$file_path" 2>/dev/null || echo "$file_dir/$file_path")

    # Check if target file exists (WARNING, not ERROR — many pre-existing broken links)
    if [[ ! -f "$resolved_path" ]] && [[ ! -d "$resolved_path" ]]; then
        echo -e "  ${YELLOW}[WARN] Broken link in $rel_path: $link_target${NC}"
        inc_warnings
        link_warnings=$((link_warnings + 1))
        continue
    fi

    # Check anchor if present and target is a file
    if [[ -n "$anchor" ]] && [[ -f "$resolved_path" ]]; then
        anchors=$(get_file_anchors "$resolved_path")
        anchor_found=false
        while IFS= read -r file_anchor; do
            if [[ "$anchor" == "$file_anchor" ]]; then
                anchor_found=true
                break
            fi
        done <<< "$anchors"

        if ! $anchor_found; then
            echo -e "  ${YELLOW}[WARN] Anchor '#$anchor' not found in target: $rel_path → $link_target${NC}"
            inc_warnings
            link_warnings=$((link_warnings + 1))
        fi
    fi
done < "$LINK_PAIRS_FILE"

rm -f "$LINK_PAIRS_FILE"

if [[ $link_warnings -eq 0 ]]; then
    echo -e "  ${GREEN}[OK] All internal links valid across $files_checked files${NC}"
else
    echo -e "  Checked $files_checked files: $link_warnings warning(s)"
fi

echo ""

# =============================================================================
# Check 3/4: Feature Count Accuracy / 功能數量準確性
# =============================================================================

echo -e "${BLUE}[3/4] Feature Count Accuracy / 功能數量準確性${NC}"
echo "----------------------------------------"
echo ""

# Calculate actual counts
ACTUAL_CORE=$(find "$ROOT_DIR/core" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
ACTUAL_SKILLS=$(find "$ROOT_DIR/skills" -mindepth 2 -maxdepth 2 -name "SKILL.md" -type f | wc -l | tr -d ' ')
ACTUAL_COMMANDS=$(find "$ROOT_DIR/skills/commands" -maxdepth 1 -name "*.md" -type f \
    ! -name "README.md" ! -name "COMMAND-FAMILY-OVERVIEW.md" | wc -l | tr -d ' ')

echo -e "${CYAN}  Actual counts:${NC}"
echo -e "    Core standards:  $ACTUAL_CORE"
echo -e "    Skills:          $ACTUAL_SKILLS"
echo -e "    Slash commands:  $ACTUAL_COMMANDS"
echo ""

# Check claimed numbers in documentation files
count_errors=0

check_count_claim() {
    local file="$1"
    local pattern="$2"
    local expected="$3"
    local label="$4"

    [[ ! -f "$file" ]] && return

    local rel_file="${file#$ROOT_DIR/}"

    # Extract number from matching line
    local matched_line
    matched_line=$(grep -iE "$pattern" "$file" 2>/dev/null | head -1)
    [[ -z "$matched_line" ]] && return

    local claimed
    claimed=$(echo "$matched_line" | grep -oE '[0-9]+' | head -1)
    [[ -z "$claimed" ]] && return

    if [[ "$claimed" != "$expected" ]]; then
        echo -e "  ${RED}[ERROR] $rel_file: claims $claimed $label, actual is $expected${NC}"
        inc_errors
        count_errors=$((count_errors + 1))
    else
        echo -e "  ${GREEN}[OK] $rel_file: $label count ($claimed) is accurate${NC}"
    fi
}

echo -e "${CYAN}  Verifying documented counts:${NC}"

# README.md
check_count_claim "$ROOT_DIR/README.md" \
    "Core Standards.*\|.*[0-9]+" "$ACTUAL_CORE" "core standards"
check_count_claim "$ROOT_DIR/README.md" \
    "AI Skills.*\|.*[0-9]+" "$ACTUAL_SKILLS" "skills"

# CLAUDE.md
check_count_claim "$ROOT_DIR/CLAUDE.md" \
    "Core Standards.*core.*[0-9]+ fundamental" "$ACTUAL_CORE" "core standards"

# locales/zh-TW/CLAUDE.md
check_count_claim "$ROOT_DIR/locales/zh-TW/CLAUDE.md" \
    "核心規範.*core.*[0-9]+" "$ACTUAL_CORE" "core standards"

# locales/zh-CN/CLAUDE.md
check_count_claim "$ROOT_DIR/locales/zh-CN/CLAUDE.md" \
    "核心规范.*core.*[0-9]+" "$ACTUAL_CORE" "core standards"

if [[ $count_errors -eq 0 ]]; then
    echo -e "  ${GREEN}[OK] All feature counts are accurate${NC}"
fi

echo ""

# =============================================================================
# Check 4/4: Cross-Language Table Parity / 跨語言表格一致性
# =============================================================================

echo -e "${BLUE}[4/4] Cross-Language Table Parity / 跨語言表格一致性${NC}"
echo "----------------------------------------"
echo ""

# count_table_rows: count data rows in markdown tables (lines starting with |, excluding header separators)
count_table_rows() {
    local file="$1"
    local table_index="$2"

    # Extract all tables: groups of consecutive lines starting with |
    local in_table=false
    local current_table=0
    local row_count=0
    local target_rows=0

    while IFS= read -r line; do
        if [[ "$line" =~ ^\| ]]; then
            if ! $in_table; then
                in_table=true
                current_table=$((current_table + 1))
                row_count=0
            fi
            # Skip header separator lines (|---|...|)
            if [[ ! "$line" =~ ^\|[[:space:]]*[-:]+[[:space:]]*\| ]]; then
                row_count=$((row_count + 1))
            fi
        else
            if $in_table; then
                if [[ $current_table -eq $table_index ]]; then
                    target_rows=$row_count
                    break
                fi
                in_table=false
            fi
        fi
    done < "$file"

    # Handle case where table is at end of file
    if $in_table && [[ $current_table -eq $table_index ]]; then
        target_rows=$row_count
    fi

    # Subtract 1 for header row
    if [[ $target_rows -gt 0 ]]; then
        target_rows=$((target_rows - 1))
    fi

    echo "$target_rows"
}

# count_all_tables: return total number of tables in a file
count_all_tables() {
    local file="$1"
    local in_table=false
    local table_count=0

    while IFS= read -r line; do
        if [[ "$line" =~ ^\| ]]; then
            if ! $in_table; then
                in_table=true
                table_count=$((table_count + 1))
            fi
        else
            in_table=false
        fi
    done < "$file"

    echo "$table_count"
}

check_table_parity() {
    local en_file="$1"
    local translation_file="$2"

    local rel_en="${en_file#$ROOT_DIR/}"
    local rel_trans="${translation_file#$ROOT_DIR/}"

    if [[ ! -f "$en_file" ]]; then
        echo -e "  ${YELLOW}[WARN] EN file not found: $rel_en${NC}"
        inc_warnings
        return
    fi

    if [[ ! -f "$translation_file" ]]; then
        echo -e "  ${YELLOW}[WARN] Translation file not found: $rel_trans${NC}"
        inc_warnings
        return
    fi

    local en_tables
    en_tables=$(count_all_tables "$en_file")
    local trans_tables
    trans_tables=$(count_all_tables "$translation_file")

    local parity_ok=true

    for i in $(seq 1 "$en_tables"); do
        local en_rows
        en_rows=$(count_table_rows "$en_file" "$i")
        local trans_rows
        trans_rows=$(count_table_rows "$translation_file" "$i")

        if [[ "$en_rows" -ne "$trans_rows" ]]; then
            echo -e "  ${YELLOW}[WARN] Table #$i row mismatch: $rel_en ($en_rows rows) vs $rel_trans ($trans_rows rows)${NC}"
            inc_warnings
            parity_ok=false
        fi
    done

    if $parity_ok; then
        echo -e "  ${GREEN}[OK] $rel_en ↔ $rel_trans ($en_tables tables match)${NC}"
    fi
}

# File pairs to check
FILE_PAIRS=(
    "skills/README.md|locales/zh-TW/skills/README.md"
    "skills/README.md|locales/zh-CN/skills/README.md"
    "adoption/DAILY-WORKFLOW-GUIDE.md|locales/zh-TW/adoption/DAILY-WORKFLOW-GUIDE.md"
    "adoption/DAILY-WORKFLOW-GUIDE.md|locales/zh-CN/adoption/DAILY-WORKFLOW-GUIDE.md"
    "docs/CHEATSHEET.md|locales/zh-TW/docs/CHEATSHEET.md"
    "docs/CHEATSHEET.md|locales/zh-CN/docs/CHEATSHEET.md"
    "docs/FEATURE-REFERENCE.md|locales/zh-TW/docs/FEATURE-REFERENCE.md"
    "docs/FEATURE-REFERENCE.md|locales/zh-CN/docs/FEATURE-REFERENCE.md"
)

for pair in "${FILE_PAIRS[@]}"; do
    en_rel="${pair%%|*}"
    trans_rel="${pair##*|}"
    check_table_parity "$ROOT_DIR/$en_rel" "$ROOT_DIR/$trans_rel"
done

echo ""

# =============================================================================
# Summary
# =============================================================================

ERRORS=$(get_errors)
WARNINGS=$(get_warnings)

echo "=========================================="
echo "  Summary | 摘要"
echo "=========================================="
echo ""

if [[ "$ERRORS" -gt 0 ]] || [[ "$WARNINGS" -gt 0 ]]; then
    if [[ "$ERRORS" -gt 0 ]]; then
        echo -e "${RED}Errors: $ERRORS${NC}"
    fi
    if [[ "$WARNINGS" -gt 0 ]]; then
        echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    fi
    echo ""

    if [[ "$ERRORS" -gt 0 ]]; then
        echo -e "${RED}Documentation integrity check failed with $ERRORS error(s)${NC}"
        exit 1
    else
        echo -e "${GREEN}Documentation integrity check passed (with $WARNINGS warning(s))${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}All documentation integrity checks passed!${NC}"
    echo ""
    exit 0
fi
