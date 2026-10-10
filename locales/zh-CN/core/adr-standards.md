---
source: ../../../core/adr-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 929da01fb617
status: current
---

# 架构决策记录（ADR）

> **语言**: [English](../../../core/adr-standards.md) | [繁體中文](../../zh-TW/core/adr-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-08-24
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

## Context

[描述引发此决策的技术或业务背景。
问题或机会是什么？存在哪些限制？]

## Decision Drivers

- [驱动因素 1：例如性能要求]
- [驱动因素 2：例如团队专长]
- [驱动因素 3：例如预算限制]

## Considered Options

1. [选项 1]
2. [选项 2]
3. [选项 3]

## Decision Outcome

选择 **[选项 N]**，因为 [理由]。

### Consequences

**Good:**
- [正面结果 1]
- [正面结果 2]

**Bad:**
- [负面结果或取舍 1]
- [接受的风险 1]

**Neutral:**
- [既非正面也非负面的副作用]

## Links

- [相关 ADR、SPEC、PR 或外部参考]
```

> 此模板中记下的**延后项目**（`Consequences` 下的既受风险与负面后果、被考虑而未采用的选项）适用 [deferred-item-exit](../../../core/deferred-item-exit.md)。

---

## 验收标准放在 SPEC 里

一份 ADR 记录的是**决策**，它不带自己的一份验收标准。当一个决策有验收标准时，
它们**只在一处维护——SPEC**，而 ADR 以链接（`Technical Story` 或 `Links`）指向它。

一份被复制的 AC 清单有两个拥有者，而只有其中一个会被更新。实测后果是：
实现完成、SPEC 的勾选框打勾，ADR 那一份**整份留在未勾选状态**——
读 ADR 的人于是认为什么都没做，而读 SPEC 的 AC 覆盖率工具**根本看不到 ADR 里那一份**。

> 本条是关于 **AC 在哪里维护**的边界规则，不涉及 AC 的写法或标注惯例。AC 本身的格式见 [spec-driven-development](spec-driven-development.md)；AC 到验证的可追溯性见 [acceptance-criteria-traceability](acceptance-criteria-traceability.md)。

---

## ADR 编号

- 使用连续编号：`ADR-001`、`ADR-002` 等。
- 编号永不重复使用，即使 ADR 已被 deprecated。
- 多项目组织可加上项目识别前缀：`[PROJECT]-ADR-001`。

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
| **Deprecated** | 决策不再适用（例如功能已移除） |
| **Superseded** | 已被更新的 ADR 取代（附上链接） |

### 规则

1. **Proposed** 的 ADR 可以变成 **Accepted**，或被删除（若遭否决）。
2. **Accepted** 的 ADR 可以变成 **Deprecated** 或 **Superseded**。
3. **Deprecated** 和 **Superseded** 是终态。
4. 永远不要将 **Accepted** 的 ADR 改回 **Proposed**。改为建立新 ADR 取代它。

---

## 存放惯例

```
docs/adr/
├── ADR-001-use-postgresql.md
├── ADR-002-adopt-event-sourcing.md
├── ADR-003-migrate-to-kubernetes.md
└── README.md          # ADR index (optional)
```

### 文件命名

- 格式：`ADR-NNN-short-description.md`
- 描述部分使用 kebab-case。
- 描述保持在 5 个单词以内。

### 索引文件（可选）

在 `docs/adr/` 中维护一份列出所有 ADR 的 `README.md`：

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-use-postgresql.md) | Use PostgreSQL | Accepted | 2026-01-15 |
| [ADR-002](ADR-002-adopt-event-sourcing.md) | Adopt Event Sourcing | Superseded by ADR-005 | 2026-02-01 |
```

---

## 取代一份 ADR

当一个决策被取代时：

1. 以更新后的决策建立新的 ADR。
2. 在新 ADR 中加上：`Supersedes [ADR-NNN](ADR-NNN-old-title.md)`。
3. 将旧 ADR 的状态更新为：`Superseded by [ADR-NNN](ADR-NNN-new-title.md)`。
4. 保留旧 ADR 的内容不动，作为历史背景。

---

## 与其他产物的整合

| 产物 | 整合方式 |
|------|---------|
| **SDD 规格** | 在 Technical Design 区段引用 ADR |
| **代码注释** | 实现不明显的模式时链接 ADR：`// See ADR-003` |
| **PR 描述** | 架构变更时引用相关 ADR |
| **Commit 消息** | 在 footer 加上 `ADR-NNN` 以便追溯 |

---

## 质量检查清单

接受一份 ADR 前，确认：

- [ ] **Context** 清楚说明问题或机会
- [ ] 至少考虑过 **2 个选项**
- [ ] 明确列出 **决策驱动因素**
- [ ] **Consequences** 同时包含正面与负面结果
- [ ] **Status** 设置正确
- [ ] 附上相关产物的 **Links**
- [ ] 文件存放在 `docs/adr/` 且命名正确
- [ ] **没有把验收标准复制进 ADR**——改为链接到维护它们的 SPEC
- [ ] 每个**延后项目**都带有其出口的识别码（[deferred-item-exit](../../../core/deferred-item-exit.md)）

---

## 反模式

| 反模式 | 问题 | 修正 |
|-------|------|------|
| 事后才写 ADR | 缺少真实背景与替代方案 | 在决策之前或当下撰写 ADR |
| ADR 太多 | 决策疲劳、噪音 | 只记录重大决策 |
| ADR 太少 | 知识流失、重复争论 | 遵循上方的「6 个月法则」 |
| 没有后果 | 分析不完整 | 一律列出正面与负面结果 |
| 背景模糊 | 对未来读者毫无用处 | 写出具体的限制与驱动因素 |
| 编辑已接受的 ADR | 历史流失 | 改为取代，而非编辑 |
| 把 SPEC 的验收标准复制进 ADR | 两个拥有者、只有一个被更新；ADR 那份永远未勾选，覆盖率工具也看不到 | SPEC 只保留一份，以链接指向它 |
| 接受的风险没有出口 | ADR 是唯一的载体，而它现在已被批准 | 给它一个出口，并在此写明该出口 |

---

## 最佳实践

1. **在决策当下撰写 ADR** — 不要等到几周后背景已遗忘。
2. **保持简短** — 最多 1-2 页。简短才会有人写、有人读。
3. **包含被排除的选项** — 知道什么没有被选择与知道什么被选择一样有价值。
4. **双向链接** — ADR 引用代码；代码引用 ADR。
5. **定期审查** — 在架构审查时标记过时的 ADR 为 deprecated。
6. **存放在版本控制中** — ADR 应与其管辖的代码一起存放。

---

## DEC 借鉴扩充

> **背景**：对于记录从论文、Repo 或外部来源借鉴方法的跨项目决策记录（DEC），在基础 ADR 模板上新增以下区块。这些区块向后兼容——现有未填写这些区块的 DEC 仍然有效，但新建的借鉴型 DEC 应包含这些区块。

### 扩充版 DEC 模板

```markdown
# DEC-NNN: [借鉴决策标题]

> **建立日期**: YYYY-MM-DD
> **上游来源**: [来源名称](URL)
> **上游快照日期**: YYYY-MM-DD
> **用途**: [借鉴目的简述]

---

## [标准 DEC 区段：背景 / 决策 / 后果]

... （与基础 ADR 模板相同） ...

---

## 技术雷达状态

- **状态**: Trial | Adopt | Assess | Hold
- **最后评估日期**: YYYY-MM-DD
- **下次评估日期**: YYYY-MM-DD（Trial 状态必填）

## 借鉴假设

- **假设陈述**: 实作 [方法X] 后，[指标Y] 将从 [基准值a] 改善至 [目标值b]
- **测量方式**: [如何量测，例如：人工评分 / 自动化测试通过率 / 工具输出质量]
- **基准值**: [借鉴前的现状数据或主观评分]
- **目标值**: [预期达到的改善幅度]
- **验证期限**: YYYY-MM-DD
- **成功条件**: [达到目标值的 X% 以上]
- **失败条件**: [超过期限且低于目标值 Y%，或指标恶化]

## 评估记录

| 日期 | 状态 | 观察 | 决定 |
|------|------|------|------|
| YYYY-MM-DD | Trial | [初始建立] | 开始评估 |
```

### 技术雷达状态定义

| 状态 | 含义 | 行动 |
|------|------|------|
| **Adopt** | 已验证有效，全面采用 | 列为标准实践，记录证据 |
| **Trial** | 正在评估中，有限范围试行 | 持续测量，维护假设书 |
| **Assess** | 有限条件下有效 | 记录适用边界，不扩大采用 |
| **Hold** | 评估无效或有害 | 停止新增采用，规划移除 |

**默认值**：所有新建借鉴型 DEC 从 `Trial` 开始。

### 诊断流程（观察到负面结果时）

```
观察到负面结果
      ↓
Step 1: 对照原始论文/Repo，确认实作是否正确
      ↓ 实作有误 ──→ 修正实作，重启假设书计时（不建立 Reversal DEC）
      ↓ 实作正确
Step 2: 确认应用场景是否符合论文假设
      ↓ 场景不符 ──→ 记录适用边界，状态更新为 Assess
      ↓ 场景符合
Step 3: 判定方法本身无效
      ↓
建立 Reversal DEC（DEC-NNN-reversal）→ 移除实作 → TECH-RADAR 更新为 Hold
```

---

## Reversal DEC 格式

当借鉴方法被评定无效时，在原始 DEC 旁建立 `DEC-NNN-reversal.md` 文件：

```markdown
# DEC-NNN-reversal: [原始方法名称] — 移除决定

> **建立日期**: YYYY-MM-DD
> **原始 DEC**: [DEC-NNN](DEC-NNN-original-title.md)
> **移除原因**: 方法本身无效 | 场景不符 | 有反效果
> **紧急程度**: 正常流程 | 紧急（反效果，立即停用）

---

## 移除原因

[详述为何判定此方法无效。说明已确认：
1. 实作正确性（已对照原始论文/Repo 确认）
2. 应用场景符合性（已确认场景符合论文假设）
3. 方法在我们环境中的实际表现]

## 诊断过程

| 步骤 | 确认项目 | 结果 |
|------|---------|------|
| Step 1 | 实作是否正确对照原始来源 | ✅ 正确 |
| Step 2 | 应用场景是否符合论文假设 | ✅ 符合 |
| Step 3 | 方法本身有效性 | ❌ 无效 |

## 观察到的指标

| 指标 | 借鉴前 | 借鉴后 | 预期目标 | 判定 |
|------|-------|-------|---------|------|
| [指标名称] | [基准值] | [实际值] | [目标值] | ❌ 未达成 |

## 反模式记录

> 记录此方法在我们环境中的反模式，供未来避免相同错误。

- [反模式 1: 具体描述]
- [反模式 2: 具体描述]

## 移除步骤

- [ ] 通过 Feature Flag 停用相关功能
- [ ] 移除实作代码
- [ ] 更新 TECH-RADAR.md：状态改为 Hold
- [ ] 更新原始 DEC 状态为 `Superseded by DEC-NNN-reversal`
- [ ] 在下次 Retrospective 分享学习（紧急情况除外）

## 学习点

[从此次失败借鉴中学到什么？对未来借鉴决策的启示？]

## Links

- 原始 DEC: [DEC-NNN](DEC-NNN-original-title.md)
- 相关 Retrospective: [链接]
- TECH-RADAR: [cross-project/decisions/TECH-RADAR.md](../decisions/TECH-RADAR.md)
```

### Reversal DEC 规则

1. **必须建立** Reversal DEC：当方法本身被确认无效（不只是实作错误）。
2. **不建立** Reversal DEC：若是实作错误，修正后重启假设书计时即可。
3. 原始 DEC 状态应更新为 `Superseded by DEC-NNN-reversal`。
4. Reversal DEC 是终态，不会再被撤销。
5. 若方法有反效果，跳过 Retrospective 等待，立即行动。
