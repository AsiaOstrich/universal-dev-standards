# Workflow Enforcement Standards

**Applicability**: All software projects using structured development methodologies
**Scope**: universal

## Overview

This standard defines machine-enforceable workflow gates that prevent phase skipping in development methodologies (SDD, TDD, BDD). Instead of relying on developer discipline alone, workflow gates provide automated checks at phase transitions.

## Core Principle

> **Guide, don't just block.** When a prerequisite fails, always provide actionable guidance: what is missing, why it matters, and how to fix it.

## Enforcement Modes

Projects can configure enforcement behavior via `.uds/config.yaml`:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `enforce` | Block phase transition + show guidance | Teams committed to process discipline |
| `suggest` | Show warning + allow override | Teams adopting gradually |
| `off` | No enforcement checks | Opt-out |

**Default**: `enforce`

```yaml
# .uds/config.yaml
workflow:
  enforcement_mode: enforce  # enforce | suggest | off
```

## Phase Gate Architecture

### How It Works

1. User invokes a workflow command (e.g., `/sdd implement`)
2. AI assistant checks prerequisites for that phase
3. If prerequisites pass → proceed normally
4. If prerequisites fail:
   - **enforce mode**: Stop, explain, guide to correct phase
   - **suggest mode**: Warn, allow override
   - **off mode**: Skip checks entirely

### Gate Types

| Gate Type | Blocking | Description |
|-----------|----------|-------------|
| **Hard Gate** | Yes | Must pass to proceed (e.g., spec must be Approved before implement) |
| **Soft Gate** | No | Advisory warning (e.g., suggest spec reference in commit) |

## SDD Phase Gates

```
discuss → create → review → approve → implement → verify
```

| Phase | Prerequisites |
|-------|--------------|
| discuss | None (entry point) |
| create | Check for orphan specs (soft) |
| review | Spec exists with status = Draft |
| approve | Spec exists with status = Review, all comments addressed |
| implement | Spec exists with status = Approved |
| verify | Implementation exists, all ACs have code + tests |

## TDD Phase Gates

```
RED → GREEN → REFACTOR → (repeat)
```

| Phase | Prerequisites |
|-------|--------------|
| RED | Feature/behavior clearly defined |
| GREEN | At least one failing test exists (not error, but assertion failure) |
| REFACTOR | All tests passing |

**Critical Enforcement**: The AI MUST NOT write implementation code before a failing test exists. This is the fundamental TDD contract.

## BDD Phase Gates

```
DISCOVERY → FORMULATION → AUTOMATION → LIVING DOCS
```

| Phase | Prerequisites |
|-------|--------------|
| DISCOVERY | Behavior/feature identified |
| FORMULATION | Concrete examples from discovery exist |
| AUTOMATION | `.feature` file with Gherkin scenarios exists |
| LIVING DOCS | Step definitions implemented, all scenarios passing |

## Commit Gates

| Check | Type | Trigger |
|-------|------|---------|
| Staged changes exist | Hard | All commits |
| No merge conflicts | Hard | All commits |
| Tests pass | Hard | feat/fix commits |
| Spec reference | Soft | feat/fix commits with active specs |

## Implementation Notes

### For AI Assistants

AI assistants should:
1. Check gates **before** executing any workflow phase
2. Use the enforcement mode from project config
3. Provide clear, actionable guidance when gates fail
4. Check for resumable workflow state before starting fresh
5. Track phase transitions in `.workflow-state/`

### For CLI Tools

CLI tools can integrate gates via:
1. `WorkflowGate` module — validates phase transitions
2. Pre-commit hooks — warns on workflow compliance
3. `uds check` — reports workflow state

### For Git Hooks

Git-level enforcement should be **warning-only** (non-blocking) to avoid frustrating developers. The AI layer handles blocking enforcement since it can explain and guide.

## Relationship to Other Standards

| Standard | Relationship |
|----------|-------------|
| [Workflow State Protocol](workflow-state-protocol.md) | Gates check state files managed by this protocol |
| [Spec-Driven Development](spec-driven-development.md) | SDD phase gates enforce SDD workflow |
| [Testing Standards](testing-standards.md) | TDD/BDD gates enforce testing methodology |
| [Commit Message Guide](commit-message-guide.md) | Commit gates enforce spec traceability |
| [Check-in Standards](checkin-standards.md) | Pre-commit gates complement check-in rules |
