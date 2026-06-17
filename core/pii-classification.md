# PII Classification and Handling Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/pii-classification.ai.yaml`
> **Spec**: XSPEC-066 (cross-project/specs/XSPEC-066-uds-compliance-audit-pack.md)

## Overview

This standard defines how **Personally Identifiable Information (PII)** and
sensitive personal data is classified, labeled, stored, transmitted, and disposed
of. It covers a three-tier data-sensitivity classification, mandatory handling
controls per tier, data-minimization principles, consent-management requirements,
retention/deletion schedules, and cross-border transfer restrictions. It is
aligned with GDPR Article 9, CCPA, and general privacy-by-design principles.

It is part of the **compliance & audit pack** (XSPEC-066). The PII tiers it
defines drive the masking rules executed by `logging-standards` and the
mandatory data-access events recorded by `audit-trail`.

> **Scope.** This standard defines the *classification tiers* and the *handling
> controls* per tier. The concrete masking/tokenization library, the secrets
> store for encryption keys, and the PIA workflow tool are adoption choices.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | PII data-sensitivity classification (TIER-1/2/3) | MUST |
| REQ-002 | Data minimization and purpose limitation | MUST |
| REQ-003 | PII masking and anonymization in non-production | MUST |
| REQ-004 | Data retention and deletion schedule | MUST |
| REQ-005 | Cross-border data-transfer controls | MUST |
| REQ-006 | PII impact assessment (PIA) for new features | SHOULD |

### REQ-001 — PII Data Sensitivity Classification

All data fields containing personal information MUST be classified into one of
three tiers before storage or processing:

| Tier | Examples | Required controls |
|------|----------|-------------------|
| **TIER-1** (Highly sensitive) | Health data, financial account numbers, government IDs, biometrics, passwords, SSNs | Encryption at rest and in transit, access logging, no caching |
| **TIER-2** (Sensitive) | Full name + contact-info combination, location history, behavioral profiles, IP addresses | Encryption in transit, access controls |
| **TIER-3** (General PII) | First name only, country-level location, general demographics | Standard access controls |

### REQ-002 — Data Minimization and Purpose Limitation

Systems MUST collect only the minimum PII necessary for the explicitly stated
purpose. Each PII field in the data model MUST have a documented business purpose
and legal basis (consent, contract, legitimate interest, legal obligation).
Collecting PII without a documented purpose is **PROHIBITED**. Purpose limitation
MUST be enforced: data collected for purpose A MUST NOT be used for an unrelated
purpose B without separate consent.

### REQ-003 — PII Masking and Anonymization in Non-Production

PII MUST NOT exist in non-production environments (development, staging, test)
unless explicitly required and approved. Test/staging databases MUST use
anonymized or synthetic data. Any approved exception MUST be time-limited,
access-controlled, and documented. PII MUST be masked in application logs:
email as `u***@domain.com`, phone as `+1-XXX-XXX-1234`, card numbers as
`****-****-****-1234`.

### REQ-004 — Data Retention and Deletion Schedule

Every data category containing PII MUST have a documented retention schedule with
a maximum retention period aligned to legal requirements and business need.
Automated deletion MUST be implemented for data past its retention period.
Deletion MUST be verifiable (deletion receipts or audit logs). Users exercising
the right to erasure MUST receive deletion confirmation within 30 days (GDPR) or
45 days (CCPA).

### REQ-005 — Cross-Border Data Transfer Controls

Transfers of TIER-1 or TIER-2 PII across national borders MUST comply with
applicable transfer mechanisms. EU → non-adequate-country transfers MUST use
Standard Contractual Clauses (SCCs) or Binding Corporate Rules. Data-residency
requirements MUST be documented in the system design. Cross-border transfers MUST
be logged with destination country and legal basis.

### REQ-006 — PII Impact Assessment for New Features

Any new feature or system change that introduces new PII collection or processing
SHOULD undergo a Privacy Impact Assessment (PIA) before implementation. The PIA
MUST document what PII is collected, the purpose, legal basis, retention period,
third-party sharing, and risk mitigations. Features with TIER-1 PII require a
mandatory PIA; TIER-2 is recommended.

## Integration with Existing Standards

- **`audit-trail`** — TIER-1/TIER-2 PII reads, exports, and erasure requests are
  mandatory audit events.
- **`logging-standards`** — executes the masking rules this standard mandates.
- **`security-standards`** — encryption-at-rest/in-transit controls for TIER-1
  reference the project's security baseline.
- **`database-standards`** — data-dictionary fields carry the PII tier and the
  documented purpose/legal basis from REQ-002.

## Related Specs

- XSPEC-066 — UDS compliance & audit pack (this standard's source)
- DEC-041 — EU AI Act 2026 compliance (PII handling as a compliance pillar)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~006: PII tiers, data minimization, non-prod masking, retention/deletion, cross-border transfer, PIA (XSPEC-066) |
