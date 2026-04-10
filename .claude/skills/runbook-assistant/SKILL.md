---
source: ../../../../skills/runbook-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 引導 Runbook 撰寫、維護、演練和覆蓋率報告"
name: runbook
allowed-tools: Read, Write, Grep, Glob
scope: universal
argument-hint: "[create|drill|coverage] [alert name or type | 告警名稱或類型]"
---

# Runbook 助手

> **語言**: [English](../../../../skills/runbook-assistant/SKILL.md) | 繁體中文

引導 Runbook 撰寫、維護、演練和覆蓋率報告。

## 功能

| 功能 | 說明 |
|------|------|
| **建立 Runbook** | 從標準範本產生 Runbook（7 個區段） |
| **演練規劃** | 規劃和記錄演練 |
| **覆蓋率報告** | 檢查 P1-P4 告警的 Runbook 覆蓋率 |
| **品質審查** | 驗證 Runbook 品質（6 個原則） |
| **過期檢查** | 識別過期需審查的 Runbook |

## 使用方式

```bash
/runbook                              # 顯示 Runbook 指南
/runbook create "api-latency-high"    # 為告警建立 Runbook
/runbook drill                        # 規劃演練
/runbook coverage                     # 產生覆蓋率報告
```

## 下一步引導

> **Runbook 引導完成。建議下一步：**
> - 執行 `/observability --alerting` 連結告警到 Runbook ⭐ **推薦**
> - 執行 `/incident --postmortem` 從事故更新 Runbook
> - 執行 `/checkin` 提交變更

## 參考

- 核心規範：[runbook-standards.md](../../../../core/runbook-standards.md)
- 相關：[alerting-standards.md](../../../../core/alerting-standards.md)
- 相關：[postmortem-standards.md](../../../../core/postmortem-standards.md)
