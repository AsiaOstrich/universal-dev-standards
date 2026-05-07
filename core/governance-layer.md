# Governance Layer Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/governance-layer.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-07
**Applicability**: All software projects with multi-agent or multi-role AI workflows
**Scope**: universal
**Industry Standards**: None (UDS original)

---

## Purpose

A governance layer provides a shared anchor for all agents and roles in a project:
Vision (direction) → Mission (boundaries + red lines) → Goals (measurable KPIs).

It is **Standard #0**: evaluated before all other standards. When any conflict exists between this standard and other domain standards, this standard takes precedence.

---

## Three-Layer Schema

### Vision

| Field | Requirement |
|-------|-------------|
| Format | Single sentence, ≤ 50 tokens |
| Content | Long-term direction; timeless; no metrics |
| Change frequency | Annual review |

**Example**:
> "To be the most trusted AI development workflow standard for software teams worldwide."

---

### Mission

| Field | Requirement |
|-------|-------------|
| Format | 3–5 commitment statements + red lines table (≤ 300 tokens total) |
| Content | What we do / don't do; red lines with trigger conditions + actions |
| Change frequency | Quarterly review |

**Red line mandatory fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., R1, GUARD-001) |
| `category` | string | Classification (quality / safety / compliance / ethics) |
| `clause` | string | Human-readable statement of what is forbidden or required |
| `action` | enum | One of `block` \| `warn` \| `escalate_to_human` |

---

### Goals

| Field | Requirement |
|-------|-------------|
| Format | KPI table, ≤ 500 tokens |
| Change frequency | Per-Sprint calibration |
| Falsifiability | Every KPI must be measurable — no vague terms like "improve" or "enhance" |

**KPI mandatory fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., KPI-01) |
| `metric_name` | string | Name of the metric being tracked |
| `threshold` | string | Quantified target (e.g., ≥ 95%, < 200 ms) |
| `measurement_method` | string | How and when the metric is measured |

---

## Priority

The governance layer has **higher priority** than all other standards. Resolution order when conflicts exist:

1. **Governance layer** (this standard) — direction, red lines, KPIs
2. **Domain standards** (testing, commit message, deployment, etc.)
3. **Project-specific overrides** (local `.standards/` customizations)

---

## Red Lines Format

Each red line entry must contain all mandatory fields. Enforcement actions:

| Action | Behavior |
|--------|----------|
| `block` | Halt the pipeline immediately; do not proceed |
| `warn` | Log the violation and continue; escalate if threshold exceeded |
| `escalate_to_human` | Pause and require human decision before continuing |

Additionally, each red line should include a `mission_clause_ref` field referencing the mission commitment it enforces.

---

## Evaluator Integration

When a project uses an AI evaluator agent, the governance layer provides scoring anchors:

| Axis | Weight | Veto threshold |
|------|--------|---------------|
| Correctness | 0.4 | < 0.3 → FAIL |
| Mission alignment | 0.3 | < 0.3 → FAIL |
| Goal achievement | 0.3 | < 0.3 → FAIL |

- **mission_alignment_score**: Degree to which the output aligns with Mission commitments
- **goal_achievement_score**: Degree to which the output advances Goals KPIs
- Any single axis falling below 0.3 triggers a FAIL regardless of the weighted sum

---

## Risk Acceptance (trace_only mode)

If a project relaxes human gates (e.g., `gate.mode = trace_only`), a **Risk Acceptance Clause** must be written explicitly into `mission.md`, containing:

| Required Field | Description |
|---------------|-------------|
| `date` | Date the risk was accepted |
| `signatory` | Person or role accepting the risk |
| `gates_bypassed` | Enumerated list of human gates that are bypassed |
| `risks_accepted` | Explicit description of accepted risks |

Without a valid Risk Acceptance Clause, the pipeline **must refuse to start (fail-closed)**.

---

## Governance File Structure

Projects adopting this standard should maintain the following files:

```
governance/
├── vision.md          # Single-sentence vision statement
├── mission.md         # Commitments + red lines table
└── goals.md           # KPI table (updated each Sprint)
```

---

## Compliance Checklist

- [ ] Vision is a single sentence ≤ 50 tokens and contains no metrics
- [ ] Mission has 3–5 commitments and a red lines table with all mandatory fields
- [ ] Every red line has: id, category, clause, action
- [ ] Goals table is present with all KPIs containing: id, metric_name, threshold, measurement_method
- [ ] No KPI uses vague language ("improve", "enhance", "better")
- [ ] If `gate.mode = trace_only`, a Risk Acceptance Clause is present in `mission.md`
- [ ] All AI evaluators weight correctness/mission_alignment/goal_achievement with fail-closed veto at < 0.3
