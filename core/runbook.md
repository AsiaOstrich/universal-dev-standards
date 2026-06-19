# Runbook Writing Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/runbook.ai.yaml`
> **Spec**: XSPEC-063 (cross-project/specs/XSPEC-063-uds-sre-standards-pack.md)

**Scope**: universal

## Overview

This standard defines how operational **runbooks** are written, organized,
maintained, and tested. It covers required sections, writing principles
(reproducible, unambiguous steps), directory structure, review cadence, and drill
frequency. A well-written runbook reduces Mean Time To Repair (MTTR) by ensuring
any on-call engineer can execute recovery steps without requiring tribal
knowledge.

It is part of the **SRE/operations pack** (XSPEC-063) and is the executable
recovery member alongside `incident-response` (runbooks are executed during the
mitigate phase) and `slo-sli` (the error-budget policy is linked from the
runbook). It complements the existing `runbook-standards` Skill anchor; the
unique UDS contribution is an AI-executable runbook schema that a VibeOps
Governance Agent (DEC-042) can run directly.

> **Scope.** This standard defines *what a runbook must contain and how it is
> organized, reviewed, and drilled*. The runbook hosting tool (wiki, Git repo,
> PagerDuty) and the automation engine are adoption choices, not part of this
> standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Required runbook sections (overview → post-actions) | MUST |
| REQ-002 | Reproducible and unambiguous steps (copy-pasteable + verification) | MUST |
| REQ-003 | Runbook naming and directory organization (typed dirs, kebab-case) | MUST |
| REQ-004 | Review and drill cadence (by type) | MUST |
| REQ-005 | Rollback and fallback steps (labeled, before escalation) | MUST |
| REQ-006 | Alert integration metadata (alert name, dashboard, query) | SHOULD |

### REQ-001 — Required Runbook Sections

Every runbook MUST include the following sections in order: (1) **Overview** —
alert name, severity, affected services, owner, last updated, last drilled date;
(2) **Symptoms** — observable indicators; (3) **Impact Assessment** — user-facing
effect and blast radius; (4) **Diagnostic Steps** — ordered steps with
copy-pasteable commands; (5) **Fix Steps** — ordered remediation with verification
for each step; (6) **Escalation** — specific contacts with role and availability;
(7) **Post-Actions** — follow-up tasks, tickets, postmortem triggers.

### REQ-002 — Reproducible and Unambiguous Steps

Each step in a runbook MUST be reproducible and unambiguous. Steps MUST use
copy-pasteable commands with no placeholders left undefined. Decision points MUST
include explicit branch conditions (if X then Y, else Z). Every fix step MUST
include a verification command confirming the fix worked before proceeding, and
the expected output MUST be shown.

### REQ-003 — Runbook Naming and Directory Organization

Runbooks MUST use kebab-case names that describe the problem, not the solution.
Files MUST be organized into typed directories: `alerts/` for alert-response
runbooks, `operations/` for standard ops, `emergency/` for major incident
procedures, and `troubleshooting/` for general investigation guides. Each runbook
file MUST declare its type in the front matter.

### REQ-004 — Review and Drill Cadence

Runbooks MUST be reviewed on schedule based on type: alert-response runbooks
quarterly, emergency procedures monthly, standard operation and troubleshooting
guides bi-annually, and change procedures after each use. Runbooks MUST be
drilled: P1 runbooks monthly, P2 quarterly, emergency procedures quarterly. Drill
records MUST be appended to the runbook or linked from it.

### REQ-005 — Rollback and Fallback Steps

Any runbook describing a change or fix MUST include a clearly labeled rollback
section describing how to undo the change if the fix fails or causes additional
issues. The rollback section MUST appear before the escalation section and include
its own verification steps.

### REQ-006 — Alert Integration Metadata

Alert-response runbooks SHOULD include a metadata block linking the runbook to
specific alert rules. This enables automatic runbook linking in alerting tools
(PagerDuty, Alertmanager). Metadata MUST include the alert name, dashboard URL,
and the Prometheus/logging query used to investigate.

## Integration with Existing Standards

- **`runbook-standards`** — the existing Skill-anchor standard; `runbook` provides
  the AI-executable schema and the section/drill requirements behind it.
- **`incident-response`** — runbooks are executed during the incident mitigate
  phase; SEV runbooks are drilled per the cadence here.
- **`slo-sli`** — the error-budget policy MUST be linked from the service runbook.
- **`rollback-standards`** — REQ-005 rollback steps align with the rollback
  standard's undo procedures.
- **`alerting-standards`** — REQ-006 metadata links alert rules to their runbook.
- **`execution-history`** — when a runbook is marked `automation_level: automated`,
  the Governance Agent's execution results are recorded as execution history.

## Related Specs

- XSPEC-063 — UDS SRE/operations pack (this standard's source)
- XSPEC-251 — Operator proactive reliability (runbook ownership)
- DEC-042 — Guardian / Governance Agent pattern (agent executes `automated` runbooks)
- DEC-041 — EU AI Act 2026 compliance (auditable recovery procedures)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: required sections, reproducible steps, naming/organization, review/drill cadence, rollback/fallback, alert integration metadata (XSPEC-063) |
