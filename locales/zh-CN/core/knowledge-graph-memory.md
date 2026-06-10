---
source: ../../../core/knowledge-graph-memory.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 6a5372029069
status: current
---

# Knowledge Graph Memory Standards（知识图记忆标准）

> **语言**: [English](../../../core/knowledge-graph-memory.md) | [繁體中文](../../zh-TW/core/knowledge-graph-memory.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-30
**适用范围**: 在「代码 + 规格／决策」语料上使用 AI 助手的项目
**Scope**: uds-specific

---

## 目的

本标准定义一套**关系 schema**，让规格、决策与代码能以图的方式遍历——回答如*「我若修改 `execute()`，会影响哪些规格与决策？」*的问题。它与向量／语义记忆（找出*相似*的产物）互补，提供**结构遍历**（找出*有关联*的产物）。

此 schema 与引擎无关：以纯 Markdown front-matter 表达，AI 助手可直接读取（降级模式），亦可由可选的图引擎（如 [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)）索引以进行多跳查询（服务模式）。

---

## 快速参考

### 关系 Front-Matter Schema

在规格／决策文件的 YAML front-matter 中加入以下可选字段：

| 字段 | 类型 | 方向 | 意义 |
|------|------|------|------|
| `related` | id 列表 | 无向 | 松散关联的产物 |
| `impacts` | spec id 列表 | this → spec | 此决策改动那些规格 |
| `impacted_by` | decision id 列表 | decision → this | 那些决策改动此规格 |
| `supersedes` | decision id 列表 | this → decision | 此决策取代那些决策 |
| `implements` | spec id 列表 | code/spec → spec | 此产物实现那些规格 |

id 为产物标识符（如 `XSPEC-205`、`DEC-062`、`ADR-001`）。内文的 `[[XSPEC-NNN]]` wiki 链接是等效但较低保真度的信号。

### 节点种类

| 前缀 | 节点种类 |
|------|---------|
| `XSPEC-*` / `SPEC-*` | Spec |
| `DEC-*` / `ADR-*` | Decision |
| 函数／类／模块（来自代码）| Code 节点 |

---

## 1. Schema

### 1.1 Front-Matter 示例

```markdown
---
id: XSPEC-205
title: Agent/Role Spec SDD Variant
status: Implemented
impacted_by: [DEC-062]
related: [XSPEC-204]
---
```

```markdown
---
id: DEC-069
title: EngramGraph Architecture
date: 2026-05-27
supersedes: [DEC-057]
impacts: [XSPEC-237]
---
```

### 1.2 边的推导

| 文件上的 front-matter | 推导出的边 |
|----------------------|-----------|
| Decision `impacts: [SPEC]` | `IMPACTS`（Decision → Spec）|
| Spec `impacted_by: [DEC]` | `IMPACTS`（Decision → Spec）|
| Decision `supersedes: [DEC]` | `SUPERSEDES`（Decision → Decision）|
| Decision 内文 `[[XSPEC-NNN]]` 链接 | `IMPACTS`（Decision → Spec）|

边是**幂等**的：同一关系从两端声明（决策的 `impacts` 与规格的 `impacted_by`）只产生一条边，不会重复。

---

## 2. 两种运作模式

本标准的消费者**必须**同时支持两种模式：

### 2.1 降级模式（无引擎）

AI 助手读取目标文件，沿其 front-matter／`[[ref]]` 链接读取被链接文件，手动组出影响链。随时可用；受限于助手能读取的文件数。

### 2.2 服务模式（有图引擎）

语料被索引进图引擎；助手发出单一多跳查询（如 `impact-analysis { nodeId, maxHops }`）取得完整链——包含降级模式会漏掉的跨域链接（code → spec → decision）。

> 正确实现在两种模式下产生**相同形状的答案**；服务模式只是更快更完整，并非本质不同。

---

## 3. Confidence（可选）

节点**可**带 `confidence`，范围 `[0.1, 1.0]`。反馈信号（测试通过／失败、人工修正、状态变更）演化 confidence，让读取时优先浮现最被强化的产物。confidence 有下限（永不归零），使连续失败无法抹除重要节点。此为自我演化图记忆（SAGE）的基础。

---

## 4. 规则

1. 关系字段**可选**且**附加**——缺少永不破坏工具。
2. 允许参照尚不存在的 id；它们成为 stub 节点，待目标文件出现时解析。
3. 从*拥有*该关系的一端声明（决策拥有 `impacts`/`supersedes`；规格拥有 `impacted_by`），但两端皆接受。
4. 图引擎为 **opt-in**。未设置引擎时工具**必须**优雅降级为 Markdown 读取。
5. 向量／语义记忆为**互补**而非取代——结构用图遍历，相似用向量。

---

## 相关标准

- [Project Context Memory](project-context-memory.md) — 每项目长期事实
- [Developer Memory](developer-memory.md) — 通用、可移植偏好
- [ADR Standards](adr-standards.md) — 馈入 Decision 节点的决策记录格式
