---
source: core/guides/performance-guide.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Performance Guide

> **語言**: [English](../../../../core/guides/performance-guide.md) | 繁體中文

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Performance Standards](../performance-standards.md)

---

## Purpose

本指南為軟體效能工程提供詳細的說明、最佳化技巧與教學內容。關於效能預算（performance budget）、門檻值與必備檢查清單，請參閱 [Performance Standards](../performance-standards.md)。

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

ISO 25010 將效能效率（performance efficiency）定義為八項品質特性之一。理解這套框架有助於以標準化的術語與利害關係人溝通。

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

RED 方法聚焦於請求層級（request-level）的指標，最適合用於服務：

| 指標 | 說明 | 為何重要 |
|--------|-------------|----------------|
| **R**ate | 每秒請求數 | 反映流量規模 |
| **E**rrors | 錯誤率百分比 | 品質指標 |
| **D**uration | 回應時間分布 | 使用者體驗 |

### The USE Method (Resource-oriented)

USE 方法聚焦於資源使用率（resource utilization），最適合用於基礎設施：

| 指標 | 說明 | 警訊 |
|--------|-------------|--------------|
| **U**tilization | 資源忙碌百分比 | 持續 > 70% |
| **S**aturation | 佇列長度 | 佇列持續增長 |
| **E**rrors | 錯誤計數 | 任何增加 |

### The Four Golden Signals (SRE)

Google 的 SRE 著作將以下四項定義為任何系統最重要的指標：

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

| Percentile | 意義 | 使用情境 |
|------------|---------|----------|
| **p50 (median)** | 一半的請求比此更快 | 典型體驗 |
| **p90** | 90% 的請求比此更快 | 多數使用者 |
| **p95** | 95% 的請求比此更快 | SLA 門檻 |
| **p99** | 99% 的請求比此更快 | 多數情況下的最差案例 |
| **p99.9** | 99.9% 的請求比此更快 | 高流量系統 |

**為何 percentile 比平均值更重要**：平均值可能掩蓋問題。若 99% 的請求耗時 100ms，但 1% 耗時 10 秒，平均值看起來可能可以接受（199ms），然而卻有 1% 的使用者體驗極差。

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

| 層級 | 技巧 | 影響 | 投入成本 |
|-------|-----------|--------|--------|
| **Algorithm** | 改善複雜度（O(n²) → O(n log n)） | 極高 | 中 |
| **Architecture** | caching、非同步處理、load balancing | 高 | 高 |
| **Database** | indexing、查詢最佳化、connection pooling | 高 | 中 |
| **Code** | lazy loading、批次處理、memoization | 中 | 低 |
| **Infrastructure** | 垂直／水平擴展、CDN | 中 | 中 |
| **Low-level** | 記憶體對齊、SIMD、JIT warmup | 低 | 高 |

**關鍵洞察**：永遠從最高層級開始著手。更好的演算法每次都會勝過微最佳化（micro-optimization）。

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

**為何使用 partial index？** 它們更小、更快，因為只包含符合特定條件的資料列。非常適合用於頻繁查詢的資料子集。

### N+1 Query Problem

N+1 問題是最常見的效能問題之一：

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

| 指標 | 衡量內容 | 目標 | 如何改善 |
|--------|------------------|--------|----------------|
| **LCP** | Largest Contentful Paint | < 2.5s | 最佳化圖片、預先載入關鍵資產 |
| **INP** | Interaction to Next Paint | < 200ms | 減少 JavaScript、延後非關鍵腳本 |
| **CLS** | Cumulative Layout Shift | < 0.1 | 為圖片設定尺寸、為動態內容預留空間 |

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

**為何需要預算？** 若沒有限制，頁面重量往往會隨時間增長。預算能建立責任歸屬，並強制做出取捨。

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

| 策略 | 運作方式 | 最適用於 |
|----------|--------------|----------|
| **TTL-based** | 固定時間後過期 | 靜態內容 |
| **Event-based** | 寫入時失效 | 即時資料 |
| **Version-based** | 新版本 = 新的 cache key | 部署 |
| **Stale-while-revalidate** | 先提供過期內容，背景刷新 | 高可用性 |

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

| 策略 | 優點 | 缺點 | 何時使用 |
|----------|------|------|-------------|
| **Vertical Scaling** | 簡單、無需修改程式碼 | 硬體上限、單點故障（SPOF） | 快速修復、小規模 |
| **Horizontal Scaling** | 無上限、容錯 | 複雜度高、需無狀態（stateless） | 正式系統 |
| **Auto-scaling** | 符合成本效益、反應靈敏 | warm-up 時間、複雜度 | 變動負載 |

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
