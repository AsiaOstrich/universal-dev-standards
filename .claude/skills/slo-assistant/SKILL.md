---
source: ../../../../skills/slo-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 引導 SLI 選取、SLO 設定和 Error Budget 管理"
name: slo
allowed-tools: Read, Write, Grep, Glob
scope: universal
argument-hint: "[create|review|budget] [service name | 服務名稱]"
---

# SLO 助手

> **語言**: [English](../../../../skills/slo-assistant/SKILL.md) | 繁體中文

引導 SLI 選取、SLO 設定方法論和 Error Budget 管理。

## 功能

| 功能 | 說明 |
|------|------|
| **SLI 選取** | 按服務類型引導 SLI 選取（API/Batch/Frontend） |
| **SLO 設定** | 5 步驟 SLO 設定方法論 |
| **Error Budget** | 計算預算、設定 burn rate 告警 |
| **SLO 文件** | 產生 SLO 規格文件 |
| **SLO 審查** | 季度 SLO 審查引導 |

## 使用方式

```bash
/slo                              # 顯示 SLO 指南
/slo create "payment-service"     # 為服務建立 SLO
/slo review                       # 季度 SLO 審查
/slo budget                       # Error Budget 計算
```

## 下一步引導

> **SLO 引導完成。建議下一步：**
> - 執行 `/observability --alerting` 設定 SLO-based 告警 ⭐ **推薦**
> - 執行 `/incident` 整合 SLO 影響評估
> - 執行 `/checkin` 提交變更

## 參考

- 核心規範：[slo-standards.md](../../../../core/slo-standards.md)
- 相關：[observability-standards.md](../../../../core/observability-standards.md)
- 相關：[alerting-standards.md](../../../../core/alerting-standards.md)
