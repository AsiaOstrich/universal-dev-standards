---
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  在编写代码前，建立、审查和管理规格文件。
  使用时机：建立规格、审查设计、规格驱动开发流程。
  关键字：spec, specification, SDD, design, review, 规格, 设计, 审查, 验证。
---

# 规格驱动开发助手

> **语言**: [English](../../../../skills/spec-driven-dev/SKILL.md) | 简体中文

在编写代码前，建立、审查和管理规格文件。

## 工作流程

CREATE --> REVIEW --> APPROVE --> IMPLEMENT --> VERIFY

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
# Feature: [Name]
## Overview
Brief description.
## Requirements
- REQ-001: [Description]
## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]
## Technical Design
[Architecture, API changes, database changes]
## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
```

## 使用方式

- `/sdd` - 交互式规格建立向导
- `/sdd auth-flow` - 为特定功能建立规格
- `/sdd review` - 审查现有规格
- `/sdd --sync-check` - 检查同步状态

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[spec-driven-development.md](../../../../core/spec-driven-development.md)
