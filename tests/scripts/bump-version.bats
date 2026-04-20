#!/usr/bin/env bats
#
# Smoke tests for scripts/bump-version.sh
# Scope: arg validation only — no file mutations

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/bump-version.sh"
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
