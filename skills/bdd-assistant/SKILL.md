---
name: bdd
scope: partial
description: "[UDS] Guide through Behavior-Driven Development workflow"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature or spec | 功能或規格]"
---

# BDD Assistant | BDD 助手

Guide through the Behavior-Driven Development (BDD) workflow using Given-When-Then format.

引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式。

## BDD Cycle | BDD 循環

```
DISCOVERY ──► FORMULATION ──► AUTOMATION ──► LIVING DOCS
    ^                                            │
    └────────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. DISCOVERY - Explore Behavior | 探索行為
Discuss with stakeholders, identify examples and edge cases, understand the "why".

### 2. FORMULATION - Write Scenarios | 制定場景
Write Gherkin scenarios using ubiquitous language, make them concrete and specific.

### 3. AUTOMATION - Implement Tests | 自動化測試
Implement step definitions, write minimal code to pass, follow TDD within automation.

### 4. LIVING DOCUMENTATION - Maintain | 活文件維護
Keep scenarios current, use as shared documentation, review with stakeholders.

## Gherkin Format | Gherkin 格式

```gherkin
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access my dashboard

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should see my dashboard
```

## Three Amigos | 三劍客會議

| Role | Focus | 角色 | 關注點 |
|------|-------|------|--------|
| **Business** | What & Why | 業務 | 什麼和為什麼 |
| **Development** | How | 開發 | 如何實現 |
| **Testing** | What if | 測試 | 假設情況 |

## Usage | 使用方式

```
/bdd                              - Start interactive BDD session | 啟動互動式 BDD 會話
/bdd "user can reset password"    - BDD for specific feature | 針對特定功能
/bdd login-feature.feature        - Work with existing feature file | 處理現有功能檔案
```

## Next Steps Guidance | 下一步引導

After `/bdd` completes, the AI assistant should suggest:

> **BDD 場景已定義。建議下一步 / BDD scenarios defined. Suggested next steps:**
> - 執行 `/tdd` 實作步驟定義 ⭐ **Recommended / 推薦** — Implement step definitions
> - 執行 `/checkin` 品質關卡（若功能完成）— Quality gates (if feature complete)
> - 與利害關係人審查場景確保業務正確性 — Review scenarios with stakeholders

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [behavior-driven-development.md](../../core/behavior-driven-development.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/bdd`](../commands/bdd.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/bdd`](../commands/bdd.md#ai-agent-behavior--ai-代理行為)
