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

## 技能怎麼裝

取得 UDS 技能有兩種方式，兩種都受支援。主要路徑是裝進專案；Claude Code 外掛市集是有限制的替代方式。

> **預設是裝進專案。** `uds init` 與不帶 `--skills-location` 的 `uds init --yes` 會把技能裝進專案（Claude Code 是 `.claude/skills/`）。6.14 之前它們一個技能檔都不裝，把 Claude Code 的技能留給外掛。要改用外掛，請加 `--skills-location marketplace`：專案內不會寫入任何技能檔，安裝結尾會說明技能從哪裡來。

| | 裝進專案（主要路徑） | Claude Code 外掛市集（替代方式） |
|---|---|---|
| 指令 | 新專案：`uds init`（這是預設）<br>已設定過的專案：`uds update --apply --skills` | `/plugin marketplace add AsiaOstrich/universal-dev-standards`，再 `/plugin install universal-dev-standards@asia-ostrich` |
| AI 工具 | Claude Code、OpenCode、Cursor、Codex、Copilot、Windsurf 等 | 只支援 Claude Code |
| 技能文字的語言 | 英文、繁體中文、簡體中文。中文文字放在 npm 套件內，所以安裝它們不需要網路；缺少這些文字的 UDS 會改裝英文並明說 | 只有英文：外掛設定沒有語系選擇 |
| UDS 版本 | 你裝的那個版本，包含測試版 | 只跟正式版 |
| 專案內的檔案 | 有，例如 `.claude/skills/`；`uds check` 會逐檔驗證 | 沒有 |
| 更新 | 升級 UDS 後，自己再跑一次 `uds update --apply --skills` | 由 Claude Code 管理外掛（`/plugin`） |

**請二擇一。** Claude Code 執行外掛技能是 `/<外掛名>:<技能名>`，執行專案技能是 `/<技能名>`，所以兩種都裝時每個技能會出現兩次（例如 `/commit` 與 `/universal-dev-standards:commit`），而且每個技能的名稱與描述每回合都會放進脈絡，重複裝等於重複占用。`uds check` 發現專案內有 UDS 技能、同時又裝了 UDS 外掛時，會印出警告；警告只是資訊，不改變判定與結束碼。要留專案這份，在 Claude Code 執行 `/plugin uninstall universal-dev-standards@asia-ostrich`。要留外掛，刪掉 `.claude/skills/` 底下的 UDS 技能資料夾。

**為什麼 `uds check` 與 `uds update` 叫你跑 `uds update --apply --skills`。** `uds check` 在專案裡的技能檔遺失或被改過時說這句，`uds update` 在已裝的技能版本落後時說這句。只有裝進專案的技能有檔案，UDS 才能拿它和當初裝的內容比對、放回去，所以修法就是那個指令。外掛不在你的專案裡放檔案，`uds check` 沒有東西可比對，也就沒有這類訊息。

`uds skills` 會列出裝了什麼、裝在哪裡，並印出同樣的兩種方式與各自的限制。

### 個人技能與 UDS 技能同名時

Claude Code 對同一個名稱只執行一個技能，而且漏掉另一個時不會告訴你。哪一個執行，取決於各自從哪裡來（Claude Code 技能文件，2026-10-07 讀取）：

| 同名出現在 | 執行哪一個 |
|---|---|
| 企業層（組織下發的 managed settings 目錄）、個人層（`~/.claude/skills/<名稱>/`）、專案層（`.claude/skills/<名稱>/`） | 企業層高於個人層，個人層高於專案層 |
| 專案技能與子目錄裡的巢狀技能 | 兩個都載入：`/<名稱>` 執行專案根目錄那個，巢狀那個是 `/<目錄>:<名稱>` |
| 外掛技能與上面任一處的技能 | 兩個都載入：外掛技能是 `/<外掛名>:<名稱>` |
| 技能與 `.claude/commands/<名稱>.md` 檔 | 技能 |

技能的名稱是 `SKILL.md` frontmatter 裡的 `name:`，沒有就用資料夾名稱；資料夾名稱同樣能叫出該技能，所以兩者任一撞名都算。

**對 UDS 的意思。** `uds init --skills-location project` 與 `uds update --apply --skills` 寫進去的是專案技能。你若已有同名的個人技能，執行的是你的，UDS 那個永遠不會執行，而且沒有任何訊息說明。UDS 有幾個技能名稱短而通用（`plan`、`push`、`sweep`、`orchestrate`，以及資料夾叫 `commit-standards` 的 `/commit`），所以有個人技能庫的人都可能遇到。UDS 不為此改名：改名會破壞所有既有的呼叫。

**怎麼看見。** `uds check` 會拿專案裡的 UDS 技能與 `~/.claude/skills/` 的技能比對，印出一則警告並點名每一組；`uds init` 與 `uds update --apply --skills` 在安裝結尾印同一則警告。它只是資訊，不改變判定也不改變結束碼。它有限制，而且**沒有警告不等於沒有撞名**：它看不到組織以企業層下發的技能（優先序高於個人層），也看不到它執行之後你才新增的個人技能，所以新增之後請再跑一次 `uds check`。

**怎麼解。** 二擇一。兩個都留：把你的個人技能改名（資料夾名稱，以及 `SKILL.md` 裡的 `name:`）。只留你的：刪掉 `.claude/skills/` 底下那個 UDS 技能資料夾。

替新的 UDS 技能取名以避免撞名，屬於貢獻者的事：見 `skills/SKILL_NAMING.md`。

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
