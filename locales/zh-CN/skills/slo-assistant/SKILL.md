---
source: ../../../../skills/slo-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 引导 SLI 选取、SLO 设置和 Error Budget 管理"
---

# SLO 助手

> **语言**: [English](../../../../skills/slo-assistant/SKILL.md) | 简体中文

引导 SLI 选取、SLO 设置方法论和 Error Budget 管理。

## 功能

| 功能 | 说明 |
|------|------|
| **SLI 选取** | 按服务类型引导 SLI 选取（API/Batch/Frontend） |
| **SLO 设置** | 5 步骤 SLO 设置方法论 |
| **Error Budget** | 计算预算、设置 burn rate 告警 |
| **SLO 文档** | 生成 SLO 规格文档 |
| **SLO 审查** | 季度 SLO 审查引导 |

## 使用方式

```bash
/slo                              # 显示 SLO 指南
/slo create "payment-service"     # 为服务创建 SLO
/slo review                       # 季度 SLO 审查
/slo budget                       # Error Budget 计算
```

## 下一步引导

> **SLO 引导完成。建议下一步：**
> - 执行 `/observability --alerting` 设置 SLO-based 告警 ⭐ **推荐**
> - 执行 `/incident` 整合 SLO 影响评估
> - 执行 `/checkin` 提交变更

## 参考

- 核心规范：[slo-standards.md](../../../../core/slo-standards.md)
- 相关：[observability-standards.md](../../../../core/observability-standards.md)
- 相关：[alerting-standards.md](../../../../core/alerting-standards.md)
