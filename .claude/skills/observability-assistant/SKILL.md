---
name: observability
scope: universal
description: |
  Guide observability setup, metrics design, and alerting configuration.
  Use when: new service instrumentation, SLO definition, alert design, maturity assessment.
  Keywords: observability, metrics, traces, golden signals, alerting, SLO, 可觀測性, 告警.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[service name or observability topic | 服務名稱或可觀測性主題]"
---

# Observability Assistant | 可觀測性助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/observability-assistant/SKILL.md)

Guide observability implementation across the three pillars: Logs, Metrics, and Traces.

引導三支柱可觀測性實作：Logs、Metrics、Traces。

## Capabilities | 功能

| Capability | Description | 說明 |
|------------|-------------|------|
| **Instrumentation Check** | Pre-launch observability checklist | 上線前可觀測性檢查表 |
| **Maturity Assessment** | L0-L4 maturity self-evaluation | L0-L4 成熟度自評 |
| **Metric Design** | Help design metrics (type, naming, labels) | 協助設計 Metrics |
| **Alert Design** | Design SLO-based alerts with noise reduction | 設計 SLO-based 告警 |
| **Golden Signals** | Verify 4 golden signals coverage | 驗證四大黃金信號覆蓋 |

## Usage | 使用方式

```bash
/observability                        # Show observability guide
/observability --checklist            # Run instrumentation checklist
/observability --maturity             # Maturity assessment (L0-L4)
/observability --alerting             # Alert design guide
/observability "payment-service"      # Guide for specific service
```

## Next Steps Guidance | 下一步引導

> **可觀測性引導完成。建議下一步：**
> - 執行 `/slo` 定義 SLI/SLO/Error Budget ⭐ **推薦**
> - 執行 `/incident` 設定事故回應流程
> - 執行 `/checkin` 提交變更

## Reference | 參考

- Core standard: [observability-standards.md](../../core/observability-standards.md)
- Core standard: [alerting-standards.md](../../core/alerting-standards.md)
- Core standard: [slo-standards.md](../../core/slo-standards.md)
