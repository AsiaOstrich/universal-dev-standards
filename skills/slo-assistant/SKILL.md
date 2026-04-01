---
name: slo
scope: universal
description: |
  Guide SLI selection, SLO setting, and Error Budget management.
  Use when: defining service quality targets, setting up SLO-based alerting, Error Budget policy.
  Keywords: SLI, SLO, SLA, Error Budget, burn rate, service level, 服務等級.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create|review|budget] [service name | 服務名稱]"
---

# SLO Assistant | SLO 助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/slo-assistant/SKILL.md)

Guide SLI selection, SLO setting methodology, and Error Budget management.

引導 SLI 選取、SLO 設定方法論和 Error Budget 管理。

## Capabilities | 功能

| Capability | Description | 說明 |
|------------|-------------|------|
| **SLI Selection** | Guide SLI choice by service type (API/Batch/Frontend) | 按服務類型引導 SLI 選取 |
| **SLO Setting** | 5-step SLO setting methodology | 5 步驟 SLO 設定方法論 |
| **Error Budget** | Calculate budget, set burn rate alerts | 計算預算、設定 burn rate 告警 |
| **SLO Document** | Generate SLO specification document | 產生 SLO 規格文件 |
| **SLO Review** | Quarterly SLO review guide | 季度 SLO 審查引導 |

## Usage | 使用方式

```bash
/slo                              # Show SLO guide
/slo create "payment-service"     # Create SLO for service
/slo review                       # Quarterly SLO review
/slo budget                       # Error Budget calculation
```

## Next Steps Guidance | 下一步引導

> **SLO 引導完成。建議下一步：**
> - 執行 `/observability --alerting` 設定 SLO-based 告警 ⭐ **推薦**
> - 執行 `/incident` 整合 SLO 影響評估
> - 執行 `/checkin` 提交變更

## Reference | 參考

- Core standard: [slo-standards.md](../../core/slo-standards.md)
- Related: [observability-standards.md](../../core/observability-standards.md)
- Related: [alerting-standards.md](../../core/alerting-standards.md)
