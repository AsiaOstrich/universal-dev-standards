# Supply Chain Security Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/supply-chain-security-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: All software projects with external dependencies
**Scope**: universal
**Industry Standards**: SLSA, SPDX, CycloneDX, OpenSSF Scorecard
**References**: [slsa.dev](https://slsa.dev/), [spdx.dev](https://spdx.dev/), [cyclonedx.org](https://cyclonedx.org/)

---

## Overview

This document defines supply chain security standards covering Software Bill of Materials (SBOM), dependency auditing, SLSA maturity levels, license compliance, and dependency health assessment.

---

## Software Bill of Materials (SBOM)

### SBOM Formats Comparison

| Aspect | SPDX | CycloneDX |
|--------|------|-----------|
| **Maintainer** | Linux Foundation | OWASP |
| **Primary Focus** | License compliance + security | Security + component analysis |
| **Format** | JSON, RDF, YAML, Tag-Value | JSON, XML, Protobuf |
| **ISO Standard** | ISO/IEC 5962:2021 | ECMA-424 |
| **Ecosystem** | Strong in open source governance | Strong in DevSecOps tooling |

### Selection Guide

- **Choose SPDX** when license compliance is the primary concern or ISO certification is required
- **Choose CycloneDX** when security analysis and DevSecOps integration are priorities
- **Either format** is acceptable; consistency within an organization is more important than the choice

### SBOM Requirements

- Every release MUST include an SBOM listing all direct and transitive dependencies
- SBOM MUST include: component name, version, supplier, license, and known vulnerabilities
- SBOM SHOULD be generated automatically as part of the CI/CD pipeline

---

## Dependency Audit

### Four Audit Dimensions

| Dimension | What to Check | Severity |
|-----------|--------------|----------|
| **Known Vulnerabilities** | CVE database (NVD, OSV, GitHub Advisory) | Critical: block, High: warn |
| **License Compliance** | License compatibility with project license | Incompatible: block |
| **Maintenance Status** | Last commit date, open issues, maintainer count | Unmaintained > 2 years: warn |
| **Version Currency** | How many major/minor versions behind latest | Major behind > 2: warn |

### Audit Frequency

| Trigger | Action |
|---------|--------|
| Every CI build | Vulnerability scan (automated) |
| Weekly | Full audit report (automated) |
| Before release | Manual review of all warnings |
| On security advisory | Immediate assessment of affected deps |

---

## SLSA Levels

Supply-chain Levels for Software Artifacts define maturity levels for build integrity:

| Level | Requirements | Applicable Scenario |
|-------|-------------|-------------------|
| **L1 — Provenance** | Build process documented; SBOM generated | All projects (minimum baseline) |
| **L2 — Build Service** | Build on hosted service; signed provenance | Projects with CI/CD pipelines |
| **L3 — Hardened Builds** | Isolated, ephemeral build environments; non-falsifiable provenance | Security-critical applications |
| **L4 — Two-Party Review** | Two-person review for all changes; hermetic builds | Infrastructure, financial systems |

### Progression Path

Start at L1, progressively adopt higher levels based on risk profile:

```
L1 (All projects) → L2 (CI/CD projects) → L3 (Security-critical) → L4 (High-assurance)
```

---

## License Compliance

### License Category Matrix

| Category | Examples | Compatibility | Risk |
|----------|---------|--------------|------|
| **Permissive** | MIT, Apache-2.0, BSD-2/3 | Compatible with almost everything | Low |
| **Weak Copyleft** | LGPL-2.1, MPL-2.0 | Compatible if used as library (not modified) | Medium |
| **Strong Copyleft** | GPL-2.0, GPL-3.0 | Requires derivative works to use same license | High |
| **Network Copyleft** | AGPL-3.0 | Extends copyleft to network interaction | Very High |
| **Proprietary** | Custom, No License | Cannot use without explicit permission | Block |

### Compliance Rules

- **Permissive + Permissive**: Always compatible
- **Permissive + Copyleft**: Compatible if copyleft terms are followed
- **Copyleft + Different Copyleft**: Often incompatible — legal review required
- **AGPL in SaaS**: Triggers copyleft for the entire service — requires careful evaluation
- **No License**: Treat as proprietary — do not use without explicit permission

---

## Dependency Update Strategy

| Update Type | Strategy | Automation |
|-------------|----------|-----------|
| **Patch** (x.y.Z) | Auto-merge after CI passes | Fully automated (Dependabot/Renovate) |
| **Minor** (x.Y.0) | Auto-create PR, manual review | Semi-automated |
| **Major** (X.0.0) | Manual evaluation, migration plan | Manual with changelog review |
| **Lock Strategy** | Use lock files (package-lock.json, yarn.lock, Pipfile.lock) | Always committed to Git |

### Update Rules

- Lock files MUST be committed to version control
- Patch updates SHOULD be applied within 7 days
- Security patches MUST be applied within 48 hours (Critical) or 7 days (High)
- Major version upgrades SHOULD be evaluated quarterly

---

## CI/CD Integration

### Pipeline Security Gate

Dependency scanning MUST be integrated into CI/CD:

```
PR Created → Dependency Scan → Results
                                  │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              Critical         High           Medium/Low
              → Block PR       → Warn +       → Log only
                               Create Ticket
```

### Required Pipeline Steps

1. **SBOM Generation** — Produce SBOM on every build
2. **Vulnerability Scan** — Check against CVE databases
3. **License Scan** — Verify license compatibility
4. **Dependency Freshness** — Report outdated dependencies

---

## Dependency Health Assessment

### Health Metrics

| Metric | Healthy | Warning | Unhealthy |
|--------|---------|---------|-----------|
| **Last update date** | < 6 months | 6-24 months | > 24 months |
| **Known CVEs** | 0 Critical/High | 1-2 High | Any Critical unpatched |
| **Maintainer count** | ≥ 3 | 2 | 1 (bus factor risk) |
| **Community activity** | Active issues/PRs | Slow response | Abandoned |
| **Download trends** | Stable or growing | Declining | Near zero |

### Health Score

Combine metrics into an overall health score:
- **Green** (Healthy): No warnings on any metric
- **Yellow** (Caution): 1-2 warning-level metrics
- **Red** (Action Required): Any unhealthy metric or Critical CVE

---

## Quick Reference Card

```
New dependency? → Check: License compatible? CVE-free? Maintained? Popular?
CI build?       → Auto-scan vulnerabilities + licenses
Release?        → Generate SBOM, review all warnings
Critical CVE?   → Patch within 48 hours
```

---

## References

- [SLSA Framework](https://slsa.dev/) — Supply-chain Levels for Software Artifacts
- [SPDX Specification](https://spdx.dev/) — Software Package Data Exchange
- [CycloneDX](https://cyclonedx.org/) — OWASP Software Bill of Materials standard
- [OpenSSF Scorecard](https://securityscorecards.dev/) — Automated security health checks

---

**Related Standards:**
- [Security Standards](security-standards.md) — Application security
- [Containerization Standards](containerization-standards.md) — Image vulnerability scanning
- [Deprecation Standards](deprecation-standards.md) — Dependency sunset notifications

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
