# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.1`

> **New in 6.14.0-beta.1** — the turn-completion hook now supports **Antigravity CLI (`agy`)**, on a contract observed in a real agy session; and `open-work-tracking` 1.1.0 adds three requirements: intent kept apart from progress, edits to intent leave a record, and a next action names a concrete object.
> **6.14.0-beta.1 新增** — 回合收尾關卡支援 **Antigravity CLI（`agy`）**，依真實 agy 工作階段觀察到的契約實作；`open-work-tracking` 1.1.0 新增三條要求：目標與進度分開存放、修改目標要留下紀錄、「下一步」要點名具體對象。

### What is in it | 這一版有什麼

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **turn-completion-integrity 1.5.0 — Antigravity CLI** | `uds init --with-hooks` writes `.agents/hooks.json`. The command is `node ../scripts/hooks/check-turn-completion-agy.mjs` because agy runs hooks with `.agents/` as the working directory (observed with agy 1.2.12). A block is returned as `{"decision":"continue"}`. | 用 agy 的人，說了要做卻沒做也會被擋回去 |
| **open-work-tracking 1.1.0** | OWT-017 intent and progress in separate carriers; OWT-018 every edit to goal / acceptance criteria / constraints leaves a record, and an edit with no approver is listed at hand-back; OWT-019 a next action names a file, test, command or requirement id. A reference check lives in the UDS repository as `scripts/check-open-work-tracking.mjs` (not in the npm package). | 目標與進度分開；改目標要留痕；「下一步」要寫具體 |

### What to test | 請幫忙測什麼

1. **Antigravity CLI** — in a **new** project that has `.agents/AGENTS.md`, run `uds init --with-hooks`; confirm `.agents/hooks.json` exists. In an agy session: (a) have the AI say "I will run the tests next" and end the turn → it should be sent back; (b) a turn that waits on your decision → not blocked; (c) you ask it to stop → not blocked.
   Antigravity CLI：在**全新**、已有 `.agents/AGENTS.md` 的專案執行 `uds init --with-hooks`，確認 `.agents/hooks.json` 已寫入。在 agy 裡：(a) 讓 AI 說「接下來我會跑測試」就結束 → 應被擋回；(b) 在等你決定的回合 → 不擋；(c) 你叫它停 → 不擋。
2. **Longer agy sessions** — only a single turn without tool calls was observed. Please report if a multi-turn session or a turn that used tools is judged on the wrong message.
   agy 較長的工作階段：目前只驗證過「單輪、沒有用工具」。多輪或有用工具的回合若判斷錯訊息，請回報。
3. **open-work-tracking** — in this beta the reference check is **not in the npm package** (`scripts/check-open-work-tracking.mjs` exists only in a clone of the UDS repository; the next beta ships it as `uds open-work`, see the draft below). From a clone, run `node scripts/check-open-work-tracking.mjs next-action <your work log>` and `revision --file <spec> --base <rev>` on your own files; report false positives (a concrete next action reported as vague) or misses.
   工作管理檢查：這一版這支參考檢查**不在 npm 安裝包裡**（`scripts/check-open-work-tracking.mjs` 只在 UDS repo 的副本裡；下一個測試版會以 `uds open-work` 出貨，見下方草稿）。從副本執行，拿自己的工作紀錄與規格試跑，回報誤判（具體的下一步被判成空洞）或漏判。
4. **No regression on Claude Code and Codex** — both hooks should behave exactly as in 6.13.1.
   Claude Code 與 Codex 不退步：行為應與 6.13.1 相同。

### Known limitations | 已知限制

- **Existing projects cannot get the agy hook in this beta — fixed in the next beta (see the draft below).** It is wired only by `uds init --with-hooks` in a new project that already has `.agents/AGENTS.md`; `uds update` does not add it, and `uds init` refuses to run twice. Found by installing this package into a fresh project.
  **既有專案在這一版拿不到 agy 關卡——下一個測試版已修正（見下方草稿）。** 只有在全新、已有 `.agents/AGENTS.md` 的專案，由 `uds init --with-hooks` 裝上；`uds update` 不會補裝，`uds init` 也不能跑第二次。這是把安裝包裝進全新專案實測時發現的。
- agy: only a single turn without tool calls, in `-p` mode, has been observed; multi-turn, tool-using and interactive sessions are not yet verified.
  agy 只驗證過 `-p` 模式下的單輪、無工具回合；多輪、有用工具與互動模式尚未驗證。
- The open-work-tracking check's heading vocabulary, command list and identifier pattern are uncalibrated first judgments (OWT-016); a prose revision note such as "revised 2026-09-29" does not count as a structured record.
  工作管理檢查的標題詞彙、指令清單、編號樣式都是未校準的初始判斷；「2026-09-29 修訂」這類散文式備註不算結構化紀錄。
- The turn-completion hook reads prose, so it only works in languages that ship a locale pack: **English and 繁體中文**.
  關卡靠讀文字判斷，只支援英文與繁中。
- **Cursor** is not covered by the turn-completion hook.
  Cursor 不在關卡支援範圍。

### DRAFT — next beta (version number to be filled in at release) | 草稿：下一個測試版（版本號待發版時填入）

> Not published. Written ahead of the release so that the notes exist when it is cut; **replace `<next-beta>` and re-check every claim against the release before publishing.**
> 尚未發佈。預先寫好，發版時才不會沒有說明；**發版時請把 `<next-beta>` 換成實際版本，並逐項重新核對後才發佈。**

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **`uds update --with-hooks`** | Installs the enforcement hooks that are **missing** from an already-initialized project: it re-detects the tools (manifest ∪ project files), leaves hooks that are already there and your own hooks alone, keeps hook scripts you edited (add `--force` to overwrite), and with `--plan` writes nothing. `--ai-tool <list>` names the tools instead of detecting them; with no tool found it says how to name one and exits 1. Antigravity is now detected from `.agents/AGENTS.md`, `.agents/rules/`, `.agents/workflows/`, `.agents/plugins/` or `.agents/hooks.json` — not from `.agents/skills/`, which Codex shares. | 既有專案也拿得到關卡了，包括 agy |
| **`uds open-work`** | The `open-work-tracking` reference checks now ship in the npm package: `uds open-work next-action \| revision \| separation \| self-test`. Same rules, same exit codes (0 no violation, 1 violation, 2 cannot decide — not a pass), one copy of the code. | 工作管理檢查不用 clone repo 就能跑 |
| **Turn-completion fix (present since 6.13)** | "Once you choose option A or B, I will apply it." was blocked while "Once you choose A, I will apply it." was not: the exemption for a turn that waits on the human was capped at 20 characters (English) / 1–6 characters (繁體中文). It now runs to the clause boundary. | 明明在等你決定，卻被擋回去的誤擋修掉了 |
| **Release check no longer writes to your home** | `pre-release-check.sh` and this repository's test suite wrote UDS skills into the real `~/.claude/skills/`. Contributors: see the CHANGELOG entry and check that folder. | 只影響在這個 repo 開發的人 |

**What to test | 請幫忙測什麼**

1. In a project that was initialized before this beta: `uds update --with-hooks --plan`, then `uds update --with-hooks`; confirm `.agents/hooks.json` (agy), `.codex/hooks.json` or `.claude/settings.json` appears for the tools you use, that running it twice changes nothing, and that your own hooks are still there.
   在這個測試版之前初始化的專案：先 `uds update --with-hooks --plan`，再 `uds update --with-hooks`；確認你用的工具的關卡檔出現、重跑一次沒有變化、你自己的 hooks 還在。
2. `uds open-work next-action <your work log>` and `uds open-work revision --file <spec> --base <rev>` from a **clean directory that has no clone of UDS** (this is what the previous beta could not do); report false positives and misses.
   在**沒有 clone UDS 的乾淨目錄**跑上面兩個指令（上一版做不到的事）；回報誤判與漏判。


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
