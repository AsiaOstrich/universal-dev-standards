---
source: options/testing/performance-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 性能测试（Performance Testing）

> **语言**: [English](../../../../options/testing/performance-testing.md) | 简体中文

**上层标准**: [测试完整性](../../core/test-completeness-dimensions.md)

---

## 概览

性能测试验证应用程序在各种负载条件下是否满足速度、可扩展性与稳定性需求。它有助于找出瓶颈，并确保系统能够承受预期的流量。

## 最适用于

- 高流量应用程序
- 实时系统
- 电子商务平台
- API 与微服务
- 数据库密集型应用程序

## 测试类型

### Load Testing（负载测试）

测试系统在预期负载下的行为。

| 方面 | 细节 |
|--------|---------|
| **目的** | 验证系统能处理正常流量 |
| **指标** | 响应时间（P50、P95、P99）、Throughput（TPS/RPS）、错误率 |

**工具：**

| 工具 | 类型 | 语言 |
|------|------|----------|
| k6 | 开源 | JavaScript |
| JMeter | 开源 | Java/XML |
| Gatling | 开源 | Scala |
| Locust | 开源 | Python |

### Stress Testing（压力测试）

测试系统在超出正常负载下的行为。

| 方面 | 细节 |
|--------|---------|
| **目的** | 找出崩溃点与失效模式 |
| **指标** | 最大容量、劣化曲线、恢复时间 |

**做法：**
- 逐步增加负载
- 监控错误与性能下降
- 找出瓶颈
- 记录失效阈值

### Spike Testing（尖峰测试）

测试流量突然增加的情况。

| 方面 | 细节 |
|--------|---------|
| **目的** | 验证对流量尖峰的处理能力 |
| **场景** | 限时抢购、爆红内容、营销活动、特定时段事件 |

### Soak Testing（耐久测试 / Endurance Testing）

测试系统在长时间运行下的稳定性。

| 方面 | 细节 |
|--------|---------|
| **目的** | 找出 memory leak 与性能劣化 |
| **持续时间** | 数小时到数天 |

**需留意：**
- Memory leak
- Connection pool 耗尽
- 日志文件增长
- 性能逐渐劣化

### Capacity Testing（容量测试）

确定系统的最大容量。

| 方面 | 细节 |
|--------|---------|
| **目的** | 规划扩展与基础设施 |
| **产出** | 用户容量上限、资源需求、扩展阈值 |

## 关键指标

### Latency（延迟）

| 百分位数 | 描述 | 目标 |
|------------|-------------|--------|
| P50 | 中位数响应时间 | 基准值 |
| P95 | 第 95 百分位数 | 基准值的 2–3 倍 |
| P99 | 第 99 百分位数 | 最多基准值的 5 倍 |

**注意：** 对用户体验而言，P99 往往比平均值更重要。

### Throughput（吞吐量）

| 度量 | 描述 |
|-------------|-------------|
| TPS | 每秒事务数（Transactions Per Second） |
| RPS | 每秒请求数（Requests Per Second） |
| QPS | 每秒查询数（Queries Per Second） |

### 错误率

| 级别 | 目标 |
|-------|--------|
| 可接受 | < 0.1% |
| 劣化 | < 1% |
| 危急 | > 1% |

### 资源使用率

- CPU 使用率
- 内存使用率
- 网络 I/O
- 磁盘 I/O
- Connection pool 使用率

## Service Level Objectives（服务级别目标）

定义可度量的性能目标：

```yaml
latency_slo: "P99 latency < 200ms"
availability_slo: "99.9% uptime"
throughput_slo: "1000 RPS sustained"
error_slo: "Error rate < 0.1%"
```

**注意：** SLO 应以用户需求为基础，而非系统能力。

## 测试阶段

| 阶段 | 描述 | 持续时间 |
|-------|-------------|----------|
| **1. 基准（Baseline）** | 在最小负载下建立当前的性能基准 | 1–2 天 |
| **2. 负载（Load）** | 模拟预期流量，验证是否符合 SLO | 2–3 天 |
| **3. 压力（Stress）** | 增加负载直到失效，记录崩溃点 | 1–2 天 |
| **4. 耐久（Soak）** | 运行 24–72 小时，监控性能劣化 | 1–3 天 |

## CI 集成

### k6 示例

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

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 先建立基准 | 在优化前先建立基准指标 | 必需 |
| 真实数据 | 使用接近生产环境的数据量与模式 | 必需 |
| 隔离环境 | 使用隔离环境以避免干扰 | 必需 |
| 渐进负载 | 逐步增加负载以找出阈值 | 建议 |
| 监控资源 | 监控所有系统资源（CPU、内存、I/O） | 必需 |
| 聚焦百分位数 | 聚焦于 P95/P99 latency，而非平均值 | 必需 |
| 回归测试 | 在 CI/CD 中纳入性能回归测试 | 建议 |

## 快速参考

### 测试类型

| 类型 | 目的 | 持续时间 | 时机 |
|------|---------|----------|------|
| Load | 正常流量 | 数分钟 | 每次发版 |
| Stress | 崩溃点 | 数小时 | 重大发版 |
| Spike | 突然增加 | 数分钟 | 视情况需要 |
| Soak | 长期稳定性 | 数天 | 每季度 |
| Capacity | 最大容量 | 数小时 | 规划时 |

### 关键指标

| 指标 | 度量内容 | 目标 |
|--------|-----------------|--------|
| P50 Latency | 中位数响应 | 基准值 |
| P95 Latency | 典型最差情况 | 基准值的 2–3 倍 |
| P99 Latency | 极端情况 | 最多基准值的 5 倍 |
| Throughput | 每秒请求数 | 依 SLO 定义 |
| 错误率 | 失败的请求 | < 0.1% |

## 相关选项

- [单元测试](./unit-testing.md) - 单元测试实践
- [安全测试](./security-testing.md) - 安全测试实践

---

## 参考资料

- [ISTQB Performance Testing](https://www.istqb.org/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [k6 Documentation](https://k6.io/docs/)

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
