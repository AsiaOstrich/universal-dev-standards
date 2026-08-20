#!/usr/bin/env bats
#
# Smoke tests for scripts/bump-version.sh (+ .mjs)
# Scope: arg validation + release-gate wiring — no file mutations

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/bump-version.sh"
  MJS_SCRIPT="$REPO_ROOT/scripts/bump-version.mjs"
  ROGUE_FILE="$REPO_ROOT/.standards/zz-bats-rogue-parity-test.ai.yaml"
}

teardown() {
  rm -f "$ROGUE_FILE"
}

@test "bump-version.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "bump-version.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "bump-version.sh exits 1 when called with no arguments" {
  run bash "$SCRIPT"
  [ "$status" -eq 1 ]
}

@test "bump-version.sh prints usage hint when called with no arguments" {
  run bash "$SCRIPT"
  [[ "$output" == *"Usage"* ]]
}

@test "bump-version.sh exits 1 for invalid version format" {
  run bash "$SCRIPT" "not-a-version"
  [ "$status" -eq 1 ]
}

@test "bump-version.sh exits 1 for partial semver" {
  run bash "$SCRIPT" "5.1"
  [ "$status" -eq 1 ]
}

@test "bump-version.sh error message mentions expected format" {
  run bash "$SCRIPT" "not-a-version"
  [[ "$output" == *"format"* || "$output" == *"X.Y.Z"* ]]
}

# ── Release-gate wiring (XSPEC-072 Phase 4.2 + RELEASE-FLOW-TODOS.md TODO-001) ──
# Structural assertions: the bump must invoke the parity gate and the docs-index
# regeneration. These originally grepped BOTH scripts, because there were two
# implementations that could drift apart. Since XSPEC-376 R2 there is only one:
# bump-version.sh execs bump-version.mjs. So each assertion now checks both
# halves of the single path — that the .sh still delegates, and that the marker
# is present in the .mjs it delegates to. Removing either half would let the
# release gate lose a step silently, which is what these tests exist to prevent.

@test "bump-version.sh reaches the bundle-parity gate via bump-version.mjs (XSPEC-072 Phase 4.2)" {
  grep -q "bump-version.mjs" "$SCRIPT"
  grep -q "check:bundle-parity" "$MJS_SCRIPT"
}

@test "bump-version.sh reaches the docs-index regeneration via bump-version.mjs (TODO-001)" {
  grep -q "bump-version.mjs" "$SCRIPT"
  grep -q "docs:generate-index" "$MJS_SCRIPT"
}

@test "bump-version.sh reaches the SKIP_BUNDLE_PARITY override via bump-version.mjs" {
  grep -q "bump-version.mjs" "$SCRIPT"
  grep -q "SKIP_BUNDLE_PARITY" "$MJS_SCRIPT"
}

@test "bump-version.sh keeps no second copy of the bump logic (XSPEC-376 R2)" {
  # The defect this convergence fixed was a step present in one copy and absent
  # from the other. Assert the wrapper never grows version-file mutation logic
  # of its own again.
  ! grep -q "sed_inplace" "$SCRIPT"
  ! grep -q "uds-manifest.json" "$SCRIPT"
}

@test "bump-version.mjs exists" {
  [ -f "$MJS_SCRIPT" ]
}

@test "bump-version.mjs runs the bundle-parity gate (XSPEC-072 Phase 4.2)" {
  grep -q "check:bundle-parity" "$MJS_SCRIPT"
}

@test "bump-version.mjs regenerates the docs index (TODO-001)" {
  grep -q "docs:generate-index" "$MJS_SCRIPT"
}

@test "bump-version.mjs honours SKIP_BUNDLE_PARITY override" {
  grep -q "SKIP_BUNDLE_PARITY" "$MJS_SCRIPT"
}

# ── Functional: parity drift must abort the bump BEFORE any file mutation ──────
# A rogue .ai.yaml in .standards/ (absent from the bundle) breaks parity; the
# bump must exit 1 without writing the new version anywhere. Requires npm —
# skipped in environments without node (same prerequisite as the scripts).

@test "bump-version.sh aborts on parity drift without mutating files (functional)" {
  command -v npm >/dev/null 2>&1 || skip "npm not in PATH"
  touch "$ROGUE_FILE"
  run bash "$SCRIPT" "9.9.9"
  [ "$status" -eq 1 ]
  [[ "$output" == *"parity"* ]]
  ! grep -q '"version": "9.9.9"' "$REPO_ROOT/cli/package.json"
}

@test "bump-version.mjs aborts on parity drift without mutating files (functional)" {
  command -v npm >/dev/null 2>&1 || skip "npm not in PATH"
  touch "$ROGUE_FILE"
  run node "$MJS_SCRIPT" "9.9.9"
  [ "$status" -eq 1 ]
  [[ "$output" == *"parity"* ]]
  ! grep -q '"version": "9.9.9"' "$REPO_ROOT/cli/package.json"
}
