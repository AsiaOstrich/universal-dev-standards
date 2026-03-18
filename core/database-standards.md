# Database Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/database-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-18
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: ISO/IEC 9075 (SQL), ACID Properties, BASE Theorem
**References**: [use-the-index-luke.com](https://use-the-index-luke.com/), [sqlstyle.guide](https://www.sqlstyle.guide/)

---

## Purpose

This standard defines guidelines for database design, querying, migration, and operations across relational and non-relational databases. It covers schema design principles, indexing strategies, migration workflows, query optimization, transaction management, and data integrity — ensuring databases are performant, maintainable, and secure.

**Reference Standards**:
- [ISO/IEC 9075 — SQL Standard](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke — SQL Indexing and Tuning](https://use-the-index-luke.com/)
- [Martin Fowler — Evolutionary Database Design](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/)

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Data Integrity First** | Constraints, validations, and referential integrity are enforced at the database level, not only in application code |
| **Schema as Code** | Database schemas are version-controlled and reproducible through migration scripts |
| **Least Privilege** | Database accounts use the minimum permissions required for their function |
| **Measure Before Tuning** | Use EXPLAIN plans and metrics before optimizing; avoid premature optimization |
| **Defense in Depth** | Protect sensitive data with encryption, masking, and access controls at multiple layers |
| **Backward Compatibility** | Schema changes must maintain backward compatibility during deployment windows |

---

## Schema Design Principles

### Normalization

Apply normalization to eliminate redundancy and ensure data integrity. Target Third Normal Form (3NF) as the baseline for transactional systems.

| Normal Form | Rule | Example Violation |
|-------------|------|-------------------|
| **1NF** | Atomic values only; no repeating groups | `tags = "java,python,go"` in a single column |
| **2NF** | 1NF + no partial dependencies on composite keys | Non-key column depends on only part of a composite PK |
| **3NF** | 2NF + no transitive dependencies | `order.customer_name` derived from `customer.name` via `customer_id` |

### Denormalization Decision Matrix

Denormalization trades integrity for read performance. Use deliberately and document the tradeoff.

| Criteria | Normalize | Denormalize |
|----------|-----------|-------------|
| Read/Write ratio | Write-heavy or balanced | Read-heavy (>90% reads) |
| Data consistency | Critical (financial, medical) | Eventual consistency acceptable |
| Query complexity | Acceptable join performance | Joins cause unacceptable latency |
| Data volatility | Frequently updated | Rarely changes after creation |
| Storage cost | Minimize duplication | Storage is cheap; speed is priority |

**When denormalizing:**
- Document the source of truth and sync mechanism
- Add comments explaining why denormalization was chosen
- Implement consistency checks or reconciliation jobs

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | `snake_case`, singular | `user_account`, `order_item` |
| Columns | `snake_case` | `first_name`, `created_at` |
| Primary keys | `id` | `user_account.id` |
| Foreign keys | `<referenced_table>_id` | `order.user_account_id` |
| Boolean columns | `is_` or `has_` prefix | `is_active`, `has_verified_email` |
| Timestamps | `_at` suffix | `created_at`, `updated_at`, `deleted_at` |
| Indexes | `idx_<table>_<columns>` | `idx_user_account_email` |
| Unique constraints | `uq_<table>_<columns>` | `uq_user_account_email` |
| Check constraints | `ck_<table>_<description>` | `ck_order_positive_amount` |

### Reserved Words

- Avoid using SQL reserved words as identifiers (`order`, `user`, `group`, `select`)
- If unavoidable, suffix with the entity type: `user_account`, `order_record`, `user_group`

---

## Data Types

### Choose Appropriate Types

| Scenario | Recommended | Avoid |
|----------|-------------|-------|
| Monetary values | `DECIMAL(19,4)` or `NUMERIC` | `FLOAT`, `DOUBLE` (precision loss) |
| Dates and times | `TIMESTAMPTZ` (with timezone) | `VARCHAR` for dates |
| Boolean flags | `BOOLEAN` | `INT` (0/1), `CHAR(1)` ('Y'/'N') |
| Short text (< 255) | `VARCHAR(n)` with appropriate length | `TEXT` for known-length fields |
| Long text | `TEXT` | `VARCHAR(MAX)` or oversized `VARCHAR` |
| IP addresses | Native IP type or `INET` | `VARCHAR(45)` |
| JSON data | `JSONB` (PostgreSQL) or native JSON | `TEXT` with JSON strings |
| Enumerations | `ENUM` type or lookup table | Stringly-typed values |

### UUID vs Auto-Increment

| Factor | Auto-Increment | UUID |
|--------|---------------|------|
| Storage size | 4-8 bytes | 16 bytes |
| Index performance | Better (sequential) | Worse (random inserts fragment B-tree) |
| Distributed generation | Requires coordination | No coordination needed |
| Security | Predictable (enumerable) | Non-guessable |
| URL exposure | Reveals record count | Safe for public URLs |
| Merge/replication | Conflict-prone | Conflict-free |

**Recommendation:**
- Use **auto-increment** for internal-only IDs in single-database systems
- Use **UUIDv7** (time-ordered) for distributed systems or publicly exposed IDs
- Consider **UUIDv7** as default for new projects — it combines sortability with uniqueness

```sql
-- PostgreSQL: UUIDv7 as primary key
CREATE TABLE user_account (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-increment alternative
CREATE TABLE user_account (
    id         BIGSERIAL PRIMARY KEY,
    public_id  UUID NOT NULL DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## Indexing Strategy

### When to Create Indexes

| Create Index When | Avoid Index When |
|-------------------|------------------|
| Column appears in `WHERE` clauses frequently | Table has fewer than 1,000 rows |
| Column is used in `JOIN` conditions | Column has very low cardinality (e.g., boolean) |
| Column is used in `ORDER BY` | Table is write-heavy with rare reads |
| Column is used in `GROUP BY` | Column is frequently updated |
| Unique constraint is needed | You already have too many indexes (>8 per table) |

### Composite Index Column Order

The order of columns in a composite index matters significantly. Follow the **equality-first, range-last** rule:

```sql
-- Query pattern:
-- WHERE status = 'active' AND created_at > '2026-01-01' ORDER BY created_at

-- GOOD: equality columns first, range/sort columns last
CREATE INDEX idx_order_status_created ON order_record (status, created_at);

-- BAD: range column first eliminates effectiveness for equality filter
CREATE INDEX idx_order_created_status ON order_record (created_at, status);
```

**Column order rules:**
1. Equality conditions (`=`) first
2. `IN` conditions next
3. Range conditions (`>`, `<`, `BETWEEN`) last
4. `ORDER BY` columns at the end (if matching sort direction)

### Covering Indexes

A covering index includes all columns needed by a query, enabling index-only scans:

```sql
-- Query: SELECT email, first_name FROM user_account WHERE status = 'active';

-- Covering index — no table lookup needed
CREATE INDEX idx_user_account_status_covering
    ON user_account (status) INCLUDE (email, first_name);
```

### Partial Indexes

Create indexes on a subset of rows to reduce index size and improve write performance:

```sql
-- Only index active records (90% of queries filter on active)
CREATE INDEX idx_order_active
    ON order_record (created_at)
    WHERE status = 'active';

-- Only index non-null values
CREATE INDEX idx_user_account_phone
    ON user_account (phone_number)
    WHERE phone_number IS NOT NULL;
```

### Indexing Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Over-indexing** | Slows writes, wastes storage | Audit indexes quarterly; drop unused ones |
| **Unused indexes** | Maintenance cost with no read benefit | Monitor `pg_stat_user_indexes` or equivalent |
| **Duplicate indexes** | Redundant overhead | Index `(a, b)` already covers queries on `(a)` |
| **Indexing low-cardinality columns** | Full table scan is often faster | Use partial indexes or bitmap indexes instead |
| **Missing index on FK** | Slow cascading deletes and joins | Always index foreign key columns |
| **Function on indexed column** | Index bypassed | Create functional/expression index |

```sql
-- Anti-pattern: function prevents index usage
SELECT * FROM user_account WHERE LOWER(email) = 'test@example.com';

-- Solution: expression index
CREATE INDEX idx_user_account_email_lower ON user_account (LOWER(email));
```

---

## Migration Strategy

### Principles

| Principle | Description |
|-----------|-------------|
| **Version-Controlled** | All migrations stored in source control alongside application code |
| **Sequential** | Migrations execute in deterministic order |
| **Idempotent** | Running a migration twice produces the same result |
| **Tested** | Migrations are tested against production-like data volumes before deployment |
| **Documented** | Each migration includes a description of what and why |

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql

Examples:
20260318120000_create_user_account_table.sql
20260318120100_add_email_index_to_user_account.sql
20260318120200_add_phone_column_to_user_account.sql
```

### Forward-Only vs Reversible

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **Reversible** (up/down) | Easy rollback, safer | More code to maintain, some changes not reversible | Development, non-destructive changes |
| **Forward-only** | Simpler, matches reality | Requires separate rollback migration | Production, destructive changes |

**Recommendation:** Use reversible migrations by default. For destructive operations (drop column, drop table), use forward-only with a separate rollback migration file.

### Zero-Downtime Migration Patterns (Expand-Contract)

For schema changes in systems that cannot tolerate downtime:

**Phase 1 — Expand (backward-compatible)**
```sql
-- Add new column (nullable, no constraint yet)
ALTER TABLE user_account ADD COLUMN phone VARCHAR(20);
```

**Phase 2 — Migrate (dual-write)**
```sql
-- Backfill existing data
UPDATE user_account SET phone = legacy_phone WHERE phone IS NULL;
```

**Phase 3 — Contract (after all consumers updated)**
```sql
-- Add constraint now that all data is populated
ALTER TABLE user_account ALTER COLUMN phone SET NOT NULL;
-- Drop old column (only after verifying no consumers use it)
ALTER TABLE user_account DROP COLUMN legacy_phone;
```

### Rollback Strategy

| Scenario | Rollback Approach |
|----------|-------------------|
| Added column | Drop the column |
| Added index | Drop the index |
| Added table | Drop the table |
| Dropped column | Cannot undo — must restore from backup or re-add |
| Data transformation | Run reverse transformation (if designed) |
| Renamed column | Rename back |

**Critical rule:** Never drop columns or tables in the same deployment that stops writing to them. Use the expand-contract pattern.

---

## Query Best Practices

### N+1 Query Prevention

The N+1 problem occurs when code executes one query to fetch a list, then N additional queries for each item.

```sql
-- N+1 PROBLEM (application issues N queries)
-- Query 1: SELECT * FROM order_record WHERE user_id = 42;
-- Query 2..N: SELECT * FROM order_item WHERE order_id = ?;  (for each order)

-- SOLUTION: JOIN or subquery
SELECT o.*, oi.*
FROM order_record o
JOIN order_item oi ON oi.order_id = o.id
WHERE o.user_id = 42;

-- Or batch loading
SELECT * FROM order_item
WHERE order_id IN (SELECT id FROM order_record WHERE user_id = 42);
```

### EXPLAIN Plan Usage

Always analyze query plans for:
- Queries executing more than 100 times per minute
- Queries with execution time > 100ms
- Queries touching more than 10,000 rows
- Any new query before deployment

```sql
-- PostgreSQL
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM order_record WHERE status = 'pending' AND created_at > '2026-01-01';

-- Key indicators to watch:
-- Seq Scan on large tables   → missing index
-- Nested Loop with high rows → consider Hash Join
-- Sort with high cost        → add index matching ORDER BY
-- Rows (estimated vs actual) → stale statistics, run ANALYZE
```

### Pagination

| Method | Pros | Cons | Use When |
|--------|------|------|----------|
| **Offset-based** | Simple, supports random page access | Slow on large offsets, inconsistent with concurrent writes | Small datasets, admin panels |
| **Keyset (cursor)** | Consistent performance, stable results | No random page jumps, complex with multi-column sort | APIs, infinite scroll, large datasets |

```sql
-- Offset-based (avoid for large tables)
SELECT * FROM order_record ORDER BY id LIMIT 20 OFFSET 10000;
-- Performance degrades: DB must scan and discard 10,000 rows

-- Keyset-based (preferred)
SELECT * FROM order_record
WHERE id > :last_seen_id
ORDER BY id
LIMIT 20;
-- Consistent performance regardless of page depth
```

### Query Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| `SELECT *` | Fetches unnecessary data, breaks on schema changes | Explicitly list needed columns |
| String concatenation in queries | SQL injection vulnerability | Use parameterized queries / prepared statements |
| `OR` on different columns | Prevents index usage | Use `UNION ALL` or restructure |
| `NOT IN` with NULLs | Unexpected empty results | Use `NOT EXISTS` instead |
| Implicit type casting | Index bypass, wrong results | Cast explicitly |
| `LIKE '%prefix'` | Leading wildcard prevents index usage | Use full-text search or reverse index |

```sql
-- ANTI-PATTERN: SQL injection risk
query = "SELECT * FROM user_account WHERE email = '" + email + "'";

-- CORRECT: Parameterized query
query = "SELECT * FROM user_account WHERE email = $1";
params = [email];
```

---

## Transaction Management

### ACID Properties

| Property | Description | Enforcement |
|----------|-------------|-------------|
| **Atomicity** | All operations succeed or all fail | Use transactions; avoid partial commits |
| **Consistency** | Database moves from one valid state to another | Enforce constraints at DB level |
| **Isolation** | Concurrent transactions don't interfere | Choose appropriate isolation level |
| **Durability** | Committed data survives system failure | Use WAL (Write-Ahead Logging); confirm sync writes |

### Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance | Use Case |
|-------|-----------|---------------------|-------------|-------------|----------|
| **Read Uncommitted** | Possible | Possible | Possible | Fastest | Never recommended |
| **Read Committed** | Prevented | Possible | Possible | Fast | Default for most RDBMS; general-purpose queries |
| **Repeatable Read** | Prevented | Prevented | Possible | Medium | Financial reports, inventory checks |
| **Serializable** | Prevented | Prevented | Prevented | Slowest | Money transfers, booking systems |

**Recommendation:** Use **Read Committed** as the default. Escalate to **Repeatable Read** or **Serializable** only for operations requiring strict consistency (e.g., account balance updates, seat reservations).

### Deadlock Prevention

| Strategy | Implementation |
|----------|---------------|
| **Consistent lock ordering** | Always acquire locks on tables/rows in the same order across all transactions |
| **Short transactions** | Keep transactions as brief as possible; move non-DB work outside |
| **Lock timeouts** | Set `lock_timeout` to fail fast rather than wait indefinitely |
| **Retry logic** | Implement exponential backoff retry for deadlock errors (SQLSTATE 40P01) |
| **Avoid user interaction** | Never hold a transaction open waiting for user input |

```sql
-- Set lock timeout to prevent indefinite waiting
SET lock_timeout = '5s';

-- Keep transactions short
BEGIN;
    UPDATE account SET balance = balance - 100 WHERE id = 1;
    UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### Optimistic vs Pessimistic Locking

| Factor | Optimistic | Pessimistic |
|--------|-----------|-------------|
| Mechanism | Version column / timestamp check at write time | `SELECT ... FOR UPDATE` acquires row lock |
| Conflict rate | Low conflict environments | High conflict environments |
| Performance | Better when conflicts are rare | Better when conflicts are frequent |
| UX impact | User may see "someone else modified" error | User may wait for lock release |
| Deadlock risk | None | Possible |

```sql
-- Optimistic locking
UPDATE order_record
SET status = 'shipped', version = version + 1
WHERE id = 42 AND version = 3;
-- If affected rows = 0, another transaction modified it → retry or error

-- Pessimistic locking
BEGIN;
SELECT * FROM order_record WHERE id = 42 FOR UPDATE;
-- Row is locked; other transactions wait
UPDATE order_record SET status = 'shipped' WHERE id = 42;
COMMIT;
```

---

## SQL vs NoSQL Decision Matrix

| Criteria | Relational (SQL) | Document (NoSQL) | Key-Value | Graph |
|----------|------------------|-------------------|-----------|-------|
| **Data structure** | Structured, well-defined schema | Semi-structured, flexible schema | Simple key→value pairs | Highly connected entities |
| **Consistency** | Strong (ACID) | Eventual (BASE), some offer ACID | Eventual | Varies |
| **Query complexity** | Complex joins, aggregations | Simple lookups, nested documents | Single-key lookups | Relationship traversals |
| **Scale pattern** | Vertical (scale-up) | Horizontal (scale-out) | Horizontal | Varies |
| **Schema changes** | Migration required | Schema-less / flexible | Schema-less | Schema-optional |
| **Example use cases** | Financial systems, ERP, CRM | Content management, user profiles, catalogs | Caching, sessions, rate limiting | Social networks, recommendations, fraud detection |
| **Example databases** | PostgreSQL, MySQL, SQL Server | MongoDB, CouchDB, DynamoDB | Redis, Memcached, DynamoDB | Neo4j, Amazon Neptune |

### Decision Guide

```
Is your data highly relational with complex queries?
├── Yes → Relational (SQL)
└── No  → Is your data simple key-value pairs?
          ├── Yes → Key-Value store
          └── No  → Are relationships the primary query pattern?
                    ├── Yes → Graph database
                    └── No  → Document database
```

**Polyglot Persistence:** Many systems benefit from using multiple database types. Example:
- **PostgreSQL** for transactional data (orders, accounts)
- **Redis** for caching and sessions
- **Elasticsearch** for full-text search
- **Neo4j** for recommendation engine

---

## Connection Management

### Connection Pooling

Every application MUST use connection pooling. Creating a new database connection per request is prohibitively expensive (TCP handshake, authentication, SSL negotiation).

| Parameter | Recommended Default | Description |
|-----------|--------------------|-------------|
| **Min pool size** | 2-5 | Minimum idle connections maintained |
| **Max pool size** | 10-20 | Maximum concurrent connections |
| **Connection timeout** | 5 seconds | Time to wait for a connection from pool |
| **Idle timeout** | 10 minutes | Close idle connections after this period |
| **Max lifetime** | 30 minutes | Recycle connections to prevent stale state |
| **Validation query** | `SELECT 1` | Health check before returning connection |

### Pool Sizing Formula

A common formula for maximum pool size:

```
pool_size = (core_count * 2) + effective_spindle_count

Examples:
- 4-core server, SSD:    (4 * 2) + 1 = 9-10 connections
- 8-core server, SSD:    (8 * 2) + 1 = 17 connections
- 4-core server, 4 HDDs: (4 * 2) + 4 = 12 connections
```

**Important:** More connections is NOT better. Excessive connections cause:
- Thread contention in the database
- Memory pressure (each connection uses ~5-10 MB)
- Increased context switching

### Health Checks

```sql
-- Basic health check
SELECT 1;

-- Advanced health check (verify read/write capability)
SELECT NOW();

-- Connection validation before use
SET statement_timeout = '2s';
SELECT 1;
```

---

## Data Integrity

### Constraints

Always enforce data integrity at the database level. Application-level validation is a complement, not a replacement.

| Constraint | Purpose | Example |
|-----------|---------|---------|
| `NOT NULL` | Prevent missing required data | `email VARCHAR(255) NOT NULL` |
| `UNIQUE` | Prevent duplicate values | `UNIQUE (email)` |
| `CHECK` | Validate value ranges/formats | `CHECK (amount > 0)` |
| `FOREIGN KEY` | Enforce referential integrity | `REFERENCES user_account(id)` |
| `DEFAULT` | Provide sensible default values | `DEFAULT NOW()` |
| `EXCLUSION` | Prevent overlapping ranges | `EXCLUDE USING gist (room WITH =, period WITH &&)` |

```sql
CREATE TABLE order_record (
    id              BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT       NOT NULL REFERENCES user_account(id),
    amount          DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### Cascading Rules

| Rule | Behavior | Use When |
|------|----------|----------|
| `CASCADE` | Delete/update child rows automatically | Strong ownership (order → order_items) |
| `SET NULL` | Set FK to NULL on parent delete | Optional relationship (post → author on author deletion) |
| `SET DEFAULT` | Set FK to default on parent delete | Reassign to default value |
| `RESTRICT` | Prevent parent deletion if children exist | Protect critical references (user → audit_log) |
| `NO ACTION` | Same as RESTRICT (deferred check possible) | Default behavior |

**Recommendation:** Use `RESTRICT` by default. Only use `CASCADE` when parent-child lifecycle is tightly coupled.

### Soft Delete vs Hard Delete

| Factor | Soft Delete | Hard Delete |
|--------|------------|-------------|
| Implementation | `deleted_at TIMESTAMPTZ` column | `DELETE FROM table` |
| Data recovery | Easy — set `deleted_at = NULL` | Requires backup restoration |
| Query complexity | Must add `WHERE deleted_at IS NULL` everywhere | Simpler queries |
| Storage | Grows over time | Reclaims space |
| Compliance | Audit trail preserved | May violate retention requirements |
| Performance | Large tables with many soft-deleted rows | Cleaner table statistics |

```sql
-- Soft delete implementation
ALTER TABLE user_account ADD COLUMN deleted_at TIMESTAMPTZ;

-- Create partial index for active records
CREATE INDEX idx_user_account_active ON user_account (email) WHERE deleted_at IS NULL;

-- Application query pattern
SELECT * FROM user_account WHERE deleted_at IS NULL AND email = $1;
```

**Recommendation:** Use soft delete for user-facing data and anything requiring audit trails. Use hard delete for ephemeral data (sessions, temporary tokens, logs beyond retention).

---

## Backup and Recovery

### Backup Strategy Types

| Strategy | Description | Speed (Backup) | Speed (Restore) | Storage Cost |
|----------|-------------|-----------------|------------------|-------------|
| **Full** | Complete copy of entire database | Slowest | Fastest | Highest |
| **Incremental** | Only changes since last backup (any type) | Fastest | Slowest (requires chain) | Lowest |
| **Differential** | Changes since last full backup | Medium | Medium (full + diff) | Medium |

### RPO and RTO

| Metric | Definition | Example Targets |
|--------|-----------|-----------------|
| **RPO** (Recovery Point Objective) | Maximum acceptable data loss (time) | 1 hour: hourly backups; 0: continuous replication |
| **RTO** (Recovery Time Objective) | Maximum acceptable downtime | 15 min: automated failover; 4 hours: manual restore |

### Backup Schedule Recommendation

| Tier | RPO | RTO | Strategy |
|------|-----|-----|----------|
| **Critical** (financial, healthcare) | < 1 min | < 15 min | Synchronous replication + continuous WAL archiving |
| **Important** (e-commerce, SaaS) | < 1 hour | < 1 hour | Streaming replication + hourly WAL archiving |
| **Standard** (internal tools) | < 24 hours | < 4 hours | Daily full + hourly incremental |
| **Low** (development, staging) | < 1 week | < 1 day | Weekly full backup |

### Backup Testing

| Requirement | Frequency |
|-------------|-----------|
| Restore test to separate environment | Monthly |
| Verify data integrity after restore | Every restore test |
| Measure actual RTO vs target | Quarterly |
| Test point-in-time recovery | Semi-annually |
| Document and update runbook | After each test |

---

## Sensitive Data Handling

### Column-Level Encryption

```sql
-- Encrypt at write time
INSERT INTO user_account (email, ssn_encrypted)
VALUES ($1, pgp_sym_encrypt($2, $encryption_key));

-- Decrypt at read time (only by authorized roles)
SELECT email, pgp_sym_decrypt(ssn_encrypted, $encryption_key) AS ssn
FROM user_account WHERE id = $1;
```

### Data Classification

| Level | Description | Examples | Handling |
|-------|-------------|----------|----------|
| **Public** | No sensitivity | Marketing content, public APIs | No special handling |
| **Internal** | Business-sensitive | Revenue data, roadmaps | Access control, no public exposure |
| **Confidential** | Personally identifiable | Email, phone, address | Encryption at rest, access logging |
| **Restricted** | Highly sensitive | SSN, credit cards, passwords | Column encryption, data masking, strict audit |

### Data Masking

```sql
-- View-based masking for support staff
CREATE VIEW user_account_masked AS
SELECT
    id,
    LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2) AS email,
    '***-**-' || RIGHT(ssn, 4) AS ssn_masked,
    first_name,
    created_at
FROM user_account;

-- Grant support team access to masked view only
GRANT SELECT ON user_account_masked TO support_role;
```

### PII Management Checklist

- [ ] Identify and catalog all PII columns across all tables
- [ ] Encrypt PII at rest (column-level or tablespace encryption)
- [ ] Encrypt PII in transit (TLS for all connections)
- [ ] Implement data masking for non-production environments
- [ ] Define and enforce retention policies
- [ ] Support data subject requests (GDPR right to erasure, access)
- [ ] Log all access to PII columns
- [ ] Anonymize data in development and staging environments

### Audit Logging

```sql
-- Audit log table
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  VARCHAR(100)  NOT NULL,
    record_id   BIGINT        NOT NULL,
    action      VARCHAR(10)   NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values  JSONB,
    new_values  JSONB,
    changed_by  VARCHAR(100)  NOT NULL,
    changed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger-based audit (PostgreSQL example)
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
        current_user
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## Performance Monitoring

### Slow Query Logging

| Database | Configuration | Recommended Threshold |
|----------|--------------|----------------------|
| PostgreSQL | `log_min_duration_statement` | 200ms (development), 1000ms (production) |
| MySQL | `slow_query_log`, `long_query_time` | 1 second |
| SQL Server | Extended Events or Query Store | 1 second |

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold | Tool |
|--------|-------------------|-------------------|------|
| **Active connections** | > 70% of max | > 90% of max | Database dashboard |
| **Cache/buffer hit ratio** | < 95% | < 90% | `pg_stat_bgwriter`, InnoDB buffer pool |
| **Replication lag** | > 1 second | > 10 seconds | Replication monitoring |
| **Transaction rate** | Deviation > 20% from baseline | > 50% deviation | Application metrics |
| **Lock wait time** | > 1 second average | > 5 seconds | Lock monitoring queries |
| **Deadlocks per minute** | > 1 | > 5 | Database logs |
| **Table bloat** | > 20% dead tuples | > 40% dead tuples | `pg_stat_user_tables` |
| **Query execution time (p95)** | > 500ms | > 2 seconds | APM tools |

### Query Plan Analysis Workflow

```
1. Identify slow query (slow query log or APM)
   ↓
2. Run EXPLAIN ANALYZE on staging with production-like data
   ↓
3. Look for:
   - Sequential scans on large tables → add index
   - High actual vs estimated rows → run ANALYZE (update statistics)
   - Nested loops with many iterations → restructure query or add index
   - Sort operations with high cost → add index matching sort order
   ↓
4. Apply fix (add index, rewrite query, update statistics)
   ↓
5. Re-run EXPLAIN ANALYZE to verify improvement
   ↓
6. Deploy and monitor execution time in production
```

---

## Quick Reference Card

### Schema Design

```
✅ Use snake_case for all identifiers
✅ Singular table names (user_account, not user_accounts)
✅ Use _id suffix for foreign keys
✅ Always have id, created_at, updated_at columns
✅ Enforce constraints at database level
✅ Normalize to 3NF, denormalize with documented reasoning
```

### Queries

```
✅ Always use parameterized queries
✅ List specific columns instead of SELECT *
✅ Use EXPLAIN ANALYZE for query optimization
✅ Prefer keyset pagination over offset for large datasets
✅ Batch operations to prevent N+1 queries
✅ Set statement_timeout to prevent runaway queries
```

### Operations

```
✅ Use connection pooling (never open per-request connections)
✅ Version-control all migrations
✅ Test migrations with production-like data
✅ Use expand-contract for zero-downtime schema changes
✅ Monitor slow queries, connections, cache hit ratio
✅ Test backup restoration regularly
```

---

## Related Standards

- [Security Standards](security-standards.md) — Data encryption, access control, PII handling
- [Performance Standards](performance-standards.md) — Application-level performance optimization
- [Logging Standards](logging-standards.md) — Structured logging for database operations
- [Deployment Standards](deployment-standards.md) — Database migration as part of deployment pipeline

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial release |

---

## References

- [ISO/IEC 9075 — SQL Standard](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke](https://use-the-index-luke.com/) — SQL Indexing and Tuning
- [SQL Style Guide](https://www.sqlstyle.guide/) — Consistent SQL formatting
- [Martin Fowler — Evolutionary Database Design](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications](https://dataintensive.net/) — Martin Kleppmann
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
