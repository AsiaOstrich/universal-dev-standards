---
name: skill-builder
description: [UDS] Identify repeated processes and build Skills with the right development depth.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "[process description | 流程描述]"
---

# /skill-builder Command

The `/skill-builder` command guides you from "I keep doing this manually" to
"I have a properly-built Skill", applying the right amount of process
governance along the way.

It is backed by the `skill-builder` skill (`skills/skill-builder/SKILL.md`).

## Usage

```bash
/skill-builder [process description]
```

## When to Use

- You have manually performed the same multi-step process 3+ times.
- A teammate asks "how do we do X?" for the 3rd time.
- You hacked together an ad-hoc skill and now want to formalize it.

## Path Selection

| Path | Trigger | Action |
|------|---------|--------|
| Simple | ≤7 steps, no branching, <3 standards, no source-code output | Fill a Skill Brief, create `SKILL.md` directly |
| Complex | any of the above is exceeded | Create an XSPEC first (`/sdd`), then build |
| Delta | modifying an existing Skill | Append `## MODIFIED` / `## ADDED`, bump version |

## Implementation Note for AI

When the user invokes `/skill-builder`:
1. Read `skills/skill-builder/SKILL.md` for the full decision tree, placement
   rules, workflow steps, and output checklist.
2. Walk the user through path selection (Simple / Complex / Delta) and produce
   the `SKILL.md` (plus `SKILL-CANDIDATES.md` update) per that skill.
