# SLO/SLI Definition Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/slo-sli.ai.yaml`
> **Spec**: XSPEC-063 (cross-project/specs/XSPEC-063-uds-sre-standards-pack.md)

## Overview

This standard defines how teams **select, measure, and govern Service Level
Indicators (SLIs) and Service Level Objectives (SLOs)**. It covers SLI selection
per service type, SLO target-setting methodology, error-budget policies, and
multi-window burn-rate alerting. It is designed to bridge engineering reliability
work with customer-facing SLA commitments.

It is part of the **SRE/operations pack** (XSPEC-063) and is the
reliability-target member alongside `incident-response` (error-budget burn often
triggers incidents) and `runbook` (the error-budget policy is linked from the
service runbook). It complements the existing `slo-standards` Skill anchor and
feeds the proactive reliability ownership described in XSPEC-251 (Operator).

> **Scope.** This standard defines *how to choose SLIs, set SLO targets, and
> govern error budgets*. The metrics backend (Prometheus, Datadog), the dashboard
> product, and the alerting tool are adoption choices, not part of this standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | SLI selection per service type (API / batch / frontend) | MUST |
| REQ-002 | SLO target-setting methodology (historical P5 baseline + buffer) | MUST |
| REQ-003 | Error budget policy (freeze + reliability-sprint triggers) | MUST |
| REQ-004 | Multi-window burn-rate alerting (fast / medium / slow burn) | SHOULD |
| REQ-005 | SLO documentation and review cadence (standard spec + quarterly review) | MUST |
| REQ-006 | SLO compliance reporting (monthly stakeholder report) | SHOULD |

### REQ-001 — SLI Selection Per Service Type

Every production service MUST define at least one SLI matched to its service type.
API services MUST measure availability (non-5xx / total) and latency (proportion
of requests below a threshold). Batch jobs MUST measure freshness (data lag ≤
threshold) and correctness (successfully processed / total). Frontend services
MUST measure Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1).

### REQ-002 — SLO Target Setting Methodology

SLO targets MUST be set using historical baseline data. Teams MUST start from the
observed P5 performance (the 5th-percentile worst period) over at least 28 rolling
days, then add a small buffer. The SLO target MUST be strictly higher than any
external SLA commitment (e.g., SLA 99.9% → SLO ≥ 99.95%). Never set an SLO equal
to the SLA; maintain a ≥ 0.05% buffer.

### REQ-003 — Error Budget Policy

Every service with an SLO MUST have a written Error Budget Policy specifying
actions when the error budget is partially or fully exhausted. At minimum the
policy MUST define: (1) a freeze threshold (typically 50% exhausted → release
freeze), (2) a reliability-sprint trigger (100% exhausted), and (3) an SLO review
cadence (quarterly). The error-budget computation follows
`budget = (1 − SLO) × time window` (e.g., 99.9% over 30 days → 43.2 minutes).

### REQ-004 — Multi-Window Burn-Rate Alerting

Teams SHOULD implement multi-window burn-rate alerts to catch both fast and slow
budget exhaustion. Recommended thresholds: fast burn (2% of monthly budget
consumed in 1 hour → P1 page), medium burn (5% in 6 hours → P2 alert), slow burn
(10% in 3 days → P3 ticket).

### REQ-005 — SLO Documentation and Review Cadence

Each SLO MUST be documented in a standard SLO spec file containing: service name,
SLI formula, measurement window, target value, error budget, alerting thresholds,
and owner. SLO specs MUST be reviewed quarterly and updated within 2 weeks of any
major architecture change.

### REQ-006 — SLO Compliance Reporting

Teams SHOULD publish a monthly SLO compliance report to stakeholders. The report
MUST include achieved vs. target SLI value, error budget remaining, significant
incidents affecting the SLO, and planned reliability improvements. Dashboard links
MUST be included.

## Integration with Existing Standards

- **`slo-standards`** — the existing Skill-anchor standard; `slo-sli` provides the
  detailed selection/target/error-budget methodology behind it.
- **`incident-response`** — error-budget burn-rate alerts feed incident
  declaration and severity assessment.
- **`runbook`** — the error-budget policy MUST be linked from the service runbook.
- **`rollback-standards`** — error-budget exhaustion can trigger a deployment
  freeze and, downstream, automated rollback.
- **`observability-standards`** — SLIs are computed from the metric/log/trace
  pillars defined there.
- **`alerting-standards`** — burn-rate alerts follow the symptom-based alerting
  and severity grading rules.

## Related Specs

- XSPEC-063 — UDS SRE/operations pack (this standard's source)
- XSPEC-251 — Operator proactive reliability (SLO ownership upstream of incidents)
- DEC-041 — EU AI Act 2026 compliance (reliability evidence)
- DEC-042 — Guardian / Governance Agent pattern (error-budget-driven actions)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: SLI selection, SLO target methodology, error-budget policy, burn-rate alerting, SLO documentation/review, compliance reporting (XSPEC-063) |
