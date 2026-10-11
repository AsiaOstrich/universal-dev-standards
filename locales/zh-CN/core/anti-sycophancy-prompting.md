---
source: ../../../core/anti-sycophancy-prompting.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 860d9e77855b
status: current
---

# 防迎合提示词设计标准

> **语言**: [English](../../../core/anti-sycophancy-prompting.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-15
**适用范围**: 所有 AI Agent 实现与 LLM Prompt 设计
**Scope**: universal
**业界标准**: 无（UDS 原创，参考 RLHF 迎合性研究）

---

## 目的

本标准定义一套技法与规则，用于设计能让 LLM 给出真实、批判性回应的提示词，而非迎合用户的隐含偏好。

LLM 的迎合性源自 RLHF 训练目标：人类评分者倾向于给予令人愉快的回应高分，导致模型将「让用户满意」置于「准确性」之上。

---

## 核心技法

### 1. Socratic 反诘框架（REQ-1）

将任务从「评估我的想法」改为「攻击我的想法」，消除迎合诱因。

| 应该做 | 不应该做 |
|--------|----------|
| ✅ 要求列出最致命的 3 个质疑 | ❌ 问「这个想法好吗？」 |
| ✅ 每个质疑必须有技术依据 | ❌ 允许模糊的正向框架 |
| ✅ 明确禁止正向开场词语 | ❌ 接受「很好的想法，但是...」模式 |

**Prompt 模板**：
```
Do not evaluate whether this is good or bad.
List the 3 most fatal objections to: [idea]
Each objection must be technically grounded and non-trivial to dismiss.
```

---

### 2. 先问立场防锚定协议（REQ-2）

在用户揭示立场前先取得 LLM 的独立判断，防止锚定效应。

| 步骤 | 动作 |
|------|------|
| 1 | 在未揭示偏好的情况下询问中立比较 |
| 2 | 取得独立判断 |
| 3 | 揭示用户立场 |
| 4 | 若模型改变立场，要求提出明确的技术理由 |

**工作流程**：
```
Round 1: "Compare [A] vs [B] for [context]. Which is better?"
→ Wait for independent judgment

Round 2: "I prefer [A]. Does this change your assessment? Why?"
→ Model must justify any position change with technical facts
```

---

### 3. 强制双栏对称输出（REQ-3）

用格式约束强迫呈现对立观点的平衡。

**必要格式**：
```
| Arguments FOR the decision | Arguments AGAINST the decision |
|---------------------------|-------------------------------|
| [Equal weight content]    | [Equal weight content]        |

Net Recommendation: [Must take a clear stance, may recommend against]
```

**规则**：
- 两栏字数差距不超过 20%
- 净建议必须明确，可以是否定的
- 模型不得借由填充一栏来规避格式

---

### 4. 信心度与不确定性标记（REQ-4）

要求在所有建议上附加信心评分，呈现不确定性。

**格式**：
```
Recommendation: [specific action]
Confidence: [1-5] — [reason for uncertainty]
Unknown: [what information would change this assessment]
```

**信心度定义**：

| 等级 | 意义 |
|------|------|
| 5 | 已在类似规模验证，高确定性 |
| 4 | 业界标准，有充分文献支持 |
| 3 | 合理推断，建议 PoC 验证 |
| 2 | 不确定，强烈建议先进行 Spike |
| 1 | 高度不确定，不建议直接采用 |

**规则**：
- 信心 < 3 必须标示「需要更多信息才能确认」
- 所有重要主张都需要信心标记
- 不确定性必须具体（说明哪些信息可以解决不确定性）

---

### 5. 迎合性回应启发式检测（REQ-5）

用于检测迎合性回应的启发式规则，可用于自动化后处理。

| 信号类型 | 检测规则 |
|----------|----------|
| 正向开场 | 回应前 50 个 token 包含迎合性词语（如「很好」「有趣」「当然」「当然可以」） |
| 立场翻转 | 用户揭示偏好后，模型在没有新技术证据的情况下改变立场 |
| 风险淡化 | 句式：「虽然有些小问题，但整体上...」而未说明具体问题 |
| 缺乏量化 | 重要建议缺少信心评分或具体度量指标 |

**触发条件**：检测到 2 个以上信号 → 以 Red Team 框架触发再评估。

---

## 禁止行为

| 禁止 | 正确做法 |
|------|----------|
| 以正向肯定开场批评 | 直接从分析开始 |
| 在无新技术证据的情况下改变立场 | 维持立场，或引用具体的新信息 |
| 在无依据的情况下将风险描述为「小问题」 | 量化风险或解释为何风险有界 |
| 提供重要建议却不附信心评分 | 始终附上信心（1-5）与不确定性说明 |

---

## 与 Agent Prompt 的整合

应用至 AI Agent 时：

| Agent 类型 | 应用规则 |
|------------|----------|
| 代码审查 Agent | REQ-1（Socratic）+ REQ-3（双栏）+ REQ-5（检测） |
| 架构建议 Agent | REQ-2（先问立场）+ REQ-4（信心度）+ REQ-5（检测） |
| Bug 分析 Agent | REQ-1（Socratic）+ REQ-4（信心度） |
| 一般咨询 Agent | REQ-3（双栏）+ REQ-4（信心度） |

---

## 完整防迎合 Prompt 模板

```
You are a domain expert with no emotional investment in my satisfaction.
Your role is to identify flaws in my thinking, not to make me feel good.

Rules:
- Do NOT open with positive phrases (good, interesting, nice, certainly)
- Every recommendation must include a confidence level (1-5) and what you are uncertain about
- If my direction is wrong, say so directly

My question: [question]

First, list the incorrect assumptions I may be holding about this problem.
Then give your honest recommendation.
```

---

## 检查清单

- [ ] 提示词未邀请认同（「这样好吗？」）
- [ ] 明确禁止正向开场词语
- [ ] 在揭示用户偏好前先取得模型的独立立场（若适用）
- [ ] 评估任务强制使用双栏格式
- [ ] 重要建议需要信心等级
- [ ] 对输出应用迎合性检测，再呈现给用户

---

## 相关标准

- [anti-hallucination.md](../../../core/anti-hallucination.md) — 防止幻觉；与防迎合互补
- [agent-epistemic-calibration.md](../../../core/anti-hallucination.md) — Agent 设计中的认知谦逊（若适用）
