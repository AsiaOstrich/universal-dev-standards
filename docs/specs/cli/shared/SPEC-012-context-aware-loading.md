# SPEC-012: Context-Aware Standard Loading

> **Status**: Approved
> **Author**: AI Assistant
> **Date**: 2026-03-16
> **Type**: Enhancement
> **Scope**: universal

---

## 1. Objective

Introduce a domain-based activation system so AI tools load only the subset of standards relevant to the current task, reducing token usage and improving focus.

Inspired by the CARL framework's context-aware loading principle: load what you need, when you need it.

## 2. Problem Statement

### Current Behavior

- All 40+ `.ai.yaml` standards are listed in `manifest.json` and loaded into AI context at once
- AI tools have no mechanism to determine which standards are relevant to the current task
- Token budget is wasted on standards irrelevant to the user's current activity (e.g., loading deployment standards during a commit)

### Desired Behavior

- `manifest.json` defines `domains` mapping task contexts to standard subsets (single source of truth)
- A subset of standards is designated `always-on` (loaded regardless of task)
- AI tools can selectively load standards based on the current activity

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | `manifest.json` `domains` field is the single source of truth, mapping domain names to arrays of standard file paths | P0 |
| REQ-002 | Standards classified as `always-on` are loaded in every session | P0 |
| REQ-003 | Standards classified as `on-demand` are loaded only when domain/triggers match | P1 |
| REQ-004 | New core standard documents the context-aware loading protocol | P1 |

## 4. Acceptance Criteria

### AC-1: Domains Configuration in manifest.json

**Given** the project's `manifest.json`
**When** a `domains` field is present
**Then** it maps domain names to arrays of standard file paths
**And** includes an `always-on` domain with core standards
**And** is the single source of truth for all domain→standard mappings

### AC-2: Always-On Standards

**Given** the following standards: `anti-hallucination`, `commit-message`, `checkin-standards`, `project-context-memory`, `developer-memory`
**When** any AI session starts
**Then** these standards are always loaded regardless of task context

### AC-3: On-Demand Loading

**Given** standards assigned to on-demand domains with specific triggers in `manifest.json`
**When** the user's task matches those domain triggers (e.g., writing tests, doing code review)
**Then** only the matching standards are loaded into context

## 5. Domain Classification

| Domain | Standards | Trigger Examples |
|--------|-----------|-----------------|
| `always-on` | anti-hallucination, commit-message, checkin-standards, project-context-memory, developer-memory | (always loaded) |
| `testing` | testing, unit-testing, integration-testing, test-completeness-dimensions, tdd, bdd, atdd | "write tests", "test coverage", test file edits |
| `specification` | spec-driven-development, forward-derivation, reverse-engineering, requirement-engineering | "/sdd", "/spec", spec file edits |
| `quality` | code-review, refactoring-standards, security-standards, performance-standards, accessibility-standards | "/review", "refactor", PR review |
| `documentation` | documentation-structure, documentation-writing-standards, ai-instruction-standards, changelog | "write docs", README edits, CHANGELOG edits |
| `workflow` | git-workflow, github-flow, squash-merge, versioning, deployment-standards | branch operations, release, merge |
| `architecture` | ai-friendly-architecture, project-structure, error-codes, logging | architecture decisions, project setup |

## 6. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/context-aware-loading.md` | Create | New core standard documenting the protocol |
| `.standards/context-aware-loading.ai.yaml` | Create | AI-optimized version of the standard |
| `.standards/manifest.json` | Modify | Add `domains` field |
| `CLAUDE.md` | Modify | Reference new standard |

## 7. Test Plan

- [ ] `manifest.json` includes valid `domains` mapping
- [ ] `manifest.json` `domains` covers all non-always-on standards
- [ ] `always-on` domain includes the 5 core standards
- [ ] Standards sync check passes after changes

## Sync Checklist

### From Core Standard
- [x] AI YAML created (`context-aware-loading.ai.yaml`)
- [ ] Translations synced (Phase: future)
