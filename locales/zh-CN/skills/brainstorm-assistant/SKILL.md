---
name: brainstorm-assistant
source: ../../../../skills/brainstorm-assistant/SKILL.md
source_version: 3.0.0
source_hash: 25e622a7d063
translation_version: 3.0.0
last_synced: 2026-06-01
status: current
description: |
  在编写规格前进行结构化 AI 辅助头脑风暴。
  使用时机：功能规划、创意发想、问题定义。
  关键字：brainstorm, persona, multi-critic, HMW, SCAMPER, 头脑风暴, 发想。
---

# 头脑风暴助手

> **语言**: [English](../../../../skills/brainstorm-assistant/SKILL.md) | 简体中文

在编写规格前进行结构化发想。以 2024–2026 年 AI 辅助发想研究为基础，通过引导式头脑风暴，将模糊构想转化为可执行的功能提案。

> **实现**: XSPEC-247 brainstorm v3 —— Multi-Persona Ensemble + Multi-Critic Convergence
> （取代 v2 的「认知科学升级」）。

**v3 的核心改动:** v3 把发散从「单一 AI 冲数量」改为 **persona 集成**（每个角色以思维链独立推理）×**多样性透镜**；把收敛从「单一 AI 评分 + 单一反驳」改为**多评审面板** + **硬角色反驳**（Devil's Advocate + Steelman）。这直接对应文献中最强的结论：多 persona 胜过单次 pass，而单一 LLM 评审既弱又易谄媚。

## 使用前先选模式

使用前套用以下**客观触发条件**。默认为完整 v3，路由规则是跳过阶段的快捷方式，而非额外障碍。

| 条件 | 推荐模式 | 命令 |
|------|----------|------|
| 问题描述少于 20 字**或**主题显得模糊 | 完整 v3（默认） | `/brainstorm [topic]` |
| 战略性问题（职业、架构、商业模式） | 完整 v3 含反驳 | `/brainstorm [topic]` |
| 宿主支持并行子代理且你想要最大多样性 | 完整 v3 + 强化层 | `/brainstorm --enhanced [topic]` |
| 纯创意类（命名、标语、营销文案） | 精简版——跳过反驳 | `/brainstorm --no-rebuttal [topic]` |
| 时间受限或执行类（写代码、改文案） | 快速模式 | `/brainstorm --quick [topic]` |
| 本主题已有 SDD 规格 | 跳过预检 | `/brainstorm --skip-preflight [topic]` |

> **判断原则：** 不确定适用哪一行时，直接用完整 v3。判断本身的认知成本高于直接跑完整流程。

## 工作流程

```
[模式选择] ─► PRE-FLIGHT ─► FRAME ─► DIVERGE ───────────► CONVERGE ──────────► OUTPUT
  客观路由      防止锚定      定义问题   persona 集成+透镜       多评审面板+硬角色反驳    输出提案
```

---

### 阶段 0：PRE-FLIGHT | 防止 AI 锚定

**本阶段存在的原因：** 在 AI 生成任何内容**之前**先写下自己的想法，能持续产出更多样的结果。在 AI 情境下这**更**重要，而非更不重要：设计固着研究显示，流畅、高保真的 AI 输出反而**加深**固着，而非缓解（Wadinambiarachchi 等，CHI 2024）。

**在 AI 生成任何内容之前**，用户完成三件事：

| 项目 | 提示 |
|------|------|
| 1 | 一句话描述问题 |
| 2 | 3 个初始想法（任意形式、不限质量） |
| 3 | 「我最不想要的解法类型」（可填 N/A） |

**用户提交后**，AI 读取全部三项输入再进入 FRAME。AI 的第一批 DIVERGE 输出必须探索用户未提及的方向，且不得重复用户已提交的想法。

> **反种子 guardrail（v3 新增）：** 不要接受或生成「像 X 但给 Y」的框架当种子（如「给医生用的 Slack」）。这类产品类比种子会把 LLM 锁进单一解空间、明显降低想法多样性。请捕捉底层**问题**，而非产品类比。

**旗标:** `--skip-preflight` 跳过本阶段并显示一行警告：
`⚠ Skipping Pre-flight may cause AI anchoring`

---

### 阶段 1：FRAME | 定义问题

在生成想法之前，先清楚定义问题空间。

| 步骤 | 动作 |
|------|------|
| 1 | 用 5 Whys 厘清问题根因 |
| 2 | 重构为「How Might We」(HMW) 问题 |
| 3 | 识别利益相关者与约束条件 |
| 4 | 从代码库搜集脉络（如适用） |

---

### 阶段 2：DIVERGE | 发散思考（v3：persona 集成 + 多样性透镜）

> **v3 核心机制：** **persona 集成**——每个 persona 以**思维链**在**隔离**状态下推理——再乘上**多样性透镜**。Meincke、Mollick、Terwiesch（2024）发现「思维链 + persona」的想法多样性高于所有受测的提示策略，接近人类团体。光冲数量是弱代理；结构性逼出不同视角才是真正的杠杆。

#### 步骤 2a —— persona 集成

通过默认 persona 组生成想法。每个 persona **逐步推理（思维链）**，**只从自己的视角**产出 2–4 个想法。用户可用 `--personas` 增减或改名。

| 默认 persona | 它论证所依据的视角 |
|--------------|--------------------|
| **领域专家** | 本领域的最佳实践要求什么？ |
| **怀疑者 / 风险** | 哪里会坏？什么先失败？ |
| **跨域类比者** | 生物 / 其他领域如何解决类似问题？ |
| **成本 / 约束** | 最便宜、最小的可行解是什么？ |
| **用户代言者** | 真实用户的感受与需求是什么？ |

> **分支隔离：** baseline 模式下，生成每个 persona 的想法时**不让它看到其他 persona 的输出**——这能防止 session 内锚定。等所有 persona 都产完后才一起呈现全部想法。（在强化层中，将 persona 作为并行隔离代理运行——见下方「强化层」。）

#### 步骤 2b —— 多样性透镜

在 persona 组上至少套用一个透镜，以突破「显而易见答案区」。连接异域概念能可量测地提升原创性（Mehrotra、Parab、Gulwani，2024）。

| 透镜 | 提示模式 |
|------|----------|
| **类比 / 跨域** | 「在 [生物 / 物流 / 游戏] 中找出一个解决类似问题的系统。我们能借鉴什么？」 |
| **假设反转** | 「列出所有人都假设必然成立的事，然后逐一反转。」 |
| **形态矩阵** | 「构建一个三轴矩阵（如 用户 × 触发 × 约束）；填补罕见组合。」 |

用 `--lens analogical|reversal|morphological` 强制将某个透镜作为主要透镜。

#### 步骤 2c —— 继续发散提示（辅助）

「好点子出现在后半段」（Nijstad）是**人类群体**现象，**未在 LLM 上得到证实**（LLM 多为达到高原 / 枯竭）。因此固定数量门槛降为**辅助提示**：若全组少于约 8 个相异想法，提示「继续——加一个还没用过的 persona 或透镜」。真正的门槛是**多样性**（覆盖了几个不同视角），而非数量。

#### 经典技法（仍保留）

| 技法 | 使用时机 |
|------|----------|
| **HMW 问题** | 默认起点 |
| **SCAMPER** | 改善现有功能 |
| **六顶思考帽** | 需要多角度（很适合当 persona） |

---

### 阶段 3：CONVERGE | 收敛（v3：多评审面板 + 硬角色反驳）

> **v3 核心机制：** **多评审面板**取代单一加权评分者。单一 LLM 是弱且有偏的评估者（Li 等，2025：LLM 强于生成 / 精炼、弱于评估——人类保留最终裁决权）。三个独立评审透镜各自对每个想法评分后聚合。

#### 步骤 3a：多评审面板

运行**三个独立评审**，各自以自己的透镜对每个想法打 1–5 分。取平均聚合以降低单评审偏误。每位评审皆套用下方的加权公式。

| 评审透镜 | 它负责的加权标准 |
|----------|------------------|
| **工程可行性** | 可行性 50% · 工作量 50% |
| **用户影响** | 影响 70% · 一致性 30% |
| **战略一致性** | 一致性 60% · 影响 40% |

各标准指引（1–5）：可行性（5=轻而易举 … 1=几乎不可能）；影响（5=变革性 … 1=可忽略）；工作量（5=数小时 … 1=数个季度，反向计分，工作量越低分数越高）；一致性（5=核心使命 … 1=偏离使命）。

> **可选——RICE / ICE（产品功能）：** 排序可发布功能时用 `RICE =（Reach × Impact × Confidence）/ Effort` 或较轻的 `ICE = Impact × Confidence × Ease`。Effort 交由工程师估、不要让 LLM 估（它没有代码库知识）。RICE 偏好渐进式胜利，别单独用于战略性押注。

#### 步骤 3b：硬角色反驳轮

软性的「请批评一下」指令只会得到附和（谄媚）。v3 指派**硬角色**：对**前三名想法**各跑一个 **Devil's Advocate**（「你的任务是论证此案会失败」）与一个 **Steelman**（「说出反方最强而善意的版本」）。两者一起对韧性做压力测试，而非只是戳一下。

每个反对理由必须采用以下形式：「在 [具体情境] 下，此想法会失败，因为 [具体原因]。」模糊顾虑（「这可能有点难」）不接受。

用户**必须**对每个反对理由给出回应才能继续：

| 选项 | 动作 |
|------|------|
| (a) | 接受批评 → 提供修改版本 |
| (b) | 不同意 → 给出保留它的具体理由 |
| (c) | 批评成立 → 从排名中移除 |

**旗标:** `--no-rebuttal` 跳过此步骤；报告区段标注「Rebuttal: skipped」。

---

### 阶段 4：OUTPUT | 输出提案

产生可直接对接 `/requirement` 或 `/sdd` 的头脑风暴报告。每个存活的想法标记 `✓ Passed rebuttal`、用户回应的一行摘要、其来源 persona/透镜，以及聚合的评审分数。

## 输出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem + root cause from FRAME]

## HMW Questions
1. How might we ...?

## Ideas Generated
| # | Idea | Persona | Lens | Critic-Feas | Critic-Impact | Critic-Align | Agg. Score |
|---|------|---------|------|-------------|---------------|--------------|-----------|
| 1 | ...  | Skeptic | Reversal | 4.0 | 4.5 | 4.0 | 4.2 |

## Top 3 Recommendations
1. **[Idea]** ✓ Passed rebuttal — [Why] — Persona: [..] — [User rebuttal response]

## Diversity Note
[How many distinct lenses/personas the surviving ideas span — flag if all from one cluster]

## Discarded Ideas (with reasons)
| Idea | Reason |

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## 多样性崩塌防护

使用单一 LLM 发想会降低**跨用户的想法多样性**，即使每个个体都觉得自己更有创意（Anderson、Shah、Kreminski，2024；与广为引用的 Doshi & Hauser，《Science Advances》2024 同向）。防范方式：

- **绝不**用竞品或产品类比（「像 X 但给 Y」）当种子。
- **改变透镜**，而非只改措辞——换个说法 ≠ 多样化。
- 若存活的前三名全来自同一 persona/透镜，**标示出来**并在 OUTPUT 前再跑一个透镜。

## 强化层——并行 persona

多代理发想（独立代理相互对话 / 贡献）在感知质量与新颖度上胜过单代理（Quan 等，2025，*MultiColleagues*）。在支持并行子代理的宿主上（如 Claude Code 的 Agent/Workflow 工具），`--enhanced` 会把每个 persona——以及每个评审——作为**并行、context 隔离的代理**运行，然后合并并去重结果。

> **优雅降级：** 此层为**可选**。在没有子代理的宿主上，`--enhanced` 会静默退回 baseline（单 context 模拟 persona）。本 skill 维持 `scope: universal`。

## 技法速览

| 技法 | 用途 |
|------|------|
| **5 Whys** | 根因分析 |
| **HMW** | 问题重构 |
| **persona 集成** | 强制视角多样性（v3 核心） |
| **多样性透镜** | 突破显而易见区（类比 / 反转 / 形态） |
| **多评审面板** | 降偏误评分（v3 核心） |
| **Devil's Advocate + Steelman** | 硬角色反驳 |
| **SCAMPER / 六顶帽** | 经典发散（可当 persona） |

## 工作阶段自评

每次工作阶段结束后记录三个指标（1–5 分），追踪长期改善。

| 指标 | 问题 |
|------|------|
| **采用率** | 今天的想法我实际会用多少个？ |
| **多样性** | 存活的想法是否跨越多个 persona/透镜？ |
| **认知负担** | 这次有多耗费心力？（5 = 毫不费力） |

收集 3 次工作阶段的数据再下结论。完整的 A/B 实验协议见 [guide.md](./guide.md)。

## 旗标

| 旗标 | 效果 |
|------|------|
| `--personas "a,b,c"` | 覆写默认的 persona 组 |
| `--lens analogical\|reversal\|morphological` | 强制指定主要的多样性透镜 |
| `--enhanced` | 并行 persona/评审代理（不支持则退回） |
| `--skip-preflight` | 跳过阶段 0，显示锚定警告 |
| `--no-rebuttal` | 跳过 CONVERGE 的反驳轮，报告标注 skipped |
| `--quick` | 3 想法快速模式；门槛与反驳均豁免 |
| `--technique scamper` | 强制以 SCAMPER 为主要技法 |

## 使用方式

- `/brainstorm` —— 启动交互式头脑风暴
- `/brainstorm "user retention"` —— 针对特定主题进行头脑风暴
- `/brainstorm --enhanced "user retention"` —— 并行 persona 集成（若宿主支持）
- `/brainstorm --personas "designer,economist,skeptic" "pricing"` —— 自定义 persona
- `/brainstorm --lens analogical "onboarding"` —— 强制使用类比透镜
- `/brainstorm --quick "reduce checkout friction"` —— 快速 3 想法模式
- `/brainstorm --no-rebuttal "topic"` —— 跳过反驳轮

## 下一步引导

`/brainstorm` 完成后，AI 助手应建议：

> **头脑风暴完成。建议下一步：**
> - 执行 `/requirement` 将最佳构想转为用户故事
> - 执行 `/sdd` 直接建立规格（若需求已明确）⭐ **推荐**
> - 针对特定构想进行更深入的探索

## 参考

- 详细指南：[guide.md](./guide.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文档：[`/brainstorm`](../commands/brainstorm.md#ai-代理行为)
