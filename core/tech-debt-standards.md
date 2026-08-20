# Tech Debt Management Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/tech-debt-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-08-20
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
| 4 | **Source** | How the debt was introduced (deliberate / inadvertent / incident-postmortem — see [postmortem-standards](postmortem-standards.md) action-item hand-off) | Deliberate (or `postmortem PM-042`) |
| 5 | **Impact** | Business and technical impact description | "Slows feature development by ~2 days per sprint" |
| 6 | **Estimated Cost** | Effort to resolve (story points or person-days) | 8 story points |
| 7 | **Interest** | Ongoing cost of not resolving (see Interest Types) | 1 day/sprint additional debugging |
| 8 | **Priority** | Priority level from the impact matrix (P0-P3) | P1 |
| 9 | **Owner** | Team or individual responsible for resolution | @backend-team |
| 10 | **Created Date** | Date the debt was registered | 2026-01-15 |
| 11 | **Target Resolution Date** | Planned date for resolution | 2026-Q2 |

### Registry Storage Options

The registry can be stored in any of the following locations. Each option is legal **only if** it also satisfies the condition in the right-hand column — see [Overdue Handling](#overdue-handling) below.

| Option | Best For | Format | Overdue-check condition |
|--------|----------|--------|-------------------------|
| `docs/tech-debt-registry.md` | Small teams, simple tracking | Markdown table | A repository check parses the table and fails on rows past their Target Resolution Date — **or** the file carries an Unattended Declaration |
| Issue tracker (GitHub Issues, Jira) | Larger teams, workflow integration | Tagged issues with `tech-debt` label | A scheduled query on the due-date field that actually **runs** and raises; a saved filter nobody opens is not a check — **or** an Unattended Declaration |
| Dedicated spreadsheet | Non-technical stakeholders | CSV/Excel with the 11 fields | Only if the sheet is exported, on a stated cadence, to a location a check reads — **or** an Unattended Declaration |

> **Why that column had to be added.** A registry no program can read satisfies every other requirement in this section: all 11 fields present, an Owner named, a Target Resolution Date set. Nothing about it is wrong — until the date passes, and then nothing happens. The spreadsheet option is deliberately **not** removed; a spreadsheet is often the only format the people who fund the work will open. What is no longer legal is for any storage option to be a place where dates go to expire unobserved.

### Overdue Handling

A **Target Resolution Date** that passes with no consequence is indistinguishable from having no date at all. This subsection defines what "the date arrived" means.

#### The three legal dispositions

When an item reaches its Target Resolution Date, exactly one of three things must happen, and it must leave a trace:

| Disposition | Meaning | Required trace |
|-------------|---------|----------------|
| **Resolve** | Do the work | Registry entry closed + a `Tech-Debt: TD-NNN resolved` commit footer (see [Commit Marking](#6-commit-marking)) |
| **Withdraw** | Decide not to do it, and delete the record | Entry marked withdrawn, with a reason and a date. It stops being counted as debt because it no longer is any |
| **Extend** | Set a new Target Resolution Date | The new date **and** a written reason, recorded together; earlier dates stay visible (append, do not overwrite) |

There is no fourth disposition. "Still open, date passed, nobody looked" is not a state this standard permits — it is the failure this subsection exists to name.

**Rule TD-EXP-001 (Required)** — An item past its Target Resolution Date with none of the three dispositions applied makes the registry non-compliant. Overdue is a finding, not a neutral background condition.

**Rule TD-EXP-002 (Required, prohibition)** — Expiry MUST NOT be implemented as **automatic extension** or **automatic closure**.

- Automatic extension makes the date unfalsifiable: it can never be missed, so it never measures anything.
- Automatic closure deletes the record without anyone having decided to.

Both stop the clock, and neither leaves a trace that it did. A date whose only consumer is a job that pushes it forward is decoration.

**Rule TD-EXP-003 (Required)** — Extending requires the reason to be recorded next to the new date. Changing only the date is not an extension; it is an erasure with a timestamp on it.

**Rule TD-EXP-004 (Recommended)** — An item extended three or more times with no progress recorded between extensions should be re-triaged as a **Withdraw** candidate. Repeated extension is evidence that nobody intends to do the work; recording that honestly is more useful to the next reader than a fourth date.

#### Unattended Declaration

Not every team can run a check. **A registry with no automated overdue check is still compliant — but only if it says so.**

An **Unattended Declaration** is a visible, dated statement inside the registry itself:

```
Unattended — no automated check reads this registry for overdue items.
Reviewed manually by <owner> on a <cadence> cadence. Last reviewed: <date>.
```

**Rule TD-EXP-005 (Required)** — A registry MUST be in exactly one of two states, and MUST make which one visible to anyone reading the registry:

1. **Checked** — a named, runnable check reads the registry and fails when an item is past its Target Resolution Date.
2. **Unattended** — no such check exists, an Unattended Declaration is present, and it names an owner, a review cadence, and the date of the last review.

A registry in neither state is non-compliant. The declaration is not paperwork: it is the whole difference between a reader who knows nothing is watching and a reader who assumes something is.

**Rule TD-EXP-006 (Required)** — The "Last reviewed" date in an Unattended Declaration is itself subject to the cadence that declaration states. A declaration whose last review is older than its own cadence is an overdue item in its own right, and the three dispositions apply to it.

> **This standard ships no checker, and that is a known cost — stated here rather than left to be discovered.**
>
> UDS defines the requirement; it does not provide a program that enforces it. Adopters who want the **Checked** state must write the check themselves, and most teams will not — which is exactly the failure mode described above, now applying to this section as well.
>
> That is why the minimum bar here is **not** "build a checker". It is **"never let a registry be silently unattended."** Declaring `Unattended` costs one paragraph and is fully compliant. Being unattended *without* declaring it is the one outcome this standard actually forbids, because it is the only one that misleads the reader about whether anything is watching.

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
- [Governance Layer](governance-layer.md) — Standard #0; applies the same clock to pending decisions and accepted risks, and defines aggregate-reporting and freshness-metric rules

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-08-20 | Added: Overdue Handling — three legal dispositions on expiry (resolve / withdraw / extend-with-reason), TD-EXP-001..006, prohibition on automatic extension and automatic closure, Unattended Declaration as the compliant alternative to a checker; Registry Storage Options gains an overdue-check condition per option (a registry no program can read is legal only when declared unattended) |
| 1.0.0 | 2026-03-31 | Initial release: 6 debt types, registry template, budget allocation, prioritization matrix, quantitative metrics, commit marking |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
