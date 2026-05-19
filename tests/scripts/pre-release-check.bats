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

# XSPEC-222: Dogfooding Gate (Step 23)

@test "pre-release-check.sh defines Step 23 Dogfooding Gate" {
  run grep -c "Dogfooding" "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]
}

@test "Step 23 runs uds check not uds update" {
  run bash -c "grep -A20 'Dogfooding' '$SCRIPT'"
  [[ "$output" =~ "check" ]]
  [[ ! "$output" =~ "uds.js update" ]]
}

@test "TOTAL counter is 23" {
  run grep "^TOTAL=23" "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "--skip-tests does not skip Dogfooding Gate" {
  run bash -c "awk '/SKIP_TESTS.*true/,/^fi/' '$SCRIPT' | grep -c 'Dogfooding'"
  [ "$output" -eq 0 ]
}
