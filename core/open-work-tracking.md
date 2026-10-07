# Open Work Tracking Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/open-work-tracking.md)

**Version**: 1.2.0
**Last Updated**: 2026-10-07
**Applicability**: Any project that carries work across more than one working session and risks losing an item between them
**Scope**: universal

---

## Purpose

The deferred-item-exit standard requires that a deferred item leave its document for a traceable exit. It deliberately does not say what that exit is made of, or what keeps it from rotting once the item has arrived there. **This standard is that downstream half**: given that a carrier for open work exists, what must be true of the carrier itself so that it stays trustworthy. See [deferred-item-exit](deferred-item-exit.md).

延後項目出口標準（deferred-item-exit）要求延後項目離開文件、抵達一個可追蹤的出口，
但刻意不規定那個出口長什麼樣、也不規定項目抵達之後什麼東西防止它腐壞。
**本標準是那個下游的一半**：假設一個承載開放工作的地方已經存在，
它自己必須具備什麼性質才不會慢慢變得不可信。見 [deferred-item-exit](deferred-item-exit.md)。

Three distinct ways work goes missing between sessions are routinely folded into one undifferentiated list, and the fold is itself part of the failure — a list built to catch all three catches none of them well:

三種不同的「工作不見了」的方式，常被塞進同一份沒有分別的清單，而**這個合併本身就是失敗的一部分**——
一份想同時接住三者的清單，通常一個都接不好：

| Symptom | Underlying problem | Mechanism needed |
|---|---|---|
| A new item surfaces mid-task and there is no low-friction way to record it | The item is time-sensitive; by the time recording it is convenient, it is forgotten | A capture point cheap enough to use without breaking the current task |
| An item is paused pending some other event | "Waiting" with no recorded release condition is indistinguishable from "forgotten" | A release condition recorded alongside the wait |
| A planned item has not been started and time passes | An item with no clock decays silently — nothing ever points back at it | A threshold, or a forced periodic look, that surfaces it again |

| 症狀 | 背後的問題 | 需要的機制 |
|---|---|---|
| 工作進行中冒出新項目，沒有低摩擦的地方可以記下它 | 項目有時效性，等到方便記錄時已經忘了 | 一個便宜到不會打斷當前工作的收件點 |
| 某項目因等待別的事件而暫停 | 「等待中」若沒有記錄解除條件，與「被忘記」無法分辨 | 與等待一起記錄的解除條件 |
| 已規劃的項目還沒動工，時間過去 | 沒有時鐘的項目會無聲腐爛——沒有東西會再指向它 | 一個門檻，或一次被迫的定期檢視，讓它重新浮現 |

Each requirement below traces to one row of that table, to one of four failures observed the day this standard's design was drafted, or (OWT-017–OWT-019) to two gaps found in 1.1.0, or (OWT-020–OWT-026) to two states 1.1.0 left unnamed (see [Evidence and calibration](#evidence-and-calibration)). **None of the mechanisms is prescribed** — per the same constraint [deferred-item-exit](deferred-item-exit.md) states for its own exits, and for the same reason (DEC-049: UDS defines relations that must hold, adoption layers choose what maintains them).

下面每一條要求都對應這張表的一列、對應本標準設計當天觀察到的四個失效之一，
或（OWT-017–OWT-019）對應 1.1.0 補上的兩個缺口、或（OWT-020–OWT-026）對應 1.1.0 沒有命名的兩個狀態
（見〈[證據與校準](#evidence-and-calibration)〉）。**沒有任何一個機制被規定**——
理由與 [deferred-item-exit](deferred-item-exit.md) 對自己出口的約束相同（DEC-049：
UDS 定義必須成立的關係，維持它的機制由採用層選擇）。

---

## How this standard is written — and why it is written that way

**Read this section before reading any requirement below. It governs all of them.**

UDS defines **activities**; adoption layers **orchestrate** them (DEC-049). A standard written as a workflow protocol, a file format, or a specific tool's configuration belongs to the adoption layer, not here — this is the same boundary [deferred-item-exit](deferred-item-exit.md) is held to, applied one layer downstream.

UDS 定義**活動**，採用層負責**編排**（DEC-049）。一份寫成工作流協定、檔案格式、
或特定工具設定的標準屬於採用層，不屬於這裡——這與 [deferred-item-exit](deferred-item-exit.md)
受的約束相同，只是套用在下游一層。

| Admissible here — **what** | Not admissible here — **how** |
|---|---|
| A property a capture point's field count must have | Which app, file, or ticket system is the capture point |
| A relation between a waiting item and its release condition | A scheduler or bot that polls for that condition |
| A property a "this is current" claim must be provable from | A specific hash function, diff tool, or CI provider |
| A relation between a reported count and what it could not see | A dashboard layout or report template |
| That a checkpoint exists at the point control returns to a human, and never blocks | Which hook system, shell, or cron implements it |
| A relation between an edit to a goal and the revision record that accounts for it | Which version-control system, approval tool, or file layout holds either |

| 這裡容許——**what** | 這裡不容許——**how** |
|---|---|
| 收件點欄位數必須具備的性質 | 收件點是哪個 app、檔案或工單系統 |
| 等待項目與解除條件之間必須存在的關係 | 輪詢那個條件的排程器或機器人 |
| 「這是最新的」這句宣稱必須從什麼可被證明 | 具體用哪個雜湊函式、diff 工具或 CI 供應商 |
| 一個回報數字與它看不到的部分之間的關係 | 儀表板版面或報告範本 |
| 控制權交回人的那一點存在一個確認點，且它永不阻斷 | 用什麼 hook 系統、shell 或 cron 實作它 |
| 一次目標的修改與說明它的修訂紀錄之間必須存在的關係 | 哪一種版本控制系統、核可工具或檔案配置承載其中任何一個 |

**Consequence, stated plainly**: this standard ships **no gate**. It says what must be true of a carrier for open work. Whether anything checks it is the adopting project's decision — [OWT-014](#requirements) and [OWT-015](#requirements) exist so that decision cannot be made silently.

**直說它的後果**：本標準**不附帶任何閘門**。它只說一個承載開放工作的地方必須具備什麼性質；
有沒有東西在檢查，是採用專案的決定——[OWT-014](#requirements) 與 [OWT-015](#requirements)
存在的目的，是讓那個決定沒辦法被默默做掉。

---

## The invariant

**A carrier of open work must (1) accept a new item without demanding classification, (2) record a release condition for every item it marks waiting, (3) generate any field a reliable source already determines, (4) disclose what it cannot see whenever it reports what remains, (5) be checked at the moment control returns from agent to human — by something that cannot fail the turn, (6) keep what the work is *for* apart from how far it has got, account for every edit to the former, (7) make every "next action" name something a reader can go and find, and (8) tell a waiting item nobody has asked about from one awaiting a reply, and give a fact it cannot see a stamped place to live — `unknown` a real value, every observation's age shown.**

**一個承載開放工作的地方，必須：（1）不要求分類就能收下新項目、（2）為每一個標為等待中的項目記下解除條件、
（3）對任何有可靠來源可推導的欄位改用生成、（4）回報還剩什麼時同時揭露看不到什麼、
（5）在控制權從 agent 交回人的那一刻被檢視——而且那個檢視不能讓回合失敗、
（6）把「這份工作為了什麼」與「做到哪了」分開存放，並替前者的每一次修改留下交代、
（7）讓每一個「下一步」都點名一個讀的人找得到的東西、（8）分得出「還沒問」與「已問、等回覆」，並讓看不見的事實有一個帶戳記的存放處——`unknown` 是正式的值、每筆觀察的年齡一律顯示。**

---

## Requirements

| ID | Requirement | Severity |
|---|---|---|
| **OWT-001** | A capture point for a new item requires no more than two fields to record it. Classification, priority, and ownership are triage-time actions, never entry-time gates | error |
| **OWT-002** | An item recorded as waiting states both what it is waiting for and what event counts as its release | error |
| **OWT-003** | A field whose value is fully derivable from version control, a spec marker, or a CI result is generated, not hand-written | error |
| **OWT-004** | A generated section's claim to be current is provable from the content it was generated from (e.g. a hash of the source), not asserted by a bare human-editable date | error |
| **OWT-005** | "Content-proven current" and "a date claims current, content unverified" are reported as two distinct states. A report that merges them into one pass state does not satisfy OWT-004 | error |
| **OWT-006** | Any "N items remain" figure states, beside it, how many sources it could see and how many it could not. The unseen portion is never read as zero | error |
| **OWT-007** | A summary of open work occurs at the point control returns from agent to human — not only at session start, in CI, or when a tracking document happens to be edited | error |
| **OWT-008** | The open-work summary's own exit path never changes the turn's outcome, on any input, including "many items remain" | error |
| **OWT-009** | Where the summary and a blocking check share an end-of-turn event, the summary's output precedes the blocking check's verdict | warning |
| **OWT-010** | Whether an item is waiting, unclassified, or dropped is determined from a structural field the carrier defines, not from scanning free-text wording alone | error |
| **OWT-011** | Where a wording heuristic supplements the structural field, its coverage is declared unknown, and a clean pass over it is not reported as "nothing was missed" | warning |
| **OWT-012** | An item left unclassified past the declared threshold is named individually in the open-work summary, not folded into an aggregate count | error |
| **OWT-013** | An item removed from the carrier without becoming a spec, a tracked item, or any other named destination carries a one-line reason. A drop with no reason is indistinguishable from silent deletion | error |
| **OWT-014** | Every requirement of this standard is expressible as a decidable relation over named artefacts. A requirement that cannot be so expressed does not belong in this standard | error |
| **OWT-015** | A check offered as evidence for any requirement here has been observed to report failure against a sample built to violate it. A check never observed red is not admissible evidence | error |
| **OWT-016** | Any window or threshold this standard's requirements reference carries its provenance, or is marked uncalibrated | warning |
| **OWT-017** | A carrier that holds a piece of work's goal, acceptance criteria, or constraints holds none of its progress or next action, and the reverse. This is decided by walking each carrier's structural fields (sections, columns, typed markers), never by file names. A progress update therefore never requires touching the goal | warning |
| **OWT-018** | Every change to a piece of work's goal, acceptance criteria, or constraints leaves a revision record stating what changed, who approved it, and why. A change with no approver is listed when control returns to a human (OWT-007); it is never silent | error |
| **OWT-019** | A "next action" field names at least one concrete object: a file path, a test name, a command, or a requirement identifier. A verb alone ("continue", "handle the rest") does not. This judges whether an object is named, never how well the sentence is worded | warning |
| **OWT-020** | An item marked waiting states which of two states it is in: `not-yet-asked` (the request is drafted or decided and has not been sent) or `asked-awaiting` (it has been sent and nothing has come back). A waiting item in neither is named individually in the open-work summary — never folded into a total, never counted as done | warning |
| **OWT-021** | An item in `not-yet-asked` names the draft or action whose sending releases it: a file path, a command, a test name or a requirement identifier (the recognition OWT-019 uses) | warning |
| **OWT-022** | An item in `asked-awaiting` carries `asked-at` (a calendar day with a year, not later than today) and satisfies OWT-002: what it waits for and what event releases it | warning |
| **OWT-023** | A hand-written row is allowed only for a fact the carrier cannot derive from version control, a spec marker or a CI result — for example whether a message was sent, whether the other side replied, whether something was approved. Each such row carries `observed-by` (who or what saw it), `observed-at` (a calendar day with a year, not later than today) and a value of `yes`, `no` or `unknown`; a row missing any of the three is a violation. A check decides that the fields exist and are well formed — never that the observation is true | warning |
| **OWT-024** | `unknown` is a value, not a blank: rows valued `unknown` are counted and shown apart in any summary and are never counted as complete. A row marked done whose value is `unknown` is a violation | warning |
| **OWT-025** | A summary of observations shows each observation's age (days since `observed-at`). An observation older than the declared threshold is reported as stale, counted apart, and never counted as confirmed. A stamp says who saw it and when — never that it still holds | warning |
| **OWT-026** | The exception in OWT-023 does not reach a field that version control, a spec marker or a CI result determines; OWT-003 stands. A check can only decide this against a word list of such subjects, so its coverage is unknown (OWT-011) | warning |

---

## Capture must cost almost nothing

**OWT-001** exists because a capture point with a third required field measurably stops being used. The failure is not hypothetical friction — it is the specific, observed shape of "a new idea surfaces mid-task, and recording it competes with the task that produced it." A field for classification, priority, or ownership asked for **at entry time** is a bet that the person interrupting their own work will pay that cost; the bet is lost more often than it is won, and a capture point nobody uses is not a capture point, it is a form.

**OWT-001** 之所以存在，是因為多一個必填欄位的收件點，量測到的結果是**不被使用**。
這不是假想的摩擦——它是「工作進行中冒出新想法，記下它要跟正在做的事搶時間」這個情境的具體形狀。
在**輸入當下**就要求分類、優先級或負責人，是在賭「正在被打斷的人願意付那個成本」，
而這個賭注輸的次數比贏的多；一個沒有人用的收件點不是收件點，是一張表單。

Triage — deciding where an item belongs — is a separate, later act. **OWT-012** and **OWT-013** govern what happens if triage never comes: the item is not allowed to sit invisible forever, and it is not allowed to disappear without a reason either.

分類（決定項目屬於哪裡）是另一個、之後才做的動作。**OWT-012** 與 **OWT-013**
規範分類永遠不來時會發生什麼：項目不准永遠隱形地待著，也不准無理由地消失。

---

## A waiting item without a release condition is a forgotten item wearing a status label

**OWT-002** names the difference between "paused, and something will bring it back" and "paused, forever, with a word attached that makes that not look like what it is." A release condition should be **machine-observable** where that is possible — a date, an identifier appearing somewhere, a file existing — so the item has a chance of surfacing itself instead of depending on a person remembering it exists. Where a machine-observable condition genuinely does not exist, a human-readable one is still required; **OWT-002 does not require automation, it requires that the condition be recorded at all.**

**OWT-002** 指出「暫停中、有東西會讓它回來」與「暫停中、永遠、只是貼了一個讓它看起來不像永遠的標籤」
之間的差別。解除條件應盡可能是**機器看得見的**——一個日期、一個會出現的識別字、一個檔案存在——
讓項目有機會自己跳出來，而不是依賴某個人記得它存在。真的找不到機器看得見的條件時，
仍然要求一個人看得懂的條件；**OWT-002 不要求自動化，只要求那個條件被記下來這件事本身**。

---

## A stamp is cheaper to write than the truth, and a check that reads only the stamp cannot tell the difference

This is the same failure DEX-006 names for a different artefact, one layer removed. There, an identifier being present was mistaken for the exit it points to being correct. Here, **a generated section's timestamp being recent is mistaken for its content being current** — and the two diverge in a way that is invisible to any check comparing only dates:

這是 DEX-006 在另一個 artefact 上點名的同一種失敗，只是換了一層。DEX-006 那邊，
識別字的存在被誤讀成它指向的出口是對的；這裡，**生成區段的時間戳很新，被誤讀成內容是新的**——
而這兩者分歧的方式，對任何只比較日期的檢查是隱形的：

- A stamp older than the content: caught trivially, by comparing the stamp to the file's own modification history.
- A stamp *newer* than the content, where the content itself went stale: **invisible**, because "the stamp is recent" is exactly what a correct reconciliation also looks like.

- 戳比內容舊：拿戳跟檔案自己的修改紀錄一比就抓到，微不足道。
- 戳**比內容新**，而內容本身已經過期：**隱形**，因為「戳是新的」正是一次正確對帳看起來的樣子。

**OWT-004** requires the currency claim to be provable from the content itself — for example, a hash of the source the section was generated from, stored beside the section, so a mismatch is detectable without trusting that whoever last touched the date also actually reconciled the content. **OWT-005** requires that "provably current" and "a date says so, unverified" never share one pass/fail bit, for the same reason DEX-005/DEX-006 require it of a deferred item's exit: an unknown reported as a pass is worse than an unknown reported as unknown, because the second one is still findable.

**OWT-004** 要求「這是最新的」這句宣稱可以從內容本身被證明——例如儲存一份該區段
是從哪個來源生成的雜湊、放在區段旁邊，這樣不比對內容也能偵測到不一致，
不必信任「最後動手改日期的人也真的對過帳」。**OWT-005** 要求「內容可證明是最新的」
與「日期這麼說、內容未驗證」永遠不共用同一個通過／失敗位元，理由與 DEX-005／DEX-006
要求延後項目出口做同一件事相同：一個被回報成通過的未知，比一個被回報成未知的未知更糟，
因為後者還找得到。

---

## Coverage must state its own blindness

**OWT-006** requires that any "N items remain" figure be printed beside the count of sources it could see and the count it could not — not because the unseen count is expected to be zero, but because a reader cannot tell the difference between "11.7% coverage, and 386 items are invisible to this figure" and "11.7% coverage is complete" unless the denominator is printed next to it. A coverage figure with no stated blindness reads as complete by default, and that default is the failure this requirement exists to prevent.

**OWT-006** 要求任何「還有 N 項」的數字旁邊，同時印出它看得見多少來源、看不見多少來源——
不是因為預期看不見的數字會是零，而是因為讀者分不出「涵蓋率 11.7%，而且有 386 項
對這個數字完全隱形」與「涵蓋率 11.7% 就是全貌」，除非分母被印在旁邊。
一個沒有聲明盲區的涵蓋率數字，預設會被讀成完整——而那個預設正是這條要求要防的失效。

---

## The checkpoint is a report, not a gate

**turn-completion-integrity** ([TCI](turn-completion-integrity.md)) and this standard's OWT-007–OWT-009 both attach to the same event — the moment an agent's turn ends and control returns to a human — and they are built to behave in opposite ways on purpose. Wiring both to one event without understanding why they differ produces either a checkpoint that blocks on something that is nearly always true, or a report mistaken for a gate:

**turn-completion-integrity**（[TCI](turn-completion-integrity.md)）與本標準的 OWT-007–OWT-009
都掛在同一個事件——agent 的回合結束、控制權交回人類的那一刻——而它們被刻意設計成
**行為相反**。把兩者接到同一個事件卻不理解為什麼不同，會產出「擋在一件幾乎永遠為真的事情上的
確認點」，或是「被誤認成閘門的報告」，兩者都不對：

| | [turn-completion-integrity](turn-completion-integrity.md) | This standard (OWT-007–009) |
|---|---|---|
| What it watches | The agent's own last message, for a first-person commitment that was stated and then abandoned | Whatever the carrier holds, for items with no release condition, no exit, or left unclassified past threshold |
| Default state | Rare — it fires only when a specific commitment was made in that message and then dropped | Common — "some work is still open" is close to always true |
| What a violation does | Blocks the turn from ending until the commitment is resolved or its blocker is named | Never blocks. It can only report (OWT-008) |
| Why the difference | The event it watches for is rare enough that blocking on it does not wear out its welcome | TCI's own rule names the reason this one cannot be a gate: *"A gate that is true on every turn is turned off, and then it protects nothing"* (TCI R4). Open work being non-empty is close to always true, so this checkpoint is built to never withhold control |
| Ordering when both are wired to the same event | — | Reports first (OWT-009), so its output is visible even on a turn TCI then blocks |

| | [turn-completion-integrity](turn-completion-integrity.md) | 本標準（OWT-007–009） |
|---|---|---|
| 它在看什麼 | agent 自己最後一則訊息，看有沒有一個第一人稱承諾被說出口又被放棄 | 承載庫裡的任何項目，看有沒有沒解除條件的、沒出口的、或過門檻還沒分類的 |
| 預設狀態 | 罕見——只在那則訊息裡明確做了承諾又被丟下時才觸發 | 常見——「還有工作沒做完」幾乎永遠為真 |
| 違反時會怎樣 | 擋住回合結束，直到承諾被解決或說明卡在誰身上 | 永不阻斷。只能回報（OWT-008） |
| 為什麼行為相反 | 它在看的事件本身夠稀少，擋在它上面不會把耐性用完 | TCI 自己的規則已經寫出這裡不能做成閘門的理由：**「一個在每個回合都為真的閘門會被關掉，關掉之後它什麼都不保護」**（TCI R4）。開放工作非空幾乎永遠為真，所以這個確認點被設計成永不保留控制權 |
| 兩者掛同一事件時的順序 | — | 先回報（OWT-009），所以即使那個回合隨後被 TCI 擋下，它的輸出仍然可見 |

---

## Anchors: structure, not wording

To decide whether an item is waiting, unclassified, or dropped, **read the carrier's own structural field for that state** — a status column, a typed marker, a section heading — the same way [deferred-item-exit](deferred-item-exit.md)'s DEX-007 requires walking a document's structure rather than its wording to find deferred items. **OWT-010** requires the structural field to exist and be the primary source of truth.

判定一個項目是等待中、未分類、還是已丟棄，要**讀承載庫自己描述那個狀態的結構欄位**——
一個狀態欄、一個型別化標記、一個小節標題——與 [deferred-item-exit](deferred-item-exit.md)
的 DEX-007 要求走訪文件結構而非措辭來找延後項目是同一個道理。**OWT-010** 要求那個結構欄位
存在，並且是真相的主要來源。

A free-text wording scan ("contains the phrase 'waiting on'") can legitimately supplement the structural field — it catches items dropped into prose that never made it into the structured field. But it inherits the same limit [class-level-fix](class-level-fix.md) names for any enumerated list: **it is correct until the next member arrives, phrased a way the list did not anticipate.** **OWT-011** requires its coverage be declared unknown, and forbids a clean pass over it from being reported as "nothing was missed."

一次自由文字措辭掃描（「含有『等待』這個詞」）可以正當地補充結構欄位——
它能抓到那些寫進散文、從沒真的填進結構欄位的項目。但它繼承了 [class-level-fix](class-level-fix.md)
對任何列舉清單指出的同一個限制：**它正確到下一個成員用清單沒預料到的寫法出現為止。**
**OWT-011** 要求它的涵蓋率明示為未知，且禁止它跑出乾淨結果就被回報成「沒有漏掉」。

---

## Intent and progress are two different kinds of fact

**Intent** — the goal, the acceptance criteria, the constraints — says what "done" means. It changes rarely, and only because someone decided it should. **Progress** — where the work stands, what remains, the next action, what is blocking — changes every session and is the working agent's to write. When both live in one carrier, every routine progress update is an edit to the very document that defines "done", and a change to the definition cannot be told apart, in review or in a diff, from bookkeeping. **OWT-017** separates them. The form is free: a specification beside a work log, or a two-file goal/state pair, both satisfy it. **The test is structure, not file names** — walk each carrier's sections, columns, and typed markers, and ask whether one carrier holds both kinds.

**意圖**——目標、驗收條件、限制——說的是「完成」是什麼意思。它很少改，而且只在有人決定要改時才改。
**進度**——做到哪、還剩什麼、下一步、卡在哪——每個工作階段都在變，由做事的 agent 來寫。
兩者住在同一個載體時，每一次例行的進度更新，都是在編輯那份定義「完成」的文件本身，
而「定義被改了」在審查裡、在 diff 裡，都與日常記帳分不出來。**OWT-017** 把它們分開。
形式不限：規格檔搭配工作紀錄、或目標／狀態兩個檔，都符合。**判準是結構，不是檔名**——
走訪每個載體的小節、欄位與型別化標記，問同一個載體是否同時裝著兩種東西。

**OWT-018** names the failure that separation alone does not prevent: an acceptance criterion is revised in the middle of the work, and nothing records who agreed. Afterwards "every criterion is met" is true — of a different set of criteria. It is the same shape as a fresh stamp over stale content: the edited goal reads exactly like a goal that always said that. So every change to intent leaves a record of **what changed, who approved it, and why**. A change with no approver is not forbidden — an agent legitimately proposes changes, and forbidding them only teaches it to make them silently — but it is **listed when control returns to a human** (OWT-007). Like everything attached to that event, the listing reports; it never blocks (OWT-008). What a check can decide here is decidable and no more: that the intent changed, that a new record exists, that the record is complete, and whether its approver is filled in. **It cannot decide whether the record honestly describes the change** — that is a claim about meaning, not a relation over artefacts (OWT-014), and this standard does not pretend otherwise.

**OWT-018** 點名的，是光靠分開存放防不了的失效：工作進行到一半，某條驗收條件被改了，
而沒有任何紀錄說明誰同意過。事後「每一條驗收都滿足了」依然為真——只是針對另一組條件。
它與「新戳蓋在舊內容上」是同一個形狀：被改過的目標，讀起來與一個一直這麼寫的目標一模一樣。
所以每一次對意圖的修改，都要留下**改了什麼、誰核可、為什麼**的紀錄。沒有核可者的修改並不被禁止——
agent 正當地會提出修改，禁止只會教它學會靜默地改——但它要在**控制權交回人的那一刻被列出來**（OWT-007）。
如同掛在那個事件上的一切，列出只是回報，永不阻斷（OWT-008）。這裡檢查能判定的就只有可判定的部分：
意圖有沒有變、有沒有新增一筆紀錄、那筆紀錄是否完整、核可者欄位有沒有填。
**它判定不了那筆紀錄是否誠實描述了這次修改**——那是關於語意的宣稱，不是 artefact 之間的關係（OWT-014），
本標準不假裝它做得到。

**Why these severities.** OWT-018 is an `error` because the failure is silent and there is exactly one moment it can be caught — when the edit happens; afterwards the edited text is all anyone can read. OWT-017 is a `warning` because separation is a means: separated carriers with no revision record (OWT-018) still leak, and one carrier with a strict revision record still serves OWT-018's purpose, so the harm of a violation is indirect. OWT-019 is a `warning` because a structural check for "names an object" is necessarily coarse — a named object can still be irrelevant — and a violation costs the next session time rather than costing the work.

**這些嚴重度的理由。** OWT-018 是 `error`，因為這個失效是靜默的，而它只有一個時刻能被抓到——修改發生的那一刻；
事後所有人能讀到的，就只剩被改過的文字。OWT-017 是 `warning`，因為分開存放只是手段：
分開了卻沒有修訂紀錄（OWT-018）照樣漏，單一載體配上嚴格的修訂紀錄照樣達成 OWT-018 的目的，
所以違反的傷害是間接的。OWT-019 是 `warning`，因為「有點名對象」的結構檢查必然粗糙——
被點名的對象仍可能無關——而違反的代價是下一個工作階段的時間，不是工作本身。

---

## A next action that names nothing is a mood

"Continue the implementation" and "handle the rest" cannot be told apart from a forgotten item: the next session has nothing to start from and must re-derive where the work stood, which is the cost this whole standard exists to avoid. **OWT-019** requires the "next action" field to name at least one object a reader can go and find — a file path, a test name, a command, or a requirement identifier. It is a **structural** test (is an object named?), not a judgment about wording; a well-phrased sentence that names nothing still fails, and a terse one that names a test passes. That keeps it inside OWT-010 and OWT-014.

「繼續實作」與「處理剩下的」，與一個被遺忘的項目分不出來：下一個工作階段沒有起點可以開始，
得重新推導工作停在哪——而那正是本標準整個存在要避免的成本。**OWT-019** 要求「下一步」欄位
至少點名一個讀的人找得到的對象——檔案路徑、測試名稱、指令、或需求編號。
它是**結構**判準（有沒有點名對象），不是措辭好壞的判斷；措辭漂亮但什麼都沒點名的句子照樣不過，
簡短但點了一個測試名稱的句子照樣過。這讓它留在 OWT-010 與 OWT-014 的範圍之內。

A check reports three outcomes, never one green: **named and resolved** (the object was found — for instance the path exists), **named, unresolved** (an object is named but could not be found — legitimate when the next action is to create it), and **unnamed** (a violation). Recognising *that* a string is a path, a command, a test name, or an identifier is itself a pattern match, so per OWT-011 its coverage is declared unknown: an unrecognised format is reported as unnamed, and a clean pass never means "every next action is specific".

檢查回報三種結果，而不是一個綠燈：**點名且已找到**（對象被找到——例如路徑存在）、**點名但未找到**
（有點名對象但找不到——當下一步就是要建立它時是正當的）、**未點名**（違反）。
辨認「這串字是路徑、指令、測試名稱還是編號」本身是樣式比對，所以依 OWT-011 其涵蓋率明示為未知：
認不出的格式會被回報為未點名，而乾淨的通過絕不表示「每個下一步都夠具體」。

---

## A waiting item nobody has asked about is not waiting

**OWT-002** asks that a waiting item say what it waits for and what event releases it. Two very different things satisfy that sentence. A message that is **drafted and never sent** waits for "somebody sends it". A message that **was sent** waits for "the other side replies". The carrier cannot tell them apart, and neither can an assistant that cannot see the chat — and the difference is the whole point: nothing will ever arrive for the first until a person acts. **OWT-020** names the two states (`not-yet-asked`, `asked-awaiting`) and requires every waiting item to be in one of them; one that is in neither is named individually, the way OWT-012 names an item left unclassified, and is never counted as done.

Each state then carries what makes it checkable. A `not-yet-asked` item names the draft or action (**OWT-021**) — the same recognition OWT-019 uses, so there is one vocabulary — because "ask legal" with no file or command behind it is a mood, not a draft. An `asked-awaiting` item carries `asked-at` (**OWT-022**), which is what starts a clock: from then on the item has an age, and an item with an age can be surfaced again by a threshold. Both read the carrier's structural status field (OWT-010), never the wording around it. The severity is `warning` and the state words are uncalibrated (OWT-016): the aim is to make the two states nameable, not to turn every existing carrier red on the day the standard is published.

---

## A fact nobody can derive needs a stamp, an honest "unknown", and a visible age

Some facts about open work have no source an assistant can read: whether a message was sent, whether the other side answered, whether something was approved. **OWT-003** allows only generation from a derivable source, and the table below rejects a hand-written state file for good reason — it goes stale, and a stamp newer than stale content is invisible. For these facts there is nothing derivable to generate from; refusing hand-written rows outright leaves them nowhere to live, and they end up in free text where nothing counts them.

1.2.0 therefore admits a **narrow exception** (**OWT-023**–**OWT-026**), on three conditions. The row says **who saw it and when** (`observed-by`, `observed-at`). Its value is `yes`, `no` or **`unknown`**, and `unknown` is a real value, counted and shown apart and never complete (**OWT-024**) — the same reading as OWT-006: what could not be seen is not zero. And the report shows **every observation's age** (**OWT-025**); one older than the declared threshold is reported as stale, counted apart, and never confirmed. The exception does not reach what version control, a spec marker or a CI result already determines (**OWT-026**), because OWT-003 is not relaxed.

What this does not claim is that the whole thing is honest. A stamp says that someone saw it and when; **it does not say it is still so**, and the report is built around that: the age is printed beside the value, so the staleness a stamp would otherwise hide is the first thing a reader sees. And what a check can decide is only what is decidable: that `observed-by` is filled in, that `observed-at` is a real day, that the value is in the domain. **It cannot decide that `observed-by` names the person who actually looked, or that the value is true** — that is a claim about the world, not a relation over artefacts (OWT-014), and this standard does not pretend otherwise. The stale threshold has no measurement behind it (OWT-016).

**Why these severities (1.2.0).** OWT-020 to OWT-026 are all `warning`: the state words, field names and the stale threshold are a first vocabulary with no measurement behind it (OWT-016), and a violation costs a reader time rather than costing the work. A stricter level would turn every carrier that predates the two states red on the day this standard is published; `warning` lets an adopter see the list first. **The commands exit 1 on any violation, `warning` included** — as `uds open-work next-action` already does for OWT-019 — so an adopter who wires one into a gate decides whether a warning blocks.

---

## 一個沒人問過的等待項目，不是在等待

**OWT-002** 要求等待中的項目說明在等什麼、什麼事件算解除。有兩件差別很大的事都滿足這句話。一則**草擬了、從沒送出**的訊息，等的是「有人把它送出去」；一則**已經送出**的訊息，等的是「對方回覆」。承載庫分不出這兩者，看不到聊天的助理也分不出——而差別正是重點：第一種在有人動手之前，永遠不會有任何東西到來。**OWT-020** 為這兩個狀態命名（`not-yet-asked`、`asked-awaiting`），並要求每個等待項目必處於其一；兩者皆非的項目被個別點名——與 OWT-012 點名未分類項目的方式相同——而且絕不算成已完成。

每個狀態再帶上讓它可被檢查的東西。`not-yet-asked` 的項目點名那份草稿或那個動作（**OWT-021**）——沿用 OWT-019 的辨認方式，所以詞彙只有一份——因為只有「問法務」、背後沒有檔案或指令，是一種心情，不是草稿。`asked-awaiting` 的項目帶有 `asked-at`（**OWT-022**），那是讓時鐘開始走的東西：從那一刻起項目有了年齡，有年齡的項目才能被門檻再次浮現。兩者都讀承載庫的結構狀態欄（OWT-010），絕不讀它周圍的措辭。嚴重度是 `warning`、狀態詞彙未校準（OWT-016）：目的是讓這兩個狀態能被命名，不是在標準發布當天讓所有既有載體一次變紅。

---

## 沒有人能推導的事實，需要戳記、誠實的「未知」與看得見的年齡

開放工作裡有些事實，助理沒有任何來源可以讀：訊息是否已寄出、對方是否已回覆、某事是否已核准。**OWT-003** 只允許從可推導的來源生成，而下方的表格拒絕手寫狀態檔是有道理的——它會過期，而比過期內容新的戳是隱形的。這類事實沒有可推導的來源可供生成，把手寫列一律拒絕，就讓它們無處可住，最後流落到沒有任何東西會計數的自由文字裡。

因此 1.2.0 容許一個**窄例外**（**OWT-023**–**OWT-026**），附三個條件。那一列寫明**誰在何時看到**（`observed-by`、`observed-at`）。它的值是 `yes`、`no` 或 **`unknown`**，而 `unknown` 是正式的值，單獨計數、單獨顯示、永遠不算完成（**OWT-024**）——與 OWT-006 同一種讀法：看不到的不是零。而且報告顯示**每筆觀察的年齡**（**OWT-025**）；超過宣告門檻的被回報為「觀察已舊」、另計、不算已確認。這個例外不及於版本控制、規格標記或 CI 結果已能決定的東西（**OWT-026**），因為 OWT-003 沒有被放寬。

這不是在宣稱整件事都誠實。戳只說有人在某時看到；**它不說現在仍然如此**，報告就是圍繞這一點建的：年齡印在值的旁邊，所以戳原本會藏起來的過期，是讀者第一眼看到的東西。而檢查能判定的只有可判定的部分：`observed-by` 有沒有填、`observed-at` 是不是一個真實的日子、值在不在值域內。**它判定不了 `observed-by` 填的是不是真的去看過的人，也判定不了那個值是否為真**——那是關於世界的宣稱，不是 artefact 之間的關係（OWT-014），本標準不假裝做得到。「觀察已舊」的門檻沒有任何量測支持（OWT-016）。

**這些嚴重度的理由（1.2.0）。** OWT-020 到 OWT-026 全是 `warning`：狀態詞、欄位名與「觀察已舊」的門檻是第一版詞彙，沒有任何量測支持（OWT-016），而違反的代價是讀的人的時間，不是工作本身。更嚴的等級，會讓所有早於這兩個狀態存在的載體在標準發布當天變紅；`warning` 讓採用者先看到清單。**但指令對任何違反都回結束碼 1，`warning` 也一樣**——`uds open-work next-action` 對 OWT-019 本來就是如此——所以把其中一支接進閘門的採用者，自己決定警告要不要擋。

---

## What this standard deliberately does not adopt

The two 1.1.0 additions (OWT-017–OWT-019: goal apart from progress with a revision record, and a next action that names an object) were prompted by a prompt a user forwarded, **whose author and provenance are unknown and which ships no implementation**. Only its design shapes were borrowed; none of its claims is cited here. The rest of what it proposes was examined and **not** adopted, for reasons about mechanism rather than taste:

| Not adopted | Why (mechanism) |
|---|---|
| A hand-written state file as the source of truth for any state a reliable source already determines | A hand-written state goes stale, and a stamp newer than stale content is invisible (the failure OWT-004 and OWT-005 exist for). Saying "trust version control when they disagree" without a mechanism that reconciles the file with version control adopts a known-stale source. OWT-003 already requires derivable fields to be generated. **Since 1.2.0 there is one narrow exception (OWT-023–OWT-026)**: a hand-written row for a fact nothing can derive — whether a message was sent, whether the other side replied. It is admitted only with a stamp of who saw it and when, a value that may honestly be `unknown`, and an age shown in every report, and it never reaches a field version control, a spec marker or a CI result determines. The objection above is answered, not set aside: it was that staleness is invisible, and here the age is printed beside every value |
| A fixed start-of-work ritual (read the files, then check version control, then verify) | The hand-off points are already governed: OWT-007 at turn end, and [turn-completion-integrity](turn-completion-integrity.md). A start-of-work ritual is configured in each agent tool's own instructions; writing it here yields a requirement no check over an artefact can decide, which OWT-014 excludes |

1.1.0 的兩項新增（OWT-017–OWT-019：目標與進度分開並留下修訂紀錄、以及點名對象的下一步），起因是使用者轉貼的一份提示詞——**作者與出處不明，也沒有任何實作**。
只借了它的設計形狀，本文不引用它的任何宣稱。它提出的其餘部分經過檢視、**沒有**採納，
理由是機制層的，不是口味：

| 不採納 | 理由（機制層） |
|---|---|
| 以手寫狀態檔作為任何「已有可靠來源可決定」之狀態的真相 | 手寫狀態會過期，而「戳比過期內容新」是隱形的（OWT-004、OWT-005 存在的起因）。只說「兩者不一致時以版本控制為準」，卻沒有任何機制讓該檔與版本控制對帳，就是採納一個已知會過期的來源。OWT-003 已經要求可推導的欄位改用生成。**自 1.2.0 起有一個窄例外（OWT-023–OWT-026）**：對「沒有任何東西能推導」的事實——訊息是否已寄出、對方是否已回覆——容許一列手寫。它只有在附上誰何時看到的戳記、值可以誠實地是 `unknown`、且每份報告都顯示年齡時才被容許，並且絕不及於版本控制、規格標記或 CI 結果已能決定的欄位。上面的反對理由是被回答了，不是被擱置：那個理由是過期看不見，而這裡年齡就印在每個值旁邊 |
| 固定的開工儀式（讀檔→查版本控制→驗證） | 交接點已被管住：回合結束有 OWT-007，另有 [turn-completion-integrity](turn-completion-integrity.md)。開工儀式要靠各代理工具自己的指示來設定；寫進這裡只會得到一條沒有任何 artefact 上的檢查判定得了的要求，而那正是 OWT-014 排除的東西 |

---

## A requirement that cannot be checked is not a requirement here

**OWT-014** is a constraint on this standard's own contents, the same role [deferred-item-exit](deferred-item-exit.md)'s DEX-003 plays for that standard. Every requirement above names artefacts and a relation between them that a reader — or something a project builds — can decide. A property this standard cared about but could not phrase this way was left out of the table rather than included as an unenforceable aspiration. One example: "the capture point actually gets used" is exactly the outcome OWT-001 exists to protect, but it is a claim about human behavior over time, not a decidable relation over an artefact at a point in time — so it is stated here, in prose, as the *reason* for OWT-001, and is not itself a numbered requirement.

**OWT-014** 是對本標準自身內容的約束，與 [deferred-item-exit](deferred-item-exit.md) 的
DEX-003 扮演的角色相同。上面每一條都指名了 artefact 與它們之間可被判定的關係。
一個本標準在意、卻無法這樣措辭的性質，會被排除在表格之外，而不是被寫成一條無法執行的期望。
舉一例：「收件點真的有被使用」正是 OWT-001 存在要保護的結果，但那是一句關於人類長期行為的宣稱，
不是某個時間點上 artefact 之間可判定的關係——所以它以散文形式出現在這裡，
作為 OWT-001 存在的**理由**，而不是一條有編號的要求。

### A check that has never been red

**OWT-015** carries [deferred-item-exit](deferred-item-exit.md)'s DEX-004 forward unchanged in substance: **a check that has never failed and a check that cannot fail produce identical output.** Until a check claimed as evidence for any requirement above has been observed reporting failure against a sample deliberately built to violate that requirement, its passing is evidence that something ran, not evidence that the requirement holds. The procedure for producing that evidence, and why it must be done per sub-requirement rather than in aggregate, is not restated here — see [class-level-fix](class-level-fix.md) and [verification-evidence](verification-evidence.md).

**OWT-015** 原封不動地延續 [deferred-item-exit](deferred-item-exit.md) 的 DEX-004：
**一支從未失敗過的檢查，與一支不可能失敗的檢查，輸出一模一樣。** 在一支被宣稱為上面
任一要求之證據的檢查，被觀察到「對一個刻意違反該要求的樣本回報失敗」之前，
它的通過只是「有東西跑過」的證據，不是「要求成立」的證據。產生這份證據的程序、
以及為何必須逐條而非整體進行，此處不複述——見 [class-level-fix](class-level-fix.md)
與 [verification-evidence](verification-evidence.md)。

### Thresholds carry their provenance

**OWT-016** carries DEX-009 forward: a threshold with no recorded origin is a threshold nobody can evaluate changing. This standard's own two numeric thresholds are marked accordingly in [Evidence and calibration](#evidence-and-calibration) below, rather than being asserted as settled.

**OWT-016** 延續 DEX-009：一個沒有來歷的閾值，是一個沒有人能評估要不要改的閾值。
本標準自己的兩個數字閾值在下方〈[證據與校準](#evidence-and-calibration)〉裡照此標示，而非被斷言為已定案。

---

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| A capture form with three or more required fields | Measurably stops being used; the friction it adds is paid by whoever is interrupting their own work |
| "We'll revisit this" with no release condition | Indistinguishable from forgotten; nothing brings it back |
| A hand-typed status that duplicates what git or CI already know | Two owners, one of which is never updated |
| A "last reconciled" date with no content-derived proof | Looks identical whether the content was actually re-checked or the date was just typed |
| "47 items remain" with no stated denominator | Reads as complete by default; the invisible majority is mistaken for "done" |
| A checkpoint at shell startup instead of at turn end | Drifts for exactly as long as nobody happens to open a new shell |
| A checkpoint that blocks the turn on "some work remains" | Fires on every turn; a gate that is always true gets disabled, and then protects nothing |
| Triage status read only from prose wording | Correct until an item is phrased a way the wording list did not anticipate |
| An item that silently vanishes from the carrier | Indistinguishable from a bug that lost it |
| A goal or acceptance criterion edited with no record of who agreed | "Every criterion is met" stays true, of a different set of criteria; the edited goal reads as if it always said that |
| A hand-written state file treated as the source of truth for what version control or CI already knows | Goes stale, and a stamp newer than the stale content cannot be seen |
| A next action of "continue implementation" or "handle the rest" | Names nothing to start from; indistinguishable from a forgotten item |
| A waiting item with no record of whether anyone has asked | A draft nobody sent and a request nobody answered look identical; waiting never releases the first |
| A hand-written "sent / replied / approved" with no name and no date | Cannot be told from a guess, and when it goes stale nothing shows it |
| An observation nobody could make, counted as "no" or as done | A fact that could not be seen is read as absent or complete; `unknown` is a value, not a zero |

| 反模式 | 為什麼會失敗 |
|---|---|
| 三個以上必填欄位的收件表單 | 可量測地不再被使用；那份摩擦由正在打斷自己工作的人承擔 |
| 「之後再看」而沒有解除條件 | 與被忘記無法分辨；沒有東西會讓它回來 |
| 手動輸入、重複 git 或 CI 已知資訊的狀態 | 兩個擁有者，其中一個永遠不會被更新 |
| 沒有內容證明的「最後對過帳」日期 | 內容真的被重新核對過，跟日期只是被打上去，看起來一模一樣 |
| 「還有 47 項」而不寫分母 | 預設被讀成完整；看不見的大多數被誤讀成「都做完了」 |
| 確認點掛在 shell 啟動而不是回合結束 | 只要沒人剛好開新 shell，它就持續漂移 |
| 確認點擋住回合結束、理由是「還有工作沒做完」 | 每個回合都會觸發；永遠為真的閘門會被關掉，關掉之後什麼都不保護 |
| 分類狀態只靠散文措辭判讀 | 正確到某個項目用清單沒預料到的方式寫出來為止 |
| 項目從承載庫裡無聲消失 | 與一個弄丟它的 bug 無從分辨 |
| 目標或驗收條件被改了，卻沒有任何「誰同意」的紀錄 | 「每一條驗收都滿足」依然為真，只是針對另一組條件；被改過的目標讀起來像一直這麼寫 |
| 把手寫的狀態檔當成版本控制或 CI 早已知道之事的真相 | 會過期，而比過期內容新的戳看不見 |
| 下一步寫「繼續實作」或「處理剩下的」 | 沒有點名任何可以開始的東西；與被遺忘的項目無從分辨 |
| 等待項目沒有任何「有沒有人問過」的紀錄 | 沒人送出的草稿與沒人回的請求看起來一模一樣；等待永遠不會讓前者解除 |
| 手寫的「已寄出／已回覆／已核准」，沒有名字也沒有日期 | 與猜測無從分辨，過期時也沒有任何東西顯示 |
| 一個沒有人能做的觀察，被算成「否」或已完成 | 看不到的事實被讀成不存在或已完成；`unknown` 是一個值，不是零 |

---

## What enforces this standard

**Nothing in UDS gates on it, and that is recorded rather than implied.** UDS states the relations a carrier of open work must satisfy; whether anything decides them is the adopting project's call, per the [writing constraint](#how-this-standard-is-written--and-why-it-is-written-that-way) above — the same boundary [deferred-item-exit](deferred-item-exit.md) draws for its own exits. Since 1.1.0 UDS does ship one **reference decision procedure** for OWT-017–OWT-019 — `uds open-work next-action | revision | separation` from the npm package (`uds open-work self-test` runs the checker's own arms; from a clone of the UDS repository `node scripts/check-open-work-tracking.mjs` runs the same code) — offered as evidence in the OWT-015 sense — it has been observed to fail against violating samples — for an adopter to run or to reimplement. It is not wired into any UDS release gate, because UDS carries no open-work carrier for it to check. For OWT-019 it reads a next-action field in three shapes, all through one vocabulary: a heading section, an inline label, and every row of a table column whose header is in that vocabulary. A table row whose cell count differs from its header is listed as undecidable (never read as empty; with no violation elsewhere the exit code is 2, not a pass), and an empty, `—`, `-` or done cell is counted and not evaluated — not a violation, because OWT-019 judges a next action that was written, and a missing one is a different failure it does not decide.

Since 1.2.0 the same module also ships `uds open-work waiting` (OWT-020–OWT-022) and `uds open-work observations` (OWT-023–OWT-026), with the same exit codes (0 no violation, 1 violation, 2 cannot decide). Today's date is injected (`--now`) and never read inside a rule, so a result does not drift with the day; `--stale-after` declares the threshold. Both read tables and list items through their structural field names, in English and in Chinese. A table with neither an `observed-by` nor an `observed-at` column is not read as an observation carrier, and a waiting item written in words the vocabulary does not hold is read as not waiting — so a clean pass covers only what was recognised, and every run says so (OWT-011). `uds open-work self-test` runs a violating and a satisfying sample for each of OWT-020–OWT-026, and mutation tests show that removing any one detection turns a test or the self-test red (OWT-015). Like the 1.1.0 checks, none of it is wired into a UDS release gate.

**UDS 不對本標準設任何閘門，而這件事是被記錄的，不是被暗示的。** UDS 陳述一個承載開放工作的地方
必須滿足的關係；有沒有東西去判定它，依上面的[寫法約束](#how-this-standard-is-written--and-why-it-is-written-that-way)，
是採用專案的決定——與 [deferred-item-exit](deferred-item-exit.md) 對自己出口劃的界線相同。
自 1.1.0 起，UDS 為 OWT-017–OWT-019 附上一支**參考判定程序**（`scripts/check-open-work-tracking.mjs`），
作為 OWT-015 意義上的證據——它已被觀察到對違反的樣本回報失敗——供採用者直接執行或自行重做。
它沒有接進任何 UDS 發版閘門，因為 UDS 本身沒有承載開放工作的地方可供它檢查。

自 1.2.0 起，同一份程式還附上 `uds open-work waiting`（OWT-020–OWT-022）與 `uds open-work observations`（OWT-023–OWT-026），結束碼相同（0 無違反、1 違反、2 判定不了）。今天的日期是被注入的（`--now`），絕不在規則裡讀時鐘，所以結果不會隨日子漂移；`--stale-after` 宣告門檻。兩者都以結構欄位名讀表格與清單項目，中英文皆可。沒有 `observed-by` 也沒有 `observed-at` 欄的表格不被讀成觀察載體；用詞彙裡沒有的字寫成的等待項目，被讀成「不是等待」——所以乾淨的通過只涵蓋被辨認出來的部分，而每次執行都這麼說（OWT-011）。`uds open-work self-test` 對 OWT-020–OWT-026 每一條各跑一個違反的樣本與一個符合的樣本，突變測試顯示拿掉任何一個偵測都會讓某個測試或自測變紅（OWT-015）。與 1.1.0 的檢查相同，它都沒有接進任何 UDS 發版閘門。

What this standard does do is make that call visible: OWT-014 guarantees every requirement here **can** be decided, OWT-015 fixes what it takes for a decision to count, and OWT-005/OWT-011 fix what a partial decision is allowed to print.

本標準做的事，是讓那個決定顯形：OWT-014 保證這裡每一條**能**被判定，OWT-015 固定
「一次判定要算數需要什麼」，OWT-005／OWT-011 固定「一次不完整的判定容許印出什麼」。

---

## Evidence and calibration

This standard's shape comes from one adopting project's observations made and acted on the same day the standard was drafted (XSPEC-427, 2026-09-23): a capture point, a summary script with self-test arms, and an end-of-turn hook, built and run for the first time that day. **That reference implementation is hours old at the time of writing, has one user, and has run in one repository.** It is cited here only as the origin of the requirements' shape, never as validation of the specific thresholds below.

本標準的形狀來自一個採用專案在標準草擬**同一天**做出並實跑的觀察（XSPEC-427，2026-09-23）：
一個收件點、一支帶自測臂的摘要腳本、一個掛在回合結束的 hook，當天第一次建立並執行。
**寫下這段文字時，那個參考實作只有幾小時大、只有一個使用者、只在一個 repo 跑過。**
它在此被引用，僅作為要求形狀的出處，**絕不作為下面具體閾值的驗證**。

- **OWT-001's "no more than two fields"** and **OWT-012's "past the declared threshold"** (illustrated at two weeks in the originating observation) are **initial judgments, not measurements** — per OWT-016. No controlled comparison exists yet between two fields and three, or between a two-week and a four-week unclassified threshold.
- Recalibrating either number against real usage, or downgrading either into project-specific guidance, is the adopting project's decision to make and to date — this standard does not carry that commitment, the same way it carries no gate.

**1.1.0's additions (OWT-017–OWT-019)** come from two gaps found in one adopting project on 2026-09-29 (DEC-122): the standard said nothing about separating a work item's goal from its progress, and an acceptance criterion in one of that project's specifications was revised mid-work with no record of who agreed. The design shapes were borrowed from a prompt a user forwarded, author unknown (see [What this standard deliberately does not adopt](#what-this-standard-deliberately-does-not-adopt)). The reference procedure is hours old, has one author, and has run against constructed samples, not against a real backlog of revisions. Under OWT-016, everything it uses that resembles a threshold is **uncalibrated, an initial judgment**: the heading vocabulary that marks a section as intent, progress, next action, or revision record; the list of command names it recognises; the file-extension list; and the requirement-identifier pattern. None of them was measured against real usage, and a project should pass its own.

**1.2.0's additions (OWT-020–OWT-026)** come from one adopting project's test report of 6.14.0-beta.5 on 2026-10-07 (XSPEC-459): a message drafted and never sent could not be told from one sent and unanswered, and a fact the assistant could not observe had no sanctioned place to be written. The reference procedure is hours old, has one author, and has run against constructed samples, not against a real backlog. Under OWT-016, everything it uses that resembles a threshold is **uncalibrated, an initial judgment**: the state words and field names in English and Chinese, the list of subjects treated as derivable, the 7-day default for "stale", and the reading of dates (a year is required; the time of day is ignored). None of it was measured against real usage, and a project's own words and threshold should replace the defaults.

- **OWT-001 的「不超過兩個欄位」**與**OWT-012 的「過了宣告的門檻」**（在原始觀察中以兩週為例）
  依 OWT-016 是**初始判斷，不是量測結果**——兩個欄位跟三個欄位、兩週跟四週的未分類門檻，
  目前都沒有對照比較過。
- 依實際使用情況重新校準這兩個數字、或將其中任一個降級為專案特定指引，是採用專案自己的決定
  與自己的時程——本標準不承諾這件事，如同它不附帶閘門一樣。

**1.1.0 的新增（OWT-017–OWT-019）**來自 2026-09-29 在一個採用專案裡發現的兩個缺口（DEC-122）：
本標準對「把工作項目的目標與進度分開」沒有任何說法，而該專案某份規格裡的一條驗收條件，
在工作進行到一半時被修改，沒有任何紀錄說明誰同意過。設計形狀借自使用者轉貼的一份提示詞，作者不明
（見〈[本標準刻意不採納的東西](#what-this-standard-deliberately-does-not-adopt)〉）。
那支參考判定程序只有幾小時大、只有一位作者，跑過的是人造樣本，不是真實的修訂歷史。
依 OWT-016，它用到的一切類似閾值的東西都是**未校準、初始判斷**：把某個小節認作意圖、進度、下一步、
或修訂紀錄的標題詞彙；它認得的指令名清單；副檔名清單；需求編號的樣式。
沒有任何一項對照過真實使用量測，採用專案應傳入自己的。

**1.2.0 的新增（OWT-020–OWT-026）**來自一個採用專案在 2026-10-07 對 6.14.0-beta.5 的測試回報（XSPEC-459）：一則草擬了從沒送出的訊息，與一則已送出、沒人回的訊息分不出來；助理無法觀察的事實，沒有一個被認可的地方可以寫。那支參考判定程序只有幾小時大、只有一位作者，跑過的是人造樣本，不是真實的待辦。依 OWT-016，它用到的一切類似閾值的東西都是**未校準、初始判斷**：中英文的狀態詞與欄位名、被當成「可推導」的主題清單、「觀察已舊」預設的 7 天、以及日期的讀法（必須有年份；時間不看）。沒有任何一項對照過真實使用量測，採用專案應以自己的詞彙與門檻取代預設。

---

## Relationship to other standards

- [deferred-item-exit](deferred-item-exit.md) — the upstream half of the same shape: DEX requires that a deferred item leave its document for a traceable exit and deliberately leaves the exit's carrier unspecified. This standard picks up **after** the exit exists, requiring the carrier itself not to become the next document things get lost in.
- [turn-completion-integrity](turn-completion-integrity.md) — attaches to the same event (turn end) and is built to behave oppositely: TCI blocks on a rare, specific abandoned commitment; this standard's checkpoint (OWT-007–OWT-009) never blocks, because the condition it watches for is close to always true. See [the comparison table](#the-checkpoint-is-a-report-not-a-gate).
- [class-level-fix](class-level-fix.md) — the general form of the wording-list limit OWT-011 discloses, and the source of the non-vacuous-evidence procedure OWT-015 requires.
- [verification-evidence](verification-evidence.md) — the source of the exit-code and evidence-validity reasoning OWT-015 depends on; also where a partial-coverage exception (OWT-006, OWT-011) is registered rather than merely disclosed once.
- OWT-018 attaches to the same hand-back point as OWT-007: an edit to intent with no approver is one more thing listed there, and, like everything listed there, never blocks.
- OWT-020–OWT-022 refine OWT-002 (a waiting item states what it waits for and its release) by saying which kind of wait it is; OWT-023–OWT-026 sit beside OWT-003 and OWT-006 — the first says what may be generated and what may not, the second that what could not be seen is never counted as zero.

- [deferred-item-exit](deferred-item-exit.md) — 同一個形狀的上游一半：DEX 要求延後項目離開文件、
  抵達可追蹤的出口，並刻意不規定出口的載體。本標準接手**出口存在之後**的事，
  要求那個載體自己不要變成下一份東西會不見的文件。
- [turn-completion-integrity](turn-completion-integrity.md) — 掛在同一個事件（回合結束）
  上，且被設計成行為相反：TCI 擋在一個罕見、明確的被放棄承諾上；本標準的確認點
  （OWT-007–OWT-009）永不阻斷，因為它在看的條件幾乎永遠為真。見〈[對照表](#the-checkpoint-is-a-report-not-a-gate)〉。
- [class-level-fix](class-level-fix.md) — OWT-011 揭露的措辭清單限制的通則形式，
  也是 OWT-015 所要求「非空跑證據」程序的來源。
- [verification-evidence](verification-evidence.md) — OWT-015 所依賴的 exit code
  與證據有效性推理的來源；也是 OWT-006／OWT-011 的部分涵蓋例外該被登記的地方，
  而不是揭露一次就放著。
- OWT-018 掛在與 OWT-007 相同的交回點：沒有核可者的意圖修改，是在那裡多列出來的一項，
  而且與列在那裡的一切相同，永不阻斷。
- OWT-020–OWT-022 細化 OWT-002（等待項目說明在等什麼與解除條件），說明那是哪一種等待；OWT-023–OWT-026 與 OWT-003、OWT-006 並列——前者說什麼可以生成、什麼不可以，後者說看不到的絕不被算成零。
