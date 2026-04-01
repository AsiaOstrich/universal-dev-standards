# [SPEC-PERF-002] Feature: Performance Testing Execution Extension for performance-standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Medium (P2)
- **Scope**: universal
- **Related**: `core/performance-standards.md` (擴展)

## Overview

擴展現有 `core/performance-standards.md`，新增 Performance Testing Execution 段落。定義 4 種效能測試類型、基準線管理、CI 觸發條件、效能預算和測試報告格式。

## Motivation

### 問題陳述

1. **測試類型定義不足** — 現有標準列出測試頻率但未定義各類型的目的與適用場景
2. **無基準線管理** — 缺乏首次建立基準、偏移偵測和更新策略
3. **CI 觸發未定義** — 效能測試不應每次都跑，但何時該觸發無明確指引
4. **無效能預算概念** — 類似 Error Budget 的效能退化容忍度未定義
5. **報告格式缺失** — 無標準化的效能測試報告格式

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `performance-standards` | **擴展**：在現有文件中新增 Performance Testing Execution 段落 |
| `testing-standards` | **互補**：效能測試作為測試策略的一環 |
| `deployment-standards` | **銜接**：效能驗證作為部署前的品質關卡 |

## Requirements

### REQ-1: 效能測試類型定義

系統 SHALL 定義 4 種效能測試類型，各含目的和適用場景。

#### Scenario: 四種效能測試類型
- **GIVEN** 團隊規劃效能測試
- **WHEN** 查閱測試類型定義
- **THEN** 看到以下 4 種類型：

| 類型 | 目的 | 適用場景 |
|------|------|---------|
| **Load Test** | 驗證系統在預期負載下的行為 | 新版本上線前、容量規劃 |
| **Stress Test** | 找出系統的極限與崩潰行為 | 架構變更、擴容驗證 |
| **Soak Test** | 偵測長時間運行下的記憶體洩漏或資源耗盡 | 重大版本、資源密集型服務 |
| **Spike Test** | 驗證突發流量下的系統反應與恢復能力 | 行銷活動前、促銷事件 |

### REQ-2: 基準線管理

系統 SHALL 定義效能基準線的建立、偏移偵測和更新策略。

#### Scenario: 基準線首次建立
- **GIVEN** 專案無效能基準
- **WHEN** 首次建立基準線
- **THEN** 按以下步驟：
  1. 在穩定版本上執行至少 3 次完整 Load Test
  2. 取 p50、p95、p99 的中位數作為基準
  3. 記錄測試環境配置（硬體、資料量、並發數）

#### Scenario: 偏移偵測閾值
- **GIVEN** 已建立效能基準
- **WHEN** 新版本測試結果出來
- **THEN** 按以下閾值判斷：

| 指標 | 可接受偏移 | 需調查 | 阻斷 |
|------|-----------|--------|------|
| p50 延遲 | < 5% | 5-15% | > 15% |
| p95 延遲 | < 10% | 10-20% | > 20% |
| p99 延遲 | < 10% | 10-25% | > 25% |
| 吞吐量 | < 5% 下降 | 5-15% 下降 | > 15% 下降 |
| 錯誤率 | 無增加 | < 0.1% 增加 | > 0.1% 增加 |

#### Scenario: 基準更新策略
- **GIVEN** 系統架構或需求有重大變更
- **WHEN** 決定是否更新基準
- **THEN** 遵循：
  - 架構重構後 MUST 重新建立基準
  - 硬體升級後 SHOULD 更新基準
  - 效能優化成功後 SHOULD 將新數值設為基準
  - 所有基準更新 MUST 記錄變更原因和日期

### REQ-3: CI 觸發條件

系統 SHALL 定義效能測試在 CI 中的觸發條件。

#### Scenario: 觸發條件矩陣
- **GIVEN** CI pipeline 設定
- **WHEN** 決定是否觸發效能測試
- **THEN** 按以下條件判斷：

| 觸發條件 | Load Test | Stress Test | Soak Test | Spike Test |
|----------|-----------|-------------|-----------|------------|
| 每次 commit | ❌ | ❌ | ❌ | ❌ |
| PR 合併到 main | ✅ (精簡版) | ❌ | ❌ | ❌ |
| Release tag | ✅ (完整版) | ✅ | ❌ | ❌ |
| 排程 (weekly) | ✅ | ❌ | ✅ | ❌ |
| 手動觸發 | ✅ | ✅ | ✅ | ✅ |
| 效能相關檔案變更 | ✅ (精簡版) | ❌ | ❌ | ❌ |

### REQ-4: 效能預算

系統 SHALL 定義效能預算概念，類比 SRE 的 Error Budget。

#### Scenario: 效能預算定義
- **GIVEN** 團隊設定效能目標
- **WHEN** 查閱效能預算
- **THEN** 看到以下定義：

| 概念 | 定義 | 範例 |
|------|------|------|
| **效能目標** | 目標效能水準 | p99 < 200ms |
| **效能預算** | 允許的退化空間 | p99 可退化至 220ms (10%) |
| **預算消耗** | 累計退化百分比 | 本季已消耗 6% |
| **預算耗盡** | 觸發凍結非必要變更 | 剩餘 < 2% 時凍結 |

#### Scenario: 退化容忍度設定
- **GIVEN** 效能預算啟用
- **WHEN** 設定退化容忍度
- **THEN** 按以下建議：
  - p99 延遲不可退化超過 10%
  - 吞吐量不可下降超過 5%
  - 錯誤率不可增加超過 0.05%
  - 預算以季度為週期重置

### REQ-5: 效能測試報告格式

系統 SHALL 定義標準化的效能測試報告格式。

#### Scenario: 報告必要欄位
- **GIVEN** 效能測試完成
- **WHEN** 產出報告
- **THEN** 報告包含以下區塊：

```markdown
## Performance Test Report

### Test Metadata
- Date / Duration / Test Type / Environment

### Results Summary
| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|

### Pass/Fail Determination
- Overall: PASS/FAIL
- Failed Criteria: [list]

### Trend Analysis
- Trend chart requirement (last N runs comparison)
- Regression detection

### Recommendations
- Action items based on results
```

#### Scenario: 通過/失敗判定
- **GIVEN** 測試結果已產出
- **WHEN** 判定通過/失敗
- **THEN** 依據：
  - 所有 Error 級閾值未超過 → PASS
  - 任一 Error 級閾值超過 → FAIL
  - Warning 級超過記錄但不阻斷

#### Scenario: 趨勢圖要求
- **GIVEN** 報告包含趨勢分析
- **WHEN** 查閱趨勢圖要求
- **THEN** 須包含：
  - 至少最近 10 次測試結果的趨勢線
  - 基準線標記
  - 異常點標記

## Acceptance Criteria

- **AC-1**: Given 效能測試類型, when 查閱定義, then 有 Load/Stress/Soak/Spike 四種類型各含目的和適用場景
- **AC-2**: Given 基準線管理, when 查閱策略, then 有首次建立步驟、偏移偵測閾值表和基準更新策略
- **AC-3**: Given CI 觸發, when 查閱條件, then 有觸發條件矩陣定義何時觸發哪類測試
- **AC-4**: Given 效能預算, when 查閱概念, then 有效能預算定義含退化容忍度（如 p99 不可退化超過 10%）
- **AC-5**: Given 測試報告, when 查閱格式, then 有含基準對比、通過/失敗判定和趨勢圖要求的報告格式

## Technical Design

### 變更方式

此規格為**擴展**現有 `core/performance-standards.md`，新增以下段落：

```markdown
## Performance Testing Execution

### Test Type Definitions
### Baseline Management
### CI Trigger Conditions
### Performance Budget
### Test Report Format
```

### 不建立獨立檔案

理由：效能測試執行是效能標準的一環，內容作為現有標準的擴展更合適。

## Test Plan

- [ ] 四種效能測試類型有定義含目的和適用場景
- [ ] 基準線管理有首次建立、偏移偵測、更新策略
- [ ] CI 觸發條件矩陣有定義
- [ ] 效能預算有定義含退化容忍度
- [ ] 測試報告格式有定義含基準對比和趨勢圖要求
- [ ] performance-standards.md 其他段落未被修改

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
