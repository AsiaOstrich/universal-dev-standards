# Performance Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/core/guides/performance-guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Performance Standards](../performance-standards.md)

---

## Purpose

This guide provides detailed explanations, optimization techniques, and educational content for software performance engineering. For performance budgets, thresholds, and mandatory checklists, see [Performance Standards](../performance-standards.md).

---

## Table of Contents

1. [Performance Fundamentals](#performance-fundamentals)
2. [Performance Testing Deep Dive](#performance-testing-deep-dive)
3. [Metrics Explained](#metrics-explained)
4. [Optimization Strategies](#optimization-strategies)
5. [Database Performance Tuning](#database-performance-tuning)
6. [API Performance Optimization](#api-performance-optimization)
7. [Frontend Performance Techniques](#frontend-performance-techniques)
8. [Caching Architecture](#caching-architecture)
9. [Monitoring and Observability](#monitoring-and-observability)
10. [Capacity Planning Process](#capacity-planning-process)
11. [References](#references)

---

## Performance Fundamentals

### ISO 25010 Performance Efficiency

```
┌─────────────────────────────────────────────────────────────────┐
│            ISO 25010: Performance Efficiency                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Performance Efficiency                                        │
│   ├── Time Behavior                                            │
│   │   └── Response time, processing time, throughput           │
│   │                                                            │
│   ├── Resource Utilization                                     │
│   │   └── CPU, memory, disk, network usage                     │
│   │                                                            │
│   └── Capacity                                                 │
│       └── Maximum limits that meet requirements                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

ISO 25010 defines performance efficiency as one of the eight quality characteristics. Understanding this framework helps communicate with stakeholders using standardized terminology.

---

## Performance Testing Deep Dive

### Testing Types Explained

```
┌─────────────────────────────────────────────────────────────────┐
│                Performance Testing Types                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Load Testing                                                  │
│   ├── Purpose: Verify system under expected load               │
│   ├── Duration: 10-60 minutes                                  │
│   └── Load: Normal to peak expected                            │
│                                                                 │
│   Stress Testing                                                │
│   ├── Purpose: Find breaking point                             │
│   ├── Duration: Until failure                                  │
│   └── Load: Beyond normal capacity                             │
│                                                                 │
│   Soak/Endurance Testing                                        │
│   ├── Purpose: Find memory leaks, resource issues              │
│   ├── Duration: 4-72 hours                                     │
│   └── Load: Sustained normal load                              │
│                                                                 │
│   Spike Testing                                                 │
│   ├── Purpose: Verify sudden load changes                      │
│   ├── Duration: Short bursts                                   │
│   └── Load: Sudden increase/decrease                           │
│                                                                 │
│   Scalability Testing                                           │
│   ├── Purpose: Verify scaling behavior                         │
│   ├── Duration: Varies                                         │
│   └── Load: Incrementally increasing                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### k6 Load Test Example

```javascript
// Example: k6 Load Test Configuration
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

---

## Metrics Explained

### The RED Method (Request-oriented)

The RED method focuses on request-level metrics, ideal for services:

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **R**ate | Requests per second | Indicates traffic volume |
| **E**rrors | Error rate percentage | Quality indicator |
| **D**uration | Response time distribution | User experience |

### The USE Method (Resource-oriented)

The USE method focuses on resource utilization, ideal for infrastructure:

| Metric | Description | Warning Sign |
|--------|-------------|--------------|
| **U**tilization | % resource busy | > 70% sustained |
| **S**aturation | Queue length | Growing queue |
| **E**rrors | Error count | Any increase |

### The Four Golden Signals (SRE)

Google's SRE book defines these as the most important metrics for any system:

```
┌─────────────────────────────────────────────────────────────────┐
│               The Four Golden Signals (Google SRE)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. LATENCY                                                    │
│      ├── Successful request latency (what users see)           │
│      ├── Failed request latency (often faster, misleading)     │
│      └── Track percentiles: p50, p90, p95, p99                 │
│                                                                 │
│   2. TRAFFIC                                                    │
│      ├── HTTP requests per second                              │
│      ├── Transactions per second                               │
│      └── Messages processed per second                         │
│                                                                 │
│   3. ERRORS                                                     │
│      ├── Explicit errors (HTTP 5xx)                            │
│      ├── Implicit errors (wrong content, slow response)        │
│      └── Policy violations (response > SLA)                    │
│                                                                 │
│   4. SATURATION                                                 │
│      ├── CPU utilization                                       │
│      ├── Memory utilization                                    │
│      ├── Disk I/O utilization                                  │
│      └── Network bandwidth utilization                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Understanding Percentiles

| Percentile | Meaning | Use Case |
|------------|---------|----------|
| **p50 (median)** | Half of requests are faster | Typical experience |
| **p90** | 90% of requests are faster | Most users |
| **p95** | 95% of requests are faster | SLA threshold |
| **p99** | 99% of requests are faster | Worst case for most |
| **p99.9** | 99.9% of requests are faster | High-volume systems |

**Why percentiles matter more than averages**: Averages can hide problems. If 99% of requests take 100ms but 1% take 10 seconds, the average might look acceptable (199ms) while 1% of users have a terrible experience.

---

## Optimization Strategies

### General Optimization Principles

```
┌─────────────────────────────────────────────────────────────────┐
│              Performance Optimization Principles                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. MEASURE FIRST                                              │
│      └── Don't optimize without data (avoid premature opt)     │
│                                                                 │
│   2. IDENTIFY BOTTLENECK                                        │
│      └── Focus on the slowest part (Amdahl's Law)              │
│                                                                 │
│   3. OPTIMIZE THE RIGHT LEVEL                                   │
│      ├── Algorithm > Data Structure > Code > Hardware          │
│      └── Higher level optimizations have bigger impact         │
│                                                                 │
│   4. CONSIDER TRADE-OFFS                                        │
│      ├── Speed vs Memory                                       │
│      ├── Latency vs Throughput                                 │
│      └── Consistency vs Availability                           │
│                                                                 │
│   5. VERIFY IMPROVEMENT                                         │
│      └── Benchmark before and after                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Optimization Techniques by Level

| Level | Technique | Impact | Effort |
|-------|-----------|--------|--------|
| **Algorithm** | Better complexity (O(n²) → O(n log n)) | Very High | Medium |
| **Architecture** | Caching, async processing, load balancing | High | High |
| **Database** | Indexing, query optimization, connection pooling | High | Medium |
| **Code** | Lazy loading, batching, memoization | Medium | Low |
| **Infrastructure** | Vertical/horizontal scaling, CDN | Medium | Medium |
| **Low-level** | Memory alignment, SIMD, JIT warmup | Low | High |

**Key insight**: Always start at the highest level. A better algorithm will outperform micro-optimizations every time.

---

## Database Performance Tuning

### Index Guidelines

```sql
-- ✅ Good: Index for frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- ✅ Good: Composite index for multi-column queries
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- ❌ Avoid: Index on low-cardinality columns
CREATE INDEX idx_users_active ON users(is_active); -- Only 2 values

-- ✅ Good: Partial index for specific queries
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';
```

**Why partial indexes?** They're smaller and faster because they only include rows matching a condition. Perfect for frequently-queried subsets.

### N+1 Query Problem

The N+1 problem is one of the most common performance issues:

```typescript
// ❌ Bad: N+1 queries (1 query for users + N queries for orders)
const users = await User.findAll();
for (const user of users) {
  const orders = await Order.findAll({ where: { userId: user.id } });
}

// ✅ Good: Single query with JOIN or eager loading
const users = await User.findAll({
  include: [{ model: Order }]
});
```

---

## API Performance Optimization

### API Design for Performance

```typescript
// ❌ Bad: Returns all fields, all records
GET /api/users

// ✅ Good: Pagination, field selection
GET /api/users?page=1&limit=20&fields=id,name,email

// ❌ Bad: N+1 queries for related data
GET /api/users/1
GET /api/users/1/orders
GET /api/users/1/addresses

// ✅ Good: Single request with includes
GET /api/users/1?include=orders,addresses

// ✅ Good: Batch endpoint
POST /api/users/batch
{ "ids": [1, 2, 3, 4, 5] }
```

---

## Frontend Performance Techniques

### Core Web Vitals Explained

| Metric | What It Measures | Target | How to Improve |
|--------|------------------|--------|----------------|
| **LCP** | Largest Contentful Paint | < 2.5s | Optimize images, preload critical assets |
| **INP** | Interaction to Next Paint | < 200ms | Reduce JavaScript, defer non-critical scripts |
| **CLS** | Cumulative Layout Shift | < 0.1 | Set dimensions on images, reserve space for dynamic content |

### Performance Budget Example

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

**Why budgets?** Without limits, page weight tends to grow over time. Budgets create accountability and force trade-offs.

---

## Caching Architecture

### Cache Levels

```
┌─────────────────────────────────────────────────────────────────┐
│                      Caching Hierarchy                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Level 1: Browser Cache                                        │
│   ├── HTTP cache headers (Cache-Control, ETag)                 │
│   ├── Service Worker cache                                     │
│   └── TTL: Minutes to days                                     │
│                                                                 │
│   Level 2: CDN Cache                                            │
│   ├── Edge caching for static assets                           │
│   ├── API response caching (careful with personalization)      │
│   └── TTL: Hours to days                                       │
│                                                                 │
│   Level 3: Application Cache                                    │
│   ├── In-memory cache (local, fast, limited size)              │
│   ├── Distributed cache (Redis, Memcached)                     │
│   └── TTL: Seconds to hours                                    │
│                                                                 │
│   Level 4: Database Cache                                       │
│   ├── Query cache                                              │
│   ├── Result set cache                                         │
│   └── TTL: Managed by DB                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Strategies

| Strategy | How It Works | Best For |
|----------|--------------|----------|
| **TTL-based** | Expire after fixed time | Static content |
| **Event-based** | Invalidate on write | Real-time data |
| **Version-based** | New version = new cache key | Deployments |
| **Stale-while-revalidate** | Serve stale, refresh in background | High availability |

### Cache Headers

```http
# Static assets (versioned filename)
Cache-Control: public, max-age=31536000, immutable

# API responses (short cache)
Cache-Control: private, max-age=60, stale-while-revalidate=300

# No cache (personalized content)
Cache-Control: no-store, no-cache, must-revalidate

# Conditional caching
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
```

---

## Monitoring and Observability

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│               Performance Dashboard Layout                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Row 1: Overview                                               │
│   ├── Request rate (rps)                                       │
│   ├── Error rate (%)                                           │
│   ├── p50/p95/p99 latency                                      │
│   └── Active users/connections                                 │
│                                                                 │
│   Row 2: Infrastructure                                         │
│   ├── CPU usage by service                                     │
│   ├── Memory usage by service                                  │
│   ├── Network I/O                                              │
│   └── Disk I/O                                                 │
│                                                                 │
│   Row 3: Database                                               │
│   ├── Query rate                                               │
│   ├── Slow queries                                             │
│   ├── Connection pool usage                                    │
│   └── Replication lag                                          │
│                                                                 │
│   Row 4: Dependencies                                           │
│   ├── External API latency                                     │
│   ├── Cache hit rate                                           │
│   └── Queue depth                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Capacity Planning Process

```
┌─────────────────────────────────────────────────────────────────┐
│                   Capacity Planning Cycle                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. COLLECT                                                    │
│      ├── Historical usage data                                 │
│      ├── Growth trends                                         │
│      └── Business forecasts                                    │
│                                                                 │
│   2. ANALYZE                                                    │
│      ├── Peak usage patterns                                   │
│      ├── Resource utilization trends                           │
│      └── Bottleneck identification                             │
│                                                                 │
│   3. FORECAST                                                   │
│      ├── Project future demand                                 │
│      ├── Apply growth factors                                  │
│      └── Account for seasonal variations                       │
│                                                                 │
│   4. PLAN                                                       │
│      ├── Define capacity requirements                          │
│      ├── Evaluate scaling options                              │
│      └── Calculate costs                                       │
│                                                                 │
│   5. EXECUTE                                                    │
│      ├── Implement scaling                                     │
│      ├── Validate performance                                  │
│      └── Monitor and iterate                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scaling Strategies Compared

| Strategy | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Vertical Scaling** | Simple, no code changes | Hardware limits, SPOF | Quick fix, small scale |
| **Horizontal Scaling** | No limit, fault tolerant | Complexity, stateless required | Production systems |
| **Auto-scaling** | Cost-effective, responsive | Warm-up time, complexity | Variable load |

---

## References

### Standards
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Performance Efficiency
- [Web Vitals](https://web.dev/vitals/) - Google Core Web Vitals

### Books
- Brendan Gregg - "Systems Performance: Enterprise and the Cloud" (2020)
- Google - "Site Reliability Engineering" (2016)
- Martin Kleppmann - "Designing Data-Intensive Applications" (2017)

### Tools
- [k6](https://k6.io/) - Load testing
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Frontend performance
- [Grafana](https://grafana.com/) - Performance dashboards

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
