---
source: ../../../../skills/commands/tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 731a838016b4
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
🔴 RED: Write test → run → MUST fail
   ↓ (only proceed if test fails with expected assertion failure)
🟢 GREEN: Write minimal code → run → MUST pass
   ↓ (only proceed if ALL tests pass)
🔵 REFACTOR: Clean up → run → MUST still pass
```

**关键规则**：AI 不得在失败测试存在之前编写实现代码。如果用户要求「直接写代码」，提醒 TDD 契约并建议先写测试。

---

## Methodology Integration | 方法论整合

当调用 `/tdd` 时：
1. **自动启用 TDD 方法论**（如果尚未启用）
2. **将当前阶段设为红灯**（编写失败的测试）
3. **追踪阶段转换**随着工作进展
4. **在响应中显示阶段指示器**（🔴 红灯、🟢 绿灯、🔵 重构）

See [methodology-system](../dev-methodology/SKILL.md) for full methodology tracking.

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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/tdd` | 询问要实现的功能，进入 🔴 RED 阶段 |
| `/tdd <function>` | 以指定函数为目标，直接进入 🔴 RED |
| `/tdd "user story"` | 以用户故事为目标，进入 🔴 RED |

### Interaction Script | 交互脚本

#### 🔴 RED Phase

1. 确认目标功能/行为
2. 编写一个会失败的测试
3. 执行测试，确认失败（assertion failure，非 syntax error）

**Decision: 测试结果**
- IF 测试失败（assertion）→ 进入 🟢 GREEN
- IF 测试出错（syntax/runtime error）→ 修正测试本身，重新执行
- IF 测试通过 → 告知用户测试不应该通过，检查功能是否已存在

🛑 **STOP**: 展示失败测试后等待用户确认进入 GREEN

#### 🟢 GREEN Phase

1. 编写最少量代码使测试通过
2. 执行测试

**Decision: 测试结果**
- IF 所有测试通过 → 建议进入 🔵 REFACTOR
- IF 仍有失败 → 继续修改代码（最多 3 次），超过则 🛑 STOP

🛑 **STOP**: 测试通过后等待用户确认进入 REFACTOR

#### 🔵 REFACTOR Phase

1. 分析刚写的代码是否有改善空间
2. 提出重构建议

**Decision: 重构范围**
- IF 有明显重复或改善点 → 列出建议，等用户选择
- IF 代码已足够简洁 → 告知不需重构，建议进入下一个 RED 循环

3. 执行重构，确认所有测试仍通过

🛑 **STOP**: 重构完成后等待用户决定继续下一个 RED 循环或结束

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| RED | 失败测试编写后 | 确认进入 GREEN |
| GREEN | 测试通过后 | 确认进入 REFACTOR |
| REFACTOR | 重构完成后 | 决定继续或结束 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 用户要求跳过 RED 直接写代码 | 提醒 TDD 契约，建议先写测试 |
| 未检测到测试框架 | 询问用户指定框架 |
| 测试语法错误导致无法执行 | 修正语法后重新执行，不计入尝试次数 |
| GREEN 阶段 3 次仍无法通过 | 停止，分析失败原因，等待用户指导 |

## Reference | 参考

- Full standard: [tdd-assistant](../tdd-assistant/SKILL.md)
- Core guide: [testing-standards](../../core/testing-standards.md)
