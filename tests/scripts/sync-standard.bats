#!/usr/bin/env bats
#
# Smoke tests for scripts/sync-standard.ts
# XSPEC-292 §10.1 — one-shot four-layer standard sync.
# Scope: arg validation + dry-run safety. The --check mode must NEVER mutate
# any of the four layers, so these tests can run against the real repo.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/sync-standard.ts"
  cd "$REPO_ROOT"
}

run_sync() {
  run npx tsx "$SCRIPT" "$@"
}

@test "sync-standard.ts exists" {
  [ -f "$SCRIPT" ]
}

@test "exits 1 with a usage hint when given no arguments and no --all" {
  run_sync
  [ "$status" -eq 1 ]
  [[ "$output" == *"Usage"* ]]
}

@test "--help prints usage and exits 0" {
  run_sync --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage"* ]]
}

@test "exits 1 for a non-existent standard" {
  run_sync --check this-standard-does-not-exist-xyz
  [ "$status" -eq 1 ]
  [[ "$output" == *"not found"* ]]
}

@test "--check reports four-layer status for a known standard" {
  run_sync --check anti-hallucination
  [[ "$output" == *"anti-hallucination"* ]]
  [[ "$output" == *"ai/standards"* || "$output" == *".standards"* || "$output" == *"locale"* ]]
}

@test "--check is read-only: does not mutate the four layers" {
  run_sync --check anti-hallucination
  # dry-run must not have written to any layer
  git diff --quiet -- \
    ai/standards/anti-hallucination.ai.yaml \
    .standards/anti-hallucination.ai.yaml \
    locales/zh-TW/core/anti-hallucination.md \
    locales/zh-CN/core/anti-hallucination.md
}
