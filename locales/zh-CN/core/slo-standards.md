---
source: ../../../core/slo-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# SLO 标准（Service Level Objectives）

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义 Service Level Indicators（SLI）、Service Level Objectives（SLO）及 Error Budgets 的标准。这些概念构成可靠性管理的基础，让团队在功能开发速度与服务质量之间取得平衡。

---

## 关键概念

| 概念 | 定义 | 对象 | 违反后果 |
|------|------|------|---------|
| **SLI** | 服务行为的量化量测 | 工程团队 | 无直接后果（数据点） |
| **SLO** | 在时间窗口内 SLI 的内部目标 | 工程团队 | 触发 Error Budget 策略 |
| **SLA** | 保证服务质量的外部合同 | 客户 | 合同罚则（退款、信用额度） |
| **Error Budget** | 允许的不可靠量（1 - SLO 目标） | 工程团队 | 耗尽时触发保护措施 |

**SLO 应比 SLA 更严格**，以提供缓冲。例如：
- SLA：99.9% 可用性（对客户的合同义务）
- SLO：99.95% 可用性（内部目标，在 SLA 违反前有 50% 缓冲）

---

## SLI 选择指南

### API 服务

| SLI | 量测 | 数据来源 |
|-----|------|---------|
| **Availability** | 成功请求（非 5xx）/ 总请求 | Load Balancer 或应用指标 |
| **Latency** | 持续时间低于阈值的请求 / 总请求 | 应用 Histogram 指标 |
| **Quality** | 未降级响应 / 总响应 | 应用层质量检查 |

### Batch Jobs

| SLI | 量测 | 数据来源 |
|-----|------|---------|
| **Freshness** | 上次成功完成至今的时间 | Job Scheduler 指标 |
| **Correctness** | 正确处理的记录 / 总记录 | 应用验证指标 |
| **Coverage** | 成功完成的批次 / 总调度批次 | Job Scheduler 指标 |

---

## Error Budget 策略

### 计算方式

```
Error Budget = 1 - SLO 目标

示例：
  SLO = 99.9% 可用性，28 天窗口
  Error Budget = 0.1%
  = 28 天 × 24 小时 × 60 分钟 × 0.001
  = 40.32 分钟的允许停机时间
```

### Burn Rate 告警

| 消耗速度 | 阈值 | 触发动作 | 含义 |
|---------|------|---------|------|
| **快速消耗** | 1 小时消耗 2% 预算 | Page（P1） | 按此速率，约 2 天耗尽 |
| **中速消耗** | 6 小时消耗 5% 预算 | Alert（P2） | 按此速率，约 5 天耗尽 |
| **慢速消耗** | 3 天消耗 10% 预算 | Ticket（P3） | 可能在月底前耗尽 |

### 预算耗尽后的行动

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **冻结发布** | 暂停非可靠性功能发布 | 默认策略 |
| **可靠性冲刺** | 下个 Sprint 专注于可靠性改善 | 系统性问题需要集中处理 |
| **加强审查** | 所有变更需额外生产就绪审查 | 变更是预算消耗的根因 |
| **降低 SLO 目标** | 经利益相关方同意后降低 SLO | 目标对当前架构不切实际 |

---

## Quick Reference Card

### SLI 选择
```
API 服务？        → Availability + Latency + Quality
Batch Job？       → Freshness + Correctness + Coverage
前端应用？        → LCP/FID/CLS + Availability
```

### SLO 目标选择
```
内部工具？        → 99%
B2B 服务？        → 99.5%
消费者面向？      → 99.9%
金融/关键？       → 99.95%+
```

### Error Budget 快速计算
```
Budget = (1 - target) × window_minutes
99.9% over 28 days = 0.001 × 40320 = 40.32 min
```

---

**相关标准：**
- [可观测性标准](observability-standards.md) — 三大支柱框架与指标指引
- [告警标准](alerting-standards.md) — SLO-based 告警策略
- [日志标准](logging-standards.md) — 结构化日志用于 SLI 数据收集
