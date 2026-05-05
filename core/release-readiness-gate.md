# Release Readiness Gate

> **Language**: English | [繁體中文](../locales/zh-TW/core/release-readiness-gate.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-05
**Applicability**: All software projects preparing a production release
**Scope**: universal
**Industry Standards**: ISO/IEC 25010 (Product Quality), ISTQB Advanced Test Manager
**References**: `core/release-quality-manifest.md`, `core/flow-based-testing.md`

---

## Purpose

This standard defines a **single, aggregated Release Readiness Gate** that unifies all quality dimensions into one explicit go/no-go decision before production deployment.

Without this gate, quality evidence is spread across 16+ separate standards. Teams pass individual checks but ship with unverified dimensions, because no one document says "you must pass *all of these* before release."

The Release Readiness Gate:
- **Aggregates** 16 quality dimensions into a tiered checklist
- **Connects** human sign-off (this document) to machine-readable evidence (`release-quality-manifest.md`)
- **Distinguishes** blocking criteria from advisory warnings
- **Scales** via Tier-1 / Tier-2 / Tier-3 classification to fit projects of different types and risk levels

---

## Relationship to Release Quality Manifest (RQM)

| Artifact | Format | Audience | Purpose |
|----------|--------|----------|---------|
| **Release Readiness Sign-off** (this document's template) | Markdown checklist | Humans (PM, QA, Eng Lead, Business) | Go/no-go decision, accountability, audit trail |
| **Release Quality Manifest** (`release-quality-manifest.md`) | YAML/JSON | CI, tooling, customers | Machine-readable aggregation, automated gate enforcement |

These two artifacts are generated **in parallel** for every release. The Sign-off covers human-verified dimensions; the RQM covers automated dimensions. Both must be `PASS` / `WARN` (never `FAIL`) before production deployment.

---

## Tier Classification

| Tier | Requirement | Miss = ? | Who Applies |
|------|-------------|---------|-------------|
| **Tier-1** | Must pass; release blocked if `FAIL` | Hard block | All projects |
| **Tier-2** | Should pass; `WARN` documented with rationale; no block | Documented WARN | All projects |
| **Tier-3** | Applicable when feature set or domain requires it; `N/A` is valid | N/A accepted | Depends on project type |

---

## 16-Dimension Release Readiness Matrix

| # | Dimension | Tier | Gate Type | Blocking Criterion | Evidence | Standard | Responsible |
|---|-----------|------|-----------|-------------------|----------|---------|-------------|
| 1 | **Performance / Load** | 2 | Automated | p95 latency regression > 10%; headroom < 20% | Load test report | `performance-standards.md` | Eng Lead + SRE |
| 2 | **Security** (SAST/DAST/SCA/secrets) | 1 | Automated | Any Critical/High CVE, SAST High unfixed, secret in diff | SARIF, Trivy, SBOM | `pipeline-security-gates.md` | SecEng / Eng Lead |
| 3 | **Accessibility (a11y)** | 2 | Automated + Manual | axe-core critical > 0; keyboard nav path broken | axe report, screen reader log | `accessibility-standards.md` §Release-Blocking Threshold | QA + UX |
| 4 | **API / Contract Testing** | 3 | Automated | Upstream consumer contract red; N-1 compat broken | Pact broker report | `contract-testing-standards.md` | API owner |
| 5 | **Database Migration** | 1 | Automated | up/rollback/idempotency test fails; data-preservation test fails | `data-migration-testing.md` gate results | `data-migration-testing.md` | DB Lead |
| 6 | **Cross-flow Regression** | 2 | Automated | Critical user journey pass rate < 95%; business-critical flow combo fails | Cross-flow regression report | `cross-flow-regression.md` | QA Lead |
| 7 | **Operational Readiness** | 1 | Manual | Runbook missing; alerting unconfigured; no rollback procedure | Runbook link, alert rule review | `runbook-standards.md`, `alerting-standards.md` | SRE / Ops |
| 8 | **Localization / i18n** | 2 | Automated | MISSING or MAJOR i18n gap in release (semver gap) | `check-translation-sync.sh` output | `translation-lifecycle-standards.md` | i18n Lead |
| 9 | **Browser / Device Compatibility** | 3 | Automated | Tier-1 browser/device pass rate < 100% | Playwright matrix report | `browser-compatibility-standards.md` | Frontend QA |
| 10 | **Capacity Sign-off** | 3 | Manual | Headroom < 30% at projected peak; no Eng+SRE sign-off | Capacity forecast + sign-off | `performance-standards.md` §Per-Release Capacity Sign-off | SRE + Eng Lead |
| 11 | **Compliance / Privacy** | 3 | Manual | GDPR/CCPA violation; audit log missing; retention policy broken | Privacy review checklist | `privacy-standards.md` | DPO / Legal |
| 12 | **Documentation Completeness** | 2 | Manual | CHANGELOG missing for release; customer-facing docs not updated | CHANGELOG diff, docs review | `changelog-standards.md`, `documentation-lifecycle.md` | Tech Writer / PM |
| 13 | **Rollback / Disaster Recovery** | 1 | Manual | No tested rollback procedure for this release; RTO > threshold | DR drill record; rollback script | `rollback-standards.md`, `disaster-recovery-drill.md` | SRE |
| 14 | **Production Smoke / Canary** | 1 | Automated | Post-deploy smoke fails; canary error rate > SLO | Smoke test results; canary dashboard | `smoke-test.md`, `cd-deployment-strategies.md` | SRE / DevOps |
| 15 | **Feature Flag Governance** | 2 | Manual | Default state not reviewed; kill-switch not tested | Flag audit checklist | `feature-flag-standards.md` | PM + Eng Lead |
| 16 | **Multi-Gate Flow Verification** | 2 | Automated + Manual | Gate 0 missing for any flow with ≥ 3 steps; Gate 3 CI fail; Gate 4 UAT sign-off missing | `flow_gate_report.json`; UAT sign-off table | `flow-based-testing.md` §Multi-Gate | QA Lead + Business |

> **Note on Tier-3**: Mark as `N/A` when not applicable (e.g., browser matrix for a CLI tool; contract testing for a standalone service with no API consumers). `N/A` requires a rationale comment in the sign-off.

---

## Release Readiness Sign-off Template

> Copy this template for each release. File as `.release-readiness/<version>.md` in the repo root, or attach to the release artifact.

```markdown
# Release Readiness Sign-off

**Release**: [tag/version]
**Date**: [YYYY-MM-DD]
**Environment**: Pre-Production → Production
**RQM Artifact**: [link or commit SHA]

## Tier-1 Gates (ALL must be PASS)

| # | Dimension | Status | Evidence | Sign-off |
|---|-----------|--------|----------|---------|
| 2 | Security (SAST/DAST/SCA) | PASS / FAIL | [link] | [name] |
| 5 | Database Migration | PASS / FAIL | [link] | [name] |
| 7 | Operational Readiness | PASS / FAIL | [link] | [name] |
| 13 | Rollback / DR | PASS / FAIL | [link] | [name] |
| 14 | Production Smoke/Canary | PASS / FAIL | [link] | [name] |

## Tier-2 Gates (WARN must have rationale)

| # | Dimension | Status | Evidence | Rationale (if WARN) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 1 | Performance / Load | PASS / WARN / FAIL | [link] | | [name] |
| 3 | Accessibility | PASS / WARN / FAIL | [link] | | [name] |
| 6 | Cross-flow Regression | PASS / WARN / FAIL | [link] | | [name] |
| 8 | Localization / i18n | PASS / WARN / FAIL | [link] | | [name] |
| 12 | Documentation | PASS / WARN / FAIL | [link] | | [name] |
| 15 | Feature Flag Governance | PASS / WARN / FAIL | [link] | | [name] |
| 16 | Multi-Gate Flow Verification | PASS / WARN / FAIL | [link] | | [name] |

## Tier-3 Gates (N/A with rationale allowed)

| # | Dimension | Status | Evidence | Rationale (if N/A) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 4 | API / Contract Testing | PASS / WARN / N/A | [link] | | [name] |
| 9 | Browser / Device Compat | PASS / WARN / N/A | [link] | | [name] |
| 10 | Capacity Sign-off | PASS / WARN / N/A | [link] | | [name] |
| 11 | Compliance / Privacy | PASS / WARN / N/A | [link] | | [name] |

## Overall Decision

- [ ] **GO** — All Tier-1 PASS; all WARN documented; all N/A have rationale
- [ ] **NO-GO** — One or more Tier-1 FAIL, or undocumented WARN

**Decision made by**: [name, role]
**Date**: [YYYY-MM-DD]
```

---

## Status Semantics

| Status | Meaning | Release Impact |
|--------|---------|----------------|
| `PASS` | Meets or exceeds all criteria | None |
| `WARN` | Below target but above hard minimum; rationale documented | Allowed; logged |
| `FAIL` | Below hard minimum; unresolved | **Blocks release** |
| `N/A` | Dimension not applicable to this project/release; rationale documented | Allowed |

---

## When to Create the Sign-off

| Milestone | Action |
|-----------|--------|
| Release candidate tagged | Create `.release-readiness/<version>.md` from template; fill evidence links |
| Pre-UAT deployment | Gate 3 CI results populated; Tier-1 automated gates verified |
| UAT sign-off (Gate 4) | Tier-3 manual gates completed; Multi-Gate Flow row finalized |
| Production deployment decision | Overall GO/NO-GO decision signed by release owner |

The sign-off is **not** an afterthought — Gate 0 (PRD completeness) and Gate 1 (PR-level tests) must be satisfied long before the sign-off document is created. The sign-off aggregates evidence that was being collected throughout the release cycle.

---

## Anti-Patterns

- **Creating the sign-off the day of deployment** — evidence should be collected incrementally throughout the release cycle
- **Marking WARN without rationale** — WARN without documented reason is functionally equivalent to ignoring the gate
- **Skipping Tier-3 entirely without N/A rationale** — if browser testing is omitted for a web app, that must be explicitly justified
- **Treating the Sign-off as a rubber stamp** — every row requires a named sign-off owner; anonymous collective ownership means no real accountability
- **Using a shared sign-off for multiple releases** — one sign-off per release tag; do not reuse across versions

---

## See Also

- `release-quality-manifest.md` — machine-readable RQM (the automated counterpart to this sign-off)
- `flow-based-testing.md` — Multi-Gate Flow Model (Dimension 16)
- `branch-completion.md` — branch-level gate (prerequisite; not equivalent to release readiness)
- `verification-evidence.md` — evidence standards (all evidence links must meet this standard)
- `deployment-standards.md` — post-deploy gate integration

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | Initial release: 16-dimension matrix, tiered sign-off template, RQM integration |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
