# Create Custom Methodology Guide

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/methodology-system/create-methodology.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-12

---

## Overview

This guide helps you create custom development methodologies for your team or project. Custom methodologies are stored in `.standards/methodologies/` and follow the same YAML schema as built-in methodologies.

---

## Interactive Creation Wizard

Use `/methodology create` to start the interactive wizard:

### Step 1: Basic Information

```
╔════════════════════════════════════════════════╗
║         Create Custom Methodology              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  What is the name of your methodology?         ║
║  > My Team Workflow                            ║
║                                                ║
║  Brief description:                            ║
║  > Our iterative development process with      ║
║  > planning and review phases                  ║
║                                                ║
║  ID (auto-generated): my-team-workflow         ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### Step 2: Define Phases

```
╔════════════════════════════════════════════════╗
║         Define Phases (1/?)                    ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Phase 1:                                      ║
║  ─────────────────────────────────────         ║
║  Name: Planning                                ║
║  Description: Plan the approach                ║
║  Duration estimate: 15-30 minutes              ║
║  Emoji: 📋                                     ║
║                                                ║
║  Checklist items (one per line):               ║
║  Prefix with * for required items              ║
║  ─────────────────────────────────────         ║
║  * Requirements understood                     ║
║  * Design approach reviewed                    ║
║  Dependencies identified                       ║
║                                                ║
║  What triggers exit from this phase?           ║
║  > User confirms planning complete             ║
║                                                ║
║  Next phase after exit?                        ║
║  > Implementation                              ║
║                                                ║
║  [Add another phase] [Done with phases]        ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### Step 3: Configure Checkpoints

```
╔════════════════════════════════════════════════╗
║         Configure Checkpoints                  ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Select checkpoint reminders:                  ║
║  ─────────────────────────────────────         ║
║  [x] Remind at phase transitions               ║
║  [x] Warn after 3 skipped check-ins            ║
║  [ ] Remind after 200+ lines changed           ║
║  [ ] Remind after 30 minutes without commit    ║
║                                                ║
║  Reminder intensity:                           ║
║  ( ) Suggest - gentle reminders                ║
║  (•) Warning - more prominent                  ║
║  ( ) Strict - block until addressed            ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### Step 4: Review and Save

```
╔════════════════════════════════════════════════╗
║         Review Methodology                     ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Name: My Team Workflow                        ║
║  ID: my-team-workflow                          ║
║                                                ║
║  Phases:                                       ║
║  ─────────────────────────────────────         ║
║  1. 📋 Planning                                ║
║     └─ Checklist: 3 items (2 required)         ║
║  2. 💻 Implementation                          ║
║     └─ Checklist: 4 items (3 required)         ║
║  3. 👀 Review                                  ║
║     └─ Checklist: 3 items (2 required)         ║
║                                                ║
║  Checkpoints: 2 active                         ║
║  Intensity: Warning                            ║
║                                                ║
║  [Save] [Edit] [Cancel]                        ║
║                                                ║
╚════════════════════════════════════════════════╝

Methodology created!

Saved to: .standards/methodologies/my-team-workflow.methodology.yaml

To activate: /methodology switch my-team-workflow
```

---

## Manual Creation

You can also create a methodology file manually:

### 1. Create the Directory

```bash
mkdir -p .standards/methodologies
```

### 2. Create the YAML File

Create `.standards/methodologies/my-workflow.methodology.yaml`:

```yaml
$schema: "https://raw.githubusercontent.com/anthropics/universal-dev-standards/main/methodologies/methodology-schema.json"
id: my-workflow
name: My Custom Workflow
nameZh: 我的自訂工作流
version: 1.0.0
description: A custom development workflow for our team

phases:
  - id: plan
    name: Planning
    nameZh: 規劃
    description: Plan the implementation approach
    duration: "15-30 minutes"
    emoji: "📋"
    checklist:
      - id: requirements-clear
        text: Requirements are clearly understood
        textZh: 需求已清楚理解
        required: true
      - id: design-reviewed
        text: Design approach reviewed with team
        textZh: 設計方法已與團隊審查
        required: false
    triggers:
      entry:
        - condition: feature_start
      exit:
        - condition: user_confirms_plan_complete
          nextPhase: implement
    guidance:
      prompt: |
        ## Planning Phase

        Before implementation, ensure:
        {{ checklist | format_checklist }}

  - id: implement
    name: Implementation
    nameZh: 實作
    description: Write the code
    duration: "Variable"
    emoji: "💻"
    checklist:
      - id: follows-patterns
        text: Code follows team patterns
        required: true
      - id: tests-written
        text: Tests written alongside code
        required: true
    triggers:
      entry:
        - condition: plan_complete
      exit:
        - condition: implementation_complete
          nextPhase: review
    guidance:
      prompt: |
        ## Implementation Phase

        Writing code for: {{feature_description}}

        {{ checklist | format_checklist }}

  - id: review
    name: Review
    nameZh: 審查
    description: Self-review and prepare for PR
    duration: "15-30 minutes"
    emoji: "👀"
    checklist:
      - id: self-reviewed
        text: Code self-reviewed
        required: true
      - id: tests-pass
        text: All tests pass
        required: true
      - id: docs-updated
        text: Documentation updated
        required: false
    triggers:
      entry:
        - condition: implementation_complete
      exit:
        - condition: ready_for_pr
          nextPhase: done

  - id: done
    name: Done
    nameZh: 完成
    description: Ready for PR
    emoji: "✅"
    checklist: []
    triggers:
      entry:
        - condition: ready_for_pr
      exit: []

checkpoints:
  - id: phase-complete
    trigger: phase_transition
    intensity: suggest
    action: "Phase complete. Consider committing."

commands:
  - name: workflow
    description: Start team workflow
    usage: "/workflow [feature]"
    action: start_workflow

aiGuidance:
  autoDetect: true
  proactiveReminders: true
  contextKeywords:
    - "team workflow"
    - "our process"
```

### 3. Activate the Methodology

```bash
/methodology switch my-workflow
```

Or update manifest manually:

```json
// .standards/manifest.json
{
  "methodology": {
    "active": "my-workflow"
  }
}
```

---

## Schema Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (lowercase, hyphens) |
| `name` | string | Display name |
| `version` | string | Semantic version |
| `phases` | array | At least one phase required |

### Phase Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Phase identifier |
| `name` | string | Yes | Display name |
| `description` | string | Yes | What happens in this phase |
| `checklist` | array | No | Items to verify |
| `triggers` | object | No | Entry/exit conditions |
| `guidance` | object | No | AI prompts |
| `duration` | string | No | Estimated duration |
| `emoji` | string | No | Visual indicator |

### Checklist Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Item identifier |
| `text` | string | Yes | Item description |
| `required` | boolean | No | Must complete to proceed |
| `textZh` | string | No | Chinese translation |

### Trigger Fields

| Field | Type | Description |
|-------|------|-------------|
| `condition` | string | Trigger condition |
| `fromPhase` | string | Required previous phase |
| `nextPhase` | string | Target phase after trigger |

---

## Best Practices

### 1. Keep Phases Focused

Each phase should have a clear, single purpose. If a phase has more than 5-6 checklist items, consider splitting it.

### 2. Use Meaningful IDs

```yaml
# Good
id: code-review
id: integration-test

# Avoid
id: phase1
id: step-a
```

### 3. Make Checklists Actionable

```yaml
# Good
text: Tests cover edge cases
text: Error handling implemented

# Avoid
text: Code is good
text: Everything works
```

### 4. Provide Helpful Guidance

Include practical tips in your phase guidance:

```yaml
guidance:
  prompt: |
    ## Review Phase

    Focus areas:
    - Security vulnerabilities
    - Performance implications
    - API contract changes

    {{ checklist | format_checklist }}
```

### 5. Consider Localization

Always provide `nameZh`, `textZh`, `promptZh` for bilingual teams.

---

## Examples

### Hotfix Workflow

```yaml
id: hotfix
name: Hotfix Workflow
phases:
  - id: reproduce
    name: Reproduce Issue
    checklist:
      - id: issue-reproduced
        text: Issue reproduced locally
        required: true
  - id: fix
    name: Apply Fix
    checklist:
      - id: minimal-fix
        text: Fix is minimal and targeted
        required: true
  - id: verify
    name: Verify Fix
    checklist:
      - id: issue-resolved
        text: Original issue is resolved
        required: true
      - id: no-regression
        text: No regressions introduced
        required: true
```

### Feature Flag Workflow

```yaml
id: feature-flag
name: Feature Flag Development
phases:
  - id: design-flag
    name: Design Flag
    checklist:
      - id: flag-named
        text: Flag has descriptive name
        required: true
  - id: implement-behind-flag
    name: Implement Behind Flag
    checklist:
      - id: default-off
        text: Flag defaults to off
        required: true
  - id: gradual-rollout
    name: Gradual Rollout
    checklist:
      - id: metrics-monitored
        text: Metrics being monitored
        required: true
  - id: cleanup
    name: Cleanup
    checklist:
      - id: flag-removed
        text: Flag code removed after full rollout
        required: true
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial creation guide |
