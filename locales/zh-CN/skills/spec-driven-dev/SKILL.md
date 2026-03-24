---
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-03-23
status: current
description: |
  在编写代码前，建立、审查和管理规格文件。
  使用时机：建立规格、审查设计、规格驱动开发流程。
  关键字：spec, specification, SDD, design, review, 规格, 设计, 审查, 验证。
---

# 规格驱动开发助手

> **语言**: [English](../../../../skills/spec-driven-dev/SKILL.md) | 简体中文

在编写代码前，建立、审查和管理规格文件。

## 快速检查清单

- 搜索现有规格：查看 `specs/`、`docs/specs/` 或项目规格目录
- 决定范围：新功能 vs 修改现有功能
- 选择唯一的规格 ID：`SPEC-NNN` 或 kebab-case 变更 ID
- 撰写包含明确 AC（Given/When/Then 格式）的提案
- 实现前取得核准
- 依序实现任务，对照规格验证
- 完成后归档规格

## 决策树

```
新需求？
├─ 修复符合规格行为的 Bug？ → 直接修复
├─ 错字/格式/注释？ → 直接修复
├─ 依赖套件更新（不破坏兼容性）？ → 直接修复
├─ 新功能/能力？ → 建立提案
├─ 破坏性变更？ → 建立提案
├─ 架构变更？ → 建立提案
└─ 不确定？ → 建立提案（较安全）
```

## 工作流程

```
DISCUSS ──► CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY ──► ARCHIVE
```

### 0. Discuss - 厘清范围
在编写规格前，捕捉模糊地带、建立治理原则、解决歧义。

### 1. Create - 编写规格
定义需求、技术设计、验收条件和测试计划。

### 2. Review - 审查验证
与利害关系人检查完整性、一致性和可行性。

### 3. Approve - 核准
在实现开始前取得利害关系人签核。

### 4. Implement - 实现
依据已核准的规格进行开发，参照需求和验收条件。

### 5. Verify - 验证
确保实现符合规格，所有测试通过，验收条件已满足。

### 6. Archive - 归档
归档已完成的规格，链接至 commits/PRs。

## 规格状态

| 状态 | 说明 | State | Description |
|------|------|-------|-------------|
| **Draft** | 草稿中 | Draft | Work in progress |
| **Review** | 审查中 | Review | Under review |
| **Approved** | 已核准 | Approved | Ready for implementation |
| **Implemented** | 已实现 | Implemented | Code complete |
| **Archived** | 已归档 | Archived | Completed or deprecated |

## 规格结构

```markdown
# [SPEC-ID] Feature: [Name]

## Overview
简短描述提案变更。

## Motivation
为什么需要这个变更？解决什么问题？

## Requirements
### Requirement: [Name]
系统 SHALL [行为描述]。

#### Scenario: [成功案例]
- **GIVEN** [初始情境]
- **WHEN** [执行动作]
- **THEN** [预期结果]

## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]

## Technical Design
[架构、API 变更、数据库变更]

## Test Plan
- [ ] [组件] 的单元测试
- [ ] [流程] 的集成测试
```

### 场景格式规则

- 使用 `#### Scenario:` (h4 标题) 撰写每个场景
- 每个需求必须至少有一个场景
- 使用 **GIVEN/WHEN/THEN** 格式描述结构化行为
- 使用 **SHALL/MUST** 表达强制需求，**SHOULD** 表达建议

## 变更操作

修改现有规格时，使用 delta 区段：

| 操作 | 说明 |
|------|------|
| `## ADDED Requirements` | 新增功能 |
| `## MODIFIED Requirements` | 修改行为 |
| `## REMOVED Requirements` | 移除功能 |
| `## RENAMED Requirements` | 重新命名 |

## 使用方式

- `/sdd` - 交互式规格建立向导
- `/sdd auth-flow` - 为特定功能建立规格
- `/sdd review` - 审查现有规格
- `/sdd --sync-check` - 检查同步状态

## 下一步引导

`/sdd` 完成后，AI 助手应建议：

> **规格文档已建立。建议下一步：**
> - 执行 `/derive` 从规格推导测试工件
> - 执行 `/derive bdd` 仅推导 BDD 场景
> - 执行 `/derive tdd` 仅推导 TDD 骨架
> - 审查 AC 完整性，确保所有验收条件可测试
> - 检查 UDS 规范覆盖率 → 执行 `/audit --patterns`

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[spec-driven-development.md](../../../../core/spec-driven-development.md)
