# User Story Mapping Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/user-story-mapping.ai.yaml`
> **Spec**: XSPEC-069 (cross-project/specs/XSPEC-069-uds-product-layer-pack.md)

## Overview

This standard defines how teams construct and use **story maps** to plan product
releases. It covers the three-layer story-map structure (Backbone activities,
Walking Skeleton sub-tasks, Detail Stories), the MVP horizontal-slice rule,
INVEST compliance per story, and Given/When/Then acceptance criteria tied to
measurable product metrics. It prevents incomplete MVPs and ensures every story is
testable and traceable.

It is part of the **product-layer pack** (XSPEC-069), sitting between
`prd-standards` (upstream intent) and `requirement-engineering` (downstream INVEST
stories), with acceptance criteria tied to `product-metrics-standards`.

> **Scope.** This standard defines the *story-map structure and MVP-slicing
> discipline*. Concrete planning tooling (Miro/Jira) is an adoption choice.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Story-map three layers (backbone, walking skeleton, detail stories) | MUST |
| REQ-002 | MVP horizontal-slice rule (no vertical-slice MVP) | MUST |
| REQ-003 | Story INVEST compliance | MUST |
| REQ-004 | Acceptance-criteria format (Given/When/Then, metric-tied) | MUST |

### REQ-001 — Story Map Three Layers

Every story map MUST be structured in three horizontal layers: (1) **Backbone**
(top row) — user activities at the highest abstraction representing the complete
end-to-end journey, each a verb phrase from the user's perspective; the backbone
must represent the full journey, not only implemented features. (2) **Walking
Skeleton** (middle row) — the minimum sub-tasks to make each backbone activity
functional, organized vertically under each backbone item. (3) **Detail Stories**
(bottom rows) — specific stories for variations, enhancements, and edge cases,
prioritized vertically within each column (higher = higher priority).

### REQ-002 — MVP Horizontal Slice Rule

The MVP release boundary MUST be a **horizontal slice** across the story map,
covering all backbone activities at the walking-skeleton level. An MVP covering
only a subset of backbone activities (a **vertical slice** that perfects one
activity while others are absent or non-functional) is PROHIBITED, because it
cannot be evaluated end-to-end by users. **Exception**: single-activity products
(e.g. a focused utility) are exempt if the full value proposition is delivered by
that one activity; exceptions MUST be documented with rationale in the story map.

### REQ-003 — Story INVEST Compliance

Every story in the map MUST comply with the INVEST criteria from
`requirement-engineering`: **I**ndependent, **N**egotiable, **V**aluable,
**E**stimable, **S**mall (fits within one sprint at most; split if larger),
**T**estable (objectively verifiable acceptance criteria exist). Stories that fail
INVEST must be refined before entering a sprint; the assessment MUST be performed
during backlog-refinement sessions.

### REQ-004 — Acceptance Criteria Format

Every story MUST have at least one acceptance criterion in **Given/When/Then**
format, tied to a measurable product outcome from the `product-metrics-standards`
hierarchy where applicable. Stories with criteria that cannot be objectively
verified (e.g. "the page looks good") are non-compliant. Acceptance criteria MUST
be written before development begins and MUST NOT be modified after it starts
without PM and dev-lead sign-off (same revision policy as PRD changes).

## Anti-Patterns

- Vertical MVP slicing: perfecting one activity while other backbone activities are absent.
- Stories without acceptance criteria entering development (no clear definition of done).
- Backbone activities mapped to system components instead of actual user goals.
- Story map used only for planning then discarded, not kept as a living tool.
- Detail stories added directly without backbone and walking-skeleton context.

## Integration with Existing Standards

- **`prd-standards`** — PRD scope is realized as a story map and MVP slice.
- **`requirement-engineering`** — stories follow the INVEST criteria defined there.
- **`product-metrics-standards`** — acceptance criteria tie to a North Star driver.
- **`acceptance-criteria-traceability`** — GWT criteria provide the AC traceability spine.

## Related Specs

- XSPEC-069 — UDS product-layer pack (this standard's source)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~004: three-layer map, MVP horizontal-slice rule, INVEST compliance, GWT acceptance criteria (XSPEC-069) |
