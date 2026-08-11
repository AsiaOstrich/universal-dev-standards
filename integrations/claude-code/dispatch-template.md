# Cross-Repository Dispatch Template

> **Language**: this file is bilingual in place — every normative statement carries its 繁體中文
> counterpart, and the template body in §5 is written in 繁體中文 because that is the language it
> is filled in. There is no separate `locales/` copy, so the two cannot drift apart.

**Version**: 1.0.0
**Last Updated**: 2026-08-12
**Implements**: [`core/model-selection.md`](../../core/model-selection.md) 2.1.0 (XSPEC-362 R5)
**Consumes**: [`core/agent-dispatch.md`](../../core/agent-dispatch.md) — `prompt_design_principles.self_contained`
**Host**: Claude Code

---

## 1. Why this template exists | 為何需要這份模板

A dispatch prompt for a subagent that will work in **a different repository than the one your
session is running in** must carry that repository's rules in the prompt itself. Not because
subagents are context-less — they are not — but for a narrower and easier-to-miss reason.

### The claim you will find in the vendor documentation

Claude Code's subagent documentation states that a custom subagent receives
*"every level of the CLAUDE.md hierarchy **the main conversation loads**, including
`~/.claude/CLAUDE.md`, project rules, `CLAUDE.local.md`, and managed policy files"*, and that
subagents *"can still invoke unlisted project, user, and plugin skills through the Skill tool"*
[確認, `sub-agents.md`, fetched 2026-08-12].

Read quickly, that says "the subagent already has the project's rules — no template needed."
**That reading is wrong, and the load-bearing words are "the main conversation loads".**

### The measurement | 實測

**Method** (2026-08-12): a subagent was dispatched from a session whose working directory was
repository **A**, with the task of working in repository **B**. The subagent was **denied every
tool** and asked to state, from its startup context alone, which `CLAUDE.md` files it could see.
It answered before being permitted to run `pwd`, so the answer could not have been reconstructed
from the filesystem.

**Four observations:**

| # | Observation |
|---|---|
| 1 | Exactly **two** `CLAUDE.md` files were in context: the user-level `~/.claude/CLAUDE.md`, and repository **A**'s `CLAUDE.md` — the session's working directory |
| 2 | Repository **B**'s `CLAUDE.md` — the repository the subagent was being sent to work in — was **not** in context |
| 3 | A third repository's `CLAUDE.md`, also outside the session's working directory, was likewise **not** in context |
| 4 | `pwd` returned repository **A**: the subagent inherits the **main session's** working directory, not the target repository's |

**Conclusion.** The documentation is accurate and still misleading for this case:

> **A subagent loads the CLAUDE.md hierarchy of the main session's working directory — not of the
> repository it is actually going to operate on. In a cross-repository dispatch, the target
> repository's rules are not in context at all.** The same holds for Skills: the roster the
> subagent sees is the main session's, not the target's.

> **子代理載入的是「主 session 工作目錄」那一份 CLAUDE.md，不是它實際要操作的那個 repo 的。
> 跨 repo 派工時，目標 repo 的規則完全不在 context 中。**

The vendor documentation reaches the same conclusion from the other direction, for rules generally:
*"If a rule must [reach the subagent], such as 'ignore the `vendor/` directory,' restate it in the
prompt you give Claude when delegating."*

### ⚠️ Do not delete this mechanism after reading the docs

This warning is here because the obvious future mistake is predictable: someone reads
"subagents load CLAUDE.md", concludes this template is obsolete, and removes it. **The distinction
is *which* CLAUDE.md, not *whether* one loads.** If the dispatch is same-repository, the rules
arrive on their own and the blocks below are redundant. If it is cross-repository, they do not
arrive at all, and every one of them is load-bearing.

**這個機制的必要性不在「會不會載入」，在「載入的是哪一份」。** 同 repo 派工時本模板多餘；
跨 repo 派工時它是唯一的規則來源。

---

## 2. The rule that governs every block | 貫穿所有區塊的規則

> **A filled block carries its source and the command that verifies it — never just a value.**

A summary copied from a planning document is a second copy of a fact, and the synchronising engine
between the two copies is a human remembering. It rots, and a rotted summary is indistinguishable
on the page from a current one.

**This is not hypothetical.** While this template was being written, a planning document described
a target repository's licence in terms that the repository's own `LICENSE` file and its
`package.json` `license` field both contradicted [確認, 2026-08-12]. Had that summary been pasted
into a dispatch prompt, an agent would have made cross-licence decisions from it — and the block
that matters most would have been the one that was wrong.

摘要會腐壞，而腐壞的摘要與現行的摘要在紙上長得一模一樣。**每一格都要附來源與驗證指令。**

Every block below therefore specifies three things:

- **Source** — the file in the target repository the value is read *from*
- **Verify** — the command that reproduces it
- **Cost of getting it wrong** — so the filler knows which blocks not to skim

---

## 3. Mandatory blocks | 必填區塊

None of these is optional. An unfillable block is filled with the words "not determined" plus the
reason — **never left blank**, because a blank block and a block whose answer is "there is no rule"
lead to different agent behaviour.

### B0 — Target repository and working directory

| | |
|---|---|
| **Source** | You. The dispatcher knows where the work goes. |
| **Verify** | `git -C <absolute-path> rev-parse --show-toplevel` |
| **Cost of getting it wrong** | The subagent starts in the **main session's** working directory (observation 4 above). Without an absolute path it will operate on the wrong repository, and `cd` does not persist between its tool calls. |

State the **absolute path**, and state explicitly that it differs from the session's CWD.

### B1 — Task and acceptance criteria

| | |
|---|---|
| **Source** | The specification or issue. |
| **Verify** | Each criterion is checkable by a named command or a named file state. |
| **Cost of getting it wrong** | "Done" becomes a matter of opinion, and the agent's opinion is the only one present. |

### B2 — Licence boundary ⚠️ highest cost

| | |
|---|---|
| **Source** | The target repository's `LICENSE` file **and** its manifest (`package.json` `license`, `pyproject.toml`, `Cargo.toml`, …). Not a planning document, not a README summary, not another repository. |
| **Verify** | `head -5 <repo>/LICENSE` and `node -e "console.log(require('<repo>/package.json').license)"` |
| **Cost of getting it wrong** | Cross-licence contamination — code moved between repositories under incompatible terms. Unlike every other block, this one is **not fully reversible**: once copied and published, the mistake is in someone else's history too. |

State, explicitly: what the target's licence is, **which other repositories the agent may not copy
from**, and that "read for reference" and "copy" are different permissions.

**If the two sources disagree, stop and escalate.** Do not pick one. A disagreement about a licence
is a fact the dispatcher must resolve before any work starts, not a detail the agent can navigate.

### B3 — Commit format and branch strategy

| | |
|---|---|
| **Source** | The target repository's `CLAUDE.md`, `CONTRIBUTING.md`, `commitlint.config.js`, or the last 20 commits. |
| **Verify** | `git -C <repo> log --oneline -20` — the observed format outranks the documented one where they differ |
| **Cost of getting it wrong** | A rejected commit hook, or worse, an accepted commit in the wrong format that nothing rejects. |

Cover at minimum: type/scope conventions, whether the message is bilingual and in which order,
whether the body may mix languages within a paragraph, required trailers, whether to branch, and
**whether to push** — an unstated push permission is routinely assumed.

### B4 — Test commands and environment variables

| | |
|---|---|
| **Source** | The target repository's manifest scripts and CI workflow files. |
| **Verify** | `node -e "console.log(Object.keys(require('<repo>/package.json').scripts).join('\n'))"` and `grep -n 'run: \|' <repo>/.github/workflows/*.yml` |
| **Cost of getting it wrong** | A suite that silently skips instead of running. **A skipped suite exits 0 and reads exactly like a passing one.** |

**This block is a list, not a line.** A target repository may expose dozens of `test:*` scripts —
one measured case had **26** — of which only a few are the ones a given change must satisfy. Name
them, in order, and say what each covers:

```
必跑（依序）：
  1. <command>   # 涵蓋：<what it proves>
  2. <command>   # 涵蓋：<what it proves>
不要跑（原因）：
  - <command>    # <why: slow / needs a service / not affected by this change>
```

**Environment variables belong in this block, with their failure signature.** A guard that skips
the suite when a machine-level precondition is unmet — free memory, a running service, a platform
check — turns a real run into a silent no-op. Give the variable, the value, and what the output
looks like when you forgot it:

```
環境變數：<VAR>=<value>   # 未設時：<what you see — e.g. every test reports "skipped", exit code is 0>
```

Require the agent to **report pass/skip/fail counts**, not the word "passed". Running the tool is
not evidence that the tool worked.

### B5 — File placement rules

| | |
|---|---|
| **Source** | The target repository's `CLAUDE.md` and the governing organisation-level rules. |
| **Verify** | `ls <repo>/specs <repo>/docs` and the rule document itself |
| **Cost of getting it wrong** | Artifacts land where nothing looks for them. A specification written in the wrong repository is invisible to every process that reads the right one. |

State where specifications, decision records and documentation go — and, where a centralisation
rule exists, state it as a **prohibition** ("do not create new specification files in this
repository"), because a permissive-sounding rule gets treated as a default rather than a limit.

### B6 — Report format

| | |
|---|---|
| **Source** | [`core/agent-dispatch.md`](../../core/agent-dispatch.md) `status_protocol` |
| **Verify** | The returned status is one of the four defined states |
| **Cost of getting it wrong** | The orchestrator cannot distinguish "finished", "finished with reservations", "needs input" and "cannot proceed" — and the last two have completely different remedies. |

Require exactly one of `DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED`, plus the
evidence appropriate to it. **Do not invent a status vocabulary in the dispatch prompt** — that
standard already defines one, and a second one drifts from it.

### B7 — Parallel safety

| | |
|---|---|
| **Source** | [`core/agent-dispatch.md`](../../core/agent-dispatch.md) `core_principle.independent_domain_criterion` |
| **Verify** | No two concurrently dispatched agents share mutable state (typically: a file) |
| **Cost of getting it wrong** | Interleaved edits that neither agent reports, because neither one saw the other. |

If two agents must work in the same repository, isolate them — on this host,
[`isolation: worktree`](model-selection-mapping.md). **Do not restate the criterion in the prompt;
cite it.** Two copies of a safety rule drift, and the drifted copy looks exactly like the current one.

### B8 — Model and effort

| | |
|---|---|
| **Source** | [`model-selection-mapping.md`](model-selection-mapping.md) |
| **Verify** | The chosen `(model, effort)` pair is not a `HARD_BOUNDARY` cell in the grid |
| **Cost of getting it wrong** | An unsupported effort level is **silently downgraded**, so the prompt records a depth that was never used. |

State the tier, the resulting `model` and `effort`, and — because the same alias resolves to
different models on different providers — which provider you are assuming.

---

## 4. When the rule source does not exist | 當規則來源不存在

**Do not assume every target repository has a `CLAUDE.md`.** In one measured set of five sibling
repositories, four had one and one did not [確認, 2026-08-12].

An absent instruction file is not an absent rule set. When there is nothing to summarise:

1. **Fill the blocks from the repository's own artifacts instead** — `LICENSE`, the package
   manifest, `CONTRIBUTING.md`, CI workflow files, and the last 20 commits. These are primary
   sources; the instruction file was only ever a summary of them.
2. **State the absence explicitly in the prompt**: "This repository has no instruction file; the
   rules below were derived from `LICENSE`, `package.json` and the commit history on 2026-08-12."
   An agent that knows a rule was derived can flag a conflict it finds; an agent handed an
   unattributed rule cannot.
3. **Never fill a block from a sibling repository.** Repositories under one owner routinely differ
   in licence, commit format and test command — that is precisely why the block exists.
4. **Never leave the block blank.** Write "not determined — no source found in the repository", and
   say what the agent should do on encountering the question. Silence is read as permission.

---

## 5. The template | 模板

Copy, fill every block, delete nothing.

```markdown
## B0 目標 repo 與工作目錄
- 目標 repo（絕對路徑）：<...>
- ⚠️ 你的 CWD 是主 session 的目錄，不是上面這個。所有路徑一律用絕對路徑；`cd` 不會在工具呼叫之間保留。
- 規則來源：<target>/CLAUDE.md ｜ 不存在，本文規則衍生自 <LICENSE / package.json / git log>，日期 <YYYY-MM-DD>

## B1 任務與驗收條件
- 任務：<...>
- 驗收條件（每條都要可用指令或檔案狀態檢查）：
  - AC-1: <...>
  - AC-2: <...>

## B2 授權邊界 ⚠️
- 目標 repo 授權：<SPDX>（來源：<repo>/LICENSE 與 package.json license，兩者一致）
- 禁止從以下 repo 複製任何程式碼：<...>（授權不相容）
- 「可讀作參考」與「可複製」是不同的權限。不確定時停下來問，不要自行判斷。

## B3 Commit 格式與分支策略
- 格式：<...>
- 語言規則：<...>
- 必要 trailer：<...>
- 分支：<開 feature branch 名稱 / 直接在 main>
- 推送：<commit 但不要 push / 允許 push>

## B4 測試指令與環境變數
- 環境變數：<VAR>=<value>   # 未設時的徵狀：<...>
- 必跑（依序）：
  1. <command>   # 涵蓋：<...>
  2. <command>   # 涵蓋：<...>
- 不要跑：<command>   # 原因：<...>
- 回報時附「通過／略過／失敗」的數字，不要只寫「測試通過」。
  略過的套件 exit 0，看起來與通過完全相同。

## B5 檔案放置規則
- 規格文件：<...>
- 決策紀錄：<...>
- 禁止事項：<...>

## B6 回報格式
- 回報 DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED 之一（core/agent-dispatch.md status_protocol）
- 附：修改的檔案（絕對路徑）、實際執行的指令與其輸出、每一項 AC 的驗證方式
- 不確定的陳述標示 [確認]／[推斷]／[假設]／[未知]

## B7 並行安全
- 與你同時執行的其他代理：<無 / 列出>
- 獨立域判準見 core/agent-dispatch.md（無共享可變狀態）。你不需要重新推導它。
- 隔離方式：<無 / isolation: worktree>

## B8 模型與 effort
- tier：<fast / standard / capable>
- model：<haiku / sonnet / opus / fable>
- effort：<omit / low / medium / high / xhigh / max>
- provider 假設：<...>（別名在不同 provider 解析到不同模型）
```

---

## 6. Pre-dispatch checklist | 派工前檢查

Run this before sending, not after receiving:

- [ ] Every block is filled. None is blank; unfillable ones say "not determined" and why.
- [ ] B2 was read from the target repository's `LICENSE` **and** manifest, and the two agree.
- [ ] B4 names specific commands, not "run the tests", and names the environment variables.
- [ ] B0's path is absolute, and the prompt says the CWD will differ.
- [ ] B6 uses the four states from `agent-dispatch` — no invented vocabulary.
- [ ] B7 **cites** the independent-domain criterion rather than restating it.
- [ ] B8's `(model, effort)` pair is not a hard-boundary cell in
      [`model-selection-mapping.md`](model-selection-mapping.md).
- [ ] The prompt's granularity matches the tier: a fully written-out step list is evidence for a
      *lower* tier, not a more thorough prompt for a higher one (MS-009).

---

## 7. Boundary | 邊界

This template implements `model-selection`'s half of a dispatch and **consumes**
`agent-dispatch`'s half. It does not restate parallel-safety rules, independent-domain criteria,
the status protocol, or conflict detection — those are defined in
[`core/agent-dispatch.md`](../../core/agent-dispatch.md), and B6/B7 point at them rather than
copying them.

本模板實作 `model-selection` 的那一半，並**消費** `agent-dispatch` 的那一半，不重寫它。

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-12 | Initial template (XSPEC-362 R5). Rationale replaced with the 2026-08-12 measurement: subagents load the **main session's** CLAUDE.md hierarchy, not the target repository's. Nine mandatory blocks, each carrying source, verification command and cost-of-error. Explicit handling for targets with no instruction file. |
