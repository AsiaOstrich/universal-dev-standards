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
| **Adopt** | 已验证有效，全面采用 | 列为标准实践，记录最佳实践文档 |
| **Trial** | 正在评估中，有限范围试行 | 持续测量，维护假设书（必填下次评估日期） |
| **Assess** | 有限条件下有效，需谨慎 | 记录适用边界，不扩大采用 |
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

## 移除原因

[详述为何判定此方法无效]

## 诊断过程

| 步骤 | 确认项目 | 结果 |
|------|---------|------|
| Step 1 | 实作是否正确对照原始来源 | ✅ 正确 |
| Step 2 | 应用场景是否符合论文假设 | ✅ 符合 |
| Step 3 | 方法本身有效性 | ❌ 无效 |

## 反模式记录

- [反模式 1: 具体描述]

## 移除步骤

- [ ] 通过 Feature Flag 停用相关功能
- [ ] 移除实作代码
- [ ] 更新 TECH-RADAR.md：状态改为 Hold
- [ ] 更新原始 DEC 状态为 `Superseded by DEC-NNN-reversal`
- [ ] 在下次 Retrospective 分享学习

## 学习点

[从此次失败借鉴中学到什么？]
```

### Reversal DEC 规则

1. **必须建立** Reversal DEC：当方法本身被确认无效（非实作错误）。
2. **不建立** Reversal DEC：若是实作错误，修正后重启假设书计时即可。
3. 原始 DEC 状态应更新为 `Superseded by DEC-NNN-reversal`。
4. Reversal DEC 是终态，不会再被撤销。
5. 若方法有反效果，跳过 Retrospective 等待，立即行动。
