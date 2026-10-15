---
source: ../../../core/retrospective-standards.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: c2c2bb863693
status: current
---

# 回顾标准

> **语言**: [English](../../../core/retrospective-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-08-24
**适用范围**: 所有实践迭代开发的软件团队
**范畴**: universal
**行业标准**: Scrum Guide (Sprint Retrospective), CMMI Level 3, ISO/IEC 12207 §6.3.6
**参考资料**: [Scrum Guide](https://scrumguides.org/), [Fun Retrospectives](https://www.funretrospectives.com/)

---

## 目的

回顾是结构化的团队反思，识别做得好的、需要改善的，以及改善流程的具体行动。它们是敏捷方法论中的关键实践，也是流程成熟度（CMMI Level 3）的一项要求。

---

## 何时举行回顾

| 类型 | 时间 | 时长 | 焦点 |
|------|------|----------|-------|
| **Sprint** | 每次迭代结束时 | 30-60 分钟 | 团队流程、协作、工具 |
| **Release** | 每次发布后 | 60-90 分钟 | 交付质量、周期指标、跨团队协调 |

### 与事后复盘的区别

| 方面 | 回顾 | 事后复盘（事故） |
|--------|--------------|----------------------|
| **触发条件** | 计划中（迭代/发布结束时） | 响应式（事故发生后） |
| **基调** | 聚焦改善 | 聚焦根因 |
| **范围** | 整个流程 | 特定事故 |
| **频率** | 定期（每 1-4 周） | 按需 |

---

## 回顾工作流

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  准备资料    收集意见    分析归纳    决定行动    追踪落实
```

### 阶段 1: PREPARE

在会议前收集数据，让讨论基于事实展开。

| 数据源 | 收集内容 |
|------------|----------------|
| Git log | 提交、已合并的 PR、分支 |
| 问题追踪器 | 已完成的用户故事、发现的缺陷 |
| CI/CD | 构建成功率、部署频率 |
| 指标 | 速率、周期时间、测试覆盖率 |

### 阶段 2: GATHER

使用结构化技法收集团队观点（见下文）。

**基本规则：**
- 关注流程，对事不对人
- 不指责 — 探寻系统性根因
- 全员参与
- 每个环节设置时间盒

### 阶段 3: ANALYZE

对相似条目进行分组，识别跨主题的模式。

### 阶段 4: DECIDE

选出最优先关注的 1-3 个改善点。每一项都转化为一个行动项目。

**行动项目格式：**

| 字段 | 描述 |
|-------|-------------|
| **Action** | 具体、可操作的描述 |
| **Owner** | 单一负责人 |
| **Due Date** | 目标完成日期 |
| **Status** | Open → In Progress → Done |
| **Metric** | 如何衡量成功（可选） |

### 阶段 5: TRACK

在下次回顾开始时，检视先前的行动项目。

---

## 引导技法

### Start-Stop-Continue（默认）

最简单且最常见的技法。适合快速回顾。

| 类别 | 问题 |
|----------|---------|
| **Start** | 我们应该开始做什么？ |
| **Stop** | 我们应该停止做什么？ |
| **Continue** | 我们应该继续保持做什么？ |

### Starfish

比 Start-Stop-Continue 更细致。适合更深入的分析。

| 类别 | 问题 |
|----------|---------|
| **More of** | 我们应该多做什么？ |
| **Keep** | 我们应该保持原样做什么？ |
| **Less of** | 我们应该少做什么？ |
| **Start** | 我们应该开始做什么？ |
| **Stop** | 我们应该停止做什么？ |

### 4Ls

关注情绪与学习。适合团队建设。

| 类别 | 问题 |
|----------|---------|
| **Liked** | 你喜欢什么？ |
| **Learned** | 你学到了什么？ |
| **Lacked** | 缺少了什么？ |
| **Longed for** | 你渴望拥有什么？ |

### Sailboat

视觉隐喻。适合富有创造力的团队。

| 元素 | 含义 |
|---------|---------|
| **Wind** | 推动我们前进的力量（优势） |
| **Anchor** | 阻碍我们前进的力量（阻碍） |
| **Rocks** | 前方的风险 |
| **Island** | 我们的目标 / 目的地 |

---

## 回顾报告模板

```markdown
# Retrospective: [Sprint N / Release vX.Y.Z]

- **Type**: [Sprint | Release]
- **Date**: YYYY-MM-DD
- **Participants**: [names]
- **Facilitator**: [name]
- **Technique**: [Start-Stop-Continue | Starfish | 4Ls | Sailboat]

## Previous Action Items Review
| # | Action | Owner | Status | Notes |
|---|--------|-------|--------|-------|
| 1 | [from last retro] | [person] | Done/Open | [update] |

## [Technique-specific sections]
(e.g., Start / Stop / Continue for SSC technique)

## Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | [description] | [person] | YYYY-MM-DD | Open |

## Key Learnings
- [learning 1]
- [learning 2]

## Metrics Summary (Release retrospective only)
| Metric | This Release | Previous | Trend |
|--------|-------------|----------|-------|
| Velocity | [value] | [value] | ↑/↓/→ |
| Bug Rate | [value] | [value] | ↑/↓/→ |
| Test Coverage | [%] | [%] | ↑/↓/→ |
| Cycle Time | [days] | [days] | ↑/↓/→ |
```

---

## 存放规范

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # Index (optional)
```

### 文件命名

- 格式：`RETRO-YYYY-MM-DD-[type]-[identifier].md`
- Sprint: `RETRO-2026-03-15-sprint-12.md`
- Release: `RETRO-2026-03-26-release-v5.1.0.md`

---

## 行动项目生命周期

```
Open ──► In Progress ──► Done
  │
  └──► Cancelled (with reason)
```

> Retrospective 记下的**延后项目**（`Action Items`、`Previous Action Items Review` 中仍为 Open 的行、附带理由 Cancelled 的项目）受 [deferred-item-exit](../../../core/deferred-item-exit.md) 约束。

### 追踪规则

1. 每次回顾**开始**时，先检视所有未完成的行动项目。
2. 超过 **2 个回顾周期**仍未完成的行动项目应重新评估（升级、重新定义或取消）。
3. 每次回顾最多 **3 个行动项目**。专注胜于广泛。
4. 每个行动项目必须有**单一负责人**（不能是“团队”）。

---

## 反模式

| 反模式 | 问题 | 修复方案 |
|-------------|---------|-----|
| 跳过回顾 | 流程债务累积 | 将其定为不可妥协的例会仪式 |
| 指责游戏 | 成员停止参与 | 严格执行“对事不对人”规则 |
| 没有行动项目 | 回顾沦为情绪发泄 | 务必以 1-3 个具体行动结束 |
| 行动项目过多 | 一事无成 | 限制最多 3 项，果断划分优先级 |
| 从不检视过去的行动 | 行动被遗忘 | 始终以检视先前的行动开始 |
| 总是同一位引导者 | 产生视角偏见 | 轮流担任引导者角色 |
| 只有声音大的人发言 | 遗漏不同视角 | 在讨论前采用静默书写 |

---

## 最佳实践

1. **定期举行回顾** — 一致性建立信任与习惯。
2. **变换技法** — 相同的形式会变得枯燥；轮换使用不同技法。
3. **严格控制时间盒** — Sprint 最多 60 分钟，Release 最多 90 分钟。
4. **以数据开始** — 让讨论基于指标而非感觉。
5. **以承诺结尾** — 每次回顾产出 1-3 个行动项目。
6. **追踪落实** — 追踪并检视行动；这是创造价值的地方。
7. **营造心理安全感** — 回顾中的发言仅保留在回顾内。
8. **庆祝成功** — 不要只关注问题；肯定做得好的地方。
