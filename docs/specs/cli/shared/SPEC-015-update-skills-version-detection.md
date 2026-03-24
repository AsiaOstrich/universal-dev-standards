# SPEC-015: Update Command Skills Version Detection Fix

> **Status**: Archived
> **Author**: AI Assistant
> **Date**: 2026-03-23
> **Type**: Bug Fix
> **Scope**: uds-specific

---

## 1. Objective

Fix three related defects in `uds update` that cause Skills to not be detected as outdated, leading to a misleading "手動安裝已棄用" deprecation message instead of offering the user an in-flow update.

## 2. Problem Statement

### Current Behavior

1. `checkNewFeatures()` skips the outdated check when `installedVersion` is `null` (line 1587: `installedVersion && installedVersion !== latestSkillsVersion` — the `&&` short-circuits on null)
2. When Skills are installed/updated via `uds update`, `manifest.skills.location` is never set (only set during `uds init`)
3. The "Skills update reminder" section reads only `manifest.skills.location`, which may be undefined for legacy manifests → falls into "Legacy or unknown" branch → shows misleading deprecation message

### Desired Behavior

1. Skills with unknown version (`null`) should be treated as outdated and offered for update
2. `manifest.skills.location` should be derived from `installations` array during update
3. The reminder section should use multiple sources: `installations` → `location` → file-system detection

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | `checkNewFeatures()` treats null `installedVersion` as outdated | P0 |
| REQ-002 | Update flow derives `manifest.skills.location` from installations | P1 |
| REQ-003 | Reminder section uses multi-source location detection | P1 |
| REQ-004 | Same fix applied to Commands version detection (parallel defect) | P1 |

## 4. Acceptance Criteria

### AC-1: Null Version Treated as Outdated

**Given** Skills are installed but `.manifest.json` has no version field
**When** `checkNewFeatures()` runs during `uds update`
**Then** the Skills are added to `outdatedSkills` with `currentVersion: 'unknown'`

### AC-2: Location Derived from Installations

**Given** Skills are installed via `uds update` (not `uds init`)
**When** the update completes
**Then** `manifest.skills.location` is set based on the `installations` array levels

### AC-3: Multi-Source Location Detection

**Given** `manifest.skills.location` is undefined (legacy manifest)
**When** the "Skills update reminder" section executes
**Then** location is resolved via: installations array → file-system detection → 'unknown' fallback

## 5. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `cli/src/commands/update.js:1587` | Modify | Change `installedVersion &&` to `(!installedVersion \|\|` |
| `cli/src/commands/update.js:1651` | Modify | Same fix for Commands |
| `cli/src/commands/update.js:744-756` | Modify | Add location derivation in installSkills block |
| `cli/src/commands/update.js:784-786` | Modify | Add location derivation in updateSkills block |
| `cli/src/commands/update.js:950-974` | Modify | Replace single-source location with multi-source detection |
| `cli/tests/commands/update.test.js` | Add | 2 new test cases for location derivation and fallback |

## 6. Test Plan

- [x] Existing test "should show skills update reminder when available" still passes
- [x] New test: location derived from installations when manifest.skills.location is missing
- [x] New test: file-system fallback when both location and installations are missing
- [x] Full test suite (1582 tests) passes
- [x] Lint passes (0 errors)
