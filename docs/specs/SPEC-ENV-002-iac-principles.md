# [SPEC-ENV-002] Feature: IaC Principles Extension for environment-standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Medium (P2)
- **Scope**: universal
- **Related**: `core/environment-standards.md` (擴展), SPEC-ENV-001

## Overview

擴展剛建立的 `core/environment-standards.md`，新增 Infrastructure as Code (IaC) 原則段落。定義聲明式優先、冪等性、版控、模組化等語言無關的 IaC 核心原則。

## Requirements

### REQ-1: IaC 核心原則

系統 SHALL 定義 IaC 的核心原則。

#### Scenario: 查閱 IaC 原則
- **GIVEN** 團隊管理基礎設施
- **WHEN** 查閱 IaC 原則
- **THEN** 看到以下核心原則：

| 原則 | 說明 |
|------|------|
| **聲明式優先** | 描述期望狀態而非操作步驟 |
| **冪等性** | 多次執行結果相同 |
| **版本控制** | 所有 IaC 程式碼 MUST 入 Git |
| **模組化** | 可重用的模組，避免重複 |
| **環境參數化** | 同一模組，不同環境用不同參數 |
| **不可變基礎設施** | 更新時替換而非修改 |

### REQ-2: IaC Code Review

系統 SHALL 定義 IaC 程式碼的審查要點。

#### Scenario: IaC 審查清單
- **GIVEN** PR 包含 IaC 變更
- **WHEN** 進行 Code Review
- **THEN** 檢查：
  - 安全性（最小權限、無硬編碼 Secret）
  - 成本影響（是否增加資源、估計費用）
  - 回滾可行性（變更是否可逆）
  - 環境一致性（是否影響環境同等性）

### REQ-3: Drift Detection

系統 SHALL 定義基礎設施 Drift（偏移）的偵測和處理。

#### Scenario: Drift 偵測
- **GIVEN** IaC 管理的基礎設施
- **WHEN** 手動或自動修改了基礎設施（不透過 IaC）
- **THEN** Drift detection 機制應：
  - 定期比對實際狀態 vs IaC 定義
  - 發現偏移時通知團隊
  - 提供修復選項：更新 IaC 或回復基礎設施

## Acceptance Criteria

- **AC-1**: Given IaC 管理, when 查閱原則, then 有 6 個核心原則（聲明式/冪等/版控/模組化/參數化/不可變）
- **AC-2**: Given IaC 審查, when 查閱清單, then 有 4 個審查面向（安全/成本/回滾/一致性）
- **AC-3**: Given Drift, when 查閱偵測機制, then 有定期比對和修復選項

## Technical Design

擴展 `core/environment-standards.md`，在 Environment Lifecycle 後新增：
- `## Infrastructure as Code (IaC) Principles`
- `### Core Principles`
- `### IaC Code Review Checklist`
- `### Drift Detection`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
