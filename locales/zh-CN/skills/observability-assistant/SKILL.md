---
source: ../../../../skills/observability-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 00f5ea242d6d
status: current
description: |
  引导可观测性建设、指标设计与告警配置。
  Use when: 新服务的埋点、SLO 定义、告警设计、成熟度评估。
  Not for: 设置数值目标与 Error Budget 策略——请用 /slo；日志格式与级别——请用 /logging-guide。
  Keywords: observability, metrics, traces, golden signals, alerting, SLO, 可观测性, 指标, 追踪, 告警.
---

# 可观测性助手

> **语言**: [English](../../../../skills/observability-assistant/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-06-19
**适用范围**: Claude Code Skills

> **核心规范**：本技能实现 [可观测性标准](../../../../core/observability-standards.md)。权威方法论（Metrics/Traces 的完整细节、采样、OTel 集成）请参阅核心规范。

引导三支柱可观测性实现：Logs、Metrics、Traces。

## 功能

| 功能 | 说明 |
|------|------|
| **仪器检查** | 上线前可观测性检查表 |
| **成熟度评估** | L0-L4 成熟度自评 |
| **指标设计** | 协助设计 Metrics（类型、命名、标签） |
| **告警设计** | 设计 SLO-based 告警并降低噪声 |
| **黄金信号** | 验证四大黄金信号覆盖 |

## 使用方式

```bash
/observability                        # 显示可观测性指南
/observability --checklist            # 执行仪器检查表
/observability --maturity             # 成熟度评估（L0-L4）
/observability --alerting             # 告警设计指南
/observability "payment-service"      # 特定服务的引导
```

## 三支柱框架

每个支柱提供不同的视角；其威力在于彼此关联。

| 支柱 | 捕获内容 | 使用时机 | 粒度 |
|------|----------|----------|------|
| **Logs** | 带上下文的离散事件 | 调试、审计轨迹、错误细节 | 高（每个事件） |
| **Metrics** | 随时间变化的数值度量 | 仪表板、告警、容量规划 | 低（聚合） |
| **Traces** | 跨服务的请求流 | 延迟分析、依赖关系映射 | 中（每个请求） |

**关联字段**：`trace_id` 串起 Logs ↔ Traces ↔ Metrics（经由 Exemplars）；
`service.name` 可过滤全部三个支柱。工作流：指标异常 → exemplar →
trace → 日志中的 `trace_id`。

## 四大黄金信号

基于 Google SRE。每个服务在上线前都应该（SHOULD）监控全部四项。

| 信号 | 度量 | 指标示例 | 告警（SLO-based） |
|------|------|----------|-------------------|
| **Latency** | 通过 Histogram 取 P50/P95/P99，区分成功/错误 | `http.server.request.duration.seconds` | P99 > X ms 持续 5 分钟 |
| **Traffic** | 每秒请求数，按 route/method 区分 | `http.server.request.total`（rate） | 下降 > 50% 或激增 > 200% |
| **Errors** | 错误数 / 总请求数 | `...request.total{status=~"5.."}` ÷ total | 错误率 > X% 持续 5 分钟 |
| **Saturation** | CPU/内存/连接池/磁盘使用率 | `system.cpu.utilization`（Gauge） | 资源 > 80% 持续 10 分钟 |

## Metric 类型

| 类型 | 行为 | 使用时机 |
|------|------|----------|
| **Counter** | 只增不减（重启时归零） | 请求数、错误数、发送字节数 |
| **Gauge** | 某一时点的值，可升可降 | 队列深度、活跃连接数、内存 |
| **Histogram** | 跨 bucket 的分布 | 请求耗时、响应大小 |
| **Summary** | 客户端计算的百分位数 | 旧式用法，无服务端聚合 |

**命名**：`<domain>.<entity>.<action>.<unit>`，使用 `snake_case`（例如
`db.client.query.duration.seconds`）。**标签基数**：每个标签的唯一值保持在
约 1000 个以下——绝不要把 `user_id` / `request_id` / 原始 `url` / `ip` 当作
标签；这些应记录在 Logs 或 Traces 中。

## 成熟度模型（L0–L4）

| 等级 | 名称 | 特征 | 升级行动 |
|------|------|------|----------|
| **L0** | 无可观测性 | 只有 stdout/stderr；靠 SSH + `tail -f` 调试 | 结构化日志；集中收集 |
| **L1** | 基础日志 | 结构化 JSON 日志，集中存放、可搜索 | 加入业务指标；建立第一个仪表板 |
| **L2** | 指标驱动 | Logs + Metrics、仪表板、阈值告警 | 启用追踪；SLO-based 告警 |
| **L3** | 完整可观测性 | 三支柱 + 关联 + SLO 告警 + 黄金信号 | 异常检测；自动修复 |
| **L4** | 智能化 | AIOps 异常检测、预测式告警、自动修复 | 维持、优化、分享经验 |

**自我检查**：能跨服务找到单一请求的日志（L1+）→ 有错误率与延迟的仪表板
（L2+）→ 能追踪请求从入口→DB→返回（L3+）→ 能在用户反馈前自动检测
异常（L4）。

## 上线前检查表

将服务部署到生产环境之前：

- [ ] **结构化日志** — JSON 格式并带 `trace_id` 关联
- [ ] **HTTP/gRPC 入口指标** — 每个端点的请求数、耗时 histogram、错误率
- [ ] **业务操作指标** — 追踪关键事件（订单、支付）
- [ ] **分布式追踪** — span 传播、采样率、W3C Trace Context headers
- [ ] **健康检查** — liveness（是否运行？）与 readiness（能否服务？）探针
- [ ] **黄金信号仪表板** — 可视化 Latency、Traffic、Errors、Saturation
- [ ] **告警规则** — 至少要有 SLO burn-rate 告警
- [ ] **日志保留** — 按日志级别设置保留策略
- [ ] **排除敏感数据** — 日志/追踪中不含密码、token 或 PII

## 下一步引导

> **可观测性引导完成。建议下一步：**
> - 执行 `/slo` 定义 SLI/SLO/Error Budget ⭐ **推荐**
> - 执行 `/incident` 设定事故响应流程
> - 执行 `/checkin` 提交变更

## 参考

- 详细指南：[guide.md](./guide.md) — 日志、指标、追踪三大支柱的完整说明。要搭建监控、选择指标类型、引入追踪或评估成熟度时读它。
- 核心规范：[observability-standards.md](../../../../core/observability-standards.md)
- 核心规范：[alerting-standards.md](../../../../core/alerting-standards.md)
- 核心规范：[slo-standards.md](../../../../core/slo-standards.md)
