# Change Batching Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/change-batching-standards.md)

**Applicability**: All software projects using automated development pipelines
**Scope**: universal

---

## Overview

Change Batching Standards define how pending changes should be accumulated, evaluated, and merged into atomic commits. This standard addresses the gap between making individual changes and committing them, providing rules for when and how to batch multiple related changes into cohesive units.

## References

| Standard/Source | Content |
|----------------|---------|
| SWEBOK v4.0 Chapter 6 | Software Configuration Management |
| ISO/IEC 12207 | Configuration Management Process |
| Continuous Delivery (Jez Humble) | Small batch sizes principle |
| Lean Software Development | Batch size optimization |

---

## Pending Changes State Machine

### State Definitions

```
┌─────────┐    threshold met    ┌─────────┐    merge success    ┌─────────┐
│ PENDING │───────────────────▶│  READY  │────────────────────▶│ MERGED  │
│ 等待中   │                    │ 就緒     │                     │ 已合併   │
└─────────┘                    └─────────┘                     └─────────┘
     ▲                              │                               │
     │ reset                        │ merge failure                 │
     │                              ▼                               ▼
     │                        ┌─────────┐                    ┌──────────┐
     └────────────────────────│ FAILED  │                    │ ARCHIVED │
                              │ 失敗     │                    │ 已歸檔    │
                              └─────────┘                    └──────────┘
```

### State Transitions

| From | To | Trigger | Action |
|------|----|---------|--------|
| PENDING | PENDING | New change added | Increment counters, re-evaluate thresholds |
| PENDING | READY | Threshold met | Prepare merge batch, run pre-merge validation |
| READY | MERGED | Merge succeeds | Create commit, clear batch, archive |
| READY | FAILED | Merge fails | Log failure, preserve changes |
| FAILED | PENDING | Reset | Re-queue changes, clear failure state |
| MERGED | ARCHIVED | Post-commit | Record batch metadata for audit |

---

## Threshold Strategies

### Threshold Types

| Strategy | Parameter | Default | Description |
|----------|-----------|---------|-------------|
| **Count** | `maxChanges` | 5 | Merge after N individual changes accumulated |
| **Score** | `maxScore` | 10 | Merge when cumulative change score ≥ M |
| **Time** | `maxAge` | 30m | Merge when oldest pending change exceeds TTL |
| **Manual** | — | — | Merge only on explicit user request |

### Change Scoring

Each change is assigned a score based on complexity:

| Change Type | Score | Example |
|------------|-------|---------|
| Trivial | 1 | Typo fix, whitespace, comment update |
| Minor | 2 | Single function change, variable rename |
| Standard | 3 | New function, modified logic flow |
| Complex | 5 | Multi-file change, API modification |
| Critical | 8 | Schema change, breaking change |

### Threshold Configuration

```json
{
  "batching": {
    "strategy": "count",
    "maxChanges": 5,
    "maxScore": 10,
    "maxAge": "30m",
    "fallbackStrategy": "time"
  }
}
```

### Composite Thresholds

Multiple thresholds can be combined with OR logic (first threshold met triggers merge):

```
Merge when: changes ≥ 5 OR score ≥ 10 OR age ≥ 30m
```

---

## Merge Rules

### Priority Order

1. **Same-spec affinity**: Changes referencing the same SPEC-ID merge together first
2. **Same-file grouping**: Changes to the same file(s) merge together
3. **Dependency order**: Changes with dependencies merge in dependency order
4. **Chronological**: Within same priority, merge in creation order

### Conflict Resolution

| Conflict Type | Resolution Strategy | Fallback |
|--------------|-------------------|----------|
| Same line, same file | Latest change wins | Manual resolution |
| Overlapping functions | Semantic merge if possible | Manual resolution |
| Dependency conflict | Resolve dependency first | Reject batch, split |

### Pre-Merge Validation

Before merging a batch, validate:

| Check | Required | Description |
|-------|----------|-------------|
| All tests pass | Yes | Run test suite against merged state |
| No lint errors | Yes | Run linter on merged files |
| No conflicts | Yes | Verify clean merge without conflicts |
| AC coverage maintained | Recommended | AC coverage not decreased |

---

## Atomicity Guarantees

### All-or-Nothing Principle

A batch merge MUST be atomic:

- **Success**: ALL changes in the batch are committed together
- **Failure**: NO changes from the batch are committed; all revert to PENDING

### Atomicity Rules

| Rule | Description |
|------|-------------|
| **Single commit** | Each merged batch produces exactly one commit |
| **No partial merge** | If any change in the batch fails validation, the entire batch is rejected |
| **Rollback support** | Failed merges MUST restore all changes to PENDING state |
| **Isolation** | Batch merge MUST NOT affect changes outside the batch |

---

## Rollback Mechanism

### Failure Handling

When a batch merge fails:

1. **Log failure**: Record which changes were in the batch and what failed
2. **Preserve changes**: All changes return to PENDING state
3. **Diagnose**: Identify the failing change(s)
4. **Options**:
   - Fix the failing change and retry
   - Remove the failing change and merge the rest
   - Split the batch into smaller groups

### Rollback Triggers

| Trigger | Action | Automatic? |
|---------|--------|-----------|
| Test failure | Reject entire batch | Yes |
| Lint error | Reject entire batch | Yes |
| Merge conflict | Reject and notify | Yes |
| Build failure | Reject entire batch | Yes |
| Manual rejection | Return to PENDING | No |

---

## Batch Commit Message Format

Batched commits SHOULD use a structured message format:

```
<type>(<scope>): <summary of batch>

Changes included:
- <change 1 description>
- <change 2 description>
- <change 3 description>

Spec: SPEC-XXX (if applicable)
Batch: N changes, score M
```

### Example

```
feat(auth): implement login validation and error handling

Changes included:
- Add email format validation
- Add password strength check
- Add error message display
- Add rate limiting for failed attempts

Spec: SPEC-001
Batch: 4 changes, score 11
```

---

## Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Infinite accumulation | Massive, unreviewable commits | Set reasonable thresholds |
| Mixing unrelated changes | Hard to review, hard to revert | Group by spec or feature |
| Partial commits | Broken intermediate states | Enforce atomicity |
| Ignoring failures | Broken code enters codebase | Always validate before merge |
| No rollback plan | Lost changes on failure | Preserve changes on failure |

---

## Best Practices

### Do's

- ✅ Set explicit thresholds for automatic batching
- ✅ Group changes by specification or feature
- ✅ Validate the entire batch before committing
- ✅ Use atomic commits (all-or-nothing)
- ✅ Preserve changes on failure
- ✅ Log batch decisions for audit

### Don'ts

- ❌ Accumulate changes indefinitely
- ❌ Mix unrelated changes in one batch
- ❌ Commit partial batches
- ❌ Ignore validation failures
- ❌ Lose changes on merge failure

---

## Related Standards

- [Check-in Standards](checkin-standards.md) — Quality gates for commits
- [Pipeline Integration Standards](pipeline-integration-standards.md) — Pipeline automation
- [Commit Message Guide](commit-message-guide.md) — Commit message format

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial version — state machine, threshold strategies, atomicity guarantees |
