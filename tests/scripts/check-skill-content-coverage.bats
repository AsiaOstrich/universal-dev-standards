#!/usr/bin/env bats
#
# Structural tests for scripts/check-skill-content-coverage.ts
# XSPEC-070 Phase 2: Skill↔Standard content-coverage audit
#
# The audit extends the (doc-only) skill-standard-alignment-check from
# "anchor exists" (orphan detection) to "anchor content stays in sync":
#   ① version skew      — skill version < anchor standard version  → CONTENT-001
#   ② mandatory keyword — standard's declared mandatory keyword     → CONTENT-002
#                         missing from the skill body
#   ③ size ratio        — skill far smaller than its anchor standard → CONTENT-003
#
# Default mode is advisory (exit 0, findings printed). --strict promotes any
# finding to a blocking failure (exit 1).

setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/check-skill-content-coverage.ts"
  TSX="$REPO_ROOT/node_modules/.bin/tsx"

  ROOT="$(mktemp -d)"
  mkdir -p "$ROOT/skills" "$ROOT/core" "$ROOT/ai/standards" "$ROOT/cli"
}

teardown() {
  [ -n "$ROOT" ] && rm -rf "$ROOT"
}

# Write a registry with a single standard mapping id → core/ai files.
write_registry() {
  local id="$1"
  cat > "$ROOT/cli/standards-registry.json" <<EOF
{
  "standards": [
    {
      "id": "${id}",
      "source": { "human": "core/${id}.md", "ai": "ai/standards/${id}.ai.yaml" }
    }
  ]
}
EOF
}

run_audit() {
  run "$TSX" "$SCRIPT" \
    --skills-dir "$ROOT/skills" \
    --registry "$ROOT/cli/standards-registry.json" \
    --root "$ROOT" "$@"
}

# ── existence / wiring ────────────────────────────────────────────────────────

@test "check-skill-content-coverage.ts exists" {
  [ -f "$SCRIPT" ]
}

@test "package.json contains check:content-coverage script" {
  run node -e "
    const p = require('$REPO_ROOT/package.json');
    process.exit(p.scripts['check:content-coverage'] ? 0 : 1);
  "
  [ "$status" -eq 0 ]
}

# ── happy path ────────────────────────────────────────────────────────────────

@test "passes (exit 0) when skill is versioned, sized and keyword-complete" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  # standard: small enough that the skill is not flagged on ratio
  printf '# Demo Standards\n\n**Version**: 1.0.0\n\nbody line\nbody line\n' > "$ROOT/core/demo-standards.md"
  cat > "$ROOT/ai/standards/demo-standards.ai.yaml" <<'EOF'
standard:
  id: demo-standards
  meta:
    version: "1.0.0"
  audit:
    mandatory_keywords:
      - alpha_event
EOF
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

**Version**: 1.0.0

## Body
alpha_event is fully documented here with plenty of explanation.
EOF
  run_audit --strict
  [ "$status" -eq 0 ]
}

# ── ① version skew (CONTENT-001) ──────────────────────────────────────────────

@test "flags version skew when skill version < standard version" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  printf '# Demo\n\n**Version**: 2.0.0\n\nbody\n' > "$ROOT/core/demo-standards.md"
  printf 'standard:\n  id: demo-standards\n' > "$ROOT/ai/standards/demo-standards.ai.yaml"
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

**Version**: 1.0.0

## Body
content
EOF
  run_audit
  [ "$status" -eq 0 ]            # advisory by default
  [[ "$output" =~ "CONTENT-001" ]]
  run_audit --strict
  [ "$status" -eq 1 ]           # blocking under --strict
}

# ── ② mandatory keyword (CONTENT-002) ─────────────────────────────────────────

@test "flags missing mandatory keyword declared by the standard" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  printf '# Demo\n\n**Version**: 1.0.0\n\nbody\n' > "$ROOT/core/demo-standards.md"
  cat > "$ROOT/ai/standards/demo-standards.ai.yaml" <<'EOF'
standard:
  id: demo-standards
  audit:
    mandatory_keywords:
      - heartbeat_event
EOF
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

**Version**: 1.0.0

## Body
this skill never mentions the required concept.
EOF
  run_audit
  [[ "$output" =~ "CONTENT-002" ]]
  [[ "$output" =~ "heartbeat_event" ]]
}

# ── ③ size ratio (CONTENT-003) ────────────────────────────────────────────────

@test "flags underspecified skill far smaller than its standard" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  # 60-line standard
  { echo '# Demo'; echo; echo '**Version**: 1.0.0'; for i in $(seq 1 57); do echo "line $i"; done; } \
    > "$ROOT/core/demo-standards.md"
  printf 'standard:\n  id: demo-standards\n' > "$ROOT/ai/standards/demo-standards.ai.yaml"
  # tiny skill
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

**Version**: 1.0.0
EOF
  run_audit
  [[ "$output" =~ "CONTENT-003" ]]
}

# ── orphan handling ───────────────────────────────────────────────────────────

@test "skips skills without anchor_standard (orphans are alignment-check's job)" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/noanchor"
  printf '# Demo\n\n**Version**: 1.0.0\n\nbody\n' > "$ROOT/core/demo-standards.md"
  printf 'standard:\n  id: demo-standards\n' > "$ROOT/ai/standards/demo-standards.ai.yaml"
  cat > "$ROOT/skills/noanchor/SKILL.md" <<'EOF'
---
name: noanchor
---
# No anchor

## Body
content
EOF
  run_audit --strict
  [ "$status" -eq 0 ]
}

# ── version skew on an unversioned skill is advisory, not a crash ──────────────

@test "reads audit block from top-level schema (id/meta at root, no standard wrapper)" {
  # logging.ai.yaml puts id/meta/audit at the top level (no `standard:` wrapper);
  # ac-traceability nests them under `standard:`. Both must be honoured.
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  printf '# Demo\n\n**Version**: 1.0.0\n\nbody\n' > "$ROOT/core/demo-standards.md"
  cat > "$ROOT/ai/standards/demo-standards.ai.yaml" <<'EOF'
id: demo-standards
meta:
  version: "1.0.0"
audit:
  mandatory_keywords:
    - top_level_event
EOF
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

**Version**: 1.0.0

## Body
this skill omits the required concept entirely.
EOF
  run_audit
  [[ "$output" =~ "CONTENT-002" ]]
  [[ "$output" =~ "top_level_event" ]]
}

@test "reports unversioned skill as advisory, never blocks even under --strict" {
  write_registry "demo-standards"
  mkdir -p "$ROOT/skills/demo"
  printf '# Demo\n\n**Version**: 1.0.0\n\nbody\n' > "$ROOT/core/demo-standards.md"
  cat > "$ROOT/ai/standards/demo-standards.ai.yaml" <<'EOF'
standard:
  id: demo-standards
  audit:
    mandatory_keywords: []
EOF
  cat > "$ROOT/skills/demo/SKILL.md" <<'EOF'
---
name: demo
anchor_standard: demo-standards
---
# Demo

## Body
content with no version header but big enough body to pass ratio check easily.
more content here to keep the ratio healthy.
EOF
  run_audit --strict
  [ "$status" -eq 0 ]
  [[ "$output" =~ "CONTENT-001" ]] || [[ "$output" =~ "unversioned" ]]
}
