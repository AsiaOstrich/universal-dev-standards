---
scope: universal
source: ../../../../skills/brainstorm-assistant/guide.md
source_version: 3.0.0
translation_version: 3.0.0
last_synced: 2026-06-01
status: current
description: |
  指导在编写规格前进行结构化 AI 辅助头脑风暴。
  使用时机：模糊想法、功能探索、问题重构、创意发想。
  关键字：brainstorm, persona ensemble, multi-critic, HMW, SCAMPER, 头脑风暴, 发想。
---

# 头脑风暴助手指南

> **语言**: [English](../../../../skills/brainstorm-assistant/guide.md) | 简体中文

**版本**: 3.0.0
**最后更新**: 2026-06-01
**适用范围**: 所有软件项目
**Scope**: universal
**类型**: 工具型 Skill（无对应核心标准）

---

## 目的

大多数规格框架预设开发者已有清晰的想法。实际上，许多功能起步时只是模糊的概念——「改善引导流程」「让系统更快」「加入社交功能」。在缺乏结构化发想的情况下直接跳到编写规格，会导致：

- 视野狭窄，错过更好的替代方案
- 规格在解决症状而非根本原因
- 在无法回应真实需求的功能上浪费精力

本 Skill 填补了 UDS 工作流程中的发想缺口：

```
/brainstorm → /requirement → /sdd → 实现
     ▲              ▲          ▲
   (本工具)        既有        既有
```

### v3 的变更

v1 是通用的 FRAME→DIVERGE→CONVERGE 流程。v2 加入了认知科学闸门（飞行前反锚定、10 个想法闸门、单一 AI 反驳）。**v3 把两个工作阶段重新聚焦于 2024–2026 文献中最强的发现：**

- **DIVERGE** 现在是一个 **persona 集成**（每个角色通过思维链独立推理，相互隔离）与**多样性透镜**的交叉——而不是单一 AI 声音冲刺计数。
- **CONVERGE** 现在是一个**多评审面板**加上一轮**硬角色反驳**（Devil's Advocate + Steelman）——而不是单一 AI 打分加单一软批评。

飞行前阶段被**保留并强化**（固着研究表明 AI 锚定真实存在，甚至可能更糟），而 10 个想法闸门和单一 AI 反驳被**降级 / 硬化**，因为它们原本基于人类群体的证据无法干净地迁移到单一 LLM。

---

## Research Foundations | 认知科学依据

v3 基于六项发现，每项都对照原始出处核对过。下方的作者归属已交叉核对。

v3 基于六项发现，每项都对照原始出处核对过（作者已校正）。

| # | 发现 | 出处 |
|---|------|------|
| 1 | **思维链 + persona 产生所有提示策略中最高的想法多样性**，接近人类群体。 | Meincke, Mollick & Terwiesch, *Prompting Diverse Ideas* (arXiv:2402.01727, 2024) |
| 2 | **单一 LLM 发想会降低*跨用户*的想法多样性**，即便每个个体感觉自己更有创意。 | Anderson, Shah & Kreminski, *Homogenization Effects of LLMs on Human Creative Ideation* (arXiv:2402.01536, 2024) |
| 3 | **生成式 AI 的输出会加深设计固着并降低发散思维**——想法更少、变化更小。 | Wadinambiarachchi, Kelly, Pareek, Zhou & Velloso, CHI 2024 (arXiv:2403.11164) |
| 4 | **多智能体「同事」系统在感知结果质量与新颖性上胜过单一智能体**。 | Quan, Albassam, Wu, Ding & Chin, *Towards AI as Colleagues* (arXiv:2510.23904, 2025) |
| 5 | **联想式 / 跨领域提示显著提升原创性。** | Mehrotra, Parab & Gulwani, *Enhancing Creativity in LLMs through Associative Thinking* (arXiv:2405.06715, 2024) |
| 6 | **LLM 擅长想法生成与精炼，但不擅长界定范围与多想法评估**（Hourglass 框架）。 | Li, Padilla, Le Bras, Dong & Chantler, *A Review of LLM-Assisted Ideation* (arXiv:2503.00946, 2025) |

> 被广泛引用的 Doshi & Hauser, *Science Advances* (2024)——「生成式 AI 提升个体创造力，但降低新颖内容的集体多样性」——佐证了发现 #2。它仅作为支持性证据引用；同质化护栏锚定于已验证的 #2。

### 每项发现如何映射进流程

1. **#1 → DIVERGE 默认机制**：persona + 思维链。
2. **#2 → 多样性坍缩护栏**：不用类比做种子；变化透镜而非措辞。
3. **#3 → 飞行前保留 / 强化**：先写下你自己的想法；不用「像 X 但用于 Y」做种子。
4. **#4 → Enhanced 层级**：在宿主支持时并行运行 persona / 评审智能体。
5. **#5 → 多样性透镜**：类比、假设反转、形态学。
6. **#6 → 多评审面板 + 人类仲裁者**：聚合三个评审透镜；由人类决定。

---

## 快速参考

### 流程概览

```
┌─────────────┐  ┌────────────┐  ┌──────────────────────┐  ┌────────────────────────┐  ┌────────────┐
│  PRE-FLIGHT │─▶│   FRAME    │─▶│       DIVERGE         │─▶│       CONVERGE         │─▶│   OUTPUT   │
│  (Phase 0)  │  │  定义问题   │  │ persona 集成 +        │  │ 多评审面板 +           │  │  头脑风暴   │
│ 用户先写     │  │            │  │ 多样性透镜            │  │ 硬角色反驳             │  │  报告      │
│ 3 个想法    │  │            │  │ (CoT, 分支隔离)       │  │ (DA + Steelman)        │  │            │
└─────────────┘  └────────────┘  └──────────────────────┘  └────────────────────────┘  └────────────┘
```

### 阶段摘要

| 阶段 | 目标 | 关键机制 (v3) | 时间 |
|------|------|---------------|------|
| **PRE-FLIGHT** | 防止 AI 锚定 | 用户先写 3 个想法；不用类比做种子 | 3–5 分钟 |
| **FRAME** | 清晰定义问题 | 5 Whys、HMW、利益相关者 | 10–15 分钟 |
| **DIVERGE** | 强制视角多样性 | persona 集成 + 多样性透镜 | 15–25 分钟 |
| **CONVERGE** | 选出经偏差校验的想法 | 多评审面板 + 硬角色反驳 | 15–20 分钟 |
| **OUTPUT** | 可行动的报告 | 头脑风暴报告模板 | 5–10 分钟 |

---

## Phase 0: PRE-FLIGHT | 防止 AI 锚定

> Goal: Establish independent thinking before any AI content is generated.
>
> 目标：在任何 AI 内容生成之前，建立用户的独立思考框架。

### 为何重要

研究表明，一旦人看到任何 AI 生成的框架，后续想法就会在该语义空间内聚集。在 AI 辅助情境下这**更强**，而非更弱：设计固着研究（Wadinambiarachchi 等，CHI 2024）发现流畅、高保真的 AI 输出会*加深*固着，并降低后续想法的多样性与原创性。飞行前为此偏差建立了「智识免疫系统」。

研究表明，一旦看到任何 AI 生成的框架，后续想法就会在该语义空间内聚集。在 AI 情境下这**更强**：设计固着研究（Wadinambiarachchi 等，CHI 2024）发现流畅高保真的 AI 输出会*加深*固着、降低后续想法的多样性与原创性。飞行前为此偏差建立了「智识免疫系统」。

### 提示用户提供

```
在我们开始头脑风暴前，请花 2–3 分钟写下：

1. 问题（一句话）：你想解决的核心问题是什么？
2. 你最初的想法（3 个，质量不限）：
   - 想法 A：
   - 想法 B：
   - 想法 C：
3. 我「不想要」什么（要避免的解决方案类型，或 N/A）：

准备好就提交。AI 会先读完这些再生成任何内容。
```

### 反种子护栏（v3 新增）

**不要**接受或生成「像 X 但用于 Y」这样的框架作为种子（例如「面向医生的 Slack」）。类比式产品种子会把 LLM 锁进单一解决方案空间，并可测量地降低想法多样性（这与发现 #2 的同质化机制相同）。捕捉底层的*问题*，而非产品类比。如果用户提供这样的种子，先把它重述为一个问题（「临床医生团队在交接班之间丢失上下文」）再继续。

### 收到飞行前输入后的 AI 行为

1. 确认用户的想法但不予评价。
2. 进入 FRAME。
3. 在 DIVERGE 中，明确探索用户没有提到的方向。
4. 如果用户声明了不想要的解决方案类型，从所有生成的想法中排除它。

### 跳过飞行前

使用 `--skip-preflight` 绕过。会显示一行警告：`⚠ Skipping Pre-flight may cause AI anchoring`。在以下情形下合适：用户已有大量笔记、这是重复的工作阶段，或时间极度受限（优先用 `--quick`）。

---

## Phase 1: FRAME | 定义问题

> Goal: Ensure we're solving the right problem before generating solutions.
>
> 目标：在产生解决方案之前，确保我们正在解决正确的问题。

### Step 1.1: 5 Whys — 根本原因分析

反复问「为什么？」，挖到表层问题之下。

```
问题：[初步问题陈述]
Why 1：为什么这个问题存在？ → 因为 [理由 1]
Why 2：为什么 [理由 1] 会发生？ → 因为 [理由 2]
Why 3：为什么 [理由 2] 会发生？ → 因为 [理由 3]
Why 4：为什么 [理由 3] 会发生？ → 因为 [理由 4]
Why 5：为什么 [理由 4] 会发生？ → 因为 [根本原因]
根本原因：[根本原因]
```

**示例：**

```
问题：用户中途放弃结账流程
Why 1：→ 因为流程花太久
Why 2：→ 因为有 5 个独立页面
Why 3：→ 因为每个验证步骤都有自己的页面
Why 4：→ 因为最初的设计假设连接速度慢
Why 5：→ 并非如此——现在大多数用户都用宽带
根本原因：为拨号时代设计的过时多页架构
```

### Step 1.2: HMW — 问题重构

将根本原因转化为以机会为焦点的问题。**格式：**「我们可以怎么 [动词] [期望结果] 给 [利益相关者]？」范围足够广以允许有创意的解法，足够具体以可行动，且绝不包含解法。

```
根本原因：过时的多页结账架构
HMW 1：我们可以怎么减少结账步骤而不损失验证？
HMW 2：我们可以怎么让结账感觉是瞬间完成的？
HMW 3：我们可以怎么在不打断用户流程的情况下验证数据？
```

### Step 1.3: 利益相关者映射

| 利益相关者 | 需求 | 痛点 |
|------------|------|------|
| 终端用户 | 快速、简单的结账 | 步骤太多 |
| 业务方 | 高转化率 | 购物车放弃 |
| 开发者 | 易维护的代码 | 复杂的页面转场 |

### Step 1.4: 代码库上下文（如适用）

针对既有项目做头脑风暴时，先收集上下文：**Read** `README.md`/`package.json`；**Grep** 相关功能；**Glob** 相关结构。这让发想立足现实，避免提出与既有架构相冲突的想法。

---

## Phase 2: DIVERGE | 发散思考（v3：persona 集成 + 多样性透镜）

> Goal: Force genuinely distinct viewpoints, not variations on one theme.
>
> 目标：逼出真正不同的视角，而非同一主题的变体。

### 为何用 persona 集成（而非计数闸门）

Meincke, Mollick & Terwiesch (2024) 发现，**思维链 + persona** 在所有受测的提示策略中产生最高的想法多样性，接近人类头脑风暴群体。旧的「生成 ≥10 个想法」闸门基于 Nijstad 的「最佳想法出现在后半段」——这是一项**人类群体**发现，**未在 LLM 上得到确认**，LLM 倾向于趋于平台并回收旧想法。因此 v3 把*结构*（不同的 persona + 透镜）而非*计数*作为多样性的引擎。

### Step 2a — persona 集成

运行一个默认集成。每个 persona **逐步推理（思维链）**，并**仅从自己的透镜**产生 2–4 个想法。

| 默认 persona | 它据以论证的透镜 |
|--------------|------------------|
| **领域专家** | 该领域的最佳实践要求什么？ |
| **怀疑者 / 风险** | 哪里会崩溃？什么会最先失效？ |
| **跨领域类比者** | 生物学 / 其他领域如何解决类似问题？ |
| **成本 / 约束** | 能起作用的最便宜、最小的东西是什么？ |
| **终端用户倡导者** | 真实用户的感受与需求是什么？ |

**每个 persona 的模板：**

```
Persona: [name] — Lens: [one line]
Reasoning (step by step): [chain-of-thought]
Ideas (2–4, from this lens only):
1. [Idea] — [why this persona would propose it]
2. ...
```

用 `--personas "designer,economist,skeptic,..."` 覆盖。六顶思考帽天然映射到 persona（White=事实，Red=情绪，Black=风险，Yellow=利益，Green=创意，Blue=流程）。

### 分支隔离

在 **baseline** 模式下，生成每个 persona 的想法时不向它展示其他 persona 的输出，等所有 persona 都完成后才把所有集合一起呈现。这防止了阶段内锚定——与飞行前所防护的机制相同，只是应用在 persona 之间。在 **Enhanced 层级**，这种隔离是物理性的：每个 persona 都是拥有自己上下文的独立智能体（见 Enhanced 层级）。

### Step 2b — 多样性透镜

跨整个集成至少应用一个透镜，以推进越过显而易见的区域。连接迥异的概念可测量地提升原创性（Mehrotra 等，2024）。

| 透镜 | 提示模式 | 最适合 |
|------|----------|--------|
| **类比 / 跨领域** | 「找一个 [生物学 / 物流 / 游戏] 中解决类似问题的系统。我们能借鉴什么原理？」 | 困在领域惯例中 |
| **假设反转** | 「列出所有人都假设必然为真的事，然后逐一反转。哪个反转有意思？」 | 「显而易见」的问题框架 |
| **形态学矩阵** | 「构建一个 3 轴矩阵（如 用户 × 触发 × 约束）；填补稀有 / 空白的格子。」 | 系统化覆盖 |

至少应有一个被反转的假设（反转透镜）存活进入候选集。用 `--lens analogical|reversal|morphological` 强制主透镜。

### Step 2c — 继续推动（辅助）

原始计数在 AI 情境下是弱代理。用多样性而非计数作为闸门：如果集成覆盖的不同想法少于约 8 个**或**不同透镜少于 3 个，提示：*「继续——加上一个你尚未使用的 persona 或透镜。」* 没有上限。

### 经典技法（仍可用）

HMW（默认起点）、SCAMPER（改善既有功能：Substitute、Combine、Adapt、Modify、Put-to-other-use、Eliminate、Reverse）以及六顶思考帽仍然可用，并能很好地组合为 persona。

---

## Phase 3: CONVERGE | 收敛（v3：多评审面板 + 硬角色反驳）

> Goal: Select ideas that survive bias-reduced scoring AND structured debate — with the human as final arbiter.
>
> 目标：选出同时通过降偏差评分与结构化辩论的想法——人类保留最终裁决权。

### Step 3a: 多评审面板

单一 LLM 是弱且有偏的评估者（Li 等，2025：LLM 擅长生成 / 精炼，不擅长评估）。v3 运行**三个独立评审**，每个都从自己的透镜对每个想法打 1–5 分；按均值聚合。

| 评审透镜 | 它所掌管的加权准则 |
|----------|--------------------|
| **工程可行性** | 可行性 50% · 投入 50% |
| **用户影响** | 影响 70% · 对齐 30% |
| **战略对齐** | 对齐 60% · 影响 40% |

**逐准则指引（1–5）：**

| 准则 | 5 | 3 | 1 |
|------|---|---|---|
| 可行性 | 易如反掌 | 中等 | 几乎不可能 |
| 影响 | 变革性 | 中等 | 可忽略 |
| 投入（反向） | 几小时 | 几周 | 几个季度 |
| 对齐 | 核心使命 | 相关 | 偏离使命 |

**聚合示例：**

| # | 想法 | 可行性评审 | 影响评审 | 对齐评审 | **聚合** |
|---|------|-----------|---------|---------|----------|
| 1 | 单页结账 | 4.0 | 4.5 | 4.5 | **4.3** |
| 2 | 一键购买 | 3.0 | 3.5 | 3.5 | **3.3** |
| 3 | 渐进式表单 | 4.5 | 4.0 | 4.0 | **4.2** |

> **可选 — RICE / ICE（产品功能）：** 对于优先排序可交付的功能，计算 `RICE = (Reach × Impact × Confidence) / Effort` 或更轻量的 `ICE = Impact × Confidence × Ease`。让工程师——而非 LLM——估计 Effort（LLM 缺乏代码库知识）。RICE 偏好增量胜利；不要单独用它做战略性押注。

### Step 3b: 硬角色反驳轮

软性的「请批评这个」大多得到附和——在弱批评框架下 LLM 会阿谀奉承。v3 对**前 3 个想法**分配**硬角色**：

- **Devil's Advocate**：「你的任务是论证这个想法*会*失败。给出 2 个具体的失败条件。」
- **Steelman**：「陈述反方论点最强、最善意的版本——一个有思想的对手实际会提出的那种。」

每个反方论点必须采取以下形式：**「这个想法会在 [特定上下文] 失败，因为 [特定理由]。」**

**不可接受**（太空泛）：「这可能很难。」/「可能会有 edge case。」

**可接受**（具体失败条件）：
- 「这个想法会对企业客户失败，因为他们的 IT 政策禁止把 OAuth token 存在浏览器 localStorage。」
- 「这个想法会在高峰流量时失败，因为同步 API 调用会阻塞 render thread，造成 500ms+ 的明显卡顿。」

用户**必须**在推进前对每一个都做出回应：

| 选项 | 动作 |
|------|------|
| (a) 接受 | 提供解决该失败的修改版本 |
| (b) 不同意 | 提供具体理由说明该反方论点不适用 |
| (c) 有效 | 从排名中移除该想法 |

每个保留下来的想法获得一个徽章：`✓ Passed rebuttal — [用户回应的一句话摘要]`。

**跳过：** `--no-rebuttal` 跳过此轮；报告对应段落标为「Rebuttal: skipped」。

---

## Phase 4: OUTPUT | 输出提案

> Goal: Produce a structured report that feeds directly into `/requirement` or `/sdd`.

### 头脑风暴报告模板

```markdown
# Brainstorm Report: [Topic]

**Date**: YYYY-MM-DD
**Participants**: [human, AI assistant]
**Personas Used**: [domain expert, skeptic, analogist, ...]
**Lenses Used**: [analogical, reversal, ...]
**Pre-flight**: [Completed / Skipped]   **Rebuttal**: [Completed / Skipped]   **Tier**: [Baseline / Enhanced]

## Problem Statement
[Refined problem + root cause from 5 Whys]

## HMW Questions
1. How might we ...?

## Ideas Generated
| # | Idea | Persona | Lens | Feas. critic | Impact critic | Align. critic | Agg. |
|---|------|---------|------|--------------|---------------|---------------|------|
| 1 | ...  | Skeptic | Reversal | 4.0 | 4.5 | 4.0 | 4.2 |

## Top 3 Recommendations
### 1. [Idea] (Agg. X.X) ✓ Passed rebuttal
- **Why**: [Reasoning]   - **Persona/Lens**: [..]   - **Rebuttal response**: [one line]   - **Scope**: [S/M/L]

## Diversity Note
[How many distinct personas/lenses the surviving ideas span; flag if all from one cluster]

## Discarded Ideas (with reasons)
| Idea | Reason |
|------|--------|
| ... | Removed during rebuttal (counterargument accepted) |

## Next Steps
- [ ] Proceed to `/requirement` with recommendation #1
- [ ] Proceed to `/sdd` if requirements are already clear
```

---

## 多样性坍缩护栏

使用单一 LLM 做发想会降低**跨用户的想法多样性**，即便每个个体感觉自己更有创意（Anderson, Shah & Kreminski, 2024；由 Doshi & Hauser, *Science Advances* 2024 佐证）。具体防护：

- **绝不**用竞品或产品类比做种子（「像 X 但用于 Y」）。
- **变化透镜**，而非仅变化措辞——重写一个提示并不会让输出多样化。
- 如果存活的前 3 名全部源自一个 persona 或透镜，**标记它**并在 OUTPUT 前额外运行一个透镜。
- 早期优先使用**较低保真度**的想法陈述（一个粗略的方向，而非打磨过的概念）——高保真的 AI 输出会加深固着（发现 #3）。

---

## Enhanced 层级 — 并行 persona

多智能体发想——独立的智能体贡献并交谈——在感知结果质量与新颖性上胜过单一智能体（Quan 等，2025，*MultiColleagues*）。在宿主支持并行子智能体的地方（例如 Claude Code 的 Agent/Workflow 工具），`--enhanced` 物理性地实现这个集成：

1. **发散**：每个 persona 都是拥有**隔离上下文**（真正的分支隔离）的独立智能体，并行运行；结果被合并并去重。
2. **收敛**：三个评审作为并行智能体运行；Devil's Advocate 与 Steelman 是独立的对抗智能体。
3. **综合**：最后一遍合并分数、标记多样性，并组装报告。

### 优雅降级

此层级是**可选且依赖宿主的**。在没有子智能体编排的助手上，`--enhanced` 会**静默回退**到 baseline（单上下文模拟 persona、顺序评审）。因此本 Skill 仍然是 `scope: universal`——每个宿主都获得完整方法论；只是执行基底不同。

---

## Mode Selection Guide | 模式选择指引

SKILL.md 中的模式选择表使用客观触发条件（字数、是否带旗标、是否存在规格）来消除「我该用哪个模式？」的决策开销。如果用户必须先诊断「我的问题是战略型还是执行型？」，这个元决策会在工作阶段开始前就消耗资源。`< 20 words` 这个门槛是起步启发法——在 5–10 次工作阶段后回顾，并依观察而非直觉调整。

---

## Self-Evaluation Framework | 自我评估框架

每次工作阶段后记录三个指标，建立实证记录。不要以单次工作阶段评判 v3 vs v2——至少收集 3 次可比较的工作阶段。

每次工作阶段后记录三个指标，建立实证记录。不要以单次评估 v3 vs v2，至少收集 3 次可比较的工作阶段。

### 三个指标

#### 1. 采用率

**问题：** 在生成的所有想法中，你会实际使用或进一步研究多少？
- 5 = 3+ 个直接可行动 · 3 = 1 个可行动 · 1 = 没有有用的

#### 2. 多样性（v3 定义）

**问题：** 存活的想法是跨越多个 **persona 与透镜**，还是聚集在一个？
- 5 = 存活想法跨越 3+ 个 persona/透镜 · 3 = 2 个 · 1 = 全部来自一个 persona/透镜

这取代了 v2 的「延伸批 vs 直觉批」多样性问题——v3 直接测量跨 persona/透镜的分布。

#### 3. 认知负荷

**问题：** 这次工作阶段在心智上有多耗费？（5 = 毫不费力，1 = 精疲力竭）

一个在认知负荷上持续评为 1–2 分的方法，无论质量如何都会被放弃。目标：认知负荷 ≥ 3，同时采用率与多样性也在改善。

### 工作阶段记录模板

```
Date: YYYY-MM-DD
Topic: [one sentence]
Mode: [Full v3 / Enhanced / Quick / No-Rebuttal / Skip-Preflight]
Personas/Lenses used: [...]
Duration: [minutes]

Adoption Rate:   /5 — [reason]
Diversity:       /5 — [reason]
Cognitive Load:  /5 — [reason]

Notable observation: [one sentence]
```

### 趋势解读

| 模式 | 解读 | 行动 |
|------|------|------|
| 采用率持续 ≤ 2 | 问题框架在 FRAME 阶段失败 | 在 5 Whys 上花更多时间 |
| 多样性持续 ≤ 2 | persona/透镜产生重叠的想法 | 加入一个更远的 persona；强制反转透镜 |
| 认知负荷持续 ≤ 2 | 流程开销太高 | 对低风险问题使用 `--no-rebuttal` 或 `--quick` |
| 三个指标都 ≥ 4 | v3 对这类问题运作良好 | 维持现状 |

---

## A/B Experiment Protocol | A/B 实验协议

验证 v3 是否对*你的*问题类型胜过 v2，而非单纯依赖研究本身。

验证 v3 是否真的对你的问题类型优于 v2，而非单纯依赖研究。

**时长：** 3 对工作阶段（最少）。**方法：** 同类问题，交替方法。

```
Session A1: type X → v2 (single AI, count gate, single rebuttal)
Session B1: type X → v3 (persona ensemble, multi-critic)
[one week gap]   ... alternate to reduce order effects ...
```

**每次工作阶段测量：** 采用率（1–5）、多样性（1–5）、认知负荷（1–5）、时间、生成的想法数、「来自某个 persona/透镜、让你惊讶的想法」。

**解读：**
- **v3 胜出** 若采用率与多样性都更高，且认知负荷差距 ≤ 1 分。
- **v2 胜出** 若 v3 的认知负荷低 ≥ 2 分*且*采用率差距 < 1 分。
- **依情境而定** 若结果随问题类型而异 → 保留两者并按模式选择路由。

**待检验的具体假设：**
1. **persona 假设：** 不同的 persona 是否真的产生不重叠的想法，还是无论如何都会趋同？
2. **透镜假设：** 反转 / 类比透镜是否浮现出没有任何 persona 触及的想法？
3. **多评审假设：** 三个评审是否曾有实质性分歧，还是它们的分数坍缩到一起（若总是相同，一个评审就够了）？

---

## Research Validity Caveats | 研究效度说明

每项发现在 AI 辅助、单用户情境下有不同的外部效度风险。在把研究视为确定事实之前，请理解其局限。

### v3 核心机制 — 风险：低–中

**persona 集成 + CoT（发现 #1）** 与**联想式 / 跨领域提示（#5）** 都是关于*提示一个 LLM*，已在 LLM 发想研究中直接受测——因此它们能很好地迁移到本 Skill 的确切用例。主要的残余风险是单一上下文中的*模拟* persona 可能比*隔离的*智能体更趋同；这正是 baseline 使用分支隔离、以及 Enhanced 层级存在的原因。用上方的「persona 假设」验证。

**多评审面板（#6）** 基于 LLM 是弱评估者——这有充分支持——但增益取决于评审是否真正独立。如果你的三个评审总是一致，那你只有一个评审穿了三套戏服；检查「多评审假设」。

### 沿用的说明 — 为 v3 重新评级

#### 飞行前反锚定 — 风险：低（v2 中为中）

v2 将此评为「中」，理由是静态 AI 文字比主导性的人类声音更容易忽略。CHI 2024 固着研究（#3）现在提供了**直接**证据，表明 AI 输出会加深发想中的固着。机制可迁移；飞行前被保留并强化。

#### Nijstad「最佳想法在后半段」 — 风险：高 → 机制被降级

这是一项人类群体的发现（先耗尽显而易见的关联）。LLM 更常**趋于平台并回收**，而非后期改善。因此 v3 把固定的 10 个想法计数闸门降级为辅助推动，并把结构性多样性（persona + 透镜）作为真正的引擎。不要把高想法数当作多样性的证据。

#### Nemeth「辩论胜过无批评」 — 风险：高 → 角色硬化，而非依赖

Nemeth 的效应是关于*有利害关系的人之间的真实异议*。AI 按需扮演的魔鬼代言人可能形式上正确却并非真正具有启示性，而软批评框架会漂移成阿谀奉承。v3 的回应是**硬化角色**（明确的「论证这会失败」+ Steelman），而非假设效应可迁移。每轮后诚实评估：反方论点是否浮现了你未曾考虑的东西？如果一直是「没有」，对已充分理解的领域使用 `--no-rebuttal`。

---

## Gradual Adoption Protocol | 渐进采用协议

如果完整 v3 感觉过重，按顺序采用——每个阶段两周。

1. **仅 persona 集成（第 1–2 周）：** 用默认 persona 运行 `--no-rebuttal`。焦点：不同的 persona 是否产生不重叠的想法？
2. **加入多样性透镜（第 3–4 周）：** 强制 `--lens reversal` 然后 `--lens analogical`。焦点：透镜是否触及单靠 persona 未达到的想法？
3. **加入多评审 + 硬角色反驳（第 5–6 周）：** 运行完整 v3。焦点：评审是否有分歧，反方论点是否改变你的选择？

6 周后，回顾工作阶段记录与 A/B 数据，校准哪个组合适合你的问题类型。

---

## 最佳实践

### Do's

- 开始前完成飞行前；绝不用产品类比做种子。
- 运行完整的 persona 集成与至少一个多样性透镜——多样性来自结构，而非数量。
- 在每个 persona 都完成前保持 persona 生成的分支隔离。
- 认真对待硬角色反驳——空泛的辩护是警讯。
- 让工程师估计 Effort/RICE，而非 LLM。
- 记录三个评估指标；每 3 次工作阶段回顾趋势。
- 在宿主支持且多样性最重要时使用 `--enhanced`。

### Don'ts

- 在写下你的飞行前想法前别读 AI 输出。
- 别接受「像 X 但用于 Y」的种子。
- 别把高想法数当作多样性——检查 persona/透镜分布。
- 别接受空泛的 AI 反方论点——坚持要具体的失败条件。
- 别让单一 LLM 成为唯一裁判——聚合评审；由你决定。
- 别从单次工作阶段得出结论——等 3+ 个数据点。

---

## 与 UDS 工作流的整合

### 映射到 `/requirement`

| 头脑风暴报告区段 | `/requirement` 字段 |
|------------------|---------------------|
| Problem Statement | User Story context |
| Top Recommendation | Feature description |
| HMW Questions | Acceptance Criteria seeds |
| Stakeholder Map | Stakeholder section |
| Discarded Ideas | Out of Scope |

### 映射到 `/sdd`

| 头脑风暴报告区段 | `/sdd` 字段 |
|------------------|-------------|
| Problem Statement | Summary / Motivation |
| Top Recommendation | Proposed Solution |
| Multi-critic scores | Trade-offs / Alternatives Considered |
| Rebuttal responses | Risks section |
| Estimated Scope | Scope section |

---

## 相关标准

| 标准 | 关系 |
|------|------|
| [Requirement Engineering](../../core/requirement-engineering.md) | 头脑风暴输出馈入需求编写 |
| [Spec-Driven Development](../../core/spec-driven-development.md) | 头脑风暴输出馈入 SDD 提案 |
| [Anti-Hallucination](../../core/anti-hallucination.md) | 评审的可行性主张必须基于证据，而非断言 |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 3.0.0 | 2026-06-01 | XSPEC-247：DIVERGE 重新聚焦于 persona 集成 + 多样性透镜（类比 / 反转 / 形态学）；CONVERGE 重新聚焦于多评审面板 + 硬角色反驳（Devil's Advocate + Steelman）；多样性坍缩护栏；Enhanced 层级（并行 persona/评审智能体，优雅回退）；Research Foundations 基于 6 项已验证的 2024–2026 出处重建；效度说明重新评级（飞行前为低、Nijstad/Nemeth 降级）；新旗标 `--personas`/`--lens`/`--enhanced`；反种子护栏 |
| 2.1.0 | 2026-05-09 | XSPEC-196 Phase 2：模式选择客观路由；自我评估框架；A/B 实验协议；研究效度说明；渐进采用协议 |
| 2.0.0 | 2026-05-09 | XSPEC-196：Phase 0 飞行前（反锚定）、反驳轮、10 个想法最低闸门 + 语义批次化 |
| 1.0.0 | 2026-02-12 | 初始版本 |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
