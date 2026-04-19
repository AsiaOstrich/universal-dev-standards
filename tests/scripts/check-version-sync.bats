#!/usr/bin/env bats
#
# Smoke tests for scripts/check-version-sync.sh
# scripts/check-version-sync.sh 的冒煙測試
#
# Scope (Phase 1, BUG-A07):
#   - Script exists and is executable
#   - Runs to completion from repo root with exit 0 on a clean tree
#   - Output mentions the expected summary keyword

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-version-sync.sh"
}

@test "check-version-sync.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "check-version-sync.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "check-version-sync.sh runs successfully from repo root" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "check-version-sync.sh prints a summary section" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Summary"* ]]
}
