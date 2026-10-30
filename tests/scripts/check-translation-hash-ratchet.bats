#!/usr/bin/env bats
#
# Tests for scripts/check-translation-hash-ratchet.sh — what counts as a managed translation
# scripts/check-translation-hash-ratchet.sh 的「受管翻譯」判定測試
#
# Scope:
#   Only a file whose YAML frontmatter declares `source:` is a managed translation.
#   locales/README.md shows a frontmatter example inside a code block; a whole-file grep
#   once recorded it as a translation debt. These tests run the script (the product entry)
#   against a sandbox and read back its exit code and its report.
#   只有 frontmatter 宣告 `source:` 的檔才是受管翻譯；說明檔內文範例不算。
#
# Design: each test builds a SELF-CONTAINED sandbox (copy of the script, an empty baseline,
# a tiny locales/ tree), so it never depends on the repo's real locale files.
# The baseline expiry is pushed to year 2099 in the copy so the test does not start failing
# when the real expiry date passes.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SANDBOX="$BATS_TEST_TMPDIR/sandbox"
  mkdir -p "$SANDBOX/scripts" "$SANDBOX/locales/zz-test"
  sed 's/^BASELINE_EXPIRY=.*/BASELINE_EXPIRY="2099-12-31"/' \
    "$REPO_ROOT/scripts/check-translation-hash-ratchet.sh" > "$SANDBOX/scripts/check-translation-hash-ratchet.sh"
  grep -q '^BASELINE_EXPIRY="2099-12-31"$' "$SANDBOX/scripts/check-translation-hash-ratchet.sh" || false
  printf '# empty baseline\n' > "$SANDBOX/scripts/translation-hash-ratchet-baseline.txt"
  SCRIPT="$SANDBOX/scripts/check-translation-hash-ratchet.sh"
}

_write_readme_with_example() {
  cat > "$SANDBOX/locales/README.md" <<'README'
# Translations

Each translated file starts with front matter:

```yaml
---
source: ../../core/example.md
translation_version: 1.0.0
---
```
README
}

@test "a locales README that only shows a source: example in a code block is not a translation debt" {
  _write_readme_with_example
  # one real, hashed translation so the walker has something to count
  printf -- '---\nsource: ../x.md\nsource_hash: abc123def456\n---\nbody\n' > "$SANDBOX/locales/zz-test/ok.md"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"無 source_hash：0"* ]] || false
  [[ "$output" != *"README.md"* ]] || false
}

@test "a real translation whose frontmatter declares source but has no source_hash is still caught" {
  _write_readme_with_example
  printf -- '---\nsource: ../x.md\nlast_synced: 2026-01-01\n---\nbody\n' > "$SANDBOX/locales/zz-test/nohash.md"
  run bash "$SCRIPT"
  [ "$status" -eq 1 ]
  [[ "$output" == *"locales/zz-test/nohash.md"* ]] || false
  [[ "$output" == *"基線外 1"* ]] || false
  [[ "$output" != *"locales/README.md"* ]] || false
}

@test "the same missing-hash translation is accepted when it is listed in the baseline" {
  printf -- '---\nsource: ../x.md\n---\nbody\n' > "$SANDBOX/locales/zz-test/nohash.md"
  printf 'locales/zz-test/nohash.md\n' >> "$SANDBOX/scripts/translation-hash-ratchet-baseline.txt"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" == *"基線內 1"* ]] || false
}

@test "the committed baseline has no debt entries (only comments)" {
  run grep -vE '^[[:space:]]*(#|$)' "$REPO_ROOT/scripts/translation-hash-ratchet-baseline.txt"
  # grep exits 1 when every line is a comment or blank
  [ "$status" -eq 1 ]
  [ -z "$output" ]
}

@test "the real locales/README.md has no frontmatter, so it has no source to hash against" {
  run head -n 1 "$REPO_ROOT/locales/README.md"
  [ "$status" -eq 0 ]
  [[ "$output" != "---" ]] || false
}
