#!/usr/bin/env bats
#
# Smoke tests for check-*.sh scripts with a CURRENT, VERIFIED failure.
# These tests verify the script runs without crashing — not that it passes.
#
# Remaining failure (re-measured 2026-07-23, XSPEC-355 R3a):
#   check-standards-reference  — standards reference discrepancies
#
# ─────────────────────────────────────────────────────────────────────────────
# Why this file shrank from nine entries to one
#
# The previous list was measured at git 15c2475, before XSPEC-072, and was never
# re-measured. On 2026-07-23 all nine were re-run: eight already exited 0. The
# debt had been paid down over months, but nobody promoted the entries.
#
# That is a failure in both directions. New violations landed in a list that
# only says "these fail, that's known" and became indistinguishable from old
# debt — which is how the /journey-test and /skill-builder gaps from 99ea6a25
# sat unnoticed. And eight checks that pass stayed documented as
# expected-to-fail, so a regression in any of them would have read as normal.
#
# MAINTENANCE RULE: an entry here is a claim about today, not a historical note.
# When a check goes green, move it to check-scripts-passing.bats in the same
# commit. Do not add an entry without a dated re-measurement.
# ─────────────────────────────────────────────────────────────────────────────

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
}

# ── check-standards-reference-sync.sh ────────────────────────────────────────

@test "check-standards-reference-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-standards-reference-sync.sh" ]
}

@test "check-standards-reference-sync.sh runs and produces output (current failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-standards-reference-sync.sh
  [ ${#output} -gt 0 ]
}
