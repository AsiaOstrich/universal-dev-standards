---
source: ../../CHANGELOG.md
source_version: 6.14.0-beta.15
translation_version: 6.14.0-beta.15
last_synced: 2026-10-16
source_hash: 8102cd182c1e
status: current
---

# 變更日誌

> **語言**: [English](../../CHANGELOG.md) | 繁體中文

本專案的所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語意化版本](https://semver.org/)。

## [Unreleased]

### 修正

- **Claude Code 外掛不再把 README 當成指令或 agent 載入，設定也通過 `claude plugin validate`。** 外掛安裝會載入 `skills/commands/` 與 `skills/agents/` 底下每一個 `.md`，所以 `README.md`、`COMMAND-FAMILY-OVERVIEW.md` 被當成指令，`skills/agents/README.md` 被當成一個 agent；`.claude-plugin/plugin.json` 的 `repository` 是物件，驗證失敗。`skills/.claude-plugin/plugin.json` 現在逐檔列出 51 個指令與五個 agent，`repository` 改為字串，`marketplace.json` 刪掉兩個 Claude Code 不讀的 `metadata` 欄位。指令名稱不變（例如 `/universal-dev-standards:commit`）。`cli/scripts/check-plugin-manifest.mjs` 現在會推算安裝實際載入什麼，除非外掛完整出貨一種形式（全部指令或全部技能）且沒有說明文件，否則失敗；`check-version-sync` 與 `bump-version` 涵蓋新的清單檔。已在 Claude Code 2.1.304 實測：無人值守的 session 以舊名稱列出各指令與五個 agent，沒有 README。

### 棄用

- **Claude Code 外掛將在 7.0 改為安裝 SKILL.md 技能，指令名稱會改變。** 6.x 的外掛安裝 `skills/commands/` 底下的舊版指令檔，而 `uds init` 安裝 56 個 SKILL.md 技能；7.0 讓外掛也安裝技能，`/universal-dev-standards:commit` 會變成 `/universal-dev-standards:commit-standards`，其餘依此類推。沒有對應技能的 16 個指令（`init`、`update`、`check`、`config`、`derive-*`、`reverse-*` 等）會在切換前補成技能。

### 變更

- **自我採用技能產生器現在除了 `.claude/skills/` 之外，也會衍生 `.agents/skills/`（Google Antigravity，Codex 也會讀取），且漂移閘門同時涵蓋兩者（XSPEC-488 R3）。** Antigravity 會從 `.agents/skills/` 讀取專案技能。過去若曾以 `uds config --type skills --ai-tool antigravity` 在該處安裝一份複本，它會置身於「Self-Adoption Skill Drift Gate」之外，即使過期也不會有任何東西變紅；因此 `scripts/generate-adoption-skills.mjs` 現在會如同 Claude Code 複本一樣，從 `skills/` 與 `locales/zh-TW/skills/` 寫入該目錄，當任一複本與其來源不一致時 `npm run check:adoption-skills` 便會失敗，且 `--self-test` 會針對兩者執行其分支測試。其內容與 `uds` 所安裝的完全相同：安裝器針對技能沒有各 agent 專屬的分支，而將 antigravity、claude-code 與 codex 以語系 zh-TW 安裝至三個空白目錄時，差異僅在於 `.manifest.json` 中的 `agent` 這一行。Codex 與 Antigravity 共用該目錄，因此一個目錄就是一個目標，其 manifest 會註明它是為哪個 agent 採用的（若 manifest 兩者皆未指名則為「could not derive」，結束碼 2）。`scripts/self-adoption-skills-baseline.json` 獲得了 `.agents/skills` 項目（若沒有它，`check:trigger-surface` 會因「no baseline entry」而失敗），`check-docs-integrity.sh` 如同跳過 `.claude/` 一樣跳過 `.agents/`（它在包含這些複本時計算出 465 個連結警告，而不含複本時只有 22 個），且 `bump-version.mjs` 會重新產生兩個 manifest。只有本儲存庫有所變更；`uds init` 與 `uds config` 的行為維持以往。

## [6.14.0-beta.15] - 2026-10-14

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修正了選取 Google Antigravity 時互動式 `uds init` 當機（在 Windows 上的 6.14.0-beta.14 以手動測試發現）、`uds update` 輸出中的 Windows 路徑分隔符號，以及 `--format both` 計畫（XSPEC-483）。包含以下 6.14.0-beta.14 的所有內容。

### 修正

- **`uds update --plan` 不再計畫刪除 `--format both` 專案中每個標準的 AI 複本，且 `uds init --format both` 會以當前最新形式結束（XSPEC-483 R1-R3）。** `--format both` 會將每個標準與選項的人工閱讀複本（`.md`）與 AI 複本（`.ai.yaml`）放在 `.standards/` 中，但協調器將 `both` 讀成單一格式，只預期有 `.md` 檔案，並將約 71 個 `.ai.yaml` 檔案列為「不再選取」；在該計畫上執行 `uds update --apply` 會移除一半已安裝的標準。現在計畫會遵循 manifest 記錄的格式：`both` 預期同時保留兩個檔案，且只有在 `format` 真正變更時才會新增或移除檔案（`both` 轉為 `ai` 會計畫移除 `.md` 複本，`ai` 轉為 `both` 則計畫建立它們）。由於計畫正確，XSPEC-482 R6 之前為這些專案不得不跳過的收斂步驟現在也會對它們執行：剛由 `uds init --format both` 建立的專案預覽時會顯示「No changes needed」。以 6.11.0 或 6.14.0-beta.14 搭配 `--format both` 建立的專案升級時會保留所有 `.md` 與 `.ai.yaml`，且 `uds update --rollback` 會還原它原本擁有的檔案。如果您套用了舊計畫而遺失了 `.ai.yaml` 複本，`uds update --apply` 會重新建立它們。

- **互動式 `uds init` 在 Google Antigravity 上不再當機，且沒有任何指令會詢問工具所沒有的使用者層級技能資料夾（XSPEC-486 R1-R3，在 Windows PowerShell 上的 6.14.0-beta.14 以手動測試發現）。** 在「Which AI tools are you using?」中勾選 Claude Code 與 Google Antigravity，會在技能位置問題時以 `TypeError: Cannot read properties of undefined (reading 'replace')` 結束，結束碼為 1 且未安裝任何東西。Antigravity 具有專案層級的技能資料夾（`.agents/skills/`），且刻意不設使用者層級資料夾，但該問題卻為每個勾選的工具都建構了「User Level」選項。現在只有具備該資料夾的工具才會提供使用者層級選項；Antigravity 則獲得專案層級，且如同每個工具一樣已預先勾選。`uds init --yes` 從不詢問該問題，這就是為什麼早先的測試都沒有跑過它。可能觸及同類問題的其他地方也已關閉：`uds init --yes --skills-location user`、`uds config --type skills --ai-tool antigravity --skills-location user` 以及僅記錄 `user` 的舊版 manifest 現在會排除 Antigravity 並說明原因（對其請使用 `--skills-location project`），路徑表在缺少使用者層級資料夾時會回傳 `null` 而非 `undefined`，且 `uds config --type skills` 中的「Reinstall declined Skills」現在會依據您回答的層級進行安裝（它過去讀取 `location`，即安裝器忽略的鍵值）。測試會模擬輸入互動式 `uds init`（Claude Code + Antigravity，搭配預設、Manual 與 Hybrid 發布模式，並勾選該問題中的每個工具），並針對路徑表中的每個工具執行技能問題。

- **`uds update --plan` 與 `uds update --apply` 的錯誤清單在 Windows 上也以 `/` 標示技能與指令檔案（XSPEC-486 R4，因自 XSPEC-482 合併至 main 以來 windows-latest 上有兩個端對端測試持續變紅而發現）。** 計畫中的標準列顯示為 `.standards/testing.ai.yaml`，但技能與指令列是由 `path.join` 建構，在 Windows 上顯示為 `.claude\skills\commit-standards` 與 `.gemini\commands\ac-coverage.toml`，導致同一份計畫與同一份錯誤清單混合了這兩種形式。協調器印出的每個專案相對路徑現在都使用 `/`。Pull request 僅在 Ubuntu 上執行端對端工作，這就是為什麼此失敗直到推送到 main 之後才顯現；路徑的其他部分皆未改變（使用者層級資料夾仍依其原樣印出絕對路徑）。

## [6.14.0-beta.14] - 2026-10-13

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。取代 6.14.0-beta.13，後者的發版後驗收在 16 個步驟上失敗：一項產品回歸（專案已是最新時仍保留已廢棄的名稱）以及仍預期 XSPEC-482 所變更之行為的驗收步驟。包含以下 6.14.0-beta.13 的所有內容。

### 修正

- **在專案已是最新且計畫為空時，`uds update --apply` 也會丟棄 UDS 無法擔保的技能與指令名稱（XSPEC-456 R4，由 6.14.0-beta.13 的發版後驗收發現）。** 自 beta.6 起，`--apply` 會從 `skills.names` / `commands.names` 移除 `_shared` 與已廢棄的名稱，但僅透過協調器本身的執行來處理，而這只發生在計畫包含動作時。beta.13 讓剛由 `uds init` 建立的專案就已是最新（XSPEC-482 R6），因此空白計畫成為常態，走進「Everything is up to date」的提前回傳，導致這些名稱留存在 manifest 中。現在該提前回傳也會丟棄它們、說明丟棄了幾個，且仍會推進記錄的版本。

## [6.14.0-beta.13] - 2026-10-13

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修正未測試項目的 beta.12 macOS 與 Linux 重新測試所發現的問題（XSPEC-482 R1–R14）。
>
> **行為改變：**`uds update --apply` 現在於任何動作失敗時**以 1 結束**；`uds init` 寫入的 pre-commit hook 會執行 `check --ci`，因此會**拒絕**編輯已安裝標準的 commit，且 `uds update` 會替換放行所有變更的舊 hook；`uds init --output-lang` 會**拒絕**沒有對應選項檔案的值；`uds release` 改依顯示語言輸出（過去不論任何語言一律印繁體中文）；`uds compile` 會**合併**進 `.claude/settings.json`，而非替換它所觸碰事件的條目；`uds audit --report` 在互動模式下送出前會先詢問。

### 修正

- **選擇 Manual 或 Hybrid 發布模式不再導致 `uds init` 與 `uds config` 當機（XSPEC-482 R1，由 beta.12 macOS 重新測試發現）。** js-yaml 5 沒有預設匯出，但有兩處動態匯入仍讀取 `(await import('js-yaml')).default`：互動式 `uds init` 會以「Cannot read properties of undefined (reading 'dump')」將整個安裝回滾，而 `uds config --type release_mode` 則在 manifest 已寫入 `manual` 之後拋出錯誤，導致未留下 `release-config.yaml`。兩者現在皆使用模組命名空間，`uds config` 會在寫入 manifest 之前先寫入 `release-config.yaml`，因此寫入失敗時會讓 manifest 保持原樣，且若有任何來源檔案再次讀取該預設匯出，掃描測試便會失敗。（6.11.0 亦有相同缺陷。）
- **行為改變 - `uds update --apply` 在任何動作失敗時以 1 結束，並以路徑與原因指名每個失敗的技能（XSPEC-482 R2, R10）。** 過去它印出「Reconciliation completed with errors: N failed」並以 0 結束，導致 CI 無法察覺。失敗的技能批次過去對每個技能印出一個 `Unknown error`，既無路徑也無原因，並將安裝成功的技能也計為失敗；現在每個動作皆獨立判定，失敗者顯示為 `<path>: <cause>`。執行有失敗時也會說明留下了什麼（見 6.14.0-beta.12 底下的更正），並提示再次執行 `uds update --apply`。
- **行為改變 - pre-commit hook 執行 `check --ci`，因此會阻斷編輯已安裝標準的 commit（XSPEC-482 R3, macOS N3）。** 過去該 hook 執行未帶 `--ci` 的 `universal-dev-standards check`，在標準檔案被編輯時僅印出「issues」並以 0 結束，導致 git 從未拒絕 commit。該阻擋區塊（husky 與原生 hook 皆然）現在執行 `check --ci`，且在失敗時說明 commit 已被阻斷以及如何還原檔案。
- **`uds update` 替換放行所有 commit 的舊版 pre-commit hook，且 `--plan` 列出此替換（XSPEC-482 R5, Linux N2）。** 由 UDS 5.x 至 6.13.1 設定的專案在 `.git/hooks/pre-commit` 中有 `uds check 2>/dev/null || true`（錯誤被丟棄，永遠「通過」）；由 6.14.0 beta 設定的專案則有未帶 `--ci` 的區塊。當該檔案逐位元組皆為 UDS 所寫的文字時（與已發布套件產生的檔案比對），它會被替換；被編輯過的檔案則維持不動，且讓檢查永遠通過的那一行會被指名行號與建議改寫的內容。
- **`uds uninstall` 說明它做了什麼、不留下空白的工具資料夾，並移除 6.11.0 專案永遠通過的 hook（XSPEC-482 R8, Linux N4 與 macOS N11d）。** 過去它在刪除 `.gemini/commands/` 與 `.opencode/command/` 後印出「folder kept」（安裝資料夾比對時帶有結尾斜線），導致它們上層空白的 `.gemini/` 與 `.opencode/` 被保留下來。完全符合 UDS 所寫文字的原生 pre-commit hook，即使較舊的 UDS 沒有記錄任何東西也會被移除，而不是留下一個仍印出「Pre-commit checks passed」的腳本；使用者加入步驟的 hook 則保留其步驟並加以說明。
- **`uds compile` 保留您的 hook 並寫出 Claude Code 文件所規範的格式（XSPEC-482 R4, macOS N4）。** 過去它替換了它所觸及每個事件的整個條目清單（使用者自己的 `Edit` hook 被刪除），將比對器寫成物件（`{"tool":"Bash"}`），而 `uds init --with-hooks` 則寫成字串 `"Bash"`（Claude Code 文件將比對器規範為字串，https://code.claude.com/docs/en/hooks ），並為專案中不存在的 hook 腳本寫入條目。現在它如同 `uds update --with-hooks` 一樣進行合併，將物件比對器簡化為其工具名稱（並修復早先 compile 留下的條目），並排除 hook 腳本缺失的標準且指名該標準。
- **全新專案預覽時顯示為「No changes needed」（XSPEC-482 R6, Linux N1）。** `uds init` 過去以 3.3.0 形式寫入 manifest，且整合區塊的順序與 `uds update` 寫入的不同，因此第一次 `update --plan` 會列出變更，且第一次 `--apply` 會重寫 manifest 與 GEMINI.md 的標準索引。`uds init` 現在會在不備份的情況下執行協調器一次，使新專案直接處於最新形式（搭配 `--content-layout layered` 時產生的分層檔案維持原樣）。
- **`update --plan --commands` 與 `--plan --skills` 與 `update --plan` 結果一致（XSPEC-482 R7, Linux N3）。** 在其他兩者視為未變更的專案中，`--plan --commands` 過去會顯示「51 command(s) would be reinstalled」。兩者現在皆依每次安裝向協調器查詢哪些檔案不同，且僅在完全沒有差異時才將安裝視為未變更。
- **`uds update --rollback --from <backup>` 還原指定的備份（包含較舊 UDS 所建立的備份），且訊息給出其被排除的真實原因（XSPEC-482 R11, macOS N7）。** 由 UDS 6.11.0 建立的備份沒有記錄 manifest 雜湊值，因此永遠無法與其後的序列合併；第二次 `--rollback` 僅會重做最新的序列，且訊息歸咎於「something else changed the project」。該訊息現在會列出較舊的備份及其 ID，並說明適用兩種原因中的哪一種。
- **`uds check --json` 永遠輸出單一 JSON 文件（XSPEC-482 R9, Linux N5）。** 過去除非同時給予 `--standard` 或 `--i18n`，否則它會印出人類可讀的文字。結束碼與文字模式給出的相同（`--ci` 且專案有問題：1）。
- **Claude Code commit hook 與 `uds simulate -s commit-message` 讀取相同的 commit 類型（XSPEC-482 R12, macOS N8）。** 該 hook 維護一份不含 `security` 的固定清單，而 `simulate` 讀取已安裝的選項檔案，導致 `security(auth): rotate keys` 通過一者卻被另一者拒絕。該 hook 現在也會讀取選項檔案（並接受重大變更標記 `!`）。
- **行為改變 - `uds init --output-lang` 拒絕沒有選項檔案的值，且簡體中文專案獲得簡體中文內容（XSPEC-482 R13, macOS N9, N10）。** 過去 `klingon` 與 `simplified-chinese` 會被接受並記錄，但未安裝任何選項檔案；錯誤訊息現在列出 `english`、`traditional-chinese`、`bilingual`。在簡體中文專案中，索引區塊、最簡參考與標準索引過去是繁體中文句子，雙語指示寫著「English + 繁體中文」，`uds update` 將該區塊重寫為雙語標題，且 `uds.project.yaml` 步驟的提示詞為英文；現在全部都為簡體中文。
- **行為改變 - `uds release` 改依顯示語言輸出，且 `release verify` 說明它比對的是 HEAD（XSPEC-482 R14a, R14b）。** 過去不論 `--ui-lang` 或專案設定為何，每一行都是繁體中文（比對這些繁體中文行的腳本必須切換至 `--ui-lang zh-tw`）。commit 不符的訊息過去寫著「git tag points to」並比對目前的 HEAD；現在改為「the current HEAD is」。
- **MCP 伺服器回應 `ping`，且失敗的工具以 `isError` 結果回應（XSPEC-482 R14c）。** `ping` 過去為「Method not found」，且工具錯誤過去以 JSON-RPC 錯誤回傳，呼叫該工具的模型無法將其讀取為工具結果。
- **`UDS_NO_UPDATE_CHECK=1` 可阻止 `uds check` 查詢 npm 以及寫入 `~/.uds/update-check.json`（XSPEC-482 R14e）。** 過去除非同時指定 `--offline`，否則 `check` 都會查詢登錄檔。
- **在回報寬度為 0 的終端機上關閉載入進度旋轉圖示（XSPEC-482 R14f）。** ora 在清除時除以寬度，旋轉圖示在該迴圈中以 100% CPU 卡住，指令永遠無法完成（例如由 `expect` 開啟的 pty、部分 CI runner）。
- **行為改變 - `uds audit --report` 顯示完整報告並在送出前先詢問（XSPEC-482 R14g）。** 過去互動路徑從「your comments」直接發送為您帳號下的公開 GitHub issue。`--yes` 仍不經詢問直接送出，且 `--dry-run` 仍僅列印。

## [6.14.0-beta.12] - 2026-10-12

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修正 6.14.0-beta.11 Windows 重新測試仍發現的問題（XSPEC-475 R6–R10）。
>
> **行為改變：**`uds update --apply` 現在讓 manifest 中的技能／指令版本與名稱紀錄與其重寫的檔案同步；當已安裝的選項檔案比 CLI 隨附的版本舊時，`uds simulate -s commit-message` 會依據 CLI 當前規則進行判定（並加以說明）；`uds update --plan` / `uds check` / `uds audit --friction` 會列出未安裝的建議核心標準。

### 變更

- **行為改變 - `uds update --apply` 記錄它所重寫的技能與指令，因此執行一次就足夠（XSPEC-475 R6，在 Windows 上的 beta.11 重新測試發現）。** 在由 6.11.0 設定的專案上直接執行 `--apply` 會重寫約 200 個技能與指令檔案，但將 `skills.version` / `commands.version` 留在舊版本，且 `skills.names` 中缺少它剛新增的技能（`comprehension-ladder`），導致 `uds check` 持續顯示「Commands: v6.11.0 → v6.14...」，直到再次執行 `uds update --skills` 為止。這些檔案是刻意重寫的（協調器的工作就是讓專案符合此 UDS 隨附的內容），因此修復的是紀錄而非重寫行為：在順利執行 `--apply` 之後，技能與指令所記錄的版本會成為此 UDS 隨附的版本，且該次執行所安裝的每個名稱都會加入 `names` 中。當沒有任何檔案需要重寫時（「Everything is up to date」，或計畫僅包含整合檔區塊），版本紀錄也會推進，因為檔案此時與此 UDS 隨附的完全一致。執行發生錯誤時則如以往一樣不變更紀錄。*（更正，6.14.0-beta.13：該句描述超過了程式碼實際做的事。執行發生錯誤時不會推進整體版本紀錄（`upstream.version`），且失敗的技能或指令批次會保留其舊紀錄；同一執行中成功的批次則已記錄其新版本，再次執行 `uds update --apply` 可完成剩餘部分。beta.13 在執行有失敗時會印出此說明。）* 若有腳本在 `--apply` 之後比對 `skills.version` 以偵測是否需要第二步，它將能立即發現隨附的版本。
- **當已安裝的選項檔案比 CLI 隨附的舊時，`uds simulate -s commit-message` 依據 CLI 當前規則進行判定並加以說明（XSPEC-475 R7，由 beta.11 重新測試發現）。** 在升級 CLI 之後且執行 `uds update --apply` 之前，已安裝的 `traditional-chinese` 選項檔案仍列出中文類型（1.0.0），導致 `feat(user): 新增部門端點` 被判定為不符合規範，而 `新增(認證): …` 反而被判定為符合規範——與 6.14 規則相反，且沒有任何原因提示。現在若已安裝的 commit-message 選項檔案之 `meta.version` 低於此 CLI 隨附的版本，則不會使用該檔案：由隨附檔案的類型決定，且輸出會新增一行 `Note:`（「The installed option file "traditional-chinese" is version 1.0.0, older than the 2.0.0 this CLI ships, so this message was judged by the CLI's current rules. Run `uds update --apply` ...」）。與隨附檔案一樣新的選項檔案無論是否經過編輯皆維持主導地位，且沒有隨附對應檔案的檔案（團隊自訂檔案）照常讀取。**traditional-chinese 變更的過渡期（6.14.0-beta.10 的遷移說明）：**在 CLI 升級與 `uds update --apply` 之間，裁決已遵循新規則（英文類型，中文主旨）；執行 `uds update --apply` 會使已安裝的檔案內容與之一致。
- **secret-management-standards 1.1.0 將 REQ-003 指向 pipeline-security-gates 的 PSG-1 至 PSG-3（XSPEC-475 R10）。** REQ-003 要求 pre-commit 與 CI 機密掃描器；這些掃描器如何執行由 `pipeline-security-gates` 規範，而這兩個標準過去並未從這一方互相參照。REQ-003 現在在一個段落中陳述這三條規則（PSG-1 掃描輸出絕不包含匹配到的機密值，PSG-2 無法執行的掃描器會阻斷，PSG-3 團隊自撰規則應有紅綠樣本），整合章節列出該交互參照，且 AI 最佳化的 YAML 帶有相同的文字、`references: [pipeline-security-gates]` 與兩個範例。`.md`、`.ai.yaml` 與登錄檔描述皆已同步；zh-TW 翻譯已更新並標記時間戳記。

### 新增

- **`uds update --plan`、`uds check` 與 `uds audit --friction` 會列出未安裝的建議核心標準，各自附帶其安裝指令（XSPEC-475 R9）。** 有 59 個核心標準未由 `uds init` 安裝，在每份計畫中全部列出會遮蔽採用者詢問的少數標準（Windows 報告中提到了 `turn-completion-integrity`、`pipeline-security-gates`）。標記為 `"recommended": true` 的登錄項目會逐一列出——「Recommended core standards, not installed (N)」，接著在每一項下方顯示 `uds update --apply --add-standard <id>`；`uds check` 印出一行標示它們；`uds audit --friction` 帶有一項包含這些指令的 LOW 發現。「Not listed above: N more」行保留並準確計算未列出的項目：`uds init` 從不安裝之類別中的標準，減去在其上方逐一列出的建議標準。列出並不等於安裝：這些不在舊版 `uds update --yes` 路徑所安裝的集合中，且不會改變任何評分或結束碼。目前有兩個項目被標記；標記為 `standards-registry.json` 中的一行。

### 修正

- **`uds spec list` 可讀取與其他欄位寫在同一行的狀態（XSPEC-475 R8，由 beta.11 重新測試發現）。** 諸如 `**規格**: SPEC-002 ｜ **狀態**: Draft（驗收中）` 的標頭（欄位之間使用全形 `｜` 或半形 `|`，順序不拘，亦支援英文名稱）過去會顯示為「format: SDD (status not parsed)」。該行的每個部分現在皆被讀取為獨立欄位。當標頭仍無法讀取時，說明此情況的句子不再拉寬每一列的 Status 欄位（以及其下方的分隔線）——只有該列會變長。

## [6.14.0-beta.11] - 2026-10-12

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。取代 6.14.0-beta.10，後者的發版後驗收在一個步驟上失敗。

### 修正

- **`uds run` 不再對真正的結尾註解發出警告；它只在 YAML 於引號內截斷指令時發出警告（XSPEC-475 R5c，由 6.14.0-beta.10 的發版後驗收發現）。** beta.10 中新增的警告會針對每個包含空格與 `#` 的未加引號值觸發，因此 `test: dotnet test Tests.csproj  # 90 tests pass`（支援的指令註解方式）會將被丟棄的註解印出，導致所有五個平台上的驗收步驟 `beta6-run-dry-run` 失敗（該步驟要求註解不得出現在輸出中）。現在只有當 YAML 保留的部分包含未閉合的引號時才會出現警告，例如 `build: node -p "'quoted # kept'"`（YAML 保留 `node -p "'quoted`，而 shell 原本會保留 `#`）：在 `--dry-run` 與實際執行前，它會說明 `uds.project.yaml` 的哪一行被截斷，並提示要將整個值加上引號，且絕不重複印出被丟棄的文字。保留部分完整的值不會被回報，即使 `#` 後面的文字原本打算作為指令的一部分亦然；若要保留 `#`，請為該值加上引號。

## [6.14.0-beta.10] - 2026-10-12

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：****traditional-chinese commit 選項現在代表「英文類型搭配中文主旨」**（`feat(user): 新增部門端點`），且中文類型如 `新增(認證): ...` 會被 `uds simulate -s commit-message` 判定為不符合規範；`uds update --apply` 不再將較舊 UDS 留在專案根目錄的 `.uds-backup-*` 資料夾計入上限或予以刪除；當缺少 `.standards/release-config.yaml` 時，`uds release` 子指令會從 manifest 的 `options.release_mode` 取得發布模式（過去會退回至 `ci-cd`）；`uds run` 在 YAML 丟棄指令中空格與 `#` 之後的文字時會印出警告；`uds uninstall` 會移除其留空的 `.claude/`（或其他工具）資料夾。

### 變更

- **行為改變 - traditional-chinese commit 選項為「英文類型，繁體中文主旨」（XSPEC-475 OQ1，於 2026-10-12 決議）。** `ai/options/commit-message/traditional-chinese.ai.yaml`（2.0.0）列出了中文類型（`新增`、`修正`……），而其人類可讀的對應檔案 `options/commit-message/traditional-chinese.md` 以及每位採用者的 commitlint `type-enum` 卻早已使用英文類型，導致機器可讀選項與專案自身的實務做法相牴觸。現在它列出與 english 選項相同的類型（`feat`、`fix`……）搭配中文範例（`feat(auth): 加入 OAuth2 登入`），並註明主旨與內文可以使用繁體中文；產生的整合文字（`output_language` 為 `traditional-chinese` 的專案在 `uds init` / `uds update` 時）、commit-standards 技能、`core/commit-message-guide.md` 1.4.0（Option B）以及 `docs/CLI-INIT-OPTIONS.md` 亦同。**受影響對象：**撰寫中文類型的專案（`新增(認證): ...`）將會看到 `uds simulate -s commit-message` 回應結束碼 1 並附帶訊息「Type "新增" is not one of: feat, fix, ... The type must be an English word from that list; only the subject may be Chinese」。**遷移方式：**改寫為英文類型（`新增`→`feat`、`修正`→`fix`、`重構`→`refactor`、`文件`→`docs`、`樣式`→`style`、`測試`→`test`、`效能`→`perf`、`建置`→`build`、`整合`→`ci`、`維護`→`chore`、`回退`→`revert`、`安全`→`security`），並執行 `uds update --apply`（已驗證：它會重寫已安裝的選項檔案以及產生的 AGENTS.md / CLAUDE.md commit 文字）。簡體中文擴充文字在此未作更動。
- **行為改變 - `uds update --apply` 在計算五個備份的上限時只計入 `.uds-backups/`，並說明移除了什麼與保留了什麼（XSPEC-475 R2）。** 上限過去將新資料夾與較舊 UDS 留在專案根目錄的 `.uds-backup-<時間>` 資料夾合併計算，導致一個帶有四個舊備份的專案在進行三步驟升級時，無聲無息地刪除了其中兩個（在 Windows 上以 beta.9 發現；該專案的 CLAUDE.md 指出這些檔案無法從 git 還原）。舊資料夾不再受上限影響而遭移除：在每個備份步驟之後，輸出會逐一列出它們（「N backup(s) from an older UDS are still in the project root and were NOT removed by the limit」）並建議您自行將其移出專案。因超過上限而從 `.uds-backups/` 移除的備份會逐一列名（「Removed N old backup(s) beyond the limit of 5 in .uds-backups/」）。`--rollback` 仍會讀取這兩個位置。如果您過去依賴舊版配置的備份自動清理機制，請手動刪除它們。
- **行為改變 - 當缺少 `release-config.yaml` 時，`uds release promote|deploy|manifest|verify` 會從 manifest 讀取發布模式（XSPEC-475 R4）。** 過去只讀取 `.standards/release-config.yaml`，因此 `.standards/manifest.json` 記錄了 `options.release_mode: manual`（或 `hybrid`）卻沒有該檔案的專案，會以 `ci-cd` 模式執行，且 `uds release verify` 會直接拒絕（「only in manual or hybrid mode」）而未說明是因為找不到該檔案。現在的模式判定為：`release-config.yaml` 中指名的 `release.mode`（優先於 manifest）；若無則為 manifest 的 `options.release_mode`，並附帶一行說明；若皆無則為 `ci-cd`。拒絕時現在會說明是由這三者中的哪一個決定以及缺少了什麼（「找不到 .standards/release-config.yaml ... 所以使用預設的 ci-cd」）。`verify` 的結束碼維持不變（0 驗證通過、1 失敗、2 無法驗證）。manifest 中記錄 `manual` 且沒有設定檔的專案現在可以執行手動模式子指令；manifest 為 `ci-cd` 的專案行為則維持以往。

### 新增

- **`uds open-work waiting` 與 `next-action` 接受專案自訂「何時問」與「在等什麼」欄位的用詞：`--asked-at-word` / `--waiting-for-word`，或 `uds.project.yaml` 中的 `open_work.asked_at_words` / `open_work.waiting_for_words`（XSPEC-475 R3）。** 一個真實載體的欄位標題為 `何時問` 與 `問什麼`；固定的詞彙庫不包含它們，導致每個「已詢問、等待中」的列都失敗且 `waiting-on-reply` 為 0。宣告的詞彙為純文字、不分大小寫，會以表格標頭或行內標籤的子字串進行比對；空白的詞會被拒絕並以 2 結束。違反規範的文字現在能區分三種錯誤：欄位**找不到**（「No column or label of this record is read as asked-at (headers seen: ...). Accepted: ... To declare your own word: ...」）、欄位**為空**（用詞不變），以及值**非日期**（用詞不變）。空白與非日期情況的用詞與以往完全相同。

### 修正

- **`uds simulate -s commit-message` 過去將所有非 ASCII 類型判定為「not in the form `<type>(<scope>): <subject>`」，導致允許中文類型的選項檔案永遠無法通過，甚至連其本身的範例也不行（XSPEC-475 R1）。** 標頭模式現在可讀取由任何字母組成的類型，並向已安裝的選項檔案確認該詞是否被允許；scope-lowercase 規則只適用於有大小寫區分的字母（中文 scope 可通過，`Auth` 與 `API-認證` 仍會失敗）。
- **`uds spec list` 可讀取中文狀態：`| 狀態 | Approved |` 與 `> **狀態**: Draft`（以及代表類型的 `類型`）（XSPEC-475 R5a）。** 它們過去會顯示為「format: SDD (status not parsed)」並拉寬欄位。
- **`uds open-work next-action` 不再將斜線指令如 `/work` 或 `` `/sdd create login` `` 回報為缺失的絕對路徑 `/work`（XSPEC-475 R5b）。** 它是具名指令且從不被尋找（計為 not-resolvable，而非 path-missing）。
- **`uds run` 在 YAML 丟棄未加引號指令中空格與 `#` 之後的文字時發出警告（XSPEC-475 R5c）。** `build: node -p "'quoted # kept'"` 是合法的 YAML，但會在 `node -p "'quoted` 結束（6.14.0 將該檔案作為 YAML 讀取；shell 原本會保留 `#`）。該警告會在 `--dry-run` 以及實際執行前印出，指出被丟棄的文字，並提示將整個值加上引號。真正的結尾註解（`test: dotnet test X.csproj  # 90 tests pass`）照常被丟棄，現在也會被回報，因為兩者在檔案中看起來一模一樣；已加引號的值或前面沒有空格的 `#` 則不會被回報。
- **`uds uninstall` 會移除留空的 `.claude/` 資料夾（或 `.codex/` 等）（XSPEC-475 R5d）。** 在技能資料夾被移除後，專案中過去會殘留一個空的 `.claude/`。仍包含您自己檔案的資料夾則會予以保留。

## [6.14.0-beta.9] - 2026-10-10

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**對不存在的規格執行 `uds spec delete <id>`，現在不先詢問，直接以結束碼 1 結束。

### 修正

- **`uds spec delete` 先說規格不存在再問要不要刪；`uds spec split` 在 `**Confirmed**` 前保留空行；`uds check` 與 `uds update` 的 error-exit 閘門提示改隨介面語言（6.14.0-beta.8 macOS 人工驗收時發現）。** 刪除不存在的規格 ID，過去會先問「要刪除嗎」，答 yes 後才印「找不到規格」；現在直接印「找不到規格：<id>」並以 1 結束，不再詢問。`uds spec split` 寫出的新規格，`**Confirmed**: No` 原本緊貼最後一條驗收條件，現在中間保留空行。`uds check`（「[error-exit] 沒有錯誤訊息單一出口檢查」）與 `uds update`（詢問是否寫入 `scripts/check-error-exit.mjs`）過去不論介面語言一律印繁體中文，現在與 CLI 其他部分一樣依介面語言顯示英文、繁體中文或簡體中文。閘門腳本本身（`templates/gates/check-error-exit.mjs`）仍印中文，本版未改。
- **CI：發版後驗收改為等待 `npm install` 實際讀取的文件，版本尚未可見時重試安裝（XSPEC-471 R1）。** 6.14.0-beta.8 發布後，`wait-for-npm.mjs` 在單一版本文件回 200 時就宣告找到（單一版本文件 `/universal-dev-standards/6.14.0-beta.8` 回 200 且其 tarball 回 2xx），但緊接的 `npm install universal-dev-standards@6.14.0-beta.8` 在前三個工作失敗（「COULD NOT RUN | install failed」，0 步執行）——`npm install` 讀的不是那份文件：它讀的是套件總覽文件 `/universal-dev-standards`，當時尚未更新。等待機制現在向套件總覽文件確認版本，接著確認 tarball，然後透過與安裝相同的 npm 與 registry 設定執行 `npm view`；且 `run.mjs` 在 npm 回應 E404 或 ETARGET 時會重試 `npm install`（5 次嘗試，間隔 5/10/20/40 秒，180 秒後不再開始新的嘗試），並印出每次重試且把重試次數記進報告。任何其他安裝錯誤仍立即失敗。`--install-retries <n>` 與 `--install-retry-wait <sec>` 可設定上限。屬維護者工具，位於 `scripts/beta-acceptance/` 下；完全不在 npm 套件內。

## [6.14.0-beta.8] - 2026-10-10

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**`uds hitl check` 無人可答時拒絕（結束碼 1）；`uds release verify` 失敗以 1、無法驗證以 2 結束；`uds release promote` 不再為沒做的事印「✓」；移除 `uds mcp serve --root`；沒有終端機時 `uds spec delete/split` 以 2、`uds spec create` 以 0 結束；`uds uninstall` 只移除 UDS 寫的、你沒改過的檔。

### 新增

- **CI：uds CLI 的每個指令、子指令與選項都要有驗收步驟，而且步驟必須讀回效果，不能只看結束碼（XSPEC-471 R2, R3）。** `node scripts/beta-acceptance/check-cli-coverage.mjs`（CI 工作「Beta Acceptance Coverage」）載入真正的 `cli/bin/uds.js`，記錄它建出的 commander 程式（含隱藏指令、隱藏選項與別名；不讀說明文字），當 `scripts/beta-acceptance/steps.json` 的任何步驟都沒用到某個指令、子指令或選項時，逐一列名並使 CI 變紅，並印出已用、豁免與缺少各幾個。要豁免只能在 `exemptions` 加 `{"command": ...}` 或 `{"option": ...}`，並附至少 20 字元的理由；空白或單字理由等於沒有豁免。加入這項檢查時已存在的缺口（31 個指令與子指令、115 個選項）列在 `scripts/beta-acceptance/coverage-baseline.json`，這份檔案只能減少：不在其中的缺口會紅，已被步驟用到的項目若沒移除也會紅（`--shrink-baseline`），所以檔案不會腐爛；`--baseline-not-larger-than <ref>` 會讓新增項目的變更變紅。`check-steps.mjs` 現在也會指名 `expect` 只有結束碼的步驟（含人工步驟；`{"step": ..., "reason": ...}` 可豁免一個步驟）。**未驗證**：CI 接線只由 YAML 解析器與測試讀過，尚未由 GitHub 實際執行。
- **CI：發版後，驗收步驟會在 Windows、macOS 與 Linux 上針對已發布套件執行（XSPEC-471 R1）。** 新的工作流程 `.github/workflows/post-publish-acceptance.yml` 會在發布的「Publish to npm」成功完成時啟動（或以 `workflow_dispatch` 搭配版本號手動執行，以測試任何已發布版本），輪詢登錄檔直到該版本及其 tarball 可被擷取（`scripts/beta-acceptance/wait-for-npm.mjs`；若永遠未出現，該工作會顯示「package not published, not a platform failure」，且不會自發布事件起等待固定時間），接著在 `ubuntu-latest`、`macos-latest` 與 `windows-latest`（後者分別從 PowerShell、cmd 與 Git Bash 執行）上執行 `run.mjs --non-interactive`。每個工作會將其統計數據寫入工作摘要（`ci-summary.mjs`：通過、失敗、未確認的人工項目、每個失敗的步驟），在任何自動化步驟失敗時變紅，並將其報告作為構件上傳。`node scripts/beta-acceptance/fetch-ci-reports.mjs --version <version>` 使用 `gh` 將構件下載至 `scripts/beta-acceptance/reports/<version>/`；CI 絕不 commit 到 `main`；抓取下來的檔案命名為 `<label>__<original name>`，因為三個 Windows 工作可能在同一秒完成。它不改動 `publish.yml`。由於單一平台現在可能有多份報告，`docs/PRE-RELEASE.md` 的「verified on」區塊會取得每個標籤的最新執行結果並顯示其中最差者（只有一個標籤時行為不變）。
- **CI：`scripts/bump-version.mjs` 遇到不帶預發布標記的版號，除非它最近一個預覽版已在三個平台驗收通過，否則拒絕（XSPEC-471 R5）。** 在改動任何檔案之前，它先確認：`scripts/beta-acceptance/reports/<preview>/` 有 Windows、macOS、Linux 三個平台、來自已發布套件的報告（用 `--local-bin`、`--source` 或注入的安裝器做出的報告不算；同一平台從多種 shell 跑過時，每一種都要看，取最差的），其中沒有任何自動步驟失敗，`check-cli-coverage.mjs` 與 `check-steps.mjs` 為綠、`coverage-baseline.json` 為空，目前 `steps.json` 的每一步都在這些報告裡（預覽版發布之後新增的步驟需要更新的預覽版），而且 `steps.json` 沒有任何豁免寫明功能「known broken」（R4 的寫法，`已知壞掉` 也會讀）。缺的東西會在一次拒絕中全部列出，結束碼為 1。沒人確認的人工步驟會列出，但不擋。預覽版號不檢查。這道關卡沒有跳過的開關，連 `SKIP_BUNDLE_PARITY` 也管不到：修補版先以預覽版發出，發版後的驗收會自動跑。規則在 `scripts/beta-acceptance/lib/stable-gate.mjs`。

### 變更

- **行為改變 — `uds release verify` 驗證失敗時改以結束碼 1 結束，無法驗證時以 2 結束（XSPEC-471 R4）。** 它印出「Manifest 驗證失敗」後仍以 0 結束，把驗證當作發布關卡的腳本或 CI 步驟會把每一次失敗都讀成通過。結束碼 0 表示 manifest 驗證通過；1 表示 commit 或 artifact 的 checksum 與 manifest 的紀錄不符；2 表示根本無法驗證：沒有 `build-manifest.json`、檔案不是合法 JSON、`--artifact` 指的檔案不存在，或發布模式（`ci-cd`）沒有 `verify`；分法與 `uds hitl check` 相同（1 = 答案是否，2 = 沒有答案）。缺少 staging 結果仍只是警告，不改變結束碼。若有腳本一直假設 `uds release verify` 必以 0 結束，請處理 1 與 2。
- **`uds release promote <version>` 不再為它沒做的事印出「✓ 晉升紀錄建立」與「✓ Git tag」（XSPEC-471 R4）。** 這個指令不寫晉升紀錄、也不建 tag；它只印出文字。相信那些勾號的人可能把一個從未打過 tag 的版本拿去部署。現在它明說「這個指令不會建立晉升紀錄，也不會建立 Git tag」，並列出要你自己執行的下一步，包含 `git tag v<version>`。沒有新增任何行為：它仍然什麼都不寫、什麼 tag 都不建。
- **行為改變 — 移除 `uds mcp serve` 的 `--root <path>` 選項（XSPEC-471 R4）。** 它被接受並存起來，但沒有任何程式讀它，所以 `--root /elsewhere` 不改變任何回答，卻看起來像在指定標準從哪裡來。伺服器照舊從已安裝的套件讀 UDS 隨附的檔案。`uds mcp serve --root <path>` 現在會以 `error: unknown option '--root'` 與結束碼 1 停下；請從任何傳入它的 MCP 用戶端設定中移除這個選項。

### 修正

- **`uds mcp serve`：`get_design_standards` 與 `get_design_token` 的 DESIGN.md 範本後備，在每一種安裝方式下都回 ENOENT（XSPEC-471 R4）。** 伺服器去 `cli/src/mcp/` 往上四層找 UDS 隨附的檔案，那個位置在 repository 之外，已安裝的套件也一樣在套件之外。現在改找套件的 `bundled/` 資料夾，在原始碼檢出時則找 `cli/` 的上一層。單元測試替換了檔案系統，所以從沒看到；新增的端對端測試會啟動真正的 `uds mcp serve` 並讀回回應。
- **`uds release deploy <env>` 在「`release-config.yaml` 是 UDS 自己產生」的專案裡，拒絕每一個環境（XSPEC-471 R4）。** `uds init` 與 `uds config` 把 `release.environments` 寫成物件（`- name: staging`）；檢查卻拿輸入的名稱去比那些物件，說「unknown environment」並列出 `[object Object]`。現在物件形式與純名稱都讀得懂。
- **`uds agent list` 與 `uds agent info` 顯示空白的說明，也沒有專長、工具或技能（XSPEC-471 R4）。** agent 檔案是 YAML（`description: |`、清單）；讀取程式一次只看一行 `key: value`，把說明看成 `|`。現在 front matter 以 YAML 解析。
- **行為改變 — `uds hitl check` 在無法詢問時不再以結束碼 0 結束（XSPEC-471 R4）。** 沒有終端機可回答、也沒有 `CI` 變數時，高風險的 `--op` 會開一個永遠等不到回答的提示，印出堆疊追蹤後以 0 結束，腳本會把它當成「已核准」。現在印出「Blocked (Safety First)」與「Denied」並以 1 結束，與 CI 下相同。`uds hitl check` 沒給 `--op` 時以 2 結束（原本是 0）。
- **`uds list` 只顯示它所計算的 163 個標準中的 81 個，而且拒絕 `--category core`（撰寫 XSPEC-471 R4 驗收步驟時發現）。** 「Total」行計入登錄檔中的每一個標準，但列表只走固定的五個分類，所以 `core`、`testing`、`security`、`deployment` 與 `operations` 這五個分類裡的 82 個標準被計入卻從未顯示，`uds list --category core` 還回答「Unknown category」。現在列表會顯示登錄檔裡有標準的每一個分類，每個分類各有標題與數量，標題上的數字加起來等於 Total；這五個分類已宣告在 `cli/standards-registry.json`（並註明它們不由 `uds init` 安裝，要用 `uds update --apply --add-standard` 依 id 加入），日後登錄檔新增的分類會以它自己的鍵值列出，不會再被丟掉。「valid categories」提示現在列出全部十個。標題與 Total 不一致時 `npm test` 會失敗。
- **`uds quickstart`、`uds spec create`、`uds spec delete` 與 `uds spec split` 在沒有任何東西能回答它們的問題時，以 Node 堆疊追蹤結束且結束碼為 0（撰寫 XSPEC-471 R4 驗收步驟時發現）。** 在沒有終端機的環境（AI 助理、CI、管線）執行時，它們畫出問題後就死在 `ExitPromptError`，整次執行看起來像成功。`uds update` 與 `uds uninstall` 早先已用同樣方式修正。現在：`uds quickstart` 印出四個流程與各自的指令（這份指南本來的工作）；沒給 `--yes` 的 `uds spec create` 把已寫好的規格留作草稿並說明如何確認（結束碼 0）；沒給 `--yes` 的 `uds spec delete` 什麼都不刪、說明要加 `--yes` 重跑並以 2 結束（原為 0）；`uds spec split` 什麼都不改、說明要在終端機執行並以 2 結束（原為 0）。有終端機時行為不變。
- **`uds uninstall` 不再刪除您自己寫的技能與指令，或您加入 `.standards/` 的檔案（XSPEC-471 R4）。** 過去它移除了每個安裝的整個技能資料夾（`.claude/skills/`、`.opencode/skill/`……）、整個指令資料夾以及整個 `.standards/` 資料夾，導致您放在那裡的自訂技能，或保存在 `.standards/` 的筆記檔案，隨 UDS 檔案一起被刪除。現在它只移除 manifest 記錄且自 UDS 寫入後未經變更的檔案，保留您編輯過的 UDS 檔案（並加以說明），且只有在資料夾內沒有其他東西時才移除資料夾。這是 `uds uninstall` 針對 hook 腳本與整合檔案早已遵循的規則。manifest 未記錄安裝檔案的專案（較舊的 UDS）會保留該安裝的檔案並說明原因。撰寫 `uds uninstall` 驗收步驟時發現。
- **驗收步驟 `init-locale-pack-missing-is-said` 在任何跑過 `prepack` 的 checkout 上，用 `run.mjs --local-bin cli/bin/uds.js` 會失敗（XSPEC-471 R5）。** 它以 `cli/bundled/` 是否存在來分辨已發布套件與原始碼 checkout，但原始碼 checkout 在 `prepack` 之後也有該資料夾，於是「缺少 zh-TW 技能文字」的複本被建在儲存庫根目錄，`skills-installer.js` 照樣在那裡找到 `locales/zh-TW` 並安裝了中文技能。現在步驟改問 `locales/zh-TW` 是否在 `cli/` 旁邊。已發布的套件從未受影響，`uds init` 也沒有。

## [6.14.0-beta.7] - 2026-10-08

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**`uds init` 與 `uds init --yes` 會把 UDS 技能安裝至專案中；`uds init` 的命令約定步驟保留 `uds.project.yaml` 其餘內容；`uds skills` 輸出文字已變更；`uds open-work next-action` 在唯一的違規是 OWT-022 判定完整的「已詢問、等待回覆」列時以 0 結束（原為 1）。

### 新增

- **`uds update` 現在會說出 UDS 有隨附、專案沒有的標準，且 `--add-standard <id>` 可以安裝它們（XSPEC-458）。** 用舊版 UDS 設定的專案只保留 manifest 列出的標準，因此 `uds update --apply` 會回報「up to date」，之後新增的標準（例如 `open-work-tracking`）卻從未安裝——也沒有任何提示。現在：`uds update --plan` 結尾會印出「Available upstream, not installed (N)」並依類別分組，沒有時顯示「none」；`--apply` 結尾印出數量與指令；`uds check` 印出一行「N upstream standard(s) not installed」；`uds audit --friction` 列出一項低嚴重度發現。這些都不會改變計畫的動作、判定、結束碼或 `uds audit --score`。`uds update --plan|--apply --add-standard <id>`（可重複）會安裝標準並記錄至 `manifest.standards`，因此下一次 `--apply` 不會將其作為多餘項目刪除；一次 `--rollback` 即可再次移除。未知的 id 以 1 結束並列出最相近的 id；已安裝的 id 說明後以 0 結束；`extension`、`integration` 與 `template` 項目（透過語言、工具與範本選擇安裝）會被拒絕並說明原因。「Available」的定義是：類別為 `reference` 或 `skill`、在專案格式下有來源檔案、manifest 裡沒有該名稱檔案——舊的 `uds update` 路徑、`--plan`/`--apply`、`check` 與 `audit` 共用此單一定義。其他類別（`core`、`testing`、`security`、`deployment`、`operations`……）的標準從未由 `uds init` 安裝，只以一行計數、不逐項列出；它們仍可依 id 進行選擇。規則與 manifest 廢棄欄位（`level`、`profile`）見 [docs/AVAILABLE-STANDARDS.md](docs/AVAILABLE-STANDARDS.md)。
- **CI：標準孤兒矩陣（XSPEC-458 R4）。** `npm run check:orphan-matrix` 替登錄表 163 個標準各記五欄是/否（`uds init` 是否安裝、產生的索引是否提及、是否有技能包裝、是否有檢查、是否被工作流程、hook 或技能呼叫），五欄全空的標準，以及沒有任何呼叫者的 `check-*` 腳本，都會讓它失敗。第一次執行找到 78 個孤兒標準與 2 個沒人呼叫的檢查腳本；它們已逐項附上理由與負責人列在 `cli/scripts/orphan-matrix-allowlist.json`，該清單於 2026-12-31 到期，條目不再是發現時也會失敗。新增的升級測試：用目前的 CLI 對照真正的 6.11.0 寫出的 manifest。
- **`open-work-tracking` 1.2.0——「尚未詢問」與「已詢問、等待回覆」成為兩個有名字的狀態，且對沒有任何東西能推導的事實容許手寫列（OWT-020–OWT-026, XSPEC-459）。** 草擬了從未送出的訊息，與已送出且未獲回覆的訊息看起來一模一樣；助理無法觀察的事實（是否已寄出、對方是否已回覆、是否已核准）沒有合規的地方可以記錄。OWT-020–OWT-022 為 `not-yet-asked`（必須指名草稿或動作）與 `asked-awaiting`（必須帶有 `asked-at`、在等什麼及其解除條件）命名；兩者皆非的等待項目會被逐項指名且絕不算作已完成。OWT-023–OWT-026 僅對此類事實容許手寫列，需具備 `observed-by`、`observed-at` 與 `yes`、`no` 或 `unknown` 的值——`unknown` 單獨計數且單獨顯示，永遠不算完成，每筆觀察的歷時都會印出，超過門檻者回報為過期且絕不算已確認。此例外不及於版本控制、規格標記或 CI 結果能決定的事項。七條要求皆為 `warning`；詞彙（英文與中文）與預設 7 天過期門檻皆未校準；檢查只判定欄位存在且格式正確——絕不判定觀察為真。「未採納」表格中「手寫狀態檔」那一列已改寫以如實陳述此點；OWT-003 維持不變。
- **`uds open-work waiting` 與 `uds open-work observations`**——對應的參考檢查。`--now` 注入今天的日期（規則絕不讀取時鐘），`--stale-after` 宣告門檻，結束碼與其他 `open-work` 指令相同：0 無違規、1 違規（`warning` 等級的違規亦同，與 OWT-019 一致）、2 無法判定。`uds open-work self-test` 現在針對 OWT-020–OWT-026 的每一項各執行一個違規與一個符合的樣本。`next-action`、`revision` 與 `separation` 印出的內容與 1.1.0 逐位元組相同（在 16 份載體上經過 21 次執行逐位元組比對，包含中文標頭的表格）。
- **`uds check` 在 UDS 技能安裝了兩次時發出警告（XSPEC-462 R2）。** 當專案中有 UDS 技能（`.claude/skills/`），同時又從 Claude Code 市集安裝了 UDS 外掛時，Claude Code 會將每個技能列出兩次（`/commit` 與 `/universal-dev-standards:commit`），並在每個回合將每個技能的名稱與描述放進脈絡中。`uds check` 現在會說明此情況並指出如何二擇一保留。純屬資訊：它不改變判定與結束碼，且當任一邊缺失或無法讀取 `~/.claude/plugins/installed_plugins.json` 時不會發出提示。
- **CI：外掛設定不得宣稱錯誤的技能數量（XSPEC-462 R3）。** 當 `.claude-plugin/plugin.json`、`marketplace.json` 或 `README.md` 中的描述所指名的技能數量與 `skills/` 下含有 `SKILL.md` 的資料夾數量不同時，`npm run check:plugin-manifest` 會失敗。未含數字的描述則可通過。
- **文件：`docs/user/GETTING-STARTED.md` 中的「如何安裝技能」（XSPEC-462 R3）。** 並列兩種方式及其限制、為什麼 `uds check` 與 `uds update` 建議使用 `uds update --apply --skills`，以及兩者皆安裝時該如何處理（英文、繁體中文與簡體中文）。
- **`pipeline-security-gates` 1.1.0——pre-commit 機密掃描現在陳述掃描器自身的三種行為（PSG-1 至 PSG-3, XSPEC-463）。** 該標準過去陳述了閘門掃描與阻斷的內容；並未陳述掃描器本身必須具備何種行為。第 1.1 節新增：PSG-1（必須）掃描輸出——終端機、CI 紀錄、報告檔案——絕不得包含匹配到的機密值，僅能包含檔案、行號與規則名稱；PSG-2（必須）無法執行的掃描器（缺少執行檔、無法讀取或無效的設定、逾時、非預期結束）視為閘門失敗並予以阻斷，絕不得以 `|| true` 或 `2>/dev/null` 吞掉；PSG-3（建議）團隊自行撰寫的每條偵測規則皆具備在測試中執行的一個紅樣本與一個綠樣本。每條規則皆附帶採用者在自身閘門上執行的三行程序；PSG-1 程序首先要求證明閘門確實阻斷，因此沒有規則匹配的樣本無法通過。工具註記僅包含在廠商自身文件中讀取的內容：對於 gitleaks，其 README（2026-10-07 讀取）範例輸出在未使用 `--redact` 時會印出 `Secret:` 行，且將結束碼 1 同時列為「洩漏」與「錯誤」；對於 detect-secrets 與 trufflehog，標準標註「採用者必須確認」。UDS 不隨附掃描器，且在其自身的 CI 或 hook 中亦無掃描器；此點已在標準中註明。機器可讀部分：`.ai.yaml` 中的 `gate_positions.pre_commit.output_redaction`、`.scanner_failure` 與 `.custom_rule_samples`；登錄檔描述與兩種譯本皆已更新，`meta.updated` 標記為 2026-10-07。
- **`open-work-tracking` 1.3.0——等待可以指名另一個專案中的物件，且這台機器看不到的專案會單獨計數（OWT-027–OWT-029, XSPEC-460）。** 相互依賴的專案過去無法表達「此項目正在等待該專案產出的成果」。OWT-027 允許解除條件表示為 `<project>:<object>`：專案為**邏輯名稱**（`uds`、`vibeops`），絕非目錄，物件為檔案路徑、測試名稱、指令、需求識別碼或版本控制標籤，且包含機器特定絕對路徑（家目錄或磁碟區目錄、磁碟機代號、`~/`）或離開另一個專案之路徑的載體視為違規。名稱在某台機器上的實際位置宣告於載體之外。OWT-028：針對每個此類條件，`uds open-work waiting` 會指出四種狀態之一並單獨計數：**released**（路徑或標籤現在存在於該處）、**not yet released**、**not visible from here**（專案不在這台機器上、其目錄缺失，或無法讀取其 git 標籤：非已發布且非零）或 **needs a person**（另一個專案中的測試名稱、指令或需求識別碼沒有檢查程式可讀取的內容）。它僅讀取這台機器上的檔案與 git；不使用網路。等待另一個專案物件的項目免受 OWT-020「是否已詢問」的約束，並在其自己的獨立行計數（`waiting-cross-project`）。OWT-029 指出此類工作的記錄存在於所有相關專案工作階段皆可讀取的受版本控制儲存庫中，而非僅存在於單一個人的 AI 工具記憶中；檢查不判定載體存放在何處。這涵蓋單一人員在一台機器上的工作階段；跨人員共享在此版本中未作決定。三者皆為 `warning` 且未校準。
- **`uds open-work waiting --root NAME=DIR`（可重複）與 `uds.project.yaml` 中的 `open_work`。** 其一直以來支援的單一 `--root DIR` 行為完全維持以往（透過 14 次執行與 1.2.0 檢查程式的凍結擷取內容逐位元組比對；第二個無名稱的 `--root` 現在會被拒絕而非被誤讀）。`--root NAME=DIR` 說明另一個專案所在位置；`uds.project.yaml` 中的 `open_work.projects` 無需輸入即可表達相同內容，相對目錄相對於該檔案解析，兩處皆給定名稱時以命令列為準。若檔案可讀但其 `open_work` 區段格式錯誤，指令將以結束碼 2 停止；完全無法讀取的檔案會予以標註且指令繼續執行。同一個 `open_work` 區段包含 `next_action_words`（見下文），因此單一設定命名空間可同時服務兩者。
- **`uds open-work next-action` 讀取更多人們用來表示「下一步動作」的詞彙、允許專案宣告自己的詞彙，並說明為何以結束碼 2 結束（XSPEC-461）。** 過去有使用者的載體每個狀態各有一張表，得到結束碼 2 卻未被告知原因。現在 `下一個動作`、`下一個步驟` 與 `接下來要做什麼` 也會被讀取，與標題、表格標頭及行內標籤共用同一份清單。`待辦`、`後續`、`Next`、`TODO`、`Action` 與單獨的 `接下來` 刻意**不**加入（它們也會作為不是下一步動作的欄位標頭），並有回歸測試加以鎖定。`--next-action-word <word>`（可重複；`separation` 亦支援）與 `uds.project.yaml` 中的 `open_work.next_action_words` 可將詞彙加入同一清單；詞彙為純文字、不分大小寫、絕非模式，空白詞彙會被拒絕並以 2 結束。找不到任何欄位時結束碼仍為 2，且文字現在會針對每個載體列出它所看見的表格標頭與標題（約 20 個，接著是「and N more」）、它認得的詞彙（宣告者分開列出）、如何新增詞彙，以及載體是否含有無符合標頭的表格或根本沒有任何可讀內容。`glab` 與 `dotnet` 現在是內建指令（有使用者的 `glab mr merge 486` 過去被讀為未指名任何內容）；`go`、`make` 與 `sh` 則刻意不內建。`--command-word <program>`（可重複）與 `open_work.command_words` 可新增程式，且 `next-action` 與 `waiting` 皆會讀取它們——`waiting` 過去在沒有它們時會詢問「此草稿是否指名了動作」。`next-action` 現在也會說明路徑是在哪個目錄下查詢、是否來自 `--root` 或是當前目錄，當載體位於所有 git 儲存庫之外且未提供 `--root` 時亦會說明，並將 `named-unresolved` 分成 `path-missing`（查詢了但不存在）與 `not-resolvable`（指令、測試名稱或需求識別碼，從不進行查詢）；原本的計數行未變，兩個新數字總和即為該數值。在既有載體上的其他所有 `next-action`、`revision` 與 `separation` 輸出皆維持不變：1.1.0 的擷取內容在移除新增行後仍逐位元組相符，且僅有兩個結束碼為 2 的「未找到欄位」案例有所增加，舊文字仍為其開頭。
- **`developer-memory` 與 `project-context-memory` 中的邊界註記（兩者皆為 1.2.1, XSPEC-460 R5）。** 個人、跨專案、可識別的事實（誰擁有什麼、如何連線到環境）在此不屬於記憶項目：它們應放在使用者自己的 AI 工具記憶中。專案之間的協調（誰在等待誰）屬於未完工作，而非記憶，並指向 `open-work-tracking`。這兩個標準的 zh-TW 與 zh-CN 譯本原本就已落後（1.0.0 與 1.1.0）且目前仍是；只有本節內容被新增至其中。
- **`uds check` 在個人技能與專案中安裝的 UDS 技能同名時發出警告（XSPEC-465 R1）。** Claude Code 每個名稱只執行一個技能，並將個人技能（`~/.claude/skills/`）排在專案技能（`.claude/skills/`，即 `uds init --skills-location project` 與 `uds update --apply --skills` 存放 UDS 技能之處）之前，因此採用者自己的 `plan`、`push` 或 `commit` 會靜默取代 UDS 的同名技能：沒有錯誤，也沒有訊息。`uds check` 現在會比對這兩個資料夾、列出每對同名技能、指出執行的是個人技能，並說明如何修正（重新命名您的技能，或刪除 UDS 的技能）；`uds init` 與 `uds update --apply --skills` 在安裝結尾也會印出相同的警告。名稱是指 `SKILL.md` frontmatter 中的 `name:`，若無則為資料夾名稱，兩者皆會進行比對（資料夾名稱亦可用於呼叫技能）。純屬資訊：無論是否帶有 `--ci`，皆不改變判定與結束碼；個人資料夾缺失、不是資料夾、無法讀取或含有損毀的 `SKILL.md` 時不會印出任何內容也不會失敗；UDS 自身的使用者層級複本（來源為 `universal-dev-standards` 的 `~/.claude/skills/.manifest.json`）以及專案本身即為家目錄的情況皆被排除。**它無法察覺企業層級，或是執行之後才新增的個人技能，文字亦清楚說明此點：沒有警告不代表沒有衝突。** 外掛技能（`/<plugin>:<skill>`）與 `.claude/commands/` 檔案未列入其中。（英文、繁體中文與簡體中文。）
- **文件：`docs/user/GETTING-STARTED.md` 新增「當個人技能與 UDS 技能同名時」，以及 `skills/SKILL_NAMING.md` 中的命名規則 6（XSPEC-465 R3）。** 當名稱出現在多個地方時哪個技能會執行（Claude Code 技能文件，2026-10-07 讀取）、這對名稱泛用的 UDS 技能（`plan`、`push`、`sweep`、`orchestrate`）意味著什麼、如何在 `uds check` 中查看，以及如何修正。UDS 並未為此將隨附技能重新命名（重新命名會破壞現有的所有呼叫）；新技能應避免使用單一泛用單字。（英文、繁體中文與簡體中文；命名規則如同該檔案以中文呈現。）
- **`open-work-tracking` 1.4.0——已詢問且正在等待回覆的項目依 OWT-022 判定，而非 OWT-019（XSPEC-464）。** 有使用者將 17 個下一步動作中的 14 個記錄為「等待對方回覆、等待排程、等待撤銷」；`uds open-work waiting` 接受了這些列，而 `uds open-work next-action` 卻拒絕了相同的列，因為「等待回覆」並未指名任何檔案、指令、測試或識別碼。現在，處於 `asked-awaiting` 且 OWT-022 判定為完整的列（真實且非未來的 `asked-at`、在等什麼、解除條件），成為 OWT-019 的第四種結果 `waiting-on-reply`：不屬違規、不計為具名、不計為已完成，列在自己的獨立區段並附帶歷時，超過 `--stale-after`（預設 7 天，未校準）時標記為 STALE。這不是規避的漏洞：缺少三者中任一項的列、`not-yet-asked` 列、處於其他狀態的列、寫成標題區段的下一步動作，以及沒有狀態欄位的載體，皆完全依以往標準判定。`next-action` 透過 `waiting` 所執行的同一函式讀取該列狀態，因此兩者對同一列不可能產生歧異；自我測試分支以及針對中英文列的屬性測試確保了此點。`uds open-work next-action` 支援新選項 `--now` 與 `--stale-after`；僅在 N 不為 0 時，其計數行才會附加 `waiting-on-reply=N`。未新增需求識別碼。凍結的 1.1.0 與 1.2.0 擷取內容仍逐位元組相符。該檢查僅判定這三個欄位存在且格式正確；它無法判定請求是否真的已送出。
- **`open-work-tracking` 說明 OWT-007 摘要可由程式印出，且完整清單可隨需擷取（XSPEC-465 R2）。** OWT-007 從未規定摘要由誰產生或長度為何。新的子節說明了低成本作法（程式在回合結束時印出簡短摘要；完整版本僅在被要求時產生，因此模型不消耗 token）與高成本作法（模型在每個回覆中寫入完整表格，合法但非必要），為前者保留 OWT-008 與 OWT-009，並建議了摘要詞彙（等待決策、等待外部回覆、等待 CI、固定日期到期、無人看管）作為建議，且明白指出 UDS 並未隨附產生此種摘要的程式，這裡亦未檢查是否存在此程式。無新增需求識別碼，亦無新增檢查。
- **測試版驗收：由單一程式在每台機器上針對已發布套件執行驗收步驟（XSPEC-469 R2, R3）。** `node scripts/beta-acceptance/run.mjs --version <version>` 從 npm 將該版本安裝至拋棄式資料夾（而非儲存庫原始碼），在機器作業系統上執行 `scripts/beta-acceptance/steps.json` 中適用的步驟——每個步驟在各自的資料夾中以各自的拋棄式家目錄執行，絕不使用真正的家目錄——並寫出可貼回的 Markdown 報告以及用於比對的 JSON 報告：作業系統與版本、shell、Node 與 npm 版本、Windows 主控台字碼頁（讀取不到時說明「取不到」及原因，絕非空白）、UDS 版本，以及每個步驟的通過、失敗、略過（其他平台）或未確認狀態，並附帶其輸出摘要。它僅使用 Node 標準函式庫且不透過 shell 啟動程式，因此同一行指令可在 PowerShell、cmd、Git Bash、zsh 與 bash 中運作。此為維護者工具，不屬於 npm 套件的一部分。結束碼 0 代表有步驟通過且無步驟失敗；1 代表有步驟失敗；2 代表無法執行（安裝失敗、安裝了其他版本、步驟檔案格式錯誤）；3 代表通過步驟數為零——未測試任何東西的執行絕不算通過。需要人工檢視的步驟（例如 cp950 主控台中的中文文字）會在終端機中詢問或從 `--answers` 讀取；若無答案則記錄為「unconfirmed」且不計為通過。`steps.json` 針對以下每個條目以及從未在 Windows 上執行過的 beta.6 修正項目，皆包含一個或多個步驟。這些步驟已針對 beta.6 與 `main` 的原始碼進行過檢查（功能步驟在前者失敗而在後者通過），並曾在 macOS 上針對實際發布的 beta.6 檢查過一次。**未驗證**：尚無步驟在真正的 Windows 機器上執行過；beta.7 的執行為首次測試。
- **CI：每個 `[Unreleased]` 條目皆需要驗收步驟，且 `docs/PRE-RELEASE.md` 為自動產生（XSPEC-469 R1, R5）。** 當 `[Unreleased]` 底下的 Added、Changed 或 Fixed 條目既無 `steps.json` 中的步驟，亦無說明為何其不具備使用者可見行為的 `exemptions` 項目時，`node scripts/beta-acceptance/check-steps.mjs`（CI 工作「Beta Acceptance Coverage」）會失敗並點名該條目。步驟依條目開頭（至少 20 個字元）來指名其條目：修改條目結尾不會改變任何事，修改其開頭則會使條目與步驟同時變紅並各自被點名。`generate-pre-release.mjs` 會從 `steps.json` 寫入 `docs/PRE-RELEASE.md` 的「What to test」清單（該清單不再以手動鍵入），並僅從 `scripts/beta-acceptance/reports/<version>/` 中的 JSON 報告寫入「Verified on」表格：沒有報告的平台顯示「Not yet verified」，而來自 `--local-bin`、`--source` 或注入的安裝器、來自其他版本，或來自未測試任何項目之執行的報告，絕不會填入儲存格中。當文件與其產生內容不同時，`--check`（同一 CI 工作）會失敗。
- **CI：推送到 `main` 時，端對端測試會在 ubuntu、windows 與 macos 上執行（XSPEC-469 R4）。** 過去它們只針對 pull request 且只在 Ubuntu 上執行，而 Windows 工作僅單獨執行單元測試。Pull request 仍維持僅在 Ubuntu 上執行，且僅在 `cli/**` 有變更時執行。推送到 `main` 的執行不再因下一次推送而被取消（pull request 的執行仍會被取消），因為被取消的執行如同略過一樣算不上通過。以 bash 執行 `scripts/check-*.sh` 的四個測試在 Windows 上呼叫 `ctx.skip()`；該工作的最後一步（`scripts/ci-vitest-summary.mjs`）會將執行、通過、失敗與略過的測試數量寫入工作摘要，且在沒有任何測試執行時失敗（略過不等於通過）。**未驗證**：工作流程僅由 YAML 解析器與測試讀取過，尚未由 GitHub 執行，且當時無法使用 `actionlint`；推送到 `main` 的第一次執行將是首次運作，屆時僅在 Windows 或 macOS 上失敗的測試會使其變紅。
- **`check-anti-fake-tests` 也會指名預期值與受測程式碼不獨立的測試（XSPEC-470 R1）。** `full-coverage-testing` 過去只有在測試永遠不可能失敗時（`expect(true).toBe(true)`）才稱其為套套邏輯。預期值來自其所測試程式碼的測試同樣必定會通過：`expect(total(items)).toBe(total(items))`，或是 `expect(total(items)).toBe(items.reduce((s, i) => s + i.price, 0))`，後者只不過是將相同的運算邏輯重打第二次，即使實作錯誤也會相符。`uds init` 寫入 `scripts/check-anti-fake-tests.mjs` 的掃描器現在會將這兩種形式皆回報為 `tautology`（JavaScript/TypeScript：`toBe`/`toEqual`/`toStrictEqual`，chai 的 `to.equal`/`to.eql`，node 的 `assert.equal`/`strictEqual`/`deepEqual`/`deepStrictEqual`）：兩側具有相同引數的相同呼叫，以及將呼叫本身的輸入透過 `reduce`、`map`、`flatMap` 或 `filter` 運算作為預期值，其回呼函式僅使用自己的參數且不含常值；僅讀取斷言的文字，因此不會去追蹤更早行所設定的名稱。`--json` 會帶有 `forms` 與每個斷言的行號。**無法判斷時保持沉默**：狀態的前後比對、與第二種實作的比對、在名稱指明確定性、冪等性、快取或同一性的測試中比對兩次呼叫、在固定表格中查詢（`ids.map(id => PRICES[id])`）、依常值選取（`users.filter(u => u.id === 2)`）、呼叫內部的呼叫（`render(now())`、`parse(serialize(rows))`）、僅回傳或淺拷貝其參數的回呼函式（`rows.map(r => r)`、`users.map(u => ({ ...u }))`、`pairs.map(([k, v]) => [k, v])`）、在動作前儲存並在動作後比對的值（`const before = items.map(...); freezeCart(items); expect(pricesOf(items)).toEqual(before)`）、受測值為結果的屬性（`sortUsers(users).length`）、無引數的呼叫、`new` 運算式、否定比對器，以及同時含有非此類斷言的測試（與 `expect(true).toBe(true)` 相同的「僅限斷言」規則）。在此儲存庫自身的 297 個測試檔案（4,200 個測試）上，它沒有回報任何新項目；第一版草稿將稍早設定的名稱視為「相同呼叫」，回報了 6 個測試，全為合理的前後比對或確定性檢查，這就是為什麼它現在只讀取寫在單一陳述式中的內容。`full-coverage-testing` 1.3.0 現在將第二種套套邏輯定義為「斷言的神諭即為實作本身」，指向 `verification-oracle` 而不再重新定義一次獨立真實性，並附帶範例以及審查者針對腳本無法裁決之情況所提出的提問；掃描器的自我測試加入了新形式及其相似形式，因此被削弱的掃描器複本會以 `2` 結束而非繼續執行。**誰會感受到差異：**在此版本發布之後由 `uds init` 寫入 `scripts/check-anti-fake-tests.mjs` 的專案；現有檔案絕不會被覆寫，因此請將 `templates/gates/check-anti-fake-tests.mjs` 複製覆蓋您的檔案以取得該規則。預設發出警告；在 `.standards/test-policy.json` 中設定 `"mode": "block"` 時，新的發現可阻斷 commit。**我們接受的兩項代價：**使用參考實作作為其神諭的差異測試看起來與教科書範例完全相同，因此會被指名（可針對手算常值加入一項斷言，或將檔案列於 `ignore` 下）；且該規則很容易規避（將受測值包裝在 `Number(...)` 中、為其加上 `.valueOf()` 或 `[0]`，或是傳入 `items.slice()`；在預期值上做同樣的事仍會被指名），因此它是給審查者的提示，而非防範刻意規避的閘門。**應對措施：**將重複的呼叫或重打的運算邏輯替換為常值或手算的範例；刻意為之的比對應放在為其命名的測試中。（XSPEC-470 R1）
- **`code-review-checklist` 1.6.0 與 PR 範本要求每項變更說明其合併風險：雙向門或單向門，以及用一個詞說明爆炸半徑（XSPEC-470 R2）。** 雙向門在合併後容易復原；單向門則無法復原或極難復原（資料遷移、刪除、預設行為改變、結束碼改變、公開介面重新命名）。新檢查清單第 11 項以及審查者與作者步驟指出，決定合併的人在合併**之前**必須知曉單向門；`pr-review` 選項範本（1.1.0）與本儲存庫自身的 PR 範本皆帶有該欄位。檢查清單亦詢問審查者測試的預期值是否獨立於受測程式碼。**誰會感受到差異：**複製 `pr-review` 範本或閱讀檢查清單的人；未透過程式進行強制約束。**應對措施：**如果您需要，可將該欄位加入您的 PR 範本中。（XSPEC-470 R2）

### 變更

- 舊版 `uds update` 訊息「N new standard(s) available for your level」不再提及層級：並無層級規則（manifest 的 `level` 是沒有任何程式讀取的遺留物）。
- `uds audit --report` 不會將「可用標準未安裝」的發現作為給維護者的回饋提出。
- **行為改變 — `uds skills` 輸出文字已變更（XSPEC-462 R1）。** 專案層級與使用者層級的安裝不再標示為 `(deprecated)`，外掛不再標示為 `(recommended)`，且「Manual installation is deprecated」與「Recommendation: Migrate to Plugin Marketplace」行已移除。取而代之的是，每次執行皆在結尾並列安裝 UDS 技能的兩種方式：安裝至專案中（`uds init --skills-location project`、`uds update --apply --skills`；支援多種 AI 工具、繁體與簡體中文文字、跟隨您安裝的 UDS 版本，包含測試版）與 Claude Code 外掛市集（僅限 Claude Code、僅限英文文字、僅限穩定發布版、專案中無任何檔案）。先前的說法始於 2026-01，且與一直以來告知使用者執行 `uds update --apply --skills` 的 `uds check` 及 `uds update` 相矛盾。比對舊文字的腳本需要更新。（英文、繁體中文與簡體中文。）
- **`uds update` 的「Skills update available」提醒**現在對專案層級、使用者層級與未知安裝顯示 `Update them with: uds update --apply --skills`。過去它將其稱為已廢棄、指向泛用的外掛 URL 並建議在技能資料夾中執行 `git pull`。對於來自外掛的技能，它現在指名市集 `asia-ostrich`（`/plugin marketplace update asia-ostrich`），而非 `anthropic-agent-skills`。
- **行為改變 — `uds open-work next-action` 對唯一 OWT-019 違規為 OWT-022 判定完整之 `asked-awaiting` 列的載體，改為回 0，不再回 1（XSPEC-464）。** 這些列現在歸類為 `waiting-on-reply`。帶有任何其他違規的載體仍以 1 結束，且沒有狀態欄位的載體行為與 1.3.0 相同。
- **行為改變 — `uds init` 與 `uds init --yes` 現在會將 UDS 技能安裝至專案中（XSPEC-468 R1）。** XSPEC-462 將「安裝至專案中」定為主要路徑，但 `uds init --yes` 過去只要偵測到 Claude Code 就仍會選擇 Claude Code 外掛且不寫入任何技能檔案，而在沒有 AI 工具標記的資料夾中則完全不寫入。執行 `uds init --yes` 的既有腳本現在會在 `.claude/skills/` 中取得技能（針對 Claude Code；其他偵測到的工具則取得各自的資料夾）以及更大的 `git status`。互動式提示預先選取專案層級，因此按下 Enter 即可安裝。若要保留舊結果，請指名要求：`uds init --yes --skills-location marketplace`（外掛：不會向專案寫入技能檔案，且安裝結尾會說明技能來自何處、外掛無法做到什麼以及如何將其移至專案中）或 `--skills-location none`。在互動式提示中，取消選取所有項目即可略過。若已安裝 UDS 外掛，安裝結尾會顯示與 `uds check` 相同的「技能安裝了兩次」警告。`uds init --help` 中 `--skills-location` 的預設值現在為 `project`。
- **行為改變 — `uds init` 的命令約定步驟不再重寫整個 `uds.project.yaml`（XSPEC-468 R5）。** 當檔案存在且您同意覆寫時，精靈過去會從它詢問的四個指令重新寫入該檔案並丟棄其他所有內容：`open_work:`（`uds open-work` 讀取的內容）、`custom:`、註解。該問題現在會列出保留的區段，且預設答案仍為 no；在回答 yes 時，只有 `commands:` 底下的 `test`、`lint`、`build` 與 `security` 行會改變（目前的值為每個問題的預設值，空白回答則保留原行不變），檔案的其他所有位元組皆維持不動。非合法 YAML 的檔案無法部分保留，因此該問題會加以說明並詢問是否完整替換。
- **文件與提示詞不再推薦外掛市集（XSPEC-468 R2）。** `docs/CLI-INIT-OPTIONS.md`、`docs/WINDOWS-GUIDE.md`、`docs/USAGE-MODES-COMPARISON.md`、採用指南與檢查清單、`uds init` 提示文字以及較早的設計筆記現在皆依循 XSPEC-462 的決議：專案方式為主要路徑，外掛則為替代方案且並列說明其限制（僅限 Claude Code、僅限英文技能文字、僅限穩定發布版、專案中無任何檔案）。三種語言。3.2.x 發布說明與此變更日誌仍保留這些版本當時的說法。若 Markdown 檔案或 CLI 本身的文字再次推薦外掛，`npm test` 現在會失敗並指名檔案與行號。

### 修正

- **外掛設定帶有錯誤的技能數量（XSPEC-462 R3）。** `.claude-plugin/plugin.json` 寫著「25 comprehensive skills」，`marketplace.json` 寫著「23 skills」，而 `.claude-plugin/README.md` 列出 15 個，但外掛實際載入 56 個。說明中不再帶有數字，上方的檢查確保維持此狀態。
- **`uds open-work waiting` 將清單項目的空白欄位誤判為由其下方的 `Next action:` 行填入（於建構 XSPEC-464 時發現）。** 在清單項目中，最後一個被辨識標籤的值會延伸到該項目的結尾，因此留白的 `- release:` 後方緊跟著 `- Next action: wait for the vendor reply` 時，會被讀取為具備 release，導致 OWT-022 放行了未陳述任何解除條件的 `asked-awaiting` 項目。現在 `Next action:` 標籤（內建詞彙）會結束其前面的值，且其本身絕非欄位。缺少 release、在等什麼或 `asked-at` 且下方帶有下一步動作行的清單項目，現在會被 `waiting`（OWT-022）回報，且不再被 `next-action` 豁免；表格不受影響。
- **不含中文技能文字的 UDS 複本安裝了英文內容且未發出任何提示（XSPEC-468 R3）。** `--locale zh-tw` 或 `zh-cn` 從套件的 `locales/` 資料夾取得文字，當該資料夾不存在時，會默默複製英文技能並以 0 結束，情況與 XSPEC-451 中 `zh-CN` 變成英文相同。`uds init` 與 `uds update` 現在會說明「The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English」，指出原因為複本不完整或損毀而非網路問題，並給出修復指令。安裝仍會以英文繼續進行；這不是錯誤。這些文字包含在 npm 套件中（以打包後的 tarball 測量，zh-TW 約 4.6 MB，zh-CN 約 4.1 MB），因此安裝它們不需要網路連線：安裝指南以三種語言說明此點。
- **`uds init` 與 `uds update` 會對因檔案暫時被鎖定而失敗的檔案複製進行重試，並在鎖定未解除時以淺顯文字說明（於 2026-10-08 的 Windows CI 執行中發現）。** 在 Windows 上，防毒軟體即時掃描、搜尋索引器或雲端同步用戶端可能會短暫佔用檔案；複製標準至該檔案時隨即會失敗並顯示 `EBUSY: resource busy or locked, copyfile ...`，且 `uds init` 會將整個安裝回滾，即使沒有任何錯誤（`--locale zh-cn` 端對端測試在某次 CI 執行中以此方式失敗，而在下一次執行中通過）。標準與擴充功能（語系包、語言或框架檔案）的複製現在最多重試 10 次，等待時間遞增（50 ms、100 ms……最高至 500 ms；每個檔案最多等待約 2.3 秒，硬性上限為 5 秒）。`EBUSY` 在所有平台上皆會重試；`EPERM` 與 `EACCES` 僅在 Windows 上重試（防毒軟體引起），因為在其他平台上它們是重試無法修復的真正權限錯誤，仍會立即失敗。若鎖定未解除，安裝會如以往一樣回滾，且訊息現在會指名該檔案、說明它被另一個程式鎖定、列出常見原因（防毒軟體掃描、搜尋索引器、雲端同步、編輯器），並提示關閉該程式或將該資料夾加入防毒軟體排除清單後重新執行指令，文字中保留原始錯誤碼。此重試未涵蓋：其他寫入或複製檔案之處（技能、hook、`github.js` 本地複本、舊版整合檔複本、更新計畫中非標準或擴充功能項目的直接檔案複製、更新備份與還原、manifest 寫入）；它們的行為維持以往。`uds update` 受到涵蓋是因為它透過同一函式複製標準，但測試主要驅動的是 `uds init`。

## [6.14.0-beta.6] - 2026-10-07

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**無法模擬的標準，`uds simulate` 現在以結束碼 2 結束（原為 1）；`uds update` 從 manifest 中移除 UDS 無法保證的名稱；備份移至 `.uds-backups/`；`uds.project.yaml` 中的雙引號值現在遵循 YAML 規格。

> **行為改變：**`uds update` 現在將其備份寫入 `.uds-backups/`，而非專案根目錄下的 `.uds-backup-*`；`uds simulate` 無法做出判定時以結束碼 2 結束（非 1），且 `uds simulate -s commit-message` 現在於行程內（in-process）判定，而非執行 `npx commitlint`；`uds update` 從 `manifest.skills.names` / `commands.names` 中捨棄 UDS 無法保證的技能與命令名稱；`uds run` 將 `uds.project.yaml` 視為 YAML 讀取（非有效 YAML 的值現在會失敗，且空格後的 `#` 代表值的結束）。

### 變更

- **行為改變——`uds update` 的備份現在集中存放在單一資料夾 `.uds-backups/` 中，而非專案根目錄下每個步驟一個 `.uds-backup-<time>/` 資料夾（XSPEC-456 R7）。** Git 從未顯示過舊資料夾（每個資料夾都隱藏了自己），但索引器、IDE 搜尋與 grep 不會讀取 `.gitignore`，因而將這些備份檔案算作專案檔案。現在每個備份都放在 `.uds-backups/<time>-<NNNN>/`，且 `.uds-backups/` 帶有一個包含 `*` 的 `.gitignore`（絕不修改你自己的 `.gitignore`）。在忽略 `.gitignore` 的工具中排除 `.uds-backups`；`uds update` 完成時會如此提示。較舊版 UDS 留在根目錄下的備份不會被移動：`--rollback`、連續步驟之間的鏈結、清理以及「最近五次」的限制會合併讀取這兩個位置，最新的優先。`uds uninstall` 依然不會動到備份。

### 修正

- **`uds run` 過去使用手寫的逐行解析器讀取 `uds.project.yaml`，導致尾隨的註解變成命令的一部分（XSPEC-456 R1）。** `test: dotnet test X.csproj  # 90 tests pass` 執行時會附加 `# 90 tests pass`；POSIX shell 會隱藏未加引號的 `#`，`cmd.exe` 則不會。該檔案現在以 YAML（js-yaml）方式讀取：空格後的 `#` 代表值的結束，加引號的值會保留其 `#`，以引號引住的引數結尾之命令會保留其結尾引號。非有效 YAML 的檔案會失敗並顯示行號；請注意雙引號值內的反斜線在 YAML 中為跳脫字元，因此請將 Windows 路徑寫為不加引號或使用單引號。
- **行為改變——`uds simulate` 不再針對從未判定的項目印出「Simulation Failed」（XSPEC-456 R2）。** `commit-message` 過去會透過管線導入 `npx commitlint`；在專案中沒有 commitlint 設定（例如 .NET 專案、沒有 package.json）的情況下，該工具拒絕執行，且合規與不合規的訊息在下載後得到相同的結果。現在改由標準自身的規則在行程內（in-process）判定（標頭 `<type>(<scope>): <subject>`、已安裝選項檔案的型別、規則 `scope-lowercase` 與 `subject-max-length`），無需 npx 且無需網路，輸出會列出未檢查的項目。結束碼：**0** 代表通過、**1** 代表不合規、**2** 代表無判定（未定義模擬器、標準未安裝、委派的工具無法使用）——最後者過去為 1 並帶有「Simulation Failed」字樣。`--json` 帶有 `status`（`pass` / `fail` / `cannot-simulate`）。委派的模擬器命令不再將輸入貼入其 shell 字串中。說明文字現在指名了定義模擬器的標準（目前只有 `commit-message`）。報告中的「失敗時結束碼為 0」在 macOS 上無法重現，因此不宣告修復。
- **`uds skills` 過去在 56 個已安裝技能中只列出 27 個，並顯示「27 / 30」（XSPEC-456 R3）。** 過濾器與分母是 `standards-registry.json` 中手動維護的 30 個名稱清單。現在改為 UDS 所隨附的技能（包含 `SKILL.md` 的資料夾），與 `init`、`update` 和 `check` 所使用的集合相同；manifest 所記錄為其他 AI 工具安裝的技能也會一併列出，摘要並說明 `uds check` 為其追蹤了多少個技能檔案。
- **行為改變——`uds update` 現在會從 `manifest.skills.names` 與 `manifest.commands.names` 中移除 UDS 無法保證的名稱（XSPEC-456 R4）。** 在 `update --apply --skills` 移除了舊版 CLI 複製到 skills 資料夾中的 `_shared`、`agents`、`ai`、`tools` 與 `workflows` 資料夾後，`skillHashes` 雖然乾淨了，但名稱清單仍為 56 個技能保留了 61 個名稱。只有當 UDS 隨附該名稱的技能或命令，且（在安裝後）確實存在於 manifest 所記錄安裝的磁碟位置時，名稱才會被保留；市集安裝以及無法檢查磁碟的情況則不作變動。現有專案會在下一次執行 `uds update` 時被更正，包括已經是最新狀態的專案。記錄名稱的四個 manifest 欄位為 `skills.names`、`commands.names`、`skillHashes` 與 `commandHashes`。
- **`uds spec list` 將完整的 SDD 規格列為標題為空的 `draft`（XSPEC-456 R5）。** 它過去將每個檔案都當作微規格（micro-spec）讀取並填入預設值。現在它會讀取 SDD 標頭——表格（`| Status | Approved (...) |`）、欄位行（`- **Status**: Archived`）或 front matter——並將無法讀取的內容印為「format: SDD (status not parsed)」而非預設值。未改變：`spec show`、`confirm` 與 `archive` 仍會透過微規格範本重寫檔案。

### 新增

- **`uds deps --if-present`（XSPEC-456 R6）。** 當沒有 `package.json`，或套件未宣告任何執行時期相依性時，它會印出該檢查不適用且未檢查任何內容，並以結束碼 0 結束（`--json`：`notApplicable`）。若不加此旗標，行為維持不變：沒有 `package.json` 仍會以結束碼 1 結束。

## [6.14.0-beta.5] - 2026-10-06

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**`uds check` 會計入缺少或已修改的技能與命令檔案（`--ci` 以 1 結束）；`uds check --diff` 比對的是已安裝的套件，而非 GitHub `main`；`uds init` 新增兩個在 commit 時發出警告的掃描器腳本。

### 變更

- **行為改變——`uds check --diff` 現在拿你的檔案與你所安裝的 UDS 套件內的複本進行比對，而非與 GitHub `main` 比對。** diff 回答的是「我在 UDS 給我的內容中改動了什麼」；它過去會從 GitHub `main` 下載原始檔案，因此離線時會失敗（包含擴充檔案），且自你安裝以來 UDS 本身在 `main` 上所做的任何變更都會被列為你所做的差異。現在原始檔案直接從已安裝的套件讀取——標準、選項與擴充檔案皆然——完全不需要下載。該命令會印出它比對的基準（`installed UDS package (version X)`），並提示使用 `uds update --plan` 查看 UDS 之後變更了什麼。當你專案中的標準是從與目前安裝套件不同的 UDS 版本安裝時，它會予以提示，因為 UDS 在這兩者之間修改的檔案會顯示為差異。當已安裝的套件中沒有追蹤檔案的原始檔時，該命令會**指名該檔案**、不下載任何內容，並以結束碼 1 結束；它不再後退回退到 GitHub 或默默略過該檔案。在沒有修改檔案的情況下，`--diff` 現在會顯示「nothing to diff」而不是什麼都不印。**誰會看到差異：**執行 `uds check --diff`（或在互動式 `uds check` 中按下「view」）的任何人：在 `main` 與你安裝的版本有所不同之處，diff 可能與以往不同；且過去從缺少原始檔的套件讀取到結束碼 0 的腳本現在會收到 1。**該怎麼做：**什麼都不必做；若要查看上游的新內容，請執行 `uds update --plan`。實作 dev-platform XSPEC-453 R1。

### 移除

- **`extensions/languages/php/` 已移除**——沒有任何東西引用的兩個檔案（`php-style.md`、`fat-free-patterns.md`，約 37 KB）；安裝程式、登錄表與文件使用的是 `extensions/languages/php-style.md` 與 `extensions/frameworks/fat-free-patterns.md`，這些檔案保持不變。npm 套件縮減了這兩個檔案，現在恰好包含安裝程式可安裝的 5 個擴充檔案；若封裝了未宣告的擴充檔案，新的測試將會失敗。`uds init --lang php` 與 `--framework fat-free` 安裝的檔案與以往相同。實作 dev-platform XSPEC-453 R2。

### 修正

- **健康度分數的覆蓋率維度不再報告 `has_tests`（該值始終為 0）。** `calculateCoverage` 宣告了 `hasTests = 0` 且從未變更它，導致 `uds audit --score` 印出一個看起來像是評估標準是否有測試但永遠不會變動的數字。它已從總和與 `details` 中移除；**沒有任何專案的覆蓋率分數會改變**（分母本來就是每個標準兩個——`check-<id>.sh` 與 `check-<id>-sync.sh`）。(XSPEC-444 R5)
- **行為改變——`uds check` 現在會將缺少或變更的技能檔案計入其判定。它過去會印出紅色的 ✗ 卻依然以「Project is compliant」結束並回傳結束碼 0。** 技能完整性結果在計算後過去會被丟棄。現在，被刪除或修改的技能檔案會使 `uds check` 顯示「Some issues detected」並指出該檔案，且 `uds check --ci` 會以結束碼 1 結束（未加 `--ci` 時結束碼仍為 0，與所有其他發現項目相同；UDS 寫入的 pre-commit hook 執行純 `uds check`，因此不會被此阻擋）。**誰會看到差異：**技能資料夾被修改或遺失檔案的專案。**該怎麼做：**執行訊息中印出的命令 `uds update --apply --skills`。**幽靈紀錄會先被處理，因此現有專案不會開始失敗：**專案的 manifest 可能列出 UDS 從未安裝過的技能檔案——採用者自己的技能，以及舊版 UDS 複製到 skills 資料夾中的 `agents/`、`workflows/` 和 `_shared/` 資料夾（因為它過去對整個資料夾計算雜湊），且後來的 `uds update` 雖然移除了這些資料夾卻沒有忘記它們（某個專案顯示了 26 個「missing」，在 6.11.0 與 6.14.0-beta.4 上相同）。現在安裝程式只會記錄它安裝的技能（不記錄自己的 `.manifest.json`），`uds update` 刪除的技能資料夾會失去其紀錄，`uds check` 會忽略不屬於隨附技能的紀錄並顯示數量（`N skill record(s) ignored`），而 `uds update`（`--apply`、`--skills` 或已是最新狀態的路徑）會將它們永久從 `.standards/manifest.json` 移除。**這同樣適用於斜線命令檔案**，這些檔案過去也有同樣被丟棄的結果：刪除或編輯命令檔案現在會使 `uds check` 指出該檔案並使 `--ci` 以 1 結束（修復方式：`uds update --apply --commands`）。非 UDS 隨附命令的命令紀錄會被 `uds update` 捨棄，且安裝在使用者層級的命令紀錄（所有專案共享，因此非本專案能保證）會被檢查忽略並予以說明。當無測試程式碼或假測試檢查設定為 `"mode": "block"` 時，`uds check` 在印出 BLOCKED 後不再以「compliant」結束。實作 dev-platform XSPEC-454 R2。
- **`uds update --rollback` 現在會復原整個升級，而不僅是標準檔案。** 在執行 `update --apply`、`update --apply --skills` 與 `update --apply --commands` 之後，單次 `--rollback` 僅還原了標準與 `CLAUDE.md`/`AGENTS.md`，卻把新的技能資料夾（`comprehension-ladder`）、技能與命令的 `.manifest.json` 檔案，以及 `.standards/manifest.json` 中的雜湊紀錄留在了新版本上，導致 `uds check` 隨後報告修改過的檔案，使專案與任一版本都不符。原因：備份只記錄了計畫會覆寫的檔案（不包含更新建立的檔案，也不包含 `.standards/manifest.json`）；`--skills` 與 `--commands` 寫入時完全沒有備份；且還原時使用了無法還原目錄的 `copyFileSync`。現在 `--apply`、`--apply --skills` 與 `--apply --commands` 的每個步驟都會建立備份，並一併記錄其所建立的檔案（`--skills`/`--commands` 會建立自己的備份，若無備份則不寫入任何內容；它們只備份 UDS 隨附的技能與命令，絕不備份你自己的）；不帶 `--apply` 的純 `uds update` 依然如以往般不建立備份；連續的步驟會透過前後 `.standards/manifest.json` 的雜湊串連起來，因此一次 `--rollback` 就能回溯整個未中斷的序列，並在中間有其他變動影響專案時停下並說明原因；還原操作會被讀回驗證，命令會印出它還原與移除了什麼，且如果有任何步驟失敗，**絕不會以「successful」結束**（以結束碼 1 結束，並說明如何重試）。**未涵蓋且會如實印出說明的項目：**使用者層級的技能／命令（`~/.claude/skills`，所有專案共享），以及較舊版本所建立的備份（從未記錄建立的檔案或 manifest）。實作 dev-platform XSPEC-454 R1。
- **`uds update --commands` 將命令數量回報為工具數量**（對單一 OpenCode 顯示「Updated Commands for 51 AI tools」）。該訊息鍵在每種語言中都寫成「N AI tools」，過去卻傳入了命令檔案的數量。現在拆分為帶有兩個插槽的獨立訊息——「Updated 51 commands for 1 AI tool(s)」 / 「已為 1 個 AI 工具更新 51 個斜線命令」 / 「已为 1 个 AI 工具更新 51 个斜线命令」。舊鍵的其他呼叫處已經傳遞工具數量，保持不變。實作 dev-platform XSPEC-454 R4。

### 新增

- **`uds init` 現在隨附假測試與 stub 掃描器（`full-coverage-testing` 一直要求你撰寫的內容），且 `uds check` 會針對其發現項目發出警告。** 該標準過去寫著「加入 `scripts/check-stubs.sh` 與 `scripts/check-anti-fake-tests.sh`」，其驗證器檢查這兩個檔案是否存在——但 UDS 兩者都沒有隨附，因此無法遵循該指示。`uds init` 現在會寫入 `scripts/check-anti-fake-tests.mjs`（**沒有斷言**的測試、唯一斷言是如 `expect(true).toBe(true)` 或 `assert 200 == 200` 等**恆真式**的測試、**每個測試都被跳過或標記為 todo** 的測試檔案）與 `scripts/check-stubs.mjs`（`// WARNING: STUB` 標記、主體標明**未實作**且身旁沒有標記、具名函式的主體**為空**且身旁沒有標記）。純 Node、無相依套件、不預設任何測試框架；它們是你自己的檔案。獨立執行時，發現問題即以非零值結束。**`uds check`（pre-commit hook 所執行的命令）會執行它們並將發現項目印為 WARNING；除非你在 `.standards/test-policy.json` 中設定 `"mode": "block"`，否則不會阻擋任何內容**。有暫存檔案時它會掃描這些檔案；沒有暫存檔案時（CI 執行）它會掃描整個專案。**測試檔案規則適用於 JavaScript/TypeScript、Python、Java/Kotlin/Scala/C#、Go、Rust、Ruby、Elixir、PHP、Swift、Dart、Lua 與 C/C++；任何其他語言的測試檔案會列為「NOT scanned」，絕不算作乾淨無虞。** 它們讀取文字且不執行你的測試，因此如果某個 helper 斷言函式的名稱無法被掃描器辨識，會被報告為「no-assertion」（可將其命名為 `assert*`/`verify*`/`expect*` 或將其模式列在 `assertionPatterns` 下）。每次執行都會先針對已知的假測試與已知良好的測試自我檢查，若檢查失敗則以 `2` 結束（「無法判定」，絕不算通過）。已存在的檔案絕不會被覆寫，`uds uninstall` 只會移除 `uds init` 寫入且未經修改的檔案；對於較早初始化的專案，`uds update` 會詢問是否寫入它們（提示預設為 no；**`uds update -y` 會回答 yes**，因此升級命令為 `uds update -y` 的專案會在下一次更新時獲得這兩個檔案）。**誰會看到差異：**本版本之後的每次 `uds init` 都會在 `scripts/` 下新增兩個檔案，且每次 commit 都會顯示來自 `uds check` 的兩行額外輸出（或發現項目）。**該怎麼做：**閱讀發現項目；若要忽略某類檔案，加入 `test-policy.json`；若要強制執行，設定 `"mode": "block"` 或在 CI 中執行這些腳本。`uds check --standard full-coverage-testing` 現在會執行這兩個腳本，而非僅檢查它們是否存在。(XSPEC-444 R5)
- **`uds check` 在 commit 變更了程式碼卻未改動任何測試時發出警告。** 當檔案已暫存時，若 commit 中沒有變更任何測試檔案，`uds check` 會列出變更的程式碼檔案，並列出任何它無法辨識型別的已變更檔案（絕不假定良好，絕不阻擋）。刪除檔案不需要測試；單純重新命名（git `R100`）與符合 `exempt` 條目的路徑可獲豁免，輸出會記錄其理由。哪些路徑是測試、哪些是程式碼是資料設定，針對常見生態系帶有預設值——`*.test.*`、`*_test.go`、`test_*.py`、`*Test.java`、`tests/` 等——由 `.standards/test-policy.json` 進行擴充（非取代）：`testDirs`、`testPatterns`、`sourceExtensions`、`nonCodeExtensions`、`ignore` 以及 `exempt` 條目，每個條目都必須帶有 `reason`，否則不予承認。**它會發出警告並允許 commit 通過。** 在同一檔案中設定 `"mode": "block"` 會讓它阻擋 commit；這是唯一提供的緊縮手段。**未實作（因為規格未予定義）的項目：**未配對變更數量的棘輪（其基準線該放在哪裡以及它計算什麼），以及個別 commit 的豁免理由（pre-commit hook 無法讀取 commit message）。(XSPEC-444 R2)
- **`uds audit --offline`。** `check` 與 `update` 已經具備此選項；`audit` 過去回答「unknown option」。有了此選項，`audit` 不會發出任何網路請求——包含每次命令後執行但過去在 `check` 與 `update` 上也忽略了 `--offline`、現在一併遵循的「有新版本可用」通知——且 `--report` 會顯示「Offline mode: the report is not submitted.」（並附上解決方法 `--dry-run`），而非啟動 `gh`、瀏覽器或剪貼簿。實作 dev-platform XSPEC-454 R3。

## [6.14.0-beta.4] - 2026-10-06

> **預發布版本** — 使用 `npm install -g universal-dev-standards@beta` 進行安裝。測試內容與如何回到穩定版請參閱：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為變更：** 當您的 lint 或測試失敗時，`uds check --standard checkin-standards` 現在會判定失敗，且非 Node 專案的原生 pre-commit hook 現在可以阻擋 commit。請參閱「已修復」下方的首批項目。

### 已修復
- **`extensions/` 現已納入 npm 套件中，且 `uds init`、`uds update` 與 reconciler 僅從套件安裝擴充檔案 — 兩者皆不再從 GitHub 下載。** 6.13.1 套件中包含 `extensions/` 底下 7 個檔案中的 0 個（語言風格指南、框架模式、zh-TW 與 zh-CN 語系包），因此 `uds init --lang csharp`、`--lang php`、`--framework fat-free` 以及 `--locale zh-tw` / `zh-cn` 在安裝時會從 GitHub `main` 抓取。這帶來兩個後果：在離線或公司內部網路環境下安裝任何一個都會失敗；而且你取得的檔案是當天 `main` 上的內容，而非屬於你所安裝版本的那份檔案。同樣的 fallback 機制也導致缺失的 `zh-cn.md` 被隱瞞了數個月。現在 `cli/scripts/prepack.mjs` 會打包整個目錄；bundle-parity 檢查會逐檔、逐位元組比對 `extensions/` 與 bundle（過去它僅比對 `.ai.yaml` 標準，因此即使套件中完全沒有這些檔案也會顯示「bundle parity holds」）；如果宣告的擴充套件不在套件中，會使安裝**失敗並指明該檔案** — 不進行下載，也不靜默跳過。**受影響對象：** 任何從 npm 安裝的使用者都會多獲得 7 個檔案（約 152 KB），且不會對它們發出網路請求；`uds update` 也會直接從套件更新 `manifest.extensions` 項目。**未變更部分：** 在本地缺少檔案時仍會嘗試連線 GitHub 的其他地方（standards、options、integrations、skills），以及 `uds check --diff`，後者仍會從 GitHub `main` 抓取任何被追蹤檔案（包含擴充檔案）的原始版本進行比對。該清冊已列於規格中，此處未做修改。新增的一項測試會執行 `npm pack`，將 tarball 安裝至臨時拋棄式目錄，封鎖並記錄網路活動，接著針對安裝套件所宣告的每個擴充選項執行 `uds init`，然後逐位元組讀回每個安裝的檔案；第二項測試則從套件中移除一個已宣告的檔案，並要求安裝失敗且明確指出檔名，不得嘗試下載。實作 dev-platform XSPEC-452 R1、R2、R3。
- **`uds init --locale` 不區分大小寫，並會在語系不支援時提出提示**：`--locale zh-CN` 過去會以 exit 0 安裝英文版；現在則會安裝簡體中文版。不支援的數值（如 `fr`）仍會安裝英文版，但會印出警告訊息而非靜默執行。（dev-platform XSPEC-451 後續修正）

- **行為變更 — 當您的 lint 或測試失敗時，`uds check --standard checkin-standards` 現在會判定失敗。過去它會顯示 "passed"。** 過去的驗證器為 `(npm test --if-present || echo "No test script")`。`--if-present` 本身就已經能處理「沒有測試腳本」的情況；因此 `|| echo` 只做了一件事：將失敗的 `npm test` 或 `npm run lint` 轉為 exit 0。UDS 本身的 `test-governance` 標準規定關卡必須採取故障關閉（fail closed）；先前釋出的檢查機制卻未能做到。現在：失敗的 lint 或測試腳本會以非零狀態碼退出，且輸出會指出是哪一個（`FAILED: npm run test exited with 1`，後面接著腳本本身的輸出）；只有在腳本確實不存在時才不算失敗，並印出 `No lint script` / `No test script` — 僅限此種情況；`npm init` 為 `test` 所寫入的佔位符（`echo "Error: no test specified" && exit 1`）視為不存在；沒有 `package.json` 的專案會通過檢查，並印出 lint 與測試**未**執行的訊息；若 `package.json` 存在但無法解析，則會判定失敗，而不會被當成「沒有腳本」。缺少 `CHANGELOG.md` 仍僅視為提示。**受影響對象：** pre-commit hook 有執行 `check --standard checkin-standards` 的專案（UDS 於 2026-02-04 至 2026-03-04 期間寫入的 hook，`uds update` 會保留其作為該區塊的引數），以及任何在 CI 或腳本中執行該指令的人。過去在測試失敗時仍能通過的 commit 現在會被阻擋 — 這正是其目的所在。**因應方式：** 執行 `npm test` / `npm run lint` 並修復其回報的問題。沒有測試的專案不受影響。新執行的 `uds init` hook 執行的是單純的 `uds check`，並不會評估此驗證器；是否應該評估屬於另一項決策，在此維持不變。該驗證器現在會執行 `node`，而任何執行 `uds` CLI 的專案本來就具備此環境。
- **當沒有任何管線提及安全關卡時，`pipeline-security-gates` 驗證器不再判定通過。** 過去它將 `grep` 透過管線傳給 `head -1` 並 fallback 到 `|| echo 'no-ci-pipeline'`；`head` 的退出狀態碼永遠是 0，因此該 fallback 從未執行過，檢查也永遠不可能失敗。現在改用 `grep -q`，除非 `.github/workflows/`、`.gitlab-ci.yml` 或 `Jenkinsfile` 提及 `secrets`、`sast`、`sca` 或 `dast`，否則會以非零狀態碼退出。只有 `uds check --standard pipeline-security-gates` 會執行此檢查。
- **`uds init` 為非 Node 專案寫入的原生 `.git/hooks/pre-commit` 現在可以阻止 commit。** 過去它將每個 linter 都以 `... 2>/dev/null || true` 執行，並以 `uds check 2>/dev/null || true` 執行，隨後印出 "Pre-commit checks passed" — 它完全無法阻擋任何提交，還隱匿了自身的錯誤。現在，已安裝的 linter（`ruff`、`go vet`、`cargo clippy`）若執行失敗將會阻擋 commit，未安裝的 linter 則會被跳過；UDS 檢查區塊與 husky hook 所包含的標記區塊相同，因此其退出狀態碼會阻止 commit，而若缺少 `universal-dev-standards` CLI，則會說明如何安裝並進行阻擋，不再靜默跳過。`uds uninstall` 會完整移除該區塊，即使該腳本曾被您編輯過也是如此。**磁碟上既有的 hook 將維持原樣** — UDS 無法證明被編輯過的檔案屬於自己，且此次變更不包含此項目的遷移處理。
- **`uds init --locale zh-cn` 現已可正常運作。過去它會失敗並復原整個安裝。** 安裝程式宣告了 `zh-cn` 並複製 `extensions/locales/zh-cn.md`，但該檔案並不存在（只有 `zh-tw.md` 存在），導致安裝以 `extensions/locales/zh-cn.md: File not available` 告終，並移除了所有已安裝的內容 — 使得任何人都無法以簡體中文安裝 UDS，且沒有任何測試以簡體中文執行安裝，因此問題一直未被修復。該檔案現已建立：以中國大陸用語撰寫的簡體中文語系包（並非繁體版的一字一句對應轉換 — 其詞彙表在繁體包對應相反處寫為「Performance → 性能」）。它與 `zh-tw-locale` 並列註冊為 `zh-cn-locale`。一項新測試會針對安裝程式所宣告的每個語系執行真實的 `uds init`（清單從安裝程式讀取，而非寫死在測試中），並讀回語系包、manifest 以及已安裝的 skill；若宣告了語系卻缺少對應檔案，測試將亮紅燈並指出該語系名稱。comprehension-ladder 的安裝測試現在也透過 `uds init` 讀取 zh-CN。**npm 安裝注意事項：** 撰寫本條目時 `extensions/` 尚未包含在 npm 套件中，因此語系包是在安裝時從 GitHub（`main`）抓取；現在已直接隨套件提供（請參閱上方的 `extensions/` 條目）。實作 dev-platform XSPEC-451 R1、R2。

### 新增

- **`ai-response-navigation` 1.3.0 → 1.4.0 — R12，受控語言，包含一項必要條款。** 簡化文字能讓它更容易閱讀，而最容易閱讀的句子往往是語氣篤定的句子，因此「簡化」容易偏向確定性：「可能（might）」變成了「是（is）」。R12 將解決方案分為兩部分。**12.1 為必要條款**：當為非原作者的讀者縮減、簡化、改寫或翻譯文字時，必須保留原作者的保留語氣／模糊限制語（might、could、probably、可能、推斷、尚未確認），絕不能將不確定的陳述轉變為確定的陳述，且不得新增來源未提及的事實。這是唯一一項一旦違反就會讓讀者誤信不實內容的規則，且它不需要校準：在任何語言中，檢查方式就是前後對照比對。**12.2 為選用條款**，原因已記錄於標準中：以該語言本身的單位計算短句長度（作為初始範圍，依各語言進行校準）、一物一名、主動語態、一步驟一動作、少用分號、數字標註單位。R10 現已指向 R12。
  - **標準中明確聲明不採用英文詞典。** 這些原則源自 ASD-STE100，但該標準的核可詞彙表與時態限制高度依賴英文，並不適用於中文或其他非英文文字。本標準僅採用其原則，不提供詞彙表，並發出警告：若字數計算器僅以空格進行分割，會將一整段中文誤判為一個單詞而一律判定合格。
  - **中文範例實例**：一段原文，以及約 80% 與嚴格版本，三者皆保留了保留語氣，再加上第四種雖然更短但錯誤的改寫（它將「可能」直接轉為確定原因，並將「尚未重現」轉為「已確認」）。已同步至 zh-TW 與 zh-CN 的兩份 `.ai.yaml` 複本中，並配有一項測試：讀取發布的檔案，若必要條款被削弱或移除則會亮紅燈。
- **新 skill `comprehension-ladder` (`/comprehend`) 1.0.0 — 在不改變事實的前提下，將難以理解的 AI 輸出轉換為更易懂的形式。** 該 skill 會從來源建立一份大綱，接著據此轉譯出最多三個階梯：受控文字、Mermaid 圖表，以及可離線開啟且完全不從網路載入任何內容的單一 HTML 解說檔。不包含影片階梯。**必須遵守三項防護守則**，每項皆附有正面與反面範例：不得新增來源未陳述的事實、保留所有保留語氣（「可能」維持「可能」），並為每個項目提供來源指標與「未涵蓋」附註。該 skill 以受控語言撰寫（[ai-response-navigation](core/ai-response-navigation.md) Rule 12），其防護守則 G2 即為條款 12.1。
  - **尚未證實有效。** `skills/comprehension-ladder/eval-cases.md` 包含 5 篇為此目的撰寫的來源文字，每篇均附有理解測驗題與解答，以及一套可產出兩組數據的執行程序：前後正確率與違反防護守則的次數。該執行需要呼叫模型，目前尚未進行。在此之前，本 skill 不對成效做任何宣稱。
  - 提供 `zh-TW` 與 `zh-CN` 版本，並已註冊於 registry、manifest、`llms.txt` 與 skills 索引中。一項測試會在臨時拋棄式專案中執行真實的 `uds init` 並讀回已安裝的 skill：確認三個防護守則皆存在且標記為必要、HTML 階梯禁止外部資源，且不存在影片階梯。

## [6.14.0-beta.3] - 2026-09-30

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **既有採用者——請執行一次 `uds update`。** 舊版 `uds init` 寫入的 pre-commit hook 僅有一行 `npx uds check`，這可能會向 npm 索取名為 `uds` 但非本專案的套件。新安裝不再寫入該行，且 `uds update` 會取代既有 `.husky/pre-commit` 中 UDS 自己寫入的內容。同樣新增的內容：`uds uninstall` 現在只移除能證明由 UDS 寫入的內容（由較早版本 UDS 安裝的專案會保留部分檔案並說明原因），且 `uds open-work next-action` 現在可讀取寫為表格欄位的下一步動作。

### 變更

- **`uds open-work next-action` 現在可讀取寫在 Markdown 表格欄位中的下一步動作，而非僅限於標題或行內標籤。** 表頭屬於下一步詞彙清單（`Next action`、`Next step`、`下一步`、`下一動`，以及現在新增的 `回來要做什麼`）的欄位會在每一列被讀取，每份報告都會附上行號與該列的第一個儲存格。詞彙依然是單一清單：標題、行內標籤與表格標頭均讀取它。現在可辨識引號區塊內的表格（`> | … |`），且程式碼區塊內或反斜線後的 `|` 不再分割儲存格。儲存格數量與表頭不同的列會被列為 `UNDECIDABLE` 且絕不會被讀為空；若其他地方沒有違規，結束碼為 2，因為乾淨的結果只能涵蓋欄位的一部分。空白、`—` 或 `-` 的儲存格會被計數但不予評估，不算 OWT-019 違規。這是在真實工作日誌上測量 DEC-122 H2 基準線時發現的，該日誌中 80 列有 32 列的儲存格數量與其表頭不同。`回來要做什麼` 是該工作日誌實際使用的表頭（其內文稱該欄位為下一動），且為 UNCALIBRATED（OWT-016）。檢查本身的變異測試（mutation tests）增加了八個表格變異體；先前的十七個依然會變紅。

### 修正

- **`uds uninstall` 不再留下 UDS 自己的檔案，且不再移除無法證明屬於 UDS 的檔案。** 在執行 `init` → `update --with-hooks` → `uninstall -y` 後，它過去會回報「Removed 5, Skipped 1, Errors 0」，卻在 `scripts/hooks/` 下留下了 15 個 hook 腳本、一個空的 `.codex/`、其產生的標頭依然指向已刪除 `.standards/` 的 AGENTS.md，以及 `uds init` 寫入的 `.git/hooks/pre-commit` 主體。現在的規則是：只有當 manifest 記錄了 UDS 寫入該檔案（`installedArtifacts`，由 `init` 與 `update --with-hooks` 寫入）**且**其內容仍與記錄的雜湊相符時，整個檔案才會被刪除。其他任何內容都會被保留，輸出會說明原因（`kept: modified since UDS wrote it`、`kept: no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this`）。資料夾只有在由 UDS 建立且目前為空時才會被移除；採用者自己的 `scripts/hooks/*.mjs`、`.agents/rules/*` 與 hook 項目均會保留。由較早版本 UDS 安裝的專案沒有紀錄，因此其腳本、產生的 AGENTS.md 文字與原生 pre-commit 主體會被保留並說明原因，而非靠猜測處理。每行「Removed」現在都對應真實的刪除或編輯，且以錯誤結尾的執行會回傳非零結束碼。
- **`uds uninstall` 在無人能回答時不再繪製提示或堆疊追蹤，且在未執行任何操作時不再以結束碼 0 結束。** `--dry-run` 絕不提示（它不寫入任何內容）並預覽每個類別。在未加 `--yes` 且沒有終端機時，真正的執行會拒絕並回傳結束碼 2，而非假定為「yes」；關閉的提示會以 130 結束；未初始化的專案會以 1 結束。
- **`uds init --with-hooks` 在 Windows 上不再印出 `'chmod' is not recognized`。** pre-commit hook 過去是在 try/catch 內以 `execSync("chmod +x ...")` 設定為可執行；catch 雖然向程式碼隱藏了失敗，但 `execSync` 已經把 cmd.exe 的錯誤傳送到終端機。它現在呼叫 `fs.chmodSync`，並在沒有可執行位元的 Windows 上略過該步驟。
- **安全性：`uds init` 寫入的 pre-commit hook 不再向 npm 索取名為 `uds`（非本專案）的套件。** 該 hook 原本是單行 `npx uds check`。`npx` 會優先在 `node_modules/.bin` 與 `PATH` 中尋找，只有在兩者皆無時才會造訪 npm 登錄表，而登錄表上的套件 `uds` 是無關的專案（維護者 wizawu，`github.com/wizawu/uds`，v0.3.6，最後發布於 2022 年，目前沒有 `bin`）。在安裝了 UDS 的機器上行為不變；但在任何未安裝 UDS 的 clone 上，該 hook 會依名稱擷取陌生人的套件——這之所以無害僅是因為該套件*目前*沒有執行檔，一旦其釋出執行檔，每個採用者的每次 commit 都會執行它。`--no-install` 不是解法：在記錄所有請求的本地登錄表上測量（npm 10.9.9、11.20.0、12.1.0，完全相同），`npx --no-install uds` 依然發出 `GET /uds` 請求，且 `npx --no-install --package=universal-dev-standards uds` 完全找不到全域安裝。該 hook 現在兩者都不用：它會在專案的 `node_modules/.bin` 以及 `PATH` 中尋找 `universal-dev-standards`（套件本身的名稱，僅本專案能發布），執行 `check`，並在到處都找不到時印出應安裝的內容並以非零值結束——它既不略過檢查也不下載任何內容，且失敗的檢查即使後面跟著採用者自己的命令也能阻擋 commit。`uds uninstall` 會依據標記完整移除新區塊。人類可讀的文字也有相同的修復：產生的 `CLAUDE.md`/`AGENTS.md` 區塊內的警告行與 hook 提示現在寫著 `npx universal-dev-standards init` / `update`（警告行多了幾個 token，因此 `scripts/prompt-footprint-baseline.json` 恰好調高了測得的 3–6）。**既有採用者：**`uds update`（除了 `--skills`、`--commands`、`--integrations-only`、`--standards-only` 和 `--rollback` 以及 `--with-hooks` 之外的每種模式；`--plan` 只報告不寫入）會替換 UDS 自己在 `.husky/pre-commit` 中寫入的內容——僅限 UDS 曾產生過的兩種完全相同的形式（`npx uds check` 與較舊的 `npx uds check --standard checkin-standards`），直接位於其 `# UDS Standard Check` 標記下方——而你自己寫入或編輯的行會保留並報告其行號。它在「already up to date」返回之前執行，因此標準已是最新版本的採用者也會套用此變更。`uds check` 現在會對依然執行空名稱的 hook 發出警告。一項新測試會檢查 `npm pack` 隨附的所有內容，並在任何字串透過套件執行器（npx、bunx、pnpm dlx、yarn dlx、npm exec）執行空的 `uds` 時報錯；非 Node 的原生 hook（`uds check`，僅從 `PATH` 解析，絕不走登錄表）未受影響且維持不變。

## [6.14.0-beta.2] - 2026-09-30

> **預發布版本** — 請以 `npm install -g universal-dev-standards@beta` 安裝。測試重點與如何切回穩定版請參閱：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **修正 6.14.0-beta.1 的已知限制：** 現有專案現在可以透過 `uds update --with-hooks` 取得 Antigravity CLI hook（以及所缺少的 Claude Code / Codex / Gemini CLI hook）。

### 新增

- **`uds open-work next-action | revision | separation | self-test` — `open-work-tracking` 1.1.0 的參考檢查（OWT-017/018/019）現已隨附於 npm 套件中。** 在 6.14.0-beta.1 中，這些檢查僅存在於儲存庫的 `scripts/` 中，而 npm 套件並未包含該目錄，因此採用者若未 clone UDS 便無法執行它們。現在這些規則統一集中於一處：`cli/src/utils/open-work-tracking.mjs`（位於套件內）；`uds open-work` 以及舊有的 `node scripts/check-open-work-tracking.mjs`（現在是個不包含任何規則、僅重新導出該模組的 shim）皆執行同一主體，且測試要求兩者的輸出必須完全一致。檢查邏輯本身完全沒有改變：相同的結束代碼（0 表示無違規，1 表示違規，2 表示無法判定 — 2 不算通過），檢查器仍會先執行自身的 self-test 分支，且每次執行仍會宣告覆蓋率未知（OWT-011）與詞彙未校準（OWT-016）。它依然是作為證據提供的參考判定程序，而非品質閘門。**觀察到的紅燈（Observed red）：** 新測試複製了 CLI，讓指令吞掉結束代碼（一律為 0）或讓共用規則一律通過，並要求違規樣本在此複本中轉為綠燈；同時斷言 `npm pack --dry-run` 必須列出該模組。標準中的「What enforces this standard」章節現在指向此指令，而非僅存在於儲存庫的路徑。

- **`uds update --with-hooks` — 針對已初始化專案的強制執行 hook，以及更寬鬆的 Antigravity 偵測規則。** 以往 hook 僅能透過 `uds init --with-hooks` 進行配置，而 `uds init` 拒絕執行第二次，因此既有的採用者永遠無法取得 UDS 在他們初始化之後才開始支援的工具 hook（此問題是在將 6.14.0-beta.1 套件安裝至全新專案時發現；並記錄為該 beta 的已知限制）。`uds update --with-hooks` 會重新偵測工具（manifest 中的工具加上專案檔案當前顯示的工具）並安裝缺少的 hook；`--ai-tool <list>`（`claude-code`、`codex`、`gemini-cli`、`antigravity`）則改為指定工具名稱，若找不到任何工具，它會提示如何指定並回傳 exit 1，而非胡亂猜測。已安裝的 hook 不會被覆寫（第二次執行不會改變任何東西），採用者自訂的 hook 絕不會被移除或重排（Claude/Codex/Gemini 的條目會進行合併；agy 的 `.agents/hooks.json` 僅寫入 UDS 專屬的 `uds-turn-completion-integrity` 鍵值下，若原本不是合法的 JSON 則會保持原樣），採用者修改過的 hook 指令碼會予以保留，除非加上 `--force`，且 `--plan` 不會寫入任何檔案。此選項就像 `--claude-target` 和 `--sync-refs` 一樣是獨立運作的；在已初始化的專案中執行 `uds init --with-hooks` 現在會引導至此選項，而非默默什麼都不做。**Antigravity 偵測：** 以往它需要 `.agents/AGENTS.md`，但專案使用 agy 很長一段時間都可能從未建立該檔案。現在它也接受 `.agents/rules/`、`.agents/workflows/`、`.agents/plugins/` 與 `.agents/hooks.json` — 這些是 agy 自身二進位檔帶有且 antigravity.google 文件所記載的名稱 — 並且特意**不**採計 Codex 也會讀取的 `.agents/skills/`（根目錄含有 `AGENTS.md` 加上 `.agents/skills/` 的儲存庫仍判定為 Codex；此行為已經過測試）。偵測邏輯僅以專案目錄為依據：曾考慮過 agy 記錄已開啟專案的註冊表 `~/.gemini/projects.json`，但因其屬於機器本機層級而未採用。`.agents/hooks.json` 是一個標記，但它同時也是 UDS 所寫入的檔案，因此在安裝後它僅能證明已安裝，不能作為採用者使用 agy 的證明。**觀察到的紅燈（Observed red）：** 測試會針對已初始化的專案，以子行程方式執行真實的 CLI；而移除回填邏輯的 CLI 複本 — 刪除該分支、安裝程式回報成功卻什麼都不寫入、且偵測範圍重新縮小回 `.agents/AGENTS.md` — 必須無法通過真實 CLI 所通過的相同斷言。針對 agy hook 的現狀依然不變：目前僅驗證過 `agy -p` 模式下無工具呼叫的單一輪對話。

### 修正

- **`turn-completion-integrity` 只要等待人類的前置條件超過固定字數，就會阻擋該輪對話 — 此問題自 6.13 起存在。** 條件承諾（例如「once you choose, I will apply it」）的豁免在英文包中限制在 `you` 與逗號之間最多 20 個字元，在 zh-TW 包中則限制在 `你` 與 `後` 之間 1–6 個字元；這兩個數字當初都是憑感覺設定的。以已發布的 6.14.0-beta.1 搭配真實的 Claude Code Stop-hook 輸入進行測量：「Once you choose A, I will apply it.」通過，而「Once you choose option A or B, I will apply it.」（21 個字元）則遭到阻擋，「After you choose option A or B, I will apply it.」亦同 — 決定結果的是子句的長度，而非 `once`/`after`。由於 hook 僅在該輪對話的*最後*一則訊息觸發，採用者看到的是 agent 在正確停下來詢問後，卻被迫繼續發言。修正方式：豁免現在是以子句邊界（逗號、句末標點符號或換行）為準，而非字數計算，因此「Once you've reviewed the three options above and picked one, I will apply it.」與「你看完上面三個選項並選好一個之後，我會接著套用。」皆可通過。放寬上限可能會讓真正的承諾混過，因此由兩項機制取代字數計算：在英文中，該子句不可包含其自身的承諾（「After you merged it I will follow up, I will push the tag.」依然會被阻擋）；在 zh-TW 中，`你` 必須位於子句開頭且不能是 `你的`（「我看了你的設定檔並判斷需要重構之後，我會接著改。」依然會被阻擋 — 此處的 `你` 是我自身句子中的所有格）。「I will apply it once the build finishes.」並非等待人類，因此依然會被阻擋。**觀察到的紅燈（Observed red）：** 新測試複製了 hook 目錄，將各個舊上限加回去，並要求這些句子在複本中再次遭到阻擋（且 `--self-test` 失敗）。**已知限制，維持不變：** 豁免是以段落為單位判定，因此若段落中包含一個此類的條件子句，其旁邊無關的無條件承諾也會一併獲得豁免，與先前相同；且不含逗號的條件句（「After you merged it I will follow up」）依然會觸發。

- **執行 `scripts/pre-release-check.sh` — 以及在此儲存庫中執行 `git commit` — 會將 UDS skill 寫入執行者的真實家目錄。** 在 2026-09-29，維護者於自身機器上執行發布檢查時，將 54 個 skill 資料夾與一個 `.manifest.json` 寫入了真實的 `~/.claude/skills/` 中。使用者層級的 skill 會覆蓋專案層級的 skill，導致原本使用 zh-TW skill 的專案默默執行了英文版測試組建。過程中每一步都是綠燈：執行此寫入動作的步驟是在 `mkdtemp` 目錄中執行 CLI，這僅隔離了*專案*，而非*使用者* — `uds init -y` 與 `uds update` 無論在哪裡執行，都會寫入使用者層級的檔案（`~/.claude/skills`、`~/.uds`）。透過拋棄式 `HOME` 實際重現與測量，而非憑空假設：`scripts/check-upgrade-fidelity.sh` 寫入了 115 個檔案（其 `uds update` 與前一版本的 `npx … init` 皆繼承了真實的 `HOME`）；而起初懷疑的檢查 `check-adopter-instruction-files.ts` 則什麼都沒寫入。逐一二分搜尋單元測試檔案後又發現了另外兩處寫入者：`tests/commands/update-language-fidelity.test.js` 與 `update-agents-md-generator-fidelity.test.js` 會呼叫真實的 `updateCommand`（將 115 個檔案寫入 `~/.claude/skills`），而 `tests/commands/check.test.js` 寫入了 `~/.uds/update-check.json` — 且 pre-commit hook 會執行單元測試，因此**在此儲存庫中的每一次 commit 都造成了這個問題**；在修正納入之前，該修正本身的作者在修正後的第一次 commit 又再次對真實家目錄造成了寫入。在三個層級進行修正：所有執行 CLI 的指令碼現在一律透過單一來源 `scripts/lib/isolated-home.{mjs,sh}` 在拋棄式 `HOME` 下執行（包含 `HOME`、`USERPROFILE`、`XDG_*`、`APPDATA`、`CODEX_HOME`；此清單僅維護一份，bash 端會自 mjs 讀取），涵蓋了 `pre-release-check.sh` 的 dogfood 步驟、`check-upgrade-fidelity.sh`、`check-prompt-footprint.mjs`、`check-adopter-instruction-files.ts`、`check-skills-install-paths.ts`、`generate-usage-docs.mjs`、`cli/scripts/check-command-existence.mjs`、`cli/scripts/test-upgrade-path.mjs` 以及 `cli/scripts/test-refactoring.sh`；測試套件在 `cli/tests/setup.js` 中替換了每個測試檔案的 `HOME`；且 `pre-release-check.sh` 現在會在開始前對 UDS 在 `HOME` 下會寫入的位置建立快照，若摘要中發現有任何新增或修改則判定為失敗（`scripts/check-home-untouched.mjs`）。受監控的位置並非手動列舉：而是從安裝程式路徑表以及 `cli/src` 中以 `homedir()` 為根的路徑周遊取得，並會印出數量，因此縮小到無項目的集合將無法通過檢查。**觀察到的紅燈，端對端（Observed red, end to end）：** 當 CLI 在未隔離的情況下針對替身 home 執行時，保護機制會以 exit 1 結束並指出 `~/.claude/skills`；在有隔離的情況下則以 exit 0 結束；測試會周遊每個衍生 CLI 的指令碼，並在某個呼叫點的隔離被拔除時亮起紅燈，且探測測試在缺少 `tests/setup.js` 時會失敗。**若您在此修正前執行過 `pre-release-check.sh`，或曾在此儲存庫中提交 commit，**請檢查 `~/.claude/skills/` 是否有 `installedDate` 為當天的 `.manifest.json` 及其旁的 UDS skill 資料夾；使用者層級的 skill 會覆蓋專案層級的 skill，若非您親自安裝，請將其刪除。**刻意不納入監控：** `~/.claude/skills/synced/`，這是 Claude Code 本身在執行時會用帳號的 claude.ai skill 填入的位置（第一次在真實家目錄的完整執行即因執行檢查的 Claude Code session 而失敗於此）；它是保護機制排除清單中唯一且經過深思熟慮的條目，在每次比對時都會印出，若將其移除或擴大至整個 `~/.claude/skills`，測試將會失敗。**未涵蓋部分：** 寫入至任何安裝程式皆未提及之路徑的情況，以及端對端（`tests/e2e`）測試套件（已逐一檔案進行二分搜尋，證實未寫入任何內容）。

## [6.14.0-beta.1] - 2026-09-29

> **預先發布版本** — 透過 `npm install -g universal-dev-standards@beta` 安裝。測試重點與如何回到穩定版本請見：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **已知限制（於 2026-09-29 將此套件安裝至全新專案時發現）：** Antigravity CLI hook 僅會在已存在 `.agents/AGENTS.md` 的**全新**專案中透過 `uds init --with-hooks` 接上（init 是以此檔案偵測 Antigravity）。在既有專案中執行 `uds update` **不會**將其加入，且 `uds init` 拒絕重複執行。因此既有專案在此 beta 版中無法取得 agy hook；預計於下個版本修復。

### 新增

- **`open-work-tracking` 1.1.0：OWT-016 之後的三項要求 — 意圖與進度分離、對意圖的編輯留下紀錄、下一步動作指明具體物件。** OWT-017（警告）：容納工作項目目標、驗收條件或限制條件的載體，不得包含其任何進度或下一步動作；此規則由遍歷各載體的結構判定，絕非透過檔名判斷，因此更新進度絕不需更動目標。OWT-018（錯誤）：對該意圖的每一項變更都必須留下變更內容、核准者是誰以及原因的紀錄；未具備核准者的變更會在 OWT-007 交付返還時列出且絕不靜默略過，而該列表絕不構成阻礙（OWT-008）。OWT-019（警告）：「下一步動作」欄位必須指明檔案路徑、測試名稱、指令或需求識別碼；僅有動詞不算，且測試評判的是否指名了物件，而非句子讀起來是否通順。嚴重程度已在標準中論證。此標準亦記錄了其刻意**不**採用引發此調整的 prompt 中的哪些內容 — 該 prompt 為使用者轉發、作者不明且無實作的文字，標準僅借鑒了其設計雛形：以手寫的狀態檔案作為單一真實來源（它會過期，且比過期內容更新的戳記是無法被察覺的），以及固定的開工儀式（它是在各 agent 工具中配置的，且會變成任何對產物的檢查都無法判定的要求）。新增的 `scripts/check-open-work-tracking.mjs` 是這三項要求的參考判定程序，作為 OWT-015 的佐證提供而非作為閘門（UDS 目前仍未提供閘門，亦未串接進 `pre-release-check.sh`）：`next-action` 回報已命名且已解析／已命名但未解析／未命名，`revision` 比對兩個版本（或檔案對比 `--base <git rev>`）的驗收／目標／限制區段並要求具備全新的完整紀錄，列出無核准者的編輯供交付返還，`separation` 則檢查沒有任何載體同時容納兩者。它會先執行自身的自我測試分支，在無法判定時以狀態碼 2（而非 0）退出，並說明其無法判定的事項 — 紀錄是否誠實描述了變更，以及指明的物件是否正確。**在每次測試執行中均觀察到紅燈：** 測試套件會複製該指令稿、編輯其原始碼文字，並要求在真實指令稿上通過的斷言，必須在 17 個變異體（mutants）上失敗（針對各項要求的一律通過與一律失敗、依序關閉各識別分支、將舊紀錄視為新紀錄、接受不完整的紀錄）。**未校準（OWT-016）：標題詞彙、指令清單、副檔名清單與識別碼樣式皆為初始判斷，而非測量結果** — 例如 `已知限制` 會被解讀為限制區段；採用者應傳入自己的識別碼樣式。在真實歷史上重放執行時，它回報了 XSPEC-436 的驗收條件有所變更卻無修訂紀錄，以及 dev-platform 工作日誌中有一項未命名的下一步動作。

- **`turn-completion-integrity` 1.5.0：現已支援 Antigravity CLI (`agy`)，基於在真實 session 中觀察到的合約。** 該標準先前註明 agy「尚未支援」，是因為其 Stop hook 合約尚未被觀察到（R3：不針對未觀察到的合約建立轉接器）。已於 2026-09-29 觀察到此合約（agy 1.2.12、`agy -p`、單一輪次、無工具呼叫），而轉接器 `scripts/hooks/check-turn-completion-agy.mjs` 是建立在該次執行產出的內容之上，而非僅憑文件：hook payload 僅帶有 `transcriptPath`，因此最終回覆為最後一筆 `MODEL`/`PLANNER_RESPONSE` 紀錄，而人類的訊息為最後一筆 `USER_EXPLICIT`/`USER_INPUT` 紀錄（從 `<USER_REQUEST>` 解開包裝，其後的系統區塊均已捨棄）。`SYSTEM_MESSAGE` 紀錄絕不會被解讀為人類 — agy 會將此 hook 自身的 `continue` 原因以其形式寫回，將其解讀為人類會使 R9 停止豁免失效。阻擋為 `{"decision":"continue","reason":...}`，允許為 `{}`，且所有失敗路徑均為允許。當 Google Antigravity 為所選工具時，`uds init --with-hooks` 會寫入 `.agents/hooks.json`（且不會覆寫無法解析的 `hooks.json`），`uds uninstall` 僅會移除 UDS 自身的處理器並保留使用者的其他 hook。**已驗證範圍：單一輪次、無工具呼叫、`agy -p`。未驗證：多輪次、帶有工具呼叫的輪次、互動模式、`fullyIdle: false`、非空的 `error`、`.agents/hooks.json` 是否需要已註冊的 Antigravity 專案，以及工作目錄是否一律為 `.agents/`** — 標準、轉接器與安裝輸出皆如此說明。**同日實測：agy 執行 hook 時是以 `.agents/` 作為其工作目錄（而非專案根目錄），且會靜默放行啟動失敗的 hook，因此安裝的指令為 `node ../scripts/hooks/check-turn-completion-agy.mjs`。**

## [6.13.1] - 2026-09-28

> **修補版發布**：修復了 6.13.0 在使用 `uds update` 升級現有專案時暴露的兩個缺陷（zh-TW 的 commit 語言章節變成英文；AGENTS.md 被重寫為不同格式且缺少索引提醒），並新增了在發布前從前一個穩定版本執行真實升級的閘門。**如果你已經執行 `uds update` 升級至 6.13.0，請在升級到 6.13.1 後再次執行 `uds update`** 以還原這些章節。

### 新增

- **`scripts/check-upgrade-fidelity.sh`，接進 `pre-release-check.sh` 作為步驟 24：在每次發布前執行的真實跨版本 `uds update` 升級檢查。** 上方修復的兩個回歸具有相同的特徵——只有當一個由前一個穩定版本更新過的既有專案針對較新版本執行 `uds update`/`uds update --apply` 時才會觸發——而 pre-release-check.sh 的其他 31 個步驟以及 CI 都錯過了這兩個問題，因為它們都沒有執行真正的跨版本升級：`uds init` 是全新執行（無從回歸），而 `uds update` 針對與 manifest 已記錄版本相同的隨附登錄表版本會在觸發損壞程式碼之前提前返回。此檢查使用從 npm 擷取的真實、已發布的前一個穩定版本建構了三種專案形態（對應遇到這些 bug 的三個真實採用者），透過純 `uds update -y` 與 `uds update --apply` 使用受測的 CLI 升級各專案，並斷言：UDS 標記區塊以外的內容絕不改變；其內部的內容僅因真實升級允許新增的標準清單／計數而改變；commit 訊息語言標題（CLAUDE.md）逐位元組相同，而不僅僅是存在；「此檔案僅為索引」提醒存在；`uds update -y` 與 `uds update --apply` 對產生檔案的產生器有一致的認定；且在第一次 `--apply` 之後立即執行第二次不改變任何內容。若無法連線至 npm 或前一個版本從未發布，則顯著失敗（結束碼 2，而非略過）——此檢查的全部價值在於演練真實的發布版本，缺少它而默默通過只會重新打開它原本要消除的盲點。雙向驗證：`--cli="npx -y universal-dev-standards@6.13.0"` 重現了上述兩個回歸（CLAUDE.md 語言翻轉與 AGENTS.md 產生器翻轉），並印出實際的 diff；本機開發版 CLI（套用 commit `e1524872` + `8373207d`）在三種形態上乾淨通過。

### 修正

- **純 `uds update -y`（非 `--apply`）會默默將專案的繁體中文 CLAUDE.md commit 訊息標題替換為英文標題，且可能會回報忽略了專案顯示語言的 `--plan --integrations-only` dry-run diff。** `updateCommand` 的主要流程與其 `--plan` dry-run 各自獨立地僅從 `output_language`/`commit_language`（commit 訊息語言）推導整合區塊的內容語言，忽略了 `display_language`（`uds init` 與協調器一直用於「你想閱讀什麼語言」的設定）。因此，以 `display_language: zh-tw` 與 `output_language: bilingual` 安裝的專案（常見組合）從 `init` 獲得了正確的 `## 提交訊息語言` 標題，卻在下一次純 `uds update` 中變成了 `## Commit Message Language`，丟棄了原本已經正確的語言選擇。在升級 6.12.0 → 6.13.0 時針對兩個真實採用者（asiaostrich-telemetry-server、EngramGraph）進行測量。該 bug 早於 6.13.0（自 2026-03-25 的 commit `ad555d41` 起便存在），且每當 `uds update` 針對已經是最新版本的專案執行時都看不見，因為在這種情況下它在接觸到這段程式碼之前就提前返回了——它只有在真正的版號遞增時才會浮現，這就是為什麼它看起來像新回歸。`buildToolIntegrationConfig`（由 `--apply`／協調器使用）已經具備了正確的推導邏輯（於 2026-09-16 加入）；兩個剩餘的呼叫點現在都透過新的 `resolveIntegrationLanguage(manifest)` 共用它。一項回歸測試針對真實暫存專案與真實產生器重現了確切的缺陷（無 mock），且靜態守衛會在舊的行內推導重新出現在 CLI 原始碼中的任何位置時失敗。
- **`uds update --apply`（協調器）只要 `generateAgentsMd` 曾經寫入過檔案，就會將專案的 AGENTS.md 重寫為完全不同、opencode 形態的文件——即使在全新 `uds init` 之後且無其他變動的第一次 `--apply` 也是如此。** `desired-state-calculator.js` 的 `calculateIntegrations` 透過 `resolveToolKey` 將名為 `AGENTS.md` 的任何 `manifest.integrations` 項目解析為 `opencode` 工具，無論 opencode（或其別名 `codex`）是否是實際選取的 AI 工具——一旦寫入通用摘要，`uds init` 總是會在那裡記錄 `AGENTS.md`（這是一個追蹤標記，而非工具選擇的紀錄），因此每個設定了 `generateAgentsMd: true` 且未選取 codex/opencode 的專案都受到了影響。根據產生器自己的設計說明（於 2026-08-20 加入）：各工具專屬的範本只有在確實選取了 codex 或 opencode 時才應取代通用摘要。在三個真實專案（asiaostrich-telemetry-server、EngramGraph、dev-platform 自己的 `.standards/`）上獲得確認，其 `aiTools` 均不包含 codex/opencode 項目。`calculateIntegrations`（以及 `plan-executor.js` 的 `executeMigrateBlock`）現在會檢查工具是否確實被選取，未被選取時，則透過純 `uds update` 已經使用的同一個 `writeAgentsMdSummary` 產生——`--apply` 與純 `uds update` 現在達成了一致。新的回歸測試驅動真正的 `uds init`/`uds update`（無 mock）；在還原修復後確認變紅，包含第二次 `--apply` 的冪等性檢查，該檢查捕獲了在建置修復時引入的後續雜湊不收斂 bug（見下一條）。
- **通用 AGENTS.md 摘要的「此檔案為索引，非標準本身」提醒（於 2026-08-18 加入）從未進入既有專案的託管區塊——僅存在於其固定標頭中，而基於標記的更新絕不會為已存在的檔案重新產生標頭。** `writeAgentsMdSummary` 對於已存在的檔案，僅會替換 `<!-- UDS:STANDARDS:START/END -->` 標記之間的內容；該提醒原本位於標頭中、標記之外。在兩個真實採用者（asiaostrich-telemetry-server、EngramGraph）上測量：在真實更新的前後，該提醒既不存在於檔案標頭中，也不存在於區塊內。該提醒現在也存在於標記區塊內部（用字與工具專屬產生器自己的宣告 `generateIndexDisclosure` 完全相同——並非第三種措辭），因此每個專案在下一次執行 `uds update`/`--apply` 時都會收到它，無論是新檔案還是既有檔案。透過工具專屬產生器已經使用的相同 `wrapWithMarkers` 輔助函式建構此區塊（而非手寫標記行），也修復了在加入它時發現的相關缺口：全新建立的 AGENTS.md 從未帶有「DO NOT manually edit」警告註解，因為過去只有合併路徑會加入它。

## [6.13.0] - 2026-09-28

> **正式版發布**：包含下方 6.13.0-beta.1 至 beta.5 的所有內容，自 beta.5 以來無變更。重點摘要：回合完成度 hook（代理在陳述了未採取的下一步動作時不得結束回合）現在涵蓋 **Claude Code 與 Codex**，並在從 npm 安裝的兩者真實 session 中完成驗證（Codex 僅在以 `/hooks` 信任它之後才會執行）；Claude Code hook 確實能阻擋（在 beta.4 之前它允許所有回合）；可在 Windows 上運作；`uds uninstall` 會將其移除；`uds init` 讓 pre-commit 檢查確實執行；`developer-memory` 1.2.0。Gemini CLI 被標記為 legacy（Google 在個人帳號上停用了它，改推尚未支援的 Antigravity CLI）。

## [6.13.0-beta.5] - 2026-09-28

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。**如果你安裝了 6.13.0-beta.1–beta.4，請升級：這些版本中的 Claude Code 回合完成度 hook 從未阻擋過。**

### 修正

- **Claude Code 回合完成度 hook 在真實 Claude Code session 中從未阻擋——6.13.0-beta.1 至 beta.4 的每個採用者都串接並執行了它，而它允許了每個回合。** 2026-09-28 在即時 `claude -p` session 中使用 Claude Code 2.1.283 測量：當 Stop hook 執行時，transcript 尚未包含最終的助理訊息，因此配接器（僅讀取 transcript）看到了空訊息，並在應阻擋的 5 個回合中允許了 5 個；在較長的 session 中，它反而會判定前一個回合的訊息。所有的自我測試與單元測試全程通過，因為每個測試傳給配接器的都是已經完整的 transcript。配接器現在從 stdin 的 `last_assistant_message`（由 Claude Code 發送）取得最終訊息，且僅為人類端（R9）以及不發送該欄位的版本之後備讀取 transcript。修復後在線上重新測量。新測試重現了 hook 在該時刻實際看到的形態，並在舊配接器上失敗。
- **Codex 的 hook 已安裝但從未執行，且沒有任何提示說明。** Codex 會略過專案 hook，直到該專案受到信任且該特定 hook 透過 `/hooks` 受到信任為止——在 `codex exec` 下會默默略過。`uds init --with-hooks` 現在會在 Codex 安裝行旁說明這點，標準的 *Supported harnesses* 與 `docs/PRE-RELEASE.md` 也納入了該步驟。一旦受到信任，Codex 配接器便完全按照其測試所宣告的進行阻擋與允許（2026-09-28 測量，codex-cli 0.155.1）。

### 變更

- **`turn-completion-integrity` 1.4.1：Gemini CLI 配接器現在標記為 legacy，且指名尚未支援 Antigravity CLI。** Google 於 2026-06-18 在個人帳號上停用了 Gemini CLI，改推 Antigravity CLI（`agy`）；企業帳號則兩者皆保留。配接器為企業帳號保留，但從未在真實的 Gemini CLI session 中確認過，因此不再將其與 Claude Code 和 Codex 配接器並列對待。Antigravity CLI 文件所記載的 Stop hook 合約與所有隨附的配接器都不同（設定在 `.agents/hooks.json`；payload 僅帶有 `transcriptPath`，無最終訊息或人類訊息；阻擋為 `{"decision":"continue"}`），因此在該合約於真實 session 中觀察到之前不發布配接器——這與讓 Cursor 維持不支援的規則相同。無行為變更：當選取 Gemini CLI 時，`uds init --with-hooks` 依然會串接 Gemini CLI hook。

## [6.13.0-beta.4] - 2026-09-28

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。註：6.13.0-beta.3 從未發布至 npm；其變更包含於此。

### 修正

- **在 Windows 上，截至 6.13.0-beta.3 的每個採用者，`turn-completion-integrity` 的 Stop hook 都默默失效——它執行了、找不到語系包，於是不加檢查且不印出任何內容就讓每個回合結束。** `engine.mjs` 的 `loadPacks()` 使用 `join(HERE, 'locales', ...)` 建構每個語系包的路徑，並將該檔案系統路徑直接傳給動態 `import()`；在 Windows 上該路徑為 `C:\...`，並非有效的 ESM import 識別碼（POSIX 絕對路徑恰好也能被解析為有效識別碼，這就是為什麼在 macOS/Linux 上未被察覺）。2026-09-27 在 CI（windows-latest）中測得：每個隨附的語系包都載入失敗，且每個應回傳 `block`/`deny` 決定的配接器（Claude Code、Codex、Gemini CLI）都回傳了 `undefined`。使用 `pathToFileURL(...).href` 修復，這與 `cli/src/utils/standard-fixer.js`/`standard-validator.js` 已經正確使用的轉換相同。四個 `scripts/check-*.ts` 開發工具腳本具有完全相同的形態（Windows CI 工作未執行它們，因為它們僅在 `ubuntu-latest` 上執行，但在那裡也是壞的），並以相同方式修復。一項新的儲存庫全域測試（`cli/tests/unit/scripts/no-fs-path-dynamic-import.test.js`）會遍歷 `scripts/`、`cli/src/` 與 `cli/scripts/` 尋找此種形態，以確保未來任何地方發生此問題都會在任何平台上失敗，而無需任何人記得這次事件。
- **由 husky 管理的 `.husky/pre-commit`（由 `uds init` 寫入）在 Windows 上使每一次 commit 都失敗並顯示 `error: cannot spawn .husky/pre-commit: No such file or directory`，即使 `core.hooksPath` 正確串接也一樣——截至 6.13.0-beta.3 的每個採用者皆受影響。** husky v9 自己的範本不帶 shebang 行，在 macOS/Linux 上一直運作良好，因為當腳本沒有 shebang 時 POSIX git 會退回使用 `/bin/sh`（`ENOEXEC`）；git for Windows 沒有這種後備機制，完全無法產生無 shebang 的檔案，且錯誤指名的是 hook 檔案而非遺失的直譯器——很容易被誤診為串接問題而非內容問題。`uds init` 現在在任何平台上寫入新 hook 或修改既有採用者檔案時，若缺少 shebang 會為 husky 管理的 hook 開頭加上 `#!/bin/sh`（僅在開頭加上——採用者自己的 shebang 或任何其他行絕不重寫）。`uds check` 的 `[pre-commit]` 警告增加了 `missingShebang` 訊號，獨立於串接狀態回報（由於此原因，hook 可能已完整串接於 commit，卻依然在 Windows 上使每一次 commit 失敗），且依其既有設計為唯讀。

## [6.13.0-beta.3] - 2026-09-27

> **預發布版本** — 請使用 `npm install -g universal-dev-standards@beta` 安裝。測試重點、已知限制以及如何切回正式版本請見：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### 修復

- **`uds init` 寫入了 pre-commit hook（`.husky/pre-commit`，非 Node 專案則為 `.git/hooks/pre-commit`），卻從未確認 git 是否真的會執行它。** 它依賴 husky 自帶的引導機制 — 透過 `npm install` 觸發 husky 的 `prepare` 腳本以設定 `core.hooksPath` — 但這只會在下一次執行 `npm install` 時才會觸發；如果 `node_modules` 已經存在，該流程就永遠不會執行。經由三個真實採用專案驗證（asiaostrich-telemetry-server、asiaostrich-telemetry-client、machine-setup，2026-09-26）：這三者皆包含呼叫 `npx uds check` 的 `.husky/pre-commit`，但沒有任何一個設定了 `core.hooksPath`，且該檢查在 commit 時從未執行過 — 靜默跳過且沒有任何錯誤。`uds init` 不再為採用專案安裝 husky 或修改 package.json 的 dependencies；而是直接設定 `git config --local core.hooksPath .husky`（即 husky 內部引導機制所執行的相同動作），因此無論是否安裝過 husky，在 `uds init` 之後該檢查都會立即生效。絕不覆寫採用專案自身的 `core.hooksPath` 或既有的 `.git/hooks/pre-commit` — 兩者皆會保持原樣，並附帶訊息說明該檢查未被啟用及其原因。非 Node 的原生 hook 路徑也不再無條件覆寫既有的 `.git/hooks/pre-commit`（過去會覆寫）。新增的 `uds check` 警告 `[pre-commit]` 可偵測已存在但不在 git 實際執行路徑上的 UDS 管理 hook 檔案（涵蓋直接串接、husky 自身的 `<dir>/_` shim 轉發以及原生預設路徑），並回報修復方法 — 這是已存在此缺陷的採用專案（如上述三個儲存庫）察覺此問題的方式。僅供參考建議；不影響 `uds check --ci` 的結束碼，因為這是各 clone 的本機設定落差，而非標準合規性缺陷。`core.hooksPath` 絕不會被 commit，因此這項設定僅套用於執行 `uds init` 的該份 clone — 提示訊息與新增的 `uds check` 警告皆有註明此點。

- **後續追蹤（2026-09-27）：上述的 pre-commit 修復，若採用專案既有的 `.husky/pre-commit` 仍包含 husky v8 的 `_/husky.sh` 引入行，可能導致每一次 commit 都失敗。** 經由上述三個採用專案之一的真實拋棄式 clone 驗證：在舊版範本上執行 `uds check` 本身建議的修復動作（`git config --local core.hooksPath .husky`）會產生 `.husky/pre-commit: line 2: .husky/_/husky.sh: No such file or directory` 且 `git commit` 以結束碼 1 退出 — 比原先的靜默跳過缺陷更嚴重，因為該 `.husky/_/` shim 目錄只有在 husky 自帶的引導機制實際執行後才會存在，而直接將 `core.hooksPath` 設為 `.husky` 會讓 git 直接照原樣執行該檔案。`uds init` 的 `setupHuskyHook` 現在在重寫 `.husky/pre-commit` 時會偵測並移除該行（保留其餘所有內容 — 採用專案自行加入的指令、既有的 `uds check` 行）；當 `uds check` 的 `[pre-commit]` 警告偵測到舊版引入行時，也不再單獨建議 hooksPath 修復 — 而是改為提供兩步驟修復方案（先刪除該行，再設定 hooksPath），因為 `uds init` 在已初始化的專案上會完全拒絕執行，無法直接替已發現的三個真實採用專案修復此問題。在 `git-hooks.js` 中新增了共用輔助函式 `hasLegacyHuskyShLine`/`stripLegacyHuskyShLine`。

- **`bump-version.mjs` 在預發布 -> 預發布版本遞增時，錯誤標記了 `SECURITY.md` 中的 "Latest stable"（最新正式版）列 — 於 6.13.0-beta.2 發布時（2026-09-26）實測發現，當時採手動修復。** 其 `SECURITY.md` patch 透過尋找「帶有純 X.Y.Z 版本的列」來識別正式版本列；新的預發布版本（例如 `6.13.0-beta.2`）一律帶有連字號且絕不會符合該模式，因此該 patch 落入了唯一看起來像純版本的列 — 毫無關聯的正式版本列 — 並將其版本覆寫為新的預發布版本，同時保留了過期的預發布版本列（仍為 `6.13.0-beta.1`）未作更動。將表格產生邏輯（在 `generate-docs.mjs` 中已是正確的，但未被 `bump-version.mjs` 使用）抽取出獨立的共用檔案 `scripts/lib/security-versions.mjs`，現在這兩份腳本都會根據 `(version, stableVersion)` 重新產生整個 2 或 3 列的區塊，而不是就地 patch 單一匹配列 — 透過在隔離的儲存庫副本上實際執行端對端 `bump-version.mjs`，驗證了在所有四種版本類型轉換（正式→正式、正式→預發布、預發布→預發布、預發布→正式）以及所有三種發布語言中皆運作正確。`check-version-sync.sh` 既有的 SECURITY.md 檢查僅比對第一筆資料列的版本與 `package.json`（這剛好捕捉到了這次的具體事件，屬於以位置為基準的代用指標）；現在它還會交叉檢查每一列的標籤（LABEL）與其自身版本的格式特徵（當「Latest stable」/「最新正式版」列含有帶連字號的版本，或「Pre-release」/「預發布版本」列含有不帶連字號的版本時，即使單靠位置檢查能通過，也會被標記警告）。

## [6.13.0-beta.2] - 2026-09-26

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### 修正

- **`uds uninstall` 從未移除 `installHooks()`/`installCodexHooks()`/`installGeminiHooks()` 寫入的強制執行 hook——不僅針對 Codex 與 Gemini CLI（6.13.0-beta.1 記錄的已知限制），對 Claude Code 自己的 `.claude/settings.json` 也是如此，它存在完全相同的缺口且從未被回報過。** `hooks` 反安裝類別僅處理過 `.husky/pre-commit` 與 `.git/hooks/pre-commit`；三個安裝程式實際寫入的 settings/config 檔案從未被任何反安裝程式處理過，因此每個強制執行 hook 在執行 `uds uninstall` 後依然繼續執行。新的 `uninstallClaudeCodeHooks`/`uninstallCodexHooks`/`uninstallGeminiHooks`（`src/uninstallers/hook-uninstaller.js`）現在精確地從 `.claude/settings.json`、`.codex/hooks.json` 與 `.gemini/settings.json` 中移除 UDS 安裝的項目——透過命令路徑*以及*目前已知 UDS 所隨附的腳本基底名稱識別，而非僅憑路徑，因此放置在 UDS 架構的同一個 `scripts/hooks/` 目錄下的採用者自訂 hook 腳本絕不會被移除。移除後留空的事件陣列會從設定中移除；完全留空的設定檔（意味著它只包含 UDS 寫入的內容）會被刪除，否則會在其他內容完好無損的情況下重寫。格式錯誤的 JSON 會被報告為錯誤並保持原樣而非覆寫。已接進 `uds uninstall` 既有的 `hooks` 類別、其 `--dry-run` 預覽，以及互動式選單對該類別的說明中。
- **Codex 配接器的 R9 豁免（「人類要求結束回合」）在真實的 Codex 安裝中從未真正觸發過——`scripts/hooks/check-turn-completion-codex.mjs` 中的 `bestEffortLastUserMessage()` 嘗試讀取的兩種紀錄形態都讀取不到。** 在真實的 codex-cli 0.156.1 `~/.codex/sessions/**/*.jsonl` transcript 上驗證：使用者訊息紀錄為 `{"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":...}]}}`——訊息位於 `payload` 下，而非紀錄的頂層，也不是在 `message` 鍵下，因此該欄位總是被讀為不存在，R9 永遠無法豁免 Codex 回合。現在會先讀取 `payload.type === "message"`（對於可能使用它們的任何其他紀錄型別，後備至兩種原始形態），在既有的 `text` 形態旁提取 `input_text` 內容項目，且不將 `role: "developer"` 紀錄視為使用者訊息。`core/turn-completion-integrity.md` 的「Supported harnesses」章節與 `docs/PRE-RELEASE.md` 已從「未在真實安裝中確認」更新為確認的形態。
- **R9 的 zh-TW 停止請求偵測器遺漏了「我要出門了，等我回來再繼續」的措辭——實地測得：「我要出門了，等我回來再繼續」確實在 2026-09-25 誤觸了 Claude Code 回合完成度阻擋。** 該句子與「暫停，我要出門」都不符合任何既有的 `STOP_REQUEST` 替代選項。新增了兩個狹義的替代選項，要求離開用詞（出門/離開一下/先走）與「稍後繼續」用詞（等我回來/回來再/明天再/晚點再/待會再）或單純的詞彙「暫停」在同一短跨度內同時出現——單純的離開用詞（「出門前把這三件做完」，即在離開前完成某事的指示）依據語料庫仍不予豁免。在審核英文包的相同缺口時，發現 `\bI'?m (heading|going) (home|out)\b` 是無法觸及的死程式碼：`isStopRequest()` 總是先呼叫 `normalize()`，它會將「I'm」重寫為「I am」，因此僅含縮寫的模式永遠無法匹配；修復為 `I(?:'m| am) (heading|going) (home|out)`，在單純的「I'm heading out.」上驗證了修復前為 false / 修復後為 true。

## [6.13.0-beta.1] - 2026-09-26

> **預發布版本** — 請以 `npm install -g universal-dev-standards@beta` 安裝。測試重點、已知限制與如何返回穩定版本請參閱：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。已知限制：`uds uninstall` 尚未能移除 Codex / Gemini CLI 的 hook 項目。

### 新增

- **`turn-completion-integrity` 1.4.0 將 Stop hook 擴充支援至 Codex 與 Gemini CLI，與現有的 Claude Code 配接器並列。** 判定邏輯（語系套件、冷卻時間、滑動視窗、自身回音標記）已移入共用的 `turn-completion/engine.mjs`，讓三個個別 harness 腳本負責轉譯各自工具的合約，而非各自攜帶一份重複的偵測邏輯。Codex（`.codex/hooks.json`，Stop 事件）直接從 stdin 讀取 `last_assistant_message`，並在 exit 0 時於 stdout 透過 `{"decision":"block","reason":...}` 進行阻擋——其官方文件指出此處純文字或空白 stdout 均為無效輸出，這與 Claude Code 靜默即代表允許的行為不同；使用者的最後一則訊息則以盡力而為（best-effort）的方式從 `transcript_path` 讀取，因為其確切 schema 尚未在實際安裝環境中確認，因此 R9（豁免由人類指示的中止）在 Codex 上屬於已記錄的文件缺口，而非靜默失敗。Gemini CLI（`.gemini/settings.json`，`AfterAgent` 事件）直接在 stdin 取得 `prompt` 與 `prompt_response`——無需解析 transcript——並透過 `{"decision":"deny","reason":...}` 進行阻擋，這是相較於 exit code 2，官方文件所記錄「所有邏輯首選」的路徑。`uds init --with-hooks` 現在也會呼叫 `installCodexHooks`/`installGeminiHooks`，並依照採用者是否選擇該工具進行閘控，因此不會對未使用 Codex 或 Gemini CLI 的專案寫入任何內容。Cursor 經過評估後被明確列為不支援（其 stop hook 是否能真正阻擋輪次仍未解決）。請參閱 [Supported harnesses](core/turn-completion-integrity.md#supported-harnesses) 與 [CLI-INIT-OPTIONS.md](docs/CLI-INIT-OPTIONS.md#enforcement-hooks-beyond-claude-code)。

- **`developer-memory` 1.2.0：`code-reference` 過期檢查——引用了已移動或不存在的檔案路徑或符號之記憶，現在會在浮現給使用者前被標記出來，而非靜默重複使用。** 複用 `knowledge-graph-memory` 1.0.0 已定義的兩種運作模式（§2），而非另創第三種模式：降級模式（無圖引擎——助理自行透過 Glob/Grep/Read 驗證引用，機制與現有的記憶驗證原則相同）與引擎模式（圖引擎例如 EngramGraph 的 `egr refs check`，回報每筆引用為 `present` / `moved`（附帶新位置）/ `missing` / `unresolvable`）。`unresolvable` 絕不可解讀為 `present` 或 `missing`——它代表檢查器無法判斷結果，而非引用正常或已消失。已掛鉤至現有的 `proactive-surfacing` 規則（§4.1），因此檢查是在記憶顯示之前執行，而非之後。第一批次僅涵蓋檔案路徑與符號名稱（函式/類別）；`file:line` 明確排除於範圍之外——行號會隨無關的編輯而漂移，屬於另一種過期型態（參見 DEC-115 OQ-1，於 2027-01-31 前重新審視）。`core/developer-memory.md` §11 新增了非規範性的 Claude Code `SessionStart` hook 範例；其他工具則各自透過其存放庫指令檔（CLAUDE.md/AGENTS.md/.cursorrules/等）進行路由。(DEC-115-L1)

### 修正

- **`turn-completion-integrity` 的 zh-TW 與 en 偵測器誤觸發於前提條件為人類自身決定的條件式承諾。** `"你選定後，我會把這一輪的發想寫成正式決策紀錄…"`（"once you decide, I will write up …"）被誤讀為未履行的承諾——現有的豁免條款僅涵蓋索取資訊或要求回報，未涵蓋表述為人類決定的前提條件。zh-TW 新增了狹義的 `你 + 短決定動詞（選定/選好/決定/確認/回覆/點頭）+ 後 + 逗號 + 我` 模式；en 則新增基於文法的 `(once|after|as soon as) you ..., I` 模式，符合該語言套件現有無動詞清單的設計，而非列舉動詞。兩個語料庫均加入了成對的反例（主詞非「你」/「you」，或僅具備一半的句型結構），證明收窄範圍後不會遺漏真正的未履行承諾；en 套件也記錄了一項刻意未涵蓋的已知限制（前提條件與 "I" 之間若無逗號仍會觸發，因為若放寬超過此範圍將有遺漏真正承諾的風險）。

## [6.12.0] - 2026-09-25

### 新增

- **新標準 `open-work-tracking` — `deferred-item-exit` 的下游後半部分。** `deferred-item-exit` 要求延後的項目必須離開其文件以實現可追蹤的退出，但刻意未指定該退出的載體；沒有任何機制能防止項目到達後載體本身的腐化。本標準以 16 項要求（OWT-001..016）涵蓋它：低摩擦的擷取點（最多兩個必要欄位）、記錄在每個等待項目旁的解除條件、產生而非手寫的可推導欄位、從內容證明而非單純可編輯時間戳記的時效性主張、說明其無法看見內容的覆蓋率數值，以及回報未完成工作但絕不阻擋的回合結尾檢查點。最後一點刻意與 `turn-completion-integrity` 相反（後者掛接同一個事件並進行阻擋）；標準中的比較表防止採用者將兩者串接為一體。其兩個數值門檻被標記為初步判定，而非測量值。

## [6.11.0] - 2026-09-18

### Fixed

- **`uds update --plan`/`--apply` 對整合檔永遠無法收斂：即使剛執行完 `--apply`，在一個內容與產生結果逐位元組完全相同的檔案上，仍持續顯示 `Migrate Block: N`。** `diffIntegrations` 過去對任何帶有 UDS 標記的整合檔一律產生 `migrate_block` 動作——「因為內容是動態產生的，所以我們一律更新整合檔」——這是因為預期狀態從未帶有可用於比對的雜湊值（`hash: null`，「產生後計算」，但之後實際上從未計算）。預期狀態計算器現在以與 `--apply` 本身相同的方式產生整合內容（`buildToolIntegrationConfig` + `generateIntegrationContent`），並僅對 UDS 區塊計算雜湊，因此 `diffIntegrations` 現在能像處理所有其他類別一樣區分「內容已相符」與「內容不同」，並在相符時回報 `unchanged` 而非 `migrate_block`。區塊確實過期（手動編輯過，或由舊版 CLI 產生）的檔案仍會像以前一樣產生 `migrate_block`。若因任何原因導致產生失敗（例如 registry 無法解析的工具），則會回退到舊有無條件處理的行為，而不是讓 plan 當掉。
- **`uds check` 在單次執行中可能會對同一個整合檔印出兩條互相矛盾的「已參考」聲明。** `standardsReferenced`（「{count}/{total} standards referenced」）掃描整個整合檔內文——只要提到標準名稱的每一處都算。`standardsNotReferenced`（「Standards not referenced (optional):」）則僅檢查結構化的 `Reference:`/`參考:` 行。在檔案敘述中提到但從未列在 `Reference:` 行的標準，在同一次執行中既滿足了第一條聲明，又未能通過第二條聲明——相同的英文／中文詞彙（「referenced」／「參考」），兩種不同的衡量方式，讀起來像自相矛盾。已在所有三種語系中重新命名第二條訊息，精確說明它所檢查的項目（未出現在 `Reference:`/`參考:` 行），而非一概而論的「未參考」聲明。
- **單純執行 `uds update --plan` 與 `uds check` 從未提示 Skills 或 Commands 落後於最新的 UDS 版本。** 版本過期狀態過去僅由 `uds update --plan --skills`/`--plan --commands` 計算——一般協調用的 `--plan`（未指定範圍旗標）呼叫了另一個從未觸及該狀態的函式，而 `uds check` 完全沒有對等的功能。採用者執行普通的 `--plan` 或 `check` 時，即使 Skills 落後整整一個次要版本，看到的也是乾淨的報告，完全沒有提示指定範圍的 plan 或 `uds update --skills` 有工作要做。現在，當任何已安裝的 Skills 或 Commands 版本落後時，兩者都會印出簡短的 `<tool> (<location>): vOLD → vNEW` 附註，並附上修復它的指令。此設計參考現有的頂層「Version: X → Y ⚠」列，而非整合區塊完整性檢查（XSPEC-418 R1）：在採用者更新之前，落後於最新發布版屬於常態且預期的狀態，不像被修改／遺失的 UDS 區塊那樣屬於合規缺陷——因此它不會導致 `uds check --ci` 失敗。
- **6.10.0 的無效連結重寫（P2）刪除了針對 6.0.0 之前檔案名稱編寫的參考，而不是予以重寫，並可能留下懸空的逗號。** `resolveStandardReferences` 過去僅將 `Reference:` 行的檔名幹與 manifest 的已安裝清單進行比對——從未與 `STANDARD_ID_MAPPING`（conversion-rules.js）比對，而這是 `yaml-generator.js` 在其他地方早已使用的「舊檔名→目前 ID」對照表。在安裝了 `commit-message` 的專案中，讀取到 `.standards/commit-message-guide.md` 的一行看起來完全就像專案選擇不安裝的廢棄、UDS 所屬標準，因此被刪除而非重寫為 `.standards/commit-message.ai.yaml`。另外，刪除後的逗號清理僅處理了結尾逗號、重複逗號或逗號前的多餘空格——當該行中的第一個參考被移除時，留在冒號後面的逗號則未被處理（`Reference:, .standards/other.ai.yaml`）。現已重建為「分割 → 解析或捨棄 → 組合」，而不是在被刪除的子字串周圍修補標點符號。
- **被 6.10.0 `resolveStandardReferences` 錯誤刪除的主要標準參考不會自行恢復，即使在上述修復之後也是如此。** 重寫掉刪除所留下的懸空逗號只能恢復該行的標點符號，而無法恢復被刪除的項目本身——UDS 規則範本區段（例如「## 提交訊息標準」）位於 UDS 標記之外，因此一旦項目消失，沒有任何機制會重新產生其內容。為此單一情況新增了狹窄、刻意限定範圍的自動修復：當某行的標題與 UDS 規則範本標題完全相符（`RULE_TEMPLATES` 隨附的任何語言），且該範本的主要參考（其專屬 `Reference:`/`參考:` 行上的第一個 `.standards/...` 項目）在檔案的該行中遺失，而且該標準確實已安裝時，它會被重新加回最前面——該行上的所有其他內容（專案自己的項目、選項檔案、現有順序）均保持不變，絕不還原次要範本項目，且絕不觸及使用者編寫的區段（任何其他標題）。具等冪性。僅修復 6.10.0 刪除所造成的問題；不嘗試修復因無關的手動編輯而損壞的參考。
- **單純的 `uds update` 從未修復上述 Q1 錯誤所留下的損壞 `integrationConfigs[file].categories`——只有 `--sync-refs` 能修復。** 已經帶有 `categories: []` 的 manifest（來自較舊、有問題的 `--sync-refs` 執行）在後續每次執行單純的 `uds update --yes` 時仍保持損壞：該指令本身的整合同步步驟會寫入 `integrationBlockHashes`，但甚至從未讀取 `integrationConfigs`，因此那裡的任何東西都未曾更正它——接著下一次 `uds check --restore-missing` 就會從該損壞的儲存設定中重建整合檔，再次無聲無息地遺漏區段。`uds update` 現在會以與 `--sync-refs` 相同的方式（`calculateCategoriesFromStandards`）修復空白或無法辨識的 `categories` 值，並保持已有效的清單不變，因此單純的更新不會在每次執行時變成完全重新同步。
- **`uds update --sync-refs`/`--integrations-only`/`uds check --migrate`/`uds config` 可能會無聲無息地將 `manifest.version` 降級，且相同的同步路徑在正常的 3.4.0 manifest 上計算出了空的類別集合。** 五處寫入點寫死了舊的 schema 版本字面常數（`'3.1.0'`/`'3.2.0'`/`'3.3.0'`），而非 CLI 目前的 schema 版本（`3.4.0`）——在已經是目前版本的 manifest 上執行這些指令中的任何一個，都會將版本往回寫。另外，`calculateCategoriesFromStandards`（`--sync-refs` 用來決定哪些區段屬於 CLAUDE.md/AGENTS.md 的函式）透過檔名查詢每個標準，但 3.4.0 的 manifest 儲存的是純檔名幹（`commit-message`，而非 `commit-message.ai.yaml`）——每次查詢都落空，類別集合回傳為空，接著下一次 `--sync-refs`（或 `--restore-missing` 重建）重新產生的檔案就完全遺漏了 anti-hallucination/commit-message/code-review 區段。兩者現在都在其單一真實來源處獲得修復：共用的 `bumpManifestVersion` 輔助函式只會將 manifest 的版本推向目前版本，絕不倒退；以及在同一檔案中其他地方已經使用的同一個能辨識檔名幹的類別查詢（`categoryForStandard`）。這將類別計算還原為 6.10.0 之前 `--sync-refs` 推導它的方式——從實際安裝的標準計算，而非固定清單——因此完全重新產生（`--sync-refs`、`--integrations-only` 或單純的 `uds update`）現在會寫入背後擁有規則範本與已安裝標準的每個區段（目前為 9 個），而不僅僅是全新 `uds init` 播種的 3 個區段；對於已經擁有完整區段集合的專案，其單純的區塊更新不受影響。
- **僅僅提及 UDS 標記文字的句子可能會被誤認為真正的區塊邊界，且提及處與真正的 END 標記之間的所有內容——包含採用者自己的內容——全被刪除（v3.5.0–6.10.0）。** 每個定位標記的呼叫點都直接使用 `content.indexOf('<!-- UDS:STANDARDS:START -->')`/`.indexOf('...:END -->')`，這會匹配檔案中任何位置的標記文字：透過逐字引用標記語法來解釋它的句子（本專案自己的 CLAUDE.md 就是這麼做的），或是包含該標記的圍欄程式碼範例，都無法與真正的邊界區分開來。這影響了重新產生整合檔 UDS 區塊的所有四個寫入路徑：`uds update --integrations-only`、`uds update --apply` 的 `migrate_block` 協調器路徑、`uds update --sync-refs` 以及 `uds check --restore`（XSPEC-418 R6 將其擴充為也能還原損壞的 UDS 區塊）。現在只有在修剪空白後單獨佔據整行，且該行不在圍欄程式碼區塊（``` / ~~~）內時，標記才算數；每個呼叫點都透過一個共用的 `locateMarkerBlock` 輔助函式進行，並由靜態掃描防護測試強制執行，以免未來的呼叫點退化回原始的 `indexOf`/`includes`。帶有兩對真正標記（已損壞，或是手動編輯出錯）的檔案不再被猜測——每個寫入路徑都會拒絕並按行號回報這兩對標記行，且 `uds check` 會明確回報它，而不是將其歸入「已修改」或「找不到標記」。
- **`uds check --ci` 可能會針對損壞的整合區塊印出可見的 ✗，卻仍以結束碼 0 結束並表示專案合規。** `checkIntegrationBlocksIntegrity` 的結果（已修改／遺失／UDS 標記被移除）在計算並印出後隨即被丟棄——最終判定僅檢視標準檔案的完整性。如果您的 CI 在 CLAUDE.md/GEMINI.md 等檔案的 UDS 區塊實際上已被移除或編輯的專案上一直通過，那就是這個錯誤所致；現在 `--ci` 將會正確回報失敗，直到區塊還原（`uds update --integrations-only`）或專案以其他方式恢復同步。互動式 `uds check`（無 `--ci`）不受影響——它仍然以結束碼 0 結束，因此絕不會中斷正常使用。（XSPEC-418 R1）
- **整合檔（CLAUDE.md、CLAUDE.local.md、AGENTS.md 等）同時被其 UDS 區塊與全檔內容所追蹤，且這兩項檢查可能在同一次執行中互相矛盾。** 全新的 `uds init` 從未記錄這些檔案的全檔雜湊，但 `uds update --integrations-only` 記錄了——在此之後，UDS 區塊之外的任何編輯（正是以標記為基礎的更新本應保留的自訂內容）都會使 `uds check --ci` 回報 `CLAUDE.md (modified)` 並以結束碼 1 結束，而在此同一次執行中，其本身的區塊完整性檢查卻表示該區塊完好無損。另外，`uds check --restore` 正確地重新產生了損壞的區塊（保留其外部內容，不遺失資料），但僅重新整理了全檔雜湊，從未更新區塊雜湊——因此緊接著的下一次檢查就對剛剛才正確還原的區塊回報了 `CLAUDE.md (UDS block modified)`。整合檔不再被加入 `fileHashes`（僅加入本就專門追蹤該區塊的 `integrationBlockHashes`）——已清查所有寫入點，而不僅僅是最初回報的兩個，包括 `--apply`/`--plan` 協調器路徑與 `--sync-refs`；對於現有 manifest 中含有這些檔案之一的過期全檔項目，會在下一次 `uds update`（或 `uds check --restore`/`--migrate`）時將其移除，同時保留區塊雜湊。現在在整合檔上執行 `uds check --restore` 會更新區塊雜湊以符合其所實際寫入的內容。已對帶有此完全相同過期項目的真實採用者 manifest 進行驗證：經過修復後，在相同的輸入下，`uds check --ci` 從結束碼 1 變成結束碼 0。後續審查發現的兩個缺口也已關閉：`uds check --restore` 過去對損壞的 UDS 區塊完全不做任何事——它是由完全由 `fileHashes` 建立的 `fileStatus` 驅動，而後者已不再包含整合檔，因此它無聲無息地還原了零個檔案，而區塊依舊原封不動；`--restore` 現在也會重新產生被回報為已修改或遺失標記的區塊（區塊外不受影響的內容以及 `--restore-missing` 的行為與先前相同）。並且由於上述新的刪減操作僅在寫入時執行，因此帶有過期全檔項目的現有 manifest 在 `uds check --ci` 上將永遠保持紅色——單純的唯讀 `check` 從未有機會對其進行清理；標準檔完整性檢查現在在讀取時也會跳過同時被 `integrationBlockHashes` 追蹤的任何 `fileHashes` 鍵值，因此未修改的專案無需先執行 `update` 即可回報乾淨無誤。（XSPEC-418 R6）

### Added

- **`uds init --claude-target <project|local>` 與 `uds update --claude-target <project|local>`：在擁有團隊所有 `CLAUDE.md` 的存放庫中以個人名義採用 UDS。** 到目前為止，UDS 的 Claude Code 整合一律寫入 `CLAUDE.md`——團隊共用並提交的檔案——沒有任何重新導向的方法。在已有團隊 `CLAUDE.md` 的存放庫中為自己採用 UDS 的個人，必須手動將 UDS 區塊移至 `CLAUDE.local.md`（Claude Code 原生支援的檔案，緊接在 `CLAUDE.md` 之後載入），從那時起，`check`/`update`/`uninstall` 都會回報錯誤或無聲無息地寫回團隊檔案中——包括在常規清理期間將該搬移檔案本身的追蹤雜湊作為「孤兒」予以刪除。
  在 `uds init` 上使用 `--claude-target local` 會從一開始就將整合內容寫入 `CLAUDE.local.md`；團隊的 `CLAUDE.md` 絕不會被觸及。`uds update --claude-target <project|local>` 無需重新安裝即可切換*現有*安裝的目標——它會從舊檔案中移除 UDS 區塊（保留寫在該處的任何其他內容；若檔案殘留內容 100% 為 UDS 所產生則將其刪除，符合 `uninstall` 的現有規則），寫入新目標，並不論新目標是否已包含手動搬移的區塊均更新 manifest。`check`、`update`（包含 `--integrations-only`/`--force`）以及孤兒雜湊清理現在都透過單一函式來解析工具的實際目標檔案，而不是各自獨立假設預設值——從未設定 `--claude-target` 的專案完全不會看到任何變更：manifest 僅在選擇 `local` 時才會獲得 `integrationTargets` 欄位。`--claude-target` 不影響 `AGENTS.md`；若您也不想將其提交，請繼續自行透過 `.git/info/exclude` 將其排除。`CLAUDE.local.md` 不會自動寫入 `.gitignore`——請自行新增——且因為未被追蹤，它僅存在於建立它的 git worktree 中。請參閱 [CLI-INIT-OPTIONS.md](docs/CLI-INIT-OPTIONS.md#claude-code-integration-target---claude-target)。（XSPEC-418 R2–R4）

## [6.10.0] - 2026-09-16

### Fixed

- **`uds update --apply` 遺忘了所有未觸及的指令，而 `uds check` 卻稱其完好無損。** 一個擁有 51 個 OpenCode 指令的專案漂移了三個檔案；plan 列出了這三個檔案，而在 `--apply` 之後，manifest 僅保留了三個 `commandHashes`——其餘 48 個檔案留在磁碟上，沒有任何東西追蹤它們。隨後同一次 `uds check` 執行印出了「Commands: 51 installed」與「✓ All command files intact (3 files)」，且篡改這 48 個檔案中的任何一個都不會改變這兩行（於 2026-09-16 在 6.9.0 的乾淨暫存專案中測得）。協調器在合併新雜湊鍵之前刪除了一個 agent 的所有雜湊鍵，這僅在安裝器重新安裝了該 agent 的所有指令時才是正確的——`uds update` 自己的呼叫點會這麼做，plan 路徑則不會。它現在改採合併方式，完全如同 skills 路徑一貫的做法，且計畫中的刪除僅會移除該檔案的項目。`uds check` 還額外列出了沒有任何雜湊覆蓋的已安裝指令檔，因此這兩個數字不再會默默產生分歧。
- **整合檔指向磁碟上不存在的標準，而參考檢查卻稱其已同步。** 在以 `--format ai` 安裝的專案上，`uds update --integrations-only` 寫入了 `Reference: .standards/anti-hallucination.md` 與 `.standards/checkin-standards.md`；這兩個檔案僅存在於 `human` 格式中。規則範本不論安裝的格式為何，一律將其參考拼寫為 `.md`，且由於規則區段位於 UDS 標記之外，以標記為基礎的更新從未重新整理它們——由舊版 CLI 最初寫入的檔案，在該檔案停止出貨兩個主要版本之後仍保留著 `.standards/commit-message-guide.md`。現在，無論是在產生還是更新現有檔案時，參考都會對照此專案實際安裝的標準（以其安裝的格式）進行解析；指向專案未採用之標準的參考將被捨棄而非懸空。`uds check` 會回報檔案遺失的參考，而不是在去除副檔名後進行名稱比對。只有 UDS 本身隨附的標準才能被移除：專案在 `.standards/` 下自行加入之檔案的參考將完全按原樣保留。
- **`uds check` 建議了無法執行的 `uds update --sync-refs`。** 當 manifest 沒有 `integrationConfigs` 時，`--sync-refs` 會中止，而該鍵值僅由 `uds init` 的互動流程寫入——使用 `uds init -y` 建立的專案從第一天起就是 `{}`，因此一個嶄新的 6.9.0 專案就已經處於錯誤訊息怪罪於舊版本與手動複製的狀態。`--sync-refs` 現在會從 manifest（整合、AI 工具、標準、選項）重建設定，而不是直接拒絕，且 `uds check` 僅在 `--sync-refs` 確實能執行時才會指名它；否則會指向 `uds update --integrations-only`。
- **`uds check` 將已採用的標準回報為從索引中遺失。** ID 到檔名的對照原本僅從 `source.ai` 建立，但某些 registry 項目將 `source` 儲存為字串——`zh-tw-locale` 為 `extensions/locales/zh-tw.md`——因此其安裝的檔案 `.standards/zh-tw.md` 從未被辨識，計數在列出該標準的檔案上顯示為「67/68 標準已參考, 缺少: zh-tw-locale」。
- **參考同步將選項檔案回報為孤兒，並建議了 UDS 不再出貨的檔名。** 選項記錄在 `manifest.options` 中，而非 `manifest.standards`，因此每個 `.standards/options/*.ai.yaml` 參考都被回報為「not in manifest」；而「standards not referenced」清單則是根據手寫的 6.0.0 之前名稱表（`git-workflow.md`、`error-code-standards.md`、`project-structure.md`）建立。現在選項已可被辨識，且清單僅會指名此專案實際擁有的檔案。
- **`uds check` 列出了兩次 `AGENTS.md`。** Codex 與 OpenCode 共用一個檔案；檢查過去是迭代工具而非檔案。它現在只會回報每個檔案一次，並列出共用它的工具名稱。
- **有七個 `core/*.md` 標準自 6.0.0 以來從未被安裝，且沒有任何一個標準對此做出說明（[#180](https://github.com/AsiaOstrich/universal-dev-standards/issues/180)）。** 它們對應的 `.ai.yaml` 在 6.0.0 中被移除，這些文件被刻意保留在 `core/` 下作為採用層的參考——這是一個合理的決定，記錄在 `docs/MIGRATION-v6.md` §2 與 `scripts/reference-only-standards.json` 中，但未在閱讀該文件本身時能看到的任何地方說明。遷移指南只會在升級時被閱讀一次；而 `core/` 則會被持續閱讀，任何為了回答「UDS 有哪些標準」而瀏覽它的人算出了 152 個檔案，其中有七個是 `uds init` 從未安裝過的。這七個檔案現在每個都以英文、zh-TW 與 zh-CN 的 `<!-- UDS:REFERENCE-ONLY -->` 通知開頭，指向遷移紀錄與機器可讀的清單。一個新的關卡（`npm run check:reference-only`，已與雙向自我測試分支一同串接至 CI）從 registry 中的每個 `source.human` 路徑推導出出貨範圍，將相對於 `core/*.md` 的差異視為僅供參考集合，並要求每個成員公開說明——同時同樣要求出貨的文件*不得*帶有此通知，以使重新開始出貨的標準不會留下謊言。透過推導集合而非檢查七個名稱，確保了下一次縮減範圍時不會重蹈同樣的沉默。
- **`--format human` 安裝將 `testing-standards.md` 提供給了兩個標準 ID，且從未提供完整涵蓋的文件。** `full-coverage-testing` 的 registry 項目將 `source.human` 指向了 `core/testing-standards.md`，導致 `core/full-coverage-testing.md`——一個活躍的標準，近期在 XSPEC-288 中仍有維護——沒有任何人安裝，且 human 格式的 manifest 兩次列出了相同的路徑。`check-registry-completeness.ts` 的 Check 2 無法發現它：只要 human 或 ai 路徑出現在 registry 文字的任何位置，它就會接受該項目，而 ai 路徑確實存在。這是在上述僅供參考關卡的首次執行中，作為預期七個孤兒之外的第八個孤兒被發現的。已在前後使用真實的 `uds init --format human` 安裝進行驗證。
- **`uds update --sync-refs` 寫入的標準數量隨後被 `uds check` 駁斥。** 在 manifest 擁有 73 個標準的專案上，`--sync-refs` 重寫 CLAUDE.md 並宣告有 76 個，而 `uds check` 則回應「index declares 76 standards, manifest actually has 73」；`--integrations-only` 產生了正確的數字，這使得它看起來像計數錯誤而非資料來源錯誤。`--sync-refs` 過去是從 `integrationConfigs[file]` 重新產生檔案，其 `installedStandards` 是在安裝時拍攝的快照，且沒有任何機制重新整理它——因此在跨主要版本升級的專案上，它仍然列出在 6.0.0 中已停止出貨的標準，而它所列出的任何內容都變成了檔案的內容。它現在改從 manifest 重新產生，正如 `buildToolIntegrationConfig` 自己的說明區塊所規定的那樣；儲存的快照現在僅用來決定 `outputLanguage`，以使早於該選項的 manifest 不會無聲無息地將其重設。
- **安裝標準索引在每個專案上都顯示「options 0」。** `uds init` 將已安裝清單縮減為純檔名，而下游的一切都透過 `/options/` 路徑段來分類選項——在 `contentLayout: flat` 下，沒有剩餘的目錄可以用來還原它。一個擁有 66 個核心標準與 7 個選項的專案被告知它擁有「73 (73 core, 0 options)」。同樣的縮減將 AGENTS.md 中的每個選項檔案指向了 `.standards/<name>.ai.yaml`，比選項檔案安裝的位置高了一層目錄，因此在要求 agent 閱讀它們的標題下，每一個都成了無效連結。路徑現在能完整送達，且 AGENTS.md 摘要會為選項寫入 `.standards/options/`，並遵循專案的格式而非預設假設 `ai`（`--format human` 的專案先前被給予了 `.ai.yaml` 檔名，而該專案實際持有的檔案為 `.md`）。
- **遵循遷移指南會導致 `uds check` 回報故障，且其提供的修復方案無法運作。** MIGRATION-v6 §2 指示手動刪除已縮減範圍的七個 `.ai.yaml` 複本。這樣做留下了它們的 `fileHashes` 紀錄，導致 `uds check` 將這七個檔案回報為遺失並建議 `uds check --restore`，隨後在每個檔案上都以「could not determine source」失敗——該來源自 6.0.0 以來在上游根本不存在。工具要求採用者使用它已知無法成功的指令來復原其自身文件的操作。名稱在 UDS 任何地方都不再出貨的遺失檔案，現在會以灰色與遺失檔案分開回報，並附上可行的補救措施；`uds update` 會捨棄這些紀錄並說明捨棄了哪些，包括在已經處於最新版本的專案上（遵循指南的每位採用者必然處於此狀態）。`--prune` 無法觸及它們：它是在瀏覽 `.standards/` 時刪除所找到的檔案，而這些恰恰是不再存在於該處的檔案。
- **UDS 重新產生了 AGENTS.md 卻未記錄其寫入的內容。** 執行 `uds update --integrations-only` 後立即執行 `uds check`，會在一個除了 UDS 之外沒有任何東西動過的檔案上回報 `AGENTS.md (modified)`。寫入 AGENTS.md 的所有三個呼叫點都記錄了 `integrationBlockHashes`，但沒有一個記錄 `fileHashes`。已存在的紀錄現在會被重新整理；manifest 未追蹤的檔案仍不會被納入，因為該摘要是供採用者擴充的。
- **在 Windows PowerShell 上，成功的執行看起來像失敗。** 進度行輸出到了 stderr，而 PowerShell 5.1 會將原生指令的任何輸出包裝在 `NativeCommandError` 中——包括 `✔ Regenerated 2 integration files` 這一行表示成功的訊息。變更前測得：stdout 上有 9 行，stderr 上有 2 行，兩者皆為旋轉進度圖示。所有 47 個進度圖示現在都回報在 stdout；在成功的執行中 stderr 為空。
- **刪除計畫對三種不同的情況只給出一種原因。** 對於 UDS 在上游廢棄的標準、專案取消選取的選項，以及預期狀態未建立模型的路徑——這三種不同的適當應對情況，過去一律印出「no longer in desired state」。現在原因會說明是哪一種，以及重新選取是否能將檔案取回。`.standards/release-config.yaml` 完全不再是刪除候選對象：`uds init` 根據使用者選取的發布模式寫入它，而 `uds config` 會重寫它，因此刪除它的計畫是在捨棄設定並稱其為協調。它會被保留並說明原因，而非默默跳過。
- **.NET Framework 專案被給予了四個指令，其中三個無法執行。** 自 2017 年以來，`.csproj` 指向了兩種不相容的建置系統，而偵測器僅以副檔名為判斷依據：舊式專案（`<TargetFrameworkVersion>`，無 `Sdk` 屬性）收到了 `dotnet build`（因 `MSB4019` 失敗）以及 `dotnet list package --vulnerable`（因僅讀取 `PackageReference`，對 `packages.config` 默默回報為空）。舊式專案現在在 `build` 收到 `msbuild`，其餘地方則為空白——未知生態系的分支本就回傳空白「以便使用者填寫」，由人類填寫空白勝過看似權威但在初次使用時就失敗的指令。
- **每個產生的指令檔開頭都要求 agent 閱讀一個從未安裝的目錄。** 所有九個工具在每種語言中均以「PRIORITIZE reading the concise rules in `core/` (e.g. `core/testing-standards.md`)」開頭。`uds init` 安裝到 `.standards/` 中，且從未在採用者的專案中建立過 `core/`——那是標準在 UDS 存放庫中所處的位置，而非採用它的存放庫。相同兩句話的 36 份複本全部犯了同樣的錯誤，且乾淨的 6.9.0 安裝寫入了它們。它們現在指名 `.standards/`，且有測試走訪產生的輸出，以免第十個工具重新引入該問題。
- **`uds update` 將中文的 CLAUDE.md 用英文重寫。** `uds init` 以 `display_language` 寫入整合內容；每個重新產生路徑過去均從 `output_language`（提交訊息語言，預設為 `english`）推導它。內容語言現在遵循 `display_language`，僅在沒有顯示設定可用時才回退到 `output_language`。

### Added

- **`uds check` 現在會回報指令檔中提到但不存在的路徑。** 以前它僅檢查 `Reference:`/`參考:` 行且僅檢查 `.standards/` 路徑，這對於參考*同步*來說是正確的範圍——那些是 UDS 產生的行——但對於「此指令是否指向任何東西」來說則是錯誤的範圍。UDS 標記之外的內文由較舊的安裝留下且未經任何重新產生檢視，將 agent 引導至不存在的檔案。該掃描是基於存在性而非外觀結構，因此擁有自己 `core/` 目錄的專案不會被指責，且它會忽略 URL 內部的路徑。它在首次執行時就發現了此版本中修復的兩項缺陷。

## [6.9.0] - 2026-09-14

### Migration notes for adopters

- **`uds update` 不再自動刪除檔案。** 它會列出可被移除的 UDS 檔案，僅在加上 `--prune` 時才會刪除它們，且僅刪除 UDS 本身寫入的檔案。依賴自動清理的工作流程應加上 `--prune`。（#168、#165——詳情見 Fixed。）
- **無法辨識的 `--content-mode` 值現在會印出警告並繼續使用 `index`**（6.8.0 也為其產生了 `index` 輸出）。從 7.0.0 開始這將會是一個錯誤。`--content-mode full` 已被棄用，並會解析為 `index` 且附帶通知。（詳情見 Deprecated。）
- **使用 `uds init -y` 安裝的 Codex、OpenCode 及其他非 Claude 工具，現在會在自己的目錄中接收技能**（例如 Codex 為 `.agents/skills/`）而非 `.claude/skills/`。在現有安裝上執行 `uds update` 會進行遷移。（詳情見 Fixed。）
- **Antigravity 現在獲得 `.agents/skills/` 與 `.agents/AGENTS.md`**，而非空無一物與 `INSTRUCTIONS.md`。Antigravity 僅在目錄為已註冊專案時才會探索 `.agents/`；`uds init` 會印出此訊息。
- **在 6.8.0 及更早版本中由 `uds init --with-hooks` 寫入 `.claude/settings.json` 的 hooks 使用了從未執行的字串格式。** `uds update` 不處理 hooks，且重新執行 `uds init --with-hooks` 不會移除舊項目或 `scripts/hooks/*.js`。若要取得可正常運作的 hooks，請重新執行 `uds init --with-hooks`；您可以手動刪除舊的 `.js` 項目。

### Fixed

- **`uds update` 不再透過查詢雜湊表來決定所有權（XSPEC-384，issue [#165](https://github.com/AsiaOstrich/universal-dev-standards/issues/165) 與 [#168](https://github.com/AsiaOstrich/universal-dev-standards/issues/168)）。** 兩名使用者在同一個指令中回報了相反的缺陷：它在沒有任何警告、diff、提示或備份的情況下刪除了 `.standards/` 下手寫的專案文件（#168，僅透過逐行比對 `git status` 的 diff 才發現），且在 `upstream.version` 推進到「最新」時，在 manifest 與磁碟上均保留了 registry 已捨棄的標準（#165）。兩者均源於用一個布林值回答兩個獨立的問題——*這份檔案是否由 UDS 寫入*以及*這是否仍是隨附出貨的標準*——且每個 issue 各代表過載軸心的一端。現在所有權在 UDS 寫入時記錄於新的 manifest `provenance` 欄位中，該欄位以複製實際回傳的路徑為鍵值，而非從來源名稱重新推導的路徑（該重新推導正是導致實體位於 `options/<category>/<name>.ai.yaml` 的檔案在 `fileHashes` 中出現五個 `.standards/options/<name>.ai.yaml` 項目的原因）。`fileHashes` 代表目前狀態，而 provenance 則是唯增的；若某項紀錄與 `fileHashes` 同步刪減，它會在同一時刻失敗且毫無益處。現在刪除需要兩個事實同時符合，所有其他組合都會被保留**並印出原因**。無法決定的所有權會解析為保留——這是舊程式碼拒絕採取的路徑。現有的安裝不帶有 provenance，因此首次升級不會歸屬任何內容也不會移除任何內容；provenance 僅在寫入了完整集合的執行結束時建立。刪除操作還額外受到新的 `--prune` 門檻管制，刻意不用 `--yes`：`--yes` 會在 CI 中設定，若允許它授權刪除，將會在完全無人可見之處啟動破壞性路徑。預設啟用刪除的分段策略位於一個具名常數中（`PRUNE_POLICY`），因為 XSPEC-384 §4 尚未做出決定。每份移除報告都會印出其分母——檢查的、擁有的、外部的、未知的、排除的檔案以及原因——因為僅列出目標的報告與僅看到那些檔案的掃描無法區分。這兩個問題均已由預先證實為紅燈的測試釘住。
- **Skills 被送到了九個工具中有八個從未讀取的目錄。** 在非互動式路徑（`uds init -y`）中，除了 Claude Code 之外，所有具備 skills 能力的工具的 skills 都被寫入 `.claude/skills/`；帶有 `--mode skills -y` 的 Codex 存放庫收到了零個 skills 且沒有任何訊息。具備 skills 能力的集合與市集決策現在來自路徑表，偵測到沒有已驗證 skills 路徑的工具將不安裝任何內容並說明原因，且 `uds update` 在轉換舊版 manifest 時會重新推導 agent，而非預設假設 `claude-code`。Codex 未經證實的 `fallbackSkillsPath: '.claude/skills/'` 已被移除。互動流程從未受影響。
- **Roo Code 根本無法安裝。** 它有路徑表項目但沒有偵測器，且其識別碼在一個表中為 `roo`，在其他所有地方均為 `roo-code`，因此 `uds init` 將指令寫入存放庫根目錄的 `roo-code.md`。偵測現在使用 `.roo/` 與 `.roorules`（刻意不用 Cline 自己的標記 `.clinerules`），且 skills 不再回退到 Roo Code 文件未列出的 `.claude/skills/`。以 Roo Code 的文件為依據；未在實際運行的 Roo Code 安裝上測量。
- **Antigravity：UDS 有六個月未安裝任何內容，且指令檔是它從不讀取的檔案（XSPEC-355 OQ6）。** Skills 現在輸出至 `.agents/skills/`，指令輸出至 `.agents/AGENTS.md`，此點已由該工具的二進位檔、隨附指南以及使用誘餌路徑的實際執行所證實。其層級從 `minimal` 移至 `partial`。
- **UDS 隨附出貨的每個 hook 過去都是無效的，採用者收到了四個壞掉的 hooks。** Hook 項目過去被寫成純字串（只有物件形式能執行）；`scripts/hooks` 未包含在 npm 套件中；hooks 曾為 ESM `.js`，在 `"type": "commonjs"` 下會失敗（現為 `.mjs`）；且提交訊息驗證器在每個提示（`UserPromptSubmit`）上均執行且每次都以 1 結束（現為 `PreToolUse(Bash)`，僅檢查真正的 `git commit -m`）。
- **`uds check` 的 restore 用過期的範本覆寫了產生的整合檔。** 對於 Claude Code 而言，那是一個最後修改於 2026-03-25 的 140 行檔案。Restore 現在會從安裝器記錄的設定中重新產生，保持受管區塊外部的內容不變；Antigravity 與 Gemini CLI 獲得了 restore 路徑，且 Codex 的後備方案不再指向不存在的目錄。
- **Codex/OpenCode 的 `AGENTS.md` 未帶有揭露宣告。** 2026-08-18 的揭露修復僅涵蓋了兩個產生器中的一個；選取 codex 或 opencode 會將 `AGENTS.md` 導向另一個產生器。已在兩種語言與兩種輸出格式中修復。
- **cline、windsurf、roo-code 與 Antigravity 的整合檔指向了提交訊息規則，而非直接說明該規則。** 格式與有效類型現在直接內嵌寫入，如同 Codex 檔案已做到的那樣。

### Added

- **`turn-completion-integrity`——代理不得在宣告了未執行的下一步動作的情況下結束一輪回應。** 透過 Stop hook 而非指令在輪次結束時強制執行。偵測器隨附英文與 zh-TW 語言包以及突變測試語料庫；它會讀取人類的最後一則訊息，因此停止指令不會被視為放棄承諾，將分項列出的「被誰卡住」清單視為合法的結束，並將「完成時告訴我，我會驗證」視為具條件性質。`uds init --with-hooks` 現在會在您的語言沒有語言包時發出警告，因為在未列出的語言中該 hook 安裝後將永遠無法觸發。包含 zh-TW 與 zh-CN 翻譯。
- **`deferred-item-exit`——六個標準產生了延後處理項目，但沒有一個說明這些項目該往何處去（XSPEC-391）。** 一位採用者的單次設計會議產生了一份 ADR 與一份規格，其中帶有五個標記為「待定」／「獨立工作」／「不在 v1」的項目，而**這五個項目全都沒有進入任何追蹤系統**。原因並非遺忘。在產生此類項目的六個標準——`adr-standards`、`spec-driven-development`、`retrospective-standards`、`feature-discovery-standards`、`code-review-checklist`、`acceptance-criteria-traceability`——之中進行測量，grep `issue|tracker|backlog|task id|work item` 回傳了 13 個符合項，且**沒有一個是出口**：ADR 的 `Technical Story` 是輸入參考，retrospective 將追蹤器視為指標來源，feature-discovery 挖掘工作票作為需求輸入，AC-traceability 僅對外部阻擋的覆蓋率要求連結，而 code-review 中的全部 8 個符合項均為代表問題的英文單字「issues」。每個標準都說明了如何寫好其文件；文件隨後就成了終點線。新標準統一說明了所缺少的關聯——延後處理項目在文件之外擁有可追蹤的出口，且文件帶有該出口的識別碼——六個產生者加上 `brainstorm-assistant` 技能各獲得了**指向該標準的一行指標而非其複本**，因為單一規則的六份複本會朝六個方向腐爛。**出口載體刻意不作指定**：issue、受追蹤的 TODO、manifest 列、待辦清單檔案中的一行皆符合要求，測試標準是「此項目是否已離開文件」，絕非「使用哪個工具」。三項發現塑造了這些規則。首先，出口必須在產生該文件的變更合併*之後*仍可解析——觀察到的兩種遺漏情況滿足所有其他條件但仍遺失了項目（寫入合併會關閉之 issue 中的 todo；寫入出口評論中的 todo，被後續評論推擠出視線之外）。其次，**存在連結不等於有效連結**：回報問題之採用者自己的關卡原本會讓他最強烈的事例通過，該文件寫著「與 issue #19 一同決定」，而 #19 根本未包含任何相關內容——因此 DEX-005/006 要求「已連結且內容已驗證」與「已連結但內容未驗證」絕不能印出相同的綠燈，因為回報為通過的未知比回報為未知的未知更糟糕。第三，錨點是文件的**結構**（ADR 的 `Consequences`、規格的 out-of-scope 區段、retrospective 的 `Action Items`），而非其措辭：結構可以被列舉而措辭清單則無法，因此 DEX-008 要求任何措辭清單都必須宣告其覆蓋率為未知，而 DEX-009 要求任何視窗大小（「3 行以內」）都必須帶有其來源依據或標記為未校準。根據 DEC-049，該標準完全以必須存在的關聯編寫，絕不以必須維護它們的機制編寫——且在其自身文字中明確指出 **UDS 未為此隨附出貨任何關卡**，因為宣告了規則卻沒有任何東西執行它，不承認這一點比承認這一點更糟糕。`adr-standards` 還額外獲得了它從未說明的明確邊界（在其中 grep `acceptance criteria|\bAC\b|驗收` 回傳了 **0** 個結果，相較之下在 `acceptance-criteria-traceability` 的對照組中有 84 個符合項）：**驗收條件僅在唯一的場所維護，即 SPEC**，而 ADR 連結至該處——複製的清單有兩個擁有者，其中一個從不更新，測得的後果是一份 ADR 的核取方塊在工作發布後全顯示為未勾選，對僅讀取規格的覆蓋率工具而言是隱形的。
- **`AUTH_SCOPE_EXTRACTION`——租戶邊界是一個 `WHERE` 子句，且在遷移過程中沒有任何東西強制要求您去尋找它（`reverse-engineering-standards` 1.3.0，issue [#166](https://github.com/AsiaOstrich/universal-dev-standards/issues/166)）。** 在一次真實的 PHP → C# 遷移中，一個限定租戶範圍的帳號列表端點在重寫過程中遺失了其隔離述詞：依角色劃分範圍被替換為粗略的「此帳號是否為已啟用的管理員？」檢查，端點回傳了資料庫中的所有帳號，無論是哪個租戶發出的請求。它出貨了，通過了現有的每項測試——該方法沒有任何測試——並在客戶回報看到不應出現的帳號資訊時浮出水面。`test-completeness-dimensions` 的 Dimension 4 已經指名了跨租戶存取，因此該維度從未遺失；遺失的是在遷移時強制喚起記憶的步驟。三項特性使這類問題得以逃過每個關卡：安全關鍵行看起來像數個篩選器之一，因為它存在於查詢內部而非請求／回應合約中；基於外觀結構的斷言無法看出範圍，因此「帶有非空清單的 200」在刪除該子句的情況下同樣通過；且程式碼庫中其他地方存在的共用範圍解析器會被視為覆蓋，而新的呼叫點則在沒有它的情況下重新實作了查詢。新階段與隱含規則掃描並行運作，機械式推導出以操作者自身身分限制結果的每個述詞——包含在 SQL 之外透過 ORM 全域範圍、repository 基底類別、RLS 政策與注入篩選器的中介軟體所強制執行的範圍，因為僅對 SQL 進行 grep 所回報的集合小於實際存在的集合，且此處較小的集合讀起來正像是較安全的集合。每個相符項目都記錄有 `file:line`、其自我繫結以及其觸發分支；判定依據是每個角色分支與每個呼叫點上的述詞等價性，而非輸出結構。RE-AUTH-001 要求編寫斷言**不存在**其他操作者紀錄的負向測試（附帶自我檢查：在暫存複本中刪除該述詞，若測試仍通過，則表示它從未測試過範圍）；RE-AUTH-002 阻擋任何移植後等價述詞未經驗證的切換上線。
- **寫下的日期現在必須具備意義（`tech-debt-standards` 1.1.0、`governance-layer` 1.1.0）。** registry 範本自 1.0.0 以來就一直要求 `Owner` 與 `Target Resolution Date`，而這兩個標準的任何地方都沒有說明當該日期過期時會發生什麼事——在 `core/tech-debt-standards.md` 中 grep `overdue|past due|expired|exceed` 毫無回傳，而對照組 grep `Owner` 則有回傳結果，因此此項缺失是真實的而非查詢壞掉。更糟的是，`Registry Storage Options` 將「專用試算表」列為完全合法：沒有任何程式能讀取的表格滿足該節的所有其他要求，且在日期過期且什麼都沒發生的情況下，它看起來沒有任何錯誤。`tech-debt-standards` 獲得了**過期處理**——到期時恰好有三種合法處置方式（解決／撤回／附帶書面理由延長），TD-EXP-001..006，明確禁止將過期實作為自動延長或自動關閉（兩者都會停止計時且兩者都不會留下曾這樣做的痕跡），以及將**未受維護聲明**作為無法執行檢查之團隊的合規替代方案。每個儲存選項現在都帶有其合法的條件；試算表被刻意保留，因為它通常是資助該工作的人唯一會打開的格式。`governance-layer` 在風險接受條款（Risk Acceptance Clause）中獲得了 `review_by`（`review_by` 已過期的風險接受無效，管線如無該接受般自動失敗阻斷）、**待決決策**（Pending Decisions，GOV-PD-001..004——待決決策是帶有時鐘與固定列舉標記的受管狀態，而非自由編寫的敘述）、**彙總報告**（Aggregate Reporting，GOV-RPT-001..005——通過／失敗／**無法判定**分開印出，說明分母及其推導方式，無單一折疊分數，因為無所作為與實際完成工作獲得相同分數的指標並未衡量工作本身），以及**新鮮度指標**（Freshness Metrics，GOV-FRESH-001..004——指標必須指名其讀取的是編輯時間還是協調時間，兩者不得共用欄位；今天編輯但從未與現實比對的文件在一個時鐘上為零天，在另一個時鐘上則為無限大）。這兩個標準均在標準本身中明確指出，UDS 未為其中任何一項隨附出貨檢查器：最低門檻不是「建立檢查器」，而是「絕不讓紀錄在無聲無息中無人維護」。
- **`uds audit --effects`——詢問回報成功的元件是否確實執行了任何動作的關卡（XSPEC-383 R8）。** Shape D：可達、被呼叫、執行、回傳 `{ok: true}`、不觸碰任何東西。R3 的可達性關卡無法發現它——可達性詢問誰呼叫了檔案（入邊），而 Shape D 存在於出邊（它最終觸碰了什麼）。方向完全相反。根因在於聲明與證據共享同一個作者：元件的回傳值既是「我做了什麼」，也是其唯一的證明，而型別系統所檢查的結構對於真正的實作與捏造的實作來說是**完全相同**的。該關卡遍歷每個宣告實作的呼叫圖，並衡量其是否達到跨行程邊界。邊界集合是透過規則由根家族（`fs`、`child_process`、`net`/`dgram`/`tls`、`http`/`https`/`http2`、`dns`、`worker_threads`）遍歷 `builtinModules` 推導而來，而非手動列出，因此 `fs/promises` 與未來的任何子路徑都無需修改程式碼，且每條規則都會印出它擴充為多少個模組——符合零個的規則即代表過期。無需 import 的全域變數（`fetch`、`WebSocket`、`process.dlopen`）在計入前會針對運作中的執行環境進行探測，且當前 Node 中不存在的變數也會被印出。家族是在 `.uds/effect-boundary.json` 中**以 glob 宣告**，絕不透過檔名宣告，因為當有人加入第七個轉接器時，檔名清單就不再真實——而這正是該關卡存在的確切案例。判定具有三種狀態：零個邊界符合項為 RED（當家族中位數大於零時獲得佐證；當整個家族均為零時回報為 *uncorroborated*，因為此時家族內比對失去作用）；零個符合項伴隨無法分類的外部相依性為 UNDECIDABLE 並以結束碼 2 結束，因為稱其乾淨是安全失敗（fail-open），稱其骯髒則是一項指控。根據 R7-b，宣告 `NOT_IMPLEMENTED` 且從未回傳成功結構之字面常數的實作是合法的且無需允許清單——該聯集條件至關重要，因為僅憑該標記將成為每個空心實作都能穿透的漏洞，而同時帶有兩者的檔案將按名稱判定為 RED。R7-c 擷取透過字串串接建立的網域（樣板插值與 `+` 串接鏈均折疊為 `*`，因此 `` `https://${env}.api.acme.example` `` 維持可判定，而 `` `https://api.${tld}` `` 則無法），並對照從可外掛來源（檔案、環境變數或**指令**，即註冊商或雲端 DNS 區域 API 所在之處）讀取的擁有網域清單進行檢查。無法讀取的已宣告清單將以結束碼 2 結束，絕非「清單為空故允許一切」。基準線是每列帶有一個到期日的 TSV（§7.11.2），且格式錯誤的列會以結束碼 2 結束，因為損壞的基準線不等於「無基準線」。建置它時在其自身的首次自我測試執行中捕捉到了一個真實缺陷：僅有型別的 import 過去被當作呼叫圖的邊追蹤，導致空心實作繼承了其介面檔案的邊界符合項並顯示為綠燈——型別 import 在編譯時消失，將其計入是憑空捏造的綠燈。該案例現在由其專屬的對照分支釘住。**這無法證明的事項**：所達到的邊界是否為*正確*的邊界——裝飾性的日誌請求也能通過。那是 R9 的範疇，目前尚未實作。UDS 未宣告專屬的 effect 家族，因此純粹執行該關卡按設計會以結束碼 2 結束；CI 執行 `--self-test`，其十七個分支（五個探測對照組、分母、綠燈、紅燈、R7-b 濫用、R7-b 豁免、跨檔案呼叫圖、邊界金絲雀、網域金絲雀、無法讀取的清單、空集合、無法判定、損壞的探測器）在為此存放庫撰寫的合成語料庫上各自按需變紅。
- **採用者可執行的錯誤出口關卡。** `templates/gates/check-error-exit.mjs` 現已隨套件出貨。`uds check` 會在含有 `src/` 目錄的專案缺少此類關卡時予以回報且絕不寫入；`uds update` 則會說明其內容並提議寫入，預設為 **no**，且絕不覆寫現有檔案。該關卡允許一個檔案格式化錯誤文字，在第二個檔案時失敗，並在設定完成前以結束碼 2 結束。
- **`brainstorm-assistant`：評判者現在需要心智，而不僅僅是一個席位（XSPEC-388）。** BQS D4 僅在同時具備獨立上下文與已宣告模型等級時才通過，並使用 `core/model-selection.md` 的廠商中立標籤表示；指名具體廠商模型屬於違規。CONVERGE 評判摘要已重寫為目標 + 限制條件。未移除任何 v3 機制。
- **`llms.txt`，產生而非手寫。** 推導自 `uds-manifest.json`、`core/`、`skills/`、`integrations/REGISTRY.json` 與 `cli/package.json`，若提交的檔案有一位元組不同，`--check` 即會失敗。

### Changed

- **P1 與 P3 重返探測集，且它們被剔除的原因現在成為另一種錯誤的典型實例（XSPEC-408）。** 兩者於 2026-07-23 在「基準線通過」的名義下退役：在未安裝 UDS 的情況下針對 Antigravity CLI 1.0.14 執行時，模型在回答前讀取了檔案（P1），並主動提出了一項建議（P3）。這些觀察依然成立。不成立的是退役的決定。**每個探測器衡量兩件事——行為與已宣告的標記——且只有行為被推翻。** P1 的剔除紀錄以其自身文字說明了這點（「剩下的部分是 UDS 要求明確的 `[Source: <path>]` 歸屬，而基準線使用了 markdown 檔案連結」），隨後引用 §2.2「探測斷言結構，而非措辭」捨棄了剩餘部分。這種解讀不可能是正確的，因為 **P2 是透過匹配四個字面標籤存活下來的**，且是集合中最持久的探測器；§4 自己的摘要早已得出結論：「一律閱讀層級中持久的部分看起來像是已宣告的形式與內部約定，而非知識」，而兩個已宣告形式的探測器就在其下方數段處被剔除。§2.2 現在陳述了它一直旨在表達的區別：匹配模型碰巧寫出的句子衡量的是運氣，匹配**標準要求模型發出的標記**衡量的則是標準是否送達。P1 與 P3 已重寫為僅詢問該較窄的問題，且現在兩者在答案*符合事實但未標記*時均明確失敗，這正是它們存在所要捕捉的情況。它們的 §2.3 進入基準線無需進行新的執行：保留的 2026-07-23 逐字紀錄經過重新評分，包含 `[Source:` **0 次** 與 `[Recommended]` **0 次**，每個均對照同一個讀取器在同一檔案中找到的正向對照字串進行了驗證，因此零是缺失而非搜尋壞掉。`scripts/check-reinstated-probe-baselines.ts` 在每次 CI 執行時重新推導這兩個計數——讀取一次並輸入到文件中的零是一個戳記，而此存放庫記錄了戳記的作用——其 `--self-test` 分支涵蓋標記出現（紅燈）、對照缺失（無法判定，絕非綠燈）與空逐字紀錄（無法判定），這三者均由突變測試所證實。**這無法做到的事**：提高 n。這是針對每個探測器、單一工具、單一頂尖模型進行的一次重新讀取。`DELTA-TREND.md` 在其自有的子表格中記錄了重新評分，並明確禁止將其加入其上方的掃描中，且 Codex 列附有註釋說明其 50% 是指*已退役*的 P1/P3——未為 Codex 保留任何 P1/P3 逐字紀錄，因此與 Antigravity 不同，該處沒有任何內容可供重新評分。探測器被退役所*針對*的族群——採用者在 aider 與 continue-dev 下執行的本地與量化模型——仍未曾被測量過，而探測器的全部價值在於告訴您該族群何時不再需要該規則。恢復探測器重新安裝了感測器；它並沒有說明感測器將會讀取到什麼。
- **Skills：現在每個附屬檔案均可從其 `SKILL.md` 到達。** 13 個附屬檔案（3,193 行）沒有任何東西指向它們，另外 56 個僅能透過另一個附屬檔案到達；橫跨 `skills/` 與各語系樹的全部 168 個附屬檔案現在僅需一跳即可到達，每個指標都說明了該檔案包含什麼以及何時閱讀它。這消除了結構性風險；它並不能證明附屬檔案確實被閱讀。
- **隨附出貨的 `.ai.yaml` 檔案從其來源的 git 歷史中取得 `meta.updated`**，且當 git 沒有紀錄時省略該欄位，而非手動輸入的日期或轉換執行的當天。
- **`governance-layer`：強制執行實況（Enforcement Reality）區段現在也將較舊的風險接受欄位**（`review_by`、`risks_accepted`、`gates_bypassed`）指名為沒有任何程式讀取。
- **相依套件：** `chalk` 5.6.2 → 6.0.0，`js-yaml` 5.2.1 → 5.2.3（CLI 執行階段）；`eslint`、`globals`、`lint-staged`、`tsx`（開發用）。
- **存放庫內部驗證（對採用者收到的內容無影響）：** 執行真實 `uds init` 的採用者指令檔檢查；橫跨路徑表中每個工具的安裝路徑關卡；執行已安裝 Stop hook 的 hook 傳遞關卡；內容層級 bundle 一致性；技能觸發表面關卡；出貨戳記一致性檢查器；翻譯 `source_hash` 棘輪機制；名稱提及分類器；STATUS.md 矛盾關卡；為本存放庫產生的 `.claude/skills` 複本；技能金絲雀工具（XSPEC-408 R2）及其首次真實執行；P7 探測器剔除；bump/sync 來回轉換移至每次 CI 執行；測試套件不再依賴機器的語系環境。

### Deprecated

- **`contentMode: 'full'`——一個早已存在的模式的第二個名稱（XSPEC-357 R7）。** manifest schema 接受了它，`--content-mode` 提供了它，init 提示將其宣傳為以上下文預算換取合規性（「所有規則均已嵌入，~10-15 KB，最高合規性」），且每個 `partial` 層級的工具都被自動指派了它。這一切全都沒有實作：產生器對該模式唯一的測試是 `=== 'minimal'`，因此 `full` 與 `index` 走相同的分支，且**在測量的全部 24 種工具 × 語言組合中寫入了逐位元組完全相同的檔案**，對照組證實了該比較能偵測到真實差異（`full` 與 `minimal` 在全部 24 種組合中均不同）。它也無法如宣傳般運作——`.standards/` 大約有 248k 個 token，遠超過整合檔所能承載的範圍。採用者過去是在一個行為的兩個標籤之間做選擇，而該標籤承諾了不存在的差異；文件甚至基於監管考量向銀行核心系統推薦了 `full`。**棄用它對採用者毫無成本**：`--content-mode full` 仍被接受並解析為 `index` 且帶有通知，記錄 `full` 的 manifest 在下次讀取時會重寫為 `index`，且因為這兩種模式本就產生相同的位元組，**沒有任何專案產生的檔案會發生變動**。無法辨識的模式仍會解析為 `index`，現在會帶有指名該值的警告；它將在 7.0.0 中成為錯誤。`check-adopter-instruction-files.ts` 中的 `content-mode=full` 情境——其「全部 8 個檔案逐位元組完全相同」的發現引發了此處的變更——已予以移除，而不是留在該處比較 `index` 與 `index` 並永遠回報完全相同。

## [6.8.0] - 2026-08-20

### Added

- **詢問是否有人能接觸到程式碼的關卡（XSPEC-383 R3）。** 單元測試證明了函式是正確的，但完全沒有說明使用者是否能呼叫它。2026-04-07 的一次 commit 加入了 `cli/src/utils/spec-linter.js`（172 行，14 個通過的測試）與 `cli/src/commands/sync.js`（133 行）——兩者均未曾被註冊，且同一天下游產品將自己串接至 `npx uds lint --json`，這是一個因此永遠不會存在的指令。四個半月以來，兩端均為綠燈，中間卻無相連路徑。`check-module-reachability.mjs` 從 package.json 的 `bin` 與 `main` 沿著靜態 import、re-export 與動態 import 遍歷，並回報其無法到達的內容。採用 BFS 而非「import 次數 > 0」，因為一組模組互相 import 而沒有任何外部程式 import 該集群時，各自的得分均為 1。在手動搜尋找到 2 個的地方，它找到了 24 個，包括一個完整的九模組 `src/flow/` 子系統。排除項目是帶有每條規則計數的規則，絕非檔名白名單；成功時印出分母；無法靜態解析的動態 import 會被計數並回報，而非被吞噬。已串接至 CI 並帶有於 2026-11-19 到期的基準線，以使它不會在初次接觸時變紅，且 `--self-test` 在該檢查受信任之前作為其自身的步驟執行。
- **`uds lint`（XSPEC-383 R5）。** 註冊了 linter 自 2026-04-07 以來一直在等待的指令，具備在與真實規格接觸中存活下來的兩項檢查：相依性有效性與規格大小。`--json` 發出 `{summary, results:[{specId,status,message}]}`。

### Changed

- **換行符號在雜湊之前進行正規化（#155）。** `uds check` 過去比對磁碟上的位元組，因此設定了 `core.autocrlf=true` 的 Windows checkout 會將每個 LF 轉換為 CRLF，導致每個雜湊都不再相符——而無論是有人編輯了 N 個檔案還是平台重寫了每個換行，讀起來都同樣是「N files modified」。現在正規化在雜湊之前進行，並透過 git 自身的二進位啟發式規則（前 8000 個位元組中含有 NUL 位元組）跳過不得觸碰的內容。遍歷過程還發現了另外兩個從未透過 `hasher.js` 的雜湊實作（`skills-installer.js`、`actual-state-scanner.js`）；所有四處寫入點均已修復。新增了 21 個測試，包括證明在 CRLF checkout 上仍可偵測到真實內容差異與結尾空白差異的負向對照組。前後的 `uds check --force` 輸出逐位元組完全相同，因此現有 manifest 不需要重新蓋章。
- **使用文件產生器向 CLI 查詢而非背誦清單。** `scanCliCommands` 過去將 `cli/bin/uds.js` 讀入變數隨後將其忽略，使用的是註釋為「基於 uds.js 分析」的手寫陣列。因此每次重新產生都會將已移除的 `uds workflow` 重寫回文件中，且從未加入 `uds lint`。它現在解析 `uds --help`，即 CLI 自身的權威答案，涵蓋了任何單一檔案解析都無法看見的註冊風格——`mcp` 是完全從另一個模組註冊的。覆蓋率從 24 個中的 19 個提升至 23 個中的 23 個。解析出零個指令時會擲出錯誤而非發出空白區段。

### Removed

- **`uds sync` 與 AC 覆蓋率檢查（XSPEC-383 R5，選項 E）。** `sync.js` 沒有任何消費者。AC 覆蓋率檢查在 93 份真實規格上進行了測量，回報 98 個驗收條件中有 0 個被涵蓋——並非因為缺少測試，而是因為它是根據位置（`AC-1`、`AC-2`）而非讀取規格所宣告的識別碼來建立 AC 識別碼，然後使用寫死的 `@` 前綴進行搜尋。編寫 `AC-045-001` 且標記時不帶 `@` 的專案，無論其追蹤多麼詳盡，得到的覆蓋率都是零。它所回報的不是「此專案沒有可追蹤性」，而是「我使用自己的約定進行尋找且沒有找到任何東西」，這兩者呈現出來完全相同。它已被移除，而非留在該處未串接：它是其唯一已知消費者並未使用的約定的正確實作，留在樹中等待重新串接。跨存放庫調和 AC 識別碼約定是一場協商，而非一塊補丁，應歸入其自身的案例。

- **檢查 `uds <cmd>` 指令是否確實能執行的關卡（XSPEC-383 R4）。** 2026-08-19 發現指導方針中隨附出貨的三個頂層指令（`uds install`、`uds lint`、`uds sync`）與兩個旗標（`uds check --spec-size`、`uds spec create --boost`）根本不存在——包括在職責完全是「尋找正確指令」的 `quickstart.js` 中，以及將指令寫入每位採用者 `CLAUDE.md`/`AGENTS.md` 的 `integration-generator.js` 中。兩者先前均已修復（`465335e4`）；但沒有任何機制在檢查該修復是否保持修復狀態。`check-command-existence.mjs` 遍歷 `core/`、`locales/`、`ai/standards/`、`cli/src/`、`skills/`、`docs/` 以及存放庫根目錄的 `*.md`，擷取每種 `uds <cmd>` 形式，並使用 `uds <path> --definitely-not-a-real-flag` 針對此 commit 自身的 CLI 探測每一項——而非 `--help`，commander 對於*未知*指令會回答一般指令清單而非報錯，這正是 `uds lint`/`uds sync` 能在第一輪未被察覺而存活下來的原因。旗標探測時帶有兩個結尾哨兵選項，以使接受值的旗標永遠不會意外消耗哨兵並讓真實指令執行。已在專屬的 `command-existence` 變更篩選器（非現有的 `cli` 篩選器——其來源範圍不是 `cli/**`）上串接至 CI。
- 針對當前檔案樹重新執行相同的探測暴露了更多初次事件修復未曾觸及的漂移：`uds workflow`（在 v6.0.0 中已移除）在 `docs/user/CHEATSHEET.md`、`docs/reference/FEATURE-REFERENCE.md` 與 `skills/workflows/README.md`（及其 zh-TW/zh-CN 鏡像）中仍顯示為有效長達五個月，儘管 `docs/MIGRATION-v6.md` 本身就給出了本可以捕捉到它的確切 grep 指令。`uds config --lang`/`--mode`（根目錄 `README.md` 與兩種語系，加上 `docs/reference/INTEGRATION-VERIFICATION.md`）從未作為旗標存在過——正確用法為 `uds config set output_language <value>` / `uds config --type content_mode`。`uds agent install --all` 在 CLI 接受位置引數之處使用了旗標（`uds agent install all`）。`uds reverse-tdd` 則是為 GitHub Actions 範例憑空捏造的（`skills/reverse-engineer/tdd-analysis.md` ×3 種語系）——該能力僅作為 `reverse-tdd` AI agent 出貨，而非可腳本化的 CLI，該範例現在如實說明這點，而非展示捏造的 `coverage.json` 管線。`uds check --interactive`（`cli/src/i18n/messages.js` ×3 種語系）並不存在，因為互動模式本來就是預設值（`--no-interactive` 用於停用它）。29 項發現，29 項修復，剩餘 0 項。

## [6.7.5] - 2026-08-18

### Changed

- **八個技能可再次被模型選取。** `audit-assistant`、`changelog-guide`、`commit-standards`、`docs-generator`、`project-discovery`、`release-standards`、`reverse-engineer` 與 `spec-derivation` 帶有由 `d415937e` 隨說明重寫一併加入的 `disable-model-invocation: true`，且未遵循任何可陳述的規則。它們在 2026-08-17 被刻意保留，理由在當時是正確的：確立的規則是「參考資料可由模型呼叫」，而這些技能完全沒有帶有 `status`，因此解除限制將是用一項無規則的動作取代另一項無規則的狀態。自那之後的測量顯示：**這八個技能均帶有完整的 `Use when:` 觸發條件與 `Not for:` 排除條件，八個均描述一項動作而非參考資料，且八個均已配對有斜線指令**——這正是 `code-review-assistant` 的形式，其 `/code-review` 被判定為不足以成為加上該旗標的理由。`journey-test-assistant` 是現有的先例：相同的「產生 X」形式，`status: stable`，從未被停用。每個技能現在均記錄 `status: stable` 並在行內附上推論理由。使用 `stable` 而非新值，是因為 `skills/` 使用 reference、stable 與 experimental，捏造第四個值將是換湯不換藥的無規則動作。
- **模型實際可選取的技能數量現在為 55 個中的 55 個。** 先前為 45 個。

### Fixed

- **在英文來源去除該旗標後，在地化安裝仍隨附出貨該旗標。** `spec-derivation` 是唯一一個語系包帶有自屬 `disable-model-invocation` 的技能，而 frontmatter 合併僅複製英文來源*擁有*的欄位——因此英文不再宣告的欄位在語系檔中原封不動地存活下來並照樣隨附出貨。zh-TW 與 zh-CN 均已更正。透過解析全部 **60 個技能 × 3 種語系 = 165 個安裝結果**進行了驗證：仍處於停用狀態的數量為零。

## [6.7.4] - 2026-08-18

### Fixed

- **6.7.3 導致 `uds check` 在每個存放庫回報 52 個幽靈遺失檔案。** 兩項 6.7.3 的變更只有在兩者皆存在時才會產生互動：R1 為 skills 提供了內容雜湊，使它們首次進入了 `unchanged` 分支，而 R6b 將該分支的項目收集到 `manifest.fileHashes` 中。該對照表使用 `isFile()` 測試進行驗證，而技能項目是目錄，因此每一個都被回報為遺失。**沒有任何東西被刪除——是紀錄有誤，而非磁碟有誤**（已驗證：59 個技能目錄及其內容完好無損）。`verifiedPristine` 現在僅限於以檔案為基礎的類別，且因為修復寫入程式不會移除它已寫入的內容，`uds update` 也會捨棄它在 `fileHashes` 中找到的 `.claude/skills/` 與 `.claude/commands/` 鍵值——否則錯誤的鍵值將永遠不會被重新檢視，因為磁碟上沒有任何對應項目。
- **指令現在也透過內容進行比對（XSPEC-382 R7）。** R1 涵蓋了 skills，但保留指令為 `hash: null`，讓無條件重新安裝分支對它們繼續保持有效。形式與 skills 的修復相同：`resolveCommandContent(name, agent, locale)` 說明安裝將包含什麼——語系選取與英文後備，加上每個 agent 的轉換——安裝器寫入該內容，而規劃器計算其雜湊。
- **在地化安裝隨附出貨了指向從未安裝之檔案的 SKILL.md 檔案。** 語系包並非英文來源的完整複本——經測量，**zh-TW 中 59 個在地化技能有 4 個，zh-CN 中 59 個有 5 個**缺少英文隨附出貨的檔案——而安裝器整體抽換了語系目錄，因此那些附屬檔案根本未被寫入。其中兩個缺口被引用：zh-TW 的 `dev-workflow-guide/SKILL.md` 三次指向 `workflow-phases.md`，而 `testing-guide/SKILL.md` 三次指向 `test-skeleton-templates.md`。**後備機制現在改為逐檔案而非逐技能**——語系檔案存在處使用語系檔案，不存在處使用英文檔案。
- **非 UDS 隨附出貨的檔案不再使技能永久處於「已變更」狀態。** 安裝技能現在會移除其目錄中未經解析指名的頂層檔案（在實際環境中發現：`deploy-assistant/guide.md`，它不在任何 UDS 技能樹中且從未存在過）。範圍受限於使採用者自己的技能目錄排除在所有此處路徑之外的相同 provenance 測試——經證實，手寫的技能目錄及其額外檔案在 `--force` 下原封不動地存活下來——且子目錄保持不變，因為安裝器從未寫入過它們。

## [6.7.3] - 2026-08-18

### Fixed

- **Skills 現在依內容進行比對，因此升級不再重複印出 55 條毫無意義的列。** diff 的兩端過去均寫死 `hash: null`，因此每個技能都是無條件重新安裝。對來源目錄進行雜湊無法運作——安裝並非逐字複製：在地化的 `SKILL.md` 會合併英文 frontmatter（`brainstorm-assistant`：23,753 位元組的 zh-TW 來源在安裝後變成 23,866 位元組），來源是在執行時期依語系選取並針對每個技能後備至英文，且子目錄會被跳過。以此方式建置，所有 55 個技能在每次升級時都會顯示為內容**變更**——與真實變更無法區分，比已知缺乏訊號的情況更糟。取而代之的是單一函式：`resolveSkillFiles(name, locale)` 說明安裝將包含什麼，安裝器寫入該內容，而規劃器對其進行雜湊，因此兩者不會漂移。已對真實安裝的專案進行驗證——110 個檔案逐位元組完全相同，0 個不符，且 18 個採用者編寫的技能正確保持未解析狀態。實際升級中的 `Update (57)` 現在變為 `Update: 0, Unchanged: 127`。
- **`uds check --restore` 無法還原 72 個受追蹤標準中的 64 個。** 它拿 `entry.endsWith(fileName)` 去比對 `manifest.standards`，而自 3.4.0 以來其中的項目一直是 ID（`commit-message`）而非路徑——這項比對永遠不可能為真。能運作的八個是 `options/` 項目，它們仍儲存為路徑，這就是失敗看起來從未像是全面的原因；其餘的均回報「Could not determine source」。相同的 ID 到來源查詢在檔案其他地方已經存在兩次，而此處從未獲得複本，因此修復方法是在 `registry.js` 中建立單一解析器，與它必須達成一致的檔名解析器配對。
- **逐位元組完全相符的標準無法停止被回報為已修改。** 實際狀態是從磁碟雜湊而來，因此符合上游的檔案被歸類為 `unchanged`，不產生任何動作，且從未重新計算雜湊——而協調在計畫為空時未寫入 manifest 便提早回傳。沒有復原的路徑。diff 現在會回報它**證實**與上游相同的檔案，且這些紀錄會在提早回傳之前獲得更正。刻意保持狹窄範圍：它只會在證實磁碟符合預期的上游內容後記錄雜湊，因此手動編輯絕不會被吸收。將紀錄同步為磁碟上的任何內容將使 `uds check` 永遠無法再次回報已修改的標準。
- **備份未包含技能，且沒有任何提示說明這點。** 技能是目錄，而備份對它們呼叫了 `copyFileSync`，這在所有平台上都會擲出錯誤（在此處的兩個檔案系統上測得 ENOTSUP——非暫存目錄的人為現象）。該失敗被隱瞞了兩次：執行器僅在**完全沒有**備份時才中止，因此單一成功掩蓋了任意數量的失敗，且備份 manifest 沒有 errors 欄位，使得 129 個計畫路徑中備份了 74 個的情況在磁碟上與完整備份無法區分。在修復前於真實存放庫中測量：一份 129 個動作之計畫的備份 manifest 記錄了 74 個路徑，其中**55 個技能目錄中有 0 個**包含在內——這個復原點並未涵蓋它即將覆寫內容的最大部分。目錄現在以遞迴方式複製，manifest 記錄 `failedToBackUp` 與 `coverage: {planned, backedUp, failed}`，且**任何**備份失敗都會中止執行：拒絕覆寫無法預先複製的檔案正是備份的用途所在。

### Changed

- **保留無條件重新安裝的折疊，並擴大其措辭。** 指令仍沒有內容比對，因此該分支依然有效。它未隨技能部分一同移除，是因為默默停止套用的折疊看起來完全就像沒有任何內容需要折疊的計畫。

## [6.7.2] - 2026-08-18

### Fixed

- **`uds update --skills` 更新了一切但從未推進版本標記。** 五個採用者存放庫中有四個停留在 6.6.0，而同一份 manifest 的 `skills.version` 已經顯示為 6.7.0；唯一推進版本的是沒有安裝任何技能的存放庫。兩次執行均以結束碼 0 結束，均印出「57 succeeded」，且均未印出失敗。早先對此的解讀——認為有某處回報失敗但從未浮現——是錯誤的。探測顯示 `results=57 failing=0`，registry 版本解析為 `"6.7.1"`，且即將寫入的值是正確的：**協調器做對了一切，而後續的寫入將其復原了。** `update.js` 在指令頂端、協調器執行前載入一次 manifest，隨後 `updateSkillsOnly()` 將該過期的記憶體中物件覆寫回去。`updateCommandsOnly()` 存在完全相同的缺陷，是透過程式碼走訪而非實際遇到而發現的。兩者現在均重新讀取 manifest 並**僅套用它們擁有的欄位**——將整個物件複製回去將會為後續步驟新增的任何欄位重新引入相同的缺陷。這至關重要，因為該機制自己的註釋說明其存在是為了讓讀取該欄位的每週過期偵察員停止誤報。
- **列出 57 項變更的計畫，其中 55 項為無條件變更。** Skills 不帶有內容比對（XSPEC-382 R1），因此每次升級都重複印出相同的 55 列並帶有完全相同的原因，掩埋了審查者實際必須核准的兩列。它們現在被折疊為單行**並說明折疊了多少項**，總數保持不變——未宣布自身的上限讀起來就像「這些就是全部了」。摘要行現在同樣讀作 `Update: 57 (2 changed, 55 unconditional reinstall)`；單純的 `Update: 57` 雖屬實卻未回答任何問題，而摘要正是您在決定是否核准升級時所閱讀的內容。

### Changed

- **無條件重新安裝的原因字串為單一匯出的常數**，而非在產生它的位置與呈現它的位置各有一份複本。兩份複本之間的漂移在此處將是無聲的：折疊將直接停止折疊，而計畫看起來將完全與以往一樣。

### Testing

- **版本標記的行為測試，與現有的外觀結構測試並存。** 隨修復新增的回歸測試斷言原始碼文字——即兩個函式包含 `readManifest(projectPath)`——這對於呼叫它並捨棄結果的重構仍會保持綠燈。所作的聲明屬於行為性質，因此 `tests/e2e/update-version-advances.test.js` 現在執行真實安裝、播種探測版本、執行 `update --apply --yes --skills`，並斷言標記已移動。已進行雙向驗證：修復時為綠燈，還原修復時為紅燈。
- 兩個新測試套件均斷言**兩個分支**。折疊測試檢查普通計畫是否保持原封不動，因為僅檢查「55 項已消失」的測試對於丟棄所有更新列的呈現器同樣能通過。

## [6.7.1] - 2026-08-18

### Fixed

- **在地化的速查表嵌入了英文的技能描述——對每個語系一律如此。** `scripts/generate-usage-docs.mjs` 在語言迴圈前僅掃描一次技能，且一律從 `skills/`（英文來源）掃描，因此所有三份速查表與功能參考共用同一組描述。修復前測量：**`locales/zh-TW/docs/CHEATSHEET.md` 中的所有 82 個描述與英文描述逐位元組完全相同**——且它們是 6.7.0 之前去除細節的 `[UDS] <label>` 形式，因此繁體中文讀者在安裝的 `SKILL.md` 帶有完整中文觸發表面的情況下，看到的卻是錯誤語言的過期描述。`scanSkills()` 現在接受語言參數並在迴圈**內部**呼叫，優先使用語系變體，並在缺失時針對每個技能後備至英文。在產生器中修復而非在 82 列中修復：手動編輯的速查表保證會在下一次編輯時與 `SKILL.md` 發生分歧。
- **從 `code-review-assistant` 與 `checkin-assistant` 中移除 `disable-model-invocation: true`。** 該旗標未遵循任何可陳述的規則。在帶有 `status: reference` 的六個技能中，**四個（`tdd`、`bdd`、`atdd`、`pr-automation`）從未被停用**，儘管它們的生命週期同樣在 XSPEC-095 中遷移至採用層——相同類別，相反待遇——且其他八個被停用的技能完全沒有帶有 `status`。系統早已記錄了其後果：`pr-automation-assistant` 指引*「審查本身的內容實質——請用 `/code-review`」*，而該轉介在任何模型發起的路徑中均無法到達。所有六個參考資料現在均受到相同對待，這使得規則變得可陳述：**參考資料可由模型呼叫**。兩個檔案均在行內帶有推論理由。其餘八個刻意保持未觸碰——它們沒有 `status`，因此解除限制將是用另一項無規則的動作取代一項無規則的狀態；它們在 XSPEC-378 R5 中指名，而非不予解釋。

## [6.7.0] - 2026-08-17

### Fixed

- **跨所有三個層層還原了技能觸發表面——55 個技能 × 英文、zh-TW、zh-CN。** 技能的 `description` 是模型在決定是否呼叫它時所看見的唯一內容。Commit `d415937e`（2026-02-10）將其中 17 個重寫為 `[UDS] <label>` 並刪除了 `Use when:` 與 `Keywords:` 行，**連同中文關鍵字一併刪除**；相鄰 commit 的標題寫著 `token optimization`。只有 token 是可計數的——沒有任何機制在衡量觸發表面，因此這場權衡在並非單方面有利的情況下顯得像是單方面有利。於 2026-08-14 測量：在帶有 `SKILL.md` 的 55 個技能中，**27 個有觸發條件，27 個有關鍵字，0 個有排除條件，且 28 個兩者皆無**——而這 28 個正是方法論核心：tdd、bdd、atdd、spec-driven-dev、code-review、commit-standards、checkin、requirement。
  - **英文來源**：28 個已還原，且**所有 55 個均獲得了排除條件**（`Not for:`）。增加觸發而不增加排除會換來過度觸發，而一個在不該觸發時觸發的技能會被完全關閉——連同正常運作的技能一起陪葬。在可從 git 歷史中復原的 15 個之中，**有 8 個被重寫**，因為歷史文字已不再描述當前行為：有六個聲稱驅動了在 XSPEC-095 中已遷移至採用層的生命週期。還原過期的描述比完全不還原更糟糕。
  - **語系層**：zh-TW 與 zh-CN，**各自 55/55，採用翻譯而非轉碼**。這部分是重點所在——使用 `--locale zh-tw` 安裝的專案在英文來源早已修復的情況下仍接收到去除細節的描述，因此修復將無法到達其所針對的讀者。繁體與簡體均以各自的用語習慣編寫，且三篇夾雜繁體字的 zh-CN 描述已獲更正。
  - **翻譯漂移 62 → 38**，且剩餘的 38 個是刻意停步：24 個漂移僅來自此次描述編輯的檔案更新了雜湊，而 12 個內文早已漂移的檔案則保留其過期的雜湊——更新那些雜湊將斷言無人驗證過的全檔同步。
  - ⚠️ **28 個之中有十個帶有 `disable-model-invocation: true`**，由同一個 `d415937e` 所加入。對於這些技能，描述並不能還原可選取性——該旗標才可以，而是否解除限制是一項設計決策而非缺陷。模型實際可選取的技能數量為 **45 個，而非 55 個**。

### Added

- **`ai-response-navigation` 1.2.0 → 1.3.0——選用的 R10 與 R11。** 其來源與 R7–R9 不同：使用者在一次對話中兩次表示正確且完整的答案難以閱讀，而當時 R7–R9 已經出貨且受到遵循。開門見山說明發現仍不足夠。
  - **R10——以平實語言為主體；識別碼為輔助。** *觸發條件*：向人類解釋情況、缺陷或系統行為的任何回應。用讀者會使用的詞彙解釋發生了什麼事；路徑、符號、行號、指令輸出與版本字串應置於其所支援的句子**之後**，而非作為句子本身。這**不**代表允許省略它們——想要驗證的讀者必須能夠驗證。**刻意與 R7 分開**：R7 將發現排在證據之前，而回應可以開門見山說明發現，同時卻使用只有其作者才懂的詞彙進行陳述。兩者都讓讀者無法採取行動；它們是不同的失敗模式。
  - **R11——每個選項均帶有其自身的取捨。** *觸發條件*：要求讀者在兩種或多種行動方案之間做出選擇的回應。規則 2 已經要求標記建議並給予*其*理由；R11 要求**每個**選項都必須說明它能換取什麼以及其成本為何。只為建議方案進行辯護的清單將比較的負擔交還給讀者——這正是他們要求代勞的工作——而沒有呈現缺點的選項讀起來就像沒有缺點。**取捨不是模稜兩可的推託**：「稍微困難一點」不是成本，「重寫 110 個檔案且需要人類檢查翻譯」才是成本。空白的成本欄位讀起來像「未經分析」，讀者無法區分這兩者。

## [6.6.0] - 2026-08-17

### Added

- **`spec-driven-development` 2.3.0 → 2.4.0——沒有驗證項目的 AC 不是 AC。** 每個驗收條件都必須有**指向它的驗證項目**——測試、檢查、關卡或明確記錄的手動步驟。沒有任何驗證項目引用的 AC 是一項無人遵守的承諾，且它**不**會大聲報錯：它只是在規格繼續斷言其成立的同時不再為真。**規則**：此類 AC 必須**降級為設計意圖**，不得作為 AC 保留——降級是誠實的，未經驗證的 AC 則是不誠實的。該標準還說明了什麼*不算*驗證項目：「審查者會注意到」不算驗證項目，因為審查者閱讀規格，而規格表示該 AC 成立。新增規則 `SDD-AC-VERIFIED`。
  - **測得的實例**：一份 2026-05-14 的規格帶有 `AC-7: the legacy system-report is fully preserved, no regression`。其測試計畫有七個項目，且**沒有一個指向 AC-7**。該報告的計時器被停用，其部署函式從未被呼叫——**從撰寫該 AC 的同一天起就是如此**。三個月後，在驗證無關的安裝時偶然發現了這件事。它並非串接至檢查後鬆脫；**它根本從未被串接過**。

- **`ai-response-navigation` 1.1.0 → 1.2.0——規範回答本身的選用規則 R7–R9**（XSPEC 借鑑 B-10，來自 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd)，MIT）。規則 1–6 規範回答*之後*的內容：導航頁尾、標記的建議、與回應類型相符的範本。沒有任何機制規範回答本身。因此，回應可以將其結論埋在證據牆之下，卻仍能透過附加正確的頁尾來滿足**本標準中的每條規則**——而無法找到答案的讀者，被告知下一步該做什麼並不會得到幫助。
  - **R7——開門見山說明發現，而非過程。** *觸發條件*：回答問題、回報調查結果或提出決策的回應。第一行說明發現了什麼或該做什麼——不是方法，不是重述請求，也不是回答計畫。證據（`file:line`、指令輸出、表格、測量值）是**支援佐證**，應置於其所支援的聲明之後；開頭先給證據會迫使讀者自行重構結論，而這正是他們要求代勞的工作。這規範了證據的順序；但**不**代表允許省略證據。
  - **R8——每回合重述狀態。** *觸發條件*：跨越 3 次或更多次交流的工作，或包含 3 個或更多步驟的任務。用一行說明工作進展到何處。不能假定讀者能在多則訊息中記住「我們正處於 5 個步驟中的第 3 步」，而重述它只花費一句話。與範本 4（*進行中*）結合：R8 規範開頭，範本規範頁尾。
  - **R9——無開場白贅言。** *觸發條件*：任何實質性的回應。推廣了既有的禁令：[`anti-sycophancy-prompting`](core/anti-sycophancy-prompting.md) 早已禁止*「以正面肯定句開頭進行批評」*，但僅限於批評。R9 出於不同的原因將相同的禁令擴展到每個實質性回應——不是因為奉承，而是因為它在讀者與答案之間造成了延遲。**R9 不適用於結尾語**；R1 的導航頁尾要求依然成立。
  - **採納了來源 10 條規則中的 3 條；捨棄其餘 7 條的理由已記錄在標準本身之中**，而非僅在待辦清單中。兩條與 R1–R2 重複。三條與本標準或其他標準衝突：其*「不回顧／不使用結尾語」*直接與 R1 的導航頁尾相矛盾，其*「清單上限為 5 項」*會截斷證據表格與遍歷分母，而其*「具體時間估算」*已受 [`estimation-standards`](core/estimation-standards.md) 所規範。
  - **在與 R6 相同的意義下為選用**（模型層級註解）：採用者無需啟用它們，現有技能無需追溯變更，且專案可以在其自身的設定中將其中任何一條提升為必要。**非選用的是每條規則都帶有精確的觸發條件**——措辭過於寬鬆而無法觸發的規則與沒有該規則無異，這正是 XSPEC-378 中記錄的失敗模式。
  - 擴充**既有**標準而非新增標準：涵蓋「AI 如何向人類讀者撰寫內容」的第二個標準將會在同一軸線上放置兩個實作。

## [6.5.0] - 2026-08-14

### 新增

- **向 `AmazingAng/old-coder` 借鑑、針對四個既有標準的五項強化**（XSPEC 借鑑 B-01）。未建立新標準；每個切入點都是既有標準內的子句。來自同一來源的另外兩項主張被**拒絕**，因為我們的版本更嚴格——`verification-evidence` 已經帶有四條證據有效性規則與八個實際操作範例，而 `class-level-fix` 已經要求陰性對照必須**依子集合**執行並**指名**違規成員，該來源則沒有。
  - **`verification-evidence` 1.2.0 → 1.3.0 — VE-011，證據新鮮度。** 證據紀錄中的每個數字都必須來自**在其驗證的產物最後一次編輯之後執行的全新單次執行**；任務中途執行的結果已經過期，不得回報。VE-001 到 VE-010 都規範結果如何被*詮釋*；沒有任何一條規範*它是何時產生的*。此項關閉的失敗案例是：測試套件全綠後，又修改了提示詞或設定檔，接著就 commit——通過的測試套件是最後一次變更前的版本，而能抓住這種情況的防護正是釘住內容雜湊的那道檢查，型別檢查與 linter 永遠不會觸發它。
  - **`test-governance` 1.1.0 → 1.2.0 — 門檻閘門必須閉合失效（fail-closed）。** 一個印出百分比且無論數字是否達到門檻都以 `0` 結束的測量層只是一份報告，而不是閘門：當數字向下滑落時它仍保持綠燈，沒有任何機制能阻止下一次合併。強制執行必須來自工具本身的旗標（`--cov-fail-under`、`diff-cover --fail-under`、`nyc --check-coverage`），而不是透過包裝層重新解析印出的輸出。放在這裡而不是 `verification-evidence`，是因為此標準規範**檢查是如何建置的**，而那份標準規範一旦存在結束碼後**如何解讀結束碼**；兩者現在互相參照。
  - **`mutation-testing` 1.0.0 → 1.1.0 — 擊殺歸因、單邊不變量、等價變異體。** `Killed` 代表*某個*測試失敗；工具不會記錄是哪一個，也沒有工具會記錄是哪一個**層級**。因此 7/7 的分數驗證的是整組執行的測試套件，而不是裡面的屬性（property）測試套件——所以「屬性驗證了 X」需要單獨針對屬性測試套件重新執行變異體。單邊不變量（「絕不超過上限」）**無法**偵測到閉合失效的變異體，因為拒絕所有輸入永遠不會產生超出上限的輸出；每個單邊屬性現在都需要其相反邊界。存活的變異體也不自動等於缺口——語意上等價的變異體必須附帶理由分類，而不是用一個純粹為了拉高數字而存在的斷言來擊殺。
  - **`class-level-fix` 1.0.0 → 1.1.0 — 通過陰性對照不能證明什麼。** 通過一次的對照組證明了**一個**已知的壞案例會走到檢查器的失敗路徑。它**不能**證明檢查器能辨識出它聲稱要守護之規則的**每一次**違規。基於 grep 的閘門可以在守護拼寫而非行為時完美地閉合失效：合成的成員只能證明電線已接上，不能證明網子夠大。
  - **VE-012 / CLF-008 — 涵蓋狹窄的閘門必須登錄，不能僅僅揭露。** 當檢查的實際涵蓋範圍窄於其所服務的規則時，僅僅口頭說明是必要但非充分的：**單純揭露並不滿足規則**，因為寫下「此檢查未涵蓋所有內容」遠比擴大涵蓋範圍便宜得多，這樣一來每個狹窄的閘門都會多出一套坦誠的段落，卻依然狹窄。缺口必須在附帶日期的例外清單中登記一條記錄，並附上審查日期。這是本儲存庫本身反覆出現的失敗——讀入 115 個檔案卻只輸出 2 個的雜湊掃描、跳過整個隨附目錄的參照檢查器、只在日期戳記上觸發的索引閘門——每一個都是窄於其規則卻沒有任何提示的閘門。

### 變更

- **`model-selection` 1.0.1 → 2.1.0 — 單一軸度變為雙軸度**（XSPEC-362）。該標準原本依據**一項任務修改了多少個檔案**來決定模型等級（tier）。修改 3 個檔案的模組邊界重新設計，比修改 8 個檔案的機械式重新命名更困難，因此該信號**以固定的方向**誤分類了「深而窄」的工作——這是偏差，而非雜訊。它之所以能留存下來是因為容易測量，而不是因為它能預測任何事情。現由兩項準則取代：**推理上限需求**（是否存在即便花更多思考時間也無法解決的組件？）與**規格明確度**，後者明確具有**雙向性**——把模糊的任務交給字面遵從模型會得到「精準執行了錯誤的句子」，而把寫好的詳細步驟清單餵給高上限模型反而會*降低*輸出品質。等級 id（`fast` / `standard` / `capable`）保持不變；僅準則調整。
  - **與模型軸度正交的全新 effort 軸度。** 思考深度現在是**單次派發的參數**，而非模型的屬性：供應商中立的層級 `low` / `medium` / `high` / `very-high` / `max`，由各平台在本地對應。標準清楚說明哪種失敗該用哪種補救措施——輸出膚淺但合理是**深度不足**（在同一模型上提高 effort），在最大 effort 下輸出性質依然錯誤則是**上限不足**（提升等級）——且兩者不可混用。在尚未用盡 effort 前就提升等級，是一種未經測試的假設，臆測究竟是哪個軸度不足。
  - **新增反向排除章節。** 舊標準只說明何種工作要*提升*到某個等級，從未說明什麼工作*不該送往*某個等級。**硬邊界**（脈絡容量、effort 參數支援、模態）是能力的不存在，而非能力程度較低，必須在成本比較**之前**予以排除——在成本比較之後排除會讓便宜但無能力的模型因價格勝出。**反向風險**：高能力等級可能會透過安全分類器拒絕涉及敏感規格的工作，且**該拒絕並非錯誤**——它會作為帶有拒絕標記的正常回應返回。對於只檢查結束碼或只檢查是否拋出例外狀況的呼叫端而言，這是一種**無聲的失敗**：管線記錄了成功，而工作從未被執行。呼叫端現在必須檢查該標記。
  - **`capability_dimensions` 次維度拆分為 `declared` 與 `measured`。** 原本一個 1–5 分的分數承載著兩種不同事實：*到底能不能做*（二元、供應商宣告、連線時可免費取得）以及*做得有多好*（連續、需要基準測試）。合併在一起時，便宜的事實與昂貴的事實變得無法區分。`declared: false` 現在是硬邊界；`declared: true` 且缺少 `measured` 則為 `UNKNOWN`。禁止從分數推導 `supported`，且**失敗的測量不得記錄為分數**——包括不在 1–5 尺度內的 `0`，這會讓「我們無法測量」看起來與「我們測量了而且結果很差」完全一樣。
  - **`routing_rules` 由三種狀態擴充為四種狀態。** `UNSUPPORTED` 先前代表「分數 ≤ 1 **或未登錄**」，將「測量過且不可靠」與「從未測量過」混為一談。其後果是新偵測到的模型在初次評估時就被排除，且永遠無法重新進入池中——這與支援更多模型的目標背道而馳。`UNKNOWN` 現在是一個獨立的狀態，代表**排入校準佇列**，且兩者在**回傳結構中**必須可區分，而不僅僅在日誌中：呼叫端必須能分清「這個模型做不到」與「我目前還不知道」，因為它們會導向不同的後續動作。
  - **重新測量現在有三個獨立的觸發條件**：版本識別碼變更、`measured.at` 超過 90 天，以及效能退化偵測警報（DEC-033）。版本變更是一個**充分**條件，而非必要條件——DEC-033 之所以存在，正是因為行為變了但版本字串沒變，因此僅以版本變更為依據的實作會錯過它本該捕捉的整個情境。
  - **移除章節版本**（R6a）。該檔案過去同時帶有全檔版本 `1.0.1` *與*標記為 `2.0.0` 的章節，卻沒有任何規則說明 `.ai.yaml` 的 `meta.version` 追蹤的是哪一個——因此「版本同步」並非可檢查的主張。現在只有單一版本欄位，且明定 `.ai.yaml` 追蹤該版本的規則已寫入標準中。2026-04-13 新增的能力管理章節——**先前完全未寫入版本歷史**——現在已記錄於該處。

### 新增

- **`check-model-pin-freshness` — `capability_registry` 的時鐘**（XSPEC-362 R4）。DEC-031 D1 要求*記錄* `pin_date`；卻從未要求*讀取*它。隨附的範例**超過其自身 90 天門檻 120 天**，且在頁面上過期的項目與目前的項目無法區分。該檢查會回報兩種腐化：超過門檻的日期，以及**隨附範例中具體的供應商模型 ID**——寫入標準的模型 ID 是一筆有過期日且無擁有者的引述，因此範例現在改用佔位符。依據 XSPEC-361 R8 對檔內不變量測得的偽陽性率，此檢查為 **WARN，絕不 BLOCK**；只有未完成的掃描才會以非零值結束，因為「檢查器壞了」與「檢查器未發現任何問題」絕不能產生相同的輸出。它走訪隨附的目錄樹，而不是手打的標準清單，並印出其分母與排除項目。`--self-test` 會針對已知裁決的 fixture 執行這兩個謂詞，因為掃描了 366 個檔案卻什麼都沒回報的檢查器，看起來與謂詞從未觸發的檢查器完全相同。已接進 `pre-release-check.sh` 步驟 18.8，該步驟會印出警告而非吞掉警告——`run_check` 會隱藏任何以 0 結束的輸出，而這項檢查依設計是以 0 結束。
- **`model-selection` 的 Claude Code 主機層對應**（XSPEC-362 R5）：`integrations/claude-code/model-selection-mapping.md` 及其機器可讀對應檔、`integrations/claude-code/.claude/agents/` 下的四個參考子代理定義，以及跨儲存庫派發範本。此標準**依規則**是供應商中立的——它將 `fast` / `standard` / `capable` 與 `low` … `max` 定義為標籤，並說明它無法得知特定模型接受哪些 effort 層級，將這些儲存格標記為 `?`。此目錄為單一主機解答了這些問題，並且是整個儲存庫中唯一屬於具體模型識別碼的地方。`core/` 保持不變，且依然帶有**零個**具體模型 ID。
  - **此對應存在是因為名稱對不上。** UDS 的 `very-high` 在 Claude Code 中拼作 `xhigh`——這是唯一重新命名的層級。標準並未為了配合工具而扭曲；重新命名在主機層被吸收，這正是 R5 的目的。
  - **在此主機上 `fast` 等級沒有 effort 軸度**，因為其模型完全不接受任何 effort 層級。這是一個硬邊界，對標準本身的規則產生了影響：**MS-005**（「在同一模型上提高 effort」）**無法在那裡執行**，而改用 MS-001 並不違反排序規則——該等級的 effort 集合從一開始就是空的。標準中儲存格原本為 `?` 的網格現在已針對各提供者完成解析。
  - 依據 R7b，**硬邊界登錄為 `declared`，而非分數**，且由於未執行基準測試，整個過程皆缺少 `measured`——記錄為 `UNKNOWN`，絕不填入預設值。登記表還指出了代理檔案中看不到的兩個邊界：相同的別名在不同提供者下解析為不同的模型（在某些提供者上，`effort` 會無聲失效），以及背景子代理——自 v2.1.198 起的預設值——在固定集合之外會無聲遺失內建工具，且不回報任何錯誤。
  - **R3b 是引述自供應商，而非憑空斷言。** 主機自家的文件指出，其最高能力模型在安全分類器觸發時會觸發自動降級回退（fallback），且從中獲得良好輸出的方法是「描述成果，而非步驟」——分別從另一方表述了 R3b #1 與 #2。
  - **派發範本的原理經過實際測量，並修正了本儲存庫先前隨附的一項主張。** `agent-dispatch.ai.yaml` 曾稱子代理不會載入目標專案的指示，且無法叫用其技能。這兩半句都是錯的：子代理會載入 CLAUDE.md 階層，並且可以叫用技能。真正的限制更為狹窄且更容易被忽略——**它們載入的是主工作階段工作目錄的階層，而不是它們被派去工作的儲存庫階層。** 於 2026-08-12 測量：派發一個被拒絕使用工具的子代理，並在允許它執行 `pwd` 之前詢問其脈絡中有哪些 CLAUDE.md 檔案：剛好兩個，且都不是目標專案的。同儲存庫派發不需要範本；跨儲存庫派發則沒有其他規則來源。此附註已就地修正，附上測量數據，並明確警告不得在閱讀供應商文件後刪除該機制。
  - **`check-model-pin-freshness` 現在也會走訪 `integrations/`。** 該處壓制（suppress）了其 `VENDOR` 謂詞——具體 ID 是主機對應中的*必要*形式——而 `STALE` 仍然適用，這正是掃描該目錄樹的全部原因：模型 ID 是「有過期日且無時鐘的引述」這一論點，並不會因為 ID 搬到了合理歸宿就不再成立。被壓制的符合項目會計入 `skipped` 而不是被丟棄，因此例外保留在分母中，且 `--self-test` 在**雙向**都增加了測試案例——只在壓制方向測試的壓制機制，與吞掉所有東西的機制無法區分。
- **恢復 `agent-dispatch` 機器可讀標準**（XSPEC-362 R5a）：`ai/standards/agent-dispatch.ai.yaml`、自我採用複本，以及登記表 + manifest 項目。`core/agent-dispatch.md` 持續隨附在 npm 套件中，但 `.ai.yaml` 在 6.0.0 中被移除（XSPEC-086 第 2 階段 / DEC-049），前提是假定 `dev-autopilot` 擁有規範性的機器可讀複本。**該擁有者於 2026-04-28 進入維護模式**——就在遷移生效的隔天——而兩個月後移除作業依然照常進行。自那時起，使用 `--format ai` 安裝的採用者在套件中收到了敘述性文字，卻在任何地方都沒拿到規則。`agent-dispatch` 已從所有四個帶有清單的檢查器腳本的 `REFERENCE_ONLY` 清單中移除；該批次中的其他七個標準仍然僅供參考，此處**不予**處理。
  - 職責邊界，使這兩份標準不會滋生相同規則的重複複本：`agent-dispatch` 涵蓋**如何派發**（平行安全、獨立網域/領域、狀態協定、提示詞設計）；`model-selection` 涵蓋**派發給誰以及多深**。它們相互參照而非重複敘述。

## [6.4.0] - 2026-08-10

### 新增

- **`class-level-fix` 標準 — 修復應瞄準集合，而非單一成員。** 缺陷很少單獨存在：它是派發鏈中的一個旗標、manifest 中的一個條目、`agents/` 下的一個目錄。只修復展示給你看的成員，會讓集合中的其餘成員保持原狀，且沒有任何機制會預告下一個缺陷——幾個月後它會作為一起新事故重新上演，這正是為什麼這類工作感覺沒完沒了。規則：在修復之前，指出該缺陷所屬的可列舉集合，並加入一項會**走訪**該集合的檢查。第三個問題決定了該檢查能否存活——走訪是從哪裡讀取其成員的？它必須是系統本身讀取的來源（CLI 定義、目錄、manifest），絕不能是某人手打的清單，因為手打的清單在第四個成員到來之前都是正確的，且沒有任何機制會發出提醒。手動列舉會無聲失敗；帶有排除清單的走訪則會大聲失敗（fail loudly），因為排除項目必須由人寫下並給出正當理由。檢查必須印出其分母**以及它排除了什麼**——「已檢查 4,012 個宣告」讀起來像有涵蓋，而過濾器卻悄悄跳過了每個目錄項目。而且在被信任之前，它必須證明對每個子集合皆非空洞（non-vacuous），因為跨五個清單的檢查若只對第一個清單進行過測試，本質上只是對一個清單的檢查。

  標準中的每個範例都在 2026-08-10 經過測量。支撐它的正是那個反例：本儲存庫十一天前就已經針對 `--integrations-only` 修復了完全相同的缺陷，**並附上解釋通病（general problem）的註解**，卻放任其他三個分支原封不動。知識明明在檔案裡；卻沒有傳遞到它的手足身上。描述類別的註解不是針對類別的檢查。

  該標準直白地指出**它沒有自動化閘門**——沒有任何東西能走訪「目前正在修復的每個缺陷」——並記錄了原因、靠什麼來強制執行（審查，帶著一個問題：*這是哪個集合的成員？*），以及什麼情況下才能建立閘門。略過這點將使它成為其本身所要防範之事的下一個實例。

### 修正

- **`--plan` 與 `--apply` 的範圍行為現在已同步至 `--help`。** 6.3.10 透過編輯 `docs/reference/FEATURE-REFERENCE.md`（一個產生的檔案）記錄了新的組合行為。只要沒人重新產生該檔案，該編輯就能一直存在。現在該文字存於 `cli/bin/uds.js` 中的 `.option()` 字串，因此也會出現在 `uds update --help` 中，這是手動編輯的複本從未做到的。

## [6.3.10] - 2026-08-10

### 修正

- **`--plan` 被其他四個旗標丟棄，而能防止損害的旗標正是被忽略的那一個。** `uds update --plan --skills` 安裝了技能；`--plan --sync-refs` 重寫了整合檔案與 manifest。被記錄為「顯示對齊計畫而不執行（類似 terraform plan）」的旗標被無聲捨棄，因為範圍旗標（`--skills`、`--commands`、`--integrations-only`、`--sync-refs`）在一個每個分支都會 return 的首項相符即獲勝（first-match-wins）鏈中排在模式旗標（`--plan`、`--apply`、`--force`、`--rollback`）之前。`--integrations-only` 早在 2026-07-30 就因完全相同的問題而被修復；其他三個卻被留下，十一天後它們仍在進行寫入。模式現在先於範圍決定，並且有一項測試從 CLI 定義列舉旗標清單，而不是從手寫清單列舉——日後新增的旗標即使沒人記得手動加入也會被涵蓋。正是那項測試發現了第四個實例。
- **`--apply --skills` 升級了技能並悄悄丟下標準不管，卻回報成功。** 同一個鏈路：`--skills` 在 reconciler 執行前就 return 了。以這種方式升級真實專案會讓它停留在先前的標準版本，且畫面上沒有任何提示。`--apply` 與 `--force` 現在會執行對齊*以及*要求的範圍。
- **無人回答的確認提示以 0 結束。** 在非互動式 shell 中，`@inquirer/prompts` 會拋出 `ExitPromptError`；該例外狀況從未被捕捉，且行程仍以結束碼 0 結束——因此在 CI 中「什麼都沒寫」與「更新成功」回傳了相同的值。現在它會說明什麼都沒寫入、指出 `--yes`，並以 2 結束。偵測方式是根據提示實際失敗，而不是探測 `process.stdin.isTTY`（這在雙向上都是錯的）。
- **`--rollback` 現在會說明 `--skills`/`--commands` 無法限縮其範圍**，而不是接受它們卻依然還原所有內容。

## [6.3.9] - 2026-08-09

### 修正

- **標準索引宣告的數字與同步檢查不一致，而兩者描述的是同一個 manifest。** 6.3.8 教會了檢查透過登錄檔解析 manifest 項目；索引區塊卻持續直接根據 manifest 宣告 `installedStandards.length`。在真實專案上那是 78 對 70，差距正是 `MIGRATION-v6` §2 在 6.0.0 中移除的八個機器可讀標準，在兩個主版本之後仍宣告於 manifest 中，因為 `uds update` 並不會修剪它們。無論檢查如何，78 都是錯誤的數字：它直接座落在「權威清單為 `.standards/manifest.json` 的 `standards` 欄位」上方——將讀者指引向差異的來源，彷彿這樣問題就解決了一樣——而且它告訴代理預期有八個根本不存在的檔案。該區塊現在會計算解析至檔案的項目，並在下方列出其餘項目的名稱，附帶一行說明它們為何留存，使兩個數字都呈現出來，無需自行推論。

## [6.3.8] - 2026-08-08

### 修正

- **`uds deps` 在未檢查的集合上印出綠色勾號。** 針對一個沒有執行階段相依套件且使用 pnpm lockfile 的專案執行時，它回報了 `0 runtime dependencies checked`，接著是 `no package-lock.json — nothing to compare the registry against`，然後是 `✓ every dependency resolves to the version you test against`，並以 0 結束。這兩項事實都是真的；但組合在一起時，它們聲稱一個該指令無法讀取的儲存庫已經過檢查且沒有問題，而連接至該結束碼的閘門也表示同意。`clean` 是三個空清單的交集，這在空集合上空洞成立（holds vacuously）——而涵蓋它的測試正是這樣斷言的，理由是分母會隨裁決一起傳遞。它確實傳遞了，但什麼也沒改變：勾號緊隨其後，而結束碼沒有留下任何計數的痕跡。**印出分母並不能阻止空集合被解讀為令人安心的保證；拒絕給出裁決才能。** 同時修正了該訊息的後半部：該專案有一個完全正常的 `pnpm-lock.yaml`，而被告知沒有 lockfile 會讓讀者認定工具陷入混亂並停止閱讀。該指令現在會指名它找到的 lockfile，並說明它讀取的是哪種格式。
- **登錄檔 ID 不是檔名，卻有八處把它當成檔名處理。** manifest 的 `standards` 陣列在設計上是混合的：核心標準在 v3.4.0 成為登錄檔 ID，選項項目則保留為其上游來源路徑，因為選項沒有 ID。每個取用端都對兩者執行 `basename()`——對路徑而言正確，對 ID 而言則是無操作（no-op）。`error-code-standards` 安裝為 `error-codes.ai.yaml`，`logging-standards` 安裝為 `logging.ai.yaml`，`ai-agreement` 安裝為 `ai-agreement-standards.ai.yaml`；大多數 ID 確實等於其 basename，這正是這個問題得以存活的原因。同一個錯誤引發了三處失敗：極簡模式印出 `.standards/<id>`，導致**真實採用者的 AGENTS.md 中七十個路徑有七個指向空無一物**，且直接位於寫著「你必須閱讀並遵守 `.standards/` 中的標準」這行字的下方；索引區塊依 `.ai.yaml` 字尾過濾，而沒有任何 ID 帶有此字尾，因此**每個核心標準都被丟棄**，同一採用者較早的區塊列出了七個選項，其六十三個核心標準卻一個也沒有；而任務對應表是以檔名為鍵值，因此 ID 無法匹配任何東西，該標準就悄悄失去了對應。解析現在改由一個匯出的函式統一處理，供所有八個呼叫處使用，無法解析的項目會在清單下方回報，而不是作為路徑印出。
- **專門用來捕捉此類偏差的檢查也帶有同樣的缺陷。** `AGENTS.md Standards Sync` 對照包含七十個項目的 manifest 回報了 `7/7`：`.ai.yaml` 過濾器只留下七個選項項目，且七個全都存在，因此它打了勾——在升級前該區塊缺少了六十三個標準時如此，在升級後帶有七個無效路徑時亦如此。對其所測量內容的百分之九十視而不見，卻全程一路綠燈。現在同一專案上顯示為 67 / 67，手動破壞一個路徑會回報 66/67 並指名該檔案。它所需的對應早在其上方一百七十行就已建好，並帶有指名完全相同案例的註解。
- **產生器仍將 6.0.0 中已移除的路徑寫入採用者的指示檔中。** `MIGRATION-v6` §2 移除了八個機器可讀標準，其執行階段移至採用層；三行 `Reference:` 與一個 MUST 優先權的任務對應卻一直指向 `.standards/workflow-enforcement.ai.yaml`。人類可讀的 `core/workflow-enforcement.md` 被刻意保留在上游，但採用者收到的是 `.standards/` 而非 `core/`，因此它不是替代路徑——這些行已直接移除而非重新導向。管制該區段的條件匹配了一個自 3.4.0 以來沒有任何 manifest 擁有的檔名，因此對仍宣告該標準的兩個專案早已悄悄停止觸發；現在兩種形式皆能匹配。

## [6.3.7] - 2026-08-07

### 修正

- **`uds deps` 只讀取根目錄的 manifest，因此 monorepo 只得到了其一部分的無問題答案。** npm workspaces 會將宣告放在多個 `package.json` 中，而此指令只檢查了其中一個。在真實專案上測量：回報了 34 個相依套件，宣告了 47 個——workspace 中的 13 個不可見，其中包括一個帶有高嚴重性資安通報的套件。**沒有範圍的計數無法與完整的計數區分**，而這正是該指令存在要回報的失敗。現在會從 `workspaces` 欄位展開 workspace，檢查每個 manifest，且報告會印出包含了哪些 workspace，以便分母帶有其自身的範圍。每個偏差列都會指名其來源 workspace——否則讀者只知道某個套件出現偏差，卻不知道該編輯哪個 `package.json`。
- 三個決定了究竟是真正涵蓋 workspace 還是表面上看起來涵蓋的細節。lockfile 項目可能被提升（hoist）至根目錄，**或者**巢狀置於 workspace 之下，因此兩種情況都會嘗試；只檢查其中一種會將另一種回報為「未出現在 package-lock.json 中」，捏造出的未知會被讀成一項發現。依賴手足 workspace 的 workspace 是一個檔案連結，而非發布的套件，因此會被跳過而非查詢——向 npm 查詢會回傳 404 且會被記錄為無法驗證。此外，比最後區段帶有結尾 `*` 更複雜的 `workspaces` 模式現在會**大聲失敗**，而不是匹配子集合：無聲地涵蓋少於作者原意的情形，是在新地方出現的同一缺陷。

## [6.3.6] - 2026-08-07

### 修正

- **6.3.5 稱隨附的標準皆解析成功。它只計算了 287 個中的 141 個。** 6.3.5 中新增的閘門明確指名了三個目錄且未遞迴，因此 `ai/options/`、`locales/` 與 `skills/`——這些全都被 `prepack` 打包進 tarball 中——皆座落在其分母之外。在 6.3.5 發布後，這些目錄中的十個檔案仍無法解析，包含兩種中文語系及 `skills/` 中。**自行列舉涵蓋範圍的閘門在新增目錄那一刻就會過期**，因此它現在會走訪整個儲存庫並檢查建置與供應商（vendor）路徑之外的每個 `.ai.yaml`——此處為 759 個檔案，相對於其先前聲稱為完整的 423 個。
- **另外八個檔案通過了解析但內容是錯的，這是任何「能否解析」檢查都看不出來的。** `{UT:70%,IT:20%}` 不是一個 mapping：冒號後沒有空格，YAML 會讀出單一純量（scalar）鍵值 `UT:70%` 且其值為 null。未加引號的 `- git commit -m "feat: add model"` 會變成 `{'git commit -m "feat': 'add model"'}`。這些都能通過所有語法檢查，卻給了代理一堆胡言亂語。該閘門現在也會拒絕帶有引號字元或冒號後無空格的鍵值——這是純量被無聲讀取為 mapping 的特徵痕跡——且兩個分支都由對照測試涵蓋而非憑空假設。

## [6.3.5] - 2026-08-07

### 修正

- **四個隨附的 `.ai.yaml` 標準無法解析。** 6.3.4 交付了 141 個機器可讀標準，其中 `agent-behavior-discipline`、`container-security`、`full-coverage-testing` 與 `knowledge-graph-memory` 在語法上是無效的 YAML。同樣的四個檔案存在於 `.standards/` 中，也就是 `uds init` 放入採用者目錄中的內容。讀取它們的代理會收到例外狀況，而非空內容——而捕捉到例外狀況的下游會得到一片寂靜，這與「此標準沒有規則」無法區分。四個檔案都以相同的方式失敗：帶有 YAML 特殊字元的未加引號純量——括號內的冒號、後隨散文敘述的流式序列（flow sequence）、在值中間閉合的引號、縮排與同層手足不同的鍵值。透過加上引號或重新縮排修復，未進行結構重組。

### 新增

- **`npm run check:ai-yaml` — 每個 `.ai.yaml` 都必須能被解析，且此檢查已連接至 pre-commit 與發布流程。** 上述四個檔案之所以能進入正式發布，是因為有八個腳本讀取該目錄，卻沒有一個腳本解析整個集合；`check-standards-sync.sh` 比較版本與登錄檔項目，而無法解析的檔案可以毫無抱怨地通過。該檢查讀取 `ai/`、`.standards/` 與 `cli/bundled/`，且無條件執行而非置於路徑 glob 後面——狹窄到剛好跳過此處的 glob，只是把同一個錯誤搬到新地方而已。**結束碼 2 保留給「檢查無法執行」**：不可讀的目錄、不包含任何 `.ai.yaml` 的目錄、遺失 YAML 函式庫。那不是通過，而且會讓發布失敗，因為「沒有錯誤」與「無法查看」產生相同輸出的檢查，會將未知轉化為令人安心的保證。

## [6.3.4] - 2026-08-07

### 修正

- **`uds deps` 點名了 npm 不會安裝的版本。** resolved 欄位先前是計算為滿足宣告範圍的最高已發布版本。那是 semver 的規則，不是 npm 的規則：每當滿足條件時，`npm-pick-manifest` 會優先選擇 `latest` 的 dist-tag，這正是為了避免帶有普通版號的 `next` 或 `beta` 發布落在要求插入符號（caret，`^`）的使用者身上。在 `@anthropic-ai/claude-agent-sdk` 上測量（其發布了 `latest = 0.3.223` 與 `next = 0.3.224`）：該指令回報了 0.3.224，而 `npm install …@^0.3` 安裝的卻是 0.3.223。唯一一個整個目的都在於說明安裝會收到什麼的欄位，卻點名了沒有任何安裝會收到的東西。現在透過單次 `npm view` 呼叫讀取版本與 dist-tag，並套用 npm 本身的偏好設定，當 `latest` 落在範圍外時回退到範圍內的最大值——固定在較舊主版本的專案仍能獲得真實的答案。兩項測試涵蓋了這兩個分支。
- 先前的兩次發布修正了此指令的用詞。這一次修正了它的計算邏輯，值得明白直說：早期的修正只是讓錯誤的數字更容易閱讀。

## [6.3.3] - 2026-08-07

### 修正

- **6.3.2 修正了解釋，卻留下其上方的標題繼續主張該解釋剛剛撤回的內容。** 偏差區段的標題原本為 `N shipped ≠ tested`——以黃色顯示，位於淡色段落上方一行，該段落解釋出貨是否與測試不同取決於專案如何出貨。對於自帶 lockfile 的產物，出貨*即是*測試，因此標題在報告中最顯眼的行說出了與事實相反的話。這正是 1.1.0 重寫「Lock Strategy」項目以阻止發生的形式：誤導性的行文字下方附帶限定說明。標題現在點名了不一致的兩個欄位——`N tested ≠ resolves`——這是一項關於測量的陳述，而非關於誰收到了什麼的結論。有一項測試維持此行為。
- **還有兩處說了同樣的話，包括採用者最先讀到的那一處。** `uds deps --help` 將該指令描述為「Compare what you test against what your users install (published packages ship no lockfile)」，而模組本身的摘要行則詢問「does what you test match what your users install?」。兩者現在都改以宣告範圍解析出的結果來表述。這是在修復標題後，透過在儲存庫中 grep 被撤回的用詞所發現的——這兩個實例是我自己上一輪檢查時遺漏的。

## [6.3.2] - 2026-08-06

### 修正

- **`uds deps` 斷言了它無法得知的發行管道。** 報告結尾寫著「consumers resolve the range themselves, because a published package does not ship a lockfile」，並將第三欄標記為 `users get=`。對於使用 `npm ci` 建置並作為容器映像檔發行的產品，這兩者皆非事實——其使用者收到的正是 `tested=` 欄位的內容，而 resolved 欄位則是下一次重新產生 lockfile 時將未經審查拉入的內容。這是在針對一個以 Docker 映像檔出貨、完全不發布至 npm 的閉源產品執行該指令時發現的。該欄位現在改為 `resolves=`，且報告陳述了這兩種解讀，因為單獨讀取某一列時絕不能說出與事實相反的話。這與 1.1.0 對 Lock Strategy 項目所做的修正是相同的——在誤導性的行文字下方追加「but note…」仍會讓該行維持誤導性，而報告就像標準表格一樣，大多是一行一行閱讀的。現在有三項測試將該用詞固定住；在此之前完全沒有。

## [6.3.1] - 2026-08-06

### 修正

- **6.3.0 從未抵達 npm — 且本發布之所以存在，正是因為它所描述的同一項失敗。** 發布作業執行時，其無塵室（clean-room）工作在 `npm ci` 階段失敗，出現 `EUSAGE … Missing: @emnapi/core@1.11.3 from lock file`，因此略過了 `Publish to npm`。lock file 先前是由 `npm install --save semver` 重新產生，丟棄了 `npm ci` 所需的傳遞（transitive）項目；我在本地端執行的檢查接受了它，因此該不一致直到發布工作才顯現出來——此時 tag 與 GitHub Release 已經公開了。從上一個證明能通過 `npm ci` 的 lock file 重建，僅加入 semver 項目，並在整個 CI 矩陣中驗證而非僅在單一機器上驗證。
- **`v6.3.0` 被保留在原地，未被刪除，且其發布說明現在註明它從未發布。** 沒有對應 npm 版本的 tag 正是 `uds deps` 為了捕捉而撰寫的不符情況；刪除它只會消除證據，而非消除差異。**6.3.1 包含 6.3.0 的全部內容**，列於下方。

## [6.3.0] - 2026-08-04

### 新增

- **`uds deps` — 你測試的內容是否符合你使用者安裝的內容？** 發布的套件不會帶有其 lockfile：你的 CI 測試的是 `package-lock.json` 釘住的版本，你的使用者得到的則是宣告範圍在他們安裝時解析出的任何版本。當兩者不同時，整組測試套件在沒有人會安裝的組合上亮綠燈，而那個綠燈與真正的綠燈無法區分。該指令針對每個執行階段相依套件比較所有三個數字，並**只回報差異**，同時並列分母——一致的列所構成的表格會被草草掠過，而真正重要的那兩列也會跟著被掠過。
  - **原生相依套件遵循更嚴格的規則。** 具有原生繫結（native binding）的套件如果以範圍宣告，**無論目前是否出現偏差**都會被標記。semver 不對原生 ABI 相容性做任何保證，且此生態系統曾在次版本範圍內破壞過它。剛好只匹配一個已發布版本的範圍是安全的，那是因為上游尚未再次發布，而不是因為有任何保證——等待偏差發生，意味著等到你的使用者手中已經發生偏差。
  - **失敗的查詢絕不回報為一致。** 它會變成 `unverifiable` 並使執行失敗。「一切正常」與「我查不到」看起來一樣的檢查，會將未知轉化為令人安心的保證。
  - `--path`、`--json`、`--concurrency`。

### 變更

- **`supply-chain-security-standards` 1.0.0 → 1.1.0 — Lock Strategy 項目正確但不完整。** 它先前寫著「use lock files, always committed to Git」，讀起來很完整且未給遵守它的人任何進一步深究的理由——然而已提交的 lock file 只約束了*你的*建置，並未觸及你的任何使用者。此處採就地重寫而非附加但書，因為在未變更的規則下方附加「but note…」仍會讓只讀那一行的任何人受到誤導，而標準表格大多是一行一行閱讀的。新章節說明了失敗以及產生該失敗的案例，為進行發布的專案增加了四項要求，並明確將自身範圍界定在發布的產物——已部署的服務會隨附其 lock file，不受影響。

### 附註

- 該標準的 `.ai.yaml` 仍是沒有機器可讀規則的五行虛設代碼（stub）——是 **141 個中的四個之一**，另外三個是 `design-document-standards`、`estimation-standards` 與 `privacy-standards`，因此讀取 `ai/` 層的代理在其中任何一個都拿不到任何東西。本發布刻意未將其唯一的新規則加入該處：在原本空白的檔案中放入單一規則會讓涵蓋率看起來比實際更好。該缺口現在已記錄在檔案內部。

## [6.2.8] - 2026-07-31

### 修正

- **下載的標準出現中文亂碼。** HTTPS 回應是以 `data += chunk` 累加，這會單獨解碼每個 chunk——因此任何位元組跨越 chunk 邊界的字元都會變成取代字元（`日期` → `日期`）。單位元組的拉丁文字未受影響；三位元組的 CJK 文字則受害。過程中沒有任何錯誤：傳輸完成、檔案已寫入、動作回報成功，損害只有在閱讀文字時才看得見。在單一機器上測量，**11 個專案在其安裝的標準中帶有約 278 個取代字元**。損害集中在 `requirement-checklist.md`、`requirement-template.md`、`requirement-document-template.md` 與語系套件（locale packs）——這些發布套件中未隨附的檔案（`files` 未帶有 `templates/` 或 `extensions/`），因此只能透過下載取得。**若你的標準包含 ``，請在 6.2.8 或更新版本上執行 `uds update --force` — 重新下載的內容是正確的並會取代它們。**

## [6.2.7] - 2026-07-31

### 修正

- **Reconciler 無法從任何 npm 安裝擷取擴充套件（extensions）。** `manifest.extensions` 中的項目（語系套件等）到達執行器時沒有解析出來源路徑，因為已發布套件的 `files` 清單未包含 `extensions/` 目錄——因此 `uds update --force` 對它們失敗並回報 `No source path available`，而單純的 `uds update` 卻重新整理了完全相同的檔案。執行器現在透過 `copyStandard` 解析擴充套件，即它先前已用於登錄檔項目、且舊版路徑一直以來使用的 bundled → repo → download 回退機制。沒有任何來源的項目依然會失敗，理應如此。

## [6.2.6] - 2026-07-31

### 新增

- **`uds update --apply`** — 精確套用 `uds update --plan` 所印出的計畫。

### 修正

- **`--plan` 告訴你執行的指令卻忽略了該計畫。** 它印出「Run `uds update` to apply these changes」，但單純的 `uds update` 根本不會進入 reconciler——它執行舊版路徑、重新整理既有標準，並為此回報成功。在一次升級中，它印出 `✓ 69 standards updated`，而上方計畫中的所有 8 項刪除與 2 項建立都被跳過；這些檔案事後仍留在磁碟上。沒有任何錯誤，因此其輸出與套用了計畫無法區分。`--force` 也不是解決之道：它以 `force: true` 重新計算，產生重寫每個受管檔案的更大計畫。**如果你一直在閱讀計畫後執行 `uds update`，該計畫的刪除與建立從未被套用** — 請重新執行 `uds update --plan` 以查看還有哪些未完成項目。

## [6.2.5] - 2026-07-31

### 修正

- **`uds update` 的備份目錄可能會被 commit 到你的儲存庫中。** `.uds-backup-<timestamp>/` 會寫入專案旁以便對齊作業能被復原，且沒有任何規則忽略它——因此 `git add -A` 會將其一併納入。在我們自己的儲存庫中發生了兩次，有一次將 360 個檔案與 73,992 行代碼帶入了一個公開儲存庫。備份現在透過建立時寫入目錄內、包含 `*` 的 `.gitignore` 來忽略自身：`git status` 與 `git add -A` 不再能看到它，且**你的** `.gitignore` 不會被修改。早期版本既有的備份不會溯及既往被隱藏——請自行刪除它們或自行加入規則。

## [6.2.4] - 2026-07-31

### 修正

- **`uds update` 提議刪除你自己編寫的技能。** 出處判定（provenance）先前只要 `manifest.skillHashes` 記錄了技能底下的任何檔案，就將該技能視為 UDS 自有的技能。這只有在雜湊計算器（hasher）壞掉時才算安全——當時 78 個已安裝的技能它只記錄了 2 個項目。在 6.2.2 修復雜湊計算器後，同一份映射填入了 skills 資料夾下的所有 137 個檔案，包括手寫的檔案；接著每個檔案都落在了依據 UDS 隨附內容建置的預期狀態（desired state）之外，並被比較為應移除的孤兒檔案。某個專案的計畫提議刪除 18 個目錄，其中 14 個是其自有的維運（ops）技能。出處判定現在簡化為單一信號：名稱存在於 UDS 自家的 `skills/` 目錄樹中。UDS 自那時起已移除的技能現在會發出警告而非刪除——磁碟上沒有任何東西能將它們與你自己的工作區分開來，保留一個過期的目錄並附帶警告，是比刪除某人手寫的檔案更好的失敗處理方式。**如果你使用的是 6.2.2 或 6.2.3，且在 UDS 的技能旁保留了自己的技能，請在套用任何變更前先執行 `uds update --plan`。**

## [6.2.3] - 2026-07-31

### 修正

- **重新選取已安裝的代理會附加重複的 manifest 條目。** 四處寫入 manifest 的程式碼以 `[...existing, ...new]` 附加安裝，因此每次重新選取時，已有記錄的代理都會增加第二個條目；某個專案的 manifest 內容為 `['claude-code', 'claude-code']`。安裝程式本身從未受到影響——`installSkillsToMultipleAgents` 會對其輸入去重複。損害僅限於*紀錄*以及反覆走訪它的每個取用端：`checkNewFeatures` 以及 reconciler 的掃描器和預期狀態計算器各自走訪了該代理兩次。實際效果上無害，這正是它在五次升級中累積卻未被察覺的原因。這四處寫入程式現在使用安裝程式原先就依賴的同一個輔助函式。

## [6.2.2] - 2026-07-31

### 修正

- **`uds check` 先前只回報了你檔案中極小部分的技能完整性。** 在某個專案上，已安裝 **345** 個檔案，它卻印出 `✓ All skill files intact (6 files)`。`scanDirectory` 使用 `fullPath.slice(basePath.length + 1)` 推導相對路徑，這假定了基礎路徑不帶有結尾分隔符號——然而有三個代理的技能路徑帶有結尾分隔符號（`.claude/skills/`、`.opencode/skill/`、`.cursor/skills/`）。因此每個項目都失去了第一個字元（`ac-coverage` → `c-coverage`、`.manifest.json` → `manifest.json`）；`computeDirectoryHashes` 從殘缺的名稱重建絕對路徑，找不到檔案，便跳過了該項目。掃描了 115 個檔案，計算了 2 個雜湊。過程中沒有任何錯誤——目錄存在、迴圈完成、函式回傳了物件，而該檢查在僅涵蓋 2% 範圍的情況下印出了綠色勾號。`manifest.skillHashes` 現在已正確填入；同一個專案現在回報 345。

## [6.2.1] - 2026-07-31

### 修正

- **`uds update --locale <x> --skills` 現在會記錄它安裝了哪個語系。** `manifest.skills.locale` 曾只由 `init` 寫入一次，再無其他路徑寫入——這與 6.2.0 不再信任 `skills.names` 的「注定過期（stale-by-design）」形式如出一轍。將專案的技能切換為本地化變體會替換磁碟上的每個檔案，卻放任該欄位原封不動。該欄位在 6.2.0 中成為關鍵承重欄位（load-bearing），其語系修復會優先讀取 `skills.locale`，回退時才讀取 `display_language`：當兩者不一致時——例如專案的顯示語言是英文，但其技能是以 `--locale zh-tw` 安裝——下一次對齊會悄悄將它們全部改回英文。完全是 6.2.0 所修復的缺陷從另一扇門重新進入。現在所有五個技能安裝路徑都會記錄其安裝的語系。

## [6.2.0] - 2026-07-31

> **調解器（reconciler）過去會刪除它未安裝的項目，並在事後回報成功。** `uds update --plan` 曾提議從某個採用者 repo 中移除 86 個檔案；其中 72 個是 UDS 隨附且該專案正在使用的 skill、command 與 option 檔案。十二個缺陷，全屬同一種形式：格式完好的名稱卻永遠無法匹配，因此沒有拋出任何錯誤，且計畫看起來權威可信。若你曾看著 `--plan` 的輸出並納悶它為何想刪除你的成果——那不是你的問題。

### 新增

- **`CLAUDE.md` / `AGENTS.md` 中的標準索引現在會宣告數量並指向 manifest**，而非依名稱列出每個標準（XSPEC-358 R1）。逐項枚舉的清單在每個專案中消耗約 2 KB 永遠載入的脈絡，且與具權威性且永不過期的 `.standards/manifest.json` 重複。該區塊會在下一次 `uds update` 時自行重新產生；無需任何手動操作。**若你有解析該枚舉清單的工具，請改為讀取 `manifest.standards`。**

### 修正

- **調解器不再刪除你自己撰寫的 skill。** `isUDSManaged` 過去對 skills 資料夾下的每個目錄都回傳 true，因此任何非當前執行之 UDS 版本所隨附的項目都會被提議移除。某位採用者的計畫曾列出十四個手寫的維運（ops）skill 待刪除。現在來源出處（provenance）是根據 UDS 自身的 `skills/` 目錄樹來判定——這也涵蓋了較舊版 CLI 誤複製進來的非 skill 同級目錄（`_shared`、`agents`、`ai`、`tools`、`workflows`），因此這些仍可被清理——或是根據記錄的雜湊值判定。其他任何項目只會發出警告，不會被移除。這是刻意承擔的代價：UDS 後來廢棄的四個 skill 現在只會發出警告而不會被刪除，因為磁碟上沒有任何資訊能將它們與你自己的成果區分開來。
- **`manifest.skills.names` 與 `commands.names` 不再被視為期望狀態（desired state）。** 兩者過去都僅由 `init` 寫入一次，沒有其他程式碼路徑會更新。某個 repo 的清單在九次 commit 與五次 UDS 升級中一直凍結在 32 個 skill，而隨附的組合已增長至 55 個，導致 40 個可用的 skill 在比對 diff 時被列為「不再處於期望狀態」。現在期望組合是以當前執行的 UDS 版本所隨附的內容為準，這也是 `uds update` 實際安裝的內容。全部 18 個安裝點現在也會保持這些清單的真實性。
- **Gemini CLI command 不再被提議刪除。** 掃描器過去寫死了去除 `.md` 副檔名；Gemini 將 command 安裝為 `.toml`，因此其鍵值保持為 `commit.toml` 且永遠無法匹配期望鍵值 `commit`。全部 30 個 command 在比對時都被視為孤兒。現在副檔名來自代理設定，並與寫入這些檔案的安裝器共用。
- **UDS 不再提議刪除其自身的安裝紀錄。** 由 command 安裝器寫入的 `.manifest.json`，過去被誤計為游離 command。
- **已選取的 option 不再被提議刪除。** `calculateOptions` 過去迭代 `manifest.options` 時將其鍵值視為 standard id，找不到名為 `workflow` 的標準後便跳過——導致為每個專案產生出空的期望 option 組合。某個 repo 的計畫曾提議刪除其自身 manifest 所列出的全部七個 option。現在 manifest 鍵值到登錄檔分類（registry-category）的對應關係收錄在單一表格中，供安裝器與計算器共同讀取。
- **語系套件（locale pack）與其他擴充套件不再被提議刪除。** 調解器中完全沒有處理 `manifest.extensions` 的分支，因此每個已安裝的擴充套件——語系套件、語言風格指南、框架模式——都落在期望狀態之外，而 manifest 卻仍繼續將其列為已安裝。
- **調解（reconcile）不再將每個 skill 以英文重新安裝。** skill 安裝路徑漏傳了 command 路徑所傳遞的 locale 引數，導致本地化的 skill 被靜默替換為標準英文版本，而 `skills.locale` 卻仍記錄著原始語系。
- **成功的調解現在會記錄其調解到的版本。** `upstream.version` 過去從未向前推進，因此 `uds check` 仍回報該專案落後，任何讀取該欄位的過期監控機制也會持續發出警示。
- **重寫後的整合區塊不再回報自身已被修改。** `migrate_block` 過去只更新了 `integrationBlockHashes`，卻未更新檔案完整性（File Integrity）所比對的 `fileHashes`。
- **調解器與 `uds update` 現在會產生相同的整合區塊。** 兩個獨立的建構器此前發生了漂移：調解器的建構器完全遺漏了內容類別，因此調解專案時會靜默丟棄其 commit-message 區段；它還無視 `options.output_language` 將輸出語言預設為英文，且在 manifest 以檔案名稱儲存時卻透過 tool key 查詢 `integrationConfigs`。
- **Option 檔案在索引區塊中被正確計數。** 它們過去是從 `manifest.standards` 計數，而該欄位的記錄並不一致——某個 repo 安裝了七個 option 卻回報「0 options」。
- **`uds check` 不再對新的索引區塊回報錯誤的未同步狀態。** 有兩項檢查過去透過 grep 每個標準名稱來斷言已被淘汰的枚舉清單，因此升級後回報了 `5/70` 與 `0/7` 並建議執行 `uds update`——而這只會重新產生相同的區塊。兩項檢查現在都會根據 manifest 驗證宣告的數量，這也能捕捉到名稱 grep 永遠無法發現的過期計數。
- **`manifest.integrations` 寬容讀取兩種格式。** 它曾在一條路徑被寫為 tool key，在另一條路徑被寫為檔案路徑；在測量的 21 個 repo 中有 20 個儲存的是檔案路徑，而調解器只認得 tool key——因此它提議將所有這些 repo 的 `CLAUDE.md` / `AGENTS.md` 中的 UDS 區塊全部移除。
- **`uds update --plan --integrations-only` 不再寫入檔案。** `--integrations-only` 分支過去在 `--plan` 檢查之前執行。
- 當測試套件從儲存庫根目錄執行時，**`uds init` 不再將 husky 安裝至 UDS 原始碼儲存庫**。

### 變更

- **釋出閘門（release gate）重新恢復測量能力。** `pre-release-check.sh` 過去直接呼叫裸指令 `tsx`，因此在 PATH 中沒有它的 shell 上，有三項檢查因缺少二進位檔而回報「✗ Failed」——這與真正的檢查發現無法區分；現在它會解析 `tsx` 或中止。此外，其 dogfooding 閘門執行 `uds check` 時未帶 `--force`，而 DEC-044 的自我採用防護在此 repo 內會拒絕此操作——導致該閘門自 5.15.1 加入以來在每次發布時都失敗。


## [6.1.1] - 2026-07-18

> **`uds check` 悄悄測量了錯誤的對象。** 它的過期檢查將你的標準與 CLI 自身隨附的複本進行比對，而非與 npm 比對——因此過期的 CLI 會產生倒退且毫無意義的訊息，永遠無法如實指出你的標準落後——而且它將該訊息埋沒在每個未變更檔案各佔一行的輸出底下。

### 修正

- **`uds check` 現在會將你安裝的標準與 npm 上的最新版本比對，而非與 CLI 自身隨附的複本比對**（XSPEC-342）。`displayAdoptionStatus` 過去拿 `manifest.upstream.version` 與*執行中 CLI 內部*隨附的標準進行比對。當 CLI 本身過期時，該隨附複本比 npm 上的版本更舊——因此檢查會印出倒退的 `⚠ Update available: 6.1.0 → 5.12.1`（叫你「更新」到更*舊*的版本），且在架構上永遠無法回報你的標準已經落後。現在它會向 npm 查詢最新版本；當你的標準落後時，訊息會改為 **"Your installed standards are behind the latest release"**（你安裝的標準落後於最新版本）並提供完整的兩步修復方式——`npm update -g universal-dev-standards` **接著** `uds update`——因為僅更新 CLI 不會動到你專案的 `.standards/`。`--offline` 會靜默跳過比對，而不再退回使用誤導人的隨附檢查。

### 變更

- **`uds check` 不再逐一列出每個未變更的檔案**（XSPEC-342）。它過去為每個追蹤的檔案印出一行 `✓ … (unchanged)`——約佔該指令輸出的 70%（測量為 121 → 41 行）——這埋沒了真正需要閱讀的訊息，並使輸出過長而導致自動化呼叫端（pre-commit agent）將其截斷。逐檔的「unchanged」清單已被移除；數量保留在單行的完整性摘要中，且修改過、遺失、未計算雜湊的檔案仍會單獨列出。

## [6.1.0] - 2026-07-17

> **兩個相同形式的失敗，一個在標準中，一個在 CLI 中**：檢查執行、返回並回報成功，卻什麼都沒測量到。`verification-evidence` 獲得了指名此問題的層次；`uds init` 不再是它的實例。

### 修正

- **`uds init` 不再覆寫既有的 `prepare` 腳本**（XSPEC-341）。自 2026-02-04 起，`uds init` 會在任何沒有 `.husky/` 目錄的 Node 專案上呼叫 `npx husky init`。該指令是用於*新*專案的一次性 bootstrap：它會無條件設定 `"prepare": "husky"`。若你的專案已有 `prepare`——對於發布的套件而言，`prepare` 通常是建置步驟——**它會被靜默替換**，且 CLI 還回報成功。`uds init` 現在改以串接方式處理而非直接覆蓋（`"tsup"` → `"tsup && husky"`），印出它修改的每個 `package.json` 欄位，且不再丟棄 husky 的 stderr。

  > **⚠️ 若你曾在已有 `prepare` 腳本的專案上執行過 `uds init`，請立即檢查。** 此修正只能保護未來的執行；無法還原已被重寫的 `package.json`。其症狀為原本預期是建置指令的地方變成了 `"prepare": "husky"`——而若你的套件發布建置後的輸出（`files: ["dist"]`、`main` 指向 `dist/`）且沒有 `prepack`/`prepublishOnly`，你的下一次 `npm publish` 將會發布未建置或過期的目錄。請透過串接將其還原：`"prepare": "<你原本的指令> && husky"`。

- **`uds init` 不再將 `npm test` 寫入 `.husky/pre-commit` 作為初始內容**（XSPEC-341）。那行來自 husky 的 init 範本，而非來自 UDS——它在每次 commit 上強加了採用者從未選擇啟用的完整測試套件關卡。UDS 現在只會附加其自身的 `npx uds check`，且只附加至既有 hook 而非將其重寫。

- **新建立的 husky hook 以 v9 格式寫入**（XSPEC-341）。後備 hook 範本先前仍輸出 v8 的 `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` 前導內容，這在 husky v9 中已廢棄並在 v10 中移除——而 `uds init` 安裝的是 husky `^9`。此問題過去處於潛伏狀態（先前由 husky init 寫入 hook）；移除 `husky init` 使後備範本提升為主路徑，因此已將其修正。

### 變更

- **`verification-evidence` 1.1.0 → 1.2.0 — 證據有效性（evidence validity）**（XSPEC-340）。該標準先前將 `exit_code` 視為客觀事實（ground truth）：`trust_rules` 規定「`exit_code ≠ 0` → 驗證失敗」，`physical_spec.checks` 詢問「`exit_code` 是否為 0（成功）？」，且 VE-002 在任何非零時觸發修復循環。**這三者現在皆加上限定條件**，因為驗證指令可能執行、返回，卻毫無意義：
  - **新增 `evidence_validity` 層 + 規則 VE-007 ～ VE-010**：`exit_code = 0` 僅對成功時回傳 0 的工具代表成功（VE-007）；在證明查詢工具確實執行之前，「empty / not-found / 0」不代表不存在（VE-008）；存在性檢查絕不得丟棄 stderr（VE-009）；管線的結束碼不屬於任何單一階段（VE-010）。
  - **新增 `non_evidence_claims`**：「Done」／「It should work now」／「I changed the code」／「The tests should pass」／「The command returned 0」。
  - 與 `anti-hallucination` 有所區隔，後者的禁止事項皆屬於「不可斷言你未檢查的事物」。這是相反方向的失敗——**它確實檢查了，但檢查工具卻悄悄地未發揮作用**。`core/verification-evidence.md` 附有八個真實案例作為佐證。
- **`verification-evidence` 人類閱讀文件已追上 v1.1.0。** v1.1.0 的 `environment_layer` 工作（XSPEC-204）先前已合入所有三個 `.ai.yaml` 複本，但**四個 `.md` 複本全都未合入**——人類閱讀文件自 2026-05-13 以來對標準的描述一直是不正確的。`core/*.md` 現在記錄了 `environment_layer`、Environment Layers 區段以及 VE-005 / VE-006。
- **`verification-evidence` 獲得了三個先前僅存在於繁體中文（zh-TW）翻譯中的區段**：Non-Evidence Claims、Evidence Types、Related Standards。翻譯版本先前比其來源更完整；這些區段現已上游化為英文，並同時存在於兩種語系中。

## [6.0.0] - 2026-07-06

> ⚠️ **主版本發布。** 包含一項破壞性重新命名，並移除了 8 個已廢棄的機器可讀標準與 4 個已廢棄的 CLI 指令（自 5.4.0 起皆帶有「removed in 6.0.0」通知）。**請參閱 [v6 遷移指南](docs/MIGRATION-v6.md)**（[繁體中文](docs/MIGRATION-v6.md) | [简体中文](../zh-CN/docs/MIGRATION-v6.md)）。

### 變更 — 破壞性變更

- **`review` 指令／skill 重新命名為 `code-review`**（T1）。`/review` 呼叫者必須遷移至 `/code-review`；flow-id `review-flow` → `code-review-flow`。請參閱遷移指南 §1。

### 移除 — 破壞性變更（自 5.4.0 起預定）

- **移除了 8 個已廢棄的 `.ai.yaml` 標準 stub**（依據 XSPEC-086/095 / DEC-049，執行環境已於 5.4.0 遷移至採用層）：`agent-communication-protocol`、`agent-dispatch`、`branch-completion`、`change-batching-standards`、`execution-history`、`pipeline-integration-standards`、`workflow-enforcement`、`workflow-state-protocol`。供人類閱讀的 `core/*.md` 文件仍保留作為參考（現列於 registry-check 的 REFERENCE_ONLY 清單中）；登錄表項目已移除。請參閱遷移指南 §2。
- **移除了 4 個已廢棄的 CLI 指令**：`uds start` / `uds mission:*`、`uds workflow:*`、`uds flow:*`、`uds sweep`（編排為採用層的責任；`/sweep` skill 取代 `uds sweep`）。清理了引用已移除指令的無效 i18n 鍵值與 CLI 內部過期提示（`config` 下一步、`quickstart` 配方）。請參閱遷移指南 §3。

### 新增 — 新標準（覆蓋路線圖梯次與旗艦標準）

- **領域與生命週期標準完備**：產品——`prd-standards`、`product-metrics`、`user-story-mapping`（XSPEC-069）；基礎設施——`container-image`、`secret-management`、`iac-design`（XSPEC-065）；SRE——`incident-response`、`slo-sli`、`runbook`（XSPEC-063）；資料工程——`data-pipeline`、`schema-evolution`、`data-contract`（XSPEC-068）；合規——`audit-trail`、`pii-classification`（XSPEC-066）。
- **旗艦標準**：`verification-oracle`（XSPEC-256）、`model-provenance`（XSPEC-255）、`resource-cost-boundary`（XSPEC-277）。
- **`user-journey-testing`** 作為一級標準正式出貨（ai/standards + core + zh-TW + registry）。
- **`logging-standards` 強制事件目錄**（XSPEC-234）。

### 新增 — UDS Stage 2 強化（T5–T16）

- 在 `acceptance-criteria-traceability` 與實際範例中加入**標準 AC 標註**（T5）。
- **具來源引用的量化門檻**（T8）：`browser-compatibility` 95%/90% 關卡、`checkin` 程式碼壞味道、`accessibility` 工作階段逾時、`code-review` PR 大小／回應時間 + 批次例外、`project-context-memory` 7 天過期判定、`developer-memory` 淘汰機制、`privacy` DPIA「大規模」定義。
- **失敗處理（Failure Handling）章節**（T7）：`git-worktree` 暫態失敗重試、`reverse-engineering` 呈報流程、`forward-derivation` 復原機制。
- **跨職能交接**（T16）：`security-testing` 發現項目修復生命週期、`pii-classification` 探索與交接合約。
- **詞彙表術語正規化**作為標準真實之源（T6）。
- **CLI 強化**（T11/T12）：Mission `FAILED` 終止狀態 + 恢復防護、具復原功能的交易式 `init`、針對 `hitl`/`run`/`release`/config 的輸入驗證。

### 新增 — 遷移與重構完備性系列

- `migration-assistant` 切換後資料調解（XSPEC-284 P0）、狀態機與時間對等性（XSPEC-287）；`full-coverage-testing` 遷移錯誤路徑完備性（XSPEC-288）；`performance-standards` 遷移非功能性對等（XSPEC-286）。

### 新增 — 工具與工作流程

- **針對 `/brainstorm` v4 的 BQS v1 品質合約**（XSPEC-296）。
- `ci-cd-assistant` skill 中的 **CI 作業編排模式**——觸發分離、共享資源序列化、變更偵測關卡、建議型與關卡型比較、`npm ci` `EUSAGE` 疑難排解（UDS #126 / XSPEC-300）。
- `pipeline-security-gates` 中的**部署前證明驗證閘門**。
- 發布流程中的**發布前 Issue/PR 分流閘門**（XSPEC-265）。
- `release verify` 現在會讀取記錄的 manifest 總和檢查碼（checksum）。
- `/journey-test` 與 `/skill-builder` 註冊為正式指令。
- 選用的模型層級（model-tier）標註（R6，XSPEC-270 工作包 A）。
- `sync-standard` 四層同步工具；Phase 2 內容覆蓋率稽核詮釋資料。

### 新增 — 事故導向的防漂移與可測試性

- **`refactoring-standards` 語意重複與複製漂移（Semantic Duplication & Copy-Drift）**（#142）：指名了複製漂移（Copy-Drift）反模式（領域事實跨多處重複實作，或是儲存了衍生聚合值卻未對其來源強制綁定——這在文字重複指標中是看不見的）與單一真實之源／推導而不重複（Single-Source-of-Truth / Derive-Don't-Duplicate）的解法（每個事實單一單元、優先推導而非儲存、在單一瓶頸點重新計算儲存的聚合值、透過 golden + 架構測試鎖定），以及遷移的刻意分歧登錄表（Intentional-Divergence Registry）。
- **`mock-boundary` 可注入的背景執行**（#143）：將行程內的發後不理（fire-and-forget）工作（`Task.Run`、未 await 的 promise、`setTimeout`、goroutine、executor）視為如同時鐘般的可注入接縫——正式環境維持真實的發後不理，測試分派器則行內執行並追蹤任務以實現確定性完成；新增了輪詢／睡眠等待背景結果（Poll/Sleep-for-Background-Result）反模式與禁止輪詢／睡眠規則。

### 變更

- **API 版本控制與廢棄整合成單一真實之源**——生產者端的 API 版本控制內容收錄進 `api-design-standards`；不一致的廢棄時程完成調解（XSPEC-298 R8）。
- `versioning` 新增 **Deployment Version Identity** 區段，並附帶建置詮釋資料鑑別器（build-metadata discriminator）的注意事項（XSPEC-298 R1）。
- **`versioning` 建置身分與多語言版本控制**（XSPEC-298 R2/R3）：針對 .NET/JVM/多語言專案支援從 git-height 推導的版本控制（MinVer / Nerdbank.GitVersioning / GitVersion）；建置身分（build identity）提升為強制要求——已部署的服務「必須」透過 `/version`|`/health` 公開 `version + commit sha + build time`，且 Phase-5 驗證「必須」斷言該 sha 與已部署的產物相符（#138）。

### 廢棄

- **6 個工作流程 skill** 標示為 `reference` 並帶有明顯的廢棄通知；已廢棄的執行階段指令標註了結構化的 `@superseded-by` 指標（XSPEC-291 §4）。

### 修正

- **`uds audit` 誤報**：`options/` 檔案被回報遺失（健康檢查現在會遞迴進入子目錄）、CP950 主控台亂碼、非 TTY 環境當機（#115）；未使用的標準偵測現在比對標準 ID 而非檔案名稱（#125）。
- **恢復 Bundle ⇄ source 對等性**——將 25 個標準同步至 `.standards/` 自我採用目錄樹中。
- 大量文件／i18n 完整性修正：過期的標準／skill／command 計數、失效的語系交叉連結、command/skill 索引重新產生、anchor-slugger 與表格對等性路徑。

## [5.17.0] - 2026-06-08

### 新增 — 可執行的 SDD 一致性與 AC 格式擴充（XSPEC-262/263/264）

- **`/sdd analyze` — 跨產物一致性（XSPEC-262，`scripts/sdd-analyze.ts`）**：acceptance-criteria-traceability + forward-derivation 單一脊柱（single-spine）的可執行呈現。7 個信號——孤兒測試／未覆蓋／not_implemented／跨規格 AC 衝突／孤兒 .feature／無場景 AC／使用者指南↔E2E 漂移（`T-NNN`，實現 XSPEC-260 R5）。`npm run sdd:analyze [-- --userguide docs --json]`；12 個 bats 測試。`/sdd` skill 說明了此動作與 ac-coverage 的分工。
- **EARS 標記法作為選用 AC 格式（XSPEC-263）**：`spec-driven-development` v2.2.0→v2.3.0 新增附帶 5 個 EARS 範本的 AC Formats 區段；`acceptance-criteria.schema.yaml` 新增選用的 `ears` 欄位（`given/when/then` 由必填放寬，具向下相容性）。GWT 仍為預設且偏好格式。
- **結構化 Bugfix 規格範本（XSPEC-264）**：`sdd-guide.md` 將 bug 決策樹劃分為微小（trivial）與容易回歸（regression-prone），並新增輕量級的 `<BUG-ID>.bugfix.md` 範本（目前／預期／**未變更**行為 + 根本原因 + 作為 AC 的回歸測試）。

> 附註：`sdd-guide` 語系（zh-TW/zh-CN）對 Bugfix 範本的同步延後至 XSPEC-248 功能審查循環（既有的語系漂移）。

## [5.16.0] - 2026-06-08

### 新增 — 測試推導鏈延伸至使用者指南（XSPEC-260）

- **`core/forward-derivation-standards.md`**：新增 `## Terminal Projection: User Guide` 區段 + `### Single-Spine Principle`。將推導管線跨越測試延伸至使用者指南——使用者指南是旅程／E2E 測試透過機器驗證的同一個 AC 脊柱的終端投影。定義了共用的 `T-NNN` 編號（使用者指南步驟的 `T-NNN`「必須」等於真實的旅程／E2E 測試 ID）、採取保守預設的面向使用者 AC 過濾條件，以及單一脊柱原則：測試／文件來源是單一 AC 脊柱的 N×1 投影，而非 N×N 平行交叉核對；另立平行的編號方案屬於「違規」（VIOLATION）。
- **`ai/standards/forward-derivation-standards.ai.yaml`**：映照的 `terminal_projection` 區塊 + 3 條規則（`single-spine-no-parallel-numbering`、`user-guide-shared-tnnn`、`user-facing-ac-conservative-default`）。
- **`core/acceptance-criteria-traceability.md`**：新增 `## User-Documentation Coverage` 維度——追蹤面向使用者的 AC 是否記錄在使用者指南中。包含面向使用者 AC 的過濾條件（保守預設：有疑慮時即視為面向使用者）、復用 ✅/⚠️/❌ 狀態，以及排除非面向使用者與 `not_implemented` AC 的覆蓋率公式。
- **`ai/standards/acceptance-criteria-traceability.ai.yaml`**：映照的 `user_doc_coverage` 區塊 + 2 條規則（`user-doc-user-facing-only`、`user-doc-shared-tnnn`）。
- **zh-TW / zh-CN 語系**：兩個標準的兩個新增區段皆已完成完整翻譯。

## [5.15.0] - 2026-05-28

### 新增 — i18n 分層語言策略（XSPEC-239）

- **`core/ai-instruction-standards.md` v1.0.0 → v1.1.0**：新增 `## Internationalization (i18n)` 區段，為 SKILL.md 與根目錄層級的 AI 指令檔定義 L1/L2/L3/L4 分層語言策略。**範圍擴展**從僅限根目錄層級（`CLAUDE.md`、`.cursorrules` 等）延伸至亦涵蓋 skill 層級檔案（`SKILL.md`）。定義了標準／語系檔案結構、責任邊界、防嵌合體（chimera-prevention）規則以及採用者安裝模型。
- **`ai/standards/ai-instruction-standards.ai.yaml` v1.0.0 → v1.1.0**：映照的 `i18n:` 區塊 + 4 條新規則（`i18n-canonical-english-only`、`i18n-locale-must-match-language`、`i18n-l3-template-language-controls-output`、`i18n-no-manual-canonical-edits-by-adopters`）。
- **補齊 10 個缺少的 zh-TW 語系 skill 版本**：`ac-coverage`、`deploy-assistant`、`dev-methodology`、`journey-test-assistant`、`orchestrate`、`plan`、`push`、`skill-builder`、`spec-derivation`、`sweep`。zh-TW skill 覆蓋率現已達 54/54（100%）。
- **`cli/src/lint/i18n.js` + `uds check --i18n` 指令**：強制執行 5 條防嵌合體規則的 Lint（`canonical:description-must-be-ascii` error、`locale:description-must-match-language` error、`locale:must-have-source-frontmatter` error、`canonical:l3-language-consistency` warn、`translation-drift-warn` warn）。發生錯誤時結束碼為 1。支援供 CI 使用的 `--json` 模式。
- **`scripts/generate-locale-coverage.mjs` + 自動產生的 `locales/COVERAGE.md`**：各語系針對每個 skill／standard 的覆蓋率矩陣 + 漂移警告。npm 腳本 `docs:locale-coverage`。
- **支援 `UDS_LOCALE` 環境變數**：在 `cli/src/i18n/messages.js detectLanguage()` 與 `cli/src/commands/update.js resolveLocale()` 中讀取。接受 `zh-tw`、`zh_tw`、`zh-cn`、`zh_cn`、`en`（不分大小寫）。
- **支援 `.uds/install.yaml` 的 `locale:` 欄位**：`cli/src/utils/config-manager.js readInstallYaml()` 會讀取選用的 `locale:`，讓採用者只需宣告偏好的語系一次，而無需每次都傳入 `--locale`。
- **語系後備 WARN**：當 `installSingleSkill` 因缺少語系版本而退回使用英文時，安裝結束時會出現單一黃色 WARN 區塊列出受影響的 skill。取代了先前靜默後備的做法。
- **i18n 訊息**：在 en/zh-tw/zh-cn 語系中新增 `localeFallbackTitle` / `localeFallbackHint` 鍵值。

### 變更

- **CLI 語系解析優先順序**（`cli/src/commands/update.js resolveLocale()`）：現為六層——`--locale` CLI 旗標 > `.uds/install.yaml` 的 `locale:` > `UDS_LOCALE` 環境變數 > manifest > `.standards/` 偵測 > `'en'`。在 `init` 與 `update` 之間保持一致。
- **`core/ai-instruction-standards.md` 的翻譯**：zh-TW 與 zh-CN 語系已同步至 v1.1.0，附帶完整的本地化 i18n 區段。（依據 XSPEC-239 O-2，zh-CN 區段標記為 pending-review——翻譯品質策略尚未敲定。）

### 修正

- **修正 29 個標準 SKILL.md 描述嵌合問題**（XSPEC-239 Phase 1B）：移除了 `adr-assistant`、`ai-collaboration-standards`、`ai-friendly-architecture`、`ai-instruction-standards`、`api-design-assistant`、`audit-assistant`、`ci-cd-assistant`、`contract-test-assistant`、`database-assistant`、`deploy-assistant`、`documentation-guide`、`error-code-guide`、`git-workflow-guide`、`incident-response-assistant`、`journey-test-assistant`、`logging-guide`、`observability-assistant`、`orchestrate`、`plan`、`pr-automation-assistant`、`project-structure-guide`、`push`、`retrospective-assistant`、`runbook-assistant`、`security-assistant`、`security-scan-assistant`、`slo-assistant`、`sweep`、`testing-guide` 的 `description:` frontmatter 中的 CJK 內容。翻譯改存放於 `locales/{lang}/skills/` 中。依賴 `.claude/skills/` 中中文說明的採用者應重新執行 `uds update --locale zh-TW`（或 `--locale zh-CN`）。
- **`skills/reverse-engineer/SKILL.md` 描述中的 em dash（U+2014）**替換為 ASCII 連字號——依據新的 lint 規則，標準描述必須僅包含 ASCII 字元。
- **補齊 `locales/zh-TW/core/self-review-protocol.md` 遺失的 YAML frontmatter**（`source:`、`source_version:`、`translation_version:`、`last_synced:`、`status:`），以符合其他 zh-TW core 版本。

### 採用者遷移注意事項

本版本包含對於使用 `--locale zh-TW` 或 `--locale zh-CN` 安裝 UDS（或被偵測到 `LANG=zh_*`）的專案可能在使用者端可見的變更：

- 升級後**重新執行 `uds update`**。描述先前含有中文的 skill，現在在標準版本中會是英文 `description:`，而在語系版本中會是完整的中文 `description:` + 內文。你的 `.claude/skills/{name}/SKILL.md` 將會自動從語系版本重新安裝。
- **手動編輯過標準**檔案（在 `.claude/skills/` 中加入中文描述）的採用者，應將其自訂內容調解進語系版本或 overlay 中——請參閱 `core/ai-instruction-standards.md` 中的 `XSPEC-239` 遷移章節。
- 新的 `uds check --i18n` lint 可以驗證你的專案是否整潔：錯誤（error）具有阻斷性，警告（例如 `translation-drift-warn`）會呈現在儀表板中，但預設不會使 CI 失敗。

## [5.14.0] - 2026-05-27

### 新增
- **`.github/RELEASE-FLOW-TODOS.md`**：用於持久追蹤在 dogfood 期間浮現之發布流程改善項目的檔案。包含 TODO-001 ～ TODO-005（在 bump-version.mjs 中自動執行 docs:generate-index、FB/Threads 提示詞擷取習慣、下次啟動時的 `_template/` 驗證、Phase 1.5 社群資產硬性關卡、Phase 2 Meta API 自動發布工作流程）。維護者可編輯此檔案以新增項目或標記解決既有項目。

### 變更
- **`.github/workflows/release-reminder.yml`**：現在會讀取 `.github/RELEASE-FLOW-TODOS.md`，並在每週一 09:00 UTC 的提醒 Issue 內文中呈現未結案的 TODO。讓改善措施跨發布週期持續累積，而非湮沒於 commit 歷史中。

### 修正
- **`cli/src/commands/check.js` — AI 工具整合檢查中標準遺失的誤報**：即使實際的 `.ai.yaml` 檔案（`error-codes.ai.yaml`、`logging.ai.yaml`）已正確引用於 `CLAUDE.md` 中，`uds check` 仍錯誤地回報 `error-code-standards` 與 `logging-standards` 遺失。根本原因：`migrateStandardsPathsToIds()` 將 manifest 路徑項目轉換為登錄檔 ID（例如 `ai/standards/error-codes.ai.yaml` → `error-code-standards`），但整合檔案是以實際檔名產生的。該檢查現在會從登錄檔建立 `id → aiFilename` 對照表，並在整合檔案內容中未直接找到 ID 時退回比對實際檔案名稱。

## [5.13.3] - 2026-05-26

### 修正
- **`scripts/pre-release-check.sh` 步驟 22.5 邏輯升級**：原始實作（v5.13.0）僅接受通過條件 A（`[Unreleased]` 非空）。在 CHANGELOG 晉升（`[Unreleased]` → `[X.Y.Z]`）之後，該區段正確被清空，但原始檢查卻錯誤失敗，且需要使用 `--skip-changelog` 融通解法。新邏輯新增了**通過條件 B（晉升後）**：當最新具日期的區段符合今天且含有實質項目時亦算通過。亦新增了**失敗條件 D**：存在今天日期的區段但僅有範本內容。此問題在發布 v5.13.0 時浮現——閘門本身的發布前檢查退回使用了 `--skip-changelog`，因為當時閘門已經處於情境 B。

### 附註（翻譯回補）
- `locales/zh-TW/CHANGELOG.md` 與 `locales/zh-CN/CHANGELOG.md` 回補了在 v5.13.1 熱修復 commit 期間遺漏的 [5.13.1] 區段（當時編輯工具遇到工具狀態問題，阻礙了這兩份翻譯）。

## [5.13.2] - 2026-05-26

### 修正
- **`.github/workflows/publish.yml` Clean-room 安裝測試（XSPEC-221 熱修復 v2）**：將 `uds init --dry-run`（CLI 中未實作此選項）替換為 `uds init --help`，作為對 init 指令接線的安全非異動驗證。此問題在 v5.13.1 發布失敗並顯示 `error: unknown option '--dry-run'` 時浮現——v5.13.1 的修復正確解析了依賴，但下一個驗證步驟卻依賴於不存在的旗標。這是該閘門發現的第二個自身 bug；該閘門現已完成端對端驗證。

## [5.13.1] - 2026-05-26 [發布失敗 — 參見 5.13.2]

### 修正
- **`.github/workflows/publish.yml` Clean-room 安裝測試（XSPEC-221 熱修復）**：在 alpine clean-room 工作中，於 `npm install -g .` 之前新增了 `npm ci --ignore-scripts` 步驟。此問題在 v5.13.0 版本發布失敗並顯示 `ERR_MODULE_NOT_FOUND: Cannot find package 'commander'` 時浮現——`npm install -g .` 在 clean-room 環境中「不會」安裝遞移依賴，需要在建立全域符號連結前就已存在依賴。該閘門（XSPEC-221）正確地阻斷了損壞的發布；此修正修復了閘門自身的指令序列。

## [5.13.0] - 2026-05-26

### 新增
- **`core/self-review-protocol.md` v1.0.0**（搭配 `ai/standards/self-review-protocol.ai.yaml`、`locales/zh-TW/core/self-review-protocol.md` 與 `cli/standards-registry.json` 條目）：新增標準，強制在 commit 前對大幅度的 markdown 編輯（>50 行）執行自我審查關卡。定義了 **6 種內部交叉參照不一致類別**——圖表／步驟不符、變更日誌參照錯誤、計數漂移、過期範本、錯誤的工具參照、占位符／規則未對齊——並提供具體的檢查方法。有別於程式碼審查（涵蓋程式碼）、內容自我稽核（涵蓋完整性）與同行審查（涵蓋設計）。源自於下游技能編輯中觀察到的 `v1.X→v1.X.1` 修補週期。
- **`scripts/pre-release-check.sh` 步驟 22.5 — CHANGELOG 硬性關卡**：當 `CHANGELOG.md [Unreleased]` 區段為空時拒絕發布。新增的 `--skip-changelog` 旗標提供逃生閥（預期在發布 commit 訊息中附上理由）。插入於流程關卡（步驟 22）與 dogfooding 關卡（步驟 23）之間。
- **`scripts/pre-commit.mjs` 步驟 1.5 — CHANGELOG 漂移提醒**：當暫存實質變更（`core/`、`ai/standards/`、`cli/src`、`cli/bin`、`scripts/`、`skills/*/SKILL.md`、`.github/workflows/`）卻未成對更新 `CHANGELOG.md` 時發出警告（非阻斷性，結束碼 0）。引導使用者注意發布時的硬性關卡，讓他們理解忽略此警告的後果。
- **`.github/workflows/release-reminder.yml`**：每週一 09:00 UTC 的 cron 排程，當 `CHANGELOG.md [Unreleased]` 非空**且**距最新 semver 標籤已過 ≥7 天時，建立（或更新）帶有標籤的 issue。當條件不再符合時自動關閉任何未結的提醒。依條目內容建議 semver 晉級啟發式規則（major/minor/patch）。
- **`scripts/check-skill-structural-integrity.ts`**（XSPEC-223，P1 發布關卡）：驗證技能 `SKILL.md` 結構完整性（frontmatter 欄位、必要區段）。接線至 `pre-release-check.sh` 步驟 18.5；若有任何技能存在結構缺陷則阻斷發布。
- **`packaging-standards`**（XSPEC-233 / #112）：新增 API 遷移合約測試 fixture 區段——定義用於測試跨版本 API 遷移相容性的 fixture 格式。
- **無塵室安裝關卡**（XSPEC-221）於 `.github/workflows/publish.yml`：Alpine Node 20 容器從 `cli/` 執行 `npm install -g .`，驗證 `uds --version` / `uds list` / `uds init --dry-run`。若任何步驟失敗則阻斷 `publish` 工作。
- **Dogfooding 關卡**（XSPEC-222）— `scripts/pre-release-check.sh` 步驟 23：在發布進行前，新的 CLI 建置產物必須對自身通過 `uds check`。

### 變更
- **`core/deployment-standards.md`**（XSPEC-231 / #110 + #113）：防禦性部署配對——強制要求封存檔完整性驗證 + 解壓縮-驗證-再刪除模式。終結「損壞的封存檔在驗證前即被刪除」的失敗類別。
- **`core/logging-standards.md`**（XSPEC-232 / #111）：強制性雙觸發日誌輪替策略——大小**與**時間觸發條件皆必須設定（非 OR）。終結「因為大小門檻從未達到而從未觸發輪替」的失效模式。
- **`skills/contract-test-assistant/SKILL.md`** 與 **`skills/runbook-assistant/SKILL.md`**：微調以支援 XSPEC-231/232/233 模式。
- **相依套件（`cli/`）**：`lint-staged` 17.0.3→17.0.4（#107）、`@inquirer/prompts` 8.4.2→8.4.3（#106）、`eslint` 10.3.0→10.4.0（#105）、`@vitest/coverage-v8` 4.1.5→4.1.6（#103）、`vitest` 4.1.5→4.1.6（#101）、`@commitlint/cli` 21.0.0→21.0.1（#104）、`tsx` 4.21.0→4.22.3（#109）。
- **CI actions**：`actions/checkout` 4→6（#98）、`actions/setup-node` 4→6（#99）。

## [5.12.1] - 2026-05-19

### 變更
- **`full-coverage-testing.ai.yaml`**（`no-tautology-assertions` 規則，XSPEC-220）：AI 代理在產生未實作的測試骨架時，必須（MUST）使用 `it.todo("AC-XXX: ...")` 代替 `it() { expect(true).toBe(true) }`。任何僅包含恆真判斷（tautology assertions）的 `it()` 回呼，無論是由人類或 AI 代理產生，皆屬於 `[ANTI-FAKE-001]` 違規。
- **`test-governance.ai.yaml`**（`gate-wiring-required` 規則，XSPEC-220）：品質偵測腳本（anti-fake、stub-check、coverage ratchet）必須（MUST）出現在至少一個 CI 工作流程工作**以及**至少一個本地 hook 中。存在於 `scripts/` 但從未被 CI 呼叫的腳本等同於不存在，並構成治理缺口。
- **`acceptance-criteria-traceability.ai.yaml`**（`not_implemented` 狀態，XSPEC-220）：擴充定義以明確將 `it.todo()` 占位符對應至 `not_implemented 🚫` 狀態（從覆蓋率分母中排除），並附決策樹以區分 `not_implemented`（刻意的占位符）與 `uncovered`（疏漏）。

## [5.12.0] - 2026-05-16

### 新增
- **`docs/user/` 使用者文件中心**（XSPEC-211）：借鑑 VibeOps 慣例的新雙軌文件結構。包含 8 份服務初次使用者與日常使用者的檔案：
  - `docs/user/GETTING-STARTED.md` — 5 分鐘端對端導覽（安裝 → `uds init` → `/sdd` → `/commit`）
  - `docs/user/SKILLS-INDEX.md` — 自動產生的所有 54 個技能索引，按分層（DEC-061）與分類組織，並附「何時使用」速查
  - `docs/user/COMMANDS-INDEX.md` — 自動產生的所有 48 個斜線指令按字母排序清單，附帶技能對應
  - `docs/user/FAQ.md` — 涵蓋安裝、技能、SDD、更新與架構的 14 個問答
  - `docs/user/GLOSSARY.md` — UDS、SDD、ATDD、BDD、TDD、XSPEC、雙層架構、技能分層、標準、活動、套件組合／來源、ADR、AC 的定義
  - `docs/user/TROUBLESHOOTING.md` — 問題→解決方案指南（安裝、技能未顯示、非 Claude Code 工具、更新失敗），整併了 `SKILL-FALLBACK-GUIDE.md`
  - `docs/user/README.md` — 三種讀者群（新使用者／日常使用者／維護者）的文件中心，附文件地圖
  - `docs/user/CHEATSHEET.md` — 自 `docs/` 移入（內容無變更）
- **`scripts/generate-skill-index.ts`** — 從 `uds-manifest.json` + `skills/*/SKILL.md` frontmatter 產生 `SKILLS-INDEX.md` 與 `COMMANDS-INDEX.md`。使用 SKILL.md 的 `name` 欄位作為權威指令來源。執行方式：`npm run docs:generate-index`
- **`scripts/check-skill-index.ts`** — pre-commit 防衛檢查；重新產生文件並比對差異；若過期則以非零結束碼結束。執行方式：`npm run docs:check-index`
- **`scripts/setup-hooks.sh`** — 安裝 `.git/hooks/pre-commit`，在每次 commit 時呼叫 `docs:check-index`
- **`.github/workflows/docs-check.yml`** — 當 PR 修改 `uds-manifest.json`、`skills/*/SKILL.md` 或 `cli/standards-registry.json` 時，驗證 `SKILLS-INDEX.md` 與 `COMMANDS-INDEX.md` 是否同步的 CI 工作
- **`docs/reference/FEATURE-REFERENCE.md`** — `FEATURE-REFERENCE.md` 從 `docs/` 搬移至 `docs/reference/`（自動產生，內容無變更）
- **`docs/archive/USER-MANUAL-2026-03-24.md`** — 已廢棄使用者手冊的封存副本

### 變更
- **`package.json`**：新增 `docs:generate-index`（`tsx scripts/generate-skill-index.ts`）與 `docs:check-index`（`tsx scripts/check-skill-index.ts`）腳本
- **`scripts/generate-usage-docs.mjs`**：更新英文輸出路徑——`FEATURE-REFERENCE.md` 現在寫入 `docs/reference/`，`CHEATSHEET.md` 現在寫入 `docs/user/`
- **`skills/README.md`**：新增橫幅，指向 `docs/user/SKILLS-INDEX.md` 與 `COMMANDS-INDEX.md` 作為主要的索引式技能參考
- **`README.md`**：在快速入門區段新增「📚 Documentation」表格，列出全部 7 份 `docs/user/` 檔案並附直接連結
- **`docs/USER-MANUAL.md`**：新增廢棄橫幅，引導使用者前往 `docs/user/README.md`；封存副本保留於 `docs/archive/USER-MANUAL-2026-03-24.md`

### 移除
- **`docs/SKILL-FALLBACK-GUIDE.md`**：內容整併至 `docs/user/TROUBLESHOOTING.md`。非 Claude Code 後備策略與「技能→核心標準」對應表保留於「Using UDS Without Claude Code」區段下

## [5.11.0] - 2026-05-14

### 新增
- **`spec-driven-development`** SPEC Type Agent 變體：`acceptance-criteria-traceability.ai.yaml` 與 SDD 範本增加 `spec-type: feature | agent | infrastructure` 欄位，以及五區段 Agent SPEC 範本（能力表面／決策邊界／可觀測性／失效模式／跨代理不變量）。使 Builder/QA/Planner 風格的 SPEC 能與功能 SPEC 分開追蹤，並透過新增的 `agent-id` 欄位連結回特定的代理。（XSPEC-205）
- **`reverse-engineering-standards`** 遷移清點雙向性：新增路由驅動的探索方法（現已禁止以檔案系統 glob 作為起點）、目標→來源雙向掃描，以及針對沒有對應來源產物的發現項目之 `[GAP]` 標記協定。搭配 `testing.ai.yaml` 中新增的 `migration_testing` 區段，要求透過 CI 關卡強制執行 3 步驟 schema 奇偶一致性模式。解決 UDS Issue #96 與 #97。（XSPEC-206）

### 修正
- **`uds update` 對 schema 3.x manifest 產生虛假的「CLAUDE.md.md: 無法判斷來源」還原失敗**（`cli/src/utils/integration-generator.js`、`cli/src/commands/update.js`）：Schema 3.x manifest 在 `manifest.integrations` 中儲存的是**檔名**（例如 `"CLAUDE.md"`），而非工具鍵值。`integration-generator.js:56` 的 `getToolFileName` 後備邏輯無條件附加 `".md"`，導致 `getToolFilePath("CLAUDE.md")` 回傳 `"CLAUDE.md.md"`，被回報為遺失檔案且還原失敗（`getSourcePathFromRelative` 對該合成路徑沒有對應關係）。Commit `79532b3`（5.10.0）修正了反向情況（工具名稱輸入），但遺漏了這種檔名變體。修正：從 `SUPPORTED_AI_TOOLS` 預先計算 `KNOWN_TOOL_FILES`，並在輸入為已知整合檔名或已帶有已知副檔名（`.md`/`.yaml`/`.yml`/`.json`）時進行短路求值。在 `integration-generator.test.js` 中新增 5 個回歸測試。（XSPEC-208 BUG-208-01）
- **`uds update` / `uds check` 產生虛假的「Integration UDS Block Integrity: GEMINI.md/AGENTS.md missing」警告**（`cli/src/commands/update.js`、`cli/src/i18n/messages.js`）：`manifest.integrationBlockHashes` 在每次安裝時累積條目卻從未被修剪。當 `manifest.aiTools` 縮減時（例如 `["claude-code","gemini-cli"]` → `["claude-code"]`），GEMINI.md 的雜湊值仍然保留，導致 `check.js:1491 checkIntegrationBlocksIntegrity` 誤報該檔案遺失。修正：在整合重新產生步驟之後，從 `manifest.aiTools`（已宣告的設定，而**非**在暫態寫入失敗時過度修剪的 `results.integrations`）推導出預期的檔案集合，並修剪任何孤兒雜湊值。修剪掉的檔名會透過新的 i18n 鍵值 `prunedOrphanedBlockHashes`（en / zh-TW / zh-CN）回報。在 `update.test.js` 中新增 3 個回歸測試。在 machine-setup 的 `uds update` 5.1.0-beta.4 → 5.10.0 上重現；驗證於 5.10.0 → 5.11.0 已修復。（XSPEC-208 BUG-208-02）

## [5.10.0] - 2026-05-13

### 新增
- **`multi-environment-e2e-testing`**（`ai/standards/multi-environment-e2e-testing.ai.yaml`）：跨多個部署目標之 E2E 測試設定的新標準。核心原則：「執行指令即是文件。」涵蓋：BASE_URL 內建於測試框架設定中（而非 .env）；每個環境具備自我檢查的執行腳本；環境功能矩陣提交至 repo；CI 關卡對應；憑證處理規則。解決 UDS Issue #95。（XSPEC-204）

### 變更
- **`mock-boundary`**（v1.0.0 → v1.1.0）：新增 Level 1 / Level 2 mock 分層區隔。Level 1 = 受 STUB 規則管轄的程式碼層級 mock。Level 2 = 受環境分層規則管轄的基礎設施層級虛設常式伺服器（WireMock、MockSoap），**不受** STUB 部署阻斷限制。新增 `external_dependency_testability_matrix` 範本（每個服務 × 環境對應 ✅/⚠️/❌）。新增規則：`level-2-stub-server-rules`、`no-stub-server-in-prd`。解決 UDS Issue #94 盲點 2。（XSPEC-204）
- **`deployment-standards`**（v1.0.0 → v1.1.0）：新增 `environment_stratification_matrix` 區塊——具有外部相依性的專案必須在測試規劃時期建立此矩陣；範本包含 10 流程 × 3 環境網格。新增 `stub_server_cicd_rules` 區塊——選項 A（sidecar 部署）／選項 B（PRD 冒煙測試遞延）；正式環境產物排除規則；PRD 禁用規則；禁止狀態定義。解決 UDS Issue #94 盲點 1 與 3。（XSPEC-204）
- **`verification-evidence`**（v1.0.0 → v1.1.0）：新增鐵律（環境）：針對具外部相依性的 AC，證據必須指定 `environment_layer`。在證據格式中新增 `environment_layer` 欄位（對具外部服務相依性的功能為必填）。新增規則 VE-005、VE-006。（XSPEC-204）
- **`test-completeness-dimensions`**（v1.2.0 → v1.3.0）：新增維度 11：**環境可驗證性**——針對具外部服務相依性的 AC，記錄最低可驗證環境層（local/UAT/PRD）、追蹤僅限 PRD 項目、要求冒煙測試計畫。更新功能類型對應：外部整合 → [1,3,7,11]；新型態具外部相依性工作流程 → [1,3,4,5,9,10,11]。更新 use-checklist 規則。（XSPEC-204）

### 修正
- **`uds update` 對整合工具名稱產生虛假的「檔案遺失」還原**：當 `manifest.integrations` 包含 AI 工具識別碼（`"claude-code"`、`"opencode"`）時，update 指令將其直接作為檔案路徑推入 `allTrackedFiles`，而非透過 `getToolFilePath()` 解析。這導致 `existsSync("claude-code")` 回傳 false，觸發虛假的「⚠ N file(s) still missing after update」警告以及「✗ claude-code: 無法判斷來源」還原失敗。修正：先透過 `getToolFilePath(int)` 解析每個條目；略過無法對應到真實路徑的條目。在 `uds update` 5.7.2 → 5.8.0 上重現。

## [5.9.0] - 2026-05-13

### 新增
- **`feature-discovery-standards`**（`ai/standards/feature-discovery-standards.ai.yaml`、`core/feature-discovery-standards.md`）：定義老舊系統中詳盡功能探索之語言無關方法論的新標準。確立**確定性優先原則**（探索階段嚴禁 AI 僅憑推論產生功能清單）。為 7 種軟體形態（web/cli/gui/daemon/library/mobile/embedded）定義軟體形態分類學，附帶偵測訊號與擷取工具。定義五大靜態基礎（進入點 → 呼叫圖 → 字串挖掘 → 資源檔 → 外部介面）、動態觀察協定（Linux/macOS/Windows）、人工觀察協定（信心度：0.7 規則），以及跨層驗證矩陣範本。管線位置：探索 → feature-manifest → behavior-snapshot。（XSPEC-202）
- **`ai/language-packs/language-pack-php-to-csharp.ai.yaml`**：首個針對 PHP→C#（ASP.NET Core）遷移風險的 UDS 語言包。包含 7 個風險標籤（SESSION_HANDLING、ORM_DIFFERENCES、TIMEZONE_HANDLING、FILE_UPLOAD_PATH、REGEX_DIFFERENCES、ARRAY_FUNCTIONS、EXCEPTION_HIERARCHY）及其詳細說明。（XSPEC-203）
- **`ai/language-packs/README.md`**：語言包命名慣例、使用指南與貢獻指引。（XSPEC-203）

### 變更
- **`feature-manifest-standard`**（v1.0.0 → v1.1.0）：將 `migration_risks` 重構為語言無關架構。移除 `php_to_csharp` 硬編碼區塊（已遷移至 `ai/language-packs/`）。新增 `language_packs` 擴充點（`extension_point: true`）。新增 3 個通用風險標籤：CONCURRENCY_MODEL、PACKAGE_ECOSYSTEM、TYPE_SYSTEM。（XSPEC-203）
- **`behavior-snapshot`**（v1.0.0 → v1.1.0）：從僅限 HTTP 擴充為多模態。新增 `adapter` 欄位（預設：`http`，向後相容）。新增 `adapters` 區段，包含 4 種具體 schema：`http` / `cli` / `file` / `event`。新增 `adapter-selection` 與 `backward-compatibility` 規則。既有未帶 `adapter` 欄位的 HTTP 快照仍然有效。（XSPEC-203）

## [5.8.0] - 2026-05-12

### 新增
- **`feature-manifest-standard`**（`ai/standards/feature-manifest-standard.ai.yaml`、`core/feature-manifest-standard.md`）：定義用於遷移／重構專案之 FM-NNN 機器可讀功能清冊格式的新標準。包含信心評分、遷移風險標籤（PHP→C#）、FEATURE_STUB: 標記協定，以及 Gate 1 完整性關卡。（XSPEC-200）
- **`behavior-snapshot`**（`ai/standards/behavior-snapshot.ai.yaml`、`core/behavior-snapshot.md`）：定義用於遷移奇偶一致性驗證與重構特徵測試之 HTTP golden-file 快照格式的新標準。包含快照 schema、`ignore_fields` 指引、奇偶一致性關卡（結束碼 0/1/2），以及 Gate 0 特徵測試協定。（XSPEC-201）

### 變更
- **`acceptance-criteria-traceability`**：新增第 4 種 AC 狀態 `not_implemented`（🚫）——有別於 `uncovered`（程式碼存在但無測試）與 `not_implemented`（程式碼不存在）。更新覆蓋率公式以將 `not_implemented` 從分母中排除。新增 CI 關卡規則：`not_implemented_count > 0` → 阻斷（獨立於覆蓋率 % 關卡）。新增狀態分類決策樹。（XSPEC-199）

## [5.7.3] - 2026-05-08

### 修正
- **`uds update` 略過過期 ID**（`cli/src/commands/update.js`）：四個迴圈（顯示、複製、雜湊重新計算、更新後完整性檢查）現在會略過 `manifest.standards` 中無法識別的簡短 ID（既不包含 `/` 也不包含 `.`，但沒有相符登錄項目的條目，例如過期的 AI 工具名稱 `claude-code`、`opencode`）。先前這些項目會在 `uds update` 期間造成虛假的「檔案遺失」警告與還原失敗嘗試。

## [5.7.2] - 2026-05-08

### 修正
- **Manifest schema v3.4.0 — `standards` 路徑→ID 遷移**（`cli/src/core/manifest.js`）：新增 `migrateToV340()` 遷移步驟與 `migrateStandardsPathsToIds()` 輔助函式。當載入 manifest 時，其 `standards` 陣列若包含舊式路徑格式條目（例如 `"ai/standards/foo.ai.yaml"`），現在會自動轉換為簡短的登錄檔 ID（例如 `"foo"`）。選項檔案路徑（`ai/options/…`）保持原樣。即使 schema 版本已經相符，仍會執行 `ensureRequiredFields()` 安全網，防止寫入不完整的 manifest。（`cli/src/core/manifest.js`、`cli/src/reconciler/desired-state-calculator.js`）
- **`uds check` 舊版存在檢查**（`cli/src/commands/check.js`）：無雜湊後備路徑現在會將登錄檔 ID 格式的標準解析為其實際的來源檔名（例如 `"testing"` → `"testing.ai.yaml"`），並將選項檔案路徑正確路由至 `.standards/options/`。先前，ID 格式的標準會導致無路徑查尋，從而一律回報「遺失」。
- **`uds update` 支援 ID 格式**（`cli/src/commands/update.js`）：五個程式碼路徑（`checkNewStandards`、檔案清單顯示、檔案複製迴圈、雜湊重新計算、更新後完整性掃描）現在會透過登錄檔將 ID 格式的標準解析為來源路徑，因此 manifest 已遷移至 v3.4.0 的專案能持續獲得正確的檔案操作。
- **`uds audit` 健康／摩擦點檢查**（`cli/src/utils/health-checker.js`、`cli/src/utils/friction-detector.js`）：兩項公用程式現在皆會在檢查磁碟／CLAUDE.md 參照前，將 ID 格式的標準解析為實際檔名，防止在已遷移的 manifest 上產生虛假的通過結果。

## [5.7.1] - 2026-05-08

### 修正
- **`cli/package-lock.json`**：同步 lock 檔以修復 GitHub Actions 上的 `npm ci` 失敗（遺漏了 `@emnapi/core` 與 `@emnapi/runtime` 條目）。

### 移除
- **`specs/`**：移除已作為 XSPEC 遷移至 dev-platform 的 4 份規格檔案（SPEC-frontend-design-standard、SPEC-mcp-design-standards-server、superspec-borrowing-phase1-2-spec、superspec-phase4-spec）。保留 `execution-history-spec.md`（Archived）、`schemas/` 與 `standards-effectiveness-schema.json`。
- **`docs/archive/`**：移除 7 份過期的遷移指南與工作流程分析文件。
- **`.project-context/`**：移除 gemini-cli 自動產生的產物（內容已涵蓋於 `CLAUDE.md`）。

### 新增
- **`.npmignore`**：從 npm 套件中排除 `tests/`、`scripts/`、`.github/`、`.githooks/`、`.gemini/`、`.release-readiness/`、`docs/internal/`。先前這些目錄是在無意中被發布（因為不存在 `files` 欄位或 `.npmignore`）。

**採用者注意**：如果您先前依賴從 npm 安裝的 `tests/` 或 `scripts/` 中的任何檔案，請直接從 GitHub repo 安裝。

## [5.7.0] - 2026-05-08

> **跨平台腳本遷移**（XSPEC-179 + XSPEC-180）：Bash 腳本正逐步替換為
> 單一來源的 TypeScript / Node.js ESM 對等實作，可在 macOS / Linux / Windows
> 上原封不動執行。舊版 `.sh` 檔案保留並附帶 `DEPRECATED` 標示以維持向後相容性。

### 移除

- **README 中的 Ecosystem 區段**（`README.md`、`locales/zh-TW/README.md`、
  `locales/zh-CN/README.md`）：完全移除 `## 🌐 Ecosystem` / `## 🌐 生態系統` /
  `## 🌐 生态系统` 區段。UDS 是一套獨立且工具無關的標準函式庫；該區段的標題暗示了「產品生態系統」，在下游專案解耦（批次 1–6，2026-05-04）後已不再適用。工具相容性清單（Claude Code / Cursor 等）保留在 README 較前面的部分。

### 新增

- **技能分層與預算微調**（XSPEC-185 / DEC-061）：針對 40 多個 UDS 技能進行三層分類（Core / Advanced / Specialist），解決採用者安裝額外外掛時，Claude Code 的 `/doctor` 針對技能描述遭到截斷發出的警告。新增產物：
  - `skills/README.md` §Skill Tiers — 分層成員表格
  - `flows/skill-tiering-rationale.md` — 分層準則與 DEC-051 對應
  - `examples/skill-overrides-recommended.json` — 可直接複製貼上的 `skillOverrides` 參考（Tier 3 → `"name-only"`）
  - `docs/skill-budget-tuning.md` — 採用者指南（使用者／專案設定、客製化、提高預算）

  **採用者操作（選用）**：將 `examples/skill-overrides-recommended.json` 中的 `skillOverrides` 區塊合併至您的 `~/.claude/settings.json` 或專案的 `.claude/settings.json`。Tier 3 技能仍可透過 `/<name>` 呼叫——僅隱藏 Claude 的自動探索列表。請參閱 `docs/skill-budget-tuning.md`。
- **AI 工具表格涵蓋範圍**（`README.md`、`locales/zh-TW/README.md`、`locales/zh-CN/README.md`）：新增先前遺漏的五個工具——GitHub Copilot、OpenAI Codex、Aider、Continue、Google Antigravity。引進 ⚠ Minimal 狀態圖例項目。（`1b588e1`）
- **`scripts/bump-version.mjs`**（XSPEC-179 階段 1）：跨平台的版本晉級實作，與舊版 `.sh` 功能齊平。（`1a44e14`）
- **`scripts/install-hooks.mjs`**（XSPEC-179 階段 1）：跨平台 git hooks 安裝程式；在 Windows 上自動略過 `chmod`。（`1a44e14`）
- **`scripts/pre-commit.mjs`**（XSPEC-180）：pre-commit hook 的 Node.js ESM 實作，具備平台分支，在 Windows 上呼叫 `check-translation-sync.ps1`，其餘平台則呼叫 `.sh`。（`1572869`）
- **7 個 TypeScript 檢查腳本**（XSPEC-179 階段 2，`0a26d14`）：從 bash 遷移至透過 `tsx` 執行的單一 TypeScript 原始碼：
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** 新增至根目錄的 `devDependencies`（XSPEC-179 階段 2，`0a26d14`）。
- **7 個 npm 腳本** 接線 TypeScript 檢查（`0a26d14`）：`check:ai-behavior`、`check:commit-spec`、`check:flow-gate`、`check:integration-commands`、`check:registry`、`check:release-signoff`、`check:workflow-compliance`。

### 變更

- **下游專案解耦**（6 個批次，`ebe716c`–`2392c0f`）：橫跨 130 多個檔案中所有公開面向特定下游專案（DevAP / VibeOps）的參照，全數替換為採用層中立術語。重申 UDS 為純粹的 MIT + CC BY 4.0 標準函式庫，獨立於任何特定採用層。關鍵領域：`README.md`/`CLAUDE.md`/多語系檔案、`.standards/`/`ai/standards/` 的 DEPRECATED stub、`core/*.md`/語系鏡像、`cli/` 原始碼 + 測試、`skills/*/SKILL.md`、`flows/*.flow.yaml`/`flows/README.md`、`docs/specs/`、`specs/` 根目錄、`packaging-standards`、`git-worktree` 路徑範例。

- **REGISTRY**：`roo-code` 整合層級從 `planned` 移至 `partial`；Roo Code 在 AI 工具表格中從 Cline 列分拆獨立。（`1b588e1`）
- **`.githooks/pre-commit`**（XSPEC-180，`1572869`）：從 51 行的 bash 實作縮減為 16 行的 POSIX `sh` shim，委派給 `scripts/pre-commit.mjs`。
- **`scripts/bump-version.mjs`**（`19ad314`）：新增 `buildCmd()` 輔助函式，在 Windows 上呼叫 `check-version-sync` / `check-translation-sync` 時切換至 PowerShell + `.ps1`，恢復 Windows 上的對等性。
- **XSPEC-179 階段 2 策略修訂**（`0a26d14`）：放棄先前的 `.sh` + `.ps1` 雙軌計畫，轉而採用**單一 TypeScript 原始碼**途徑。單一 `.ts` 檔案可透過 `tsx` 在所有平台上原封不動執行，消除了「只能在 Windows 上驗證」的意見回饋缺口。

### 棄用

- **`scripts/bump-version.sh`**（`1a44e14`）：標記為 DEPRECATED；由 `bump-version.mjs` 取代。
- **`scripts/install-hooks.sh`**（`1a44e14`）：標記為 DEPRECATED；由 `install-hooks.mjs` 取代。
- **7 個舊版 `check-*.sh` 腳本**（`0a26d14`）：其對應的 `.ts` 實作（如上）現在是權威實作。這些 `.sh` 檔案在舊版 Linux/macOS 環境中予以保留，但不應再接收新功能。

### 移除

- **`.devap/` 目錄**（`2392c0f`）：移除孤立的 DevAP dogfooding 安裝。DevAP 已於 2026-04-28 退役（XSPEC-086/095）；UDS 現在原生使用 `flows/commit.flow.yaml`，並使用 `scripts/bump-version.mjs` 進行發布。

### 修正

- **`scripts/check-release-readiness-signoff.sh`**（`0a26d14`，在 TypeScript 移植中修正的潛在錯誤）：更正了錯誤的 `grep -c "0\n0"` 模式（該模式從未匹配字面上的 `\n`），以確保可靠地偵測遺漏的簽核訊號。
- **`scripts/check-integration-commands-sync.sh`**（`0a26d14`，在 TypeScript 移植中修正的潛在錯誤）：消除了源自 `find` 與下游消費者之間管道中斷的 SIGPIPE 雜訊。

## [5.6.0] - 2026-05-06

> **次要版本**：全覆蓋測試典範（XSPEC-178）——廢除金字塔門檻，改採行為完整性（每個公開函式包含正常／邊界／錯誤路徑）、棘輪 CI、反假測試強制執行，以及 STUB 標記協定。

### 新增

- **`ai/standards/full-coverage-testing.ai.yaml`** —— 定義全覆蓋測試典範的新標準：行為完整性模型、棘輪 CI 政策、反假測試規則（禁止恆真斷言、不 mock 核心商業邏輯）、STUB 標記協定、`@ac` 驗收條件追蹤標籤，以及 `COVERAGE_EXEMPT` 豁免格式（XSPEC-178）
- **`core/full-coverage-testing.md`** —— 新 YAML 標準的人類可讀配套文件；為 pre-commit 的 standards-sync hook 所必需

### 變更

- **`ai/standards/testing.ai.yaml`**：新增 `deprecated_rules` 區塊；金字塔門檻規則（`follow-pyramid`）自 v5.5.0 起棄用，改由指向新標準的 `follow-full-coverage` 取代
- **`ai/options/testing/unit-testing.ai.yaml`**：移除 `pyramid_percentage: 70%`；改為 `coverage_policy: "Behaviour-completeness ratchet (XSPEC-178)"`
- **`ai/options/testing/integration-testing.ai.yaml`**：移除 `pyramid_percentage: 20%`；改為針對所有關鍵整合路徑的棘輪覆蓋率政策
- **`cli/standards-registry.json`**：新增 `full-coverage-testing` 條目（category: `skill`，skillName: `testing-guide`）；更新 `testing` 條目說明以移除金字塔門檻百分比
- **`cli/src/commands/init.js`**：`standardOptions` 現包含預設值 `coverage_model: 'full-coverage'`
- **`cli/src/commands/update.js`**：v5.5.0 遷移區塊在升級時設定 `options.coverage_model = 'full-coverage'`，並印出典範轉移通知
- **`cli/src/commands/check.js`**：新增 `checkFullCoverageCompliance()` —— 當 v5.5.0+ 專案缺少 `full-coverage-testing.ai.yaml` 時發出警告，並回報 `src/` 中的 STUB 標記數量

### 此版本亦包含（v5.5.0 後續修正）

- **`core/`**：新增 `release-readiness-gate.md` 聚合標準；擴充 `browser-compatibility-standards.md`；補齊無障礙（a11y）門檻、合約測試、跨流程迴歸與容量簽核的覆蓋缺口
- **`templates/`**：將流程測試矩陣擴充為附帶 UAT 腳本欄位的多關卡模型；在 `requirement-template.md` 新增流程規格章節
- **`flows/`**：將多關卡流程接入 RQM 與發布前管線
- **`cli/package.json`**：升級 `@inquirer/prompts` 8.4.2、`ora` 9.4.0、`vitest` 4.1.5、`ajv` 8.20.0、`opencc-js` 1.3.0、`@commitlint` 20.5.3
- **CLAUDE.md / docs**：新增 XSPEC-176 單一事實來源優先權附註

### 從金字塔門檻遷移

從 `< 5.5.0` 升級的專案將透過 `uds update` 收到遷移通知：

```
⚠ Testing paradigm migrated to Full Coverage (XSPEC-178).
  full-coverage-testing.ai.yaml installed. Remove coverageThreshold from jest/vitest config.
```

完整遷移檢查清單請參見 `core/full-coverage-testing.md`（刪除 `coverageThreshold`、安裝 `.coverage-baseline.json`、在 CI 加入棘輪腳本）。

## [5.5.0] - 2026-05-05

> **次要版本**：17 個新標準——測試安全、LLM 輸出驗證、供應鏈完整性、發布品質。完整說明請見 [GitHub Release](https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v5.5.0)。

## [5.4.0] - 2026-04-27

> **次要版本**：XSPEC-086 Phase 2 — 8 個純流程/編排標準遷移至 DevAP（deprecated stubs 保留向下相容）。UDS 職責回歸活動定義層，流程編排交由 DevAP 負責（DEC-049）。

### 已棄用（XSPEC-086 Phase 2 — 遷移至 DevAP）

下列 8 個標準已遷移至 `dev-autopilot/standards/`，成為 DevAP canonical 位置。UDS 保留 deprecated stub 至 v6.0.0。

**`ai/standards/flow/`（已遷入 DevAP `standards/flow/`）**
- `workflow-enforcement.ai.yaml` → `dev-autopilot/standards/flow/workflow-enforcement.ai.yaml`
- `workflow-state-protocol.ai.yaml` → `dev-autopilot/standards/flow/workflow-state-protocol.ai.yaml`
- `change-batching-standards.ai.yaml` → `dev-autopilot/standards/flow/change-batching-standards.ai.yaml`
- `branch-completion.ai.yaml` → `dev-autopilot/standards/flow/branch-completion.ai.yaml`
- `pipeline-integration-standards.ai.yaml` → `dev-autopilot/standards/flow/pipeline-integration-standards.ai.yaml`

**`ai/standards/orchestration/`（已遷入 DevAP `standards/orchestration/`）**
- `agent-dispatch.ai.yaml` → `dev-autopilot/standards/orchestration/agent-dispatch.ai.yaml`
- `agent-communication-protocol.ai.yaml` → `dev-autopilot/standards/orchestration/agent-communication-protocol.ai.yaml`
- `execution-history.ai.yaml` → `dev-autopilot/standards/orchestration/execution-history.ai.yaml`

### 變更

- `cli/standards-registry.json`：8 個標準條目標記 `deprecated: true`、`deprecatedSince: "5.4.0"`、`removalVersion: "6.0.0"`、`canonicalOwner: "devap"`、`canonicalPath`
- `cli/tests/unit/core/execution-history-standards.test.js`：測試更新為驗證 deprecated stub 結構（meta.deprecated + canonical_path），22 項測試通過

### 遷移指南

安裝 DevAP 並載入對應標準以取得完整的流程執行能力：

```bash
npm install -g dev-autopilot
# 各標準 canonical 位置見 dev-autopilot/standards/README.md
```

UDS 5.x 仍提供 deprecated stubs（含 fallback 規則），UDS 6.0.0 將完全移除。

## [5.3.2] - 2026-04-27

> **修補版本**：錯誤修復——`uds update -y` 現在會自動安裝／更新技能與指令，而非僅顯示提示。

### 修正
- **`uds update --yes` / `-y`**（`cli/src/commands/update.js`）：`--yes` 旗標先前會完全略過技能與指令的安裝，改為印出「New features available」提示。現在它與互動式路徑行為一致——立即安裝缺少的技能／指令並更新過期項目。manifest 與整合檔案也會相應重新整理。修復了互動式 `uds update` 會更新 `.claude/` 技能，但 `uds update -y` 卻讓其維持不變的迴歸問題。

## [5.3.1] - 2026-04-27

> **修補版本**：錯誤修復——在 `uds update` 之後，`uds check` 不再錯誤警告「AGENTS.md standards out of sync」。

### 修正
- **`generateAgentsMdSummary()`**（`integration-generator.js`）：移除導致 AGENTS.md 在所有已安裝標準中僅列出 30 個的 `.slice(0, 30)` 上限。由於 `uds check` 會與 manifest 的所有標準進行比對，截斷總是會產生錯誤的「out of sync」警告。產生器現在會列出所有已安裝的 `.ai.yaml` 標準；檢查順利通過。

## [5.3.0] - 2026-04-26

> **次要版本**：四個新標準 + 一個新技能（XSPEC-085/064）——`no-cicd-deployment`、`rollback-standards`、`cd-deployment-strategies`、`pipeline-security-gates`，以及 `/deploy` 技能。標準總數：136。

### 新增
- **`no-cicd-deployment.ai.yaml`**（XSPEC-085 Phase 1）：適用於無 CI/CD 環境的三層部署架構——`set -euo pipefail` + deploy.lock + 版本標籤強制執行；冒煙測試 + 自動回滾；藍綠部署 <30 秒回滾。
- **`rollback-standards.ai.yaml`**（XSPEC-064 Phase 1）：回滾觸發矩陣——自動（錯誤率 > 基準值 2 倍）、輔助（違反 SLO）、手動（延遲在 SLO 內）。錯誤預算（Error Budget）<10% 時升級為自動。附帶 SLA 的 P0–P3 嚴重程度。
- **`cd-deployment-strategies.ai.yaml`**（XSPEC-064 Phase 1）：策略選擇矩陣——藍綠／金絲雀（canary）／滾動／重建決策樹（流量 × 風險 × 成本）。內含無 CI/CD 相容性注意事項。
- **`pipeline-security-gates.ai.yaml`**（XSPEC-064 Phase 1）：CI 安全閘門位置——pre-commit 機密掃描、建置後 SAST、預備環境（staging）後 DAST、打包階段 SCA+SBOM。Critical／High 阻斷管線；Medium 需要核准。
- **`/deploy` 技能**（`skills/deploy-assistant/`，XSPEC-085 Phase 1b）：互動式無 CI/CD 部署腳本產生器，附帶 zh-TW 語系翻譯。

## [5.2.0] - 2026-04-24

> **次要版本**：三個新標準／技能（XSPEC-080/081/082）——`/release package` 子指令、`/push` 品質閘門技能，以及 `agent-behavior-discipline` 標準（Karpathy 四大原則：Ask／Simple／Precision／Test）。強化 Bundle 對等性（parity）。文件集中至 dev-platform。標準總數：74。

### 新增
- **`agent-behavior-discipline.ai.yaml`**（Trial，2026-10-24 到期，XSPEC-082 / DEC-048）：編碼 Andrej Karpathy 四大 AI Agent 行為原則的新治理標準——Ask（執行前浮現假設）、Simple（最少充分程式碼）、Precision（僅進行精準手術式修改）、Test（定義可驗證的成功準則 + 自我修正循環）。已整合至 `uds-manifest.json`（第 74 個條目）與 `cli/standards-registry.json`。
- **`/push` 技能**（`skills/push/`，XSPEC-081）：Git push 品質閘門與協作護欄——受保護分支偵測、強制推送防護、push 前閘門驗證、push 收據稽核日誌、PR 整合進入點。包含兩個設定選項：`options/push/single-owner-mode.ai.yaml`（適用於個人 repo 的精簡護欄）與 `options/push/team-mode.ai.yaml`（完整護欄，團隊模式需要確認）。
- **`/release package` 子指令**（`skills/release/`，XSPEC-080）：針對 10 種目標格式的打包指引——npm/Node.js、Python/PyPI、Go 二進位檔、Electron 應用程式、Homebrew formula（第一波 / Wave 1）+ Rust/Cargo、Tauri 桌面應用程式、Docker 映像檔、VS Code 擴充套件、GitHub Release 資產（第二波 / Wave 2）。偵測優先設計：在套用打包步驟前自動偵測專案類型。

### 修正
- **Bundle 對等性（Bundle parity）**（XSPEC-072 Phase 2）：解決 `ai/standards/` 與 `bundle/` 之間的對等性缺口——全部 74 個標準現已完整存在於 bundle 中。CI 強化為在任何對等性不符合時強制失敗（exit 1），防止無聲的 bundle 偏離。
- **i18n NO META frontmatter**（BUG-A06）：為 36 個被標記為 `NO META` 的翻譯檔案補上遺漏的 YAML frontmatter——修復翻譯同步驗證的誤報。

### 變更
- **文件集中化（DEC-047 Batch 2）**：將 UDS 規劃／治理文件遷移至 AsiaOstrich dev-platform 規劃中心。這些檔案不再隨 UDS 一併發布：
  - `docs/AI-AGENT-ROADMAP.md` → dev-platform `cross-project/roadmap/uds-agent-roadmap.md`
  - `docs/OPERATION-WORKFLOW.md` → dev-platform `cross-project/ops/uds-operation.md`
  - `docs/internal/AGENT-PROTOCOL.md` → dev-platform `cross-project/ops/uds-agent-protocol.md`
  - `docs/internal/AI-AGENT-SYNC-SOP.md` → dev-platform `cross-project/ops/uds-ai-agent-sync-sop.md`
  - `docs/internal/INTEGRATION-SIMPLIFICATION-PROPOSAL.md` → dev-platform `cross-project/ops/uds-integration-simplification-proposal.md`
  - ROADMAP 與 OPERATION-WORKFLOW 的語系複本（`locales/zh-TW/docs/`、`locales/zh-CN/docs/`）亦已移除。

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **修補版本**：Windows CI 修正、53 個 SKILL.md 檔案新增技能 `name` 欄位、三個 `.md` 來源標準根據 BUG-A08 事後檢討更新事故規則、同步 zh-TW/zh-CN 翻譯。

### 修正
- **`cli/src/utils/directory-mapper.js`**：將 `dir.split('/').pop()` 替換為 `path.basename(dir)` 以實現 Windows 跨平台相容性——修復 Windows CI runner 上 `directory-mapper.test.js` 的失敗問題。

### 新增
- **`name` 欄位**新增至 9 個來源 `skills/*/SKILL.md` 檔案與 44 個 `locales/zh-TW/skills/*/SKILL.md` 檔案——為技能驗證工具所必需。

### 變更
- **`core/test-governance.md`** 1.0.0 → 1.1.0：新增 `test-execution-continuity` 規則（BUG-A08 事後檢討——存在 22 個測試但從未接上 CI 執行觸發條件）。
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0：新增老舊專案檔案同步（Legacy Project File Sync，`project-file-sync`）章節——磁碟上的每個原始檔都必須在老舊專案的 manifest 檔案中註冊。
- **`core/testing-standards.md`** 3.1.0 → 3.2.0：新增 E2E 前置條件範疇（E2E Precondition Scope，`e2e-precondition-scope`）章節——E2E 事前檢查必須驗證受測的所有頁面／端點，而不僅僅是認證進入點。
- **zh-TW 與 zh-CN 翻譯**已為 `test-governance.md`、`checkin-standards.md` 與 `testing-standards.md` 完成同步。

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **穩定版本**：BUG-A06 i18n 完整性——補齊 32 個缺少的翻譯、能感知語意化版本的翻譯閘門、新增 `translation-lifecycle-standards` UDS 標準。BUG-A07 shell 測試覆蓋率——針對 20 多個腳本的 bats 冒煙測試。BUG-A08 假通過測試稽核——修正 22 個測試。預發布第 0 批（Pre-release Batch 0）：6 個標準從 Trial 晉升至 Adopt（DEC-021/025/031/035/038/040）。標準總數：106。

### 新增
- **`translation-lifecycle-standards`**（Trial，2026-10-20 到期）：新的 UDS 標準，將 MISSING 與 OUTDATED 的區別、感知語意化版本的嚴重程度分類（MISSING/MAJOR = 發布阻斷項，MINOR/PATCH = 建議性提示）、自動化整合（pre-commit hook、發布閘門、bump-version 整合）規格化。來源：BUG-A06 事後檢討。
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**：暫存 `core/*.md` 檔案時的 commit 當下提醒；顯示 OUTDATED 警告但不阻斷 commit。透過 `./scripts/install-hooks.sh` 啟用。
- **32 個 zh-TW 與 zh-CN 翻譯**（BUG-A06）：所有核心標準現均具備完整的 zh-TW 與 zh-CN 翻譯，包含：`circuit-breaker`、`token-budget`、`dual-phase-output`、`failure-source-taxonomy`、`immutability-first`、`security-decision`、`capability-declaration`、`recovery-recipe-registry`、`retry-standards`、`health-check-standards`、`timeout-standards`、`skill-standard-alignment-check`、`standard-admission-criteria`、`standard-lifecycle-management`、`packaging-standards`、`frontend-design-standards`、`translation-lifecycle-standards` 等。
- **bats 冒煙測試**（BUG-A07）：`tests/scripts/` —— 涵蓋 `check-translation-sync.sh`、`check-version-sync.sh`、`bump-version.sh`、`install-hooks.sh` 等 20 多個 shell 腳本的冒煙測試。

### 變更
- **`check-translation-sync.sh`**：感知語意化版本的嚴重程度——MAJOR 版本落差現在會以 1 結束（發布阻斷項）；MINOR/PATCH 落差則以 0 結束並附帶建議性警告。新增 `semver_diff()` 函式與 `[MAJOR]`/`[MINOR]`/`[PATCH]` 嚴重程度標籤。
- **`bump-version.sh`**：在版本檔案更新後自動執行 `check-translation-sync.sh`，在發布準備階段提供翻譯健康狀態快照。
- **`scripts/pre-release-check.sh`**：更新為呼叫 `check-translation-sync.sh` 作為強制閘門（MISSING + MAJOR = exit 1）。

### 修正
- **zh-CN `anti-hallucination.md`**（BUG-A06）：由 1.5.0 更新至 1.5.1——補上遺漏的「Agent 認識論校準」（Agent Epistemic Calibration）章節（來自 XSPEC-008 的 Answer/Ask/Abstain 框架）。該章節自 2026-04-13 以來在 zh-CN 中一直缺失。
- **22 個假通過測試**（BUG-A08）：修正了未實際測試正確行為卻通過的測試，改用真實斷言。

### 晉升至 Adopt（預發布第 0 批）
- `circuit-breaker`（DEC-021）：經過 6 個月 Trial 後採納（Adopted）
- `token-budget`（DEC-025）：經過 6 個月 Trial 後採納（Adopted）
- `dual-phase-output`（DEC-031）：經過 6 個月 Trial 後採納（Adopted）
- `security-decision`（DEC-035）：經過 6 個月 Trial 後採納（Adopted）
- `immutability-first`（DEC-038）：經過 6 個月 Trial 後採納（Adopted）
- `failure-source-taxonomy`（DEC-040）：經過 6 個月 Trial 後採納（Adopted）

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **測試版本**：DEC-043 第一波（Wave 1）——六個涵蓋可靠性模式與治理元框架（meta-framework）的 trial 狀態標準。

### 新增
- **可靠性套件（Reliability pack，XSPEC-067）**：三個針對彈性模式的 trial 狀態標準。
  - `retry-standards`（`ai/standards/retry-standards.ai.yaml`、`core/retry-standards.md`）：具備指數退避（exponential backoff）、抖動（jitter）與冪等防護的重試政策。
  - `timeout-standards`（`ai/standards/timeout-standards.ai.yaml`、`core/timeout-standards.md`）：分層逾時預算（呼叫／請求／端對端）與傳播規則。
  - `health-check-standards`（`ai/standards/health-check-standards.ai.yaml`、`core/health-check-standards.md`）：存活（liveness）／就緒（readiness）／啟動（startup）探針語意。
- **治理元套件（Governance meta pack，XSPEC-070，第一波先決條件）**：三個定義標準本身如何准入、管理以及與技能對齊的 trial 狀態標準。
  - `standard-admission-criteria`：新標準提案的閘門準則。
  - `standard-lifecycle-management`：Trial → Stable → Deprecated → Archived 狀態轉移。
  - `skill-standard-alignment-check`：技能與其所引用標準之間的對齊稽核。
- 六個標準均遵循 UDS 三方同步要求：`.ai.yaml`（機器）+ `.md`（人類）+ `cli/standards-registry.json` 條目（+66 行）。

### 背景資訊
- 由 **DEC-043**（UDS 覆蓋完整性藍圖）驅動。治理元套件為解除第二至四波（Wave 2–4）阻礙的第一波先決條件（八個主題標準套件：SRE / CI-CD / IaC / Compliance / Reliability / Data Engineering / Product / Governance —— XSPEC-063~070）。
- PR: #77

[5.1.0-beta.7]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.6...v5.1.0-beta.7

## [5.1.0-beta.6] - 2026-04-13

> **測試版本**：修正 `uds init` 當機、E2E 測試隔離以及 macOS 顯示語言偵測的錯誤。

### 修正
- **`uds init --yes` 當機**（`manifest-installer.js`）：`contentMode: 'auto'` 未通過 schema 驗證（允許值：`minimal/index/full`），導致 init 在複製檔案後、寫入 `manifest.json` 之前當機。現在會在寫入前將 `'auto'` 解析為 `'minimal'`。
- **macOS 顯示語言被忽略**（`bin/uds.js`、`config.js`、`update.js`）：三個根本原因導致從 3.5.1 升級至 5.1.0-beta.5 後，`uds config` 的顯示語言在英文語系的 macOS 上無法生效。修復了語言偵測優先順序鏈以及 `display_language` 回填遷移。
- **E2E 測試隔離**（`tests/utils/cli-runner.js`）：測試繼承了開發者的 `~/.udsrc`（`zh-tw`），覆蓋了語言偵測並導致所有英文輸出斷言失敗。新增 `HOME: TEST_HOME_DIR` 隔離。
- **E2E 測試數量斷言**（`tests/e2e/update-flow.test.js`）：CLAUDE.md 中的 yaml 計數與包含 3 個非 yaml `.md` 範本在內的 manifest 標準總數進行比對。現在比對前會先篩選為僅限 `.ai.yaml`。

### 新增
- **認識論校準框架**（`core/anti-hallucination.md`，XSPEC-008）：六個校準協定——確定性梯度（Certainty Gradient，CG）、證據鏈（Evidence Chain，EC）、不確定性分解（Uncertainty Decomposition，UD）、邊界感知（Boundary Awareness，BA）、校準回饋（Calibration Feedback，CF）、元不確定性（Meta-Uncertainty，MU）。
- **`/e2e-assistant` 技能**：從 BDD Gherkin 場景自動產生 E2E 測試骨架；框架偵測（Playwright/Cypress/Puppeteer）；覆蓋缺口分析。
- **`/process-to-skill` 技能**：流程轉技能（Process-to-Skill）治理框架；三次法則（3-Times Rule）；簡單／複雜／差異（Simple/Complex/Delta）決策樹。
- **`execution-history.ai.yaml`** 與 XSPEC-003-SDD schema 同步。

## [5.1.0-beta.5] - 2026-04-10

> **Beta 測試版**：大規模 CLI 擴充（SDLC Flow Engine、Standards-as-Hooks 編譯器、分層 CLAUDE.md、SuperSpec Phase 4、opt-in 遙測上傳）與 Skill 治理框架（/process-to-skill、DEC 評估框架）。

### 新增

**新功能 — CLI & Standards**
- **opt-in 遙測上傳** (SPEC-TELEMETRY-002): Hook 執行結果可選擇性上傳至遠端分析端點；雙重防護（`telemetryUpload=true` + `telemetryApiKey` 非空）；SHA-256 匿名 user_id，不含 PII
- **DEC 借鑲評估框架** (XSPEC-014 Layer 1): 技術雷達（Technology Radar）、假設書（Hypothesis Document）、Reversal DEC 三大評估工具，支援借鑲決策紀錄
- **SuperSpec Phase 4 — 收尾功能** (XSPEC-005): `uds spec archive`（歸檔索引）、`uds spec search`（全文搜尋）、`uds spec quickstart`（快速建立）、`uds spec split`（大型 spec 拆分）
- **SuperSpec Phase 2 — 驗證管線**: `spec-linter`（格式驗證）、品質評分（0-100 分）、`context sync`（AC 與文件同步）
- **spec 大小閘門** (AC-3): `validateSpecSize()` — 超過 600 行觸發警告，超過 1200 行阻擋提交
- **YAML 標準擴充** (AC-18): `.standards/*.ai.yaml` 格式擴充，支援 `enforcement` 區塊與 `required_fields` 定義
- **SDLC Flow Engine** (SPEC-FLOW-001): 自訂 SDLC 工作流程引擎，含狀態機持久化（Phase 1）、可插拔品質閘門（Phase 4）、Export/Import（Phase 6-7）、互動式建立（AC-12）
- **Standards-as-Hooks 編譯器** (SPEC-COMPILE-001): `uds compile` — 將 `.standards/*.ai.yaml` 的 `enforcement` 區塊自動轉譯為 Claude Code hook 腳本
- **分層 CLAUDE.md** (SPEC-LAYERED-001): `uds init --content-layout` 支援多層目錄的獨立 CLAUDE.md；`directory-mapper` + `generator` 核心模組
- **Hook 整合** (SPEC-HOOKS-001): `uds init --with-hooks` 一鍵安裝 hook 腳本（commit-msg / security / logging）；YAML enforcement 區塊自動注入
- **Hook 執行遙測** (SPEC-TELEMETRY-001): 本地端 hook 執行統計（exitCode、duration_ms、hook_type），寫入 `.uds/hook-stats.jsonl`
- **執行歷史儲存庫標準** (`execution-history`): 新增 `core/execution-history.md` — AI Agent 工作階段跨對話持久化記憶標準，含 `@executes`/`@reads`/`@writes` 標註慣例
- **`/e2e` 斜線指令** (SPEC-E2E-001): 從 BDD Gherkin 場景自動生成 E2E 測試骨架；支援 Playwright/Cypress/Puppeteer；AC 分析、模式識別、涵蓋差距報告
- **`/process-to-skill` Skill** (XSPEC-020): Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 決策樹；Placement Decision（專案 vs UDS）
- **Skill 治理範本**: `templates/SKILL-CANDIDATES.md`（候選追蹤）、`templates/SKILL-BRIEF-TEMPLATE.md`（Simple Skill 最小規格）
- **Integration Commands Sync** (SPEC-INTSYNC-001): `check-integration-commands-sync.sh` — 自動偵測 AI 工具整合檔是否引用所有斜線指令
- `COMMAND-INDEX.json`: 47 個指令的單一真實來源（Single Source of Truth），含 7 類分類
- `/derive` 擴充：感知 `test_levels` 設定 + AC Level Summary；支援 IT + E2E 測試推演（SPEC-DERIVE-001）
- **三個核心標準新增 `enforcement` 區塊**: `commit-message-guide`、`testing-standards`、`checkin-standards`
- Pre-release 新增 Step 7.5 整合指令同步檢查

**文件與規格**
- 批次歸檔 28 個已完成的 orphan specs 為 Archived 狀態
- 歸檔 SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001（共 6 份規格）
- 新增 XSPEC-005 SuperSpec 借鑲規格與衍生測試產物

### 變更
- `REGISTRY.json`: 所有 tier 新增 `requiredCategories` 欄位；Complete 和 Partial tier 均要求全部 command categories
- `REGISTRY.json`: Cursor 依實際能力（不支援 Workflows）從 `complete` 降為 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 欄位與雙模式支援（strict / advisory）

### 修正
- `check-orphan-specs.sh`: 排除 traceability 文件的誤判（含 `SPEC-` 前綴的參考行被誤判為 orphan）
- `check-orphan-specs.sh`: 修正 orphan spec 偵測 regex（支援 list 前綴和中文狀態欄位）

### 雜項
- `.gitignore`: 新增 `.workflow-state/`（排除工作流程狀態暫時性檔案）
- 移除 11 個測試檔案中過時的 `[TODO]` 標記

## [5.1.0-beta.4] - 2026-04-01

> **Beta 測試版**：大規模標準擴充（+17 個新標準），涵蓋 SDLC 8 個階段。SDLC 涵蓋率從 64% 提升至 84%。

### 新增
- **Phase 1 — 監控維運標準** (5 個新 core 標準):
  - `observability-standards`: 三支柱框架（Logs/Metrics/Traces）、Golden Signals、L0-L4 成熟度模型
  - `slo-standards`: SLI 選取指南、SLO 設定方法論（5 步驟）、Error Budget 政策
  - `alerting-standards`: P1-P4 分級、Escalation 路徑、SLO-based alerting、告警品質指標
  - `runbook-standards`: 標準範本（7 段落）、5 類 Runbook、演練機制、品質 6 原則
  - `postmortem-standards`: Blameless 原則、5 種 RCA 方法、Action Items 生命週期
- **Phase 2 — 編碼實作標準** (3 新建 + 1 擴充):
  - `tech-debt-standards`: 6 類分類法、登記簿範本（11 欄位）、預算機制、3×3 影響矩陣
  - `feature-flag-standards`: 4 類 Flag、TTL 生命週期、腐化偵測、清理檢查表
  - `environment-standards`: 4 個環境層級、5 層設定優先順序、Secret 管理、IaC 原則
  - `checkin-standards` 擴充: Linting 三級分級、Auto-fix 策略、團隊一致性原則
- **Phase 3 — 部署與交付** (1 新建 + 2 擴充):
  - `containerization-standards`: Dockerfile 最佳實務、Multi-stage Build、Image 標籤/安全/Registry
  - `deployment-standards` 擴充: 部署驗證（成功判定、觀察期、Smoke Test）
  - `environment-standards` 擴充: IaC 原則（宣告式/冪等/Drift Detection）
- **Phase 4 — 測試深化** (2 新建 + 2 擴充):
  - `test-data-standards`: 3 層資料策略、匿名化規則、隔離原則、Factory Pattern
  - `chaos-engineering-standards`: 4 步驟實驗流程、5 種故障注入、安全護欄、SLO 整合
  - `performance-standards` 擴充: 4 種效能測試類型、基準線管理、效能預算
  - `testing-standards` 擴充: 探索式測試 SBTM、SFDPOT 啟發法
- **Phase 5 — 退役與演進** (2 個新 core 標準):
  - `deprecation-standards`: API Sunset 6 階段、Feature Sunset 8 步清單、系統退役 7 步驟
  - `knowledge-transfer-standards`: 30 天 Onboarding 路線圖、Handoff 6 步清單、Bus Factor 評估
- **Phase 6-8 — 規劃/治理/品質** (4 個新 core 標準):
  - `supply-chain-security-standards`: SBOM（SPDX/CycloneDX）、SLSA L1-L4、License 合規矩陣
  - `estimation-standards`: 3 種估算方法、校準機制、5 個反模式、信心等級
  - `design-document-standards`: HLD（6 段落）/LLD（5 段落）範本、C4 架構圖、設計審查
  - `privacy-standards`: Privacy by Design 7 原則、資料分類、DPIA、使用者 5 項權利
- **3 個新 Skill**: `observability-assistant`、`slo-assistant`、`runbook-assistant`
- **翻譯**: 17 個新標準 × zh-TW + zh-CN = 34 個翻譯檔
- **同步工具**: `scripts/check-registry-completeness.sh`（core→ai.yaml→registry→.standards/ 完整性檢查）
- **Pre-release 檢查**: 新增 Step 18 registry completeness（總步驟 19→20）
- **SDD 產物**: 18 份規格、18 份 BDD Feature、693 個 TDD 測試（全部通過）

### 變更
- **Integration 精簡化**: `uds init`/`update` 根據 AI 工具 tier 自動選擇 contentMode
  - complete (Claude Code) → minimal, partial (Copilot) → full, preview (Gemini) → index
  - `ai-agent-paths.js` 新增 `tier` 欄位和 `getAgentTier()` 函式
  - `integration-generator.js` 新增 `resolveContentModeForTool()` 對應函式
  - `init.js` contentMode 預設值從 `'index'` 改為 `'auto'`
- **CLAUDE.md**: Installed Standards Index 從 61 → 78 個標準、核心檔案數 49 → 71
- **OPERATION-WORKFLOW.md**: §8.1 新增標準同步清單從 10 步擴充為 12 步

### 新增（延續自 Unreleased）
- **標準自我診斷系統** (SPEC-SELFDIAG-001): 讓 UDS 從被動框架升級為能自我診斷的框架
  - `uds audit --score [--self]`: 4 維度健康評分（完整度/新鮮度/一致性/涵蓋度）
  - `--save / --trend`: 歷史趨勢追蹤與退化偵測
  - `--ci --threshold N`: CI 模式，以結束碼反映健康狀態
  - `--format json`: 結構化 JSON 輸出
- **Hook 學習迴路**: inject-standards.js 支援觸發統計記錄（opt-in）
  - 啟用方式：在 `.uds/config.json` 設定 `{"hookStats": true}`
  - 分析工具：`node scripts/analyze-hook-stats.mjs`
  - 隱私保護：不記錄 prompt 內容，僅記錄比對統計
  - 檔案大小上限 1MB，自動截斷舊記錄
- **排程自我診斷**: `.github/workflows/scheduled-health.yml`
  - 每週一 09:00 UTC 自動執行健康評分
  - 分數低於門檻值時自動建立 GitHub Issue
  - 支援 `workflow_dispatch` 手動觸發
- **外部參考檢查**: `scripts/check-external-references.mjs`
  - 掃描 `core/*.md` 和 `.standards/*.ai.yaml` 中的外部 URL
  - 偵測失效連結（link-rot）和過期版本引用
  - 支援離線模式（`--offline`）和 JSON 輸出（`--json`）
- **跨產品標準效果回饋協定**: `specs/standards-effectiveness-schema.json`
  - 定義 DevAP/VibeOps → UDS 的標準效果回饋 JSON 格式
  - 彙總工具：`scripts/aggregate-effectiveness.mjs`
- **版本資訊清單產出**: `scripts/generate-version-manifest.mjs`
  - Release 時產出 `.standards/version-manifest.json` 供取用端偵測版本漂移
- **整合冒煙測試**: `cli/tests/integration/tool-outputs.test.js`
  - 驗證全部 10 個 AI 工具的 `uds init` 產出格式

### 變更
- `.gitignore`: 新增 `.uds/` 排除本地端統計資料

## [5.1.0-beta.3] - 2026-03-28

> **Beta 測試版**：相依套件重大版本升級、文件生命週期標準、CLI 錯誤修正。供早期使用者測試。

### 新增
- **文件生命週期標準** (SPEC-DOCLC-001): 新增 `core/documentation-lifecycle.md`
  - 定義文件更新觸發規則表（7 種觸發條件 × 6 種文件類型）
  - 定義文件檢查金字塔（Commit → PR → Release 三層）
  - 區分硬檢查（自動化）與軟檢查（人工審查）
  - 定義責任歸屬矩陣（角色 × 文件類型 × 時機）
- **Release Workflow 文件同步檢查**: `release-workflow.md` 新增 Documentation Sync Verification 章節
- **文件無障礙標準**: `documentation-writing-standards.md` 新增 WCAG 2.1 無障礙章節
- **業界標準引用強化**: 4 個文件標準補齊 ISO 26515、Diátaxis、Conventional Comments 引用
- **新技能與標準**: `/adr`、`/retrospective`、`/contract-test`、`/metrics` 技術債量化、`/incident` 改善追蹤、`/discover` 風險登記簿、`/ac-coverage` 四層追溯

### 變更
- **Commander v14**: 升級 commander 至 v14.0.0（無程式碼變更）
- **Inquirer → @inquirer/prompts**: 從 inquirer v9 遷移至 @inquirer/prompts v7
  - 刪除不再需要的 checkbox monkey patch
  - 所有 prompt 呼叫改用新 API 格式（15 個原始碼檔案 + 7 個測試檔案）

### 修正
- **純 Skill 標準 null 路徑**: 修正 `project-discovery` 等純 skill 標準安裝時的路徑錯誤
- **GitHub 429 速率限制**: 修正 `uds check` 在 GitHub API 回應 429 時當機的問題
- **AI 工具連動安裝**: 新增 AI 工具時自動連動安裝 Skills 和 Commands
- **Windows 路徑重複**: 修正 Windows 環境下路徑重複問題
- **資訊清單殘留清理**: 修正移除 AI 工具時未清理 manifest 中的殘留中繼資料

## [5.1.0-beta.2] - 2026-03-25

> **Beta 測試版**：`output_language` 統一語言設定、文件生態系閉環。供早期使用者測試。

### 新增
- **文件生態系閉環** (SPEC-DOCS-01): 新增 `/docs impact` 和 `/docs translate` 子指令
  - `/docs impact` — 主動分析程式碼變更對文件的影響，附建議指令
  - `/docs translate` — 翻譯狀態檢查與 AI 輔助翻譯同步
  - `sync-updates` 規則升級為自動 AI 行為，修改程式碼後自動提醒受影響文件
  - 指令建議對應表：每種文件類型對應建議的斜線指令
- **文件三層分級制度**: bilingual 模式下文件依 L1（強制）/ L2（建議）/ L3（不影響）分級

### 變更
- **`commit_language` → `output_language`**: 統一語言設定名詞，同時控制 commit message 和文件語言（74 個檔案重新命名）
  - 與 `display_language` 形成對稱：display = 顯示端、output = 產出端
  - 向下相容：manifest 自動遷移、`--commit-lang` 保留為隱藏別名（hidden alias）
- **`/docs` 指令擴充**: 子指令從 4 個增加到 6 個（新增 `impact`、`translate`）

### 修正
- **removeFromManifest 遺漏清理**: 修正解除安裝時未清理 `integrationBlockHashes` 和 `integrationConfigs` 的問題

## [5.1.0-beta.1] - 2026-03-25

> **Beta 測試版**：手動打包部署 Release 模式、AI 回應引導標準。供早期使用者測試。

### 新增
- **手動打包部署 Release 模式** (SPEC-RELEASE-01): 為未使用 CI/CD 的專案新增 RC 制版本管理流程
  - `uds release promote` — RC → Stable 版本晉級
  - `uds release deploy` — 記錄部署紀錄到 deployments.yaml
  - `uds release manifest` — 產生 build-manifest.json
  - `uds release verify` — 驗證 manifest 與 Git 狀態一致性
  - `uds init` 新增發布模式選擇（ci-cd / manual / hybrid）
  - `uds config --type release_mode` 支援模式切換
  - 4 個核心工具模組：version-promote、release-config、build-manifest、deployment-tracker
  - 87 個新增測試（70 個單元 + 17 個整合）
- **AI 回應引導標準** (SPEC-STD-08): 統一 AI 助理回應結尾的下一步引導格式

### 修正
- **版本更新通知觸發範圍** (SPEC-CLI-UPDATE-NOTIFY): `uds --version` 現在會檢查並顯示新版本提示；`postAction` 從許可清單（僅 4 個指令）改為排除清單策略（排除 `update`/`simulate`/`fix`），大幅擴大觸發範圍
- **`--version` 實作方式**: 使用 `configureOutput({ outputVersion })` 攔截版本輸出，避免 Commander.js 的 `.option()` 覆寫導致 help 訊息洩漏

### 變更
- **version-check-on-uds-operation 規則**: `context-aware-loading.ai.yaml` 中 priority 從 `optional` 提升為 `required`，AI agent 首次使用斜線指令/Skills 時必須檢查版本
- **Release Standards Skill**: 新增手動模式文件和 AI Agent 行為定義
- **/release 指令**: 新增 promote、deploy、manifest、verify 子指令路由

### 相依套件
- 升級 glob 13.0.1 → 13.0.6（修補版，devDependency）
- 升級 ora 8.2.0 → 9.3.0（主版本，需 Node 20）
- 升級 lint-staged 15.5.2 → 16.4.0（主版本，devDependency）

## [5.0.0] - 2026-03-25

> **穩定發布版**：v5.0.0 的首個穩定版本 — AI Command Behavior 標準、44 個指令完整覆蓋、19 步 pre-release 檢查。

### 新增
- **AI Command Behavior 標準** (`core/ai-command-behavior.md`): 定義 AI Agent 在指令定義檔中的執行期行為結構（Entry Router、Interaction Script、Stop Points、Error Handling）
- **44 個指令完整覆蓋 AI Agent Behavior**: 為所有多步驟指令補齊行為定義，包含最後 6 個遺漏的指令（commit、init、config、methodology、update、check）
- **11 個新斜線命令**: `/security`、`/api-design`、`/database`、`/ci-cd`、`/incident`、`/pr`、`/scan`、`/metrics`、`/durable`、`/migrate`、`/audit`（命令總數 34→45）
- **AI Agent Behavior 覆蓋率檢查**: `check-ai-behavior-sync.sh` 腳本，整合至 pre-release-check.sh（Step 16，總步驟 17→19）
- **使用者手冊與入門教學簡報** (`docs/manual/`)
- ai-command-behavior 標準的 zh-TW 和 zh-CN 翻譯

### 變更
- **dev-workflow 技能更新**: 納入 11 個新命令與 2 個新場景
- **24 個互動式 SKILL.md 加入 AI Agent Behavior 引用**
- **.claude/skills SKILL.md 本地化**: 6 個 SKILL.md 轉為純繁中版本，加入 source/translation frontmatter
- 移除 SKILL.md 中冗餘的跨技能比較表

### 修正
- **testing-standards 重構**: 以覆蓋率為核心指標重構測試標準
- **3 個命令 AI 行為定義補強**: 修復 4 個停止點標記
- **/commit next steps**: 修正不當建議每次更新 CHANGELOG

## [5.0.0-rc.16] - 2026-03-24

> **發布候選版**：v5.0.0 的第十六個 RC，包含 10 個新技能、功能缺口分析、Windows 路徑錯誤修正、翻譯完整性強制檢查，以及擴充 AI 工具整合。

### 新增
- **10 個新技能**：`/security`、`/api-design`、`/database`、`/ci-cd`、`/incident`、`/pr`、`/scan`、`/metrics`、`/durable`、`/migrate` — 每個皆附有 5 個平台檔案（canonical + Claude + Gemini + zh-TW + zh-CN）
- **2 個新 AI 工具整合**：Aider 與 Continue.dev（AGENTS.md + README.md + REGISTRY.json）
- **翻譯完整性檢查**：`check-translation-sync.sh` 現在會偵測缺少的技能與核心標準翻譯（不只是過期的翻譯）
- **40 個缺少的翻譯**：為先前未翻譯的技能與核心標準回補 zh-TW（20 個檔案）與 zh-CN（20 個檔案）
- **技能消除歧義章節**：`/methodology` vs `/dev-workflow`、`/spec` vs `/sdd`、`/coverage` vs `/ac-coverage` 比較表
- **AI 技能階層**：於 `/ai-collaboration`、`/ai-instruction-standards`、`/ai-friendly-architecture` 中的三層系統文件
- **測試技能導航器**：於 `/testing` 中用於引導 6 個測試相關技能的決策樹
- **追溯規格**：SPEC-NEW-SKILLS-BATCH-01、SPEC-TRANSLATION-COMPLETENESS、SPEC-NEW-INTEGRATIONS-BATCH-01

### 修正
- **Windows 路徑分隔符號錯誤**：`manifest.fileHashes` 的索引鍵在所有平台上現在正規化為正斜線（`/`）— 修正 Windows 上執行 `uds update` 後顯示重複檔案與錯誤判定為「已修改」的問題
  - 修正於：`update.js`（4 處）、`check.js`（3 處）、`standards-installer.js`（1 處）、`manifest-migrator.js`（1 處）

### 變更
- **釐清 CLI 說明**：更新 `uds check` vs `uds audit` 以及 `uds spec` 的說明以交互參照相關指令
- **UDS 技能數量**：30 → 40 個技能
- **AI 工具整合**：12 → 14 個工具

## [5.0.0-rc.15] - 2026-03-23

> **發布候選版**：v5.0.0 的第十五個 RC，包含 Skills 版本偵測修正、技能說明標準化，以及 CHANGELOG 更新時機更正。

### 修正
- **Skills 版本偵測**（SPEC-015）：`checkNewFeatures()` 現在將 null 的 `installedVersion` 視為已過期，而非跳過檢查
- **Skills 位置衍生**：更新期間 `manifest.skills.location` 現在從 `installations` 陣列衍生，避免回退至 legacy/unknown
- **提醒多來源偵測**：Skills 更新提醒使用 installations → location → file-system 偵測鏈
- **Commands 版本偵測**：針對 Commands 過期檢查套用相同的 null 版本修正
- **CHANGELOG 更新時機**（SPEC-016）：`checkin-standards.md` 現在正確註明 CHANGELOG 僅在 pre-release 時更新，而非每個 commit 更新 — 與 `changelog-standards.md` 保持一致

### 變更
- **技能說明標準化**：所有 30 個已安裝技能的說明統一為單行 `[UDS]` 前綴格式（中文翻譯）
- **zh-TW 技能翻譯**：同步 26 個語系來源檔案至相同格式
- `/dev-workflow` 說明翻譯為繁體中文

### 新增
- **README 致謝**：為 8 個開源靈感來源（Superpowers、GSD、PAUL、CARL、CrewAI、LangGraph、OpenHands、DSPy）新增致謝章節
- **發布前檢查清單**：在 `OPERATION-WORKFLOW.md` §9.1 新增技能說明格式檢查
- **追溯規格**：SPEC-015（update skills 版本偵測）與 SPEC-016（CHANGELOG 更新時機更正）
- **內部機密文件目錄**：透過 `.gitignore` 排除 `docs/internal/confidential/`
- 跨產品整合策略文件：README.md 生態定位、CLAUDE.md 標準流向說明
- SPEC-008 新增 DevAP / VibeOps CLI 整合模式規劃（`--target devap/vibeops`）

## [5.0.0-rc.14] - 2026-03-19

> **發布候選版**：v5.0.0 的第十四個 RC，包含工作流程強制執行架構、i18n 完整性與 DX 改進。

### 新增
- **工作流程強制執行架構**（SPEC-014）：將 UDS 工作流程從文件轉化為實際執行的四層強制體系
  - **P0 — AI 層級**：`/sdd`、`/tdd`、`/bdd`、`/commit` 技能中的起飛前檢查（Pre-Flight Checks）；新增 `workflow-enforcement.ai.yaml` 標準；更新全部 11 個 AI Agent 整合範本
  - **P1 — CLI 層級**：`WorkflowGate` 階段轉換驗證器；`workflow-definitions.js` SDD/TDD/BDD 階段圖；工作階段啟動工作流程報告
  - **P2 — Git 層級**：`check-workflow-compliance.sh` pre-commit 警告（非阻斷性）；`check-commit-spec-reference.sh` commit-msg 規格建議；新增 `commit-msg` husky hook
  - **P3 — DX 層級**：`uds check` 工作流程狀態顯示（摘要 + 完整模式）；`/dev-workflow` 具上下文感知之啟動並具備階段→指令對應；`pre-release-check.sh` 步驟 16 工作流程合規性
- **核心標準**：`core/workflow-enforcement.md` — 具備 3 種強制模式（enforce/suggest/off）的機器可強制執行工作流程閘門
- **i18n — 指令翻譯完整性**：30 個 zh-TW + 31 個 zh-CN 斜線指令翻譯；`check-translation-sync.sh` 現在會驗證指令翻譯完整性
- **AC 覆蓋率助理**（AC Coverage Assistant）技能與 SPEC-AC-COVERAGE
- **繁體中文 commit 類型選項**（`.standards/options/traditional-chinese.ai.yaml`）

### 修正
- **語言切換錯誤**：`config.js` 中的 `installSkillsToMultipleAgents` 缺少 `locale` 參數 — 無論語言設定為何，技能一律以英文安裝（同時影響單一語言與「all」設定流程）
- **i18n 說明前綴**：7 個已翻譯的指令檔案在 YAML frontmatter 的 description 欄位中缺少 `[UDS]` 前綴
- **工作流程合規性腳本**：整數比較錯誤（`grep -c` 多行輸出）；`.workflow-state/` 與 `.standards/workflow-state/` 雙路徑偵測
- **test_levels 遷移**：在遷移檢查中涵蓋 5.0.0 pre-release 版本

### 變更
- **設定選單**：扁平化設定選單、隱藏進階設定、test_levels 遷移
- **發布前檢查**：17 → 18 步（新增工作流程合規性檢查）
- **標準數量**：49 → 50 個核心標準（新增 workflow-enforcement）
- **技能**：重新產生為英文語系基準線

## [5.0.0-rc.13] - 2026-03-18

> **發布候選版**：v5.0.0 的第十三個 RC，包含還原後整合重新產生之修正。

### 修正
- **還原後整合重新產生**：修正在 `uds update` 期間還原遺失檔案後 CLAUDE.md 未被重新產生的問題 — 在更新後完整性檢查還原之後加入 `regenerateIntegrations()` 呼叫，涵蓋互動模式與 `--yes` 模式

### 變更
- **統計數據同步**：在 README、語系檔與 uds-manifest.json 中更新核心標準數量 36→41、AI 技能數量 29→30

## [5.0.0-rc.12] - 2026-03-18

> **發布候選版**：v5.0.0 的第十二個 RC，包含新核心標準與錯誤碼增強。

### 新增
- **API 設計標準**（`core/api-design-standards.md`）：全新的通用標準，涵蓋 REST、GraphQL 與 gRPC API 設計原則、版本控制策略、分頁、身分驗證模式、速率限制，以及 RFC 7807 錯誤回應（938 行）
- **資料庫標準**（`core/database-standards.md`）：全新的通用標準，涵蓋結構綱要（schema）設計、遷移策略、建立索引、查詢最佳化、交易管理、SQL vs NoSQL 決策矩陣，以及敏感資料處理（828 行）
- **錯誤碼 v1.2 — API 錯誤序列化**：RFC 7807 Problem Details 格式、GraphQL/gRPC 錯誤處理模式、重試與冪等性指引（+225 行）
- **指令 README**：新增 9 個缺少的指令，以及完整的 34 個指令→技能/標準對應表
- **AC 覆蓋率指令**（`/ac-coverage`）：AC 追蹤矩陣與覆蓋率報告產生
- **追溯規格**：SPEC-STD-03（API 設計）、SPEC-STD-04（資料庫）、SPEC-STD-05（錯誤碼 v1.2）

### 變更
- **日誌 YAML**：同步至 v1.2.0，包含 distributed-tracing 與 observability-pillars 規則
- **標準數量**：47 → 49 個核心標準

## [5.0.0-rc.11] - 2026-03-18

> **發布候選版**：v5.0.0 的第十一個 RC，包含 integrationConfigs 修正與範本參照路徑更正。

### 修正
- **空的 integrationConfigs**：修正 `installIntegrations()` 未回傳 `manifestIntegrationConfigs`，導致 `uds update --sync-refs` 因空的 `integrationConfigs: {}` 而失敗的問題
- **過期的範本參照**：在整合產生器範本與靜態整合檔案中，將 12 處出現的 `.standards/commit-message-guide.md` 替換為 `.standards/commit-message.ai.yaml`

## [5.0.0-rc.10] - 2026-03-17

> **發布候選版**：v5.0.0 的第十個 RC，包含 update 指令顯示修正、過期 commandHashes 清理與 E2E 迴歸測試。

### 修正
- **Options 顯示路徑**：修正 `uds update` 檔案清單顯示 `.standards/unit-testing.ai.yaml` 而非 `.standards/options/unit-testing.ai.yaml` 的問題 — 改用 `getStandardTargetDir()` 進行顯示
- **過期 commandHashes 清理**：修正 `uds update --commands` 未針對已重新命名/已刪除的指令移除舊的 commandHashes 條目的問題 — 加入 `replaceCommandHashesForUpdatedAgents()` 以在合併前清理過期條目

### 新增
- **E2E 迴歸測試**：為 `uds update` 新增 2 個迴歸測試 — options 顯示路徑驗證、指令更新後的過期 commandHashes 清理

## [5.0.0-rc.9] - 2026-03-17

> **發布候選版**：v5.0.0 的第九個 RC，包含 E2E 錯誤迴歸測試、options 子目錄修正與發布前工作流程改進。

### 新增
- **E2E 錯誤迴歸測試**：為 `uds update` 新增 5 個迴歸測試案例 — options 子目錄、擴充套件型別安全、null 來源、使用者內容保留、區塊雜湊同步
- **發布前 E2E 步驟**：將發布前檢查步驟 16 拆分為單元測試（步驟 16）+ E2E 測試（步驟 17），總檢查項目 16→17

### 修正
- **Options 子目錄**：透過新的 `getStandardTargetDir()` 輔助函式，修正 `uds update` 將選項標準（例如 `english.ai.yaml`）安裝至 `.standards/` 而非 `.standards/options/` 的問題

### 變更
- **技能同步**：將 documentation-guide 同步至 v2.1.0（Diátaxis 分類法、LLM 探索、品質指標）、更新 methodology 的 SDD 階段、擴充工作流程文件
- **Gemini 同步**：將 Gemini 的指令/技能清單與 rc.8 對齊，擴充 `sdd.toml` 指令

## [5.0.0-rc.8] - 2026-03-17

> **發布候選版**：v5.0.0 的第八個 RC，包含 Windows 相容性修正與 CI 穩定性改進。

### 修正
- **Windows NULL 檔案**：修正 `/dev/null` 重新導向在 Windows 上建立字面名稱為 `NULL` 之檔案的問題 — 為 12 個腳本新增 EXIT trap 清理機制以及 `.gitignore` 安全防護網
- **Windows CI**：改用 `path.join` 取代寫死的 Unix 路徑，修正 `update-checker.test.js` 在 Windows 上的路徑分隔符號斷言失敗問題

## [5.0.0-rc.7] - 2026-03-17

> **發布候選版**：v5.0.0 的第七個 RC，包含自動更新通知、文件標準強化以及錯誤修正。

### 新增
- **自動更新通知**：CLI 指令（`init`、`list`、`add`、`config`）現在會顯示具備 24 小時節流快取的更新通知（`~/.uds/update-check.json`）
- **AI Agent 版本檢查規則**：在 `context-aware-loading` 中新增 `version-check-on-uds-operation` 規則 — AI Agent 在每次對話中執行第一個斜線指令時檢查 npm 上的 UDS 更新
- **文件標準強化**：文件標準新增 Diátaxis 分類法、LLM 友善指引、ADR 深入探討與品質指標

### 修正
- **Manifest 擴充項目處理**：修正 `manifest.extensions` 包含非字串項目時當機的問題

### 變更
- **維護文件整合**：將 `MAINTENANCE.md` 合併至 `OPERATION-WORKFLOW.md` 並封存過期檔案

## [5.0.0-rc.6] - 2026-03-17

> **發布候選版**：v5.0.0 的第六個 RC，包含受 GSD、CrewAI、LangGraph、OpenHands 與 DSPy 啟發的 12 項 SDD／工作流程改進。

### 新增
- **討論階段（Discuss Phase）**（源自 GSD）：在 SDD 提案前新增結構化討論階段 — 捕捉灰色地帶、鎖定範圍、建立 `read_first` 清單
- **驗證循環上限（Verification Loop Cap）**（源自 GSD）：SDD verify 階段上限為 3 次迭代；達到上限後強制人工介入
- **結構化任務定義（Structured Task Definition）**（新標準）：AI 任務定義的 4 個必要欄位（`read_first`、`action`、`acceptance_criteria`、`verification`）
- **工作流程狀態協定（Workflow State Protocol）**（新標準）：包含 YAML 狀態檔案與僅供附加事件日誌（append-only event logs）的 `.workflow-state/` 目錄，用於跨工作階段持久化
- **基於波次的執行（Wave-Based Execution）**（源自 GSD）：methodology schema 中的選填 `wave` 欄位，用於平行步驟分組
- **驗證管線（Validation Pipeline）**（源自 CrewAI/DSPy）：具備快速失敗（fail-fast）原則的雙層驗證（決定性 + 語意）
- **Agent 簽章（Agent Signatures）**（源自 DSPy）：Agent 定義中用於結構化 I/O 合約的選填 `signatures` 欄位
- **追蹤矩陣（Traceability Matrix）**（源自 GSD）：SDD verify 階段期間的 REQ→AC→Test→Implementation→Commit 對應
- **上下文預算追蹤（Context Budget Tracking）**（源自 CrewAI/GSD）：`context-aware-loading` 中的上下文視窗感知規則（60%/80% 門檻）
- **HITL 中斷（HITL Interrupt）**（源自 LangGraph）：暫停工作流程並儲存狀態的新 `interrupt` 檢查點強度
- **Agent 通訊協定（Agent Communication Protocol）**（源自 LangGraph/CrewAI/GSD）：三層協定（產物傳遞、reducer 模式、上下文隔離）
- **追蹤驗證（Trace Validation）**（源自 DSPy）：跨 SDD 工作流程階段的中間步驟品質驗證

### 變更
- **SDD 工作流程**：從 5 個階段更新為 6 個階段（Discuss → Proposal → Review → Implementation → Verification → Archive）
- **核心標準數量**：在所有 CLAUDE.md、GEMINI.md 與翻譯中從 34 更新至 36
- **標準索引**：在 manifest.json、standards-registry.json、CLAUDE.md、GEMINI.md 中新增 `structured-task-definition` 與 `workflow-state-protocol`

## [5.0.0-rc.5] - 2026-03-16

> **發布候選版本**：v5.0.0 的第五個 RC，包含上下文感知載入、規格追蹤與 4 層測試金字塔。

### Added
- **Context-Aware Loading**：新增 `core/context-aware-loading.md` 標準——7 個領域類別，具備常駐／隨選載入機制（SPEC-012）
- **Workflow State Tracking**：`project-context-memory` 為跨工作階段狀態持久化新增 `workflow-state` 類型（SPEC-013）
- **AI-Driven Spec Tracking**：`/commit` 現在會評估 `feat`/`fix` 提交的規格需求；新增用於追溯建立規格的 `/sdd-retro` 指令（SPEC-011）
- **Orphan Spec Detection**：`check-orphan-specs.sh/.ps1` 可偵測卡在非終止狀態的規格（已整合至發布前檢查步驟 15）
- **4-Layer Testing Pyramid**：從 3 層（70/20/10）升級為包含系統測試（ST）層級的 4 層（70/20/7/3）架構
- **Test Governance Standard**：新增包含品質目標、完成準則與環境管理的 `test-governance` 標準
- **Test Templates**：新增 `test-plan-template.md` 與 `test-case-template.md`（靈感源自 ISO 29119-3）

### Fixed
- **Command Locale Support**：`uds update` 現在會使用專案語系設定安裝斜線指令，並具備 `detectLocaleFromStandards()` 後備機制（#7）
- **Dev-Workflow Registration**：在 `AVAILABLE_COMMANDS` 中註冊 `/dev-workflow` 並同步使用文件
- **Bilingual Commit Body**：將 `bilingual-body` 規則從建議升級為必要，並附帶 5 步驟結構指南

### Changed
- **Spec Reference Footer**：將 commit 的 `Spec References` 一般化為支援 SPEC/JIRA/FEATURE/RFC 前綴的 `Custom Reference Footers`
- **SPEC-012 Cleanup**：移除多餘的 `activation` 欄位、合併 REQ-003/004、重新編號 AC
- **SPEC-011 Cleanup**：移除重複的技術設計章節、將 6 項需求整合為 4 項

## [5.0.0-rc.4] - 2026-03-05

> **發布候選版本**：v5.0.0 的第四個 RC，包含全新 audit 指令、檔案擺放指南與技能相互連結。

### Added
- **`uds audit` 指令**：用於 UDS 健康檢查與回饋收集的全新 CLI 指令（`--health`、`--patterns`、`--friction`、`--report`）
- **File Placement Decision Guide**：新增 `core/guides/file-placement-guide.md`——主決策樹、反向查閱索引（30 多種檔案類型）、程式碼組織深入剖析、開發產物生命週期
- **Source Code Organization Terminology**：在 `project-structure.md` 中新增 utils/helpers/shared/lib/internal 的概念釐清
- **Configuration Files Placement**：新增工具設定、應用程式設定、環境變數、CI/CD、IaC 的標準擺放位置
- **Generated Code Placement**：新增 `src/generated/` 標準與 gitignore 指南
- **Development Artifacts Directory**：新增具備生命週期管理的 `docs/working/` 結構（腦力激盪、RFC、調查、POC）
- **Expanded Document Types Matrix**：在 `documentation-structure.md` 中提供完整的檔案類型 → 目標位置對照表
- **Audit Assistant Skill**：具備健康檢查與回饋工作流程的全新 `/audit` 技能
- **Skill Inter-linking**：在 `/checkin`、`/review`、`/commit`、`/sdd` 中新增 `/audit` 後續步驟建議
- **Next Steps Guidance**：為 17 個現有技能新增後續步驟建議

### Fixed
- **Config Display Language**：修正 `displayLanguage` 未傳遞至設定路徑的問題
- **Skills Uninstaller Tests**：修正測試意外刪除使用者層級目錄的問題
- **Package Name in Docs**：修正錯誤的套件名稱參照

### Changed
- **README Structure**：擷取預先發布資訊，並新增設定／解除安裝／方法論章節
- **SPEC-AUDIT-01**：重寫為整合腦力激盪且以使用者為導向的規格書

## [5.0.0-rc.2] - 2026-02-13

> **發布候選版本**：v5.0.0 的第二個 RC，包含文件改進與 CLI 錯誤修正。

### Fixed
- **Slash Command Deduplication**：防止為同一代理選擇多個等級時重複安裝技能
- **Update Command**：在執行 `uds update` 期間偵測並安裝新標準

### Changed
- **README Structure**：將所有 README 重構為模組化且對 AI 最佳化的格式

## [5.0.0-rc.1] - 2026-02-12

> **發布候選版本**：這是 v5.0.0 的第一個 RC。所有主要功能均已完成；此版本專注於穩定版推出前的最後驗證。

### Added
- **3-Dimension Reverse Engineering**：將 `/reverse` 演進為涵蓋邏輯、資料與執行環境維度的完整系統考古（`/reverse spec`、`/reverse data`、`/reverse runtime`）

### Fixed
- **Skills Count**：修正 `sync-manifest.mjs`，使其僅計算包含 `SKILL.md` 的目錄（原為 32 個，現已正確更正為 27 個）
- **Missing Command Registration**：在 `AVAILABLE_COMMANDS` 與技能 README 表格中註冊 `/brainstorm`

### Changed
- **Workflow Visualization**：在 `WORKFLOW-ANALYSIS.md` 中擴充 Mermaid 圖表，加入 3 維反向工程子節點與資料流箭頭

## [5.0.0-beta.12] - 2026-02-12

### Added
- **Workflow Prerequisite System**：新增 `workflow-prerequisites.yaml` 登錄表與 `prerequisite-check.md` AI 行為協議，用於在執行前檢查指令的前置條件
- **Workflow Analysis Document**：完整的 `docs/WORKFLOW-ANALYSIS.md`，包含流程盤點、決策速查與導入路線圖
- **Workflow Gaps Tracker**：追蹤 12 個已識別缺口（CI/CD、事故回應等）的 `docs/WORKFLOW-GAPS.md`
- **Cross-Command Handoff Guidance**：`/discover`、`/reverse`、`/derive`、`/release` 現在會在完成後建議合理的後續步驟
- **Doc Generation Tooling**：用於自動化同步 README 統計數據的 `scripts/sync-manifest.mjs` 與 `scripts/generate-docs.mjs`
- **`/brainstorm` Skill**：結構化 AI 輔助發想技能

### Changed
- **Documentation Sync**：以準確的數量更新所有 README、MAINTENANCE.md、STANDARDS-MAPPING.md、FEATURE-REFERENCE.md（32 項標準、26 個技能、30 個指令）
- **AI Tool Support Table**：擴充納入 Gemini CLI、Cursor、Cline/Roo Code、Windsurf 並提供詳細功能支援資訊
- **Pre-release Checks**：在 `pre-release-check.sh` 中新增步驟 1.5 `docs:sync`
- **Skill Prerequisites**：`/derive` 現在宣告了 `spec-approved` 前置條件；`/release` 宣告了 `release-check` 前置條件

## [5.0.0-beta.11] - 2026-02-11

### Added
- **Display Language Setting**：全新 `uds config` 選項，可將 UI 顯示語言與 commit 語言分開獨立設定

### Fixed
- **Language Resolution Bug**：修正 `uds config` 中的語言偵測後備邏輯，以正確解析顯示語言
- **Release Scripts**：修正發布腳本中 README 版本更新的錯誤

### Changed
- **README**：新增測試版安裝指南，並將版本顯示同步至 5.0.0-beta.10

## [5.0.0-beta.10] - 2026-02-11

### Added
- **Commit Language Directive**：整合檔案現在包含提交訊息語言指示，確保 AI 工具即使沒有 `commit-message.ai.yaml` 也能始終知道預期的語言
- **Config i18n**：針對 vibe coding 預設集與偏好設定 UI 提供三語翻譯（en/zh-tw/zh-cn）

### Fixed
- **Config Language Detection**：`uds config` 現在會自動從專案 manifest 偵測 UI 語言，與 `uds configure` 的行為一致
- **Documentation Integrity**：在沒有 Reference 標記存在時跳過參照同步區段
- **Broken Links**：修正跨 212 個檔案中的 153 個損毀 Markdown 連結

### Changed
- **Documentation Integrity Checker**：全新腳本，具備 4 項子檢查以供發布前驗證
- **Commands Sync Checker**：整合至發布前檢查的全新腳本

## [5.0.0-beta.9] - 2026-02-10

### Added
- **Missing Command Files**：在 `skills/commands/` 中建立 `changelog.md`、`checkin.md`、`discover.md`、`docgen.md`，以供 Gemini CLI TOML 轉換使用
- **Register `/docs` and `/guide`**：新增至 `AVAILABLE_COMMANDS`，讓所有代理都能探索這些指令

### Changed
- **Daily Workflow Guide v1.1.0**：新增階段 0 專案探索章節、以 `/discover` 進入點更新決策樹、在策略 3 中新增 `/discover` + `/reverse` 作為前置條件、使用 `/discover`、`/reverse`、`/refactor` 擴充指令參考手冊
- **Translations Synced**：將繁體中文（zh-TW）與簡體中文（zh-CN）的 DAILY-WORKFLOW-GUIDE.md 更新至 v1.1.0

## [5.0.0-beta.8] - 2026-02-10

### Added
- **Deployment Standards**：包含交互參照的部署工作流程全新核心標準（`core/deployment-standards.md`）
- **`/discover` Skill**：用於評估專案就緒度的階段 0 專案評估技能
- **Skill Harvesting SDD**：從現有工作流程系統性擷取技能的規格書

### Changed
- **`/spec` → `/sdd` Rename**：將 `/spec` 技能重新命名為 `/sdd`（規格驅動開發，Spec-Driven Development）、補齊缺少的子指令、同步簡體中文分割架構
- **SKILL.md Split Architecture**：技能現在採用精簡指令參考手冊 + 詳細指南的結構
- **`uds configure` → `uds config`**：將 `uds configure` 合併至 `uds config` 作為統一進入點

### Fixed
- **Integration File Preservation**：`uds update` 現在會保留整合檔案（AGENTS.md、.cursorrules 等）中的使用者自訂內容
- **Translation Source Paths**：修正簡體中文與繁體中文翻譯檔案中 143 個損毀的相對路徑
- **Pre-release Check Script**：`check-docs-sync.sh` 現在會為測試版發布正確跳過 `.claude-plugin/` 版本檢查
- **Scope Marker**：將 `project-context-memory.md` 範圍從 `Project-Specific (Local)` 修正為 `uds-specific`

## [5.0.0-beta.7] - 2026-02-09

### Added
- **Project Context Memory (PCM)**：用於擷取、擷取與強制執行專案特定上下文、架構決策和領域知識的全新核心標準（`core/project-context-memory.md`、`.standards/project-context-memory.ai.yaml`）
- **Developer Persistent Memory (DPM)**：將開發者持久記憶標準與 Always-On Protocol 交付管線整合（`core/developer-memory.md`、`.standards/developer-memory.ai.yaml`）
- **Memory Adoption Strategy**：位於 `docs/specs/system/` 的記憶系統導入架構指南
- **Initial Project Context**：在 `.project-context/uds-architecture.md` 中引導初始專案上下文文件

## [5.0.0-beta.6] - 2026-02-06

### Fixed
- **Init → Integration Standards Passthrough**：修正 `init` 指令未將 `installedStandards` 傳遞給整合安裝器的問題，該問題曾導致整合檔案使用硬編碼的預設分類
- **Integration Category Filtering**：修改整合安裝器，使其依據實際安裝的標準來過濾請求的分類，以防止產生的檔案（AGENTS.md、GEMINI.md、.cursorrules 等）中出現孤立的 `Reference:` 行
- **AI YAML Format Recognition**：在 `STANDARD_TO_CATEGORY` 對照中新增 `.ai.yaml` 格式項目，使 `uds check` 能正確辨識 AI 最佳化的標準檔案
- **Cross-Format Reference Comparison**：重寫 `compareStandardsWithReferences` 以在分類層級進行比對，正確處理 `.md` 與 `.ai.yaml` 格式之間的差異

### Added
- **Regression Tests**：新增 7 項針對性測試，涵蓋分類過濾、`.ai.yaml` 格式支援與跨格式參照比較

## [5.0.0-beta.5] - 2026-02-06

### Fixed
- **Commands Integrity Path Resolution**：修正 `checkCommandsIntegrity` 在呼叫 `getCommandsDirForAgent` 時未帶 `level` 參數，導致所有被追蹤的指令都被回報為「遺失」的問題
- **i18n Skills Labels**：從 `skillsProject`/`skillsGlobal` 標籤中移除硬編碼的 `.claude/` 路徑，以正確支援多代理顯示
- **Command Installations Display**：修正 `commands.installations` 物件渲染為 `[object Object]` 而非 `agent: level` 格式的問題
- **AGENTS.md Path Mapping**：在 `getToolFromPath` 中為 OpenAI Codex CLI 整合偵測補上遺漏的 `AGENTS.md → codex` 對照

### Added
- **Regression Tests**：新增 4 項針對性回歸測試，涵蓋上述所有錯誤修正

## [5.0.0-beta.4] - 2026-02-06

### Fixed
- **Integration Installer Config Resolution**：修正整合安裝器中的 `displayLanguage` 與 `skillsConfig` 設定解析問題
  - 現在產生 AI 工具整合檔案時能正確解析設定值

### Added
- **Integration Content Matrix Tests**：為 `generateIntegrationContent` 新增完整的資料驅動矩陣測試
  - 涵蓋整合內容產生的所有語言 × 設定組合

## [5.0.0-beta.3] - 2026-02-06

### Fixed
- **Husky Init Fallback**：當 `husky init` 失敗時新增後備建立 `.husky` 目錄的處理
  - 確保即使在 `husky init` 發生錯誤的環境中，也能正確設定 pre-commit hook

## [5.0.0-beta.2] - 2026-02-05

### Fixed
- **E2E Tests**：針對新的 config 指令 JSON API 更新 config-flow 測試
  - config 指令現在輸出 JSON 格式而非 UI 標籤
  - 略過 UI 語言測試，等待重新設計

## [5.0.0-beta.1] - 2026-02-05

### Added
- **Marketplace Version Strategy**：實作針對 `.claude-plugin/` 檔案的僅限穩定版更新政策
  - 預先發布版本（alpha/beta/rc）不再更新市集檔案
  - 市集使用者只會收到經過測試的穩定版本
  - 以預先發布偵測增強 `check-version-sync.sh` 腳本

### Fixed
- **Bundled Path Resolution**：更正 skills、agents 與 workflows 安裝器的路徑
  - 修正 `skills/claude-code/agents` → `skills/agents`
  - 修正 `skills/claude-code/workflows` → `skills/workflows`
  - 修正 `skills/claude-code` → `skills`
- **E2E Test Expectations**：更新 init-flow 測試以符合實際的 CLI 輸出格式
  - 等級格式：`Level: Level 3` 取代 `Level: 3`
  - 移除不存在的整合摘要標籤

## [5.0.0-alpha.2] - 2026-02-04

### 新增
- **雙層架構**：在想像層（Imagination Layer，準則）之外引入實體規格（Physical Spec，驗證器）
- **預測性模擬**：新增 `uds simulate` 指令以預覽合規檢查
- **自動修復**：新增 `uds fix` 指令以自動解決違規
- **Agent 就緒 API**：為 check、simulate 與 fix 指令新增 `--json` 輸出模式
- **Pre-commit 整合**：`uds init` 現在會自動設定 Husky hook
- **智慧定位器**：透過模糊比對與內部 ID 驗證增強標準檔案的解析能力

### 變更
- 將 `changelog`、`versioning`、`testing`、`security`、`code-review`、`commit-message`、`project-structure` 升級為包含實體規格的 v2 格式

## [5.0.0-alpha.1] - 2026-01-29

### 變更
- **核心標準瘦身（Token 最佳化）**：大幅重構以降低 AI 上下文負載
  - **規則與指南分離**：將龐大的標準檔案拆分為精簡的「規則」（供 AI 使用）與詳細的「指南」（供人類／參考使用）
  - **方法論遷移**：將純方法論教學從 `core/` 移至 `methodologies/guides/`
  - **新目錄結構**：
    - `core/`：僅包含可執行的規則、檢查清單與門檻值（目標各檔 < 10KB）
    - `core/guides/`：包含詳細說明、教學與範例
    - `methodologies/guides/`：包含完整方法論指南（TDD、BDD、SDD 等）
  - **檔案大小顯著縮減**：
    - `testing-standards.md`：141KB → 14KB（縮減 90%）
    - `test-driven-development.md`：54KB → ~1KB 存根（已移至 methodologies）
    - `git-workflow.md`：38KB → ~8KB（拆分）
    - 整體 `core/` 目錄大小縮減約 75%

## [4.3.0-alpha.1] - 2026-01-26

> ⚠️ **Alpha 版本**：這是用於本地測試的內部驗證版本。不建議用於正式環境。

### 變更
- **方法論重構**：重大區隔，將 SDD 從 TDD/BDD/ATDD 家族中獨立出來
  - SDD（規格驅動開發，2025）現在被定位為 AI 時代的獨立方法論
  - TDD/BDD/ATDD（1999-2011）歸類為傳統開發方法論
  - 從所有文件中移除錯誤的「ATDD → SDD → BDD → TDD」順序
  - 在 TDD、BDD 與 ATDD 標準中新增方法論分類章節
  - 基於文獻研究：GOOS（Freeman & Pryce）、Thoughtworks、Martin Fowler

- **SDD 強化** (v2.0.0)：
  - 新增「SDD 作為獨立方法論」章節與歷史背景
  - 根據 Martin Fowler 2025 新增 SDD 成熟度層級（規格優先 Spec-first、規格錨定 Spec-anchored、規格即來源 Spec-as-source）
  - 新增「常見陷阱」章節與業界警告
  - 新增「驗證層」章節與理論基礎（依合約設計 Design by Contract、合約測試 Contract Testing）
  - 新增包含實務工作流程的「SDD + 測試整合模型」
  - 新增參考資料：Thoughtworks、GitHub spec-kit、InfoQ、Specmatic

- **正向推導強化** (v1.1.0)：
  - 新增用於合約驗證的 contract.json 輸出格式
  - 新增用於 schema 驗證的 schema.json 輸出格式
  - 新增用於產生驗證產物的 `/derive-contracts` 指令

- **傳統方法論更新**：
  - TDD (v1.2.0)：新增方法論分類，以雙迴圈 TDD（Double-Loop TDD，GOOS）取代整合金字塔（Integration Pyramid）
  - BDD (v1.1.0)：新增方法論分類、雙迴圈 TDD 說明、協同驗收（Collaborative Acceptance）
  - ATDD (v1.1.0)：新增方法論分類、ATDD 作為可選協作、兩種途徑比較（Two-approach comparison）

- **測試完整性維度**：從 7 個維度更新為 8 個維度
  - 新增維度 8：AI 測試生成品質（變異測試、斷言深度、測試目的）
  - 更新 skills、AI YAML 與整合設定以反映 8 維度框架
- **防幻覺標準**：新增統一標籤系統（Unified Tag System）
  - 確定性標籤（Certainty Tags）：用於分析既有內容（`[Confirmed]`、`[Inferred]`、`[Assumption]`、`[Unknown]`、`[Need Confirmation]`）
  - 推導標籤（Derivation Tags）：用於生成新內容（`[Source]`、`[Derived]`、`[Generated]`、`[TODO]`）
  - 工作流程對應（Workflow mapping）指定每種工作流程類型適用哪一類標籤

### 文件
- 更新 skills 以進行階段 1-4 的一致性同步：
  - `test-coverage-assistant`：7→8 維度
  - `ai-collaboration-standards`：新增統一標籤系統
  - `reverse-engineer`：新增統一標籤系統參考
  - `forward-derivation`：新增統一標籤系統參考
- 更新 AI 標準（YAML）：
  - `test-completeness-dimensions.ai.yaml`：新增維度 8
  - `anti-hallucination.ai.yaml`：新增統一標籤系統與工作流程對應
- 更新整合設定：
  - `github-copilot/copilot-instructions.md`：7→8 維度

## [4.2.0] - 2026-01-24

### 新增
- **CLI 規格**：將 31 份 CLI 規格文件發布為 Stable
  - Agent 指令規格（2 份文件）：概觀、安裝
  - Workflow 指令規格（2 份文件）：概觀、安裝
  - AI-Context 指令規格（2 份文件）：概觀、設定檔產生
  - Init 指令規格（4 份文件）：概觀、專案偵測、設定流程、執行階段
  - Check 指令規格（4 份文件）：概觀、完整性檢查、狀態顯示、還原操作
  - Update 指令規格（4 份文件）：概觀、版本檢查、標準更新、功能偵測
  - Configure 指令規格（3 份文件）：概觀、選項類型、AI 工具管理
  - 共享模組規格（7 份文件）：Manifest Schema、檔案操作、雜湊追蹤、整合生成、Skills 安裝、AI Agent 路徑、Prompts
  - List 指令規格（1 份文件）
  - Skills 指令規格（1 份文件）

### 變更
- **AI Agent 路徑**：更新設定以符合官方廠商文件（2026-01-24）
  - Cline：依[官方文件](https://docs.cline.bot/features/slash-commands/workflows)將路徑由 `.cline/` 修正為 `.clinerules/`
  - Windsurf：依[官方文件](https://docs.windsurf.com/windsurf/cascade/workflows)透過 `.windsurf/rules/` 路徑新增 workflows 支援
  - Gemini CLI：新增 `commandFormat: 'toml'` 欄位以記錄 TOML 格式需求
  - GitHub Copilot：將 `commands.user` 標記為不支援（僅支援 VS Code IDE）

### 修正
- **CLI**：`promptCommandsInstallation` 現在能妥善處理帶有 `commands.user: null` 的 agent
  - 針對不支援的 agent（例如 GitHub Copilot CLI）略過使用者層級選項

### 文件
- **Claude Code Skills/Commands 合併說明**：新增文件說明 Claude Code v2.1.3+ 已合併斜線指令與 skills
  - `.claude/commands/review.md` 與 `.claude/skills/review/SKILL.md` 兩者都會建立 `/review`
  - 現有的指令檔案仍可繼續運作
  - 其他 AI 工具（OpenCode、Roo Code、Gemini CLI）仍使用傳統指令格式
- **新規格**：新增 [SHARED-07] AI Agent Paths Update 規格（`docs/specs/cli/shared/ai-agent-paths-update.md`）

## [4.1.0] - 2026-01-21

### 新增
- **重構標準 v2.0**：結合業界最佳實踐進行強化
  - 戰術策略：預備性重構（Preparatory Refactoring，Kent Beck）、童子軍法則（Boy Scout Rule，Robert C. Martin）
  - 戰略策略：防腐層（Anti-Corruption Layer，Eric Evans/DDD）
  - 決策矩陣摘要，用於快速選取策略
- **新 `/refactor` 指令**：帶有決策樹的互動式重構助理
  - `/refactor decide` - 執行重構 vs. 重寫決策樹
  - `/refactor tactical` - 建議每日重構策略
  - `/refactor strategic` - 引導架構重構
  - `/refactor legacy` - 遺留程式碼安全策略
- **AI 工具整合**：為非 Claude Code 工具提供重構指引
  - GitHub Copilot Chat 提示詞範本
  - Cursor/Windsurf 規則章節
  - Gemini CLI 指引

### 變更
- **重構標準**：重新組織為三層分類
  - 戰術（日常、分鐘級操作）
  - 戰略（架構、週至月級規模）
  - 安全（遺留程式碼防護）
- **登錄檔**：`refactoring-standards` 從「reference」升級至「skill」分類，並對應 `refactoring-assistant` skill

### 文件
- 更新重構標準（v2.0.0）的 zh-TW 翻譯
- 更新重構標準（v2.0.0）的 zh-CN 翻譯
- 新指令翻譯：zh-TW 與 zh-CN 的 `/refactor`
- 更新重構標準的 AI 最佳化 YAML 格式

---

## [4.0.0] - 2026-01-20

### 重點摘要

**雙向推導系統**：v4.0 引入了完整的規格-程式碼生命週期管理系統：
- **正向推導**：從 SDD 規格產生 BDD/TDD/ATDD 產物
- **反向工程**：從既有程式碼提取規格
- 兩者共同構成雙向推導循環，以維持規格與程式碼的一致性

### 新增
- **6 個新核心標準**：
  - `behavior-driven-development.md` - BDD 方法論與標準
  - `acceptance-test-driven-development.md` - ATDD 方法論與標準
  - `reverse-engineering-standards.md` - 反向工程標準
  - `forward-derivation-standards.md` - 正向推導標準
  - `ai-instruction-standards.md` - AI 指令撰寫標準
  - `refactoring-standards.md` - 重構標準與模式
- **8 個新 Skills**（總計 23 個）：
  - `forward-derivation/` - 正向推導指令（`/derive-bdd`、`/derive-tdd`、`/derive-atdd`、`/derive-all`）
  - `reverse-engineer/` - 強化反向工程（`/reverse-sdd`、`/reverse-bdd`、`/reverse-tdd`）
  - `bdd-assistant/` - BDD 工作流程助理（`/bdd`）
  - `atdd-assistant/` - ATDD 工作流程助理（`/atdd`）
  - `methodology-system/` - 方法論選取（`/methodology`）
  - `refactoring-assistant/` - 重構助理
  - `checkin-assistant/` - 簽入助理
  - `commands/` - 斜線指令集合（`/checkin`、`/methodology` 等）
- **CLI 增強**：
  - 各工具層級選取（個別 AI 工具可選使用者層級或專案層級）
  - 用於疑難排解的 `--debug` 旗標
  - 已拒絕功能記憶（Declined features memory）
  - 強化檔案完整性追蹤
  - 支援 Claude Code 的指令安裝路徑

### 變更
- **方法論系統**：現已可用於正式環境（先前為實驗性質 🧪）
  - TDD/BDD/SDD/ATDD 工作流程完全整合
  - 移除實驗性旗標
- **CLI**：統一 Skills 與 Commands 安裝的提示格式
- **文件**：跨所有組件同步術語

### 修正
- 市集偵測可靠性
- 在地化 skills 中的 YAML frontmatter 語法

---

## [4.0.0-beta.2] - 2026-01-20

### 新增
- **CLI**：Claude Code Commands 路徑支援（`ai-agent-paths.js`）
  - 為 Claude Code 新增 `commands.project` 與 `commands.user` 路徑
  - 支援將 Commands 安裝至 Claude Code

### 修正
- **CLI**：市集偵測現在僅信任實際安裝狀態
  - 先前同時信任 manifest 紀錄與實際狀態（可能過期）
  - 現在改為檢查 `marketplaceInfo?.installed === true`，而非 manifest 的 `skills.location`
  - 修復過期的 manifest 可能導致市集偵測不正確的問題
- **Skills**：`argument-hint` 欄位中的 YAML frontmatter 語法錯誤
  - 中括號 `[]` 在 YAML 中需要加引號以避免被解析為陣列
  - 已在 `methodology.md` 與 `bdd.md` 的 `locales/zh-TW/` 和 `locales/zh-CN/` 中修復

## [4.0.0-beta.1] - 2026-01-19

### 新增
- **核心標準**：正向推導標準（`core/forward-derivation-standards.md`）
  - 從已核准的 SDD 規格推導出 BDD 場景、TDD 測試骨架與 ATDD 驗收測試
  - 與反向工程相輔相成，構成雙向推導系統
  - 嚴格的 1:1 驗收條件（AC）對應，符合反幻覺規範
  - 確定性框架：`[Source]`、`[Derived]`、`[Generated]`、`[TODO]` 標記
- **技能**：適用於 Claude Code 的正向推導技能（`skills/forward-derivation/`）
  - 新增指令：`/derive-bdd`、`/derive-tdd`、`/derive-atdd`、`/derive-all`
  - 多語言支援：TypeScript、Python、Java、Go
  - 支援 Given-When-Then 與列點格式的 AC 解析器
- **規格**：核心標準建立工作流程（`docs/specs/system/core-standard-workflow.md`）
  - 定義建立／更新核心標準的 8 階段工作流程
  - 檔案檢查清單與技能適用性矩陣
  - CLI 整合需求與驗證檢查點
- **CLI**：Commands 安裝支援依工具選擇層級
  - Commands 現在使用 `{agent, level}` 格式（與 Skills 一致）
  - 使用者可為各個 AI 工具個別選擇使用者層級（User Level）或專案層級（Project Level）
  - 預設勾選專案層級

### 變更
- **CLI**：統一 Skills 與 Commands 安裝的提示格式
  - 兩者皆採用帶有各工具 User/Project 層級選項的 multiSelect
  - `update` 指令現在使用與 `init` 相同的提示，以保持一致性
- **文件**：斜線指令與 CLI 術語同步
  - 採用層級：Essential/Recommended/Enterprise → Starter/Professional/Complete
  - 標準範疇：Minimal/Full → Lean/Complete
  - 內容模式：Index → Standard
  - Skills/Commands 安裝：簡單清單 → 依工具 multiSelect

### 文件
- 更新 `core/spec-driven-development.md`，新增正向推導整合章節
- 更新正向推導與 SDD 標準的 AI YAML 檔案

## [3.5.1-beta.22] - 2026-01-19

### 新增
- **CLI**：`uds update` 指令新增 `--debug` 旗標
  - 顯示 Skills/Commands 偵測的詳細除錯輸出
  - 協助診斷特定 AI 工具未出現在安裝提示中的原因
  - 輸出內容：aiTools 清單、已拒絕功能、設定檢查、安裝狀態

## [3.5.1-beta.21] - 2026-01-19

### 修正
- **CLI**：Skills 安裝現在可正確搭配 `--skills-location` 選項運作
  - 錯誤修正：將屬性名稱從 `location` 改為 `level`，以符合 `installSkillsToMultipleAgents` API
  - 先前回報成功但實際上並未建立任何檔案

## [3.5.1-beta.20] - 2026-01-19

### 新增
- **CLI**：`uds configure` 指令新增 `--skills-location` 選項
  - 允許在非互動模式下指定 Skills 安裝層級（project/user）
  - 範例：`uds configure --type skills --ai-tool opencode --skills-location user`

### 變更
- **Commands**：以多階段 AskUserQuestion 流程重寫 `/update` 步驟 4
  - 步驟 4a：偵測缺少的 Skills
  - 步驟 4b：詢問要安裝至哪些 AI 工具（multiSelect）
  - 步驟 4c：詢問安裝位置（project/user）
  - 步驟 4d-e：Commands 採用類似流程
  - 解決 AskUserQuestion 選項上限（最多 4 個）的限制

### 文件
- **Commands**：更新 `/config` 指令，加入 `--skills-location` 選項範例

## [3.5.1-beta.19] - 2026-01-19

### 修正
- **Skills**：使斜線指令與 CLI 行為同步
  - `/update`：新增已拒絕功能處理、過期 Skills 更新流程、專案／使用者層級選擇、核取方塊多選介面
  - `/init`：對齊步驟順序與 CLI 一致（AI Tools → Skills → Commands → ...）、擴充至 9 種 AI 工具、補上遺漏的設定步驟
  - `/config`：新增 skills/commands 設定類型、用於非互動安裝的 `--ai-tool` 選項、已拒絕功能處理
  - `/check`：新增互動模式文件、Skills/Commands 完整性檢查、移除已過時的手動驗證步驟

## [3.5.1-beta.18] - 2026-01-19

### 新增
- **CLI**：記住已拒絕的 Skills/Commands 選擇
  - manifest 中的新欄位 `declinedFeatures` 用於儲存已拒絕的項目
  - `uds update` 會在提示中排除先前已拒絕的 Skills/Commands
  - `uds configure` 會顯示已拒絕的項目，並提供重新安裝的選項
  - 同時獨立支援 Skills 與 Commands 的追蹤
- **CLI**：動態偵測 Marketplace 安裝狀態
  - `uds check` 無論 manifest 記錄為何，皆動態偵測 Marketplace Skills
  - `uds configure` 在 Skills 設定中顯示 Marketplace 狀態
  - `uds update` 為 Claude Code 顯示 "(already via Marketplace)" 提示
  - 偵測到 Marketplace 時，基於檔案的安裝預設為取消勾選
  - 新增並存說明：基於檔案的安裝與 Marketplace 可共存運作

## [3.5.1-beta.17] - 2026-01-18

### 新增
- **CLI**：`uds config` 指令新增智慧套用功能
  - 設定變更後自動提示重新產生整合檔案
  - 新增 `--yes` 旗標以支援非互動式設定變更
  - 從 update.js 擷取出 `regenerateIntegrations()` 作為可重用的函式
- **CLI**：E2E 測試規格自動同步機制
  - 新增 `npm run generate:e2e-spec` 指令稿，可從測試檔案產生 E2E-TEST-CASES.md
  - `--check` 模式供 CI 驗證規格是否為最新狀態
  - 解析測試檔案以擷取 describe/it 區塊與 CLI 選項
- **CLI**：強化 Skills、Commands 與 Integration 區塊的檔案追蹤系統
  - manifest 中新增 `skillHashes` 欄位，追蹤個別 skill 檔案的完整性
  - manifest 中新增 `commandHashes` 欄位，追蹤斜線指令檔案的完整性
  - 新增 `integrationBlockHashes` 欄位，將 UDS 標記區塊內容與使用者自訂內容分開追蹤
  - `uds check` 現在會驗證 Skills、Commands 以及 Integration UDS 區塊的完整性
  - 使用者可修改 UDS 標記之外的內容，而不會觸發警告
- **工具**：`hasher.js` 中新增雜湊計算函式
  - `computeIntegrationBlockHash()`：僅針對 UDS 標記區塊內容計算雜湊
  - `compareIntegrationBlockHash()`：比對區塊雜湊，偵測標記是否遭移除
  - `computeDirectoryHashes()`：遞迴計算目錄中所有檔案的雜湊
- **測試**：完整的 E2E 測試覆蓋
  - 涵蓋 6 個指令（init、config、check、update、list、skills）共 73 項 E2E 測試
  - 包含選項覆蓋率矩陣的 E2E-TEST-CASES.md 規格文件

### 變更
- **CLI**：Manifest 版本升級至 `3.3.0`，以標示強化版檔案追蹤功能
- **CLI**：`writeIntegrationFile()` 現在會回傳帶有 UDS 區塊雜湊的 `blockHashInfo`
- **CLI**：`installSkillsForAgent()` 與 `installCommandsForAgent()` 現在會回傳 `fileHashes`
- **CLI**：`installSkillsToMultipleAgents()` 與 `installCommandsToMultipleAgents()` 會在 `allFileHashes` 中彙整雜湊

### 修正
- **CLI**：整合檔案路徑現在回傳相對路徑，以維持 manifest 的一致性
- **CLI**：`uds check` 現在可正確追蹤所有已安裝的標準

## [3.5.1-beta.16] - 2026-01-16

### 新增
- **Commands**：為 `/check` 指令新增 Skills 驗證診斷
  - 顯示各個 AI 工具的實際目錄內容
  - 協助找出 Skills 安裝回報中的誤報
  - 將 `Bash(ls:*)` 加入 allowed-tools

### 修正
- **Commands**：`/update` 現在會顯示具體的版本類型（Alpha/Beta/RC）
  - 選項顯示「更新至 Beta」而非籠統的「更新至 Pre-release」
  - 說明中包含穩定度指示燈（🔴🟡🟢）

## [3.5.1-beta.15] - 2026-01-16

### 新增
- **Commands**：為 `/update` 指令新增預覽版本類型說明
  - 新章節說明 alpha、beta、rc 穩定度層級（🔴🟡🟢）
  - 包含版本比較：`alpha < beta < rc < stable`
  - 連結至 `core/versioning.md` 以取得詳細標準

## [3.5.1-beta.14] - 2026-01-16

### 修正
- **Commands**：`/update` 現在會在 AskUserQuestion 中顯示正確的版本類型
  - 穩定版顯示 "latest stable version X.Y.Z"
  - 預覽版顯示 "pre-release version X.Y.Z-tag.N"
  - 修正容易引起誤解的 "stable version 3.5.1-beta.13" 描述

## [3.5.1-beta.13] - 2026-01-16

### 變更
- **Commands**：斜線指令現在使用 `AskUserQuestion` 進行互動式提示
  - `/update` 步驟 4：詢問使用者選取 Skills/Commands 安裝選項
  - `/init` 步驟 3：詢問使用者選取要安裝 Skills/Commands 的 AI 工具
  - 設計原則：「CLI 提示應如實反映在斜線指令中」

### 新增
- **CLI**：`uds configure` 指令新增 `--ai-tool` 選項
  - 支援針對特定工具進行非互動式 Skills/Commands 安裝
  - 用法：`uds configure --type skills --ai-tool claude-code`
  - 支援：claude-code、opencode、copilot、gemini-cli、roo-code、cursor、windsurf、cline、codex

## [3.5.1-beta.12] - 2026-01-16

### 變更
- **Commands**：更新 `/update` 指令文件
  - 反映 CLI 在步驟 4 自動安裝 Skills/Commands 的行為
  - 將 `uds configure` 加入 allowed-tools 作為非 TTY 的後備方案
  - 記錄用於 AI 工具選取的核取方塊多選介面
  - 為非 TTY 環境提供 `uds configure` 指令

## [3.5.1-beta.11] - 2026-01-16

### 變更
- **CLI**：`check` 指令現在改為唯讀
  - 不再提示安裝缺少的 Skills/Commands
  - 顯示提示：「執行 `uds update` 以安裝缺少的 Skills/Commands」
  - 遵循單一職責原則：check 負責報告，update 負責安裝

### 移除
- **CLI**：從 `check` 指令中移除安裝提示
  - 移除 `promptSkillsCommandsInstallation()` 函式
  - 清理未使用的匯入

## [3.5.1-beta.10] - 2026-01-16

### 修正
- **Commands**：在 YAML frontmatter 中替 `argument-hint` 的值加上引號
  - 修正 OpenCode 與其他嚴格 YAML 解析器中的 YAML 解析錯誤
  - 值中的方括號現在已正確加上引號
  - 影響 16 個指令檔案
- **CLI**：在 check 指令顯示互動提示前加入 TTY 檢查
  - 防止出現「ERR_USE_AFTER_CLOSE: readline was closed」錯誤
  - Check 指令現在僅在 stdin/stdout 為 TTY 時才顯示提示
  - 修正從非互動環境（例如 Claude Code skills）執行時的崩潰問題

## [3.5.1-beta.9] - 2026-01-16

### 變更
- **CLI**：Skills/Commands 安裝現在改用核取方塊多選取代是／否提問
  - `uds update`：使用者現在可選取要為哪些特定 AI 工具安裝 Skills/Commands
  - `uds check`：在狀態顯示後新增針對缺少之 Skills/Commands 的安裝提示
  - 所有選項預設為勾選（選擇退出機制）
  - 提供跳過選項並附帶驗證

### 新增
- **i18n**：新增核取方塊提示的訊息索引鍵（英文、繁體中文與簡體中文）
  - `selectSkillsToInstall`、`selectCommandsToInstall`
  - `skipSkillsInstallation`、`skipCommandsInstallation`
  - `skipValidationError`

## [3.5.1-beta.8] - 2026-01-16

### 修正
- **CLI**：空的 skills 目錄不再被偵測為已安裝
  - `getInstalledSkillsInfoForAgent` 現在會檢查實際的 `SKILL.md` 檔案
  - `uds update` 步驟 4 正確提示為 OpenCode、GitHub Copilot 等安裝 Skills
  - 解決空的 `.claude/skills/`、`.github/skills/`、`.opencode/skills/` 目錄被錯誤回報為已安裝技能的問題

### 新增
- **測試**：新增 2 個用於空目錄偵測的單元測試
  - 測試空的 skills 目錄會回傳 `null`
  - 測試包含空子目錄的 skills 目錄會回傳 `null`

## [3.5.1-beta.7] - 2026-01-16

### 修正
- **CLI**：非互動模式（`--yes`）現在能正確將設定儲存至 manifest
  - `aiTools` 欄位現在會填入偵測到的 AI 工具（原為空的 `[]`）
  - `options` 欄位現在會儲存 workflow、merge strategy、commit language、test levels（原全為 `null`）
  - 為支援基於檔案之指令的 agent（opencode、copilot 等）自動安裝指令

### 新增
- **文件**：CLAUDE.md 中的 Testing Workflow 章節
  - 說明何時執行測試（開發、pre-commit、pre-PR、CI/CD）
  - 列出 git hook 自動化檢查
  - 提供手動測試指令參考
- **測試**：針對非互動模式錯誤修正新增 11 個測試
  - `init.test.js` 中的 8 個單元測試
  - `init-flow.test.js` 中的 3 個 E2E 測試

## [3.5.1-beta.6] - 2026-01-16

### 修正
- **CLI**：Skills 與 Commands 現在已正確打包於 npm 套件中
  - 將 `skills/` 加入 `prepack.mjs` 打包目錄中
  - `skills-installer.js` 現在會優先使用打包路徑而非開發路徑
  - 解決「Installed commands for X AI tools」顯示成功但目錄卻為空的問題
- **CLI**：在 update 指令中註冊 `--skills` 與 `--commands` 選項
  - 這些選項已在程式碼中實作，但未公開給使用者
  - `uds update --skills` 與 `uds update --commands` 現在能正常運作

## [3.5.1-beta.5] - 2026-01-16

### 變更
- **技能**：`/update` 斜線指令現在會提示安裝 Skills／Commands
  - 新增步驟 4，在更新後檢查是否已安裝 Skills／Commands
  - 使用 AskUserQuestion 提示使用者進行安裝
  - 確保與 CLI 互動模式的行為一致

## [3.5.1-beta.4] - 2026-01-16

### 新增
- **CLI**：更新期間的新功能偵測
  - `uds update` 現在會偵測 manifest 中尚未安裝 Skills／Commands 的 AI 工具
  - 互動模式會提示使用者安裝缺少的功能
  - `--yes` 模式會顯示提示而非自動安裝（保守行為）
  - 支援所有相容 Skills 的工具：Claude Code、OpenCode、Cursor、Copilot 等

## [3.5.1-beta.3] - 2026-01-16

### 修正
- **CLI**：npm 套件現在會打包標準檔案
  - 新增 `prepack` 腳本以打包 `core/` 與 `locales/` 目錄
  - 新的 `getSourcePath()` 函式優先使用打包檔案而非從 GitHub 下載
  - 解決透過 npm 安裝的 CLI 更新標準時發生的 404 錯誤
  - 改善檔案下載失敗時的錯誤訊息

## [3.5.1-beta.2] - 2026-01-16

### 新增
- **腳本**：發布前文件的同步檢查
  - 新的 `check-docs-sync.sh/.ps1` 腳本
  - 驗證 CHANGELOG.md 中包含目前版本的條目
  - 驗證 plugin.json、marketplace.json、README.md 中的版本同步
  - 為可能需要更新的文件提供提醒清單
  - 發布前檢查現在會執行 8 項檢查（使用 --skip-tests 則為 7 項）

### 移除
- **技能**：已棄用的安裝腳本
  - 移除 `skills/install.sh` 與 `install.ps1`
  - 移除 `scripts/check-install-scripts-sync.sh` 與 `.ps1`
  - 外掛市集（Plugin Marketplace）現為主要安裝方式

### 變更
- **文件**：更新所有文件以改用外掛市集安裝方式
  - 更新 README.md（en、zh-TW、zh-CN）
  - 更新所有採用指南與檢查清單
  - 更新 skills 的 README 檔案

## [3.5.1-beta.1] - 2026-01-15

### 新增
- **CLI**：多 Agent Skills 安裝
  - 支援同時將 Skills 安裝至多個 AI agent
  - 目標 agent 的核取方塊選取（Claude Code、OpenCode、Cline、Roo Code 等）
  - 針對每個 agent 提供使用者層級與專案層級的安裝路徑
- **CLI**：Gemini CLI TOML 指令轉換
  - 自動將 markdown 指令轉換為 Gemini CLI 的 TOML 格式
  - 支援指令引數的 `{{args}}` 佔位符
  - 正確的 TOML 字串跳脫
- **CLI**：斜線指令（Slash Commands）安裝
  - 將指令安裝至支援它們的 agent（OpenCode、Roo Code、Copilot、Gemini CLI）
  - `uds update --skills` 與 `uds update --commands` 選項
- **CLI**：集中式 AI Agent 路徑設定
  - 新的 `src/config/ai-agent-paths.js` 模組
  - 統一管理所有 10 個支援的 AI agent 路徑
- **測試**：完整的單元測試
  - `ai-agent-paths.test.js`（29 個測試）
  - `skills-installer.test.js`（23 個測試）
  - 總計：400 個測試通過

### 變更
- **文件**：更新 AI-AGENT-ROADMAP.md 至 v2.2.0
  - 在功能增強路線圖中新增多 Agent 安裝與 Gemini CLI TOML
- **文件**：更新 CLI-INIT-OPTIONS.md 至 v3.5.1
  - 新增多 agent Skills 安裝章節
  - 更新所有 agent 的 Skills 路徑表
- **文件**：更新 README.md
  - 新增包含 Skills 與 Commands 欄位的 AI 工具擴充套件表
  - 在「最新消息」（What's New）中新增多 Agent Skills 與 Gemini CLI TOML

## [3.5.0] - 2026-01-15

### 新增
- **i18n**：完整的國際化支援
  - 為所有 18 個核心標準、20 多個技能、採用指南提供簡體中文（zh-CN）在地化
  - CLI i18n：`--ui-lang` 選項（`en`、`zh-tw`、`zh-cn`、`auto`）
  - 全部 6 個 CLI 指令與 8 個互動式提示皆支援 3 種語言
  - 環境變數偵測（`LANG`、`LC_ALL`）
- **方法論系統** `[Experimental]`：開發方法論支援
  - 內建方法論：TDD、BDD、SDD、ATDD
  - 採用以 YAML 為基礎的定義，並具備 JSON Schema 驗證
  - `/methodology`、`/tdd`、`/bdd` 指令支援階段追蹤
  - `uds init` 與 `uds configure` 中的 CLI 整合（需要 `-E` 旗標）
- **CLI**：強化 AI 工具整合
  - 支援 9 種 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 內容模式選取：`full`、`index`（建議）、`minimal`
  - 自動產生標準合規指令（Standards Compliance Instructions）與標準索引（Standards Index）
- **CLI**：強化指令
  - `uds configure`：AI Tools、Adoption Level、Content Mode 選項
  - `uds update`：`--integrations-only`、`--standards-only`、`--sync-refs`、`--beta` 旗標
  - `uds check`：AI 工具整合狀態、參考同步狀態、Marketplace 技能版本偵測
  - `uds init/configure`：適用於實驗性功能的 `-E, --experimental` 旗標
- **技能**：用於標準設定的新 `/config` 斜線指令
- **技能**：適用於 `/init`、`/config`、`/update` 且具備 AskUserQuestion 的互動模式
- **核心**：新增 `ai-instruction-standards.md`（第 18 個核心標準）
- **文件**：所有採用指南皆支援 Windows PowerShell（33 個檔案）
- **文件**：完整的 CLI 初始化選項指南（`docs/CLI-INIT-OPTIONS.md`）
- **文件**：使用模式比較（`docs/USAGE-MODES-COMPARISON.md`）
- **文件**：`options/` 目錄的 18 個易讀 markdown 檔案
- **文件**：未來 10 種語言擴展的 LOCALIZATION-ROADMAP.md
- **腳本**：統一的發布前檢查（`scripts/pre-release-check.sh`）
- **腳本**：標準一致性檢查（`scripts/check-standards-sync.sh`）
- **腳本**：版本同步檢查（`scripts/check-version-sync.sh`）
- **CI**：GitHub Actions 發布工作流程中的發布前驗證

### 變更
- **CLI**：Manifest 版本升級至 3.2.0
  - 用於完整性檢查的新 `fileHashes` 欄位
  - 用於整合設定的新 `integrationConfigs` 欄位
- **CLI**：透過雙語支援改進互動式提示說明
- **CLI**：整合檔案預設使用 index 模式
- **技能**：斜線指令說明簡化為僅限英文
- **技能**：更新安裝腳本以納入 methodology-system（總計 16 個技能）

### 修正
- **CLI**：未追蹤檔案偵測中的 Windows 路徑分隔符號問題
- **CLI**：ES 模組（init.js）中的 `require()` 錯誤
- **CLI**：技能版本偵測顯示過舊版本
- **CLI**：`standards-registry.json` 中的版本不符
- **CLI**：缺少 AI 工具偵測（現在可偵測所有 9 種工具）
- **CLI**：緊湊格式（Compact format）中 `.ai.yaml` 檔案的登錄檔參考

### 移除
- **CLI**：從 `uds check` 中移除未追蹤檔案掃描

## [3.4.2] - 2026-01-08

### 修正
- **外掛**：同步所有設定檔中的版本號
  - `.claude-plugin/plugin.json`：3.3.0 → 3.4.2
  - `.claude-plugin/marketplace.json`：3.3.0 → 3.4.2
  - `.claude-plugin/README.md`：3.2.0 → 3.4.2
  - `adoption/standards-registry.json`：3.2.0 → 3.4.2
- **外掛**：修正 `adoption/standards-registry.json` 仍參照已棄用的 `universal-dev-skills` 儲存庫之問題
  - 現在正確指向主要儲存庫中的 `skills`

## [3.4.1] - 2026-01-08

### 修正
- **CLI**：修正 `uds update` 建議從較新版本降級的問題
  - 加入適當的語意化版本比較，並支援預先發布版本（alpha/beta/rc）
  - 現在能正確識別目前版本何時比登錄檔版本更新
  - 當使用者的版本比登錄檔更新時顯示告知訊息
- **CLI**：更新 `standards-registry.json` 版本以符合 package.json

## [3.4.0] - 2026-01-08

### 新增
- **CLI**：`uds check` 的雜湊基礎檔案完整性檢查
  - 透過比較 SHA-256 雜湊來偵測被修改的檔案
  - 新選項：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 互動模式：偵測到問題時提示採取動作（檢視 diff、還原、保留、略過）
  - 舊版 manifest 遷移：`uds check --migrate` 升級為基於雜湊的追蹤
- **CLI**：儲存於 manifest 中的檔案雜湊（版本 3.1.0）
  - `uds init` 在安裝時計算並儲存檔案雜湊
  - `uds update` 在更新檔案後重新計算雜湊
- **工具**：用於 SHA-256 檔案雜湊計算的新 `hasher.js` 工具模組

### 變更
- **CLI**：Manifest 版本從 3.0.0 升級至 3.1.0
  - 新的 `fileHashes` 欄位用於追蹤檔案完整性
  - 向後相容於舊版 manifest

### 修正
- **CLI**：修正 `uds check` 錯誤顯示「Skills marked as installed but not found」警告的問題
  - 現在能正確辨識外掛市集安裝路徑（`~/.claude/plugins/cache/`）
- **CLI**：修正 `uds update` 指令因「undefined」錯誤而失敗的問題
  - 為非同步的 `copyStandard()` 與 `copyIntegration()` 呼叫補上遺漏的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **Skills**：新增 9 個用於手動觸發工作流程的斜線指令
  - `/commit` - 產生 Conventional Commits 提交訊息
  - `/review` - 執行系統性程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰寫使用者故事與需求
  - `/sdd` - 建立規格文件
  - `/tdd` - 測試驅動開發工作流程
  - `/docs` - 建立／更新文件
  - `/coverage` - 分析測試覆蓋率
- **Core**：新增測試驅動開發（TDD）標準
  - 新增 `core/test-driven-development.md`，涵蓋紅-綠-重構循環
  - SDD + TDD 整合工作流程指引
- **Skills**：為 Claude Code 新增 `tdd-assistant` 技能（技能 #15）

### 變更
- **Skills**：將斜線指令格式從 `/uds:xxx` 簡化為 `/xxx`
  - 移除 `uds:` 命名空間前綴，以提供更簡潔的指令叫用
- **Plugin Marketplace**：將市集名稱從 `universal-dev-standards` 重新命名為 `asia-ostrich`
  - 新安裝指令：`/plugin install universal-dev-standards@asia-ostrich`

### 修正
- **CLI**：`uds skills` 現優先使用新的 `@asia-ostrich` 市集
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json

### 遷移
若您是透過舊的市集名稱安裝，請進行遷移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **Skills**：新增 9 個用於手動觸發工作流程的斜線指令
  - `/commit` - 產生 Conventional Commits 提交訊息
  - `/review` - 執行系統性程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰寫使用者故事與需求
  - `/sdd` - 建立規格文件
  - `/tdd` - 測試驅動開發工作流程
  - `/docs` - 建立／更新文件
  - `/coverage` - 分析測試覆蓋率
  - 指令 vs 技能：指令為手動觸發（`/command`），技能為自動觸發（依上下文而定）

### 修正
- **CLI**：`uds skills` 現優先使用新的 `@asia-ostrich` 市集
  - 偵測到舊版 `@universal-dev-standards` 市集時新增遷移提示
  - 確保遷移期間的相容性

## [3.3.0-beta.4] - 2026-01-07

### 變更
- **Plugin Marketplace**：將市集名稱從 `universal-dev-standards` 重新命名為 `asia-ostrich`
  - 新安裝指令：`/plugin install universal-dev-standards@asia-ostrich`
  - 這為 AsiaOstrich 組織提供更佳的品牌一致性

### 遷移
若您是透過舊的市集名稱安裝，請進行遷移：

```bash
# 1. Uninstall old version
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. Install new version
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修正
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json
  - 新增技能檔案清單與 TDD 的標準項目
  - `uds skills` 現能正確顯示 15/15 個技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **Core**：新增測試驅動開發（TDD）標準
  - 新增 `core/test-driven-development.md`，涵蓋紅-綠-重構循環、FIRST 原則、TDD vs BDD vs ATDD
  - SDD + TDD 整合工作流程指引
  - ML 測試邊界（模型準確度 vs 資料工程）
  - 老舊系統的 Golden Master 測試
- **Skills**：為 Claude Code 新增 `tdd-assistant` 技能（技能 #15）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 種語言範例（JS/TS、Python、C#、Go、Java、Ruby）
  - 所有 TDD 檔案均提供完整的 zh-TW 翻譯

### 變更
- **Core Standards**：更新相關標準中的交互參照
  - `spec-driven-development.md` - 新增 TDD 整合參照
  - `testing-standards.md` - 新增 TDD 交互參照
  - `test-completeness-dimensions.md` - 新增 TDD 交互參照
- **Release Workflow**：擴充發布前檢查清單，納入全面的檔案驗證
  - 新增涵蓋所有版本相關檔案的版本檔案檢查清單
  - 重新命名為文件驗證檢查清單，並附帶準確性驗證
  - 新增包含 grep 指令的內容準確性驗證區段
  - 所有語系檔案均使用 `locales/*` 模式

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 指令以列出已安裝的 Claude Code 技能
  - 顯示來自外掛市集、使用者層級與專案層級的安裝
  - 顯示每個安裝的版本、路徑與技能數量
  - 針對已棄用的手動安裝發出警告
- **CLI**：依據安裝位置改善 Skills 更新指示

### 棄用
- **Skills**：透過 `install.sh` / `install.ps1` 的手動安裝現已棄用
  - 建議：使用外掛市集進行自動更新
  - 指令稿將顯示棄用警告並提示確認
  - 將於未來的重大版本中移除

### 變更
- **CLI**：`uds update` 現針對手動 Skills 安裝顯示棄用警告
  - 建議遷移至外掛市集
- **Skills**：更新 README.md，將手動安裝標記為已棄用

### 修正
- **CLI**：將 standards-registry 版本更新至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：依據安裝位置改善 Skills 更新指示
  - 市集：引導透過外掛市集 UI 進行更新
  - 使用者層級：`cd ~/.claude/skills/... && git pull`
  - 專案層級：`cd .claude/skills/... && git pull`

### 修正
- **CLI**：將 standards-registry 版本更新至 3.2.2
  - 使 `uds update` 能為既有專案偵測新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **Skills**：新增發布工作流程指南，提供完整的發布流程
  - 新增 `skills/release-standards/release-workflow.md`，提供逐步發布指示
  - 涵蓋 beta、alpha、rc 與 stable 發布工作流程
  - 包含 npm dist-tag 策略、疑難排解與 AI 助理指引
  - 在 CLAUDE.md 中為 AI 助理新增發布流程區段
- **CLI**：在 AI 工具整合中新增對話語言設定
  - 所有 AI 工具整合檔案現均包含對話語言指示
  - 支援英文、繁體中文與雙語模式
  - 為 Claude Code 使用者產生帶有語言設定的 CLAUDE.md
- **CLI**：為 prompts 與 utils 模組新增全面的測試
  - 測試覆蓋率從 42.78% 提升至 72.7%
  - 測試總數從 94 增加至 210

### 修正
- **CLI**：僅在 Claude Code 為唯一選取的 AI 工具時提示 Skills
  - 修正當選取多個帶有 Skills 的 AI 工具時，可能導致其他工具遺漏完整標準的錯誤
- **CI/CD**：修正 npm publish 工作流程，以正確標記 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中新增自動版本偵測
  - Beta 版本現以 `@beta` 標籤發布，而非 `@latest`
  - 使用者現在可以使用 `npm install -g universal-dev-standards@beta` 安裝 beta 版本

### 變更
- **Core Standards**：在 5 份核心文件中新增業界參考標準
  - `error-code-standards.md` v1.0.0 → v1.1.0：RFC 7807、RFC 9457、HTTP 狀態碼
  - `logging-standards.md` v1.0.0 → v1.1.0：OWASP Logging、RFC 5424、OpenTelemetry、12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0：SWEBOK v4.0 第 10 章（軟體品質）
  - `checkin-standards.md` v1.2.5 → v1.3.0：SWEBOK v4.0 第 6 章（組態管理）
  - `spec-driven-development.md` v1.1.0 → v1.2.0：IEEE 830-1998、SWEBOK v4.0 第 1 章（需求）
- **Testing Standards**：新增 SWEBOK v4.0 參照與新章節
  - `testing-standards.md` v2.0.0 → v2.1.0：測試基礎、測試相關度量、成對測試／資料流測試
- **Documentation**：更新 MAINTENANCE.md，新增 npm dist-tag 策略
  - 新增不同版本模式的 dist-tag 表格
  - 新增手動標籤更正指令

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：在 Skills 安裝流程中新增外掛市集支援
  - Skills 安裝提示中新增「外掛市集（推薦）」選項
  - CLI 在 manifest 中追蹤市集安裝的 Skills，而不嘗試本機安裝
  - `uds check` 指令現能顯示市集安裝狀態

### 修正
- **CLI**：修正標準登錄檔中的萬用字元路徑處理導致 404 錯誤的問題
  - 將 `templates/requirement-*.md` 萬用字元替換為明確的檔案路徑
  - 為 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明確條目
- **CLI**：修正執行 `uds init`、`uds configure` 與 `uds update` 指令後程序停滯的問題
  - 新增明確的 `process.exit(0)`，以防止 inquirer readline 介面阻礙程式結束

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code Plugin Marketplace Support**：支援透過外掛市集進行發布
  - 新增 `.claude-plugin/plugin.json` - 包含中繼資料的外掛 manifest
  - 新增 `.claude-plugin/marketplace.json` - 用於外掛發布的市集設定
  - 新增 `.claude-plugin/README.md` - 外掛文件與維護指南
  - 更新 `skills/README.md`，新增方法 1：市集安裝（推薦）

### 效益
- 使用者只需單一指令即可安裝所有 14 個技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 發布新版本時自動更新
- 透過 Claude Code 市集提供更好的探索性
- 維持與指令稿安裝（方法 2 與 3）的回溯相容性

### 變更
- 在供 AI 助理使用的 `CLAUDE.md` 中新增對話語言要求（繁體中文）

### 修正
- 修正 CLI 版本讀取，改用 `package.json` 而非寫死的值

## [3.1.0] - 2025-12-30

### 新增
- **簡體中文（zh-CN）翻譯**：為簡體中文使用者提供完整的在地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻譯
  - 新增 `locales/zh-CN/CLAUDE.md` - 專案指引翻譯
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻譯
- 在所有 README 版本（EN、zh-TW、zh-CN）中新增語言切換連結

- **完整 Windows 支援**：為 Windows 使用者提供完整的跨平台相容性
  - 新增 `.gitattributes` 以實現跨平台一致的換行符號
  - 新增 `scripts/check-translation-sync.ps1` - 翻譯檢查工具的 PowerShell 版本
  - 新增 `skills/install.ps1` - 技能安裝程式的 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 設定腳本
  - 新增 `docs/WINDOWS-GUIDE.md` - 全面的 Windows 開發指南
- **5 個全新 Claude Code 技能**：將技能庫從 9 個擴充至 14 個技能
  - `spec-driven-dev` - SDD 工作流程指引（觸發詞：spec、proposal）
  - `test-coverage-assistant` - 7 維度測試完整性框架（觸發詞：test coverage、dimensions）
  - `changelog-guide` - 變更日誌撰寫標準（觸發詞：changelog、release notes）
  - `error-code-guide` - 錯誤碼設計模式（觸發詞：error code）
  - `logging-guide` - 結構化日誌標準（觸發詞：logging、log level）
- 在 `STATIC-DYNAMIC-GUIDE.md` 中新增**混合標準**（Hybrid Standards）分類——兼具靜態與動態元件的標準
- 在 `MAINTENANCE.md` 中新增**動態 vs 靜態分類**章節——標準分類指引
- 將 `checkin-standards` 核心規則作為靜態標準新增至 `CLAUDE.md`
- 為所有 5 個新技能新增完整的 zh-TW 翻譯（共 10 個檔案）

### 變更
- 更新 `cli/package.json` 的 prepare 腳本以使用跨平台的 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md`，加入 Windows 安裝說明
- 更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入混合標準概念，更新至 14 個技能
- 更新 `MAINTENANCE.md` - 新增對 `STATIC-DYNAMIC-GUIDE.md` 的交互參照，以分類檢查清單擴充工作流程 4
- 更新 `MAINTENANCE.md` 中的技能表，從 9 個增加至 14 個技能（35 個技能檔 + 10 個共用/README = 45 個檔案）
- 同步 `MAINTENANCE.md` 與 `STATIC-DYNAMIC-GUIDE.md` 的 zh-TW 翻譯

## [3.0.0] - 2025-12-30

### 新增
- **AI 最佳化標準架構**：新增對 `.ai.yaml` 檔案的雙格式支援
- 新增 `ai/standards/` 目錄，包含 15 個 AI 最佳化標準檔案
- 新增 `ai/options/` 目錄，包含特定語言與工作流程選項
- 新增 `MAINTENANCE.md` - 附有檔案結構概觀的專案維護指南
- 新增 `ai/MAINTENANCE.md` - AI 標準維護工作流程指南
- 新增 `STANDARDS-MAPPING.md` - 標準對應至技能的矩陣
- 新增 6 個全新 AI 最佳化標準：
  - `anti-hallucination.ai.yaml` - AI 協作標準
  - `checkin-standards.ai.yaml` - 程式碼簽入標準
  - `documentation-writing-standards.ai.yaml` - 文件撰寫指南
  - `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7 維度測試框架
  - `versioning.ai.yaml` - 語意化版本標準
- 為所有新標準與技能新增完整的 zh-TW 翻譯（共 78 個檔案）

### 變更
- 將核心標準中的版本格式統一為 `**Version**: x.x.x`
- 在所有 zh-TW 翻譯的 YAML front matter 中新增 `source` 欄位以進行同步追蹤
- 更新翻譯同步腳本，提供更完善的驗證

### 修正
- 修正 `core/error-code-standards.md` 與 `core/logging-standards.md` 中的版本格式不一致問題
- 修正 zh-TW 技能翻譯中的來源路徑

## [2.3.0] - 2025-12-25

### 新增
- **多語言支援**：新增用於國際化的 `locales/` 目錄結構
- 為所有文件新增繁體中文（zh-TW）翻譯（44 個檔案）
  - `locales/zh-TW/core/` - 13 個核心標準翻譯
  - `locales/zh-TW/skills/` - 25 個技能檔案翻譯
  - `locales/zh-TW/adoption/` - 5 個採用指南翻譯
  - `locales/zh-TW/README.md` - 完整中文 README
- 為所有英文文件檔案新增語言切換器
- 新增 `scripts/check-translation-sync.sh` - 翻譯同步檢查工具
- 在技能文件中新增靜態 vs 動態標準分類
- 新增 `templates/CLAUDE.md.template` - 靜態標準的隨用範本
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 詳細分類指南

### 變更
- 將雙語內容拆分為專屬的語言檔案（為 AI 工具節省約 50% token）
- 英文版本現在僅包含純英文內容並附帶語言切換器
- 更新 `skills/README.md` - 新增靜態 vs 動態章節以及觸發關鍵字

## [2.2.0] - 2025-12-24

### 新增
- 為所有技能文件新增標準章節（23 個檔案）
  - 8 個 SKILL.md 檔案：新增 Purpose、Related Standards、Version History、License 章節
  - 15 個支援文件：新增雙語標題、中繼資料與標準章節

### 變更
- 將技能文件格式與核心標準對齊
- 在技能與核心文件之間新增交互參照

## [2.1.0] - 2025-12-24

### 新增
- **整合技能**：將 `universal-dev-skills` 合併至 `skills/` 目錄
- 新增 `skills/` - 所有 Claude Code 技能現已包含在主儲存庫中
- 新增 `skills/_shared/` - 支援多 AI 工具的共用範本
- 為未來的 AI 工具新增預留位置目錄：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 變更
- CLI 現在從本機 `skills/` 安裝技能，不再從遠端儲存庫擷取
- 更新 `standards-registry.json` 以反映整合技能架構

### 遷移指南
- 若您先前單獨使用 `universal-dev-skills`，現在可以使用本儲存庫中隨附的技能
- 執行 `cd skills && ./install.sh` 從整合位置重新安裝技能

## [2.0.0] - 2025-12-24

### 變更

**重大變更**：專案名稱從 `universal-doc-standards` 改為 `universal-dev-standards`

這反映了專案範圍的擴充，涵蓋所有開發標準，而不僅限於文件。

#### 遷移指南

- 從新儲存庫重新複製：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 若使用全域安裝，請在 CLI 目錄中重新執行 `npm link`
- 使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- `uds` 指令保持不變

### 新增
- 新增 `extensions/languages/php-style.md` - 基於 PSR-12 的 PHP 8.1+ 程式碼風格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 開發模式

## [1.3.1] - 2025-12-19

### 新增
- 在 `testing-standards.md` 中新增 Mock 限制章節——需要整合測試時的 Mock 指引
- 在 `testing-standards.md` 中新增測試資料管理模式——明確識別碼與複合鍵指引
- 在 `testing-standards.md` 中新增「何時需要整合測試」表格——需要整合測試的 6 種情境

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 全面的變更日誌撰寫指南
- 在 `git-workflow.md` 中新增決策樹與選擇矩陣，用於工作流程策略選擇
- 在 `commit-message-guide.md` 中新增語言選擇指南，用於選擇 commit 訊息語言

### 變更
- 更新 `versioning.md` - 新增對 changelog-standards.md 的交互參照
- 更新 `git-workflow.md` - 在發布準備中新增 CHANGELOG 更新指引
- 更新 `zh-tw.md` - 新增變更日誌（Changelog）、發布說明（Release Notes）、重大變更（Breaking Change）、棄用（Deprecate）、語意化版本（Semantic Versioning）等術語
- 更新 `changelog-standards.md` - 將排除規則與 versioning.md 對齊，新增交互參照
- 更新 `checkin-standards.md` - 釐清 CHANGELOG 更新僅適用於使用者可見的變更
- 更新 `code-review-checklist.md` - 將 CHANGELOG 章節與 changelog-standards.md 對齊

### 修正
- 修正 `commit-message-guide.md` 與 `documentation-writing-standards.md` 中標頭格式不一致的問題
- 將交互參照標準化為使用 markdown 連結格式而非反引號

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 專案目錄慣例
- 在 `documentation-structure.md` 中新增實體 DFD 層

### 變更
- 更新 `documentation-structure.md` - 釐清流程/圖表分離，改進檔案命名慣例
- 更新 `checkin-standards.md` - 新增目錄整潔指引
- 以通用預留位置取代特定專案範例，提升通用性

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 全面的測試金字塔（UT/IT/ST/E2E）
- 新增 `documentation-writing-standards.md` - 文件內容需求

### 變更
- 更新 `anti-hallucination.md` - 強化來源歸屬指引
- 更新 `zh-tw.md` - 與 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### 新增
- 核心標準初始發布
- 核心標準：`anti-hallucination.md`、`checkin-standards.md`、`commit-message-guide.md`、`git-workflow.md`、`code-review-checklist.md`、`versioning.md`、`documentation-structure.md`
- 擴充：`csharp-style.md`、`zh-tw.md`
- 範本：需求文件範本
- 整合：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v6.0.0...HEAD
[6.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.17.0...v6.0.0
[5.7.2]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...v5.7.2
[5.7.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[4.3.0-alpha.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.2.0...v4.3.0-alpha.1
[4.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.5.0...v4.0.0
[3.5.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
