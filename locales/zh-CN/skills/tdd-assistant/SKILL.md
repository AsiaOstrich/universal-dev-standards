---
source: ../../../../skills/tdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 63e273612cc3
status: current
description: |
  [UDS] 测试驱动开发（TDD）的参考资料：红-绿-重构循环、FIRST 原则与 Arrange-Act-Assert 结构。
  Use when: 在实现前先写一个会失败的测试、用 Arrange-Act-Assert 组织测试、以 FIRST 检视既有测试。
  Not for: 交互式地驱动 RED/GREEN 循环——该部分已移至采用层（XSPEC-095）；测量测试覆盖了多少代码——请用 /coverage。
  Keywords: TDD, test first, Red Green Refactor, FIRST, Arrange Act Assert, unit test, 测试驱动开发, 红绿重构, 单元测试.
---

# TDD 助手

> **语言**: [English](../../../../skills/tdd-assistant/SKILL.md) | 简体中文

> ⚠️ **状态：参考（仅供参考，非可执行流程）** — TDD 流程协调（RED→GREEN→REFACTOR 循环、测试执行 gates）已于 2026-04-28 移至 **采用层（adoption layer，XSPEC-095）**。此处保留 TDD 原则、FIRST 规则、AAA 格式、语言范例、流程指南供参考。
> 生命周期协调已移至采用层（XSPEC-095）；本文档**仅供参考**。如需强制执行，请使用你的采用层工具链。

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

> 📖 以下为流程的**参考结构**，非可执行步骤；自动化／强制执行请用采用层工具链（XSPEC-095）。

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

## 下一步引导

`/tdd` 完成后，AI 助手应建议：

> **TDD 循环完成。建议下一步：**
> - 执行 `/checkin` 通过品质关卡 ⭐ **推荐**
> - 执行 `/coverage` 确认测试覆盖率
> - 执行 `/code-review` 自我审查代码

## 参考

- [TDD 语言范例](./language-examples.md) — 需要某个特定语言的实际范例时读它。
- [TDD 工作流程指南](./tdd-workflow.md) — 要完整跑一轮红-绿-重构时读它。
- 详细指南：[guide.md](./guide.md)
- 核心规范：[test-driven-development.md](../../../../core/test-driven-development.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/tdd`](../../../../skills/commands/tdd.md#ai-agent-behavior--ai-代理行為)
