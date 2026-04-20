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
