# Estimation Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/estimation-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: Agile Estimation, PERT, Wideband Delphi
**References**: [Mountain Goat Software](https://www.mountaingoatsoftware.com/), [Steve McConnell - Software Estimation](https://www.construx.com/)

---

## Overview

This document defines estimation standards for software development projects. It covers estimation methods, calibration mechanisms, common anti-patterns, confidence levels, re-estimation triggers, and the critical distinction between estimates and commitments.

Good estimation is not about being precise — it is about being transparent regarding uncertainty and improving over time through calibration.

---

## Estimation Methods

### 1. Planning Poker

A consensus-based estimation technique where team members independently estimate using numbered cards, then discuss and converge.

| Aspect | Detail |
|--------|--------|
| **When to Use** | Sprint planning, story-level estimation |
| **Team Size** | 3–9 people |
| **Scale** | Fibonacci (1, 2, 3, 5, 8, 13, 21) or modified |
| **Pros** | Encourages discussion, reduces anchoring, builds shared understanding |
| **Cons** | Time-consuming for large backlogs, requires co-location or tooling |

### 2. T-Shirt Sizing

A relative sizing technique using abstract size labels (XS, S, M, L, XL) for quick, high-level estimation.

| Aspect | Detail |
|--------|--------|
| **When to Use** | Roadmap planning, epic-level estimation, initial backlog grooming |
| **Team Size** | Any |
| **Scale** | XS, S, M, L, XL (optionally XXL) |
| **Pros** | Fast, low cognitive load, good for large volumes of items |
| **Cons** | Less precise, harder to aggregate into time-based plans |

### 3. Three-Point Estimation

A statistical technique using optimistic (O), most likely (M), and pessimistic (P) estimates to calculate expected duration and standard deviation.

| Aspect | Detail |
|--------|--------|
| **When to Use** | Critical path items, high-uncertainty tasks, project-level planning |
| **Formula** | E = (O + 4M + P) / 6; SD = (P - O) / 6 |
| **Pros** | Quantifies uncertainty, produces confidence ranges, statistically grounded |
| **Cons** | Requires three estimates per item, may feel slow for small tasks |

---

## Calibration

### Calibration Mechanism

Teams SHALL regularly calibrate their estimates against actual outcomes to improve accuracy over time.

**Review Frequency**: Conduct calibration review every sprint retrospective or at minimum once per iteration.

**Estimation Accuracy Ratio**:

```
Estimation Accuracy Ratio = Actual Effort / Estimated Effort
```

- Ratio = 1.0: Perfect estimate
- Ratio > 1.0: Underestimated (actual took longer)
- Ratio < 1.0: Overestimated (actual took less)

**Improvement Action Process**:

1. Collect actual vs. estimated data for completed work items
2. Calculate Estimation Accuracy Ratio per item and team average
3. Identify systematic patterns (e.g., consistently underestimating integration tasks)
4. Define corrective actions (e.g., add buffer for integration, break down large items)
5. Track improvement over subsequent iterations

---

## Anti-Patterns

The following anti-patterns frequently undermine estimation quality. Each includes identification signals and mitigation strategies.

### 1. Anchoring Bias

**Description**: The first number mentioned dominates subsequent estimates, pulling the group toward that anchor.

**Identification**: Estimates cluster around the first value shared; dissenting views are not explored.

**Mitigation**: Use blind estimation (e.g., Planning Poker cards revealed simultaneously). Avoid stating estimates before independent assessment. Rotate who speaks first.

### 2. Planning Fallacy

**Description**: Systematic tendency to underestimate time, cost, and risk while overestimating benefits.

**Identification**: Projects consistently exceed estimates; post-mortems repeatedly cite "unforeseen complexity."

**Mitigation**: Use reference class forecasting (compare with similar past projects). Apply historical calibration data. Add explicit risk buffers.

### 3. Scope Creep Blindness

**Description**: Failure to recognize or account for gradually expanding scope during estimation.

**Identification**: Original estimates become obsolete as requirements grow; no re-estimation occurs despite visible scope changes.

**Mitigation**: Lock scope definition before estimating. Track scope changes explicitly. Trigger re-estimation when scope changes exceed threshold (see Re-estimation Triggers).

### 4. Student Syndrome

**Description**: Delaying work until the last possible moment, consuming all available buffer time.

**Identification**: Work consistently starts late despite having time; deadline pressure drives all delivery.

**Mitigation**: Set intermediate milestones with visible progress tracking. Use shorter iteration cycles. Avoid padding individual estimates — use project-level buffers instead.

### 5. Parkinson's Law

**Description**: Work expands to fill the time available for its completion, regardless of actual complexity.

**Identification**: Tasks consistently take exactly as long as estimated, regardless of difficulty variation.

**Mitigation**: Use relative estimation (story points) rather than absolute time. Challenge estimates that match round numbers. Track velocity trends for anomalies.

---

## Confidence Levels

Every estimate SHALL include a confidence level indicating the expected variance range.

| Level | Variance | Description | Applicable Scenario |
|-------|----------|-------------|---------------------|
| **High** | **±20%** | Well-understood work with clear requirements and prior experience | Repeat tasks, well-defined stories, familiar technology |
| **Medium** | **±50%** | Partially understood work with some unknowns | New features in known domain, moderate technical uncertainty |
| **Low** | **±100%** | Highly uncertain work with significant unknowns | New technology, unclear requirements, research spikes |

### Communication Guidance

- **High confidence**: "We estimate 5 days (4–6 days range)"
- **Medium confidence**: "We estimate 5 days (2.5–7.5 days range)"
- **Low confidence**: "We estimate 5 days (0–10 days range) — consider a spike first"

Always communicate the confidence level alongside the point estimate. Never present a Low confidence estimate without explicitly stating the uncertainty.

---

## Re-estimation Triggers

Re-estimation SHALL be triggered when any of the following conditions occur:

### Trigger Conditions

| Trigger | Description | Action |
|---------|-------------|--------|
| **Requirements change** | Functional or non-functional requirements are added, removed, or modified | Re-estimate affected items; update confidence levels |
| **Technical discovery** | New technical constraints, dependencies, or complexities are uncovered | Re-estimate with updated knowledge; document the discovery |
| **External dependency change** | Third-party APIs, libraries, or services change availability or behavior | Re-estimate integration work; assess impact on timeline |
| **Time threshold exceeded** | Elapsed time exceeds a significant portion (e.g., >50%) of original estimate without proportional progress | Conduct a checkpoint review; re-estimate remaining work |

### Re-estimation Process

1. **Identify**: Recognize that a trigger condition has been met
2. **Assess**: Evaluate the impact on current estimates
3. **Re-estimate**: Apply appropriate estimation method to affected items
4. **Communicate**: Notify stakeholders of revised estimates with updated confidence levels
5. **Document**: Record the reason for re-estimation and the delta from original estimate

---

## Estimate vs Commitment

### Definitions

An **Estimate** is a prediction of how long work will take, inherently uncertain and expressed as a range. It is a technical assessment made by the people doing the work.

A **Commitment** is a promise to deliver by a specific date or within a specific budget. It is a business decision that accounts for estimates, risk tolerance, and strategic priorities.

### Estimate vs Commitment — Key Differences

| Aspect | Estimate | Commitment |
|--------|----------|------------|
| **Nature** | Prediction with uncertainty | Promise with accountability |
| **Owner** | Development team | Management / Product Owner |
| **Format** | Range with confidence level | Specific date or scope |
| **Change** | Updated as information changes | Renegotiated with stakeholders |

### Communication Practices

- **Estimates**: Always present as ranges with confidence levels. Use language like "we estimate" or "our assessment is."
- **Commitments**: Present as specific targets. Use language like "we commit to" or "we will deliver by."
- **Never conflate**: Do not allow an estimate to be silently converted into a commitment without explicit negotiation.

### Converting Estimates to Commitments

1. Start with the team's estimate (range + confidence level)
2. Assess organizational risk tolerance (what happens if we miss?)
3. Add appropriate buffers based on confidence level
4. Negotiate scope, timeline, or quality trade-offs with stakeholders
5. Document the commitment separately from the underlying estimate

---

## References

- McConnell, S. (2006). *Software Estimation: Demystifying the Black Art*. Microsoft Press.
- Cohn, M. (2005). *Agile Estimating and Planning*. Prentice Hall.
- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
- [Planning Poker](https://www.mountaingoatsoftware.com/agile/planning-poker) — Mountain Goat Software

---

## License

This document is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
