# Secret Management and Credential Hygiene Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/secret-management-standards.ai.yaml`
> **Spec**: XSPEC-065 (cross-project/specs/XSPEC-065-uds-infrastructure-pack.md)

## Overview

This standard defines how teams store, inject, rotate, and audit secrets and
credentials across development and production environments. It covers three
approved secret source tiers (Vault dynamic secrets, Cloud KMS, SOPS+Git),
rotation policies by credential type, automated hardcoded-secret prevention via
pre-commit and CI scanning, and safe secret injection patterns. It is designed to
eliminate credentials from source code and CI logs while remaining operationally
practical across team sizes.

It is part of the **IaC pack** (XSPEC-065) and serves as the cross-cutting
*primary owner* for secret handling: it is referenced by container image builds
(`container-image-standards`), compliance auditing (`audit-trail`), and SRE
runbooks that store credentials.

> **Scope.** This standard defines the *approved sources*, *rotation cadence*,
> *prevention layers*, and *injection patterns* for secrets. The choice between
> Vault / Cloud KMS / SOPS and the specific scanning tool are adoption choices.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Secret source three options (Vault / Cloud KMS / SOPS+Git) | MUST |
| REQ-002 | Rotation policy by type | MUST |
| REQ-003 | Hardcoded secret prevention (pre-commit + CI scan) | MUST |
| REQ-004 | Secret injection (env vars or mounted files only) | MUST |

### REQ-001 — Secret Source Three Options

Teams MUST use one of three approved secret source tiers based on operational
context: (1) **HashiCorp Vault dynamic secrets** (preferred for production and
multi-team environments) — secrets generated on-demand with short TTLs, no static
credentials stored anywhere; (2) **Cloud KMS with native secret managers** (AWS
Secrets Manager / GCP Secret Manager / Azure Key Vault) — suitable for
cloud-native deployments, secrets fetched at runtime via IAM-controlled API
calls; (3) **SOPS + Git encryption** — suitable for small teams and GitOps
workflows, secrets encrypted with `age` or a KMS key before committing and
decrypted only in trusted runtime environments. Storing unencrypted secrets in
any other location (env files, wiki, chat) is **PROHIBITED**.

### REQ-002 — Rotation Policy by Type

All secrets MUST have a defined rotation policy enforced by automated tooling or
calendar reminders. Minimum rotation frequencies by type: **Database
credentials** — every 90 days; **API keys** (third-party services) — every 180
days; **Signing keys** (JWT, code signing) — every 365 days; **One-time tokens
and session credentials** — revoke immediately after use, MUST NOT be reused;
**TLS certificates** — rotate at least 30 days before expiry, automate with
ACME/Let's Encrypt or cert-manager where possible. Rotation events MUST be logged
in the audit trail.

### REQ-003 — Hardcoded Secret Prevention

Teams MUST implement automated scanning to detect and block hardcoded secrets
before they reach the repository. Two layers are REQUIRED: (1) **Pre-commit hook**
using `detect-secrets`, `gitleaks`, or `truffleHog` — scans staged files and
blocks the commit if patterns are detected; (2) **CI pipeline scan** — rescans
all changed files on every PR and blocks merge if secrets are found. Minimum
detected patterns: AWS access key format (`AKIA[0-9A-Z]{16}`), PEM private key
headers (`-----BEGIN .* PRIVATE KEY`), generic API token patterns
(`api[_-]?key\s*[:=]\s*\S{16,}`), and connection strings containing passwords.

### REQ-004 — Secret Injection

Secrets MUST be injected into application processes via environment variables or
mounted files only. Passing secrets via command-line arguments is **PROHIBITED**
(visible in process lists). Passing secrets via URL query parameters is
**PROHIBITED** (logged by proxies and servers). For environment variable
injection, use the platform's native secret injection (Kubernetes Secrets, ECS
task definition secrets, GitHub Actions secrets). For file-based injection, mount
secrets as read-only volumes with restrictive file permissions (0400 or 0600).

## Anti-Patterns

- Hardcoding credentials directly in source code or configuration files.
- Storing secrets in CI/CD environment variables without encryption (plaintext in UI).
- Sharing credentials across multiple environments (dev/staging/prod use same secret).
- Long-lived static credentials without rotation schedules.
- Committing `.env` files containing real secrets to version control.

## Integration with Existing Standards

- **`iac-design-principles`** — secret backends (Vault/KMS state) are themselves
  versioned, access-controlled infrastructure.
- **`audit-trail`** — rotation, access, and injection events are auditable
  operations (REQ-002 mandates logging rotation events).
- **`pii-classification`** — credentials guarding TIER-1 PII inherit the strictest
  handling controls.
- **`security-standards`** — this standard is the credential-hygiene facet of the
  broader security baseline.

## Related Specs

- XSPEC-065 — UDS infrastructure (IaC) pack (this standard's source)
- DEC-043 — UDS coverage completeness roadmap (Wave 4 scope; D1 cross-cutting owner)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~004: secret source options, rotation policy, hardcoded-secret prevention, secret injection (XSPEC-065) |
