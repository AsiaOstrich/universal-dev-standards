---
source: ../../../../skills/bdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  引导行为驱动开发（BDD）流程，使用 Given-When-Then 格式撰写场景。
  使用时机：定义行为场景、撰写 Gherkin、三剑客会议、BDD 流程。
  关键字：bdd, gherkin, given-when-then, scenario, feature, 行为驱动, 场景, 验收。
---

# BDD 助手

> **语言**: [English](../../../../skills/bdd-assistant/SKILL.md) | 简体中文

引导行为驱动开发（BDD）流程，使用 Given-When-Then 格式。

## BDD 循环

DISCOVERY ──► FORMULATION ──► AUTOMATION ──► LIVING DOCS

## 工作流程

### 1. DISCOVERY - 探索行为
与利害关系人讨论、识别范例和边界案例、理解「为什么」。

### 2. FORMULATION - 制定场景
使用通用语言撰写 Gherkin 场景，确保具体且明确。

### 3. AUTOMATION - 自动化测试
实现步骤定义，撰写最小化代码以通过测试，在自动化中遵循 TDD。

### 4. LIVING DOCUMENTATION - 活文档维护
保持场景为最新状态，作为共享文档使用，与利害关系人定期审查。

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

## 三剑客会议

| 角色 | 关注点 | Role | Focus |
|------|--------|------|-------|
| **业务** | 什么和为什么 | Business | What & Why |
| **开发** | 如何实现 | Development | How |
| **测试** | 假设情况 | Testing | What if |

## 使用方式

- `/bdd` - 启动互动式 BDD 会话
- `/bdd "user can reset password"` - 针对特定功能进行 BDD
- `/bdd login-feature.feature` - 使用现有的 feature 文件

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[behavior-driven-development.md](../../../../core/behavior-driven-development.md)
