# Command Family Overview | 指令家族總覽

**Version**: 1.0.0
**Last Updated**: 2026-01-25

---

## Overview | 總覽

This document provides a comprehensive guide to the development methodology commands in Universal Development Standards. These commands support two independent methodology systems and an optional collaborative input method.

本文件提供 Universal Development Standards 開發方法論指令的完整指南。這些指令支援兩個獨立的方法論系統和一個可選的協作輸入方法。

---

## Command Architecture | 指令架構

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Command Family Overview                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  System A: SDD (AI-Era Methodology)                                         │
│  ────────────────────────────────────                                       │
│  /spec          → Create specification proposal                             │
│  /derive-all    → Generate BDD + TDD from spec (Forward Derivation)         │
│  /derive-bdd    → Generate BDD scenarios only                               │
│  /derive-tdd    → Generate TDD skeletons only                               │
│                                                                             │
│  System B: Double-Loop TDD (Traditional)                                    │
│  ────────────────────────────────────                                       │
│  /bdd           → Start BDD outer loop (Discovery → Formulation)            │
│  /tdd           → Start TDD inner loop (Red → Green → Refactor)             │
│                                                                             │
│  Optional Input (可選輸入)                                                   │
│  ────────────────────────────────────                                       │
│  /atdd          → Start ATDD Workshop (Three Amigos collaboration)          │
│  /derive-atdd   → Generate ATDD tables (optional output)                    │
│                                                                             │
│  Utility (工具)                                                              │
│  ────────────────────────────────────                                       │
│  /methodology   → Show/switch current methodology                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Command Selection by Scenario | 依情境選擇指令

| Scenario / 情境 | Recommended Commands / 推薦指令 |
|-----------------|-------------------------------|
| New project with AI assistance | `/spec` → `/derive-all` → Implement |
| Greenfield feature development | `/spec` → `/derive-all` → Implement |
| Legacy system modification | `/bdd` → `/tdd` cycles |
| Complex business logic | `/bdd discovery` → `/tdd` |
| Multiple stakeholders need alignment | `/atdd` → then `/spec` or `/bdd` |
| Quick prototype | `/tdd` only |
| API-first development | `/spec` → `/derive-all` |
| Check methodology status | `/methodology` |

---

## System A: SDD Commands | 系統 A：SDD 指令

SDD (Spec-Driven Development) is optimized for AI-assisted development workflows.

SDD（規格驅動開發）針對 AI 輔助開發工作流程進行了優化。

### Command Details | 指令詳細

| Command | Purpose / 用途 | Input / 輸入 | Output / 輸出 |
|---------|----------------|--------------|---------------|
| `/spec` | Create specification proposal | Requirements description | `SPEC-XXX.md` |
| `/spec review` | Review specification | SPEC file | Review comments |
| `/derive-all` | Full forward derivation | SPEC file | `.feature` + `.test.ts` |
| `/derive-bdd` | BDD derivation only | SPEC file | `.feature` |
| `/derive-tdd` | TDD derivation only | SPEC file | `.test.ts` |

### Typical SDD Workflow | 典型 SDD 工作流程

```bash
# Step 1: Create specification
/spec user-authentication

# Step 2: Review and approve
/spec review specs/SPEC-001.md

# Step 3: Derive test structures
/derive-all specs/SPEC-001.md

# Step 4: Implement (with AI assistance or TDD cycles)
# Fill in [TODO] sections, implement step definitions
```

---

## System B: Double-Loop TDD Commands | 系統 B：雙迴圈 TDD 指令

Double-Loop TDD combines BDD (outer loop) with TDD (inner loop) for behavior-driven development.

雙迴圈 TDD 將 BDD（外層迴圈）與 TDD（內層迴圈）結合，實現行為驅動開發。

### Command Details | 指令詳細

| Command | Purpose / 用途 | Phase / 階段 |
|---------|----------------|--------------|
| `/bdd` | Start BDD workflow | Discovery → Formulation → Automation |
| `/bdd discovery` | Discovery phase only | Example Mapping with Three Amigos |
| `/bdd formulation` | Formulation phase only | Write Gherkin scenarios |
| `/tdd` | Start TDD workflow | Red → Green → Refactor |
| `/tdd red` | Enter Red phase | Write failing test |
| `/tdd green` | Enter Green phase | Implement minimum code |
| `/tdd refactor` | Enter Refactor phase | Improve code quality |

### Typical Double-Loop TDD Workflow | 典型雙迴圈 TDD 工作流程

```bash
# Step 1: (Optional) ATDD Workshop for stakeholder alignment
/atdd

# Step 2: BDD Discovery - understand behavior
/bdd discovery

# Step 3: BDD Formulation - write Gherkin
/bdd formulation

# Step 4: TDD cycles for implementation
/tdd red
/tdd green
/tdd refactor
# Repeat for each scenario step
```

---

## Optional: ATDD Commands | 可選：ATDD 指令

ATDD (Acceptance Test-Driven Development) provides collaborative input methods. It is NOT a mandatory step in either system.

ATDD（驗收測試驅動開發）提供協作輸入方法。它**不是**任一系統的必要步驟。

### When to Use ATDD | 何時使用 ATDD

| Situation / 情境 | Use ATDD? |
|------------------|-----------|
| Multiple stakeholders with differing views | ✅ Yes |
| Complex business rules | ✅ Yes |
| New domain for the team | ✅ Yes |
| Solo developer with clear requirements | ❌ No |
| Technical refactoring | ❌ No |
| Bug fixes | ❌ No |

### ATDD Commands | ATDD 指令

| Command | Purpose / 用途 | Output / 輸出 |
|---------|----------------|---------------|
| `/atdd` | Start ATDD Workshop | User Story + AC + Out of Scope |
| `/derive-atdd` | Generate ATDD tables (optional) | `acceptance.md` |

> **Note**: BDD scenarios already serve as executable acceptance tests. `/derive-atdd` is only needed for specialized manual testing workflows.
>
> **注意**：BDD 場景已是可執行的驗收測試。`/derive-atdd` 僅在需要特殊手動測試工作流程時使用。

---

## Utility Commands | 工具指令

| Command | Purpose / 用途 |
|---------|----------------|
| `/methodology` | Show current active methodology |
| `/methodology sdd` | Switch to SDD workflow |
| `/methodology double-loop` | Switch to Double-Loop TDD workflow |

---

## Workflow Examples | 工作流程範例

### Example 1: SDD Complete Flow | 範例 1：SDD 完整流程

Best for: New features, AI-assisted development, greenfield projects

適用於：新功能、AI 輔助開發、全新專案

```bash
# Create and review specification
/spec user-authentication
/spec review specs/SPEC-001.md

# Generate all test structures
/derive-all specs/SPEC-001.md

# Output:
# - features/SPEC-001.feature (BDD scenarios)
# - tests/SPEC-001.test.ts (TDD skeletons)
# - DERIVATION-REPORT.md (summary)

# Implementation: Fill [TODO], implement code
```

### Example 2: Double-Loop TDD Flow | 範例 2：雙迴圈 TDD 流程

Best for: Legacy systems, complex business logic, team collaboration

適用於：遺留系統、複雜業務邏輯、團隊協作

```bash
# Optional: ATDD Workshop for alignment
/atdd

# BDD Outer Loop
/bdd discovery    # Example Mapping session
/bdd formulation  # Write Gherkin scenarios

# For each scenario step:
/tdd red       # Write failing test
/tdd green     # Implement minimum code
/tdd refactor  # Improve quality

# Repeat TDD inner loop until scenario passes
```

### Example 3: Hybrid Flow | 範例 3：混合流程

Best for: When you need spec clarity + TDD discipline

適用於：需要規格清晰度 + TDD 紀律時

```bash
# Start with SDD for specification
/spec feature-x
/derive-all specs/SPEC-001.md

# Use TDD for complex implementation logic
/tdd red → /tdd green → /tdd refactor

# BDD scenarios serve as acceptance criteria
```

---

## Quick Reference Card | 快速參考卡

### Most Common Commands | 最常用指令

| Goal / 目標 | Command / 指令 |
|-------------|----------------|
| Start new feature with spec | `/spec <feature-name>` |
| Generate tests from spec | `/derive-all <spec-file>` |
| Start BDD workflow | `/bdd` |
| Start TDD cycle | `/tdd` |
| Check methodology status | `/methodology` |

### Decision Tree | 決策樹

```
Is this a new feature with clear requirements?
├─ Yes → Use /spec + /derive-all (System A: SDD)
└─ No
   ├─ Is this legacy code modification?
   │  └─ Yes → Use /bdd + /tdd (System B: Double-Loop)
   ├─ Need stakeholder alignment?
   │  └─ Yes → Start with /atdd, then choose system
   └─ Quick prototype?
      └─ Yes → Use /tdd only
```

---

## Related Documentation | 相關文件

- [Forward Derivation SKILL](../forward-derivation/SKILL.md) - Detailed derivation workflow
- [Integrated Flow Guide](../methodology-system/integrated-flow.md) - Complete methodology integration
- [Individual Command Files](./README.md) - All command references

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial release - Two independent systems architecture |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
