# Data Migration Testing

## Overview

Database schema migrations are high-risk operations: they transform persistent data in ways that cannot be easily undone without a tested rollback path. A comprehensive migration test suite validates three axes — correctness (up applies cleanly), safety (down restores state), and robustness (applying twice is harmless).

## Requirements Summary

| ID | Rule | Rationale |
|----|------|-----------|
| REQ-DMT-001 | Every migration must have an up test | Unverified migrations corrupt production schema |
| REQ-DMT-002 | Every migration with a down function must have a rollback test | Untested rollbacks fail during incidents |
| REQ-DMT-003 | Applying the same migration twice must not fail | CI retries can trigger double-apply |
| REQ-DMT-004 | Migrations that alter data must include a data preservation test | Schema correctness ≠ data correctness |
| REQ-DMT-005 | Each test must use an isolated database | Shared state causes non-deterministic failures |

## Test Structure

### Isolation

Every migration test runs against an isolated database — either in-memory (SQLite `:memory:`) or a fresh Docker container (PostgreSQL). Never run migration tests against a shared development or staging database.

```typescript
// Good: isolated in-memory database per test file
const db = new Database(':memory:')
await applyBaseline(db)

// Bad: tests share a dev database
const db = openDatabase(process.env.DATABASE_URL)
```

### Up Test

Apply the migration to a baseline schema. Assert the expected post-state.

```typescript
it('adds email column to users table', async () => {
  await migrate.up(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).toContain('email')
})
```

### Down Test (Rollback)

Apply up, then down. Assert the schema returns to its pre-migration state.

```typescript
it('rollback removes email column', async () => {
  await migrate.up(db)
  await migrate.down(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).not.toContain('email')
})
```

### Idempotency Test

Apply the migration twice. The second apply must not throw.

```typescript
it('applying migration twice is safe', async () => {
  await migrate.up(db)
  await expect(migrate.up(db)).resolves.not.toThrow()
})
```

### Data Preservation Test

Seed rows before the migration. Assert data integrity after.

```typescript
it('preserves existing user rows', async () => {
  db.prepare("INSERT INTO users (id, name) VALUES (1, 'Alice')").run()
  await migrate.up(db)
  const user = db.prepare("SELECT * FROM users WHERE id = 1").get()
  expect(user.name).toBe('Alice')
})
```

## Tooling

### SQLite / Drizzle ORM

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const sqlite = new Database(':memory:')
const db = drizzle(sqlite)
await migrate(db, { migrationsFolder: './drizzle' })
```

### PostgreSQL

Use `testcontainers` to spin up a fresh PostgreSQL container per test suite. The container is destroyed after the suite, guaranteeing isolation.

## Anti-Patterns

- **Testing against a shared database** — causes cross-test pollution, non-repeatable builds
- **Skipping down migration tests** — rollbacks fail during production incidents
- **Writing migration tests after the fact without seeding data** — misses data preservation bugs entirely
- **Committing a migration without a corresponding test** — the migration is untested until production

## See Also

- `database-standards.ai.yaml` — schema design principles
- `testing.ai.yaml` — general test structure and pyramid
- `verification-evidence.ai.yaml` — audit evidence requirements
