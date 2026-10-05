# AI Response Navigation Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-response-navigation.md) | [简体中文](../locales/zh-CN/core/ai-response-navigation.md)

**Version**: 1.4.0
**Last Updated**: 2026-10-05
**Applicability**: All projects using AI-assisted development
**Scope**: universal
**Industry Standards**: None (Emerging AI tool practice)
**References**: [SPEC-STD-08](../docs/specs/standards/SPEC-STD-08-ai-response-navigation.md)

---

## Purpose

This standard defines navigation behavior for AI responses: every substantive AI response MUST include contextual next-step suggestions with recommended options. This ensures users are continuously guided through development workflows without needing to memorize available commands.

**Problem**: Users don't know what to do next after receiving an AI response. With 30+ slash commands available, the cognitive load is high and workflow continuity is broken.

**Solution**: A standard "Navigation Footer" appended to every substantive AI response, with contextual templates, recommendation marking, and adaptive option quantities.

**Scope note (v1.2.0, extended in 1.3.0 and 1.4.0)**: Rules 1–6 govern what comes *after* the answer.
Rules 7–12 govern the answer itself: lead with the finding (R7), restate state
across turns (R8), no preamble (R9), plain language as the subject (R10), a trade-off on every
option rather than only the recommended one (R11), and controlled language (R12). Rules 7–11 are
**optional**. **Rule 12 is the one exception, and only in part**: its clause that a simplified text
must keep the writer's hedges is **required**; the rest of R12 is optional. They exist because a
response can satisfy every one of Rules 1–6 while burying its conclusion, stating it in vocabulary
only its author holds, listing options the reader still has to compare themselves, or being made
easy to read by being made more certain than the evidence.

---

## Core Rules

### Rule 1: Every Substantive Response Includes Navigation

Every AI response that constitutes a "logical response unit" MUST end with a Navigation Footer.

**A response is a logical response unit when it:**

1. Completes a task or subtask
2. Provides analysis, explanation, or advice
3. Asks the user a question or requests a choice
4. Reports an error or abnormal state
5. Shows code change results

**Exemption**: Ultra-short confirmations (e.g., "OK", "Done", "Got it") that do not constitute an independent logical unit MAY omit the Navigation Footer.

### Rule 2: Recommend and Explain

When providing multiple options, mark the recommended option with ⭐ **Recommended** and append the reason after ` — `.

| Situation | Marking |
|-----------|---------|
| One option is clearly better | ⭐ **Recommended** — [reason] |
| No clear best option | Describe each option's use case, no ⭐ |
| Only one reasonable next step | Suggest directly, no ⭐ needed |

### Rule 3: Match the Context

Use the appropriate template based on response type (see [Contextual Templates](#contextual-templates)).

### Rule 4: Adaptive Quantity

Adjust the number of options based on context complexity:

| Context | Options | Rationale |
|---------|---------|-----------|
| Task completed | 2–3 | Suggest workflow continuation |
| User question | 2–5 | Scale with question complexity |
| Error/failure | 1–3 | Focus on resolution paths |
| In progress | 1–2 | Continue or adjust |
| Informational reply | 1–3 | Exploration directions |

**Hard limit**: Never exceed 5 options. Prune to the most relevant ones.

### Rule 5: Prefer Slash Commands

When a next-step suggestion corresponds to a known slash command, reference it using `` `/command` `` format so users can copy and execute directly. Use natural language descriptions for steps without corresponding commands.

### Rule 6: Model Tier Annotation（Optional）

When a next-step option clearly maps to a specific complexity tier, you MAY annotate it with a model tier hint. This annotation is **strictly optional** — existing skills do not need to be updated retroactively; new and revised skills are encouraged to adopt it.

**Notation**: append `〔model: Fast〕`, `〔model: Standard〕`, or `〔model: Capable〕` after the option description.

**Tier selection**: use the complexity signals from the [model-selection](model-selection.md) standard:
- `Fast` — single file, unambiguous spec, no design judgment
- `Standard` — 2–5 files, inter-module understanding needed
- `Capable` — 5+ files, architectural decisions, cross-system correctness

**Localized notation**:
- 繁體中文：`〔模型：Fast〕` / `〔模型：Standard〕` / `〔模型：Capable〕`
- 简体中文：`〔模型：Fast〕` / `〔模型：Standard〕` / `〔模型：Capable〕`

Tier names are **vendor-neutral**. Each tool or platform maps these tiers to its available models independently.

**Example** (task completed, with tier annotations):

```markdown
> **Suggested next steps:**
> - Run `/derive bdd` to extract BDD scenarios `〔model: Fast〕` — format conversion only
> - Run `/checkin` for quality gate verification ⭐ **Recommended** `〔model: Standard〕` — inter-module judgment required
> - Run `/sdd` for integrated architecture design `〔model: Capable〕` — cross-system impact analysis
```

---

## The Answer Before the Navigation (Rules 7–12)

> **R7–R9 borrowed from**: [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd) (MIT), 3 of its 10 rules.
> **R10–R11 added in 1.3.0** from a different source — a user telling the author, twice in one session,
> that a correct and complete answer was unreadable. R7–R9 had already shipped and were being followed.
> **R12 added in 1.4.0** from a third source: a public suggestion to ask an LLM to write at "about
> 80% of the way to" ASD-STE100, a controlled-English standard for technical documentation. Only its
> principles are taken; its English dictionary and tense rules are not (see Rule 12).
> The other 7 were dropped: 2 are already covered by Rules 1–2 above, and 5 either conflict with
> this standard (its "no recap / no closers" contradicts Rule 1's Navigation Footer; its
> "cap lists at 5" would truncate evidence tables and traversal denominators) or duplicate
> [estimation-standards](estimation-standards.md).

**Why this section exists**: Rules 1–6 govern what follows the answer. Nothing governed the answer
itself — a response could bury its conclusion under a wall of evidence and still satisfy every rule
in this standard by appending a correct Navigation Footer. A reader who cannot find the answer is
not helped by being told what to do next.

**Rules 7–11 are optional**, in the same sense as Rule 6: adopting projects are not required
to enable them, and existing skills need no retroactive update. A project MAY promote any of them to
required in its own configuration. **Rule 12 has one required clause** (12.1) and an optional rest
(12.2); the split is argued inside the rule. What is *not* optional anywhere is that every rule has
a precise trigger — a rule phrased so loosely that it never fires is indistinguishable from not
having the rule.

### Rule 7: Lead With the Finding, Not the Process （Optional）

**Trigger**: a response that answers a question, reports an investigation result, or presents a decision.

The first line states **what was found or what to do**. Not the method, not a restatement of the
request, not a plan for answering.

Evidence — file:line references, command output, tables, measurements — is **support**, and belongs
after the claim it supports. Leading with evidence forces the reader to reconstruct the conclusion
themselves, which is the work they asked to have done.

| Instead of | Write |
|-----------|-------|
| "I checked 44 days of data across 63 domains and found that…" | "Delete those three queries. 46% of what they return is download pages." |
| "Let me look at how this is configured." | "It is configured in `x.yaml:12`; the value is wrong because…" |

**This does not license omitting the evidence.** It orders it.

### Rule 8: Restate State in Multi-Turn Work （Optional）

**Trigger**: work spanning 3 or more exchanges, or a task with 3 or more steps.

Each response restates where the work stands, in one line. The reader cannot be assumed to hold
"we are on step 3 of 5" across messages, and the cost of restating it is one sentence.

This composes with Template 4 (*In Progress*) below: Rule 8 governs the **opening**, Template 4
governs the **footer**.

### Rule 9: No Preamble （Optional）

**Trigger**: any substantive response.

Start with the answer. Do not open with a summary of what you are about to do, an acknowledgement
of the request, or an assessment of the question.

This generalizes one existing prohibition: [anti-sycophancy-prompting](anti-sycophancy-prompting.md)
already forbids *"Opening critique with positive affirmation"* — but only for critiques. Rule 9
extends the same prohibition to every substantive response, for a different reason: not flattery,
but the delay it puts between the reader and the answer.

**Rule 9 does not apply to closers.** Rule 1 requires a Navigation Footer, and that requirement
stands — the end of a response is where this standard puts the reader's next move.

### Rule 10: Plain Language Is the Subject; Identifiers Are Support （Optional）

**Trigger**: any response explaining a situation, a defect, or a system's behaviour to a human.

Explain what happened in the words the reader would use. File paths, symbol names, line
references, command output and version strings are **support** — they belong after the sentence
they support, not as the sentence itself.

| Instead of | Write |
|-----------|-------|
| "`load_topics()` at `intel-scout.py:883` reads `intel-topics.yaml`, while `load_feeds()` at `:1033` reads `intel-feeds.yaml`." | "It gathers material two ways: by searching keywords, and by subscribing to a fixed set of blogs." *(then cite both call sites)* |
| "`manifest.skillHashes` has 137 entries keyed by `claude-code/project/<n>/SKILL.md` while the lookup uses `.claude/skills/<n>`." | "The hashes are stored under one naming scheme and looked up under another, so none are ever found." *(then show both keys)* |

This is **not** a licence to omit the identifiers — a reader who wants to verify must be able to.
It governs which of the two is the subject of the sentence.

**Why it is separate from R7**: R7 orders *finding before evidence*. R10 governs *register* — a
response can lead with its finding and still state that finding in vocabulary only its author
holds. Both failures leave the reader unable to act; they are different failures.

**Plain wording must not buy its plainness with certainty.** Putting an explanation in the
reader's words is a rewrite, and a rewrite is exactly where "might" quietly becomes "is". When R10
is applied to a claim the writer had hedged, [Rule 12](#rule-12-controlled-language-partly-required)
clause 12.1 (required) governs: the hedge stays.

### Rule 11: Every Option Carries Its Own Trade-off （Optional）

**Trigger**: a response that asks the reader to choose between two or more courses of action.

Rule 2 requires marking the recommended option and giving *its* reason. Rule 11 extends that to
the rest: **each** option states what it buys and what it costs, in its own terms.

A list of options where only the recommended one is argued hands the comparison back to the
reader — which is the work they asked to have done. And an option presented without its downside
reads as having none, which is rarely true and never verifiable from the list alone.

```markdown
> **Please choose:**
> | Option | Buys you | Costs you |
> |---|---|---|
> | **(A) …** ⭐ **Recommended** — [why this one] | … | … |
> | **(B) …** | … | … |
```

**A trade-off is not a hedge.** "This may be slightly harder" is not a cost; "this rewrites 110
files and needs a human to check the translations" is. If an option genuinely has no downside
worth stating, say so explicitly rather than leaving the column empty — an empty cell reads as
"not analysed", and the reader cannot tell those apart.

**Composes with Rule 4**: the option count stays bounded (1–5). Trade-offs make each option
costlier to read, so this rule makes Rule 4's cap matter more, not less.

### Rule 12: Controlled Language （Partly Required）

**Trigger**: writing, rewriting, shortening, simplifying or translating text for a reader who is
not its author — typically a non-specialist who has to judge or approve something from it.

Controlled languages (writing rules that trade variety for predictability) make text easier to
read. They have a known way of failing: the easiest sentence to read is a confident one, so
"simplification" drifts toward certainty. This rule takes the principles of controlled writing and
puts a hard stop on that drift.

#### 12.1 A simplified text keeps its hedges （Required）

A hedge is a word that tells the reader how far to trust a claim: *might, could, probably,
appears to, not yet confirmed* — 可能、推斷、大概、尚未確認. It is information, not padding.

When you shorten, simplify, rewrite or translate:

- **Do not turn an uncertain claim into a certain one.** If the source says "might", the result
  says "might" (or the equivalent in the language of the result).
- **Do not drop the hedge to save words.** A shorter sentence is the goal; a more certain one is
  not allowed.
- **Do not add facts the source did not state** — an invented cause or an invented "confirmed" is
  the same failure in another form.
- A hedge may go only when the claim has since been verified, and then the verification (what was
  checked, with what result) takes its place. Deleting the hedge alone is not verification.

**Why this one is required and the rest are not**: it is the only part whose failure misleads the
reader about what is true, rather than only making the text harder to read. It also needs no
calibration — the check is a comparison of the text before and after, which a person or a model
can do in any language — whereas every threshold below depends on language and audience.

#### 12.2 Plain-writing principles （Optional）

Apply these when the reader is a non-specialist. They are language-neutral: each is stated in the
unit the language itself uses, with no word list.

| Principle | What it asks for |
|-----------|------------------|
| **Short sentences, counted in the language's own unit** | One idea per sentence. As a *starting range*, not a limit: roughly 15–25 words in English, roughly 25–40 characters in Chinese. A sentence far beyond the range is a signal to split it, not a defect to count. Calibrate per language and per reader |
| **One thing, one name** | Pick one name for each thing and use it for the whole text. Do not vary it for style: a reader who sees a second name assumes a second thing |
| **A clear subject and the active voice** | Say who does what. The passive is acceptable when the actor is unknown or does not matter |
| **One step, one action** | A procedure is a numbered list with one action per item, not a paragraph |
| **Few semicolons** | A semicolon joins two ideas the reader must hold at once. Split into two sentences or a list |
| **Numbers carry units** | "30 seconds", "3 files", "NT$1,200" — never a bare "30" |

**Why optional**: the ranges above are starting points that have not been calibrated against
reader outcomes, and no checker enforces them. A *required* rule with a threshold nobody can
verify produces mechanical compliance — sentences split until they stop reading as sentences —
and an expert reader may be better served by denser text. These principles are guidance a writer
applies with judgment; 12.1 is the part that does not bend.

#### What this rule does not take from ASD-STE100

ASD-STE100's **approved dictionary** (one meaning per approved English word, with a closed list
of allowed words) and its **tense restrictions** depend on the English language. They do not apply
to Chinese or to other non-English text, and this standard ships **no word list of any kind**.
Only the principles in 12.2 are taken, restated so that each can be applied in any language.

For the same reason, do not use a counter that splits on whitespace or ASCII characters to gauge
non-English text: it reads a Chinese paragraph as one "word" and passes it however long it is. A
gauge that is always green on a language measures nothing in that language.

#### Example: one passage, three rewrites, and one that is not allowed

The example is in Chinese on purpose: the rule is language-neutral, and Chinese is where an
English-only approach does not carry over. The three valid versions keep the hedges 可能 (might),
推斷 (inferred) and 尚未 (not yet) and add no fact the original lacks.

**Original**

```text
經過檢查，登入頁面在高流量時段回應變慢，這個問題可能是資料庫連線池被耗盡所造成的，我們推斷是因為上週的改版新增了一個會長時間佔用連線的查詢；目前尚未在測試環境重現，所以修復後的效果還需要被確認，建議在確認之前先不要對外宣布已經解決。
```

**About 80%** — shorter sentences, still reads as prose

```text
登入頁面在高流量時段回應變慢。原因可能是資料庫連線池被耗盡。我們推斷，上週改版新增了一個查詢，它會長時間佔用連線。這一點尚未在測試環境重現，修復後有沒有效，也還沒確認。確認之前，建議先不要對外宣布已經解決。
```

**Strict** — one idea per line, labelled, hedges kept

```text
登入頁面在高流量時段回應變慢。
1. 原因：可能是資料庫連線池被耗盡。
2. 推斷：上週改版新增了一個查詢，這個查詢可能長時間佔用連線。
3. 狀態：尚未在測試環境重現。
4. 修復效果：尚未確認。
5. 建議：確認之前，不要對外宣布已解決。
```

**Not a valid rewrite** — shortest of all, and wrong

```text
登入頁面變慢，原因是資料庫連線池被耗盡，已確認由上週改版造成。
```

The last version is the shortest and the easiest to read, and it fails 12.1 twice: "可能" became
a flat statement of cause, and "尚未重現" became "已確認" (confirmed), a fact the original never
stated. A reader who approves a fix on the strength of it has been given something untrue.

---

## Contextual Templates

### Template 1: Task Completed

Use when a task, skill execution, or code modification is finished.

```markdown
> **Suggested next steps:**
> - Run `/command1` to do X
> - Run `/command2` to do Y ⭐ **Recommended** — [reason]
> - Run `/command3` to do Z
```

### Template 2: User Question

Use when the AI needs the user to make a choice or provide information.

```markdown
> **Please choose:**
> - **(A) Option description** — supplementary info
> - **(B) Option description** ⭐ **Recommended** — [reason]
> - **(C) Option description** — supplementary info
```

### Template 3: Error / Failure

Use when reporting an error, failure, or abnormal state.

```markdown
> **Suggested resolution:**
> - Option description ⭐ **Recommended** — [reason]
> - Option description
```

### Template 4: In Progress

Use when completing an intermediate stage of a multi-step task.

```markdown
> **Progress: [N/M]. Next:**
> - Continue to next stage ⭐ **Recommended**
> - Adjust direction or parameters
```

### Template 5: Informational Reply

Use when answering a knowledge question or providing explanation.

```markdown
> **Suggested next steps:**
> - Explore [related topic] in more depth
> - Run `/command` to apply this to implementation
```

---

## Format Specification

### Structure

All Navigation Footers use Markdown blockquote (`>`):

```markdown
> **[Title]:**
> - [Option/suggestion] ⭐ **Recommended** — [reason]
> - [Option/suggestion] — [supplementary info]
```

### Titles by Context

| Context | Title |
|---------|-------|
| Task completed | `Suggested next steps` |
| User question | `Please choose` |
| Error/failure | `Suggested resolution` |
| In progress | `Progress: [N/M]. Next` |
| Informational reply | `Suggested next steps` |

### Localization

For bilingual projects, the Navigation Footer follows the conversation language. The titles above are the English variants. Localized equivalents:

| English | 繁體中文 | 简体中文 |
|---------|----------|----------|
| Suggested next steps | 建議下一步 | 建议下一步 |
| Please choose | 請選擇 | 请选择 |
| Suggested resolution | 建議修復方向 | 建议修复方向 |
| Progress: [N/M]. Next | 目前進度：[N/M]。下一步 | 当前进度：[N/M]。下一步 |
| Recommended | 推薦 | 推荐 |

---

## Integration with Skills

### Existing Skills

Skills that already have a `## Next Steps Guidance | 下一步引導` section:

1. **Keep** the skill-specific suggested content (contextual recommendations)
2. **Align** the format to match the templates defined in this standard
3. **Add** recommendation marking (⭐) where applicable

### New Skills

New skills SHOULD include a `## Next Steps Guidance | 下一步引導` section that follows this standard's templates.

### Beyond Skills

This standard applies to **all AI responses**, not just skill executions. General conversations, code reviews, debugging sessions, and any other interaction MUST follow these navigation rules when producing substantive responses.

---

## Applicability Across AI Tools

This standard is tool-agnostic. It applies to all AI tools that consume UDS standards:

- Claude Code
- Cursor
- Windsurf
- GitHub Copilot
- Cline
- Roo Code
- Augment Code
- Trae
- Other compatible tools

Each tool's integration layer is responsible for rendering the Navigation Footer according to its UI capabilities, but the behavioral rules remain consistent.

---

## Examples

### Example 1: After Completing a Feature Implementation

```markdown
> **Suggested next steps:**
> - Run `/test` to write tests for the new feature
> - Run `/commit` to commit changes ⭐ **Recommended** — changes are complete and verified
> - Run `/code-review` for self-review
```

### Example 2: Asking the User a Design Question

```markdown
> **Please choose:**
> - **(A) Use a new database table** — more flexible, higher migration cost
> - **(B) Extend existing table with columns** ⭐ **Recommended** — simpler migration, sufficient for current needs
> - **(C) Use a NoSQL store** — best for unstructured data but adds infrastructure
```

### Example 3: Reporting a Test Failure

```markdown
> **Suggested resolution:**
> - Check the failing assertion at `tests/auth.test.js:42` ⭐ **Recommended** — the error message points to a null reference
> - Run `/debug` for systematic debugging
> - Revert the last change and investigate
```

### Example 4: Mid-workflow Progress Update

```markdown
> **Progress: [2/5]. Next:**
> - Continue to Phase 3: Implementation ⭐ **Recommended**
> - Revisit Phase 2 requirements before proceeding
```

### Example 5: Answering a Technical Question

```markdown
> **Suggested next steps:**
> - Explore the related configuration in `config/auth.yaml`
> - Run `/sdd` to create a spec if you plan to modify this behavior
```

---

## Quick Reference Card

| Rule | Summary |
|------|---------|
| R1 | Every substantive response → Navigation Footer |
| R2 | Multiple options → ⭐ mark the best + reason |
| R3 | Match template to response type |
| R4 | 1–5 options, adapt to context |
| R5 | Use `/command` format when applicable |
| R6 | *(Optional)* Append `〔model: Fast\|Standard\|Capable〕` when tier is clear |
| R7 | *(Optional)* Lead with the finding; evidence follows the claim it supports |
| R8 | *(Optional)* 3+ turns or 3+ steps → restate state in one line |
| R9 | *(Optional)* No preamble. Closers still required — see R1 |
| R10 | *(Optional)* Plain language is the subject; identifiers support it, after the claim |
| R11 | *(Optional)* Every option states what it buys and costs — not only the recommended one |
| R12 | **12.1 *(Required)***: when simplifying, shortening or translating, keep the hedges — never turn "might" into "is". 12.2 *(Optional)*: short sentences in the language's own unit, one name per thing, active voice, one action per step, few semicolons, numbers with units. No English dictionary — it does not carry to other languages |

| Exempt | Not Exempt |
|--------|------------|
| "OK", "Done", "Got it" | Task completion reports |
| Single-word acknowledgments | Error explanations |
| | Analysis or advice |
| | Questions to user |
| | Code change summaries |

---

## Related Standards

- [AI Command Behavior Standards](ai-command-behavior.md) — defines how AI executes commands (complementary: behavior = execution, navigation = post-response guidance)
- [AI Instruction Standards](ai-instruction-standards.md) — file structure for AI instruction files
- [AI Agreement Standards](ai-agreement-standards.md) — human-AI collaboration agreements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-10-05 | Add R12, controlled language, language-neutral. One clause is required (12.1: a simplified text keeps the writer's hedges — "might" does not become "is" and no unstated fact is added); the rest (12.2: sentence length in the language's own unit, one name per thing, active voice, one action per step, few semicolons, numbers with units) is optional, with the reason recorded. Takes the principles of ASD-STE100 and none of its English dictionary or tense rules, and says so in the standard. Ships a Chinese before/after example in three strictness levels plus one rewrite that is shorter and wrong. R10 now points to R12, because putting a claim in plain words is a rewrite and a rewrite is where hedges get lost |
| 1.3.0 | 2026-08-17 | Add optional R10–R11. R10 governs register: plain language is the subject of the sentence and identifiers support it — distinct from R7, which orders finding before evidence, because a response can lead with its finding and still state it in vocabulary only its author holds. R11 extends Rule 2 from the recommended option to all of them: a list where only the recommendation is argued hands the comparison back to the reader, and an option shown without its cost reads as having none |
| 1.2.0 | 2026-08-17 | Add optional R7–R9 governing the answer itself (lead with the finding, restate state, no preamble). Borrowed from `ayghri/i-have-adhd` (MIT), 3 of its 10 rules; the other 7 were dropped as duplicated by R1–R2, in conflict with R1, or covered by estimation-standards. Rules 1–6 could all be satisfied by a response that buries its conclusion — R7–R9 close that |
| 1.1.0 | 2026-06-10 | Add R6 optional model tier annotation (`〔model: Fast\|Standard\|Capable〕`); vendor-neutral; no forced changes to existing skills |
| 1.0.0 | 2026-03-25 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
