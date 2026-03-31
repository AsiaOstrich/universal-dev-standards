# Knowledge Transfer Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/knowledge-transfer-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**References**: [Atlassian Knowledge Transfer](https://www.atlassian.com/work-management/knowledge-sharing), [Google re:Work](https://rework.withgoogle.com/)

---

## Overview

This document defines knowledge transfer standards covering Onboarding, Handoff, Bus Factor assessment, and Code Tour mechanisms. The goal is to ensure critical knowledge does not disappear when team members leave or transition between roles.

---

## Onboarding Roadmap

A structured 30-day onboarding process helps new team members become productive quickly.

### 4-Week Roadmap

| Week | Topic | Goal | Deliverable |
|------|-------|------|-------------|
| **Week 1** | Environment & Culture | Complete development environment setup; understand team norms and conventions | Successfully build and run the project |
| **Week 2** | Architecture & Code | Understand system architecture and critical paths | Complete Code Tour |
| **Week 3** | Process & Tools | Understand CI/CD, deployment, and monitoring workflows | Complete first PR |
| **Week 4** | Independent Contribution | Independently complete a small task | Pass Buddy evaluation |

### Onboarding Checklist

Every new team member should complete the following checklist on their first day and throughout their first week:

| Category | Items |
|----------|-------|
| **Account Access** | Git repository, CI/CD platform, monitoring tools, cloud console, communication tools (Slack/Teams) |
| **Environment Setup** | Development environment, IDE configuration, VPN access, database access, local build verification |
| **Documentation** | README, architecture docs, API docs, CLAUDE.md or equivalent AI context file |
| **Meetings** | 1:1 with Buddy, team introduction, architecture overview session |
| **First Tasks** | Good First Issue assigned, Code Tour completed, first small PR submitted |

---

## Handoff Process

When a team member is leaving or transitioning, use this structured handoff process to prevent knowledge loss.

### Handoff Checklist

| Item | Description | Timeline |
|------|-------------|----------|
| **Ownership List** | List all modules, services, and processes the person is responsible for | 4 weeks before departure |
| **Tacit Knowledge Recording** | Document all "only I know" operations, tricks, and pitfalls using the Knowledge Record Format below | 3 weeks before departure |
| **WIP Handover** | Transfer all work-in-progress tasks, open PRs, and incident tracking items | 2 weeks before departure |
| **Buddy Pairing** | Assign a successor and conduct pair programming sessions for complex areas | 2 weeks before departure |
| **Account & Permission Transfer** | Transfer owner permissions, rotate API keys, update access controls | 1 week before departure |
| **Runbook Update** | Review and update all related runbooks to ensure they are current and complete | 1 week before departure |

### Knowledge Record Format

When documenting tacit knowledge, each record SHOULD contain the following 5 fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Topic** | What knowledge is being captured | "Payment gateway retry logic" |
| **Context** | Under what circumstances this knowledge is needed | "When payment fails with timeout error" |
| **Steps** | Specific procedures to follow | "1. Check gateway status page 2. Review retry queue 3. ..." |
| **Pitfalls** | Common mistakes and things to watch out for | "Never retry 4xx errors; only retry on 5xx or timeout" |
| **Resources** | Links to code, documentation, runbooks | "See `src/payment/retry.js`, Runbook: payment-recovery" |

---

## Bus Factor Assessment

Bus Factor measures how many team members need to be "hit by a bus" (leave unexpectedly) before critical knowledge is lost. A Bus Factor of 1 means a single departure can cripple a system area.

### Assessment Metrics

For each critical domain or system area, evaluate the following 3 metrics:

| Metric | Definition | Risk Level |
|--------|-----------|------------|
| **Number of Knowledgeable People** | Count of people who can independently handle this area | 1 person = **High** risk, 2 people = **Medium**, 3+ people = **Low** |
| **Documentation Coverage** | Percentage of the area covered by written documentation | < 30% = **High** risk, 30-70% = **Medium**, > 70% = **Low** |
| **Last Knowledge Sharing** | How recently someone learned about this area | > 6 months = **High** risk, 3-6 months = **Medium**, < 3 months = **Low** |

### Knowledge Diffusion Strategies

When a Bus Factor = 1 area is identified, use one or more of these strategies to spread knowledge:

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Pair Programming** | Expert and learner work together on real tasks | Complex logic, special techniques |
| **Tech Talk** | Expert presents to the team in a structured session | Architecture decisions, design rationale |
| **Documentation** | Convert tacit knowledge into written documents or runbooks | Operational procedures, deployment steps |
| **Code Review Rotation** | Rotate reviewers so different people review different areas | Code understanding, catching knowledge silos |
| **On-call Rotation** | Rotate on-call duty across different services | Operations knowledge, incident response |

---

## Code Tour

A Code Tour provides structured navigation routes through the codebase, helping newcomers understand the system without reading every file.

### Tour Routes

Every codebase SHOULD define at least the following tour routes:

| Route | Covers | Target Audience |
|-------|--------|-----------------|
| **Quick Start** | Entry points, main configuration, startup flow | All newcomers |
| **Request Flow** | Complete path of a request from entry to response | Backend developers |
| **Data Flow** | Path of data from creation to storage to retrieval | Data-related developers |
| **Deploy Flow** | Complete path from PR to production | Anyone who needs to deploy |
| **Key Decisions** | Important architecture decisions and their ADRs | Anyone who needs to understand "why" |

### Code Tour Maintenance

When code changes occur, evaluate whether the Code Tour needs updating:

| Change Type | Action | Rationale |
|-------------|--------|-----------|
| Entry point or route change | **MUST** update tour | Tour references will be broken or misleading |
| Internal refactoring (interfaces unchanged) | **No update needed** | Tour describes flow, not implementation details |
| New major feature added | **SHOULD** add new tour route | New feature may warrant its own guided path |

---

## References

- [Atlassian Knowledge Transfer Guide](https://www.atlassian.com/work-management/knowledge-sharing) — Best practices for knowledge sharing
- [Google re:Work — Onboarding](https://rework.withgoogle.com/guides/hiring-shape-the-candidate-experience/steps/make-onboarding-a-great-experience/) — Evidence-based onboarding practices
- [Bus Factor on Wikipedia](https://en.wikipedia.org/wiki/Bus_factor) — Concept definition and mitigation

---

**Related Standards:**
- [Documentation Lifecycle](documentation-lifecycle.md) — Document maintenance and review cycles
- [Runbook Standards](runbook-standards.md) — Operational runbook format and requirements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Onboarding Roadmap, Handoff Process, Bus Factor Assessment, Code Tour |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
