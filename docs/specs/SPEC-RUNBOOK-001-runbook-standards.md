# [SPEC-RUNBOOK-001] Feature: Runbook Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: SPEC-ALERT-001 (雙向), SPEC-PM-001 (銜接), `incident-response-assistant`

## Overview

新增 `core/runbook-standards.md` 核心標準和 `runbook-assistant` Skill，定義 Runbook（操作手冊）的撰寫格式、維護流程、有效性驗證和與告警/事故的整合機制。Runbook 是告警可操作性的關鍵一環，確保值班人員在收到告警時有明確的診斷和修復步驟。

## Motivation

### 問題陳述

1. **Runbook 缺失** — 許多告警沒有對應的 Runbook，值班人員收到告警後不知從何下手
2. **格式不一** — 即使有 Runbook，各團隊格式不同，品質參差不齊
3. **過時腐化** — Runbook 撰寫後很少更新，與實際系統架構脫節
4. **缺乏驗證** — 沒有演練機制確認 Runbook 步驟仍然有效
5. **與事故脫節** — 事故後的改善行動未反映到 Runbook 更新

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `incident-response` | **互補**：incident 定義流程，runbook 提供每個告警的具體操作步驟 |
| SPEC-ALERT-001 | **雙向**：告警 MUST 連結 runbook，runbook 格式由本規格定義 |
| SPEC-PM-001 | **銜接**：postmortem 的 action items 可能產生新的或更新的 runbook |
| `documentation-writing-standards` | **遵循**：runbook 撰寫遵循文件寫作標準 |

## Requirements

### REQ-1: Runbook 標準範本

系統 SHALL 定義 Runbook 的標準範本結構，確保所有 Runbook 有一致的格式和必要欄位。

#### Scenario: 使用標準範本撰寫 Runbook
- **GIVEN** 開發者需要為新告警撰寫 Runbook
- **WHEN** 使用標準範本
- **THEN** Runbook 包含以下必要段落：

```markdown
# Runbook: [告警名稱]

## 概要
- **告警名稱**: [alert name]
- **嚴重程度**: P1/P2/P3/P4
- **關聯服務**: [service names]
- **最後更新**: YYYY-MM-DD
- **負責人**: @owner
- **最後演練**: YYYY-MM-DD

## 症狀
[使用者會看到什麼？系統表現如何？]

## 影響評估
[影響範圍、受影響的用戶數、業務影響]

## 診斷步驟
1. [第一步：檢查什麼]
   ```bash
   # 具體指令
   ```
2. [第二步：確認什麼]
3. [第三步：判斷根因]

## 修復步驟
### 情境 A：[根因 A]
1. [修復步驟]
### 情境 B：[根因 B]
1. [修復步驟]

## Escalation
- 如果以上步驟無效，通知 [team/person]
- Escalation 聯絡方式：[contact]

## 事後行動
- [ ] 更新此 Runbook（如有新發現）
- [ ] 建立 postmortem（若為 P1/P2）
- [ ] 通知利害關係人
```

#### Scenario: Runbook 必要欄位驗證
- **GIVEN** 開發者提交新的 Runbook
- **WHEN** 進行 Runbook 審查
- **THEN** 驗證以下必要欄位存在：
  - 告警名稱和嚴重程度
  - 關聯服務
  - 負責人
  - 至少一個診斷步驟
  - 至少一個修復步驟
  - Escalation 資訊

### REQ-2: Runbook 類型分類

系統 SHALL 定義不同類型的 Runbook 及其適用場景。

#### Scenario: 選擇 Runbook 類型
- **GIVEN** 團隊需要建立新的操作文件
- **WHEN** 查閱 Runbook 類型指南
- **THEN** 看到以下分類：

| 類型 | 用途 | 範例 |
|------|------|------|
| **告警回應** (Alert Response) | 特定告警的診斷和修復 | `API 延遲過高`、`磁碟空間不足` |
| **標準操作** (Standard Operation) | 日常維運操作程序 | `資料庫備份恢復`、`密鑰輪替` |
| **緊急程序** (Emergency Procedure) | 重大事故的緊急應變 | `完全服務中斷`、`資料外洩` |
| **變更程序** (Change Procedure) | 計劃性變更的執行步驟 | `資料庫遷移`、`重大版本升級` |
| **除錯指南** (Troubleshooting Guide) | 通用問題的排查方法 | `記憶體洩漏排查`、`效能劣化分析` |

### REQ-3: Runbook 有效性管理

系統 SHALL 定義 Runbook 的有效性驗證機制，防止過時腐化。

#### Scenario: 定期審查週期
- **GIVEN** Runbook 有定義的審查週期
- **WHEN** 到達審查時間
- **THEN** 負責人需確認：
  - 所有指令和路徑仍然有效
  - 服務架構未發生影響 Runbook 的變更
  - 聯絡資訊和 Escalation 路徑仍然正確
  - 更新「最後更新」日期

| Runbook 類型 | 審查週期 |
|-------------|---------|
| 告警回應 | 每季 |
| 緊急程序 | 每月 |
| 標準操作 | 每半年 |
| 變更程序 | 每次使用後 |
| 除錯指南 | 每半年 |

#### Scenario: 過期警告
- **GIVEN** Runbook 的「最後更新」超過審查週期
- **WHEN** 團隊查看 Runbook 清單
- **THEN** 過期的 Runbook 標記為 ⚠️ 需要審查

#### Scenario: 架構變更觸發審查
- **GIVEN** 服務架構發生重大變更（如微服務拆分、資料庫遷移）
- **WHEN** 變更完成後
- **THEN** 相關的 Runbook 標記為需要更新

### REQ-4: Runbook 演練機制

系統 SHALL 定義 Runbook 的定期演練要求和記錄格式。

#### Scenario: 演練排程
- **GIVEN** 團隊有多個 Runbook
- **WHEN** 規劃演練排程
- **THEN** 按照以下優先級排程：

| 優先級 | 條件 | 演練頻率 |
|--------|------|----------|
| 最高 | P1 告警的 Runbook | 每月 |
| 高 | P2 告警的 Runbook | 每季 |
| 中 | 緊急程序 | 每季 |
| 低 | 其他 Runbook | 每半年 |

#### Scenario: 演練記錄
- **GIVEN** 團隊完成一次 Runbook 演練
- **WHEN** 記錄演練結果
- **THEN** 記錄包含：
  - 演練日期和參與人員
  - 演練的 Runbook 名稱
  - 結果：成功 / 部分成功 / 失敗
  - 發現的問題和改善建議
  - 預估修復時間 vs 實際修復時間
  - Runbook 更新項目（如有）

#### Scenario: 演練失敗處理
- **GIVEN** 演練中發現 Runbook 步驟無法執行
- **WHEN** 記錄演練結果為「失敗」
- **THEN** 立即建立行動項目更新 Runbook，並在下次演練中重新驗證

### REQ-5: Runbook 與告警整合

系統 SHALL 定義 Runbook 與告警系統的整合方式。

#### Scenario: 告警自動連結 Runbook
- **GIVEN** 告警規則定義中包含 Runbook URL
- **WHEN** 告警觸發
- **THEN** 通知訊息自動包含 Runbook 連結，值班人員一鍵可達

#### Scenario: Runbook 覆蓋率報告
- **GIVEN** 團隊有多個告警規則
- **WHEN** 產生 Runbook 覆蓋率報告
- **THEN** 報告顯示：
  - P1/P2 告警的 Runbook 覆蓋率（目標 100%）
  - P3/P4 告警的 Runbook 覆蓋率（目標 > 80%）
  - 無 Runbook 的告警清單

### REQ-6: Runbook 與 Postmortem 整合

系統 SHALL 定義事故後自動建議更新或新增 Runbook 的機制。

#### Scenario: Postmortem 產生 Runbook 更新
- **GIVEN** 事故 postmortem 完成，其中包含 action items
- **WHEN** action items 涉及操作程序改善
- **THEN** 標準建議：
  - 更新現有 Runbook（如果問題出在步驟不完整或過時）
  - 建立新 Runbook（如果是全新的故障模式）
  - 連結 postmortem 到相關 Runbook 的版本歷史

### REQ-7: Runbook 撰寫品質指引

系統 SHALL 提供 Runbook 撰寫的品質指引，確保 Runbook 在壓力下仍然易於遵循。

#### Scenario: 撰寫高品質 Runbook
- **GIVEN** 開發者撰寫 Runbook
- **WHEN** 遵循品質指引
- **THEN** 符合以下原則：

| 原則 | 說明 | 範例 |
|------|------|------|
| **可複製** | 步驟具體到可直接複製執行 | 提供完整指令，非「檢查資料庫」 |
| **無歧義** | 每步只有一個解釋方式 | 「重啟 payment-service Pod」非「重啟服務」 |
| **有判斷點** | 每個分支有明確的判斷條件 | 「如果 CPU > 90%，執行 A；否則執行 B」 |
| **有回退** | 修復步驟失敗時有回退方案 | 「如果回滾失敗，執行緊急程序 X」 |
| **有驗證** | 每個修復步驟後有驗證方式 | 「執行 `curl health-check` 確認回傳 200」 |
| **有時限** | 標明預期完成時間 | 「此步驟通常需要 2-5 分鐘」 |

### REQ-8: Runbook 存放與組織

系統 SHALL 定義 Runbook 的存放結構和命名慣例。

#### Scenario: Runbook 目錄結構
- **GIVEN** 團隊建立 Runbook 存放目錄
- **WHEN** 遵循標準目錄結構
- **THEN** 使用以下結構：

```
docs/runbooks/
├── README.md                          # 索引和搜尋指引
├── alerts/                            # 告警回應
│   ├── api-latency-high.md
│   ├── disk-space-low.md
│   └── database-connection-pool.md
├── operations/                        # 標準操作
│   ├── database-backup-restore.md
│   └── secret-rotation.md
├── emergency/                         # 緊急程序
│   ├── full-service-outage.md
│   └── data-breach-response.md
└── troubleshooting/                   # 除錯指南
    ├── memory-leak.md
    └── performance-degradation.md
```

#### Scenario: Runbook 命名慣例
- **GIVEN** 開發者建立新的 Runbook
- **WHEN** 命名檔案
- **THEN** 使用 kebab-case，名稱反映問題而非解法：
  - ✅ `api-latency-high.md`
  - ✅ `disk-space-low.md`
  - ❌ `restart-api-server.md`（這是解法不是問題）
  - ❌ `runbook-001.md`（無意義的編號）

## Acceptance Criteria

- **AC-1**: Given 開發者建立 Runbook, when 使用標準範本, then 包含概要、症狀、影響評估、診斷步驟、修復步驟、Escalation、事後行動共 7 個段落
- **AC-2**: Given Runbook 分類, when 查閱類型指南, then 能找到 5 種類型（告警回應、標準操作、緊急程序、變更程序、除錯指南）及其適用場景
- **AC-3**: Given Runbook 有效性, when 查閱審查機制, then 每種類型有明確的審查週期和過期警告機制
- **AC-4**: Given 演練機制, when 規劃排程, then P1 Runbook 每月演練、P2 每季、其他每半年
- **AC-5**: Given 演練完成, when 記錄結果, then 包含日期、參與人、結果、問題、預估vs實際時間
- **AC-6**: Given 告警規則, when 產生覆蓋率報告, then 顯示 P1/P2 和 P3/P4 的 Runbook 覆蓋率
- **AC-7**: Given Runbook 撰寫, when 遵循品質指引, then 滿足可複製、無歧義、有判斷點、有回退、有驗證、有時限 6 個原則
- **AC-8**: Given Runbook 存放, when 遵循目錄結構, then 按類型分目錄、使用 kebab-case 命名

## Technical Design

### 文件結構

```
core/
├── runbook-standards.md              ← 新建

skills/
├── runbook-assistant/
│   └── SKILL.md                      ← 新建 Skill
```

### 章節結構（runbook-standards.md）

```markdown
# Runbook Standards

## Overview
## Runbook Types
## Standard Template
  ### Required Sections
  ### Optional Sections
## Writing Quality Guidelines
  ### Six Principles
  ### Common Anti-patterns
## Organization and Storage
  ### Directory Structure
  ### Naming Conventions
  ### Indexing
## Validity Management
  ### Review Cycles
  ### Staleness Detection
  ### Architecture-Change Triggers
## Drill / Exercise Process
  ### Scheduling
  ### Recording
  ### Failure Handling
## Integration Points
  ### Alert-to-Runbook Linking
  ### Postmortem-to-Runbook Flow
  ### Coverage Reporting
## Quick Reference Card
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/runbook-standards.md` | Core 標準 |
| `skills/runbook-assistant/SKILL.md` | 新 Skill |
| `.standards/runbook.ai.yaml` | AI YAML |

## Test Plan

- [ ] `runbook-standards.md` 符合 UDS core 標準格式
- [ ] 標準範本包含 7 個必要段落
- [ ] 5 種 Runbook 類型有定義和範例
- [ ] 審查週期涵蓋所有 Runbook 類型
- [ ] 演練機制包含排程、記錄、失敗處理
- [ ] 品質指引包含 6 個撰寫原則
- [ ] 目錄結構和命名慣例有具體範例
- [ ] 與告警整合（覆蓋率報告）有明確定義
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
