---
source: ../../../../skills/bdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式撰寫場景。
  使用時機：定義行為場景、撰寫 Gherkin、三劍客會議、BDD 流程。
  關鍵字：bdd, gherkin, given-when-then, scenario, feature, 行為驅動, 場景, 驗收。
---

# BDD 助手

> **語言**: [English](../../../../skills/bdd-assistant/SKILL.md) | 繁體中文

引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式。

## BDD 循環

DISCOVERY ──► FORMULATION ──► AUTOMATION ──► LIVING DOCS

## 工作流程

### 1. DISCOVERY - 探索行為
與利害關係人討論、識別範例和邊界案例、理解「為什麼」。

### 2. FORMULATION - 制定場景
使用通用語言撰寫 Gherkin 場景，確保具體且明確。

### 3. AUTOMATION - 自動化測試
實作步驟定義，撰寫最小化程式碼以通過測試，在自動化中遵循 TDD。

### 4. LIVING DOCUMENTATION - 活文件維護
保持場景為最新狀態，作為共享文件使用，與利害關係人定期審查。

## Gherkin 格式

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

## 三劍客會議

| 角色 | 關注點 | Role | Focus |
|------|--------|------|-------|
| **業務** | 什麼和為什麼 | Business | What & Why |
| **開發** | 如何實現 | Development | How |
| **測試** | 假設情況 | Testing | What if |

## 使用方式

- `/bdd` - 啟動互動式 BDD 會話
- `/bdd "user can reset password"` - 針對特定功能進行 BDD
- `/bdd login-feature.feature` - 使用現有的 feature 檔案

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[behavior-driven-development.md](../../../../core/behavior-driven-development.md)
