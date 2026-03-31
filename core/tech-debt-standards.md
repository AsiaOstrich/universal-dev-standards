# Tech Debt Management Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/tech-debt-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: Martin Fowler's Technical Debt Quadrant, Ward Cunningham's Debt Metaphor
**References**: [martinfowler.com/bliki/TechnicalDebt](https://martinfowler.com/bliki/TechnicalDebt.html)

---

## Overview

Technical debt represents the implied cost of future rework caused by choosing an expedient solution now instead of a better approach that would take longer. This standard defines how to classify, register, prioritize, budget, measure, and track technical debt throughout the software development lifecycle.

---

## 1. Tech Debt Types

All technical debt falls into one of six categories:

| Type | Description | Examples |
|------|-------------|----------|
| **Design Debt** | Architectural shortcuts or suboptimal design decisions | Missing abstractions, tight coupling, broken layering |
| **Code Debt** | Code quality issues that increase maintenance burden | Duplicated code, long methods, magic numbers, dead code |
| **Test Debt** | Insufficient or low-quality test coverage | Missing unit tests, flaky tests, no integration tests |
| **Documentation Debt** | Missing, outdated, or inaccurate documentation | Undocumented APIs, stale README, missing architecture docs |
| **Dependency Debt** | Outdated, vulnerable, or unnecessary dependencies | Unpatched libraries, deprecated frameworks, unused packages |
| **Infrastructure Debt** | Suboptimal build, deployment, or operational tooling | Manual deployments, missing monitoring, outdated CI/CD |

### Deliberate vs Inadvertent Debt

Technical debt can be acquired through two distinct modes:

| Mode | Description | Example |
|------|-------------|---------|
| **Deliberate** | Conscious decision to take a shortcut with awareness of consequences | "We know this isn't the right abstraction, but we need to ship by Friday" |
| **Inadvertent** | Unintentional debt introduced through lack of knowledge or oversight | "We didn't realize this pattern would cause scaling issues" |

Deliberate debt should always be registered immediately. Inadvertent debt should be registered as soon as it is discovered.

---

## 2. Tech Debt Registry

### Registry Template

Every technical debt item must be recorded in a registry with the following 11 fields:

| # | Field | Description | Example |
|---|-------|-------------|---------|
| 1 | **ID** | Unique identifier using `TD-NNN` format | TD-001 |
| 2 | **Title** | Short descriptive title | "Monolithic auth module needs decomposition" |
| 3 | **Type** | One of the 6 debt types above | Design |
| 4 | **Source** | How the debt was introduced (deliberate/inadvertent) | Deliberate |
| 5 | **Impact** | Business and technical impact description | "Slows feature development by ~2 days per sprint" |
| 6 | **Estimated Cost** | Effort to resolve (story points or person-days) | 8 story points |
| 7 | **Interest** | Ongoing cost of not resolving (see Interest Types) | 1 day/sprint additional debugging |
| 8 | **Priority** | Priority level from the impact matrix (P0-P3) | P1 |
| 9 | **Owner** | Team or individual responsible for resolution | @backend-team |
| 10 | **Created Date** | Date the debt was registered | 2026-01-15 |
| 11 | **Target Resolution Date** | Planned date for resolution | 2026-Q2 |

### Registry Storage Options

The registry can be stored in one of the following locations:

| Option | Best For | Format |
|--------|----------|--------|
| `docs/tech-debt-registry.md` | Small teams, simple tracking | Markdown table |
| Issue tracker (GitHub Issues, Jira) | Larger teams, workflow integration | Tagged issues with `tech-debt` label |
| Dedicated spreadsheet | Non-technical stakeholders | CSV/Excel with the 11 fields |

---

## 3. Budget Allocation

### Budget Ratios by Team State

Teams should allocate a percentage of each sprint's capacity to technical debt reduction based on their current state:

| Team State | Budget | Description |
|------------|--------|-------------|
| **New Projects** (< 6 months) | **10%** | Preventive maintenance; establish good patterns early |
| **Mature Projects** (6+ months, stable) | **15%** | Sustained maintenance; prevent debt accumulation |
| **High-Debt Projects** (critical debt backlog) | **20-30%** | Aggressive paydown; restore development velocity |

### Budget Usage Tracking

Teams must track their tech debt budget usage to ensure accountability:

1. **Sprint Planning**: Reserve the appropriate percentage of capacity for debt work
2. **Sprint Review**: Report actual time spent on debt reduction vs. budget
3. **Sprint Retrospective**: Evaluate whether the budget allocation is appropriate and adjust if needed
4. **Quarterly Report**: Summarize debt trends, budget utilization, and velocity impact

---

## 4. Prioritization Matrix

### 3x3 Impact x Effort Matrix

Use this matrix to determine priority levels based on impact (business/technical severity) and effort (resolution cost):

|  | **Low Effort** | **Medium Effort** | **High Effort** |
|--|---------------|-------------------|-----------------|
| **High Impact** | P0 — Immediate | P1 — Next Sprint | P1 — Next Sprint |
| **Medium Impact** | P1 — Next Sprint | P2 — This Quarter | P2 — This Quarter |
| **Low Impact** | P2 — This Quarter | P3 — Backlog | P3 — Backlog |

### Priority Level Definitions

| Level | Urgency | SLA |
|-------|---------|-----|
| **P0** | Critical — blocks development or poses security risk | Resolve within current sprint |
| **P1** | High — significantly impacts velocity or quality | Resolve within next sprint |
| **P2** | Medium — noticeable but manageable impact | Resolve within the quarter |
| **P3** | Low — minimal current impact, may grow over time | Backlog, review quarterly |

### Interest Types

Technical debt accrues "interest" — the ongoing cost of not resolving it. Track these three interest categories:

| Interest Type | Description | Example |
|---------------|-------------|---------|
| **Time Interest** | Additional development time spent working around the debt | Extra 2 hours per feature due to convoluted data layer |
| **Risk Interest** | Increased probability of bugs, outages, or security incidents | Unpatched dependency with known CVE |
| **Talent Interest** | Negative impact on developer experience, onboarding, and retention | New hires take 2x longer to become productive due to undocumented architecture |

---

## 5. Quantitative Metrics

Track these five key metrics to monitor technical debt health:

| # | Metric | Formula | Target |
|---|--------|---------|--------|
| 1 | **Total Debt Volume** | Count of all open debt items | Decreasing trend |
| 2 | **Debt Ratio** | Open debt items / total backlog items × 100% | < 15% |
| 3 | **Average Age** | Sum of all debt item ages / count of debt items | < 90 days |
| 4 | **Type Distribution** | Count per type / total debt items × 100% | No single type > 40% |
| 5 | **High Priority Ratio** | (P0 + P1 items) / total debt items × 100% | < 20% |

### Reporting Cadence

| Frequency | Report Content |
|-----------|---------------|
| Weekly | New debt items, resolved items, P0/P1 status |
| Monthly | All 5 metrics with trend analysis |
| Quarterly | Full debt review, budget adjustment recommendations |

---

## 6. Commit Marking

### Commit Footer Format

When a commit introduces or resolves technical debt, add a footer line to the commit message:

**Introducing debt:**
```
feat(auth): add temporary session cache bypass

Skipping cache validation for admin sessions to meet launch deadline.

Tech-Debt: TD-042 introduced
```

**Resolving debt:**
```
refactor(auth): implement proper session cache validation

Replace temporary bypass with full cache validation pipeline.

Tech-Debt: TD-042 resolved
```

### Marking Rules

1. Use the format `Tech-Debt: TD-NNN introduced` when a commit knowingly introduces technical debt
2. Use the format `Tech-Debt: TD-NNN resolved` when a commit fully resolves a registered debt item
3. The TD-NNN identifier must match an entry in the tech debt registry
4. A single commit may reference multiple debt items (one per line)
5. Partial resolution should use the commit body to describe progress, but not mark as resolved

---

## References

- [Martin Fowler — Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) — Original debt metaphor explanation
- [Martin Fowler — Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html) — Deliberate vs inadvertent classification
- [Ward Cunningham — Debt Metaphor](http://wiki.c2.com/?WardExplainsDebtMetaphor) — Original concept by Ward Cunningham

---

**Related Standards:**
- [Code Review Checklist](code-review-checklist.md) — Review process for catching new debt
- [Refactoring Standards](refactoring-standards.md) — Techniques for resolving code debt
- [Testing Standards](testing-standards.md) — Addressing test debt
- [Commit Message Guide](commit-message-guide.md) — Commit format including debt markers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: 6 debt types, registry template, budget allocation, prioritization matrix, quantitative metrics, commit marking |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
