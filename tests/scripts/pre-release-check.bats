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

# TOTAL is a hand-maintained DISPLAY denominator ("[7.5/24] Checking ..."), not
# a derived count: step labels include 1.5, 7.5, 18.5, 18.6, 18.7 and 22.5, so
# nothing in the script can verify it. This assertion therefore only ever fires
# when someone edits the constant — which is exactly what happened.
#
# Red since 2026-07-23. `efe8df23` (XSPEC-355) added the integration-liveness
# check as step 18.7 and bumped TOTAL 23 → 24; this file was last touched
# 2026-05-19 and still asserted 23. Nothing noticed for six days because CI runs
# ONE of the 16 files in tests/scripts/ — check-scripts-passing.bats — and that
# is the sibling the same commit did remember to update.
#
# Red again 2026-09-28: `56f517c9` added the upgrade-fidelity gate as step 24 and
# bumped TOTAL 24 → 25; this assertion still said 24. Same shape as 07-23, and
# again invisible locally, because pre-release-check.sh does not run this file —
# only CI's "Check Script Ratchet" job does. 6.13.1 shipped with this job red.
#
# Bumped again 2026-09-28 (same day, different commit): DEC-117 D2/L2 added the
# prompt-footprint ratchet as step 25 and bumped TOTAL 25 → 26. Updated in the
# SAME commit as pre-release-check.sh this time — the whole point of the two
# red incidents above was that this file and pre-release-check.sh drift apart
# when only one of them gets touched.
@test "TOTAL counter matches the step count the script displays" {
  run grep "^TOTAL=26" "$SCRIPT"
  [ "$status" -eq 0 ]
}

@test "--skip-tests does not skip Dogfooding Gate" {
  run bash -c "awk '/SKIP_TESTS.*true/,/^fi/' '$SCRIPT' | grep -c 'Dogfooding'"
  [ "$output" -eq 0 ]
}

# DEC-117 D2/L2: prompt-footprint ratchet (Step 25)

@test "pre-release-check.sh defines Step 25 prompt footprint ratchet" {
  run grep -c "check-prompt-footprint" "$SCRIPT"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]
}

@test "--skip-tests does not skip the prompt footprint ratchet" {
  run bash -c "awk '/SKIP_TESTS.*true/,/^fi/' '$SCRIPT' | grep -c 'check-prompt-footprint'"
  [ "$output" -eq 0 ]
}
