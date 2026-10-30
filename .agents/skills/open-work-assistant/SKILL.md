---
name: open-work
source: ../../../../skills/open-work-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-30
source_hash: 01f94f0311a4
status: current
scope: universal
description: |
  [UDS] 選用的小幫手，幫忙追蹤跨工作階段仍未完成的工作：便宜的收件點、每個等待都有解除條件、下一步點名真實的東西。
  Use when: 工作在工作階段之間漏掉、某個項目「等待中」好幾天卻沒人知道在等什麼、「下一步」只寫「繼續」。
  Not for: 已經用議題追蹤器或看板管理工作而且沒有漏掉東西的專案；規劃功能——請用 /plan 或 /sdd。
  Keywords: open work, backlog, inbox, waiting, release condition, next action, 開放工作, 待辦追蹤, 收件匣, 等待中, 解除條件.
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "[capture | waiting | next-action | report | 收件 | 等待 | 下一步 | 報告]"
---

# 開放工作追蹤

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/open-work-assistant/SKILL.md) | 繁體中文 | [简体中文](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-CN/skills/open-work-assistant/SKILL.md)

**版本**: 1.0.0 | **最後更新**: 2026-10-30 | **適用**: Claude Code Skills

幫忙避免工作在工作階段之間漏掉。想用才用。UDS 沒有任何東西要求你用。

## 目的

這個技能以前是一條標準，叫 `open-work-tracking`。UDS 把它搬到這裡，是因為那條標準只在一個專案上試過，而那個專案自己的使用沒有證實它。技能比較合適：工作開始漏掉時你拿起它，沒有漏掉時你放下它。

舊標準的全文保留成參考文件：[open-work-tracking](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/open-work-tracking.md)。UDS 不再安裝它。本技能放的是其中值得保留的部分。

## 什麼時候用、什麼時候不用

先找出真正的問題是哪一個。去問使用者。不要為了一個沒有人遇到的問題去開一份追蹤清單。

| 出了什麼問題 | 什麼有幫助 |
|---|---|
| 做事做到一半冒出新想法，沒有便宜的地方可以放 | 一個只要兩個欄位的收件點 |
| 某個項目暫停「等待中」，之後沒人知道在等什麼 | 在等待旁邊寫下解除條件 |
| 已規劃的項目沒動工，時間過去，沒有東西指回它 | 一個日期，或定期看一眼清單 |

三個都不是真的，就停下來並說明。專案已經有議題追蹤器或專案看板、而且在那裡沒有漏掉東西，就繼續用它。沒有人讀的第二份清單，只是多一個漏掉工作的地方。

## 工作流程

### 1. 收件：兩個欄位

寫下日期和一句話。不要多寫。

| 日期 | 內容 |
|---|---|
| 2026-10-30 | 確認結構調整之後匯出作業還有沒有在跑 |

這一步不要問分類、優先級或負責人。那些等整理清單時再決定。必填欄位多一個，大家就不再用這份清單。

### 2. 等待：寫下什麼會解除它

每個標為「等待中」的項目要有兩樣東西：在等什麼，以及什麼事件結束這個等待。優先選機器看得到的事件：日期、會出現的檔案、標籤、識別字。

| 項目 | status | asked-at | waiting for | release |
|---|---|---|---|---|
| 廠商報價 | asked-awaiting | 2026-10-27 | 廠商的回覆 | 檔案 `quotes/vendor-a.md` 存在 |

寫明是哪一種等待：

- `not-yet-asked`：請求已經擬好或決定好，還沒有人送出。點名那份草稿或那個指令，送出它就解除這個等待。
- `asked-awaiting`：已經送出，還沒有回音。寫 `asked-at`（含年份的完整日期）。有年齡的項目可以在門檻到了時重新浮現，沒有年齡的不行。

等待的是另一個專案裡的東西，就寫成 `<專案>:<物件>`，例如 `uds:v6.15.0` 或 `vibeops:docs/handoff.md`。專案是邏輯名稱，絕不是某一台機器上的目錄。

### 3. 下一步：要點名東西

下一步至少點名一個讀的人找得到的東西：檔案路徑、測試名稱、指令，或需求識別字。「繼續」和「處理剩下的」什麼都沒點名。

| 弱 | 較好 |
|---|---|
| 繼續做遷移 | 執行 `npm run migrate -- --dry-run`，並讀 `migrations/0042.sql` |

已經問過、在等回覆的項目，可以把那個回覆當作下一步。這時它需要 `asked-at`、在等什麼、什麼解除它。

### 4. 整理清單：三個出口

挑一個固定的日子整理收件的項目。每個項目去三個地方之一：

1. 變成規格或被追蹤的項目。
2. 進入要做的工作清單。
3. 丟掉，並寫一句為什麼。

停在未整理狀態超過大約兩週的項目，要在報告裡被點名。沒有理由的丟棄，看起來和被誤刪的項目一模一樣。

### 5. 報告：說出你看不到的部分

報告「還有 N 項未完成」時，也要說你看了幾個來源、有幾個看不到。看不到的來源不是零。沒有這句話的報告，讀起來像是完整的。

在回合結束、控制權交回給人的時候印出報告。報告絕不能擋住回合。「還有工作沒做完」幾乎永遠為真，而一個永遠紅燈的檢查會被關掉。

### 6. 你看不到的事實

有些事實，助理沒有任何來源可以讀：訊息有沒有寄出、對方有沒有回覆、有沒有核准。要手寫它們，必須附三樣東西：誰看到的（`observed-by`）、何時（`observed-at`，含年份），以及值是 `yes`、`no` 或 `unknown`。`unknown` 是正式的值，單獨計數，永遠不算完成。每筆觀察都顯示年齡。戳記只說有人看過一次，不說現在仍然如此。

版本控制、規格標記或 CI 結果已經說明的事，不要手寫。

### 7. 選用：執行參考檢查

UDS 在 CLI 裡附了這些規則的參考檢查程式：

```bash
uds open-work next-action [files...]   # 每個下一步都有點名東西嗎？
uds open-work waiting [files...]       # 每個等待都有解除條件嗎？
uds open-work observations [files...]  # 手寫的事實都有戳記嗎？
uds open-work self-test                # 檢查程式自己遇到壞樣本還是會失敗嗎？
```

檢查程式靠欄位名稱找欄位，例如 `status`、`asked-at`、`waiting for`、`release`（上面的表格用的就是這些）。你的表格用別的詞，就在 `uds.project.yaml` 的 `open_work` 底下宣告。

結束碼 0 表示沒有違反，1 表示有違反，2 表示檢查程式判定不了。2 不是通過。乾淨的結果只涵蓋它認得的詞。詞彙是第一版的猜測，沒有在真實使用上調整過。

## 放在哪裡

放在你的專案本來就會看的地方：議題追蹤器、專案看板、repo 裡的一個檔案。UDS 不替你選。兩個性質重要：那個地方受版本控制、或至少每個需要它的工作階段都讀得到，而且不是只放在某一個人私有的助理記憶裡。等待另一個專案的工作，要記在兩個專案的工作階段都讀得到的地方。

## 本技能不宣稱的事

- 上面的規則來自一個專案。UDS 沒有證據顯示它們對其他專案有效。
- 門檻（兩個欄位、兩週、觀察七天算舊）是第一版的判斷，不是量測。
- 檢查程式讀的是表格和清單的結構。它分辨不出一則記錄是不是真的。

## 相關

- [open-work-tracking](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/open-work-tracking.md)：以前的標準，現在只供參考。它的要求編號是 OWT-001 到 OWT-029。
- [deferred-item-exit](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/deferred-item-exit.md)：被延後的項目必須離開它所在的文件。本技能從那一條結束的地方開始。
- [turn-completion-integrity](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/turn-completion-integrity.md)：檢查「說了卻沒做」的承諾。與第 5 步的報告不同，它可以擋住回合。
