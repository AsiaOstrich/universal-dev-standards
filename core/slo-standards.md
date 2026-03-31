# SLO Standards (Service Level Objectives)

> **Language**: English | [繁體中文](../locales/zh-TW/core/slo-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects with production services
**Scope**: universal
**Industry Standards**: Google SRE, ISO/IEC 20000
**References**: [sre.google](https://sre.google/), [OpenSLO](https://openslo.com/)

---

## Overview

This document defines standards for Service Level Indicators (SLI), Service Level Objectives (SLO), and Error Budgets. These concepts form the foundation of reliability management, enabling teams to balance feature velocity with service quality.

---

## Key Concepts

### SLI / SLO / SLA / Error Budget Definitions

| Concept | Definition | Audience | Violation Consequence |
|---------|-----------|----------|----------------------|
| **SLI** (Service Level Indicator) | A quantitative measurement of service behavior | Engineering team | No direct consequence (data point) |
| **SLO** (Service Level Objective) | An internal target for an SLI over a time window | Engineering team | Triggers Error Budget policy |
| **SLA** (Service Level Agreement) | An external contract guaranteeing service quality | Customers | Contractual penalties (refunds, credits) |
| **Error Budget** | The allowed amount of unreliability (1 - SLO target) | Engineering team | When exhausted, triggers protective actions |

### SLI vs SLO vs SLA Comparison

```
                    ┌─────────────────────────────────────┐
                    │          Service Quality             │
                    │                                       │
  SLI ─── measures ──► SLO ─── stricter than ──► SLA       │
  (what)              (internal target)         (contract)  │
                    │                                       │
                    │  Error Budget = 1 - SLO target        │
                    └─────────────────────────────────────┘
```

**SLO should be stricter than SLA** to provide a buffer. Example:
- SLA: 99.9% availability (contractual obligation to customers)
- SLO: 99.95% availability (internal target, gives 50% buffer before SLA breach)

---

## SLI Selection Guide

### API Services

For REST/gRPC API services, select SLIs from:

| SLI | Measurement | Data Source |
|-----|-------------|-------------|
| **Availability** | Successful requests (non-5xx) / Total requests | Load balancer or application metrics |
| **Latency** | Requests with duration below threshold / Total requests | Application histogram metric |
| **Quality** | Non-degraded responses / Total responses | Application-level quality checks |

**Example:** Availability SLI = `count(http_status != 5xx) / count(all_requests)` over rolling 28 days.

### Batch Jobs

For scheduled batch processing, data pipelines, and ETL jobs:

| SLI | Measurement | Data Source |
|-----|-------------|-------------|
| **Freshness** | Time since last successful completion within threshold | Job scheduler metrics |
| **Correctness** | Correctly processed records / Total records | Application validation metrics |
| **Coverage** | Successfully completed batches / Total scheduled batches | Job scheduler metrics |

### Frontend Applications

For web and mobile frontend applications:

| SLI | Measurement | Data Source |
|-----|-------------|-------------|
| **Load Performance** | Pages with LCP < 2.5s, FID < 100ms, CLS < 0.1 / Total pages | Real User Monitoring (RUM) |
| **Availability** | Successfully loaded pages / Total page loads | RUM or synthetic monitoring |
| **Interaction Delay** | User actions with response < threshold / Total actions | RUM |

### Data Pipelines

For streaming and real-time data processing:

| SLI | Measurement | Data Source |
|-----|-------------|-------------|
| **Throughput** | Records processed per second within target | Pipeline metrics |
| **Freshness** | End-to-end latency within threshold | Pipeline metrics |
| **Correctness** | Valid output records / Total output records | Validation metrics |

---

## SLO Setting Methodology

### Step-by-Step Process

Follow these 5 steps when setting SLOs for a service:

#### Step 1: Select SLI

Choose the most meaningful SLIs from the guide above. Start with 1-3 SLIs per service.

#### Step 2: Determine Measurement Window

| Window Type | Duration | Use When |
|-------------|----------|----------|
| **Rolling** | 28 days (recommended) | Most services; smooths out weekly patterns |
| **Calendar** | Calendar month | Aligns with business reporting cycles |

#### Step 3: Set Target Value

Use historical data to set an initial target. A common starting point is the **P5 of historical performance** (i.e., the level achieved 95% of the time).

**Target Value Selection Guide:**

| Target | Monthly Downtime Allowed | Suitable For |
|--------|--------------------------|-------------|
| 99% | 7.3 hours | Internal tools, non-critical services |
| 99.5% | 3.65 hours | General B2B services |
| 99.9% | 43.8 minutes | Consumer-facing core services |
| 99.95% | 21.9 minutes | Financial, healthcare, high-reliability |
| 99.99% | 4.38 minutes | Infrastructure, payment platforms |

> **Tip:** Don't set SLOs higher than you can sustain. An overly ambitious SLO will exhaust your Error Budget frequently and disrupt feature development.

#### Step 4: Define Compliance Formula

Document the exact formula for calculating SLO compliance:

```
SLO Compliance = (Good Events / Total Events) × 100%

Where:
- Good Events = requests with status < 500 AND duration < 500ms
- Total Events = all requests received
- Window = rolling 28 days
- Target = 99.9%
```

#### Step 5: Document SLO Specification

Record the SLO using the [SLO Document Template](#slo-document-template).

### Iterative Adjustment

SLOs are not set-and-forget. Review quarterly using these signals:

| Signal | Action |
|--------|--------|
| Error Budget consistently underused (> 80% remaining) | Consider tightening SLO |
| Error Budget frequently exhausted | Consider loosening SLO or investing in reliability |
| User satisfaction declining despite meeting SLO | SLI may not reflect user experience; revisit SLI selection |
| Engineering team burned out from reliability work | SLO may be too aggressive |

---

## Error Budget Policy

### Calculation

Error Budget represents the allowed amount of failure:

```
Error Budget = 1 - SLO Target

Example:
  SLO = 99.9% availability over 28 days
  Error Budget = 0.1%
  = 28 days × 24 hours × 60 minutes × 0.001
  = 40.32 minutes of allowed downtime
```

### Burn Rate Alerting

Monitor how fast your Error Budget is being consumed:

| Consumption Speed | Threshold | Triggered Action | Meaning |
|-------------------|-----------|------------------|---------|
| **Fast burn** | 2% of budget consumed in 1 hour | Page (P1) | At this rate, budget exhausted in ~2 days |
| **Medium burn** | 5% of budget consumed in 6 hours | Alert (P2) | At this rate, budget exhausted in ~5 days |
| **Slow burn** | 10% of budget consumed in 3 days | Ticket (P3) | May exhaust budget before month end |

### Budget Exhaustion Actions

When Error Budget is exhausted, the team should select from these policy options:

| Policy | Description | When to Use |
|--------|-------------|-------------|
| **Freeze releases** | Halt non-reliability feature releases until budget recovers | Default policy; ensures reliability focus |
| **Reliability sprint** | Dedicate next sprint entirely to reliability improvements | When systemic issues need concentrated effort |
| **Enhanced review** | All changes require additional production-readiness review | When changes are root cause of budget burn |
| **Lower SLO target** | Reduce SLO after stakeholder agreement | When target is unrealistic given current architecture |

> **Important:** The team should agree on their Error Budget policy **before** the budget is exhausted, not during a crisis.

---

## SLO Templates

### API Service Template

| SLI | Measurement | Default SLO |
|-----|-------------|-------------|
| Availability | Non-5xx responses / Total responses | 99.9% |
| Latency | P99 duration < threshold / Total requests | 99% |
| Error Rate | Non-5xx + non-timeout / Total responses | 99.9% |

### Batch Job Template

| SLI | Measurement | Default SLO |
|-----|-------------|-------------|
| Freshness | Max delay < threshold | 99.5% |
| Correctness | Correctly processed / Total | 99.99% |
| Completion Rate | Successfully completed / Scheduled | 99.9% |

### Frontend Application Template

| SLI | Measurement | Default SLO |
|-----|-------------|-------------|
| Load Performance | LCP < 2.5s page proportion | 90% |
| Interaction Delay | FID < 100ms interaction proportion | 95% |
| Visual Stability | CLS < 0.1 page proportion | 95% |

---

## SLO Document Template

When creating an SLO specification for a service, include these sections:

```markdown
# SLO Specification: [Service Name]

## Service Information
- **Service**: [name]
- **Owner**: [team/person]
- **Description**: [what the service does]
- **Dependencies**: [upstream/downstream services]

## SLI Definition
| SLI | Metric | Good Event | Total Event | Data Source |
|-----|--------|------------|-------------|-------------|
| [name] | [metric name] | [definition] | [definition] | [source] |

## SLO Target
| SLI | Target | Window | Compliance Formula |
|-----|--------|--------|--------------------|
| [name] | [%] | [rolling 28d / calendar month] | [formula] |

## Error Budget Policy
| Budget State | Action |
|-------------|--------|
| > 50% remaining | Normal development |
| < 50% remaining | Increased scrutiny on changes |
| Exhausted | [chosen policy: freeze/sprint/review/lower] |

## Stakeholders
| Role | Person/Team | Notification |
|------|-------------|-------------|
| SLO Owner | [name] | All budget alerts |
| Engineering Lead | [name] | Budget < 50% |
| Product Manager | [name] | Budget exhausted |

## Review Cycle
- **Frequency**: Quarterly
- **Next Review**: [date]
- **Review Checklist**:
  - [ ] Budget consumption trend
  - [ ] User satisfaction alignment
  - [ ] Incident frequency and impact
  - [ ] Team workload balance
```

---

## Integration with Development Workflow

### SLO in Spec-Driven Development (/sdd)

When defining a new service using `/sdd`, SHOULD include an SLO section in the spec:

```markdown
## SLO Targets (Recommended)
| SLI | Target | Rationale |
|-----|--------|-----------|
| Availability | 99.9% | Customer-facing API |
| Latency P99 | < 500ms | User experience requirement |
```

### SLO Impact in Incident Response

When using `/incident`, include SLO impact in the assessment:

```markdown
### SLO Impact
- **Affected SLI**: Availability
- **Error Budget consumed**: 15 minutes (37% of monthly budget)
- **Remaining budget**: 25.32 minutes
```

---

## Quick Reference Card

### SLI Selection
```
API Service?         → Availability + Latency + Quality
Batch Job?           → Freshness + Correctness + Coverage
Frontend App?        → LCP/FID/CLS + Availability
```

### SLO Target Selection
```
Internal tool?       → 99%
B2B service?         → 99.5%
Consumer-facing?     → 99.9%
Financial/critical?  → 99.95%+
```

### Error Budget Quick Calc
```
Budget = (1 - target) × window_minutes
99.9% over 28 days = 0.001 × 40320 = 40.32 min
```

---

## References

- [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) — Foundational SLO concepts
- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/) — Practical SLO implementation
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — Multi-window burn rate alerting
- [OpenSLO Specification](https://openslo.com/) — Open standard for SLO definition
- [The Art of SLOs](https://sre.google/resources/practices-and-processes/art-of-slos/) — Google's SLO workshop

---

**Related Standards:**
- [Observability Standards](observability-standards.md) — Three pillars framework and metrics guidance
- [Alerting Standards](alerting-standards.md) — SLO-based alerting strategies
- [Performance Standards](performance-standards.md) — Performance targets
- [Logging Standards](logging-standards.md) — Structured logging for SLI data collection

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: SLI selection, SLO methodology, Error Budget, templates |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
