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
| **I. Planning** | `/brainstorm` `/requirement` `/sdd` `/reverse` `/api-design` `/database` | 需求、規格、API/DB 設計 |
| **II. Testing** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` `/ac-coverage` | 先寫測試再寫程式 |
| **III. Implementation** | `/refactor` `/reverse` `/migrate` `/durable` | 撰寫、改善與遷移程式碼 |
| **IV. Quality** | `/checkin` `/review` `/security` `/scan` `/incident` | 品質、安全、事故回應 |
| **V. Release** | `/commit` `/changelog` `/release` `/pr` `/ci-cd` | 版本、提交、PR、CI/CD |
| **VI. Docs** | `/docs` `/docgen` | 文件與專案結構 |
| **VII. Standards** | `/discover` `/guide` `/metrics` `/audit` | 參考指南、指標、審計 |
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

### Security Review | 安全審查

```
/scan → /security → /checkin → /commit
```

### API Design | API 設計

```
/brainstorm → /api-design → /sdd → /derive → /tdd → /pr
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/dev-workflow` | 先檢查 `.workflow-state/`，有活躍工作流程則顯示狀態，否則展示全階段總覽 |
| `/dev-workflow <phase>` | 展示指定階段的詳細指令和說明 |
| `/dev-workflow <scenario>` | 展示指定場景的推薦工作流程（new-feature / bug-fix / refactoring） |

### Interaction Script | 互動腳本

1. 檢查 `.workflow-state/` 和 `docs/specs/` 的活躍狀態
2. 依據結果決定展示內容

**Decision: 活躍工作流程**
- IF 有進行中的 workflow → 顯示狀態摘要，建議 resume 命令
- IF 有活躍 spec → 提示 spec 進度，建議下一步
- ELSE → 展示完整階段總覽或指定內容

**Decision: 場景模式**
- IF 指定場景（new-feature / bug-fix / refactoring） → 展示該場景的推薦命令序列
- ELSE → 展示總覽表

### Stop Points | 停止點

此命令為純查詢/導引，無需停止點。

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 指定的 phase/scenario 不存在 | 列出可用的 phase 和 scenario |
| `.workflow-state/` 目錄不存在 | 跳過活躍工作流程檢查，直接展示總覽 |

## References | 參考

- [Development Workflow Skill](../dev-workflow-guide/SKILL.md)
- [Detailed Phase Guide](../dev-workflow-guide/workflow-phases.md)
- [Daily Workflow Guide](../../adoption/DAILY-WORKFLOW-GUIDE.md)
