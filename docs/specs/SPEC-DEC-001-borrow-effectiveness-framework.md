# [SPEC-DEC-001] Feature: 借鑒方法有效性評估框架 — UDS 實作

> **狀態**: Implemented
> **Status**: Stable
> **建立日期**: 2026-04-09
> **作者**: AlbertHsu
> **上游規格**: [XSPEC-014](../../../dev-platform/cross-project/specs/XSPEC-014-borrow-effectiveness-evaluation.md)
> **影響檔案**: `core/adr-standards.md`, `locales/zh-TW/core/adr-standards.md`, `ai/standards/adr-standards.ai.yaml`, `.standards/adr-standards.ai.yaml`
> **跨專案產出**: `dev-platform/cross-project/decisions/TECH-RADAR.md`

---

## Overview

在 UDS 的 `adr-standards.md` 中擴充 DEC（Decision）模板，新增技術雷達狀態欄位、借鑒假設書區塊、評估紀錄表，以及 Reversal DEC 格式說明。同步在 dev-platform 建立 `TECH-RADAR.md` 跨 DEC 總覽。

## Motivation

現有 17 個 DEC 只記錄「借鑒了什麼」，缺乏「預期改善多少」與「如何驗證」，沒有失敗退場機制，也沒有統一的狀態總覽。本 SPEC 為 XSPEC-014 Layer 1 框架在 UDS 的實作。

---

## Requirements

### Requirement 1: DEC 模板擴充（向後相容）

`core/adr-standards.md` 的 DEC 借鑒模板 SHALL 新增三個區塊（非必填欄位，現有 DEC 不破壞）。

#### Scenario: 新建借鑒型 DEC 時填寫擴充區塊

- **GIVEN** 開發者建立新的借鑲決策文件（DEC）
- **WHEN** 使用 `adr-standards.md` 中的 DEC 模板
- **THEN** 模板包含「技術雷達狀態」、「借鑲假設」、「評估紀錄」三個區塊，並有完整填寫說明

### Requirement 2: Reversal DEC 格式說明

`core/adr-standards.md` SHALL 說明當借鑲方法評定無效時，如何建立 `DEC-NNN-reversal` 文件。

#### Scenario: 方法評定無效後建立 Reversal DEC

- **GIVEN** 一個 DEC 的技術雷達狀態變為 `Hold`
- **WHEN** 執行退場流程
- **THEN** 依 `DEC-NNN-reversal` 格式建立撤銷文件，包含移除原因、反模式與學習點

### Requirement 3: TECH-RADAR.md 建立

`dev-platform/cross-project/decisions/TECH-RADAR.md` SHALL 建立，包含四象限分類與現有 17 個 DEC 的初始分類。

#### Scenario: 快速查詢特定狀態的 DEC

- **GIVEN** 開發者想了解目前所有 Trial 狀態的借鑲方法
- **WHEN** 查閱 TECH-RADAR.md
- **THEN** 可在 Trial 象限找到對應 DEC 編號、方法名稱與到期日

### Requirement 4: AI YAML 同步更新

`ai/standards/adr-standards.ai.yaml` 與 `.standards/adr-standards.ai.yaml` SHALL 新增技術雷達與假設書的 AI 行為規則。

#### Scenario: AI 引用缺少假設書的 DEC

- **GIVEN** 一個 DEC 缺少「借鑲假設」區塊
- **WHEN** AI 助手在規劃或分析時引用此 DEC
- **THEN** AI 助手標註 `[假設未定義]` 警告（參照 XSPEC-014 AC-2）

---

## Acceptance Criteria

| AC | Given | When | Then |
|----|-------|------|------|
| AC-1 | 開啟 `core/adr-standards.md` | 查看 DEC 模板 | 可見「技術雷達狀態」、「借鑲假設」、「評估紀錄」三個擴充區塊 |
| AC-2 | 開啟 `core/adr-standards.md` | 查看 Reversal DEC 說明 | 可見 DEC-NNN-reversal 格式說明，包含必填欄位列表 |
| AC-3 | 開啟 `dev-platform/cross-project/decisions/TECH-RADAR.md` | 查看文件 | 可見四象限（Adopt/Trial/Assess/Hold）與 17 個 DEC 分類 |
| AC-4 | `ai/standards/adr-standards.ai.yaml` | 讀取 rules | 包含 `dec_tech_radar_default_trial`、`dec_missing_hypothesis_warning` 規則 |
| AC-5 | 修改 `core/adr-standards.md` | 同步翻譯 | `locales/zh-TW/core/adr-standards.md` 同步更新 |

---

## Technical Design

### 修改範圍

| 檔案 | 操作 | 說明 |
|------|------|------|
| `core/adr-standards.md` | 新增章節 | DEC 借鑲擴充模板 + Reversal DEC |
| `locales/zh-TW/core/adr-standards.md` | 同步翻譯 | 與英文版同步 |
| `ai/standards/adr-standards.ai.yaml` | 新增 rules | 技術雷達與假設書行為規則 |
| `.standards/adr-standards.ai.yaml` | 同步 | 與 ai/standards 同步 |
| `dev-platform/cross-project/decisions/TECH-RADAR.md` | 新建 | 四象限技術雷達總覽 |

### DEC 擴充模板結構

三個新增區塊，置於現有 DEC 模板「Decision Outcome」之後：
1. `## 技術雷達狀態` — 狀態/最後評估/下次評估日期
2. `## 借鑲假設` — 假設陳述/測量方式/基準值/目標值/期限/成功失敗條件
3. `## 評估紀錄` — 日期/狀態/觀察/決定 表格

---

## Test Plan

- [ ] 手動確認 `core/adr-standards.md` 包含三個新區塊
- [ ] 手動確認 Reversal DEC 格式說明完整
- [ ] 手動確認 `TECH-RADAR.md` 包含四象限與 17 個 DEC 分類
- [ ] 手動確認 AI YAML 包含新規則
- [ ] 執行 `./scripts/check-translation-sync.sh` 確認翻譯同步
- [ ] 執行 `./scripts/check-standards-sync.sh` 確認標準一致性
