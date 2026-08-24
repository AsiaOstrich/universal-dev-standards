# Deferred Item Exit Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/deferred-item-exit.md)

**Version**: 1.0.0
**Last Updated**: 2026-08-24
**Applicability**: Any document a standard requires, in which an item can be recorded as deferred
**Scope**: universal

---

## Purpose

Several standards require documents that **produce deferred items** — an ADR's accepted risks and "decide later" notes, a spec's out-of-scope list, a retrospective's action items, a discovery matrix's unconfirmed candidates, a review's non-blocking suggestions, an AC report's gaps. Each of those standards says how to write the document well. **None of them says where those items go afterwards.**

So they go nowhere. The item is recorded, the document is approved, and the record is the end of the line. Nothing announces it again, because the only thing that held it was prose inside a file that is now considered finished.

有一批標準會**產出延後項目**——ADR 的既受風險與「之後再決定」、規格的未納入清單、
retrospective 的 action items、探索矩陣裡未確認的候選、review 的非阻斷建議、AC 報告的缺口。
每一條標準都規定了那份文件要怎麼寫好，**沒有一條規定那些項目之後去哪**。

於是它們哪裡也沒去。項目被記下、文件被核准，**那筆紀錄就是終點**。
沒有東西會再提起它，因為承載它的只有一份已被視為完成的檔案裡的一段文字。

**This standard states the missing relation: a deferred item must leave the document.**

**本標準補上那個缺失的關係：延後項目必須離開文件。**

---

## How this standard is written — and why it is written that way

**Read this section before reading any requirement below. It governs all of them.**

UDS defines **activities**; adoption layers **orchestrate** them (DEC-049; see [MIGRATION-v6](../docs/MIGRATION-v6.md) §2). Eight machine-readable standards were removed in 6.0.0 under that decision, seven of them workflow-state protocols. A standard written as an orchestration protocol belongs in the adoption layer, not here.

The distinction this standard is held to:

| Admissible here — **what** | Not admissible here — **how** |
|---|---|
| A relation that must exist between named artefacts | A state machine the artefacts must pass through |
| A property a claim must have before it counts as evidence | A pipeline stage that must produce that claim |
| A distinction a report must preserve | A report format, tool, or schema |
| That a deferred item must have an exit | Which issue tracker, board, or file is the exit |

**Every requirement below is stated as "what relation must exist", never as "what mechanism must maintain it".** UDS already carries a class of standards of exactly this shape — [acceptance-criteria-traceability](acceptance-criteria-traceability.md) requires that each AC be reachable from a test, and does not say what maintains that reachability. This standard is the same shape applied to deferred items.

**Consequence, stated plainly**: this standard ships **no gate**. It says what must be true. Whether anything checks it is the adopting project's decision — and [DEX-004](#requirements) is what stops that decision from being made silently.

UDS 定義**活動**，採用層負責**編排**（DEC-049）。6.0.0 依該決策移除八條機器可讀標準，
其中七條正是工作流狀態協定。**一份寫成編排協定的標準屬於採用層，不屬於這裡。**

本標準受此拘束：**每一條要求都寫成「必須存在什麼關係」，絕不寫成「應使用什麼機制維持它」。**
UDS 本來就有一整類這個形狀的標準——[acceptance-criteria-traceability](acceptance-criteria-traceability.md)
要求每一條 AC 都能被某個測試到達，而不規定用什麼維持那條可達性。本標準是同一個形狀，套用在延後項目上。

**直說它的後果**：本標準**不附帶任何閘門**。它只說什麼必須為真。
有沒有東西在檢查，是採用專案的決定——而 [DEX-004](#requirements) 是用來讓那個決定沒辦法被默默做掉的。

---

## The invariant

**A deferred item recorded in a document must have a traceable exit outside that document, and the exit's identifier must appear in the document beside the item.**

**一個記錄在文件裡的延後項目，必須在該文件之外有一個可追蹤的出口，而該出口的識別字必須寫在文件裡、緊鄰該項目。**

### What counts as a deferred item

Any item the document records as **not being done now, by this document**. Wording varies without limit — "to be decided", "out of scope for v1", "separate effort", "not yet implemented", "revisit later", "accepted risk", "we will look at this again". **The wording is not the definition**; the definition is the item's status relative to the work the document closes. See [Anchors](#anchors-structure-not-wording).

### What counts as an exit

**Deliberately unspecified.** An issue, a tracked TODO, a manifest entry, a row in a backlog file, a ticket in whatever system the project already runs — all satisfy this. The test is **"has this item left the document?"**, not "which tool was used?".

An exit satisfies the invariant when all three hold:

| # | Relation | Fails when |
|---|---|---|
| 1 | The exit exists outside this document | The item's only record is this document's prose |
| 2 | The exit is addressable by an identifier written in the document | The document says "we'll pick this up later" with nothing to address |
| 3 | The exit still resolves **after** the change that produced the document lands | The exit is closed, deleted, or superseded by that same change |

Relation 3 is not hypothetical. Two observed leaks, both of which satisfy relations 1 and 2 and still lose the item:

- The item is written into an issue that the merge closes. The document points at a record that stops existing the moment the work is accepted.
- The item is written into a comment on the exit rather than into the exit's own body, and subsequent comments push it out of view. The exit resolves; reading the exit does not surface the item.

出口的載體**刻意不指定**：issue、tracked TODO、manifest 條目、backlog 檔案的一列，
專案已經在跑的任何工單系統——都算。判準是**「這個項目離開文件了嗎」**，不是「用了什麼工具」。

上表第 3 條不是假想。兩個實際觀察到的洩漏都同時滿足第 1、2 條而仍然遺失項目：
待辦寫進**會被本次合併關閉的 issue**（文件指向一筆在工作被接受的當下就停止存在的紀錄）；
待辦寫進出口的**留言而非本體**，被後續留言推走（出口解析得到，讀出口卻讀不到那個項目）。

---

## Requirements

| ID | Requirement | Severity |
|---|---|---|
| **DEX-001** | A deferred item recorded in a document has a traceable exit outside that document, and the document carries that exit's identifier beside the item | error |
| **DEX-002** | The exit still resolves, and still carries the item, after the change that produced the document lands | error |
| **DEX-003** | Every requirement of this standard is expressible as a decidable relation over named artefacts. A requirement that cannot be so expressed does not belong in this standard | error |
| **DEX-004** | A check offered as evidence for any requirement here has been observed to report failure against a deliberately violating sample. A check never observed red is not admissible evidence | error |
| **DEX-005** | Verification establishes that the named exit **carries this item** — not merely that the identifier resolves | error |
| **DEX-006** | "Linked and content-verified" and "linked, content unverified" are reported as two distinct states. A report that merges them into one pass state does not satisfy DEX-005 | error |
| **DEX-007** | The anchor for "a deferred item is present here" is a structural location enumerable from the document's own defined structure | error |
| **DEX-008** | Where a wording list supplements the structural anchor, its coverage is declared unknown, and a green result over it is not reported as complete | warning |
| **DEX-009** | Any window or threshold used in that determination carries its provenance, or is marked uncalibrated | warning |

---

## A requirement that cannot be checked is not a requirement here

**DEX-003** is a constraint on this standard's own contents. Each requirement above names artefacts and a relation between them, so that a reader — or something the project builds — can decide whether it holds. **A requirement that cannot be decided does not belong here**, however true it sounds.

The reason is measured, not aesthetic: the first large batch of documents written under a rule of this kind dropped **five of five** deferred items. The rule was understood and the people were competent. What was missing was anything that could tell the difference between a document that satisfied it and one that did not.

**DEX-003 是對本標準自身內容的約束。** 上面每一條都指名了 artefact 與它們之間的關係，
使得「它成不成立」可以被判定。**一條無法被判定的要求不屬於這裡**，不論它聽起來多正確。

理由是量出來的，不是美學：在這一類規則之下第一次大批產出文件，**五項延後項目全部漏掉**。
規則被理解了，人也稱職。缺的是任何一個能分辨「滿足它的文件」與「不滿足它的文件」的東西。

### A check that has never been red

**DEX-004** is about what counts as evidence, not about what to build. **A check that has never failed and a check that cannot fail produce identical output.** Until one has been observed reporting failure against a sample built to violate the rule, it is not evidence that the rule holds — it is evidence that something ran.

For how to prove a check non-vacuous, and why it must be done per sub-set rather than in aggregate, see [class-level-fix](class-level-fix.md); for why "it exited 0" is not the same as "it worked", see [verification-evidence](verification-evidence.md). **Neither procedure is restated here.**

**DEX-004 講的是什麼算證據，不是要你去建什麼。** 一支從未紅過的檢查，與一支不可能紅的檢查，
輸出一模一樣。在它被觀察到「對一個刻意違規的樣本回報失敗」之前，它不是「規則成立」的證據，
只是「有東西跑過」的證據。

證明檢查非空跑的做法、以及為何必須逐子集而非整體進行，見 [class-level-fix](class-level-fix.md)；
「exit 0」為何不等於「它在工作」，見 [verification-evidence](verification-evidence.md)。**兩者都不在此複述。**

---

## The link exists is not the link works

An identifier written beside a deferred item creates the appearance of an exit. Whether the exit **carries** the item is a separate question, and the two answers are not interchangeable.

The instance that names this rule: a document read "to be decided together with issue #19", and issue #19 contained nothing about it. Relations 1, 2 and 3 above all hold. The item is still gone. **A gate that asks whether an identifier is present passes this document**, and its green is bit-for-bit identical to the green it prints over a document whose exits are real.

一個寫在延後項目旁邊的識別字，製造出「有出口」的外觀。那個出口**有沒有承載**這個項目，
是另一個問題，而兩個答案不能互換。

命名這條規則的實例：文件寫著「與 issue #19 一併決定」，而 #19 裡根本沒有這件事。
上面第 1、2、3 條全部成立，項目照樣不見了。**一道只問識別字在不在的閘門會放行這份文件**，
而它印出的綠燈，與它印在出口都為真的文件上的綠燈，逐位元相同。

### Two states, never one

Establishing DEX-005 requires reading the exit's contents, which is materially more expensive than reading the document. **DEX-005 does not require that this be done everywhere at once.** It requires that the difference be visible:

| State | Meaning |
|---|---|
| **Linked, content verified** | The exit was read and it carries this item |
| **Linked, content unverified** | An identifier is present; whether it carries the item is unknown |
| **No exit** | DEX-001 violated |

Reporting the first two as one pass state is not a shortcut toward the rule — it is the defect the rule exists to prevent, made permanent and given a number. **An unknown reported as a pass is worse than an unknown reported as unknown**, because the second one is still findable.

**兩態不得合併。** 「有連結且已驗證內容」與「有連結但內容未驗證」不得印出同一個綠。
把前兩態合併成單一通過數，不是通往規則的捷徑——那正是這條規則要防的缺陷，
被制度化並給了一個編號。**一個被回報成通過的未知，比一個被回報成未知的未知更糟**，因為後者還找得到。

If a project can only afford the cheaper half today, that is a coverage gap of the kind [verification-evidence](verification-evidence.md) VE-012 and [class-level-fix](class-level-fix.md) CLF-008 already govern: **it must be registered with a date, not merely disclosed in prose.** Not restated here.

---

## Anchors: structure, not wording

To decide "is there a deferred item here", **walk the document's structure**. The structure is defined by the standard that required the document, so it is enumerable. **The wording is not enumerable, and no list of it can be shown to be complete.**

| Document | Structural locations where deferred items arise |
|---|---|
| ADR | `Consequences` → **Bad** / **Accepted risk**; `Links`; options considered and not chosen |
| Spec | out-of-scope / not-in-this-version section; open questions; assumptions awaiting confirmation |
| Retrospective | `Action Items`; `Previous Action Items Review` rows still Open; items Cancelled with a reason |
| Feature discovery | zero-checkmark candidates; `dead_code_candidates`; candidates escalated to human observation |
| Code review | non-blocking comment classes (`⚠️ IMPORTANT`, `💡 SUGGESTION`, `[SUGGESTION]`, `[NIT]`) accepted without a change in this change |
| AC coverage report | `Gaps` → **Uncovered AC** / **Partial AC**; `Threshold Exceptions`; `Action Items` |

判定「這裡有沒有延後項目」時，**走訪文件的結構**。結構由「要求產出這份文件的那條標準」所定義，
因此可窮舉。**措辭不可窮舉，而且沒有任何一張措辭清單能被證明是完整的。**

### When a wording list is used anyway

Legitimate — a structural walk catches the item in its section, not the one dropped into a paragraph of narrative. But then **DEX-008 applies**: the list's coverage is unknown, that must be stated, and its green must not be read as "no deferred items were missed". A list containing "to be decided" and "out of scope" says nothing at all about the sentence "we will leave this one alone for now".

**A gate that enumerates its own scope is correct until the fourth member arrives** — [class-level-fix](class-level-fix.md) is the general form of this failure. A wording list is that failure by construction; it can be used, but not believed.

### Thresholds carry their provenance

**DEX-009.** A determination like "the identifier must appear within 3 lines of the item" sets the recall of everything built on it. If nothing records where "3" came from, nobody can evaluate changing it, and nobody can tell whether it was measured or guessed. **Write down where the number came from, or mark it uncalibrated.** Both are acceptable; silence is not.

**一個沒有來歷的閾值，是一個沒有人能檢查的決定。** 寫下它的來歷，或標為未校準——兩者都可以接受，沉默不行。

---

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Recording a deferred item and approving the document | The document is the only carrier, and it is now finished |
| An exit closed by the same change that created the document | The pointer resolves during the work and stops resolving after it |
| The item written into a comment on the exit, not into the exit | The exit resolves; reading it does not surface the item |
| Checking that an identifier is present | Present and correct print the same green |
| One pass state covering verified and unverified links | Makes the previous row permanent and gives it a number |
| A wording list treated as the definition of "deferred" | Correct until someone writes it a different way, and nothing says so |
| A window size with no recorded provenance | Sets the recall of the whole determination; unreviewable |
| A check that has never been observed failing | Indistinguishable from a check that cannot fail |

---

## What enforces this standard

**Nothing in UDS does, and that is recorded rather than implied.** UDS states the relation; whether anything decides it is the adopting project's call, per the [writing constraint](#how-this-standard-is-written--and-why-it-is-written-that-way) above.

What this standard does do is make that call visible: DEX-003 guarantees every requirement here **can** be decided, DEX-004 fixes what it takes for a decision to count, and DEX-006/DEX-008 fix what a partial decision is allowed to print. A project that adopts this standard and builds nothing has not violated it — but it also cannot claim its deferred items have exits, because it has no admissible evidence that any do.

**Reopen condition**: were UDS ever to ship the documents themselves rather than the standards for them, a walk over the structural locations in [Anchors](#anchors-structure-not-wording) becomes possible in this repository, and the honest thing would be to run it.

**本標準沒有任何 UDS 側的閘門，而這件事是被記錄的，不是被暗示的。** UDS 陳述關係；
有沒有東西去判定它，依上面的寫法約束，是採用專案的決定。

本標準做的事，是讓那個決定顯形：DEX-003 保證這裡每一條**能**被判定，DEX-004 固定「一次判定要算數需要什麼」，
DEX-006／DEX-008 固定「一次不完整的判定容許印出什麼」。一個採用本標準而什麼都沒建的專案並未違反它——
但它同樣不能宣稱自己的延後項目有出口，因為它沒有任何可採信的證據說明有。

---

## Standards that produce deferred items

Each of these points here; **none of them restates the rule**, because six copies of one rule rot in six directions.

- [adr-standards](adr-standards.md) — accepted risks, negative consequences, options not taken up
- [spec-driven-development](spec-driven-development.md) — out-of-scope items, open questions, assumptions awaiting confirmation
- [retrospective-standards](retrospective-standards.md) — action items, and previous ones still Open
- [feature-discovery-standards](feature-discovery-standards.md) — unconfirmed candidates and `dead_code_candidates`
- [code-review-checklist](code-review-checklist.md) — non-blocking comments accepted without a change
- [acceptance-criteria-traceability](acceptance-criteria-traceability.md) — coverage gaps, threshold exceptions, report action items

---

## Relationship to other standards

- [acceptance-criteria-traceability](acceptance-criteria-traceability.md) — the same shape one layer up: it requires that every AC be reachable from a verification item and leaves the mechanism open. This standard requires that every deferred item be reachable from an exit.
- [class-level-fix](class-level-fix.md) — supplies the procedure DEX-004 requires evidence of, and the general form of the wording-list failure DEX-008 discloses.
- [verification-evidence](verification-evidence.md) — VE-012's dated exception inventory is what a DEX-006 "unverified" population must be registered in, rather than disclosed once and left.
- [self-review-protocol](self-review-protocol.md) — a self-review catches contradictions; a deferred item with no exit is an omission, which is the case self-review is known not to catch.
