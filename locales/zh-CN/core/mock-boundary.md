---
source: ../../../core/mock-boundary.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: d2648ad3d869
status: current
---

# Mock 边界标准

> **语言**: [English](../../../core/mock-boundary.md) | [繁體中文](../../zh-TW/core/mock-boundary.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-04
**适用性**: 所有具备单元测试与集成测试的软件项目
**范围**: universal
**行业标准**: ISTQB Foundation（Test Doubles）, xUnit Patterns（Gerard Meszaros）
**参考**: "Working Effectively with Legacy Code"（Feathers）, "Growing Object-Oriented Software"（Freeman & Pryce）

---

## 目的

本文档定义测试中哪些东西可以 mock、哪些不可以。其目标是防止**空心测试（hollow tests）**——永远通过却无法检测真实 bug 的测试，因为它们用 stub 取代了系统的逻辑。

---

## 空心测试问题

空心测试 mock 掉系统的大部分内容，使测试变成 mock 接线的规格说明，而非系统行为的规格说明。经典症状：你可以删掉实现文件，测试仍然通过。

**真实案例（Multi-agent pipeline SPEC-002.test.ts）**:

```typescript
vi.mock('../../src/runner/agent-runner.js')      // Core logic replaced
vi.mock('../../src/runner/guardian-hooks.js')     // Core logic replaced
vi.mock('../../src/runner/prototyper.js')         // Core logic replaced
vi.mock('../../src/runner/iteration-report.js')   // Core logic replaced
vi.mock('../../src/memory/memory-store.js')       // Core logic replaced
vi.mock('node:fs/promises', ...)                  // I/O replaced

// All assertions verify mock call counts — not actual outputs.
// runPipeline() touches zero real code.
```

---

## 可以 Mock 的项目

| 类别 | 示例 | 理由 |
|------|------|------|
| 外部 HTTP 服务 | LLM API、支付网关、email 服务 | 防止不稳定（flaky）测试；可控制响应场景 |
| 时间函数 | `Date.now()`、`new Date()`、`setTimeout` | 使测试具确定性 |
| 环境变量 | `process.env.NODE_ENV`、`process.env.LICENSE_KEY` | 支持配置变化 |
| 文件系统（仅限单元测试） | `fs.readFile`、`fs.writeFile` | 让快速单元测试避免 I/O |
| 跨模块边界（须有对应 IT） | 其他模块的 public API | 隔离被测单元 |

---

## 不可 Mock 的项目

| 类别 | 违规示例 | 禁止原因 |
|------|---------|---------|
| 自身模块的核心逻辑 | 在 pipeline-runner 测试中 `vi.mock('./pipeline-runner.js')` | 使测试形同虚设 |
| IT/flow/E2E 测试中的数据库 | 在集成测试中 `vi.mock('./db/client.js')` | 隐藏查询 bug、schema 问题 |
| HTTP 框架内部 | `vi.mock('express')` | 真实路由可能已坏 |
| 安全控制 | 永远通过的 auth middleware stub | 安全性回归不可见 |

---

## 空心测试检测

提交测试文件之前，请检查：

1. **Mock 数量 ≥ import 数量** → 评审：至少要有一个断言验证实际输出
2. **所有断言都是 `.toHaveBeenCalled()` 系列** → 加入输出值断言
3. **Mock 路径与被测对象目录相同** → 自我引用 mock；移除之
4. **Mock 设置行数多于断言行数** → 很可能是空心测试

---

## 反模式

- **Total Mock Isolation**：所有 import 都被 mock；只断言 mock 交互
- **Mock the World**：外部 + 内部 + DB + FS 在同一个测试中全部 mock
- **Orphan Mock**：跨模块 mock 却没有对应的集成测试
- **Security Bypass Mock**：auth/权限逻辑被换成直接放行的 stub
- **Database Mock Cascade**：DB 返回硬编码的数据，隐藏真实查询错误

---

## 规则摘要

| 规则 | 触发条件 | 动作 |
|------|---------|------|
| 禁止 self-mock | 测试文件 mock 自己的模块 | 移除 mock；让真实代码运行 |
| IT/flow 用真实 DB | 编写 IT 或 flow 测试 | 使用 in-memory SQLite 或测试 schema |
| IT 对应测试 | mock 跨模块边界 | 确保有对应的 IT 存在 |
| 禁止 mock 安全机制 | 测试涉及 auth/权限 | 使用真实测试用户 + 真实 token |
| 空心评审 | Mock 数量 ≥ import 数量 | 加入输出值断言 |

---

## 与其他标准的关系

- **testing**：Mock 边界规则适用于测试金字塔的所有测试级别
- **test-completeness-dimensions**：维度 8（AI 测试质量）引用了这些规则
- **flow-based-testing**：Flow 测试必须遵循 mock 边界规则
