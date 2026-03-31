# [SPEC-SLO-001] Feature: SLI/SLO/Error Budget Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Critical (P0)
- **Scope**: universal
- **Related**: SPEC-OBS-001 (依賴), SPEC-ALERT-001 (被依賴), `core/performance-standards.md`

## Overview

新增 `core/slo-standards.md` 核心標準，定義服務等級指標 (SLI)、服務等級目標 (SLO) 和錯誤預算 (Error Budget) 的設定方法論。提供語言無關的框架，讓團隊能系統化地定義、量測和管理服務品質承諾。

## Motivation

### 問題陳述

1. **無服務品質定義** — 團隊缺乏統一方式定義「什麼算是好的服務品質」
2. **告警無依據** — 告警閾值靠經驗設定，缺乏基於用戶體驗的量化標準
3. **可靠性 vs 速度無框架** — 沒有 Error Budget 機制來平衡「穩定性」和「功能迭代速度」
4. **事故嚴重度無量化** — 無法量化事故對 SLO 的影響程度
5. **國際標準缺口** — ISO/IEC 20000 要求服務等級管理，Google SRE 已成業界最佳實踐

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `performance-standards` | **互補**：performance 定義目標（如 P95 < 200ms），SLO 將其轉化為持續承諾 |
| `logging-standards` | **消費者**：SLI 的資料來源來自 Metrics（由 OBS-001 定義） |
| SPEC-OBS-001 | **依賴**：SLI 量測依賴可觀測性基礎設施 |
| SPEC-ALERT-001 | **提供基礎**：SLO-based alerting 是最佳告警策略 |
| `incident-response` | **銜接**：SLO breach 是 incident 的觸發條件之一 |

## Requirements

### REQ-1: SLI 定義與選取

系統 SHALL 定義 SLI（Service Level Indicator）的選取方法論，包含常見 SLI 類型和量測方式。

#### Scenario: 選取 API 服務的 SLI
- **GIVEN** 團隊需要為 REST API 服務定義 SLI
- **WHEN** 查閱 SLI 選取指南
- **THEN** 看到以下推薦 SLI 及其量測方式：
  - 可用性：成功請求數 / 總請求數
  - 延遲：請求持續時間低於閾值的比例
  - 品質：非降級回應數 / 總回應數

#### Scenario: 選取批次作業的 SLI
- **GIVEN** 團隊需要為批次作業定義 SLI
- **WHEN** 查閱 SLI 選取指南
- **THEN** 看到以下推薦 SLI：
  - 新鮮度：資料更新延遲在閾值內的比例
  - 正確性：正確處理的記錄數 / 總記錄數
  - 覆蓋度：成功處理的批次比例

#### Scenario: 選取前端應用的 SLI
- **GIVEN** 團隊需要為前端應用定義 SLI
- **WHEN** 查閱 SLI 選取指南
- **THEN** 看到以下推薦 SLI：
  - 載入效能：LCP / FID / CLS 在良好範圍的比例
  - 可用性：成功載入頁面的比例
  - 互動延遲：使用者操作回應時間低於閾值的比例

### REQ-2: SLO 設定方法論

系統 SHALL 定義 SLO（Service Level Objective）的設定原則、常見目標值和迭代調整流程。

#### Scenario: 首次設定 SLO
- **GIVEN** 團隊首次為服務設定 SLO
- **WHEN** 遵循 SLO 設定流程
- **THEN** 完成以下步驟：
  1. 選定 SLI（基於 REQ-1）
  2. 確定量測視窗（rolling 28 天或日曆月）
  3. 設定目標值（起始建議基於歷史資料的 P5）
  4. 定義合規計算公式
  5. 文件化 SLO 規格

#### Scenario: SLO 目標值選擇指引
- **GIVEN** 團隊需要決定 SLO 目標百分比
- **WHEN** 查閱目標值選擇指引
- **THEN** 看到以下參考框架：

| 目標 | 每月容許停機 | 適用場景 |
|------|-------------|---------|
| 99% | 7.3 小時 | 內部工具、非關鍵服務 |
| 99.5% | 3.65 小時 | 一般 B2B 服務 |
| 99.9% | 43.8 分鐘 | 面向消費者的核心服務 |
| 99.95% | 21.9 分鐘 | 金融/醫療等高可靠性需求 |
| 99.99% | 4.38 分鐘 | 基礎設施、支付平台 |

#### Scenario: SLO 迭代調整
- **GIVEN** SLO 已運行一個季度
- **WHEN** 團隊進行季度 SLO 審查
- **THEN** 根據以下信號決定是否調整：
  - Error Budget 消耗趨勢
  - 用戶滿意度回饋
  - 事故頻率和影響
  - 工程團隊負擔

### REQ-3: Error Budget 政策

系統 SHALL 定義 Error Budget 的計算方式、消耗監控和政策觸發機制。

#### Scenario: 計算 Error Budget
- **GIVEN** SLO 目標為 99.9% 可用性（28 天 rolling）
- **WHEN** 計算 Error Budget
- **THEN** Error Budget = 1 - 0.999 = 0.1% = 28 天 × 24 小時 × 60 分鐘 × 0.001 = 40.32 分鐘

#### Scenario: Error Budget 消耗告警
- **GIVEN** Error Budget 有定義的消耗速率閾值
- **WHEN** 消耗速率超過閾值
- **THEN** 觸發對應級別的行動：

| 消耗程度 | 閾值 | 觸發行動 |
|----------|------|----------|
| 快速消耗 | 1小時內消耗 2% budget | 立即頁面呼叫（Page） |
| 中速消耗 | 6小時內消耗 5% budget | 發送告警通知（Alert） |
| 慢速消耗 | 3天內消耗 10% budget | 建立工單追蹤（Ticket） |

#### Scenario: Error Budget 耗盡政策
- **GIVEN** 某服務的 Error Budget 已耗盡
- **WHEN** 團隊評估下一步行動
- **THEN** 標準建議以下政策選項（團隊可自選）：
  - **凍結發布** — 暫停非可靠性相關的功能發布
  - **強制可靠性衝刺** — 下個 Sprint 專注於可靠性改善
  - **加強審查** — 所有變更需額外的生產就緒審查
  - **降低 SLO** — 如果目標不切實際，經利害關係人同意後調降

### REQ-4: SLO 文件範本

系統 SHALL 提供標準化的 SLO 文件範本，供團隊記錄和維護 SLO 規格。

#### Scenario: 使用 SLO 範本建立文件
- **GIVEN** 團隊要為服務建立 SLO 文件
- **WHEN** 使用標準範本
- **THEN** 產生包含以下段落的文件：
  - 服務名稱與簡述
  - SLI 定義（指標名稱、量測方式、資料來源）
  - SLO 目標（百分比、量測視窗、合規計算）
  - Error Budget 政策（消耗閾值、觸發行動）
  - 利害關係人（Owner、通知對象）
  - 審查週期（季度/半年）

### REQ-5: SLO 與 SLA 的區分

系統 SHALL 明確區分 SLO（內部目標）和 SLA（外部合約），避免混淆。

#### Scenario: 理解 SLO vs SLA
- **GIVEN** 團隊成員不清楚 SLO 和 SLA 的差異
- **WHEN** 查閱標準的概念說明
- **THEN** 看到明確的定義和區分：

| 概念 | 定義 | 對象 | 違反後果 |
|------|------|------|----------|
| SLI | 量測指標 | 工程團隊 | 無直接後果 |
| SLO | 內部目標 | 工程團隊 | 觸發 Error Budget 政策 |
| SLA | 外部合約 | 客戶 | 合約懲罰（退費、賠償） |

#### Scenario: SLO 應嚴於 SLA
- **GIVEN** 服務同時有 SLO 和 SLA
- **WHEN** 設定 SLO 目標值
- **THEN** SLO 應比 SLA 更嚴格（如 SLA 99.9% → SLO 99.95%），為 SLA 提供緩衝

### REQ-6: 服務類型 SLO 範本庫

系統 SHALL 提供常見服務類型的 SLO 範本，降低首次設定的門檻。

#### Scenario: API 服務 SLO 範本
- **GIVEN** 團隊要為 REST API 設定 SLO
- **WHEN** 選用 API 服務範本
- **THEN** 獲得預設的 SLI/SLO 組合：

| SLI | 量測方式 | 預設 SLO |
|-----|----------|----------|
| 可用性 | 非 5xx 回應比例 | 99.9% |
| 延遲 | P99 < 閾值的比例 | 99% |
| 錯誤率 | 非 5xx + 非 timeout 比例 | 99.9% |

#### Scenario: 批次作業 SLO 範本
- **GIVEN** 團隊要為批次作業設定 SLO
- **WHEN** 選用批次作業範本
- **THEN** 獲得預設的 SLI/SLO 組合：

| SLI | 量測方式 | 預設 SLO |
|-----|----------|----------|
| 新鮮度 | 最大延遲 < 閾值 | 99.5% |
| 正確性 | 正確處理比例 | 99.99% |
| 完成率 | 成功完成比例 | 99.9% |

#### Scenario: 前端應用 SLO 範本
- **GIVEN** 團隊要為前端應用設定 SLO
- **WHEN** 選用前端應用範本
- **THEN** 獲得預設的 SLI/SLO 組合：

| SLI | 量測方式 | 預設 SLO |
|-----|----------|----------|
| 載入效能 | LCP < 2.5s 的頁面比例 | 90% |
| 互動延遲 | FID < 100ms 的互動比例 | 95% |
| 視覺穩定性 | CLS < 0.1 的頁面比例 | 95% |

### REQ-7: SLO 整合進開發工作流

系統 SHOULD 提供將 SLO 定義整合進現有 UDS 工作流的指引。

#### Scenario: /sdd 流程中定義 SLO
- **GIVEN** 團隊使用 `/sdd` 建立新服務規格
- **WHEN** 規格文件包含服務端點定義
- **THEN** 標準建議在規格中加入 SLO 段落（非強制但推薦）

#### Scenario: Incident 與 SLO 影響評估
- **GIVEN** 發生生產事故
- **WHEN** 使用 `/incident` 進行事故回應
- **THEN** 事故影響評估包含「SLO 影響」段落（Error Budget 消耗量）

## Acceptance Criteria

- **AC-1**: Given 團隊需要定義 SLI, when 查閱標準, then 能找到 API 服務、批次作業、前端應用三種服務類型的 SLI 選取指引
- **AC-2**: Given 團隊首次設定 SLO, when 遵循流程, then 能完成 5 步驟（SLI 選定→視窗→目標值→公式→文件化）
- **AC-3**: Given SLO 已設定, when 計算 Error Budget, then 能得到具體的容許停機時間和消耗速率告警閾值
- **AC-4**: Given Error Budget 耗盡, when 查閱政策, then 能找到至少 4 種政策選項及其適用場景
- **AC-5**: Given 團隊使用範本, when 選擇服務類型, then 獲得預設的 SLI/SLO 組合（至少 3 種服務類型）
- **AC-6**: Given 成員不清楚概念, when 查閱 SLI/SLO/SLA 比較, then 能明確區分三者的定義、對象和違反後果
- **AC-7**: Given SLO 文件範本, when 填寫完成, then 包含服務資訊、SLI 定義、SLO 目標、Error Budget 政策、利害關係人、審查週期

## Technical Design

### 文件結構

```
core/
├── slo-standards.md              ← 新建
├── observability-standards.md    ← SPEC-OBS-001
├── performance-standards.md      ← 現有，新增交叉引用
```

### 章節結構（slo-standards.md）

```markdown
# SLO Standards (Service Level Objectives)

## Overview
## Key Concepts
  ### SLI / SLO / SLA / Error Budget 定義
  ### SLI vs SLO vs SLA 比較
## SLI Selection Guide
  ### API Services
  ### Batch Jobs
  ### Frontend Applications
  ### Data Pipelines
## SLO Setting Methodology
  ### Step-by-Step Process
  ### Target Value Selection
  ### Measurement Window
  ### Iterative Adjustment
## Error Budget Policy
  ### Calculation
  ### Burn Rate Alerting
  ### Budget Exhaustion Actions
## SLO Templates
  ### API Service Template
  ### Batch Job Template
  ### Frontend Application Template
## SLO Document Template
## Integration with Development Workflow
## Quick Reference Card
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/slo-standards.md` | Core 標準 |
| 整合進 `skills/observability-assistant/SKILL.md` | Skill 子命令 |
| `.standards/slo.ai.yaml` | AI YAML |

## Test Plan

- [ ] `slo-standards.md` 符合 UDS core 標準格式
- [ ] SLI 選取指南涵蓋至少 3 種服務類型
- [ ] SLO 設定流程包含 5 個步驟的完整說明
- [ ] Error Budget 計算包含具體數值範例
- [ ] Error Budget 政策包含至少 4 種行動選項
- [ ] SLO 範本庫包含至少 3 種服務類型的預設值
- [ ] SLI/SLO/SLA 比較表清晰區分三者
- [ ] SLO 文件範本包含 6 個必要段落
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
