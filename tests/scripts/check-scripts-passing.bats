#!/usr/bin/env bats
#
# Smoke tests for check-*.sh scripts that exit 0 on a clean repo.
# If any of these start failing, it indicates a real regression.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
}

# ── check-ai-agent-sync.sh ────────────────────────────────────────────────────

@test "check-ai-agent-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-ai-agent-sync.sh" ]
}

@test "check-ai-agent-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-ai-agent-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-cli-docs-sync.sh ────────────────────────────────────────────────────

@test "check-cli-docs-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-cli-docs-sync.sh" ]
}

@test "check-cli-docs-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-cli-docs-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-commit-spec-reference.sh ───────────────────────────────────────────

@test "check-commit-spec-reference.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-commit-spec-reference.sh" ]
}

@test "check-commit-spec-reference.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-commit-spec-reference.sh
  [ "$status" -eq 0 ]
}

# ── check-docs-sync.sh ────────────────────────────────────────────────────────

@test "check-docs-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-docs-sync.sh" ]
}

@test "check-docs-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-docs-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-orphan-specs.sh ─────────────────────────────────────────────────────

@test "check-orphan-specs.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-orphan-specs.sh" ]
}

@test "check-orphan-specs.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-orphan-specs.sh
  [ "$status" -eq 0 ]
}

# ── check-spec-sync.sh ────────────────────────────────────────────────────────

@test "check-spec-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-spec-sync.sh" ]
}

@test "check-spec-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-spec-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-workflow-compliance.sh ─────────────────────────────────────────────

@test "check-workflow-compliance.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-workflow-compliance.sh" ]
}

@test "check-workflow-compliance.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-workflow-compliance.sh
  [ "$status" -eq 0 ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Promoted from check-scripts-known-failures.bats on 2026-07-23 (XSPEC-355 R3a).
#
# That file listed nine "pre-existing failures" measured at git 15c2475, before
# XSPEC-072. Re-measuring on 2026-07-23 found eight of the nine already exit 0 —
# the debt had been paid down over months, but nobody promoted the entries. So
# eight checks that pass were still documented as expected-to-fail, meaning a
# regression in any of them would have been read as "known".
#
# Ratchet rule: once a check is here, it must stay green.
# ─────────────────────────────────────────────────────────────────────────────

# ── check-ai-behavior-sync.ts ────────────────────────────────────────────────
# The .sh wrapper was removed under XSPEC-376 R4/R7 (address points walked and
# updated: this file, pre-release-check.sh step 16); the .ts is now the only
# entry point, invoked the same way check-integration-liveness.ts is below.

@test "check-ai-behavior-sync.ts exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run npx tsx scripts/check-ai-behavior-sync.ts
  [ "$status" -eq 0 ]
}

# ── check-commands-sync.sh ───────────────────────────────────────────────────

@test "check-commands-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-commands-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-docs-integrity.sh ──────────────────────────────────────────────────

@test "check-docs-integrity.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-docs-integrity.sh
  [ "$status" -eq 0 ]
}

# ── check-integration-commands-sync.ts ───────────────────────────────────────
# The .sh wrapper was removed under XSPEC-376 R4/R7 (address points walked and
# updated: this file, pre-release-check.sh step 7.5,
# cli/tests/unit/scripts/integration-commands-sync.test.js AC-7); the .ts is
# now the only entry point.

@test "check-integration-commands-sync.ts exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run npx tsx scripts/check-integration-commands-sync.ts
  [ "$status" -eq 0 ]
}

# ── check-scope-sync.sh ──────────────────────────────────────────────────────

@test "check-scope-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-scope-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-skill-next-steps-sync.sh ───────────────────────────────────────────

@test "check-skill-next-steps-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-skill-next-steps-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-translation-sync.sh ────────────────────────────────────────────────
# Version gaps and source_hash drift are advisory (exit 0); only a MISSING
# source file is a release blocker (exit 1).

@test "check-translation-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-translation-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-usage-docs-sync.sh ─────────────────────────────────────────────────

@test "check-usage-docs-sync.sh exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run bash scripts/check-usage-docs-sync.sh
  [ "$status" -eq 0 ]
}

# ── check-integration-liveness.ts ────────────────────────────────────────────
# Registered divergences (KNOWN_DRIFT) are warnings; anything unregistered fails.

@test "check-integration-liveness.ts exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run npx tsx scripts/check-integration-liveness.ts
  [ "$status" -eq 0 ]
}

# ── check-drift-override-clean.ts ────────────────────────────────────────────
# XSPEC-376 R3b anti-permanence gate for UDS_STANDARDS_DRIFT_OVERRIDE.

@test "check-drift-override-clean.ts exits 0 on clean repo" {
  cd "$REPO_ROOT"
  run npx tsx scripts/check-drift-override-clean.ts
  [ "$status" -eq 0 ]
}

@test "check-drift-override-clean.ts blocks when the variable is assigned in a tracked file" {
  cd "$REPO_ROOT"
  # Built from parts at runtime (not a literal "NAME=value" in this bats
  # source) so this test file itself never contains an assignment the check
  # would flag — only the temporary probe file it writes and stages does.
  local probe="tests/scripts/drift-override-probe.bats-tmp"
  local var_name="UDS_STANDARDS_DRIFT"
  var_name="${var_name}_OVERRIDE"
  printf '%s=1\n' "$var_name" > "$probe"
  git add "$probe"
  run npx tsx scripts/check-drift-override-clean.ts
  git reset -- "$probe"
  rm -f "$probe"
  [ "$status" -eq 1 ]
  [[ "$output" == *"$probe"* ]]
}

# ── fix-manifest-paths.sh ────────────────────────────────────────────────────
# Not a check script; asserts intended argument-validation behaviour.

@test "fix-manifest-paths.sh exits non-zero when called with no arguments" {
  cd "$REPO_ROOT"
  run bash scripts/fix-manifest-paths.sh
  [ "$status" -ne 0 ]
}
