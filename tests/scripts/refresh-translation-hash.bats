#!/usr/bin/env bats
#
# Tests for scripts/refresh-translation-hash.ts
#
# This tool stamps the current `git hash-object` value into a translation
# file's `source_hash` frontmatter field, so scripts/check-translation-sync.sh
# can detect real content drift instead of relying on hand-filled hashes.
#
# Safety is the whole point of this tool (see the file's own header comment):
# dry-run by default, explicit-file / --all-missing / --all target modes with
# escalating guardrails, and --all --write requires --force or is refused
# outright. These tests exercise exactly those guarantees.
#
# Design: every test builds a SELF-CONTAINED sandbox tree (own source file +
# own translation file) under BATS_TEST_TMPDIR and never touches the real
# repo's locales/. Bulk-scan modes (--all / --all-missing) are pointed at the
# sandbox via the REFRESH_TRANSLATION_HASH_LOCALES_DIR test-only env var the
# script honors instead of the real locales/ tree — this is required so those
# modes can be exercised at all without risking a real-repo mass write.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/refresh-translation-hash.ts"

  SANDBOX="$BATS_TEST_TMPDIR/sandbox"
  mkdir -p "$SANDBOX/locales/zz-test"

  SRC="$SANDBOX/src.md"
  printf '# Source Doc\n\nOriginal body content.\n' > "$SRC"
  GOOD_HASH="$(git hash-object "$SRC" | cut -c1-12)"

  TRANS="$SANDBOX/locales/zz-test/doc.md"

  # Snapshot of real repo state so every test can assert it stayed untouched.
  REPO_LOCALES_STATUS_BEFORE="$(cd "$REPO_ROOT" && git status --short locales/)"
}

teardown() {
  rm -rf "$SANDBOX"
  # Hard guarantee: no test may have written to the real repo's locales/.
  STATUS_AFTER="$(cd "$REPO_ROOT" && git status --short locales/)"
  [ "$STATUS_AFTER" = "$REPO_LOCALES_STATUS_BEFORE" ]
}

run_tool() {
  run npx tsx "$SCRIPT" "$@"
}

# Summary/report lines wrap the trailing count in an ANSI color code
# (e.g. "skipped (already-current):   \x1b[0;34m1\x1b[0m"), so a literal
# substring check against "already-current):   1" never matches — the escape
# sequence sits between the spaces and the digit. Strip ANSI before asserting
# on those lines so the check is a real (non-vacuous) assertion.
_strip_ansi() {
  local esc
  esc=$'\x1b'
  printf '%s' "$1" | sed -E "s/${esc}\\[[0-9;]*m//g"
}

# Write a translation file. $1 = source_hash value ("" to omit the field).
_write_trans() {
  local hash_line="$1"
  {
    echo "---"
    echo "source: ../../src.md"
    echo "source_version: 1.0.0"
    echo "translation_version: 1.0.0"
    echo "last_synced: 2026-01-01"
    [ -n "$hash_line" ] && echo "source_hash: $hash_line"
    echo "status: current"
    echo "custom_field: keep-me"
    echo "---"
    echo ""
    echo "# 標題"
    echo ""
    echo "內容本體，不應被更動。"
  } > "$TRANS"
}

@test "script exists" {
  [ -f "$SCRIPT" ]
}

@test "--help exits 0 and prints usage" {
  run_tool --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage"* ]]
}

@test "no target selected -> exits 1 with usage hint" {
  run_tool
  [ "$status" -eq 1 ]
  [[ "$output" == *"no target selected"* ]]
}

@test "mixing explicit files with --all -> exits 1 (ambiguous mode)" {
  _write_trans "$GOOD_HASH"
  run_tool "$TRANS" --all
  [ "$status" -eq 1 ]
  [[ "$output" == *"exactly one mode"* ]]
}

# ── dry-run safety ──────────────────────────────────────────────────────────

@test "dry-run: mismatched hash is reported as would-stamp but file is NOT written" {
  _write_trans "deadbeef0000"
  run_tool "$TRANS"
  [ "$status" -eq 0 ]
  [[ "$output" == *"WOULD-STAMP"* ]]
  [[ "$output" == *"deadbeef0000 -> $GOOD_HASH"* ]]
  # File on disk must be untouched.
  grep -q "source_hash: deadbeef0000" "$TRANS"
}

@test "dry-run: already-current hash -> no-op, would-change=0" {
  _write_trans "$GOOD_HASH"
  run_tool "$TRANS"
  [ "$status" -eq 0 ]
  local plain
  plain="$(_strip_ansi "$output")"
  [[ "$plain" == *"would-change (dry-run):      0"* ]]
  [[ "$plain" == *"skipped (already-current):   1"* ]]
  grep -q "source_hash: $GOOD_HASH" "$TRANS"
}

# ── --write on explicit files (primary use case) ────────────────────────────

@test "--write on an explicit file stamps the correct hash" {
  _write_trans "deadbeef0000"
  run_tool "$TRANS" --write
  [ "$status" -eq 0 ]
  [[ "$output" == *"STAMPED"* ]]
  grep -q "^source_hash: $GOOD_HASH$" "$TRANS"
}

@test "--write only touches the source_hash line — other fields and body survive" {
  _write_trans "deadbeef0000"
  run_tool "$TRANS" --write
  [ "$status" -eq 0 ]
  grep -q "^source: \.\./\.\./src\.md$" "$TRANS"
  grep -q "^source_version: 1\.0\.0$" "$TRANS"
  grep -q "^translation_version: 1\.0\.0$" "$TRANS"
  grep -q "^last_synced: 2026-01-01$" "$TRANS"
  grep -q "^status: current$" "$TRANS"
  grep -q "^custom_field: keep-me$" "$TRANS"
  grep -q "^# 標題$" "$TRANS"
  grep -q "內容本體，不應被更動。" "$TRANS"
  # Exactly one source_hash line.
  [ "$(grep -c '^source_hash:' "$TRANS")" -eq 1 ]
}

@test "--write inserts source_hash when the field is entirely absent" {
  _write_trans ""
  run_tool "$TRANS" --write
  [ "$status" -eq 0 ]
  grep -q "^source_hash: $GOOD_HASH$" "$TRANS"
  [ "$(grep -c '^source_hash:' "$TRANS")" -eq 1 ]
}

@test "already-matching hash is a true no-op even with --write (file unmodified)" {
  _write_trans "$GOOD_HASH"
  local before_mtime
  before_mtime="$(stat -f '%m' "$TRANS" 2>/dev/null || stat -c '%Y' "$TRANS")"
  sleep 1
  run_tool "$TRANS" --write
  [ "$status" -eq 0 ]
  local plain
  plain="$(_strip_ansi "$output")"
  [[ "$plain" == *"stamped:                     0"* ]]
  local after_mtime
  after_mtime="$(stat -f '%m' "$TRANS" 2>/dev/null || stat -c '%Y' "$TRANS")"
  [ "$before_mtime" = "$after_mtime" ]
}

# ── skip cases: never crash ──────────────────────────────────────────────────

@test "missing source: field -> skipped as not-managed, no crash" {
  {
    echo "---"
    echo "translation_version: 1.0.0"
    echo "status: current"
    echo "---"
    echo "body with no source field"
  } > "$TRANS"
  run_tool "$TRANS"
  [ "$status" -eq 0 ]
  local plain
  plain="$(_strip_ansi "$output")"
  [[ "$plain" == *"skipped (not-managed):       1"* ]]
}

@test "source file does not exist -> skipped as missing-source, no crash" {
  {
    echo "---"
    echo "source: ../../does-not-exist.md"
    echo "source_version: 1.0.0"
    echo "source_hash: deadbeef0000"
    echo "status: current"
    echo "---"
    echo "body"
  } > "$TRANS"
  run_tool "$TRANS"
  [ "$status" -eq 0 ]
  local plain
  plain="$(_strip_ansi "$output")"
  [[ "$plain" == *"[SKIP]"*"source not found"* ]]
  [[ "$plain" == *"skipped (missing-source):    1"* ]]
}

@test "explicit file argument that does not exist -> exits 1, no crash" {
  run_tool "$SANDBOX/locales/zz-test/nope.md"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not found"* ]]
}

# ── --all guardrail ──────────────────────────────────────────────────────────

@test "--all --write WITHOUT --force is refused, exits 1, writes nothing" {
  _write_trans "deadbeef0000"
  run env REFRESH_TRANSLATION_HASH_LOCALES_DIR="$SANDBOX/locales" \
    npx tsx "$SCRIPT" --all --write
  [ "$status" -eq 1 ]
  [[ "$output" == *"requires --force"* ]]
  grep -q "source_hash: deadbeef0000" "$TRANS"
}

@test "--all --write --force stamps mismatched hashes (explicit, sandboxed)" {
  _write_trans "deadbeef0000"
  run env REFRESH_TRANSLATION_HASH_LOCALES_DIR="$SANDBOX/locales" \
    npx tsx "$SCRIPT" --all --write --force
  [ "$status" -eq 0 ]
  grep -q "^source_hash: $GOOD_HASH$" "$TRANS"
}

@test "--all-missing --write stamps only files with no hash, leaves mismatches alone" {
  MISSING="$SANDBOX/locales/zz-test/missing-hash.md"
  {
    echo "---"
    echo "source: ../../src.md"
    echo "source_version: 1.0.0"
    echo "status: current"
    echo "---"
    echo "body"
  } > "$MISSING"
  _write_trans "deadbeef0000"   # mismatched, not missing — must be left alone

  run env REFRESH_TRANSLATION_HASH_LOCALES_DIR="$SANDBOX/locales" \
    npx tsx "$SCRIPT" --all-missing --write
  [ "$status" -eq 0 ]
  grep -q "^source_hash: $GOOD_HASH$" "$MISSING"
  # The mismatched one is a different case (has a hash, just wrong) — untouched.
  grep -q "source_hash: deadbeef0000" "$TRANS"
}

@test "--all-missing prints a currency-assertion warning" {
  MISSING="$SANDBOX/locales/zz-test/missing-hash.md"
  {
    echo "---"
    echo "source: ../../src.md"
    echo "source_version: 1.0.0"
    echo "status: current"
    echo "---"
    echo "body"
  } > "$MISSING"
  run env REFRESH_TRANSLATION_HASH_LOCALES_DIR="$SANDBOX/locales" \
    npx tsx "$SCRIPT" --all-missing
  [ "$status" -eq 0 ]
  [[ "$output" == *"Warning"* ]]
  [[ "$output" == *"asserting"* ]]
}

@test "--all prints a large danger warning" {
  _write_trans "$GOOD_HASH"
  run env REFRESH_TRANSLATION_HASH_LOCALES_DIR="$SANDBOX/locales" \
    npx tsx "$SCRIPT" --all
  [ "$status" -eq 0 ]
  [[ "$output" == *"DANGER"* ]]
}
