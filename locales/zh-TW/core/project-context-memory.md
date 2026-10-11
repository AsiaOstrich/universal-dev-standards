---
source: ../../../core/project-context-memory.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2026-10-11
source_hash: a852f1970d37
status: current
---

# 專案情境記憶標準

> **語言**: [English](../../../core/project-context-memory.md) | 繁體中文

**版本**: 1.2.1
**最後更新**: 2026-10-07
**適用性**: 所有使用 AI 助手的軟體專案
**範圍**: uds-specific

---

## 目的

本標準定義一個結構化系統，用於擷取、檢索和強制執行**專案特定**的情境、架構決策和領域知識。不同於開發者記憶（通用且可轉移），專案情境記憶作為特定程式碼庫的「長期大腦」，確保 AI 助手遵守本地慣例和歷史決策。

---

## 快速參考

### 記憶項目結構

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（`PRJ-YYYY-NNNN`） |
| `type` | enum | `decision` / `convention` / `structure` / `glossary` |
| `summary` | string | 情境的一句話摘要 |
| `status` | enum | `active` / `proposed` / `deprecated` |
| `scope` | list | 適用的檔案或目錄 |

### 儲存位置

項目以 **Markdown + YAML Frontmatter** 格式儲存，確保人類可讀（文件）和機器可解析。

- **目錄**: `.project-context/`
- **格式**: `.md` 檔案

---

## 1. 記憶結構

### 1.1 完整結構定義

```markdown
---
id: "PRJ-2026-0001"              # Required: Unique ID
type: decision                   # Required: Category
status: active                   # Required: active | proposed | deprecated
created_at: "2026-02-09"         # Required: ISO date
confidence: 1.0                  # Required: 0.0–1.0 (Project facts usually start high)
authors: ["user-name", "ai-assistant"]

# Scope & Triggers (Context Awareness)
scope:                           # Where this rule applies
  - "src/api/**"
  - "src/services/**"
triggers:                        # Keywords/patterns to wake up this memory
  - "error handling"
  - "API response"
  - "try-catch"

# Relationships
related: ["PRJ-2026-0004"]       # Related project memories
supersedes: []                   # IDs of decisions this replaces
---

# Unified API Error Handling

## Context
We previously handled errors inconsistently across controllers, leading to frontend parsing issues.

## Decision
All API endpoints must return errors in the `StandardErrorResponse` format defined in `src/types/api.ts`.
Do not throw raw exceptions in controllers; wrap them in `ApiError` class.

## Constraint
- Forbidden: `res.status(500).json({ error: err.message })`
- Required: `next(new ApiError(500, 'internal_error', err.message))`
```

### 1.2 ID 格式

| 組成 | 格式 | 範例 |
|------|------|------|
| 前綴 | `PRJ` | `PRJ` |
| 年份 | `YYYY` | `2026` |
| 序號 | `NNNN` | `0001` |
| 完整 | `PRJ-YYYY-NNNN` | `PRJ-2026-0001` |

---

## 2. 記憶類別（分類法）

| 類別 | 說明 | 範例 |
|------|------|------|
| `decision` | 架構決策記錄（輕量 ADR） | 「核心領域採用六角架構（Hexagonal Architecture）」 |
| `convention` | 強制的程式碼風格或模式 | 「所有介面名稱必須以 'I' 開頭」 |
| `structure` | 目錄職責與邊界 | 「`src/shared` 不得從 `src/features` 匯入」 |
| `glossary` | 通用語言／領域術語 | 「'User' 指管理員；'Customer' 是終端使用者」 |
| `constraint` | 硬性技術限制或禁令 | 「禁止使用 `lodash`（改用原生 ES6+）」 |
| `workflow` | 流程特定規則 | 「Migration 必須透過 CLI 產生，不可手寫 SQL」 |
| `workflow-state` | 進行中工作流程的進度追蹤 | 「Release v5.1.0 — 目前處於 beta 測試階段」 |

---

## 3. 操作協定

### 3.1 主動擷取（記錄）

AI 必須主動留意對話中的「共識時刻」。

**觸發條件：**
*   「我們就約定……」
*   「從現在開始，我們使用……」
*   「架構應該是……」
*   使用者針對同一條專案特定規則反覆糾正 AI。

**工作流程：**
1.  AI 偵測到共識或規則。
2.  AI 提議：「這看起來是專案層級的決策。要我把它存到專案情境嗎？」
3.  使用者確認。
4.  AI 產生 `.project-context/topic-name.md` 檔案。

### 3.2 情境注入（查詢）

**觸發條件：**
*   **規劃階段**：當使用者要求「建立一個功能」時，掃描 `structure` 與 `decision` 記憶。
*   **編碼階段**：編輯 `scope` 內的檔案時，掃描 `convention` 記憶。
*   **審查階段**：檢查程式碼是否違反 `constraint` 記憶。

**行為：**
*   AI 必須在產生程式碼*之前***讀取**相關情境檔案。
*   AI 在強制執行規則時必須**引用**記憶 ID（例如：「依據 PRJ-2026-0012，我在這裡使用工廠模式」）。

### 3.3 生命週期管理（審視）

**過時偵測：**
*   `scope` 中提到的檔案路徑已不存在。
*   `Constraint` 中提到的程式碼模式已完全找不到。
*   AI 應主動詢問：「PRJ-2025-0045 是否仍然有效？」

**棄用：**
*   當新的 `decision` 與舊的矛盾時，舊項目的 `status` 改為 `deprecated`，並在新項目中更新 `supersedes` 欄位。

---

## 4. 工作流程狀態追蹤

### 4.1 目的

`workflow-state` 類型擷取進行中工作流程的**目前狀態**，讓 AI 助手能跨工作階段接續中斷的工作。不同於 `workflow` 類型（儲存流程規則），`workflow-state` 追蹤特定進行中工作流程的進度、阻礙與後續步驟。

### 4.2 額外結構欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `workflow` | string | 工作流程名稱（例如 `release-v5.1.0`） |
| `phase` | string | 目前步驟（例如 `beta-testing`） |
| `progress` | object | `{ completed: [], current: string, remaining: [], percentage: int }` |
| `blockers` | list | 目前阻礙進度的事項 |
| `next_steps` | list | 依序排列的後續行動 |
| `updated_at` | date | 最後更新時間戳（用於過時偵測） |

### 4.3 範例

```markdown
---
id: "PRJ-2026-0042"
type: workflow-state
status: active
workflow: "release-v5.1.0"
phase: "beta-testing"
progress:
  completed: ["alpha-release", "internal-validation"]
  current: "beta-testing"
  remaining: ["stable-release", "changelog-finalize"]
  percentage: 40
blockers:
  - "Waiting for CI fix on Windows tests"
next_steps:
  - "Fix Windows CI (#234)"
  - "Collect beta feedback"
  - "Prepare stable release notes"
created_at: "2026-03-10"
updated_at: "2026-03-16"
scope: ["cli/**", "scripts/**"]
triggers: ["release", "version", "publish"]
---

# Release v5.1.0 Workflow State

## Current Phase: Beta Testing
Beta v5.1.0-beta.1 published on 2026-03-14.
```

### 4.4 主動行為

| 觸發條件 | AI 行動 |
|----------|---------|
| 工作階段開始 | 掃描 active 的 `workflow-state` 項目，呈現摘要 |
| `updated_at` 超過 7 天 | 標記為過時，詢問要封存或繼續 |
| 所有 `remaining` 步驟皆已完成 | 建議封存該工作流程狀態 |

> 7 天過時門檻是 UDS 預設值，可依專案調整。依據：
> 在短週期開發中，超過一週未更新的工作流程狀態很可能已被放棄或取代；
> 此門檻與 developer-memory 的過時模型一致。長期或兼職專案可將其拉長。

---

## 5. 與開發者記憶的比較

| 特性 | 開發者記憶（`core/developer-memory.md`） | 專案情境記憶（`core/project-context-memory.md`） |
| :--- | :--- | :--- |
| **範圍** | 通用／跨專案 | **本地／專案特定** |
| **隱私** | 去識別化（嚴格） | **可識別**（允許特定路徑／名稱） |
| **內容** | 「如何使用 React useEffect」 | 「我們在**這個** app 中如何使用 React」 |
| **儲存** | `.memory/`（全域／使用者） | `.project-context/`（Repo） |
| **目標** | 技能習得 | **一致性與合規** |

---

## 6. 架構決策

### 6.1 「常駐」協定
如同開發者記憶，專案情境是一個**常駐協定（Always-On Protocol）**。AI 不需要明確指令就會使用它，它是 agent 環境「物理法則」的一部分。

### 6.2 儲存策略
我們採用**分檔儲存**（每個主題一個 Markdown 檔），而非單一龐大的 `GEMINI.md` 或 JSON 檔。
*   **理由 1**：對 Git 友善的 diff。
*   **理由 2**：較低的 token 用量（AI 只依 `scope/triggers` 讀取相關檔案）。
*   **理由 3**：人類可讀的文件。

---

## 邊界：本標準不放什麼

- **個人、跨專案、可識別的資訊**（誰負責什麼、怎麼連到某個環境）不是專案情境：這裡的條目放在 repo 裡，會被每個 clone 它的人看到。把它們放在使用者自己的 AI 工具記憶，不要放進 `.project-context/`。
- **專案之間的協調**（哪件工作在等哪件工作）是開放工作，不是情境：見 [Open Work Tracking](open-work-tracking.md)（OWT-027–OWT-029）。

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.1 | 2026-10-07 | 新增：「邊界」章節——個人、跨專案、可識別的資訊以及專案之間的協調，不屬於 repo 的專案情境（XSPEC-460 R5；patch，無行為變更） |
| 1.2.0 | 2026-06-18 | 新增：7 天過時門檻的依據與可調整說明（XSPEC-292 T8） |
| 1.1.0 | 2026-03-16 | 新增 `workflow-state` 類型，用於跨工作階段狀態追蹤 |
| 1.0.0 | 2026-02-09 | 初始標準定義 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
