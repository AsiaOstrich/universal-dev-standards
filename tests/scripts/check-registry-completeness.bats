#!/usr/bin/env bats
#
# Smoke tests for scripts/check-registry-completeness.sh
# scripts/check-registry-completeness.sh 的冒煙測試
#
# Scope (Phase 1, BUG-A07):
#   - Script exists and is executable
#   - Runs from repo root and exits 0 on a clean tree
#   - Output references the registry / sync concepts

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-registry-completeness.sh"
}

@test "check-registry-completeness.sh exists" {
  [ -f "$SCRIPT" ]
}

@test "check-registry-completeness.sh is executable" {
  [ -x "$SCRIPT" ]
}

@test "check-registry-completeness.sh runs successfully from repo root" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "check-registry-completeness.sh emits guidance about uds update or .standards/" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"uds update"* || "$output" == *".standards/"* || "$output" == *"registry"* ]]
}
