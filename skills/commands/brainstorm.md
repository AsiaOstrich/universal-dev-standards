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

## References | 參考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
