---
source: ../../../../skills/adr-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 77b62e5cf96f
status: current
scope: universal
description: |
  创建与管理架构决策记录（ADR）的指南。
  使用时机：架构决策、技术选型、设计取舍。
  Keywords: ADR, architecture decision, decision record, trade-off, 架构决策, 决策记录.
---

# 架构决策记录助手指南

> **语言**: [English](../../../../skills/adr-assistant/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-26
**适用范围**: 所有软件项目
**范畴**: universal
**类型**: 有核心标准支撑的技能（core: adr-standards.md）

---

## 目的

开发过程中的技术决策常常遗失——埋没在 Slack 讨论串、会议记录中，或被彻底遗忘。当新成员加入，或几个月后重新审视系统时，「为什么要这样做？」这个问题找不到明确答案。

架构决策记录通过为重要决策建立轻量级、受版本控制的日志来解决这个问题：

```
Decision Made → ADR Written → Stored in Repo → Available Forever
```

本技能将 ADR 整合进 UDS 工作流程：

```
/brainstorm → /sdd → /adr → Implementation
                ▲       ▲
            Existing   (NEW)
```

---

## 详细工作流程

### 阶段 1：CAPTURE——定义决策背景

在分析选项之前，先清楚说明需要决定什么，以及为什么。

**步骤：**

1. **识别触发因素**——是什么事件或需求促成了这项决策？
   - 新功能需求
   - 性能瓶颈
   - 技术生命周期终止（end-of-life）
   - 扩展挑战

2. **定义约束**——哪些因素限制了解决方案的范围？
   - 预算／时程
   - 团队技能与产能
   - 与既有系统的兼容性
   - 法规要求

3. **列出决策驱动因素**——哪些准则最重要？
   - 性能 vs. 开发速度
   - 一致性 vs. 灵活性
   - 成本 vs. 能力

**示例：**

```markdown
## Context

Our API response times have degraded to 2s p95 as the user base grew
from 10K to 100K. The current monolithic architecture processes all
requests synchronously. We need to decide how to address this before
the next growth milestone (500K users, Q3 2026).

## Decision Drivers

- Must reduce p95 latency to < 500ms
- Team has strong experience in Python, limited in Go
- Budget for infrastructure is capped at $5K/month
- Must be implementable within 6 weeks
```

---

### 阶段 2：ANALYZE——评估选项

至少探索 2 个选项。针对每个选项，记录：

| 方面 | 要记录的内容 |
|--------|----------------|
| **描述** | 此选项包含哪些内容？ |
| **优点** | 好处与优势 |
| **缺点** | 缺陷与风险 |
| **成本** | 实现工作量与持续成本 |
| **风险** | 可能出什么问题？ |

**比较矩阵模板：**

```markdown
| Criteria | Option 1: Cache | Option 2: CQRS | Option 3: Microservices |
|----------|-----------------|----------------|------------------------|
| Latency improvement | Moderate | High | High |
| Implementation effort | Low (2 weeks) | Medium (4 weeks) | High (8+ weeks) |
| Team familiarity | High | Medium | Low |
| Operational complexity | Low | Medium | High |
| Future scalability | Limited | Good | Excellent |
```

---

### 阶段 3：DECIDE——选择并说明理由

选择最能满足决策驱动因素的选项。理由说明应当：

1. **引用驱动因素**——说明所选选项如何满足各项准则
2. **承认权衡取舍**——坦白说明你放弃了什么
3. **解释为何否决其他方案**——帮助未来的读者理解推理过程

**示例：**

```markdown
## Decision Outcome

Chosen option: **Option 2: CQRS**, because it provides the best
balance of latency improvement and implementation feasibility.

- Meets the < 500ms p95 target (estimated 200ms with read replicas)
- Implementable within 4 weeks by the existing team
- Option 1 (caching) was rejected: insufficient for 500K users
- Option 3 (microservices) was rejected: exceeds 6-week timeline
```

---

### 阶段 4：RECORD——撰写 ADR 文件

依照 `core/adr-standards.md` 的标准模板生成 ADR。

**文件命名：** `ADR-NNN-short-description.md`

**决定下一个编号：**
1. 检查 `docs/adr/` 中既有的 ADR
2. 使用下一个连续编号
3. 若尚无任何 ADR，从 `ADR-001` 开始

---

### 阶段 5：LINK——交叉引用

在 ADR 与相关产物之间建立双向链接：

| 从 | 到 | 方式 |
|------|----|-----|
| ADR | SPEC | 在 ADR 的 `Technical Story` 字段加入 SPEC-ID |
| SPEC | ADR | 在 SPEC 的 Technical Design 章节加入 ADR 引用 |
| ADR | Code | 在代码注释中加入 ADR 引用：`// See ADR-003` |
| Code | ADR | 在 ADR 的 Links 章节加入代码文件路径 |
| ADR | PR | 在 PR 描述中引用 ADR |
| ADR | ADR | 链接相关或取代它的 ADR |

---

## 示例

### 示例 1：数据库选型

```markdown
# ADR-001: Use PostgreSQL for Primary Database

- **Status**: Accepted
- **Date**: 2026-03-15
- **Deciders**: Backend team
- **Technical Story**: SPEC-CORE-001

## Context

We are starting a new e-commerce platform and need to select a primary
database. The system will handle product catalog, user accounts, orders,
and inventory with an expected initial load of 10K concurrent users.

## Decision Drivers

- ACID compliance for financial transactions
- JSON support for flexible product attributes
- Team experience and hiring pool
- Managed service availability on AWS

## Considered Options

1. PostgreSQL
2. MySQL 8.0
3. MongoDB

## Decision Outcome

Chosen option: **PostgreSQL**, because it provides the best combination
of ACID compliance, JSON support (JSONB), and team familiarity.

### Consequences

**Good:**
- Native JSONB support eliminates need for separate document store
- Strong ecosystem (PostGIS, full-text search, extensions)
- Available as managed service (RDS, Aurora)

**Bad:**
- Slightly higher memory usage than MySQL for simple queries
- Team needs training on PostgreSQL-specific features (CTEs, window functions)

## Links

- [SPEC-CORE-001](../specs/SPEC-CORE-001-platform-architecture.md)
```

### 示例 2：取代既有决策

```markdown
# ADR-005: Migrate from REST to GraphQL for Mobile API

- **Status**: Accepted
- **Date**: 2026-06-01
- **Deciders**: Mobile team, Backend team
- **Technical Story**: SPEC-MOBILE-003
- **Supersedes**: [ADR-002](ADR-002-rest-api-design.md)

## Context

ADR-002 established REST as our API standard. After 6 months of mobile
development, we're experiencing significant over-fetching and
under-fetching issues, requiring multiple round-trips per screen.

[... rest of ADR ...]
```

---

## 常见错误

| 错误 | 影响 | 修正 |
|---------|--------|-----|
| 决策几周后才写 ADR | 背景与替代方案已被遗忘 | 在决策当下或决策后立即撰写 |
| 只列出所选选项 | 没有记录否决了什么及原因 | 始终包含至少 2 个替代方案 |
| 修改已接受的 ADR | 历史背景遗失 | 建立新的 ADR 来取代旧的 |
| ADR 写得过于详细 | 没人会读 | 控制在 1-2 页；链接到详细文档 |
| 未链接到代码 | ADR 与实现脱节 | 在 Links 章节加入代码引用 |

---

## 常见问题

**Q：ADR 和 SDD 规格有什么不同？**
A：SDD 规格定义*要建什么*和*怎么建*。ADR 记录*为什么*选择了某个方案而非其他。两者相辅相成——一份 SDD 可能引用多份 ADR。

**Q：每个技术决策都需要 ADR 吗？**
A：不需要。只有具长期影响的重要决策才需要。使用「6 个月法则」：如果 6 个月后有人可能问「为什么？」，就写一份 ADR。

**Q：ADR 可以被否决吗？**
A：可以。如果提议的 ADR 未被接受，直接删除即可。只有已接受的决策需要保留。

**Q：谁应该写 ADR？**
A：任何参与决策的人。实务上通常由技术负责人或架构师起草，再由团队审查。

---

## 参考

- 核心规范：[adr-standards.md](../../../../core/adr-standards.md)
- 技能定义：[SKILL.md](./SKILL.md)
