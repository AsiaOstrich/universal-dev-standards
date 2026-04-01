# [SPEC-TELEMETRY-001] Feature: 跨系統 Telemetry 統一 — Hook 執行遙測與採用率報告

- **Status**: Implemented
- **Created**: 2026-04-01
- **Issue**: #65
- **Phase**: harness-engineering Phase 3
- **Scope**: uds-specific (UDS 部分；DevAP/VibeOps 整合為外部依賴)
- **Depends-on**: SPEC-HOOKS-001 (Implemented)

## Overview

建立統一的 hook 執行遙測格式，記錄每次 hook 執行的結果與耗時，並提供 `uds report` 命令分析採用率。此為 UDS 範圍的實作，DevAP/VibeOps 整合屬後續外部工作。

## Motivation

目前 `hook-stats.js` 記錄的是 context-aware loading 的觸發統計。enforcement hooks（Phase 1 實作的 commit-msg、security、logging）的執行結果尚無遙測記錄。統一的遙測格式可實現：
1. 標準採用率量化（哪些標準被強制執行最多？）
2. Hook 效能監控（執行耗時是否超過 500ms？）
3. 跨系統（UDS→DevAP→VibeOps）數據交叉分析

## Requirements

### REQ-1: Telemetry Wrapper

系統 SHALL 提供 `telemetry-wrapper.js`，包裹 hook 腳本執行並記錄遙測數據。

#### Scenario: 記錄成功的 hook 執行

- **GIVEN** 一個 hook 腳本執行成功（exit 0）
- **WHEN** telemetry-wrapper 完成記錄
- **THEN** `.standards/telemetry.jsonl` 新增一筆 `result: "pass"` 的記錄

#### Scenario: 記錄失敗的 hook 執行

- **GIVEN** 一個 hook 腳本執行失敗（exit 1）
- **WHEN** telemetry-wrapper 完成記錄
- **THEN** `.standards/telemetry.jsonl` 新增一筆 `result: "fail"` 的記錄

#### Scenario: 記錄執行耗時

- **GIVEN** hook 腳本執行耗時 120ms
- **WHEN** telemetry-wrapper 記錄結果
- **THEN** 記錄包含 `duration_ms: 120`

#### Scenario: 遙測記錄格式

- **GIVEN** telemetry-wrapper 記錄一次執行
- **WHEN** 讀取記錄
- **THEN** 包含 `timestamp`、`standard_id`、`hook_type`、`result`、`duration_ms` 五個欄位

### REQ-2: Report 命令

系統 SHALL 提供 `uds report` 命令，分析 `telemetry.jsonl` 產出採用率報告。

#### Scenario: 產出採用率報告

- **GIVEN** `telemetry.jsonl` 包含多筆記錄
- **WHEN** 執行 `uds report`
- **THEN** 顯示每個 standard 的執行次數、通過率、平均耗時

#### Scenario: 無遙測數據

- **GIVEN** `telemetry.jsonl` 不存在
- **WHEN** 執行 `uds report`
- **THEN** 顯示提示訊息（無遙測數據可分析）

### REQ-3: Telemetry Rotation

系統 SHALL 實現遙測檔案的自動輪轉機制，防止無限增長。

#### Scenario: 檔案超過大小限制時自動截斷

- **GIVEN** `telemetry.jsonl` 超過 2MB
- **WHEN** 新增一筆記錄
- **THEN** 自動保留後半部分，丟棄較舊的記錄

## Acceptance Criteria

| AC | 說明 | REQ | 範圍 |
|----|------|-----|------|
| AC-1 | Hook 執行後 `telemetry.jsonl` 記錄正確 | REQ-1 | UDS |
| AC-2 | `uds report` 產出可讀的採用率報告 | REQ-2 | UDS |
| AC-3 | DevAP StandardsEffectivenessReport 包含 hook 數據 | — | DevAP（外部） |
| AC-4 | VibeOps pipeline 報告包含 telemetry 彙整 | — | VibeOps（外部） |
| AC-5 | Telemetry 檔案有 rotation 機制 | REQ-3 | UDS |

> **Note**: AC-3 和 AC-4 屬於外部 repo，本 spec 僅覆蓋 UDS 範圍（AC-1、AC-2、AC-5）。

## Technical Design

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `scripts/hooks/telemetry-wrapper.js` | Hook 遙測包裹器 |
| `cli/src/commands/report.js` | 遙測分析報告命令 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `cli/bin/uds.js` | 註冊 `report` 命令 |

### 遙測記錄格式

```jsonl
{"timestamp":"2026-04-01T10:00:01Z","standard_id":"commit-message","hook_type":"UserPromptSubmit","result":"pass","duration_ms":120}
{"timestamp":"2026-04-01T10:00:05Z","standard_id":"security-standards","hook_type":"PreToolUse","result":"fail","duration_ms":45}
```

### 報告產出格式

```
UDS Hook Telemetry Report
═════════════════════════
Period: 2026-03-01 ~ 2026-04-01
Total executions: 1,234

Standard              Executions  Pass Rate  Avg Duration
─────────────────────────────────────────────────────────
commit-message             456     98.2%       85ms
security-standards         389     99.7%       42ms
logging                    389     95.1%      110ms
```

### Rotation 策略

- 檔案大小上限：2MB
- 觸發條件：寫入前檢查大小
- 動作：保留後 50% 的行數，丟棄前 50%
- 與 `hook-stats.js` 的既有 rotation 邏輯一致（MAX_STATS_SIZE）

## Test Plan

- [ ] `telemetry-wrapper.js` 單元測試（pass/fail/duration 記錄）
- [ ] `report.js` 命令測試（有數據/無數據/報告格式）
- [ ] rotation 測試（超過大小限制自動截斷）

## Dependencies

- **依賴**: SPEC-HOOKS-001 (hook 基礎), SPEC-COMPILE-001 (enforcement 格式)
- **外部依賴**: DevAP #5 (AC-3), VibeOps (AC-4)
- **被依賴**: 無
