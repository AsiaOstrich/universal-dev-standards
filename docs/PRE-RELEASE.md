# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.13.0-beta.2`

> **New in beta.2** — `uds uninstall` now removes the UDS hook entries from Claude Code, Codex and Gemini CLI settings; the Codex "I asked you to stop" exemption now works (beta.1 read the wrong field); "I'm heading out, let's continue when I'm back" style phrases now count as a stop request (zh-TW and en).
> **beta.2 新增** — `uds uninstall` 會移除 Claude Code、Codex、Gemini CLI 設定裡的 UDS 關卡；Codex 上「你叫它停就放行」現在生效（beta.1 讀錯欄位）；「我要出門了，等我回來再繼續」這類說法現在算叫停（繁中與英文）。

### What is in it | 這一版有什麼

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **developer-memory 1.2.0** | New `code-reference` staleness check: a memory that cites a file path or symbol that has moved or no longer exists is flagged **before** it is surfaced. Degraded mode (no graph engine) and engine mode (e.g. `egr refs check`). | 記憶裡提到的程式碼被搬走或刪掉了，也算過期；浮出記憶之前先查核 |
| **turn-completion hook for Codex and Gemini CLI** | Standard `turn-completion-integrity` 1.4.0. Supported: Claude Code, **Codex** (Stop event, written to `.codex/hooks.json`), **Gemini CLI** (AfterAgent event, written to `.gemini/settings.json`). Installed by `uds init --with-hooks` only for the tools you selected. | 「說了要做卻沒做就結束回合」的關卡，從只支援 Claude Code 擴大到 Codex 與 Gemini CLI |
| **fewer false blocks (zh-TW and en)** | A next step that waits on **your** decision is no longer read as an unkept promise: zh-TW「你＋選定／選好／決定／確認／回覆／點頭＋後，我…」, en "once / after / as soon as you …, I …". | 「你選定後，我會……」這類等使用者決定的句子不再被誤擋 |

### What to test | 請幫忙測什麼

1. **Memory staleness** — in a project whose AI memory or `CLAUDE.md`/`AGENTS.md` cites file paths, ask your assistant to review its memories. A path that was moved should be reported as stale, not silently used.
   記憶查核：在記憶或說明檔有提到檔案路徑的專案裡，請 AI 整理它的記憶；被搬走的路徑應被標成過期，而不是照舊使用。
2. **Turn-completion on Codex / Gemini CLI** — run `uds init --with-hooks` and select OpenAI Codex and/or Gemini CLI; confirm `.codex/hooks.json` / `.gemini/settings.json` now contain the hook. In a session: (a) let the assistant end a turn with "I'll do the remaining two next" without doing them → it should be sent back to continue; (b) end with "once you pick, I'll write it up" → it should **not** be sent back; (c) ask it to stop ("pause, I'm heading out") → it should not be sent back (on Codex this may still misfire, see limitations).
   Codex／Gemini CLI 上的關卡：執行 `uds init --with-hooks` 並勾選 OpenAI Codex／Gemini CLI，確認 `.codex/hooks.json`／`.gemini/settings.json` 已寫入。在工作階段裡：(a) 讓 AI 說「剩下兩項我繼續做」卻沒做就結束回合 → 應被擋回去；(b) 以「你選定後，我會寫成紀錄」結束 → **不應**被擋；(c) 請它停下（「我要出門了」）→ 不應被擋（Codex 上可能仍誤擋，見已知限制）。
3. **No regression on Claude Code** — the hook should still block "I'll do X next" when X was not done, and should **not** block when the next step waits on you.
   Claude Code 不退步：說了要做卻沒做仍會被擋；下一步在等你決定時不會被擋。

### Known limitations | 已知限制

- Memory staleness covers **file paths and symbol names** only; `file:line` references are not checked (line numbers drift for unrelated reasons).
  記憶查核只涵蓋檔案路徑與函式／類別名稱，不查 `file:line`。
- The turn-completion hook reads prose, so it only works in languages that ship a locale pack: **English and 繁體中文**. Other languages: the hook is installed but cannot fire, and `uds init` says so.
  關卡靠讀文字判斷，只支援英文與繁中；其他語言會明確告知不生效。
- **Cursor** and other tools are not covered by the turn-completion hook in this beta.
  Cursor 與其他工具這一版不支援該關卡。
- **Codex: "I asked you to stop" did not work in 6.13.0-beta.1 — it read the wrong field and never exempted a turn.** The transcript format has now been checked against a real codex-cli 0.156.1 install and the adapter fixed for 6.13.0-beta.2. Please still report any turn that was blocked after you asked to stop.
  Codex 的「使用者叫停就放行」在 6.13.0-beta.1 沒有生效——讀錯了欄位，從未真的豁免過任何一輪。逐字稿格式已對照真實 codex-cli 0.156.1 安裝核對，並在 6.13.0-beta.2 修正轉接層。仍請回報「已叫停卻被擋」的情況。
- **From 6.13.0-beta.2, `uds uninstall` also removes the hook entries from `.claude/settings.json`, `.codex/hooks.json` and `.gemini/settings.json`. In 6.13.0-beta.1, remove them by hand** (see *Going back to stable*).
  從 6.13.0-beta.2 起，`uds uninstall` 會一併移除 `.claude/settings.json`、`.codex/hooks.json`、`.gemini/settings.json` 裡的關卡項目。**6.13.0-beta.1 請手動刪除**（見「退回正式版」）。
- A zh-TW promise phrased without a recognised action verb (e.g.「改好後，我接著推上去」) is still not caught — this gap predates this beta.
  沒有用到偵測器認得的動作動詞的承諾（例如「改好後，我接著推上去」）仍不會被擋——這是先前就有的缺口。

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
