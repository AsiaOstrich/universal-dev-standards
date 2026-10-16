---
source: ../../../core/observability-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d6bf74a0b5be
status: current
---

# 可观测性标准

> **语言**: [English](../../../core/observability-standards.md) | [繁體中文](../../zh-TW/core/observability-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范围**: 通用
**行业标准**: OpenTelemetry, W3C Trace Context, Google SRE (Golden Signals)
**参考资料**: [opentelemetry.io](https://opentelemetry.io/), [sre.google](https://sre.google/)

---

## 概述

本文件定义了跨三大支柱构建可观测系统的可观测性标准：**Logs（日志）**、**Metrics（指标）** 和 **Traces（追踪）**。它通过添加全面的 Metrics 和 Traces 指引、统一关联框架以及操作检查清单，对现有的 [日志标准](logging-standards.md) 进行了补充。

有关包含结构化日志、日志级别、敏感数据处理以及 OpenTelemetry 集成的完整 Logs 指引，请参阅 [日志标准](logging-standards.md)。

---

## 三大支柱框架

现代可观测性依赖于三个互补的支柱，每个支柱都为洞察系统行为提供了不同的视角：

```
┌──────────┐    trace_id     ┌──────────┐    trace_id     ┌──────────┐
│   LOGS   │◄───────────────►│  TRACES  │◄───────────────►│ METRICS  │
│ (Events) │                 │  (Spans) │                 │(Counters)│
└──────────┘                 └──────────┘                 └──────────┘
     │                            │                            │
     └────────── service.name ────┴──────── service.name ──────┘
```

| 支柱 | 捕获内容 | 使用场景 | 粒度 |
|------|---------|---------|------|
| **Logs** | 具备上下文的离散事件 | 调试、审计追踪、错误详情 | 高（每事件） |
| **Metrics** | 随时间变化的数值量测 | 仪表板、告警、容量规划 | 低（聚合） |
| **Traces** | 跨服务的请求流程 | 延迟分析、依赖映射 | 中（每请求） |

### 跨支柱关联

可观测性的威力来自于跨支柱的关联：

1. **Metric 异常 → Trace**：在指标上使用 Exemplars 链接到表现出异常行为的特定 Trace
2. **Trace → Logs**：使用嵌入在日志中的 `trace_id` 和 `span_id` 查找特定请求的所有日志条目
3. **Logs → Metric**：将日志模式聚合为指标（例如：从错误日志计算错误率）

**关键关联字段：**
- `trace_id` — 链接 Logs ↔ Traces ↔ Metrics（通过 Exemplars）
- `service.name` — 按服务标识过滤所有三大支柱

---

## Metrics

### Metric 类型

根据需要量测的内容选择适当的 Metric 类型：

| 类型 | 用途 | 行为 | 使用场景 |
|------|------|------|---------|
| **Counter** | 单调递增计数 | 只增不减（重启时重置） | 请求数、错误数、发送字节 |
| **Gauge** | 即时数值（可增可减） | 表示当前状态 | 温度、队列深度、活跃连接 |
| **Histogram** | 跨 Bucket 的值分布 | 记录值到预定义 Bucket | 请求持续时间、响应大小 |
| **Summary** | 客户端计算的百分位数 | 在客户端计算分位数 | 旧系统、不需服务端聚合时 |

**决策指引：**
```
Does the value only go up?
├─ Yes → Counter (e.g., http.server.request.total)
└─ No
   ├─ Do you need distribution/percentiles?
   │  ├─ Yes → Histogram (e.g., http.server.request.duration.seconds)
   │  └─ No → Gauge (e.g., system.memory.usage.bytes)
   └─ Legacy requirement for client-side percentiles?
      └─ Yes → Summary
```

### 命名规范

遵循以下模式：`<domain>.<entity>.<action>.<unit>`

| 组件 | 描述 | 示例 |
|------|------|------|
| `domain` | 系统领域 | `http`, `db`, `queue`, `system` |
| `entity` | 资源类型 | `server`, `client`, `connection` |
| `action` | 量测内容 | `request`, `query`, `usage` |
| `unit` | 量测单位 | `seconds`, `bytes`, `total` |

**示例：**
- `http.server.request.duration.seconds` — HTTP 服务端请求持续时间
- `http.server.request.total` — HTTP 请求总数（Counter）
- `db.client.query.duration.seconds` — 数据库查询持续时间
- `system.memory.usage.bytes` — 内存使用量（Gauge）
- `queue.consumer.lag.messages` — 以消息数计的消费者滞后

**规则：**
- 多词组件使用 `snake_case`
- Gauge 和 Histogram 务必包含单位后缀
- Counter 使用 `.total` 后缀
- 避免使用缩写（使用 `request` 而非 `req`）

### Label 最佳实践

Label（也称为 tag 或 attribute）为指标添加维度。

**Do：**
- 使用具有有界、低基数值的 Label
- 常见 Label：`method`、`status_code`、`service`、`environment`
- 保持相关指标之间的 Label 集合一致

**Don't — 预防高基数：**

> ⚠️ **警告**：基数超过 **1000 个唯一值**的 Label 会导致过多的内存占用和存储成本。高基数数据（用户 ID、请求 ID、IP 地址）应记录在 **Logs 或 Traces** 中，而不是作为指标 Label。

| 不良（高基数） | 良好（低基数） |
|----------------|----------------|
| `user_id="usr_12345"` | 使用带有 `user_id` 字段的 Logs |
| `request_id="req_abc"` | 使用带有 `span_id` 的 Traces |
| `url="/api/users/12345"` | `route="/api/users/{id}"` |
| `ip="192.168.1.100"` | `region="us-east-1"` |

---

## Traces

### Span 设计原则

Span 代表 Trace 内的单个工作单元。

**命名：**
- 使用描述性名称：`db.query.users.findById`、`http.server.POST./api/orders`
- 包含操作类型和目标
- 避免使用像 `doWork` 或 `process` 这样的宽泛名称

**必需的 Span 属性：**
| 属性 | 描述 | 示例 |
|------|------|------|
| `service.name` | 服务标识 | `payment-service` |
| `span.kind` | Client/Server/Internal | `SERVER` |
| 操作专属属性 | 取决于操作类型 | `http.method=POST` |

**粒度指引：**
- **过粗**：整个请求处理只有一个 Span → 无法看清瓶颈
- **过细**：每个函数调用一个 Span → 过多的开销与噪声
- **恰到好处**：每个关键 I/O 操作或业务步骤一个 Span

**经验法则：** 在以下情况创建 Span：
1. 跨越网络边界（HTTP 调用、数据库查询、消息发送）
2. 发生具有业务重要性的步骤（订单创建、支付处理）
3. 发生潜在的缓慢操作（文件 I/O、计算 > 10ms）

### 采样策略

生产环境的 Trace 可能会产生庞大的数据量。使用采样可以在控制成本的同时保留可观测性。

| 策略 | 运作方式 | 优点 | 缺点 | 使用场景 |
|------|---------|------|------|---------|
| **Head-based** | 在 Trace 开始时做决定（例如：10% 采样率） | 简单、低开销、成本可预测 | 可能会遗漏重要 Trace（错误、慢请求） | 高流量服务、成本敏感型场景 |
| **Tail-based** | 在 Trace 完成后做决定（保留错误/慢请求） | 保留异常、捕获重要 Trace | 需要缓冲、资源占用较高 | 错误检测、性能分析 |
| **Adaptive** | 基于流量动态调整采样率 | 能够应对流量突增、成本均衡 | 实现和调优较为复杂 | 流量模式多变的服务 |

**建议：**
- 大多数服务从 Head-based 采样（1-10%）开始
- 针对必须捕获错误的关键路径添加 Tail-based 采样
- 针对流量 > 10K RPS 的服务考虑采用 Adaptive 采样

### 性能开销控制

追踪会增加开销。请将其控制在可管理的范围内：

| 指标 | 目标 | 超标时的应对措施 |
|------|------|-----------------|
| CPU 开销 | < 2% | 降低采样率 |
| 内存开销 | < 50MB | 减少 Span 属性数量 |
| 网络开销 | < 流量的 1% | 批量导出、压缩 |
| 延迟影响 | 每个 Span < 1ms | 使用异步导出 |

### 跨服务传播

对于分布式系统，使用 W3C Trace Context 标准传播 Trace 上下文：

**W3C Trace Context 请求头：**
```
traceparent: 00-<trace_id>-<span_id>-<flags>
tracestate: <vendor>=<value>
```

**跨边界传播：**
- **HTTP**：`traceparent` 和 `tracestate` 请求头
- **gRPC**：Metadata 键
- **消息队列**：消息头/属性
- **异步作业**：存储在作业元数据中

---

## 黄金信号检查清单

基于 Google SRE 的四大黄金信号（Four Golden Signals），每个服务在进入生产环境之前都应当（SHOULD）监控以下各项：

### 延迟（Latency）

| 方面 | 量测 | 建议指标 |
|--------|------------|-------------------|
| 请求持续时间 | 使用 Histogram 统计 P50、P95、P99 百分位数 | `http.server.request.duration.seconds` |
| 成功与失败 | 分别记录成功/错误响应的延迟 | 添加 `status` 标签 |
| 告警阈值 | P99 > X ms 持续 5 分钟 | 基于 SLO 目标 |

### 流量（Traffic）

| 方面 | 量测 | 建议指标 |
|--------|------------|-------------------|
| 请求量 | 每秒请求数（RPS） | `http.server.request.total`（Counter，rate） |
| 按端点划分 | 按 route/method 细分 | 添加 `route`、`method` 标签 |
| 告警阈值 | 突降 > 50% 或突增 > 200% | 与上周同期相比 |

### 错误（Errors）

| 方面 | 量测 | 建议指标 |
|--------|------------|-------------------|
| 错误率 | 错误数 / 总请求数（百分比） | `http.server.request.total{status=~"5.."}` / `http.server.request.total` |
| 按类型划分 | 按错误码/错误类别细分 | 添加 `status_code`、`error_type` 标签 |
| 告警阈值 | 错误率 > X% 持续 5 分钟 | 基于 SLO 目标 |

### 饱和度（Saturation）

| 方面 | 量测 | 建议指标 |
|--------|------------|-------------------|
| CPU 利用率 | 可用 CPU 百分比 | `system.cpu.utilization`（Gauge） |
| 内存利用率 | 可用内存百分比 | `system.memory.utilization`（Gauge） |
| 连接池 | 活跃连接数 / 最大连接数 | `db.client.connection.pool.usage`（Gauge） |
| 磁盘 I/O | 读/写吞吐量与队列深度 | `system.disk.io`（Counter） |
| 告警阈值 | 资源使用率 > 80% 持续 10 分钟 | 预饱和告警 |

---

## 可观测性成熟度模型

使用此模型评估团队当前的可观测性水平并规划改进方案：

| 级别 | 名称 | 特征 | 升级行动 |
|-------|------|----------------|-----------------|
| **L0** | 无可观测性 | 无结构化日志；仅 stdout/stderr；通过 SSH 和 `tail -f` 调试 | 实施结构化日志；集中日志收集 |
| **L1** | 基础日志 | JSON 格式的结构化日志；集中收集；具备基础搜索能力 | 添加关键业务指标；创建首个仪表板 |
| **L2** | 指标驱动 | Logs + Metrics 就位；关键服务配备仪表板；基于阈值的基本告警 | 启用分布式追踪；实施基于 SLO 的告警 |
| **L3** | 完整可观测性 | 三大支柱均已运行；关联查询正常工作；基于 SLO 告警；监控黄金信号 | 添加异常检测；针对已知问题实施自动修复 |
| **L4** | 智能可观测性 | AIOps 异常检测；预测性告警；自动修复；持续优化 | 维护与优化；在全组织内分享经验 |

**自评估问题：**
1. 能否跨所有服务查找特定请求的日志？（L1+）
2. 能否查看显示当前错误率和延迟的仪表板？（L2+）
3. 能否追踪从入口到数据库并返回的请求？（L3+）
4. 系统是否能在用户报告前自动检测到异常？（L4）

---

## 插桩检查清单

在将服务部署到生产环境之前，请核验以下事项：

- [ ] **启用结构化日志** — JSON 格式并具备 `trace_id` 关联（参阅 [日志标准](logging-standards.md)）
- [ ] **HTTP/gRPC 入口指标** — 所有端点的请求计数、持续时间直方图与错误率
- [ ] **关键业务操作自定义指标** — 追踪关键业务事件（如下单、支付处理）
- [ ] **启用分布式追踪** — 配置 Span 传播、设置采样率、支持 W3C Trace Context 请求头
- [ ] **健康检查端点** — 实现存活探针（Liveness probe，进程是否运行？）与就绪探针（Readiness probe，能否承接流量？）
- [ ] **覆盖黄金信号的仪表板** — 至少对延迟（Latency）、流量（Traffic）、错误（Errors）和饱和度（Saturation）实现可视化
- [ ] **定义告警规则** — 至少配置了 SLO 燃尽率告警（参阅 [告警标准](alerting-standards.md)）
- [ ] **配置日志保留** — 按日志级别设置保留策略
- [ ] **排除敏感数据** — 日志/追踪中不含密码、Token 或 PII

---

## OpenTelemetry 集成

OpenTelemetry（OTel）是推荐的插桩框架。有关 OTel 语义规范和集成模式的详细说明，请参阅 [日志标准 — OpenTelemetry 集成](logging-standards.md#opentelemetry-integration) 章节。

关键要点：
- 在支持的情况下，优先使用 OTel SDK 进行自动插桩
- 遵循 OTel 属性命名的语义规范（semantic conventions）
- 导出至 OTel Collector 以构建厂商中立的数据管道

---

## Quick Reference Card

### Metric 类型选择
```
Only goes up?        → Counter
Goes up and down?    → Gauge
Need distribution?   → Histogram
Client percentiles?  → Summary
```

### 采样策略选择
```
High traffic, cost-sensitive?     → Head-based (1-10%)
Must capture all errors?          → Tail-based
Traffic varies widely?            → Adaptive
```

### 成熟度级别快速检查
```
No structured logs?               → L0
Structured logs, centralized?     → L1
Logs + Metrics + Dashboards?      → L2
All three pillars + SLO alerts?   → L3
AIOps + Auto-remediation?         → L4
```

---

## 参考资料

- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otel/) — 可观测性插桩的行业标准
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) — 标准化属性命名
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分布式追踪上下文传播
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) — 黄金信号的起源
- [Google SRE — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多窗口燃尽率告警

---

**相关标准：**
- [日志标准](logging-standards.md) — 完整的 Logs 支柱指引
- [SLO 标准](slo-standards.md) — SLI/SLO/Error Budget 定义
- [告警标准](alerting-standards.md) — 告警设计与管理
- [性能标准](performance-standards.md) — 性能目标与基准

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：Metrics、Traces、黄金信号、成熟度模型、插桩检查清单 |

---

## 许可证

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
