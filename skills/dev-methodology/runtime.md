# Methodology Runtime Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/dev-methodology/runtime.md)

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

**Version**: 1.0.0
**Last Updated**: 2026-01-12

---

## Overview

This document defines how AI assistants should behave when a development methodology is active. It provides guidance for phase tracking, checkpoint handling, and user interaction.

---

## AI Behavior Specification

### 1. Context Awareness

When a methodology is active, the AI should:

- **Always know the current phase**
- **Display phase indicator in responses**
- **Suggest phase-appropriate actions**

#### Phase Status Display

Include methodology status at the start of relevant responses:

```
┌────────────────────────────────────────────────┐
│ 📋 Methodology: TDD                             │
│ 📍 Phase: 🔴 RED (writing failing test)         │
│ ⏱️  Duration: 3 minutes                         │
└────────────────────────────────────────────────┘
```

### 2. Proactive Guidance

Provide context-appropriate suggestions based on current phase:

```markdown
**Current Phase: 🔴 RED (TDD)**

You're writing a failing test for: user login validation

**Next step**: Write a test that describes the expected behavior.

Would you like me to:
1. Generate a test skeleton
2. Show TDD best practices for this scenario
3. Continue with your manual approach
```

### 3. Phase Transition Detection

Monitor for conditions that indicate phase transitions:

| Signal | Transition |
|--------|------------|
| Test execution fails | RED → ready for GREEN |
| All tests pass | GREEN → ready for REFACTOR |
| User confirms refactor done | REFACTOR → next cycle or DONE |
| Time elapsed exceeds phase duration | Display reminder |
| Git commit detected | Reset phase timer |

### 4. Checkpoint Behavior

When checkpoint conditions are triggered, display checkpoint notification:

```
┌────────────────────────────────────────────────┐
│ 🔔 Methodology Checkpoint                       │
├────────────────────────────────────────────────┤
│ GREEN phase completed                          │
│                                                │
│ Checklist Status:                              │
│   ✅ Minimum code written                      │
│   ✅ Test passes                               │
│   ✅ All other tests pass                      │
│   ⬜ (Optional) Consider edge cases            │
│                                                │
│ Change Statistics:                             │
│   - Files: 3                                   │
│   - Added: 45 lines                            │
│   - Deleted: 2 lines                           │
│                                                │
│ Suggested commit:                              │
│   test(auth): add email validation test        │
│   feat(auth): implement email validation       │
│                                                │
│ Options:                                       │
│   [1] Commit now (show git commands)           │
│   [2] Continue to REFACTOR phase               │
│   [3] View detailed changes                    │
└────────────────────────────────────────────────┘
```

### 5. Skip Tracking

Track consecutive skips and warn appropriately:

| Skip Count | Action |
|------------|--------|
| 1-2 | No action, record skip |
| 3 | Warning notification |
| 4+ | Strong warning, recommend commit |

#### Skip Warning Display

```
┌────────────────────────────────────────────────┐
│ ⚠️ Skip Warning                                 │
├────────────────────────────────────────────────┤
│ You have skipped check-in 3 times consecutively│
│                                                │
│ Current accumulated changes:                   │
│   - Files: 8                                   │
│   - Added: 320 lines                           │
│   - Deleted: 45 lines                          │
│                                                │
│ Recommendation: Commit your changes now to     │
│ avoid losing work and maintain atomic commits. │
│                                                │
│ [1] Commit now  [2] Skip anyway  [3] View diff │
└────────────────────────────────────────────────┘
```

---

## Methodology Detection

### Automatic Detection

AI should detect methodology context from:

1. **Manifest Configuration**
   ```json
   // .standards/manifest.json
   { "methodology": { "active": "tdd" } }
   ```

2. **Keyword Detection**
   - "Let's use TDD for this"
   - "Write a failing test first"
   - "Given-When-Then"
   - "Create a spec for this change"

3. **Command Invocation**
   - `/tdd`, `/bdd`, `/sdd`, `/atdd`
   - `/methodology switch <id>`

### Loading Methodology Definition

```
Methodology Loading Priority:
1. Custom: .standards/methodologies/{id}.methodology.yaml
2. Built-in: methodologies/{id}.methodology.yaml
3. Fallback: Generic phase-less workflow
```

---

## Checklist Management

### Display Format

```markdown
### Phase Checklist

**Required:**
- [ ] Test describes expected behavior
- [x] Test name is clear
- [ ] Test follows AAA pattern

**Optional:**
- [ ] Consider edge cases
```

### Tracking

- Update checklist items based on user actions and code analysis
- Block phase transition if required items incomplete (strict mode)
- Log completion for audit trail

---

## Integration Points

### With Git

- Detect commits to reset phase timers
- Suggest commit messages based on methodology
- Include spec/story references automatically

### With Test Runner

- Detect test pass/fail to trigger phase transitions
- Report test coverage relevant to current phase

### With Code Review

- Add methodology-specific review checks
- Reference active methodology in PR description

---

## Error Handling

### Methodology Not Found

```
⚠️ Methodology 'custom-workflow' not found.

Available methodologies:
- tdd (built-in)
- bdd (built-in)
- sdd (built-in)
- atdd (built-in)

Use `/methodology list` to see all options.
```

### Invalid Phase Transition

```
⚠️ Cannot transition from RED to REFACTOR.

TDD requires: RED → GREEN → REFACTOR

Current phase: RED
Valid next phases: GREEN

Complete the RED phase checklist first.
```

---

## Performance Considerations

- Cache methodology definitions after first load
- Only reload when manifest changes
- Minimize checkpoint frequency to avoid interruption
- Batch git status checks

---

## Localization

All user-facing text should use the appropriate language field:

```yaml
# If user's locale is zh-TW
name: nameZh || name
description: descriptionZh || description
prompt: promptZh || prompt
```

---

## 6. Prerequisite Checking / 前置步驟檢查

Before executing any slash command, follow the prerequisite checking protocol
defined in [`prerequisite-check.md`](./prerequisite-check.md).

**Priority**: This check runs BEFORE phase tracking and methodology detection.

**Integration with Phase Tracking**:
- If user is in an active methodology session, use the methodology's phase
  sequence as the primary prerequisite source
- If no active methodology, use [`workflow-prerequisites.yaml`](../../methodologies/workflow-prerequisites.yaml) as fallback
- If multiple workflows contain the command, only ONE needs to be satisfied

**Reference**: See [`prerequisite-check.md`](./prerequisite-check.md) for the full algorithm, evidence detection rules, and user prompt templates.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-12 | Add §6 Prerequisite Checking integration |
| 1.0.0 | 2026-01-12 | Initial runtime specification |
