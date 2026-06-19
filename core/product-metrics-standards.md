# Product Metrics Framework Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/product-metrics-standards.ai.yaml`
> **Spec**: XSPEC-069 (cross-project/specs/XSPEC-069-uds-product-layer-pack.md)

**Scope**: universal

## Overview

This standard defines how teams **select, structure, and govern product metrics**.
It covers a framework-selection matrix (AARRR for growth products, HEART for
experience products, custom North Star for platforms), North Star criteria, a
three-level metric hierarchy (North Star → L1 drivers → L2 diagnostics), and an
anti-vanity rule that rejects metrics decoupled from revenue or retention impact.
It aligns teams around metrics that drive meaningful product decisions rather than
activity tracking.

It is part of the **product-layer pack** (XSPEC-069). Its tracking requirements
connect to the SRE observability primitives (`observability-standards`, `slo-sli`).

> **Scope.** This standard defines *metric selection and governance*. Concrete
> analytics tooling (Amplitude/Mixpanel) is an adoption choice. Service-level
> reliability metrics live in `slo-sli`; this is the product-outcome view.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Framework selection matrix (AARRR / HEART / custom North Star) | MUST |
| REQ-002 | North Star criteria (leading, measurable, actionable, explainable) | MUST |
| REQ-003 | Metric hierarchy (max three levels) | MUST |
| REQ-004 | Anti-vanity rule | MUST |

### REQ-001 — Framework Selection Matrix

Teams MUST select a primary metrics framework appropriate to their product type:
**Growth products** (consumer apps, marketplaces, viral products) → **AARRR**
(Acquisition, Activation, Retention, Referral, Revenue); **Experience products**
(productivity tools, B2B SaaS) → **HEART** (Happiness, Engagement, Adoption,
Retention, Task Success); **Platform products** (developer platforms, APIs) →
a **custom North Star** reflecting platform value delivered, supplemented by AARRR
or HEART components. Framework selection MUST be documented in the PRD or product
strategy document.

### REQ-002 — North Star Criteria

Every product MUST define exactly one North Star metric satisfying all four
criteria: (1) **Leading indicator** — predicts future business health rather than
measuring past outcomes; (2) **Measurable and trackable** — computable from
available data with a defined cadence (weekly/monthly); (3) **Actionable by the
team** — the product team has direct levers to influence it; (4) **Explainable in
one sentence**. The North Star MUST be reviewed and reconfirmed at each annual
product planning cycle.

### REQ-003 — Metric Hierarchy

Teams MUST structure metrics in a hierarchy of at most three levels. **Level 1
(North Star)**: one metric for overall product value. **Level 2 (L1 drivers)**:
3–5 metrics that directly influence the North Star, each with a documented causal
hypothesis. **Level 3 (L2 diagnostics)**: per-feature/per-team metrics explaining
movements in L1 drivers (max 3 per driver). Metrics beyond three levels are
PROHIBITED — they indicate measurement fragmentation rather than focus.

### REQ-004 — Anti-Vanity Rule

Teams MUST apply the anti-vanity test before adding any metric to the official
dashboard. A metric fails if it can increase while revenue and retention stay flat
or decrease; such metrics MUST NOT appear in official product reviews or be used as
feature success criteria. Common failures: total registered users (no active
filter), raw pageviews (no session-quality filter), total API calls (no unique
active-customer filter), press mentions, downloads without activation. When a
vanity metric is useful operationally, it MUST be labeled "operational indicator,
not success metric."

## Anti-Patterns

- Tracking vanity metrics (total signups, raw pageviews) as primary success indicators.
- No North Star defined — teams optimize different local metrics, creating misalignment.
- Conflicting team metrics where one team's optimization harms another's.
- Metric hierarchy deeper than three levels — complexity without insight.
- Changing the North Star quarterly, preventing year-over-year trend analysis.

## Integration with Existing Standards

- **`prd-standards`** — PRD success metrics are drawn from this hierarchy.
- **`observability-standards` / `slo-sli`** — the *tracking* of product metrics
  reuses the SRE metric/observability primitives; reliability SLOs stay in `slo-sli`.
- **`user-story-mapping`** — story acceptance criteria tie to a North Star driver.

## Related Specs

- XSPEC-069 — UDS product-layer pack (this standard's source)
- XSPEC-063 — SRE pack (`observability-standards`, `slo-sli`)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~004: framework matrix, North Star criteria, metric hierarchy, anti-vanity rule (XSPEC-069) |
