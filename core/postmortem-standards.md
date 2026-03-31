# Postmortem Standards (Blameless Post-Incident Review)

> **Language**: English | [繁體中文](../locales/zh-TW/core/postmortem-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects with production services
**Scope**: universal
**Industry Standards**: Google SRE, Etsy Debriefing, CMMI Level 3
**References**: [sre.google](https://sre.google/), [Etsy Code as Craft](https://www.etsy.com/codeascraft)

---

## Overview

This document defines standards for conducting blameless postmortems after production incidents. A postmortem is a structured process for analyzing what happened, why it happened, and how to prevent recurrence — without assigning individual blame.

For incident response workflow (detection → triage → mitigation → resolution), see the [Incident Response Assistant](../skills/incident-response-assistant/SKILL.md).

---

## Trigger Conditions

### Mandatory

The following conditions MUST trigger a full postmortem:

| Condition | Rationale |
|-----------|-----------|
| **SEV-1 incident** (always) | Any complete service outage requires thorough analysis |
| **SEV-2 incident lasting > 1 hour** | Extended partial outage indicates systemic issues |
| **Any incident involving data loss** | Data loss has irreversible consequences |
| **Any incident causing SLA breach** | SLA violations have contractual implications |
| **Any incident involving security breach** | Security incidents require detailed forensic analysis |

### Recommended

The following conditions SHOULD trigger a postmortem (full or simplified):

| Condition | Rationale |
|-----------|-----------|
| SEV-2 incident lasting < 1 hour | Short but significant; may reveal systemic risks |
| SEV-3 recurring incident (2+ times in 30 days with same root cause) | Repetition indicates unresolved systemic issue |
| Near-miss with large potential impact | Learning opportunity without actual damage |
| Team member request | Anyone should be able to request a learning review |

### Exempt

Postmortem MAY be skipped when:

| Condition | Rationale |
|-----------|-----------|
| SEV-3/SEV-4 first occurrence with clear root cause | Simple fix, low learning value |
| Existing postmortem covers same root cause with active action items | Avoid duplicate analysis |
| Purely external factor (third-party outage) with no internal action possible | Document in incident log only |

---

## Blameless Principles

### Core Beliefs

| Principle | Description |
|-----------|-------------|
| **Humans make errors** | Mistakes are a natural product of complex systems, not personal defects |
| **Focus on systems** | Analyze how the system allowed the error, not who made it |
| **Psychological safety** | Participants can share openly without fear of punishment |
| **Learning-oriented** | The goal is learning and improvement, not accountability |
| **Behavior description** | Use "X happened" language, not "person Y did X" |

### Language Guidelines

Write postmortems using system-focused language:

| ✅ Good (System-focused) | ❌ Bad (Blame-focused) |
|--------------------------|----------------------|
| "The deployment contained an uncovered edge case" | "Engineer A deployed buggy code" |
| "The monitoring system did not detect the anomaly within 5 minutes" | "The on-call engineer ignored the alert" |
| "The code review process did not catch this pattern" | "The reviewer didn't review carefully" |
| "The runbook lacked steps for this failure mode" | "The operator didn't know what to do" |
| "The test suite did not cover this scenario" | "Nobody wrote tests for this" |

### Psychological Safety

To maintain a blameless culture:
- Facilitator explicitly states blameless principles at the start of every postmortem meeting
- If blame-oriented language occurs, the facilitator redirects to system-focused framing
- Postmortem documents are reviewed for blameless language before publication
- Management commits to no punitive action based on postmortem findings

---

## Postmortem Process

### Timeline (Incident Resolution → Final Report)

| Milestone | Deadline | Responsible | Activity |
|-----------|----------|-------------|----------|
| **Collect timeline and facts** | Within 24 hours of resolution | Incident Commander | Gather logs, metrics, chat transcripts, decisions made |
| **Write postmortem draft** | Within 48 hours of resolution | Incident Commander | Draft using template, include preliminary root cause |
| **Hold postmortem meeting** | Within 3 business days of draft | All involved parties | Review timeline, perform RCA, agree on action items |
| **Finalize and publish** | Within 24 hours of meeting | Incident Commander | Incorporate meeting feedback, publish to knowledge base |
| **Track action items** | Ongoing | Individual action owners | Execute, report status, verify effectiveness |

### Meeting Facilitation Guide

Recommended meeting duration: **60-90 minutes**

| Segment | Duration | Content | Facilitator Actions |
|---------|----------|---------|-------------------|
| **Opening** | 5 min | Restate blameless principles; explain meeting purpose | Read blameless beliefs aloud |
| **Timeline Review** | 15 min | Walk through incident timeline step by step | Ask for corrections and additions |
| **Impact Assessment** | 10 min | Confirm affected users, revenue impact, SLO impact | Quantify with data, not estimates |
| **Root Cause Analysis** | 20 min | Use structured RCA method (see below) | Guide analysis, redirect blame |
| **Improvement Ideas** | 15 min | Propose action items; assign owners and due dates | Ensure each item is SMART |
| **Summary** | 5 min | Confirm key learnings and next steps | Read back action items |

---

## Root Cause Analysis Methods

### Method Selection Guide

| Method | Best For | Steps |
|--------|----------|-------|
| **5 Whys** | Linear causation chains, single root cause | Ask "why?" iteratively until systemic cause found |
| **Ishikawa (Fishbone)** | Multi-factor problems, need categorized thinking | Categorize causes by People, Process, Tools, Environment |
| **Fault Tree Analysis (FTA)** | Complex systems, multiple failure paths | Decompose top event into AND/OR logic tree |
| **Timeline Analysis** | Time-dependent issues, multiple participants | Arrange all events and decisions chronologically |
| **Change Analysis** | Recent changes suspected as cause | Compare before/after state of changed components |

### 5 Whys Example

```
1. Why did the service go down?
   → Database connection pool exhausted

2. Why did the connection pool exhaust?
   → Slow queries holding connections

3. Why were there slow queries?
   → New feature introduced a full table scan

4. Why didn't code review catch it?
   → No automated query performance analysis in CI

5. Why no automated analysis?
   → ROOT CAUSE: CI/CD pipeline lacks SQL performance analysis step
```

### Root Cause vs Trigger vs Contributing Factor

| Type | Definition | Example |
|------|-----------|---------|
| **Root Cause** | If removed, the incident would not have occurred | CI/CD lacks SQL performance analysis |
| **Trigger** | The event that directly initiated the incident | New feature deployment |
| **Contributing Factor** | Worsened the impact but was not the root cause | Monitoring alert delayed by 10 minutes |

---

## Postmortem Template

### Full Template

```markdown
# Postmortem: [Incident Title]

## Summary
| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Severity | SEV-N |
| Duration | Xh Ym |
| Incident Commander | @name |
| Status | Draft / Final |

## Impact Assessment
- **Affected users**: N (X% of total users)
- **Affected features**: [feature list]
- **Revenue impact**: $N (if applicable)
- **SLA impact**: Breached? Remaining Error Budget?
- **Data impact**: Any data loss or corruption?

## Timeline
| Time (UTC) | Event | Detection Method |
|------------|-------|-----------------|
| HH:MM | [Event description] | Alert / User report / Monitoring |

## Root Cause Analysis
### Method: [5 Whys / Ishikawa / FTA / Timeline / Change]
[Analysis process and findings]

### Classification
- **Root Cause**: [description]
- **Trigger**: [description]
- **Contributing Factors**: [description 1], [description 2]

## Detection and Response Review
| Aspect | Performance | Rating | Improvement Area |
|--------|------------|--------|-----------------|
| Detection speed | Alert fired in X min | ⭐⭐⭐ | [if any] |
| Response speed | IC assigned in X min | ⭐⭐⭐ | [if any] |
| Mitigation efficiency | Mitigation in Y min | ⭐⭐ | [if any] |
| Communication quality | Stakeholders notified in X min | ⭐⭐⭐ | [if any] |

## What Went Well
1. [Commendable response behavior]
2. [Effective tool or process]

## What Needs Improvement
1. [Process gap]
2. [Tool deficiency]

## Action Items
| ID | Action | Type | Owner | Due Date | Priority | Status |
|----|--------|------|-------|----------|----------|--------|
| AI-1 | [Description] | Prevent/Detect/Mitigate/Process | @name | YYYY-MM-DD | P0 | Open |

## Related Documents
- Incident ticket: [link]
- Related postmortems: [links]
- Updated runbooks: [links]

## Review Record
| Date | Reviewer | Result |
|------|----------|--------|
| YYYY-MM-DD | @name | Approved |
```

### Simplified Template

For lower-severity or recurring incidents that don't warrant a full postmortem:

```markdown
# Simplified Postmortem: [Incident Title]

- **Date**: YYYY-MM-DD | **Severity**: SEV-N | **Duration**: Xh Ym
- **Root Cause**: [One-line description]
- **Fix**: [One-line description of the fix applied]
- **Action Items**:
  - [ ] [Action] — @owner — YYYY-MM-DD
- **Related**: [Link to full postmortem if exists]
```

---

## Action Items Lifecycle

### Classification (Prevent / Detect / Mitigate / Process)

| Type | Purpose | Example |
|------|---------|---------|
| **Prevent** | Prevent the root cause from recurring | Add SQL performance CI check |
| **Detect** | Detect the problem earlier next time | Add connection pool utilization alert |
| **Mitigate** | Reduce impact scope and duration | Implement automatic circuit breaker |
| **Process** | Improve response procedures | Update on-call handoff checklist |

### Status Tracking

```
Open ──► In Progress ──► Done ──► Verified
               │
               └─► Blocked ──────────────►
```

| Status | Description |
|--------|-------------|
| **Open** | Identified, not yet started |
| **In Progress** | Work underway |
| **Done** | Fix implemented |
| **Verified** | Confirmed effective (e.g., tested, survived next incident) |
| **Blocked** | Cannot proceed; dependency or decision needed |

### Completion Rate Reporting

Generate periodic reports on action item completion:

| Metric | Target |
|--------|--------|
| Overall completion rate (within 90 days) | > 80% |
| P0 action items completed within 14 days | 100% |
| Average completion time | < 30 days |
| Overdue action items | Minimize |

### Overdue Handling

| Days Overdue | Action |
|-------------|--------|
| **7 days** | Notify the action owner |
| **14 days** | Notify the owner's manager |
| **30 days** | Escalate to next retrospective for discussion |

---

## Organizational Learning

### Incident Trend Analysis

Conduct quarterly incident trend analysis across these 5 dimensions:

| Dimension | What to Analyze | Action |
|-----------|----------------|--------|
| **Root cause type distribution** | Code defect, config error, capacity, external dependency | Invest in most common category |
| **Service distribution** | Which services have most incidents | Prioritize reliability investment |
| **MTTR trend** | Is Mean Time To Recovery improving? | Track quarter-over-quarter |
| **MTTD trend** | Is Mean Time To Detection improving? | Evaluate monitoring effectiveness |
| **Recurring root cause ratio** | Are the same root causes appearing? | Review action item effectiveness |

### Learning-to-Standards Pipeline

When trend analysis reveals systemic issues:

| Finding | Output |
|---------|--------|
| Repeated code defect pattern | Update Core Standards (e.g., add new checkin-standards check) |
| New failure mode encountered | Create new Runbook (see [Runbook Standards](runbook-standards.md)) |
| Monitoring gap identified | Modify alert rules (see [Alerting Standards](alerting-standards.md)) |
| Process gap identified | Discuss in next Retrospective (see [Retrospective Standards](retrospective-standards.md)) |

### Postmortem Knowledge Base

Maintain a searchable knowledge base of all postmortems:

```
docs/postmortems/
├── README.md                    # Index by date, service, and root cause
├── 2026-03-15-api-outage.md
├── 2026-03-20-db-pool-exhaustion.md
└── 2026-03-28-payment-timeout.md
```

**Index should support:**
- Chronological listing (most recent first)
- Filtering by service name
- Filtering by root cause category
- Search by keyword

---

## Integration Points

### Incident Response Flow

```
Incident occurs
    │
    ▼
Incident Response (Detect → Triage → Mitigate → Resolve)
    │
    ▼ Incident resolved
    │
Postmortem Standards (Analyze → Document → Track → Learn)
    │
    ▼ Action Items
    │
    ├── Runbook Standards (update/create runbooks)
    ├── Alerting Standards (improve alert rules)
    └── Retrospective Standards (process improvement input)
```

### Runbook Updates

After a postmortem, evaluate:
- Does the relevant runbook need updating? → Update it
- Is this a new failure mode without a runbook? → Create one
- Link the postmortem to the runbook's version history

### Alert Improvements

After a postmortem, evaluate:
- Were alerts timely and actionable? → If not, update alert rules
- Was the severity appropriate? → Adjust if needed
- Were there missing alerts? → Create new ones

---

## Quick Reference Card

### Should I Write a Postmortem?
```
SEV-1?                    → Yes (always)
SEV-2 and > 1 hour?      → Yes
Data loss?                → Yes
SLA breach?               → Yes
Security breach?          → Yes
SEV-2 and < 1 hour?      → Recommended
SEV-3 recurring?          → Recommended (simplified)
SEV-3/4 first time?      → No (document in incident log)
```

### Postmortem Timeline
```
Incident resolved → 24h → Collect facts
                  → 48h → Write draft
                  → +3 biz days → Hold meeting
                  → +24h → Finalize & publish
                  → ongoing → Track action items
```

---

## References

- [Google SRE — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) — Blameless postmortem philosophy
- [Google SRE — Example Postmortem](https://sre.google/sre-book/example-postmortem/) — Real-world postmortem template
- [Etsy — Blameless PostMortems](https://www.etsy.com/codeascraft) — Etsy's approach to blameless culture
- [John Allspaw — Blameless Post-Mortems](https://www.etsy.com/codeascraft/blameless-postmortems/) — Foundational essay on blamelessness

---

**Related Standards:**
- [Alerting Standards](alerting-standards.md) — Alert design and severity
- [Runbook Standards](runbook-standards.md) — Runbook creation and maintenance
- [Observability Standards](observability-standards.md) — Monitoring and detection
- [Retrospective Standards](retrospective-standards.md) — Periodic process improvement

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Trigger conditions, blameless principles, RCA methods, templates, action items lifecycle, organizational learning |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
