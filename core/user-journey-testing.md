# User Journey Testing Standard

> **Language**: English | 繁體中文

**Applicability**: Projects with multi-step, stateful user flows that span more than one user story
**Scope**: universal

---

## Overview

The User Journey Testing Standard defines the **TESTPLAN** format, which makes connected, sequential user journeys a first-class testing artifact. Where acceptance-criteria tests verify a single story in isolation, journey tests verify what AC tests cannot: **cross-story state continuity** — the chain of state that one step leaves behind for the next.

A journey is described once in a human-readable `TESTPLAN-NNN.md` and mapped one-to-one onto automated E2E tests through shared `T-NNN` identifiers, so the plan and the executable suite never drift apart.

## References

| Standard/Source | Content |
|----------------|---------|
| journey-test-assistant (skill) | Generates TESTPLAN and journey E2E skeletons |
| flow-based-testing | Flow archetypes that journeys instantiate |
| e2e-testing (option) | End-to-end execution layer journeys map onto |

---

## Guidelines

- Every project MUST have at least one `TESTPLAN-NNN.md` documenting the main user journey.
- TESTPLAN steps MUST be sequential and stateful — each step depends on prior state.
- Every TESTPLAN MUST define personas before test steps.
- TESTPLAN and automated E2E tests MUST use the same `T-NNN` identifiers.
- Journey E2E tests MUST skip gracefully when the environment is unavailable.
- Journey tests cover what AC tests cannot: cross-story state continuity.

---

## TESTPLAN Format

- **File naming**: `TESTPLAN-NNN-<project-slug>.md`
- **Location**: `test-plans/`

### Required Sections

| Section | Description | Format |
|---------|-------------|--------|
| **Personas** | Define all test actors with their role and permissions | `\| Actor \| Role \| Key Permissions \|` |
| **Environment** | List environment prerequisites and verification commands | — |
| **Test Groups** | `T-NNN` numbered test groups with a sequential dependency chain | — |
| **Execution Order** | Dependency diagram showing `T-NNN → T-NNN` relationships | — |

### Step Markers

| Marker | Meaning |
|--------|---------|
| `[UI]` | Browser-based action, verify visually |
| `[API]` | `curl` / API client verification |
| `[CHECK]` | Expected result to confirm |
| `[SKIP-if]` | Conditional skip with reason |
| `★` | High-risk step requiring confirmation |

### Step Format

Each step declares:

- **step_id** — `T-NNN-M` (group-step format)
- **operation** — what to do, annotated with a `[MARKER]`
- **expected_result** — what should happen
- **precondition** — state from a previous `T-NNN` that must be satisfied
- **depends_on** — comma-separated `T-NNN` identifiers

---

## Automation Mapping

- **Principle**: every `T-NNN` group maps to a `describe()` block; every step maps to an `it()`.
- **File pattern**: `*.journey.spec.ts` or `*.journey.e2e.test.ts`.
- **Shared state**: journey tests MUST use shared `let` variables across `it()` blocks so each step builds on previous results.
- **Skip strategy**: guard with `describe.skipIf(!BASE_URL)` for environment-dependent tests.

---

## Journey Categories

| ID | Description | Required For |
|----|-------------|--------------|
| `platform-admin-journey` | Platform admin setup: login → org → project → pipeline | enterprise, saas |
| `member-journey` | Org member: join → project access → pipeline view | enterprise, saas |
| `dev-journey` | Developer: new project → spec → pipeline → artifact | all |

---

## Rules

| Rule | Trigger | Instruction | Priority |
|------|---------|-------------|----------|
| `testplan-required` | Creating a new project | Generate `TESTPLAN-001.md` with personas, environment, and main journey steps before writing code | required |
| `journey-before-code` | Starting project implementation | Define the user journey test plan first; journey tests act as living acceptance criteria | recommended |
| `sequential-state` | Writing journey E2E tests | Use shared state variables (`let token, orgSlug, projectSlug`) so each step builds on previous results | required |
| `graceful-skip` | Writing journey E2E tests | Guard with `describe.skipIf(!process.env.JOURNEY_BASE_URL)` so tests are skipped in unit CI | required |
| `t-nnn-alignment` | Writing any E2E test | Reference `T-NNN` identifiers from TESTPLAN in test descriptions for traceability | recommended |
| `persona-first` | Writing TESTPLAN | Define all user personas before writing any test steps | required |
| `dependency-chain` | Writing TESTPLAN | Each test group must declare its `depends_on` list so execution order is explicit | required |
