---
name: derive
scope: partial
description: |
  从已批准的 SDD 规格推导 BDD 场景和 TDD 测试骨架。
  ATDD 验收测试表为可选输出，用于特殊需求。
  使用时机：规格已批准、开始 BDD/TDD 实施、生成测试结构。
  关键字：forward derivation, spec to test, BDD generation, TDD skeleton, test derivation, 正向推导, 规格转测试, 测试生成。
source: ../../../../../skills/claude-code/forward-derivation/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-01-25
status: current
---

# 正向推导指南

> **语言**: [English](../../../../../skills/claude-code/forward-derivation/SKILL.md) | [繁體中文](../../zh-TW/skills/claude-code/forward-derivation/SKILL.md)

**版本**: 2.0.0
**最后更新**: 2026-01-25
**适用范围**: Claude Code Skills

> **核心标准**: 此技能实现[正向推导标准](../../../core/forward-derivation-standards.md)。任何 AI 工具皆可参考核心标准取得完整方法论文档。

---

## 目的

此技能引导您从已批准的 SDD 规格推导 BDD 场景和 TDD 测试骨架，并严格遵循反幻觉标准。

> **注意**: ATDD 测试表为可选项，可通过 `/derive-atdd` 取得。BDD 场景本身已作为可执行验收测试，使 ATDD 表对大多数用例变得多余。

正向推导是[反向工程](../reverse-engineer/SKILL.md)的对称对应：
- **反向工程**: 代码 → 规格
- **正向推导**: 规格 → 测试

## 快速参考

### 正向推导工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│              正向推导工作流程                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  SPEC 解析 (AI 自动化)                                │
│      ├─ 读取已批准规格                                        │
│      ├─ 提取验收标准 (GWT 或项目)                             │
│      └─ 验证 SPEC 结构和完整性                              │
│                                                                 │
│  2️⃣  推导 (AI 自动化)                                      │
│      ├─ AC → BDD Gherkin 场景                                │
│      ├─ AC → 带 TODO 的 TDD 测试骨架                           │
│      └─ (可选) AC → ATDD 验收测试表                           │
│                                                                 │
│  3️⃣  人工审查 (必需)                                        │
│      ├─ 验证生成的场景匹配 AC 意图                           │
│      ├─ 填写 [TODO] 部分                                     │
│      └─ 如需要，完善步骤定义                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 命令概述

| 命令 | 输入 | 输出 | 目的 |
|------|------|------|------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 场景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 测试骨架 |
| `/derive-all` | SPEC-XXX.md | .feature + .test.ts | 完整推导流水线 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 验收测试表 (可选) |

---

## 核心原则

### 1. 规格边界生成

**关键**: 仅推导规格中存在的内容。绝不要添加超出验收标准明确定义的场景、测试或功能。

```
# 反幻觉规则
输入:  带有 N 个验收标准的 SPEC
输出:  正好 N 个场景 (BDD)
        正好 N 个测试组 (TDD)
        正好 N 个验收测试 (ATDD，如请求)

如果输出数量 ≠ 输入数量 → 违规
```

### 2. 来源归属

每个生成项必须包含可追溯性：

```gherkin
# 生成自: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: 使用有效凭据的用户登录
```

### 3. 推导标签（来自统一标签系统）

此技能使用**推导标签**从规格生成新内容。有关完整标签参考，请参见[反幻觉标准](../../../core/anti-hallucination.md#unified-tag-system)。

| 标签 | 使用时机 | 示例 |
|-----|----------|------|
| `[来源]` | 直接来自 SPEC 的内容 | 功能标题，AC 文本 |
| `[推导]` | 从 SPEC 内容转换 | 从项目 AC 转换的 GWT |
| `[生成]` | AI 生成结构 | 测试骨架 |
| `[TODO]` | 需要人工实施 | 断言，步骤定义 |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-01-25 | ATDD 从必需改为可选输出；/derive-all 现在只输出 BDD + TDD |
| 1.1.0 | 2026-01-25 | 新增：统一标签系统引用 |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 许可证

此技能根据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)