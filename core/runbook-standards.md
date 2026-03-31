# Runbook Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/runbook-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects with production services
**Scope**: universal
**Industry Standards**: PagerDuty Runbook Best Practices, Google SRE
**References**: [PagerDuty](https://www.pagerduty.com/), [sre.google](https://sre.google/)

---

## Overview

This document defines standards for writing, organizing, maintaining, and validating runbooks (operational procedures). A runbook is a documented set of steps that an operator follows to diagnose and resolve a specific problem or perform a routine operation.

---

## Runbook Types

| Type | Purpose | Example | Trigger |
|------|---------|---------|---------|
| **Alert Response** | Diagnose and fix a specific alert | `api-latency-high.md` | Alert fires |
| **Standard Operation** | Routine operational procedures | `database-backup-restore.md` | Scheduled or on-demand |
| **Emergency Procedure** | Major incident rapid response | `full-service-outage.md` | SEV-1 incident |
| **Change Procedure** | Planned change execution steps | `database-migration.md` | Change window |
| **Troubleshooting Guide** | General problem investigation methods | `memory-leak.md` | Ad-hoc investigation |

---

## Standard Template

### Required Sections

Every runbook MUST contain these 7 sections:

```markdown
# Runbook: [Problem Name]

## Overview
- **Alert Name**: [alert name or N/A]
- **Severity**: P1/P2/P3/P4
- **Related Services**: [service names]
- **Last Updated**: YYYY-MM-DD
- **Owner**: @owner
- **Last Drilled**: YYYY-MM-DD

## Symptoms
[What does the user see? How does the system behave?]
- [Observable symptom 1]
- [Observable symptom 2]

## Impact Assessment
- **Affected users**: [scope]
- **Business impact**: [revenue, reputation, compliance]
- **Upstream/downstream effects**: [cascading impact]

## Diagnostic Steps
1. **Check [component]**
   ```bash
   # Specific command to run
   kubectl get pods -n production | grep payment
   ```
   Expected output: [what to look for]

2. **Verify [metric]**
   Dashboard: [link]
   Normal range: [X-Y]

3. **Determine root cause**
   - If [condition A] → go to Fix Steps: Scenario A
   - If [condition B] → go to Fix Steps: Scenario B

## Fix Steps
### Scenario A: [Root Cause A]
1. [Step with specific command]
   ```bash
   kubectl rollout restart deployment/payment-service -n production
   ```
2. **Verify fix**: [how to confirm it worked]
   ```bash
   curl -s https://api.example.com/health | jq .status
   ```
   Expected: `"healthy"`
3. **Estimated time**: 2-5 minutes

### Scenario B: [Root Cause B]
1. [Alternative fix steps]

## Escalation
- If above steps don't resolve within [time]:
  - Contact: [team/person] via [channel]
  - Escalation phone: [number]
  - Backup contact: [person]

## Post-Actions
- [ ] Update this runbook if new information found
- [ ] Create postmortem if P1/P2 (see [Postmortem Standards](postmortem-standards.md))
- [ ] Notify stakeholders via [channel]
- [ ] Record incident metrics (MTTD, MTTR)
```

### Optional Sections

| Section | When to Include |
|---------|----------------|
| **Prerequisites** | When special access or tools are needed |
| **Rollback Steps** | When fix steps have side effects |
| **Related Runbooks** | When problems often co-occur |
| **Changelog** | For frequently updated runbooks |

---

## Writing Quality Guidelines

### Six Principles

Write runbooks that are effective under pressure — when an on-call engineer is tired, stressed, and working at 3 AM:

| Principle | Description | Good Example | Bad Example |
|-----------|-------------|-------------|------------|
| **Reproducible** | Steps are specific enough to copy-paste and execute | `kubectl rollout restart deployment/payment-service -n production` | "Restart the payment service" |
| **Unambiguous** | Each step has exactly one interpretation | "Restart the `payment-service` Pod in the `production` namespace" | "Restart the service" |
| **Decision Points** | Branch conditions are explicit with clear criteria | "If CPU > 90%, execute Plan A; otherwise execute Plan B" | "If the server seems overloaded..." |
| **Rollback** | Failed fix steps have a fallback plan | "If rollback fails, execute Emergency Procedure: full-service-outage.md" | (no rollback mentioned) |
| **Verification** | Each fix step has a way to confirm success | "Run `curl health-check` and verify HTTP 200 response" | "Check that it's working" |
| **Time-bounded** | Expected completion time is stated | "This step typically takes 2-5 minutes" | (no time estimate) |

### Common Anti-patterns

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| "Contact the team" | Which team? Which channel? | Name specific people and channels |
| "Check the logs" | Which logs? Where? What to search for? | Provide exact log query |
| "If needed, scale up" | When is it needed? Scale to what? | Define threshold and target |
| Outdated commands | Commands reference removed services | Regular review cycle |

---

## Organization and Storage

### Directory Structure

```
docs/runbooks/
├── README.md                          # Index and search guide
├── alerts/                            # Alert Response runbooks
│   ├── api-latency-high.md
│   ├── disk-space-low.md
│   └── database-connection-pool.md
├── operations/                        # Standard Operation runbooks
│   ├── database-backup-restore.md
│   └── secret-rotation.md
├── emergency/                         # Emergency Procedure runbooks
│   ├── full-service-outage.md
│   └── data-breach-response.md
├── changes/                           # Change Procedure runbooks
│   ├── database-migration.md
│   └── major-version-upgrade.md
└── troubleshooting/                   # Troubleshooting Guide runbooks
    ├── memory-leak.md
    └── performance-degradation.md
```

### Naming Conventions

Use kebab-case file names that describe the **problem**, not the solution:

- ✅ `api-latency-high.md` — describes the problem
- ✅ `disk-space-low.md` — describes the problem
- ✅ `database-connection-pool.md` — describes the problem area
- ❌ `restart-api-server.md` — describes the solution, not the problem
- ❌ `runbook-001.md` — meaningless sequential number
- ❌ `RUNBOOK_API.md` — wrong case convention

### Indexing

Maintain a `README.md` index in the runbooks directory:

```markdown
# Runbooks Index

## Alert Response
| Runbook | Severity | Services | Last Updated |
|---------|----------|----------|-------------|
| [API Latency High](alerts/api-latency-high.md) | P2 | api-gateway | 2026-03-15 |

## Emergency Procedures
| Runbook | Services | Last Updated |
|---------|----------|-------------|
| [Full Service Outage](emergency/full-service-outage.md) | all | 2026-03-01 |
```

---

## Validity Management

### Review Cycles

Each runbook type has a mandatory review cycle:

| Type | Review Cycle | Reviewer |
|------|-------------|----------|
| Alert Response | Quarterly (every 3 months) | On-call team |
| Emergency Procedure | Monthly | Engineering lead |
| Standard Operation | Bi-annually (every 6 months) | Operations team |
| Change Procedure | After each use | Change executor |
| Troubleshooting Guide | Bi-annually (every 6 months) | Subject matter expert |

### Staleness Detection

A runbook is considered **stale** when:
- `Last Updated` date exceeds the review cycle for its type
- The runbook has not been drilled within its drill cycle

Stale runbooks SHOULD be flagged with ⚠️ in the index and prioritized for review.

### Architecture-Change Triggers

When any of these changes occur, related runbooks MUST be reviewed:

| Change Type | Affected Runbooks |
|-------------|------------------|
| Service split/merge | All runbooks referencing the service |
| Database migration | Database-related runbooks |
| Infrastructure change (cloud region, provider) | All emergency + operations runbooks |
| Monitoring/alerting tool change | All alert response runbooks |
| Team restructure | Escalation sections of all runbooks |

---

## Drill / Exercise Process

### Scheduling

| Priority | Condition | Drill Frequency |
|----------|-----------|-----------------|
| Highest | P1 alert Runbooks | Monthly |
| High | P2 alert Runbooks | Quarterly |
| Medium | Emergency Procedures | Quarterly |
| Low | Other Runbooks | Bi-annually |

### Recording

After each drill, record the results:

```markdown
## Drill Record: [Runbook Name]

- **Date**: YYYY-MM-DD
- **Participants**: @name1, @name2
- **Runbook**: [link]
- **Result**: ✅ Pass / ⚠️ Partial Pass / ❌ Fail
- **Estimated Repair Time**: X minutes (per runbook)
- **Actual Repair Time**: Y minutes (during drill)
- **Issues Found**:
  - [Issue 1: description]
  - [Issue 2: description]
- **Runbook Updates Required**:
  - [ ] [Update description]
```

### Failure Handling

When a drill reveals that runbook steps cannot be executed:

1. **Immediately** flag the runbook as needing update
2. Create an action item with owner and deadline
3. Re-drill after the update is applied
4. Do not consider the runbook valid until re-drill passes

---

## Integration Points

### Alert-to-Runbook Linking

Every alert rule SHOULD include a `runbook_url` annotation:

```yaml
annotations:
  runbook_url: "https://wiki.example.com/runbooks/alerts/api-latency-high"
```

When an alert fires, the notification automatically includes the Runbook link.

### Postmortem-to-Runbook Flow

After a postmortem (see [Postmortem Standards](postmortem-standards.md)):
- If the incident revealed gaps in an existing runbook → update the runbook
- If the incident was a new failure mode → create a new runbook
- Link the postmortem to the runbook's changelog

### Coverage Reporting

Generate a runbook coverage report periodically:

| Alert Level | Total Alerts | With Runbook | Coverage | Target |
|-------------|-------------|-------------|---------|--------|
| P1/P2 | N | N | 100% | 100% |
| P3/P4 | N | N | X% | > 80% |

**Alerts without Runbooks** (action required):
- `[P2] database-replication-lag` — needs runbook
- `[P3] disk-io-high` — needs runbook

---

## Quick Reference Card

### Runbook Checklist
```
□ Has Overview with metadata (alert, severity, owner)
□ Has Symptoms section
□ Has Impact Assessment
□ Has numbered Diagnostic Steps with commands
□ Has Fix Steps with verification after each
□ Has Escalation with specific contacts
□ Has Post-Actions checklist
□ Uses kebab-case filename (problem, not solution)
□ Last Updated date is current
□ Has been drilled within cycle
```

---

## References

- [PagerDuty Runbook Authoring Guide](https://www.pagerduty.com/) — Industry best practices for runbook writing
- [Google SRE — Managing Incidents](https://sre.google/sre-book/managing-incidents/) — Incident management context
- [Incident.io — Runbook Best Practices](https://incident.io/) — Modern runbook patterns

---

**Related Standards:**
- [Alerting Standards](alerting-standards.md) — Alert design and runbook linking requirements
- [Postmortem Standards](postmortem-standards.md) — Post-incident review and action items
- [Logging Standards](logging-standards.md) — Structured logging for diagnostics
- [Observability Standards](observability-standards.md) — Monitoring and dashboards

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Template, types, validity, drills, integration |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
