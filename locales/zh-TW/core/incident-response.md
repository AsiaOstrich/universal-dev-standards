---
source: ../../../core/incident-response.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: b1c1a516710b
status: current
---

# 事件回應標準

> **Language**: [English](../../../core/incident-response.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/incident-response.ai.yaml`
> **規格**: XSPEC-063（cross-project/specs/XSPEC-063-uds-sre-standards-pack.md）

## 概觀

本標準定義端到端的**事件回應生命週期（incident response lifecycle）**：severity
分類、回應時間 SLA、角色與職責、溝通協定、升級路徑，以及 blameless postmortem
要求。設計目標為降低 MTTR、確保事件期間對利害關係人的一致溝通，並透過結構化
postmortem 推動系統性可靠性改善。

本標準屬於 **SRE／運維標準包**（XSPEC-063），是與 `slo-sli`（error budget 觸發）
與 `runbook`（可執行修復步驟）並列的事件處理成員。它與
`virtual-organization-standards` 組合——SEV-1 事件會啟動事件 virtual organization
（IC、Communications Lead、Operations Lead）——並餵養 XSPEC-251（Operator）所述的
主動可靠性責任。

> **範圍**：本標準定義「事件如何分類、協調、溝通與學習」。paging 工具（PagerDuty、
> Opsgenie）、status-page 產品與 ticketing 系統屬採用者的選擇，不在本標準範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Severity 分類（4 級 SEV 量表搭配回應 SLA） | MUST |
| REQ-002 | Incident Commander 角色（SEV-1/2 須於 10 分鐘內指派） | MUST |
| REQ-003 | 利害關係人溝通協定（定義節奏 + status page） | MUST |
| REQ-004 | Blameless postmortem 要求（5 Whys、action item 追蹤） | MUST |
| REQ-005 | On-call 輪值與交接（≥2 名工程師、書面交接） | MUST |
| REQ-006 | 事件回顧指標（MTTD/MTTR 每月檢視） | SHOULD |

### REQ-001 — Severity 分類

每起事件 MUST 在宣告時以 4 級 severity 量表分類。**SEV-1**（Critical）：影響所有
使用者的完全服務中斷或資料外洩，15 分鐘內回應、通報 C-suite。**SEV-2**（High）：
主要功能無法使用或顯著效能劣化、影響 >25% 使用者，30 分鐘內回應。**SEV-3**
（Medium）：次要功能無法使用或影響 <25% 使用者的劣化，4 小時內回應。**SEV-4**
（Low）：外觀問題或極輕微影響，24 小時內回應。

### REQ-002 — Incident Commander 角色

每起 SEV-1 與 SEV-2 事件 MUST 在宣告後 10 分鐘內指派一名 Incident Commander（IC）。
IC 負責協調回應 bridge、指派角色（scribe、comms lead、技術 lead）、推動時間軸、
對修復做出 go/no-go 決策，以及啟動 postmortem。IC NOT 直接進行除錯——其唯一焦點
是協調。

### REQ-003 — 利害關係人溝通協定

在 SEV-1/SEV-2 事件期間，對利害關係人的更新 MUST 依定義節奏發送：宣告後 15 分鐘內
首次通知、直到解決前每 30 分鐘更新一次，並在任何 severity 變更或重大進展時立即
更新。更新 MUST 包含目前狀態、已知影響、正在進行的處置，以及下次更新時間。status
page MUST 與內部溝通同步更新。

### REQ-004 — Blameless Postmortem 要求

每起 SEV-1 事件 MUST 在 5 個工作天內完成 blameless postmortem；SEV-2 事件則於 10 個
工作天內。Postmortem MUST 為 blameless——聚焦系統性成因，而非個人錯誤。必備章節：
時間軸、影響、root cause（5 Whys）、contributing factors、附負責人與到期日的 action
item，以及 lessons learned。Action item MUST 追蹤至完成。

### REQ-005 — On-Call 輪值與交接

每個 production 服務 MUST 具備文件化的 on-call 輪值，至少 2 名工程師。輪值排程 MUST
至少提前 2 週發布。On-call 交接 MUST 包含書面摘要：進行中的事件、仍在調查的近期
事件、已知的 flaky alert、即將到來的計畫性維護，以及任何服務健康疑慮。交接 MUST
由接班 on-call 確認接收。

### REQ-006 — 事件回顧指標

團隊 SHOULD 每月追蹤並檢視事件指標：MTTD（Mean Time To Detect）、MTTR（Mean Time
To Resolve）、各 severity 的事件頻率、重複事件（90 天內相同 root cause），以及
postmortem action-item 完成率。這些指標 SHOULD 在與工程領導層的每月可靠性檢視中
檢討。

## 與既有標準的整合

- **`runbook`**——IC 與 on-call 工程師在 mitigate 階段執行 typed runbook；SEV
  runbook 依 `runbook` 節奏演練。
- **`slo-sli`**——error budget 燃燒常觸發事件宣告；SLO 影響於 postmortem 中摘要。
- **`postmortem-standards`**——REQ-004 與 blameless postmortem 模板對齊；本標準
  設定觸發條件與時程。
- **`virtual-organization-standards`**——SEV-1 事件實例化事件 virtual organization
  （IC、Communications Lead、Operations Lead）。
- **`alerting-standards`**——告警啟動偵測與 severity 評估。
- **`execution-history`**——自動化緩解動作記錄為 execution history。

## 相關規格

- XSPEC-063 — UDS SRE／運維標準包（本標準來源）
- XSPEC-251 — Operator 主動可靠性（事件上游的主動責任）
- DEC-041 — EU AI Act 2026 合規（可稽核性需要 postmortem）
- DEC-042 — Guardian / Governance Agent 模式（agent 驅動 runbook 執行）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：severity 分類、incident commander、溝通協定、blameless postmortem、on-call 輪值/交接、回顧指標（XSPEC-063） |
