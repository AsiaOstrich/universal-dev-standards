#!/usr/bin/env bats
#
# Tests for scripts/check-translation-sync.sh — source_hash integrity layer
# scripts/check-translation-sync.sh 的 source_hash 完整性層測試
#
# Scope:
#   Verifies the source_hash drift-detection layer added on top of the existing
#   version comparison (XSPEC-072 bundle-parity applied to translations).
#   驗證疊加於版號比對之上的 source_hash 漂移偵測層。
#
# Design: each test builds a SELF-CONTAINED sandbox (a copy of the script plus a
# tiny locales/ tree) so it never depends on the repo's ~800 real locale files.
# `git hash-object` works on file content without needing a git repo, so no
# `git init` is required. bats itself needs no node/npm.
#
# Cases:
#   (a) source_hash matches source content        -> [CURRENT]
#   (b) source_hash mismatches (declared lie)      -> [DRIFT] detected
#   (c) no source_hash field                       -> advisory [NO HASH], not a failure
#   (d) git unavailable                            -> graceful skip, no crash

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  REAL_SCRIPT="$REPO_ROOT/scripts/check-translation-sync.sh"

  # Self-contained sandbox: <sandbox>/scripts/<script> + <sandbox>/locales/...
  SANDBOX="$BATS_TEST_TMPDIR/sandbox"
  mkdir -p "$SANDBOX/scripts" "$SANDBOX/locales/zz-test"
  cp "$REAL_SCRIPT" "$SANDBOX/scripts/check-translation-sync.sh"
  SCRIPT="$SANDBOX/scripts/check-translation-sync.sh"

  # Source file WITHOUT a parseable version line — mirrors the real-world case
  # where the version check passes vacuously and source_hash is the only signal.
  SRC="$SANDBOX/src.md"
  printf '# Source Doc\n\nOriginal body content.\n' > "$SRC"
  GOOD_HASH="$(git hash-object "$SRC" | cut -c1-12)"

  TRANS="$SANDBOX/locales/zz-test/doc.md"
}

teardown() {
  # BATS_TEST_TMPDIR is auto-removed by bats; explicit cleanup for safety.
  rm -rf "$SANDBOX"
}

# Write a translation file with the given source_hash line (pass empty to omit).
_write_trans() {
  local hash_line="$1"
  {
    echo "---"
    echo "source: src.md"
    echo "source_version: 1.0.0"
    echo "translation_version: 1.0.0"
    [ -n "$hash_line" ] && echo "source_hash: $hash_line"
    echo "status: current"
    echo "---"
    echo ""
    echo "# 來源文件"
    echo ""
    echo "翻譯內容。"
  } > "$TRANS"
}

@test "script exists and is executable" {
  [ -f "$REAL_SCRIPT" ]
  [ -x "$REAL_SCRIPT" ]
}

@test "(a) matching source_hash -> CURRENT, no drift" {
  _write_trans "$GOOD_HASH"
  run bash "$SCRIPT" zz-test
  [ "$status" -eq 0 ]
  doc_line="$(printf '%s\n' "$output" | grep 'doc.md' | head -1)"
  [[ "$doc_line" == *"[CURRENT]"* ]]
  [[ "$doc_line" != *"[DRIFT]"* ]]
  [[ "$output" == *"Content drift:"*"0"* ]]
}

@test "(b) mismatched source_hash -> DRIFT detected (the anti-lie check)" {
  _write_trans "deadbeef0000"
  run bash "$SCRIPT" zz-test
  # Drift is advisory: run still succeeds, but the drift is surfaced.
  [ "$status" -eq 0 ]
  [[ "$output" == *"[DRIFT]"*"doc.md"* ]]
  [[ "$output" == *"content drift"* ]]
  [[ "$output" == *"deadbeef0000"* ]]
  [[ "$output" == *"$GOOD_HASH"* ]]
}

@test "(b2) a lie cannot masquerade as CURRENT" {
  # Same frontmatter that passed version check, but wrong hash: must NOT be CURRENT.
  _write_trans "deadbeef0000"
  run bash "$SCRIPT" zz-test
  # The doc.md line must be DRIFT, never a green CURRENT.
  drift_line="$(printf '%s\n' "$output" | grep 'doc.md' | head -1)"
  [[ "$drift_line" == *"[DRIFT]"* ]]
  [[ "$drift_line" != *"[CURRENT]"* ]]
}

@test "(c) missing source_hash -> advisory NO HASH, not a failure" {
  _write_trans ""
  run bash "$SCRIPT" zz-test
  [ "$status" -eq 0 ]
  [[ "$output" == *"no source_hash"* ]]
  [[ "$output" == *"No source_hash:"*"1"* ]]
  doc_line="$(printf '%s\n' "$output" | grep 'doc.md' | head -1)"
  [[ "$doc_line" != *"[DRIFT]"* ]]
}

@test "(d) git unavailable -> graceful skip, no crash" {
  # Shadow git with a stub that always fails, so the availability probe reports
  # git as unusable and hash validation is skipped without crashing.
  mkdir -p "$SANDBOX/fakebin"
  printf '#!/bin/sh\nexit 1\n' > "$SANDBOX/fakebin/git"
  chmod +x "$SANDBOX/fakebin/git"
  _write_trans "deadbeef0000"
  run env PATH="$SANDBOX/fakebin:$PATH" bash "$SCRIPT" zz-test
  [ "$status" -eq 0 ]
  [[ "$output" == *"SKIPPED"* ]]
  # With hash validation skipped, the lie is NOT flagged as drift.
  doc_line="$(printf '%s\n' "$output" | grep 'doc.md' | head -1)"
  [[ "$doc_line" != *"[DRIFT]"* ]]
}

@test "(e) example frontmatter in a body code fence is not mistaken for the real one" {
  # Real bug found 2026-07-09 on locales/zh-TW/core/documentation-writing-standards.md:
  # a ```yaml fenced example ~640 lines into the body illustrating frontmatter
  # syntax happened to contain a `source_hash: abc123` line. The old
  # get_yaml_value() did a plain `grep "^${key}:" "$file"` over the WHOLE file,
  # so it picked up that example instead of correctly seeing no source_hash
  # field in the real (leading) frontmatter block — producing a false [DRIFT].
  {
    echo "---"
    echo "source: src.md"
    echo "source_version: 1.0.0"
    echo "translation_version: 1.0.0"
    echo "status: current"
    echo "---"
    echo ""
    echo "# 文件撰寫範例"
    echo ""
    echo "以下範例展示 frontmatter 應有的格式："
    echo ""
    echo '```yaml'
    echo "---"
    echo "source_version: 1.0.0"
    echo "source_hash: abc123"
    echo "---"
    echo '```'
  } > "$TRANS"
  run bash "$SCRIPT" zz-test
  [ "$status" -eq 0 ]
  doc_line="$(printf '%s\n' "$output" | grep 'doc.md' | head -1)"
  [[ "$doc_line" == *"[CURRENT]"* ]]
  [[ "$doc_line" != *"[DRIFT]"* ]]
  [[ "$output" != *"abc123"* ]]
}

@test "source-not-found still handled (does not crash new hash layer)" {
  # Point at a nonexistent source; hash layer must not run and script continues.
  {
    echo "---"
    echo "source: does-not-exist.md"
    echo "source_version: 1.0.0"
    echo "source_hash: deadbeef0000"
    echo "status: current"
    echo "---"
    echo "body"
  } > "$TRANS"
  run bash "$SCRIPT" zz-test
  [[ "$output" == *"[MISSING]"*"doc.md"* ]]
}
