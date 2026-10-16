---
source: ../../../core/slo-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 30ebf8c58138
status: current
---

# SLO 標準（Service Level Objectives）

> **語言**: [English](../../../core/slo-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用範圍**: 所有具有正式環境服務的軟體專案
**範疇**: 通用
**業界標準**: Google SRE, ISO/IEC 20000
**參考資料**: [sre.google](https://sre.google/), [OpenSLO](https://openslo.com/)

---

## 概述

本文件定義服務水準指標（Service Level Indicator, SLI）、服務水準目標（Service Level Objective, SLO）與錯誤預算（Error Budget）的標準。這些概念構成可靠性管理的基礎，讓團隊能夠在功能開發速度與服務品質之間取得平衡。

---

## 核心概念

### SLI / SLO / SLA / Error Budget 定義

| 概念 | 定義 | 目標受眾 | 違反後果 |
|---------|-----------|----------|----------------------|
| **SLI**（服務水準指標） | 服務行為的量化測量 | 工程團隊 | 無直接後果（資料點） |
| **SLO**（服務水準目標） | 在特定時間區間內 SLI 的內部目標 | 工程團隊 | 觸發 Error Budget 政策 |
| **SLA**（服務等級協定） | 保證服務品質的外部合約 | 客戶 | 合約罰則（退款、折抵額度） |
| **Error Budget**（錯誤預算） | 允許的不可靠程度（1 - SLO 目標） | 工程團隊 | 耗盡時觸發保護措施 |

### SLI vs SLO vs SLA 比較

```
                    ┌─────────────────────────────────────┐
                    │          Service Quality             │
                    │                                       │
  SLI ─── measures ──► SLO ─── stricter than ──► SLA       │
  (what)              (internal target)         (contract)  │
                    │                                       │
                    │  Error Budget = 1 - SLO target        │
                    └─────────────────────────────────────┘
```

**SLO 應比 SLA 更嚴格**以提供緩衝空間。範例：
- SLA：99.9% 可用性（對客戶的合約義務）
- SLO：99.95% 可用性（內部目標，在違反 SLA 前提供 50% 緩衝空間）

---

## SLI 選取指南

### API 服務

對於 REST/gRPC API 服務，可從以下選取 SLI：

| SLI | 測量方式 | 資料來源 |
|-----|-------------|-------------|
| **Availability**（可用性） | 成功請求（非 5xx）/ 總請求 | 負載平衡器或應用程式指標 |
| **Latency**（延遲） | 處理時間低於門檻值的請求 / 總請求 | 應用程式長條圖指標（Histogram） |
| **Quality**（品質） | 未降級的回應 / 總回應 | 應用程式層級的品質檢查 |

**範例：** 可用性 SLI = 在滾動 28 天內的 `count(http_status != 5xx) / count(all_requests)`。

### 批次作業（Batch Jobs）

適用於排程批次處理、資料管線與 ETL 作業：

| SLI | 測量方式 | 資料來源 |
|-----|-------------|-------------|
| **Freshness**（新鮮度） | 距上次成功完成的時間低於門檻值 | 作業排程器指標 |
| **Correctness**（正確性） | 正確處理的紀錄 / 總紀錄 | 應用程式驗證指標 |
| **Coverage**（涵蓋率） | 成功完成的批次 / 總排程批次 | 作業排程器指標 |

### 前端應用程式

適用於 Web 與行動前端應用程式：

| SLI | 測量方式 | 資料來源 |
|-----|-------------|-------------|
| **Load Performance**（載入效能） | LCP < 2.5s、FID < 100ms、CLS < 0.1 的頁面 / 總頁面 | 真實使用者監控（RUM） |
| **Availability**（可用性） | 成功載入的頁面 / 總頁面載入次數 | RUM 或綜合監控（Synthetic Monitoring） |
| **Interaction Delay**（互動延遲） | 回應時間 < 門檻值的使用者操作 / 總操作次數 | RUM |

### 資料管線

適用於串流與即時資料處理：

| SLI | 測量方式 | 資料來源 |
|-----|-------------|-------------|
| **Throughput**（吞吐量） | 每秒處理紀錄數達到目標 | 管線指標 |
| **Freshness**（新鮮度） | 端對端延遲低於門檻值 | 管線指標 |
| **Correctness**（正確性） | 有效輸出紀錄 / 總輸出紀錄 | 驗證指標 |

---

## SLO 設定方法論

### 步驟流程

為服務設定 SLO 時，請遵循以下 5 個步驟：

#### 步驟 1：選取 SLI

從上方指南選取最具意義的 SLI。每個服務建議先從 1-3 個 SLI 開始。

#### 步驟 2：決定測量時間區間

| 區間類型 | 時間長度 | 適用時機 |
|-------------|----------|----------|
| **滾動區間（Rolling）** | 28 天（建議） | 大多數服務；可平滑化每週週期模式 |
| **日曆區間（Calendar）** | 日曆月份 | 與業務報告週期對齊 |

#### 步驟 3：設定目標值

使用歷史資料設定初始目標。常見的起點是**歷史效能的 P5**（即 95% 的時間都能達到的水準）。

**目標值選取指南：**

| 目標值 | 每月允許停機時間 | 適用對象 |
|--------|--------------------------|-------------|
| 99% | 7.3 小時 | 內部工具、非關鍵服務 |
| 99.5% | 3.65 小時 | 一般 B2B 服務 |
| 99.9% | 43.8 分鐘 | 面向消費者的核心服務 |
| 99.95% | 21.9 分鐘 | 金融、醫療、高可靠性系統 |
| 99.99% | 4.38 分鐘 | 基礎架構、支付平台 |

> **提示：** 不要設定超出自身維護能力的過高 SLO。過度激進的 SLO 會頻繁耗盡您的 Error Budget，並中斷功能開發流程。

#### 步驟 4：定義合規性公式

記錄計算 SLO 合規性的具體公式：

```
SLO Compliance = (Good Events / Total Events) × 100%

Where:
- Good Events = requests with status < 500 AND duration < 500ms
- Total Events = all requests received
- Window = rolling 28 days
- Target = 99.9%
```

#### 步驟 5：記錄 SLO 規格文件

使用 [SLO 文件範本](#slo-document-template) 記錄 SLO。

### 迭代調整

SLO 並非一勞永逸。應每季使用以下訊號進行檢視：

| 訊號 | 採取行動 |
|--------|--------|
| Error Budget 持續未充分使用（剩餘 > 80%） | 考慮收緊 SLO |
| Error Budget 頻繁耗盡 | 考慮放寬 SLO 或投資提升可靠性 |
| 達到 SLO 但使用者滿意度下降 | SLI 可能未反映實際使用者體驗；重新檢視 SLI 選取 |
| 工程團隊因可靠性維護工作過度疲憊 | SLO 可能設定過於激進 |

---

## Error Budget 政策

### 計算方式

Error Budget 代表允許的失敗總量：

```
Error Budget = 1 - SLO Target

Example:
  SLO = 99.9% availability over 28 days
  Error Budget = 0.1%
  = 28 days × 24 hours × 60 minutes × 0.001
  = 40.32 minutes of allowed downtime
```

### 消耗率（Burn Rate）告警

監控 Error Budget 被消耗的速度：

| 消耗速度 | 門檻值 | 觸發行動 | 代表意義 |
|-------------------|-----------|------------------|---------|
| **快速消耗（Fast burn）** | 1 小時內消耗 2% 預算 | 呼叫（P1） | 照此速率，約 2 天預算就會耗盡 |
| **中速消耗（Medium burn）** | 6 小時內消耗 5% 預算 | 告警（P2） | 照此速率，約 5 天預算就會耗盡 |
| **慢速消耗（Slow burn）** | 3 天內消耗 10% 預算 | 工單（P3） | 可能在月底前耗盡預算 |

### 預算耗盡後的因應措施

當 Error Budget 耗盡時，團隊應從下列政策選項中選取因應方式：

| 政策 | 說明 | 適用時機 |
|--------|-------------|-------------|
| **凍結發布** | 暫停非可靠性相關的功能發布，直到預算恢復 | 預設政策；確保團隊專注於可靠性 |
| **可靠性衝刺** | 將下一個 Sprint 完全投入於可靠性改善 | 系統性問題需要集中資源處理時 |
| **加強審查** | 所有變更都需要額外的生產環境就緒審查（Production-Readiness Review） | 變更是造成預算快速消耗的根本原因時 |
| **降低 SLO 目標** | 經利害關係人同意後調降 SLO | 依當前架構而言目標不切實際時 |

> **重要：** 團隊應**在**預算耗盡之前就協議好 Error Budget 政策，而不是在危機發生時才決定。

---

## SLO 範本

### API 服務範本

| SLI | 量測 | 預設 SLO |
|-----|-------------|-------------|
| Availability | 非 5xx 回應 / 總回應 | 99.9% |
| Latency | P99 持續時間 < 閾值 / 總請求 | 99% |
| Error Rate | 非 5xx + 非逾時 / 總回應 | 99.9% |

### Batch Job 範本

| SLI | 量測 | 預設 SLO |
|-----|-------------|-------------|
| Freshness | 最大延遲 < 閾值 | 99.5% |
| Correctness | 正確處理 / 總計 | 99.99% |
| Completion Rate | 成功完成 / 已排程 | 99.9% |

### 前端應用程式範本

| SLI | 量測 | 預設 SLO |
|-----|-------------|-------------|
| Load Performance | LCP < 2.5s 頁面比例 | 90% |
| Interaction Delay | FID < 100ms 互動比例 | 95% |
| Visual Stability | CLS < 0.1 頁面比例 | 95% |

---

## SLO 文件範本

為服務建立 SLO 規格時，請包含以下章節：

```markdown
# SLO Specification: [Service Name]

## Service Information
- **Service**: [name]
- **Owner**: [team/person]
- **Description**: [what the service does]
- **Dependencies**: [upstream/downstream services]

## SLI Definition
| SLI | Metric | Good Event | Total Event | Data Source |
|-----|--------|------------|-------------|-------------|
| [name] | [metric name] | [definition] | [definition] | [source] |

## SLO Target
| SLI | Target | Window | Compliance Formula |
|-----|--------|--------|--------------------|
| [name] | [%] | [rolling 28d / calendar month] | [formula] |

## Error Budget Policy
| Budget State | Action |
|-------------|--------|
| > 50% remaining | Normal development |
| < 50% remaining | Increased scrutiny on changes |
| Exhausted | [chosen policy: freeze/sprint/review/lower] |

## Stakeholders
| Role | Person/Team | Notification |
|------|-------------|-------------|
| SLO Owner | [name] | All budget alerts |
| Engineering Lead | [name] | Budget < 50% |
| Product Manager | [name] | Budget exhausted |

## Review Cycle
- **Frequency**: Quarterly
- **Next Review**: [date]
- **Review Checklist**:
  - [ ] Budget consumption trend
  - [ ] User satisfaction alignment
  - [ ] Incident frequency and impact
  - [ ] Team workload balance
```

---

## 與開發工作流程整合

### 規格驅動開發（/sdd）中的 SLO

使用 `/sdd` 定義新服務時，應（SHOULD）在規格中包含 SLO 章節：

```markdown
## SLO Targets (Recommended)
| SLI | Target | Rationale |
|-----|--------|-----------|
| Availability | 99.9% | Customer-facing API |
| Latency P99 | < 500ms | User experience requirement |
```

### 事故應變中的 SLO 影響

使用 `/incident` 時，請在評估中納入 SLO 影響：

```markdown
### SLO Impact
- **Affected SLI**: Availability
- **Error Budget consumed**: 15 minutes (37% of monthly budget)
- **Remaining budget**: 25.32 minutes
```

---

## Quick Reference Card

### SLI 選擇
```
API Service?         → Availability + Latency + Quality
Batch Job?           → Freshness + Correctness + Coverage
Frontend App?        → LCP/FID/CLS + Availability
```

### SLO 目標選擇
```
Internal tool?       → 99%
B2B service?         → 99.5%
Consumer-facing?     → 99.9%
Financial/critical?  → 99.95%+
```

### Error Budget 快速計算
```
Budget = (1 - target) × window_minutes
99.9% over 28 days = 0.001 × 40320 = 40.32 min
```

---

## 參考資料

- [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) — 基礎 SLO 概念
- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/) — 實務 SLO 實作
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多窗口 Burn Rate 告警
- [OpenSLO Specification](https://openslo.com/) — SLO 定義的開放標準
- [The Art of SLOs](https://sre.google/resources/practices-and-processes/art-of-slos/) — Google 的 SLO 工作坊

---

**相關標準：**
- [可觀測性標準](observability-standards.md) — 三大支柱框架與指標指引
- [告警標準](alerting-standards.md) — SLO-based 告警策略
- [效能標準](performance-standards.md) — 效能目標
- [日誌標準](logging-standards.md) — 結構化日誌用於 SLI 資料收集

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始發布：SLI 選擇、SLO 方法論、Error Budget、範本 |

---

## 授權條款

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
