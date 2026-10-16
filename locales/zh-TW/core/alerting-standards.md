---
source: ../../../core/alerting-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: ca900b3c312b
status: current
---

# 告警標準

> **語言**: [English](../../../core/alerting-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-03-31
**適用範圍**：所有具備生產環境服務的軟體專案
**範疇**：通用
**業界標準**：Google SRE, PagerDuty Best Practices
**參考資料**：[sre.google](https://sre.google/), [PagerDuty](https://www.pagerduty.com/)

---

## 概述

本文件定義生產環境告警的設計、分類、路由與維護標準。有效的告警是可觀測性資料與人工行動之間的橋樑——每個告警都應該具備可操作性、適當的緊急程度，並連結至解決路徑。

---

## 告警嚴重度分類（P1-P4）

### 嚴重度定義

| 等級 | 名稱 | 判定標準 | 回應時間 | 通知管道 |
|-------|------|----------|---------------|----------------------|
| **P1** | 關鍵 (Critical) | 完全服務中斷；資料遺失風險；安全性漏洞 | < 5 分鐘 | 電話 + SMS + Chat |
| **P2** | 高 (High) | 主要功能降級；部分中斷；大量使用者受影響 | < 15 分鐘 | SMS + Chat |
| **P3** | 警告 (Warning) | 效能降級；資源接近上限；次要功能受影響 | < 4 小時 | Chat + Ticket |
| **P4** | 資訊 (Info) | 異常趨勢；預防性通知；非緊急維護 | 下個工作日 | Email + Ticket |

### 嚴重度決策樹

使用此決策樹來判斷適當的嚴重度：

```
Is the user completely unable to use the service?
├─ Yes → P1 (Critical)
└─ No
   ├─ Is a major feature affected with no workaround?
   │  ├─ Yes → P2 (High)
   │  └─ No
   │     ├─ Is performance degraded but service still usable?
   │     │  ├─ Yes → P3 (Warning)
   │     │  └─ No → P4 (Info)
   └─ Is there data loss or security risk?
      └─ Yes → P1 (Critical)
```

---

## 升級路徑

### 升級矩陣範本

為每個嚴重度等級定義升級層級：

| 時間 | P1（關鍵） | P2（高） | P3（警告） |
|------|---------------|-----------|---------------|
| 0 分鐘 | 值班工程師 (On-call Engineer) | 值班工程師 | — |
| 5 分鐘（未確認） | 值班主管 (On-call Lead) | — | — |
| 15 分鐘（未確認） | 工程經理 (Engineering Manager) | 值班主管 | 值班工程師 |
| 30 分鐘（未解決） | VP Engineering | 工程經理 | — |
| 60 分鐘（未解決） | CTO/高階主管 | VP Engineering | 值班主管 |

### 自動升級規則

- P1 告警若未在 **5 分鐘** 內確認，將自動升級
- P2 告警若未在 **15 分鐘** 內確認，將自動升級
- P3 告警若未在 **4 小時** 內確認，將自動升級
- 自動升級通知包含原始告警上下文以及已過時間

---

## 可操作告警設計

### 必要告警要素

每個告警通知必須包含以下 6 個要素：

| 要素 | 說明 | 範例 |
|---------|-------------|---------|
| **標題** | 包含嚴重度的簡明問題描述 | `[P2] API Latency Exceeds SLO Threshold` |
| **影響** | 受影響的服務與範圍 | `payment-service, affecting 30% of users` |
| **目前狀態** | 關鍵指標目前數值與閾值比較 | `P99 latency: 2.3s (SLO: < 500ms)` |
| **Runbook 連結** | 對應解決步驟的連結 | `[Runbook: API Latency High](link)` |
| **Dashboard 連結** | 相關監控儀表板的連結 | `[Dashboard](link)` |
| **開始時間** | 問題何時開始 | `2026-03-31 10:15 UTC` |

### 告警訊息範本

```
[P{severity}] {alert_name}

Impact: {service_name}, affecting {scope}
Status: {metric_name}: {current_value} (threshold: {threshold})
Started: {start_time} ({duration} ago)

Runbook: {runbook_url}
Dashboard: {dashboard_url}
```

### Runbook 連結要求

| 告警等級 | Runbook 要求 |
|-------------|-------------------|
| P1 | 必須（MUST）具備 Runbook 連結 |
| P2 | 必須（MUST）具備 Runbook 連結 |
| P3 | 應當（SHOULD）具備 Runbook 連結 |
| P4 | 應當（SHOULD）具備 Runbook 連結 |

請參閱 [Runbook 標準](runbook-standards.md) 以了解 Runbook 格式與維護。

---

## 降噪策略

### 去重（Deduplication）

在時間範圍內合併具有相同指紋（service + alert_name + labels）的告警：

- 同一告警在 5 分鐘內多次觸發 → 合併為單一通知
- 在合併通知中包含觸發次數：`"Triggered 12 times in last 5 minutes"`
- 當告警解決時重設去重時間範圍

### 分組（Grouping）

將來自連鎖故障的相關告警分組為單一通知：

```yaml
# Example: Alertmanager grouping config
group_by: ['service', 'alert_name']
group_wait: 30s        # Wait before sending first notification
group_interval: 5m     # Wait between group updates
```

- 根本原因告警在分組摘要中享有優先權
- 子告警在通知中列為「相關告警（related alerts）」

### 靜音／維護時段（Suppression / Maintenance Windows）

在已知維護期間將告警靜音：

- 定義包含開始／結束時間以及受影響服務的維護時段
- 受影響服務的所有 P3/P4 告警皆被靜音
- P1/P2 告警**絕不**靜音（安全防護覆寫機制）
- 維護時段會記錄以供稽核

### 抑制／閾值遲滯（Dampening / Threshold Hysteresis）

當指標在閾值附近擺盪時，防止告警頻繁擺盪（flapping）：

| 策略 | 運作方式 | 使用情境 |
|----------|-------------|----------|
| **For-duration** | 條件持續為真達 N 分鐘時才觸發告警 | 預設策略；防止短暫突波 |
| **Hysteresis** | 觸發（90%）與解除（80%）採用不同閾值 | 自然波動的 CPU／記憶體指標 |
| **Percentage-based** | 當 X% 的執行個體超過閾值時發出告警 | 多實例服務 |

範例：
```yaml
# Alert fires only after 5 minutes of sustained breach
- alert: HighErrorRate
  expr: error_rate > 0.05
  for: 5m    # Dampening: must sustain for 5 minutes
```

---

## Alerts as Code

### 版本控制要求

所有告警規則必須：

1. **儲存於 Git** — 告警定義即為程式碼，以同等嚴謹度對待
2. **經過程式碼審查** — 變更在部署前必須經過同儕審查
3. **自動化測試** — CI 在合併前驗證告警規則
4. **透過 CI/CD 部署** — 告警變更須經由部署管線發布

### 告警規則測試

提交修改告警規則的 PR 時，自動化測試應當（SHOULD）驗證：

| 檢查項目 | 說明 |
|-------|-------------|
| **語法正確性** | 規則解析無誤 |
| **閾值合理性** | 數值處於合理範圍內（例如：錯誤率 0-100%） |
| **Runbook 連結有效性** | 所引用的 Runbook URL 存在且可存取 |
| **無衝突** | 新規則不與既有規則重複 |
| **標籤一致性** | 使用標準標籤名稱 |

### CI/CD 整合

```
PR with alert changes → Lint → Unit Test → Review → Merge → Deploy to alerting system
```

---

## 以 SLO 為基礎的告警（最佳實踐）

### 多時間範圍多消耗率（Multi-Window Multi-Burn-Rate）

已定義 SLO 服務所建議採用的告警策略：

**範例：30 天時間範圍內 99.9% 可用性 SLO**

| 時間範圍 | 消耗率（Burn Rate） | 告警等級 | 意義 |
|--------|-----------|-------------|---------|
| 1 小時 | 14.4x | P1（呼叫／Page） | 照此速率，預算將在約 2 天內耗盡 |
| 6 小時 | 6x | P2（告警／Alert） | 照此速率，預算將在約 5 天內耗盡 |
| 3 天 | 1x | P3（工單／Ticket） | 預計在月底前耗盡預算 |

**公式：**
```
Burn Rate = (Error Rate in Window) / (1 - SLO Target)

範例：
  SLO = 99.9%, Window = 1 hour, Errors in window = 1.44%
  Burn Rate = 0.0144 / 0.001 = 14.4x
```

### 傳統告警與以 SLO 為基礎的告警比較

| 維度 | 傳統閾值告警 | 以 SLO 為基礎的告警 |
|-----------|-------------------------------|-------------------|
| **設定依據** | 基於經驗的閾值 | 使用者體驗目標 |
| **誤報（False Positives）** | 較高（靜態閾值無法自我調整） | 較低（消耗率考量了自然波動） |
| **漏報（Missed Alerts）** | 較高（緩慢降級不易被察覺） | 較低（消耗率能捕捉緩慢消耗） |
| **維護成本** | 高（需要頻繁調校閾值） | 低（僅在 SLO 變更時才需更新） |
| **前置需求** | 無 | 必須已定義 SLO |

---

## 告警品質指標

### 關鍵指標

追蹤以下指標以持續改善告警品質：

| 指標 | 定義 | 目標 |
|--------|-----------|--------|
| **訊噪比（SNR）** | 可操作告警數 / 總告警數 | > 80% |
| **MTTA**（平均確認時間，Mean Time to Acknowledge） | 從告警觸發到人員確認的平均時間 | P1: < 5 分鐘, P2: < 15 分鐘 |
| **每人告警頻率** | 每人每天平均收到的告警數 | < 每人每天 5 次 |
| **重複率** | 30 天內重複觸發的相同告警 / 總告警數 | < 20% |
| **Runbook 覆蓋率** | 附有 Runbook 連結的告警數 / 總告警數 | P1/P2: 100%, P3/P4: > 80% |

### 每季稽核流程

每季檢視所有作用中的告警規則：

| 維度 | 問題 | 若為「否」採取的行動 |
|-----------|----------|----------------|
| **過去 90 天內是否曾觸發？** | 此告警是否曾觸發過至少一次？ | 考慮移除或調整閾值 |
| **是否需要人員介入？** | 觸發時是否需要專人採取行動？ | 考慮將回應流程自動化 |
| **是否有 Runbook？** | 是否有記載的解決路徑？ | 建立 Runbook 或移除該告警 |

**其他稽核問題：**
- 嚴重度等級是否仍然恰當？
- 通知管道是否仍然正確？
- 服務架構是否有變更因而影響到此告警？

---

## 快速參考卡（Quick Reference Card）

### 告警設計檢查清單
```
□ 具有清晰、描述性的標題
□ 包含影響與當前狀態
□ 連結到 Runbook（P1/P2 必要）
□ 連結到 Dashboard
□ 說明問題何時開始
□ 具有適當的嚴重度（P1-P4）
```

### 降噪選擇
```
同一告警重複觸發？    → Deduplication
多個服務同時告警？    → Grouping（級聯故障）
計畫維護中？          → Suppression
指標在閾值附近波動？  → Dampening
```

---

## 參考資料

- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多時間範圍消耗率策略
- [PagerDuty — Alert Design Principles](https://www.pagerduty.com/) — 可操作告警設計
- [Prometheus — Alerting Best Practices](https://prometheus.io/docs/practices/alerting/) — 告警規則設計模式
- [Rob Ewaschuk — My Philosophy on Alerting](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/) — 告警的核心哲學

---

**相關標準：**
- [SLO 標準](slo-standards.md) — SLI/SLO/Error Budget 定義
- [可觀測性標準](observability-standards.md) — 指標與監控
- [Runbook 標準](runbook-standards.md) — Runbook 格式與維護
- [日誌標準](logging-standards.md) — 基於日誌的告警模式

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：嚴重度分類、升級路徑、可操作告警、降噪、以 SLO 為基礎的告警、品質指標 |

---

## 授權條款

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
