---
scope: universal
description: |
  Guide structured AI-assisted brainstorming before specification writing.
  Use when: vague ideas, feature exploration, problem reframing, creative ideation.
  Keywords: brainstorm, ideation, HMW, SCAMPER, Six Thinking Hats, 腦力激盪, 發想, 創意.
---

# Brainstorm Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/guide.md)

**Version**: 2.0.0
**Last Updated**: 2026-05-09
**Applicability**: All software projects
**Scope**: universal
**Type**: Utility Skill (no core standard)

---

## Purpose

Most specification frameworks assume developers already have a clear idea. In practice, many features start as vague notions — "improve onboarding", "make it faster", "add social features". Jumping directly to specification writing without structured ideation leads to:

- Narrow solutions that miss better alternatives
- Specs that solve symptoms instead of root causes
- Wasted effort on features that don't address real needs

This skill fills the ideation gap in the UDS workflow:

```
/brainstorm → /requirement → /sdd → Implementation
     ▲              ▲          ▲
  (this)          Existing   Existing
```

---

## Research Foundations | 認知科學依據

The v2.0 workflow is grounded in three research findings that challenge
assumptions in Osborn's classic brainstorming rules:

v2.0 流程基於三項研究發現，這些發現挑戰了 Osborn 經典腦力激盪規則中的假設：

### 1. Independent thinking before merging (Nominal Group Technique)

Groups where members first generate ideas independently — then combine — consistently
outperform interacting groups in both quantity and quality. The mechanism is
**production blocking**: while listening to others (or reading AI output), your
own thought stream is interrupted.

**Application in this skill:** Phase 0 PRE-FLIGHT collects three user ideas
before the AI generates anything, preventing AI-first anchoring.

**在本 Skill 的應用：** Phase 0 PRE-FLIGHT 在 AI 生成任何內容前收集使用者的三個想法，
防止 AI 先說話導致的錨定效應。

### 2. Creative ideas appear in the second half of divergence (Nijstad et al.)

Studies consistently show that the first 3–5 ideas in any brainstorming session
are almost always the most familiar and obvious. Truly creative ideas emerge
after the "obvious answer zone" is exhausted — typically after idea 7 or 8.

**Application in this skill:** The 10-idea minimum gate and semantic batching in
Phase 2 force users past this threshold before evaluation begins.

**在本 Skill 的應用：** Phase 2 的 10 個想法最低門檻和語義批次化，強制使用者在開始評估
前突破「顯而易見答案區」。

### 3. Debate produces more and better ideas than "no criticism" rules (Nemeth, 1995)

Charlan Nemeth's research directly challenges Osborn's core rule of deferring
all judgment. Groups instructed to debate and criticise generated more ideas,
of higher quality, than groups following traditional "no criticism" brainstorming
rules. The mechanism: criticism forces explicit defence of assumptions, surfacing
hidden weaknesses before commitment.

**Application in this skill:** The Rebuttal Round in Phase 3 introduces
structured debate on the top-ranked ideas before final selection.

**在本 Skill 的應用：** Phase 3 的反駁輪在最終選擇前對排名最高的想法引入結構化辯論。

---

## Quick Reference

### Workflow Overview

```
┌─────────────┐  ┌────────────┐  ┌─────────────────┐  ┌─────────────┐  ┌────────────┐
│  PRE-FLIGHT │─▶│   FRAME    │─▶│    DIVERGE      │─▶│  CONVERGE   │─▶│   OUTPUT   │
│  (Phase 0)  │  │ Define the │  │ Batch 1 (1-5)   │  │ Score +     │  │ Brainstorm │
│ User writes │  │ problem    │  │ Batch 2 (6-10+) │  │ Rebuttal    │  │ Report     │
│ 3 ideas     │  │            │  │ Gate: ≥10 ideas │  │ Round       │  │            │
└─────────────┘  └────────────┘  └─────────────────┘  └─────────────┘  └────────────┘
```

### Phase Summary

| Phase | Goal | Key Mechanism | Time |
|-------|------|---------------|------|
| **PRE-FLIGHT** | Prevent AI anchoring | User writes 3 ideas first | 3–5 min |
| **FRAME** | Define problem clearly | 5 Whys, HMW | 10–15 min |
| **DIVERGE** | Generate ≥10 diverse ideas | Batching + semantic gate | 15–25 min |
| **CONVERGE** | Select battle-tested ideas | Scoring + Rebuttal Round | 15–20 min |
| **OUTPUT** | Actionable report | Brainstorm Report template | 5–10 min |

---

## Phase 0: PRE-FLIGHT | 防止 AI 錨定

> Goal: Establish independent thinking before any AI content is generated.
>
> 目標：在任何 AI 內容生成之前，建立使用者的獨立思考框架。

### Why this matters

The single highest-leverage change in v2.0. Research shows that once a person
sees any AI-generated framing, subsequent ideas cluster within that semantic
space. Pre-flight creates an "intellectual immune system" against this bias.

v2.0 中槓桿效應最高的改動。研究顯示，一旦看到任何 AI 生成的框架，後續想法就會在該語義
空間內聚集。Pre-flight 為這種偏見創造了「智識免疫系統」。

### Prompt the user to provide

```
Before we start brainstorming, please take 2–3 minutes to write:

1. Problem (one sentence): What is the core problem you want to solve?
2. Your initial ideas (3, any quality):
   - Idea A:
   - Idea B:
   - Idea C:
3. What I do NOT want (solution type to avoid, or N/A):

Submit when ready. The AI will read these before generating anything.
```

### AI behaviour after receiving Pre-flight input

1. Acknowledge the user's ideas without evaluating them
2. Proceed to FRAME
3. In DIVERGE Batch 1, explicitly explore directions the user did not mention
4. If the user declared an unwanted solution type, exclude that type from all
   generated ideas throughout the session

### Skipping Pre-flight

Use `--skip-preflight` to bypass. A one-line warning is displayed:

```
⚠ Skipping Pre-flight may cause AI anchoring
```

The session continues immediately to FRAME. Pre-flight skip is appropriate when:
- The user has already written extensive notes elsewhere
- This is a repeat session on a well-understood problem
- Time is severely constrained (use `--quick` instead when possible)

---

## Phase 1: FRAME | 定義問題

> Goal: Ensure we're solving the right problem before generating solutions.
>
> 目標：在產生解決方案之前，確保我們正在解決正確的問題。

### Step 1.1: 5 Whys — Root Cause Analysis

Ask "Why?" repeatedly to dig beneath surface-level problems.

**Template:**

```
Problem: [Initial problem statement]

Why 1: Why does this problem exist?
→ Because [reason 1]

Why 2: Why does [reason 1] happen?
→ Because [reason 2]

Why 3: Why does [reason 2] happen?
→ Because [reason 3]

Why 4: Why does [reason 3] happen?
→ Because [reason 4]

Why 5: Why does [reason 4] happen?
→ Because [root cause]

Root Cause: [root cause]
```

**Example:**

```
Problem: Users abandon the checkout flow

Why 1: Why do users abandon checkout?
→ Because the process takes too long

Why 2: Why does it take too long?
→ Because there are 5 separate pages

Why 3: Why are there 5 pages?
→ Because each validation step has its own page

Why 4: Why does each validation need a page?
→ Because the original design assumed slow connections

Why 5: Why does that assumption still hold?
→ It doesn't — most users are on broadband now

Root Cause: Outdated multi-page architecture designed for dial-up era
```

### Step 1.2: HMW — Problem Reframing

Transform the root cause into opportunity-focused questions.

**Format:** "How might we [verb] [desired outcome] for [stakeholder]?"

**Rules:**
- Broad enough to allow creative solutions
- Specific enough to be actionable
- Never include a solution in the question

**Example HMW Questions:**

```
Root Cause: Outdated multi-page checkout architecture

HMW 1: How might we reduce checkout steps without losing validation?
HMW 2: How might we make the checkout feel instant?
HMW 3: How might we validate data without interrupting the user flow?
```

### Step 1.3: Stakeholder Mapping

Identify who is affected and their needs.

| Stakeholder | Needs | Pain Points |
|-------------|-------|-------------|
| End users | Fast, simple checkout | Too many steps |
| Business | High conversion rate | Cart abandonment |
| Developers | Maintainable code | Complex page transitions |

### Step 1.4: Codebase Context (if applicable)

When brainstorming for an existing project, gather context:

- **Read** `README.md`, `package.json` for project overview
- **Grep** for related features, existing implementations
- **Glob** for relevant file structures

This grounds ideation in reality and prevents proposing ideas that conflict with existing architecture.

---

## Phase 2: DIVERGE | 發散思考（v2.0 升級版）

> Goal: Generate at least 10 ideas across two semantic batches before evaluating any.
>
> 目標：在評估之前，跨越兩個語義批次產生至少 10 個想法。

### The 10-Idea Gate

**Research basis:** Nijstad et al. show that the most creative ideas appear in
the second half of a divergence session. Stopping at 3–5 ideas almost always
means stopping in the "obvious answer zone."

The "Enter CONVERGE" option is hidden until 10 ideas are generated. Below 10,
the status shows `Continue diverging (N/10)`.

### Batch 1 — Intuition Batch (ideas 1–5) | 直覺批

Generate fast, unfiltered ideas. Do not evaluate at this stage.

Rules:
- Speed over depth
- No idea is wrong
- Label the batch "Intuition Batch — fast, unfiltered"
- Display `✓ Intuition batch complete` after idea 5

### Batch 2 — Extension Batch (ideas 6–10) | 延伸批

Generate ideas that cross the semantic boundary of Batch 1.

Display before starting:
```
Extension Batch: ideas must cross the semantic boundary of Batch 1.
If your next idea is in the same theme category as a Batch 1 idea,
try a different angle first.
```

Semantic overlap detection (non-blocking):
- If a proposed idea shares a theme type with any Batch 1 idea, flag:
  `⚠ Semantic overlap — try a different direction`
- The user may still submit the idea; the flag is advisory only

### Continuing past 10

Users may continue beyond 10 ideas without limit. No upper gate exists.
After 10, the "Enter CONVERGE" option appears alongside "Continue diverging".

### Techniques

| Technique | When to Use | 使用時機 |
|-----------|-------------|----------|
| **HMW Questions** | Default starting point | 預設起點 |
| **SCAMPER** | Improving existing features | 改善現有功能 |
| **Six Thinking Hats** | Need multiple perspectives | 需要多角度思考 |

#### Technique A: HMW Brainstorming (Default)

For each HMW question, generate 3–5 solution ideas.

**Template:**

```
HMW: How might we [question]?

Ideas:
1. [Idea] — [Brief explanation]
2. [Idea] — [Brief explanation]
3. [Idea] — [Brief explanation]
4. [Idea] — [Brief explanation]
5. [Idea] — [Brief explanation]
```

#### Technique B: SCAMPER

Apply 7 creative prompts to an existing feature or process. Best for improving what already exists.

| Letter | Prompt | Question to Ask | Example |
|--------|--------|-----------------|---------|
| **S** | Substitute | What component can we replace? | Replace password auth with passkeys |
| **C** | Combine | What can we merge together? | Combine login + signup into one flow |
| **A** | Adapt | What can we borrow from elsewhere? | Adapt e-commerce one-click buy for SaaS |
| **M** | Modify | What can we enlarge, minimize, or change? | Minimize form fields to email-only |
| **P** | Put to other use | Can this serve a different purpose? | Use onboarding flow as feature tutorial |
| **E** | Eliminate | What can we remove entirely? | Eliminate email verification step |
| **R** | Reverse | What if we did the opposite? | Let users use first, register later |

**Template:**

```
Feature being improved: [feature name]

S - Substitute:  [idea]
C - Combine:     [idea]
A - Adapt:       [idea]
M - Modify:      [idea]
P - Put to use:  [idea]
E - Eliminate:   [idea]
R - Reverse:     [idea]
```

#### Technique C: Six Thinking Hats

Examine the problem from 6 distinct perspectives. Best when you need comprehensive analysis.

| Hat | Color | Focus | Question |
|-----|-------|-------|----------|
| 1 | White | Facts & Data | What do we know? What data do we have? |
| 2 | Red | Emotions & Intuition | What does our gut say? How do users feel? |
| 3 | Black | Risks & Caution | What could go wrong? What are the risks? |
| 4 | Yellow | Benefits & Optimism | What's the best case? What value does this add? |
| 5 | Green | Creativity | What new ideas emerge? What if we...? |
| 6 | Blue | Process & Summary | What's the big picture? What's our next step? |

---

## Phase 3: CONVERGE | 反駁收斂（v2.0 升級版）

> Goal: Select ideas that survive both positive scoring AND structured debate.
>
> 目標：選出同時通過正向評分和結構化辯論的想法。

### Step 3a: Evaluation Matrix | 評分

Score each idea on 4 criteria (1–5 scale):

| Criterion | Weight | Score Guide |
|-----------|--------|-------------|
| **Feasibility** | 30% | 5=trivial, 4=straightforward, 3=moderate, 2=hard, 1=near-impossible |
| **Impact** | 30% | 5=transformative, 4=significant, 3=moderate, 2=minor, 1=negligible |
| **Effort** | 20% | 5=hours, 4=days, 3=weeks, 2=months, 1=quarters (inverted: lower effort = higher score) |
| **Alignment** | 20% | 5=core mission, 4=strategic, 3=relevant, 2=tangential, 1=off-mission |

**Weighted Score Formula:**

```
Score = (Feasibility × 0.3) + (Impact × 0.3) + (Effort × 0.2) + (Alignment × 0.2)
```

**Example:**

| # | Idea | Feasibility | Impact | Effort | Alignment | **Score** |
|---|------|-------------|--------|--------|-----------|-----------|
| 1 | Single-page checkout | 4 | 5 | 3 | 5 | **4.3** |
| 2 | One-click buy | 3 | 4 | 2 | 4 | **3.3** |
| 3 | Progressive form | 5 | 4 | 4 | 4 | **4.3** |
| 4 | Guest checkout | 5 | 3 | 5 | 3 | **4.0** |

### Step 3b: Rebuttal Round | 反駁輪

**Research basis (Nemeth, 1995):** Groups allowed to debate produce more and
better ideas than groups following "no-criticism" rules. The mechanism is that
criticism forces explicit defence of assumptions, which surfaces hidden
weaknesses before commitment.

**For each of the top 3 ideas**, the AI presents **2 specific counterarguments.**

Format for each counterargument:
```
"This idea will fail in [specific context] because [specific reason]."
```

**NOT acceptable** (too vague):
- "This might be difficult to implement."
- "There could be edge cases."

**Acceptable** (specific failure condition):
- "This idea will fail for enterprise customers because their IT policy
  prohibits storing OAuth tokens in browser localStorage."
- "This idea will fail during peak traffic because the synchronous
  API call blocks the render thread, causing visible jank at 500ms+."

### User response options

The user MUST select one of three options per counterargument before the session advances:

| Option | Action |
|--------|--------|
| (a) Accept criticism | Provide a modified version of the idea that addresses the failure |
| (b) Disagree | Provide a specific reason why the counterargument does not apply |
| (c) Criticism valid | Remove the idea from the ranking |

### Rebuttal outcome in report

Each idea that remains after the rebuttal round receives a badge in the final report:

```
✓ Passed rebuttal — [one-line summary of user's response]
```

**Skipping:** `--no-rebuttal` skips the rebuttal round. The report section is
marked "Rebuttal: skipped".

---

## Phase 4: OUTPUT | 輸出提案

> Goal: Produce a structured report that feeds directly into `/requirement` or `/sdd`.
>
> 目標：產生可直接輸入 `/requirement` 或 `/sdd` 的結構化報告。

### Brainstorm Report Template

```markdown
# Brainstorm Report: [Topic]

**Date**: YYYY-MM-DD
**Participants**: [human, AI assistant]
**Techniques Used**: [HMW, SCAMPER, etc.]
**Pre-flight**: [Completed / Skipped]
**Rebuttal Round**: [Completed / Skipped]

## Problem Statement

[Refined problem statement from FRAME phase, including root cause from 5 Whys]

## HMW Questions

1. How might we ...?
2. How might we ...?
3. How might we ...?

## Ideas Generated

| # | Idea | Batch | Source Technique | Feasibility | Impact | Effort | Alignment | Score |
|---|------|-------|-----------------|-------------|--------|--------|-----------|-------|
| 1 | ...  | B1    | SCAMPER-R        | 4           | 5      | 3      | 5         | 4.3   |
| 2 | ...  | B2    | HMW              | 3           | 4      | 2      | 4         | 3.3   |
| 3 | ...  | B2    | Six Hats-Green   | 5           | 4      | 4      | 4         | 4.3   |

## Top 3 Recommendations

### 1. [Idea Name] (Score: X.X) ✓ Passed rebuttal
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Rebuttal response**: [One-line summary of how user addressed the challenge]
- **Estimated Scope**: [Small / Medium / Large]

### 2. [Idea Name] (Score: X.X) ✓ Passed rebuttal
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Rebuttal response**: [One-line summary]
- **Estimated Scope**: [Small / Medium / Large]

### 3. [Idea Name] (Score: X.X) ✓ Passed rebuttal
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Rebuttal response**: [One-line summary]
- **Estimated Scope**: [Small / Medium / Large]

## Discarded Ideas (with reasons)

| Idea | Reason for Discarding |
|------|-----------------------|
| ...  | Removed during rebuttal round (counterargument accepted) |
| ...  | Low feasibility (score: 1/5) |

## Next Steps

- [ ] Proceed to `/requirement` with recommendation #1
- [ ] Proceed to `/sdd` if requirements are already clear
- [ ] Conduct follow-up brainstorm on [subtopic]
```

---

## Flags Reference | 旗標參考

| Flag | Phase affected | Behaviour |
|------|---------------|-----------|
| `--skip-preflight` | Phase 0 | Bypass Pre-flight; display one-line anchoring warning |
| `--no-rebuttal` | Phase 3 | Skip rebuttal round; mark report section "Rebuttal: skipped" |
| `--quick` | All | 3-idea fast mode; Phase 0, 10-idea gate, and rebuttal all exempt |
| `--technique scamper` | Phase 2 | Force SCAMPER as primary divergence technique |

### Quick Mode (`--quick`)

Delivers results in under 5 minutes. Output is 20 lines maximum.

```
1 HMW question → 3 ideas → 1 recommendation → next steps
```

All cognitive-science gates (Pre-flight, 10-idea minimum, Rebuttal Round) are
exempt in quick mode. Quick mode is appropriate for:
- Mid-coding-session decisions
- Re-scoping an already-understood problem
- Initial orientation before a full session

Always offer to expand: "Would you like to run a full brainstorming session?"

---

## Integration with UDS Workflow

The Brainstorm Report maps directly to downstream tools:

### Mapping to `/requirement`

| Brainstorm Report Section | `/requirement` Field |
|---------------------------|---------------------|
| Problem Statement | User Story context |
| Top Recommendation | Feature description |
| HMW Questions | Acceptance Criteria seeds |
| Stakeholder Map | Stakeholder section |
| Discarded Ideas | Out of Scope |

### Mapping to `/sdd`

| Brainstorm Report Section | `/sdd` Field |
|---------------------------|-------------|
| Problem Statement | Summary / Motivation |
| Top Recommendation | Proposed Solution |
| Evaluation Matrix | Trade-offs / Alternatives Considered |
| Rebuttal responses | Risks section |
| Estimated Scope | Scope section |

---

## Configuration Detection

When invoked in a project directory, the brainstorm assistant will:

1. **Check for existing specs** — Avoid brainstorming problems already specified
2. **Read project README** — Understand project purpose and constraints
3. **Scan recent issues/PRs** — Identify current pain points (if git repository)
4. **Check tech stack** — Ground feasibility assessments in actual technology

---

## Example Walkthrough (v2.0)

### Scenario: "We need to improve user retention"

**PRE-FLIGHT (user submits):**
```
Problem: 30-day retention is 15%, well below industry average of 40%
My ideas:
  A: Send re-engagement emails after 7 days of inactivity
  B: Add an achievement / gamification system
  C: Show users a "what's new" summary on login
Do NOT want: Solutions requiring backend ML models (too slow to ship)
```

**FRAME:**
```
5 Whys:
Problem: Retention at 15%
Why 1: Users stop using the app after initial signup → don't discover key features
Why 2: Why don't they discover features? → onboarding shows only basic setup
Why 3: Why basic setup only? → one-time wizard design assumption
Why 4: Why wizard? → team assumed users would explore independently
Why 5: Why does that assumption fail? → 20+ features, no progressive disclosure

Root Cause: No progressive onboarding — users see everything or nothing

HMW Questions:
1. How might we guide users to discover features at the right moment?
2. How might we make feature discovery feel natural, not forced?
3. How might we celebrate milestones to build engagement habits?
```

**DIVERGE — Batch 1 (Intuition):**
```
AI note: Exploring directions beyond the user's A/B/C ideas

1. Contextual tooltips triggered by user behaviour  [HMW-1]
2. Progressive checklist replacing one-time wizard  [SCAMPER-S]
3. First-task onboarding (skip setup, do real work first)  [SCAMPER-C]
4. Peer-mentor matching for new users  [SCAMPER-R]
5. Habit streak tracker (daily login reward)  [HMW-3]
✓ Intuition batch complete
```

**DIVERGE — Batch 2 (Extension — cross semantic boundary):**
```
Extension Batch: ideas must cross the semantic boundary of Batch 1

6. API-driven onboarding: detect user's data and auto-populate examples  [HMW-1]
7. Reverse onboarding: show power-user workflow first, simplify on request  [SCAMPER-R]
8. Social proof: show "your peers use feature X 3× per week"  [HMW-2]
9. Feature unlock gates: earn access to advanced features via usage  [HMW-3]
10. Cohort-based pacing: group users by signup week, send same tips together  [HMW-1]
```

**CONVERGE — Scoring:**
```
| # | Idea                          | Feasibility | Impact | Effort | Align | Score |
|---|-------------------------------|-------------|--------|--------|-------|-------|
| 2 | Progressive checklist         | 5           | 5      | 4      | 5     | 4.8   |
| 6 | API-driven onboarding         | 4           | 5      | 3      | 5     | 4.3   |
| 1 | Contextual tooltips           | 4           | 4      | 3      | 5     | 4.0   |
```

**CONVERGE — Rebuttal Round:**
```
Idea #2: Progressive checklist

Counterargument 1: "This idea will fail for returning users who re-install the
app because the checklist state is lost if tied to the device, causing
experienced users to re-do beginner tasks and feel patronised."

User response (b — disagree): "Checklist state is stored server-side tied to
user ID, so returning users resume from where they left off."

Counterargument 2: "This idea will fail for power users who feel checklists are
infantilising and will disable them immediately if there's no way to opt out."

User response (a — accept): Modified → Add a one-click 'I know this already'
dismiss on each checklist item, with a 'hide checklist' option in settings.

→ ✓ Passed rebuttal
```

**OUTPUT:** Top recommendation is "Progressive checklist (modified)" → proceed to `/requirement`.

---

## Mode Selection Guide | 模式選擇指引

The mode selection table in SKILL.md uses objective triggers to remove the
"which mode should I use?" decision overhead. This section explains the
rationale behind each rule.

SKILL.md 的模式選擇表使用客觀觸發條件，消除「我應該用哪個模式？」的決策負擔。本節說明各規則的設計理由。

### Why objective triggers instead of subjective diagnosis

The v2.0 brainstorm rebuttal session itself surfaced this problem: if users must
first diagnose "is my problem strategic or execution-type?", that meta-decision
consumes cognitive resources before the session even starts. Objective triggers
(word count, presence of a flag, existence of a spec) eliminate this.

### Trigger calibration

The `< 20 words` threshold is a starting heuristic, not a permanent rule.
After 5–10 sessions, review whether short inputs consistently led to
under-explored problems or whether they were legitimately simple. Adjust
the threshold based on observation, not intuition.

---

## Self-Evaluation Framework | 自我評估框架

Use these three metrics after every brainstorming session to build an
empirical record of quality over time. Do NOT evaluate v2.0 vs v1.0 based
on a single session — draw conclusions only after collecting at least 3
comparable sessions.

每次腦力激盪結束後使用這三個指標，建立長期品質紀錄。不要以單次工作階段評估 v2.0 vs v1.0，至少收集 3 次可比較的工作階段後再下結論。

### The Three Metrics | 三個指標

#### 1. Adoption Rate | 採用率
**Question:** Of all ideas generated in this session, how many will you actually use or investigate further?

**Scale:**
- 5 = 3+ ideas directly actionable
- 4 = 2 ideas actionable, 1+ worth exploring
- 3 = 1 idea actionable
- 2 = No idea directly actionable, but useful frames emerged
- 1 = Session produced nothing useful

**Why this matters:** Adoption rate is the closest proxy to "did the brainstorming solve the right problem?" It corrects for sessions that feel productive but produce ideas that are never revisited.

#### 2. Diversity | 語義多樣性
**Question:** Were the Extension Batch ideas (6–10) noticeably different in theme and approach from the Intuition Batch ideas (1–5)?

**Scale:**
- 5 = Extension Batch explored completely different problem dimensions
- 4 = Extension Batch had 3+ ideas that clearly crossed semantic boundaries
- 3 = Some extension, but most ideas were variations on Batch 1 themes
- 2 = Extension Batch was effectively a continuation of Batch 1
- 1 = No meaningful semantic difference between batches

**Why this matters:** Diversity measures whether the 10-idea gate actually pushed past the "obvious answer zone." If diversity scores are consistently low, the semantic boundary instruction in Batch 2 may need strengthening.

#### 3. Cognitive Load | 認知負擔
**Question:** How mentally taxing was this session? (Higher score = lower burden)

**Scale:**
- 5 = Session felt effortless and generative
- 4 = Some friction but overall productive
- 3 = Moderate effort, a few frustrating moments
- 2 = Session felt like work throughout
- 1 = Exhausting; would avoid repeating this format

**Why this matters:** A brainstorming method that consistently scores 1–2 on cognitive load will be abandoned in favour of informal thinking, regardless of quality improvements. Target: cognitive load ≥ 3 while adoption rate and diversity are also improving.

### Session Log Template | 工作階段記錄模板

```
Date: YYYY-MM-DD
Topic: [one sentence]
Mode: [Full / Quick / No-Rebuttal / Skip-Preflight]
Duration: [minutes]

Adoption Rate:   /5 — [reason]
Diversity:       /5 — [reason]
Cognitive Load:  /5 — [reason]

Notable observation:
[One sentence on what worked or what felt wrong]
```

### Interpreting Trends | 趨勢判讀

After 3+ sessions, look for these patterns:

| Pattern | Interpretation | Action |
|---------|---------------|--------|
| Adoption Rate consistently ≤ 2 | Problem framing failing in FRAME, not technique | Spend more time on 5 Whys before diverging |
| Diversity consistently ≤ 2 | 10-idea gate not producing semantic breadth | Enforce explicit topic-change before Batch 2 |
| Cognitive Load consistently ≤ 2 | Process overhead too high for problem complexity | Switch to `--no-rebuttal` or `--quick` for lower-stakes problems |
| All three metrics ≥ 4 | v2.0 working well for this problem type | No change needed |
| Adoption Rate ↑ but Cognitive Load ↓ over sessions | Habituation — the new flow is becoming natural | Continue; occasional `--quick` refreshes |

---

## A/B Experiment Protocol | A/B 實驗協議

Use this protocol to validate whether v2.0 genuinely outperforms v1.0 for
your specific problem types, rather than relying on the research assumptions
alone.

使用此協議驗證 v2.0 是否真的對你的特定問題類型優於 v1.0，而非單純依賴研究假設。

### Protocol Design

**Duration:** 3 paired sessions (minimum)
**Method:** Same category of problem, alternating method

**Session pairing:**
```
Session A1: Problem of type X → v1.0 (AI generates first, no Pre-flight)
Session B1: Problem of type X → v2.0 (Pre-flight + full flow)
[one week gap]
Session A2: Problem of type Y → v2.0
Session B2: Problem of type Y → v1.0
[one week gap]
Session A3: Problem of type X → v2.0
Session B3: Problem of type X → v1.0
```

Alternating reduces order effects (learning from session A affecting session B).

**Critical: evaluate each session immediately after completion.** Do not wait — memory of cognitive load fades fastest.

### What to Measure

For each session, record:

| Measure | v1.0 session | v2.0 session |
|---------|-------------|-------------|
| Adoption Rate (1–5) | | |
| Diversity (1–5) | | |
| Cognitive Load (1–5) | | |
| Time to complete (min) | | |
| Ideas generated (count) | | |
| Ideas in Batch 2 that surprised you | N/A | |

### Interpreting Results

- **v2.0 wins** if Adoption Rate and Diversity are both higher, and Cognitive
  Load difference is ≤ 1 point
- **v1.0 wins** if v2.0 Cognitive Load is ≥ 2 points lower *and* Adoption Rate
  difference is < 1 point
- **Situational** if results differ by problem type → implement full situation
  routing (see Mode Selection section)

### Key Hypothesis to Validate

The three research assumptions underlying v2.0 have different levels of
external validity risk in AI-assisted solo contexts (see Research Validity
Caveats section below). The A/B protocol should specifically check:

1. **Pre-flight hypothesis:** After writing 3 ideas yourself, does the AI's
   first batch explore genuinely different territory? Track explicitly.
2. **10-idea gate hypothesis:** Are ideas 7–10 consistently more diverse or
   useful than ideas 1–3? Review the session log after each run.
3. **Rebuttal hypothesis:** After the rebuttal round, did you actually modify
   or discard any ideas? If never, the rebuttal round may not be adding value
   for your problem types.

---

## Research Validity Caveats | 研究效度說明

v2.0 is grounded in three research findings. Each has a different level of
external validity risk when applied to AI-assisted single-user brainstorming.
Understand the limitations before treating the research as settled fact.

v2.0 基於三項研究發現。每項在應用於 AI 輔助單人腦力激盪時，有不同程度的外部效度風險。在將研究視為確定事實之前，請理解其局限性。

### Assumption 1: AI output anchors thinking (NGT basis)

**Original finding:** Nominal Group Technique shows that individuals brainstorming
separately then merging outperform interacting groups. Mechanism: production
blocking and conformity pressure in groups.

**Application to v2.0:** Pre-flight assumes AI output anchors your thinking the
same way a dominant human voice does in a group.

**External validity risk: MEDIUM**

The anchoring mechanism may differ. Human social anchoring involves
conformity pressure and real-time interruption. AI output is static text you
can choose to ignore. The question is whether *reading* AI output before writing
your own ideas meaningfully narrows your semantic exploration.

**How to validate:** In your A/B experiment, after v2.0 sessions, note whether
the AI's first batch was genuinely different from your Pre-flight ideas. If yes,
Pre-flight is working. If the AI frequently produces ideas similar to yours
anyway, Pre-flight's value may be in forcing you to articulate your starting
point — a different but still valid benefit.

### Assumption 2: Best ideas appear in the second half (Nijstad basis)

**Original finding:** Nijstad et al. show that early ideas in brainstorming
sessions are the most conventional. Creative ideas emerge after the obvious
zone is exhausted.

**Application to v2.0:** The 10-idea minimum gate and semantic batching assume
this temporal pattern holds in AI-assisted contexts.

**External validity risk: LOW**

This finding is about cognitive pattern (exhausting obvious associations first),
not about group dynamics. It is more likely to transfer to AI-assisted solo
contexts because the underlying mechanism (semantic network traversal) applies
regardless of whether a human or AI is generating ideas.

**How to validate:** After each session, review ideas 1–5 vs ideas 7–10. Are
the later ideas consistently less obvious? If yes, the gate is earning its keep.

### Assumption 3: Debate produces better ideas (Nemeth basis)

**Original finding:** Nemeth (1995) shows that groups instructed to debate
produce more and better ideas than groups following "no criticism" rules.

**Application to v2.0:** The Rebuttal Round assumes that structured debate with
AI counterarguments improves idea quality.

**External validity risk: HIGH**

This is the most tenuous transfer. Nemeth's finding is about *genuine
disagreement between people with different perspectives and stakes*. An AI
playing "devil's advocate" on demand may produce counterarguments that are
formally correct but lack the authentic dissent that drives Nemeth's effect.
The counterarguments may feel adversarial without being genuinely revelatory.

**How to validate:** After each rebuttal round, honestly assess: did the
counterarguments surface something you had genuinely not considered? If the
answer is consistently "no, I had already thought of this", the rebuttal round
may be providing false confidence rather than genuine challenge. Consider
switching to `--no-rebuttal` for well-understood problem domains.

---

## Gradual Adoption Protocol | 漸進採用協議

If the full v2.0 flow feels overwhelming, adopt the three changes in sequence
rather than all at once. Spend two weeks on each phase before adding the next.

如果完整 v2.0 流程感覺負擔過重，按順序逐步採用三個改動，而非一次全部導入。每個階段使用兩週再加入下一個。

### Phase 1: Pre-flight only (weeks 1–2)

Run `/brainstorm --no-rebuttal [topic]` with Pre-flight enabled but skip
rebuttal. Focus on: does writing 3 ideas first change what the AI produces?

### Phase 2: Add the 10-idea gate (weeks 3–4)

Continue with Pre-flight. Now enforce the 10-idea minimum. Focus on: are ideas
7–10 better than ideas 1–5?

### Phase 3: Add the Rebuttal Round (weeks 5–6)

Run the full v2.0 flow. Focus on: do the counterarguments surface issues you
had not considered?

After 6 weeks, review session logs and the A/B experiment data to calibrate
which combination works best for your problem types.

---

## Best Practices

### Do's

- Complete Pre-flight before starting — it takes 3 minutes and dramatically
  improves idea diversity
- Run all the way to 10+ ideas — the best ideas appear late
- Take the rebuttal round seriously — vague defences are a warning sign
- Record three evaluation metrics after every session
- Use `--quick` for time-constrained situations, full mode for important decisions
- Review session log trends after every 3 sessions

### Don'ts

- Don't read the AI output before writing your Pre-flight ideas
- Don't evaluate during DIVERGE phase
- Don't stop at 5 ideas — push through the "obvious answer zone"
- Don't accept vague AI counterarguments ("this might be hard") — insist on
  specific failure conditions
- Don't skip the 5 Whys — surface-level problems lead to surface-level solutions
- Don't draw conclusions from a single session — wait for 3+ data points

---

## Related Standards

| Standard | Relationship |
|----------|-------------|
| [Requirement Engineering](../../core/requirement-engineering.md) | Brainstorm output feeds requirement writing |
| [Spec-Driven Development](../../core/spec-driven-development.md) | Brainstorm output feeds SDD proposals |
| [Project Discovery](../project-discovery/SKILL.md) | Discovery provides context for brainstorming |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-05-09 | XSPEC-196 Phase 2: Mode Selection objective routing table; Self-Evaluation Framework (3 metrics + session log template + trend interpretation); A/B Experiment Protocol; Research Validity Caveats (3 assumptions with external validity risk ratings); Gradual Adoption Protocol (3-phase, 6-week plan) |
| 2.0.0 | 2026-05-09 | XSPEC-196: Phase 0 Pre-flight (anti-anchoring), Rebuttal Round (Nemeth Protocol), 10-idea minimum gate + semantic batching; research foundations section added |
| 1.0.0 | 2026-02-12 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
