---
description: [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-all — Full Forward Derivation | 完整正向推演

Derive all test structures (BDD + TDD + optionally ATDD) from an approved SDD specification.

從已核准的 SDD 規格推演所有測試結構（BDD + TDD + 可選 ATDD）。

## Workflow | 工作流程

```
SPEC-XXX.md ──► /derive-bdd ──► /derive-tdd ──► [/derive-atdd] ──► Report
```

1. **Parse** the SDD spec and validate it is approved
2. **Run** `/derive-bdd` to generate Gherkin scenarios
3. **Run** `/derive-tdd` to generate test skeletons
4. **Optionally** run `/derive-atdd` for acceptance test tables
5. **Generate** `DERIVATION-REPORT.md` summarizing all outputs

## Output Files | 輸出檔案

| File | Content | 內容 |
|------|---------|------|
| `features/SPEC-XXX.feature` | BDD Gherkin scenarios | BDD Gherkin 場景 |
| `tests/SPEC-XXX.test.ts` | TDD test skeletons | TDD 測試骨架 |
| `DERIVATION-REPORT.md` | Summary with statistics | 摘要與統計 |

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-all specs/SPEC-001.md` | Full derivation from spec | 從規格完整推演 |
| `/derive-all` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

## Typical SDD Workflow | 典型 SDD 工作流程

```bash
/sdd user-authentication          # Step 1: Create spec
/sdd review specs/SPEC-001.md     # Step 2: Review
/derive-all specs/SPEC-001.md     # Step 3: Derive tests
# Step 4: Implement — fill [TODO] markers
```

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- Sub-commands: [/derive-bdd](./derive-bdd.md), [/derive-tdd](./derive-tdd.md), [/derive-atdd](./derive-atdd.md)
