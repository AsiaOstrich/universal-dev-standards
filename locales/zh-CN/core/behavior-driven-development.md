---
source: ../../../core/behavior-driven-development.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/behavior-driven-development.md) | 简体中文

# 行为驱动开发（BDD）标准

**版本**: 1.1.0
**最后更新**: 2026-01-25
**适用范围**: 所有采用行为驱动开发的项目
**范围**: universal
**行业标准**: 无（Dan North 实践，2006）

---

## 摘要

行为驱动开发（BDD）是由 Dan North 于 2006 年创建的传统开发方法论，旨在弥合业务与技术团队之间的沟通鸿沟。软件行为通过协作使用 **Given-When-Then** 场景来规范，采用 Gherkin 语法 — 一种利益相关者可以阅读和验证的自然语言格式。

BDD 构成双循环 TDD（GOOS 模式）的**外循环**，BDD 场景驱动功能级别行为，而 TDD 处理单元级别实现。该方法论遵循发现-公式化-自动化工作流，通过 Three Amigos 协作（业务 + 开发 + 测试）确保共同理解。

---

**完整指南: [BDD Guide](../../../methodologies/guides/bdd-guide.md)**

---

## 快速参考

| 方面 | 说明 |
|------|------|
| **核心工作流** | 发现 → 公式化 → 自动化 |
| **语言** | Gherkin（Given-When-Then） |
| **测试层级** | 功能/场景测试 |
| **参与者** | 开发者 + BA + QA（Three Amigos） |
| **工具** | Cucumber、Behave、SpecFlow |

## 相关标准

- [测试驱动开发](../../../core/test-driven-development.md)
- [验收测试驱动开发](acceptance-test-driven-development.md)
- [规格驱动开发](../../../core/spec-driven-development.md)
- [测试标准](testing-standards.md)
