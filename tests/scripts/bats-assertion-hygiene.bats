#!/usr/bin/env bats
#
# Guards every other .bats file against assertions that can pass silently.
# Rationale and the fix idioms: scripts/check-bats-assertions.mjs (header).
#
# Short version: under bash 3.2 (macOS /bin/bash) a false `[[ … ]]` in the middle
# of a test does not abort it, and a `! cmd` never does on any bash. CI runs
# bash 5, so a test could be red on CI and green on every developer's Mac.

bats_require_minimum_version 1.5.0

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  CHECK="$REPO_ROOT/scripts/check-bats-assertions.mjs"
  BATS_BIN="$REPO_ROOT/tests/bats/bin/bats"
  echo "# bash ${BASH_VERSION}" >&3
}

# Writes stdin to $1, turning a leading `%%test` into `@test`. bats' own
# preprocessor rewrites any line starting with `@test`, even inside a heredoc,
# so the throwaway suites below cannot spell it literally.
_emit() {
  sed 's/^%%test/@test/' > "$1"
}

@test "check-bats-assertions.mjs exists" {
  [ -f "$CHECK" ]
}

@test "scanner self-test: every red sample is reported, every green sample is not" {
  command -v node >/dev/null 2>&1 || skip "node not in PATH"
  run node "$CHECK" --self-test
  [ "$status" -eq 0 ]
  [[ "$output" == *"samples behave as declared"* ]] || false
}

@test "no .bats file contains a bare [[ ]], (( )) or ! assertion" {
  command -v node >/dev/null 2>&1 || skip "node not in PATH"
  cd "$REPO_ROOT"
  run node "$CHECK"
  [ "$status" -eq 0 ]
  [[ "$output" == *"no bare assertions"* ]] || false
}

@test "scanner names file and line for a bare [[ in the middle of a test" {
  command -v node >/dev/null 2>&1 || skip "node not in PATH"
  _emit "$BATS_TEST_TMPDIR/seeded.bats" <<'SEED'
%%test "seeded" {
  run true
  [[ "$output" == *"never printed"* ]]
  true
}
SEED
  run node "$CHECK" "$BATS_TEST_TMPDIR/seeded.bats"
  [ "$status" -eq 1 ]
  [[ "$output" == *"seeded.bats:3:"* ]] || false
}

@test "the fix idioms fail a test under the bash running this suite" {
  # Executor-level proof: build a throwaway suite whose every assertion is false,
  # written the way the scanner demands, and require bats to report every one red.
  _emit "$BATS_TEST_TMPDIR/idioms.bats" <<'IDIOMS'
bats_require_minimum_version 1.5.0
%%test "double bracket or-false" {
  [[ 1 == 2 ]] || false
  true
}
%%test "two double brackets or-false" {
  [[ 1 == 2 ]] || [[ 1 == 3 ]] || false
  true
}
%%test "arithmetic or-false" {
  (( 0 )) || false
  true
}
%%test "run bang" {
  run ! true
  true
}
IDIOMS
  run "$BATS_BIN" "$BATS_TEST_TMPDIR/idioms.bats"
  [ "$status" -eq 1 ]
  [ "$(printf '%s\n' "$output" | grep -c '^not ok')" -eq 4 ]
  [ "$(printf '%s\n' "$output" | grep -c '^ok')" -eq 0 ]
}
