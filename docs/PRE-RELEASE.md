# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.6`

> **New in 6.14.0-beta.6** — the fixes from the Windows report on beta.5 (a .NET project): `uds run` reads `uds.project.yaml` as YAML, so a trailing comment is no longer part of the command; `uds simulate -s commit-message` judges in-process (no `npx`, no network) and tells "fails" from "no verdict"; `uds skills` lists every installed skill (56 of 56, not 27 of 30); `uds update` drops names UDS cannot vouch for from the manifest; `uds spec list` reads SDD headers instead of calling every spec a draft; `uds deps --if-present`; and every `uds update` backup now goes into one folder, `.uds-backups/`.
> **6.14.0-beta.6 新增** — beta.5 Windows 回報（.NET 專案）的修正：`uds run` 以 YAML 解析 `uds.project.yaml`，行尾註解不再成為指令的一部分；`uds simulate -s commit-message` 在程式內判定（不呼叫 `npx`、不連網），並分得出「不合規」與「沒有結論」；`uds skills` 列出全部已安裝技能（56／56，不再是 27／30）；`uds update` 會從 manifest 移除 UDS 無法擔保的名稱；`uds spec list` 讀 SDD 標頭，不再把每份規格都叫草稿；`uds deps --if-present`；所有 `uds update` 備份集中到單一 `.uds-backups/` 資料夾。

**Behavior changes — read this first.**
- `uds simulate`: a standard that cannot be simulated now exits **2** (it was 1); **1** means the input failed the standard. A script that treated any non-zero as "failed" needs to tell the two apart.
- `uds update` now removes from `.standards/manifest.json` the skill and command names UDS does not ship, or whose folder is no longer on disk (`skills.names`, `commands.names`).
- Backups moved: new ones go to `.uds-backups/<time>-<n>/`. Old `.uds-backup-*` folders in the project root are left where they are, but `--rollback` and the "keep the latest 5" limit count both places. Tools that do not read git (an indexer, an IDE search) should exclude `.uds-backups`; git already ignores it.
- In `uds.project.yaml`, a double-quoted value now follows YAML: a backslash is an escape character, so `"C:\proj"` is an error — use single quotes or no quotes.

**行為改變，請先讀。**
- `uds simulate`：不可模擬的標準現在以 **2** 結束（原本是 1）；**1** 代表輸入不合規。把任何非 0 都當失敗的腳本需要分開處理。
- `uds update` 會從 `.standards/manifest.json` 移除 UDS 不出貨、或資料夾已不在磁碟上的技能與命令名稱（`skills.names`、`commands.names`）。
- 備份位置改變：新備份放在 `.uds-backups/<時間>-<n>/`。專案根目錄舊的 `.uds-backup-*` 不搬動，但 `--rollback` 與「保留最近 5 份」兩處合計。不看 git 的工具（索引器、IDE 搜尋）請排除 `.uds-backups`；git 本來就會忽略它。
- `uds.project.yaml` 內雙引號的值現在依 YAML 解析：反斜線是跳脫字元，`"C:\proj"` 會報錯，請改用單引號或不加引號。

Everything in 6.14.0-beta.5 is still here (one `--rollback` undoes apply, skills and commands; `check` counts missing skill and command files; `audit --offline`; `check --diff` against the installed package; the commit-time warnings).
6.14.0-beta.5 的內容都還在（一次 `--rollback` 還原三步；`check` 計入技能與命令檔遺失；`audit --offline`；`check --diff` 以所裝套件為原稿；提交時的警告）。

### What to test | 請幫忙測什麼（Windows 優先）

1. **`uds simulate` exit codes — the one beta.5 report item we could not reproduce.** On Windows, run `uds simulate -s anti-hallucination -i "test"` and `uds simulate -s commit-message -i "feat(api): add dept endpoint"`, then `uds simulate -s commit-message -i "add new dept api"`, and print the exit code after each (`echo $?` in Git Bash). Expected: 2, 0, 1. If the first one prints "Simulation Failed" and exits 0 here, that is the bug — please send the command line and the output.
   在 Windows 上依序執行上面三行並印出結束碼（Git Bash 用 `echo $?`）。預期是 2、0、1。若第一行印「Simulation Failed」卻以 0 結束，那就是上次回報的問題——請貼出指令與輸出。
2. **`uds run` with a trailing comment** in `uds.project.yaml` (`test: dotnet test X.csproj  # 90 tests pass`): `uds run test --dry-run` should show the command without the comment, and `uds run test` should run it. This is the case where `cmd.exe` would have passed the `#` to the program.
   `uds.project.yaml` 的指令帶行尾註解時，`uds run test --dry-run` 不應顯示註解，`uds run test` 應能執行。
3. **`uds skills`** in a project with all 56 skills: it should list 56 of 56 and say how many skill files `uds check` tracks (116).
   裝了 56 個技能的專案：`uds skills` 應列出 56／56，並說明 `uds check` 追蹤的技能檔數（116）。
4. **`uds update --apply --yes --skills --offline`** on a project that still has ghost names: afterwards `.standards/manifest.json` `skills.names` should list only skills that exist on disk. Then look at the project root: backups should be in one `.uds-backups/` folder, and `git status` should not list it.
   在仍有幽靈名稱的專案執行後，`manifest.json` 的 `skills.names` 只應剩磁碟上存在的技能；專案根目錄的備份應只有一個 `.uds-backups/`，`git status` 不應列出它。
5. **`uds spec list`** on a project whose `specs/` holds SDD specs with a status table: it should show the real status and title, or "format: SDD (status not parsed)" — never `draft` with an empty title.
   `specs/` 有 SDD 規格的專案：應顯示真實狀態與標題，或「格式：SDD（狀態未解析）」，不應是空標題的 draft。
6. **`uds deps`** in a project with no `package.json`: still exits 1; **`uds deps --if-present`** exits 0 and says nothing was checked.
   沒有 `package.json` 的專案：`uds deps` 仍以 1 結束；`uds deps --if-present` 以 0 結束並說明沒有檢查任何東西。
7. **Still open from beta.5** — `--rollback` after the three `--apply` steps on a real project, the commit-time warnings under git-bash, a 繁體中文 Windows (cp950) console.
   beta.5 尚未測的項目：真實專案上三種 `--apply` 之後的 `--rollback`、git-bash 下的提交時警告、cp950 主控台。

Report anything wrong as a GitHub issue. | 有問題請開 GitHub issue。

### Known limitations | 已知限制

- **None of the beta.6 fixes has run on Windows.** CI's Windows job runs the unit suite only; the end-to-end tests run on Linux and macOS, and the tests that need a POSIX shell show as skipped on Windows.
  **beta.6 的修正都沒有在 Windows 上實際跑過。**CI 的 Windows 工作只跑單元測試；端對端測試在 Linux 與 macOS 跑，需要 POSIX shell 的測試在 Windows 上顯示為略過。
- **The `simulate` "failed but exit 0" report is not claimed fixed.** It could not be reproduced on macOS (terminal, pipe, update-notice hook on: always 1); the exit code is now three-valued and pinned by tests that start a real process.
  **`simulate`「失敗卻以 0 結束」的回報不宣稱已修。**在 macOS 重現不出來；結束碼已分成三種並用真行程測試固定。
- **The command-line path of `simulate` has no Windows test** (`%VAR%` expansion); only `commit-message` ships a simulator.
  `simulate` 委派外部工具的路徑沒有 Windows 測試（`%VAR%` 展開）；目前只有 `commit-message` 帶模擬器。
- **`commit-message` asks for a subject of at most 72 characters**, and UDS's own bilingual commit headers often exceed it, so judging UDS's own messages reports them as non-compliant. That is a contradiction inside the standard, not fixed here.
  `commit-message` 標準要求主旨 ≤72 字元，而 UDS 自己的雙語提交標頭常超過，所以拿 UDS 自己的訊息來判會被報不合規。這是標準本身的矛盾，這次沒動。
- **`uds spec show`, `confirm` and `archive` still rewrite an SDD spec with the micro-spec template.** Only `uds spec list` reads SDD headers now. Do not run those three on an SDD spec.
  `uds spec show`、`confirm`、`archive` 仍會用微規格模板整份改寫 SDD 規格；目前只有 `list` 讀得懂 SDD 標頭。請不要對 SDD 規格執行這三個指令。
- **Skills install path is undecided**: `uds skills` still says manual installation is deprecated while `check` and `update` recommend `uds update --skills`. The plugin marketplace is Claude Code only, English only, and follows stable releases only (6.13.1). Settled on `main` after this beta: the project way is the main path and `uds skills` no longer says deprecated (CHANGELOG, Unreleased; XSPEC-462).
  技能安裝的建議路徑尚未決定：`uds skills` 仍說手動安裝已棄用，而 `check`、`update` 建議 `uds update --skills`。外掛市集只支援 Claude Code、只有英文、只跟正式版（6.13.1）。此測試版之後已在 `main` 定案：主要路徑是裝進專案，`uds skills` 不再說已棄用（變更日誌 Unreleased；XSPEC-462）。
- From earlier betas: plain `uds check` (without `--ci`) still exits 0 when it reports problems; `--rollback` chains up to 5 backups and a hand edit to `.standards/manifest.json` breaks the chain; the scanners read text and do not run your tests; a project installed by an older UDS has no install records, so `uds uninstall` keeps what it cannot prove is UDS's.
  先前測試版的限制仍在：不帶 `--ci` 的 `uds check` 回報問題時仍以 0 結束；`--rollback` 最多串 5 份、手改 manifest 會讓串斷；掃描讀文字、不執行你的測試；舊版安裝的專案沒有安裝紀錄，`uds uninstall` 會保留無法證明的檔。


---

## Installation | 安裝方式

```bash
# Install the current beta
npm install -g universal-dev-standards@beta
```

### Version Tags | 版本標籤

| Tag | Purpose | 說明 |
| :--- | :--- | :--- |
| `@latest` | Production release | 正式穩定版 |
| `@beta` | Public testing | 公開測試，可能有問題 |

> ⚠️ **If `@beta` is older than `@latest`, there is no beta in progress — use `@latest`.**
> A tag keeps pointing at the last version published to it; it does not move back when a stable release ships.
> Check with `npm view universal-dev-standards dist-tags`.
>
> ⚠️ **若 `@beta` 的版本號比 `@latest` 舊，代表目前沒有進行中的測試版，請改用 `@latest`。**
> 標籤會一直指向最後一次發到它上面的版本，正式版發佈時不會自動收回。
>（2026-09-25 查證：`@beta` 當時仍指向半年前的 `5.1.0-beta.7`，比正式版 `6.12.0` 舊；`@rc` 指向 `5.0.0-rc.17`。）

---

## Checking Your Version | 確認版本

```bash
uds --version
npm view universal-dev-standards dist-tags
```

---

## Going back to stable | 退回正式版

```bash
npm install -g universal-dev-standards@latest
uds update        # re-apply the stable standards to your project | 把正式版標準重新套回專案
```

**From 6.13.0-beta.2**, `uds uninstall` removes the UDS hook entries from `.claude/settings.json`, `.codex/hooks.json` and `.gemini/settings.json` itself (run it before or after switching back to `@latest` — either order works). **On 6.13.0-beta.1**, remove them by hand: delete the UDS `check-turn-completion-codex` entry under `hooks.Stop` in `.codex/hooks.json`, and the `check-turn-completion-gemini` entry under `hooks.AfterAgent` in `.gemini/settings.json` (leave your other settings in those files alone).
**從 6.13.0-beta.2 起**，`uds uninstall` 會自行移除 `.claude/settings.json`、`.codex/hooks.json`、`.gemini/settings.json` 裡 UDS 寫入的關卡項目（在切回 `@latest` 之前或之後執行都可以）。**若你裝的是 6.13.0-beta.1**，請手動移除：刪掉 `.codex/hooks.json` 裡 `hooks.Stop` 下的 `check-turn-completion-codex` 項目，以及 `.gemini/settings.json` 裡 `hooks.AfterAgent` 下的 `check-turn-completion-gemini` 項目（檔案裡你自己的其他設定不要動）。

---

## Reporting Issues | 回報問題

Please report at [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues) with `[beta]` at the start of the title, and include:
請在 GitHub Issues 回報，標題開頭加上 `[beta]`，並附上：

- `uds --version`
- Which AI tool and version (Claude Code / Codex / Gemini CLI) | 使用哪個 AI 工具與版本
- Steps to reproduce, expected vs actual | 重現步驟、預期與實際結果
- For a false block or a missed block: the last assistant message (redact anything private) | 誤擋或漏擋時，附上 AI 的最後一則訊息（先遮掉私人內容）
