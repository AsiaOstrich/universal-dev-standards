#!/usr/bin/env bats
#
# Smoke tests for scripts/bump-version.sh (+ .mjs)
# Scope: arg validation + release-gate wiring — no file mutations

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/bump-version.sh"
  MJS_SCRIPT="$REPO_ROOT/scripts/bump-version.mjs"
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
# Structural assertions: both bump scripts must invoke the parity gate and the
# docs-index regeneration. Guards against silent removal / drift between the two.

@test "bump-version.sh runs the bundle-parity gate (XSPEC-072 Phase 4.2)" {
  grep -q "check:bundle-parity" "$SCRIPT"
}

@test "bump-version.sh regenerates the docs index (TODO-001)" {
  grep -q "docs:generate-index" "$SCRIPT"
}

@test "bump-version.sh honours SKIP_BUNDLE_PARITY override" {
  grep -q "SKIP_BUNDLE_PARITY" "$SCRIPT"
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
