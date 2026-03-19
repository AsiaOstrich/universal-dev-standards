---
name: dev-workflow
description: "[UDS] Guide for mapping software development phases to UDS commands and features"
argument-hint: "[phase name | scenario | 階段名稱 | 場景]"
---

# Development Workflow Guide | 開發工作流程指南

Map your current development phase to UDS commands. Get guidance on which tools to use at each stage.

將你目前的開發階段對應到 UDS 指令。了解在每個階段應該使用哪些工具。

## Context-Aware Start | 情境感知啟動

When `/dev-workflow` is invoked, the AI assistant MUST first check the project's workflow state:

當調用 `/dev-workflow` 時，AI 助手必須先檢查專案的工作流程狀態：

### Step 1: Check Active Workflows | 檢查進行中的工作流程

```bash
ls .workflow-state/*.yaml .workflow-state/*.json 2>/dev/null
```

**If active workflows found | 如果有進行中的工作流程：**

1. Display active workflow summary (name, phase, progress)
2. Suggest resuming: "You have an active **{workflow}** at phase **{phase}**. Resume with `/{command}`?"
3. Show the appropriate next command based on current phase

**Phase → Next Command Mapping | 階段 → 下一步指令對應：**

| Workflow | Current Phase | Suggested Next Command |
|----------|--------------|----------------------|
| SDD | discuss | `/sdd create` |
| SDD | create | `/sdd review` |
| SDD | review | `/sdd approve` |
| SDD | approve | `/sdd implement` |
| SDD | implement | `/sdd verify` |
| TDD | red | Write failing test, then run tests |
| TDD | green | Write minimal code to pass |
| TDD | refactor | Clean up, then `/tdd` for next cycle |
| BDD | discovery | `/bdd` to formulate scenarios |
| BDD | formulation | Write `.feature` file |
| BDD | automation | Implement step definitions |

**If no active workflows | 如果沒有進行中的工作流程：**

Proceed to show the standard phase overview below.

### Step 2: Check for Active Specs | 檢查活躍規格

```bash
ls docs/specs/SPEC-*.md 2>/dev/null
```

If active specs exist, highlight them and suggest the appropriate workflow phase.

---

## Usage | 用法

```bash
/dev-workflow                    # Show full phase overview
/dev-workflow planning           # Phase I: Planning & Design
/dev-workflow testing            # Phase II: Test-Driven Development
/dev-workflow implementation     # Phase III: Implementation
/dev-workflow quality            # Phase IV: Quality Gates
/dev-workflow release            # Phase V: Release & Commit
/dev-workflow docs               # Phase VI: Documentation
/dev-workflow standards          # Phase VII: Tools & Standards
/dev-workflow advanced           # Phase VIII: Advanced Analysis
/dev-workflow new-feature        # Scenario: New feature workflow
/dev-workflow bug-fix            # Scenario: Bug fix workflow
/dev-workflow refactoring        # Scenario: Refactoring workflow
```

## Quick Reference | 快速對照表

| Phase | UDS Commands | 用途 |
|-------|-------------|------|
| **I. Planning** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 需求、規格、逆向工程 |
| **II. Testing** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先寫測試再寫程式 |
| **III. Implementation** | `/refactor` `/reverse` | 撰寫與改善程式碼 |
| **IV. Quality** | `/checkin` `/review` | 提交前檢查與審查 |
| **V. Release** | `/commit` `/changelog` `/release` | 版本、提交、發布 |
| **VI. Docs** | `/docs` `/docgen` `/struct` | 文件與專案結構 |
| **VII. Standards** | `/discover` `/guide` | 參考指南 |
| **VIII. Advanced** | `/methodology` | 跨方法論工作流程 |

## Common Scenarios | 常見場景

### New Feature | 新功能

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

### Bug Fix | 修復錯誤

```
/discover → /reverse → /tdd → /checkin → /commit
```

### Refactoring | 重構

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

## References | 參考

- [Development Workflow Skill](../dev-workflow-guide/SKILL.md)
- [Detailed Phase Guide](../dev-workflow-guide/workflow-phases.md)
- [Daily Workflow Guide](../../adoption/DAILY-WORKFLOW-GUIDE.md)
