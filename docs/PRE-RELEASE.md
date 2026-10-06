# Pre-release Versions | 預發布版本

> **Language**: English + 繁體中文（本文件採用雙語嵌入）

This document covers installing, testing and leaving pre-release versions of UDS.
It is rewritten for **each** beta — the section "Current beta" always describes the one on the `@beta` tag.

本文件說明 UDS 預發布版本的安裝、測試與退回方式。**每一個測試版都會改寫本文件**——「目前的測試版」一節永遠描述 `@beta` 標籤上的那一版。

---

## Current beta | 目前的測試版：`6.14.0-beta.4`

> **New in 6.14.0-beta.4** — the `extensions/` packs (language style guides, framework patterns, the zh-TW and zh-CN locale packs) now ship inside the npm package, so installing them needs no network; `uds init --locale zh-cn` installs instead of rolling back, `--locale` is case-insensitive and an unsupported value is said out loud; a new skill `/comprehend` (comprehension ladder); `ai-response-navigation` 1.4.0 Rule 12 (controlled language, with "keep the hedges" required); and three checks that used to pass no matter what can now fail.
> **6.14.0-beta.4 新增** — `extensions/`（程式語言風格、框架規範、繁中與簡中語系包）打包進 npm 套件，安裝不再需要網路；`uds init --locale zh-cn` 不再回滾，`--locale` 不分大小寫，不支援的值會明說；新技能 `/comprehend`（理解階梯）；`ai-response-navigation` 1.4.0 第 12 條（受控語言，「保留不確定語氣」為必須）；以及三個原本怎樣都會通過的檢查，現在會失敗。

**Behavior change — read this first.** `uds check --standard checkin-standards` now fails when your lint or tests fail (it used to say "passed"), and the native pre-commit hook `uds init` writes for non-Node projects can now block a commit. A commit that used to go through with failing tests may now be blocked — that is the point. Hooks already on disk are left as written.
**行為改變，請先讀。**`uds check --standard checkin-standards` 在 lint 或測試失敗時會失敗（以前會說「通過」）；`uds init` 為非 Node 專案寫入的原生 pre-commit hook 現在擋得住提交。以前測試失敗也能提交的專案，現在可能會被擋——這正是修正的目的。已經在磁碟上的 hook 維持原樣。

Everything in 6.14.0-beta.3 is still here (pre-commit hook security fix, rewritten `uds uninstall`, Windows `chmod` message fix, `uds open-work` table columns).
6.14.0-beta.3 的內容都還在（pre-commit hook 安全修正、重寫的 `uds uninstall`、Windows `chmod` 訊息修正、`uds open-work` 讀表格欄）。

### What is in it | 這一版有什麼

| Change | What it does | 白話 |
| :--- | :--- | :--- |
| **`extensions/` in the package** | The 6.13.1 package held 0 of the 7 extension files, so `--lang csharp`/`php`, `--framework fat-free` and `--locale zh-tw`/`zh-cn` downloaded them from GitHub `main` while installing. They now ship in the package (about 152 KB) and are read from it only; a declared file missing from the package fails the install by name, with no download. | 離線也裝得了中文與程式語言規範，內容和你裝的版本一致 |
| **`uds init --locale zh-cn`** | The Simplified Chinese locale pack did not exist, so the install rolled back. It now exists, written with mainland terminology (not a character conversion of the Traditional pack). | 簡中安裝修好 |
| **`--locale` case and unknown values** | `zh-CN` works like `zh-cn`. An unsupported value (e.g. `fr`) installs English and prints a warning. | 大寫也行；不支援會說 |
| **`/comprehend` skill** | Builds one outline from a hard-to-read AI output, then renders controlled prose, a Mermaid diagram, or a single-file HTML explainer that loads nothing from the network. Three required guards: add no fact the source does not state; keep every hedge; give every item a source pointer and a "not covered" note. | 把看不懂的 AI 輸出換成好讀的形式，事實不變 |
| **`ai-response-navigation` 1.4.0, Rule 12** | Controlled-language principles. Only "keep hedges" is required. The ASD-STE100 dictionary does not apply to non-English text. | 寫清楚，但不能把「可能」改成「是」 |
| **`checkin-standards` validator** | A failing lint or test script now fails the check and says which one; a genuinely absent script is not a failure. | 測試失敗不再顯示通過 |
| **`pipeline-security-gates` validator** | Could not fail before (`grep \| head`); now fails unless a pipeline mentions a security gate. | 這個檢查終於會失敗 |
| **Native pre-commit hook (non-Node)** | Used to swallow every error and print "passed". An installed linter that fails, or the UDS check, now blocks the commit; a linter that is not installed is skipped. | 非 Node 專案的提交前檢查擋得住了 |

### What to test | 請幫忙測什麼（Windows 優先）

1. **Install on Windows, online and offline** — `npm install -g universal-dev-standards@beta`, then in a new project `uds init --locale zh-tw`, and in another `uds init --locale zh-cn`. Then **disconnect the network** and run `uds init --locale zh-tw --lang csharp` in a third project. All three should finish, and the locale pack should be in `.standards/`.
   在 Windows 安裝測試版，分別用 `zh-tw`、`zh-cn` 初始化；再**拔網路**，在第三個專案用 `zh-tw` 加 `--lang csharp` 初始化。三次都應完成，`.standards/` 裡應有語系包。
2. **`--locale zh-CN` and `--locale fr`** — the first should install Simplified Chinese; the second should print a warning and install English.
   大寫 `zh-CN` 應裝成簡中；`fr` 應印出警告並裝成英文。
3. **`/comprehend`** — in Claude Code (installed with skills), paste a long AI answer you found hard to read and run `/comprehend`. Check: nothing new was added; every "might / 可能" is still there; each item says where it came from and what it does not cover; the HTML file opens with the network off.
   在 Claude Code 貼一段難讀的 AI 回答，執行 `/comprehend`。檢查：沒有多出原文沒有的內容；「可能」都還在；每一項都標出來源與沒涵蓋什麼；斷網時 HTML 也打得開。
4. **The checks that can now fail** — in a project with a failing test, run `uds check --standard checkin-standards`; it should fail and name `npm run test`.
   在測試會失敗的專案執行 `uds check --standard checkin-standards`，應失敗並點名 `npm run test`。
5. **Still open from beta.3** — the pre-commit block under git-bash on Windows, and messages in a 繁體中文 Windows (cp950) console.
   beta.3 尚未驗證的兩項：Windows git-bash 下的 pre-commit 區塊、cp950 主控台的中文訊息。

Report anything wrong as a GitHub issue. | 有問題請開 GitHub issue。

### Known limitations | 已知限制

- **`/comprehend` is not proven to help.** Five evaluation cases ship with it (`skills/comprehension-ladder/eval-cases.md`) but have not been run; please report whether the output was easier to read and whether any guard was broken.
  **`/comprehend` 的效果尚未證明。**評估案例已附上但還沒實跑；請回報是否比較好讀、有沒有違反三條防護。
- **The HTML rung cannot load the Mermaid library** (it may load nothing from the network), so diagrams inside the HTML explainer are inline SVG or lists.
  HTML 解說頁不能載入 Mermaid 函式庫（不得連網），頁內的圖是內嵌 SVG 或清單。
- **`uds check --diff` still fetches originals from GitHub `main`**, extension files included, to compare against. Offline it fails for those files.
  `uds check --diff` 仍從 GitHub `main` 抓原稿比對（含擴充檔），離線時會失敗。
- **The offline install test unpacks the tarball and links its dependencies**; it does not run a real `npm install <tgz>`. Windows has not run it.
  離線安裝測試是解開套件並連結相依套件，不是真正的 `npm install <tgz>`；Windows 沒有跑過。
- **Windows: the pre-commit block has not been run**, and **cp950 console** output has not been looked at.
  Windows 上 pre-commit 區塊的實際執行、cp950 主控台的輸出都尚未驗證。
- **A project installed by an older UDS has no install records**, so `uds uninstall` keeps what it cannot prove is UDS's and says so.
  早期版本安裝的專案沒有安裝紀錄，`uds uninstall` 會保留無法證明是 UDS 寫的東西並說明。
- The pre-commit block **blocks the commit** when the UDS CLI is not installed (intended; a silent skip would be worse).
  CLI 沒裝時 pre-commit 區塊會擋下提交（刻意的）。
- agy: only single, tool-free `-p` turns verified. The turn-completion hook works only in English and 繁體中文, and does not cover Cursor. The open-work-tracking vocabulary is uncalibrated.
  agy 只驗證過 `-p` 單輪無工具回合；回合收尾關卡只支援英文與繁中，不含 Cursor；工作管理檢查的詞彙尚未校準。


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
