---
source: ../../../../skills/observability-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-08-17
status: current
description: |
  引导可观测性建设、指标设计与告警配置。
  Use when: 新服务的埋点、SLO 定义、告警设计、成熟度评估。
  Not for: 设置数值目标与 Error Budget 策略——请用 /slo；日志格式与级别——请用 /logging-guide。
  Keywords: observability, metrics, traces, golden signals, alerting, SLO, 可观测性, 指标, 追踪, 告警.
---

# 可观测性助手

> **语言**: [English](../../../../skills/observability-assistant/SKILL.md) | 简体中文

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

## 下一步引导

> **可观测性引导完成。建议下一步：**
> - 执行 `/slo` 定义 SLI/SLO/Error Budget ⭐ **推荐**
> - 执行 `/incident` 设定事故响应流程
> - 执行 `/checkin` 提交变更

## 参考

- 核心规范：[observability-standards.md](../../../../core/observability-standards.md)
- 核心规范：[alerting-standards.md](../../../../core/alerting-standards.md)
- 核心规范：[slo-standards.md](../../../../core/slo-standards.md)
