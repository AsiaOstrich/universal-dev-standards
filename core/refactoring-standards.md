# Refactoring Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/refactoring-standards.md)

**Version**: 2.2.0
**Last Updated**: 2026-07-01
**Applicability**: All software projects undertaking code improvement initiatives
**Scope**: partial
**Industry Standards**: ISO/IEC 25010 Maintainability

> **For detailed patterns and tutorials, see [Refactoring Guide](guides/refactoring-guide.md)**

---

## Purpose

This standard defines comprehensive guidelines for code refactoring, covering everything from daily TDD refactoring cycles to large-scale legacy system modernization.

---

## Refactoring vs. Rewriting Decision Matrix

| Factor | Favor Refactoring | Favor Rewriting |
|--------|-------------------|-----------------|
| **Codebase size** | Large, complex | Small, isolated |
| **Test coverage** | Good (>60%) | Poor or none |
| **Business continuity** | Critical | Can tolerate downtime |
| **Team knowledge** | Team understands code | No institutional knowledge |
| **Core architecture** | Sound, just messy | Fundamentally flawed |
| **Time pressure** | Tight deadlines | Flexible timeline |
| **Risk tolerance** | Low | Higher |

---

## When to Refactor

| Situation | Recommended Strategy |
|-----------|---------------------|
| Feature development blocked by messy code | Preparatory Refactoring |
| Touching code during a bug fix | Boy Scout Rule |
| Writing new code with TDD | Red-Green-Refactor |
| Replacing an entire legacy system | Strangler Fig Pattern |
| Need to integrate with legacy without being polluted | Anti-Corruption Layer |
| Refactoring shared code without feature branches | Branch by Abstraction |
| Changing a widely-used interface | Parallel Change (Expand-Migrate-Contract) |
| Working with untested legacy code | Characterization Tests FIRST |

---

## Strategy Summary

| Strategy | Scale | Risk | Duration | Key Use Case |
|----------|-------|------|----------|--------------|
| **Preparatory Refactoring** | Small | Low | Hours | Reduce friction before feature work |
| **Boy Scout Rule** | Very Small | Low | Minutes | Continuous debt repayment |
| **Red-Green-Refactor** | Small | Low | 5-15 min | TDD development cycle |
| **Strangler Fig** | Large | Medium | Months | System replacement |
| **Anti-Corruption Layer** | Medium | Low | Weeks | New-legacy coexistence |
| **Branch by Abstraction** | Large | Medium | Weeks | Long-term refactoring on trunk |
| **Parallel Change** | Medium | Low | Days-Weeks | Interface/schema migration |
| **Characterization Tests** | — | — | — | **Prerequisite for all legacy refactoring** |

---

## Safe Refactoring Workflow

### Before Refactoring

- [ ] Define success criteria (measurable)
- [ ] Ensure adequate test coverage (>80% recommended)
- [ ] Commit/stash current work (clean working directory)
- [ ] Create feature branch (or work on trunk with toggles)
- [ ] Communicate with team to avoid conflicts

### During Refactoring

- [ ] Make ONE small change at a time
- [ ] Run tests after EVERY change
- [ ] If tests fail, IMMEDIATELY revert
- [ ] Commit frequently (every passing test is a save point)
- [ ] Never add new functionality while refactoring

### After Refactoring

- [ ] All tests pass (same as before)
- [ ] Code is measurably better (complexity, duplication, etc.)
- [ ] Documentation updated if needed
- [ ] Team review completed
- [ ] No new functionality added

---

## Code Quality Metrics

### Target Metrics

| Metric | Target | Tool |
|--------|--------|------|
| **Cyclomatic Complexity** | < 10 per function | Static analysis |
| **Cognitive Complexity** | Lower is better | SonarQube |
| **Code Duplication (textual)** | < 3% | Static analysis |
| **Semantic Duplication** | 0 unmanaged domain facts | Golden / architecture test (see below) |
| **Test Coverage** | ≥ 80% | Coverage tools |

> **Textual vs. semantic duplication**: The `Code Duplication` metric only detects *textual* duplication (near-identical token sequences). It cannot detect *semantic* duplication — the same domain fact re-implemented in several places, or a derived aggregate persisted without an enforced binding to its source. Copies that are not byte-for-byte identical (paraphrased logic, a formula that is right in one place and wrong in another) pass static analysis while still drifting apart. Semantic duplication must be governed by golden tests and architecture tests (see [Semantic Duplication & Copy-Drift](#semantic-duplication--copy-drift)), not by the static-analysis threshold above.

### ISO/IEC 25010 Maintainability Goals

| Sub-characteristic | Indicator | Goal |
|--------------------|-----------|------|
| **Modularity** | Coupling, File size | Reduce dependencies |
| **Reusability** | Code Duplication | Extract methods, DRY |
| **Analysability** | Cyclomatic Complexity | Simplify logic |
| **Modifiability** | Cohesion, Test Coverage | Single Responsibility |
| **Testability** | Branch Coverage | Dependency Injection |

---

## Semantic Duplication & Copy-Drift

Textual-duplication metrics catch copy-paste, but they miss the more dangerous case: the **same domain fact implemented in more than one place**. When those implementations are not byte-identical — a paraphrased classification, a formula that is correct in one call site and subtly wrong in another, a total that is stored separately from the rows it summarizes — they pass static analysis and then **drift apart independently**, producing bugs that look unrelated but share a single root cause.

### Anti-pattern: Copy-Drift

Copy-Drift occurs when either:

- A single domain fact (a classification, a rule, a calculation) is **re-implemented at multiple call sites** instead of being computed by one shared unit; or
- A **derived value is persisted** (a stored aggregate, counter, or denormalized field) **without an enforced relationship to its source**, so each write path can update it independently.

Because the copies are not literally identical, textual-duplication tooling reports nothing. The divergence surfaces later as inconsistency: a list view disagreeing with a detail view, a stored counter double-counting because one update path's decrement branch was commented out, or the same formula giving different answers in different modules.

### Pattern: Single Source of Truth / Derive-Don't-Duplicate

- **One unit per fact.** Extract each domain fact into a **single** classifier / calculator / resolver. Every call site calls it — no re-implementations, no paraphrases.
- **Derive, don't store.** Prefer computing the value on read over persisting a second copy. A value that is always derived cannot drift.
- **If an aggregate must be stored**, treat it as a **projection of its detail rows**, and recompute it at a **single choke point** — for example a `SaveChanges` interceptor, or one shared `recompute()` function — so that *every* write path (including async jobs and failure write-backs) goes through the same recomputation and stays consistent. **Never** let an individual path apply an incremental `col = col + delta` adjustment to a stored aggregate; incremental adjustments are exactly how decrement/rollback branches get skipped and counters diverge.
- **Lock it with tests.** Use a **golden test** to pin the single source of truth, and add an **architecture test** that fails if the rule is redefined anywhere else, so a future copy is rejected at CI rather than discovered in production.

### Migration Corollary — Intentional-Divergence Registry

When a new system **intentionally** diverges from legacy behavior, record it — otherwise a later "fix" will silently revert it. A common case during a port: a legacy *function* returns X, but the legacy *pipeline* downstream reconciles it to Y; the port folds that reconciliation into the single unit so the function now returns Y directly.

- Register each intentional divergence in an **intentional-divergence registry** (legacy behavior, new behavior, rationale, owning fact).
- Pin the new behavior with a **golden test** so a future "correction" back to legacy fails the build.
- Feed the registry into any **differential test** against legacy so the divergence is treated as *expected*, not flagged as a regression.

### Note for Adopters

- Per-function legacy-vs-new diffing produces **candidates, not verdicts**. Every candidate must be adjudicated against the **entire** legacy pipeline (not just the one function) before it can be called a bug — the legacy pipeline may already reconcile the apparent difference downstream.
- Extract legacy function bodies **programmatically / token-based** (not by hand) so you do not reintroduce transcription errors while investigating transcription errors.

---

## PR Size Guidelines

| Size | Lines Changed | Review Time | Recommendation |
|------|---------------|-------------|----------------|
| Small | < 200 | < 30 min | ✅ Ideal |
| Medium | 200-500 | < 1 hour | ⚠️ Acceptable |
| Large | > 500 | — | ❌ **Should be split** |

**Principle**: Multiple small PRs > One large PR

---

## Technical Debt Prioritization

| Priority | Criteria | Action |
|----------|----------|--------|
| **High** | Blocks development, causes frequent bugs | Address immediately |
| **Medium** | Slows development, increases complexity | Plan for next sprint |
| **Low** | Minor annoyance, isolated impact | Address opportunistically |

---

## Database Refactoring Safety

### Pre-Migration Checklist

- [ ] Full backup completed
- [ ] Migration script tested in staging
- [ ] Rollback script prepared
- [ ] Migration time estimated
- [ ] Maintenance window communicated

### Post-Migration Checklist

- [ ] Data consistency verification
- [ ] Application functionality verification
- [ ] Performance baseline comparison
- [ ] Backup retained for rollback period

---

## Related Standards

- [Test-Driven Development](test-driven-development.md) - TDD cycle including refactoring phase
- [Testing Standards](testing-standards.md) - Golden tests and architecture tests for locking a single source of truth
- [Test Governance](test-governance.md) - Governing semantic-duplication and intentional-divergence checks in CI
- [Code Review Checklist](code-review-checklist.md) - Refactoring PR review guidelines
- [Commit Message Guide](commit-message-guide.md) - `refactor` commit type
- [Code Check-in Standards](checkin-standards.md) - Pre-commit requirements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2.0 | 2026-07-01 | Added Semantic Duplication & Copy-Drift (issue #142): Copy-Drift anti-pattern, Single Source of Truth / Derive-Don't-Duplicate pattern, Intentional-Divergence Registry migration corollary; split duplication metric into textual vs. semantic |
| 2.1.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved detailed patterns to guide |
| 2.0.0 | 2026-01-21 | Major restructure: Added tactical strategies, Anti-Corruption Layer |
| 1.0.0 | 2026-01-12 | Initial refactoring standards definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
