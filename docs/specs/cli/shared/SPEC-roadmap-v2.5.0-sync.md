# SPEC-roadmap-v2.5.0-sync: AI Agent Roadmap v2.5.0 Code Sync

> **Status**: Implemented
> **Author**: Architect Agent
> **Date**: 2026-02-09
> **Implemented**: 2026-02-09

## 1. Objective

Synchronize CLI code with AI Agent Roadmap v2.5.0 research findings (2026-02-09).

## 2. Changes

### 2a. Antigravity — Enable Skills Support

**Finding**: Google Antigravity natively supports SKILL.md + slash commands since Nov 2025. UDS CLI had `supportsSkills: false`.

| Field | Before | After |
|-------|--------|-------|
| `skills.project` | `.antigravity/skills/` | `.agent/skills/` |
| `skills.user` | `~/.antigravity/skills` | `~/.gemini/antigravity/skills` |
| `supportsSkills` | `false` | `true` |

### 2b. Cursor — Version Comment Update

**Finding**: Cursor Skills support shipped in v2.4, not v2.3.35.

| Field | Before | After |
|-------|--------|-------|
| Comment | `v2.3.35 (Jan 2026)` | `v2.4 (Jan 22, 2026)` |

### 2c. Gemini CLI — Stable Skills

**Finding**: Gemini CLI Skills promoted from preview to stable in v0.27.0 (Feb 3, 2026).

| Field | Before | After |
|-------|--------|-------|
| Comment | `Preview support` | `Stable since v0.27.0 (Feb 2026)` |

### 2d. Pre-existing Aligned Changes

| File | Change |
|------|--------|
| `ai-agent-paths.js` | Cline paths `.clinerules/` to `.cline/` |
| `constants.js` | Gemini CLI promoted to first-class tool |
| `integrations.js` | Default language `'en'` to `null` |
| `constants.test.js` | Related test updates |

## 3. Files Modified

| File | Type |
|------|------|
| `cli/src/config/ai-agent-paths.js` | Modified |
| `cli/tests/unit/config/ai-agent-paths.test.js` | Modified |
| `cli/src/core/constants.js` | Modified (pre-existing) |
| `cli/src/prompts/integrations.js` | Modified (pre-existing) |
| `cli/tests/unit/core/constants.test.js` | Modified (pre-existing) |

## 4. Acceptance Criteria

- AC-1: Antigravity `supportsSkills` is `true`
- AC-2: Antigravity paths use `.agent/skills/` and `~/.gemini/antigravity/skills`
- AC-3: Cursor comment references v2.4
- AC-4: Gemini CLI comment references stable v0.27.0
- AC-5: All tests pass
