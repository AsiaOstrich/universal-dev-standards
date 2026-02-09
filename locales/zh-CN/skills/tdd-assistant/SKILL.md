---
source: ../../../../skills/tdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  引导测试驱动开发（TDD）流程：红-绿-重构。
  使用时机：TDD 开发、撰写测试先行的代码、学习 TDD。
  关键字：TDD, test-driven, red-green-refactor, 测试驱动, 红绿重构。
---

# TDD 助手

> **语言**: [English](../../../../skills/tdd-assistant/SKILL.md) | 简体中文

引导测试驱动开发（TDD）流程：红-绿-重构。

## TDD 循环

```
    ┌─────┐       ┌───────┐       ┌──────────┐
    │ RED │ ────► │ GREEN │ ────► │ REFACTOR │
    └─────┘       └───────┘       └──────────┘
       ▲                                │
       └────────────────────────────────┘
```

## 工作流程

### 阶段 1：RED - 撰写失败测试
- 撰写描述期望行为的测试
- 执行测试 - 确认它因**正确的原因失败**
- 使用 AAA 模式（Arrange-Act-Assert）

### 阶段 2：GREEN - 让测试通过
- 撰写**最少的**代码使测试通过
- 此阶段可以接受硬编码
- 执行测试 - 确认它**通过**

### 阶段 3：REFACTOR - 改善代码
- 消除重复（DRY）
- 改善命名和结构
- **每次**修改后都执行测试
- 不新增功能

## FIRST 原则

| 原则 | 说明 | Description |
|------|------|-------------|
| **F**ast | 测试快速执行（< 100ms/单元） | Tests run quickly |
| **I**ndependent | 测试间无共享状态 | No shared state between tests |
| **R**epeatable | 每次结果相同 | Same result every time |
| **S**elf-validating | 明确的通过/失败结果 | Clear pass/fail result |
| **T**imely | 在产品代码之前撰写 | Written before production code |

## 使用方式

- `/tdd` - 开始互动式 TDD 工作阶段
- `/tdd calculateTotal` - 对特定函数进行 TDD
- `/tdd "user can login"` - 对用户故事进行 TDD

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[test-driven-development.md](../../../../core/test-driven-development.md)
