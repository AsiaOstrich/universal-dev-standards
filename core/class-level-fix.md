# Class-Level Fix Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/class-level-fix.md)

**Version**: 1.1.0
**Last Updated**: 2026-08-14
**Applicability**: Any defect fix, in code or in configuration
**Scope**: universal

---

## Purpose

A defect is almost never alone. It is one member of a set — one flag in a dispatch chain, one entry in a manifest, one directory under `agents/`, one config file in a tree. Fixing the member you were shown leaves the rest of the set exactly as it was, and **nothing announces the next one**. It surfaces months later as a fresh incident, and the work feels endless because the same shape keeps arriving under different names.

This standard requires that a fix be aimed at the **set**, not at the member.

一個缺陷幾乎從不孤單。它是某個集合的一員——分派鏈裡的一個旗標、manifest 裡的一條宣告、`agents/` 底下的一個目錄、目錄樹裡的一份設定檔。修掉被指出的那一員，集合裡其餘的原封不動，**而沒有任何東西會通知你下一個在哪**。它會在幾個月後以一則新事故的形式出現，於是工作感覺沒完沒了——因為同一個形狀不斷換名字回來。

本標準要求：**修正瞄準集合，不是瞄準成員。**

---

## The Rule

**Before fixing a defect, name the enumerable set it belongs to, and add a check that walks that set.** If the set cannot be walked, write down why. Silence is not an answer.

**修一個缺陷之前，先指出它所屬的可窮舉集合，並加上一個走訪該集合的檢查。** 若該集合無法被走訪，寫下為什麼。沉默不算答案。

### Three questions, in order

| # | Question | 問題 |
|---|---|---|
| 1 | What set is this defect a member of? | 這個缺陷是哪個集合的一員？ |
| 2 | Can that set be **walked** rather than **listed**? | 那個集合能不能被**走訪**而不是**列舉**？ |
| 3 | Where does the walk read its members from? | 走訪從哪裡讀出成員？ |

Question 3 decides whether the check survives. **The walk must read from the same source the system reads from** — the CLI definition, the directory, the manifest — never from a list you typed. A typed list is correct until someone adds the fourth member, and nothing will tell you.

第 3 題決定這道檢查活不活得下去。**走訪必須從系統自己讀的那個來源讀**——CLI 定義、目錄、manifest——**絕不從你手打的清單讀**。手打的清單正確到有人新增第四個成員為止，而不會有東西告訴你。

---

## Walk and exclude, never enumerate

| | Enumerate（列舉）| Walk and exclude（走訪並排除）|
|---|---|---|
| Shape | `for (const x of ['a','b','c'])` | `for (const x of readAll()) if (!EXCLUDED.has(x))` |
| A new member is | silently uncovered | **covered by default** |
| Wrong when | someone adds the fourth | someone adds an exclusion without cause |
| Failure mode | reports green over a fraction | noisy — which is visible |

**The asymmetry is the point.** An enumeration fails silently; an exclusion list fails loudly, because the exclusion has to be written down by a person who has to justify it.

**不對稱正是重點。** 列舉失敗時是靜默的；排除清單失敗時是吵的，因為那條排除必須由一個人寫下來，而他得說明理由。

---

## The check must print what it excluded

A denominator alone is not enough. `checked 4,012 declarations` reads like coverage while the filter silently skipped every directory entry.

只印分母不夠。「檢查了 4,012 條宣告」讀起來像涵蓋率，而篩選器悄悄跳過了每一條目錄條目。

```
✓ 91 entries across 5 lists all resolve        # denominator
  (0 excluded)                                  # and what was left out
```

See [verification-evidence](verification-evidence.md) — this is the same family: an output whose shape is identical whether the tool worked or not.

---

## Evidence requirement

A class-level check must be proven non-vacuous **before** it is trusted:

1. Add a synthetic member that violates the rule.
2. Confirm the check fails **and names that member**.
3. Remove it and confirm the check returns to green.

Do this **per sub-set**, not in aggregate. A check over five lists that was only ever tested against the first is a check over one list.

一道類別層檢查在被信任之前，必須先被證明不是空跑：塞一個違反規則的合成成員 → 確認檢查失敗**且指名該成員** → 移除後確認回到綠燈。**逐子集做，不要整體做**——一道涵蓋五份清單、卻只對第一份測過的檢查，是一道涵蓋一份清單的檢查。

### What a passing negative control does not prove

A negative control that passes once demonstrates only that **one** known-bad case reaches the checker's failure path. **It does not demonstrate** that the checker recognizes **every** violation of the rule it purports to guard. A grep-based gate can fail-closed perfectly while guarding a spelling, not a behavior — the synthetic member proves the wire is connected, not that the net is wide enough to catch what it claims to catch.

一次通過的負向控制，只證明**一個**已知壞案例能到達檢查器的失敗路徑。**它不證明**該檢查器認得它所宣稱守護的規則的**每一種**違反。一道 grep 閘可以 fail-closed 得很完美，卻守著一個拼字而不是一個行為——那個合成成員證明的是線路接通了，不是那張網夠寬，足以抓住它自稱要抓的東西。

---

## Worked examples (measured, 2026-08-10)

### It works: the flag dispatch

A CLI's `--plan` flag (documented as "show the plan without executing") was being silently discarded when combined with `--skills`, because scope flags sat ahead of mode flags in a first-match-wins chain. The instance-level fix was two branches.

The class-level fix was a test that **reads the flag list off the CLI definition**, excludes the mode flags and the few that are not scopes, and asserts `--plan` writes nothing whatever it is combined with.

**It found a fourth instance the moment it first ran** — `--sync-refs`, which nobody had looked at, and which was rewriting integration files and the manifest under a flag documented as not executing.

### It fails: the same defect, fixed once, eleven days earlier

The same codebase had already fixed exactly this for `--integrations-only`, eleven days before, **with a comment explaining the general problem**. The other three branches were left untouched. The knowledge was in the file; it had not reached its siblings.

> **A comment describing the class is not a check over the class.** This is the failure this standard exists to prevent.

### It fails: a gate that listed its own scope

A parsing gate hardcoded three directories instead of walking the tree. It reported "423 files all pass" while the shipping surface was 287 files, and ten broken ones reached the registry.

---

## When the set cannot be walked

Legitimate. Write it down, with the reason and what would change it.

The common cause is that **the set's members are only knowable from a base directory that is not recorded anywhere machine-readable** — for example, a manifest whose paths are relative to a root stated only inside the program that reads it. A generic walk over such declarations produces false positives at a rate that gets the check switched off in its first week.

In that case the workable form is **per-inventory**: one check per declaration kind, each knowing its own base and entry shape. Say how many inventories there are, and confirm each has a check.

集合無法被走訪是合法的答案，但要寫下來，連同理由與「什麼條件下會改變」。

最常見的成因是**成員只能相對於某個基準目錄才知道，而那個基準沒有記在任何機器讀得到的地方**——例如一份 manifest，它的路徑基準只活在讀取它的那支程式裡。對這種宣告做通用掃描，假陽性率高到讓檢查在第一週就被關掉。這時可行的形狀是**逐份清冊**：一種宣告一道檢查，各自知道自己的基準與條目形狀。**說出清冊有幾份，並確認每一份都有檢查。**

---

## Narrow Coverage Must Be Registered, Not Just Disclosed

When a gate's actual coverage is narrower than the rule it serves, writing a sentence that says so is not enough. A prose disclosure is cheap — cheaper than widening the gate — and every narrow gate that gets reviewed once grows an honest paragraph and then stays narrow forever. **Disclosure earns nothing on its own; it earns something only paired with a mechanism that can prove it didn't just become a permanent excuse.**

**Requirement**: any documented coverage gap of this kind must also be registered in a dated exception inventory — a list, external to the standard prose itself, that names the gap, states why it exists, and carries a review or expiry date. A disclosure with no entry in such an inventory does not satisfy this rule.

**Falsifiable condition**: if an entry sits unchanged across two consecutive inventory review cycles, the disclosure has become an escape hatch and this rule is violated for that entry — not "partially satisfied", violated. The inventory mechanism itself (its location, format, and cadence) is left to the adopting project; this standard requires that one exist and that entries move, not that it take any particular shape.

當一道閘門的實際涵蓋面窄於它所服務的規則時，只寫一句話說明是不夠的。散文式揭露很便宜——比擴大涵蓋面便宜得多——於是每一道被審過一次的窄閘門都會長出一段誠實的文字，然後永遠維持窄下去。**揭露本身不換來任何東西；只有配上一個能證明它沒有淪為永久藉口的機制，它才換得到東西。**

**要求**：這一類已記錄的涵蓋缺口，必須同時登記到一份**帶到期日的例外清冊**——一份獨立於標準本文之外的清單，指名缺口、說明成因、並附上覆核或到期日期。沒有登記到這種清冊裡的揭露，不滿足本條。

**可證偽條件**：若某條目連續兩期清冊審查都未變動，該揭露就已經變成逃生口，本條對該條目**失效**——不是「部分滿足」，是失效。清冊機制本身（放在哪裡、什麼格式、多久審一次）留給採用它的專案自行決定；本標準要求的是「有這麼一份東西存在，且條目會動」，不是要求它長成特定形狀。

---

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Fixing the reported member and moving on | The set is unchanged; the next member arrives as a new incident |
| A comment explaining the general problem | Prose does not execute |
| A check that lists its own scope | Correct until someone adds the fourth member |
| Testing the class check against one member | Proves that member, not the class |
| `✓ all pass` with no denominator | Identical output whether it scanned everything or nothing |
| A disclosure sentence with no entry in a dated exception inventory | Cheaper than widening the gate; nothing forces it to ever change |

---

## This standard has no automated gate — and that is recorded, not hidden

Applying this standard is a judgement made at the moment of fixing. There is no check that can walk "all defects being fixed right now", so by its own rule the honest answer is to write down why not, rather than to imply enforcement that does not exist.

**What this means in practice**: the only place it can bite is review — human or agent. A fix that changes one member of a set and adds no check over that set should be sent back with one question: *what set is this a member of?*

**Reopen condition**: if a repository gains a mechanism that can see "a defect fix landed" as a discrete event (a labelled commit type, an issue-to-commit link), a check becomes possible — assert that such a commit either touches a test that walks a set, or carries a written reason. Until that exists, this standard is enforced by reading.

> Recording this is not a formality. A standard that states a rule while nothing executes it is the exact shape of a documented risk with no enforcement — and a standard that does not admit it is worse than one that does, because the reader assumes something is watching.

**本標準沒有自動閘門，而這件事是被記錄下來的，不是被藏起來的。**

套用本標準是「修的當下」所做的判斷。沒有任何檢查能走訪「現在正在被修的所有缺陷」，所以依照它自己的規則，誠實的答案是寫下為什麼不能，而不是暗示一個不存在的強制力。

**實務上唯一會咬到的地方是 review**（人或 agent）：一個只改了集合中某一員、而沒有加上涵蓋該集合之檢查的修正，應該被退回並問一句——**這是哪個集合的一員？**

**重啟條件**：若某個 repo 取得了「能把『一次缺陷修正落地』看成一個離散事件」的機制（有標記的 commit 型別、issue↔commit 連結），檢查就變得可能——斷言這類 commit 要嘛動到一個走訪集合的測試，要嘛帶著一段寫下來的理由。在那之前，本標準靠閱讀執行。

> 記下這件事不是形式。**一份陳述了規則而沒有東西執行它的標準，正是「寫下來的風險沒有東西在執行」那個形狀**——而一份不承認這一點的標準，比承認的更糟，因為讀的人會以為有東西在盯。

---

## Relationship to other standards

- [verification-evidence](verification-evidence.md) — evidence validity: a tool can fail silently and its output is indistinguishable from a real result. This standard is the same concern applied to *scope* rather than to *execution*. It also shares the narrow-coverage-must-be-registered requirement (VE-012) with this standard's own rule of the same shape.
- [anti-hallucination](anti-hallucination.md) — that one guards "did not check"; this one guards "checked one of many and reported on all".
