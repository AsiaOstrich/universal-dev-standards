---
source: ../../../../skills/observability-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 引導可觀測性設定、指標設計和告警配置"
name: observability
allowed-tools: Read, Write, Grep, Glob
scope: universal
argument-hint: "[service name or observability topic | 服務名稱或可觀測性主題]"
---

# 可觀測性助手

> **語言**: [English](../../../../skills/observability-assistant/SKILL.md) | 繁體中文

引導三支柱可觀測性實作：Logs、Metrics、Traces。

## 功能

| 功能 | 說明 |
|------|------|
| **儀器檢查** | 上線前可觀測性檢查表 |
| **成熟度評估** | L0-L4 成熟度自評 |
| **指標設計** | 協助設計 Metrics（類型、命名、標籤） |
| **告警設計** | 設計 SLO-based 告警並降低雜訊 |
| **黃金信號** | 驗證四大黃金信號覆蓋 |

## 使用方式

```bash
/observability                        # 顯示可觀測性指南
/observability --checklist            # 執行儀器檢查表
/observability --maturity             # 成熟度評估（L0-L4）
/observability --alerting             # 告警設計指南
/observability "payment-service"      # 特定服務的引導
```

## 下一步引導

> **可觀測性引導完成。建議下一步：**
> - 執行 `/slo` 定義 SLI/SLO/Error Budget ⭐ **推薦**
> - 執行 `/incident` 設定事故回應流程
> - 執行 `/checkin` 提交變更

## 參考

- 核心規範：[observability-standards.md](../../../../core/observability-standards.md)
- 核心規範：[alerting-standards.md](../../../../core/alerting-standards.md)
- 核心規範：[slo-standards.md](../../../../core/slo-standards.md)
