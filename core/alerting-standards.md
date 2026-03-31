# Alerting Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/alerting-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects with production services
**Scope**: universal
**Industry Standards**: Google SRE, PagerDuty Best Practices
**References**: [sre.google](https://sre.google/), [PagerDuty](https://www.pagerduty.com/)

---

## Overview

This document defines standards for designing, classifying, routing, and maintaining production alerts. Effective alerting is the bridge between observability data and human action — every alert should be actionable, appropriately urgent, and linked to a resolution path.

---

## Alert Severity Classification (P1-P4)

### Severity Definitions

| Level | Name | Criteria | Response Time | Notification Channels |
|-------|------|----------|---------------|----------------------|
| **P1** | Critical | Full service outage; data loss risk; security breach | < 5 minutes | Phone + SMS + Chat |
| **P2** | High | Major feature degraded; partial outage; large user impact | < 15 minutes | SMS + Chat |
| **P3** | Warning | Performance degradation; resource approaching limits; minor feature affected | < 4 hours | Chat + Ticket |
| **P4** | Info | Anomalous trend; preventive notice; non-urgent maintenance | Next business day | Email + Ticket |

### Severity Decision Tree

Use this decision tree to determine the appropriate severity:

```
Is the user completely unable to use the service?
├─ Yes → P1 (Critical)
└─ No
   ├─ Is a major feature affected with no workaround?
   │  ├─ Yes → P2 (High)
   │  └─ No
   │     ├─ Is performance degraded but service still usable?
   │     │  ├─ Yes → P3 (Warning)
   │     │  └─ No → P4 (Info)
   └─ Is there data loss or security risk?
      └─ Yes → P1 (Critical)
```

---

## Escalation Paths

### Escalation Matrix Template

Define escalation tiers for each severity level:

| Time | P1 (Critical) | P2 (High) | P3 (Warning) |
|------|---------------|-----------|---------------|
| 0 min | On-call Engineer (值班工程師) | On-call Engineer | — |
| 5 min (unack) | On-call Lead (值班主管) | — | — |
| 15 min (unack) | Engineering Manager (工程經理) | On-call Lead | On-call Engineer |
| 30 min (unresolved) | VP Engineering | Engineering Manager | — |
| 60 min (unresolved) | CTO/Executive | VP Engineering | On-call Lead |

### Auto-Escalation Rules

- P1 alerts auto-escalate after **5 minutes** if not acknowledged
- P2 alerts auto-escalate after **15 minutes** if not acknowledged
- P3 alerts auto-escalate after **4 hours** if not acknowledged
- Auto-escalation notifications include the original alert context plus elapsed time

---

## Actionable Alert Design

### Required Alert Elements

Every alert notification MUST include these 6 elements:

| Element | Description | Example |
|---------|-------------|---------|
| **Title** | Concise problem description with severity | `[P2] API Latency Exceeds SLO Threshold` |
| **Impact** | Affected services and scope | `payment-service, affecting 30% of users` |
| **Current Status** | Key metric current value vs threshold | `P99 latency: 2.3s (SLO: < 500ms)` |
| **Runbook Link** | Link to corresponding resolution steps | `[Runbook: API Latency High](link)` |
| **Dashboard Link** | Link to relevant monitoring dashboard | `[Dashboard](link)` |
| **Start Time** | When the problem began | `2026-03-31 10:15 UTC` |

### Alert Message Template

```
[P{severity}] {alert_name}

Impact: {service_name}, affecting {scope}
Status: {metric_name}: {current_value} (threshold: {threshold})
Started: {start_time} ({duration} ago)

Runbook: {runbook_url}
Dashboard: {dashboard_url}
```

### Runbook Linking Requirements

| Alert Level | Runbook Requirement |
|-------------|-------------------|
| P1 | MUST have a Runbook link |
| P2 | MUST have a Runbook link |
| P3 | SHOULD have a Runbook link |
| P4 | SHOULD have a Runbook link |

See [Runbook Standards](runbook-standards.md) for runbook format and maintenance.

---

## Noise Reduction Strategies

### Deduplication

Merge alerts with the same fingerprint (service + alert_name + labels) within a time window:

- Same alert triggered multiple times within 5 minutes → merge into one notification
- Include trigger count in the merged notification: `"Triggered 12 times in last 5 minutes"`
- Reset deduplication window when alert resolves

### Grouping

Group related alerts from cascading failures into a single notification:

```yaml
# Example: Alertmanager grouping config
group_by: ['service', 'alert_name']
group_wait: 30s        # Wait before sending first notification
group_interval: 5m     # Wait between group updates
```

- Root cause alert takes priority in the group summary
- Child alerts listed as "related alerts" in the notification

### Suppression / Maintenance Windows

Silence alerts during known maintenance:

- Define maintenance windows with start/end time and affected services
- All P3/P4 alerts for affected services are silenced
- P1/P2 alerts are **never** silenced (safety override)
- Maintenance windows are logged for audit

### Dampening / Threshold Hysteresis

Prevent flapping alerts when metrics oscillate around threshold:

| Strategy | How It Works | Use When |
|----------|-------------|----------|
| **For-duration** | Alert only fires if condition is true for N minutes | Default strategy; prevents transient spikes |
| **Hysteresis** | Different thresholds for firing (90%) and resolving (80%) | CPU/memory metrics that naturally fluctuate |
| **Percentage-based** | Alert if X% of instances exceed threshold | Multi-instance services |

Example:
```yaml
# Alert fires only after 5 minutes of sustained breach
- alert: HighErrorRate
  expr: error_rate > 0.05
  for: 5m    # Dampening: must sustain for 5 minutes
```

---

## Alerts as Code

### Version Control Requirements

All alert rules MUST be:

1. **Stored in Git** — Alert definitions are code, treated with the same rigor
2. **Code Reviewed** — Changes require peer review before deployment
3. **Automatically Tested** — CI validates alert rules before merge
4. **Deployed via CI/CD** — Alert changes go through the deployment pipeline

### Alert Rule Testing

When submitting a PR that modifies alert rules, automated tests SHOULD verify:

| Check | Description |
|-------|-------------|
| **Syntax correctness** | Rule parses without errors |
| **Threshold reasonableness** | Values within sane bounds (e.g., error rate 0-100%) |
| **Runbook link validity** | Referenced runbook URL exists and is accessible |
| **No conflicts** | New rule doesn't duplicate existing rules |
| **Label consistency** | Uses standard label names |

### CI/CD Integration

```
PR with alert changes → Lint → Unit Test → Review → Merge → Deploy to alerting system
```

---

## SLO-based Alerting (Best Practice)

### Multi-Window Multi-Burn-Rate

The recommended alerting strategy for services with defined SLOs:

**Example: 99.9% availability SLO over 30-day window**

| Window | Burn Rate | Alert Level | Meaning |
|--------|-----------|-------------|---------|
| 1 hour | 14.4x | P1 (Page) | At this rate, budget exhausted in ~2 days |
| 6 hours | 6x | P2 (Alert) | At this rate, budget exhausted in ~5 days |
| 3 days | 1x | P3 (Ticket) | On track to exhaust budget by month end |

**Formula:**
```
Burn Rate = (Error Rate in Window) / (1 - SLO Target)

Example:
  SLO = 99.9%, Window = 1 hour, Errors in window = 1.44%
  Burn Rate = 0.0144 / 0.001 = 14.4x
```

### Traditional vs SLO-based Comparison

| Dimension | Traditional Threshold Alerting | SLO-based Alerting |
|-----------|-------------------------------|-------------------|
| **Setting Basis** | Experience-based thresholds | User experience targets |
| **False Positives** | Higher (static thresholds don't adapt) | Lower (burn rate accounts for natural variation) |
| **Missed Alerts** | Higher (slow degradation goes unnoticed) | Lower (burn rate catches slow burns) |
| **Maintenance Cost** | High (need frequent threshold tuning) | Low (only update when SLO changes) |
| **Prerequisite** | None | Must have defined SLOs |

---

## Alert Quality Metrics

### Key Metrics

Track these metrics to continuously improve alert quality:

| Metric | Definition | Target |
|--------|-----------|--------|
| **Signal-to-Noise Ratio (SNR)** | Actionable alerts / Total alerts | > 80% |
| **MTTA** (Mean Time to Acknowledge) | Average time from alert to human acknowledgment | P1: < 5 min, P2: < 15 min |
| **Alert Frequency per Person** | Average alerts received per person per day | < 5 per person per day |
| **Duplication Rate** | Same alert triggered repeatedly in 30 days / Total alerts | < 20% |
| **Runbook Coverage** | Alerts with linked Runbook / Total alerts | P1/P2: 100%, P3/P4: > 80% |

### Quarterly Audit Process

Every quarter, review all active alert rules:

| Dimension | Question | Action if "No" |
|-----------|----------|----------------|
| **Was it triggered in the last 90 days?** | Has this alert fired at least once? | Consider removing or adjusting threshold |
| **Did it require human action?** | When triggered, did someone need to act? | Consider automating the response |
| **Does it have a Runbook?** | Is there a documented resolution path? | Create a Runbook or remove the alert |

**Additional audit questions:**
- Is the severity level still appropriate?
- Is the notification channel still correct?
- Has the service architecture changed in ways that affect this alert?

---

## Quick Reference Card

### Alert Design Checklist
```
□ Has a clear, descriptive title
□ Includes impact and current status
□ Links to Runbook (required for P1/P2)
□ Links to Dashboard
□ States when the problem started
□ Has appropriate severity (P1-P4)
```

### Noise Reduction Selection
```
Same alert firing repeatedly?    → Deduplication
Multiple services alerting?      → Grouping (cascading failure)
Planned maintenance?             → Suppression
Metric fluctuating at threshold? → Dampening
```

---

## References

- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — Multi-window burn rate strategy
- [PagerDuty — Alert Design Principles](https://www.pagerduty.com/) — Actionable alert design
- [Prometheus — Alerting Best Practices](https://prometheus.io/docs/practices/alerting/) — Alert rule design patterns
- [Rob Ewaschuk — My Philosophy on Alerting](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/) — Foundational alerting philosophy

---

**Related Standards:**
- [SLO Standards](slo-standards.md) — SLI/SLO/Error Budget definitions
- [Observability Standards](observability-standards.md) — Metrics and monitoring
- [Runbook Standards](runbook-standards.md) — Runbook format and maintenance
- [Logging Standards](logging-standards.md) — Log-based alerting patterns

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Severity classification, escalation, actionable alerts, noise reduction, SLO-based alerting, quality metrics |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
