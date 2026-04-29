---
name: process-to-skill
scope: universal
description: "[UDS] Identify repeated processes and build Skills with the right development depth"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "[process description | 流程描述]"
---

# Process-to-Skill Assistant

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/process-automation/SKILL.md)

Guides you from "I keep doing this manually" to a properly built Skill,
with the right amount of process along the way.

## When to Use

- You've done the same multi-step sequence ≥ 3 times manually
- A teammate asks "how do we do X again?" for the 3rd time
- You built a Skill ad-hoc and want to formalize it

## Core Principle

> A Skill records **process knowledge**. Memory records historical facts.
> When you notice yourself executing the same steps repeatedly, that's a Skill candidate.

## Decision Tree

```
New Skill needed?
├── Modifying existing Skill?
│     → Delta path: append ## MODIFIED / ## ADDED to existing SKILL.md
│                   update version field → done
│
├── Answer these 4 questions (any "yes" → Complex):
│     1. More than 7 steps?
│     2. Branching logic between steps (if/else)?
│     3. Requires knowledge from 3+ separate standards/decisions?
│     4. Output directly affects sub-project source code?
│
├── All "no" → Simple path
│     → Fill Skill Brief (templates/SKILL-BRIEF-TEMPLATE.md)
│     → Create SKILL.md directly (no XSPEC needed)
│
└── Any "yes" → Complex path
      → Create XSPEC first → run /sdd
      → Return here after XSPEC Approved

Deprecating a Skill?
  → Add to SKILL.md frontmatter:
      status: deprecated
      deprecated_at: YYYY-MM-DD
      deprecated_reason: "..."
      superseded_by: "/new-skill"   (if applicable)
  → Mark archived in SKILL-CANDIDATES.md
```

## Placement Decision

Before creating SKILL.md, decide where it belongs:

| Condition | Placement |
|-----------|-----------|
| Steps reference project-specific paths (e.g. TECH-RADAR.md, DEC-*.md) | Project: `{project}/.claude/skills/` |
| Steps are universal (no project-specific paths) | UDS: `skills/{name}/` + zh-TW locale |

## Workflow

### Step 1 — Describe the Process

Capture the repeated sequence:
- What steps, in what order?
- How many times done manually so far?
- What tools or files does it touch?

### Step 2 — Update SKILL-CANDIDATES.md

Open your project's `SKILL-CANDIDATES.md` (copy from `templates/SKILL-CANDIDATES.md` if first time):
- Not yet recorded → add row, fill current count
- Already recorded → increment count
- Count reached 3 → mark trigger ✅, proceed

### Step 3 — Choose Path (Simple / Complex / Delta)

Answer the 4 judgment questions. Determine: Simple, Complex, or Delta.

### Step 4a — Simple: Fill Skill Brief

Use `templates/SKILL-BRIEF-TEMPLATE.md`:
- Trigger context (when would you use this?)
- Core steps (3–7, ordered)
- Acceptance Criteria (2–3 items)
- Out of scope (explicit boundaries)

### Step 4b — Complex: Create XSPEC

Run `/sdd` to create XSPEC. Return to Step 5 after XSPEC is Approved.

### Step 4c — Delta: Identify Change Scope

Identify which sections of the existing SKILL.md change.
Add `## MODIFIED Requirements` or `## ADDED Requirements` at the end.

### Step 5 — Create / Update SKILL.md

Generate SKILL.md from the Brief or XSPEC:
- Verify frontmatter: `name`, `scope`, `description`, `allowed-tools`
- For UDS skills: create zh-TW locale version too
- For project skills: place in `{project}/.claude/skills/{name}/SKILL.md`

### Step 6 — Update SKILL-CANDIDATES.md

Mark the candidate row: trigger ✅, Skill column filled.

### Step 7 — Commit

```
feat(skills): Add /{skill-name} skill. 新增 /{skill-name} Skill。

{English description, 1-2 lines}

{Chinese description, 1-2 lines}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Output Checklist

After completing all steps, verify:

- [ ] `SKILL-CANDIDATES.md` updated (trigger ✅, Skill name filled)
- [ ] `SKILL.md` created with complete frontmatter (`name`/`scope`/`description`/`allowed-tools`)
- [ ] Simple path: Skill Brief referenced or preserved
- [ ] Complex path: XSPEC ID noted in SKILL.md header comment
- [ ] UDS skill: zh-TW locale file created
- [ ] Deprecated: `status: deprecated` in frontmatter
- [ ] git commit completed

## References

- Skill Brief template: [templates/SKILL-BRIEF-TEMPLATE.md](../../templates/SKILL-BRIEF-TEMPLATE.md)
- Candidate tracking: [templates/SKILL-CANDIDATES.md](../../templates/SKILL-CANDIDATES.md) (copy to your project)
- ADR standards: [core/adr-standards.md](../../core/adr-standards.md)
