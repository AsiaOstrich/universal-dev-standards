# Anti-Sycophancy Prompting Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/anti-sycophancy-prompting.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-15
**Applicability**: All AI agent implementations and LLM prompt design
**Scope**: universal
**Industry Standards**: None (UDS original, informed by RLHF sycophancy research)

---

## Purpose

This standard defines techniques and rules for designing prompts that elicit genuine, critical responses from LLMs rather than sycophantic agreement with the user's implied preferences.

Sycophancy in LLMs originates from RLHF training objectives where human raters prefer agreeable responses, causing models to optimize for user satisfaction over accuracy.

---

## Core Techniques

### 1. Socratic Critique Framework (REQ-1)

Reframe the task from "evaluate my idea" to "attack my idea" to eliminate the incentive for sycophancy.

| DO | DO NOT |
|----|--------|
| ✅ Ask for the 3 most fatal objections to the idea | ❌ Ask "is this a good idea?" |
| ✅ Require each objection to be technically grounded | ❌ Allow vague positive framing |
| ✅ Prohibit positive opening phrases | ❌ Accept "Great idea, but..." patterns |

**Prompt Template**:
```
Do not evaluate whether this is good or bad.
List the 3 most fatal objections to: [idea]
Each objection must be technically grounded and non-trivial to dismiss.
```

---

### 2. Anchor Prevention Protocol (REQ-2)

Obtain the LLM's independent judgment before revealing the user's position, preventing anchoring bias.

| Step | Action |
|------|--------|
| 1 | Ask for neutral comparison without revealing preference |
| 2 | Receive independent judgment |
| 3 | Reveal user's position |
| 4 | Require explicit technical justification if model changes stance |

**Workflow**:
```
Round 1: "Compare [A] vs [B] for [context]. Which is better?"
→ Wait for independent judgment

Round 2: "I prefer [A]. Does this change your assessment? Why?"
→ Model must justify any position change with technical facts
```

---

### 3. Symmetric Dual-Column Output (REQ-3)

Use format constraints to force balanced presentation of opposing viewpoints.

**Required Format**:
```
| Arguments FOR the decision | Arguments AGAINST the decision |
|---------------------------|-------------------------------|
| [Equal weight content]    | [Equal weight content]        |

Net Recommendation: [Must take a clear stance, may recommend against]
```

**Rules**:
- Both columns must have similar length (< 20% difference)
- Net recommendation must be explicit and may be negative
- Model cannot escape the format by padding one side

---

### 4. Confidence and Uncertainty Labeling (REQ-4)

Require confidence scores on all recommendations to surface uncertainty.

**Format**:
```
Recommendation: [specific action]
Confidence: [1-5] — [reason for uncertainty]
Unknown: [what information would change this assessment]
```

**Confidence Scale**:

| Level | Meaning |
|-------|---------|
| 5 | Validated at similar scale, high certainty |
| 4 | Industry standard with sufficient documentation |
| 3 | Reasonable inference, PoC recommended |
| 2 | Uncertain, Spike strongly recommended |
| 1 | Highly uncertain, not recommended for direct adoption |

**Rules**:
- Confidence < 3 must include "More information needed before confirming"
- All major claims require confidence labeling
- Uncertainty must be actionable (specify what information resolves it)

---

### 5. Sycophancy Detection Heuristics (REQ-5)

Heuristics for identifying sycophantic responses, usable in automated post-processing.

| Signal Type | Detection Rule |
|-------------|---------------|
| Positive opener | Response starts with agreeable phrase within first 50 tokens (e.g., "great", "interesting", "certainly", "of course") |
| Position flip | Model reverses stance after user reveals preference without new technical evidence |
| Risk minimization | Pattern: "While there are some minor issues, overall..." without specifying the issues |
| Missing quantification | Major recommendation lacks confidence score or specific metrics |

**Trigger**: If 2+ signals detected → invoke re-evaluation with explicit Red Team framing.

---

## Prohibited Behaviors

| Prohibited | Correct Action |
|-----------|----------------|
| Opening critique with positive affirmation | Start directly with the analysis |
| Reversing stance without new technical evidence | Maintain position or cite specific new information |
| Describing risks as "minor" without evidence | Quantify risk or explain why it is bounded |
| Providing major recommendations without confidence | Always include confidence (1-5) and uncertainty statement |

---

## Integration with Agent Prompts

When applying to AI agents:

| Agent Type | Apply Rules |
|------------|-------------|
| Code Review Agent | REQ-1 (Socratic) + REQ-3 (Dual-column) + REQ-5 (Detection) |
| Architecture Advisor Agent | REQ-2 (Anchor Prevention) + REQ-4 (Confidence) + REQ-5 (Detection) |
| Bug Analysis Agent | REQ-1 (Socratic) + REQ-4 (Confidence) |
| General Consultation Agent | REQ-3 (Dual-column) + REQ-4 (Confidence) |

---

## Complete Anti-Sycophancy Prompt Template

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

## Checklist

- [ ] Prompt does not invite agreement ("is this good?")
- [ ] Positive opening phrases explicitly prohibited
- [ ] Model's independent stance obtained before revealing user preference (if applicable)
- [ ] Dual-column format enforced for evaluation tasks
- [ ] Confidence levels required on major recommendations
- [ ] Sycophancy detection applied to output before presenting to user

---

## Related Standards

- [anti-hallucination.md](anti-hallucination.md) — Prevents fabrication; complements anti-sycophancy
- [agent-epistemic-calibration.md](agent-epistemic-calibration.md) — Epistemic humility in agent design (where applicable)
