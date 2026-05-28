---
name: skill-builder
source: ../../../../skills/skill-builder/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-28
scope: universal
description: "[UDS] 識別重複流程並以正確開發深度建立 Skill"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "[流程描述]"
---

# 流程轉 Skill 助手

> **語言**: [English](../../../../skills/skill-builder/SKILL.md) | 繁體中文

引導你從「我一直手動做這件事」走到「擁有一個正確建立的 Skill」，並在過程中保持適量的流程治理。

## 何時使用

- 你已經用同樣的多步驟流程手動執行 ≥ 3 次
- 同事第 3 次問你「我們是怎麼做 X 的？」
- 你臨時建了一個 Skill，現在想將其正式化

> **備註**：`/process-to-skill` 是本 Skill 的繁體中文翻譯版，功能完全相同。

## 核心原則

> Skill 紀錄的是**流程知識**。Memory 紀錄的是歷史事實。
> 當你注意到自己重複執行相同的步驟，那就是 Skill 候選。

## 決策樹

```
需要新建 Skill？
├── 修改現有 Skill？
│     → Delta 路徑：在現有 SKILL.md 後附加 ## MODIFIED / ## ADDED
│                   更新 version 欄位 → 完成
│
├── 回答這 4 個問題（任一「是」→ Complex）：
│     1. 超過 7 個步驟？
│     2. 步驟之間有分支邏輯（if / else）？
│     3. 需要 3+ 不同標準／決策的知識？
│     4. 輸出會直接影響子專案原始碼？
│
├── 全部「否」→ Simple 路徑
│     → 填寫 Skill Brief（templates/SKILL-BRIEF-TEMPLATE.md）
│     → 直接建立 SKILL.md（無需 XSPEC）
│
└── 任一「是」→ Complex 路徑
      → 先建立 XSPEC → 執行 /sdd
      → XSPEC Approved 後回到此處

棄用 Skill？
  → 在 SKILL.md frontmatter 加入：
      status: deprecated
      deprecated_at: YYYY-MM-DD
      deprecated_reason: "..."
      superseded_by: "/new-skill"   (若適用)
  → 在 SKILL-CANDIDATES.md 標記為已封存
```

## 擺放位置決策

建立 SKILL.md 前，先決定它該放在哪裡：

| 條件 | 擺放位置 |
|------|----------|
| 步驟引用專案特定路徑（如 TECH-RADAR.md、DEC-*.md） | 專案：`{project}/.claude/skills/` |
| 步驟為通用流程（無專案特定路徑） | UDS：`skills/{name}/` + zh-TW locale |

## 工作流程

### Step 1 — 描述流程

捕捉重複的步驟序列：
- 哪些步驟？依什麼順序？
- 目前手動執行過幾次？
- 觸及哪些工具或檔案？

### Step 2 — 更新 SKILL-CANDIDATES.md

打開專案的 `SKILL-CANDIDATES.md`（首次請從 `templates/SKILL-CANDIDATES.md` 複製）：
- 尚未記錄 → 新增一列，填入當前次數
- 已記錄 → 增加次數
- 次數達 3 → 標記 trigger ✅，繼續執行

### Step 3 — 選擇路徑（Simple / Complex / Delta）

回答 4 個判斷問題，決定：Simple、Complex 或 Delta。

### Step 4a — Simple：填寫 Skill Brief

使用 `templates/SKILL-BRIEF-TEMPLATE.md`：
- 觸發情境（何時會用到？）
- 核心步驟（3 ~ 7 個，有順序）
- 驗收條件（2 ~ 3 條）
- 範圍外（明確邊界）

### Step 4b — Complex：建立 XSPEC

執行 `/sdd` 建立 XSPEC。XSPEC Approved 後回到 Step 5。

### Step 4c — Delta：識別變更範圍

識別現有 SKILL.md 中哪些區段需要變更。
在檔尾加入 `## MODIFIED Requirements` 或 `## ADDED Requirements`。

### Step 5 — 建立 / 更新 SKILL.md

依 Brief 或 XSPEC 生成 SKILL.md：
- 確認 frontmatter：`name`、`scope`、`description`、`allowed-tools`
- **description 格式規則**（`scope: universal` 或 `uds-specific` 時強制）：
  - 必須以 `[UDS]` 開頭
  - 第一行使用**繁體中文**描述用途
  - 單行寫法：`description: "[UDS] 繁體中文說明"`
  - 多行寫法（含 Use when / Keywords）：`description: |\n  [UDS] 繁體中文說明\n  Use when: ...`
  - **禁止**：`description: "\"[UDS] ..."`（多餘引號會讓 description 顯示空白）
- UDS 通用 Skill：同步建立 zh-TW locale 版本
- 專案 Skill：放在 `{project}/.claude/skills/{name}/SKILL.md`

**description 快速驗證（寫完即執行）**：
```bash
bash cross-project/validate-skills.sh
# → 0 ❌ 錯誤才能繼續
```

### Step 6 — 更新 SKILL-CANDIDATES.md

將候選列標記為：trigger ✅、Skill 欄位填寫完成。

### Step 7 — Commit

```
feat(skills): Add /{skill-name} skill. 新增 /{skill-name} Skill。

{English description, 1-2 lines}

{中文描述，1-2 行}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 輸出檢查清單

完成所有步驟後，請確認：

- [ ] `SKILL-CANDIDATES.md` 已更新（trigger ✅、Skill 名稱已填）
- [ ] `SKILL.md` 已建立並有完整 frontmatter（`name` / `scope` / `description` / `allowed-tools`）
- [ ] **description 格式**（`universal` / `uds-specific` scope 必填）：
  - [ ] 第一行以 `[UDS]` 開頭（`"[UDS] 繁體中文..."` 格式）
  - [ ] 使用繁體中文，非純英文
  - [ ] 無多餘外層引號（避免 `"\"[UDS]..."` 格式）
- [ ] `bash cross-project/validate-skills.sh` → **0 ❌ 錯誤**
- [ ] Simple 路徑：Skill Brief 已引用或保留
- [ ] Complex 路徑：XSPEC ID 已記錄在 SKILL.md header comment
- [ ] UDS skill：已建立 zh-TW locale 檔案
- [ ] 棄用：frontmatter 含 `status: deprecated`
- [ ] git commit 已完成

## 參考

- Skill Brief 模板：[templates/SKILL-BRIEF-TEMPLATE.md](../../../../templates/SKILL-BRIEF-TEMPLATE.md)
- 候選追蹤：[templates/SKILL-CANDIDATES.md](../../../../templates/SKILL-CANDIDATES.md)（請複製到專案）
- ADR 標準：[core/adr-standards.md](../../../../core/adr-standards.md)
