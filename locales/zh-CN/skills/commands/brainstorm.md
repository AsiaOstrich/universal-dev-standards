---
source: ../../../../skills/commands/brainstorm.md
source_version: 4.0.0
source_hash: b4d32a8b638e
translation_version: 4.0.0
last_synced: 2026-07-09
---

---
name: brainstorm
description: "[UDS] 在编写规格前进行结构化 AI 辅助头脑风暴"
argument-hint: "[问题或功能构想 | problem or feature idea]"
---

# 头脑风暴助手

在编写规格前进行结构化发想。通过 persona 集成式头脑风暴，将模糊构想转化为可执行的功能提案。

## 用法

```bash
/brainstorm [problem or feature idea]
```

## 工作流程

```
PRE-FLIGHT ──► FRAME ──► DIVERGE ──────────► CONVERGE ─────────► OUTPUT
  防锚定        定义问题    persona 集成+透镜     多评审面板+硬角色反驳   输出提案
```

| 阶段 | 目标 | 关键技法（v3）+ BQS 闸（v4） |
|------|------|-------------------------------|
| **PRE-FLIGHT** | 防止 AI 锚定 | 用户先写 3 个想法；不用类比种子；**BQS 第 0 层意图（explore/exploit）** |
| **FRAME** | 清楚定义问题 | 5 Whys, HMW, Stakeholder Map；**D1 框架纯度** |
| **DIVERGE** | 逼出视角多样性 | persona 集成 + 多样性透镜；**BQS 第 1 层 D1–D4，硬闸隐藏 D5–D8** |
| **CONVERGE** | 经偏误检查的选择 | 多评审面板 + Devil's Advocate/Steelman；**BQS 第 2 层 D5–D8 施于 Top 3，D4 判官≠产生者** |
| **OUTPUT** | 可执行的报告 | Brainstorm Report + Seeds + 争议区 + **第 3 层 Judgment Override** |

> **BQS v1（XSPEC-296）：** v4 在 v3 上叠加四层 × 时间轴质量契约。完整 oracle 与结构规则见 skill：[Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md#bqs-v1--质量契约)。

## 技法

| 技法 | 适用场景 |
|------|----------|
| **persona 集成** | 强制视角多样性（v3 核心） |
| **多样性透镜** | 类比 / 反转 / 形态 |
| **多评审面板** | 降偏误评分（v3 核心） |
| **Devil's Advocate + Steelman** | 硬角色反驳 |
| **5 Whys / HMW / SCAMPER / 六顶帽** | 经典框定与发散 |

## 范例

```bash
/brainstorm                                          # Start interactive session
/brainstorm "user retention"                         # Brainstorm around a topic
/brainstorm --enhanced "user retention"              # Parallel persona ensemble (if host supports it)
/brainstorm --personas "designer,economist,skeptic"  # Custom personas
/brainstorm --lens analogical "onboarding"           # Force the analogical lens
/brainstorm --quick "reduce checkout friction"       # Fast 3-idea mode
```

## 输出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem from FRAME phase]

## Top 3 Recommendations
1. **[Idea]** — Agg. X.X ✓ Passed rebuttal — Persona: [..] — [Why recommended]

## Diversity Note
[How many distinct personas/lenses the surviving ideas span]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## 后续步骤

头脑风暴后，典型的工作流程是：

1. `/brainstorm` - 结构化发想（本命令）
2. `/requirement` - 撰写用户故事和需求
3. `/sdd` - 创建规格文档
4. `/derive-all` 或 `/tdd` - 以测试保护进行实现

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/brainstorm` | 启动 PRE-FLIGHT，请用户先写 问题＋3 想法＋反向排除 |
| `/brainstorm "topic"` | 以指定主题启动 PRE-FLIGHT，再进入 FRAME |
| `/brainstorm --personas "a,b,c"` | 以自定义 persona 组进入 DIVERGE |
| `/brainstorm --lens <name>` | 以指定多样性透镜为主进入 DIVERGE |
| `/brainstorm --enhanced` | 若宿主支持子代理则并行跑 persona/评审，否则静默退回 baseline；此模式下 BQS D4 方可 pass |
| `/brainstorm --intent exploit` | 以 exploit 意图启动（BQS 第 0 层），D2 低覆盖不扣分 |

### 交互脚本

#### PRE-FLIGHT 阶段
1. 请用户先写 问题（一句）＋3 个初始想法＋最不想要的解法类型
2. 拒绝「像 X 但给 Y」种子，改写为底层问题
3. **BQS 第 0 层**：宣告本次 explore/exploit 配比与赌注类型（未宣告默认偏 explore）

🛑 **STOP**: 收到三项输入前不生成任何想法（`--skip-preflight` 例外，显示锚定警告）

#### FRAME 阶段
1. 厘清问题陈述（5 Whys 找根因）
2. 重构为 HMW 问题；识别利益相关者
3. **BQS D1 框架纯度**：问题不得内嵌特定方案或「像 X 给 Y」，须到根因

🛑 **STOP**: 问题定义后等待用户确认

#### DIVERGE 阶段（BQS 第 1 层 — D1–D4 leading，全程可见）
1. 逐一以默认 persona（领域专家／怀疑者／跨域类比者／成本约束者／用户代言）思维链生成想法
2. **分支隔离**：生成各 persona 时不互相预览，全部产完才一起呈现
3. 至少套用一个多样性透镜（类比／假设反转／形态矩阵）
4. 以多样性（覆盖的 persona/透镜数，D2/D3）而非数量为继续门槛
5. **硬序列闸**：D5–D8 在最后一个 persona 产完前**不得揭示或评分**；CONVERGE critic 不得提前调用

#### CONVERGE 阶段（BQS 第 2 层 — D5–D8 仅施于 Top 3）
1. 以 3 个独立评审（工程可行性／用户影响／战略一致）各自评分后聚合
2. 对前 3 名跑硬角色 Devil's Advocate（论证会失败）+ Steelman；用户以 (a)修改/(b)反驳/(c)移除 回应。**D4 判官≠产生者**：评审须在独立 context（`--enhanced`）方可 pass，否则标 `[degraded]` 不得 pass
3. **仅对 Top 3** 套用 D5 接地（外部事实需 file:line／来源、跨级地板；假说免接地）、D6 净值（解谁问题／真有吗／不做代价＋挂 lagging 栏）、D7 二态证伪（「需先做 X」转 next-step、不算 fail）、D8 next-step 裁决
4. **Meta 停止规则**：维度全绿且再跑一轮 Top 3 集合成员不变→停；硬上限 2 轮

🛑 **STOP**: 展示 Brainstorm Report（含 Seeds／争议区／Judgment Override）后等待用户决定下一步

### 停止点

| 停止点 | 等待内容 |
|--------|----------|
| PRE-FLIGHT 提交前 | 收到用户三项输入 |
| 问题定义后 | 确认问题正确 |
| 反驳轮每个反对理由 | 用户 (a)/(b)/(c) 回应 |
| 报告展示后 | 决定进入 `/requirement` 或 `/sdd` |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 主题太宽泛 | 引导缩小范围 |
| 使用「像 X 但给 Y」种子 | 改写为底层问题再继续（反种子 guardrail） |
| 指定的 persona/透镜不存在 | 列出可用选项供选择 |
| `--enhanced` 但宿主不支持子代理 | 静默退回 baseline，照常进行 |
| 前 3 名全来自同一 persona/透镜 | 标示并在输出前再跑一个透镜 |
| baseline 单 context 跑评审（无独立 context） | BQS D4 标 `[degraded]`，不得标 pass |
| 外部事实宣称无 file:line／来源 | D5 接地 fail，要求补来源或改标 `[假说]` |

## 参考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Brainstorm Assistant Guide](../brainstorm-assistant/guide.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
