---
source: ../../../core/slo-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# SLO 標準（Service Level Objectives）

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義 Service Level Indicators（SLI）、Service Level Objectives（SLO）及 Error Budgets 的標準。這些概念構成可靠性管理的基礎，讓團隊在功能開發速度與服務品質之間取得平衡。

---

## 關鍵概念

| 概念 | 定義 | 對象 | 違反後果 |
|------|------|------|---------|
| **SLI** | 服務行為的量化量測 | 工程團隊 | 無直接後果（資料點） |
| **SLO** | 在時間窗口內 SLI 的內部目標 | 工程團隊 | 觸發 Error Budget 政策 |
| **SLA** | 保證服務品質的外部合約 | 客戶 | 合約罰則（退款、信用額度） |
| **Error Budget** | 允許的不可靠量（1 - SLO 目標） | 工程團隊 | 耗盡時觸發保護措施 |

**SLO 應比 SLA 更嚴格**，以提供緩衝。例如：
- SLA：99.9% 可用性（對客戶的合約義務）
- SLO：99.95% 可用性（內部目標，在 SLA 違反前有 50% 緩衝）

---

## SLI 選擇指南

### API 服務

| SLI | 量測 | 資料來源 |
|-----|------|---------|
| **Availability** | 成功請求（非 5xx）/ 總請求 | Load Balancer 或應用指標 |
| **Latency** | 持續時間低於閾值的請求 / 總請求 | 應用 Histogram 指標 |
| **Quality** | 未降級回應 / 總回應 | 應用層品質檢查 |

### Batch Jobs

| SLI | 量測 | 資料來源 |
|-----|------|---------|
| **Freshness** | 上次成功完成至今的時間 | Job Scheduler 指標 |
| **Correctness** | 正確處理的記錄 / 總記錄 | 應用驗證指標 |
| **Coverage** | 成功完成的批次 / 總排程批次 | Job Scheduler 指標 |

---

## Error Budget 政策

### 計算方式

```
Error Budget = 1 - SLO 目標

範例：
  SLO = 99.9% 可用性，28 天窗口
  Error Budget = 0.1%
  = 28 天 × 24 小時 × 60 分鐘 × 0.001
  = 40.32 分鐘的允許停機時間
```

### Burn Rate 告警

| 消耗速度 | 閾值 | 觸發動作 | 意義 |
|---------|------|---------|------|
| **快速消耗** | 1 小時消耗 2% 預算 | Page（P1） | 按此速率，約 2 天耗盡 |
| **中速消耗** | 6 小時消耗 5% 預算 | Alert（P2） | 按此速率，約 5 天耗盡 |
| **慢速消耗** | 3 天消耗 10% 預算 | Ticket（P3） | 可能在月底前耗盡 |

### 預算耗盡後的行動

| 政策 | 說明 | 適用情境 |
|------|------|---------|
| **凍結發布** | 暫停非可靠性功能發布 | 預設政策 |
| **可靠性衝刺** | 下個 Sprint 專注於可靠性改善 | 系統性問題需要集中處理 |
| **加強審查** | 所有變更需額外生產就緒審查 | 變更是預算消耗的根因 |
| **降低 SLO 目標** | 經利害關係人同意後降低 SLO | 目標對當前架構不切實際 |

---

## Quick Reference Card

### SLI 選擇
```
API 服務？        → Availability + Latency + Quality
Batch Job？       → Freshness + Correctness + Coverage
前端應用？        → LCP/FID/CLS + Availability
```

### SLO 目標選擇
```
內部工具？        → 99%
B2B 服務？        → 99.5%
消費者面向？      → 99.9%
金融/關鍵？       → 99.95%+
```

### Error Budget 快速計算
```
Budget = (1 - target) × window_minutes
99.9% over 28 days = 0.001 × 40320 = 40.32 min
```

---

**相關標準：**
- [可觀測性標準](observability-standards.md) — 三大支柱框架與指標指引
- [告警標準](alerting-standards.md) — SLO-based 告警策略
- [日誌標準](logging-standards.md) — 結構化日誌用於 SLI 資料收集
