---
name: journey-test
description: [UDS] Generate coherent user journey test plans (TESTPLAN) and E2E skeletons from a project description.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[project description | --analyze | --archetype A1|A2|A3]"
status: stable
---

# /journey-test Command

The `/journey-test` command turns a project description into a coherent user
journey test plan (`TESTPLAN-NNN.md`) plus matching E2E skeletons, so a new
project has a complete, ordered test journey from day one.

It is backed by the `journey-test-assistant` skill
(`skills/journey-test-assistant/SKILL.md`).

## Usage

```bash
/journey-test [project description]
/journey-test --analyze
/journey-test --archetype A1|A2|A3
```

## What It Produces

| Output | Description |
|--------|-------------|
| `TESTPLAN-NNN.md` | Ordered journey steps (T-000 reset → T-001 login → T-010 core flows) with personas, environment, and a dependency graph |
| `*.journey.spec.ts` | E2E skeletons aligned to each TESTPLAN step |

## Difference from `/e2e`

- `/e2e` generates E2E skeletons from individual BDD scenarios.
- `/journey-test` plans a **connected, cross-feature journey** (a sequence of
  steps with ordering and dependencies) and then generates the skeletons.

## Implementation Note for AI

When the user invokes `/journey-test`:
1. Read `skills/journey-test-assistant/SKILL.md` for the full workflow,
   TESTPLAN format (T-NNN), personas, environment, and archetype rules.
2. Follow that skill's workflow to produce the TESTPLAN and E2E skeletons.
3. Respect the skill's `allowed-tools` and stop points.
