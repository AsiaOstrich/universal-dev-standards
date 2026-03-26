---
source: ../../../core/adr-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
---

# 架构决策记录（ADR）

> **语言**: [English](../../../core/adr-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-26
**适用范围**: 所有进行架构决策的软件项目
**范畴**: universal
**行业标准**: ISO/IEC/IEEE 42010（架构描述）、TOGAF ADR
**参考**: [Michael Nygard 的 ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)、[MADR](https://adr.github.io/madr/)

---

## 目的

架构决策记录捕捉重大技术决策的背景、选项和理由。它们作为决策日志，帮助当前和未来的团队成员了解架构为何如此设计。

---

## 何时撰写 ADR

| 撰写 ADR | 不需要 ADR |
|----------|-----------|
| 选择框架、库或平台 | 例行性依赖更新 |
| 定义 API 合约或数据格式 | 现有架构内的 Bug 修复 |
| 变更部署策略 | 代码风格或格式决策 |
| 建立编码模式或惯例 | 琐碎的实现选择 |
| 做出具有长期后果的取舍 | 已在其他地方记录的决策 |
| 偏离既有模式 | 遵循现有 ADR 指引 |

**经验法则**：如果 6 个月后有人可能会问「为什么要这样做？」，就写一份 ADR。

---

## ADR 模板

```markdown
# ADR-NNN: [决策标题]

- **Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
- **Date**: YYYY-MM-DD
- **Deciders**: [参与决策者]
- **Technical Story**: [相关 SPEC-ID、Issue 或 PR]

## Context（背景）

[描述引发此决策的技术或业务背景。]

## Decision Drivers（决策驱动因素）

- [驱动因素 1]
- [驱动因素 2]

## Considered Options（考虑的选项）

1. [选项 1]
2. [选项 2]
3. [选项 3]

## Decision Outcome（决策结果）

选择 **[选项 N]**，因为 [理由]。

### Consequences（后果）

**Good:**
- [正面结果]

**Bad:**
- [负面结果或取舍]

## Links（相关链接）

- [相关 ADR、SPEC、PR]
```

---

## 状态生命周期

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| 状态 | 说明 |
|------|------|
| **Proposed** | 讨论中，尚未决定 |
| **Accepted** | 决策生效，应遵循 |
| **Deprecated** | 不再适用 |
| **Superseded** | 已被更新的 ADR 取代 |

### 规则

1. 永远不要将 **Accepted** 的 ADR 改回 **Proposed**。改为建立新 ADR 取代它。
2. **Deprecated** 和 **Superseded** 是终态。

---

## 存放惯例

```
docs/adr/
├── ADR-001-use-postgresql.md
├── ADR-002-adopt-event-sourcing.md
└── README.md          # ADR 索引（可选）
```

- 格式：`ADR-NNN-short-description.md`
- 描述部分使用 kebab-case。

---

## 最佳实践

1. **在决策当下撰写 ADR** — 不要等到几周后背景已遗忘。
2. **保持简短** — 最多 1-2 页。
3. **包含被排除的选项** — 知道什么没有被选择与知道什么被选择一样有价值。
4. **双向链接** — ADR 引用代码；代码引用 ADR。
5. **定期审查** — 在架构审查时标记过时的 ADR 为 deprecated。
6. **存放在版本控制中** — ADR 应与其管辖的代码一起存放。
