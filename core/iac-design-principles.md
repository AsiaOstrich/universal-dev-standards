# Infrastructure as Code Design Principles

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/iac-design-principles.ai.yaml`
> **Spec**: XSPEC-065 (cross-project/specs/XSPEC-065-uds-infrastructure-pack.md)

**Scope**: universal

## Overview

This standard defines the four foundational principles for Infrastructure as Code
(IaC) authoring: **reproducible, immutable, idempotent, and versioned**. It covers
state management requirements (remote state with locking), drift detection
categories, and CI/CD integration. It is designed to ensure infrastructure
changes are traceable, reversible, and safe to apply repeatedly without unintended
side effects.

It is part of the **IaC pack** (XSPEC-065) and is the tool-agnostic foundation
that `container-image-standards` and `secret-management-standards` build on
(images and secret backends are themselves versioned, reproducible
infrastructure).

> **Scope.** This standard defines the *authoring principles*, *state-management*
> rules, and the *drift-handling taxonomy*. The specific IaC tool (Terraform /
> Pulumi / CloudFormation) and backend are adoption choices, not part of this
> standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | IaC four principles (reproducible, immutable, idempotent, versioned) | MUST |
| REQ-002 | State management (remote backend, locking, encryption, no local state in VCS) | MUST |
| REQ-003 | Drift detection (plan on PR; three-category classification) | MUST |

### REQ-001 — IaC Four Principles

All infrastructure definitions MUST adhere to four foundational principles:
(1) **Reproducible** — given the same inputs and state, applying IaC produces
identical infrastructure; (2) **Immutable** — infrastructure changes are applied
by replacing resources, not mutating them in-place; blue/green or rolling
replacement patterns are preferred over in-place mutations; (3) **Idempotent** —
applying the same IaC configuration multiple times produces the same result
without error or unintended side effects; (4) **Versioned** — all IaC definitions
are stored in version control with meaningful commit messages; no infrastructure
change is made outside the VCS workflow.

### REQ-002 — State Management

IaC state MUST be stored in a remote backend with locking enabled to prevent
concurrent modifications. Local state files MUST NOT be committed to version
control or used in CI/CD pipelines. Recommended backends: Terraform Cloud /
S3+DynamoDB (Terraform), Pulumi Service / S3 (Pulumi), CloudFormation native
stack state. State access MUST be restricted to authorized principals via IAM or
equivalent. State encryption at rest is REQUIRED.

### REQ-003 — Drift Detection

Teams MUST run `plan` (or equivalent) in CI on every pull request to detect
configuration drift. Drift outcomes MUST be classified into one of three
categories and handled accordingly: (1) **rollback-to-code** — actual infra
deviates from code due to a manual change; revert actual to match code on next
apply; (2) **update-code-from-actual** — actual reflects an intentional change not
yet codified; update IaC to match, then apply; (3) **manual-reconcile** — drift
requires human judgment (e.g., data volume changes); escalate to the infra owner
with a documented decision. Drift reports SHOULD be published to a team channel on
a scheduled cadence (e.g., daily).

## Anti-Patterns

- Committing local state files (`terraform.tfstate`) to version control.
- Applying mutable in-place changes (e.g., sed-patching running VMs) instead of replacing resources.
- Making manual console changes without updating the corresponding IaC definition.
- Using no remote locking, allowing concurrent applies that corrupt state.
- Pinning to `latest` provider or module versions, breaking reproducibility.

## Integration with Existing Standards

- **`container-image-standards`** — container images are versioned, reproducible
  artifacts produced under the same principles.
- **`secret-management-standards`** — secret backends (Vault/KMS) are managed as
  access-controlled infrastructure with remote state.
- **`deployment-standards` / `cd-deployment-strategies`** — immutable replacement
  (REQ-001) underpins blue/green and rolling deployment patterns.
- **`no-cicd-deployment`** — even without a CI/CD platform, the four principles and
  state-management rules still apply to scripted infrastructure changes.

## Related Specs

- XSPEC-065 — UDS infrastructure (IaC) pack (this standard's source)
- DEC-043 — UDS coverage completeness roadmap (Wave 4 scope)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~003: IaC four principles, state management, drift detection (XSPEC-065) |
