---
source: ../../../../skills/retrospective-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7911a20c3dc1
status: current
scope: universal
description: |
  引导结构化团队回顾的指南。
  使用时机：详细的回顾引导、技巧深入解析、行动项追踪。
  Keywords: retrospective, retro, sprint, release, facilitation, action items, 回顾, 引导.
---

# 回顾助手指南

> **语言**: [English](../../../../skills/retrospective-assistant/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-26
**适用范围**: 所有软件团队
**范畴**: universal
**类型**: 有核心标准支撑的技能（core: retrospective-standards.md）

---

## 目的

不反思的团队不会进步。没有结构化的回顾，问题会持续存在、不满会不断累积，同样的错误会一再重演。一场运作良好的回顾能把抱怨转化为行动，并建立持续改进的文化。

本技能将回顾整合进 UDS 工作流程：

```
/incident (reactive) ←→ /retrospective (proactive) ←→ /metrics (data)
```

---

## 详细工作流程

### 阶段 1：PREPARE — 收集数据

在会议开始前，先收集客观数据作为讨论的依据。

**Sprint 回顾：**

```bash
# Recent commits since last retro
git log --oneline --since="2 weeks ago"

# PRs merged
gh pr list --state merged --search "merged:>2026-03-12"

# Open issues/bugs
gh issue list --label bug --state open
```

**Release 回顾：**

另外收集：
- 发布说明 / 变更日志
- 部署指标（成功率、回滚次数）
- 测试覆盖率变化
- 客户反馈 / 支持工单

---

### 阶段 2：GATHER — 收集观点

使用结构化技巧，确保每个人的声音都被听见。

**引导技巧：**

1. **先静默书写**（5 分钟）— 讨论前每个人先写下自己的想法。这能避免锚定效应，并确保内向的成员也能参与。
2. **轮流分享** — 每人每次分享一项，依序轮转直到所有项目都分享完毕。
3. **不打断** — 先完整聆听再回应。
4. **限定时间** — 为每个环节设定计时器。

#### 技巧：Start-Stop-Continue（详细）

| 环节 | 时长 | 提示语 |
|-------|----------|--------|
| 静默书写 | 5 分钟 | 「每个类别写 2-3 项」 |
| 分享 Start | 5 分钟 | 「我们应该采用哪些新做法？」 |
| 分享 Stop | 5 分钟 | 「哪些做法正在伤害我们？」 |
| 分享 Continue | 5 分钟 | 「哪些做法运作良好、应该保留？」 |
| 讨论 | 10 分钟 | 「哪些项目得票最多？」 |
| 行动项 | 5 分钟 | 「谁负责什么、何时完成？」 |

#### 技巧：Starfish（详细）

比 SSC 更细致。当团队需要更细的粒度时使用。

```
        More of
          │
 Start ───┼─── Keep
          │
 Stop ────┼─── Less of
```

- **More of**：已经在做但应该加强的事
- **Keep**：运作得完美的事 — 不要改变
- **Less of**：做得太多的事
- **Start**：要采用的全新做法
- **Stop**：要完全淘汰的事

#### 技巧：4Ls（详细）

以情绪为焦点。最适合用于团队士气与心理安全。

- **Liked**：「这个 Sprint 你喜欢什么？」（正能量）
- **Learned**：「你获得了哪些新知识？」（成长）
- **Lacked**：「缺少了什么或哪里不足？」（缺口）
- **Longed for**：「你希望有什么不同？」（期望）

#### 技巧：Sailboat（详细）

视觉化隐喻。在白板上画出：

```
                    🏝️ Island (Goal)
                   /
    💨 Wind ──── ⛵ ──── 🪨 Rocks (Risks)
   (Strengths)    |
                  ⚓ Anchor (Impediments)
```

---

### 阶段 3：ANALYZE — 找出模式

收集完毕后，将相关项目归纳为主题：

1. **亲和图** — 把相似的项目聚在一起
2. **点数投票** — 每人有 3 票用于排定优先级
3. **找出根本原因** — 对得票最高的项目追问「为什么？」以深入挖掘

---

### 阶段 4：DECIDE — 制定行动项

把排名前 1-3 的主题转化为具体的行动项。

**SMART 格式：**
- **S**pecific（具体）— 清楚、不含糊的描述
- **M**easurable（可衡量）— 我们怎么知道它完成了？
- **A**ssignable（可指派）— 单一负责人，而不是「整个团队」
- **R**ealistic（务实）— 一个迭代内可达成
- **T**ime-bound（有时限）— 有截止日期

**示例：**

| # | 行动 | 负责人 | 截止 | 指标 |
|---|--------|-------|-----|--------|
| 1 | 为 lint 加入 pre-commit hook | Alice | 2026-04-05 | CI 中零 lint 错误 |
| 2 | 以结对编程协助新人上手 | Bob | 2026-04-12 | 新开发者第 1 周就提交 PR |
| 3 | 将 PR 审查时间缩短至 < 24h | Carol | 2026-04-12 | 平均审查时间指标 |

---

### 阶段 5：TRACK — 持续跟进

这是大多数团队失败的地方。没有追踪，回顾就会沦为发牢骚的场合。

**每次回顾开始时：**

1. 调出上一次回顾的行动项
2. 逐项检视：已完成？进行中？受阻？
3. 庆祝已完成的项目
4. 重新评估停滞的项目（已开放 2 个以上周期）

---

## Release 回顾：额外环节

Release 回顾包含 Sprint 回顾的所有内容，另外加上：

### 指标比较

```markdown
## Metrics Summary
| Metric | This Release | Previous | Trend | Target |
|--------|-------------|----------|-------|--------|
| Stories delivered | 24 | 18 | ↑ +33% | 20 |
| Bugs found in QA | 3 | 7 | ↓ -57% | < 5 |
| Test coverage | 87% | 84% | ↑ +3% | 85% |
| Avg PR review time | 18h | 32h | ↓ -44% | < 24h |
| Deployment success | 100% | 90% | ↑ | 100% |
```

### 发布目标评估

```markdown
## Release Goals
| Goal | Status | Notes |
|------|--------|-------|
| Ship user dashboard v2 | ✅ Done | Delivered on time |
| Reduce API latency to < 200ms | ⚠️ Partial | P95 at 180ms, P99 at 350ms |
| Zero critical bugs at launch | ✅ Done | Clean launch |
```

---

## 常见错误

| 错误 | 影响 | 修正 |
|---------|--------|-----|
| 「太忙」时就跳过回顾 | 问题不断叠加 | 视为不可省略的固定仪式 |
| 只讨论负面问题 | 团队士气下滑 | 一定要包含「哪些做得好」 |
| 行动项没有负责人 | 什么都没完成 | 每一项都需要具名负责人 |
| 没有数据，只有感受 | 讨论原地打转 | 从指标开始 |
| 每次都用同一种技巧 | 回顾疲劳 | 轮换使用不同技巧 |

---

## 常见问题

**Q：这和 `/incident` 事后检讨有什么不同？**
A：`/incident` 是被动的（由故障/缺陷触发）。`/retrospective` 是主动的（在迭代/发布的节点定期安排）。触发条件不同、范围不同，两者是互补的实践。

**Q：多久做一次回顾？**
A：每个 Sprint/迭代一次。不使用 Sprint 的团队至少每月一次。Release 回顾则在每次发布后进行。

**Q：如果团队太小（1-2 人）怎么办？**
A：个人回顾依然有价值。使用相同的模板，但作为个人反思练习。AI 助手可以担任「思考伙伴」。

---

## 参考

- 核心规范：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 技能定义：[SKILL.md](./SKILL.md)
