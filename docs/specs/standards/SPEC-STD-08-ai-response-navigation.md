# [SPEC-STD-08] Feature: AI Response Navigation Standard

**Status**: Implemented

> **Language**: English | 繁體中文

## Metadata

```yaml
spec-id: SPEC-STD-08
title: AI Response Navigation Standard
status: Implemented
created: 2026-03-25
approved-date: 2026-03-25
approved-by: alberthsu
implemented-date: 2026-03-25
author: AI-assisted
scope: universal
parent: SPEC-STD-07  # 互補：STD-07 定義「執行行為」，STD-08 定義「回應導航」
sync-to:
  core-standard: done       # → core/ai-response-navigation.md ✅
  ai-yaml: done              # → .standards/ai-response-navigation.ai.yaml ✅
  skill: N/A                # 元標準，不需要獨立 Skill
  command: N/A              # 元標準，無對應命令
  translations: pending     # → locales/zh-TW/, locales/zh-CN/
```

## Overview | 概述

Define a standard for AI response navigation behavior: every substantive AI response MUST include contextual next-step suggestions with recommended options. This ensures users are continuously guided through development workflows without needing to memorize available commands.

定義 AI 回應導航行為標準：每個實質性的 AI 回應都必須包含情境化的下一步建議與推薦選項。確保使用者在開發工作流程中持續被引導，無需記憶所有可用命令。

## Motivation | 動機

### Problem | 問題

1. UDS 擁有 30+ 個斜線命令，使用者認知負擔高
2. 命令之間的銜接關係缺乏統一的導航機制
3. 現有約 20 個 Skill 有「下一步引導」區塊，但僅限 Skill 完成時觸發，且格式不完全一致
4. AI 的一般回應（非 Skill 執行）完全沒有導航提示
5. 使用者在完成一個步驟後常不知道下一步該做什麼，必須查閱文件

### Goal | 目標

讓 AI 在每次實質性回應後，都能根據情境提供結構化的下一步建議，並標記最推薦的選項及理由。適用於 UDS 支援的所有 9 種 AI 工具。

## Requirements | 需求

### REQ-001: Navigation Footer | 導航尾部區塊

每個實質性的 AI 回應 SHALL 在結尾包含一個「建議下一步」導航區塊。

#### Scenario: 實質性回應包含導航

- **GIVEN** AI 完成一個實質性回應（任務完成、分析結果、詢問使用者、錯誤說明等）
- **WHEN** 回應結束時
- **THEN** 回應 SHALL 包含以 `>` blockquote 格式的「建議下一步」區塊

#### Scenario: 極短確認回覆豁免

- **GIVEN** AI 的回應僅為極短確認（如「好的」「已完成」「了解」）
- **WHEN** 回應不構成獨立的邏輯回應單元
- **THEN** MAY 省略導航區塊

#### Scenario: 邏輯回應單元的判定

- **GIVEN** 需要判斷一個回應是否為「邏輯回應單元」
- **WHEN** 回應符合以下任一條件
- **THEN** 視為實質性回應，SHALL 包含導航：
  1. 完成了一項任務或子任務
  2. 提供了分析、解釋或建議
  3. 向使用者詢問問題或要求選擇
  4. 報告了錯誤或異常狀態
  5. 展示了程式碼變更結果

### REQ-002: Recommendation Marking | 推薦標記機制

當提供多個選項時，SHALL 標記最推薦的選項並附上理由。

#### Scenario: 多選項推薦標記

- **GIVEN** AI 提供 2 個以上的下一步選項
- **WHEN** 其中一個選項明顯較優
- **THEN** SHALL 使用 ⭐ **推薦** 標記該選項，並以 ` — ` 連接推薦理由

#### Scenario: 無明顯最佳選項

- **GIVEN** AI 提供多個選項
- **WHEN** 各選項無明顯優劣差異（取決於使用者偏好）
- **THEN** MAY 不標記推薦，但 SHOULD 說明各選項的適用場景

#### Scenario: 僅有單一建議

- **GIVEN** 情境明確，只有一個合理的下一步
- **WHEN** 產生導航區塊
- **THEN** MAY 直接建議該步驟，不需要推薦標記

### REQ-003: Contextual Templates | 情境模板

導航區塊 SHALL 依據回應類型使用對應的模板格式。

#### Scenario: 任務完成模板

- **GIVEN** AI 完成了一項任務（如 Skill 執行完畢、程式碼修改完成）
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用以下格式：

```markdown
> **建議下一步：**
> - 執行 `/command1` 描述 — 補充說明
> - 執行 `/command2` 描述 ⭐ **推薦** — 推薦理由
> - 執行 `/command3` 描述
```

#### Scenario: 使用者詢問模板

- **GIVEN** AI 需要使用者做出選擇或提供資訊
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用以下格式：

```markdown
> **請選擇：**
> - **(A) 選項描述** — 補充說明
> - **(B) 選項描述** ⭐ **推薦** — 推薦理由
> - **(C) 選項描述** — 補充說明
```

#### Scenario: 錯誤/失敗模板

- **GIVEN** AI 報告了錯誤或失敗狀態
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用以下格式：

```markdown
> **建議修復方向：**
> - 選項描述 ⭐ **推薦** — 推薦理由
> - 選項描述
```

#### Scenario: 進行中模板

- **GIVEN** AI 正在執行多步驟任務，完成了中間階段
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用以下格式：

```markdown
> **目前進度：[N/M]。下一步：**
> - 繼續執行下一階段 ⭐ **推薦**
> - 調整方向或參數
```

#### Scenario: 資訊回覆模板

- **GIVEN** AI 回覆了使用者的知識性問題或說明
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用以下格式：

```markdown
> **建議下一步：**
> - 深入了解 [相關主題]
> - 執行 `/command` 將知識應用到實作
```

### REQ-004: Adaptive Quantity | 彈性數量

選項數量 SHALL 依情境動態調整。

#### Scenario: 數量範圍

- **GIVEN** 需要決定導航選項的數量
- **WHEN** 依據回應的複雜度和情境
- **THEN** SHALL 遵循以下原則：

| 情境 | 建議數量 | 說明 |
|------|----------|------|
| 任務完成 | 2-3 個 | 後續工作流程步驟 |
| 使用者詢問 | 2-5 個 | 視問題複雜度調整 |
| 錯誤/失敗 | 1-3 個 | 修復方向 |
| 進行中 | 1-2 個 | 繼續或調整 |
| 資訊回覆 | 1-3 個 | 深入探索方向 |

#### Scenario: 上限規則

- **GIVEN** 產生導航選項
- **WHEN** 候選選項超過 5 個
- **THEN** SHALL 僅呈現前 5 個最相關的選項，避免選擇過載

### REQ-005: Slash Command Integration | 斜線命令整合

導航建議 SHOULD 優先引用 UDS 斜線命令（當適用時）。

#### Scenario: 有對應斜線命令

- **GIVEN** 下一步建議對應到一個已知的 UDS 斜線命令
- **WHEN** 產生導航區塊
- **THEN** SHALL 使用 `` `/command` `` 格式引用，讓使用者可直接複製執行

#### Scenario: 無對應斜線命令

- **GIVEN** 下一步建議是一般操作（如「檢查測試結果」「閱讀文件」）
- **WHEN** 不存在對應的斜線命令
- **THEN** SHALL 用自然語言描述操作步驟

### REQ-006: Tool-Agnostic Definition | 工具無關定義

此標準 SHALL 以工具無關的方式定義，適用於所有 UDS 支援的 AI 工具。

#### Scenario: 跨工具一致性

- **GIVEN** 此標準被不同 AI 工具（Claude Code、Cursor、Windsurf、Copilot 等）讀取
- **WHEN** AI 工具產生回應
- **THEN** 導航行為 SHALL 一致，但渲染格式 MAY 依工具特性調整

#### Scenario: YAML 規則定義

- **GIVEN** 需要讓各 AI 工具讀取此標準
- **WHEN** 建立 AI 可讀規則
- **THEN** SHALL 使用 `.ai.yaml` 格式定義，放置於 `.standards/` 目錄

### REQ-007: Skill Next-Steps Unification | Skill 下一步統一

現有 Skill 的「下一步引導」區塊 SHALL 改為引用本標準的格式模板。

#### Scenario: 現有 Skill 格式統一

- **GIVEN** 一個已有 `## 下一步引導` / `## Next Steps Guidance` 區塊的 Skill
- **WHEN** 套用本標準
- **THEN** SHALL：
  1. 保留 Skill 特有的場景化建議內容
  2. 格式改為符合 REQ-003 定義的模板
  3. 加入推薦標記（REQ-002）

#### Scenario: 未有下一步區塊的 Skill

- **GIVEN** 一個沒有「下一步引導」區塊的 Skill
- **WHEN** 套用本標準
- **THEN** SHOULD 補充 `## Next Steps Guidance | 下一步引導` 區塊

## Acceptance Criteria | 驗收標準

- AC-1: Given 新的 Core Standard `ai-response-navigation.md`, When 讀者閱讀它, Then 能理解 5 種情境模板的格式和使用時機
- AC-2: Given 推薦標記規則, When AI 提供多選項, Then 最佳選項有 ⭐ 標記且附有理由
- AC-3: Given 極短確認回覆, When AI 回應「好的」, Then 不會強制附加導航區塊
- AC-4: Given 任務完成情境, When AI 完成 `/sdd` 執行, Then 導航區塊包含 2-3 個後續步驟建議
- AC-5: Given 使用者詢問情境, When AI 需要使用者做選擇, Then 使用「請選擇」模板並帶有推薦標記
- AC-6: Given `.ai.yaml` 規則檔, When 被 Claude Code、Cursor、Windsurf 等工具讀取, Then 導航行為一致
- AC-7: Given 現有 20+ 個 Skill 的「下一步引導」區塊, When 套用新標準, Then 格式統一且保留原有場景化內容

## Technical Design | 技術設計

### Deliverables | 交付物

| # | 交付物 | 路徑 | 說明 |
|---|--------|------|------|
| 1 | Core Standard | `core/ai-response-navigation.md` | 定義 AI 回應導航行為的通用標準 |
| 2 | AI YAML | `.standards/ai-response-navigation.ai.yaml` | AI 可讀的規則定義 |
| 3 | Skill 格式統一 | `skills/*/SKILL.md` | 現有下一步區塊格式對齊 |
| 4 | 翻譯 | `locales/zh-TW/`, `locales/zh-CN/` | 雙語翻譯 |

### Architecture | 架構

```
core/ai-response-navigation.md           ← 新 Core Standard
    │
    ├── .standards/ai-response-navigation.ai.yaml  ← AI 可讀規則
    │
    ├── Relationship to ai-command-behavior.md:
    │   ai-command-behavior  = HOW AI executes commands (行為結構)
    │   ai-response-navigation = WHAT AI suggests after responding (導航行為)
    │
    ├── skills/*/SKILL.md                 ← 統一「下一步引導」格式
    │   ├── brainstorm-assistant/SKILL.md
    │   ├── spec-driven-dev/SKILL.md
    │   ├── tdd-assistant/SKILL.md
    │   └── ... (20+ Skills)
    │
    └── integrations/*/                   ← 各 AI 工具引用
        ├── claude-code/
        ├── cursor/
        └── windsurf/
```

### Response Type Detection Logic | 回應類型偵測邏輯

```
AI 產生回應
    │
    ├─ 長度 < 閾值 且 純確認語句？ → 豁免，不附導航
    │
    └─ 實質性回應 → 偵測類型：
        ├─ 任務/子任務完成？     → 任務完成模板
        ├─ 需要使用者選擇/輸入？ → 使用者詢問模板
        ├─ 報告錯誤/異常？       → 錯誤/失敗模板
        ├─ 多步驟中間階段？      → 進行中模板
        └─ 知識/說明性回覆？     → 資訊回覆模板
```

### Format Specification | 格式規範

**導航區塊統一使用 Markdown blockquote (`>`)：**

```markdown
> **[標題]：**
> - [選項/建議] ⭐ **推薦** — [理由]
> - [選項/建議] — [補充說明]
```

**標題依情境變化：**

| 情境 | 標題 |
|------|------|
| 任務完成 | `建議下一步` |
| 使用者詢問 | `請選擇` |
| 錯誤/失敗 | `建議修復方向` |
| 進行中 | `目前進度：[N/M]。下一步` |
| 資訊回覆 | `建議下一步` |

## Test Plan | 測試計畫

- [ ] Core Standard 文件完整性：包含 5 種情境模板的定義和範例
- [ ] 推薦標記範例：至少包含 3 個推薦標記的使用範例
- [ ] 豁免規則範例：至少包含 2 個極短回覆的豁免範例
- [ ] 跨工具一致性：`.ai.yaml` 可被各工具整合讀取
- [ ] Skill 相容性：至少抽樣 5 個現有 Skill 驗證格式對齊
- [ ] 與 STD-07 互補性：確認不與 `ai-command-behavior.md` 衝突或重疊

## Rollout Plan | 部署計畫

| 階段 | 範圍 | 驗證方式 |
|------|------|---------|
| Phase 1 | Core Standard + AI YAML | AC-1, AC-2, AC-3, AC-6 |
| Phase 2 | 現有 Skill 下一步格式統一（20+ 檔案） | AC-7 |
| Phase 3 | Integration 更新（9 種 AI 工具） | AC-6 |
| Phase 4 | 翻譯同步 | check-translation-sync.sh |

## Sync Checklist | 同步檢查清單

### From Core Standard
- [ ] AI YAML created? → pending (`ai-response-navigation.ai.yaml`)
- [ ] Skill next-steps unified? → pending (20+ files)
- [ ] Integrations updated? → pending (9 tools)
- [ ] Translations synced? → pending (zh-TW, zh-CN)

## Discussion Notes | 討論紀錄

### Design Decisions（2026-03-25）

1. **與 STD-07 的關係**：互補而非擴展。STD-07 定義「AI 如何執行命令」，STD-08 定義「AI 回應後如何導航」
2. **Skill 下一步區塊**：保留場景化內容，格式改為引用本標準的模板（決策 1：C）
3. **標準層級**：新增獨立 Core Standard（決策 2：A）
4. **觸發範圍**：每個「邏輯回應單元」都要，排除極短確認（決策 3：B）
5. **適用範圍**：UDS 支援的所有 9 種 AI 工具
6. **來源**：從腦力激盪報告整合而來，結合推薦標記、Response Footer、情境模板、漸進式建議、工具無關格式 5 個想法

### Scope Lock

**In Scope:**
- 新 Core Standard `ai-response-navigation.md`
- 新 AI YAML `.standards/ai-response-navigation.ai.yaml`
- 5 種情境模板定義
- 推薦標記機制
- 彈性數量規則
- 邏輯回應單元豁免規則

**Out of Scope（deferred）:**
- 現有 Skill 下一步區塊批量統一（Phase 2）
- Integration 更新（Phase 3）
- 翻譯同步（Phase 4）
- 命令關聯圖譜（腦力激盪排名第 7，未來迭代）
- 防錯導航（腦力激盪排名第 8，未來迭代）
- 使用者熟練度動態調整（需更多研究）
