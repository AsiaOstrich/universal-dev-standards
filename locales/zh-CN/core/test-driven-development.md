---
source: ../../../core/test-driven-development.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: 1e7fecd7c0f3
status: current
---

# 测试驱动开发 (TDD) 标准

**版本**: 1.2.0
**最后更新**: 2026-01-25
**适用范围**: 所有采用测试驱动开发的项目
**范围**: universal
**业界标准**: 无（Kent Beck 实践，1999）

> **语言**: [English](../../../core/test-driven-development.md) | [繁體中文](../../zh-TW/core/test-driven-development.md)

---

## 摘要

测试驱动开发（TDD）是一种传统开发方法论（1999），由测试驱动软件功能的设计与实现。其核心工作流程遵循 **红-绿-重构（Red-Green-Refactor）** 循环：

1. **红（Red）**：编写一个描述预期行为的失败测试
2. **绿（Green）**：编写最少的代码让测试通过
3. **重构（Refactor）**：在保持测试通过的前提下改善代码质量

TDD 属于传统测试驱动开发家族（与 BDD、ATDD 并列），可用于 AI 时代 SDD（规格驱动开发）工作流程的实现阶段。此方法论有助于形成可测试、模块化的代码设计，并对代码正确性提供即时反馈。

---

**完整指南：[TDD 指南](../../../methodologies/guides/tdd-guide.md)**

---

## 快速参考

| 方面 | 说明 |
|--------|-------------|
| **核心循环** | 红 → 绿 → 重构 → 重复 |
| **FIRST 原则** | Fast（快速）、Independent（独立）、Repeatable（可重复）、Self-validating（自我验证）、Timely（及时） |
| **测试层级** | 单元/集成测试 |
| **参与者** | 开发者 |
| **工具** | xUnit 框架（Jest、pytest、JUnit 等） |

## 相关标准

- [测试标准](testing-standards.md)
- [行为驱动开发](behavior-driven-development.md)
- [规格驱动开发](spec-driven-development.md)
