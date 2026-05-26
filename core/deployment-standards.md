# Deployment Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/deployment-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-05-26
**Applicability**: All software projects with deployment pipelines
**Scope**: universal
**Industry Standards**: Twelve-Factor App, Google SRE — Release Engineering, DORA State of DevOps
**References**: [12factor.net](https://12factor.net/), [sre.google](https://sre.google/books/), [dora.dev](https://dora.dev/)

---

## Purpose

This standard defines guidelines for safely deploying software to production, covering deployment strategies, feature flags, rollback procedures, environment consistency, and deployment effectiveness metrics.

**Reference Standards**:
- [The Twelve-Factor App](https://12factor.net/) — Factor X: Dev/Prod Parity
- [Google SRE Book — Release Engineering](https://sre.google/sre-book/release-engineering/)
- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [DORA State of DevOps Report](https://dora.dev/)

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Deploy ≠ Release** | Deploying code to production and exposing it to users are separate actions; use feature flags to control exposure |
| **Progressive Exposure** | Roll out changes to increasingly larger audiences: internal → canary → percentage → general availability |
| **Quick Rollback** | Every deployment must have a tested rollback path that executes in under 5 minutes |
| **Environment Parity** | Keep development, staging, and production as similar as possible (Twelve-Factor App Factor X) |
| **Automate Everything** | Manual deployment steps are error-prone; automate build, test, deploy, and rollback |
| **Monitor Everything** | Deploy with observability; if you can't measure it, you can't safely deploy it |

---

## Deployment Strategy Selection

| Strategy | Use Case | Rollback Speed | Resource Cost | Complexity |
|----------|----------|----------------|---------------|------------|
| **Rolling** | Stateless services, standard updates | Medium (minutes) | Low (no extra infra) | Low |
| **Blue-Green** | Zero-downtime requirement, database-compatible changes | Fast (seconds, DNS/LB switch) | High (2× infrastructure) | Medium |
| **Canary** | High-risk changes, large user base | Fast (redirect traffic) | Medium (partial extra infra) | High |
| **Feature Flag** | Decoupling deploy from release, A/B testing | Instant (toggle off) | Low (code-level) | Medium |

### Decision Guide

```
Is zero downtime required?
├── Yes → Is the change high-risk or large-scale?
│         ├── Yes → Canary
│         └── No  → Blue-Green
└── No  → Is the change behind a feature flag?
          ├── Yes → Feature Flag (deploy anytime)
          └── No  → Rolling
```

### Strategy Combination

Strategies are not mutually exclusive. Common combinations:
- **Canary + Feature Flag**: Deploy canary with flag disabled, enable flag for canary group first
- **Blue-Green + Feature Flag**: Switch traffic to green, then progressively enable flags
- **Rolling + Feature Flag**: Roll out code, then control feature exposure separately

---

## Feature Flags Lifecycle

### Flag Types

| Type | Purpose | Lifetime | Example |
|------|---------|----------|---------|
| **Release** | Control feature rollout | Days to weeks | `enable_new_checkout` |
| **Experiment** | A/B testing | Weeks to months | `experiment_pricing_v2` |
| **Ops** | Operational control (kill switch) | Permanent | `enable_cache_layer` |
| **Permission** | User entitlements | Permanent | `feature_premium_export` |

### Lifecycle Stages

| Stage | Actions | Duration Target |
|-------|---------|-----------------|
| **1. Create** | Define flag, set default (off), document purpose and owner | Day 0 |
| **2. Enable** | Progressive rollout: 1% → 10% → 50% → 100% | Days to weeks |
| **3. Monitor** | Track metrics, error rates, user feedback | 1-2 weeks at 100% |
| **4. Cleanup** | Remove flag from code, delete configuration, update tests | Within 1 sprint after full rollout |

### Tech Debt Rules

| Rule | Enforcement |
|------|-------------|
| Release flags MUST be removed within **30 days** of full rollout | Automated reminder / ticket |
| Experiment flags MUST be removed within **90 days** | Quarterly audit |
| Every flag MUST have an **owner** and **expiry date** | Flag creation checklist |
| Flag count per service SHOULD NOT exceed **20** | Dashboard alert |

---

## Rollback Strategy

### Automatic Trigger Conditions

| Metric | Warning Threshold | Auto-Rollback Threshold | Window |
|--------|-------------------|-------------------------|--------|
| **Error Rate** | > 1% | > 5% | 5 min |
| **p95 Latency** | > 2× baseline | > 3× baseline | 5 min |
| **Health Check** | 1 failure | 3 consecutive failures | Immediate |
| **CPU Usage** | > 80% | > 95% | 10 min |
| **Memory Usage** | > 85% | > 95% | 10 min |

### Manual Trigger Scenarios

- Customer-reported critical bug affecting core functionality
- Security vulnerability discovered post-deployment
- Data corruption or inconsistency detected
- Regulatory compliance violation identified

### Severity Decision Matrix

| Severity | Impact | Action | Timeline |
|----------|--------|--------|----------|
| **P1 Critical** | Service down, data loss | Immediate rollback, all hands | < 5 min |
| **P2 High** | Major feature broken, significant user impact | Rollback within window | < 15 min |
| **P3 Medium** | Minor feature broken, workaround exists | Decide: rollback or hotfix | < 1 hour |
| **P4 Low** | Cosmetic issue, edge case | Forward-fix in next release | Next deploy |

### Rollback Methods

| Method | When to Use | Speed |
|--------|-------------|-------|
| **Revert deployment** | Application code issues, no DB changes | < 5 min |
| **Feature flag toggle** | Flag-controlled features showing issues | Instant |
| **Database rollback** | Schema migration failure (if reversible) | 5-30 min |

---

## Environment Consistency

### The Three Gaps (Twelve-Factor App)

| Gap | Anti-Pattern | Best Practice |
|-----|-------------|---------------|
| **Time Gap** | Weeks between dev and deploy | Deploy hours after development |
| **Personnel Gap** | Developers write, ops deploy | Developers who wrote code are involved in deploying it |
| **Tools Gap** | Different stacks per environment | Same backing services everywhere |

### Environment Parity Checklist

#### Infrastructure
- [ ] Same OS family and version across environments
- [ ] Same container runtime and orchestrator version
- [ ] Same network topology (load balancers, service mesh)
- [ ] Same resource allocation ratios (staging = production × scaling factor)

#### Application
- [ ] Same application version deployed to all environments
- [ ] Same dependency versions (lock files committed)
- [ ] Same runtime version (Node.js, Python, JVM, etc.)
- [ ] Same build artifacts (build once, deploy everywhere)

#### Data
- [ ] Same database engine and version
- [ ] Same schema migration tooling
- [ ] Realistic data volumes in staging (anonymized production data)
- [ ] Same message queue and cache implementations

#### Configuration
- [ ] Environment-specific values managed via environment variables
- [ ] No environment-specific code paths (no `if (env === 'production')`)
- [ ] Same secret management tool across environments
- [ ] Configuration differences documented and minimized

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code review approved
- [ ] No critical static analysis warnings
- [ ] Test coverage not decreased

### 2. Security
- [ ] Dependency vulnerability scan passed
- [ ] No secrets in code or configuration files
- [ ] Security headers configured
- [ ] Authentication/authorization changes reviewed

### 3. Performance
- [ ] Load testing completed for affected endpoints
- [ ] No performance regression detected
- [ ] Database query performance verified
- [ ] Cache invalidation strategy confirmed

### 4. Database
- [ ] Migration scripts tested on staging
- [ ] Rollback migration available and tested
- [ ] No breaking schema changes without backward compatibility
- [ ] Data migration verified with production-like volumes

### 5. Configuration & Dependencies
- [ ] Environment variables documented and set
- [ ] Feature flags configured with correct defaults
- [ ] Third-party service dependencies verified
- [ ] API version compatibility confirmed

### 6. Deployment Readiness
- [ ] Deployment runbook updated
- [ ] Rollback procedure documented and tested
- [ ] Monitoring dashboards prepared
- [ ] Alerting thresholds configured

### 7. Communication
- [ ] Stakeholders notified of deployment window
- [ ] On-call engineer identified and available
- [ ] Customer support briefed on changes
- [ ] Status page prepared (if public-facing)

---

## Defensive Deployment Ordering

When a deploy script replaces a running install (the destructive-update pattern common to Windows IIS, SystemD-managed services, or any "stop → swap → start" workflow), the ordering of destructive steps relative to verification is non-negotiable.

### The forbidden ordering

```
1. Stop service
2. Extract new package         ← may silently no-op on format mismatch
3. Delete old install          ← runs unconditionally — destroys the running install
4. Copy new install            ← throws (source doesn't exist)
5. Start service               ← cannot start (binaries gone)
```

If step 2 silently fails (corrupt archive, wrong format, disk full, permissions), step 3 still runs and **destroys the running install**, leaving nothing to recover from except backup. Backup helps for full rollback but does NOT prevent the outage window — the service is already down.

### The required ordering — extract, verify, then delete

The destructive deploy ordering **MUST** be:

```
1. Stop service
2. Extract new package → staging area      (NOT directly over live install)
3. ✅ VERIFY staging area contains expected artifacts
   ↑ if verification fails: abort, do NOT touch the live install
4. Backup live install                     (or done earlier — both is fine)
5. Delete old install (preserving logs / runtime data)
6. Copy new install from staging
7. Restore preserved configs
8. Start service
9. Sanity check (HTTP probe / health endpoint)
```

**Step 3 verification is non-negotiable.** Minimum verification is checking that at least one well-known file from the new package exists in the staging area. Hash-checking a manifest of expected files is preferred when available.

### Verification snippets

**PowerShell** (Windows IIS deploy):

```powershell
$staging = "C:\deploy\staging-$(Get-Date -Format yyyyMMddHHmmss)"
Expand-Archive -Path $zipPath -DestinationPath $staging -Force

# Non-negotiable: verify staging before touching live install
if (-not (Test-Path "$staging\api\MyApp.dll")) {
    throw "Expected $staging\api\MyApp.dll not found — archive may be corrupt or wrong format. Aborting deploy. Live install untouched."
}

# Only NOW touch live install
Copy-Item "$apiDir" "$backupDir" -Recurse -Force
Get-ChildItem $apiDir -Exclude logs | Remove-Item -Recurse -Force
Copy-Item "$staging\api\*" $apiDir -Recurse
```

**bash** (Linux SystemD-managed service):

```bash
set -euo pipefail

STAGING="/srv/deploy/staging-$(date +%Y%m%d%H%M%S)"
mkdir -p "$STAGING"
tar -xzf "$ARCHIVE" -C "$STAGING"

# Non-negotiable: verify staging before touching live install
if [ ! -f "$STAGING/bin/myapp" ]; then
  echo "ERROR: Expected $STAGING/bin/myapp not found. Aborting deploy. Live install untouched." >&2
  exit 1
fi

# Only NOW touch live install
systemctl stop myapp
cp -a "$LIVE_DIR" "$BACKUP_DIR"
find "$LIVE_DIR" -mindepth 1 -not -path "$LIVE_DIR/logs*" -delete
cp -a "$STAGING"/* "$LIVE_DIR/"
systemctl start myapp
```

### Failure modes addressed

| Failure mode | What protects against it |
|---|---|
| Archive is wrong format (e.g., tar renamed to `.zip`) | Step 3 verify fails — live install untouched |
| Partial extract (disk full mid-extract) | Step 3 verify fails — live install untouched |
| Archive root structure changed (extra wrapper folder, missing key file) | Step 3 verify fails — live install untouched |
| Permissions issue (extract step had read but not write) | Step 3 verify fails — live install untouched |
| Backup script itself fails | Optional secondary check after step 4 |

### Upstream prevention

Verifying at the consumer side is the last line of defense. The **upstream** prevention — refusing to produce a misformatted archive in the first place — is covered by [Packaging Standards — Archive Format Integrity](packaging-standards.md#archive-format-integrity). Both layers together form a defense-in-depth pair; neither alone is sufficient.

### Failure mode reference (real incident)

A Windows IIS production deploy script (2026-05-24) ran `Expand-Archive` against a tar-renamed-to-`.zip` archive (silent no-op), then `Remove-Item -Recurse` against the live `apiDir`, then `Copy-Item` from a source that did not exist (because nothing had been extracted). The live install was wiped, AppPool stopped, production was down for ~3 minutes until backup-based rollback completed. Adding step 3 verify (`Test-Path "$staging/api/MyApp.dll"`) would have aborted the deploy at the staging stage with the live install untouched.

---

## Post-Deployment Checklist

### Immediate (< 5 minutes)

- [ ] Health check endpoints returning 200
- [ ] Application logs show no errors
- [ ] Key business metrics unchanged (orders, signups, etc.)
- [ ] Monitoring dashboards show normal patterns

### Short-term (< 1 hour)

- [ ] Error rate within acceptable threshold (< 0.1%)
- [ ] Response times within SLA (p95 < target)
- [ ] No increase in customer support tickets
- [ ] Database performance stable

### Medium-term (< 24 hours)

- [ ] Batch jobs completed successfully
- [ ] Data consistency verified
- [ ] No memory leaks or resource degradation
- [ ] Feature flag progressive rollout on track

### Long-term (< 1 week)

- [ ] Feature flag cleanup scheduled
- [ ] Deployment retrospective completed
- [ ] Monitoring thresholds adjusted if needed
- [ ] Documentation updated with lessons learned

---

## Deployment Verification

### Success Criteria

A deployment is considered **successful** when ALL of the following conditions are met during the measurement window:

| Condition | Threshold | Measurement Window |
|-----------|-----------|-------------------|
| **Error rate** | ≤ pre-deployment baseline + 0.1% | 5 minutes |
| **P99 latency** | ≤ pre-deployment baseline × 1.2 | 5 minutes |
| **Health check** | 100% pass rate | Continuous |
| **Smoke tests** | 100% pass rate | Within 2 minutes post-deploy |

If any condition fails, the deployment SHOULD trigger an automatic rollback or alert the on-call engineer for manual intervention.

### Observation Period

Each deployment strategy requires a minimum observation period before the deployment can be considered stable:

| Deployment Type | Minimum Observation Period | Key Observation Metrics |
|----------------|---------------------------|------------------------|
| **Canary** | 15 minutes (per traffic percentage stage) | Error rate, Latency, Business metrics |
| **Blue-Green** | 5 minutes (after traffic switch) | Health check, Error rate |
| **Rolling** | Entire rollout duration | Health check per batch |
| **Feature Flag** | 24 hours (first enablement) | Business metrics, User feedback |

During the observation period:
- Automated monitoring MUST be active
- Rollback capability MUST remain available
- No additional deployments SHOULD be made to the same service

### Smoke Test Requirements

Post-deployment smoke tests MUST execute automatically and cover at minimum the following items:

| # | Test Item | Expected Result | Timeout |
|---|-----------|-----------------|---------|
| 1 | Health check endpoint returns 200 | HTTP 200 with status "healthy" | 5 seconds |
| 2 | Core API endpoints available (at least 3 critical paths) | HTTP 2xx responses | 10 seconds each |
| 3 | Database connectivity normal | Successful query execution | 5 seconds |
| 4 | External dependencies reachable | Successful connectivity check | 10 seconds each |
| 5 | Total execution time | All tests complete | 60 seconds max |

Smoke test failure MUST block the deployment from proceeding and trigger a rollback.

---

## DORA Metrics

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | On-demand (multiple/day) | Weekly to monthly | Monthly to semi-annually | Semi-annually to annually |
| **Lead Time for Changes** | < 1 hour | 1 day to 1 week | 1 week to 1 month | 1 to 6 months |
| **Change Failure Rate** | < 5% | 5-10% | 10-15% | > 15% |
| **Mean Time to Recover (MTTR)** | < 1 hour | < 1 day | < 1 week | > 1 week |

### Tracking Recommendations

| Metric | Data Source | Tool Examples |
|--------|------------|---------------|
| **Deployment Frequency** | CI/CD pipeline events | GitHub Actions, GitLab CI, Jenkins |
| **Lead Time** | First commit → production deploy | Git log + deploy timestamps |
| **Change Failure Rate** | Rollbacks / total deployments | Incident tracking + deploy logs |
| **MTTR** | Incident start → resolution | PagerDuty, Opsgenie, incident logs |

---

## Related Standards

- [Code Check-in Standards](checkin-standards.md) - Quality gates before deployment
- [Testing Standards](testing-standards.md) - Test requirements for deployment readiness
- [Security Standards](security-standards.md) - Security checklist for deployments
- [Performance Standards](performance-standards.md) - Performance validation pre-deployment
- [Changelog Standards](changelog-standards.md) - Documenting deployed changes
- [Git Workflow Standards](git-workflow.md) - Branch strategy and release process
- [Versioning Standards](versioning.md) - Version numbering for releases

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-05-26 | Added: Defensive Deployment Ordering section — required extract-verify-then-delete sequence, PowerShell + bash verify snippets, failure mode mapping, cross-link to packaging-standards Archive Format Integrity (XSPEC-231 / closes issue #110) |
| 1.0.0 | 2026-02-09 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
