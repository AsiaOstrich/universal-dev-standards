---
description: [UDS] Derive ATDD acceptance tests from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-atdd — Derive ATDD Acceptance Tests | 推演 ATDD 驗收測試

Derive ATDD acceptance test tables from an approved SDD specification document.

從已核准的 SDD 規格文件推演 ATDD 驗收測試表格。

## Workflow | 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate acceptance.md ──► Review
```

1. **Read** the SDD spec and extract acceptance criteria
2. **Map** each AC to an acceptance test table (Given-When-Then columns)
3. **Generate** `acceptance.md` with test data and expected results
4. **Output** derivation summary

## Output Format | 輸出格式

```markdown
# Acceptance Tests: SPEC-001

## AC-1: [Description]

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | [precondition] | [action] | [expected] | ⬜ |
| 2 | [precondition] | [action] | [expected] | ⬜ |
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-atdd specs/SPEC-001.md` | Derive ATDD from specific spec | 從特定規格推演 ATDD |
| `/derive-atdd` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

> **Note**: BDD scenarios already serve as executable acceptance tests. `/derive-atdd` is for specialized manual testing workflows.

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
