# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.2`

> **New in 6.14.0-beta.2** — `uds update --with-hooks` gives an **already-initialized** project the enforcement hooks it is missing (including the Antigravity CLI hook that 6.14.0-beta.1 could not give it); the `open-work-tracking` reference checks now ship in the npm package as `uds open-work`; and a false block on turns that were waiting on your decision is fixed.
> **6.14.0-beta.2 新增** — `uds update --with-hooks` 讓**已初始化**的專案補裝缺少的執行關卡（包括 6.14.0-beta.1 給不了的 Antigravity CLI 關卡）；`open-work-tracking` 的參考檢查現在隨 npm 安裝包出貨，指令是 `uds open-work`；並修正「明明在等你決定卻被擋回去」的誤擋。

Everything in 6.14.0-beta.1 is still here: the turn-completion hook for **Antigravity CLI (`agy`)**, on a contract observed in a real agy session, and `open-work-tracking` 1.1.0 (OWT-017/018/019).
6.14.0-beta.1 的內容都還在：依真實 agy 工作階段觀察到的契約實作的 **Antigravity CLI（`agy`）** 回合收尾關卡，以及 `open-work-tracking` 1.1.0（OWT-017/018/019）。

### What is in it | 這一版有什麼

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **`uds update --with-hooks`** | Installs the enforcement hooks that are **missing** from an already-initialized project: it re-detects the tools (manifest ∪ project files), leaves hooks that are already there and your own hooks alone (the one exception: an out-of-date UDS entry for agy is replaced), keeps hook scripts you edited (add `--force` to overwrite), and with `--plan` writes nothing. `--ai-tool <list>` names the tools (`claude-code`, `codex`, `gemini-cli`, `antigravity`) instead of detecting them; with no tool found it says how to name one and exits 1. Antigravity is now detected from `.agents/AGENTS.md`, `.agents/rules/`, `.agents/workflows/`, `.agents/plugins/` or `.agents/hooks.json` — not from `.agents/skills/`, which Codex shares. | 既有專案也拿得到關卡了，包括 agy |
| **`uds open-work`** | The `open-work-tracking` reference checks now ship in the npm package: `uds open-work next-action \| revision \| separation \| self-test`. Same rules, same exit codes (0 no violation, 1 violation, 2 cannot decide — not a pass), one copy of the code. | 工作管理檢查不用 clone repo 就能跑 |
| **Turn-completion fix (present since 6.13)** | "Once you choose option A or B, I will apply it." was blocked while "Once you choose A, I will apply it." was not: the exemption for a turn that waits on the human was capped at 20 characters (English) / 1–6 characters (繁體中文). It now runs to the clause boundary. | 明明在等你決定，卻被擋回去的誤擋修掉了 |
| **Release check no longer writes to your home** | `pre-release-check.sh`, `git commit` in this repository, and this repository's test suite wrote UDS skills into the real `~/.claude/skills/`. Contributors: see the CHANGELOG entry and check that folder. | 只影響在這個 repo 開發的人 |

### What to test | 請幫忙測什麼

1. **`uds update --with-hooks`** — in a project that was initialized before this beta: `uds update --with-hooks --plan`, then `uds update --with-hooks`; confirm `.agents/hooks.json` (agy), `.codex/hooks.json`, `.gemini/settings.json` or `.claude/settings.json` appears for the tools you use, that running it twice changes nothing, and that your own hooks are still there. (Codex will not run its hook until you trust the project and the hook in Codex.)
   在這個測試版之前初始化的專案：先 `uds update --with-hooks --plan`，再 `uds update --with-hooks`；確認你用的工具的關卡檔（`.agents/hooks.json`、`.codex/hooks.json`、`.gemini/settings.json` 或 `.claude/settings.json`）出現、重跑一次沒有變化、你自己的 hooks 還在。（Codex 要先在 Codex 裡信任專案與該關卡才會執行。）
2. **`uds open-work`** — `uds open-work next-action <your work log>` and `uds open-work revision --file <spec> --base <rev>` from a **clean directory that has no clone of UDS** (this is what 6.14.0-beta.1 could not do); report false positives (a concrete next action reported as vague) and misses.
   在**沒有 clone UDS 的乾淨目錄**跑上面兩個指令（6.14.0-beta.1 做不到的事）；回報誤判（具體的下一步被判成空洞）與漏判。
3. **Antigravity CLI** — in an agy session: (a) have the AI say "I will run the tests next" and end the turn → it should be sent back; (b) a turn that waits on your decision → not blocked; (c) you ask it to stop → not blocked. Only a single turn without tool calls has been observed; please report if a multi-turn session or a turn that used tools is judged on the wrong message.
   Antigravity CLI：在 agy 裡：(a) 讓 AI 說「接下來我會跑測試」就結束 → 應被擋回；(b) 在等你決定的回合 → 不擋；(c) 你叫它停 → 不擋。目前只驗證過「單輪、沒有用工具」；多輪或有用工具的回合若判斷錯訊息，請回報。
4. **No regression on Claude Code and Codex** — both hooks should behave exactly as in 6.13.1.
   Claude Code 與 Codex 不退步：行為應與 6.13.1 相同。

### Known limitations | 已知限制

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
