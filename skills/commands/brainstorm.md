---
name: brainstorm
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# Brainstorm Assistant | 腦力激盪助手

Structured ideation before specification writing. Transform vague ideas into actionable feature proposals through guided brainstorming.

在撰寫規格前進行結構化發想。透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

## Usage | 用法

```bash
/brainstorm [problem or feature idea]
```

## Workflow | 工作流程

```
FRAME ──► DIVERGE ──► CONVERGE ──► OUTPUT
定義問題     發散思考       收斂評估       輸出提案
```

| Phase | Goal | Key Techniques | 目標 |
|-------|------|----------------|------|
| **FRAME** | Define problem clearly | 5 Whys, HMW, Stakeholder Map | 清楚定義問題 |
| **DIVERGE** | Generate many ideas | HMW, SCAMPER, Six Thinking Hats | 產生大量想法 |
| **CONVERGE** | Evaluate and rank | Evaluation Matrix, Dot Voting | 評估與排序 |
| **OUTPUT** | Actionable report | Brainstorm Report template | 可執行的報告 |

## Techniques | 技法

| Technique | Best For | 適用場景 |
|-----------|----------|----------|
| **5 Whys** | Finding root causes | 找到根本原因 |
| **HMW** | Reframing problems as opportunities | 將問題重構為機會 |
| **SCAMPER** | Improving existing features | 改善現有功能 |
| **Six Thinking Hats** | Multi-perspective analysis | 多角度分析 |
| **Dot Voting** | Quick prioritization | 快速排序 |

## Examples | 範例

```bash
/brainstorm                           # Start interactive session
/brainstorm "user retention"          # Brainstorm around a topic
/brainstorm --technique scamper       # Use a specific technique
```

## Output Format | 輸出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem from FRAME phase]

## Top 3 Recommendations
1. **[Idea]** — Score: X.X — [Why recommended]
2. **[Idea]** — Score: X.X — [Why recommended]
3. **[Idea]** — Score: X.X — [Why recommended]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## Next Steps | 後續步驟

After brainstorming, the typical workflow is:

1. `/brainstorm` - Structured ideation (this command)
2. `/requirement` - Write user stories and requirements
3. `/sdd` - Create specification documents
4. `/derive-all` or `/tdd` - Implement with test protection

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/brainstorm` | 詢問要探討的主題或問題，進入 FRAME 階段 |
| `/brainstorm "topic"` | 以指定主題開始，進入 FRAME 階段 |
| `/brainstorm --technique <name>` | 使用指定技法開始 DIVERGE 階段 |

### Interaction Script | 互動腳本

#### FRAME Phase
1. 釐清問題陳述（使用 5 Whys 或 HMW）
2. 確認問題定義

🛑 **STOP**: 問題定義後等待使用者確認

#### DIVERGE Phase
1. 使用選定技法生成想法
2. 鼓勵數量優先於品質
3. 列出所有想法

#### CONVERGE Phase
1. 以評估矩陣（可行性、影響力、成本）評分
2. 排序前 3 名

🛑 **STOP**: 展示 Brainstorm Report 後等待使用者決定下一步

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 問題定義後 | 確認問題正確 |
| 報告展示後 | 決定進入 `/requirement` 或 `/sdd` |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 主題太廣泛 | 引導縮小範圍 |
| 指定的技法不存在 | 列出可用技法供選擇 |

## References | 參考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
