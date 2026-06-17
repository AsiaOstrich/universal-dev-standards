# Product Requirements Document Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/prd-standards.ai.yaml`
> **Spec**: XSPEC-069 (cross-project/specs/XSPEC-069-uds-product-layer-pack.md)

## Overview

This standard defines the structure, content requirements, and lifecycle
governance for **Product Requirements Documents (PRDs)**. It covers the five
mandatory PRD sections, the bridge from PRD requirements to traceable user
stories, and the revision policy for changes after kickoff. It ensures product
intent is clearly communicable to engineering, design, and stakeholders with
measurable success criteria.

It is part of the **product-layer pack** (XSPEC-069). The PRD is the *upstream*
of engineering requirements: PRD → user story → requirement. It bridges to
`requirement-engineering` (the engineering view of requirements) and consumes
`product-metrics-standards` for success metrics.

> **Scope.** This standard defines the *PRD artifact* (sections, traceability,
> revision policy). It is a product-layer edge of UDS (per XSPEC-070
> `standard-admission-criteria`) — the engineering requirement view stays in
> `requirement-engineering`.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | PRD five sections (Problem, Persona, Success Metrics, Scope, Constraints) | MUST |
| REQ-002 | PRD → user-story bridge (INVEST, traceable to a success metric) | MUST |
| REQ-003 | Revision policy (formal change process after kickoff) | MUST |

### REQ-001 — PRD Five Sections

Every PRD MUST contain five sections in order: (1) **Problem Statement** — the
user pain/opportunity in observable terms, with quantitative data where
available; (2) **Target User / Persona** — who is affected, referencing named
personas (≥1 primary, ≥1 secondary) with role, context, and goals;
(3) **Success Metrics** — 2–4 measurable outcomes, each with current baseline,
target value, and measurement method; (4) **Scope In / Out** — explicit
inclusions and exclusions (out-of-scope may reference future PRDs);
(5) **Constraints** — technical, regulatory, time, budget, or dependency bounds.

### REQ-002 — PRD to User Story Bridge

Each PRD requirement MUST be broken into one or more user stories following the
INVEST criteria from `requirement-engineering`. Every story derived from a PRD
MUST be traceable to at least one PRD success metric; stories that cannot be
linked MUST be flagged for PM review before entering the backlog. The
traceability link (PRD section ID → user-story ID → success metric) MUST be
maintained in the backlog tool or as a matrix in the PRD.

### REQ-003 — Revision Policy

PRD changes requested after the development kickoff meeting MUST follow a formal
process: (1) the proposed change is documented with rationale and impact
assessment; (2) stakeholder sign-off is obtained from PM, Tech Lead, and Design
Lead; (3) scope impact is assessed — added scope must move a corresponding item
out of scope or adjust the timeline; (4) version history is updated with date,
author, change summary, and approver. PRDs modified after kickoff without version
history are non-compliant. Minor editorial changes (typos, formatting) are exempt
from sign-off.

## Anti-Patterns

- PRD without measurable success metrics (qualitative goals only, e.g. "improve UX").
- Scope creep without a change log: adding requirements mid-sprint without documented approval.
- Solution-first PRD: implementation details before the user problem is established.
- No explicit out-of-scope section, causing boundary disputes during development.
- Success metrics defined after development starts, making them unverifiable.

## Integration with Existing Standards

- **`requirement-engineering`** — PRD requirements decompose into INVEST user stories.
- **`product-metrics-standards`** — PRD success metrics draw from the metric hierarchy.
- **`user-story-mapping`** — PRD scope is realized as a story map and MVP slice.
- **`acceptance-criteria-traceability`** — stories carry AC traceable back to PRD metrics.

## Related Specs

- XSPEC-069 — UDS product-layer pack (this standard's source)
- XSPEC-070 — Governance meta-standards (`standard-admission-criteria` edge review)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~003: five sections, PRD→story bridge, revision policy (XSPEC-069) |
