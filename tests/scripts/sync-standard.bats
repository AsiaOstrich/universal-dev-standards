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
  [[ "$output" == *"Usage"* ]] || false
}

@test "--help prints usage and exits 0" {
  run_sync --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage"* ]] || false
}

@test "exits 1 for a non-existent standard" {
  run_sync --check this-standard-does-not-exist-xyz
  [ "$status" -eq 1 ]
  [[ "$output" == *"not found"* ]] || false
}

@test "--check reports four-layer status for a known standard" {
  run_sync --check anti-hallucination
  [[ "$output" == *"anti-hallucination"* ]] || false
  [[ "$output" == *"ai/standards"* || "$output" == *".standards"* || "$output" == *"locale"* ]] || false
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

@test "default (no --regen) does NOT regenerate ai/standards" {
  # ai/standards/*.ai.yaml is hand-maintained; convert would clobber it, so
  # regeneration must be opt-in.
  run_sync --check anti-hallucination
  [[ "$output" != *"would regenerate"* ]] || false
  [[ "$output" == *"hand-maintained"* || "$output" == *"--regen"* ]] || false
}

@test "--regen --check plans ai/standards regeneration" {
  run_sync --check --regen anti-hallucination
  [[ "$output" == *"regenerate"* ]] || false
}

@test "resolves the on-disk ai file when STANDARD_ID_MAPPING renames the id" {
  # checkin-standards maps to id 'checkin', but the file is checkin-standards.ai.yaml.
  # The script must fall back to the literal on-disk name, not the mapped-but-absent one.
  run_sync --check checkin-standards
  [[ "$output" == *"checkin-standards.ai.yaml"* ]] || false
  [[ "$output" != *"ai/standards/checkin.ai.yaml"* ]] || false
}

@test "uses registry source.ai for irregular filenames (error-code-standards → error-codes.ai.yaml)" {
  # getOutputFilename maps to error-code.ai.yaml and the literal would be
  # error-code-standards.ai.yaml — neither exists. Only the registry source.ai
  # (error-codes.ai.yaml, pluralised) is correct.
  run_sync --check error-code-standards
  [[ "$output" == *"error-codes.ai.yaml"* ]] || false
  [[ "$output" != *"missing"* ]] || false
}

@test "parses **Version** inside a blockquote header (pii-classification)" {
  # pii-classification uses '> **Version**: X | **Status**: ...' on one quoted
  # line; the version parser must still read it (not report v(unknown), which
  # would skip locale stale-marking).
  run_sync --check pii-classification
  [[ "$output" != *"v(unknown)"* ]] || false
}
