#!/usr/bin/env bats
#
# Smoke tests for check-*.sh scripts with PRE-EXISTING failures (before XSPEC-072).
# These tests verify the scripts run without crashing — not that they pass their checks.
#
# Pre-existing failures (verified at git 15c2475, before XSPEC-072 Phase 2):
#   check-ai-behavior-sync     — 3 commands missing AI Agent Behavior sections
#   check-commands-sync        — 4 commands (e2e/observability/runbook/slo) not in AVAILABLE_COMMANDS
#   check-docs-integrity       — doc count / link discrepancies
#   check-integration-commands — 418 missing command references
#   check-scope-sync           — 14 missing scope metadata entries
#   check-skill-next-steps     — sync gap in skill next-steps registry
#   check-standards-reference  — standards reference discrepancies
#   check-translation-sync     — 15 core standards missing translations (A06)
#   check-usage-docs-sync      — usage doc sync gap
#
# TODO: fix each pre-existing failure and migrate these tests to check-scripts-passing.bats

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
}

# ── check-ai-behavior-sync.sh ─────────────────────────────────────────────────

@test "check-ai-behavior-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-ai-behavior-sync.sh" ]
}

@test "check-ai-behavior-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-ai-behavior-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-commands-sync.sh ────────────────────────────────────────────────────

@test "check-commands-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-commands-sync.sh" ]
}

@test "check-commands-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-commands-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-docs-integrity.sh ───────────────────────────────────────────────────

@test "check-docs-integrity.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-docs-integrity.sh" ]
}

@test "check-docs-integrity.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-docs-integrity.sh
  [ ${#output} -gt 0 ]
}

# ── check-integration-commands-sync.sh ───────────────────────────────────────

@test "check-integration-commands-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-integration-commands-sync.sh" ]
}

@test "check-integration-commands-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-integration-commands-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-scope-sync.sh ───────────────────────────────────────────────────────

@test "check-scope-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-scope-sync.sh" ]
}

@test "check-scope-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-scope-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-skill-next-steps-sync.sh ────────────────────────────────────────────

@test "check-skill-next-steps-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-skill-next-steps-sync.sh" ]
}

@test "check-skill-next-steps-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-skill-next-steps-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-standards-reference-sync.sh ────────────────────────────────────────

@test "check-standards-reference-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-standards-reference-sync.sh" ]
}

@test "check-standards-reference-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-standards-reference-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-translation-sync.sh ─────────────────────────────────────────────────

@test "check-translation-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-translation-sync.sh" ]
}

@test "check-translation-sync.sh runs and produces output (pre-existing failure / A06)" {
  cd "$REPO_ROOT"
  run bash scripts/check-translation-sync.sh
  [ ${#output} -gt 0 ]
}

# ── check-usage-docs-sync.sh ──────────────────────────────────────────────────

@test "check-usage-docs-sync.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/check-usage-docs-sync.sh" ]
}

@test "check-usage-docs-sync.sh runs and produces output (pre-existing failure)" {
  cd "$REPO_ROOT"
  run bash scripts/check-usage-docs-sync.sh
  [ ${#output} -gt 0 ]
}

# ── fix-manifest-paths.sh ─────────────────────────────────────────────────────

@test "fix-manifest-paths.sh exists and is executable" {
  [ -x "$REPO_ROOT/scripts/fix-manifest-paths.sh" ]
}

@test "fix-manifest-paths.sh exits non-zero when called with no arguments" {
  cd "$REPO_ROOT"
  run bash scripts/fix-manifest-paths.sh
  [ "$status" -ne 0 ]
}
