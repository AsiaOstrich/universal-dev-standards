# Deployment Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/deployment-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-09
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
| 1.0.0 | 2026-02-09 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
