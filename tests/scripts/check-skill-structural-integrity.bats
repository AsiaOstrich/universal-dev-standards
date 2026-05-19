#!/usr/bin/env bats
#
# Structural tests for scripts/check-skill-structural-integrity.ts
# XSPEC-223: UDS Skill Structural Integrity Gate

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-skill-structural-integrity.ts"
  TSX="$REPO_ROOT/node_modules/.bin/tsx"
}

# AC-223-01: 腳本存在
@test "check-skill-structural-integrity.ts exists" {
  [ -f "$SCRIPT" ]
}

# AC-223-08: package.json 包含 check:skill-integrity script
@test "package.json contains check:skill-integrity script" {
  run node -e "
    const p = require('$REPO_ROOT/package.json');
    process.exit(p.scripts['check:skill-integrity'] ? 0 : 1);
  "
  [ "$status" -eq 0 ]
}

# AC-223-02: 正常情況下通過（exit 0）並輸出成功訊息
@test "passes when all skills have SKILL.md with required sections" {
  run "$TSX" "$SCRIPT"
  [ "$status" -eq 0 ]
  [[ "$output" =~ "✓" ]] || [[ "$output" =~ "passed" ]]
}

# AC-223-03: 缺少 SKILL.md 時 exit 1
@test "fails with exit 1 when SKILL.md is missing" {
  local tmp_skills
  tmp_skills=$(mktemp -d)
  mkdir "$tmp_skills/broken-skill"
  # No SKILL.md created

  run "$TSX" "$SCRIPT" --skills-dir "$tmp_skills"
  [ "$status" -eq 1 ]
  [[ "$output" =~ "broken-skill" ]]

  rm -rf "$tmp_skills"
}

# AC-223-04: SKILL.md 無任何 ## 章節時 exit 1（空殼檔案）
@test "fails when SKILL.md has no level-2 headings at all" {
  local tmp_skills
  tmp_skills=$(mktemp -d)
  mkdir "$tmp_skills/empty-skill"
  echo "# Empty Skill" > "$tmp_skills/empty-skill/SKILL.md"
  echo "Some text but no ## headings." >> "$tmp_skills/empty-skill/SKILL.md"

  run "$TSX" "$SCRIPT" --skills-dir "$tmp_skills" --skip-manifest
  [ "$status" -eq 1 ]
  [[ "$output" =~ "empty-skill" ]]

  rm -rf "$tmp_skills"
}

# AC-223-05: SKILL.md 存在且有工作流程但不在 manifest 時 exit 1
@test "fails when skill is not in manifest" {
  local tmp_skills tmp_manifest
  tmp_skills=$(mktemp -d)
  tmp_manifest=$(mktemp)

  mkdir "$tmp_skills/orphan-skill"
  printf "# Orphan\n\n## Workflow\nsteps here\n" > "$tmp_skills/orphan-skill/SKILL.md"
  echo '{"skills":[]}' > "$tmp_manifest"

  run "$TSX" "$SCRIPT" --skills-dir "$tmp_skills" --manifest "$tmp_manifest"
  [ "$status" -eq 1 ]
  [[ "$output" =~ "orphan-skill" ]]

  rm -rf "$tmp_skills" "$tmp_manifest"
}

# AC-223-07: pre-release-check.sh 包含 skill-integrity step
@test "pre-release-check.sh includes skill structural integrity step" {
  run grep -c "skill.*integrit\|Skill.*Integrit" "$REPO_ROOT/scripts/pre-release-check.sh"
  [ "$status" -eq 0 ]
  [ "$output" -ge 1 ]
}
