#!/bin/bash
#
# Upgrade Fidelity Checker
# 升級實測檢查器
#
# ── Why this exists ─────────────────────────────────────────────────────────
# 6.13.0 shipped two regressions that pre-release-check.sh's 31 steps and CI
# both missed, because BOTH only ever fire when an EXISTING project, already
# updated by the previous stable release, runs `uds update`/`uds update
# --apply` against a NEWER version. Every check that existed before this one
# either (a) runs `uds init` fresh (nothing to regress against) or (b) runs
# `uds update` with the bundled registry version equal to the manifest's
# recorded version, which returns early ("already up to date") before ever
# reaching the code that broke — see updateCommand, ~line 590. Same-version
# runs and fresh-init runs cannot see either bug. Only a real cross-version
# upgrade can.
#
# The two regressions, both fixed on main after 6.13.0 shipped:
#   - commit e1524872 — a plain `uds update -y` derived CLAUDE.md's content
#     language from `output_language`/`commit_language` alone, ignoring
#     `display_language`; a zh-tw + bilingual project's "## 提交訊息語言"
#     heading silently became English "## Commit Message Language".
#   - commit 8373207d — `uds update --apply` (the reconciler) resolved any
#     AGENTS.md tracking marker to opencode's per-tool template regardless of
#     whether opencode/codex was genuinely selected, rewriting a project's
#     universal AGENTS.md summary into a different document — reproducible
#     even on the FIRST `--apply` immediately after a fresh `uds init`, with
#     nothing else changed.
#
# ── What this script measures (the regressions' own numbers) ───────────────
# Both defects were originally measured, by hand, against real adopters
# (asiaostrich-telemetry-server, EngramGraph, dev-platform) upgrading
# 6.12.0 -> 6.13.0:
#   telemetry shape, plain `uds update -y`: CLAUDE.md's block went from
#     "## 提交訊息語言\n使用**雙語**格式..." to "## Commit Message Language\n
#     Write commit messages in **bilingual** format...".
#   EGR shape, `uds update --apply`: AGENTS.md's block changed +75/-84 lines,
#     from a flat "## Installed Standards" summary to opencode's nested
#     "## Standards Reference"/"Core Standards:" template, even on the very
#     first `--apply` after `uds init` with zero drift.
# This script builds the same three project shapes with a real, published
# PREVIOUS stable release, upgrades each with the CLI under test, and checks
# for exactly these two failure modes (plus a same-shape idempotency check
# that caught a THIRD, narrower bug — a non-convergent reconciliation loop —
# while commit 8373207d was being built; see its own commit message).
#
# ── Three shapes, matched to the three real projects that hit this ─────────
#   (a) telemetry-server shape: display_language zh-tw, output_language
#       bilingual, contentMode index, aiTools ['claude-code'] only, AGENTS.md
#       generated as the universal summary (no codex/opencode). Exercises
#       BOTH regressions (CLAUDE.md language + AGENTS.md generator choice).
#   (b) EGR shape: display_language en, contentMode minimal, aiTools empty,
#       AGENTS.md as the universal summary, no CLAUDE.md at all. Exercises
#       the AGENTS.md regression in its purest form (no per-tool integration
#       exists at all to prove "wrong generator" against).
#   (c) codex/opencode genuinely selected: control arm. AGENTS.md's per-tool
#       template must NOT be replaced by the universal summary — proves the
#       fix (checking manifest.aiTools) didn't overcorrect into the opposite
#       mistake.
#
# ── What "no regression" means, precisely ───────────────────────────────────
# For every managed file (CLAUDE.md and/or AGENTS.md, whichever a shape has):
#   1. Content OUTSIDE the `<!-- UDS:STANDARDS:START/END -->` markers must be
#      byte-identical before and after — `uds update` must never touch it.
#   2. Content INSIDE the markers must be identical after normalizing away
#      ONLY the two things a real upgrade is allowed to change: newly-shipped
#      standards appearing in the per-file bullet list, and the "N standards"
#      count sentence (index-mode blocks carry the count with no per-file
#      list at all; the universal summary carries the list with no count
#      sentence — the same normalization is a no-op against whichever one a
#      given block doesn't have).
#   3. The "this is just an index" disclosure must be present (whichever
#      language the project's display_language calls for).
#   4. For CLAUDE.md specifically: the FIRST commit-message-language heading
#      line inside the block must be byte-identical before and after — this
#      is the exact line the language regression rewrote into a different
#      language, so "present" is not enough; "the same line" is the claim.
#   5. `uds update -y` and `uds update --apply` must agree on which
#      generator produced a file (same normalized block content between the
#      two paths) — this is the AGENTS.md regression's exact shape.
#   6. A second `--apply` immediately after a first must change nothing at
#      all (byte-identical whole file) — idempotency.
#
# ── What this script does NOT claim ─────────────────────────────────────────
# It does not claim rule bodies are inlined (they are not, by design — see
# check-adopter-instruction-files.ts's own docblock for why) and it does not
# claim every possible upgrade path is covered — only the three shapes that
# are known, from real adopters, to have broken. A fourth shape breaking in a
# way none of these three exercise would not be caught here; extend the
# shapes list, don't loosen the assertions, if that happens.
#
# ── Usage ────────────────────────────────────────────────────────────────────
#   scripts/check-upgrade-fidelity.sh
#     Derives the previous stable version from git tags (the second-to-last
#     `vX.Y.Z` tag with no pre-release suffix) and checks it with the local
#     dev CLI (`node cli/bin/uds.js`).
#
#   scripts/check-upgrade-fidelity.sh --prev=6.12.0 --cli="npx -y universal-dev-standards@6.13.0"
#     Explicit previous version; explicit CLI under test. `--cli` MUST pin an
#     exact version when it names the published package — a bare
#     `universal-dev-standards` (no `@version`) resolves to npm's `latest`
#     dist-tag, which silently becomes a different, newer release the next
#     time this runs, turning a red arm green for a reason that has nothing
#     to do with whether the bug is fixed. Refused, not warned about.
#
#   scripts/check-upgrade-fidelity.sh --keep-tmp
#     Leaves the temp directories in place (printed at the end) for manual
#     inspection instead of deleting them on exit.
#
# ── Exit codes (three states — "could not measure" is not a pass) ──────────
#   0 — every shape was built and every assertion held
#   1 — assertions failed; findings print the actual diff, not just "FAIL"
#   2 — could not measure: previous version undeterminable, npm/npx
#       unreachable or the previous version isn't published, or the CLI
#       under test itself failed to run. NOT "no findings" — this script
#       refuses to report green when it could not actually check anything,
#       per this task's own instruction not to skip past a networked
#       precondition it cannot satisfy.
#
# ── Measured arms (this script proving itself, not asserted) ───────────────
# Run by hand and recorded in the commit that introduced this script:
#   red   — `--cli="npx -y universal-dev-standards@6.13.0"`: failed on shape
#           (a)'s CLAUDE.md language invariant and on shapes (a)/(b)'s
#           AGENTS.md generator-agreement and idempotency invariants; shape
#           (c) (control) passed, as it must.
#   green — `--cli="node <repo>/cli/bin/uds.js"` against main (commits
#           e1524872 + 8373207d applied): all three shapes, every assertion.
# The exact diffs from both runs are in this script's introducing commit's
# message — re-run this script rather than trusting that record to still
# hold; it is a snapshot of one run, not a guarantee about the next one.

# Cross-platform /dev/null protection for Windows
_cleanup_null_file() {
  if [ -f "NULL" ]; then rm -f "NULL"; fi
}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UDS_BIN="$ROOT_DIR/cli/bin/uds.js"

PREV_VERSION=""
CLI_UNDER_TEST="node $UDS_BIN"
KEEP_TMP=false

for arg in "$@"; do
  case "$arg" in
    --prev=*)
      PREV_VERSION="${arg#--prev=}"
      ;;
    --cli=*)
      CLI_UNDER_TEST="${arg#--cli=}"
      ;;
    --keep-tmp)
      KEEP_TMP=true
      ;;
    --help)
      echo "Usage: scripts/check-upgrade-fidelity.sh [--prev=X.Y.Z] [--cli=\"<command>\"] [--keep-tmp]"
      echo ""
      echo "See this script's own header comment for what it measures and why."
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}" >&2
      echo "Use --help for usage information" >&2
      exit 2
      ;;
  esac
done

# Refuse an unpinned reference to the published package (see header comment).
# Only npx invocations are in scope here — the DEFAULT, `node
# <repo>/cli/bin/uds.js`, contains the substring "universal-dev-standards"
# too (that is this repo's own directory name), and must not trip this.
case "$CLI_UNDER_TEST" in
  *npx*universal-dev-standards@*)
    ;;
  *npx*universal-dev-standards*)
    echo -e "${RED}✗ --cli must pin an explicit version (e.g. universal-dev-standards@6.13.0).${NC}" >&2
    echo "  An unpinned reference resolves to npm's 'latest' dist-tag and silently" >&2
    echo "  changes which release this checks the next time it runs." >&2
    exit 2
    ;;
esac

_cleanup_null_file
trap _cleanup_null_file EXIT

# ── Derive the previous stable version, unless overridden ──────────────────
if [ -z "$PREV_VERSION" ]; then
  # Second-to-last `vX.Y.Z` tag (no pre-release suffix) — the stable release
  # immediately before the one the current HEAD is either at or ahead of.
  # NOT `sort -V`: check-translation-sync.sh's own semver_diff() exists
  # instead of relying on it, which is this repo already having decided `-V`
  # is not something to depend on — every tag here is exactly `vN.N.N`
  # (pre-releases already filtered out by the grep above), so a plain
  # dotted-field numeric sort is exact and needs no version-sort extension.
  STABLE_TAGS="$(git -C "$ROOT_DIR" tag --list 'v*' 2>/dev/null | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n | sed 's/^/v/')"
  PREV_VERSION="$(echo "$STABLE_TAGS" | tail -2 | head -1 | sed 's/^v//')"
  if [ -z "$PREV_VERSION" ]; then
    echo -e "${RED}✗ Could not derive the previous stable version from git tags (need at least two 'vX.Y.Z' tags).${NC}" >&2
    echo "  Override explicitly: --prev=X.Y.Z" >&2
    exit 2
  fi
fi

echo -e "${BOLD}Upgrade fidelity check${NC} | 升級實測檢查"
echo "  Previous stable (fixture builder): $PREV_VERSION"
echo "  CLI under test: $CLI_UNDER_TEST"
echo ""

# ── Preflight: the previous version must actually be resolvable ────────────
# A network hiccup or a version that was never published must FAIL this
# script, not be read as "nothing to check" — this is the one precondition
# this script cannot substitute a local fallback for (the whole point is a
# REAL published release), so silently skipping it would make the gate this
# script exists to close (see header) reopen itself under exactly the
# condition — no network — that also lets a real regression back through the
# other 31 checks.
echo -e "${CYAN}Preflight: resolving universal-dev-standards@${PREV_VERSION} from npm...${NC}"
if ! npx -y --prefer-online "universal-dev-standards@${PREV_VERSION}" --version >/tmp/uds-fidelity-preflight.$$.log 2>&1; then
  echo -e "${RED}✗ Could not resolve universal-dev-standards@${PREV_VERSION} via npx.${NC}"
  echo "  This is a hard failure, not a skip: this check exists specifically to" >&2
  echo "  exercise a REAL published previous release; without network access to" >&2
  echo "  npm it cannot do that, and reporting green would be exactly the same" >&2
  echo "  blind spot that let 6.13.0's two regressions through." >&2
  sed 's/^/  /' /tmp/uds-fidelity-preflight.$$.log >&2
  rm -f /tmp/uds-fidelity-preflight.$$.log
  exit 2
fi
rm -f /tmp/uds-fidelity-preflight.$$.log
echo -e "${GREEN}✓ resolved${NC}"
echo ""

TMP_ROOT="$(mktemp -d 2>/dev/null || mktemp -d -t udsfid)"
if [ -z "$TMP_ROOT" ] || [ ! -d "$TMP_ROOT" ]; then
  echo -e "${RED}✗ Could not create a temp directory.${NC}" >&2
  exit 2
fi

_cleanup_tmp() {
  _cleanup_null_file
  if [ "$KEEP_TMP" = true ]; then
    echo ""
    echo -e "${YELLOW}--keep-tmp: fixtures left at $TMP_ROOT${NC}"
  else
    rm -rf "$TMP_ROOT"
  fi
}
trap _cleanup_tmp EXIT

TOTAL_FINDINGS=0

# Split a marker-delimited file into three parts, written to
# "$2.before" / "$2.block" / "$2.after". A file with no markers at all lands
# entirely in .before (state never advances past 0) — callers treat that as
# its own finding (missing markers), not as an empty block.
split_marks() {
  local file="$1" prefix="$2"
  : > "${prefix}.before"
  : > "${prefix}.block"
  : > "${prefix}.after"
  awk -v pre="${prefix}.before" -v blk="${prefix}.block" -v post="${prefix}.after" '
    /<!-- UDS:STANDARDS:START -->/ { state=1; next }
    /<!-- UDS:STANDARDS:END -->/   { state=2; next }
    {
      if (state==0) print >> pre
      else if (state==1) print >> blk
      else print >> post
    }
  ' "$file"
}

# Normalize a block's content so the ONLY differences a real upgrade is
# allowed to introduce (a newly-shipped standard's bullet line, the "N
# standards" count, and line ORDER) collapse to nothing. Read from stdin,
# written to stdout. `sed -E` (POSIX extended regex) rather than GNU-only
# `\+`/`\d` — this must run under macOS's shipped BSD sed.
#
# The trailing `sort`: measured directly, twice, against a clean run of
# this repo's own dev CLI (which is what "green" means for this script) —
# NOT hypothesised. `uds update --apply` legitimately reorders
# `manifest.standards` from source-path insertion order to sorted registry
# IDs as a one-time migration (documented elsewhere as "normalises any
# standards entries stored as full paths"), which reorders the rendered
# per-file bullet list without changing which standards are listed —
# harmless to the list, already absorbed by stripping those lines above, but
# it ALSO reorders the small, hand-written "Standards Compliance
# Instructions" table (a handful of hardcoded rows — Developer memory / Git
# workflow / Writing tests — built by iterating that same reordered array),
# which nothing above strips. A plain line diff sees rows in a different
# order and reports a false difference on an unmodified CLI. `sort`ing both
# sides makes the comparison order-insensitive, matching what it actually
# needs to prove (same content) rather than a stronger, accidental claim
# (same content in the same order) that this repo's own reconciler does not
# uphold and was never asked to. The exact-heading check below is what
# still catches the real regression (the heading's TEXT changing, not its
# position) — this `sort` does not weaken that; it only stops an unrelated,
# legitimate reordering from masquerading as one.
#
# Also strips the WARNING comment line and the "this is just an index"
# disclosure paragraph (in either language). Not a loophole for the thing
# this check exists to catch (the AGENTS.md GENERATOR flipping) — a genuinely
# different template still fails: it uses different section headings ("##
# Standards Reference" / "## Standards Compliance Instructions" vs "##
# Installed Standards"), which nothing here strips. What it stops is a
# different, KNOWN, and here unavoidable difference: this fixture is built
# with the previous stable release (by design — see this script's own
# header), and its AGENTS.md predates the very fix under test (the block-
# level reminder was never emitted by ANY released version before it; see
# commit 8373207d). Comparing a pre-fix fixture against a post-fix upgrade
# will ALWAYS show the WARNING line and disclosure paragraph as "new" — that
# is the fix working, already asserted on its own and more precisely by
# reminder_present() below, not a second thing for this diff to also prove.
normalize_block() {
  sed -E \
    -e '/^- `\.standards\//d' \
    -e '/^[[:space:]]*$/d' \
    -e '/^<!-- WARNING: This block is managed by UDS/d' \
    -e '/^> \*\*This block is an index, not the standards\.\*\*/d' \
    -e '/^> Before acting on anything below, open the relevant file under/d' \
    -e '/^> follow its contents\. Working from this block alone means working without the/d' \
    -e '/^> standards\.$/d' \
    -e '/^> \*\*這個區塊是索引，不是標準本文。\*\*/d' \
    -e '/^> 在依照下方任何一項行動之前，請打開/d' \
    -e '/^> 只憑這個區塊工作，等同於沒有採用標準。/d' \
    -e '/^> \*\*这个区块是索引，不是标准本文。\*\*/d' \
    -e '/^> 在依照下方任何一项行动之前，请打开/d' \
    -e '/^> 只凭这个区块工作，等同于没有采用标准。/d' \
    -e 's/\*\*[0-9]+\*\*/**N**/g' \
    -e 's/(core|options)[- ]?[0-9]+/\1 N/g' \
    -e 's/[0-9]+[- ]?(core|options)/N \1/g' \
    | sort
}

# The exact commit-message-language heading line the CLAUDE.md regression
# rewrote into a different language. Prints the first match, or nothing.
heading_line() {
  grep -m1 -E '^## (提交訊息語言|提交消息语言|Commit Message Language)' "$1" || true
}

reminder_present() {
  grep -q -E '(This (block|file) is an index, not the standards\.|這個區塊是索引，不是標準本文|这个区块是索引，不是标准本文)' "$1"
}

report_finding() {
  local msg="$1"
  TOTAL_FINDINGS=$((TOTAL_FINDINGS + 1))
  echo -e "${RED}  ✗ $msg${NC}"
}

report_diff() {
  # $1 = label, $2 = file A, $3 = file B
  echo -e "${RED}    --- $1 ---${NC}"
  diff -u "$2" "$3" 2>&1 | sed 's/^/    /'
}

# Run the CLI under test in a directory. Aborts the whole scenario (not the
# whole script) on a non-zero exit — a CLI that cannot even run is "could not
# measure" for that scenario, reported as a finding rather than silently
# producing an empty (and therefore falsely "unchanged") diff.
run_cli() {
  local dir="$1" logfile="$2"; shift 2
  # Unquoted $CLI_UNDER_TEST is deliberate word-splitting, not a quoting bug:
  # it is a whole command ("node /path/to/uds.js" or "npx -y
  # universal-dev-standards@X"), assembled from this script's own trusted
  # arguments, never from fixture-controlled input.
  ( cd "$dir" && $CLI_UNDER_TEST "$@" ) >"$logfile" 2>&1
}

# check_file NAME FIXTURE_DIR UPDATE_DIR APPLY_DIR RELATIVE_FILE_PATH IS_CLAUDE_MD
check_file() {
  local name="$1" fixture_dir="$2" update_dir="$3" apply_dir="$4" relpath="$5" is_claude="$6"
  local work="$TMP_ROOT/$name-check-$(basename "$relpath")"
  mkdir -p "$work"

  if [ ! -f "$fixture_dir/$relpath" ]; then
    report_finding "$name: fixture never produced $relpath — cannot check it"
    return
  fi
  split_marks "$fixture_dir/$relpath" "$work/before"
  if [ ! -s "$work/before.block" ]; then
    report_finding "$name: fixture's $relpath has no UDS marker block — cannot check it"
    return
  fi

  for variant in update apply; do
    local vdir
    if [ "$variant" = update ]; then vdir="$update_dir"; else vdir="$apply_dir"; fi
    if [ ! -f "$vdir/$relpath" ]; then
      report_finding "$name/$variant: $relpath is missing after the upgrade (was present before)"
      continue
    fi
    split_marks "$vdir/$relpath" "$work/$variant"

    # 1. Outside the markers: byte-identical.
    if ! diff -q "$work/before.before" "$work/$variant.before" >/dev/null 2>&1 || \
       ! diff -q "$work/before.after" "$work/$variant.after" >/dev/null 2>&1; then
      report_finding "$name/$variant: $relpath — content OUTSIDE the UDS marker block changed (must never happen)"
      report_diff "before markers ($relpath)" "$work/before.before" "$work/$variant.before"
      report_diff "after markers ($relpath)" "$work/before.after" "$work/$variant.after"
    fi

    # 2. Inside the markers, normalized: no differences beyond the list/count.
    normalize_block < "$work/before.block" > "$work/before.block.norm"
    normalize_block < "$work/$variant.block" > "$work/$variant.block.norm"
    if ! diff -q "$work/before.block.norm" "$work/$variant.block.norm" >/dev/null 2>&1; then
      report_finding "$name/$variant: $relpath — UDS block changed beyond the standards list/count (raw diff below)"
      report_diff "raw block diff ($relpath)" "$work/before.block" "$work/$variant.block"
    fi

    # 3. The index disclosure must be present.
    if ! reminder_present "$vdir/$relpath"; then
      report_finding "$name/$variant: $relpath — the \"this is just an index\" reminder is missing after the upgrade"
    fi

    # 4. CLAUDE.md only: the commit-message-language heading line, verbatim.
    if [ "$is_claude" = true ]; then
      local before_heading after_heading
      before_heading="$(heading_line "$fixture_dir/$relpath")"
      after_heading="$(heading_line "$vdir/$relpath")"
      if [ -z "$before_heading" ]; then
        report_finding "$name/$variant: $relpath — could not find a commit-message-language heading BEFORE the upgrade; cannot check it survived"
      elif [ "$before_heading" != "$after_heading" ]; then
        report_finding "$name/$variant: $relpath — commit-message-language heading changed"
        echo -e "${RED}    before: $before_heading${NC}"
        echo -e "${RED}    after:  $after_heading${NC}"
      fi
    fi
  done

  # 5. update vs apply: same normalized block (same generator, modulo the
  #    known, separate, unfixed gap that --apply does not install
  #    newly-shipped-but-not-yet-tracked standards — already invisible to
  #    this comparison, since normalize_block strips per-file bullets and
  #    collapses the count).
  if [ -f "$update_dir/$relpath" ] && [ -f "$apply_dir/$relpath" ]; then
    if ! diff -q "$work/update.block.norm" "$work/apply.block.norm" >/dev/null 2>&1; then
      report_finding "$name: $relpath — \`uds update -y\` and \`uds update --apply\` produced different block formats"
      report_diff "update vs apply, raw block ($relpath)" "$work/update.block" "$work/apply.block"
    fi
  fi
}

# check_idempotent NAME FIXTURE_DIR RELATIVE_FILE_PATH
check_idempotent() {
  local name="$1" fixture_dir="$2" relpath="$3"
  local dir="$TMP_ROOT/$name-idempotent"
  rm -rf "$dir"
  cp -R "$fixture_dir" "$dir"

  run_cli "$dir" "$TMP_ROOT/$name-idempotent-apply1.log" update --apply -y --offline
  if [ ! -f "$dir/$relpath" ]; then
    report_finding "$name: $relpath missing after the first --apply — cannot check idempotency"
    return
  fi
  cp "$dir/$relpath" "$TMP_ROOT/$name-idempotent-after1"

  run_cli "$dir" "$TMP_ROOT/$name-idempotent-apply2.log" update --apply -y --offline
  if [ ! -f "$dir/$relpath" ]; then
    report_finding "$name: $relpath disappeared on the SECOND --apply — cannot check idempotency"
    return
  fi

  if ! diff -q "$TMP_ROOT/$name-idempotent-after1" "$dir/$relpath" >/dev/null 2>&1; then
    report_finding "$name: a second \`--apply\` immediately after the first changed $relpath (not idempotent)"
    report_diff "1st apply vs 2nd apply ($relpath)" "$TMP_ROOT/$name-idempotent-after1" "$dir/$relpath"
  fi
}

# run_scenario NAME "FILES..." SETUP_CMD INIT_ARGS...
# SETUP_CMD runs (via eval, inside the fixture dir) before `init`; pass ":"
# for none. FILES is a space-separated list of repo-relative paths to check.
run_scenario() {
  local name="$1" files="$2" setup="$3"; shift 3
  echo -e "${CYAN}── Scenario: $name ──${NC}"

  local fixture_dir="$TMP_ROOT/$name-fixture"
  mkdir -p "$fixture_dir"
  (
    cd "$fixture_dir" || exit 1
    printf '{"name":"%s-fixture","version":"1.0.0"}\n' "$name" > package.json
    eval "$setup"
    npx -y --prefer-online "universal-dev-standards@${PREV_VERSION}" init -y "$@"
  ) >"$TMP_ROOT/$name-init.log" 2>&1
  if [ ! -f "$fixture_dir/.standards/manifest.json" ]; then
    report_finding "$name: fixture build (universal-dev-standards@${PREV_VERSION} init) did not produce a manifest — cannot measure this scenario"
    sed 's/^/    /' "$TMP_ROOT/$name-init.log"
    return
  fi

  local update_dir="$TMP_ROOT/$name-update"
  local apply_dir="$TMP_ROOT/$name-apply"
  rm -rf "$update_dir" "$apply_dir"
  cp -R "$fixture_dir" "$update_dir"
  cp -R "$fixture_dir" "$apply_dir"

  run_cli "$update_dir" "$TMP_ROOT/$name-update.log" update -y --offline
  run_cli "$apply_dir" "$TMP_ROOT/$name-apply.log" update --apply -y --offline

  local f is_claude
  for f in $files; do
    case "$f" in
      CLAUDE.md) is_claude=true ;;
      *) is_claude=false ;;
    esac
    check_file "$name" "$fixture_dir" "$update_dir" "$apply_dir" "$f" "$is_claude"
    check_idempotent "$name" "$fixture_dir" "$f"
  done
  echo ""
}

# ── Scenario (a): telemetry-server shape ────────────────────────────────────
# zh-tw display + bilingual commits + index mode + claude-code only.
# `.claude/` is the file-based marker `detectAITools` uses for claude-code
# (no --ai-tool flag exists for `init`).
run_scenario "shape-a-telemetry" "CLAUDE.md AGENTS.md" \
  'mkdir -p .claude' \
  --locale zh-tw --output-lang bilingual --content-mode index --agents-md --format ai

# ── Scenario (b): EGR shape ──────────────────────────────────────────────────
# en display + minimal mode + no AI tool selected at all — AGENTS.md only,
# via the universal summary, nothing to collide with a per-tool template.
run_scenario "shape-b-egr" "AGENTS.md" \
  ':' \
  --content-mode minimal --agents-md --format ai

# ── Scenario (c): codex/opencode genuinely selected (control) ──────────────
# A pre-existing AGENTS.md is `detectAITools`'s marker for codex/opencode.
# This scenario must pass on EVERY arm, including the pre-fix ("red") one —
# it exists to prove the fix did not overcorrect into always using the
# universal summary.
run_scenario "shape-c-codex" "AGENTS.md" \
  "echo '# placeholder' > AGENTS.md" \
  --content-mode index --format ai

# ── Summary ──────────────────────────────────────────────────────────────────
echo -e "${BOLD}Summary${NC} | 總結"
if [ "$TOTAL_FINDINGS" -eq 0 ]; then
  echo -e "${GREEN}✓ All shapes upgraded cleanly — 0 findings.${NC}"
  exit 0
else
  echo -e "${RED}✗ $TOTAL_FINDINGS finding(s) above.${NC}"
  exit 1
fi
