---
source: ../../../core/slo-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 30ebf8c58138
status: current
---

# SLO 标准（Service Level Objectives）

> **语言**: [English](../../../core/slo-standards.md) | [繁體中文](../../zh-TW/core/slo-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有包含生产服务的软件项目
**范围**: 通用
**行业标准**: Google SRE, ISO/IEC 20000
**参考**: [sre.google](https://sre.google/), [OpenSLO](https://openslo.com/)

---

## 概述

本文件定义服务等级指标（SLI）、服务等级目标（SLO）以及错误预算（Error Budget）的标准。这些概念构成了可靠性管理的基础，使团队能够在功能交付速度与服务质量之间取得平衡。

---

## 关键概念

### SLI / SLO / SLA / Error Budget 定义

| 概念 | 定义 | 受众 | 违反后果 |
|---------|-----------|----------|----------------------|
| **SLI**（服务等级指标） | 对服务行为的量化度量 | 工程团队 | 无直接后果（数据点） |
| **SLO**（服务等级目标） | SLI 在特定时间窗口内的内部目标 | 工程团队 | 触发 Error Budget 策略 |
| **SLA**（服务等级协议） | 保证服务质量的外部合同 | 客户 | 合同罚则（退款、信用额度抵扣） |
| **Error Budget**（错误预算） | 允许的不可靠量（1 - SLO 目标） | 工程团队 | 耗尽时触发保护性行动 |

### SLI vs SLO vs SLA 对比

```
                    ┌─────────────────────────────────────┐
                    │          Service Quality             │
                    │                                       │
  SLI ─── measures ──► SLO ─── stricter than ──► SLA       │
  (what)              (internal target)         (contract)  │
                    │                                       │
                    │  Error Budget = 1 - SLO target        │
                    └─────────────────────────────────────┘
```

**SLO 应比 SLA 更严格**，以提供缓冲空间。例如：
- SLA：99.9% 可用性（对客户的合同义务）
- SLO：99.95% 可用性（内部目标，在违反 SLA 之前留出 50% 的缓冲）

---

## SLI 选择指南

### API 服务

对于 REST/gRPC API 服务，从以下项中选择 SLI：

| SLI | 度量方式 | 数据来源 |
|-----|-------------|-------------|
| **Availability** | 成功请求数（非 5xx）/ 总请求数 | 负载均衡器或应用指标 |
| **Latency** | 耗时低于阈值的请求数 / 总请求数 | 应用直方图（Histogram）指标 |
| **Quality** | 未降级响应数 / 总响应数 | 应用级质量检查 |

**示例：** 可用性 SLI = `count(http_status != 5xx) / count(all_requests)`，基于滚动 28 天窗口。

### 批处理作业（Batch Jobs）

对于计划的批处理、数据管道和 ETL 作业：

| SLI | 度量方式 | 数据来源 |
|-----|-------------|-------------|
| **Freshness** | 距上次成功完成的时间在阈值以内 | 作业调度器指标 |
| **Correctness** | 正确处理的记录数 / 总记录数 | 应用验证指标 |
| **Coverage** | 成功完成的批次数 / 总计划批次数 | 作业调度器指标 |

### 前端应用

对于 Web 和移动端前端应用：

| SLI | 度量方式 | 数据来源 |
|-----|-------------|-------------|
| **Load Performance** | 满足 LCP < 2.5s、FID < 100ms、CLS < 0.1 的页面数 / 总页面数 | 真实用户监控（RUM） |
| **Availability** | 成功加载的页面数 / 总页面加载数 | RUM 或合成监控 |
| **Interaction Delay** | 响应低于阈值的用户操作数 / 总操作数 | RUM |

### 数据管道

对于流式与实时数据处理：

| SLI | 度量方式 | 数据来源 |
|-----|-------------|-------------|
| **Throughput** | 每秒处理记录数在目标范围内 | 管道指标 |
| **Freshness** | 端到端延迟在阈值以内 | 管道指标 |
| **Correctness** | 有效输出记录数 / 总输出记录数 | 验证指标 |

---

## SLO 设定方法论

### 分步流程

为服务设定 SLO 时，请遵循以下 5 个步骤：

#### 步骤 1：选择 SLI

从上述指南中选择最有意义的 SLI。每个服务从 1-3 个 SLI 开始。

#### 步骤 2：确定度量窗口

| 窗口类型 | 持续时间 | 适用场景 |
|-------------|----------|----------|
| **Rolling**（滚动） | 28 天（推荐） | 大多数服务；平滑每周周期规律 |
| **Calendar**（日历） | 日历月 | 与业务报告周期保持一致 |

#### 步骤 3：设定目标值

使用历史数据设定初始目标。常用的起步基准是**历史表现的 P5**（即 95% 的时间里所达到的水平）。

**目标值选择指南：**

| 目标 | 每月允许停机时间 | 适用场景 |
|--------|--------------------------|-------------|
| 99% | 7.3 小时 | 内部工具、非关键服务 |
| 99.5% | 3.65 小时 | 通用 B2B 服务 |
| 99.9% | 43.8 分钟 | 面向消费者的核心服务 |
| 99.95% | 21.9 分钟 | 金融、医疗、高可靠性场景 |
| 99.99% | 4.38 分钟 | 基础设施、支付平台 |

> **提示：** 设定的 SLO 不要超出团队所能承受的维持能力。过高追求的目标会导致 Error Budget 频繁耗尽，并干扰特性开发。

#### 步骤 4：定义达标计算公式

记录计算 SLO 达成率的具体公式：

```
SLO Compliance = (Good Events / Total Events) × 100%

Where:
- Good Events = requests with status < 500 AND duration < 500ms
- Total Events = all requests received
- Window = rolling 28 days
- Target = 99.9%
```

#### 步骤 5：记录 SLO 规范文档

使用 [SLO 文档模板](#slo-document-template) 记录 SLO。

### 迭代调整

SLO 绝非设定后便可置之不理。请结合以下信号按季度进行复查：

| 信号 | 行动 |
|--------|--------|
| Error Budget 持续未充分使用（剩余 > 80%） | 考虑收紧 SLO |
| Error Budget 频繁耗尽 | 考虑放宽 SLO 或加大对可靠性的投入 |
| 尽管达到 SLO 但用户满意度持续下降 | SLI 可能未能真实反映用户体验；重新审视 SLI 选择 |
| 工程团队因可靠性保障工作感到疲惫倦怠 | SLO 可能定得过于激进 |

---

## Error Budget 策略

### 计算方式

Error Budget 代表允许的故障额度：

```
Error Budget = 1 - SLO Target

Example:
  SLO = 99.9% availability over 28 days
  Error Budget = 0.1%
  = 28 days × 24 hours × 60 minutes × 0.001
  = 40.32 minutes of allowed downtime
```

### Burn Rate 告警

监控 Error Budget 的消耗速率：

| 消耗速度 | 阈值 | 触发动作 | 含义 |
|-------------------|-----------|------------------|---------|
| **快速消耗** | 1 小时消耗 2% 预算 | Page (P1) | 按此速率，预算约在 2 天内耗尽 |
| **中速消耗** | 6 小时消耗 5% 预算 | Alert (P2) | 按此速率，预算约在 5 天内耗尽 |
| **慢速消耗** | 3 天消耗 10% 预算 | Ticket (P3) | 可能在月末前耗尽预算 |

### 预算耗尽后的行动

当 Error Budget 耗尽时，团队应从以下策略选项中进行选择：

| 策略 | 说明 | 适用场景 |
|--------|-------------|-------------|
| **冻结发布** | 暂停非可靠性相关特性发布，直到预算恢复 | 默认策略；确保聚焦于可靠性 |
| **可靠性冲刺** | 将下一个 Sprint 完全用于可靠性改进 | 当系统性问题需要集中投入解决时 |
| **加强审查** | 所有变更均需额外的生产就绪度审查 | 当变更是导致预算消耗的根因时 |
| **降低 SLO 目标** | 经利益相关方同意后降低 SLO | 当目标基于当前架构不切实际时 |

> **重要提示：** 团队应当在预算耗尽**之前**就其 Error Budget 策略达成一致，而不是在危机发生期间。

---

## SLO 模板

### API 服务模板

| SLI | 量测 | 默认 SLO |
|-----|------|---------|
| Availability | 非 5xx 响应 / 总响应 | 99.9% |
| Latency | P99 持续时间 < 阈值 / 总请求 | 99% |
| Error Rate | 非 5xx + 非超时 / 总响应 | 99.9% |

### Batch Job 模板

| SLI | 量测 | 默认 SLO |
|-----|------|---------|
| Freshness | 最大延迟 < 阈值 | 99.5% |
| Correctness | 正确处理数 / 总数 | 99.99% |
| Completion Rate | 成功完成数 / 计划调度数 | 99.9% |

### 前端应用模板

| SLI | 量测 | 默认 SLO |
|-----|------|---------|
| Load Performance | LCP < 2.5s 页面比例 | 90% |
| Interaction Delay | FID < 100ms 交互比例 | 95% |
| Visual Stability | CLS < 0.1 页面比例 | 95% |

---

## SLO 文档模板

为服务创建 SLO 规范时，应包含以下章节：

```markdown
# SLO Specification: [Service Name]

## Service Information
- **Service**: [name]
- **Owner**: [team/person]
- **Description**: [what the service does]
- **Dependencies**: [upstream/downstream services]

## SLI Definition
| SLI | Metric | Good Event | Total Event | Data Source |
|-----|--------|------------|-------------|-------------|
| [name] | [metric name] | [definition] | [definition] | [source] |

## SLO Target
| SLI | Target | Window | Compliance Formula |
|-----|--------|--------|--------------------|
| [name] | [%] | [rolling 28d / calendar month] | [formula] |

## Error Budget Policy
| Budget State | Action |
|-------------|--------|
| > 50% remaining | Normal development |
| < 50% remaining | Increased scrutiny on changes |
| Exhausted | [chosen policy: freeze/sprint/review/lower] |

## Stakeholders
| Role | Person/Team | Notification |
|------|-------------|-------------|
| SLO Owner | [name] | All budget alerts |
| Engineering Lead | [name] | Budget < 50% |
| Product Manager | [name] | Budget exhausted |

## Review Cycle
- **Frequency**: Quarterly
- **Next Review**: [date]
- **Review Checklist**:
  - [ ] Budget consumption trend
  - [ ] User satisfaction alignment
  - [ ] Incident frequency and impact
  - [ ] Team workload balance
```

---

## 与开发工作流集成

### 规格驱动开发（/sdd）中的 SLO

使用 `/sdd` 定义新服务时，SHOULD 在 spec 中包含 SLO 章节：

```markdown
## SLO Targets (Recommended)
| SLI | Target | Rationale |
|-----|--------|-----------|
| Availability | 99.9% | Customer-facing API |
| Latency P99 | < 500ms | User experience requirement |
```

### 事故响应中的 SLO 影响

使用 `/incident` 时，在评估中包含 SLO 影响：

```markdown
### SLO Impact
- **Affected SLI**: Availability
- **Error Budget consumed**: 15 minutes (37% of monthly budget)
- **Remaining budget**: 25.32 minutes
```

---

## 快速参考卡

### SLI 选择
```
API Service?         → Availability + Latency + Quality
Batch Job?           → Freshness + Correctness + Coverage
Frontend App?        → LCP/FID/CLS + Availability
```

### SLO 目标选择
```
Internal tool?       → 99%
B2B service?         → 99.5%
Consumer-facing?     → 99.9%
Financial/critical?  → 99.95%+
```

### Error Budget 快速计算
```
Budget = (1 - target) × window_minutes
99.9% over 28 days = 0.001 × 40320 = 40.32 min
```

---

## 参考资料

- [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) — 基础 SLO 概念
- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/) — 实用 SLO 实施
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多窗口燃烧率告警
- [OpenSLO Specification](https://openslo.com/) — SLO 定义的开放标准
- [The Art of SLOs](https://sre.google/resources/practices-and-processes/art-of-slos/) — Google 的 SLO 工作坊

---

**相关标准：**
- [可观测性标准](observability-standards.md) — 三大支柱框架与指标指引
- [告警标准](alerting-standards.md) — SLO-based 告警策略
- [性能标准](performance-standards.md) — 性能目标
- [日志标准](logging-standards.md) — 结构化日志用于 SLI 数据收集

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始版本：SLI 选择、SLO 方法论、Error Budget、模板 |

---

## 许可证

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
