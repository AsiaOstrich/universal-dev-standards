# Performance Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/performance-testing.md)

**Parent Standard**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## Overview

Performance testing verifies that applications meet speed, scalability, and stability requirements under various load conditions. It helps identify bottlenecks and ensure the system can handle expected traffic.

## Best For

- High-traffic applications
- Real-time systems
- E-commerce platforms
- APIs and microservices
- Database-intensive applications

## Testing Types

### Load Testing

Test system behavior under expected load.

| Aspect | Details |
|--------|---------|
| **Purpose** | Verify system handles normal traffic |
| **Metrics** | Response time (P50, P95, P99), Throughput (TPS/RPS), Error rate |

**Tools:**

| Tool | Type | Language |
|------|------|----------|
| k6 | Open source | JavaScript |
| JMeter | Open source | Java/XML |
| Gatling | Open source | Scala |
| Locust | Open source | Python |

### Stress Testing

Test system behavior beyond normal load.

| Aspect | Details |
|--------|---------|
| **Purpose** | Find breaking point and failure modes |
| **Metrics** | Maximum capacity, Degradation curve, Recovery time |

**Approach:**
- Gradually increase load
- Monitor for errors and slowdowns
- Identify bottlenecks
- Document failure thresholds

### Spike Testing

Test sudden traffic increases.

| Aspect | Details |
|--------|---------|
| **Purpose** | Verify handling of traffic spikes |
| **Scenarios** | Flash sales, Viral content, Marketing campaigns, Time-based events |

### Soak Testing (Endurance Testing)

Test system stability over extended period.

| Aspect | Details |
|--------|---------|
| **Purpose** | Find memory leaks and degradation |
| **Duration** | Hours to days |

**Watch for:**
- Memory leaks
- Connection pool exhaustion
- Log file growth
- Gradual performance degradation

### Capacity Testing

Determine maximum system capacity.

| Aspect | Details |
|--------|---------|
| **Purpose** | Plan for scaling and infrastructure |
| **Output** | User capacity limits, Resource requirements, Scaling thresholds |

## Key Metrics

### Latency

| Percentile | Description | Target |
|------------|-------------|--------|
| P50 | Median response time | Baseline |
| P95 | 95th percentile | 2-3x baseline |
| P99 | 99th percentile | 5x baseline max |

**Note:** P99 often more important than average for user experience.

### Throughput

| Measurement | Description |
|-------------|-------------|
| TPS | Transactions Per Second |
| RPS | Requests Per Second |
| QPS | Queries Per Second |

### Error Rate

| Level | Target |
|-------|--------|
| Acceptable | < 0.1% |
| Degraded | < 1% |
| Critical | > 1% |

### Resource Utilization

- CPU usage
- Memory usage
- Network I/O
- Disk I/O
- Connection pool usage

## Service Level Objectives

Define measurable performance targets:

```yaml
latency_slo: "P99 latency < 200ms"
availability_slo: "99.9% uptime"
throughput_slo: "1000 RPS sustained"
error_slo: "Error rate < 0.1%"
```

**Note:** SLOs should be based on user needs, not system capabilities.

## Test Phases

| Phase | Description | Duration |
|-------|-------------|----------|
| **1. Baseline** | Establish current performance with minimal load | 1-2 days |
| **2. Load** | Simulate expected traffic, verify SLO compliance | 2-3 days |
| **3. Stress** | Increase load until failure, document breaking points | 1-2 days |
| **4. Soak** | Run 24-72 hours, monitor for degradation | 1-3 days |

## CI Integration

### k6 Example

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.example.com/health');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

### GitHub Actions

```yaml
name: Performance Test
on:
  pull_request:
    branches: [main]
jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/load-test.js
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Baseline first | Establish baseline metrics before optimization | Required |
| Realistic data | Use production-like data volume and patterns | Required |
| Isolate environment | Use isolated environment to avoid interference | Required |
| Gradual load | Increase load gradually to identify thresholds | Recommended |
| Monitor resources | Monitor all system resources (CPU, memory, I/O) | Required |
| Percentile focus | Focus on P95/P99 latency, not averages | Required |
| Regression testing | Include performance regression tests in CI/CD | Recommended |

## Quick Reference

### Test Types

| Type | Purpose | Duration | When |
|------|---------|----------|------|
| Load | Normal traffic | Minutes | Every release |
| Stress | Breaking point | Hours | Major releases |
| Spike | Sudden increase | Minutes | If relevant |
| Soak | Long-term stability | Days | Quarterly |
| Capacity | Max capacity | Hours | Planning |

### Key Metrics

| Metric | What it measures | Target |
|--------|-----------------|--------|
| P50 Latency | Median response | Baseline |
| P95 Latency | Typical worst case | 2-3x baseline |
| P99 Latency | Extreme cases | 5x baseline max |
| Throughput | Requests/sec | SLO defined |
| Error Rate | Failed requests | < 0.1% |

## Related Options

- [Unit Testing](./unit-testing.md) - Unit testing practices
- [Security Testing](./security-testing.md) - Security testing practices

---

## References

- [ISTQB Performance Testing](https://www.istqb.org/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [k6 Documentation](https://k6.io/docs/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
