# SPEC-011: Retroactive Spec Tracking & Orphan Detection

> **Status**: Approved
> **Author**: AI Assistant
> **Date**: 2026-03-16
> **Type**: Enhancement
> **Scope**: uds-specific

---

## 1. Objective

Introduce three complementary mechanisms to close the spec tracking gap in UDS:

1. **AI-driven spec assessment at commit time** — the `/commit` command evaluates whether the change needs a spec
2. **`/sdd-retro` command** — retroactively create lightweight specs for untracked changes
3. **Orphan spec detection** — find specs stuck in non-terminal states

These features are inspired by principles from GSD (state tracking), PAUL (no orphan plans), and CARL (context-aware loading).

## 2. Problem Statement

### Current Behavior

- CLAUDE.md states "emergency hotfixes must document retroactively" but provides no mechanism
- `feat`/`fix` commits can land without any spec reference
- Specs can remain in Draft/Approved/Implemented states indefinitely with no warning

### Desired Behavior

- `/commit` proactively suggests spec creation/linkage based on change characteristics
- `/sdd-retro` scans git history and generates lightweight retroactive specs
- `check-orphan-specs.sh` flags specs in non-terminal states during pre-release checks

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | `/commit` evaluates spec need based on type, scale, and API impact | P0 |
| REQ-002 | `Refs: SPEC-XXX` footer convention documented in commit-message standards | P0 |
| REQ-003 | `/sdd-retro` scans git log for untracked feat/fix commits | P1 |
| REQ-004 | `/sdd-retro` generates lightweight retroactive spec templates | P1 |
| REQ-005 | `check-orphan-specs.sh` detects non-Archived/non-Stable specs | P1 |
| REQ-006 | Orphan check integrated into `pre-release-check.sh` | P1 |

## 4. Acceptance Criteria

### AC-1: Commit Spec Assessment

**Given** a user runs `/commit` with staged changes
**When** the changes include `feat` or `fix` type, modify >3 files, or change public API signatures
**Then** the AI outputs a spec tracking suggestion (create new / link existing / not needed)
**And** the user can accept or ignore the suggestion

### AC-2: Refs Footer Convention

**Given** the commit-message standard
**When** a commit relates to a spec
**Then** the footer includes `Refs: SPEC-XXX` format
**And** this convention is documented in `commit-message-guide.md` and `.standards/commit-message.ai.yaml`

### AC-3: Retroactive Spec Command

**Given** a user runs `/sdd-retro`
**When** the git history contains feat/fix commits without `Refs: SPEC-` in their message
**Then** the command groups related commits and generates retroactive spec templates
**And** the user can confirm before writing to `docs/specs/`

### AC-4: Orphan Spec Detection

**Given** spec files exist in `docs/specs/`
**When** `check-orphan-specs.sh` runs
**Then** specs with Status not in (Archived, Stable) are reported
**And** the script exits with code 0 (warning only, non-blocking)

### AC-5: Pre-release Integration

**Given** `pre-release-check.sh` is executed
**When** orphan specs exist
**Then** orphan spec count is displayed as a warning (not a failure)

## 5. Technical Design

### 5.1 Commit Spec Assessment (in `/commit`)

Add a step between "Analyze changes" and "Generate message" in `skills/commands/commit.md`:

```
Step 2.5: Spec Tracking Assessment
- Check commit type: feat/fix → suggest spec
- Check file count: >3 modified → suggest spec
- Check for API changes: public function signature changes → strongly suggest
- Output: recommendation (create / link / skip)
- User decides: accept → add Refs footer; ignore → proceed without
```

### 5.2 `/sdd-retro` Command

New slash command at `skills/commands/sdd-retro.md`:
- Scans `git log --oneline` for feat/fix commits
- Filters out commits already containing `Refs: SPEC-`
- Groups by scope (from commit message)
- Generates lightweight retroactive spec using simplified template
- Writes to `docs/specs/retro/` subdirectory

### 5.3 Orphan Spec Detection Script

`scripts/check-orphan-specs.sh`:
- Scans `docs/specs/**/*.md` for Status field
- Reports specs where Status ∉ {Archived, Stable}
- Outputs warning count
- Exit code 0 (warning-only for pre-release)

## 6. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `skills/commands/commit.md` | Modify | Add spec tracking assessment step |
| `skills/commands/sdd-retro.md` | Create | New retroactive spec command |
| `.standards/commit-message.ai.yaml` | Modify | Add spec-reference-footer rule |
| `core/commit-message-guide.md` | Modify | Document Refs: SPEC-XXX footer |
| `scripts/check-orphan-specs.sh` | Create | Orphan spec detection (macOS/Linux) |
| `scripts/check-orphan-specs.ps1` | Create | Orphan spec detection (Windows) |
| `scripts/pre-release-check.sh` | Modify | Add orphan spec check |
| `CLAUDE.md` | Modify | Update spec tracking documentation |

## 7. Test Plan

- [ ] `/commit` with feat type shows spec suggestion
- [ ] `/commit` with docs type does not show spec suggestion
- [ ] `/sdd-retro` scans history and produces grouped output
- [ ] `check-orphan-specs.sh` detects Draft status specs
- [ ] `check-orphan-specs.sh` passes when all specs are Archived
- [ ] `pre-release-check.sh` includes orphan check as step 16

## Sync Checklist

### From Skill
- [x] Command created (`sdd-retro.md`)
- [ ] Translations synced (Phase: future)

### From Command
- [x] Skill documentation updated (`commit.md`)
- [ ] Translations synced (Phase: future)
