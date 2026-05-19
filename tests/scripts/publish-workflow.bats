#!/usr/bin/env bats
#
# Structural tests for .github/workflows/publish.yml
# XSPEC-221: UDS Clean-room Install Test

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  WORKFLOW="$REPO_ROOT/.github/workflows/publish.yml"
}

@test "publish.yml exists" {
  [ -f "$WORKFLOW" ]
}

@test "publish.yml contains clean-room-install job" {
  run grep -c "clean-room-install:" "$WORKFLOW"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]
}

@test "clean-room-install job uses node:20-alpine container" {
  run bash -c "grep -A5 'clean-room-install:' '$WORKFLOW'"
  [[ "$output" =~ "node:20-alpine" ]]
}

@test "publish job depends on clean-room-install via needs" {
  run grep -A5 "^  publish:" "$WORKFLOW"
  [[ "$output" =~ "clean-room-install" ]]
}

@test "clean-room-install job verifies uds --version" {
  run bash -c "grep -A60 'clean-room-install:' '$WORKFLOW'"
  [[ "$output" =~ "--version" ]]
}

@test "clean-room-install job verifies uds list" {
  run bash -c "grep -A60 'clean-room-install:' '$WORKFLOW'"
  [[ "$output" =~ "uds list" ]] || [[ "$output" =~ "uds.js list" ]]
}
