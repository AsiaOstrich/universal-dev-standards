# [SPEC-DEPLOY-002] Feature: Deployment Verification Extension

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Medium (P2)
- **Scope**: universal
- **Related**: `core/deployment-standards.md` (擴展), SPEC-OBS-001, SPEC-ALERT-001

## Overview

擴展現有 `core/deployment-standards.md`，新增部署驗證（Deployment Verification）段落。現有標準有 Pre-deployment 和 Post-deployment 檢查表，但缺乏**自動化驗證機制**和**部署成功判定標準**。

## Motivation

現有 `deployment-standards.md` 已有：
- ✅ 4 種部署策略 + 決策樹
- ✅ Feature Flag 生命週期
- ✅ Rollback 自動/手動觸發條件
- ✅ Pre/Post-deployment 檢查表

缺少：
- ❌ 自動化 Smoke Test 標準
- ❌ 部署成功/失敗判定準則
- ❌ Canary 分析判斷（promote 或 rollback）
- ❌ 部署後觀察期定義

## Requirements

### REQ-1: 部署成功判定準則

系統 SHALL 定義部署成功的量化判定標準。

#### Scenario: 自動判定部署成功
- **GIVEN** 新版本已部署
- **WHEN** 觀察期結束後自動判定
- **THEN** 以下條件全部滿足才算成功：

| 條件 | 閾值 | 量測視窗 |
|------|------|----------|
| Error rate | ≤ 部署前基線 + 0.1% | 5 分鐘 |
| P99 latency | ≤ 部署前基線 × 1.2 | 5 分鐘 |
| Health check | 100% 通過 | 持續 |
| Smoke tests | 100% 通過 | 部署後 2 分鐘 |

### REQ-2: 觀察期

系統 SHALL 定義部署後的觀察期要求。

#### Scenario: 觀察期定義
- **GIVEN** 新版本部署完成
- **WHEN** 查閱觀察期要求
- **THEN** 按部署類型：

| 部署類型 | 最短觀察期 | 觀察指標 |
|---------|-----------|---------|
| Canary | 15 分鐘（每個流量百分比階段） | Error rate、Latency、業務指標 |
| Blue-Green | 5 分鐘（切換後） | Health check、Error rate |
| Rolling | 整個 rollout 期間 | 每批次的 health check |
| Feature Flag | 24 小時（首次啟用） | 業務指標、用戶回饋 |

### REQ-3: Smoke Test 標準

系統 SHALL 定義部署後自動化 Smoke Test 的要求。

#### Scenario: Smoke Test 要求
- **GIVEN** 新版本部署後
- **WHEN** 執行 Smoke Test
- **THEN** 測試涵蓋：
  - Health check endpoint 回傳 200
  - 核心 API 端點可用（至少 3 個關鍵路徑）
  - 資料庫連線正常
  - 外部依賴可達
  - 執行時間 < 60 秒

## Acceptance Criteria

- **AC-1**: Given 部署完成, when 查閱判定準則, then 有 4 個量化條件（error rate/latency/health/smoke）
- **AC-2**: Given 不同部署類型, when 查閱觀察期, then 每種策略有最短觀察期和觀察指標
- **AC-3**: Given Smoke Test, when 查閱要求, then 有至少 5 個測試項目和時間限制

## Technical Design

擴展 `core/deployment-standards.md`，在 Post-Deployment Checklist 後新增：
- `## Deployment Verification`
- `### Success Criteria`
- `### Observation Period`
- `### Smoke Test Requirements`

## Test Plan

- [ ] 成功判定有 4 個量化條件
- [ ] 觀察期涵蓋 4 種部署策略
- [ ] Smoke Test 有至少 5 個項目
- [ ] 現有段落未被修改

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
