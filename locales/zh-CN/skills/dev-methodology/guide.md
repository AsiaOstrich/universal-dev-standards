---
source: ../../../../skills/dev-methodology/guide.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-10
source_hash: cf9cbf22df6f
status: current
scope: partial
description: |
  管理并引导开发者完成进行中的开发方法论工作流。
  适用场景：需要 TDD、BDD、SDD、ATDD 或自定义方法论工作流时。
  关键词：方法论、工作流、TDD、BDD、SDD、ATDD、阶段、检查点、开发流程。
---

> [!WARNING]
> **实验性功能 / 實驗性功能**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

# 方法论系统 Skill

> **语言**：English | [繁體中文](../../locales/zh-TW/skills/dev-methodology/SKILL.md)

**版本**：2.0.0
**最后更新**：2026-01-25

---

## 概述

方法论系统为采用 Universal Development Standards 的项目提供了一个管理开发方法论的统一框架。

### 两个独立系统

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  Two Independent Methodology Systems                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  System A: SDD (AI-Era Methodology)                                        │
│  ─────────────────────────────────────                                     │
│  /sdd → Review → /derive-all → Implementation → Verification               │
│  Best for: New projects, AI-assisted development, greenfield features     │
│                                                                            │
│  System B: Double-Loop TDD (Traditional)                                   │
│  ─────────────────────────────────────                                     │
│  /bdd (Outer Loop) → /tdd (Inner Loop) → Demo                              │
│  Best for: Legacy systems, manual development, established codebases      │
│                                                                            │
│  Optional Input: ATDD Workshop                                             │
│  ─────────────────────────────────────                                     │
│  Stakeholder collaboration that feeds into EITHER system                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 支持的方法论

**系统 A：SDD（规格驱动开发，Spec-Driven Development）**
- 讨论 → 提案 → 评审 → 正向推导 → 实现 → 验证 → 归档
- 以规格作为权威来源的 AI 原生工作流

**系统 B：双循环 TDD**
- **BDD**（外循环）- 发现 → 制定 → 自动化
- **TDD**（内循环）- 红 → 绿 → 重构

**可选输入**
- **ATDD** - 验收测试驱动开发研讨会（可输入到任一系统）

**自定义** - 用户自定义的方法论

---

## 功能特性

### 1. 阶段感知引导

AI 会自动追踪当前阶段并提供符合上下文的引导：

```
┌─────────────────────────────────────────────┐
│ 📋 Current Methodology: TDD                  │
│ 📍 Current Phase: 🔴 RED (1-5 min)           │
│                                             │
│ Checklist:                                  │
│   ✅ Test describes behavior                │
│   ✅ Test name is clear                     │
│   ⬜ Test follows AAA pattern               │
│   ⬜ Test fails when run                    │
│                                             │
│ Next: Write the test following AAA pattern  │
└─────────────────────────────────────────────┘
```

### 2. 检查点提醒

基于方法论触发条件的自动提醒：

- **阶段转换**：阶段完成时建议提交（commit）
- **累积警告**：变更超过阈值时发出警告
- **跳过警告**：连续跳过检查后发出警示

### 3. 方法论切换

随着项目需求变化，在各方法论之间切换：

```
/methodology switch bdd
```

### 4. 自定义方法论支持

在 `.standards/methodologies/` 中定义团队专属的工作流：

```yaml
id: my-team-workflow
name: My Team Workflow
phases:
  - id: plan
    name: Planning
    checklist:
      - id: requirements-clear
        text: Requirements understood
        required: true
```

---

## 命令

| 命令 | 说明 |
|---------|-------------|
| `/methodology` | 显示当前方法论状态 |
| `/methodology switch <id>` | 切换到不同的方法论 |
| `/methodology phase [phase]` | 显示或变更当前阶段 |
| `/methodology checklist` | 显示当前阶段的检查清单 |
| `/methodology skip` | 跳过当前阶段（带警告） |
| `/methodology list` | 列出可用的方法论 |
| `/methodology create` | 创建自定义方法论 |

---

## 配置

方法论配置存储在 `.standards/manifest.json` 中：

```json
{
  "methodology": {
    "active": "tdd",
    "available": ["tdd", "bdd", "sdd", "atdd"],
    "config": {
      "tdd": {
        "checkpointsEnabled": true,
        "reminderIntensity": "suggest",
        "skipLimit": 3
      }
    }
  }
}
```

### 配置选项

| 选项 | 取值 | 说明 |
|--------|--------|-------------|
| `active` | 方法论 id | 当前激活的方法论 |
| `checkpointsEnabled` | `true`/`false` | 启用检查点提醒 |
| `reminderIntensity` | `suggest`/`warning`/`strict` | 强制检查点的强度 |
| `skipLimit` | 数字 | 发出警告前的连续跳过次数 |

---

## AI 行为

### 检测

1. 检查 `.standards/manifest.json` 中的 `methodology.active`
2. 从以下位置加载方法论定义：
   - 内置：`methodologies/{id}.methodology.yaml`
   - 自定义：`.standards/methodologies/{id}.methodology.yaml`

### 阶段追踪

- 根据触发条件追踪当前阶段
- 当满足退出条件时更新阶段
- 提供阶段专属的引导与检查清单

### 上下文关键词

当检测到以下关键词时，AI 会自动激活方法论上下文：

| 系统 | 方法论 | 关键词 |
|--------|-------------|----------|
| A: SDD | SDD | specification, spec first, proposal, derive tests, forward derivation |
| B: 双循环 | BDD（外） | given when then, gherkin, cucumber, scenario, discovery |
| B: 双循环 | TDD（内） | test first, red green refactor, failing test |
| 输入 | ATDD | acceptance test, user story, product owner, workshop |

---

## 与其他标准的整合

### 检入标准（Check-in Standards）

当某个阶段完成时，方法论系统会与 `checkin-standards.md` 整合：

```
Phase GREEN completed.

Changes:
- Files: 3
- Lines: +45 / -2

Suggested commit:
  test(auth): add login validation test
  feat(auth): implement login validation

[1] Commit now  [2] Continue working  [3] View changes
```

### 代码评审

会根据当前激活的方法论增加额外的评审检查项：

- **TDD**：测试遵循命名约定，每个测试只验证单一行为
- **BDD**：声明式风格，可复用的步骤
- **SDD**：变更与规格一致，无范围蔓延
- **ATDD**：所有验收条件都有对应的测试

---

## 相关 Skill

- [TDD Assistant](../tdd-assistant/SKILL.md) - 详细的 TDD 引导
- [Spec-Driven Dev](../spec-driven-dev/SKILL.md) - SDD 工作流
- [Code Review Assistant](../code-review-assistant/SKILL.md) - 评审整合

---

## 文件

- [integrated-flow.md](./integrated-flow.md) - 两个系统的完整工作流指南
- [runtime.md](./runtime.md) - AI 行为与运行时指南
- [create-methodology.md](./create-methodology.md) - 自定义方法论创建向导

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 2.0.0 | 2026-01-25 | 重构为两个独立系统的架构 |
| 1.0.0 | 2026-01-12 | 初始方法论系统 |
