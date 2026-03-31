# [SPEC-TEST-002] Feature: Exploratory Testing Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/testing-standards.md` (擴展), SPEC-TEST-001 (延續)

## Overview

擴展 `core/testing-standards.md`，新增探索式測試（Exploratory Testing）段落，涵蓋 Session-Based Test Management (SBTM)、測試啟發法、測試記錄範本、以及探索式與自動化測試的互補原則。

## Motivation

### 問題陳述

1. **自動化不足以發現所有缺陷** — 自動化測試只能驗證已知的預期行為，無法發現未預期的問題
2. **缺乏結構化探索方法** — 團隊進行探索式測試時缺乏系統化的方法論，品質參差不齊
3. **測試知識無法累積** — 探索過程中的發現未被記錄，無法轉化為自動化回歸測試
4. **啟發法缺失** — 測試人員缺乏系統化的探索策略，容易遺漏重要測試面向

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `testing-standards` | **擴展**：在現有測試金字塔之外補充探索式方法 |
| `test-completeness-dimensions` | **互補**：SFDPOT 啟發法提供額外的測試維度 |
| `test-driven-development` | **互補**：TDD 覆蓋已知行為，ET 發現未知行為 |

## Requirements

### REQ-1: Session-Based Test Management (SBTM)

系統 SHALL 定義 SBTM 方法論，包含時間框、章程和會議記錄的標準格式。

#### AC-1: SBTM 定義

- **GIVEN** 團隊要執行探索式測試
- **WHEN** 使用 SBTM 方法
- **THEN** 每個測試 session SHALL 包含：
  - **時間框（Time Box）**：60-90 分鐘的固定時段
  - **章程（Charter）**：明確的探索目標和範圍
  - **會議記錄（Session Notes）**：結構化的測試過程記錄

| 元素 | 說明 | 必要性 |
|------|------|--------|
| Time Box | 60-90 分鐘 | 必要 |
| Charter | 探索目標、測試區域、預期風險 | 必要 |
| Session Notes | 步驟記錄、觀察、偏離、問題 | 必要 |
| Debrief | 測試後回顧 | 建議 |

### REQ-2: 測試啟發法

系統 SHALL 定義至少 3 種測試啟發法（heuristics）來引導探索方向。

#### AC-2: SFDPOT 啟發法

- **GIVEN** 測試人員需要探索策略
- **WHEN** 使用 SFDPOT 啟發法
- **THEN** 標準 SHALL 定義以下 6 個維度：

| 維度 | 英文 | 探索重點 |
|------|------|---------|
| 結構 | Structure | 系統的組成元件和它們之間的關係 |
| 功能 | Function | 系統提供的功能和能力 |
| 資料 | Data | 輸入/輸出資料、邊界值、格式 |
| 平台 | Platform | 作業系統、瀏覽器、硬體環境差異 |
| 操作 | Operations | 安裝、設定、維護、監控等操作面向 |
| 時間 | Time | 時序相關問題：並發、逾時、排程、時區 |

### REQ-3: 探索式測試記錄範本

系統 SHALL 定義結構化的測試記錄範本。

#### AC-3: Session Record Template

- **GIVEN** 測試人員完成一個探索式測試 session
- **WHEN** 記錄測試結果
- **THEN** 範本 SHALL 包含以下欄位：

| 欄位 | 說明 | 必要性 |
|------|------|--------|
| Charter | 測試目標和範圍 | 必要 |
| Area | 測試的功能區域 | 必要 |
| Duration | 實際花費時間 | 必要 |
| Notes | 測試步驟、觀察、發現 | 必要 |
| Bugs Found | 發現的缺陷清單 | 必要 |
| Follow-up | 後續行動項目 | 必要 |

### REQ-4: 探索式與自動化互補原則

系統 SHALL 定義探索式測試與自動化測試的互補策略。

#### AC-4: Automation Complement Principle

- **GIVEN** 探索式測試發現了新的缺陷或行為
- **WHEN** 評估後續測試策略
- **THEN** 標準 SHALL 定義：
  - 探索發現的缺陷 → 加入自動化回歸測試
  - 探索式測試負責發現（discovery），自動化負責防護（protection）
  - 兩者的適用場景區分

| 面向 | 探索式測試 | 自動化測試 |
|------|-----------|-----------|
| 目的 | 發現未知缺陷 | 驗證已知行為 |
| 時機 | 新功能、風險區域、回歸前 | 每次建置、持續整合 |
| 轉換 | 發現 → 撰寫自動化測試 | 失敗 → 探索根因 |
| 成本 | 人力密集 | 維護成本 |

## Acceptance Criteria Summary

| AC | 描述 | 驗證方式 |
|----|------|---------|
| AC-1 | SBTM 定義（Time Box 60-90 min、Charter、Session Notes） | 內容驗證 |
| AC-2 | SFDPOT 啟發法（6 個維度） | 內容驗證 |
| AC-3 | Session Record Template（6 個欄位） | 內容驗證 |
| AC-4 | 探索式與自動化互補原則 | 內容驗證 |
