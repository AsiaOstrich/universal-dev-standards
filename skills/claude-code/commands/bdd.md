---
description: Guide through Behavior-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[behavior or scenario to implement | 要實作的行為或場景]"
status: experimental
---

# BDD Assistant | BDD 助手

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Guide through the Behavior-Driven Development (BDD) workflow using Given-When-Then format.

引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式。

## Methodology Integration | 方法論整合

When `/bdd` is invoked:
1. **Automatically activate BDD methodology** if not already active
2. **Set current phase to DISCOVERY** (exploring behavior)
3. **Track phase transitions** as work progresses
4. **Show phase indicators** in responses (🔍 Discovery, 📝 Formulation, 🤖 Automation, 📚 Living Docs)

當調用 `/bdd` 時：
1. **自動啟用 BDD 方法論**（如果尚未啟用）
2. **將當前階段設為探索**（探索行為）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔍 探索、📝 制定、🤖 自動化、📚 活文件）

See [methodology-system](../methodology-system/SKILL.md) for full methodology tracking.

## BDD Cycle | BDD 循環

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌─────────┐   ┌───────────┐   ┌──────────┐   ┌────┐ │
│  │DISCOVERY│ ► │FORMULATION│ ► │AUTOMATION│ ► │DOCS│ │
│  └─────────┘   └───────────┘   └──────────┘   └────┘ │
│       ▲                                    │          │
│       └────────────────────────────────────┘          │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. DISCOVERY - Explore Behavior | 探索行為
- Discuss with stakeholders
- Identify examples and edge cases
- Understand the "why" behind features

### 2. FORMULATION - Write Scenarios | 制定場景
- Write Gherkin scenarios (Given-When-Then)
- Use ubiquitous language
- Make scenarios concrete and specific

### 3. AUTOMATION - Implement Tests | 自動化測試
- Implement step definitions
- Write minimal code to pass
- Follow the TDD cycle within automation

### 4. LIVING DOCUMENTATION - Maintain | 活文件維護
- Keep scenarios up to date
- Use as documentation
- Share with stakeholders

## Gherkin Format | Gherkin 格式

```gherkin
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access my personal dashboard

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter my email "user@example.com"
    And I enter my password "correctpassword"
    And I click the login button
    Then I should be redirected to my dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

## Three Amigos | 三劍客會議

BDD works best with collaboration:

| Role | Focus | 角色 | 關注點 |
|------|-------|------|--------|
| Business | What & Why | 業務 | 什麼和為什麼 |
| Development | How | 開發 | 如何實現 |
| Testing | What if | 測試 | 假設情況 |

## Usage | 使用方式

- `/bdd` - Start interactive BDD session
- `/bdd "user can reset password"` - BDD for specific feature
- `/bdd login-feature.feature` - Work with existing feature file

## Phase Checklist | 階段檢查清單

### Discovery Phase
- [ ] Stakeholders identified
- [ ] User stories discussed
- [ ] Examples collected
- [ ] Edge cases identified

### Formulation Phase
- [ ] Scenarios follow Given-When-Then
- [ ] Language is ubiquitous (shared vocabulary)
- [ ] Scenarios are specific and concrete
- [ ] No implementation details in scenarios

### Automation Phase
- [ ] Step definitions implemented
- [ ] Tests are executable
- [ ] Code passes all scenarios
- [ ] Refactoring complete

### Living Documentation Phase
- [ ] Scenarios are current
- [ ] Documentation is accessible
- [ ] Stakeholders can read and understand

## Reference | 參考

- Methodology: [bdd.methodology.yaml](../../../../methodologies/bdd.methodology.yaml)
- Methodology System: [methodology-system](../methodology-system/SKILL.md)
