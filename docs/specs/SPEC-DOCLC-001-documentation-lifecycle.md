# [SPEC-DOCLC-001] Feature: Documentation Lifecycle Standard

- **Status**: Archived
- **Created**: 2026-03-27
- **Author**: AI-assisted
- **Priority**: Medium
- **Scope**: universal

## Overview

新增 `core/documentation-lifecycle.md` 核心標準，定義 SDLC 各階段中文件的更新觸發條件、檢查時機與分級、責任歸屬。填補現有文件標準體系的生命週期缺口：`documentation-structure.md`（放哪裡）和 `documentation-writing-standards.md`（怎麼寫）只管靜態面，缺少「何時更新、何時檢查、誰負責」的動態面。

## Motivation

### 問題陳述

1. **文件過時無預警** — 程式碼改了但文件沒跟著改，使用者看到過時文件
2. **責任不明確** — 誰應該更新文件？改程式碼的人？審查者？發布者？
3. **檢查時機散落** — `checkin-standards.md` 只有一行「API 文件已更新」，`code-review-checklist.md` 只有一項「Documentation Updated?」，缺乏系統性框架
4. **硬/軟檢查未區分** — 版本號一致性（可自動化）與內容正確性（需人工判斷）混為一談

### 與現有標準的區分

| 標準 | 焦點 | 缺口 |
|------|------|------|
| `documentation-structure.md` | 目錄組織、檔案命名 | 不管何時更新 |
| `documentation-writing-standards.md` | 撰寫風格、內容要求 | 不管更新觸發條件 |
| `documentation-lifecycle.md` (本規格) | **更新時機、檢查分層、責任歸屬** | — |

## Requirements

### REQ-1: 核心原則 — 共同更新原則

標準 SHALL 定義「共同更新原則」：修改程式碼的人負責在同一個 PR 中更新對應文件。

#### Scenario: 開發者遵循共同更新原則
- **GIVEN** 開發者在 PR 中修改了 API 端點
- **WHEN** PR 被提交審查
- **THEN** 同一 PR 中應包含 API 文件的對應更新

#### Scenario: 前移原則
- **GIVEN** 文件問題可能在 commit、PR、release 三個階段被發現
- **WHEN** 標準定義檢查策略
- **THEN** SHALL 強調「越早發現，修復成本越低」的前移原則

### REQ-2: 文件更新觸發規則表

標準 SHALL 提供觸發條件 × 文件類型的對應矩陣，區分 MUST 和 SHOULD 等級。

#### Scenario: 開發者查詢觸發規則
- **GIVEN** 開發者進行了「新增功能」類型的變更
- **WHEN** 查閱觸發規則表
- **THEN** 可找到對應需更新的文件類型（如 README: SHOULD、API 文件: MUST、CHANGELOG: release 時 MUST）

#### Scenario: 觸發規則覆蓋主要變更類型
- **GIVEN** 觸發規則表已定義
- **WHEN** 列舉所有觸發條件
- **THEN** SHALL 至少覆蓋：新功能、API 變更、破壞性變更、Bug 修復、依賴升級、設定變更、架構變更

#### Scenario: 文件類型覆蓋
- **GIVEN** 觸發規則表已定義
- **WHEN** 列舉所有文件類型
- **THEN** SHALL 至少覆蓋：README、API 文件、CHANGELOG、架構文件（ADR）、使用者指南、翻譯文件

### REQ-3: 文件檢查金字塔

標準 SHALL 定義三層檢查架構，對應 SDLC 的 commit → PR → release 階段。

#### Scenario: Commit 層級（Level 1）
- **GIVEN** 開發者準備提交程式碼
- **WHEN** 觸發 commit 層級檢查
- **THEN** 執行秒級自動化檢查（連結有效性、檔案存在性）

#### Scenario: PR Review 層級（Level 2）
- **GIVEN** PR 提交審查
- **WHEN** 審查者執行 PR 層級檢查
- **THEN** 檢查文件與程式碼變更是否同步、內容是否需要更新

#### Scenario: Release 層級（Level 3）
- **GIVEN** 發布者準備 release
- **WHEN** 執行完整文件檢查
- **THEN** 驗證版本號一致、翻譯同步、功能覆蓋率、所有連結有效

### REQ-4: 硬檢查與軟檢查分類

標準 SHALL 區分硬檢查（自動化、阻塞）與軟檢查（人工審查、建議性）。

#### Scenario: 硬檢查定義
- **GIVEN** 標準定義了硬檢查項目
- **WHEN** 列舉硬檢查
- **THEN** SHALL 包含：版本號一致性、文件存在性、連結有效性、翻譯同步狀態、功能數量正確性

#### Scenario: 軟檢查定義
- **GIVEN** 標準定義了軟檢查項目
- **WHEN** 列舉軟檢查
- **THEN** SHALL 包含：內容正確性、範例程式碼可運行、Release notes 描述準確、遷移指南完整性

### REQ-5: 文件類型責任歸屬

標準 SHALL 定義各文件類型的更新責任人與更新時機。

#### Scenario: 責任歸屬表
- **GIVEN** 標準定義了責任歸屬
- **WHEN** 列舉文件類型
- **THEN** 每種類型標明：負責更新的角色、更新時機、檢查方式

#### Scenario: PR 審查者使用責任歸屬判斷
- **GIVEN** PR 審查者檢視包含程式碼變更的 PR
- **WHEN** 依據責任歸屬表檢查
- **THEN** 可判斷 PR 是否缺少必要的文件更新

## Acceptance Criteria

- AC-1: 標準包含共同更新原則和前移原則的明確定義
- AC-2: 標準包含觸發條件 × 文件類型矩陣，涵蓋至少 7 種觸發條件和 6 種文件類型
- AC-3: 標準定義三層檢查金字塔（commit → PR → release），每層有具體檢查項目
- AC-4: 每個檢查項目標明硬檢查或軟檢查
- AC-5: 標準包含責任歸屬表（角色 × 文件類型 × 時機）
- AC-6: 標準為通用標準（scope: universal），不依賴特定工具或框架
- AC-7: 標準明確引用與 `documentation-structure.md` 和 `documentation-writing-standards.md` 的互補關係
- AC-8: 對應翻譯檔案（zh-TW、zh-CN）同步建立

## Technical Design

### 檔案結構

```
core/documentation-lifecycle.md                    # 英文 source
locales/zh-TW/core/documentation-lifecycle.md      # 繁體中文翻譯
locales/zh-CN/core/documentation-lifecycle.md      # 簡體中文翻譯
.standards/documentation-lifecycle.ai.yaml         # AI YAML 規範
```

### 標準文件結構

```markdown
# Documentation Lifecycle Standard

## Purpose
## Core Principles
  - Co-update Principle
  - Shift-left Principle
## Documentation Update Triggers
  - Trigger × Document Type Matrix
## Documentation Check Pyramid
  - Level 1: Commit (automated, seconds)
  - Level 2: PR Review (semi-automated, minutes)
  - Level 3: Release (comprehensive, manual + automated)
## Hard Checks vs Soft Checks
  - Hard Checks (automated, blocking)
  - Soft Checks (manual, advisory)
## Responsibility Matrix
  - Document Type × Role × Timing
## Integration with Other Standards
  - documentation-structure.md
  - documentation-writing-standards.md
  - checkin-standards.md
  - code-review-checklist.md
```

### 標準 metadata

```markdown
**Version**: 1.0.0
**Last Updated**: 2026-03-27
**Applicability**: All software projects with documentation
**Scope**: universal
**Industry Standards**: ISO/IEC 26514 (Documentation lifecycle)
**References**: documentation-structure.md, documentation-writing-standards.md
```

## Test Plan

- [ ] 觸發規則表覆蓋 7+ 觸發條件和 6+ 文件類型
- [ ] 檢查金字塔三層各有具體項目
- [ ] 每個檢查項目標明硬/軟分類
- [ ] 責任歸屬表覆蓋所有文件類型
- [ ] 不包含特定工具或框架的依賴
- [ ] 翻譯同步：`./scripts/check-translation-sync.sh`
- [ ] 標準同步：`./scripts/check-standards-sync.sh`
- [ ] 文件完整性：`./scripts/check-docs-integrity.sh`

## Implementation Tasks

- [ ] Task 1: 撰寫 `core/documentation-lifecycle.md` 英文版
- [ ] Task 2: 建立 `.standards/documentation-lifecycle.ai.yaml`
- [ ] Task 3: 建立 `locales/zh-TW/core/documentation-lifecycle.md`
- [ ] Task 4: 建立 `locales/zh-CN/core/documentation-lifecycle.md`
- [ ] Task 5: 更新 `CLAUDE.md` 標準索引
- [ ] Task 6: 執行同步檢查腳本驗證
