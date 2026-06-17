# Data Contract Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/data-contract.ai.yaml`
> **Spec**: XSPEC-068 (cross-project/specs/XSPEC-068-uds-data-engineering-pack.md)

## Overview

This standard defines how **data contracts** are established, versioned, and
enforced between data producers and consumers. A data contract is a formal
agreement specifying the schema, quality guarantees, SLAs, and ownership of a
dataset or stream. It covers the contract specification format, freshness and
quality SLOs, breaking-change governance, consumer registration/notification, and
automated contract testing. It reduces pipeline failures caused by undiscovered
upstream changes.

It is part of the **data-engineering pack** (XSPEC-068) and is the **anchor
standard** for the existing `contract-test-assistant` skill (data-side contracts).

> **Scope.** This standard defines the *contract artifact* (format, SLOs,
> governance, registration). The concrete data-quality engine (Great
> Expectations) and catalog (DataHub/Amundsen) are adoption choices.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Data-contract specification format | MUST |
| REQ-002 | Data-quality SLOs | MUST |
| REQ-003 | Contract versioning and breaking-change governance | MUST |
| REQ-004 | Automated contract testing | MUST |
| REQ-005 | Consumer registration and notification | MUST |
| REQ-006 | Contract discoverability | SHOULD |

### REQ-001 — Data Contract Specification Format

Every shared dataset or stream MUST have a data contract in a machine-readable
YAML file (`data-contract.yaml`) committed alongside the producer code. The
contract MUST include: `contract_id`, `version`, `owner` (team + contact),
description, `schema` (field names, types, nullability), `data_quality` SLOs
(completeness, freshness, uniqueness), `sla` (delivery time), and the consumer
list.

### REQ-002 — Data Quality SLOs

Every contract MUST define explicit data-quality SLOs across these dimensions:
**completeness** (% non-null for required fields ≥ threshold), **freshness** (data
updated within N minutes/hours of source), **uniqueness** (% distinct for key
fields), and **validity** (% conforming to defined format/range). Quality SLO
violations MUST trigger alerts to both producer and registered consumers.

### REQ-003 — Contract Versioning and Breaking-Change Governance

Contracts MUST use semantic versioning. **PATCH** (backward-compatible additions,
docs) requires only producer approval. **MINOR** (new optional fields, relaxed
constraints) requires consumer notification with 7-day notice. **MAJOR** (field
removal, type/semantic changes) requires consumer approval and MUST NOT deploy
until all registered consumers confirm readiness.

### REQ-004 — Automated Contract Testing

Contract compliance MUST be verified automatically. Producers MUST run contract
tests on every pipeline execution, validating output against the declared schema
and quality SLOs: schema conformance (no unexpected nulls, correct types),
freshness within the SLO window, uniqueness of key fields, and row count within
range. Contract test failures MUST halt the pipeline and page the data owner.

### REQ-005 — Consumer Registration and Notification

Teams consuming a shared dataset MUST register as consumers in the producer's
`data-contract.yaml`, including team name, contact, use-case description, and
fields consumed. Registered consumers MUST receive automated notifications when:
the contract is modified, quality SLOs are breached, the dataset is deprecated, or
planned maintenance affects availability.

### REQ-006 — Contract Discoverability

All data contracts SHOULD be discoverable through a central data catalog providing:
a searchable index by team/domain, current health status (SLO compliance), schema
browsing, lineage visualization (which pipelines produce/consume each dataset), and
a self-service consumer-registration workflow.

## Integration with Existing Standards

- **`contract-test-assistant` (skill)** — this standard is its data-side anchor;
  the skill's data-contract guidance references these requirements.
- **`data-pipeline`** — pipelines run contract tests (REQ-004) on every execution.
- **`schema-evolution`** — MAJOR contract versions correspond to breaking schema
  changes governed by expand-contract.
- **`audit-trail` / `pii-classification`** — contract retention and field-level
  sensitivity align with the compliance pack (XSPEC-066).

## Related Specs

- XSPEC-068 — UDS data-engineering pack (this standard's source)
- XSPEC-066 — Compliance & audit pack (retention, PII tiering)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: spec format, quality SLOs, versioning/governance, automated testing, consumer registration, discoverability (XSPEC-068) |
