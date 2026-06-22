---
scope: universal
description: |
  Guide structured AI-assisted brainstorming before specification writing.
  Use when: vague ideas, feature exploration, problem reframing, creative ideation.
  Keywords: brainstorm, ideation, persona ensemble, multi-critic, HMW, SCAMPER, 腦力激盪, 發想, 創意.
---

# Brainstorm Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/guide.md)

**Version**: 4.0.0
**Last Updated**: 2026-06-22
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

### What v3 changes

v1 was a generic FRAME→DIVERGE→CONVERGE flow. v2 added cognitive-science gates (pre-flight anti-anchoring, a 10-idea gate, a single-AI rebuttal). **v3 re-centres the two work phases on the strongest findings in the 2024–2026 literature:**

- **DIVERGE** is now a **persona ensemble** (each role reasons via chain-of-thought, in isolation) crossed with **diversity lenses** — not a single AI voice racing to a count.
- **CONVERGE** is now a **multi-critic panel** plus a **hard-role rebuttal** (Devil's Advocate + Steelman) — not one AI scorer plus one soft critique.

The pre-flight phase is **kept and strengthened** (fixation research says AI anchoring is real and possibly worse), while the 10-idea gate and the single-AI rebuttal are **demoted / hardened** because their original human-group evidence does not transfer cleanly to a single LLM.

### What v4 changes (BQS v1)

v3 supplied strong *mechanisms* but no **decidable pass/fail quality gate** — its only close analogue, the Session Self-Evaluation, was after-the-fact, self-assessed, and non-blocking. **v4 layers the Brainstorm Quality Standard (BQS v1) on top of v3 without removing anything** (see "Backward Compatibility"). BQS is a **four-layer × timeline** quality contract:

- **Layer 0 — Intent**: declare explore/exploit ratio; modulates dimension weights.
- **Layer 1 — Process (divergence-period leading, visible)**: dimensions **D1 frame purity / D2 divergence coverage / D3 cross-session diversity / D4 evaluation de-bias**, each with an oracle. A **hard sequence gate** forbids the evaluative dimensions D5–D8 from being revealed or scored during divergence.
- **Layer 2 — Product (post-convergence leading, Top 3 only)**: **D5 grounding / D6 net benefit / D7 falsifiability / D8 actionability**, plus a Seeds column and a contested zone for high-variance ideas.
- **Layer 3 — Ungoverned**: a Judgment Override where human intuition overrides the aggregate score.

The first principle is refined: **decisions use leading signals, calibration uses lagging signals — ordered in time, not a right/wrong trade-off** (this removes any "use only leading, never lagging" absolutism). The core claim: evaluative dimensions are confined to **after convergence × Top 3 only**, never as a full gate on every divergence idea — otherwise they retroactively pollute divergence, kill evidence-free future ideas, and create form-filling theatre. The full contract, oracles, and structural rules live in **SKILL.md → "BQS v1 — Quality Contract"**.

---

## Research Foundations | 認知科學依據

v3 is grounded in six findings, each verified against its primary source. Author attributions below were cross-checked.

v3 基於六項發現，每項都對照原始出處核對過（作者已校正）。

| # | Finding | Source |
|---|---------|--------|
| 1 | **Chain-of-thought + personas yields the highest idea diversity** of any prompting strategy, approaching human groups. | Meincke, Mollick & Terwiesch, *Prompting Diverse Ideas* (arXiv:2402.01727, 2024) |
| 2 | **Single-LLM ideation reduces idea diversity *across users*** even when each individual feels more creative. | Anderson, Shah & Kreminski, *Homogenization Effects of LLMs on Human Creative Ideation* (arXiv:2402.01536, 2024) |
| 3 | **Generative-AI output deepens design fixation and reduces divergent thinking** — fewer ideas, less variety. | Wadinambiarachchi, Kelly, Pareek, Zhou & Velloso, CHI 2024 (arXiv:2403.11164) |
| 4 | **A multi-agent "colleagues" system beats a single agent** on perceived outcome quality and novelty. | Quan, Albassam, Wu, Ding & Chin, *Towards AI as Colleagues* (arXiv:2510.23904, 2025) |
| 5 | **Associative / cross-domain prompting significantly increases originality.** | Mehrotra, Parab & Gulwani, *Enhancing Creativity in LLMs through Associative Thinking* (arXiv:2405.06715, 2024) |
| 6 | **LLMs are strong at idea generation and refinement but weak at scoping and multi-idea evaluation** (Hourglass framework). | Li, Padilla, Le Bras, Dong & Chantler, *A Review of LLM-Assisted Ideation* (arXiv:2503.00946, 2025) |

> The widely-cited Doshi & Hauser, *Science Advances* (2024) — "generative AI enhances individual creativity but reduces the collective diversity of novel content" — corroborates finding #2. It is referenced as supporting evidence only; the homogenization guardrail anchors on the verified #2.

### How each finding maps into the flow

1. **#1 → DIVERGE default mechanism**: personas + chain-of-thought.
2. **#2 → Diversity-Collapse Guardrail**: don't seed with analogies; vary lenses not wording.
3. **#3 → PRE-FLIGHT kept/strengthened**: write your own ideas first; no "like X but for Y" seed.
4. **#4 → Enhanced Tier**: parallel persona/critic agents where the host supports them.
5. **#5 → Diversity lenses**: analogical, assumption-reversal, morphological.
6. **#6 → Multi-critic panel + human arbiter**: aggregate three critic lenses; the human decides.

---

## Quick Reference

### Workflow Overview

```
┌─────────────┐  ┌────────────┐  ┌──────────────────────┐  ┌────────────────────────┐  ┌────────────┐
│  PRE-FLIGHT │─▶│   FRAME    │─▶│       DIVERGE         │─▶│       CONVERGE         │─▶│   OUTPUT   │
│  (Phase 0)  │  │ Define the │  │ Persona ensemble +    │  │ Multi-critic panel +   │  │ Brainstorm │
│ User writes │  │ problem    │  │ diversity lenses      │  │ hard-role rebuttal     │  │ Report     │
│ 3 ideas     │  │            │  │ (CoT, branch-isolated)│  │ (DA + Steelman)        │  │            │
└─────────────┘  └────────────┘  └──────────────────────┘  └────────────────────────┘  └────────────┘
```

### Phase Summary

| Phase | Goal | Key Mechanism (v3) | Time |
|-------|------|--------------------|------|
| **PRE-FLIGHT** | Prevent AI anchoring | User writes 3 ideas first; no analogy seed | 3–5 min |
| **FRAME** | Define problem clearly | 5 Whys, HMW, stakeholders | 10–15 min |
| **DIVERGE** | Force viewpoint diversity | Persona ensemble + diversity lenses | 15–25 min |
| **CONVERGE** | Select bias-checked ideas | Multi-critic panel + hard-role rebuttal | 15–20 min |
| **OUTPUT** | Actionable report | Brainstorm Report template | 5–10 min |

---

## Phase 0: PRE-FLIGHT | 防止 AI 錨定

> Goal: Establish independent thinking before any AI content is generated.
>
> 目標：在任何 AI 內容生成之前，建立使用者的獨立思考框架。

### Why this matters

Research shows that once a person sees any AI-generated framing, subsequent ideas cluster within that semantic space. In AI-assisted contexts this is **stronger**, not weaker: design-fixation studies (Wadinambiarachchi et al., CHI 2024) find that fluent, high-fidelity AI output *deepens* fixation and reduces the variety and originality of subsequent ideas. Pre-flight creates an "intellectual immune system" against this bias.

研究顯示，一旦看到任何 AI 生成框架，後續想法就會在該語義空間內聚集。在 AI 情境下這**更強**：設計固著研究（Wadinambiarachchi 等，CHI 2024）發現流暢高擬真的 AI 輸出會*加深*固著、降低後續想法的多樣性與原創性。Pre-flight 為此偏見建立「智識免疫系統」。

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

### Anti-seed guardrail (new in v3)

Do **not** accept or generate a "like X but for Y" framing as the seed (e.g. "Slack but for doctors"). Analogical product seeds lock the LLM into one solution space and measurably reduce idea variety (this is the same homogenization mechanism as finding #2). Capture the underlying *problem*, not a product analogy. If the user offers such a seed, restate it as a problem ("teams of clinicians lose context between shifts") before proceeding.

### AI behaviour after receiving Pre-flight input

1. Acknowledge the user's ideas without evaluating them.
2. Proceed to FRAME.
3. In DIVERGE, explicitly explore directions the user did not mention.
4. If the user declared an unwanted solution type, exclude it from all generated ideas.

### Skipping Pre-flight

Use `--skip-preflight` to bypass. A one-line warning is displayed: `⚠ Skipping Pre-flight may cause AI anchoring`. Appropriate when the user already has extensive notes, this is a repeat session, or time is severely constrained (prefer `--quick`).

---

## Phase 1: FRAME | 定義問題

> Goal: Ensure we're solving the right problem before generating solutions.
>
> 目標：在產生解決方案之前，確保我們正在解決正確的問題。

### Step 1.1: 5 Whys — Root Cause Analysis

Ask "Why?" repeatedly to dig beneath surface-level problems.

```
Problem: [Initial problem statement]
Why 1: Why does this problem exist? → Because [reason 1]
Why 2: Why does [reason 1] happen?  → Because [reason 2]
Why 3: Why does [reason 2] happen?  → Because [reason 3]
Why 4: Why does [reason 3] happen?  → Because [reason 4]
Why 5: Why does [reason 4] happen?  → Because [root cause]
Root Cause: [root cause]
```

**Example:**

```
Problem: Users abandon the checkout flow
Why 1: → Because the process takes too long
Why 2: → Because there are 5 separate pages
Why 3: → Because each validation step has its own page
Why 4: → Because the original design assumed slow connections
Why 5: → It doesn't — most users are on broadband now
Root Cause: Outdated multi-page architecture designed for dial-up era
```

### Step 1.2: HMW — Problem Reframing

Transform the root cause into opportunity-focused questions. **Format:** "How might we [verb] [desired outcome] for [stakeholder]?" Broad enough for creative solutions, specific enough to be actionable, and never containing a solution.

```
Root Cause: Outdated multi-page checkout architecture
HMW 1: How might we reduce checkout steps without losing validation?
HMW 2: How might we make the checkout feel instant?
HMW 3: How might we validate data without interrupting the user flow?
```

### Step 1.3: Stakeholder Mapping

| Stakeholder | Needs | Pain Points |
|-------------|-------|-------------|
| End users | Fast, simple checkout | Too many steps |
| Business | High conversion rate | Cart abandonment |
| Developers | Maintainable code | Complex page transitions |

### Step 1.4: Codebase Context (if applicable)

When brainstorming for an existing project, gather context: **Read** `README.md`/`package.json`; **Grep** for related features; **Glob** for relevant structures. This grounds ideation in reality and prevents proposing ideas that conflict with existing architecture.

---

## Phase 2: DIVERGE | 發散思考（v3：persona 集成 + 多樣性透鏡）

> Goal: Force genuinely distinct viewpoints, not variations on one theme.
>
> 目標：逼出真正不同的視角，而非同一主題的變體。

### Why a persona ensemble (not a count gate)

Meincke, Mollick & Terwiesch (2024) found that **chain-of-thought + personas** produces the highest idea diversity of any prompting strategy tested, approaching human brainstorming groups. The old "generate ≥10 ideas" gate rested on Nijstad's "best ideas appear in the second half" — a **human-group** finding that is **not confirmed for LLMs**, which tend to plateau and recycle. So v3 makes the *structure* (distinct personas + lenses), not the *count*, the engine of diversity.

### Step 2a — Persona ensemble

Run a default ensemble. Each persona reasons **step by step (chain-of-thought)** and produces 2–4 ideas **from its own lens only**.

| Default persona | Lens it argues from |
|-----------------|---------------------|
| **Domain expert** | What does best-practice in this domain demand? |
| **Skeptic / risk** | Where does this break? What fails first? |
| **Cross-domain analogist** | How do biology / other fields solve an analogous problem? |
| **Cost / constraint** | What is the cheapest, smallest thing that works? |
| **End-user advocate** | What does the actual user feel and need? |

**Template per persona:**

```
Persona: [name] — Lens: [one line]
Reasoning (step by step): [chain-of-thought]
Ideas (2–4, from this lens only):
1. [Idea] — [why this persona would propose it]
2. ...
```

Override with `--personas "designer,economist,skeptic,..."`. Six Thinking Hats map naturally onto personas (White=facts, Red=emotion, Black=risk, Yellow=benefit, Green=creativity, Blue=process).

### Branch isolation

In **baseline** mode, generate each persona's ideas without showing it the other personas' output, then present all sets together only after every persona is done. This prevents intra-session anchoring — the same mechanism Pre-flight protects against, applied between personas. In the **Enhanced tier**, this isolation is physical: each persona is a separate agent with its own context (see Enhanced Tier).

### Step 2b — Diversity lenses

Apply at least one lens across the ensemble to push past the obvious zone. Connecting disparate concepts measurably increases originality (Mehrotra et al., 2024).

| Lens | Prompt pattern | Best for |
|------|----------------|----------|
| **Analogical / cross-domain** | "Find a system in [biology / logistics / games] that solves an analogous problem. What principles can we borrow?" | Stuck in domain conventions |
| **Assumption reversal** | "List what everyone assumes must be true, then invert each one. Which inversion is interesting?" | 'Obvious' problem framings |
| **Morphological matrix** | "Build a 3-axis matrix (e.g. User × Trigger × Constraint); fill the rare/empty cells." | Systematic coverage |

At least one inverted assumption (reversal lens) should survive into the candidate set. Force a primary lens with `--lens analogical|reversal|morphological`.

### Step 2c — Continue nudge (auxiliary)

A raw count is a weak proxy in AI contexts. Use diversity, not count, as the gate: if the ensemble has covered fewer than ~8 distinct ideas **or** fewer than 3 distinct lenses, prompt: *"Continue — add a persona or a lens you haven't used yet."* There is no upper limit.

### Classic techniques (still available)

HMW (default starting point), SCAMPER (improving an existing feature: Substitute, Combine, Adapt, Modify, Put-to-other-use, Eliminate, Reverse), and Six Thinking Hats remain available and compose well as personas.

---

## Phase 3: CONVERGE | 收斂（v3：多評審面板 + 硬角色反駁）

> Goal: Select ideas that survive bias-reduced scoring AND structured debate — with the human as final arbiter.
>
> 目標：選出同時通過降偏誤評分與結構化辯論的想法——人類保留最終裁決權。

### Step 3a: Multi-critic panel

A single LLM is a weak, biased evaluator (Li et al., 2025: LLMs are strong at generation/refinement, weak at evaluation). v3 runs **three independent critics**, each scoring every idea 1–5 on its own lens; aggregate by mean.

| Critic lens | Weighted criteria it owns |
|-------------|---------------------------|
| **Engineering feasibility** | Feasibility 50% · Effort 50% |
| **User impact** | Impact 70% · Alignment 30% |
| **Strategic alignment** | Alignment 60% · Impact 40% |

**Per-criterion guide (1–5):**

| Criterion | 5 | 3 | 1 |
|-----------|---|---|---|
| Feasibility | trivial | moderate | near-impossible |
| Impact | transformative | moderate | negligible |
| Effort (inverted) | hours | weeks | quarters |
| Alignment | core mission | relevant | off-mission |

**Aggregation example:**

| # | Idea | Feasibility critic | Impact critic | Alignment critic | **Agg.** |
|---|------|--------------------|---------------|------------------|----------|
| 1 | Single-page checkout | 4.0 | 4.5 | 4.5 | **4.3** |
| 2 | One-click buy | 3.0 | 3.5 | 3.5 | **3.3** |
| 3 | Progressive form | 4.5 | 4.0 | 4.0 | **4.2** |

> **Optional — RICE / ICE (product features):** for prioritising shippable features, score `RICE = (Reach × Impact × Confidence) / Effort` or the lighter `ICE = Impact × Confidence × Ease`. Let engineers — not the LLM — estimate Effort (the LLM lacks codebase knowledge). RICE favours incremental wins; don't use it alone for strategic bets.

### Step 3b: Hard-role Rebuttal Round

A soft "please critique this" yields mostly agreement — LLMs are sycophantic under a weak critique frame. v3 assigns **hard roles** to the **top 3 ideas**:

- **Devil's Advocate**: "Your job is to argue this idea WILL fail. Produce 2 specific failure conditions."
- **Steelman**: "State the strongest, most charitable version of the counterargument — the one a thoughtful opponent would actually make."

Each counterargument must take the form: **"This idea will fail in [specific context] because [specific reason]."**

**NOT acceptable** (too vague): "This might be difficult." / "There could be edge cases."

**Acceptable** (specific failure condition):
- "This will fail for enterprise customers because their IT policy prohibits storing OAuth tokens in browser localStorage."
- "This will fail during peak traffic because the synchronous API call blocks the render thread, causing visible jank at 500ms+."

The user MUST respond to each before advancing:

| Option | Action |
|--------|--------|
| (a) Accept | Provide a modified version that addresses the failure |
| (b) Disagree | Provide a specific reason the counterargument does not apply |
| (c) Valid | Remove the idea from the ranking |

Each idea that remains receives a badge: `✓ Passed rebuttal — [one-line summary of user's response]`.

**Skipping:** `--no-rebuttal` skips this round; the report section is marked "Rebuttal: skipped".

---

## Phase 4: OUTPUT | 輸出提案

> Goal: Produce a structured report that feeds directly into `/requirement` or `/sdd`.

### Brainstorm Report Template

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

## Diversity-Collapse Guardrail

Using a single LLM for ideation reduces the **diversity of ideas across users**, even when each individual feels more creative (Anderson, Shah & Kreminski, 2024; corroborated by Doshi & Hauser, *Science Advances* 2024). Concrete guards:

- **Never seed** with a competitor or product analogy ("like X but for Y").
- **Vary the lens**, not just the wording — rewording a prompt does not diversify output.
- If the surviving Top 3 all originate from one persona or lens, **flag it** and run one additional lens before OUTPUT.
- Prefer **lower-fidelity** idea statements early (a rough direction, not a polished concept) — high-fidelity AI output deepens fixation (finding #3).

---

## Enhanced Tier — Parallel Personas

Multi-agent ideation — independent agents that contribute and converse — outperforms a single agent on perceived outcome quality and novelty (Quan et al., 2025, *MultiColleagues*). Where the host supports parallel subagents (e.g. Claude Code's Agent/Workflow tools), `--enhanced` realises the ensemble physically:

1. **Divergence**: each persona is a separate agent with **isolated context** (true branch isolation), run in parallel; results are merged and de-duplicated.
2. **Convergence**: the three critics run as parallel agents; the Devil's Advocate and Steelman are separate adversarial agents.
3. **Synthesis**: a final pass merges scores, flags diversity, and assembles the report.

### Graceful degradation

This tier is **optional and host-dependent**. On assistants without subagent orchestration, `--enhanced` **silently falls back** to baseline (single-context simulated personas, sequential critics). The skill therefore remains `scope: universal` — every host gets the full methodology; only the execution substrate differs.

---

## Mode Selection Guide | 模式選擇指引

The Mode Selection table in SKILL.md uses objective triggers (word count, presence of a flag, existence of a spec) to remove the "which mode should I use?" decision overhead. If users must first diagnose "is my problem strategic or execution-type?", that meta-decision consumes resources before the session starts. The `< 20 words` threshold is a starting heuristic — review after 5–10 sessions and adjust based on observation, not intuition.

---

## Calibration Loop (BQS lagging end) | 校準回路（BQS lagging 端）

> **In v4 these three metrics are the lagging end of the single BQS quality loop, not a second parallel evaluation system.** The leading pass/fail decision is made by BQS Layers 0–2 during the session; these metrics calibrate the standard afterwards. **Adoption Rate = D6 net-benefit lagging validation, Diversity = D2/D3 lagging observation, Cognitive Load = a cost constraint.** Do not run a separate self-evaluation alongside BQS.
>
> **v4 中這三個指標是同一道 BQS 品質回路的 lagging 端，不是第二套平行評估系統。** 工作階段中由 BQS 第 0–2 層做 leading pass/fail 決策；這些指標事後校準標準。**採用率＝D6 淨值滯後驗證、多樣性＝D2/D3 滯後觀測、認知負擔＝成本約束。** 禁止在 BQS 之外另跑一套自評。

Record three metrics after every session to build an empirical record. Do not judge across versions on a single session — collect at least 3 comparable sessions.

每次工作階段後記錄三個指標，建立實證紀錄。不要以單次評估跨版本，至少收集 3 次可比較的工作階段。

### The Three Metrics

#### 1. Adoption Rate
**Question:** Of all ideas generated, how many will you actually use or investigate further?
- 5 = 3+ directly actionable · 3 = 1 actionable · 1 = nothing useful

#### 2. Diversity (v3 definition)
**Question:** Did the surviving ideas span multiple **personas and lenses**, or cluster in one?
- 5 = surviving ideas span 3+ personas/lenses · 3 = 2 · 1 = all from one persona/lens

This replaces the v2 "Extension Batch vs Intuition Batch" diversity question — v3 measures cross-persona/lens spread directly.

#### 3. Cognitive Load
**Question:** How mentally taxing was this session? (5 = effortless, 1 = exhausting)

A method that consistently scores 1–2 on cognitive load will be abandoned regardless of quality. Target: cognitive load ≥ 3 while adoption and diversity also improve.

### Session Log Template

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

### Interpreting Trends

| Pattern | Interpretation | Action |
|---------|---------------|--------|
| Adoption ≤ 2 consistently | Problem framing failing in FRAME | Spend more time on 5 Whys |
| Diversity ≤ 2 consistently | Personas/lenses producing overlapping ideas | Add a more distant persona; force the reversal lens |
| Cognitive Load ≤ 2 consistently | Process overhead too high | Use `--no-rebuttal` or `--quick` for lower-stakes problems |
| All three ≥ 4 | v3 working well for this problem type | No change |

---

## A/B Experiment Protocol | A/B 實驗協議

Validate whether v3 outperforms v2 for *your* problem types rather than relying on the research alone.

驗證 v3 是否真的對你的問題類型優於 v2，而非單純依賴研究。

**Duration:** 3 paired sessions (minimum). **Method:** same category of problem, alternating method.

```
Session A1: type X → v2 (single AI, count gate, single rebuttal)
Session B1: type X → v3 (persona ensemble, multi-critic)
[one week gap]   ... alternate to reduce order effects ...
```

**Measure per session:** Adoption (1–5), Diversity (1–5), Cognitive Load (1–5), Time, Ideas generated, "ideas from a persona/lens that surprised you".

**Interpretation:**
- **v3 wins** if Adoption and Diversity are both higher and the Cognitive-Load difference is ≤ 1 point.
- **v2 wins** if v3 Cognitive Load is ≥ 2 points lower *and* Adoption difference < 1 point.
- **Situational** if results differ by problem type → keep both and route by Mode Selection.

**Specific hypotheses to check:**
1. **Persona hypothesis:** do different personas actually produce non-overlapping ideas, or do they converge anyway?
2. **Lens hypothesis:** does the reversal/analogical lens surface ideas no persona reached?
3. **Multi-critic hypothesis:** do the three critics ever disagree materially, or do their scores collapse together (if always identical, one critic suffices)?

---

## Research Validity Caveats | 研究效度說明

Each finding has a different external-validity risk in AI-assisted, single-user contexts. Understand the limits before treating research as settled.

### v3 core mechanisms — risk: LOW–MEDIUM

**Persona ensemble + CoT (finding #1)** and **associative/cross-domain prompting (#5)** are about *prompting an LLM*, tested directly in LLM ideation studies — so they transfer well to this skill's exact use case. The main residual risk is that *simulated* personas in a single context may converge more than *isolated* agents; this is precisely why baseline uses branch isolation and the Enhanced tier exists. Validate with the "persona hypothesis" above.

**Multi-critic panel (#6)** rests on LLMs being weak evaluators — well-supported — but the gain depends on the critics being genuinely independent. If your three critics always agree, you have one critic in three costumes; check the "multi-critic hypothesis".

### Carried-over caveats — re-rated for v3

#### Pre-flight anti-anchoring — risk: LOW (was MEDIUM in v2)

v2 rated this MEDIUM, reasoning that static AI text is easier to ignore than a dominant human voice. The CHI 2024 fixation study (#3) now provides **direct** evidence that AI output deepens fixation in ideation. The mechanism transfers; pre-flight is kept and strengthened.

#### Nijstad "best ideas in the second half" — risk: HIGH → mechanism demoted

This is a human-group finding (exhausting obvious associations first). LLMs more often **plateau and recycle** rather than improve late. v3 therefore demotes the fixed 10-idea count gate to an auxiliary nudge and makes structural diversity (personas + lenses) the real engine. Do not treat a high idea count as evidence of diversity.

#### Nemeth "debate beats no-criticism" — risk: HIGH → role hardened, not relied upon

Nemeth's effect is about *genuine disagreement between people with stakes*. An AI on-demand devil's advocate can be formally correct yet not genuinely revelatory, and soft critique framings drift into sycophancy. v3 responds by **hardening the role** (explicit "argue this will fail" + Steelman) rather than assuming the effect transfers. Honestly assess after each round: did the counterargument surface something you had not considered? If consistently "no", use `--no-rebuttal` for well-understood domains.

---

## Gradual Adoption Protocol | 漸進採用協議

If full v3 feels heavy, adopt in sequence — two weeks each.

1. **Persona ensemble only (weeks 1–2):** run `--no-rebuttal` with the default personas. Focus: do different personas produce non-overlapping ideas?
2. **Add diversity lenses (weeks 3–4):** force `--lens reversal` then `--lens analogical`. Focus: do lenses reach ideas personas alone did not?
3. **Add multi-critic + hard-role rebuttal (weeks 5–6):** run full v3. Focus: do critics disagree, and do counterarguments change your selection?

After 6 weeks, review session logs and A/B data to calibrate which combination fits your problem types.

---

## Best Practices

### Do's

- Complete Pre-flight before starting; never seed with a product analogy.
- Run the full persona ensemble and at least one diversity lens — diversity comes from structure, not volume.
- Keep persona generation branch-isolated until every persona is done.
- Take the hard-role rebuttal seriously — vague defences are a warning sign.
- Let engineers estimate Effort/RICE, not the LLM.
- Record the three evaluation metrics; review trends every 3 sessions.
- Use `--enhanced` when the host supports it and diversity matters most.

### Don'ts

- Don't read AI output before writing your Pre-flight ideas.
- Don't accept a "like X but for Y" seed.
- Don't treat a high idea count as diversity — check persona/lens spread.
- Don't accept vague AI counterarguments — insist on specific failure conditions.
- Don't let a single LLM be the sole judge — aggregate critics; you decide.
- Don't draw conclusions from a single session — wait for 3+ data points.

---

## Backward Compatibility (v3 → v4) | 向後相容

BQS v1 is an **additive quality contract**, not a rewrite. Everything from v3 is preserved:

- **All flags**: `--personas`, `--lens`, `--enhanced`, `--skip-preflight`, `--no-rebuttal`, `--quick`, `--technique` behave exactly as in v3. v4 adds one optional flag, `--intent`, for the Layer 0 declaration.
- **All mechanisms**: PRE-FLIGHT anti-anchoring, FRAME 5-Whys/HMW, the persona ensemble, diversity lenses, the multi-critic panel, the hard-role rebuttal (Devil's Advocate + Steelman), the Diversity-Collapse Guardrail, and the Enhanced Tier are unchanged.
- **The `--enhanced` isolated-agent host** is what lets BQS **D4 pass** (judge ≠ generator); on a baseline single context the panel is marked `[degraded]`, never silently passed.

BQS v1 是**疊加的品質契約**，不是打掉重練。v3 的一切都保留：所有旗標（`--personas`/`--lens`/`--enhanced`/`--skip-preflight`/`--no-rebuttal`/`--quick`/`--technique`）行為不變，v4 僅新增一個可選的 `--intent` 旗標供第 0 層宣告；所有機制（PRE-FLIGHT 防錨定、FRAME 5-Whys/HMW、persona 集成、多樣性透鏡、多評審面板、硬角色反駁、多樣性崩塌防護、Enhanced 層）不變；`--enhanced` 的隔離 agent 宿主正是讓 BQS **D4 pass**（判官≠產生者）的條件，baseline 單 context 標 `[degraded]`、不靜默通過。

---

## Integration with UDS Workflow

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
| Multi-critic scores | Trade-offs / Alternatives Considered |
| Rebuttal responses | Risks section |
| Estimated Scope | Scope section |

---

## Related Standards

| Standard | Relationship |
|----------|-------------|
| [Requirement Engineering](../../core/requirement-engineering.md) | Brainstorm output feeds requirement writing |
| [Spec-Driven Development](../../core/spec-driven-development.md) | Brainstorm output feeds SDD proposals |
| [Anti-Hallucination](../../core/anti-hallucination.md) | Critic feasibility claims must be evidence-based, not asserted |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 4.0.0 | 2026-06-22 | XSPEC-296: Brainstorm Quality Standard (BQS v1) — a four-layer × timeline quality contract layered additively on v3. Layer 0 explore/exploit intent (modulates D2 weight); Layer 1 process leading dimensions D1–D4 with a hard sequence gate (D5–D8 forbidden during divergence); Layer 2 product leading dimensions D5–D8 applied to Top 3 only, with a Seeds column and high-variance contested zone; Layer 3 Judgment Override (overrides aggregate score). D4 judge≠generator (independent context else `[degraded]`); D5 claim split (external-fact floor cross-tier); D7 two-state falsifiability ("need to do X" → next-step, not fail); Meta stop rule (Top-3 set stability + hard cap 2 rounds). Session Self-Evaluation re-positioned as the calibration loop's lagging end (Adoption→D6, Diversity→D2/D3, Cognitive Load→cost; two parallel evaluations forbidden). First principle refined to "decisions use leading, calibration uses lagging". Tiering bound to objective Mode Selection triggers. New flag `--intent`. All v3 flags/mechanisms preserved. |
| 3.0.0 | 2026-06-01 | XSPEC-247: DIVERGE re-centred on persona ensemble + diversity lenses (analogical/reversal/morphological); CONVERGE re-centred on multi-critic panel + hard-role rebuttal (Devil's Advocate + Steelman); Diversity-Collapse Guardrail; Enhanced Tier (parallel persona/critic agents, graceful fallback); Research Foundations rebuilt on 6 verified 2024–2026 sources; Validity Caveats re-rated (pre-flight LOW, Nijstad/Nemeth demoted); new flags `--personas`/`--lens`/`--enhanced`; anti-seed guardrail |
| 2.1.0 | 2026-05-09 | XSPEC-196 Phase 2: Mode Selection objective routing; Self-Evaluation Framework; A/B Experiment Protocol; Research Validity Caveats; Gradual Adoption Protocol |
| 2.0.0 | 2026-05-09 | XSPEC-196: Phase 0 Pre-flight (anti-anchoring), Rebuttal Round, 10-idea minimum gate + semantic batching |
| 1.0.0 | 2026-02-12 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
