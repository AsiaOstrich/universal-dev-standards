# [SPEC-STD-07] Feature: AI Command Behavior Standards

**Status**: Archived

> **Language**: English | 繁體中文

## Metadata

```yaml
spec-id: SPEC-STD-07
title: AI Command Behavior Standards
status: Archived
created: 2026-03-24
approved-date: 2026-03-24
approved-by: alberthsu
implemented-date: 2026-03-24
verified-date: 2026-03-24
archived-date: 2026-03-24
author: AI-assisted
scope: universal
sync-to:
  core-standard: pending   # → core/ai-command-behavior.md
  skill: N/A               # 本身是元標準，不需要 Skill
  command: N/A              # 元標準，無對應命令
  translations: pending     # → locales/zh-TW/, locales/zh-CN/
```

## Overview | 概述

Define a standard structure for specifying AI Agent runtime behavior in command/skill definition files. Currently, commands define "what" to do but lack "how" the AI should interact with the user — leading to inconsistent behavior across different AI implementations.

定義一套標準結構，用於在命令/技能定義檔案中規範 AI Agent 的運行時行為。目前命令定義了「做什麼」但缺乏「AI 如何與使用者互動」的規範——導致不同 AI 實作間行為不一致。

## Motivation | 動機

### Problem | 問題

1. 35 個命令中僅 7 個有完整的 AI 行為定義（20%）
2. 使用者下達 `/sdd`（無參數）時，AI 行為不可預測
3. 同一命令在不同 session 中可能產生截然不同的互動體驗
4. 缺乏「何時等待使用者確認」的明確定義，導致 AI 可能過度自動化或過度詢問

### Goal | 目標

讓任何 AI Agent 讀到命令定義後，都能產生一致、可預測的互動行為。

## Requirements | 需求

### REQ-001: AI Behavior Section Structure | AI 行為區段結構

命令定義檔案 SHALL 包含 `## AI Agent Behavior` 區段，內含以下四個子區段。

#### Scenario: 完整的 AI 行為區段

- **GIVEN** 一個命令定義檔案（`skills/commands/*.md`）
- **WHEN** 該命令需要 AI 與使用者互動
- **THEN** 檔案 SHALL 包含以下結構：

```markdown
## AI Agent Behavior | AI 代理行為

### Entry Router | 進入路由
（定義無參數、有參數、有子命令時的行為）

### Interaction Script | 互動腳本
（定義逐步行為、資訊收集、輸出格式）

### Stop Points | 停止點
（定義哪些時刻必須等待使用者確認）

### Error Handling | 錯誤處理
（定義前置條件不滿足、異常狀態的處理）
```

### REQ-002: Entry Router | 進入路由

Entry Router SHALL 使用決策表格式，精確定義每種呼叫方式對應的 AI 行為。

#### Scenario: 決策表格式

- **GIVEN** 一個支援多種呼叫方式的命令
- **WHEN** 定義 Entry Router
- **THEN** SHALL 使用以下格式：

```markdown
| Input | AI Action |
|-------|-----------|
| `/cmd` | [具體行為描述] |
| `/cmd <name>` | [具體行為描述] |
| `/cmd <phase>` | [具體行為描述] |
| `/cmd <phase> <target>` | [具體行為描述] |
```

#### Scenario: 簡單命令的進入路由

- **GIVEN** 一個只有一種呼叫方式的命令（如 `/commit`）
- **WHEN** 定義 Entry Router
- **THEN** 可以用一句話描述，不需要完整決策表

### REQ-003: Interaction Script | 互動腳本

Interaction Script SHALL 定義 AI 的逐步行為，使用「混合精細度」策略。

#### Scenario: 關鍵決策點精細定義

- **GIVEN** 一個需要多步互動的命令
- **WHEN** 存在影響後續流程的決策點
- **THEN** 該決策點 SHALL 使用精確的條件-行為格式：

```markdown
**Decision: [決策名稱]**
- IF [條件A] → [具體行為]
- IF [條件B] → [具體行為]
- ELSE → [預設行為]
```

#### Scenario: 一般步驟指引式定義

- **GIVEN** 不涉及關鍵決策的一般步驟
- **WHEN** 定義互動腳本
- **THEN** SHOULD 使用編號清單描述，允許 AI 彈性執行

### REQ-004: Stop Points | 停止點

Stop Points SHALL 明確標記 AI 必須暫停等待使用者確認的時刻。

#### Scenario: 停止點標記格式

- **GIVEN** 一個多步驟的命令工作流程
- **WHEN** 存在需要使用者確認的步驟
- **THEN** SHALL 使用以下格式標記：

```markdown
🛑 **STOP**: [描述] — 等待使用者確認後再繼續
```

#### Scenario: 預設停止原則

- **GIVEN** 命令定義未明確標記停止點
- **WHEN** AI 執行到以下情境
- **THEN** SHALL 預設停止：
  1. 即將寫入檔案（create/modify）
  2. 即將執行不可逆操作（git commit, delete）
  3. 完成一個完整階段（phase completion）
  4. 需要使用者提供額外資訊

### REQ-005: Error Handling | 錯誤處理

Error Handling SHALL 定義前置條件不滿足時的 AI 行為。

#### Scenario: 前置條件失敗

- **GIVEN** 一個有前置條件的命令
- **WHEN** 前置條件檢查失敗
- **THEN** AI SHALL：
  1. 說明哪個前置條件未滿足
  2. 引導使用者到正確的命令/步驟
  3. 不得靜默跳過或自動修復（除非定義中明確允許）

#### Scenario: 非預期狀態

- **GIVEN** AI 執行中遇到非預期狀態
- **WHEN** 無法判斷正確行為
- **THEN** AI SHALL 停止並詢問使用者，而非猜測

### REQ-006: Granularity Guideline | 精細度指引

命令行為定義 SHALL 遵循「混合精細度」原則。

#### Scenario: 精細度選擇

- **GIVEN** 需要定義命令的 AI 行為
- **WHEN** 決定描述的精細程度
- **THEN** SHALL 依據以下原則：

| 元素 | 精細度 | 理由 |
|------|--------|------|
| Entry Router | 精確 | 進入行為必須確定性 |
| Stop Points | 精確 | 等待點不能模糊 |
| Interaction Script | 指引式 | AI 需要彈性處理對話 |
| Error Handling | 原則式 | 錯誤情境太多，定義原則即可 |

### REQ-007: Applicability Rule | 適用規則

並非所有命令都需要完整的 AI 行為定義。

#### Scenario: 判斷是否需要 AI 行為區段

- **GIVEN** 一個命令定義檔案
- **WHEN** 評估是否需要 `## AI Agent Behavior` 區段
- **THEN** 依據以下決策：

| 條件 | 需要完整定義 | 說明 |
|------|-------------|------|
| 多階段工作流程 | ✅ 是 | 如 `/sdd`, `/tdd`, `/bdd` |
| 多種呼叫方式 | ✅ 是 | 如 `/sdd discuss`, `/sdd create` |
| 單一明確動作 | ❌ 否 | 如 `/commit`（已夠明確） |
| 純資訊查詢 | ❌ 否 | 如 `/guide`, `/docs` |

## Acceptance Criteria | 驗收標準

- AC-1: Given 一個新的 Core Standard 檔案 `ai-command-behavior.md`, When 讀者閱讀它, Then 能理解四個行為區段的用途和格式
- AC-2: Given `/sdd` 命令定義, When 套用新標準補強 AI 行為, Then 6 個子階段都有明確的 Entry Router、Interaction Script、Stop Points、Error Handling
- AC-3: Given 補強後的 `/sdd` 命令, When AI Agent 收到 `/sdd`（無參數）, Then 行為可預測且一致
- AC-4: Given 補強後的 `/sdd` 命令, When AI Agent 收到 `/sdd implement`, Then 知道何時自動執行、何時等待確認
- AC-5: Given 新標準, When 評估現有 Excellent 命令（如 `/commit`）, Then 這些命令隱含地符合標準，不需改寫
- AC-6: Given 新標準的適用規則（REQ-007）, When 評估純查詢命令（如 `/guide`）, Then 不強制要求完整行為定義

## Technical Design | 技術設計

### Deliverables | 交付物

| # | 交付物 | 路徑 | 說明 |
|---|--------|------|------|
| 1 | Core Standard | `core/ai-command-behavior.md` | 定義 AI 命令行為結構的通用標準 |
| 2 | `/sdd` 補強 | `skills/commands/sdd.md` | 第一個套用新標準的命令 |

### Architecture | 架構

```
core/ai-command-behavior.md          ← 新 Core Standard（通用規範）
    │
    ├── skills/commands/sdd.md       ← 第一個套用（本 spec）
    ├── skills/commands/derive-*.md  ← 後續批次 2
    ├── skills/commands/reverse-*.md ← 後續批次 3
    └── skills/commands/*.md         ← 後續批次 4
```

### Relationship to Existing Standards | 與現有標準的關係

| 標準 | 關係 |
|------|------|
| `ai-instruction-standards.md` | 互補：instruction 定義「檔案結構」，behavior 定義「runtime 行為」 |
| `ai-agreement-standards.md` | 互補：agreement 定義「AI 與人的協議」，behavior 定義「AI 收到命令後的動作」 |

## Test Plan | 測試計畫

- [ ] Core Standard 文件完整性：包含所有 4 個行為區段的定義和範例
- [ ] `/sdd` 補強完整性：6 個子階段 × 4 個行為區段 = 24 個定義點
- [ ] 相容性檢查：`/commit` 隱含符合新標準
- [ ] 適用性檢查：`/guide` 不被強制要求完整定義

## Rollout Plan | 部署計畫

| 階段 | 範圍 | 驗證方式 |
|------|------|---------|
| Phase 1 | Core Standard + `/sdd` 補強 | 本 spec 的 AC 驗證 |
| Phase 2 | `/derive-*` 系列（5 個） | 範本適用性驗證 |
| Phase 3 | `/reverse-*` 系列（4 個） | 範本適用性驗證 |
| Phase 4 | 其餘命令 | 批量套用 |

## Sync Checklist | 同步檢查清單

### From Core Standard
- [ ] Skill created/updated? → N/A（元標準）
- [ ] Command created? → N/A（元標準）
- [ ] Translations synced? → pending

### From `/sdd` 補強
- [ ] Core Standard exists? → pending（本 spec 建立）
- [ ] Translations synced? → pending

## Discussion Notes | 討論紀錄

### Scope Lock（2026-03-24）

**In Scope:**
- 新 Core Standard `ai-command-behavior.md`
- `/sdd` 命令的 AI 行為補強（含 6 個子階段）
- 適用規則定義（哪些命令需要、哪些不需要）

**Out of Scope（deferred）:**
- 其他 28 個命令的補強（Phase 2-4）
- 自動化檢查腳本（`check-command-behavior.sh`）
- `/sdd-retro` 補強（雖為 P0，但另開 spec）

### Key Decisions

1. **統一結構 4 區段**：Entry Router / Interaction Script / Stop Points / Error Handling
2. **混合精細度**：Entry Router 和 Stop Points 精確，Interaction Script 和 Error Handling 指引式
3. **不回溯改寫已 Excellent 的命令**
4. **Scope: universal** — 適用於任何使用 AI 命令的專案
