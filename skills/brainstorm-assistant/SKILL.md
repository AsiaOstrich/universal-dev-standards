---
name: brainstorm
scope: universal
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
allowed-tools: Read, Glob, Grep, Write
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# Brainstorm Assistant | 腦力激盪助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/SKILL.md)

Structured ideation before specification writing. Transform vague ideas into actionable feature proposals through guided brainstorming — grounded in cognitive science research.

在撰寫規格前進行結構化發想。以認知科學研究為基礎，透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

> **Implements**: XSPEC-196 brainstorm-assistant v2 — Cognitive Science Upgrade

## Workflow | 工作流程

```
PRE-FLIGHT ──► FRAME ──► DIVERGE ──► CONVERGE ──► OUTPUT
  防止錨定      定義問題    發散思考      反駁收斂      輸出提案
```

---

### Phase 0: PRE-FLIGHT | 防止 AI 錨定（新增）

**Why this phase exists:** Research (Nominal Group Technique) shows that seeing
AI output first anchors your thinking to the AI's training-data centre. Writing
your own ideas *before* the AI generates anything consistently produces more
diverse and higher-quality results.

**本階段存在的原因：** Nominal Group Technique 研究顯示，先看到 AI 輸出會將思考錨定在
AI 的訓練資料中心。在 AI 生成任何內容之前先寫下自己的想法，能持續產出更多樣、更高品質的結果。

**Before the AI generates any content**, the user completes three items:

在 AI 生成任何內容之前，使用者完成三件事：

| Item | Prompt | 說明 |
|------|--------|------|
| 1 | One-sentence problem description | 一句話描述問題 |
| 2 | Three initial ideas (any format, any quality) | 3 個初始想法（任意形式、不限品質） |
| 3 | "Solution types I do NOT want" (N/A allowed) | 「我最不想要的解法類型」（可填 N/A） |

**After the user submits**, the AI reads all three inputs and proceeds to FRAME.
The AI's first DIVERGE batch MUST be labelled "Exploring directions you haven't
mentioned" and MUST NOT duplicate any of the user's three submitted ideas.

**使用者提交後**，AI 讀取全部三項輸入再進入 FRAME。AI 的第一批 DIVERGE 輸出必須標示
「探索你尚未提及的方向」，且不得重複使用者已提交的任何想法。

**Flag:** `--skip-preflight` bypasses this phase with a one-line warning:
`⚠ Skipping Pre-flight may cause AI anchoring`

---

### Phase 1: FRAME | 定義問題

Define the problem space clearly before generating ideas.

在產生想法之前，先清楚定義問題空間。

| Step | Action | 步驟 |
|------|--------|------|
| 1 | Clarify the problem with 5 Whys | 用 5 Whys 釐清問題根因 |
| 2 | Reframe as "How Might We" (HMW) questions | 重構為 HMW 問題 |
| 3 | Identify stakeholders and constraints | 識別利害關係人與限制條件 |
| 4 | Gather context from codebase (if applicable) | 從程式碼庫蒐集脈絡（如適用） |

---

### Phase 2: DIVERGE | 發散思考

Generate ideas in **two semantic batches**. A minimum of **10 ideas** is
required before CONVERGE unlocks. The "Enter CONVERGE" option is hidden until
this gate is met.

分兩個語義批次產生想法。CONVERGE 解鎖前需累積最少 **10 個想法**，達標前「進入 CONVERGE」
選項不顯示。

#### Batch 1 — Intuition Batch (ideas 1–5) | 直覺批

Generate fast, unfiltered ideas. Label this batch "Intuition Batch — fast,
unfiltered". Upon completing idea 5, display:
`✓ Intuition batch complete`

快速、不過濾地產生想法。完成第 5 個後顯示：`✓ 直覺批完成`

#### Batch 2 — Extension Batch (ideas 6–10) | 延伸批

Display before starting: "Extension Batch: ideas must cross the semantic
boundary of Batch 1". If a proposed idea shares a theme type with any Batch 1
idea, flag: `⚠ Semantic overlap — try a different direction` (non-blocking).

開始前顯示延伸批提示。若想法主題與第一批重複，顯示警告（非阻擋）。

#### Gate | 門檻

- Below 10 ideas: show `Continue diverging (N/10)`, do not offer CONVERGE
- At 10+ ideas: unlock CONVERGE; no upper limit on continuing

少於 10 個：顯示「繼續發散（N/10）」；10 個以上：解鎖 CONVERGE，可繼續無上限。

#### Techniques | 技法

| Technique | When to Use | 使用時機 |
|-----------|-------------|----------|
| **HMW Questions** | Default starting point | 預設起點 |
| **SCAMPER** | Improving existing features | 改善現有功能 |
| **Six Thinking Hats** | Need multiple perspectives | 需要多角度思考 |

---

### Phase 3: CONVERGE | 反駁收斂

Two sub-steps: scoring, then the **Rebuttal Round**.

兩個子步驟：評分，然後進行**反駁輪**。

#### Step 3a: Scoring | 評分

| Criterion | Weight | 評估標準 |
|-----------|--------|----------|
| Feasibility | 30% | 技術可行性 |
| Impact | 30% | 使用者影響力 |
| Effort | 20% | 實作成本 |
| Alignment | 20% | 目標一致性 |

#### Step 3b: Rebuttal Round | 反駁輪（新增）

**Why this step exists:** Nemeth (1995) showed that groups allowed to debate
produce more and better ideas than groups following "no-criticism" rules.
Challenging the top ideas before committing prevents selecting ideas that merely
*sound* good under positive-only evaluation.

**本步驟存在的原因：** Nemeth (1995) 證明允許辯論的小組比遵守「禁止批評」規則的小組
產出更多更好的想法。在確定前挑戰最佳想法，能防止選出只是在正向評估下「聽起來不錯」的方案。

For each of the **top 3 scored ideas**, the AI presents **2 specific
counterarguments** in the format: "This idea will fail in [context] because
[reason]." Vague concerns ("this might be hard") are not acceptable.

對前三名想法，AI 各提出 **2 個具體反對理由**，格式為：「在 [情境] 下，此想法會失敗，
因為 [原因]。」模糊的顧慮（「這可能有點困難」）不可接受。

The user **must** respond to each counterargument before the session advances:

使用者必須對每個反對理由給出回應才能繼續：

| Option | Action | 說明 |
|--------|--------|------|
| (a) | Accept criticism → provide modified version | 接受批評 → 提供修改版本 |
| (b) | Disagree → provide reason to retain | 不同意 → 說明保留理由 |
| (c) | Criticism valid → remove from ranking | 批評成立 → 從排名移除 |

**Flag:** `--no-rebuttal` skips this step; report section marked
"Rebuttal: skipped".

---

### Phase 4: OUTPUT | 輸出提案

Produce a Brainstorm Report ready for `/requirement` or `/sdd`.

產生可直接對接 `/requirement` 或 `/sdd` 的腦力激盪報告。

Each idea that passed the rebuttal round is marked `✓ Passed rebuttal` with a
one-line summary of the user's response.

通過反駁輪的想法標記 `✓ Passed rebuttal` 及使用者回應摘要一行。

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
| # | Idea | Batch | Source Technique | Feasibility | Impact | Score |
|---|------|-------|-----------------|-------------|--------|-------|
| 1 | ...  | B1    | SCAMPER          | 4/5         | 5/5    | 4.3   |
| 2 | ...  | B2    | HMW              | 3/5         | 4/5    | 3.5   |

## Top 3 Recommendations
1. **[Idea Name]** ✓ Passed rebuttal — [Why recommended] — [User rebuttal response summary]
2. **[Idea Name]** ✓ Passed rebuttal — [Why recommended] — [User rebuttal response summary]
3. **[Idea Name]** ✓ Passed rebuttal — [Why recommended] — [User rebuttal response summary]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
- [ ] Need further exploration of idea #N
```

## Technique Quick Reference | 技法速覽

| Technique | Purpose | Steps | 用途 |
|-----------|---------|-------|------|
| **5 Whys** | Root cause analysis | Ask "Why?" 5 times | 根因分析 |
| **HMW** | Problem reframing | "How might we [verb] [outcome]?" | 問題重構 |
| **SCAMPER** | Idea modification | 7 prompts: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse | 創意改造 |
| **Six Thinking Hats** | Multi-perspective | 6 modes: Facts, Emotions, Risks, Benefits, Creativity, Process | 多角度思考 |
| **Dot Voting** | Quick prioritization | Each participant gets 3 votes | 快速排序 |

## Flags | 旗標

| Flag | Effect | 說明 |
|------|--------|------|
| `--skip-preflight` | Skip Phase 0 with warning | 跳過 Phase 0，顯示錨定警告 |
| `--no-rebuttal` | Skip rebuttal round in CONVERGE | 跳過反駁輪，報告標注 skipped |
| `--quick` | 3-idea fast mode; gates and rebuttal exempt | 快速 3 想法模式；門檻與反駁均豁免 |
| `--technique scamper` | Force SCAMPER as primary technique | 強制使用 SCAMPER |

## Usage | 使用方式

- `/brainstorm` — Start interactive brainstorming session
- `/brainstorm "user retention"` — Brainstorm around a specific topic
- `/brainstorm --quick "reduce checkout friction"` — Fast 3-idea mode
- `/brainstorm --skip-preflight "feature X"` — Skip Pre-flight (with warning)
- `/brainstorm --no-rebuttal "topic"` — Skip rebuttal round
- `/brainstorm --technique scamper` — Use a specific technique

## Next Steps Guidance | 下一步引導

After `/brainstorm` completes, the AI assistant should suggest:

> **腦力激盪完成。建議下一步 / Brainstorming complete. Suggested next steps:**
> - 執行 `/requirement` 將最佳構想轉為使用者故事 — Convert top idea to user stories
> - 執行 `/sdd` 直接建立規格（若需求已明確）⭐ **Recommended / 推薦** — Create spec directly (if requirements are clear)
> - 針對特定構想進行更深入探索 — Explore a specific idea further

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/brainstorm`](../commands/brainstorm.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/brainstorm`](../commands/brainstorm.md#ai-agent-behavior--ai-代理行為)
