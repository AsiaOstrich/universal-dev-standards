# Incident Response Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/incident-response.ai.yaml`
> **Spec**: XSPEC-063 (cross-project/specs/XSPEC-063-uds-sre-standards-pack.md)

**Scope**: universal

## Overview

This standard defines the end-to-end **incident response lifecycle**: severity
classification, response-time SLAs, roles and responsibilities, communication
protocols, escalation paths, and blameless postmortem requirements. It is
designed to reduce MTTR, ensure consistent stakeholder communication during
incidents, and drive systemic reliability improvements through structured
postmortems.

It is part of the **SRE/operations pack** (XSPEC-063) and is the incident-handling
member alongside `slo-sli` (error-budget triggers) and `runbook` (executable
recovery steps). It composes with `virtual-organization-standards` — a SEV-1
incident spins up the incident virtual organization (IC, Communications Lead,
Operations Lead) — and feeds the proactive reliability ownership described in
XSPEC-251 (Operator).

> **Scope.** This standard defines *how incidents are classified, coordinated,
> communicated, and learned from*. The paging tool (PagerDuty, Opsgenie), the
> status-page product, and the ticketing system are adoption choices, not part of
> this standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Severity classification (4-level SEV scale with response SLAs) | MUST |
| REQ-002 | Incident Commander role (assigned within 10 min for SEV-1/2) | MUST |
| REQ-003 | Stakeholder communication protocol (defined cadence + status page) | MUST |
| REQ-004 | Blameless postmortem requirements (5 Whys, action items tracked) | MUST |
| REQ-005 | On-call rotation and handoff (≥2 engineers, written handoff) | MUST |
| REQ-006 | Incident retrospective metrics (MTTD/MTTR reviewed monthly) | SHOULD |

### REQ-001 — Severity Classification

Every incident MUST be classified at declaration using a 4-level severity scale.
**SEV-1** (Critical): complete service outage or data breach affecting all users,
response within 15 minutes, C-suite notification. **SEV-2** (High): major feature
unavailable or significant performance degradation affecting >25% of users,
response within 30 minutes. **SEV-3** (Medium): minor feature unavailable or
degradation affecting <25% of users, response within 4 hours. **SEV-4** (Low):
cosmetic issue or very minor impact, response within 24 hours.

### REQ-002 — Incident Commander Role

Every SEV-1 and SEV-2 incident MUST have a designated Incident Commander (IC)
assigned within 10 minutes of declaration. The IC is responsible for coordinating
the response bridge, assigning roles (scribe, comms lead, technical leads),
driving the timeline, making go/no-go decisions on fixes, and initiating the
postmortem. The IC does NOT directly troubleshoot — their sole focus is
coordination.

### REQ-003 — Stakeholder Communication Protocol

During SEV-1/SEV-2 incidents, stakeholder updates MUST be sent on a defined
cadence: initial notification within 15 minutes of declaration, updates every
30 minutes until resolution, and an immediate update on any severity change or
major development. Updates MUST include current status, known impact, what is
being done, and the next update time. The status page MUST be updated
simultaneously with internal communications.

### REQ-004 — Blameless Postmortem Requirements

Every SEV-1 incident MUST have a blameless postmortem completed within 5 business
days; SEV-2 incidents within 10 business days. Postmortems MUST be blameless —
focusing on systemic causes, not individual mistakes. Required sections: timeline,
impact, root cause (5 Whys), contributing factors, action items with owners and
due dates, and lessons learned. Action items MUST be tracked to completion.

### REQ-005 — On-Call Rotation and Handoff

Every production service MUST have a documented on-call rotation with at least 2
engineers. Rotation schedules MUST be published at least 2 weeks in advance.
On-call handoff MUST include a written summary of active incidents, recent
incidents still under investigation, known flaky alerts, upcoming planned
maintenance, and any service-health concerns. Handoff MUST be acknowledged by the
incoming on-call.

### REQ-006 — Incident Retrospective Metrics

Teams SHOULD track and review incident metrics monthly: MTTD (Mean Time To
Detect), MTTR (Mean Time To Resolve), incident frequency by severity, repeat
incidents (same root cause within 90 days), and postmortem action-item completion
rate. These metrics SHOULD be reviewed in monthly reliability reviews with
engineering leadership.

## Integration with Existing Standards

- **`runbook`** — the IC and on-call engineers execute typed runbooks during the
  mitigate phase; SEV runbooks are drilled per the `runbook` cadence.
- **`slo-sli`** — error-budget burn often triggers incident declaration; SLO
  impact is summarized in the postmortem.
- **`postmortem-standards`** — REQ-004 aligns with the blameless postmortem
  template; this standard sets the trigger and timelines.
- **`virtual-organization-standards`** — SEV-1 incidents instantiate the incident
  virtual organization (IC, Communications Lead, Operations Lead).
- **`alerting-standards`** — alerts initiate detection and severity assessment.
- **`execution-history`** — automated mitigation actions are recorded as execution
  history.

## Related Specs

- XSPEC-063 — UDS SRE/operations pack (this standard's source)
- XSPEC-251 — Operator proactive reliability (proactive ownership upstream of incidents)
- DEC-041 — EU AI Act 2026 compliance (auditability requires postmortems)
- DEC-042 — Guardian / Governance Agent pattern (agent-driven runbook execution)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: severity classification, incident commander, communication protocol, blameless postmortem, on-call rotation/handoff, retrospective metrics (XSPEC-063) |
