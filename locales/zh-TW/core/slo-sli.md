---
source: ../../../core/slo-sli.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 8a24ef8525c7
status: current
---

# SLO/SLI 定義標準

> **Language**: [English](../../../core/slo-sli.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/slo-sli.ai.yaml`
> **規格**: XSPEC-063（cross-project/specs/XSPEC-063-uds-sre-standards-pack.md）

## 概觀

本標準定義團隊如何**選取、量測與治理 Service Level Indicators（SLIs）與 Service
Level Objectives（SLOs）**。涵蓋各服務類型的 SLI 選取、SLO 目標設定方法、error
budget 政策，以及 multi-window burn-rate 告警。設計目標為銜接工程可靠性工作與
面向客戶的 SLA 承諾。

本標準屬於 **SRE／運維標準包**（XSPEC-063），是與 `incident-response`（error
budget 燃燒常觸發事件）與 `runbook`（error budget 政策由服務 runbook 連結）並列的
可靠性目標成員。它補充既有的 `slo-standards` Skill 錨點，並餵養 XSPEC-251
（Operator）所述的主動可靠性責任。

> **範圍**：本標準定義「如何選取 SLI、設定 SLO 目標與治理 error budget」。metrics
> 後端（Prometheus、Datadog）、dashboard 產品與告警工具屬採用者的選擇，不在本標準
> 範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 各服務類型的 SLI 選取（API／batch／frontend） | MUST |
| REQ-002 | SLO 目標設定方法（歷史 P5 baseline + buffer） | MUST |
| REQ-003 | Error budget 政策（freeze + reliability-sprint 觸發） | MUST |
| REQ-004 | Multi-window burn-rate 告警（fast／medium／slow burn） | SHOULD |
| REQ-005 | SLO 文件化與檢視節奏（標準 spec + 每季檢視） | MUST |
| REQ-006 | SLO 合規報告（每月利害關係人報告） | SHOULD |

### REQ-001 — 各服務類型的 SLI 選取

每個 production 服務 MUST 定義至少一個與其服務類型匹配的 SLI。API 服務 MUST 量測
可用性（non-5xx／總數）與延遲（低於門檻的請求比例）。Batch job MUST 量測新鮮度
（data lag ≤ 門檻）與正確性（成功處理／總數）。Frontend 服務 MUST 量測 Core Web
Vitals（LCP < 2.5s、FID < 100ms、CLS < 0.1）。

### REQ-002 — SLO 目標設定方法

SLO 目標 MUST 使用歷史 baseline 資料設定。團隊 MUST 從至少 28 個 rolling day 內
觀察到的 P5 表現（第 5 百分位最差時段）起算，再加上小幅 buffer。SLO 目標 MUST
嚴格高於任何外部 SLA 承諾（例如 SLA 99.9% → SLO ≥ 99.95%）。切勿將 SLO 設為等於
SLA；維持 ≥ 0.05% 的 buffer。

### REQ-003 — Error Budget 政策

每個具有 SLO 的服務 MUST 具備書面 Error Budget Policy，明定 error budget 部分或
全部耗盡時的動作。政策至少 MUST 定義：(1) freeze 門檻（通常耗盡 50% → 發版凍結）、
(2) reliability-sprint 觸發（耗盡 100%），以及 (3) SLO 檢視節奏（每季）。error
budget 計算遵循 `budget = (1 − SLO) × 時間窗口`（例如 99.9% 於 30 天 → 43.2 分鐘）。

### REQ-004 — Multi-Window Burn-Rate 告警

團隊 SHOULD 實作 multi-window burn-rate 告警，以同時捕捉快速與緩慢的 budget 耗盡。
建議門檻：fast burn（1 小時內耗用每月 budget 的 2% → P1 page）、medium burn
（6 小時內 5% → P2 alert）、slow burn（3 天內 10% → P3 ticket）。

### REQ-005 — SLO 文件化與檢視節奏

每個 SLO MUST 記載於標準 SLO spec 檔，內含：服務名稱、SLI 公式、量測窗口、目標值、
error budget、告警門檻與 owner。SLO spec MUST 每季檢視，並在任何重大架構變更後
2 週內更新。

### REQ-006 — SLO 合規報告

團隊 SHOULD 每月向利害關係人發布 SLO 合規報告。報告 MUST 包含達成 vs. 目標 SLI 值、
剩餘 error budget、影響 SLO 的重大事件，以及計畫中的可靠性改善。MUST 含 dashboard
連結。

## 與既有標準的整合

- **`slo-standards`**——既有的 Skill 錨點標準；`slo-sli` 提供其背後的詳細
  選取／目標／error-budget 方法。
- **`incident-response`**——error budget burn-rate 告警餵入事件宣告與 severity
  評估。
- **`runbook`**——error budget 政策 MUST 由服務 runbook 連結。
- **`rollback-standards`**——error budget 耗盡可觸發發版凍結，下游則觸發自動
  rollback。
- **`observability-standards`**——SLI 由其定義的 metric/log/trace 支柱計算。
- **`alerting-standards`**——burn-rate 告警遵循 symptom-based 告警與 severity
  分級規則。

## 相關規格

- XSPEC-063 — UDS SRE／運維標準包（本標準來源）
- XSPEC-251 — Operator 主動可靠性（事件上游的 SLO 責任）
- DEC-041 — EU AI Act 2026 合規（可靠性證據）
- DEC-042 — Guardian / Governance Agent 模式（error-budget 驅動動作）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：SLI 選取、SLO 目標方法、error-budget 政策、burn-rate 告警、SLO 文件化/檢視、合規報告（XSPEC-063） |
