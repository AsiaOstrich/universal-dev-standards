# Audit Trail Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/audit-trail.ai.yaml`
> **Spec**: XSPEC-066 (cross-project/specs/XSPEC-066-uds-compliance-audit-pack.md)

## Overview

This standard defines the requirements for creating, storing, and managing
**immutable audit trails** across systems that handle sensitive data, financial
transactions, access-control changes, and compliance-relevant operations. It
covers mandatory event types, the audit-record schema, tamper-evidence
requirements, retention periods, query/export capabilities, and SIEM integration.
It is designed to satisfy SOC 2, ISO 27001, GDPR, and financial regulatory
requirements.

It is part of the **compliance & audit pack** (XSPEC-066) and the
audit-trail member is the core carrier of EU AI Act auditability (DEC-041) and of
the VibeOps Governance Agent intervention record (DEC-042). It composes with the
governance-gate family — `license-compliance` (XSPEC-193), `verification-oracle`
(XSPEC-256), and `model-provenance` (XSPEC-255) — whose gate verdicts are written
into an audit trail conforming to this standard.

> **Scope.** This standard defines *what* must be audited, the *record schema*,
> and the *immutability / retention / access* rules. The concrete storage engine
> (S3 Object Lock, append-only DB, hash-chain library) and the SIEM product are
> adoption choices, not part of this standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Mandatory auditable event types (auth, authz, data access, config, financial, compliance) | MUST |
| REQ-002 | Audit-record schema (mandatory + recommended fields) | MUST |
| REQ-003 | Immutability and tamper evidence (append-only + hash chain) | MUST |
| REQ-004 | Audit-log retention periods by category | MUST |
| REQ-005 | Query and export capability (filterable, exportable, query-of-query logged) | MUST |
| REQ-006 | SIEM integration and alerting | SHOULD |

### REQ-001 — Mandatory Auditable Event Types

Systems MUST capture audit records, without exception, for: (1) **Authentication**
— login success/failure, logout, MFA events, password changes; (2)
**Authorization** — access granted/denied, privilege escalation, role changes; (3)
**Data access** — read/write/delete of TIER-1 and TIER-2 PII (see
`pii-classification`), bulk data exports; (4) **Configuration changes** — system
settings, security-policy changes, user/role management; (5) **Financial
transactions** — payment processing, refunds, balance changes; (6)
**Compliance-relevant actions** — consent changes, data-erasure requests, legal
holds.

### REQ-002 — Audit Record Schema

Every audit record MUST contain: `event_id` (UUID v4), `event_type` (enumerated
string), `timestamp` (ISO 8601 UTC with milliseconds), `actor_id` (user or
service account), `actor_ip` (for user actions), `resource_type`, `resource_id`,
`action`, `outcome` (success/failure), and `environment` (production/staging). It
SHOULD also include `session_id`, `request_id` for correlation, before/after
state for mutations, and geographic region.

### REQ-003 — Immutability and Tamper Evidence

Audit logs MUST be written to an **append-only** store that prevents modification
or deletion by application-level principals. Each record MUST include a
cryptographic hash of the previous record (**chaining**) to detect tampering.
Write access to the audit store MUST be restricted to the audit service only — no
engineer or application service should have direct write access. Log integrity
MUST be verifiable on demand.

### REQ-004 — Audit Log Retention Periods

Audit logs MUST be retained according to these minimums by category:
authentication/authorization — 1 year hot, 6 years cold (SOC 2 / ISO 27001);
financial transactions — 7 years (financial regulations); PII access — 3 years;
configuration changes — 3 years; all other audit events — 1 year. Deletion of
audit records before their retention period expires is **PROHIBITED**. Logs
approaching expiry MUST be automatically archived to cold storage.

### REQ-005 — Audit Log Query and Export Capability

The audit system MUST support filtering by `event_type`, `actor_id`,
`resource_id`, time range, and `outcome`. Results MUST be exportable in JSON and
CSV. Queries returning PII MUST themselves be logged as audit events
(query-of-query). Audit data MUST be accessible to authorized compliance/security
teams within 4 hours of a request, and to regulators within 24 hours.

### REQ-006 — SIEM Integration and Alerting

Audit logs SHOULD be forwarded in real time to a SIEM system. The SIEM SHOULD
have automated detection rules for brute-force login patterns (>5 failures in
5 min), privilege escalation outside business hours, bulk PII exports (>1000
records in 1 hour), and access from new geographic regions. Alerts SHOULD trigger
on-call notification for high-severity detections.

## Integration with Existing Standards

- **`pii-classification`** — data-access auditing keys on the PII tier of the
  fields touched (TIER-1/TIER-2 reads are mandatory audit events).
- **`logging-standards`** — audit records are a distinct, immutable class above
  ordinary application logs; PII masking from `pii-classification` still applies.
- **`license-compliance` / `verification-oracle` / `model-provenance`** —
  governance-gate verdicts (block/override) are written into the audit trail.
- **`execution-history`** — general execution records are not a substitute for a
  compliance-grade, tamper-evident audit trail.

## Related Specs

- XSPEC-066 — UDS compliance & audit pack (this standard's source)
- DEC-041 — EU AI Act 2026 compliance (audit trail as auditability carrier)
- DEC-042 — Guardian / Governance Agent pattern (intervention auditability)
- DEC-020 — VibeOps commercial dual license (license-compliance auditing)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: event types, record schema, immutability/tamper evidence, retention, query/export, SIEM integration (XSPEC-066) |
