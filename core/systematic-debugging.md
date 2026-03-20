# Systematic Debugging Workflow

> **Language**: English | [繁體中文](../locales/zh-TW/core/systematic-debugging.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: All software projects using AI-assisted development
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — systematic-debugging (MIT)

---

## Purpose

Define a structured, four-phase debugging workflow that prevents the common anti-pattern of "guess and fix" cycles. This standard enforces root cause analysis before any fix attempt and includes the **3-Strike Rule** to catch architectural issues early.

本標準定義結構化的四階段除錯工作流，防止常見的「猜測修復」反模式。強制要求在嘗試修復前先進行根因分析，並包含 **3-Strike Rule** 以提早發現架構問題。

---

## Glossary

| Term | Definition |
|------|-----------|
| Root Cause | The fundamental reason a defect exists, not merely the symptom |
| 3-Strike Rule | After 3 consecutive failed fix attempts, suspect an architectural issue |
| Backward Tracing | Tracing from error symptom back to the originating source |
| Component Boundary | The interface between two modules or subsystems |

---

## Core Principle — The Iron Rule

> **Never skip root cause analysis to jump directly to a fix.**

禁止跳過根因分析直接修復。

If you catch yourself saying "quick fix", "just try", or "should work now" — **stop** and return to Phase 1.

---

## The Four Phases

### Phase 1: Root Cause Investigation（根因調查）

Analyze error messages and track recent changes to form an initial hypothesis.

1. **Read the error carefully** — identify the exact location and type of failure
2. **Track recent changes** — use `git log`, `git diff`, `git blame` to find what changed
3. **Add diagnostics at component boundaries** — insert logging / breakpoints at interfaces between modules
4. **Record observations** — document what you see and form an initial hypothesis

分析錯誤訊息並追蹤最近變更，形成初步假設。

### Phase 2: Pattern Analysis（模式分析）

Compare the failing code against similar working implementations.

1. **Search for similar successful implementations** in the codebase
2. **Identify differences** between the failing and working code
3. **Check for missing preconditions** — initialization, configuration, ordering

比對失敗程式碼與類似的成功實作，找出差異。

### Phase 3: Hypothesis Testing（假設測試）

Validate your hypothesis with minimal, isolated changes.

1. **Make the smallest possible change** to test your hypothesis
2. **Change only one variable at a time** — never make multiple changes simultaneously
3. **Record each attempt** — document the hypothesis, the change, and the result

以最小化修改驗證假設，每次只改一個變數。

### Phase 4: Fix Implementation（修復實作）

Only implement the fix after confirming the root cause.

1. **Confirm the root cause** is validated by your hypothesis testing
2. **Implement the fix** with proper error handling
3. **Run the full test suite** — ensure no regressions
4. **Verify the fix doesn't introduce new issues**

確認根因後才實作修復，並執行完整測試套件驗證。

---

## The 3-Strike Rule

> After **3 consecutive failed fix attempts**, stop guessing and question the architectural design.

連續 3 次修復失敗後，必須停止猜測並質疑架構設計。

When the 3-Strike Rule triggers:

1. Step back from the specific bug
2. Review the overall module/component design
3. Consider whether the architecture supports the intended behavior
4. Look for design flaws that make the bug class possible
5. Consider refactoring before attempting another fix

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| SD-001 | 3 consecutive failed fixes | Stop guessing, question architectural design | Critical |
| SD-002 | Phrases like "quick fix", "just try", "should work now" | Return to Phase 1 root cause analysis | High |
| SD-003 | Multi-component interaction error | Add diagnostic observations at every component boundary | Medium |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Harmful |
|-------------|-----------------|
| Shotgun debugging | Random changes waste time and may introduce new bugs |
| Copy-paste fix from Stack Overflow | Without understanding, the fix may not address the actual root cause |
| Suppressing the error | Hiding symptoms doesn't fix the problem |
| "It works on my machine" | Environment differences are clues, not dismissals |

---

## Examples

### Good: Structured Debugging

```
Phase 1: TypeError at line 42 in parser.ts — reading property of undefined
         git log shows parser.ts was modified 2 commits ago
         Added console.log at module boundary → input is null when empty array passed

Phase 2: Similar parser in legacy/ handles empty arrays with early return

Phase 3: Added early return for empty array → test passes
         Changed only one thing, recorded result

Phase 4: Implemented fix, ran full test suite (47/47 pass), no regressions
```

### Bad: Guess-and-Fix

```
"Hmm, let me try adding a null check... nope.
 Maybe wrapping in try-catch... still broken.
 Let me just change the type to any... 🤦"
```

---

## References

- **Superpowers**: [systematic-debugging](https://github.com/obra/superpowers) (MIT)
- **The Pragmatic Programmer**: Chapter on Debugging
- **Debugging by Thinking**: A Multidisciplinary Approach (Robert Charles Metzger)
