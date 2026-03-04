---
name: dev-workflow
description: "[UDS] Guide for mapping software development phases to UDS commands and features"
argument-hint: "[phase name | scenario | 階段名稱 | 場景]"
---

# Development Workflow Guide | 開發工作流程指南

Map your current development phase to UDS commands. Get guidance on which tools to use at each stage.

將你目前的開發階段對應到 UDS 指令。了解在每個階段應該使用哪些工具。

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
