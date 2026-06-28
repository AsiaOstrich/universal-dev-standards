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
| REQ-DMT-006 | Migrations that cross encodings or DB engines must include a byte-level encoding conversion test | "Looks equal" hides codepoint/normalization/collation corruption |
| REQ-DMT-007 | Migrations of business-critical data must include an aggregate invariant test | Row-by-row sampling misses distribution-level drift |

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

### Encoding Conversion Test

Schema-level and row-level tests both pass when a string "looks equal" on screen — yet the underlying bytes can be silently corrupted by a cross-encoding or cross-engine move (UTF-8 → UTF-16/`NVARCHAR`, `VARCHAR` → `NVARCHAR`, an implicit collation change). A migration that crosses encodings or DB engines MUST assert equality at the **byte / codepoint / normalization** level, not the display level.

What to assert:

- **Byte / codepoint identity** — the migrated value has the same Unicode codepoints (and, where the target stores UTF-16, the expected unit count), not just the same rendered glyphs.
- **Normalization form** — NFC vs NFD: `"é"` (U+00E9) and `"e"+◌́` (U+0065 U+0301) render identically but are different byte sequences; assert the form is preserved (or deliberately normalized).
- **Multi-byte boundaries** — values truncated to a *character* limit on the source must not be truncated to a *byte* limit on the target (a 4-byte emoji must survive a `NVARCHAR(n)` column).
- **CJK / emoji / combining marks** — exercise supplementary-plane codepoints (emoji, rare CJK) and combining sequences explicitly; these are where surrogate-pair and collation-folding bugs hide.

```typescript
it('preserves bytes across UTF-8 -> target encoding (no display-only equality)', async () => {
  // Mix BMP CJK, a supplementary-plane emoji, and an NFD combining sequence
  const samples = [
    '繁體中文',           // CJK (BMP)
    '😀 family 👨‍👩‍👧',     // emoji incl. ZWJ sequence (supplementary plane)
    'é'             // NFD: 'e' + combining acute (renders like 'é')
  ]
  samples.forEach((s, i) =>
    db.prepare('INSERT INTO notes (id, body) VALUES (?, ?)').run(i, s))

  await migrate.up(db)

  samples.forEach((expected, i) => {
    const row = db.prepare('SELECT body FROM notes WHERE id = ?').get(i) as { body: string }
    // ❌ Anti-pattern: expect(row.body).toBe(expected)  // passes even on partial corruption if both render the same
    // ✅ Assert at the byte and codepoint level:
    expect(Buffer.from(row.body, 'utf8')).toEqual(Buffer.from(expected, 'utf8'))
    expect([...row.body]).toEqual([...expected])                 // codepoint-by-codepoint
    expect(row.body.normalize('NFC')).toBe(expected.normalize('NFC')) // explicit normalization intent
  })
})
```

> **Anti-pattern**: asserting only `expect(actual).toBe(expected)` on the decoded string. Two different byte/normalization sequences can decode to glyphs that *look* identical, so a display-level assertion passes while the stored bytes (and any downstream `LIKE`/unique-key/collation behavior) are corrupted.

### Aggregate Invariant Test

Row sampling proves individual rows survived; it does **not** prove the *distribution* survived. Seed a representative dataset, capture aggregate invariants over business-critical columns **before** the migration, and assert they are unchanged **after**. This is the same oracle used for post-cutover production reconciliation (aggregate equality across the cutover boundary), run here at migration-test time.

Invariants to capture: `COUNT(*)`, `SUM(money_column)`, `COUNT(DISTINCT key)`, and a content `checksum` (e.g. summed hash) grouped by a business dimension such as status or period.

```typescript
it('preserves aggregate invariants over financial data', async () => {
  seedRepresentativeOrders(db) // statuses, amounts, currencies

  const invariantQuery = `
    SELECT status,
           COUNT(*)            AS cnt,
           SUM(amount_cents)   AS total_cents,
           COUNT(DISTINCT customer_id) AS distinct_customers
    FROM orders
    GROUP BY status
    ORDER BY status`
  const before = db.prepare(invariantQuery).all()

  await migrate.up(db)

  const after = db.prepare(invariantQuery).all()
  // Distribution must be identical — not just "some rows still exist"
  expect(after).toEqual(before)
})
```

> Because aggregates collapse the whole table into a few numbers, a single mismatched `SUM`/`COUNT` flags drift that row-by-row sampling — which only inspects the rows you happened to pick — would miss entirely.

## Cross-Dialect Migration: SQLite → SQL Server Risk Table

When a migration also changes the database engine (not just the schema), the source and target dialects disagree on type semantics, comparison, and ordering. Each disagreement below is a place where data can silently change meaning, and is a derive-list input for the encoding and aggregate tests above (and for the non-HTTP implicit-rule scan in reverse-engineering-standards.md).

| Risk point | SQLite | SQL Server | What the migration must verify |
|---|---|---|---|
| **Type system** | Dynamic typing (per-value type affinity) | Static / strong typing | Declare a type per column; scan for out-of-range / mixed-type values that SQLite tolerated |
| **Boolean** | Usually stored as `0/1` integer | `BIT` | `0/1` ↔ `BIT` mapping; handling of NULL booleans |
| **Date / time** | Often stored as `TEXT` / `REAL` / `INTEGER` | `datetime2` / `datetimeoffset` | Format parse, time-zone handling, precision truncation |
| **Auto-increment PK** | `AUTOINCREMENT` | `IDENTITY` | Continuity of existing ids; correct seed/reseed value |
| **Case / collation** | `LIKE` case-insensitive by default; `NOCASE` | Determined by column collation | Align collation; check for unique-key folding collisions |
| **NULL ordering** | NULLs sort first (smallest) | Depends on configuration | `ORDER BY` result-order invariant across engines |
| **Float precision** | `REAL` | `float` / `decimal` | Move money/exact values to `decimal` to avoid rounding error |
| **String concat** | `\|\|` | `+` / `CONCAT` | Rewrite queries; reconcile NULL-concatenation semantics |
| **Pagination** | `LIMIT` / `OFFSET` | `OFFSET .. FETCH` / `TOP` | Rewrite + guarantee a stable sort key for deterministic pages |

> Each "query rewrite / semantics differs" cell may also hide an **implicit business rule** — feed this table into the Implicit Rule Scan stage of reverse engineering.

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
- **Asserting string equality only on the decoded value** — display-level equality passes even when bytes, normalization form, or codepoints were corrupted across an encoding/engine change
- **Validating a cross-engine migration with row sampling alone** — distribution-level drift (a wrong `SUM`/`COUNT`/`DISTINCT`) escapes any sample that happens to miss the affected rows

## See Also

- `database-standards.ai.yaml` — schema design principles
- `testing.ai.yaml` — general test structure and pyramid
- `verification-evidence.ai.yaml` — audit evidence requirements
- `behavior-snapshot.ai.yaml` — same "don't compare what merely *looks* equal" principle, applied at the oracle/serialization layer rather than the DB storage layer


**Scope**: universal
