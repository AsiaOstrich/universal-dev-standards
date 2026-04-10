---
source: ../../../../skills/process-automation/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 識別重複流程並以正確開發深度建立 Skill"
name: process-to-skill
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
scope: universal
argument-hint: "[process description | 流程描述]"
---

# 流程轉化 Skill 助手

> **語言**: [English](../../../../skills/process-automation/SKILL.md) | 繁體中文

從「我一直在手動做這件事」引導你建立一個合適的 Skill，並在過程中採用恰當深度的開發流程。

## 使用時機

- 你已手動執行同一組多步驟流程 ≥ 3 次
- 隊友第 3 次問「我們怎麼做 X？」
- 你臨時建了一個 Skill，想要正式化它

## 核心原則

> **Skill 記錄流程知識。Memory 記錄歷史事實。**
> 當你發現自己在重複執行相同步驟時，那就是 Skill 候選。

## 決策樹

```
需要新 Skill？
├── 修改現有 Skill？
│     → Delta 路徑：在現有 SKILL.md 末尾附加 ## MODIFIED / ## ADDED
│                   更新 version 欄位 → 完成
│
├── 回答這 4 個問題（任何一個「是」→ Complex）：
│     1. 超過 7 個步驟？
│     2. 步驟之間有分支邏輯（if/else）？
│     3. 需要來自 3 個以上獨立標準/決策的知識？
│     4. 輸出直接影響子專案的原始碼？
│
├── 全部「否」→ Simple 路徑
│     → 填寫 Skill Brief（templates/SKILL-BRIEF-TEMPLATE.md）
│     → 直接建立 SKILL.md（不需要 XSPEC）
│
└── 任何「是」→ Complex 路徑
      → 先建立 XSPEC → 執行 /sdd
      → XSPEC 核准後回到這裡

廢棄 Skill？
  → 在 SKILL.md frontmatter 加入：
      status: deprecated
      deprecated_at: YYYY-MM-DD
      deprecated_reason: "..."
      superseded_by: "/new-skill"   （如有適用）
  → 在 SKILL-CANDIDATES.md 中標記為已歸檔
```

## 放置位置決策

建立 SKILL.md 前，先決定它應放在哪裡：

| 條件 | 放置位置 |
|------|----------|
| 步驟引用專案特定路徑（如 TECH-RADAR.md、DEC-*.md） | 專案：`{project}/.claude/skills/` |
| 步驟通用（無專案特定路徑） | UDS：`skills/{name}/` + zh-TW 語系 |

## 工作流程

### 步驟 1 — 描述流程

記錄重複的步驟序列：
- 哪些步驟？按什麼順序？
- 目前已手動執行幾次？
- 會觸碰哪些工具或檔案？

### 步驟 2 — 更新 SKILL-CANDIDATES.md

開啟你專案的 `SKILL-CANDIDATES.md`（第一次使用時從 `templates/SKILL-CANDIDATES.md` 複製）：
- 尚未記錄 → 新增一行，填入目前次數
- 已記錄 → 更新次數
- 次數達 3 → 標記觸發 ✅，繼續進行

### 步驟 3 — 選擇路徑（Simple / Complex / Delta）

回答 4 個判斷問題，決定：Simple、Complex 或 Delta。

### 步驟 4a — Simple：填寫 Skill Brief

使用 `templates/SKILL-BRIEF-TEMPLATE.md`：
- 觸發情境（什麼時候會用這個？）
- 核心步驟（3~7 個，有序）
- 驗收條件（2~3 條）
- 不涵蓋的部分（明確邊界）

### 步驟 4b — Complex：建立 XSPEC

執行 `/sdd` 建立 XSPEC。XSPEC 核准後回到步驟 5。

### 步驟 4c — Delta：識別變更範圍

識別現有 SKILL.md 中哪些區段需要變更。
在末尾加入 `## MODIFIED Requirements` 或 `## ADDED Requirements`。

### 步驟 5 — 建立 / 更新 SKILL.md

從 Brief 或 XSPEC 產生 SKILL.md：
- 驗證 frontmatter：`name`、`scope`、`description`、`allowed-tools`
- UDS Skill：同時建立 zh-TW 語系版本
- 專案 Skill：放置於 `{project}/.claude/skills/{name}/SKILL.md`

### 步驟 6 — 更新 SKILL-CANDIDATES.md

標記候選行：觸發 ✅，Skill 欄位填入名稱。

### 步驟 7 — Commit

```
feat(skills): Add /{skill-name} skill. 新增 /{skill-name} Skill。

{English description, 1-2 lines}

{Chinese description, 1-2 lines}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 輸出檢查清單

完成所有步驟後，驗證：

- [ ] `SKILL-CANDIDATES.md` 已更新（觸發 ✅，Skill 名稱已填入）
- [ ] `SKILL.md` 已建立，含完整 frontmatter（`name`/`scope`/`description`/`allowed-tools`）
- [ ] Simple 路徑：Skill Brief 已被引用或保存
- [ ] Complex 路徑：XSPEC ID 已在 SKILL.md 標頭注釋中標註
- [ ] UDS Skill：zh-TW 語系檔案已建立
- [ ] 廢棄：frontmatter 中含 `status: deprecated`
- [ ] git commit 已完成

## 參考

- Skill Brief 模板：[templates/SKILL-BRIEF-TEMPLATE.md](../../../../templates/SKILL-BRIEF-TEMPLATE.md)
- 候選追蹤：[templates/SKILL-CANDIDATES.md](../../../../templates/SKILL-CANDIDATES.md)（複製到你的專案）
- ADR 標準：[core/adr-standards.md](../../../../core/adr-standards.md)
