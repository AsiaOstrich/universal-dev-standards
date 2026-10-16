---
source: ../../../core/alerting-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: ca900b3c312b
status: current
---

# 告警标准

> **语言**: [English](../../../core/alerting-standards.md) | [繁體中文](../../zh-TW/core/alerting-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有包含生产服务的软件项目
**范围**: 通用
**行业标准**: Google SRE, PagerDuty Best Practices
**参考资料**: [sre.google](https://sre.google/), [PagerDuty](https://www.pagerduty.com/)

---

## 概述

本文件定义生产环境告警的设计、分类、路由和维护标准。有效的告警是可观测性数据与人工行动之间的桥梁 — 每个告警都应该是可操作的、具有适当的紧急程度，并链接到解决路径。

---

## 告警严重度分类（P1-P4）

### 严重度定义

| 级别 | 名称 | 标准 | 响应时间 | 通知渠道 |
|------|------|------|---------|---------|
| **P1** | 关键 | 完全服务中断；数据丢失风险；安全漏洞 | < 5 分钟 | 电话 + SMS + Chat |
| **P2** | 高 | 主要功能降级；部分中断；大量用户影响 | < 15 分钟 | SMS + Chat |
| **P3** | 警告 | 性能降级；资源接近上限；次要功能受影响 | < 4 小时 | Chat + Ticket |
| **P4** | 信息 | 异常趋势；预防性通知；非紧急维护 | 下个工作日 | Email + Ticket |

### 严重度决策树

使用此决策树来确定适当的严重度：

```
Is the user completely unable to use the service?
├─ Yes → P1 (Critical)
└─ No
   ├─ Is a major feature affected with no workaround?
   │  ├─ Yes → P2 (High)
   │  └─ No
   │     ├─ Is performance degraded but service still usable?
   │     │  ├─ Yes → P3 (Warning)
   │     │  └─ No → P4 (Info)
   └─ Is there data loss or security risk?
      └─ Yes → P1 (Critical)
```

---

## 升级路径

### 升级矩阵模板

为每个严重度级别定义升级层级：

| 时间 | P1（关键） | P2（高） | P3（警告） |
|------|-----------|---------|-----------|
| 0 分钟 | 值班工程师 | 值班工程师 | — |
| 5 分钟（未确认） | 值班主管 | — | — |
| 15 分钟（未确认） | 工程经理 | 值班主管 | 值班工程师 |
| 30 分钟（未解决） | VP Engineering | 工程经理 | — |
| 60 分钟（未解决） | CTO/高管 | VP Engineering | 值班主管 |

### 自动升级规则

- P1 告警若未确认将在 **5 分钟**后自动升级
- P2 告警若未确认将在 **15 分钟**后自动升级
- P3 告警若未确认将在 **4 小时**后自动升级
- 自动升级通知包含原始告警上下文及已耗费时间

---

## 可操作告警设计

### 必需的告警要素

每个告警通知必须包含这 6 个要素：

| 要素 | 描述 | 示例 |
|------|------|------|
| **标题** | 包含严重度的简明问题描述 | `[P2] API Latency Exceeds SLO Threshold` |
| **影响** | 受影响的服务与范围 | `payment-service, affecting 30% of users` |
| **当前状态** | 关键指标当前值与阈值对比 | `P99 latency: 2.3s (SLO: < 500ms)` |
| **Runbook 链接** | 对应解决步骤的链接 | `[Runbook: API Latency High](link)` |
| **Dashboard 链接** | 相关监控仪表板的链接 | `[Dashboard](link)` |
| **开始时间** | 问题何时开始 | `2026-03-31 10:15 UTC` |

### 告警消息模板

```
[P{severity}] {alert_name}

Impact: {service_name}, affecting {scope}
Status: {metric_name}: {current_value} (threshold: {threshold})
Started: {start_time} ({duration} ago)

Runbook: {runbook_url}
Dashboard: {dashboard_url}
```

### Runbook 链接要求

| 告警级别 | Runbook 要求 |
|----------|-------------|
| P1 | 必须有 Runbook 链接 |
| P2 | 必须有 Runbook 链接 |
| P3 | 应该有 Runbook 链接 |
| P4 | 应该有 Runbook 链接 |

有关 Runbook 格式与维护，请参阅 [Runbook 标准](runbook-standards.md)。

---

## 降噪策略

### 去重

在时间窗口内合并具有相同指纹（service + alert_name + labels）的告警：

- 5 分钟内多次触发的同一告警 → 合并为一条通知
- 在合并通知中包含触发次数：`"Triggered 12 times in last 5 minutes"`
- 告警解决时重置去重窗口

### 分组

将来自级联故障的相关告警合并到单条通知中：

```yaml
# Example: Alertmanager grouping config
group_by: ['service', 'alert_name']
group_wait: 30s        # Wait before sending first notification
group_interval: 5m     # Wait between group updates
```

- 根因告警在分组摘要中享有优先权
- 子告警在通知中列为“相关告警”

### 抑制 / 维护窗口

在已知维护期间将告警静音：

- 定义包含开始/结束时间以及受影响服务的维护窗口
- 受影响服务的所有 P3/P4 告警均被静音
- P1/P2 告警**绝不**静音（安全覆盖）
- 维护窗口会被记录以供审计

### 缓冲 / 阈值滞后

防止指标在阈值附近波动时告警反复震荡：

| 策略 | 运作方式 | 使用场景 |
|------|---------|---------|
| **For-duration** | 仅当条件持续满足 N 分钟时才触发告警 | 默认策略；防止瞬时尖峰 |
| **Hysteresis** | 触发（90%）与恢复（80%）使用不同阈值 | 自然波动的 CPU/内存指标 |
| **Percentage-based** | 当 X% 的实例超过阈值时告警 | 多实例服务 |

示例：
```yaml
# Alert fires only after 5 minutes of sustained breach
- alert: HighErrorRate
  expr: error_rate > 0.05
  for: 5m    # Dampening: must sustain for 5 minutes
```

---

## Alerts as Code

### 版本控制要求

所有告警规则必须：

1. **存储于 Git** — 告警定义视为代码，以相同的严格程度对待
2. **代码审查** — 变更在部署前需经同行审查
3. **自动测试** — CI 在合并前验证告警规则
4. **通过 CI/CD 部署** — 告警变更走部署流程

### 告警规则测试

当提交修改告警规则的 PR 时，自动化测试应该验证：

| 检查项 | 描述 |
|--------|------|
| **语法正确性** | 规则解析无错误 |
| **阈值合理性** | 数值在合理范围内（例如，错误率 0-100%） |
| **Runbook 链接有效性** | 引用的 Runbook URL 存在且可访问 |
| **无冲突** | 新规则不与现有规则重复 |
| **标签一致性** | 使用标准标签名称 |

### CI/CD 集成

```
PR with alert changes → Lint → Unit Test → Review → Merge → Deploy to alerting system
```

---

## 基于 SLO 的告警（最佳实践）

### 多窗口多消耗率

针对定义了 SLO 的服务，推荐的告警策略如下：

**示例：30 天窗口内 99.9% 可用性 SLO**

| 窗口 | 消耗率 | 告警级别 | 含义 |
|------|--------|----------|------|
| 1 小时 | 14.4x | P1（呼叫） | 按此速率，预算将在约 2 天内耗尽 |
| 6 小时 | 6x | P2（告警） | 按此速率，预算将在约 5 天内耗尽 |
| 3 天 | 1x | P3（工单） | 预计在月底前耗尽预算 |

**公式：**
```
Burn Rate = (Error Rate in Window) / (1 - SLO Target)

Example:
  SLO = 99.9%, Window = 1 hour, Errors in window = 1.44%
  Burn Rate = 0.0144 / 0.001 = 14.4x
```

### 传统告警 vs 基于 SLO 的告警对比

| 维度 | 传统阈值告警 | 基于 SLO 的告警 |
|------|-------------|-----------------|
| **设定依据** | 基于经验的阈值 | 用户体验目标 |
| **误报率** | 较高（静态阈值无法自适应） | 较低（消耗率考虑了自然波动） |
| **漏报率** | 较高（缓慢劣化不易察觉） | 较低（消耗率可捕获缓慢消耗） |
| **维护成本** | 高（需频繁调优阈值） | 低（仅在 SLO 变更时更新） |
| **前提条件** | 无 | 必须有明确定义的 SLO |

---

## 告警质量指标

### 核心指标

追踪以下指标以持续提升告警质量：

| 指标 | 定义 | 目标 |
|------|------|------|
| **信噪比（SNR）** | 可操作告警数 / 总告警数 | > 80% |
| **MTTA**（平均确认时间） | 从触发告警到人工确认的平均时间 | P1: < 5 分钟，P2: < 15 分钟 |
| **人均告警频率** | 每人每天平均接收的告警数 | < 5 次/人/天 |
| **重复率** | 30 天内重复触发的相同告警 / 总告警数 | < 20% |
| **Runbook 覆盖率** | 关联 Runbook 的告警数 / 总告警数 | P1/P2: 100%，P3/P4: > 80% |

### 季度审查流程

每季度审查所有活跃的告警规则：

| 维度 | 问题 | 若为“否”采取的行动 |
|------|------|-------------------|
| **过去 90 天内是否触发过？** | 此告警是否至少触发过一次？ | 考虑移除或调整阈值 |
| **是否需要人工干预？** | 触发时是否需要人员介入处理？ | 考虑实现自动化响应 |
| **是否具备 Runbook？** | 是否有文档记录的解决路径？ | 编写 Runbook 或移除该告警 |

**其他审查问题：**
- 严重度级别是否仍然适当？
- 通知渠道是否仍然正确？
- 服务架构是否发生了影响此告警的变更？

---

## 快速参考卡

### 告警设计检查清单
```
□ 具有清晰、描述性的标题
□ 包含影响与当前状态
□ 链接到 Runbook（P1/P2 必要）
□ 链接到 Dashboard
□ 说明问题何时开始
□ 具有适当的严重度（P1-P4）
```

### 降噪选择
```
同一告警重复触发？     → Deduplication
多个服务同时告警？     → Grouping（级联故障）
计划维护中？           → Suppression
指标在阈值附近波动？   → Dampening
```

---

## 参考资料

- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多窗口消耗率策略
- [PagerDuty — Alert Design Principles](https://www.pagerduty.com/) — 可操作告警设计
- [Prometheus — Alerting Best Practices](https://prometheus.io/docs/practices/alerting/) — 告警规则设计模式
- [Rob Ewaschuk — My Philosophy on Alerting](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/) — 告警基础哲学

---

**相关标准：**
- [SLO 标准](slo-standards.md) — SLI/SLO/Error Budget 定义
- [可观测性标准](observability-standards.md) — 指标与监控
- [Runbook 标准](runbook-standards.md) — Runbook 格式与维护
- [日志标准](logging-standards.md) — 基于日志的告警模式

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-03-31 | 初始版本：严重度分类、升级机制、可操作告警、降噪、基于 SLO 的告警、质量指标 |

---

## 许可

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可协议发布。
