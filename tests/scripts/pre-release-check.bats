#!/usr/bin/env bats
#
# Smoke tests for scripts/pre-release-check.sh

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/pre-release-check.sh"
}

@test "pre-release-check.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "pre-release-check.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "pre-release-check.sh --help exits 0" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT" --help
  [ "$status" -eq 0 ]
}

@test "pre-release-check.sh --help prints Options section" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT" --help
  [[ "$output" == *"Options"* ]]
}

@test "pre-release-check.sh rejects unknown flags" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT" --unknown-flag
  [ "$status" -ne 0 ]
}
