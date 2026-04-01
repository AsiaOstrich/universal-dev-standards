---
source: ../../../core/runbook-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# Runbook 標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義 Runbook（操作程序）的撰寫、組織、維護和驗證標準。Runbook 是一組有文件記錄的步驟，供操作人員遵循以診斷和解決特定問題或執行例行操作。

---

## Runbook 類型

| 類型 | 用途 | 範例 | 觸發方式 |
|------|------|------|---------|
| **告警回應** | 診斷並修復特定告警 | `api-latency-high.md` | 告警觸發 |
| **標準操作** | 例行操作程序 | `database-backup-restore.md` | 排程或依需求 |
| **緊急程序** | 重大事件快速回應 | `full-service-outage.md` | SEV-1 事件 |
| **變更程序** | 計畫性變更執行步驟 | `database-migration.md` | 變更窗口 |
| **故障排除指南** | 一般問題調查方法 | `memory-leak.md` | 臨時調查 |

---

## 標準範本

每個 Runbook 必須包含以下 7 個章節：

1. **Overview** — 告警名稱、嚴重度、相關服務、擁有者、最後演練日期
2. **Symptoms** — 使用者看到什麼？系統如何表現？
3. **Impact Assessment** — 受影響使用者、業務影響、上下游效應
4. **Diagnostic Steps** — 帶有具體指令的編號步驟
5. **Fix Steps** — 按根因分場景的修復步驟，每步驟後驗證
6. **Escalation** — 具體聯繫人與條件
7. **Post-Actions** — 事後檢查清單

---

## 命名慣例

使用 kebab-case 檔名，描述**問題**而非解決方案：

- `api-latency-high.md` — 描述問題
- `disk-space-low.md` — 描述問題
- ~~`restart-api-server.md`~~ — 描述的是解決方案，不恰當

---

## 有效性管理

### 審查週期

| 類型 | 審查週期 | 審查者 |
|------|---------|--------|
| 告警回應 | 每季（每 3 個月） | 值班團隊 |
| 緊急程序 | 每月 | 工程主管 |
| 標準操作 | 每半年 | 維運團隊 |
| 變更程序 | 每次使用後 | 變更執行者 |
| 故障排除指南 | 每半年 | 領域專家 |

---

## Quick Reference Card

### Runbook 檢查清單
```
□ 具有 Overview 與中繼資料（告警、嚴重度、擁有者）
□ 具有 Symptoms 章節
□ 具有 Impact Assessment
□ 具有編號的 Diagnostic Steps（含指令）
□ 具有 Fix Steps（每步驟後有驗證）
□ 具有 Escalation（含具體聯繫人）
□ 具有 Post-Actions 檢查清單
□ 使用 kebab-case 檔名（問題，非解決方案）
□ Last Updated 日期為最新
□ 已在週期內完成演練
```

---

**相關標準：**
- [告警標準](alerting-standards.md) — 告警設計與 Runbook 連結要求
- [Postmortem 標準](postmortem-standards.md) — 事後檢討與行動項目
- [可觀測性標準](observability-standards.md) — 監控與儀表板
