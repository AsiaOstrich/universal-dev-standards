---
source: ../../../core/context-aware-loading.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/context-aware-loading.md) | 简体中文

# 情境感知标准加载

**版本**: 1.0.0
**最后更新**: 2026-03-16
**适用范围**: 所有使用 AI 优化标准（.ai.yaml）的项目
**范围**: universal

---

## 目的

本标准定义 AI 工具根据当前任务情境选择性加载开发标准的协议。AI 工具不会一次性加载所有标准，而是始终加载核心集合，并按需激活其他标准，从而减少 token 使用并提高聚焦度。

---

## 快速参考

| 概念 | 描述 |
|------|------|
| **域** | 一组命名的相关标准（如 `testing`、`quality`） |
| **始终加载** | 无论任务如何，每个会话都加载的标准 |
| **按需加载** | 仅在任务情境匹配其域触发器时加载的标准 |
| **清单域** | 域→标准映射的唯一真实来源（`manifest.json`） |

---

## 1. 域分类

### 1.1 始终加载的标准

这些标准对每次 AI 交互都是基础性的，必须始终加载：

| 标准 | 原因 |
|------|------|
| `anti-hallucination` | 在每项任务中防止捏造 |
| `commit-message` | 每个会话都可能产生提交 |
| `checkin-standards` | 品质关卡适用于所有变更 |
| `project-context-memory` | 项目决策必须始终被尊重 |
| `developer-memory` | 过去的见解应始终可用 |

### 1.2 按需加载域

| 域 | 标准 | 激活触发器 |
|----|------|-----------|
| `testing` | testing, unit-testing, integration-testing, tdd, bdd, atdd | 撰写测试、测试文件编辑、"测试覆盖率"讨论 |
| `specification` | spec-driven-development, forward-derivation, reverse-engineering | `/sdd`、`/spec` 命令、规格文件编辑 |
| `quality` | code-review, refactoring, security, performance, accessibility | `/review` 命令、PR 审查、"重构"讨论 |
| `documentation` | documentation-structure, documentation-writing, changelog | 撰写文档、README/CHANGELOG 编辑 |
| `workflow` | git-workflow, github-flow, squash-merge, versioning, deployment | 分支操作、发布准备、合并 |
| `architecture` | ai-friendly-architecture, project-structure, error-codes, logging | 架构决策、项目设置 |

---

## 2. 激活协议

### 2.1 加载决策流程

```
用户请求到达
    │
    ▼
始终加载标准已就绪？ ──否──► 加载始终加载标准
    │
    是
    ▼
分析任务关键字与文件路径
    │
    ▼
匹配到按需域？ ──否──► 仅使用始终加载标准
    │
    是
    ▼
加载匹配域的标准
```

### 2.2 触发器匹配规则

| 触发器类型 | 示例 | 匹配域 |
|-----------|------|--------|
| 命令名称 | `/tdd`、`/bdd` | `testing` |
| 文件路径 | `tests/**`、`*.test.ts` | `testing` |
| 关键字 | "重构"、"安全" | `quality` |
| 工作流阶段 | "发布准备" | `workflow` |

---

## 相关标准

- [项目情境记忆](project-context-memory.md)
- [AI 指令标准](../../../core/ai-instruction-standards.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
