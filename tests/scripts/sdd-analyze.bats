#!/usr/bin/env bats
#
# Tests for scripts/sdd-analyze.ts — XSPEC-262 Phase 1 MVP
# Cross-artifact consistency: orphan tests, uncovered AC, coverage, --json, exit codes.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/sdd-analyze.ts"
  PROJ="$BATS_TEST_TMPDIR/proj"
  mkdir -p "$PROJ/specs" "$PROJ/tests"
}

run_analyze() {
  run npx tsx "$SCRIPT" --specs "$PROJ/specs" --tests "$PROJ/tests" "$@"
}

@test "sdd-analyze.ts exists" {
  [ -f "$SCRIPT" ]
}

@test "clean project (all AC covered, no orphan) exits 0" {
  printf -- '- AC-1: login works\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 0 ]
  [[ "$output" == *"Status: OK"* ]]
}

@test "orphan test reference blocks with exit 1" {
  printf -- '- AC-1: login works\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n// @AC AC-999\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 1 ]
  [[ "$output" == *"Orphan"* ]]
  [[ "$output" == *"AC-999"* ]]
}

@test "uncovered AC is reported but not blocking" {
  printf -- '- AC-1: covered\n- AC-2: not covered\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 0 ]
  [[ "$output" == *"Uncovered"* ]]
  [[ "$output" == *"AC-2"* ]]
}

@test "not_implemented (from .ac.yaml) blocks with exit 1" {
  printf -- '- AC-1: feature\n' > "$PROJ/specs/SPEC-001.md"
  printf 'acceptance_criteria:\n  - id: AC-1\n    status: not_implemented\n' > "$PROJ/specs/SPEC-001.ac.yaml"
  printf '// (no test)\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 1 ]
  [[ "$output" == *"not_implemented"* ]]
}

@test "--json emits parseable JSON with coveragePct and orphans" {
  printf -- '- AC-1: login\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n' > "$PROJ/tests/a.test.ts"
  run_analyze --json
  [ "$status" -eq 0 ]
  echo "$output" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); process.exit(typeof d.coveragePct==="number" && Array.isArray(d.orphans)?0:1)'
}

@test "compound AC ids (AC-050-001) are recognized" {
  printf -- '- AC-050-001: container list\n' > "$PROJ/specs/SPEC-050.md"
  printf '// @AC AC-050-001\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 0 ]
  [[ "$output" == *"Status: OK"* ]]
}

# ── Phase 2: spec↔.feature sync + cross-spec conflicts ───────────────────────

@test "cross-spec AC id conflict blocks with exit 1" {
  printf -- '- AC-1: defined in spec A\n' > "$PROJ/specs/SPEC-A.md"
  printf -- '- AC-1: defined in spec B\n' > "$PROJ/specs/SPEC-B.md"
  printf '// @AC AC-1\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 1 ]
  [[ "$output" == *"Cross-spec"* ]]
  [[ "$output" == *"AC-1"* ]]
}

@test "orphan .feature reference blocks with exit 1" {
  printf -- '- AC-1: login\n' > "$PROJ/specs/SPEC-001.md"
  printf '@AC-1\nScenario: ok\n@AC-999\nScenario: orphan\n' > "$PROJ/tests/x.feature"
  printf '// @AC AC-1\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 1 ]
  [[ "$output" == *"Orphan .feature"* ]]
  [[ "$output" == *"AC-999"* ]]
}

@test "AC without BDD scenario reported when .feature present (non-blocking)" {
  printf -- '- AC-1: has scenario\n- AC-2: no scenario\n' > "$PROJ/specs/SPEC-001.md"
  printf '@AC-1\nScenario: ok\n' > "$PROJ/tests/x.feature"
  printf '// @AC AC-1\n// @AC AC-2\n' > "$PROJ/tests/a.test.ts"
  run_analyze
  [ "$status" -eq 0 ]
  [[ "$output" == *"without BDD scenario"* ]]
  [[ "$output" == *"AC-2"* ]]
}

# ── Phase 3: user-guide ↔ E2E drift (T-NNN) ──────────────────────────────────

@test "user-guide T-NNN with no matching test id blocks with exit 1 (drift)" {
  mkdir -p "$PROJ/docs"
  printf -- '- AC-1: login\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n// T-001 verified here\n' > "$PROJ/tests/a.test.ts"
  printf '| UG-1 | login | T-001 |\n| UG-2 | logout | T-999 |\n' > "$PROJ/docs/guide.md"
  run_analyze --userguide "$PROJ/docs"
  [ "$status" -eq 1 ]
  [[ "$output" == *"drift"* ]]
  [[ "$output" == *"T-999"* ]]
}

@test "user-guide T-NNN matching a real test id is not drift" {
  mkdir -p "$PROJ/docs"
  printf -- '- AC-1: login\n' > "$PROJ/specs/SPEC-001.md"
  printf '// @AC AC-1\n// T-001\n' > "$PROJ/tests/a.test.ts"
  printf '| UG-1 | login | T-001 |\n' > "$PROJ/docs/guide.md"
  run_analyze --userguide "$PROJ/docs"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Status: OK"* ]]
}
