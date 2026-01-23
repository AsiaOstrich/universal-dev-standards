---
description: Guide refactoring decisions and strategy selection
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[scope: tactical | strategic | legacy | decide | debt]"
status: stable
---

# /refactor Command | /refactor 命令

Guide refactoring decisions and recommend appropriate strategies.

引導重構決策，推薦適合的重構策略。

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/refactor` | Start interactive refactoring guide | 啟動互動式重構引導 |
| `/refactor decide` | Run refactor vs. rewrite decision tree | 執行重構 vs 重寫決策樹 |
| `/refactor tactical` | Suggest tactical (daily) strategies | 建議戰術性（日常）策略 |
| `/refactor strategic` | Guide strategic/architectural refactoring | 引導戰略性/架構重構 |
| `/refactor legacy` | Legacy code safety strategies | 遺留程式碼安全策略 |
| `/refactor debt` | Technical debt assessment | 技術債評估 |

## Workflow | 工作流程

### 1. Assessment Phase | 評估階段

- Identify code to be refactored
- Evaluate test coverage
- Determine scope (tactical/strategic)

識別要重構的程式碼、評估測試覆蓋率、判定範圍

### 2. Strategy Selection | 策略選擇

- Run decision tree if needed
- Recommend appropriate strategy based on context

必要時執行決策樹、根據情境推薦適合的策略

### 3. Execution Guidance | 執行引導

- Provide step-by-step workflow
- Suggest safety measures
- Track progress

提供步驟式工作流程、建議安全措施、追蹤進度

## Decision Tree | 決策樹

When running `/refactor decide`:

執行 `/refactor decide` 時：

```
┌─────────────────────────────────────────────────────────────────┐
│              Refactor vs. Rewrite Decision Tree                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Is the code currently working in production? [Y/N]          │
│     └─ N → Consider rewrite (lower risk)                       │
│                                                                 │
│  2. Do you understand what the code does? [Y/N]                 │
│     └─ N → Characterization tests first, then decide           │
│                                                                 │
│  3. Is test coverage > 60%? [Y/N]                               │
│     └─ N → Add tests first, then decide                        │
│                                                                 │
│  4. Is the core architecture salvageable? [Y/N]                 │
│     └─ N → Strangler Fig (gradual replacement)                 │
│     └─ Y → Incremental Refactoring ✓                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Strategy Quick Reference | 策略快速參考

### Tactical Strategies (Daily) | 戰術性策略（日常）

| Strategy | When to Use | 使用時機 |
|----------|-------------|---------|
| **Preparatory Refactoring** | Before adding a blocked feature | 新增被阻擋的功能之前 |
| **Boy Scout Rule** | During any maintenance work | 任何維護工作中 |
| **Red-Green-Refactor** | TDD development cycle | TDD 開發循環 |

### Strategic Strategies (Architectural) | 戰略性策略（架構級）

| Strategy | When to Use | 使用時機 |
|----------|-------------|---------|
| **Strangler Fig** | Replacing entire system | 替換整個系統 |
| **Anti-Corruption Layer** | Integrating with legacy system | 與遺留系統整合 |
| **Branch by Abstraction** | Shared code refactoring on trunk | 在主幹上重構共享程式碼 |
| **Parallel Change** | Changing widely-used interfaces | 變更廣泛使用的介面 |

### Safety Strategies (Legacy) | 安全防護策略（遺留）

| Strategy | When to Use | 使用時機 |
|----------|-------------|---------|
| **Characterization Tests** | Before any legacy refactoring | 任何遺留程式碼重構之前 |
| **Scratch Refactoring** | Understanding black-box code | 理解黑盒程式碼 |
| **Finding Seams** | Injecting test doubles | 注入測試替身 |
| **Sprout/Wrap** | Adding new logic to legacy | 在遺留程式碼中新增邏輯 |

## Examples | 範例

### Example 1: Feature blocked by messy code

```
User: /refactor tactical

AI: Let me help you select a tactical refactoring strategy.

What's your situation?
1. Feature development is blocked by code structure → **Preparatory Refactoring**
2. Touching code during a bug fix → **Boy Scout Rule**
3. Writing new code with TDD → **Red-Green-Refactor**

Which describes your situation best?
```

### Example 2: Decision tree

```
User: /refactor decide

AI: Let me help you decide whether to refactor or rewrite.

**Question 1:** Is the code currently working in production?
□ Yes - Continue to next question
□ No - Consider rewrite (lower risk since no production dependency)

Please answer...
```

### Example 3: Legacy code

```
User: /refactor legacy

AI: Working with legacy code requires safety-first strategies.

**Before any refactoring:**
1. ✅ Write Characterization Tests to capture current behavior
2. ✅ Use Scratch Refactoring if you don't understand the code
3. ✅ Find Seams for injecting test doubles

**When adding new logic:**
- Use Sprout Method/Class for new functionality
- Use Wrap Method/Class for before/after behavior

Would you like me to help you start with characterization tests?
```

## Integration | 整合

This command integrates with:

- **Refactoring Assistant Skill** for detailed guidance
- **Methodology System** for tracking refactoring progress
- **TDD Assistant** for Red-Green-Refactor cycles

此命令整合：

- **重構助手技能** 提供詳細引導
- **方法論系統** 追蹤重構進度
- **TDD 助手** 用於紅-綠-重構循環

## Reference | 參考

- [Refactoring Standards](../../../core/refactoring-standards.md) - Core standard
- [Refactoring Assistant Skill](../refactoring-assistant/SKILL.md) - Full skill
- [TDD Assistant](../tdd-assistant/SKILL.md) - TDD workflow
