# Model Provenance Policy Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/model-provenance.ai.yaml`
> **Spec**: XSPEC-255 (cross-project/specs/XSPEC-255-model-provenance-policy.md)

**Scope**: universal

## Overview

Model selection is not only "cost × quality" — there is a **third axis: whether the
model's *source* is acceptable to the customer** (geopolitics / data sovereignty /
regulation). A regulated or geopolitically sensitive buyer (e.g. a Taiwanese
finance/government customer) may be unable to use models from a given jurisdiction;
the strictest will reject even **locally-run open weights** of that origin. This
standard makes the **model's provenance a first-class, enforced, auditable property**:
declare an acceptable-source policy, **block** non-compliant model choices fail-closed,
and emit auditable evidence ("this delivery used no models of the denied origin").

It is the **provenance (source)** member of the governance-gate family — alongside
`license-compliance` (XSPEC-193, *licensing*) and `verification-oracle` (XSPEC-256,
*correctness*) — which all share the same shape: **registry/check → fail-closed gate →
audit evidence → human-escalation ceiling**. The three are profiles of one mechanism
over three axes: **licensing / provenance / correctness**.

> **Scope.** This standard defines the *provenance mechanism* (origin registry, policy
> schema, fail-closed enforcement at model-selection points, audit evidence, ceiling).
> The **policy content (the concrete allow/deny lists) belongs to the customer or a
> compliance pack** — it is their domain decision (DEC-075 neutral mechanism / DEC-063
> customer-owned compliance posture). Enforcement engine wiring (e.g. a VibeOps provider
> abstraction / router gate) is a downstream adoption concern, not part of this standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Model Origin Registry as a first-class artifact (model → vendor → jurisdiction/origin class) | MUST |
| REQ-002 | Provenance Policy schema (allow/deny origins, local-weights distinction, mode, unknown-origin) | MUST |
| REQ-003 | Fail-closed enforcement at every model-selection point | MUST |
| REQ-004 | Auditable provenance evidence (model + origin per generation; compliance report) | MUST |
| REQ-005 | Reference policy pack(s) demonstrating the mechanism (content owned by customer/pack) | SHOULD |
| REQ-006 | Unknown-origin model → fail-closed block/escalate (no silent pass) | MUST |
| REQ-007 | Provenance policy content sovereignty — mechanism neutral, policy owned by customer | SHOULD |

### REQ-001 — Model Origin Registry

Each known model MUST be classified by **vendor → jurisdiction → origin class**. Like the
`license-compliance` license DB, the registry is maintainable and extensible by the
ecosystem/customer. At minimum the origin classes distinguish western-frontier,
western-open, and other-origin so a policy can be expressed against them. Example:

| Model | Vendor | Jurisdiction | Origin class |
|-------|--------|--------------|--------------|
| Claude | Anthropic | US | western-frontier |
| GPT / o-series | OpenAI | US | western-frontier |
| Gemini | Google | US | western-frontier |
| Llama | Meta | US | western-open |
| Mistral | Mistral | EU | western-open |
| Gemma | Google | US | western-open |
| DeepSeek | DeepSeek | CN | china-origin |
| MiniMax | MiniMax | CN | china-origin |
| Qwen | Alibaba | CN | china-origin |

### REQ-002 — Provenance Policy Schema

A per-project/per-customer policy MUST be expressible with at least: `allow_origins` /
`deny_origins` (by origin class), a **local-weights distinction** (a model accessed via a
foreign API — data egress — vs the same model's open weights run locally — data stays
local but the weights are foreign), an enforcement `mode` (`block` / `warn` /
`require_human`), and an `unknown_origin` behaviour that is **fail-closed** by default.

```jsonc
{
  "allow_origins": ["western-frontier", "western-open"],
  "deny_origins": ["china-origin"],
  "china_local_weights": "deny",   // deny | allow_local_only — strict buyers deny even local foreign weights
  "mode": "block",                 // block | warn | require_human
  "unknown_origin": "block"        // fail-closed
}
```

### REQ-003 — Fail-Closed Enforcement

At **every model-selection point** (per-agent config / routing decision / BYOK), the chosen
model's origin MUST be checked against the active policy. A violation MUST **block (or
escalate)** fail-closed — never silently pass (mirrors the `license-compliance` blocklist
and the `verification-oracle` non-reproduction block). Enforcement plugs in *before* routing
so a disallowed source is swapped for an acceptable model rather than used.

### REQ-004 — Audit Evidence

Each generation MUST record the **model used + its origin class**, enabling a compliance
report such as *"this delivery used no models of the denied origin."* The evidence plugs
into the audit logger / hash chain, the `verification-oracle` correctness evidence
(XSPEC-256), and the telemetry allowlist (DEC-066). **This report is the outward proof of
the provenance/governance moat** and a compliance artifact for the customer.

### REQ-005 — Reference Policy Pack(s)

The mechanism SHOULD ship a small number of **reference policy packs** that demonstrate it
(for example a pack that denies a given origin including local weights). The mechanism is
domain-neutral; the **concrete policy content is owned by the customer or a compliance
partner** (mirrors the reference-pack positioning of compliance domain packs).

### REQ-006 — Unknown-Origin Fail-Closed

A model whose origin is **not in the registry** (unknown provenance) MUST NOT be silently
allowed. The system MUST treat unknown origin as a **fail-closed block or escalation**
(REQ-002 `unknown_origin`), consistent with the governance-gate "no silent pass" rule.

### REQ-007 — Provenance Policy Content Sovereignty

The provenance *mechanism* is domain-neutral (DEC-075); the *policy content* (which origins
are acceptable) is owned by the customer (DEC-063). Adopters SHOULD keep policies
customer-scoped and isolated (see `license-compliance` / `verification-oracle` per-customer
patterns, DEC-064).

## Principles

| ID | Principle |
|----|-----------|
| P-1 | Provenance is a Third Axis — model choice is cost × quality × *acceptable source* |
| P-2 | Registry First — every model carries vendor/jurisdiction/origin class before a policy can act |
| P-3 | Fail-Closed — a denied or unknown origin blocks or escalates; never silent pass |
| P-4 | Evidence-Based — every generation records model + origin; a compliance report is producible |
| P-5 | Human Ceiling — ambiguous/`require_human` provenance escalates to a human (DEC-076) |
| P-6 | Content Sovereignty — mechanism neutral, acceptable-source policy owned by the customer |

## Gate Timing

```
model-selection point (per-agent config / router / BYOK)
        │
        ├─→ [provenance policy check]  ← REQ-003 fail-closed, pre-routing
        │         │
        │   denied / unknown ──→ block OR escalate to human  ← REQ-006 / P-5 ceiling
        │         │
        │   allowed ──→ proceed; record model + origin  ← REQ-004
        ↓
   provenance audit / compliance report  ← REQ-004 (outward moat proof)
```

## Relationship to the Governance-Gate Family

| Profile | Standard | Axis | Registry/Check | Block trigger |
|---------|----------|------|----------------|---------------|
| Licensing | `license-compliance` (XSPEC-193) | legal | blocklist/allowlist/greylist | prohibited license |
| **Provenance** | **`model-provenance` (XSPEC-255)** | **source** | **model origin registry + policy** | **denied / unknown origin** |
| Correctness | `verification-oracle` (XSPEC-256) | correct | ground-truth registry | non-reproduction / drift |

All three: fail-closed + audit evidence + customer override telemetered + human-escalation ceiling.

## Integration with Existing Standards

- **`license-compliance`** — sibling profile; the allowlist/denylist + fail-closed + audit +
  override skeleton is shared (evaluate whether the two are one governance subsystem).
- **`verification-oracle`** — sibling profile; the provenance audit evidence sits alongside
  the correctness evidence in the same audit/report artifact.
- **`model-selection`** — provenance is a *constraint* applied before the cost/quality
  right-sizing of `model-selection`; an unacceptable source is removed from the candidate set.
- **`security-standards`** — data-egress concerns (foreign-API access) align with data
  handling/security; local-weights distinction (REQ-002) is a data-sovereignty control.
- **`verification-evidence`** — the provenance report is a kind of verification evidence
  (model + origin + no-denied-origin trace).

## Related Specs

- XSPEC-255 — Model Provenance Policy complete spec (this standard's source)
- XSPEC-193 / XSPEC-256 — sibling governance-gate profiles (licensing / correctness)
- DEC-075 — VibeOps domain-neutral positioning (neutral mechanism / policy belongs to ecosystem)
- DEC-063 — Legal & compliance strategy (regulated / sovereignty-sensitive customers)
- DEC-064 — Customer IP isolation strategy (per-customer policy scoping)
- DEC-066 — Telemetry-driven product evolution (audit/telemetry allowlist)
- DEC-076 — Self-serve north star (provenance = a self-serve ceiling)
- XSPEC-254 — Positioning pre-mortem (§7 #5 cost-structure / token economics — origin axis)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~007: model origin registry, provenance policy schema, fail-closed enforcement at model-selection points, audit evidence, reference policy packs, unknown-origin fail-closed, policy content sovereignty (XSPEC-255) |
