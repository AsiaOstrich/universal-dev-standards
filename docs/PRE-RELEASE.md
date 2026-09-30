# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.3`

> **New in 6.14.0-beta.3** — a security fix to the pre-commit hook `uds init` writes (it no longer lets `npx` ask npm for a package named `uds`, which is not this project), a rewritten `uds uninstall` that removes only what it can prove UDS wrote, and `uds open-work next-action` reading a next action written as a table column.
> **6.14.0-beta.3 新增** — 修正 `uds init` 寫入的 pre-commit hook 的安全問題（不再讓 `npx` 去 npm 找一個叫 `uds`、但不是本專案的套件）、重寫 `uds uninstall`（只移除能證明是 UDS 寫的東西），以及 `uds open-work next-action` 讀得懂寫成表格欄的下一步。

**Existing adopters: run `uds update` once.** The pre-commit hook older versions wrote is the single line `npx uds check`; a new install no longer writes it, but a project that already has it keeps it until `uds update` replaces it.
**既有採用者：請執行一次 `uds update`。**舊版寫進 pre-commit hook 的是單行 `npx uds check`；新安裝不再寫這一行，但已經有這一行的專案要等 `uds update` 才會被換掉。

Everything in 6.14.0-beta.2 is still here: `uds update --with-hooks`, `uds open-work`, the turn-completion conditional-exemption fix, and the throwaway-HOME release check; and from 6.14.0-beta.1 the turn-completion hook for **Antigravity CLI (`agy`)** and `open-work-tracking` 1.1.0 (OWT-017/018/019).
6.14.0-beta.2 的內容都還在：`uds update --with-hooks`、`uds open-work`、回合收尾關卡條件式豁免的修正、發版檢查改用拋棄式 HOME；6.14.0-beta.1 的 **Antigravity CLI（`agy`）** 回合收尾關卡與 `open-work-tracking` 1.1.0（OWT-017/018/019）也都還在。

### What is in it | 這一版有什麼

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **Pre-commit hook no longer runs `npx uds`** | The block `uds init --with-hooks` appends to `.husky/pre-commit` now looks for `universal-dev-standards` (this package's own name) in the project's `node_modules/.bin`, then on `PATH`, and runs `check`. If it is found in neither, the commit is **blocked** with a message saying what to install (`npm install --save-dev universal-dev-standards`, or `-g`); it neither skips the check nor downloads anything. The text in generated `CLAUDE.md`/`AGENTS.md` blocks and in the hook hints now says `npx universal-dev-standards init` / `update`. `uds check` warns about a hook that still runs the bare name. | 別再讓 npm 去抓一個不是我們的 `uds` |
| **`uds update` replaces the old hook line** | In every `uds update` mode except `--skills`, `--commands`, `--integrations-only`, `--standards-only` and `--rollback` (and in `--with-hooks`), the line UDS itself wrote in `.husky/pre-commit` — only `npx uds check` or `npx uds check --standard checkin-standards`, directly under the `# UDS Standard Check` marker — is replaced with the new block. It runs even when your standards are already up to date. `--plan` reports and writes nothing. A line you wrote or edited yourself is left alone and reported with its line number. Only `.husky/pre-commit` is examined; the native `.git/hooks/pre-commit` that `uds init` writes for non-Node projects calls `uds check` from `PATH` and is unchanged. | 舊專案跑一次 `uds update` 就換掉 |
| **`uds uninstall` removes only what it can prove UDS wrote** | A whole file is deleted only if the manifest records that UDS wrote it **and** its content still matches the recorded hash; otherwise it is kept and the output says why (`kept: modified since UDS wrote it`, or `kept: no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this`). Folders UDS created are removed once empty. Every "Removed" line is a real deletion or edit; a run that ends with errors exits non-zero. | 不再亂刪、也不再說謊 |
| **`uds uninstall` never prompts when nobody can answer** | `--dry-run` never prompts and previews every category. Without `--yes` and without a terminal a real run refuses with exit code 2 (nothing is changed); a closed prompt exits 130; a project that was never initialized exits 1. | 排程或腳本裡跑不會卡住 |
| **`uds init --with-hooks` on Windows** | No longer prints `'chmod' is not recognized`: it calls `fs.chmodSync` and skips the step on Windows. | Windows 少一行誤導的錯誤訊息 |
| **`uds open-work next-action` reads table columns** | A table column whose header is in the next-action vocabulary (`Next action`, `Next step`, `下一步`, `下一動`, `回來要做什麼`) is read on every row, with the line number. A row whose cell count differs from its header is listed as `UNDECIDABLE` (exit code 2), never read as empty. The vocabulary is still uncalibrated (OWT-016). | 表格式的工作紀錄也能檢查 |

### What to test | 請幫忙測什麼

1. **The pre-commit fix** — in a project that already has the old hook (`.husky/pre-commit` containing `npx uds check` under `# UDS Standard Check`): `uds update --plan` should say it would replace the line and write nothing; `uds update` should replace it. Then make a commit with the CLI installed (it should run `universal-dev-standards check`), and once with it neither in `node_modules/.bin` nor on `PATH` (the commit should be blocked with the install hint, not skipped). If you edited that line yourself, confirm it is left alone and reported.
   在已經有舊 hook 的專案：`uds update --plan` 應說明會替換且不寫入；`uds update` 應完成替換。再各 commit 一次——裝了 CLI 時應執行 `universal-dev-standards check`；`node_modules/.bin` 與 `PATH` 都找不到時應被擋下並提示怎麼安裝，而不是被略過。你自己改過那一行時，應原樣保留並回報。
2. **`uds uninstall`** — (a) on a project you initialized **with this beta**: `uds uninstall --dry-run`, then `uds uninstall --yes`; the hook scripts and the UDS-generated `AGENTS.md` should go, and so should `.husky/pre-commit` if UDS created it and you have not edited it; your own files, your own lines in a hook file and your own hook entries should stay. (b) On a project initialized by an **earlier** version, run with `--yes`: see "Known limitations" below for what is kept and why; report anything kept that has no explanation, or anything deleted that was yours. (c) `uds uninstall` with no `--yes` in a script (no terminal) should exit 2 and change nothing.
   (a) 用這個測試版初始化的專案：先 `--dry-run` 再 `--yes`，關卡腳本與 UDS 生成的 `AGENTS.md` 應被移除；`.husky/pre-commit` 若是 UDS 建立且你沒改過也應被移除；你自己的檔案、hook 檔裡你自己的行與 hook 項目應保留。(b) 早期版本初始化的專案，加 `--yes` 執行：保留什麼、為什麼，見下方「已知限制」；請回報任何保留卻沒說明原因的東西，或任何被刪掉的你自己的東西。(c) 在沒有終端機的腳本裡不加 `--yes` 應以 2 結束且不改任何東西。
3. **`uds update --with-hooks`** (from 6.14.0-beta.2, still to be tested) — in a project initialized before these betas: `uds update --with-hooks --plan`, then `uds update --with-hooks`; confirm `.agents/hooks.json` (agy), `.codex/hooks.json`, `.gemini/settings.json` or `.claude/settings.json` appears for the tools you use, that running it twice changes nothing, and that your own hooks are still there. (Codex will not run its hook until you trust the project and the hook in Codex.)
   在這些測試版之前初始化的專案：先 `--plan` 再實際執行；確認你用的工具的關卡檔出現、重跑一次沒有變化、你自己的 hooks 還在。（Codex 要先在 Codex 裡信任專案與該關卡才會執行。）
4. **`uds open-work`** — `uds open-work next-action <your work log>` from a **clean directory that has no clone of UDS**, including a work log that keeps its next actions in a table column; report false positives (a concrete next action reported as vague) and misses.
   在沒有 clone UDS 的乾淨目錄對你的工作紀錄（含把下一步寫在表格欄的）執行；回報誤判與漏判。
5. **No regression on Claude Code, Codex and Antigravity CLI** — the turn-completion hooks should behave as in 6.14.0-beta.2 (agy: a turn that says "I will run the tests next" is sent back; a turn waiting on your decision, or one where you asked it to stop, is not).
   Claude Code、Codex 與 Antigravity CLI 不退步：回合收尾關卡行為應與 6.14.0-beta.2 相同。

### Known limitations | 已知限制

- **Windows: the new pre-commit block has not been run.** It is POSIX `sh` that is meant to run in git-bash. The test that executes the block is skipped on Windows (CI's Windows job runs the unit suite, but not that test), so what a real `git commit` does there is not known. Please report it. The `chmod` message fix is likewise checked only by a test that asserts the cause (no shell is spawned; the mode change is skipped on `win32`), not on a real Windows console.
  **Windows 上新的 pre-commit 區塊實際執行尚未驗證。**它是給 git-bash 執行的 POSIX `sh`。執行該區塊的測試在 Windows 上被略過（CI 的 Windows 工作跑的是單元測試套件，但不含那支測試），所以真正的 `git commit` 在那裡會怎樣目前不知道。請回報。`chmod` 訊息的修正同樣只有斷言成因的測試（不啟動 shell、在 `win32` 略過改權限），沒有在真正的 Windows 主控台看過。
- **繁體中文 Windows (cp950 console) has not been verified.** The messages this beta adds or changes (uninstall reasons, hook hints) have not been looked at in a cp950 console; garbled characters there would be a defect to report.
  **繁體中文 Windows（cp950 主控台）尚未驗證。**這個測試版新增或修改的訊息（uninstall 的說明、hook 提示）沒有在 cp950 主控台看過；若出現亂碼請回報。
- **A project installed by an older UDS (including 6.14.0-beta.2 and earlier) has no install records, so `uds uninstall` keeps things it cannot prove are UDS's and says so.** Concretely: the hook scripts under `scripts/hooks/` are kept; with `--yes` the text outside the UDS block in `AGENTS.md` is kept (the block itself is removed; interactively you are asked per file), including a generated header that still points at the removed `.standards/`; in `.husky/pre-commit` and the native `.git/hooks/pre-commit` only the lines that match UDS's are removed and the rest of the script stays, and the file is deleted only when nothing but a shebang is left. Delete what is left yourself if you want it gone. (`uds update --with-hooks` records only the hook scripts and folders it writes itself, so it does not change this for files that are already there.)
  **早期版本（含 6.14.0-beta.2 與更早）安裝的專案沒有安裝紀錄，所以 `uds uninstall` 會保留它無法證明是 UDS 寫的東西並說明。**具體是：`scripts/hooks/` 底下的關卡腳本保留；`AGENTS.md` 在 UDS 區塊以外的文字在 `--yes` 下保留（區塊本身會移除；互動模式則逐檔詢問），包括仍指向已刪除的 `.standards/` 的生成標頭；`.husky/pre-commit` 與原生 `.git/hooks/pre-commit` 只移除符合 UDS 樣式的行、其餘保留，只有剩下 shebang 時才刪檔。想清乾淨請自行刪除。（`uds update --with-hooks` 只替它自己寫入的關卡腳本與資料夾建立紀錄，對已經存在的檔案沒有幫助。）
- The pre-commit block **blocks the commit** when the UDS CLI is not installed. That is intended (a silent skip would be worse), but it means a teammate who clones the project without the CLI is stopped until they install it or remove the block.
  CLI 沒裝時 pre-commit 區塊會**擋下 commit**。這是刻意的（默默略過更糟），但代表沒裝 CLI 就 clone 專案的同事會被擋，直到裝了 CLI 或移除該區塊。
- agy: only a single turn without tool calls, in `-p` mode, has been observed; multi-turn, tool-using and interactive sessions are not yet verified.
  agy 只驗證過 `-p` 模式下的單輪、無工具回合；多輪、有用工具與互動模式尚未驗證。
- The open-work-tracking check's heading vocabulary, command list and identifier pattern are uncalibrated first judgments (OWT-016); a prose revision note such as "revised 2026-09-29" does not count as a structured record.
  工作管理檢查的標題詞彙、指令清單、編號樣式都是未校準的初始判斷；「2026-09-29 修訂」這類散文式備註不算結構化紀錄。
- The turn-completion hook reads prose, so it only works in languages that ship a locale pack: **English and 繁體中文**. A conditional with no comma ("After you merged it I will follow up") still fires the block.
  關卡靠讀文字判斷，只支援英文與繁中；沒有逗號的條件句（「After you merged it I will follow up」）仍會被擋。
- **Cursor** is not covered by the turn-completion hook.
  Cursor 不在關卡支援範圍。


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
