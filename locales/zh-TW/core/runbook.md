---
source: ../../../core/runbook.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 443fb8c4e692
status: current
---

# Runbook 撰寫標準

> **Language**: [English](../../../core/runbook.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/runbook.ai.yaml`
> **規格**: XSPEC-063（cross-project/specs/XSPEC-063-uds-sre-standards-pack.md）

## 概觀

本標準定義運維 **runbook** 如何撰寫、組織、維護與測試。涵蓋必備章節、撰寫原則
（可重現、無歧義的步驟）、目錄結構、檢視節奏，以及演練頻率。撰寫良好的 runbook
能讓任何 on-call 工程師無需 tribal knowledge 即可執行復原步驟，藉此降低 Mean Time
To Repair（MTTR）。

本標準屬於 **SRE／運維標準包**（XSPEC-063），是與 `incident-response`（runbook 於
mitigate 階段執行）與 `slo-sli`（error budget 政策由 runbook 連結）並列的可執行
復原成員。它補充既有的 `runbook-standards` Skill 錨點；UDS 的獨特貢獻在於可由
VibeOps Governance Agent（DEC-042）直接執行的 AI 可執行 runbook schema。

> **範圍**：本標準定義「runbook 必須包含什麼，以及如何組織、檢視與演練」。runbook
> 託管工具（wiki、Git repo、PagerDuty）與自動化引擎屬採用者的選擇，不在本標準
> 範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 必備 runbook 章節（overview → post-actions） | MUST |
| REQ-002 | 可重現且無歧義的步驟（可複製貼上 + 驗證） | MUST |
| REQ-003 | Runbook 命名與目錄組織（typed dir、kebab-case） | MUST |
| REQ-004 | 檢視與演練節奏（依類型） | MUST |
| REQ-005 | Rollback 與 fallback 步驟（標示清楚、置於升級前） | MUST |
| REQ-006 | 告警整合 metadata（alert 名稱、dashboard、query） | SHOULD |

### REQ-001 — 必備 Runbook 章節

每個 runbook MUST 依序包含下列章節：(1) **Overview**——alert 名稱、severity、
受影響服務、owner、最後更新、最後演練日期；(2) **Symptoms**——可觀察的指標；
(3) **Impact Assessment**——面向使用者的影響與 blast radius；(4) **Diagnostic
Steps**——附可複製貼上指令的有序步驟；(5) **Fix Steps**——每步皆附驗證的有序
修復；(6) **Escalation**——附角色與可用時段的具體聯絡人；(7) **Post-Actions**——
後續任務、ticket、postmortem 觸發。

### REQ-002 — 可重現且無歧義的步驟

runbook 中的每個步驟 MUST 可重現且無歧義。步驟 MUST 使用可複製貼上的指令，且不
留下任何未定義的 placeholder。決策點 MUST 包含明確的分支條件（if X then Y, else
Z）。每個 fix 步驟 MUST 包含一個驗證指令，確認修復生效後才繼續，且 MUST 顯示預期
輸出。

### REQ-003 — Runbook 命名與目錄組織

Runbook MUST 使用描述「問題」而非「解法」的 kebab-case 名稱。檔案 MUST 組織進
typed 目錄：`alerts/` 放 alert-response runbook、`operations/` 放標準運維、
`emergency/` 放重大事件程序、`troubleshooting/` 放一般調查指南。每個 runbook 檔
MUST 在 front matter 宣告其類型。

### REQ-004 — 檢視與演練節奏

Runbook MUST 依類型按排程檢視：alert-response runbook 每季、emergency 程序每月、
標準運維與 troubleshooting 指南每半年、change 程序在每次使用後。Runbook MUST 演練：
P1 runbook 每月、P2 每季、emergency 程序每季。演練紀錄 MUST 附加於 runbook 或由其
連結。

### REQ-005 — Rollback 與 Fallback 步驟

任何描述變更或修復的 runbook MUST 包含一個標示清楚的 rollback 章節，說明若修復失敗
或造成額外問題時如何復原變更。Rollback 章節 MUST 出現在 escalation 章節之前，並
包含其自身的驗證步驟。

### REQ-006 — 告警整合 Metadata

Alert-response runbook SHOULD 包含一個 metadata 區塊，將 runbook 連結至特定 alert
規則。這讓告警工具（PagerDuty、Alertmanager）能自動連結 runbook。Metadata MUST
包含 alert 名稱、dashboard URL，以及用於調查的 Prometheus／logging query。

## 與既有標準的整合

- **`runbook-standards`**——既有的 Skill 錨點標準；`runbook` 提供其背後的 AI 可
  執行 schema 與章節／演練要求。
- **`incident-response`**——runbook 於事件 mitigate 階段執行；SEV runbook 依此處
  節奏演練。
- **`slo-sli`**——error budget 政策 MUST 由服務 runbook 連結。
- **`rollback-standards`**——REQ-005 rollback 步驟與 rollback 標準的復原程序對齊。
- **`alerting-standards`**——REQ-006 metadata 將 alert 規則連結至其 runbook。
- **`execution-history`**——當 runbook 標記 `automation_level: automated` 時，
  Governance Agent 的執行結果記錄為 execution history。

## 相關規格

- XSPEC-063 — UDS SRE／運維標準包（本標準來源）
- XSPEC-251 — Operator 主動可靠性（runbook 責任）
- DEC-042 — Guardian / Governance Agent 模式（agent 執行 `automated` runbook）
- DEC-041 — EU AI Act 2026 合規（可稽核的復原程序）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：必備章節、可重現步驟、命名/組織、檢視/演練節奏、rollback/fallback、告警整合 metadata（XSPEC-063） |
