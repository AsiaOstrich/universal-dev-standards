# Schema Evolution Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/schema-evolution.ai.yaml`
> **Spec**: XSPEC-068 (cross-project/specs/XSPEC-068-uds-data-engineering-pack.md)

**Scope**: universal

## Overview

This standard defines how database and data-store schemas are **evolved safely**
without breaking existing consumers. It covers backward-compatible change patterns,
prohibited breaking changes, the expand-contract migration strategy, schema
versioning and registry, automated compatibility checking in CI, and rollback
procedures. It applies to relational databases, document stores, event schemas
(Avro/Protobuf), and API request/response schemas.

It is part of the **data-engineering pack** (XSPEC-068) and extends the
static-schema definitions in `database-standards` with safe evolution rules.

> **Scope.** This standard defines the *compatibility taxonomy*, the
> *expand-contract* deployment discipline, and CI gating. The concrete migration
> tool (Flyway/Liquibase) and schema registry (Confluent) are adoption choices.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Backward-compatible change patterns | MUST |
| REQ-002 | Prohibited breaking changes without a migration plan | MUST |
| REQ-003 | Expand-contract migration strategy | MUST |
| REQ-004 | Schema versioning and registry | MUST |
| REQ-005 | Automated schema-compatibility checking in CI | MUST |
| REQ-006 | Schema-change rollback procedures | MUST |

### REQ-001 — Backward-Compatible Change Patterns

All schema changes MUST be backward-compatible unless a formal breaking-change
process is followed. Backward-compatible changes include: adding new nullable
columns/fields with defaults, adding new tables/collections, adding new optional
message fields, adding new enum values (with unknown handling), widening a data
type (INT → BIGINT), and adding indexes. These changes MUST be deployable without
coordinating consumer updates.

### REQ-002 — Prohibited Breaking Changes Without Migration Plan

The following are classified as **BREAKING** and MUST NOT be deployed without a
formal expand-contract migration plan and consumer coordination: renaming or
dropping columns/fields, changing data types incompatibly, adding NOT NULL to
existing columns without defaults, changing primary/foreign-key definitions,
removing enum values, and changing field semantics (repurposing a column).

### REQ-003 — Expand-Contract Migration Strategy

Breaking changes MUST use the **expand-contract** (parallel-change) pattern:
**Phase 1 (Expand)** add new structure alongside old; **Phase 2 (Migrate)**
backfill old → new and update all writers; **Phase 3 (Contract)** update all
readers to the new structure; **Phase 4 (Cleanup)** remove old structure after all
consumers are updated. Each phase MUST be a separate, verified deployment.
Minimum wait between phases: one full deployment cycle.

### REQ-004 — Schema Versioning and Registry

Event-driven and API schemas (Avro, Protobuf, JSON Schema) MUST be registered in a
schema registry with explicit version numbers following semantic versioning: PATCH
for backward-compatible additions, MINOR for new optional fields, MAJOR for
breaking changes. Every schema change MUST be reviewed and approved before
registration. Consumers MUST specify the schema version they consume.

### REQ-005 — Automated Schema Compatibility Checking in CI

Every PR modifying schema definitions MUST trigger automated compatibility checks
in CI. For relational schemas, migration scripts MUST be run against a
production-snapshot database in CI to detect errors before merge. For event
schemas, compatibility MUST be checked against all registered consumer versions.
Compatibility failures MUST block the PR merge.

### REQ-006 — Schema Change Rollback Procedures

Every migration script MUST have a corresponding rollback (down) script. Rollback
scripts MUST be tested in CI alongside the forward migration. For destructive
changes (drops, type changes), a data backup MUST be taken and verified before
execution. The rollback plan MUST be documented in the migration PR and referenced
in the deployment runbook.

## Integration with Existing Standards

- **`database-standards`** — this standard adds the *evolution* discipline on top
  of static schema definitions.
- **`data-contract`** — MAJOR schema versions map to contract breaking-change
  governance and consumer sign-off.
- **`data-pipeline`** — pipelines must tolerate backward-compatible source changes
  per REQ-001.
- **`deployment-standards`** — expand-contract phases are separate deployments;
  rollback plans live in the deployment runbook.

## Related Specs

- XSPEC-068 — UDS data-engineering pack (this standard's source)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: backward-compatible patterns, prohibited breaking changes, expand-contract, versioning/registry, CI compatibility checks, rollback (XSPEC-068) |
