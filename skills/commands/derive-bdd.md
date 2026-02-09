---
description: [UDS] Derive BDD Gherkin scenarios from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-bdd — Derive BDD Scenarios | 推演 BDD 場景

Derive Gherkin `.feature` files from an approved SDD specification document.

從已核准的 SDD 規格文件推演 Gherkin `.feature` 檔案。

## Workflow | 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .feature ──► Review
```

1. **Read** the SDD spec and extract acceptance criteria
2. **Map** each AC to a Gherkin Scenario (1:1)
3. **Generate** `.feature` file with `@SPEC-XXX` and `@AC-N` tags
4. **Output** derivation summary

## Output Format | 輸出格式

```gherkin
@SPEC-001
Feature: [Feature Name]

  @AC-1
  Scenario: [AC-1 description]
    Given [context]
    When [action]
    Then [expected result]
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-bdd specs/SPEC-001.md` | Derive BDD from specific spec | 從特定規格推演 BDD |
| `/derive-bdd` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
