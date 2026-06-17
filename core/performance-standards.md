# Performance Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/performance-standards.md)

**Version**: 1.2.0
**Last Updated**: 2026-06-17
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: ISO/IEC 25010 Performance Efficiency
**References**: [sre.google](https://sre.google/books/)

> **For detailed explanations and optimization techniques, see [Performance Guide](guides/performance-guide.md)**

---

## Purpose

This standard defines comprehensive guidelines for software performance engineering, covering performance requirements, testing methodologies, and monitoring practices.

**Reference Standards**:
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Performance Efficiency
- [Google SRE Book](https://sre.google/books/) - Site Reliability Engineering

---

## Performance Requirements Template

### NFR Format

```markdown
### NFR-PERF-XXX: [Title]

**Category**: Performance Efficiency > [Time Behavior/Resource Utilization/Capacity]
**Priority**: P1/P2/P3

**Requirement**:
| Percentile | Target | Maximum |
|------------|--------|---------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |

**Conditions**: [Load, data volume, etc.]
**Measurement**: [Tool, sampling, reporting]
```

---

## Common Performance Targets

| System Type | Response Time (p95) | Throughput | Availability |
|-------------|---------------------|------------|--------------|
| **E-commerce** | < 200ms | 1000+ rps | 99.9% |
| **Internal Tools** | < 500ms | 100+ rps | 99.5% |
| **Batch Processing** | N/A | 10K+ records/min | 99% |
| **Real-time Systems** | < 50ms (p99) | 10K+ rps | 99.99% |
| **API Gateway** | < 100ms | 5K+ rps | 99.95% |

---

## Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Perceived load speed |
| **INP** (Interaction to Next Paint) | < 200ms | Responsiveness |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |

---

## Performance Budget

```yaml
# Example Performance Budget
resources:
  total_size: 500KB
  javascript: 200KB
  css: 50KB
  images: 200KB
  fonts: 50KB

metrics:
  time_to_interactive: 3s
  first_contentful_paint: 1.5s
  speed_index: 3s

lighthouse_scores:
  performance: 90
  accessibility: 100
  best_practices: 100
  seo: 100
```

---

## Performance Metrics

### Percentile Guidelines

| Percentile | Meaning | Use For |
|------------|---------|---------|
| **p50** | Median | Typical user experience |
| **p90** | 90% faster | Most user experience |
| **p95** | 95% faster | SLA threshold (common) |
| **p99** | 99% faster | Worst case for most users |
| **p99.9** | 99.9% faster | High-volume systems |

### The Four Golden Signals (SRE)

| Signal | What to Measure | Target |
|--------|-----------------|--------|
| **Latency** | Response time (p50, p95, p99) | < SLA |
| **Traffic** | Requests per second | Depends on capacity |
| **Errors** | Error rate % | < 0.1% |
| **Saturation** | Resource utilization | < 70% sustained |

---

## Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **p95 Response Time** | > 200ms | > 500ms | Investigate, scale |
| **Error Rate** | > 0.1% | > 1% | Page on-call |
| **CPU Usage** | > 70% | > 90% | Scale, optimize |
| **Memory Usage** | > 80% | > 95% | Scale, investigate leak |
| **Disk Usage** | > 80% | > 95% | Cleanup, expand |

---

## Capacity Planning Thresholds

| Resource | Plan At | Critical |
|----------|---------|----------|
| **Compute (CPU)** | 70% sustained | 90% |
| **Memory** | 80% | 95% |
| **Storage** | 70% | 90% |
| **Network** | 60% | 80% |
| **Database Connections** | 80% | 95% |

---

## Connection Pooling Configuration

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| **Min connections** | 5-10 | Keep warm connections |
| **Max connections** | 20-100 | Depends on DB and app servers |
| **Idle timeout** | 10-30 min | Release unused connections |
| **Connection timeout** | 5-10 sec | Fail fast on issues |

---

## Rate Limiting Configuration

| Endpoint Type | Limit | Burst |
|---------------|-------|-------|
| **Public API** | 100/min | 10 |
| **Authenticated** | 1000/min | 50 |
| **Premium tier** | 10000/min | 200 |
| **Internal** | Unlimited | N/A |

---

## Performance Testing Frequency

| Test Type | Development | Staging | Production |
|-----------|-------------|---------|------------|
| **Unit Performance** | Every commit | - | - |
| **Load Testing** | Weekly | Every release | Monthly |
| **Stress Testing** | Monthly | Every release | Quarterly |
| **Soak Testing** | Monthly | Major releases | Quarterly |
| **Spike Testing** | - | Major releases | Before events |

---

## Performance Checklists

### Development Phase

- [ ] Performance requirements defined and documented
- [ ] Performance budget established
- [ ] Database queries optimized (indexes, EXPLAIN)
- [ ] Caching strategy implemented
- [ ] Pagination for list endpoints
- [ ] Async processing for long operations
- [ ] Connection pooling configured

### Pre-Release

- [ ] Load testing completed with production-like data
- [ ] Stress testing completed (found breaking point)
- [ ] Performance regression tests in CI/CD
- [ ] Core Web Vitals targets met (if frontend)
- [ ] Database query analysis completed
- [ ] Cache hit rates acceptable
- [ ] Error rates under threshold

### Production

- [ ] APM monitoring configured
- [ ] Performance dashboards created
- [ ] Alerting thresholds defined
- [ ] Capacity planning documented
- [ ] Runbook for performance issues
- [ ] Regular performance reviews scheduled

---

## Performance Testing Execution

### Test Type Definitions

| Test Type | Purpose | Applicable Scenario |
|-----------|---------|---------------------|
| **Load Test** | Validate system behavior under expected load | Pre-release validation, capacity planning |
| **Stress Test** | Find system limits and breaking point behavior | Architecture changes, scale-up verification |
| **Soak Test** | Detect memory leaks or resource exhaustion over extended runtime | Major releases, resource-intensive services |
| **Spike Test** | Verify system response and recovery under sudden traffic bursts | Pre-marketing campaigns, promotional events |

### Baseline Management

#### First-Time Baseline Establishment

1. Execute at least 3 full Load Tests on a stable version
2. Take the median of p50, p95, p99 as the baseline
3. Record test environment configuration (hardware, data volume, concurrency)
4. Store baseline in version control alongside test scripts

#### Drift Detection Thresholds

| Metric | Acceptable Drift | Investigate | Blocking |
|--------|-----------------|-------------|----------|
| p50 Latency | < 5% | 5-15% | > 15% |
| p95 Latency | < 10% | 10-20% | > 20% |
| p99 Latency | < 10% | 10-25% | > 25% |
| Throughput | < 5% decrease | 5-15% decrease | > 15% decrease |
| Error Rate | No increase | < 0.1% increase | > 0.1% increase |

#### Baseline Update Strategy

- After architecture refactoring: MUST re-establish baseline
- After hardware upgrade: SHOULD update baseline
- After successful performance optimization: SHOULD set new values as baseline
- All baseline updates MUST document the reason and date of change

### CI Trigger Conditions

Not every commit needs performance testing. Use the following trigger condition matrix:

| Trigger Condition | Load Test | Stress Test | Soak Test | Spike Test |
|-------------------|-----------|-------------|-----------|------------|
| Every commit | No | No | No | No |
| PR merge to main | Yes (lite) | No | No | No |
| Release tag | Yes (full) | Yes | No | No |
| Scheduled (weekly) | Yes | No | Yes | No |
| Manual trigger | Yes | Yes | Yes | Yes |
| Performance-related file changes | Yes (lite) | No | No | No |

### Performance Budget

Analogous to the SRE Error Budget concept, a Performance Budget defines the tolerable degradation margin.

| Concept | Definition | Example |
|---------|------------|---------|
| **Performance Target** | Target performance level | p99 < 200ms |
| **Performance Budget** | Allowed degradation headroom | p99 may degrade to 220ms (10%) |
| **Budget Consumption** | Cumulative degradation percentage | 6% consumed this quarter |
| **Budget Exhaustion** | Triggers freeze on non-essential changes | Freeze when < 2% remaining |

#### Degradation Tolerance

- p99 latency SHALL NOT degrade more than 10%
- Throughput SHALL NOT decrease more than 5%
- Error rate SHALL NOT increase more than 0.05%
- Budget resets on a quarterly cycle

### Test Report Format

#### Report Template

```markdown
## Performance Test Report

### Test Metadata
- **Date**: YYYY-MM-DD
- **Duration**: X minutes
- **Test Type**: Load / Stress / Soak / Spike
- **Environment**: staging / production-mirror

### Results Summary
| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| p50 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p95 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p99 Latency | Xms | Yms | +Z% | PASS/FAIL |
| Throughput | X rps | Y rps | -Z% | PASS/FAIL |
| Error Rate | X% | Y% | +Z% | PASS/FAIL |

### Pass/Fail Determination
- **Overall**: PASS / FAIL
- **Failed Criteria**: [list of exceeded thresholds]

### Trend Analysis
- Chart of last 10 runs with baseline markers
- Anomaly points highlighted

### Recommendations
- Action items based on results
```

#### Pass/Fail Determination Rules

- All blocking-level thresholds within limits → **PASS**
- Any blocking-level threshold exceeded → **FAIL**
- Investigation-level thresholds exceeded → logged as warning, does not block

#### Trend Chart Requirements

- Include at least the last 10 runs for trend comparison
- Display baseline markers on the chart
- Highlight anomaly data points that exceed thresholds

---

## Migration Non-Functional Parity (XSPEC-286)

> Part of the [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9-axis migration completeness matrix (**axis ⑥ — non-functional**). Covers the omission class "function is correct, data is correct, but **it runs differently**" during a legacy refactor / rewrite. This section adds **migration-specific** before/after semantics on top of the general baseline/drift machinery above; it does NOT replace the general performance framework.

### Why this is a real gap

The general Baseline Management above answers "did *this version* regress vs *its own* prior baseline". It does NOT answer "does the **new** system match the **legacy** system it replaces". In a rewrite (e.g. PHP single-request → .NET shared-state threads) the latency/throughput/isolation characteristics of legacy are **implicit and undocumented**, so per-request functional parity and behavior-snapshot parity both pass while the system silently runs slower, exhausts a smaller pool, or loses a lock semantic.

### Differential oracle, not absolute threshold

Migration parity uses **legacy as the baseline** and a **declared tolerance**, not the absolute targets in the tables above. The legacy system's measured behavior is the oracle; "no regression beyond the declared tolerance" is the pass criterion. This makes divergence self-report instead of relying on someone remembering to enumerate every hot path.

### Step 1 — Mechanized non-functional baseline capture (R3)

Legacy non-functional characteristics are mostly implicit. Derive the baseline **mechanically** (not from memory) from legacy artifacts:

| Source | Derived baseline item |
|--------|----------------------|
| Key routes / controllers | p50 / p95 / p99 latency per critical path |
| Hot queries / slow-query log | Per-query latency, rows scanned |
| Background jobs / cron | Job duration, throughput (records/min) |
| Connection pool config | Min/max connections, idle/connection timeout |
| Timeout / rate-limit config | Per-endpoint timeout, requests/min, burst |
| Transaction config | Isolation level (READ COMMITTED / REPEATABLE READ / SERIALIZABLE) |

The captured set is **both** the comparison baseline for the regression gate **and** the to-verify checklist for resource/limit parity (Step 4).

### Step 2 — Performance regression differential gate (R1)

For each baseline path, measure the corresponding path in the new system and compare against the **legacy baseline** within a declared tolerance.

| Metric | Default migration tolerance | Block when |
|--------|----------------------------|-----------|
| p50 latency | ≤ +10% vs legacy | > +10% |
| p95 latency | ≤ +15% vs legacy | > +15% |
| p99 latency | ≤ +20% vs legacy | > +20% |
| Throughput | ≤ -10% vs legacy | > -10% decrease |

Tolerances are **per-path configurable** (a batch job and an interactive endpoint differ). Start in **shadow** (measure-only, do not block) to collect samples and calibrate per-path tolerances, then promote to blocking.

**Gate timing**: pre-UAT (catch regression before sign-off) **and** post-cutover (catch regression that only appears under real production load).

```markdown
## Migration Performance Parity Report — <path>

| Metric | Legacy baseline | New system | Δ | Tolerance | Status |
|--------|-----------------|------------|---|-----------|--------|
| p50 | [X]ms | [Y]ms | +[Z]% | +10% | PASS/FAIL |
| p95 | [X]ms | [Y]ms | +[Z]% | +15% | PASS/FAIL |
| p99 | [X]ms | [Y]ms | +[Z]% | +20% | PASS/FAIL |
| Throughput | [X] rps | [Y] rps | -[Z]% | -10% | PASS/FAIL |

**Mode**: shadow (measure-only) / blocking
**Overall**: PASS / FAIL
```

### Step 3 — Concurrency isolation verification (R2)

The same resource (same record / same account balance / same sequence number) may be accessed by multiple concurrent operations. Legacy lock / transaction-isolation / ordering guarantees are **implicit behavior** and are routinely changed by a rewrite — and **neither functional tests nor behavior-snapshot parity catch this** (per-request parity ≠ concurrency parity, the same blind spot class as "per-request ≠ data-at-rest").

**Method**: drive a race with concurrent stress, then assert **domain invariants** rather than checking outputs one-at-a-time.

| Invariant class | Example assertion |
|-----------------|-------------------|
| Conservation | `SUM(balance)` unchanged after N concurrent transfers |
| Uniqueness | no duplicate sequence number under concurrent allocation |
| No lost update | last-writer-wins not silently replacing a committed write |
| Ordering | events applied in a guaranteed order under concurrency |

Detecting an **isolation downgrade** (e.g. legacy SERIALIZABLE → new READ COMMITTED, or a removed row lock) blocks. The invariants themselves are domain-defined; where a concurrency case overlaps a state-transition or temporal invariant, **the state-machine / temporal concern is owned by XSPEC-287** (axis ⑧) and concurrency race is owned here (axis ⑥) — see XSPEC-287 §boundary.

**Gate timing**: pre-UAT.

### Step 4 — Resource / limit parity (R4)

Verify that legacy resource limits are not **unintentionally** changed by the rewrite (a timeout silently dropping from 30s to 5s fails long jobs; a smaller pool serializes traffic). Add to the non-functional reconciliation checklist:

- [ ] Request / operation **timeouts** match legacy (or change is declared)
- [ ] **Rate limits** (requests/min, burst) match legacy
- [ ] **Connection pool** min/max and idle/connection timeout match legacy
- [ ] **Batch sizes** match legacy
- [ ] **Transaction isolation level** matches legacy (cross-check with Step 3)

Each item is either matched or has a **declared, justified** delta. An undeclared delta is a known regression risk and blocks cutover.

### Completeness declaration (matrix alignment)

Axis ⑥ of the migration completeness matrix is satisfied when this section declares all three: **derive** (Step 1 mechanized baseline), **oracle** (Step 2 regression differential + Step 3 invariant assertions), and **gate timing** (pre-UAT + post-cutover). Reuse the general baseline/drift and `observability-assistant` measurement machinery — this section adds only the migration before/after and concurrency-isolation semantics, it does not rebuild a general performance framework.

---

## Per-Release Capacity Sign-off

This section defines the **capacity gate** that must be satisfied before production release (Dimension 10 in `release-readiness-gate.md`, Tier-3).

### Capacity Forecast

Before each release candidate, produce a capacity forecast based on:

1. **Baseline**: 90-day rolling average of peak TPS and resource utilization (CPU, memory, DB connections, storage growth rate)
2. **Release impact estimate**: expected traffic delta from new features (e.g., +15% TPS from new notification flow)
3. **Seasonal adjustment**: any known traffic spikes within the next 30 days (marketing campaigns, seasonal peaks)

### Headroom Thresholds

| Metric | Target (PASS) | Warn Band | Fail Threshold |
|--------|--------------|-----------|----------------|
| CPU headroom at projected peak | ≥ 30% | 20–30% | < 20% |
| Memory headroom | ≥ 25% | 15–25% | < 15% |
| DB connection pool headroom | ≥ 40% | 25–40% | < 25% |
| p99 latency vs baseline | ≤ +5% | +5% to +10% | > +10% regression |
| Error rate at peak load | < 0.1% | 0.1–0.5% | > 0.5% |

### Load Test Requirement

Run the load test scenario defined in the Performance Testing sections above (Soak + Spike test minimum) before finalizing the capacity sign-off:

```bash
# Example: k6 capacity verification run
k6 run --vus 500 --duration 20m scripts/perf/soak-test.js
# Pass criterion: headroom metrics above, p99 within budget
```

### Sign-off Evidence

The capacity gate requires **two named sign-offs** — both Engineering Lead and SRE Lead:

```markdown
## Capacity Sign-off — <version>

**Projection date**: YYYY-MM-DD
**Baseline period**: last 90 days

| Metric | Baseline peak | Projected peak | Headroom | Status |
|--------|-------------|---------------|----------|--------|
| CPU | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| Memory | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| DB pool | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| p99 latency | [X]ms | [Y]ms | [±Z]% | PASS/WARN/FAIL |

**Load test artifact**: [link to load test report]

**Eng Lead sign-off**: _______________ Date: __________
**SRE Lead sign-off**: _______________ Date: __________
```

### When Tier-3 Applies as N/A

The capacity sign-off is `N/A` (with documented rationale) when:
- Project has < 100 DAU and no significant traffic growth expected
- Internal tooling with fixed user count
- Static content / documentation site

---

## Related Standards

- [Testing Standards](testing-standards.md) - Performance testing integration
- [Requirement Engineering](requirement-engineering.md) - NFR documentation
- [Logging Standards](logging-standards.md) - Performance logging
- [Code Review Checklist](code-review-checklist.md) - Performance review
- [Deployment Standards](deployment-standards.md) - Performance validation pre-deployment
- [Release Readiness Gate](release-readiness-gate.md) - Dimension 1 (load) and Dimension 10 (capacity)
- [Behavior Snapshot](behavior-snapshot.md) - Functional parity oracle (complements migration non-functional parity)
- [Full Coverage Testing](full-coverage-testing.md) - Concurrency dimension cross-reference

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-06-17 | Added Migration Non-Functional Parity (XSPEC-286, axis ⑥): before/after differential regression gate, concurrency isolation verification, resource/limit parity, mechanized baseline capture |
| 1.1.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved explanations to guide |
| 1.0.0 | 2026-01-29 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
