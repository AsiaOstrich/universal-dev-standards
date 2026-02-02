# Refactoring Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/refactoring-standards.md)

**Version**: 2.1.0
**Last Updated**: 2026-01-29
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
| **Code Duplication** | < 3% | Static analysis |
| **Test Coverage** | ≥ 80% | Coverage tools |

### ISO/IEC 25010 Maintainability Goals

| Sub-characteristic | Indicator | Goal |
|--------------------|-----------|------|
| **Modularity** | Coupling, File size | Reduce dependencies |
| **Reusability** | Code Duplication | Extract methods, DRY |
| **Analysability** | Cyclomatic Complexity | Simplify logic |
| **Modifiability** | Cohesion, Test Coverage | Single Responsibility |
| **Testability** | Branch Coverage | Dependency Injection |

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
- [Code Review Checklist](code-review-checklist.md) - Refactoring PR review guidelines
- [Commit Message Guide](commit-message-guide.md) - `refactor` commit type
- [Code Check-in Standards](checkin-standards.md) - Pre-commit requirements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved detailed patterns to guide |
| 2.0.0 | 2026-01-21 | Major restructure: Added tactical strategies, Anti-Corruption Layer |
| 1.0.0 | 2026-01-12 | Initial refactoring standards definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
