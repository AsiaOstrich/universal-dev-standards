# Verification Oracle Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/verification-oracle.ai.yaml`
> **Spec**: XSPEC-256 (cross-project/specs/XSPEC-256-verification-oracle.md)

## Overview

A **test oracle** is the source of truth that decides whether software output is *correct*.
Software without an oracle cannot be said to be "right" — you cannot even state whether it
is right or wrong. This standard makes the **ground-truth oracle a first-class artifact**
and turns "correct" from a one-time acceptance state into a **maintained invariant**
re-verified on every change (DEC-077).

It is the **correctness** member of the governance-gate family — alongside
`license-compliance` (XSPEC-193, *licensing*) and `model-provenance` (XSPEC-255, *source*) —
which all share the same shape: **registry/check → fail-closed gate → audit evidence →
human-escalation ceiling**. The three are profiles of one mechanism over three axes:
**licensing / provenance / correctness**.

> **Scope.** This standard defines the *correctness oracle mechanism* (registry, grading,
> gate timing, re-verification, evidence, escalation) and the acceptance evidence it
> produces. The **oracle content (the correct answers) belongs to the customer** — it is
> their domain, their ground truth (DEC-075 neutral mechanism / DEC-063 customer-owned
> output). Enforcement engine wiring (e.g. VibeOps pipeline gates) is a downstream
> adoption concern, not part of this standard.

## The Oracle-ability Spectrum

Not every requirement has a ready oracle. Grade each high-stakes feature by how readily its
oracle exists — this drives cost, beachhead selection, and when a human must step in.

| Tier | Oracle shape | Readiness / cost |
|------|--------------|------------------|
| 1 | Known-correct output of a legacy system | Most ready, cheapest (parity-provable) |
| 2 | A batch of hand-computed / existing correct outputs | Ready (reproduce + scale) |
| 3 | Regulation / formula (rules exist, examples missing) | Needs co-derived worked examples + sign-off (ATDD) |
| 4 | Vague requirement (oracle must be *mined* from interviews) | Most expensive — the "translation problem" |

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Ground-truth registry as a first-class artifact, bound to AC | MUST |
| REQ-002 | Oracle-ability grading (Tier 1–4) for every high-stakes feature | MUST |
| REQ-003 | Fail-closed verification gate before ship | MUST |
| REQ-004 | Sustained re-verification on every change (correctness as CI invariant) | MUST |
| REQ-005 | Auditable verification evidence (N/N reproduced, no drift, trace) | MUST |
| REQ-006 | Self-serve frontier ceiling — escalate when no oracle / unverifiable high-stakes | MUST |
| REQ-007 | Oracle content sovereignty — content owned by customer, mechanism neutral | SHOULD |

### REQ-001 — Ground-Truth Registry

The correct answers a customer provides become a first-class artifact. Each ground-truth
case carries an **input scenario + expected correct output**, and is **bound to the
acceptance criterion** it proves (`acceptance-criteria-traceability`). At minimum the
mechanism MUST support numeric and structured-output comparison, with per-field exemptions
(e.g. `ignore_fields` for timestamps/ids). Example: a billing case "given orders + org
state → the *correct* charge amount", not merely "the endpoint returns HTTP 200".

### REQ-002 — Oracle-ability Grading

Every high-stakes feature MUST be tagged with its oracle Tier (1–4, table above).
A **Tier-4 (must-mine) feature MUST have a defined hand-off point** to an oracle-manufacturing
flow (interview / Prototype Probe; XSPEC-252) that pulls the expensive end toward Tier 1–2.
Beachhead selection SHOULD prefer Tier 1–2 features where the oracle is already ready.

### REQ-003 — Fail-Closed Verification Gate

Before a system may enter UAT/ship, it MUST **exactly reproduce every registered
ground-truth case**. A non-reproduction MUST **block ship or escalate** — never silently
pass (mirrors `license-compliance` blocklist and `model-provenance` denylist). The gate
plugs into existing reviewer/QA gates and the audit logger.

### REQ-004 — Sustained Re-Verification (the soul of this standard)

On **every change / regeneration**, the full oracle suite MUST be re-run, making "correct"
a **CI-grade invariant** rather than a one-time acceptance. **Drift** (was-correct, now-wrong)
MUST be detected and **blocked**. This is the mechanization of DEC-077's "changed and still
correct, and provably correct the whole time" — the differentiator a "generate-once, never
re-verify" competitor cannot match.

### REQ-005 — Audit Evidence

Each verification run MUST emit an auditable report: *"this delivery reproduced N/N
ground-truth cases, no drift, trace attached."* It plugs into the audit logger / hash chain,
the `model-provenance` source evidence (XSPEC-255), and the telemetry allowlist (DEC-066).
**This report is the outward proof of the correctness/governance moat** and a compliance
artifact for the customer.

### REQ-006 — Self-Serve Frontier Ceiling

Where there is **no oracle** (correctness is not decidable) or a **high-stakes but
unverifiable** path, the system MUST NOT let self-serve silently pass. It MUST flag
"a human must decide / an oracle must be supplied here" and **escalate** (DEC-076 ceiling).
Defining correctness and signing off acceptance are **human judgments** (customer / legal /
regulator) — a product-enforced governance gate, not a consultant trap.

### REQ-007 — Oracle Content Sovereignty

The verification *mechanism* is domain-neutral (DEC-075); the *correct answers* are owned by
the customer (DEC-063). Adopters SHOULD keep registries customer-scoped and isolated
(see `model-provenance` / `license-compliance` per-customer salt patterns, DEC-064).

## Principles

| ID | Principle |
|----|-----------|
| P-1 | Oracle First — no oracle, no "correct"; grade oracle-ability before claiming correctness |
| P-2 | Maintained Invariant — re-verify on every change; drift is a blocking event (DEC-077) |
| P-3 | Fail-Closed — non-reproduction blocks or escalates; never silent pass |
| P-4 | Evidence-Based — every verdict carries a reproducible trace (N/N + diff + audit id) |
| P-5 | Human Ceiling — unverifiable high-stakes escalates to a human (DEC-076) |
| P-6 | Content Sovereignty — mechanism neutral, correct answers owned by the customer |

## Gate Timing

```
spec(SDD) → generate → [oracle verification gate]  ← REQ-003 fail-closed, pre-ship
                              │
        on every change ─────┤ → re-run full oracle suite  ← REQ-004 drift block
                              ↓
                    audit evidence report  ← REQ-005 (outward moat proof)
                              │
   no oracle / unverifiable ──┴──→ escalate to human  ← REQ-006 ceiling
```

## Relationship to the Governance-Gate Family

| Profile | Standard | Axis | Registry/Check | Block trigger |
|---------|----------|------|----------------|---------------|
| Licensing | `license-compliance` (XSPEC-193) | legal | blocklist/allowlist/greylist | prohibited license |
| Provenance | model-provenance (XSPEC-255, planned sibling) | source | model source policy | denied source |
| **Correctness** | **`verification-oracle` (XSPEC-256)** | **correct** | **ground-truth registry** | **non-reproduction / drift** |

All three: fail-closed + audit evidence + customer override telemetered + human-escalation ceiling.

## Integration with Existing Standards

- **`acceptance-criteria-traceability`** — oracle cases bind to AC; reproduction becomes a
  form of AC coverage.
- **`verification-evidence`** — the oracle report is a kind of verification evidence (N/N
  reproduction + no-drift + trace).
- **`test-governance`** — the oracle suite is governed test policy; the gate is a governed gate.
- **`behavior-snapshot`** — a parity/snapshot gate is REQ-003/REQ-004 instantiated for the
  refactor/migration case; a snapshot is itself an oracle, so the skeleton may be shared.

## Related Specs

- XSPEC-256 — Verification Oracle complete spec (this standard's source)
- DEC-077 — Correctness as a maintained invariant (mother decision)
- DEC-075 — VibeOps domain-neutral positioning (neutral mechanism)
- DEC-076 — Self-serve customization north star (oracle = self-serve ceiling)
- DEC-063 — Legal & compliance strategy (customer-owned output / high-stakes)
- DEC-066 — Telemetry-driven product evolution (audit/telemetry)
- XSPEC-193 / XSPEC-255 — sibling governance-gate profiles (licensing / provenance)
- XSPEC-252 — Domain pack requirement translation (oracle manufacturing, Tier-4 hand-off)
- XSPEC-188 — UAT ship-decision dashboard (business-level UAT anchors)
- XSPEC-201 — Refactor/migration completeness (behavior-snapshot = an oracle instance)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~007: ground-truth registry, oracle-ability grading, fail-closed gate, sustained re-verification, audit evidence, self-serve ceiling, content sovereignty (XSPEC-256) |
