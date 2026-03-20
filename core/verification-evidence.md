# Verification Evidence Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/verification-evidence.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: All AI-assisted development workflows
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## Purpose

Establish an "Iron Law" that no task can be claimed as complete without verification evidence. This standard prevents AI agents from hallucinating success and ensures every completion claim is backed by executable proof.

建立「鐵律」：無驗證證據不可聲稱完成。防止 AI 代理虛構成功結果，確保每個完成聲明都有可執行的證據支持。

---

## Glossary

| Term | Definition |
|------|-----------|
| Verification Evidence | A structured record of a verification command's execution and result |
| Iron Law | The absolute rule: no evidence = no completion claim |
| RED-GREEN Cycle | Proving a bug fix by showing the test fails before and passes after the fix |
| Exit Code | The numeric return value of a command (0 = success, non-zero = failure) |

---

## The Iron Law

> **No verification evidence = no completion claim.**

無驗證證據 = 不可聲稱完成。

An agent saying "it's done" is not evidence. The verification must be independently executable and produce observable output.

代理聲稱「已完成」不是證據。驗證必須是可獨立執行且產生可觀察輸出的。

---

## Evidence Format

Every verification must produce a structured evidence record:

```json
{
  "command": "pnpm test -- --filter core",
  "exit_code": 0,
  "output": "Tests: 47 passed, 0 failed\nDuration: 3.2s",
  "timestamp": "2026-03-20T14:30:00Z"
}
```

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes | The actual verification command executed |
| `exit_code` | number | Yes | Command exit code (0 = success) |
| `output` | string | Yes | Command output (truncated to 2000 chars, preserving key info) |
| `timestamp` | string | Yes | Execution time in ISO 8601 format |

---

## RED-GREEN Cycle

For bug fixes and regression tests, verification requires showing both the failure and the fix:

### Step 1: RED — Prove the Bug Exists

Run the test **before** the fix to confirm it fails:

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 1,
  "output": "FAIL: expected null to equal { name: 'test' }",
  "timestamp": "2026-03-20T14:25:00Z"
}
```

### Step 2: Apply the Fix

Make the code change.

### Step 3: GREEN — Prove the Fix Works

Run the test **after** the fix to confirm it passes:

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 0,
  "output": "PASS: 12 tests passed",
  "timestamp": "2026-03-20T14:28:00Z"
}
```

### Step 4: Record Both

The evidence record must include both RED and GREEN phases.

回歸測試必須展示 RED → GREEN 循環，兩個階段的證據都必須記錄。

---

## Trust Rules

| Rule | Description |
|------|-------------|
| Agent says "done" but no `verification_evidence` | Mark as **unverified** |
| `verification_evidence` exists but `exit_code ≠ 0` | Mark as **verification failed** |
| Multiple verification steps | **All** steps must pass |
| Agent provides evidence for wrong command | Mark as **unverified** |

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| VE-001 | Agent reports success without verification_evidence | Downgrade to `done_with_concerns` | Critical |
| VE-002 | `exit_code ≠ 0` in evidence | Mark verification failed, trigger fix loop | High |
| VE-003 | Bug fix without RED-GREEN cycle | Request both RED and GREEN evidence | High |
| VE-004 | Output exceeds 2000 chars | Truncate but preserve error messages and summary lines | Medium |

---

## Output Truncation Guidelines

When verification output exceeds 2000 characters:

1. **Keep**: Error messages, failure summaries, test counts, final status line
2. **Remove**: Verbose progress output, stack traces for passing tests, duplicate lines
3. **Mark truncation**: Add `[... truncated ...]` where content was removed

---

## Examples

### Good: Complete Evidence

```yaml
verification_evidence:
  - command: "pnpm test"
    exit_code: 0
    output: "Test Suites: 12 passed\nTests: 147 passed\nTime: 8.3s"
    timestamp: "2026-03-20T14:30:00Z"
  - command: "pnpm lint"
    exit_code: 0
    output: "No issues found"
    timestamp: "2026-03-20T14:30:05Z"
```

### Bad: No Evidence

```yaml
status: success
message: "I've completed the task and everything should work now."
# ❌ No verification_evidence — violates Iron Law
```

---

## References

- **Superpowers**: [verification-before-completion](https://github.com/obra/superpowers) (MIT)
- **Test-Driven Development**: RED-GREEN-REFACTOR cycle
- **Anti-Hallucination**: Complementary standard for preventing fabricated claims
