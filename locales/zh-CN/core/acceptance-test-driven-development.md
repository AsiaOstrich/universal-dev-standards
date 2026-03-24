---
source: ../../../core/acceptance-test-driven-development.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/acceptance-test-driven-development.md) | 简体中文

# 验收测试驱动开发（ATDD）标准

**版本**: 1.1.0
**最后更新**: 2026-01-25
**适用范围**: 所有采用验收测试驱动开发的项目
**范围**: universal
**行业标准**: 无（2003-2006 实践）

---

## 摘要

验收测试驱动开发（ATDD）是一种传统开发方法论（2003-2006），强调在开发开始前协作定义验收条件。整个团队（业务、开发和测试）共同定义"完成"的标准，通过可执行的验收测试来表达。

ATDD 的核心价值是 **Three Amigos** 协作模式，由客户/PO、开发者和测试者共同定义验收条件。ATDD 是定义验收条件的可选协作方法 — 团队也可以通过访谈、PRD 或利益相关者讨论来收集需求，并达到类似效果。

---

**完整指南: [ATDD Guide](../../../methodologies/guides/atdd-guide.md)**

---

## 快速参考

| 方面 | 说明 |
|------|------|
| **核心工作流** | 工作坊 → 提炼 → 开发 → 演示 → 完成 |
| **核心价值** | Three Amigos 协作（PO + 开发 + QA） |
| **测试层级** | 系统/验收测试 |
| **参与者** | 整个团队 + 利益相关者 |
| **工具** | FitNesse、Cucumber、Robot Framework |

## 相关标准

- [行为驱动开发](behavior-driven-development.md)
- [测试驱动开发](../../../core/test-driven-development.md)
- [规格驱动开发](../../../core/spec-driven-development.md)
