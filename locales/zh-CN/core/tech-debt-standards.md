---
source: ../../../core/tech-debt-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: 85337eebbcf4
status: current
---

# 技术债管理标准

> **语言**: [English](../../../core/tech-debt-standards.md) | [繁體中文](../../zh-TW/core/tech-debt-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-08-20
**适用范围**: 所有软件项目
**范围**: 通用
**行业标准**: Martin Fowler's Technical Debt Quadrant、Ward Cunningham's Debt Metaphor
**参考资料**: [martinfowler.com/bliki/TechnicalDebt](https://martinfowler.com/bliki/TechnicalDebt.html)

---

## 概述

技术债代表因当前选择权宜之计而非耗时更长的更佳方案所产生的未来重工隐含成本。本标准定义如何在整个软件开发生命周期中分类、登记、排序、预算、衡量及追踪技术债。

---

## 1. 技术债类型

所有技术债均属于以下六个类别之一：

| 类型 | 说明 | 示例 |
|------|------|------|
| **Design Debt** | 架构捷径或次优设计决策 | 缺少抽象层、紧耦合、分层破坏 |
| **Code Debt** | 增加维护负担的代码质量问题 | 重复代码、过长方法、Magic Number、死代码 |
| **Test Debt** | 不足或低质量的测试覆盖 | 缺少单元测试、不稳定测试、无集成测试 |
| **Documentation Debt** | 缺失、过时或不准确的文档 | 未文档化的 API、过时的 README、缺失架构文档 |
| **Dependency Debt** | 过时、有漏洞或不必要的依赖 | 未修补的库、已弃用框架、未使用软件包 |
| **Infrastructure Debt** | 次优的构建、部署或运维工具 | 手动部署、缺少监控、过时的 CI/CD |

### 蓄意 vs 非蓄意债务

技术债可通过两种截然不同的模式引入：

| 模式 | 说明 | 示例 |
|------|------|------|
| **Deliberate** | 在意识到后果的情况下有意识地选择捷径 | “我们知道这不是正确的抽象，但我们需要在周五前发布” |
| **Inadvertent** | 因缺乏知识或疏忽而引入的无意债务 | “我们没有意识到这种模式会导致扩展性问题” |

蓄意债务应始终立即登记。非蓄意债务应在发现后立即登记。

---

## 2. 技术债登记表

### 登记表模板

每个技术债项目必须记录在包含以下 11 个字段的登记表中：

| # | 字段 | 说明 | 示例 |
|---|------|------|------|
| 1 | **ID** | 使用 `TD-NNN` 格式的唯一标识符 | TD-001 |
| 2 | **Title** | 简短描述性标题 | "Monolithic auth module needs decomposition" |
| 3 | **Type** | 上述 6 种债务类型之一 | Design |
| 4 | **Source** | 债务引入方式（deliberate / inadvertent / incident-postmortem —— 参见 [postmortem-standards](postmortem-standards.md) 行动项移交） | Deliberate（或 `postmortem PM-042`） |
| 5 | **Impact** | 业务与技术影响描述 | "Slows feature development by ~2 days per sprint" |
| 6 | **Estimated Cost** | 解决所需工作量（故事点或人天） | 8 story points |
| 7 | **Interest** | 不解决的持续成本（参见利息类型） | 1 day/sprint additional debugging |
| 8 | **Priority** | 影响矩阵确定的优先级（P0-P3） | P1 |
| 9 | **Owner** | 负责解决的团队或个人 | @backend-team |
| 10 | **Created Date** | 登记债务的日期 | 2026-01-15 |
| 11 | **Target Resolution Date** | 计划解决日期 | 2026-Q2 |

### 登记表存储选项

登记表可存放于下列任一位置。每个选项**只有在**同时满足右栏条件时才合法 —— 参见下文[到期处置](#overdue-handling)。

| 选项 | 适用对象 | 格式 | 到期检查条件 |
|------|---------|------|-------------|
| `docs/tech-debt-registry.md` | 小型团队、简单追踪 | Markdown 表格 | 有一个仓库检查会解析该表格，并在有行超过 Target Resolution Date 时失败 —— **或**该文件带有“无人看管声明” |
| Issue tracker（GitHub Issues、Jira） | 较大团队、工作流集成 | 带有 `tech-debt` 标签的 issue | 针对截止日期字段的定时查询实际会**执行**并发出告警；没有人打开的保存筛选条件不算检查 —— **或**带有“无人看管声明” |
| 专用电子表格 | 非技术利益相关者 | 包含 11 个字段的 CSV/Excel | 仅当该表以明确频率导出到某个会被检查读取的位置时才合法 —— **或**带有“无人看管声明” |

> **这一栏为什么必须加。** 一份没有任何程序读得到的登记表，满足本节其余每一条要求：11 个字段齐全、指定了 Owner、设定了 Target Resolution Date。它没有任何地方是错的 —— 直到日期过了，然后什么都没发生。电子表格选项被刻意**保留**；电子表格往往是资助这项工作的人唯一会打开的格式。不再合法的是让任何一种存储选项成为日期在无人察觉中过期的地方。

### 到期处置

一个过了却没有任何后果的 **Target Resolution Date**，与根本没有设定日期无异。本小节定义“日期到了”是什么意思。

#### 三种合法处置

当项目到达其 Target Resolution Date 时，必须且只能发生下列三件事之一，并且必须留下痕迹：

| 处置 | 含义 | 必留痕迹 |
|------|------|---------|
| **Resolve** | 把事情做完 | 关闭登记条目 + `Tech-Debt: TD-NNN resolved` commit footer（参见 [Commit 标记](#6-commit-marking)） |
| **Withdraw** | 决定不做，并删除该条记录 | 标记条目为已撤销，附带理由与日期。它不再被计为技术债，因为它已经不再是技术债了 |
| **Extend** | 设定新的 Target Resolution Date | 新日期**与**书面理由一起记录；先前的日期保持可见（追加，不要覆盖） |

没有第四种处置。“仍然开启、日期已过、无人过问”不是本标准允许的状态 —— 这正是本小节旨在指明的失败。

**规则 TD-EXP-001（必要）** —— 项目超过 Target Resolution Date 且未应用上述三种处置中的任何一种，将使该登记表不合规。逾期是一项发现项，而不是中性的背景状态。

**规则 TD-EXP-002（必要，禁止事项）** —— 到期**不得**实现为**自动延期**或**自动关闭**。

- 自动延期使日期变得不可证伪：它永远不会被错过，因此它从未衡量过任何东西。
- 自动关闭在没有任何人做出决定的情况下删除了记录。

两者都会停止时钟，且都没有留下时钟已停止的痕迹。一个唯一的消费者是“将其向前推移的任务”的日期，纯粹是摆设。

**规则 TD-EXP-003（必要）** —— 延期必须在新日期旁记录理由。只修改日期不是延期；而是一次带有时间戳的抹除。

**规则 TD-EXP-004（建议）** —— 延期三次或以上且在延期期间未记录任何进展的项目，应重新分流为 **Withdraw** 候选。反复延期证明没有人打算做这项工作；诚实地记录这一点，比写下第四个日期对下一位读者更有用。

#### 无人看管声明

并非每个团队都能运行检查。**没有自动化到期检查的登记表仍然合规 —— 但前提是必须明确声明。**

**无人看管声明**是登记表内部可见且带有日期的一段陈述：

```
Unattended — no automated check reads this registry for overdue items.
Reviewed manually by <owner> on a <cadence> cadence. Last reviewed: <date>.
```

**规则 TD-EXP-005（必要）** —— 登记表必须处于以下两种状态之一，且必须使任何阅读登记表的人都能明确知晓其处于哪种状态：

1. **Checked** —— 有一个具名的、可运行的检查会读取该登记表，并在项目超过 Target Resolution Date 时失败。
2. **Unattended** —— 不存在此类检查，但存在一份无人看管声明，且声明中指明了负责人、复查频率以及最后复查日期。

处于任一其他状态的登记表均视为不合规。该声明并非形式主义：它就是“知道没有任何程序在监控的读者”与“假设有程序在监控的读者”之间的全部差别。

**规则 TD-EXP-006（必要）** —— 无人看管声明中的“最后复查日期（Last reviewed）”本身受该声明所陈述的频率约束。最后复查日期早于其自身设定频率的声明，其本身就是一个逾期项目，三种处置同样适用于它。

> **本标准不附带任何检查器，这是一项已知成本 —— 在此处予以说明，而不是留待采用者自行发现。**
>
> UDS 定义了要求；但它并不提供执行该要求的程序。希望获得 **Checked** 状态的采用者必须自行编写该检查，而大多数团队不会这样做 —— 这正是上文所述的失败模式，如今同样适用于本节。
>
> 因此，这里的最低门槛**不是**“构建一个检查器”，而是**“绝不让登记表在无声中变成无人看管”**。声明 `Unattended` 仅需一个段落，并且完全合规。无人看管*却未作声明*是本标准真正禁止的唯一结果，因为只有这种结果会在是否有程序监控的问题上误导读者。

---

## 3. 预算分配

### 按团队状态划分的预算比例

团队应根据自身当前状态，将每个 Sprint 一定比例的产能分配给技术债偿还：

| 团队状态 | 预算 | 说明 |
|---------|------|------|
| **新项目**（< 6 个月） | **10%** | 预防性维护；尽早建立良好的模式 |
| **成熟项目**（6 个月以上，稳定） | **15%** | 持续性维护；防止债务累积 |
| **高债务项目**（严重债务积压） | **20-30%** | 积极偿还；恢复开发速率 |

### 预算使用追踪

团队必须追踪其技术债预算使用情况以确保权责明确：

1. **Sprint 计划会议（Sprint Planning）**：为债务工作预留相应比例的产能
2. **Sprint 评审会议（Sprint Review）**：汇报用于技术债偿还的实际耗时与预算的对比情况
3. **Sprint 回顾会议（Sprint Retrospective）**：评估预算分配是否合理，并在必要时进行调整
4. **季度报告（Quarterly Report）**：总结债务趋势、预算利用率以及对开发速率的影响

---

## 4. 优先级矩阵

### 3x3 影响 x 工作量矩阵

使用此矩阵根据影响（业务/技术严重程度）和工作量（解决成本）确定优先级：

|  | **低工作量** | **中工作量** | **高工作量** |
|--|------------|------------|------------|
| **高影响** | P0 — 立即 | P1 — 下个 Sprint | P1 — 下个 Sprint |
| **中影响** | P1 — 下个 Sprint | P2 — 本季度 | P2 — 本季度 |
| **低影响** | P2 — 本季度 | P3 — Backlog | P3 — Backlog |

### 优先级定义

| 等级 | 紧急程度 | SLA |
|------|---------|-----|
| **P0** | 严重 —— 阻碍开发或带来安全风险 | 在当前 Sprint 内解决 |
| **P1** | 高 —— 显著影响开发速率或质量 | 在下个 Sprint 内解决 |
| **P2** | 中 —— 影响明显但可控 | 在本季度内解决 |
| **P3** | 低 —— 当前影响极小，可能随时间增加 | 放入 Backlog，按季度复查 |

### 利息类型

技术债会产生“利息” —— 即不解决债务所带来的持续成本。追踪以下三类利息：

| 利息类型 | 说明 | 示例 |
|---------|------|------|
| **时间利息（Time Interest）** | 绕过债务所需的额外开发时间 | 由于复杂混乱的数据层，每个功能需额外耗费 2 小时 |
| **风险利息（Risk Interest）** | Bug、宕机或安全事件概率增加 | 带有已知 CVE 的未修补依赖 |
| **人才利息（Talent Interest）** | 对开发者体验、入职培训和人员留存的负面影响 | 由于缺乏架构文档，新员工达到正常生产力所需时间延长至 2 倍 |

---

## 5. 量化指标

追踪以下五项关键指标以监控技术债健康状况：

| # | 指标 | 公式 | 目标 |
|---|------|------|------|
| 1 | **总债务量（Total Debt Volume）** | 所有未关闭债务项目的数量 | 下降趋势 |
| 2 | **债务比率（Debt Ratio）** | 未关闭债务项目 / 总 backlog 项目 × 100% | < 15% |
| 3 | **平均存活时间（Average Age）** | 所有债务项目存活天数总和 / 债务项目数量 | < 90 天 |
| 4 | **类型分布（Type Distribution）** | 各类型数量 / 总债务项目 × 100% | 单一类型不超过 40% |
| 5 | **高优先级比率（High Priority Ratio）** | (P0 + P1 项目数) / 总债务项目 × 100% | < 20% |

### 汇报周期

| 频率 | 汇报内容 |
|------|---------|
| 每周 | 新增债务项目、已解决项目、P0/P1 状态 |
| 每月 | 全部 5 项指标及趋势分析 |
| 每季度 | 全面债务复查、预算调整建议 |

---

## 6. Commit 标记

### Commit Footer 格式

当 commit 引入或解决技术债时，在 commit message 中添加一行 footer：

**引入债务：**
```
feat(auth): add temporary session cache bypass

Skipping cache validation for admin sessions to meet launch deadline.

Tech-Debt: TD-042 introduced
```

**解决债务：**
```
refactor(auth): implement proper session cache validation

Replace temporary bypass with full cache validation pipeline.

Tech-Debt: TD-042 resolved
```

### 标记规则

1. 当 commit 有意引入技术债时，使用 `Tech-Debt: TD-NNN introduced` 格式
2. 当 commit 完全解决已登记的技术债项目时，使用 `Tech-Debt: TD-NNN resolved` 格式
3. TD-NNN 标识符必须与技术债登记表中的条目匹配
4. 单个 commit 可以引用多个债务项目（每行一个）
5. 部分解决应在 commit body 中描述进展，但不应标记为已解决

---

## 参考资料

- [Martin Fowler — Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) — 债务隐喻的原始解释
- [Martin Fowler — Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html) — 蓄意 vs 非蓄意分类
- [Ward Cunningham — Debt Metaphor](http://wiki.c2.com/?WardExplainsDebtMetaphor) — Ward Cunningham 提出的原始概念

---

**相关标准：**
- [代码审查清单](code-review-checklist.md) — 用于捕获新债务的审查流程
- [重构标准](refactoring-standards.md) — 解决代码债务的技术
- [测试标准](testing-standards.md) — 解决测试债务
- [Commit Message 指南](commit-message-guide.md) — 包含债务标记的 commit 格式
- [治理层](governance-layer.md) — 标准 #0；对待决决策与已接受风险应用相同的时钟，并定义汇总报告与新鲜度指标规则

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.1.0 | 2026-08-20 | 新增：到期处置 —— 到期时的三种合法处置（resolve / withdraw / extend-with-reason）、TD-EXP-001..006、禁止自动延期与自动关闭、将“无人看管声明”作为检查器的合规替代方案；登记表存储选项为每个选项增加了到期检查条件（没有任何程序能读取的登记表仅在声明无人看管时才合法） |
| 1.0.0 | 2026-03-31 | 初始发布：6 种债务类型、登记表模板、预算分配、优先级矩阵、量化指标、commit 标记 |

---

## 许可证

本标准在 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可下发布。
