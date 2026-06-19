---
source: core/guides/performance-guide.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Performance Guide

> **语言**: [English](../../../../core/guides/performance-guide.md) | 简体中文

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Performance Standards](../performance-standards.md)

---

## Purpose

本指南为软件性能工程提供详细的说明、优化技巧与教学内容。关于性能预算（performance budget）、阈值与必备检查清单，请参阅 [Performance Standards](../performance-standards.md)。

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

ISO 25010 将性能效率（performance efficiency）定义为八项质量特性之一。理解这套框架有助于以标准化的术语与利益相关者沟通。

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

RED 方法聚焦于请求级别（request-level）的指标，最适合用于服务：

| 指标 | 说明 | 为何重要 |
|--------|-------------|----------------|
| **R**ate | 每秒请求数 | 反映流量规模 |
| **E**rrors | 错误率百分比 | 质量指标 |
| **D**uration | 响应时间分布 | 用户体验 |

### The USE Method (Resource-oriented)

USE 方法聚焦于资源使用率（resource utilization），最适合用于基础设施：

| 指标 | 说明 | 警讯 |
|--------|-------------|--------------|
| **U**tilization | 资源繁忙百分比 | 持续 > 70% |
| **S**aturation | 队列长度 | 队列持续增长 |
| **E**rrors | 错误计数 | 任何增加 |

### The Four Golden Signals (SRE)

Google 的 SRE 著作将以下四项定义为任何系统最重要的指标：

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

| Percentile | 含义 | 使用场景 |
|------------|---------|----------|
| **p50 (median)** | 一半的请求比此更快 | 典型体验 |
| **p90** | 90% 的请求比此更快 | 多数用户 |
| **p95** | 95% 的请求比此更快 | SLA 阈值 |
| **p99** | 99% 的请求比此更快 | 多数情况下的最差案例 |
| **p99.9** | 99.9% 的请求比此更快 | 高流量系统 |

**为何 percentile 比平均值更重要**：平均值可能掩盖问题。若 99% 的请求耗时 100ms，但 1% 耗时 10 秒，平均值看起来可能可以接受（199ms），然而却有 1% 的用户体验极差。

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

| 层级 | 技巧 | 影响 | 投入成本 |
|-------|-----------|--------|--------|
| **Algorithm** | 改善复杂度（O(n²) → O(n log n)） | 极高 | 中 |
| **Architecture** | caching、异步处理、load balancing | 高 | 高 |
| **Database** | indexing、查询优化、connection pooling | 高 | 中 |
| **Code** | lazy loading、批处理、memoization | 中 | 低 |
| **Infrastructure** | 垂直／水平扩展、CDN | 中 | 中 |
| **Low-level** | 内存对齐、SIMD、JIT warmup | 低 | 高 |

**关键洞察**：永远从最高层级开始着手。更好的算法每次都会胜过微优化（micro-optimization）。

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

**为何使用 partial index？** 它们更小、更快，因为只包含符合特定条件的数据行。非常适合用于频繁查询的数据子集。

### N+1 Query Problem

N+1 问题是最常见的性能问题之一：

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

| 指标 | 衡量内容 | 目标 | 如何改善 |
|--------|------------------|--------|----------------|
| **LCP** | Largest Contentful Paint | < 2.5s | 优化图片、预先加载关键资源 |
| **INP** | Interaction to Next Paint | < 200ms | 减少 JavaScript、延后非关键脚本 |
| **CLS** | Cumulative Layout Shift | < 0.1 | 为图片设置尺寸、为动态内容预留空间 |

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

**为何需要预算？** 若没有限制，页面重量往往会随时间增长。预算能建立责任归属，并强制做出取舍。

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

| 策略 | 运作方式 | 最适用于 |
|----------|--------------|----------|
| **TTL-based** | 固定时间后过期 | 静态内容 |
| **Event-based** | 写入时失效 | 实时数据 |
| **Version-based** | 新版本 = 新的 cache key | 部署 |
| **Stale-while-revalidate** | 先提供过期内容，后台刷新 | 高可用性 |

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

| 策略 | 优点 | 缺点 | 何时使用 |
|----------|------|------|-------------|
| **Vertical Scaling** | 简单、无需修改代码 | 硬件上限、单点故障（SPOF） | 快速修复、小规模 |
| **Horizontal Scaling** | 无上限、容错 | 复杂度高、需无状态（stateless） | 生产系统 |
| **Auto-scaling** | 符合成本效益、反应灵敏 | warm-up 时间、复杂度 | 变动负载 |

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
