---
source: ../../../../skills/bdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: f6726d10b54e
status: current
description: |
  [UDS] 行为驱动开发（BDD）的参考资料：Gherkin 的 Given-When-Then 格式与 Three Amigos 结构。
  Use when: 编写或审查 .feature 场景、选定通用语言、针对行为进行探索式对话。
  Not for: 执行 BDD 生命周期或 RED/GREEN 自动化——该部分已移至采用层（XSPEC-095）；把 .feature 文件转成 E2E 骨架——请用 /e2e。
  Keywords: BDD, Gherkin, Given When Then, feature file, scenario, Three Amigos, 行为驱动开发, 场景, 特性文件, 通用语言.
---

# BDD 助手

> **语言**: [English](../../../../skills/bdd-assistant/SKILL.md) | 简体中文

> ⚠️ **状态：参考（仅供参考，非可执行流程）** — BDD 生命周期协调（4 阶段循环、Gherkin scaffolding、RED/GREEN 执行）已于 2026-04-28 移至 **采用层（adoption layer，XSPEC-095）**。此处保留 Gherkin 格式定义、Three Amigos 结构、BDD 循环图供参考。
> 如需强制执行，请使用你的采用层工具链。

引导行为驱动开发（BDD）流程，使用 Given-When-Then 格式。

## BDD 循环

```
DISCOVERY ──► FORMULATION ──► AUTOMATION ──► LIVING DOCS
    ^                                            │
    └────────────────────────────────────────────┘
```

## 工作流程

> 📖 以下为流程的**参考结构**，非可执行步骤；自动化／强制执行请用采用层工具链（XSPEC-095）。

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

## 下一步引导

`/bdd` 完成后，AI 助手应建议：

> **BDD 场景已定义。建议下一步：**
> - 执行 `/tdd` 实现步骤定义 ⭐ **推荐**
> - 执行 `/checkin` 品质关卡（若功能完成）
> - 与利益相关者审查场景确保业务正确性

## 参考

- [BDD 工作流程指南](./bdd-workflow.md) — 要把探索、制定、自动化当一个循环跑时读它。
- [Gherkin 快速参考指南](./gherkin-guide.md) — 要写 Given／When／Then 而需要确切语法时读它。
- 详细指南：[guide.md](./guide.md)
- 核心规范：[behavior-driven-development.md](../../../../core/behavior-driven-development.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/bdd`](../../../../skills/commands/bdd.md#ai-agent-behavior--ai-代理行為)
