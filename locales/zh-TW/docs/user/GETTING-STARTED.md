---
source: docs/user/GETTING-STARTED.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 入門指南

> **語言**: [English](../../../../docs/user/GETTING-STARTED.md) | 繁體中文

本指南帶你走過 UDS 從零開始，直到完成第一份 AI 輔助的 spec 與 commit。
預估時間：**5 分鐘**。

---

## 先決條件

- Node.js ≥ 20.0.0（`node --version`）
- 一個 AI 程式設計助理：Claude Code（建議）、Cursor、GitHub Copilot 或類似工具

---

## 步驟 1 — 安裝

```bash
npm install -g universal-dev-standards
uds --version
```

> **不想全域安裝？** 使用 `npx universal-dev-standards init` 即可不安裝直接執行。

---

## 步驟 2 — 初始化你的專案

在你的專案目錄內執行 `uds init`：

```bash
cd your-project
uds init
```

互動式精靈將會：
1. 偵測你的 AI 工具（Claude Code、Cursor 等）
2. 複製標準到 `.standards/`
3. 設定你 AI 工具的指令檔（例如 `CLAUDE.md`）
4. 安裝你所選擇的 skill

初始化後，你應該會看到：
```
.standards/          ← AI 可讀的標準
CLAUDE.md            ← 已更新 UDS 指引（Claude Code）
```

> **已經有 CLAUDE.md？** `uds init` 會採合併方式——不會覆寫你既有的內容。

---

## 步驟 3 — 你的第一份 Spec（`/sdd`）

在寫程式碼之前，先建立一份 spec：

1. 在你的專案中開啟 Claude Code
2. 輸入：`/sdd` 並按 Enter
3. 描述你想要建構的東西（例如「新增使用者以 email + 密碼登入」）
4. Claude 會在 `specs/SPEC-NNN-*.md` 建立一份 spec 檔

這份 spec 會記錄：
- **Background（背景）** — 為什麼需要這個功能
- **Acceptance Criteria（驗收條件，AC）** — 可測試的結果
- **Out of Scope（範圍外）** — 明確的邊界

> **為什麼要先寫 spec？** AC 驅動的開發能減少範圍蔓延，並讓 review 更快。
> `/sdd` 遵循 UDS Spec-Driven Development（規格驅動開發）標準。

---

## 步驟 4 — 撰寫程式碼（搭配 TDD 或 BDD）

有了 spec 之後，選擇你的工作流程：

| 工作流程 | 命令 | 適用時機 |
|----------|------|----------|
| 測試驅動開發 | `/tdd` | 撰寫單元／整合測試 |
| 行為驅動開發 | `/bdd` | 撰寫功能場景 |
| 直接實作 | — | 簡單、已充分理解的任務 |

TDD 範例：
```
/tdd specs/SPEC-001-user-login.md
```
Claude 會引導你走過 RED → GREEN → REFACTOR 循環。

---

## 步驟 5 — Commit（`/commit`）

準備好要 commit 時：

```
/commit
```

Claude Code 將會：
1. 審查你已 stage 的變更
2. 產生一則符合 [Conventional Commits](https://www.conventionalcommits.org/) 格式的訊息
3. 在 commit 前把訊息顯示給你確認

> **安全推送？** 在 `git push` 前使用 `/push` 取得額外的品質閘門。

---

## 常用命令速覽

| 任務 | 命令 |
|------|------|
| 瀏覽所有 skill | `/dev-workflow` |
| 建立 spec | `/sdd` |
| TDD 工作流程 | `/tdd` |
| BDD 工作流程 | `/bdd` |
| 產生 commit | `/commit` |
| 安全推送 | `/push` |
| 架構決策 | `/adr` |
| 程式碼審查 | `/code-review` |

完整清單請見 [SKILLS-INDEX.md → 觸發時機速查](../../../../docs/user/SKILLS-INDEX.md#觸發時機速查-when-to-use)。

---

## 疑難排解

- **找不到 skill**：輸入 `uds check` 驗證安裝狀態
- **CLAUDE.md 未更新**：重新執行 `uds init --force`
- **Claude Code 選單中未顯示 skill**：見 [TROUBLESHOOTING.md](../../../../docs/user/TROUBLESHOOTING.md)

---

## 後續步驟

- **探索所有 skill**：[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)
- **自訂 skill 顯示**：[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)
- **每日工作流程模式**：[DAILY-WORKFLOW-GUIDE.md](../../adoption/DAILY-WORKFLOW-GUIDE.md)
- **理解架構**：[GLOSSARY.md](../../../../docs/user/GLOSSARY.md)
