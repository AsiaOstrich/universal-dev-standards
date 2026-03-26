---
scope: universal
description: |
  Guide for creating and managing Architecture Decision Records (ADR).
  Use when: architecture decisions, technology choices, design trade-offs.
  Keywords: ADR, architecture decision, decision record, trade-off, 架構決策, 決策記錄.
---

# ADR Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/adr-assistant/guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All software projects
**Scope**: universal
**Type**: Standard-backed Skill (core: adr-standards.md)

---

## Purpose

Technical decisions made during development are often lost — buried in Slack threads, meeting notes, or forgotten entirely. When new team members join or when revisiting a system months later, the question "why was it done this way?" has no clear answer.

Architecture Decision Records solve this by creating a lightweight, version-controlled log of significant decisions:

```
Decision Made → ADR Written → Stored in Repo → Available Forever
```

This skill integrates ADRs into the UDS workflow:

```
/brainstorm → /sdd → /adr → Implementation
                ▲       ▲
            Existing   (NEW)
```

---

## Detailed Workflow

### Phase 1: CAPTURE — Define the Decision Context

Before analyzing options, clearly articulate what needs to be decided and why.

**Steps:**

1. **Identify the trigger** — What event or requirement prompted this decision?
   - New feature requirement
   - Performance bottleneck
   - Technology end-of-life
   - Scaling challenge

2. **Define constraints** — What limits the solution space?
   - Budget / timeline
   - Team skills and capacity
   - Existing system compatibility
   - Regulatory requirements

3. **List decision drivers** — What criteria matter most?
   - Performance vs. development speed
   - Consistency vs. flexibility
   - Cost vs. capability

**Example:**

```markdown
## Context

Our API response times have degraded to 2s p95 as the user base grew
from 10K to 100K. The current monolithic architecture processes all
requests synchronously. We need to decide how to address this before
the next growth milestone (500K users, Q3 2026).

## Decision Drivers

- Must reduce p95 latency to < 500ms
- Team has strong experience in Python, limited in Go
- Budget for infrastructure is capped at $5K/month
- Must be implementable within 6 weeks
```

---

### Phase 2: ANALYZE — Evaluate Options

Explore at least 2 options. For each option, document:

| Aspect | What to capture |
|--------|----------------|
| **Description** | What does this option involve? |
| **Pros** | Benefits and advantages |
| **Cons** | Drawbacks and risks |
| **Cost** | Implementation effort and ongoing cost |
| **Risk** | What could go wrong? |

**Comparison matrix template:**

```markdown
| Criteria | Option 1: Cache | Option 2: CQRS | Option 3: Microservices |
|----------|-----------------|----------------|------------------------|
| Latency improvement | Moderate | High | High |
| Implementation effort | Low (2 weeks) | Medium (4 weeks) | High (8+ weeks) |
| Team familiarity | High | Medium | Low |
| Operational complexity | Low | Medium | High |
| Future scalability | Limited | Good | Excellent |
```

---

### Phase 3: DECIDE — Select and Justify

Choose the option that best satisfies the decision drivers. The justification should:

1. **Reference the drivers** — Show how the chosen option satisfies the criteria
2. **Acknowledge trade-offs** — Be honest about what you're giving up
3. **Explain why alternatives were rejected** — Help future readers understand the reasoning

**Example:**

```markdown
## Decision Outcome

Chosen option: **Option 2: CQRS**, because it provides the best
balance of latency improvement and implementation feasibility.

- Meets the < 500ms p95 target (estimated 200ms with read replicas)
- Implementable within 4 weeks by the existing team
- Option 1 (caching) was rejected: insufficient for 500K users
- Option 3 (microservices) was rejected: exceeds 6-week timeline
```

---

### Phase 4: RECORD — Write the ADR File

Generate the ADR following the standard template from `core/adr-standards.md`.

**File naming:** `ADR-NNN-short-description.md`

**Determining the next number:**
1. Check `docs/adr/` for existing ADRs
2. Use the next sequential number
3. If no ADRs exist, start with `ADR-001`

---

### Phase 5: LINK — Cross-Reference

Create bidirectional links between the ADR and related artifacts:

| From | To | How |
|------|----|-----|
| ADR | SPEC | Add SPEC-ID to ADR's `Technical Story` field |
| SPEC | ADR | Add ADR reference in SPEC's Technical Design section |
| ADR | Code | Add ADR reference in code comments: `// See ADR-003` |
| Code | ADR | Add code file paths in ADR's Links section |
| ADR | PR | Reference ADR in PR description |
| ADR | ADR | Link related or superseding ADRs |

---

## Examples

### Example 1: Database Selection

```markdown
# ADR-001: Use PostgreSQL for Primary Database

- **Status**: Accepted
- **Date**: 2026-03-15
- **Deciders**: Backend team
- **Technical Story**: SPEC-CORE-001

## Context

We are starting a new e-commerce platform and need to select a primary
database. The system will handle product catalog, user accounts, orders,
and inventory with an expected initial load of 10K concurrent users.

## Decision Drivers

- ACID compliance for financial transactions
- JSON support for flexible product attributes
- Team experience and hiring pool
- Managed service availability on AWS

## Considered Options

1. PostgreSQL
2. MySQL 8.0
3. MongoDB

## Decision Outcome

Chosen option: **PostgreSQL**, because it provides the best combination
of ACID compliance, JSON support (JSONB), and team familiarity.

### Consequences

**Good:**
- Native JSONB support eliminates need for separate document store
- Strong ecosystem (PostGIS, full-text search, extensions)
- Available as managed service (RDS, Aurora)

**Bad:**
- Slightly higher memory usage than MySQL for simple queries
- Team needs training on PostgreSQL-specific features (CTEs, window functions)

## Links

- [SPEC-CORE-001](../specs/SPEC-CORE-001-platform-architecture.md)
```

### Example 2: Superseding a Decision

```markdown
# ADR-005: Migrate from REST to GraphQL for Mobile API

- **Status**: Accepted
- **Date**: 2026-06-01
- **Deciders**: Mobile team, Backend team
- **Technical Story**: SPEC-MOBILE-003
- **Supersedes**: [ADR-002](ADR-002-rest-api-design.md)

## Context

ADR-002 established REST as our API standard. After 6 months of mobile
development, we're experiencing significant over-fetching and
under-fetching issues, requiring multiple round-trips per screen.

[... rest of ADR ...]
```

---

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Writing ADR weeks after the decision | Context and alternatives are forgotten | Write during or immediately after the decision |
| Only listing the chosen option | No record of what was rejected and why | Always include at least 2 alternatives |
| Editing accepted ADRs | Historical context is lost | Create a new ADR that supersedes the old one |
| Making ADRs too detailed | Nobody reads them | Keep to 1-2 pages; link to detailed docs |
| Not linking to code | ADR becomes disconnected from implementation | Add code references in Links section |

---

## FAQ

**Q: How is an ADR different from an SDD spec?**
A: An SDD spec defines *what* to build and *how*. An ADR records *why* a particular approach was chosen over alternatives. They complement each other — an SDD may reference multiple ADRs.

**Q: Should every technical decision have an ADR?**
A: No. Only significant decisions with long-term impact. Use the "6-month rule": if someone might ask "why?" in 6 months, write an ADR.

**Q: Can an ADR be rejected?**
A: Yes. If a proposed ADR is not accepted, it can simply be deleted. Only accepted decisions need to be preserved.

**Q: Who should write ADRs?**
A: Anyone involved in the decision. In practice, the tech lead or architect usually drafts it, and the team reviews.

---

## Reference

- Core Standard: [adr-standards.md](../../core/adr-standards.md)
- SKILL: [SKILL.md](./SKILL.md)
