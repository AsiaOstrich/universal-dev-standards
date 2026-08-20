# Claude Code Host Mapping — Model Tier × Effort

> **Language**: this file is bilingual in place — every normative statement carries its 繁體中文
> counterpart. There is no separate `locales/` copy, so the two cannot drift apart.

**Version**: 1.0.0
**Last Updated**: 2026-08-12
**Implements**: [`core/model-selection.md`](../../core/model-selection.md) 2.1.0 (XSPEC-362 R5)
**Host**: [Claude Code](https://code.claude.com/docs/en/overview)
**Evidence**: `https://code.claude.com/docs/en/sub-agents.md` and `https://code.claude.com/docs/en/model-config.md`, both fetched **2026-08-12**

---

## Purpose | 用途

`core/model-selection.md` is vendor-neutral by rule: its tier ids (`fast` / `standard` / `capable`)
and effort labels (`low` … `max`) are **labels, not identifiers**, and the standard states plainly
that it cannot say which effort levels a given model accepts. Its own grid leaves those cells
marked `?`.

**This file answers the `?` cells for one host.** It is the Claude Code half of the contract:
the concrete `model` and `effort` values a subagent definition should carry, and the hard
boundaries that make some combinations impossible rather than merely expensive.

`core/model-selection.md` 依規則保持 vendor-neutral——tier 名稱與 effort 級距是**標籤，不是識別字**，
且該標準明白表示它無法斷言某個模型接受哪些 effort 級距（其表格中的 `?` 格）。
**本檔就是為單一宿主回答那些 `?` 格。**

### What must never move into `core/`

A model ID written into a vendor-neutral standard is a citation with an expiry date and no clock:
it goes stale, and a stale entry is indistinguishable on the page from a current one. Everything
below — aliases, model names, provider tables, version floors — belongs here and only here.

寫進 vendor-neutral 標準的模型 ID 是「有到期日卻沒有時鐘」的引用端。以下所有具體值只屬於本檔。

---

## Responsibility boundary | 職責分界 (XSPEC-362 R5a)

Two standards meet in a subagent definition. They are **not** interchangeable, and this file
deliberately implements only one of them.

| Question | Standard | What this file does |
|---|---|---|
| **Who to dispatch to, and how deeply** | [`core/model-selection.md`](../../core/model-selection.md) | Implements it — the `model` and `effort` values below |
| **How to dispatch** — parallel safety, independent domains, status protocol, prompt design | [`core/agent-dispatch.md`](../../core/agent-dispatch.md) | **References** it; does not restate it |

Concretely: the reference agents in [`.claude/agents/`](.claude/agents/) return
`DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED` because `agent-dispatch`'s status
protocol says so — not because this file invented a reporting format. Parallel-safety conditions
(`independent_domain_criterion`: no shared mutable state) are cited from `agent-dispatch`, never
re-derived here.

> **Why the distinction is enforced rather than merely noted.** Two copies of the same
> parallel-safety rule drift apart, and a drifted copy looks exactly like a current one. The
> `agent-dispatch` machine-readable standard was itself absent for two months while its prose kept
> shipping; a rule with no consumer is the failure mode this whole spec is treating.

---

## 1. Effort label mapping | effort 級距映射

The UDS labels and the Claude Code parameter agree on four of five names. **One is renamed.**

| UDS `axes.effort.levels[].id` | Claude Code `effort` | Identical? |
|---|---|---|
| `low` | `low` | yes |
| `medium` | `medium` | yes |
| `high` | `high` | yes |
| **`very-high`** | **`xhigh`** | **NO — different spelling of the same level** |
| `max` | `max` | yes |

UDS 的 `very-high` 對應 Claude Code 的 `xhigh`。**這是唯一名稱不同的一級。**
標準不改名去遷就工具，映射由本檔承擔——這正是 R5 存在的理由。

**Writing `effort: very-high` in frontmatter is not a supported value.** The documented options are
exactly `low`, `medium`, `high`, `xhigh`, `max` [確認, sub-agents.md frontmatter table, 2026-08-12].

### `ultracode` is not an effort level

Claude Code's `/effort` menu also offers `ultracode`. Per model-config.md it is
"a Claude Code setting rather than a model effort level: it sends `xhigh` to the model and
additionally has Claude orchestrate dynamic workflows" [確認]. It has **no UDS effort counterpart**
and is not listed among the `effort` frontmatter options — do not write it in an agent definition.

---

## 2. Tier → model mapping | 層級對模型映射

The tier ids are fixed (XSPEC-362 OQ1). The mapping below is derived from the tier `signals` in
`ai/standards/model-selection.ai.yaml`, matched against the host's own description of each model —
**not** from a separate opinion about which model is "better".

| UDS tier | Claude Code `model` | Host's own description | Which tier signal it matches |
|---|---|---|---|
| `fast` | `haiku` | "the fast and efficient Haiku model for **simple tasks**" | "步驟已寫出，無需尋路"；"字面遵循正是想要的行為" |
| `standard` | `sonnet` | "the latest Sonnet model for **daily coding tasks**" | "部分成分需要推理，但沒有一項是想更久也想不出來"；"需要理解模組間關係" |
| `capable` | `opus` | "the latest Opus model for **complex reasoning tasks**" | "存在單靠更多思考時間解決不了的成分" |
| `capable` (long-horizon variant) | `fable` | "most capable model in Claude Code, suited to tasks **larger than a single sitting** … sustains long autonomous sessions, investigates before acting"; "**Hand it ambiguous problems**: root-cause investigations, outage debugging, architecture decisions" | "路徑未知；答案要找出來，不是套用"；"需要導航模糊性而非遵循文字" |

### Why `fable` is not a fourth tier | 為何 fable 不是第四層

Both `opus` and `fable` clear Criterion 1 (reasoning ceiling) and both are described for
ambiguity navigation — so **the two model-axis criteria do not separate them**. What separates them
is the **autonomy horizon**: how long the dispatch runs unattended before anyone looks at it.

That is a property of the dispatch, not of the model axis, so it is selected **inside** the
`capable` tier by a host-layer sub-criterion, and the tier ids stay as XSPEC-362 OQ1 fixed them:

| Sub-criterion | Choose |
|---|---|
| Single sitting; a human reads the result before the next step | `opus` |
| Larger than one sitting; the agent must investigate, verify, and keep the thread unattended | `fable` |

Adding a fourth tier here would have put a **host-specific** distinction into a vendor-neutral id
space, where every other host would then have to answer a question its own models may not pose.

### Model values not used in these mappings

`best`, `default`, `opusplan`, `sonnet[1m]`, `opus[1m]` are documented as aliases for the **session**
`model` setting (model-config.md). The subagent frontmatter reference lists only the aliases
`sonnet` / `opus` / `haiku` / `fable`, a full model ID, or `inherit` [確認, sub-agents.md].
Whether the session-only aliases are accepted in subagent frontmatter is **[未知]** — not documented
either way — so they are not used here. See [Unverified items](#unverified-items).

---

## 3. The grid — tier × effort, resolved | 已解析的格子

**Anthropic API**, where `haiku` / `sonnet` / `opus` resolve to Haiku / Sonnet 5 / Opus 5
[確認, model-config.md provider table, 2026-08-12]:

| tier ↓ / effort → | `low` | `medium` | `high` | `very-high` → `xhigh` | `max` |
|---|---|---|---|---|---|
| `fast` (`haiku`) | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| `standard` (`sonnet` → Sonnet 5) | ✅ `low` | ✅ `medium` | ✅ `high` | ✅ `xhigh` | ✅ `max` |
| `capable` (`opus` → Opus 5) | ✅ `low` | ✅ `medium` | ✅ `high` | ✅ `xhigh` | ✅ `max` |
| `capable` (`fable` → Fable 5) | ✅ `low` | ✅ `medium` | ✅ `high` | ✅ `xhigh` | ✅ `max` |

⛔ = **hard boundary**, not a poor choice. See §4.1.

> **The `fast` row is entirely a hard boundary, and that has a consequence for the standard's own
> rules.** Because Haiku accepts no effort level, **MS-005** ("output shallow but sound, effort not
> yet at max → raise effort on the same model") **cannot be executed at the `fast` tier on this
> host.** There is no effort axis there to move along. The only available remedy is MS-001
> (escalate `fast` → `standard`), and taking it is not a violation of the ordering rule — the
> ordering rule says to exhaust effort first, and at this tier the effort axis is empty from the
> start.
>
> `fast` 這一整列都是硬邊界，而這件事對標準本身的規則有後果：**MS-005 在本宿主的 `fast` 層無法執行**，
> 因為那裡根本沒有 effort 軸可移動。唯一可用的補救是 MS-001（升級到 `standard`），
> 且這樣做不違反排序規則——排序規則要求先用盡 effort，而這一層的 effort 從一開始就是空集合。

### Recommended default per tier

Frontmatter `effort` **omitted** means "inherit from the session" [確認]. An omitted value makes the
dispatch non-reproducible: the same agent definition runs at a different depth depending on who
launched the session. The reference agents therefore state effort explicitly, **except** where the
model supports none.

| tier | `model` | `effort` | why this default |
|---|---|---|---|
| `fast` | `haiku` | **omit** | unsupported; writing one records a decision that was never executed |
| `standard` | `sonnet` | `medium` | UDS `medium` = "ordinary deliberation; the default … most defined implementation work" |
| `capable` (review / design) | `opus` | `xhigh` | UDS `very-high` = "explores and discards candidate approaches … design, review, non-obvious debugging" |
| `capable` (long-horizon) | `fable` | `xhigh` | see the `max` note below |

**Why no reference agent ships with `effort: max`.** UDS defines `max` as "the last attempt before
escalating the model axis". An agent whose standing default is `max` has nowhere left to go: its
first failure is already at the top of the effort axis, and the depth-vs-ceiling diagnosis
(MS-005 / MS-006) can no longer distinguish the two cases. `max` belongs to a **re-dispatch**, not
to a definition. The host says the same thing from the other direction: `max` "may show diminishing
returns and is **prone to overthinking**. Test before adopting broadly" [確認, model-config.md].

---

## 4. Hard-boundary register | 硬邊界登記表 (R3a)

R3a requires adopters to record hard boundaries **alongside and separately from** capability
scores, and to exclude on them **before** cost comparison. This is that register.

### 4.1 Effort-parameter support

model-config.md: *"The available effort levels depend on the model. **Models not listed here do not
support effort**"* [確認, 2026-08-12].

| Model | Effort levels accepted |
|---|---|
| Fable 5 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 5, Sonnet 5, Opus 4.8, Opus 4.7 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 4.6, Sonnet 4.6 | `low`, `medium`, `high`, `max` — **no `xhigh`** |
| **Haiku** | **not listed → no effort support at all** |
| Sonnet 4.5 | **not listed → no effort support at all** |

**Violation is silent, which is the whole reason this register exists.** Per model-config.md:
*"If you set a level the active model does not support, Claude Code falls back to the highest
supported level at or below the one you set. For example, `xhigh` runs as `high` on Opus 4.6."*

So an agent file reading `effort: xhigh` may be executing at `high`, and **nothing in the file
says so**. That is exactly R3a's stated consequence: *"Request rejected, or silently executed at
the model's fixed depth."*

**Observable check** — the only one that reads the executed value rather than the declared one:
the session header shows the active effort next to the model name (for example "with low effort"),
and the footer shows it at startup and on change [確認, model-config.md]. Read the header, not the
frontmatter.

> 宣告的 effort 與實際執行的 effort 可能不同，而**檔案上看不出來**。
> 要驗證，看 session header 顯示的 effort，不要看 frontmatter。

### 4.2 Provider-dependent alias resolution — the same alias is not the same model

`sonnet` and `opus` resolve differently per provider [確認, model-config.md]. Combining that table
with §4.1 produces a boundary that is **invisible in the agent file**, because the file only ever
says `sonnet`:

| Provider | `sonnet` → | effort accepted | `opus` → | effort accepted |
|---|---|---|---|---|
| Anthropic API | Sonnet 5 | full range incl. `xhigh` | Opus 5 | full range incl. `xhigh` |
| Claude Platform on AWS | Sonnet 4.6 | **no `xhigh`** (silently → `high`) | Opus 5 | full range |
| Amazon Bedrock, Google Cloud's Agent Platform | Sonnet 4.5 | **none** | Opus 5 | full range |
| Microsoft Foundry | Sonnet 4.5 | **none** | Opus 4.6 | **no `xhigh`** (silently → `high`) |

**Consequence for portability**: a `standard`-tier agent with `effort: xhigh` is a valid dispatch
on the Anthropic API, a silently downgraded dispatch on Claude Platform on AWS, and a dispatch with
no effort axis at all on Bedrock. To pin the model rather than the alias, use a full model ID (for
example `claude-sonnet-5`) or set `ANTHROPIC_DEFAULT_SONNET_MODEL` [確認].

### 4.3 Context capacity

| Boundary | State |
|---|---|
| `sonnet[1m]` / `opus[1m]` select a 1M-token context window; Sonnet 5 has that window natively | [確認, model-config.md] |
| Whether the `[1m]` aliases are accepted in **subagent frontmatter** `model` | **[未知]** — the subagent frontmatter reference does not list them |
| A subagent's context window is sized by **its own** model, not the parent's — "Delegating to a model with a smaller window gives that subagent the smaller window" | [確認, sub-agents.md] |

The third row is the operative one for tier selection: **dispatching a large input to the `fast`
tier can truncate it**, and truncation is R3a's context-capacity violation ("the model never saw
part of the task"). Check the input size against the tier before choosing on cost.

### 4.4 Background execution silently narrows the tool set

Not a model boundary, but a host boundary with the same shape — a capability that is absent rather
than degraded, and absent without an error.

From sub-agents.md [確認]:

- Subagents run in the **background by default** as of v2.1.198.
- A background subagent keeps every MCP tool but only these built-in tools: `Read`, `Grep`, `Glob`,
  `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, `TodoWrite`,
  `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage`,
  `Artifact`.
- *"Claude Code removes every other built-in tool from a background subagent, whether inherited or
  listed in the `tools` field … **The removal reports no error** unless it leaves the `tools` list
  resolving to nothing."*

**Rule for every reference agent in this directory**: keep `tools` within the background-safe set
above. A definition that lists a tool outside it resolves to different capabilities in the
foreground and the background, and says nothing when it loses one.

There is **no documented frontmatter field that forces foreground execution** — `background: true`
forces background, and when unset "Claude chooses" [確認]. So the narrow set is the one to design
against, not an edge case to handle.

### 4.5 Modality

**[未知].** Neither fetched document states per-model image or audio input support for subagents.
Per the standard's own rule, an unmeasured boundary is recorded as unknown — never as `false`, and
never as a score. Fill this row from provider documentation before dispatching modality-dependent
work.

---

## 5. Reverse risks, as the host describes them | 宿主自己描述的反向風險 (R3b)

R3b is not theoretical on this host. Both risks appear in the vendor's own documentation.

### 5.1 Safety-classifier refusal (R3b #1)

model-config.md, on Fable 5 — the highest-capability model here:
*"Requests that its safety classifiers flag, most often in **cybersecurity and biology domains**,
trigger automatic model fallback."*

This is R3b #1 observed in the host: the **highest** tier is the one that declines
specification-sensitive work, and the remedy the host applies automatically — falling back to a
different model — is the same remedy R3b prescribes ("re-dispatch to a different tier or provider;
do not retry the same request at higher effort").

**What this does not remove**: MS-008 still requires the caller to inspect responses for a refusal
marker. An automatic fallback means the answer may come from a **different model than the one the
agent file names**, which is a silent substitution unless something reads it back.

### 5.2 Over-specified prompts degrade high-ceiling models (R3b #2)

model-config.md, on getting the most from Fable 5:
*"**Describe the outcome, not the steps**: hand it the result you want and let it plan the path"*
and *"**Skip the verification reminders**: it verifies its own work with less prompting."*

This is R3b #2 stated by the vendor: a fully written-out step list is the correct prompt for a
literal-following tier and the wrong prompt for a high-ceiling one. It is also MS-009 in operational
form — **if the only prompt available is a written-out step list, that is evidence for the `fast`
tier, not for `capable`.**

---

## 6. Freshness | 新鮮度

Every concrete value above has an expiry date and this section is its clock.

| Field | Value |
|---|---|
| `pin_date` | **2026-08-12** |
| Threshold | 90 days, consistent with `model-selection` MS-010 |
| Sources | `sub-agents.md`, `model-config.md` (Claude Code documentation) |
| Automated check | `npm run check:model-pins` — see the note below |

Re-verify with the same commands used to produce this file:

```bash
# The two documents this file is derived from
curl -fsSL https://code.claude.com/docs/en/sub-agents.md   | grep -A20 'Supported frontmatter fields'
curl -fsSL https://code.claude.com/docs/en/model-config.md | grep -A12 'The available effort levels depend on the model'
```

> **Why `check-model-pin-freshness` treats this file differently from a standard.** Its `VENDOR`
> predicate exists to keep concrete model IDs **out of standards**, where they rot unnoticed. This
> directory is the designated home for exactly those IDs, so the predicate is suppressed for
> `integrations/**` while the `STALE` predicate still applies. A concrete ID here is correct; a
> concrete ID here that is 91 days old is not.

---

## 7. Machine-readable form

The same mapping in machine-readable form:
[`model-selection-mapping.ai.yaml`](model-selection-mapping.ai.yaml).

The two must agree. If they disagree, the `.md` is prose and the `.ai.yaml` is what a tool will
read — fix both in the same commit rather than deciding which one wins.

---

## Unverified items

Recorded rather than guessed, per the standard's own `UNKNOWN` rule: an information gap is not a
conclusion.

| Item | State | How to settle it |
|---|---|---|
| Are tool names in `tools` case-sensitive? | **[未知]** — every documented example uses exact PascalCase (`Read, Grep, Glob`), and none tests another casing | Define an agent with `tools: read` and observe whether it launches or reports "would be spawned with zero tools" |
| Is a space required after the comma in `tools`? | **[未知]** — every documented example has one | Same method, with `tools: Read,Grep` |
| Are `sonnet[1m]` / `opus[1m]` / `opusplan` / `best` valid in subagent `model`? | **[未知]** — listed for the session setting, absent from the subagent field reference | Define an agent with `model: sonnet[1m]` and read the startup header |
| Minimum Claude Code version per frontmatter field | **partially [確認]** — the docs give floors for some behaviours (`effort ultracode` ≥ v2.1.203, `permissionMode: manual` ≥ v2.1.200, name-with-`:` rejection ≥ v2.1.218, background-by-default ≥ v2.1.198, Opus 5 ≥ v2.1.219, Sonnet 5 ≥ v2.1.197, Fable 5 ≥ v2.1.170) but **no floor is stated for `effort` itself** | Consult release notes; do not infer a floor from an adjacent one |
| Per-model modality support for subagent input | **[未知]** | Provider documentation |
| What happens when `effort` is set on a model supporting no levels at all | **[推斷]** — the documented fallback is "highest supported level at or below"; with an empty supported set, the inferred outcome is that the value is ignored and the model runs at its fixed depth. **Not stated for this case.** | Set `effort: low` on a `haiku` agent and read the session header |

---

## Related

- [`core/model-selection.md`](../../core/model-selection.md) — the vendor-neutral standard this file implements
- [`core/agent-dispatch.md`](../../core/agent-dispatch.md) — how to dispatch; referenced, never restated
- [`.claude/agents/`](.claude/agents/) — reference agent definitions using this mapping
- [`dispatch-template.md`](dispatch-template.md) — the cross-repo dispatch template

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-12 | Initial host mapping (XSPEC-362 R5). Tier → model, effort label mapping including `very-high` → `xhigh`, resolved tier × effort grid, hard-boundary register (effort support, provider-dependent alias resolution, context capacity, background tool filter, modality unknown), R3b as the host itself documents it. |
