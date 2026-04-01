# [SPEC-ALERT-001] Feature: Alerting Standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: SPEC-OBS-001 (依賴), SPEC-SLO-001 (依賴), SPEC-RUNBOOK-001 (雙向), `core/logging-standards.md`

## Overview

新增 `core/alerting-standards.md` 核心標準，定義告警策略的完整生命週期：從告警設計、分級、路由、降噪到持續改善。現有 `logging-standards` 中的 "Log-based Alerting" 段落提供了基礎，本規格將其擴展為獨立、完整的告警策略標準。

## Motivation

### 問題陳述

1. **告警無分級** — 團隊缺乏統一的告警嚴重程度分級，所有告警都被視為同等緊急
2. **告警疲勞** — 大量無效或重複告警導致維運人員忽略真正重要的告警
3. **無 Escalation 路徑** — 告警發出後缺乏明確的升級流程
4. **告警與 Runbook 脫節** — 收到告警後不知道該怎麼處理
5. **告警品質無追蹤** — 無法量化告警的有效性（訊噪比、MTTA）

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `logging-standards` (Log-based Alerting) | **擴展並獨立**：保留 log-based 告警作為來源之一，擴展為完整告警框架 |
| SPEC-OBS-001 | **依賴**：告警規則基於 Metrics 和 Logs |
| SPEC-SLO-001 | **依賴**：SLO burn rate 是最佳告警策略 |
| SPEC-RUNBOOK-001 | **雙向**：每個告警必須連結 Runbook，Runbook 標準定義格式 |
| `incident-response` | **銜接**：高嚴重度告警觸發 Incident 流程 |

## Requirements

### REQ-1: 告警分級體系

系統 SHALL 定義統一的告警嚴重程度分級，含明確的回應時間和通知方式。

#### Scenario: 查閱告警分級定義
- **GIVEN** 維運人員收到告警
- **WHEN** 查閱告警分級標準
- **THEN** 看到以下分級定義：

| 等級 | 名稱 | 標準 | 回應時間 | 通知方式 |
|------|------|------|----------|----------|
| P1 | Critical | 服務完全中斷、資料遺失風險 | < 5 分鐘 | 電話 + 簡訊 + 即時通訊 |
| P2 | High | 主要功能降級、影響大量用戶 | < 15 分鐘 | 簡訊 + 即時通訊 |
| P3 | Warning | 效能劣化、資源接近上限 | < 4 小時 | 即時通訊 + 工單 |
| P4 | Info | 異常趨勢、預防性通知 | 下個工作日 | Email + 工單 |

#### Scenario: 判斷告警等級
- **GIVEN** 系統發出新告警
- **WHEN** 自動化系統或值班人員需判斷等級
- **THEN** 依照以下決策樹：
  - 用戶是否完全無法使用服務？ → P1
  - 主要功能是否受影響且無替代方案？ → P2
  - 效能是否劣化但服務仍可用？ → P3
  - 僅趨勢異常但尚無直接影響？ → P4

### REQ-2: Escalation 路徑

系統 SHALL 定義告警的升級路徑和超時自動升級機制。

#### Scenario: 定義 Escalation 層級
- **GIVEN** 團隊設定告警升級路徑
- **WHEN** 按照標準定義路徑
- **THEN** 每個告警等級有明確的升級鏈：

| 時間 | P1 | P2 |
|------|----|----|
| 0 min | 值班工程師 | 值班工程師 |
| 5 min（未確認） | 值班主管 | — |
| 15 min（未確認） | 工程經理 | 值班主管 |
| 30 min（未解決） | VP Engineering | 工程經理 |

#### Scenario: 自動升級觸發
- **GIVEN** P1 告警已發出 5 分鐘
- **WHEN** 值班工程師未確認（acknowledge）
- **THEN** 系統自動通知下一層級

### REQ-3: Actionable Alert 標準

系統 SHALL 定義「可操作告警」的必要元素，確保每個告警都能引導回應行動。

#### Scenario: 告警訊息格式
- **GIVEN** 系統產生告警通知
- **WHEN** 值班人員閱讀告警
- **THEN** 告警包含以下必要元素：

| 元素 | 說明 | 範例 |
|------|------|------|
| 標題 | 簡潔描述問題 | `[P2] API 延遲超過 SLO 閾值` |
| 影響 | 受影響的服務和範圍 | `payment-service, 影響 30% 用戶` |
| 當前狀態 | 關鍵指標的當前值 | `P99 延遲: 2.3s (SLO: < 500ms)` |
| Runbook 連結 | 對應的處理步驟 | `[Runbook: API 延遲過高](link)` |
| Dashboard 連結 | 相關監控面板 | `[Dashboard](link)` |
| 開始時間 | 問題開始的時間 | `2026-03-31 10:15 UTC` |

#### Scenario: 拒絕無 Runbook 的告警
- **GIVEN** 開發者建立新的告警規則
- **WHEN** 告警規則缺少 Runbook 連結
- **THEN** 標準明確要求：每個 P1/P2 告警 MUST 有 Runbook，P3/P4 告警 SHOULD 有 Runbook

### REQ-4: 告警降噪策略

系統 SHALL 定義告警降噪的策略和最佳實踐，防止告警疲勞。

#### Scenario: 去重複 (Deduplication)
- **GIVEN** 同一問題在 5 分鐘內觸發多次告警
- **WHEN** 告警系統應用去重規則
- **THEN** 相同指紋（service + alert_name + labels）的告警合併為一條，附帶觸發次數

#### Scenario: 分組 (Grouping)
- **GIVEN** 同一根因導致多個服務告警（級聯故障）
- **WHEN** 告警系統應用分組規則
- **THEN** 相關告警歸入同一 group，僅發送摘要通知

#### Scenario: 抑制 (Suppression)
- **GIVEN** 已知維護視窗或已確認的事故
- **WHEN** 啟用告警抑制
- **THEN** 相關告警靜默，不觸發通知

#### Scenario: 告警防抖 (Dampening)
- **GIVEN** Metric 在閾值附近波動
- **WHEN** 應用防抖策略
- **THEN** 只有持續超過閾值達指定時間（如 5 分鐘）才觸發告警

### REQ-5: 告警即程式碼 (Alerts as Code)

系統 SHALL 定義告警規則的版本控制、審查和測試要求。

#### Scenario: 告警規則版本控制
- **GIVEN** 團隊管理告警規則
- **WHEN** 遵循告警即程式碼原則
- **THEN** 告警規則滿足：
  - 存放在版本控制系統（Git）
  - 變更需經過 Code Review
  - 有對應的自動化測試（至少 unit test 驗證閾值）
  - 部署透過 CI/CD pipeline

#### Scenario: 告警規則測試
- **GIVEN** 開發者修改告警閾值
- **WHEN** 提交 PR
- **THEN** 自動化測試驗證：
  - 語法正確性
  - 閾值合理性（有上下界檢查）
  - Runbook 連結有效
  - 不會與現有規則衝突

### REQ-6: SLO-based Alerting

系統 SHALL 推薦基於 SLO burn rate 的告警策略作為最佳實踐。

#### Scenario: 多視窗多 Burn Rate 告警
- **GIVEN** 服務有 99.9% 可用性 SLO（30 天視窗）
- **WHEN** 設定 SLO-based 告警
- **THEN** 使用多視窗策略：

| 視窗 | Burn Rate | 告警等級 | 意義 |
|------|-----------|----------|------|
| 1 小時 | 14.4x | P1 (Page) | 若持續，2 天內耗盡 budget |
| 6 小時 | 6x | P2 (Alert) | 若持續，5 天內耗盡 budget |
| 3 天 | 1x | P3 (Ticket) | 月底前可能耗盡 budget |

#### Scenario: 對比傳統告警 vs SLO-based
- **GIVEN** 團隊評估告警策略
- **WHEN** 比較傳統閾值告警和 SLO-based 告警
- **THEN** 標準說明兩者的取捨：

| 面向 | 傳統閾值告警 | SLO-based 告警 |
|------|-------------|---------------|
| 設定依據 | 經驗值 | 用戶體驗目標 |
| 假陽性 | 較高 | 較低 |
| 漏報率 | 較高（慢速劣化） | 較低（burn rate 捕捉） |
| 維護成本 | 高（需頻繁調整） | 低（SLO 變更時才調整） |
| 適用前提 | 無 | 需先定義 SLO |

### REQ-7: 告警品質指標

系統 SHALL 定義告警品質的量化指標，供團隊持續改善。

#### Scenario: 追蹤告警品質
- **GIVEN** 團隊想改善告警品質
- **WHEN** 查閱告警品質指標
- **THEN** 看到以下可量化指標：

| 指標 | 定義 | 目標 |
|------|------|------|
| 訊噪比 (SNR) | Actionable alerts / Total alerts | > 80% |
| MTTA | 告警到確認的平均時間 | P1 < 5m, P2 < 15m |
| 告警頻率 | 每人每天收到的告警數 | < 5 |
| 重複率 | 30 天內相同告警重複觸發的比例 | < 20% |
| Runbook 覆蓋率 | 有 Runbook 的告警比例 | P1/P2: 100%, P3/P4: > 80% |

#### Scenario: 告警審計流程
- **GIVEN** 團隊執行季度告警審計
- **WHEN** 按照標準審計流程
- **THEN** 評估每個告警規則：
  - 過去 90 天是否觸發過？（未觸發考慮移除或降級）
  - 觸發後是否需要人工介入？（不需要考慮自動化）
  - 是否有明確的 Runbook？（無則補充或移除）

## Acceptance Criteria

- **AC-1**: Given 團隊建立告警, when 查閱分級標準, then 能找到 P1-P4 的完整定義含回應時間和通知方式
- **AC-2**: Given 告警未被確認, when 超過回應時間, then 有明確的 Escalation 路徑（至少 3 層）
- **AC-3**: Given 系統發出告警, when 值班人員收到通知, then 告警包含標題、影響、狀態、Runbook 連結、Dashboard 連結、開始時間
- **AC-4**: Given 告警風暴, when 應用降噪策略, then 有去重、分組、抑制、防抖四種策略可選
- **AC-5**: Given 告警規則, when 執行版本控制, then 存放在 Git、需 Code Review、有自動化測試
- **AC-6**: Given SLO 已定義, when 設定告警, then 有多視窗 burn rate 策略的完整範例
- **AC-7**: Given 團隊改善告警, when 查閱品質指標, then 能找到 5 個可量化指標及其目標值
- **AC-8**: Given 季度審計, when 執行告警審計, then 有 3 個評估維度的檢查流程

## Technical Design

### 文件結構

```
core/
├── alerting-standards.md         ← 新建
├── logging-standards.md          ← 現有，移除/精簡 Log-based Alerting 段落，改為引用
├── observability-standards.md    ← SPEC-OBS-001
├── slo-standards.md              ← SPEC-SLO-001
```

### 章節結構（alerting-standards.md）

```markdown
# Alerting Standards

## Overview
## Alert Severity Classification (P1-P4)
  ### Severity Decision Tree
  ### Response Time Requirements
  ### Notification Channels
## Escalation Paths
  ### Escalation Matrix Template
  ### Auto-Escalation Rules
## Actionable Alert Design
  ### Required Alert Elements
  ### Alert Message Template
  ### Runbook Linking Requirements
## Noise Reduction Strategies
  ### Deduplication
  ### Grouping
  ### Suppression / Maintenance Windows
  ### Dampening / Threshold Hysteresis
## Alerts as Code
  ### Version Control Requirements
  ### Alert Rule Testing
  ### CI/CD Integration
## SLO-based Alerting (Best Practice)
  ### Multi-Window Multi-Burn-Rate
  ### Traditional vs SLO-based Comparison
## Alert Quality Metrics
  ### Signal-to-Noise Ratio
  ### MTTA
  ### Alert Frequency per Person
  ### Quarterly Audit Process
## Quick Reference Card
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/alerting-standards.md` | Core 標準 |
| 整合進 `skills/observability-assistant/SKILL.md` | Skill 子命令 |
| `.standards/alerting.ai.yaml` | AI YAML |

## Test Plan

- [ ] `alerting-standards.md` 符合 UDS core 標準格式
- [ ] 告警分級包含 P1-P4 的完整定義（標準、回應時間、通知方式）
- [ ] Escalation 路徑包含至少 3 層升級
- [ ] Actionable Alert 包含 6 個必要元素
- [ ] 降噪策略包含 4 種方法
- [ ] SLO-based 告警包含多視窗 burn rate 範例
- [ ] 告警品質指標包含至少 5 個可量化指標
- [ ] 告警審計流程包含至少 3 個評估維度
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
