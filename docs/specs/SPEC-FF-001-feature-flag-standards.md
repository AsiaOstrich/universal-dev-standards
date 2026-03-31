# [SPEC-FF-001] Feature: Feature Flag Management Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/deployment-standards.md` (互補), SPEC-TECHDEBT-001 (銜接)

## Overview

新增 `core/feature-flag-standards.md` 核心標準，定義 Feature Flag 的類型、命名慣例、生命週期管理、審計流程和腐化偵測機制。Feature Flag 是漸進式交付的基礎工具，但缺乏管理標準會導致嚴重的技術債。

## Motivation

### 問題陳述

1. **Flag 永久殘留** — Feature Flag 建立後從不清理，成為程式碼中的永久分支
2. **無命名慣例** — Flag 名稱不一致，無法判斷用途和存續期
3. **無生命週期** — 缺乏 TTL（最長存活時間）和審計機制
4. **類型混淆** — 短期 release flag 和長期 ops flag 使用相同管理策略
5. **測試困難** — Flag 組合爆炸導致測試矩陣過大

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `deployment-standards` | **互補**：deployment 定義部署流程，flag 是漸進式部署的實作工具 |
| SPEC-TECHDEBT-001 | **銜接**：過期的 flag 自動轉為技術債 |
| `testing-standards` | **擴展**：flag 影響測試策略（需測試 flag on/off 兩種路徑） |
| `security-standards` | **銜接**：permission flag 涉及存取控制 |

## Requirements

### REQ-1: Feature Flag 類型分類

系統 SHALL 定義 Feature Flag 的類型，含各類型的生命週期預期和管理策略。

#### Scenario: 識別 Flag 類型
- **GIVEN** 開發者需要建立 Feature Flag
- **WHEN** 查閱類型指南
- **THEN** 選擇適當類型：

| 類型 | 用途 | 預期壽命 | 管理策略 |
|------|------|----------|---------|
| **Release** | 控制未完成功能的可見性 | 短期（1-4 週） | 功能上線後立即移除 |
| **Experiment** | A/B 測試和功能實驗 | 中期（2-8 週） | 實驗結束後移除 |
| **Ops** | 運維開關（降級、熔斷） | 長期或永久 | 定期審查，保留但簡化 |
| **Permission** | 基於角色/用戶的功能存取 | 長期 | 作為系統功能的一部分維護 |

### REQ-2: Flag 命名慣例

系統 SHALL 定義 Feature Flag 的命名慣例。

#### Scenario: 命名新的 Flag
- **GIVEN** 開發者建立新的 Feature Flag
- **WHEN** 遵循命名慣例
- **THEN** 名稱遵循 `<type>_<feature>_<context>` 格式：
  - ✅ `release_new_checkout_flow`
  - ✅ `experiment_pricing_page_v2`
  - ✅ `ops_payment_circuit_breaker`
  - ✅ `permission_admin_dashboard`
  - ❌ `flag1`（無意義）
  - ❌ `new_feature`（太模糊）
  - ❌ `test_thing_temp`（未遵循格式）

### REQ-3: Flag 生命週期管理

系統 SHALL 定義 Feature Flag 的完整生命週期。

#### Scenario: Flag 生命週期流程
- **GIVEN** 建立新的 Feature Flag
- **WHEN** 經歷完整生命週期
- **THEN** 按以下階段流轉：

```
Created ──► Active ──► Validated ──► Cleanup ──► Removed
                                       │
                              Expired ──┘ (超過 TTL)
```

| 階段 | 說明 | 負責人 |
|------|------|--------|
| **Created** | Flag 建立，預設關閉 | 開發者 |
| **Active** | Flag 在部分或全部環境啟用 | 開發者/PM |
| **Validated** | 功能驗證完成，決定保留或移除 | PM |
| **Cleanup** | 移除 Flag 程式碼和配置 | 開發者 |
| **Removed** | Flag 完全清除 | 開發者 |
| **Expired** | 超過 TTL 但未處理 → 轉為技術債 | 自動 |

#### Scenario: TTL（最長存活時間）
- **GIVEN** 不同類型的 Flag
- **WHEN** 設定 TTL
- **THEN** 按類型設定預設 TTL：

| 類型 | 預設 TTL | 最大 TTL | 超過後 |
|------|----------|---------|--------|
| Release | 2 週 | 4 週 | 標記為過期，登記技術債 |
| Experiment | 4 週 | 8 週 | 強制結束實驗 |
| Ops | 無限（但需季度審查） | — | 審查時決定保留/移除 |
| Permission | 無限（系統功能） | — | 隨功能生命週期管理 |

### REQ-4: Flag 審計流程

系統 SHALL 定義 Feature Flag 的定期審計流程。

#### Scenario: 季度 Flag 審計
- **GIVEN** 團隊有多個 Feature Flag
- **WHEN** 執行季度審計
- **THEN** 對每個 Flag 評估：

| 檢查維度 | 問題 | 行動 |
|----------|------|------|
| 存活時間 | 是否超過 TTL？ | 超過 → 清理或延長（需記錄原因） |
| 使用狀態 | 是否在所有環境都啟用？ | 全啟用 → 可移除 Flag，直接啟用 |
| 程式碼參考 | 有多少程式碼位置引用？ | > 10 處 → 優先清理 |
| 測試影響 | 是否導致測試複雜度增加？ | 是 → 優先清理 |

#### Scenario: 審計報告格式
- **GIVEN** 審計完成
- **WHEN** 產生報告
- **THEN** 報告包含：
  - Flag 總數（按類型和狀態分組）
  - 過期 Flag 清單（需行動）
  - 本季清理的 Flag 數
  - Flag 趨勢（增減）

### REQ-5: Flag 腐化偵測

系統 SHALL 定義 Flag 腐化的偵測和處理機制。

#### Scenario: 偵測腐化的 Flag
- **GIVEN** Flag 超過 TTL
- **WHEN** 系統執行腐化檢查
- **THEN** 執行以下動作：
  1. 標記 Flag 為 **Expired**
  2. 在技術債登記簿中建立條目（類型：程式碼債）
  3. 通知 Flag Owner
  4. 在下次 Sprint Planning 中提醒

#### Scenario: Flag 清理檢查表
- **GIVEN** 決定清理某個 Flag
- **WHEN** 開發者執行清理
- **THEN** 依照檢查表：
  - [ ] 移除所有 Flag 判斷程式碼（保留啟用分支）
  - [ ] 移除 Flag 配置/定義
  - [ ] 更新相關測試（移除 Flag 變體測試）
  - [ ] 更新文件（如有提及 Flag）
  - [ ] 驗證所有環境正常

### REQ-6: Flag 測試策略

系統 SHALL 定義 Feature Flag 對測試的影響和最佳實踐。

#### Scenario: Flag 測試最佳實踐
- **GIVEN** 程式碼中有 Feature Flag
- **WHEN** 撰寫測試
- **THEN** 遵循以下原則：

| 原則 | 說明 |
|------|------|
| **測試兩種狀態** | Flag on 和 off 都需要測試 |
| **避免組合爆炸** | 不需測試所有 Flag 組合；只測直接影響的 Flag |
| **預設值測試** | 確保 Flag 關閉時的行為正確（安全降級） |
| **環境隔離** | 測試環境的 Flag 狀態不受生產影響 |

## Acceptance Criteria

- **AC-1**: Given 開發者建立 Flag, when 查閱類型指南, then 能從 4 種類型（Release/Experiment/Ops/Permission）中選擇
- **AC-2**: Given 命名 Flag, when 遵循慣例, then 名稱符合 `<type>_<feature>_<context>` 格式，含正反範例
- **AC-3**: Given Flag 建立後, when 查閱生命週期, then 看到 6 個階段（Created→Active→Validated→Cleanup→Removed, +Expired）
- **AC-4**: Given 不同類型 Flag, when 查閱 TTL, then 每種類型有預設和最大 TTL
- **AC-5**: Given 季度審計, when 執行審計, then 有 4 個檢查維度和審計報告格式
- **AC-6**: Given Flag 超過 TTL, when 偵測腐化, then 自動標記+登記技術債+通知 Owner
- **AC-7**: Given Flag 需清理, when 使用檢查表, then 有 5 個清理步驟
- **AC-8**: Given Flag 影響測試, when 查閱測試策略, then 有 4 個測試原則

## Technical Design

### 文件結構

```
core/
├── feature-flag-standards.md     ← 新建
├── deployment-standards.md       ← 現有，新增交叉引用
```

### 章節結構

```markdown
# Feature Flag Standards
## Overview
## Flag Types (Release/Experiment/Ops/Permission)
## Naming Conventions
## Lifecycle Management
  ### Lifecycle Stages
  ### TTL by Type
## Audit Process
  ### Quarterly Audit
  ### Audit Report Template
## Decay Detection
  ### Automatic Detection
  ### Cleanup Checklist
## Testing Strategy
## Integration Points
  ### Tech Debt Registry
  ### Deployment Workflow
## Quick Reference Card
## References
```

## Test Plan

- [ ] 4 種 Flag 類型有完整定義
- [ ] 命名慣例有正反範例
- [ ] 生命週期包含 6 個階段
- [ ] TTL 定義涵蓋 4 種類型
- [ ] 審計流程有 4 個檢查維度
- [ ] 腐化偵測有自動化動作定義
- [ ] 清理檢查表有 5 個步驟
- [ ] 測試策略有 4 個原則
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
