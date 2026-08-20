#!/usr/bin/env bats
#
# Smoke tests for scripts/check-registry-completeness.ts
# scripts/check-registry-completeness.ts 的冒煙測試
#
# The .sh wrapper this file used to address was removed under XSPEC-376
# R4/R7 — the .ts is now the only entry point (address points walked and
# updated: this file, pre-release-check.sh step 18,
# scripts/reference-only-standards.json's $comment).
#
# Scope (Phase 1, BUG-A07):
#   - Script exists
#   - Runs from repo root and exits 0 on a clean tree
#   - Output references the registry / sync concepts

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-registry-completeness.ts"
}

@test "check-registry-completeness.ts exists" {
  [ -f "$SCRIPT" ]
}

@test "check-registry-completeness.ts runs successfully from repo root" {
  cd "$REPO_ROOT"
  run npx tsx "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "check-registry-completeness.ts emits guidance about uds update or .standards/" {
  cd "$REPO_ROOT"
  run npx tsx "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"uds update"* || "$output" == *".standards/"* || "$output" == *"registry"* ]]
}
