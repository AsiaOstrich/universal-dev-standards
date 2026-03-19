---
scope: universal
description: |
  Guide structured AI-assisted brainstorming before specification writing.
  Use when: vague ideas, feature exploration, problem reframing, creative ideation.
  Keywords: brainstorm, ideation, HMW, SCAMPER, Six Thinking Hats, 腦力激盪, 發想, 創意.
---

# Brainstorm Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-12
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
  (NEW)          Existing   Existing
```

---

## Quick Reference

### Workflow Overview

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   FRAME    │───▶│  DIVERGE   │───▶│  CONVERGE  │───▶│   OUTPUT   │
│ Define the │    │ Generate   │    │ Evaluate & │    │ Brainstorm │
│ problem    │    │ ideas      │    │ prioritize │    │ Report     │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
```

### Phase Summary

| Phase | Goal | Key Techniques | Time |
|-------|------|----------------|------|
| **FRAME** | Define problem clearly | 5 Whys, HMW, Stakeholder Map | 10-15 min |
| **DIVERGE** | Generate many ideas | HMW, SCAMPER, Six Thinking Hats | 15-20 min |
| **CONVERGE** | Evaluate and rank | Evaluation Matrix, Dot Voting | 10-15 min |
| **OUTPUT** | Actionable report | Brainstorm Report template | 5-10 min |

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

## Phase 2: DIVERGE | 發散思考

> Goal: Generate as many ideas as possible. Quantity over quality at this stage.
>
> 目標：盡可能產生多個想法。此階段重量不重質。

**Rules of Divergent Thinking:**
1. Defer judgment — no idea is bad
2. Go for quantity — aim for 10+ ideas
3. Build on others — "Yes, and..."
4. Encourage wild ideas — they often lead to practical breakthroughs

### Technique A: HMW Brainstorming (Default)

For each HMW question, generate 3-5 solution ideas.

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

### Technique B: SCAMPER

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

### Technique C: Six Thinking Hats

Examine the problem from 6 distinct perspectives. Best when you need comprehensive analysis.

| Hat | Color | Focus | Question |
|-----|-------|-------|----------|
| 1 | White | Facts & Data | What do we know? What data do we have? |
| 2 | Red | Emotions & Intuition | What does our gut say? How do users feel? |
| 3 | Black | Risks & Caution | What could go wrong? What are the risks? |
| 4 | Yellow | Benefits & Optimism | What's the best case? What value does this add? |
| 5 | Green | Creativity | What new ideas emerge? What if we...? |
| 6 | Blue | Process & Summary | What's the big picture? What's our next step? |

**Template:**

```
Topic: [topic]

White Hat (Facts):
- [fact/data point]

Red Hat (Feelings):
- [intuition/emotion]

Black Hat (Risks):
- [risk/concern]

Yellow Hat (Benefits):
- [opportunity/benefit]

Green Hat (Ideas):
- [creative idea]

Blue Hat (Summary):
- [synthesis and next step]
```

---

## Phase 3: CONVERGE | 收斂評估

> Goal: Evaluate ideas objectively and select the best ones to pursue.
>
> 目標：客觀評估想法，選出最值得推進的方案。

### Evaluation Matrix

Score each idea on 4 criteria (1-5 scale):

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

### Quick Prioritization: Dot Voting

When the evaluation matrix feels too heavy, use dot voting:

1. List all ideas
2. Each participant gets 3 votes (dots)
3. Vote on your top picks (can put multiple dots on one idea)
4. Highest vote count wins

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

## Problem Statement

[Refined problem statement from FRAME phase, including root cause from 5 Whys]

## HMW Questions

1. How might we ...?
2. How might we ...?
3. How might we ...?

## Ideas Generated

| # | Idea | Source Technique | Feasibility | Impact | Effort | Alignment | Score |
|---|------|-----------------|-------------|--------|--------|-----------|-------|
| 1 | ...  | SCAMPER-R        | 4           | 5      | 3      | 5         | 4.3   |
| 2 | ...  | HMW              | 3           | 4      | 2      | 4         | 3.3   |
| 3 | ...  | Six Hats-Green   | 5           | 4      | 4      | 4         | 4.3   |

## Top 3 Recommendations

### 1. [Idea Name] (Score: X.X)
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Main Risk**: [Primary concern]
- **Estimated Scope**: [Small / Medium / Large]

### 2. [Idea Name] (Score: X.X)
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Main Risk**: [Primary concern]
- **Estimated Scope**: [Small / Medium / Large]

### 3. [Idea Name] (Score: X.X)
- **Why**: [Reasoning]
- **Key Benefit**: [Primary value]
- **Main Risk**: [Primary concern]
- **Estimated Scope**: [Small / Medium / Large]

## Discarded Ideas (with reasons)

| Idea | Reason for Discarding |
|------|-----------------------|
| ...  | Low feasibility (score: 1/5) |

## Next Steps

- [ ] Proceed to `/requirement` with recommendation #1
- [ ] Proceed to `/sdd` if requirements are already clear
- [ ] Conduct follow-up brainstorm on [subtopic]
```

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
| Risks (Black Hat) | Risks section |
| Estimated Scope | Scope section |

---

## Configuration Detection

When invoked in a project directory, the brainstorm assistant will:

1. **Check for existing specs** — Avoid brainstorming problems already specified
2. **Read project README** — Understand project purpose and constraints
3. **Scan recent issues/PRs** — Identify current pain points (if git repository)
4. **Check tech stack** — Ground feasibility assessments in actual technology

---

## Example Walkthrough

### Scenario: "We need to improve user retention"

**FRAME:**
```
5 Whys:
Problem: User retention is low (30-day retention at 15%)

Why 1: Users stop using the app after initial signup
→ Because they don't discover key features

Why 2: Why don't they discover features?
→ Because the onboarding only shows basic setup

Why 3: Why does onboarding only show basic setup?
→ Because it was designed as a one-time wizard

Why 4: Why a one-time wizard?
→ Because the team assumed users would explore on their own

Why 5: Why does that assumption fail?
→ Because the app has 20+ features and no progressive disclosure

Root Cause: No progressive onboarding — users see everything or nothing

HMW Questions:
1. How might we guide users to discover features at the right moment?
2. How might we make feature discovery feel natural, not forced?
3. How might we celebrate user milestones to build engagement habits?
```

**DIVERGE (HMW + SCAMPER):**

| # | Idea | Technique |
|---|------|-----------|
| 1 | Contextual tooltips triggered by user behavior | HMW-1 |
| 2 | Weekly "Did you know?" email with one feature | HMW-1 |
| 3 | Achievement system with unlock badges | HMW-3 |
| 4 | Replace wizard with progressive checklist | SCAMPER-S |
| 5 | Combine onboarding with first real task | SCAMPER-C |
| 6 | Adapt Duolingo's streak system | SCAMPER-A |
| 7 | Minimize onboarding to 1 question: "What's your goal?" | SCAMPER-M |
| 8 | Eliminate signup wall, let users try first | SCAMPER-E |
| 9 | Reverse: let power users mentor new users | SCAMPER-R |

**CONVERGE:**

| # | Idea | Feasibility | Impact | Effort | Alignment | Score |
|---|------|-------------|--------|--------|-----------|-------|
| 7 | Goal-based onboarding | 5 | 5 | 4 | 5 | **4.8** |
| 1 | Contextual tooltips | 4 | 4 | 3 | 5 | **4.0** |
| 5 | Onboarding via real task | 3 | 5 | 2 | 5 | **3.8** |

**OUTPUT:** Top recommendation is "Goal-based onboarding" → proceed to `/requirement`.

---

## Best Practices

### Do's

- Start with FRAME — resist the urge to jump to solutions
- Generate at least 10 ideas before evaluating any
- Use codebase context to ground feasibility scores
- Save the Brainstorm Report for future reference
- Time-box each phase to maintain momentum

### Don'ts

- Don't evaluate during DIVERGE phase
- Don't limit yourself to one technique — combine them
- Don't skip the 5 Whys — surface-level problems lead to surface-level solutions
- Don't brainstorm alone when stakeholders are available
- Don't force all ideas through the same technique

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
| 1.0.0 | 2026-02-12 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
