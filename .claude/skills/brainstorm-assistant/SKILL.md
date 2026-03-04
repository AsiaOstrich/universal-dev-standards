---
name: brainstorm
scope: universal
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
allowed-tools: Read, Glob, Grep, Write
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# Brainstorm Assistant | 腦力激盪助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/SKILL.md)

Structured ideation before specification writing. Transform vague ideas into actionable feature proposals through guided brainstorming.

在撰寫規格前進行結構化發想。透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

## Workflow | 工作流程

```
FRAME ──► DIVERGE ──► CONVERGE ──► OUTPUT
定義問題     發散思考       收斂評估       輸出提案
```

### Phase 1: FRAME | 定義問題

Define the problem space clearly before generating ideas.

在產生想法之前，先清楚定義問題空間。

| Step | Action | 步驟 |
|------|--------|------|
| 1 | Clarify the problem with 5 Whys | 用 5 Whys 釐清問題 |
| 2 | Reframe as "How Might We" (HMW) questions | 重構為 HMW 問題 |
| 3 | Identify stakeholders and constraints | 識別利害關係人與限制 |
| 4 | Gather context from codebase (if applicable) | 從程式碼庫蒐集脈絡 |

### Phase 2: DIVERGE | 發散思考

Generate as many ideas as possible without judgment.

不加評判地盡可能產生多個想法。

| Technique | When to Use | 使用時機 |
|-----------|-------------|----------|
| **HMW Questions** | Default starting point | 預設起點 |
| **SCAMPER** | Improving existing features | 改善現有功能 |
| **Six Thinking Hats** | Need multiple perspectives | 需要多角度思考 |

### Phase 3: CONVERGE | 收斂評估

Evaluate and prioritize ideas using structured criteria.

使用結構化標準評估與排序想法。

| Criterion | Weight | 評估標準 |
|-----------|--------|----------|
| Feasibility | 30% | 技術可行性 |
| Impact | 30% | 使用者影響力 |
| Effort | 20% | 實作成本 |
| Alignment | 20% | 目標一致性 |

### Phase 4: OUTPUT | 輸出提案

Produce a Brainstorm Report ready for `/requirement` or `/sdd`.

產生可直接對接 `/requirement` 或 `/sdd` 的腦力激盪報告。

## Technique Quick Reference | 技法速覽

| Technique | Purpose | Steps | 用途 |
|-----------|---------|-------|------|
| **5 Whys** | Root cause analysis | Ask "Why?" 5 times | 根因分析 |
| **HMW** | Problem reframing | "How might we [verb] [outcome]?" | 問題重構 |
| **SCAMPER** | Idea modification | 7 prompts: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse | 創意改造 |
| **Six Thinking Hats** | Multi-perspective | 6 modes: Facts, Emotions, Risks, Benefits, Creativity, Process | 多角度思考 |
| **Dot Voting** | Quick prioritization | Each participant gets 3 votes | 快速排序 |

## Output Format | 輸出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem from FRAME phase]

## HMW Questions
1. How might we ...?
2. How might we ...?
3. How might we ...?

## Ideas Generated
| # | Idea | Source Technique | Feasibility | Impact | Score |
|---|------|-----------------|-------------|--------|-------|
| 1 | ...  | SCAMPER          | 4/5         | 5/5    | 4.3   |
| 2 | ...  | HMW              | 3/5         | 4/5    | 3.5   |

## Top 3 Recommendations
1. **[Idea Name]** - [Why this is recommended]
2. **[Idea Name]** - [Why this is recommended]
3. **[Idea Name]** - [Why this is recommended]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
- [ ] Need further exploration of idea #N
```

## Usage | 使用方式

- `/brainstorm` - Start interactive brainstorming session
- `/brainstorm "user retention"` - Brainstorm around a specific topic
- `/brainstorm --technique scamper` - Use a specific technique

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
