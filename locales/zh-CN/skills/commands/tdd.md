---
source: ../../../../skills/commands/tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: experimental
---

---
description: [UDS] Guide through Test-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[feature or function to implement | 要实现的功能]"
status: experimental
---

# TDD Assistant | TDD 助手

> [!WARNING]
> **Experimental Feature / 实验性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。

Guide through the Test-Driven Development (TDD) workflow: Red-Green-Refactor.

引导测试驱动开发（TDD）流程：红-绿-重构。

## Pre-Flight Checks | 前置检查

Before executing TDD phases, the AI assistant MUST verify prerequisites. If a check fails, STOP and guide the user.

在执行 TDD 阶段前，AI 助手必须验证前置条件。如果检查失败，停止并引导用户。

### Phase Gate Matrix | 阶段闸门矩阵

| Target Phase | Pre-Flight Check | On Failure |
|-------------|-----------------|------------|
| `RED` | 1. Feature/function clearly defined | → Ask user to describe the behavior |
| | 2. If SDD project: spec exists and is Approved | → Guide to `/sdd` |
| `GREEN` | 1. At least one failing test exists | → Guide back to RED phase |
| | 2. Run tests → confirm failure (not error) | → Fix test syntax/setup first |
| `REFACTOR` | 1. All tests passing (GREEN confirmed) | → Stay in GREEN phase |
| | 2. No failing tests from previous RED cycle | → Complete GREEN first |

### Red-Before-Green Enforcement | 红灯优先强制

```
RED: Write test → run → MUST fail
   ↓ (only proceed if test fails with expected assertion failure)
GREEN: Write minimal code → run → MUST pass
   ↓ (only proceed if ALL tests pass)
REFACTOR: Clean up → run → MUST still pass
```

**关键规则**：AI 不得在失败测试存在之前编写实现代码。如果用户要求「直接写代码」，提醒 TDD 契约并建议先写测试。

---

## Methodology Integration | 方法论整合

当调用 `/tdd` 时：
1. **自动启用 TDD 方法论**（如果尚未启用）
2. **将当前阶段设为红灯**（编写失败的测试）
3. **追踪阶段转换**随着工作进展
4. **在响应中显示阶段指示器**

See [methodology-system](../methodology-system/SKILL.md) for full methodology tracking.

## TDD Cycle | TDD 循环

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────┐     ┌─────┐     ┌─────────┐ │
│    │ RED │ ──► │GREEN│ ──► │REFACTOR │ │
│    └─────┘     └─────┘     └─────────┘ │
│       ▲                          │      │
│       └──────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. RED - 编写失败的测试
- 为期望的行为编写测试
- 运行测试 - 应该失败
- 确认测试有效

### 2. GREEN - 使测试通过
- 编写最少的代码使测试通过
- 不添加额外功能
- 运行测试 - 应该通过

### 3. REFACTOR - 改善代码
- 清理代码
- 消除重复
- 所有测试应仍然通过

## FIRST Principles | FIRST 原则

| Principle | Description | 说明 |
|-----------|-------------|------|
| **F**ast | Tests run quickly | 快速执行 |
| **I**ndependent | No test dependencies | 无依赖性 |
| **R**epeatable | Same result every time | 可重复 |
| **S**elf-validating | Pass/fail is clear | 自我验证 |
| **T**imely | Written before code | 及时编写 |

## Usage | 使用方式

- `/tdd` - 启动交互式 TDD 会话
- `/tdd calculateTotal` - 为特定函数进行 TDD
- `/tdd "user can login"` - 为用户故事进行 TDD

## Reference | 参考

- Full standard: [tdd-assistant](../tdd-assistant/SKILL.md)
- Core guide: [testing-standards](../../core/testing-standards.md)
