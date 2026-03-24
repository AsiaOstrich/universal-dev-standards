# SPEC-016: CHANGELOG Update Timing Correction

> **Status**: Archived
> **Author**: AI Assistant
> **Date**: 2026-03-23
> **Type**: Enhancement
> **Scope**: partial

---

## 1. Objective

Correct the CHANGELOG update timing guidance in checkin-standards from "per commit" to "pre-release only", resolving a contradiction with changelog-standards.md.

## 2. Problem Statement

### Current Behavior

Three files instruct developers to update CHANGELOG on every commit:

- `core/checkin-standards.md` (line 197): "CHANGELOG updated (if applicable)"
- `.standards/checkin-standards.ai.yaml` (line 56): "CHANGELOG updated (for user-facing changes to [Unreleased] section)"
- `CLAUDE.md` (line 295): "CHANGELOG updated for user-facing changes"

### Desired Behavior

CHANGELOG is updated during release preparation, not per commit. This aligns with `core/changelog-standards.md` (lines 193-199) which defines:

| Workflow | When to Update |
|----------|----------------|
| GitFlow | During release preparation |
| GitHub Flow | Before merging to main |
| Trunk-Based | Before tagging release |

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | checkin-standards.md marks CHANGELOG as "pre-release only" | P0 |
| REQ-002 | checkin-standards.ai.yaml reflects same timing | P0 |
| REQ-003 | CLAUDE.md references correct timing | P1 |

## 4. Acceptance Criteria

### AC-1: Checkin Standards Clarity

**Given** a developer reviews the checkin-standards checklist
**When** they read the CHANGELOG item
**Then** it clearly states "pre-release only, not per commit" with a reference to changelog-standards.md

### AC-2: Consistency with Changelog Standards

**Given** `core/changelog-standards.md` defines "When to Update CHANGELOG" by workflow type
**When** `core/checkin-standards.md` references CHANGELOG
**Then** the guidance is consistent (both say release preparation, not per commit)

## 5. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/checkin-standards.md:197-201` | Modify | Changed "if applicable" to "pre-release only" |
| `.standards/checkin-standards.ai.yaml:12,56` | Modify | Updated guidelines and checklist item |
| `CLAUDE.md:295` | Modify | Added "at pre-release only, not per commit" |

## 6. Test Plan

- [x] No code tests needed (documentation-only change)
- [x] Lint passes
- [x] Content consistency verified between checkin-standards and changelog-standards
