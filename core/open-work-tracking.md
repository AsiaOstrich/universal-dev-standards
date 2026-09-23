# Open Work Tracking Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/open-work-tracking.md)

**Version**: 1.0.0
**Last Updated**: 2026-09-23
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

Each requirement below traces to one row of that table, or to one of four failures observed the day this standard's design was drafted (see [Evidence and calibration](#evidence-and-calibration)). **None of the mechanisms is prescribed** — per the same constraint [deferred-item-exit](deferred-item-exit.md) states for its own exits, and for the same reason (DEC-049: UDS defines relations that must hold, adoption layers choose what maintains them).

下面每一條要求都對應這張表的一列，或對應本標準設計當天觀察到的四個失效之一
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

| 這裡容許——**what** | 這裡不容許——**how** |
|---|---|
| 收件點欄位數必須具備的性質 | 收件點是哪個 app、檔案或工單系統 |
| 等待項目與解除條件之間必須存在的關係 | 輪詢那個條件的排程器或機器人 |
| 「這是最新的」這句宣稱必須從什麼可被證明 | 具體用哪個雜湊函式、diff 工具或 CI 供應商 |
| 一個回報數字與它看不到的部分之間的關係 | 儀表板版面或報告範本 |
| 控制權交回人的那一點存在一個確認點，且它永不阻斷 | 用什麼 hook 系統、shell 或 cron 實作它 |

**Consequence, stated plainly**: this standard ships **no gate**. It says what must be true of a carrier for open work. Whether anything checks it is the adopting project's decision — [OWT-014](#requirements) and [OWT-015](#requirements) exist so that decision cannot be made silently.

**直說它的後果**：本標準**不附帶任何閘門**。它只說一個承載開放工作的地方必須具備什麼性質；
有沒有東西在檢查，是採用專案的決定——[OWT-014](#requirements) 與 [OWT-015](#requirements)
存在的目的，是讓那個決定沒辦法被默默做掉。

---

## The invariant

**A carrier of open work must (1) accept a new item without demanding classification, (2) record a release condition for every item it marks waiting, (3) generate any field a reliable source already determines, (4) disclose what it cannot see whenever it reports what remains, and (5) be checked at the moment control returns from agent to human — by something that cannot fail the turn.**

**一個承載開放工作的地方，必須：（1）不要求分類就能收下新項目、（2）為每一個標為等待中的項目記下解除條件、
（3）對任何有可靠來源可推導的欄位改用生成、（4）回報還剩什麼時同時揭露看不到什麼、
（5）在控制權從 agent 交回人的那一刻被檢視——而且那個檢視不能讓回合失敗。**

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

---

## What enforces this standard

**Nothing in UDS does, and that is recorded rather than implied.** UDS states the relations a carrier of open work must satisfy; whether anything decides them is the adopting project's call, per the [writing constraint](#how-this-standard-is-written--and-why-it-is-written-that-way) above — the same boundary [deferred-item-exit](deferred-item-exit.md) draws for its own exits.

**本標準沒有任何 UDS 側的閘門，而這件事是被記錄的，不是被暗示的。** UDS 陳述一個承載開放工作的地方
必須滿足的關係；有沒有東西去判定它，依上面的[寫法約束](#how-this-standard-is-written--and-why-it-is-written-that-way)，
是採用專案的決定——與 [deferred-item-exit](deferred-item-exit.md) 對自己出口劃的界線相同。

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

- **OWT-001 的「不超過兩個欄位」**與**OWT-012 的「過了宣告的門檻」**（在原始觀察中以兩週為例）
  依 OWT-016 是**初始判斷，不是量測結果**——兩個欄位跟三個欄位、兩週跟四週的未分類門檻，
  目前都沒有對照比較過。
- 依實際使用情況重新校準這兩個數字、或將其中任一個降級為專案特定指引，是採用專案自己的決定
  與自己的時程——本標準不承諾這件事，如同它不附帶閘門一樣。

---

## Relationship to other standards

- [deferred-item-exit](deferred-item-exit.md) — the upstream half of the same shape: DEX requires that a deferred item leave its document for a traceable exit and deliberately leaves the exit's carrier unspecified. This standard picks up **after** the exit exists, requiring the carrier itself not to become the next document things get lost in.
- [turn-completion-integrity](turn-completion-integrity.md) — attaches to the same event (turn end) and is built to behave oppositely: TCI blocks on a rare, specific abandoned commitment; this standard's checkpoint (OWT-007–OWT-009) never blocks, because the condition it watches for is close to always true. See [the comparison table](#the-checkpoint-is-a-report-not-a-gate).
- [class-level-fix](class-level-fix.md) — the general form of the wording-list limit OWT-011 discloses, and the source of the non-vacuous-evidence procedure OWT-015 requires.
- [verification-evidence](verification-evidence.md) — the source of the exit-code and evidence-validity reasoning OWT-015 depends on; also where a partial-coverage exception (OWT-006, OWT-011) is registered rather than merely disclosed once.

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
