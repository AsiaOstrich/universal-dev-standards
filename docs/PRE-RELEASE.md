# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.5`

> **New in 6.14.0-beta.5** — the fixes from the Windows report on beta.4 (one `--rollback` undoes the whole upgrade; `check` no longer says "compliant" over missing skill or command files; `audit --offline`; the command count is no longer printed as a tool count), `check --diff` compares against the package you installed instead of GitHub `main`, and two new commit-time warnings: fake tests and stubs, and code changed with no test changed.
> **6.14.0-beta.5 新增** — beta.4 Windows 回報的修正（一次 `--rollback` 還原整個升級；技能或命令檔遺失時 `check` 不再說「符合標準」；`audit --offline`；命令數不再印成工具數）；`check --diff` 改以所裝套件為原稿，不再抓 GitHub `main`；以及兩個提交時的警告：假測試與空殼、改了程式卻沒動測試。

**Behavior changes — read this first.**
- `uds check` counts a missing or edited skill or command file against its verdict; `uds check --ci` exits 1 for it. Old records UDS cannot vouch for (left by earlier installers) are ignored by `check` and removed by `uds update`, so an existing project does not turn red for them.
- `uds check --diff` shows what **you** changed relative to the installed package. To see what changed upstream, use `uds update --plan`.
- `uds init` (and `uds update -y`) writes two scanner scripts into `scripts/`. They only **warn** at commit time; set `"mode": "block"` in `.standards/test-policy.json` to make them block.

**行為改變，請先讀。**
- 技能或命令檔遺失、被改時，`uds check` 會計入判定，`uds check --ci` 以 1 結束。舊版安裝器留下、UDS 無法擔保的舊紀錄，`check` 會忽略、`uds update` 會清除，既有專案不會因此變紅。
- `uds check --diff` 顯示的是**你**相對於所裝套件改了什麼；要看上游改了什麼，用 `uds update --plan`。
- `uds init`（以及 `uds update -y`）會在 `scripts/` 寫入兩支掃描腳本。提交時只**警告**；在 `.standards/test-policy.json` 設 `"mode": "block"` 才會擋。

Everything in 6.14.0-beta.4 is still here (`extensions/` in the package, `zh-cn` install, `/comprehend`, Rule 12, the checks that can now fail).
6.14.0-beta.4 的內容都還在（`extensions/` 打包進套件、簡中安裝、`/comprehend`、第 12 條、那三個現在會失敗的檢查）。

### What to test | 請幫忙測什麼（Windows 優先）

1. **Re-run your beta.4 report steps** on a copy of the project: `update --apply --yes --offline`, `update --apply --yes --skills --offline`, `update --apply --yes --commands --offline`, then `update --rollback --yes`, then `check --offline`. Every UDS-managed file should match the pre-upgrade copy, the new `comprehension-ladder` folders should be gone, and `check` should pass.
   在專案副本上重跑 beta.4 回報的步驟：三種 `--apply` 之後 `--rollback`，再 `check`。所有 UDS 管理的檔應與升級前相同，新增的 `comprehension-ladder` 資料夾應消失，`check` 應通過。
2. **The 26 "missing" entries** — run `uds check --offline` on the real project (read-only): it should say how many old records it ignored and not list them as missing. Then on a copy, `uds update --apply --yes --offline` and `check` again: the records should be gone from the manifest.
   在真專案唯讀執行 `uds check --offline`：應說明忽略了幾筆舊紀錄，不再列為遺失。再在副本上 `update --apply` 後 `check`，那些紀錄應從 manifest 消失。
3. **`uds audit --offline`** with the network off, and `uds update --apply --yes --commands --offline` — the message should say 1 tool and N commands.
   斷網執行 `uds audit --offline`；`update --commands` 的訊息應是「1 個工具、N 個命令」。
4. **`uds check --diff`** with the network off, after editing one standard file: it should show only your edit and name the installed version as the baseline.
   斷網、改一個標準檔後執行 `uds check --diff`：只顯示你的修改，並寫出比對基準是所裝版本。
5. **The commit-time warnings** — commit a test with no assertion, and a code change with no test change: both should be warned about by name, and the commit should go through.
   提交一支沒有斷言的測試、以及只改程式沒改測試的變更：兩者都應被點名警告，且提交照常完成。
6. **Still open from beta.4** — `/comprehend`, offline install of `zh-tw`/`zh-cn`, `--locale zh-CN` and `fr`, the pre-commit block under git-bash, a cp950 console.
   beta.4 尚未測的項目：`/comprehend`、斷網安裝繁中／簡中、`zh-CN` 與 `fr`、git-bash 下的提交前檢查、cp950 主控台。

Report anything wrong as a GitHub issue. | 有問題請開 GitHub issue。

### Known limitations | 已知限制

- **None of the beta.5 fixes has run on Windows.** CI's Windows job runs the unit suite only; the new end-to-end tests run on Linux, and the commit-warning tests show as skipped on Windows.
  **beta.5 的修正都沒有在 Windows 上實際跑過。**CI 的 Windows 工作只跑單元測試；新的端對端測試在 Linux 跑，提交警告的測試在 Windows 上顯示為略過。
- **Plain `uds check` (without `--ci`) still exits 0** when it reports problems, as it does for every other kind of problem; so the pre-commit hook, which runs plain `uds check`, does not block on missing skill or command files.
  **不帶 `--ci` 的 `uds check` 回報問題時仍以 0 結束**，與其他問題一致；所以跑一般 `uds check` 的提交前檢查不會因技能或命令檔遺失而擋下。
- **`--rollback` chains up to 5 backups** and only across steps whose manifests line up; a hand edit to `.standards/manifest.json` between steps breaks the chain, and rollback then says how many older backups it left. Plain `uds update` (without `--apply`) still makes no backup. User-level skills and commands are not backed up and are listed as "Not restored".
  `--rollback` 最多串 5 份備份，中間手改 `.standards/manifest.json` 會讓串斷，此時會說明剩下幾份。不帶 `--apply` 的 `uds update` 仍不備份；使用者層級的技能與命令不備份，會列在「Not restored」。
- **The scanners read text; they do not run your tests.** A smoke test whose only check is "does not throw" is reported as having no assertion. They walk the whole project when nothing is staged (up to 200,000 files, 120 s each).
  掃描是讀文字，不執行測試；只檢查「不拋例外」的冒煙測試會被報成沒有斷言。沒有暫存檔時會掃整個專案（上限 20 萬檔、各 120 秒）。
- **`check --diff` after upgrading only the CLI** (without `uds update`) compares against the newer package, so UDS's own changes between the two versions show as differences; it warns in yellow and names both versions.
  只升級 CLI、沒跑 `uds update` 時，`check --diff` 以新版套件為基準，兩版間 UDS 自己的改動會顯示為差異；會以黃字點名兩個版本。
- From earlier betas: a project installed by an older UDS has no install records, so `uds uninstall` keeps what it cannot prove is UDS's; the pre-commit block blocks the commit when the UDS CLI is not installed; agy is verified only for single tool-free `-p` turns; the turn-completion hook works only in English and 繁體中文 and does not cover Cursor.
  先前測試版的限制仍在：舊版安裝的專案沒有安裝紀錄，`uds uninstall` 會保留無法證明的檔；沒裝 CLI 時提交前檢查會擋下；agy 只驗證過單輪無工具回合；回合收尾關卡只支援英文與繁中，不含 Cursor。


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
