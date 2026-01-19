---
description: Derive all test structures (BDD, TDD, ATDD) from approved SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "<spec-file> [--lang <language>] [--framework <framework>] [--output-dir <dir>] [--dry-run]"
---

# Derive All Test Structures from Specification | 從規格推演完整測試結構

Generate complete test structures (BDD scenarios, TDD skeletons, ATDD acceptance tests) from approved SDD specification.

從已批准的 SDD 規格生成完整測試結構（BDD 場景、TDD 骨架、ATDD 驗收測試）。

## Workflow | 工作流程

```
┌─────────────────┐
│  Read SPEC      │
│  讀取規格        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse AC       │
│  解析驗收條件    │
└────────┬────────┘
         │
    ┌────┼────┬────────────┐
    │    │    │            │
    ▼    ▼    ▼            ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│ BDD  │ │ TDD  │ │ ATDD │ │ Summary  │
│.feat │ │.test │ │.md   │ │ Report   │
└──────┘ └──────┘ └──────┘ └──────────┘
```

## Anti-Hallucination Compliance | 反幻覺合規

**CRITICAL**: All outputs MUST strictly follow 1:1 AC mapping.

**關鍵**：所有輸出必須嚴格遵循 1:1 AC 對應。

```
Input:  SPEC with N Acceptance Criteria
Output:
  - Exactly N BDD Scenarios
  - Exactly N TDD Test Groups
  - Exactly N ATDD Test Tables

If any output count ≠ input count → VIOLATION
```

## Steps | 步驟

### 1. Read and Parse Specification | 讀取和解析規格

Read the approved specification and extract:
- SPEC metadata (ID, title, summary)
- All Acceptance Criteria
- AC format (GWT or bullet)

### 2. Generate BDD Scenarios | 生成 BDD 場景

Run `/derive-bdd` logic:
- Transform each AC to Gherkin scenario
- Apply @SPEC-XXX and @AC-N tags
- Output to `features/SPEC-XXX.feature`

### 3. Generate TDD Skeletons | 生成 TDD 骨架

Run `/derive-tdd` logic:
- Create describe blocks per AC
- Add AAA structure with TODOs
- Output to `tests/SPEC-XXX.test.{ext}`

### 4. Generate ATDD Tables | 生成 ATDD 表格

Run `/derive-atdd` logic:
- Create test table per AC
- Add step-by-step actions
- Output to `acceptance/SPEC-XXX-acceptance.md`

### 5. Generate Summary Report | 生成摘要報告

Create derivation summary:
- Files generated
- AC coverage map
- Next steps for implementation

## Output Structure | 輸出結構

```
generated/
├── features/
│   └── SPEC-001.feature        # BDD scenarios
├── tests/
│   └── SPEC-001.test.ts        # TDD skeletons
├── acceptance/
│   └── SPEC-001-acceptance.md  # ATDD test tables
└── DERIVATION-REPORT.md        # Summary report
```

### Derivation Report Format

```markdown
# Derivation Report for SPEC-001

**Source**: specs/SPEC-001.md
**Generated**: [timestamp]
**Generator**: /derive-all v1.0.0

## Summary

| Metric | Value |
|--------|-------|
| Acceptance Criteria | N |
| BDD Scenarios | N |
| TDD Test Groups | N |
| ATDD Test Tables | N |

## Generated Files

| File | Type | AC Coverage |
|------|------|-------------|
| features/SPEC-001.feature | BDD | AC-1, AC-2, AC-3 |
| tests/SPEC-001.test.ts | TDD | AC-1, AC-2, AC-3 |
| acceptance/SPEC-001-acceptance.md | ATDD | AC-1, AC-2, AC-3 |

## AC Traceability Matrix

| AC ID | BDD Scenario | TDD Test | ATDD Table |
|-------|--------------|----------|------------|
| AC-1 | ✓ Line 10 | ✓ Line 15 | ✓ AT-001 |
| AC-2 | ✓ Line 20 | ✓ Line 35 | ✓ AT-002 |
| AC-3 | ✓ Line 30 | ✓ Line 55 | ✓ AT-003 |

## Next Steps

1. [ ] Review generated BDD scenarios with stakeholders
2. [ ] Fill [TODO] sections in TDD skeletons
3. [ ] Execute ATDD acceptance tests manually
4. [ ] Implement step definitions for BDD
5. [ ] Start TDD Red-Green-Refactor cycle
```

## Parameters | 參數

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--lang` | Target language: ts, js, python, java, go | `typescript` |
| `--framework` | Test framework | `vitest` |
| `--output-dir` | Base output directory | `./generated` |
| `--dry-run` | Preview without creating files | `false` |

## Usage Examples | 使用範例

```bash
# Basic usage (all outputs)
/derive-all specs/SPEC-001.md

# With Python/pytest for TDD
/derive-all specs/SPEC-001.md --lang python --framework pytest

# Specify output directory
/derive-all specs/SPEC-001.md --output-dir ./qa/generated

# Preview without creating files
/derive-all specs/SPEC-001.md --dry-run
```

## Integration with Workflow | 與工作流程整合

After running `/derive-all`, the recommended workflow:

執行 `/derive-all` 後的建議工作流程：

```
┌──────────────────────────────────────────────────────────────────┐
│                    Post-Derivation Workflow                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Review BDD Scenarios                                         │
│     └─→ Use /bdd to refine with Three Amigos                    │
│                                                                  │
│  2. Fill TDD [TODO] Sections                                     │
│     └─→ Use /tdd to enter Red-Green-Refactor cycle              │
│                                                                  │
│  3. Execute ATDD Tests                                           │
│     └─→ Manual testing with acceptance tables                   │
│                                                                  │
│  4. Implement Step Definitions                                   │
│     └─→ Connect BDD scenarios to code                           │
│                                                                  │
│  5. Complete TDD Implementation                                  │
│     └─→ Make all tests pass                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Limitations | 限制

This command **CANNOT**:

此命令**無法**：

- Generate outputs beyond AC count
- Implement test logic automatically
- Run any of the generated tests
- Modify existing test files

## Reference | 參考

- Full skill guide: [forward-derivation](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../../core/forward-derivation-standards.md)
- Individual commands: [derive-bdd](./derive-bdd.md), [derive-tdd](./derive-tdd.md), [derive-atdd](./derive-atdd.md)
