# Container Image Build and Security Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/container-image-standards.ai.yaml`
> **Spec**: XSPEC-065 (cross-project/specs/XSPEC-065-uds-infrastructure-pack.md)

**Scope**: universal

## Overview

This standard defines security and compliance requirements for container image
build pipelines. It covers five Dockerfile authoring principles (multi-stage
builds, non-root execution, minimal base images, secret-free build args, SBOM
metadata), SBOM generation and embedding using `syft` or `trivy`, and image
scanning policies that block Critical/High CVEs.

It is part of the **IaC pack** (XSPEC-065) and complements the existing
`containerization-standards` (layer ordering and tagging) by focusing on
supply-chain security and compliance attestation.

> **Scope.** This standard defines *what* a production image must guarantee
> (rootless, minimal, scanned, SBOM-attested) and the *severity policy* for CVEs.
> The concrete SBOM tool (`syft`/`trivy`), scanner, and registry are adoption
> choices, not part of this standard.

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Dockerfile five principles (multi-stage, non-root, minimal base, no secrets, SBOM label) | MUST |
| REQ-002 | SBOM embedding (generated in CI, embedded or attested, retained ≥12 months) | MUST |
| REQ-003 | Image scanning (Critical/High block; Medium ticketed; auto base updates) | MUST |

### REQ-001 — Dockerfile Five Principles

Every production Dockerfile MUST follow five principles: (1) **Multi-stage build**
— separate builder and runtime stages to minimize final image size and attack
surface; (2) **Non-root final user** — the runtime stage MUST set a non-root
`USER` (UID ≥ 1000); running as root in production containers is prohibited;
(3) **Distroless or Alpine base** — use distroless (`gcr.io/distroless`) or
Alpine-based images as the final stage to minimize CVE exposure; avoid full
Debian/Ubuntu unless justified and documented; (4) **No hardcoded secrets** —
build ARGs and ENV variables MUST NOT contain secrets; secrets are injected at
runtime via volume mounts or secret managers (see `secret-management-standards`);
(5) **SBOM metadata label** — the final image MUST include an OCI label
`org.opencontainers.image.source` and a build-time label
`org.opencontainers.image.revision` containing the git commit SHA.

### REQ-002 — SBOM Embedding

Every production container image MUST have a Software Bill of Materials (SBOM)
generated during the CI build step, using `syft` or `trivy` in CycloneDX or SPDX
format. The SBOM MUST be either (a) embedded as an OCI image annotation
(preferred for OCI-compliant registries), or (b) attached as a `cosign`
attestation to the image digest. SBOM artifacts MUST be stored alongside the
image in the container registry and retained for at least 12 months for
compliance audits.

### REQ-003 — Image Scanning

All container images MUST be scanned for known CVEs before being pushed to a
production registry, using `trivy`, `grype`, or equivalent integrated into the CI
pipeline. Severity policy: **Critical and High** CVEs MUST block the build and
prevent promotion to production; **Medium** CVEs MUST generate a warning and
create a tracked ticket; **Low and Negligible** CVEs are informational only.
Base image updates MUST be triggered automatically when upstream images receive
CVE patches (e.g., via Dependabot or Renovate for Dockerfile base image pins).

## Anti-Patterns

- Using the `latest` tag for base images in production Dockerfiles (non-reproducible builds).
- Running container processes as root (UID 0) in the final runtime stage.
- Embedding secrets in Docker build ARGs or ENV variables that persist in image layers.
- Skipping SBOM generation to save CI time, losing supply-chain traceability.
- Pushing images to production without CVE scanning results.

## Integration with Existing Standards

- **`containerization-standards`** — covers layer ordering and tagging; this
  standard adds the supply-chain-security and attestation layer on top.
- **`secret-management-standards`** — runtime secret injection replaces any
  build-time secret in ARGs/ENV (REQ-001 principle 4).
- **`supply-chain-security-standards`** — the SBOM and CVE-scanning policy here is
  the container-image facet of the broader supply-chain posture.
- **`iac-design-principles`** — image build/promotion is itself versioned,
  reproducible infrastructure.

## Related Specs

- XSPEC-065 — UDS infrastructure (IaC) pack (this standard's source)
- DEC-043 — UDS coverage completeness roadmap (Wave 4 scope)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~003: Dockerfile five principles, SBOM embedding, image scanning (XSPEC-065) |
