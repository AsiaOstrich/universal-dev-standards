# Governance Layer Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/governance-layer.md)

**Version**: 1.1.0
**Last Updated**: 2026-08-20
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
| `review_by` | Date on which this acceptance stops being valid and must be decided again |

Without a valid Risk Acceptance Clause, the pipeline **must refuse to start (fail-closed)**.

### Acceptance expiry

A clause whose `review_by` has passed is **not valid**. The pipeline fails closed exactly as if no clause were present.

`date` records when the risk was accepted; it does not record when the acceptance should be re-examined. Without `review_by`, an acceptance signed once stays in force forever — the conditions that justified it can change, and the signatory may no longer be on the project, while every field in the clause still reads as correct.

On expiry, exactly one of three dispositions applies — the same three defined in [Tech Debt Standards → Overdue Handling](tech-debt-standards.md#overdue-handling):

| Disposition | Meaning |
|-------------|---------|
| **Re-accept** | A current signatory signs again, with a new `review_by` |
| **Withdraw** | The bypass is removed and the human gates are restored |
| **Extend** | A new `review_by` **and** a written reason, recorded together |

**Automatic extension of `review_by` is prohibited.** It converts a fail-closed gate into a fail-open one while leaving every field looking correct — the failure is invisible precisely because the clause still validates.

---

## Pending Decisions

"Undecided" is a governance state, not the absence of one. An open question in a spec, a red line proposed but not ratified, a KPI with no owner — each is a decision someone is expected to make, and each is invisible to every check that only reads decisions already made.

Pending decisions are governed **at the same level as accepted risks**: they carry a clock, and they must be enumerable.

**Rule GOV-PD-001 (Required)** — The project MUST declare **where** pending decisions are recorded and **what marks one**: a fixed token (a status value, a label, a literal marker string), never free prose. Enumeration must not depend on a reader guessing which words were used. Three documents that say "TBD", "pending sign-off", and "to be confirmed" are three unenumerable documents; one declared marker makes all three findable.

**Rule GOV-PD-002 (Required)** — Enumerating pending decisions MUST report a total **and** the number of sources that could not be parsed (see [Aggregate Reporting](#aggregate-reporting)). "No pending decisions found" carries no information without the size of the set that was walked.

**Rule GOV-PD-003 (Required)** — Every pending decision carries a **decide-by date**. On expiry the same three dispositions apply as for an overdue debt item — **decide**, **withdraw the question**, or **extend with a written reason**. Automatic extension is prohibited.

**Rule GOV-PD-004 (Required)** — If nothing enumerates pending decisions on a schedule, the project MUST carry an **Unattended Declaration** naming an owner, a review cadence, and the date of the last review — the same two-state rule the tech debt registry is held to. Unenumerated is acceptable; unenumerated and undeclared is not.

> A decision left pending with no date behaves identically to a decision to do nothing. The only difference is that the pending form leaves people believing someone is still going to look at it.

---

## Aggregate Reporting

Every governance report — compliance summary, gate report, KPI rollup, red-line scan — is a claim about a set. The claim is worth exactly as much as the report's account of what it could **not** evaluate.

**Rule GOV-RPT-001 (Required)** — A report MUST print three counts, never two: **passed**, **failed**, and **undecidable** — items it could not evaluate at all (unparseable file, missing field, unreachable source, unsupported format).

**Rule GOV-RPT-002 (Required)** — `undecidable` MUST NOT be folded into `passed`, and MUST NOT be omitted. An unparseable file is not a clean file. A report that prints only "N checks passed" is non-compliant regardless of N.

**Rule GOV-RPT-003 (Required)** — A report MUST state its **denominator** and how it derived it. A report whose scope comes from a hardcoded list is a report about that list, not about the project: it stays green while everything outside the list rots. Derive the set by walking the project and excluding, never by enumerating — see [Class-Level Fix](class-level-fix.md).

**Rule GOV-RPT-004 (Required)** — Report positive and negative counts separately; never collapse them into a single compliance score. **A metric on which doing nothing scores the same as doing the work is not measuring the work.** "5 of 11 checks passed" and "the checker never started" produce the same figure, and a single score cannot tell them apart.

**Rule GOV-RPT-005 (Recommended)** — Where a report depends on its own tooling being functional, include a canary: a check with a known-failing input that MUST fail. If the canary passes, the report is not trustworthy and must be reported as wholly undecidable rather than as green.

---

## Freshness Metrics

**Rule GOV-FRESH-001 (Required)** — Any freshness or staleness indicator MUST name which of two clocks it reads:

| Clock | Answers | Can be read from |
|-------|---------|------------------|
| **Edit time** | How long since this artifact was last changed? | File mtime, last commit touching the file, a "last updated" field |
| **Reconciliation time** | How long since this artifact was last compared against the source of truth it claims to describe? | The recorded date of that comparison — nothing else can supply it |

**Rule GOV-FRESH-002 (Required)** — The two MUST NOT share a field or a column heading. They answer different questions, and an artifact can be maximally fresh on one and arbitrarily stale on the other: a document edited today whose contents were never checked against reality is zero days old by edit time and unbounded by reconciliation time.

**Rule GOV-FRESH-003 (Required)** — Where only edit time is available, the report MUST label the column as edit time **and** report reconciliation age as `undecidable` (GOV-RPT-001) — never as fresh, and never by leaving it out.

**Rule GOV-FRESH-004 (Recommended)** — Reconciliation time is only meaningful if the comparison is recorded by whatever performed it. A date a human types in after the fact is an assertion, not a measurement; label it as such.

> This is the single-axis-overload failure: one field, read by two different questions. The field can never be caught being wrong, because it was never asked which question it was answering.

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
- [ ] Every Risk Acceptance Clause has a `review_by` date, and no clause is past it
- [ ] The project declares where pending decisions live and what fixed token marks one
- [ ] Every pending decision has a decide-by date
- [ ] Pending decisions are either enumerated by something that runs, or covered by an Unattended Declaration
- [ ] Every governance report prints passed / failed / **undecidable** separately, and states its denominator and how it was derived
- [ ] No report collapses positive and negative counts into one score
- [ ] Every freshness indicator names whether it reads edit time or reconciliation time, and the two do not share a field
- [ ] All AI evaluators weight correctness/mission_alignment/goal_achievement with fail-closed veto at < 0.3

---

## Enforcement Reality

> **This standard ships no checker for any of its rules — not the ones added in 1.1.0, and not the fail-closed Risk Acceptance requirement that has been in it since 1.0.0. That is a known cost, stated here rather than left to be discovered.**
>
> Measured 2026-08-20: `review_by`, `risks_accepted`, and `gates_bypassed` appear in **no** program — not in the UDS CLI, not in any consumer. The clause that says a pipeline "must refuse to start" has never caused a pipeline to refuse to start, in the three and a half months it has been written down. Saying that plainly is not a caveat bolted onto this section; it is the section's own rule applied to the section itself, and an earlier draft of this text listed only the new rules as unenforced — which would have implied the older one was enforced.
>
> UDS defines these requirements; it does not provide a program that enforces them. Adopters who want them enforced must write the enumerator, the three-count reporter, and the reconciliation-date recorder themselves — and most will not. That is the same failure this standard describes, now applying to this standard.
>
> The minimum bar is therefore **not** "build the tooling". It is: **anything recorded as pending, accepted, or fresh must either point at something that runs, or say plainly that nothing is watching it.** Declaring `Unattended` is compliant. Being unattended without declaring it is the one outcome these rules forbid, because it is the only one that misleads the reader about whether anything is watching.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-08-20 | Added: `review_by` to the Risk Acceptance Clause + acceptance-expiry dispositions and prohibition on automatic extension; Pending Decisions (GOV-PD-001..004); Aggregate Reporting (GOV-RPT-001..005 — passed/failed/undecidable, denominator derivation, no collapsed score, canary); Freshness Metrics (GOV-FRESH-001..004 — edit time vs reconciliation time must not share a field); Enforcement Reality note; compliance checklist extended |
| 1.0.0 | 2026-05-07 | Initial release: Vision/Mission/Goals three-layer schema, red lines format, evaluator integration, Risk Acceptance clause, compliance checklist |

---

## Related Standards

- [Tech Debt Standards](tech-debt-standards.md) — Overdue Handling defines the three dispositions this standard reuses for expiry
- [Class-Level Fix](class-level-fix.md) — Deriving a set by walking and excluding rather than enumerating (GOV-RPT-003)
- [Verification Evidence](verification-evidence.md) — Why a green result must be shown to come from a working check (GOV-RPT-005)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
