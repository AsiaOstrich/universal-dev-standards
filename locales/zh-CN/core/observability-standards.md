---
source: ../../../core/observability-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# 可观测性标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义可观测性标准，涵盖三大支柱：**Logs（日志）**、**Metrics（指标）** 和 **Traces（追踪）**。补充现有的 [日志标准](logging-standards.md)，新增全面的 Metrics 与 Traces 指引、统一关联框架及操作检查清单。

完整 Logs 指引（结构化日志、日志级别、敏感数据处理、OpenTelemetry 集成）请参阅 [日志标准](logging-standards.md)。

---

## 三大支柱框架

| 支柱 | 捕获内容 | 使用场景 | 粒度 |
|------|---------|---------|------|
| **Logs** | 具备上下文的离散事件 | 调试、审计追踪、错误详情 | 高（每事件） |
| **Metrics** | 随时间变化的数值量测 | 仪表板、告警、容量规划 | 低（聚合） |
| **Traces** | 跨服务的请求流程 | 延迟分析、依赖映射 | 中（每请求） |

### 跨支柱关联

- **Metric 异常 → Trace**：使用 Exemplars 链接到特定 Trace
- **Trace → Logs**：使用 `trace_id` 和 `span_id` 查找特定请求的日志
- **Logs → Metric**：将日志模式聚合为指标（如：从错误日志计算错误率）

关键关联字段：`trace_id`、`service.name`

---

## Metric 类型

| 类型 | 用途 | 行为 | 使用场景 |
|------|------|------|---------|
| **Counter** | 单调递增计数 | 只增不减（重启时重置） | 请求数、错误数、发送字节 |
| **Gauge** | 即时数值（可增可减） | 表示当前状态 | 温度、队列深度、活跃连接 |
| **Histogram** | 跨 Bucket 的值分布 | 记录值到预定义 Bucket | 请求持续时间、响应大小 |
| **Summary** | 客户端计算的百分位数 | 在客户端计算分位数 | 旧系统、不需服务端聚合时 |

---

## Golden Signals（黄金信号）

每个服务上线前应监控：

| 信号 | 量测 | 建议指标 |
|------|------|---------|
| **Latency（延迟）** | P50、P95、P99 百分位数 | `http.server.request.duration.seconds` |
| **Traffic（流量）** | 每秒请求数（RPS） | `http.server.request.total` |
| **Errors（错误）** | 错误 / 总请求（百分比） | 5xx / total |
| **Saturation（饱和度）** | CPU、内存、连接池使用率 | `system.cpu.utilization` 等 |

---

## 可观测性成熟度模型

| 级别 | 名称 | 特征 |
|------|------|------|
| **L0** | 无可观测性 | 无结构化日志；仅 stdout/stderr |
| **L1** | 基础日志 | 结构化 Logs + JSON 格式 + 集中收集 |
| **L2** | 指标驱动 | Logs + Metrics + 仪表板 + 基础告警 |
| **L3** | 完整可观测性 | 三大支柱运作 + 关联查询 + SLO 告警 |
| **L4** | 智能可观测性 | AIOps 异常检测 + 预测告警 + 自动修复 |

---

## Quick Reference Card

### Metric 类型选择
```
只会增加？        → Counter
可增可减？        → Gauge
需要分布？        → Histogram
客户端百分位数？  → Summary
```

### 采样策略选择
```
高流量、成本敏感？     → Head-based（1-10%）
必须捕获所有错误？     → Tail-based
流量变化大？           → Adaptive
```

### 成熟度级别快速检查
```
无结构化日志？               → L0
结构化日志、已集中？         → L1
Logs + Metrics + 仪表板？    → L2
三大支柱 + SLO 告警？       → L3
AIOps + 自动修复？           → L4
```

---

**相关标准：**
- [日志标准](logging-standards.md) — 完整 Logs 支柱指引
- [SLO 标准](slo-standards.md) — SLI/SLO/Error Budget 定义
- [告警标准](alerting-standards.md) — 告警设计与管理
