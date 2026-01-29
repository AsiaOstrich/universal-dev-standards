# Performance Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/performance-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-29
**Applicability**: All software projects
**Scope**: universal

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

## Related Standards

- [Testing Standards](testing-standards.md) - Performance testing integration
- [Requirement Engineering](requirement-engineering.md) - NFR documentation
- [Logging Standards](logging-standards.md) - Performance logging
- [Code Review Checklist](code-review-checklist.md) - Performance review

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved explanations to guide |
| 1.0.0 | 2026-01-29 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
