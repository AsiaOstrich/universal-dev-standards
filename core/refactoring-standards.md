# Refactoring Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/refactoring-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-12
**Applicability**: All software projects undertaking code improvement initiatives

---

## Purpose

This standard defines comprehensive guidelines for code refactoring, covering everything from daily TDD refactoring cycles to large-scale legacy system modernization. It ensures that refactoring efforts are safe, measurable, and aligned with business objectives.

**Key Benefits**:
- Systematic approach to improving code quality
- Reduced risk of introducing bugs during refactoring
- Clear decision framework for refactor vs. rewrite
- Measurable outcomes and ROI tracking

---

## Table of Contents

1. [Refactoring vs. Rewriting Decision Matrix](#refactoring-vs-rewriting-decision-matrix)
2. [Refactoring Strategies by Scale](#refactoring-strategies-by-scale)
3. [Legacy Code Strategies](#legacy-code-strategies)
4. [Large-Scale Refactoring Patterns](#large-scale-refactoring-patterns)
5. [Database Refactoring](#database-refactoring)
6. [Safe Refactoring Workflow](#safe-refactoring-workflow)
7. [Refactoring Metrics](#refactoring-metrics)
8. [Team Collaboration](#team-collaboration)
9. [Technical Debt Management](#technical-debt-management)
10. [Related Standards](#related-standards)
11. [References](#references)
12. [Version History](#version-history)

---

## Refactoring vs. Rewriting Decision Matrix

Before starting any large refactoring effort, evaluate whether refactoring or rewriting is more appropriate.

### Decision Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│              Refactor vs. Rewrite Decision Tree                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Is the code currently working in production?                   │
│  ├─ No → Consider rewrite (lower risk)                         │
│  └─ Yes ↓                                                       │
│                                                                 │
│  Do you understand what the code does?                          │
│  ├─ No → Characterization tests first, then decide             │
│  └─ Yes ↓                                                       │
│                                                                 │
│  Is there adequate test coverage (>60%)?                        │
│  ├─ No → Add tests first, then decide                          │
│  └─ Yes ↓                                                       │
│                                                                 │
│  Is the core architecture salvageable?                          │
│  ├─ No → Strangler Fig (gradual replacement)                   │
│  └─ Yes → Incremental Refactoring ✓                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comparison Matrix

| Factor | Favor Refactoring | Favor Rewriting |
|--------|-------------------|-----------------|
| **Codebase size** | Large, complex | Small, isolated |
| **Test coverage** | Good (>60%) | Poor or none |
| **Business continuity** | Critical | Can tolerate downtime |
| **Team knowledge** | Team understands code | No institutional knowledge |
| **Core architecture** | Sound, just messy | Fundamentally flawed |
| **Time pressure** | Tight deadlines | Flexible timeline |
| **Risk tolerance** | Low | Higher |

### Warning: Second-System Effect

> "The second system is the most dangerous system a person ever designs." — Fred Brooks

When rewriting, teams often over-engineer. Avoid:
- Adding features not in the original
- Over-abstracting "for future flexibility"
- Ignoring lessons from the existing system

---

## Refactoring Strategies by Scale

### Small-Scale: TDD Refactor Phase (Minutes)

Part of the Red-Green-Refactor cycle. See [Test-Driven Development](test-driven-development.md) for details.

**Characteristics**:
- Duration: 5-15 minutes
- Scope: Single method or class
- Tests: Must remain green

**Common techniques**:
- Extract Method
- Rename
- Inline Variable
- Replace Magic Number with Constant

### Medium-Scale: Feature-Level Refactoring (Hours to Days)

Improving a specific feature or module without changing its external behavior.

**Characteristics**:
- Duration: Hours to days
- Scope: One feature or module
- Tests: Add characterization tests if missing

**Planning Checklist**:

```
□ Define scope boundaries (what's in, what's out)
□ Identify all entry points to the module
□ Ensure test coverage > 80% for affected code
□ Plan incremental commits (each should be deployable)
□ Communicate with team (avoid merge conflicts)
```

### Large-Scale: Architecture-Level Refactoring (Weeks to Months)

Significant architectural changes like migrating from monolith to microservices.

**Characteristics**:
- Duration: Weeks to months
- Scope: Multiple modules or entire system
- Tests: Comprehensive integration tests required

**Patterns**: See [Large-Scale Refactoring Patterns](#large-scale-refactoring-patterns)

---

## Legacy Code Strategies

Based on Michael Feathers' "Working Effectively with Legacy Code".

### The Legacy Code Dilemma

**Definition**: Legacy code = code without tests (regardless of age)

**The Dilemma**:
- To change code safely, we need tests
- To add tests, we often need to change code
- Changing code without tests is risky

**Solution**: Use safe techniques to add tests before making changes.

### Characterization Tests

**Purpose**: Capture existing behavior (not verify correctness)

**Process**:

```
1. Call the code you want to understand
2. Write an assertion you expect to FAIL
3. Run the test and see what actually happens
4. Update the assertion to match actual behavior
5. Repeat until you've covered the behavior you need to change
```

**Example**:

```javascript
// Step 1: Initial (expected to fail)
test('calculateDiscount returns... something', () => {
  const result = calculateDiscount(100, 'GOLD');
  expect(result).toBe(0); // Guess - will probably fail
});

// Step 2: After running, update with actual value
test('calculateDiscount returns 15 for GOLD customers', () => {
  const result = calculateDiscount(100, 'GOLD');
  expect(result).toBe(15); // Actual behavior
});
```

### Finding Seams

**Definition**: A seam is a place where you can alter behavior without editing code.

| Seam Type | How It Works | Example |
|-----------|--------------|---------|
| **Object Seam** | Override via polymorphism | Inject test double via interface |
| **Preprocessing Seam** | Compile-time substitution | Conditional compilation, macros |
| **Link Seam** | Replace at link time | Dependency injection, module replacement |

### Sprout and Wrap Techniques

| Technique | When to Use | How |
|-----------|-------------|-----|
| **Sprout Method** | Adding new logic to existing method | Create new method, call from old |
| **Sprout Class** | New logic needs to evolve independently | Create new class, reference from old |
| **Wrap Method** | Need to add behavior before/after | Rename original, create wrapper |
| **Wrap Class** | Decorate existing class | Decorator pattern |

**Principle**: New code uses TDD; legacy code stays untouched until tested.

### Code Archaeology

Techniques for understanding undocumented code:

```
1. Scratch Refactoring
   ├─ Refactor to understand, not to keep
   ├─ Use git stash or branch
   └─ Discard when done (git reset --hard)

2. Trace Variable Flow
   ├─ Follow data from input to output
   ├─ Mark key transformation points
   └─ Document as you discover

3. Runtime Observation
   ├─ Add temporary logging
   ├─ Use debugger step-through
   └─ Build mental model

4. Git Archaeology
   ├─ git log -p <file> (see all changes)
   ├─ git blame (find original author)
   └─ Search commit messages for context
```

---

## Large-Scale Refactoring Patterns

### Strangler Fig Pattern

**Use when**: Gradually replacing a legacy system

```
┌─────────────────────────────────────────────────────────────────┐
│                    Strangler Fig Pattern                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: INTERCEPT                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────────┐               │
│  │ Request │────▶│ Facade  │────▶│ Legacy (100%)│               │
│  └─────────┘     └─────────┘     └─────────────┘               │
│                                                                 │
│  Phase 2: MIGRATE                                                │
│  ┌─────────┐     ┌─────────┐     ┌─────────────┐               │
│  │ Request │────▶│ Facade  │──┬─▶│ New (Feature A)│            │
│  └─────────┘     └─────────┘  │  └─────────────┘               │
│                               └─▶│ Legacy (Rest) │               │
│                                  └─────────────┘               │
│                                                                 │
│  Phase 3: COMPLETE                                               │
│  ┌─────────┐     ┌─────────────┐                               │
│  │ Request │────▶│ New (100%)  │  [Legacy decommissioned]      │
│  └─────────┘     └─────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Checklist**:
- [ ] Identify interception point (API gateway, facade, proxy)
- [ ] Create event capture layer
- [ ] Implement first feature in new system
- [ ] Route traffic incrementally
- [ ] Monitor and compare results
- [ ] Decommission legacy component

### Branch by Abstraction

**Use when**: Refactoring shared code without long-lived branches

```
Step 1: Introduce Abstraction
        Client → Abstraction (interface) → Old Implementation

Step 2: Add New Implementation
        Client → Abstraction → Old Implementation
                           └─→ New Implementation (feature-toggled)

Step 3: Switch and Remove
        Client → New Implementation
        [Old Implementation removed]
```

**Key Principles**:
- All changes on main/trunk (no long branches)
- Feature toggles control which implementation is active
- Both implementations can coexist during transition

### Parallel Change (Expand-Migrate-Contract)

**Use when**: Changing interfaces used by multiple clients

```
Phase 1: EXPAND
├─ Add new field/method alongside old
├─ New code uses new interface
└─ Old code still works

Phase 2: MIGRATE
├─ Update all clients to use new interface
├─ Verify all clients migrated
└─ Data migration (if needed)

Phase 3: CONTRACT
├─ Remove old field/method
├─ Clean up migration code
└─ Update documentation
```

---

## Database Refactoring

### Expand-Contract Pattern for Schema Changes

```
┌─────────────────────────────────────────────────────────────────┐
│              Database Refactoring (Expand-Contract)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: EXPAND (Add new, keep old)                            │
│  ├─ Add new column/table                                        │
│  ├─ Application writes to BOTH old and new                      │
│  └─ Safe to rollback at this point                              │
│                                                                 │
│  Phase 2: MIGRATE (Move data)                                    │
│  ├─ Copy data from old to new                                   │
│  ├─ Verify data consistency                                     │
│  └─ Application starts reading from new                         │
│                                                                 │
│  Phase 3: CONTRACT (Remove old)                                  │
│  ├─ Confirm old column/table no longer read                     │
│  ├─ Remove old column/table                                     │
│  └─ Clean up dual-write code                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Common Schema Refactoring Scenarios

| Scenario | Strategy | Risk Level |
|----------|----------|------------|
| **Rename column** | Add new → Migrate → Drop old | Medium |
| **Split table** | New table + FK → Migrate → Adjust app | High |
| **Merge tables** | New table → Merge data → Switch app | High |
| **Change data type** | New column → Convert → Switch app | Medium |
| **Add NOT NULL** | Fill defaults → Add constraint | Low |

### Database Migration Safety Checklist

```
Pre-Migration:
□ Full backup completed
□ Migration script tested in staging
□ Rollback script prepared
□ Migration time estimated (consider data volume)
□ Maintenance window communicated

During Migration:
□ Monitor database performance
□ Verify data integrity incrementally
□ Application health checks passing

Post-Migration:
□ Data consistency verification
□ Application functionality verification
□ Performance baseline comparison
□ Backup retained for rollback period
```

### Zero-Downtime Migration Techniques

| Technique | Description | Use Case |
|-----------|-------------|----------|
| **Online Schema Change** | pt-osc, gh-ost | MySQL large table changes |
| **Blue-Green Database** | Dual database switchover | High availability requirements |
| **Shadow Write** | Write to both DBs, compare | Verify migration correctness |
| **Feature Flag** | Control read source | Gradual cutover |

---

## Safe Refactoring Workflow

### Before Refactoring

```
□ Define success criteria (measurable)
□ Ensure adequate test coverage (>80% recommended)
□ Commit/stash current work (clean working directory)
□ Create feature branch (or work on trunk with toggles)
□ Communicate with team to avoid conflicts
```

### During Refactoring

```
□ Make ONE small change at a time
□ Run tests after EVERY change
□ If tests fail, IMMEDIATELY revert
□ Commit frequently (every passing test is a save point)
□ Never add new functionality while refactoring
```

### After Refactoring

```
□ All tests pass (same as before)
□ Code is measurably better (complexity, duplication, etc.)
□ Documentation updated if needed
□ Team review completed
□ No new functionality added
```

---

## Refactoring Metrics

### Code Quality Indicators

| Metric | Measurement | Target |
|--------|-------------|--------|
| **Cyclomatic Complexity** | Static analysis tools | < 10 per function |
| **Cognitive Complexity** | SonarQube, etc. | Lower is better |
| **Coupling** | Dependencies between modules | Reduce |
| **Cohesion** | LCOM metric | Increase |
| **Code Duplication** | Duplicate code percentage | < 3% |
| **Lines of Code** | Reference only | Fewer ≠ always better |

### Test Quality Indicators

| Metric | Target | Notes |
|--------|--------|-------|
| **Test Coverage** | ≥ 80% | Don't decrease during refactoring |
| **Test Speed** | Faster | Refactoring should improve testability |
| **Flaky Test Count** | Decrease | Stability improvement |

### Operational Indicators (DORA Metrics)

| Metric | Measurement | Expected Improvement |
|--------|-------------|----------------------|
| **Deployment Frequency** | CI/CD records | Increase (maintainability improved) |
| **Change Failure Rate** | Rollback count | Decrease |
| **Mean Time to Recovery** | Incident records | Decrease |
| **Lead Time** | Commit to deploy | Decrease |

### Team Efficiency Indicators

| Metric | Measurement | Notes |
|--------|-------------|-------|
| **Onboarding Time** | New hire ramp-up | Shorter = better readability |
| **PR Review Time** | Git records | Shorter = better understandability |
| **Bug Fix Time** | Issue tracking | Shorter = better maintainability |

### Refactoring ROI Framework

```
Cost:
├─ Development time × hourly rate
├─ Testing time
├─ Deployment risk cost
└─ Opportunity cost (features not built)

Benefits:
├─ Reduced maintenance time × future years
├─ Reduced bugs × fix cost
├─ Faster feature development
└─ Lower employee turnover cost
```

---

## Team Collaboration

### Refactoring Project Kickoff

```
Kickoff Meeting Agenda:
1. Scope Definition
   ├─ What modules/files are in scope
   └─ What is explicitly excluded

2. Success Criteria Alignment
   ├─ Quantitative goals (complexity reduction X%)
   └─ Functional goals (behavior unchanged)

3. Work Division
   ├─ By module (vertical slicing)
   └─ By layer (horizontal slicing)

4. Risk Assessment
   ├─ Highest-risk areas
   └─ Rollback strategy
```

### Division Strategies

| Strategy | Use When | Caution |
|----------|----------|---------|
| **Vertical Slicing** | Independent modules | Ensure interfaces unchanged |
| **Horizontal Slicing** | Cross-module refactoring (e.g., naming conventions) | Strict synchronization needed |
| **Strangler Division** | Large system replacement | One person per Strangler slice |
| **Mob Programming** | Core/high-risk areas | Entire team, reduces risk |

### Communication Mechanisms

```
Daily Communication:
├─ Sync refactoring progress in standup
├─ Shared Refactoring Board (Kanban)
└─ Dedicated channel (#refactoring-xxx)

PR Standards:
├─ [Refactor] prefix in title
├─ Explain what changed and why
├─ Include before/after complexity comparison
└─ Require Characterization Tests for legacy code

Conflict Resolution:
├─ Small scope: Resolve immediately
├─ Medium scope: Daily sync meeting
└─ Large scope: Consider Branch by Abstraction
```

### PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| Small | < 200 | < 30 min |
| Medium | 200-500 | < 1 hour |
| Large | > 500 | **Should be split** |

**Principle**: Multiple small PRs > One large PR

---

## Technical Debt Management

### Technical Debt Quadrant

Based on Martin Fowler's Technical Debt Quadrant:

```
                    Deliberate
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │  Prudent      │  Reckless     │
        │  "We know     │  "We don't    │
        │  this is      │  have time    │
        │  debt"        │  for design"  │
        │               │               │
Prudent ├───────────────┼───────────────┤ Reckless
        │               │               │
        │  Prudent      │  Reckless     │
        │  "Now we      │  "What's      │
        │  know how     │  layering?"   │
        │  we should    │               │
        │  have done it"│               │
        │               │               │
        └───────────────┼───────────────┘
                        │
                   Inadvertent
```

### Debt Prioritization

| Priority | Criteria | Action |
|----------|----------|--------|
| **High** | Blocks development, causes frequent bugs | Address immediately |
| **Medium** | Slows development, increases complexity | Plan for next sprint |
| **Low** | Minor annoyance, isolated impact | Address opportunistically |

### Tracking Technical Debt

```
For each debt item, record:
├─ Description: What is the issue?
├─ Impact: How does it affect development?
├─ Estimated Effort: How long to fix?
├─ Risk if Ignored: What happens if not addressed?
└─ Related Code: Links to affected files/modules
```

---

## Related Standards

- [Test-Driven Development](test-driven-development.md) - TDD cycle including refactoring phase
- [Code Review Checklist](code-review-checklist.md) - Refactoring PR review guidelines
- [Commit Message Guide](commit-message-guide.md) - `refactor` commit type
- [Code Check-in Standards](checkin-standards.md) - Pre-commit requirements

---

## References

### Books

- Martin Fowler - "Refactoring: Improving the Design of Existing Code" (2nd Edition, 2018)
- Michael Feathers - "Working Effectively with Legacy Code" (2004)
- Joshua Kerievsky - "Refactoring to Patterns" (2004)

### Articles

- Martin Fowler - [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- Martin Fowler - [Branch by Abstraction](https://martinfowler.com/bliki/BranchByAbstraction.html)
- Pete Hodgson - [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- Martin Fowler - [Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)

### Tools

- [Refactoring Guru](https://refactoring.guru/) - Catalog of refactoring techniques
- [SonarQube](https://www.sonarqube.org/) - Code quality and complexity analysis
- [ApprovalTests](https://approvaltests.com/) - Golden Master testing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial refactoring standards definition |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
