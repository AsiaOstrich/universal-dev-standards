#!/usr/bin/env bats
#
# Smoke tests for scripts/pre-release.sh

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/pre-release.sh"
}

@test "pre-release.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "pre-release.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "pre-release.sh --dry-run --skip-tests exits 0" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT" --version 99.99.99 --dry-run --skip-tests
  [ "$status" -eq 0 ]
}

@test "pre-release.sh --dry-run --skip-tests prints DRY RUN marker" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT" --version 99.99.99 --dry-run --skip-tests
  [[ "$output" == *"DRY RUN"* || "$output" == *"Dry Run"* ]]
}
