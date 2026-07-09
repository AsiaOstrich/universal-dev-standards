#!/usr/bin/env bats
#
# Tests for scripts/commitlint-bilingual-rule.mjs, wired into
# commitlint.config.js as the 'bilingual-subject-format' and
# 'bilingual-body-language-split' rules.
#
# [Source: dev-platform/cross-project/specs/XSPEC-324-ai-output-language-consistency.md R2/AC-2/AC-3]
#
# Exemption is decided from the SUBJECT's own CJK content (see the module's
# header comment for why deciding it from the body would wrongly wave
# through a "forgot the Chinese body" commit as "must be automated"). These
# tests exercise both the pass and reject paths, plus the exemption itself.

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  CONFIG="$REPO_ROOT/commitlint.config.js"
}

run_commitlint() {
  run bash -c "printf '%s' \"\$1\" | npx commitlint --config '$CONFIG'" _ "$1"
}

@test "config and rule module exist" {
  [ -f "$CONFIG" ]
  [ -f "$REPO_ROOT/scripts/commitlint-bilingual-rule.mjs" ]
}

@test "AC-2 case 1: compliant bilingual header-only commit passes" {
  run_commitlint 'feat(auth): Add login form. 新增登入表單。'
  [ "$status" -eq 0 ]
}

@test "AC-2 case 1: compliant bilingual commit with English-then-Chinese body passes" {
  run_commitlint 'feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

實作 Google OAuth2 認證流程供使用者登入。

Closes #123'
  [ "$status" -eq 0 ]
}

@test "AC-2 case 2: bilingual subject with English-only body is rejected as missing Chinese" {
  run_commitlint 'feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

Closes #123'
  [ "$status" -eq 1 ]
  [[ "$output" == *"missing a Chinese paragraph"* ]]
}

@test "AC-2 case 3: same-paragraph English+Chinese mixing is rejected" {
  run_commitlint 'feat(auth): Add login form. 新增登入表單。

Add login form and 新增登入表單 for better UX.'
  [ "$status" -eq 1 ]
  [[ "$output" == *"mixing English and Chinese"* ]]
}

@test "AC-3: pure-English automated commit (dependabot-style) is exempt" {
  run_commitlint 'chore(deps): bump globals from 17.6.0 to 17.7.0 in /cli (#150)'
  [ "$status" -eq 0 ]
}

@test "embedded English technical term inside an otherwise-Chinese paragraph is NOT flagged mixed" {
  run_commitlint 'feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

實作 Google OAuth2 認證流程供使用者登入整合 Google OAuth2 SDK。'
  [ "$status" -eq 0 ]
}

@test "bilingual subject missing its Chinese segment is rejected" {
  run_commitlint 'feat(auth): Add login form only in English 新增'
  [ "$status" -eq 1 ]
}

# header-max-length/body-max-line-length were raised from the
# config-conventional default of 100 (sized for English-only commits) to
# 250/200, sized from this repo's own real bilingual commit history (see
# commitlint.config.js comment). A realistic bilingual header commonly runs
# well past 100 chars just from repeating the subject in two languages.
@test "realistic long bilingual header (>100, <250 chars) passes" {
  run_commitlint 'feat(i18n): clear large-drift translation debt across multiple documentation files in one batch. 一次批次清償多份文件的大量翻譯漂移。'
  [ "$status" -eq 0 ]
}

@test "header past the raised 250-char ceiling is still rejected" {
  local long_en long_zh
  long_en=$(printf 'x%.0s' {1..250})
  run_commitlint "feat(test): ${long_en}. 測測測測測。"
  [ "$status" -eq 1 ]
  [[ "$output" == *"header-max-length"* ]]
}
