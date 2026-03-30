# [SPEC-RETRO-001] Feature: Retrospective Skill

- **Status**: Archived
- **Created**: 2026-03-26
- **Author**: AI-assisted
- **Priority**: High
- **Scope**: universal

## Overview

新增 `/retrospective` 技能與 `core/retrospective-standards.md` 核心標準，引導團隊在迭代或發布結束後進行結構化回顧，識別改善機會並追蹤行動項目的落實。填補 UDS 在持續改善循環方面的缺口，對應 Scrum Sprint Retrospective 和 CMMI Level 3 的組織過程改善。

## Motivation

### 問題陳述

目前 UDS 的改善機制存在以下缺口：
1. **無計劃性回顧** — `/incident` 只在事故後觸發，缺少主動定期的流程檢討
2. **改善行動無追蹤** — 即使發現問題，也沒有系統化追蹤改善措施是否落實
3. **經驗散落** — 團隊的學習心得未被系統化收集和累積
4. **國際標準缺口** — Scrum Guide 要求 Sprint Retrospective，CMMI Level 3 要求組織過程改善

### 與現有技能的區分

| 技能 | 觸發時機 | 焦點 |
|------|---------|------|
| `/incident` | 事故後（被動） | 根因分析、防止再發 |
| `/metrics` | 隨時（數據導向） | 量化指標和趨勢 |
| `/retrospective` | 迭代/發布結束（主動） | 流程改善、團隊學習 |

## Requirements

### REQ-1: Core Standard — 回顧標準文件

系統 SHALL 提供 `core/retrospective-standards.md` 作為語言無關、框架無關的回顧核心標準。

#### Scenario: 使用者查閱回顧標準
- **GIVEN** 使用者想了解回顧的格式與流程
- **WHEN** 使用者閱讀 `core/retrospective-standards.md`
- **THEN** 應看到回顧模板、引導技法、行動項目追蹤機制

### REQ-2: Sprint 回顧引導

系統 SHALL 提供 Sprint 回顧的互動式引導流程。

#### Scenario: 執行 Sprint 回顧
- **GIVEN** 使用者執行 `/retrospective` 或 `/retrospective sprint`
- **WHEN** AI 助手引導 What went well / What to improve / Action items 流程
- **THEN** 產生結構化的回顧報告，包含可追蹤的行動項目

#### Scenario: 使用特定引導技法
- **GIVEN** 使用者執行 `/retrospective --technique starfish`
- **WHEN** AI 助手使用指定的回顧技法（如海星法、4Ls、帆船法）
- **THEN** 按照該技法的結構引導討論並產生報告

### REQ-3: Release 回顧引導

系統 SHALL 提供 Release 回顧的互動式引導流程。

#### Scenario: 執行 Release 回顧
- **GIVEN** 使用者執行 `/retrospective release`
- **WHEN** AI 助手蒐集 git log、metrics 資料並引導回顧
- **THEN** 產生涵蓋目標達成度、流程效率、品質指標的回顧報告

### REQ-4: 行動項目追蹤

系統 SHALL 支援回顧行動項目的追蹤機制。

#### Scenario: 建立行動項目
- **GIVEN** 回顧過程中識別了改善機會
- **WHEN** AI 助手建立行動項目
- **THEN** 每個行動項目包含：描述、負責人、預計完成日、狀態

#### Scenario: 檢視行動項目進度
- **GIVEN** 使用者執行 `/retrospective actions`
- **WHEN** AI 助手搜尋歷次回顧報告
- **THEN** 列出所有未完成的行動項目及其狀態

### REQ-5: 回顧報告存檔

系統 SHALL 將回顧報告存檔為結構化文件。

#### Scenario: 回顧報告存檔
- **GIVEN** 回顧流程完成
- **WHEN** AI 助手產生報告
- **THEN** 報告存放於 `docs/retrospectives/` 目錄，命名為 `RETRO-YYYY-MM-DD-[type].md`

### REQ-6: 翻譯與同步

系統 SHALL 提供繁體中文與簡體中文翻譯。

#### Scenario: 翻譯同步檢查
- **GIVEN** 英文版 skill 已建立
- **WHEN** 執行 `check-translation-sync.sh`
- **THEN** 翻譯存在且狀態為 `current`

## Acceptance Criteria

- **AC-1**: Given 使用者執行 `/retrospective`, when AI 引導完成, then 產生結構化回顧報告
- **AC-2**: Given 使用者指定技法 `--technique starfish`, when 引導完成, then 報告使用海星法結構
- **AC-3**: Given 使用者執行 `/retrospective release`, when 引導完成, then 報告包含 git/metrics 數據
- **AC-4**: Given 回顧產生行動項目, when 執行 `/retrospective actions`, then 列出所有未完成項目
- **AC-5**: Given 回顧完成, when 報告存檔, then 檔案在 `docs/retrospectives/` 且命名正確
- **AC-6**: Given 所有檔案已建立, when 執行同步檢查腳本, then 全部通過

## Technical Design

### 回顧模板

```markdown
# 回顧報告：[Sprint N / Release vX.Y.Z]

- **Type**: [Sprint | Release]
- **Date**: YYYY-MM-DD
- **Participants**: [team members]
- **Technique**: [Start-Stop-Continue | Starfish | 4Ls | Sailboat]

## What Went Well | 做得好的
- [item 1]
- [item 2]

## What to Improve | 需改善的
- [item 1]
- [item 2]

## Action Items | 行動項目
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | [description] | [person] | YYYY-MM-DD | Open |
| 2 | [description] | [person] | YYYY-MM-DD | Open |

## Metrics Summary | 指標摘要（Release 回顧）
- Velocity: [points/stories]
- Bug Rate: [N bugs / release]
- Test Coverage: [%]
- Cycle Time: [days]

## Key Learnings | 關鍵學習
- [learning 1]
- [learning 2]
```

### 引導技法

| 技法 | 適用場景 | 結構 |
|------|---------|------|
| **Start-Stop-Continue** | 預設、快速 | 開始做 / 停止做 / 繼續做 |
| **Starfish** | 更細緻 | 更多 / 保持 / 減少 / 開始 / 停止 |
| **4Ls** | 情感面 | Liked / Learned / Lacked / Longed for |
| **Sailboat** | 視覺化 | 風（推力）/ 錨（阻力）/ 礁石（風險）/ 島嶼（目標）|

### 檔案結構

```
新增檔案：
├── core/retrospective-standards.md                    # Core standard (universal)
├── skills/retrospective-assistant/
│   ├── SKILL.md                                       # Skill 定義
│   └── guide.md                                       # 詳細指南
├── .claude/skills/retrospective-assistant/
│   ├── SKILL.md                                       # Claude Code skill (zh-TW)
│   └── guide.md                                       # Claude Code guide (zh-TW)
├── .standards/retrospective-standards.ai.yaml         # AI 標準
├── ai/standards/retrospective-standards.ai.yaml       # AI 標準 (context-aware)
├── locales/zh-TW/core/retrospective-standards.md      # 繁中翻譯
├── locales/zh-TW/skills/retrospective-assistant/
│   ├── SKILL.md
│   └── guide.md
├── locales/zh-CN/core/retrospective-standards.md      # 簡中翻譯
├── locales/zh-CN/skills/retrospective-assistant/
│   ├── SKILL.md
│   └── guide.md
```

### 與現有技能的整合

| 技能 | 整合方式 |
|------|---------|
| `/metrics` | 回顧時自動引用最近的指標數據 |
| `/incident` | 事故後可建議進行團隊回顧 |
| `/commit` | 提交回顧報告時使用 `docs(retro):` type |
| `/adr` | 回顧中若識別架構問題，建議建立 ADR |

### 存放慣例

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # 回顧索引（可選）
```

## Test Plan

- [ ] `core/retrospective-standards.md` 內容完整性
- [ ] `skills/retrospective-assistant/SKILL.md` frontmatter 正確
- [ ] `/retrospective` Sprint 回顧流程產生正確報告
- [ ] `/retrospective release` 包含指標摘要
- [ ] `/retrospective --technique starfish` 使用正確結構
- [ ] `/retrospective actions` 列出未完成行動項目
- [ ] 翻譯同步：`check-translation-sync.sh` 通過
- [ ] 標準同步：`check-standards-sync.sh` 通過
- [ ] 快速測試：`npm run test:quick` 通過

## Implementation Tasks

| # | 任務 | 相依 |
|---|------|------|
| T1 | 撰寫 `core/retrospective-standards.md` | 無 |
| T2 | 撰寫 `skills/retrospective-assistant/SKILL.md` | T1 |
| T3 | 撰寫 `skills/retrospective-assistant/guide.md` | T1 |
| T4 | 建立 `.claude/skills/retrospective-assistant/` | T2 |
| T5 | 建立 `.standards/retrospective-standards.ai.yaml` | T1 |
| T6 | 建立 `ai/standards/retrospective-standards.ai.yaml` | T5 |
| T7 | 翻譯（zh-TW + zh-CN） | T1-T3 |
| T8 | 更新索引與註冊檔 | T1-T6 |
| T9 | 執行同步檢查驗證 | T1-T8 |

## References

- [Scrum Guide — Sprint Retrospective](https://scrumguides.org/)
- CMMI Level 3 — Organizational Process Improvement
- ISO/IEC 12207 §6.3.6 — Improvement Process
- [Fun Retrospectives](https://www.funretrospectives.com/) — 技法參考
