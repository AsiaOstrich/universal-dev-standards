---
name: runbook-assistant
source: ../../../../skills/runbook-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-12
source_hash: f11a4927fe55
status: current
scope: universal
description: |
  引導 Runbook 的撰寫、維護與演練。
  Use when: 撰寫 Runbook、規劃演練、稽核 Runbook 覆蓋範圍、事故後更新 Runbook。
  Not for: 處理正在進行中的事故——請用 /incident；部署程序本身——請用 /deploy。
  Keywords: runbook, operations, drill, on-call, procedure, 維運手冊, 演練, 待命, 標準程序.
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

## 部署 Runbook — 強制規則

任何包含 destructive-update（stop → swap → start）的部署 runbook **必須**遵循 [Defensive Deployment Ordering](../../../../core/deployment-standards.md#defensive-deployment-ordering) 順序：解壓到 staging → verify → 通過後才動 live install。跳過 verify 步驟已造成真實生產事故。

## 參考

- 詳細指南：[guide.md](./guide.md) — 運維手冊的撰寫、組織與驗證。要寫手冊、審查運維程序、規劃演練或評估涵蓋範圍時讀它。
- 核心規範：[runbook-standards.md](../../../../core/runbook-standards.md)
- 相關：[alerting-standards.md](../../../../core/alerting-standards.md)
- 相關：[postmortem-standards.md](../../../../core/postmortem-standards.md)
- 相關：[deployment-standards.md § Defensive Deployment Ordering](../../../../core/deployment-standards.md#defensive-deployment-ordering) — destructive 部署的強制順序
- 相關：[packaging-standards.md § Archive Format Integrity](../../../../core/packaging-standards.md#archive-format-integrity) — 與防禦性順序配對的上游規範
