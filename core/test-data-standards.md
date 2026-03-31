# Test Data Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/test-data-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**References**: [Testing Standards](testing-standards.md), [Security Standards](security-standards.md)

---

## Overview

This document defines standards for managing test data across all test levels. It covers data strategy selection, anonymization of personally identifiable information (PII), fixture synchronization with schema migrations, test isolation principles, the Factory Pattern for data creation, and common anti-patterns to avoid.

Well-managed test data ensures tests are **reliable** (deterministic results), **secure** (no PII leakage), and **maintainable** (easy to update when schemas change).

---

## Test Data Strategies

Choose the appropriate test data strategy based on the test level and data complexity:

| Strategy | Description | Best For | Test Level |
|----------|-------------|----------|------------|
| **Inline Data** | Data defined directly in the test code | Simple, focused values | Unit tests |
| **Fixture Files** | External JSON/YAML/SQL files loaded by tests | Shared reference data, complex structures | Integration tests |
| **Seed Scripts** | Executable scripts that populate a database | Full environment setup, realistic datasets | E2E tests |

### Inline Data

Define test data directly within the test function. This keeps tests self-contained and easy to understand.

**When to use:**
- Unit tests with simple input/output
- Data is small (1-5 objects)
- Each test needs slightly different data

**Example concept:**
```
// Inline: data is right next to the assertion
const user = { name: 'Jane Doe', email: 'jane@example.com', role: 'admin' };
expect(greet(user)).toBe('Hello, Admin Jane Doe');
```

### Fixture Files

Store test data in external files (JSON, YAML, CSV, or SQL) that tests load at runtime.

**When to use:**
- Integration tests requiring complex or large datasets
- Multiple tests share the same reference data (read-only)
- Data represents realistic domain objects

**Best practices:**
- Store fixtures in a dedicated `tests/fixtures/` or `__fixtures__/` directory
- Name files descriptively: `valid-order-with-items.json`, `expired-subscription.json`
- Keep fixtures small and focused — one scenario per fixture
- Never modify fixture files at runtime

### Seed Scripts

Executable scripts that set up a database or external service with test data.

**When to use:**
- E2E tests requiring a fully populated environment
- Performance/load testing with realistic data volumes
- Tests that interact with real databases

**Best practices:**
- Make seed scripts idempotent (safe to run multiple times)
- Include both setup and teardown logic
- Version seed scripts alongside schema migrations
- Document expected state after seeding

### Strategy Selection Guide

```
What test level?
├─ Unit test
│  └─ Use inline data (simple, self-contained)
├─ Integration test
│  └─ Use fixture files (shared, structured)
└─ E2E test
   └─ Use seed scripts (full environment setup)
```

---

## Data Anonymization Rules

When tests require realistic data, **never use real PII**. Apply the following anonymization techniques for each field type:

| PII Field | Anonymization Technique | Example (Before → After) |
|-----------|------------------------|--------------------------|
| **Name** | Use Faker library or fictitious pseudonyms | `John Smith` → `Jane Doe` (generated) |
| **Email** | Replace domain with `@example.com` | `john@company.com` → `user1@example.com` |
| **Phone** | Format-preserving mask with fixed prefix | `+1-555-123-4567` → `+1-555-000-0001` |
| **Address** | Generalize to fictitious address | `123 Main St, NYC` → `1 Test Ave, Anytown` |
| **ID** | Hash original or use sequential/UUID generation | `SSN: 123-45-6789` → `ID: test-uuid-0001` |

### Rules

1. **Never copy production data** into test environments without full anonymization
2. **Use deterministic generation** when tests need reproducible data (seeded Faker)
3. **Validate anonymized data** preserves format constraints (e.g., valid email format)
4. **Document anonymization mapping** so original field semantics are clear
5. **Review test data in CI logs** — ensure no real PII appears in test output

---

## Fixture and Schema Migration Sync

When database schema changes, fixture files MUST be updated to match. Stale fixtures cause false positives (tests pass but code is broken) or false negatives (tests fail but code is correct).

### Sync Rules

1. **Atomic updates**: When a migration adds/removes/renames a column, update all fixtures referencing that table in the **same commit**
2. **Automated detection**: Add a CI check that validates fixture files against the current schema
   - Load each fixture and verify it matches the expected schema
   - Flag any fixture with outdated or missing fields
3. **Fixture versioning**: Include a schema version comment in fixture files
   ```json
   {
     "_schema_version": "2026-03-31-add-status-column",
     "users": [{ "name": "Test User", "email": "test@example.com", "status": "active" }]
   }
   ```
4. **Migration checklist**: Add "Update test fixtures" as a required step in the migration PR template
5. **Stale fixture detection**: Run automated checks to detect fixtures that reference columns or tables no longer in the schema

---

## Test Isolation Principles

Every test MUST be independent. Tests that depend on shared state or execution order are fragile and unreliable.

### Core Rules

1. **Create your own data**: Each test sets up exactly the data it needs in its `beforeEach` or `setUp` block
2. **Clean up after yourself**: Each test destroys or rolls back its data in `afterEach` or `tearDown`
3. **No shared mutable state**: Tests MUST NOT read or write shared mutable variables, database rows, or files that other tests also use
4. **Parallel-safe**: Tests should be designed to run in parallel without interference
5. **Idempotent**: Running a test once or many times should produce the same result

### Isolation Strategies by Test Level

| Test Level | Isolation Strategy |
|------------|-------------------|
| **Unit** | Pure functions; mock external dependencies |
| **Integration** | Transaction rollback; test-specific database schemas |
| **E2E** | Dedicated test environment; unique namespaced data |

### Transaction Rollback Pattern

For database integration tests, wrap each test in a transaction and roll back after:

```
beforeEach: BEGIN TRANSACTION
  test runs (INSERT, UPDATE, SELECT)
afterEach: ROLLBACK
```

This ensures zero side effects between tests.

---

## Factory Pattern

Use the Factory Pattern to create test data with sensible defaults that can be overridden per test.

### Definition

A **test data factory** is a function that:
1. Provides **sensible defaults** for all required fields
2. Allows **overriding** any default value for specific test scenarios
3. Supports creating **associated/related data** automatically

### Concept Example

```
// Factory with defaults
function createUser(overrides = {}) {
  return {
    id: generateUUID(),
    name: 'Default User',
    email: 'default@example.com',
    role: 'viewer',
    createdAt: new Date(),
    ...overrides       // Override any default
  };
}

// Usage: override only what matters for this test
const admin = createUser({ role: 'admin' });
const named = createUser({ name: 'Specific Name' });
```

### Associated Data

Factories should support creating related entities:

```
// Factory that creates associated data
function createOrder(overrides = {}) {
  const user = overrides.user || createUser();
  return {
    id: generateUUID(),
    userId: user.id,
    items: overrides.items || [createOrderItem()],
    status: 'pending',
    ...overrides
  };
}
```

### Best Practices

1. **One factory per entity**: `createUser()`, `createOrder()`, `createProduct()`
2. **Minimal defaults**: Only include required fields; keep defaults simple
3. **Composable**: Factories can call other factories for related data
4. **No side effects**: Factories return data objects; they don't write to databases (that's a separate step)
5. **Traits/presets**: Define named presets for common scenarios: `createUser({ ...adminTraits })`

---

## Anti-Patterns

Avoid these common test data anti-patterns:

### 1. Shared Mutable Data

**Problem**: Multiple tests read and write the same data (global variables, shared database rows).

**Why it's harmful**: Tests become order-dependent. One test's changes affect another's expectations, causing intermittent failures.

**Fix**: Each test creates and owns its data. Use factories and setup/teardown hooks.

### 2. Hardcoded IDs

**Problem**: Tests use hardcoded IDs like `userId: 1` or `orderId: 'abc-123'`.

**Why it's harmful**: IDs clash between tests in parallel execution. Assumptions about auto-increment values break across environments.

**Fix**: Generate unique IDs (UUID) in factories. Never assume specific ID values.

### 3. Execution Order Dependency

**Problem**: Test B assumes test A has already run and set up certain data.

**Why it's harmful**: Tests fail when run in isolation, in different order, or in parallel. Makes debugging extremely difficult.

**Fix**: Each test is fully self-contained with its own setup and teardown. No test should depend on side effects from another test.

### 4. Using Production Data

**Problem**: Copying production database snapshots into test environments.

**Why it's harmful**: Exposes real PII (legal/compliance risk), creates massive test datasets that slow CI, contains unpredictable data that causes brittle tests.

**Fix**: Use anonymized synthetic data. Generate test data with factories and Faker libraries. Keep datasets minimal and purpose-built.

---

## Quick Reference Card

### Strategy Selection
```
Unit test?           → Inline data
Integration test?    → Fixture files
E2E test?            → Seed scripts
```

### Anonymization Quick Check
```
Name?    → Faker / pseudonym
Email?   → @example.com domain
Phone?   → Format-preserving mask
Address? → Fictitious / generalized
ID?      → Hash / UUID / sequential
```

### Isolation Checklist
```
[ ] Test creates its own data
[ ] Test cleans up after itself
[ ] No shared mutable state
[ ] Safe to run in parallel
[ ] Same result every time
```

---

## References

- [Testing Standards](testing-standards.md) — Test levels, coverage, and quality requirements
- [Security Standards](security-standards.md) — Data protection and PII handling
- [Unit Testing Standards](unit-testing-standards.md) — Unit test patterns and best practices
- [Integration Testing Standards](integration-testing-standards.md) — Integration test strategies

---

**Related Standards:**
- [Testing Standards](testing-standards.md) — Overall testing framework
- [Performance Standards](performance-standards.md) — Performance testing data considerations

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Strategies, Anonymization, Fixture Sync, Isolation, Factory Pattern, Anti-Patterns |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
