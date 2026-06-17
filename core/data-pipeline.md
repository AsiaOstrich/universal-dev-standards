# Data Pipeline Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/data-pipeline.ai.yaml`
> **Spec**: XSPEC-068 (cross-project/specs/XSPEC-068-uds-data-engineering-pack.md)

## Overview

This standard defines engineering requirements for building **reliable,
observable, and maintainable data pipelines**. It covers idempotency and
exactly-once semantics, error handling and dead-letter queues, checkpoint and
recovery, data-lineage tracking, pipeline observability and SLOs, and testing
requirements. It applies to batch ETL, streaming pipelines, and ML feature
pipelines.

It is part of the **data-engineering pack** (XSPEC-068). It extends
`database-standards` (which covers static DB schema) into the movement and
transformation of data, and reuses the reliability and observability primitives
of the SRE family (`observability-standards`, `slo-sli`).

> **Scope.** This standard defines the *pipeline design principles* (idempotency,
> error handling, recovery, lineage, observability, testing). The concrete
> orchestrator (Airflow/Dagster), lineage store (Marquez/DataHub), and DLQ
> transport are adoption choices.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Idempotency and exactly-once processing | MUST |
| REQ-002 | Error handling and dead-letter queues | MUST |
| REQ-003 | Checkpoint and recovery | MUST |
| REQ-004 | Data-lineage tracking | MUST |
| REQ-005 | Pipeline observability and SLOs | MUST |
| REQ-006 | Pipeline testing requirements | MUST |

### REQ-001 — Idempotency and Exactly-Once Processing

Every pipeline MUST be designed for **idempotent** execution: re-running the same
pipeline for the same time window or batch MUST produce identical output without
duplication or data loss. Pipelines MUST use deterministic keys for
deduplication. Batch pipelines MUST support clean re-processing of historical
partitions. Streaming pipelines MUST implement exactly-once, or at-least-once with
deduplication using unique event IDs. For batch jobs, overwriting output
partitions is preferred over appending.

### REQ-002 — Error Handling and Dead-Letter Queues

Pipelines MUST implement structured error handling with categorized failure modes.
**Transient** errors (network timeout, API rate limit) MUST use exponential
backoff retry (max 3 attempts). **Permanent** errors (schema violation, invalid
data) MUST route records to a Dead-Letter Queue (DLQ) carrying the original
record, error type, error message, and processing timestamp. DLQ records MUST be
monitored and addressed within the pipeline's SLA.

### REQ-003 — Checkpoint and Recovery

Long-running batch pipelines and stateful streaming pipelines MUST implement
**checkpointing** to recover from mid-run failures without full reprocessing.
Checkpoints MUST record the last successfully processed partition/offset/watermark,
the job run ID, and a timestamp. Recovery MUST resume from the last checkpoint,
not from the beginning. Checkpoint state MUST be stored in durable external
storage, not local disk.

### REQ-004 — Data Lineage Tracking

Every pipeline MUST emit **lineage metadata** describing its data flow: source
datasets (with versions/timestamps), transformation logic applied, and output
datasets produced. Lineage MUST be machine-readable and ingested into a central
lineage store or data catalog, enabling root-cause analysis of data-quality
issues and impact assessment of upstream changes.

### REQ-005 — Pipeline Observability and SLOs

Every production pipeline MUST expose: records processed (counter), processing
latency (histogram), error rate (gauge), DLQ depth (gauge), and last successful
run timestamp. Pipelines MUST define SLOs for **freshness** (data available within
N hours of source), **completeness** (≥ X% records successfully processed), and
**latency** (p95 within threshold). SLO violations MUST trigger alerts.

### REQ-006 — Pipeline Testing Requirements

Pipelines MUST have automated tests covering: unit tests for transformation logic
(sample input/output), integration tests validating end-to-end flow with synthetic
data, and schema-conformance tests validating output against the declared data
contract (`data-contract`). Pipelines SHOULD have regression tests for
historically problematic edge cases (nulls in key fields, negative amounts,
duplicate records). Test coverage MUST be ≥ 80% for transformation logic.

## Integration with Existing Standards

- **`data-contract`** — schema-conformance tests validate pipeline output against
  the producer's declared contract and quality SLOs.
- **`schema-evolution`** — pipelines must tolerate backward-compatible schema
  changes in their sources.
- **`observability-standards` / `slo-sli`** — pipeline metrics and freshness/
  completeness SLOs reuse the SRE observability and SLO primitives.
- **`database-standards`** — extends the static-schema standard into data movement.
- **`audit-trail`** — backfills and reprocessing record an audit event (reason).

## Related Specs

- XSPEC-068 — UDS data-engineering pack (this standard's source)
- XSPEC-066 — Compliance & audit pack (`audit-trail` for backfill reasons)
- XSPEC-063 — SRE pack (`observability-standards`, `slo-sli`)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: idempotency, error handling/DLQ, checkpoint/recovery, lineage, observability/SLO, testing (XSPEC-068) |
