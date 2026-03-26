# [SPEC-ADR-001] Feature: Architecture Decision Records (ADR) Skill

- **Status**: Implemented
- **Created**: 2026-03-26
- **Author**: AI-assisted
- **Priority**: High
- **Scope**: universal

## Overview

新增 `/adr` 技能與 `core/adr-standards.md` 核心標準，讓團隊能系統性記錄、追蹤和管理架構決策。填補 UDS 在架構決策追溯方面的缺口，對應 TOGAF ADR 和 Michael Nygard 的 ADR 慣例。

## Motivation

### 問題陳述

目前 UDS 的架構決策散落在 `/sdd` 規格文件中，存在以下問題：
1. **無法獨立追蹤** — 架構決策埋在規格文件中，事後難以查找
2. **無狀態管理** — 決策缺少明確的生命週期（提議→接受→廢止→取代）
3. **缺少上下文記錄** — 為什麼選 A 不選 B 的理由隨時間流失
4. **國際標準缺口** — ISO/IEC/IEEE 42010 要求記錄架構決策的理由

### 預期效果

- 團隊成員（含新加入者）能快速了解過去的架構決策及其原因
- 避免重複討論已決定的事項
- 建立可搜尋的決策知識庫

## Requirements

### REQ-1: Core Standard — ADR 標準文件

系統 SHALL 提供 `core/adr-standards.md` 作為語言無關、框架無關的 ADR 核心標準。

#### Scenario: 使用者查閱 ADR 標準
- **GIVEN** 使用者想了解 ADR 的格式與流程
- **WHEN** 使用者閱讀 `core/adr-standards.md`
- **THEN** 應看到完整的 ADR 模板、狀態流轉規則、命名慣例

### REQ-2: Skill — `/adr` 互動式引導

系統 SHALL 提供 `/adr` 技能，引導使用者建立、查詢、更新和廢止 ADR。

#### Scenario: 建立新的 ADR
- **GIVEN** 使用者執行 `/adr` 或 `/adr create`
- **WHEN** AI 助手引導使用者填寫決策背景、選項分析和最終決策
- **THEN** 產生符合標準格式的 ADR 文件，存放於 `docs/adr/` 目錄

#### Scenario: 查詢現有 ADR
- **GIVEN** 使用者執行 `/adr list` 或 `/adr search [keyword]`
- **WHEN** AI 助手搜尋 `docs/adr/` 目錄
- **THEN** 列出所有 ADR 或符合關鍵字的 ADR，顯示編號、標題、狀態

#### Scenario: 廢止或取代 ADR
- **GIVEN** 使用者執行 `/adr supersede [ADR-NNN]`
- **WHEN** AI 助手引導使用者建立新 ADR 並標記舊 ADR 為已取代
- **THEN** 舊 ADR 狀態更新為 `Superseded by ADR-NNN`，新 ADR 標記 `Supersedes ADR-NNN`

### REQ-3: ADR 模板格式

系統 SHALL 使用以下標準 ADR 格式：

```markdown
# ADR-NNN: [決策標題]

- **Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
- **Date**: YYYY-MM-DD
- **Deciders**: [參與決策者]
- **Technical Story**: [相關 SPEC-ID 或 Issue]

## Context | 背景

[描述引發此決策的技術或業務背景]

## Decision Drivers | 決策驅動因素

- [驅動因素 1]
- [驅動因素 2]

## Considered Options | 考慮的選項

1. [選項 1]
2. [選項 2]
3. [選項 3]

## Decision Outcome | 決策結果

選擇 **[選項 N]**，因為 [理由]。

### Consequences | 後果

**Good:**
- [正面影響]

**Bad:**
- [負面影響/取捨]

## Links | 相關連結

- [相關 ADR、SPEC、PR]
```

### REQ-4: ADR 狀態流轉

系統 SHALL 支援以下狀態流轉：

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

#### Scenario: 狀態流轉合法性檢查
- **GIVEN** 一個狀態為 `Accepted` 的 ADR
- **WHEN** 使用者嘗試將其改回 `Proposed`
- **THEN** AI 助手應警告此為非正常流轉，建議建立新 ADR 取代

### REQ-5: 與 `/sdd` 交叉引用

系統 SHALL 支援 ADR 與 SDD 規格的交叉引用。

#### Scenario: 從 SDD 引用 ADR
- **GIVEN** 使用者在 `/sdd` 流程中做了架構決策
- **WHEN** 決策具有長期影響且值得獨立追蹤
- **THEN** AI 助手建議建立 ADR 並在 SDD 的 Technical Design 中引用

### REQ-6: 翻譯與同步

系統 SHALL 提供繁體中文翻譯，並遵循 UDS 翻譯同步機制。

#### Scenario: 翻譯同步檢查
- **GIVEN** 英文版 skill 已建立
- **WHEN** 執行 `./scripts/check-translation-sync.sh`
- **THEN** 繁體中文翻譯存在且狀態為 `current`

## Acceptance Criteria

- **AC-1**: Given 使用者執行 `/adr`, when AI 引導完成, then 產生符合 REQ-3 模板的 ADR 文件
- **AC-2**: Given `docs/adr/` 中有多個 ADR, when 使用者執行 `/adr list`, then 列出所有 ADR 的編號、標題、狀態
- **AC-3**: Given 一個 Accepted 的 ADR, when 使用者執行 `/adr supersede`, then 舊 ADR 標記為 Superseded，新 ADR 建立
- **AC-4**: Given `core/adr-standards.md` 存在, when 執行 `check-standards-sync.sh`, then 通過檢查
- **AC-5**: Given 所有檔案已建立, when 執行 `check-translation-sync.sh`, then 翻譯同步通過
- **AC-6**: Given `/sdd` 流程中做了架構決策, when 決策有長期影響, then AI 建議建立對應 ADR

## Technical Design

### 檔案結構

```
新增檔案：
├── core/adr-standards.md                          # Core standard (universal)
├── skills/adr-assistant/
│   ├── SKILL.md                                   # Skill 定義 (universal)
│   └── guide.md                                   # 詳細指南
├── .claude/skills/adr-assistant/                   # Claude Code skill
│   └── instructions.md                            # 指令定義
├── locales/zh-TW/core/adr-standards.md            # Core 翻譯
├── locales/zh-TW/skills/adr-assistant/
│   ├── SKILL.md                                   # Skill 翻譯
│   └── guide.md                                   # Guide 翻譯
├── .standards/adr-standards.ai.yaml               # AI 標準 YAML
└── ai/standards/adr-standards.ai.yaml             # AI 標準（context-aware loading）
```

### Skill Frontmatter

```yaml
---
name: adr
scope: universal
description: |
  [UDS] Create, manage, and track Architecture Decision Records (ADR).
  Use when: architecture decisions, technology choices, design trade-offs.
  Keywords: ADR, architecture decision, decision record, 架構決策, 決策記錄.
---
```

### 與現有技能的關係

| 技能 | 關係 |
|------|------|
| `/sdd` | `/adr` 可從 `/sdd` 流程中觸發；ADR 在 Technical Design 中引用 |
| `/review` | Code review 時可引用相關 ADR 作為設計決策依據 |
| `/commit` | 重大架構變更的 commit 可引用 ADR 編號 |

## Test Plan

- [ ] `core/adr-standards.md` 內容完整性檢查（含所有必要章節）
- [ ] `skills/adr-assistant/SKILL.md` frontmatter 格式正確
- [ ] `/adr` 互動流程產生正確格式的 ADR
- [ ] `/adr list` 能列出所有 ADR
- [ ] `/adr supersede` 能正確更新狀態
- [ ] 翻譯同步：`check-translation-sync.sh` 通過
- [ ] 標準同步：`check-standards-sync.sh` 通過
- [ ] Scope 檢查：`check-scope-sync.sh` 通過
- [ ] 完整預發布檢查：`pre-release-check.sh` 通過

## Implementation Tasks

| # | 任務 | 相依 | 預估 |
|---|------|------|------|
| T1 | 撰寫 `core/adr-standards.md` | 無 | — |
| T2 | 撰寫 `skills/adr-assistant/SKILL.md` | T1 | — |
| T3 | 撰寫 `skills/adr-assistant/guide.md` | T1 | — |
| T4 | 建立 `.claude/skills/adr-assistant/instructions.md` | T2 | — |
| T5 | 建立 `.standards/adr-standards.ai.yaml` | T1 | — |
| T6 | 建立 `ai/standards/adr-standards.ai.yaml` | T5 | — |
| T7 | 繁體中文翻譯（core + skill） | T1-T3 | — |
| T8 | 更新相關索引與註冊檔 | T1-T6 | — |
| T9 | 執行同步檢查腳本驗證 | T1-T8 | — |

## References

- [TOGAF ADR](https://www.opengroup.org/togaf) — 架構決策記錄標準
- [Michael Nygard's ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — 原始 ADR 提案
- [MADR Template](https://adr.github.io/madr/) — Markdown ADR 模板
- ISO/IEC/IEEE 42010 — 架構描述標準
