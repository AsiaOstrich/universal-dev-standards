---
source: ../../../core/chaos-engineering-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 20b92ddacd4c
status: current
---

# 混沌工程標準

> **語言**: [English](../../../core/chaos-engineering-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用性**: 所有軟體專案
**範疇**: universal
**授權**: CC BY 4.0
**參考資料**: [Principles of Chaos Engineering](https://principlesofchaos.org/), [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)

---

## 概述

本文件定義混沌工程標準，涵蓋實驗工作流程、故障注入類型、安全護欄、漸進式混沌階段、SLO 整合及實驗記錄範本。目標是透過科學化的混沌實驗持續驗證系統韌性。

---

## 1. 實驗工作流程

混沌實驗遵循 4 步驟科學方法來驗證系統韌性。

### 4 步驟流程

| 步驟 | 名稱 | 說明 |
|------|------|------|
| **步驟 1** | **假設** | 定義穩態假設：「在故障 X 下，系統應維持行為 Y。」描述預期行為與可量測指標。 |
| **步驟 2** | **實驗** | 設計並執行故障注入。記錄實驗參數、持續時間與範圍。 |
| **步驟 3** | **觀察** | 監控系統指標、日誌與告警。對比實際行為與假設。 |
| **步驟 4** | **結論** | 分析結果：假設確認或推翻。記錄發現與改進項目。 |

### 假設指南

一個結構良好的穩態假設應當：
- 定義何謂「正常」（例如：p99 延遲 < 200ms、錯誤率 < 0.1%）
- 指定受測的故障條件
- 敘述故障期間的預期系統行為
- 具備可證偽性與可量測性

---

## 2. 故障注入類型

五種標準故障注入類型涵蓋分散式系統中最常見的失敗模式。

| 類型 | 說明 | 範例 |
|------|------|------|
| **Network Latency** | 注入網路延遲或封包遺失 | 增加 200ms 延遲、5% 封包遺失、DNS 解析延遲 |
| **Service Disruption** | 終止或降級服務實例 | 隨機 kill pods、關閉可用區、重啟服務 |
| **Resource Exhaustion** | 耗盡運算資源 | CPU 飽和、記憶體壓力、磁碟空間耗盡、檔案描述子耗盡 |
| **Dependency Failure** | 模擬外部相依性故障 | 資料庫連線中斷、第三方 API 回傳 503、快取無法使用 |
| **Clock Skew** | 引入時鐘漂移或 NTP 異常 | 時鐘向前/向後偏移 5 分鐘、NTP 服務中斷 |

### 選擇故障類型

根據以下面向選擇故障注入類型：
- 系統架構與已知弱點
- 歷史事故模式
- 相依性關鍵度分析
- SLO 風險評估

---

## 3. 安全護欄

每個混沌實驗都必須具備安全護欄，以防止不受控制的損害。

### 三項安全機制

| 機制 | 說明 | 範例 |
|------|------|------|
| **Blast Radius** | 將影響範圍限制在受控的子集內 | 最多影響 N% 流量、最多影響 M 個實例、僅限單一區域 |
| **Auto-Stop** | 定義中止實驗的自動終止條件 | 錯誤率超過閾值、延遲超過上限、健康檢查失敗次數超過限制 |
| **Rollback** | 提供一鍵機制以移除所有注入的故障並恢復正常狀態 | 用於還原所有故障注入的緊急停止開關（kill switch）、自動化清理腳本、基礎架構回滾 |

### 護欄要求

- 每個實驗在執行前都必須定義這三項機制
- Auto-Stop 條件必須進行即時監控
- Rollback 必須在實驗開始前完成測試
- 執行期間必須有指定的「實驗負責人」在場

---

## 4. 漸進式混沌

混沌工程的採用遵循漸進式的 3 階段方法，各階段在推進之前都必須滿足相應的前提條件。

### 3 階段進程

| 階段 | 環境 | 前提條件 |
|------|------|---------|
| **階段 1** | **非生產** | 基礎監控就位；團隊理解混沌工程原則；安全護欄已定義 |
| **階段 2** | **Staging** | 在階段 1 完成 3 次以上成功的實驗；已部署完整可觀測性系統；自動化 rollback 已驗證 |
| **階段 3** | **生產** | 階段 2 完成且無重大問題；已證明成熟的安全護欄；取得管理層核准；事件回應計畫就緒 |

### 階段晉級準則

- 每個階段都需要具備完成前提條件的文件化證據
- 階段晉級決策應由團隊進行審查
- 若發現新風險，退回前一階段是可接受的

---

## 5. SLO 整合

混沌實驗必須與 SLO 的 Error Budget 管理協調配合，以避免對服務可靠性造成過度影響。

### Error Budget 限制

| 規則 | 閾值 | 說明 |
|------|------|------|
| **單次實驗限制** | **10%** | 單次混沌實驗不得消耗超過總 Error Budget 的 10% |
| **暫停閾值** | **30%** | 當剩餘 Error Budget 低於 30% 時，應暫停混沌實驗 |
| **預算報告** | — | 混沌實驗對 Error Budget 造成的所有影響，都必須記錄在 Error Budget 報告中 |

### 整合指南

- 在 Error Budget 充裕時（剩餘 > 50%）排定混沌實驗
- 在執行可能影響 SLI 的實驗前，與 SLO 負責人進行協調
- 在可行的情況下，將混沌引起的錯誤與自然發生的錯誤分開追蹤
- 在定期的 SLO 審查會議中審視混沌實驗的影響

---

## 6. 實驗記錄範本

每個完成的混沌實驗都必須使用標準記錄範本進行記錄。

### 5 區段記錄格式

| 區段 | 內容 |
|------|------|
| **假設** | 穩態假設描述、預期行為、可量測指標 |
| **方法** | 故障注入類型、參數、持續時間、blast radius、環境 |
| **結果** | 實際觀察到的系統行為、指標變化、告警觸發、使用者影響 |
| **學習** | 假設確認或推翻、發現的弱點、非預期行為 |
| **行動** | 後續改進計畫、負責人、時程、相關 ticket |

### 記錄範例

```markdown
## Chaos Experiment Record

### Hypothesis
Under a 200ms network latency injection on the payment service,
the checkout flow should complete within 3 seconds (p99) with zero failed transactions.

### Method
- **Type**: Network Latency
- **Target**: payment-service pods (2 of 6)
- **Parameters**: 200ms delay on all outbound requests
- **Duration**: 15 minutes
- **Blast Radius**: 33% of payment service instances
- **Environment**: Staging

### Result
- Checkout p99 latency increased to 2.8s (within threshold)
- 0 failed transactions
- 2 timeout alerts triggered (expected)
- No user-facing errors

### Learning
- Hypothesis CONFIRMED
- Retry logic worked as expected
- Timeout alert threshold may need adjustment (too sensitive)

### Action
- [ ] Adjust timeout alert threshold from 2s to 3s (owner: SRE team, by: next sprint)
- [ ] Add circuit breaker metrics to dashboard (owner: platform team, by: next sprint)
```

---

## 參考資料

- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)
- [Gremlin Chaos Engineering Guide](https://www.gremlin.com/chaos-engineering/)
- [AWS Fault Injection Simulator](https://aws.amazon.com/fis/)

---

*本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。*
