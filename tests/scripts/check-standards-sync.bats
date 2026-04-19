#!/usr/bin/env bats
#
# Smoke tests for scripts/check-standards-sync.sh
# scripts/check-standards-sync.sh 的冒煙測試
#
# Scope (Phase 1, BUG-A07):
#   - Script exists and is executable
#   - Runs from repo root and exits 0 on a clean tree
#   - Output mentions the standards-consistency summary

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-standards-sync.sh"
}

@test "check-standards-sync.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "check-standards-sync.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "check-standards-sync.sh runs successfully from repo root" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "check-standards-sync.sh prints a summary section" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Summary"* || "$output" == *"consistent"* ]]
}
