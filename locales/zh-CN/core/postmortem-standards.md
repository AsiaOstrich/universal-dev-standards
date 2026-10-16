---
source: ../../../core/postmortem-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 4c7e331d2668
status: current
---

# Postmortem 标准（无责事后检讨）

> **语言**: [English](../../../core/postmortem-standards.md) | [繁體中文](../../zh-TW/core/postmortem-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有具有生产服务的软件项目
**范围**: universal
**行业标准**: Google SRE, Etsy Debriefing, CMMI Level 3
**参考资料**: [sre.google](https://sre.google/), [Etsy Code as Craft](https://www.etsy.com/codeascraft)

---

## 概述

本文件定义生产环境事件后进行无责 Postmortem 的标准。Postmortem 是一个结构化流程，用于分析发生了什么、为什么发生、以及如何防止再次发生 — 不归咎于个人。

事件响应工作流程（检测 → 分级 → 缓解 → 解决）请参阅 [Incident Response Assistant](../skills/incident-response-assistant/SKILL.md)。

---

## 触发条件

### 强制执行

以下条件必须触发完整的 Postmortem：

| 条件 | 理由 |
|------|------|
| **SEV-1 事件**（一律） | 任何完全服务中断都需要彻底分析 |
| **SEV-2 事件持续 > 1 小时** | 延长的部分中断表明存在系统性问题 |
| **任何涉及数据丢失的事件** | 数据丢失具有不可逆后果 |
| **任何造成 SLA 违反的事件** | SLA 违规有合同影响 |
| **任何涉及安全漏洞的事件** | 安全事件需要详细取证分析 |

### 建议执行

以下条件应当触发 Postmortem（完整或简化版）：

| 条件 | 理由 |
|------|------|
| SEV-2 事件持续 < 1 小时 | 短暂但重大；可能揭示系统性风险 |
| SEV-3 重复事件（30 天内 2 次以上，相同根因） | 重复发生表明存在未解决的系统性问题 |
| 具有重大潜在影响的 Near-miss | 无实际损害的学习机会 |
| 团队成员请求 | 任何人都可以请求进行学习型检讨 |

### 免除

在以下情况下可以跳过 Postmortem：

| 条件 | 理由 |
|------|------|
| SEV-3/SEV-4 首次发生且根因明确 | 修复简单，学习价值低 |
| 现有 Postmortem 已涵盖相同根因且有活跃的行动项 | 避免重复分析 |
| 纯外部因素（第三方中断）且内部无法采取任何行动 | 仅记录在事件日志中 |

---

## 无责原则

### 核心信念

| 原则 | 说明 |
|------|------|
| **人会犯错** | 错误是复杂系统的自然产物，不是个人缺陷 |
| **聚焦系统** | 分析系统如何允许错误发生，而非谁犯了错 |
| **心理安全** | 参与者可以公开分享，不必担心惩罚 |
| **学习导向** | 目标是学习和改善，不是追究责任 |
| **行为描述** | 使用“发生了 X”的表述，而非“人员 Y 做了 X” |

### 语言指南

编写 Postmortem 时应使用聚焦于系统的语言：

| ✅ 良好（系统聚焦） | ❌ 不良（归咎聚焦） |
|---------------------|-------------------|
| “部署包含未覆盖的边界案例” | “工程师 A 部署了有 Bug 的代码” |
| “监控系统未在 5 分钟内检测到异常” | “值班工程师忽略了告警” |
| “代码审查流程未能捕获此模式” | “审查人员审查不仔细” |
| “Runbook 缺乏针对此故障模式的步骤” | “运维人员不知道该做什么” |
| “测试套件未覆盖此场景” | “没有人为此编写测试” |

### 心理安全

为维持无责文化：
- 引导人在每次 Postmortem 会议开始时明确重申无责原则
- 若出现归咎倾向的语言，引导人应将其重新引导至聚焦系统的表述
- Postmortem 文档在发布前须审查其是否符合无责语言规范
- 管理层承诺不对基于 Postmortem 的发现采取惩罚性措施

---

## Postmortem 流程

### 时间线（事件解决 → 最终报告）

| 里程碑 | 截止时间 | 负责人 | 活动 |
|--------|----------|--------|------|
| **收集时间线与事实** | 事件解决后 24 小时内 | Incident Commander | 收集日志、指标、聊天记录、所做决策 |
| **编写 Postmortem 草案** | 事件解决后 48 小时内 | Incident Commander | 使用模板起草，包含初步根因 |
| **召开 Postmortem 会议** | 草案完成后 3 个工作日内 | 所有相关方 | 审查时间线、执行 RCA、就行动项达成一致 |
| **定稿并发布** | 会议后 24 小时内 | Incident Commander | 整合会议反馈，发布至知识库 |
| **跟踪行动项** | 持续进行 | 各行动项负责人 | 执行、汇报状态、验证有效性 |

### 会议引导指南

建议会议时长：**60-90 分钟**

| 环节 | 时长 | 内容 | 引导人行动 |
|------|------|------|------------|
| **开场** | 5 分钟 | 重申无责原则；阐明会议目的 | 大声朗读无责信念 |
| **时间线审查** | 15 分钟 | 逐步梳理事件时间线 | 征求更正和补充 |
| **影响评估** | 10 分钟 | 确认受影响用户、收入影响、SLO 影响 | 用数据量化，而非估算 |
| **根因分析** | 20 分钟 | 使用结构化 RCA 方法（见下文） | 引导分析，纠正指责倾向 |
| **改进想法** | 15 分钟 | 提出行动项；分配负责人和截止日期 | 确保每项均符合 SMART 原则 |
| **总结** | 5 分钟 | 确认关键经验教训和后续步骤 | 宣读行动项 |

---

## 根因分析方法

### 方法选择指南

| 方法 | 最适用于 | 步骤 |
|------|----------|------|
| **5 Whys** | 线性因果链，单一根因 | 迭代询问“为什么？”，直到找出系统性原因 |
| **Ishikawa (Fishbone)** | 多因素问题，需要分类思考 | 按人员、流程、工具、环境对原因进行分类 |
| **Fault Tree Analysis (FTA)** | 复杂系统，多条故障路径 | 将顶事件分解为与/或逻辑树 |
| **Timeline Analysis** | 时间相关问题，多个参与者 | 按时间顺序排列所有事件和决策 |
| **Change Analysis** | 怀疑近期变更为故障原因 | 比较已变更组件的前后状态 |

### 5 Whys 示例

```
1. Why did the service go down?
   → Database connection pool exhausted

2. Why did the connection pool exhaust?
   → Slow queries holding connections

3. Why were there slow queries?
   → New feature introduced a full table scan

4. Why didn't code review catch it?
   → No automated query performance analysis in CI

5. Why no automated analysis?
   → ROOT CAUSE: CI/CD pipeline lacks SQL performance analysis step
```

### Root Cause vs Trigger vs Contributing Factor

| 类型 | 定义 | 示例 |
|------|------|------|
| **Root Cause** | 若移除，事件不会发生 | CI/CD 缺乏 SQL 性能分析步骤 |
| **Trigger** | 直接引发事件的事件 | 新功能部署 |
| **Contributing Factor** | 加重了影响但并非根因 | 监控告警延迟 10 分钟 |

---

## Postmortem 模板

### 完整模板

```markdown
# Postmortem: [Incident Title]

## Summary
| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Severity | SEV-N |
| Duration | Xh Ym |
| Incident Commander | @name |
| Status | Draft / Final |

## Impact Assessment
- **Affected users**: N (X% of total users)
- **Affected features**: [feature list]
- **Revenue impact**: $N (if applicable)
- **SLA impact**: Breached? Remaining Error Budget?
- **Data impact**: Any data loss or corruption?

## Timeline
| Time (UTC) | Event | Detection Method |
|------------|-------|-----------------|
| HH:MM | [Event description] | Alert / User report / Monitoring |

## Root Cause Analysis
### Method: [5 Whys / Ishikawa / FTA / Timeline / Change]
[Analysis process and findings]

### Classification
- **Root Cause**: [description]
- **Trigger**: [description]
- **Contributing Factors**: [description 1], [description 2]

## Detection and Response Review
| Aspect | Performance | Rating | Improvement Area |
|--------|------------|--------|-----------------|
| Detection speed | Alert fired in X min | ⭐⭐⭐ | [if any] |
| Response speed | IC assigned in X min | ⭐⭐⭐ | [if any] |
| Mitigation efficiency | Mitigation in Y min | ⭐⭐ | [if any] |
| Communication quality | Stakeholders notified in X min | ⭐⭐⭐ | [if any] |

## What Went Well
1. [Commendable response behavior]
2. [Effective tool or process]

## What Needs Improvement
1. [Process gap]
2. [Tool deficiency]

## Action Items
| ID | Action | Type | Owner | Due Date | Priority | Status |
|----|--------|------|-------|----------|----------|--------|
| AI-1 | [Description] | Prevent/Detect/Mitigate/Process | @name | YYYY-MM-DD | P0 | Open |

## Related Documents
- Incident ticket: [link]
- Related postmortems: [links]
- Updated runbooks: [links]

## Review Record
| Date | Reviewer | Result |
|------|----------|--------|
| YYYY-MM-DD | @name | Approved |
```

### 简化模板

适用于不需要完整 postmortem 的较低严重度或重复发生的事件：

```markdown
# Simplified Postmortem: [Incident Title]

- **Date**: YYYY-MM-DD | **Severity**: SEV-N | **Duration**: Xh Ym
- **Root Cause**: [One-line description]
- **Fix**: [One-line description of the fix applied]
- **Action Items**:
  - [ ] [Action] — @owner — YYYY-MM-DD
- **Related**: [Link to full postmortem if exists]
```

---

## Action Items 生命周期

### 分类（Prevent / Detect / Mitigate / Process）

| 类型 | 目的 | 示例 |
|------|------|------|
| **Prevent** | 防止根因再次发生 | 添加 SQL 性能 CI 检查 |
| **Detect** | 下次更早检测到问题 | 添加连接池利用率告警 |
| **Mitigate** | 缩减影响范围和持续时间 | 实现自动熔断器 |
| **Process** | 改进响应流程 | 更新值班交接检查清单 |

> **移交至技术债跟踪**：属于长期设计/架构整改（而非随事件一起关闭的快速修复）的 Prevent/Mitigate 行动项目必须按照 [tech-debt-standards](tech-debt-standards.md) 登记在技术债登记册中，并注明 `Source = postmortem PM-<id>` —— 从而确保其获得预算并得到跟踪，而不是在事件关闭后遗失。

### 状态跟踪

```
Open ──► In Progress ──► Done ──► Verified
               │
               └─► Blocked ──────────────►
```

| 状态 | 说明 |
|------|------|
| **Open** | 已识别，尚未开始 |
| **In Progress** | 工作正在进行中 |
| **Done** | 修复已实现 |
| **Verified** | 已确认有效（例如：经过测试、经受住下一次事件的检验） |
| **Blocked** | 无法继续；需要依赖项或决策 |

### 完成率报告

定期生成行动项目完成情况报告：

| 指标 | 目标 |
|------|------|
| 总体完成率（90 天内） | > 80% |
| 14 天内完成的 P0 行动项目 | 100% |
| 平均完成时间 | < 30 天 |
| 逾期行动项目 | 最小化 |

### 逾期处理

| 逾期天数 | 行动 |
|----------|------|
| **7 天** | 通知行动项负责人 |
| **14 天** | 通知负责人的主管 |
| **30 天** | 升级至下一次回顾（retrospective）进行讨论 |

---

## 组织级学习

### 事件趋势分析

按以下 5 个维度每季度进行一次事件趋势分析：

| 维度 | 分析内容 | 行动 |
|------|----------|------|
| **根因类型分布** | 代码缺陷、配置错误、容量、外部依赖 | 针对最常见类别进行投入 |
| **服务分布** | 哪些服务的事件最多 | 优先安排可靠性投入 |
| **MTTR 趋势** | 平均恢复时间（Mean Time To Recovery）是否有所改善？ | 按季度环比跟踪 |
| **MTTD 趋势** | 平均检测时间（Mean Time To Detection）是否有所改善？ | 评估监控有效性 |
| **重复根因比例** | 是否出现相同的根因？ | 审查行动项目的有效性 |

### 学习到标准转化流水线

当趋势分析揭示系统性问题时：

| 发现 | 产出 |
|------|------|
| 重复的代码缺陷模式 | 更新核心标准（例如：添加新的 checkin-standards 检查） |
| 遇到新的故障模式 | 创建新的 Runbook（参见 [Runbook 标准](runbook-standards.md)） |
| 发现监控缺口 | 修改告警规则（参见 [告警标准](alerting-standards.md)） |
| 发现流程缺口 | 在下一次回顾中讨论（参见 [回顾标准](retrospective-standards.md)） |

### Postmortem 知识库

维护所有 postmortem 的可搜索知识库：

```
docs/postmortems/
├── README.md                    # Index by date, service, and root cause
├── 2026-03-15-api-outage.md
├── 2026-03-20-db-pool-exhaustion.md
└── 2026-03-28-payment-timeout.md
```

**索引应支持：**
- 按时间顺序列表（最新优先）
- 按服务名称筛选
- 按根因类别筛选
- 按关键词搜索

---

## 集成点

### 事件响应流程

```
Incident occurs
    │
    ▼
Incident Response (Detect → Triage → Mitigate → Resolve)
    │
    ▼ Incident resolved
    │
Postmortem Standards (Analyze → Document → Track → Learn)
    │
    ▼ Action Items
    │
    ├── Runbook Standards (update/create runbooks)
    ├── Alerting Standards (improve alert rules)
    └── Retrospective Standards (process improvement input)
```

### Runbook 更新

在 postmortem 之后，评估：
- 相关的 runbook 是否需要更新？→ 进行更新
- 这是否是没有对应 runbook 的新故障模式？→ 创建一个
- 将 postmortem 链接到 runbook 的版本历史

### 告警改进

在 postmortem 之后，评估：
- 告警是否及时且具备可操作性？→ 如果不是，更新告警规则
- 严重度是否恰当？→ 如有需要进行调整
- 是否存在遗漏的告警？→ 创建新告警

---

## Quick Reference Card

### 是否需要编写 Postmortem？
```
SEV-1?                    → Yes (always)
SEV-2 and > 1 hour?      → Yes
Data loss?                → Yes
SLA breach?               → Yes
Security breach?          → Yes
SEV-2 and < 1 hour?      → Recommended
SEV-3 recurring?          → Recommended (simplified)
SEV-3/4 first time?      → No (document in incident log)
```

### Postmortem 时间线
```
Incident resolved → 24h → Collect facts
                  → 48h → Write draft
                  → +3 biz days → Hold meeting
                  → +24h → Finalize & publish
                  → ongoing → Track action items
```

---

## 参考资料

- [Google SRE — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) — 无责 Postmortem 理念
- [Google SRE — Example Postmortem](https://sre.google/sre-book/example-postmortem/) — 真实环境 Postmortem 模板
- [Etsy — Blameless PostMortems](https://www.etsy.com/codeascraft) — Etsy 的无责文化实践方法
- [John Allspaw — Blameless Post-Mortems](https://www.etsy.com/codeascraft/blameless-postmortems/) — 关于无责理念的奠基性文章

---

**相关标准：**
- [告警标准](alerting-standards.md) — 告警设计与严重度
- [Runbook 标准](runbook-standards.md) — Runbook 创建与维护
- [可观测性标准](observability-standards.md) — 监控与检测
- [回顾标准](retrospective-standards.md) — 定期流程改进

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始发布：触发条件、无责原则、RCA 方法、模板、行动项生命周期、组织学习 |

---

## 许可

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
