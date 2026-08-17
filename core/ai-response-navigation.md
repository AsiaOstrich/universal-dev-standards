# AI Response Navigation Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-response-navigation.md) | [简体中文](../locales/zh-CN/core/ai-response-navigation.md)

**Version**: 1.2.0
**Last Updated**: 2026-08-17
**Applicability**: All projects using AI-assisted development
**Scope**: universal
**Industry Standards**: None (Emerging AI tool practice)
**References**: [SPEC-STD-08](../docs/specs/standards/SPEC-STD-08-ai-response-navigation.md)

---

## Purpose

This standard defines navigation behavior for AI responses: every substantive AI response MUST include contextual next-step suggestions with recommended options. This ensures users are continuously guided through development workflows without needing to memorize available commands.

**Problem**: Users don't know what to do next after receiving an AI response. With 30+ slash commands available, the cognitive load is high and workflow continuity is broken.

**Solution**: A standard "Navigation Footer" appended to every substantive AI response, with contextual templates, recommendation marking, and adaptive option quantities.

**Scope note (v1.2.0)**: Rules 1–6 govern what comes *after* the answer. Rules 7–9 — added in 1.2.0
and **optional** — govern the answer itself: lead with the finding, restate state across turns, no
preamble. They were added because a response can satisfy every one of Rules 1–6 while burying its
conclusion, and a reader who cannot find the answer is not helped by a correct footer telling them
what to do next.

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

## The Answer Before the Navigation (Rules 7–9, Optional)

> **Borrowed from**: [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd) (MIT), 3 of its 10 rules.
> The other 7 were dropped: 2 are already covered by Rules 1–2 above, and 5 either conflict with
> this standard (its "no recap / no closers" contradicts Rule 1's Navigation Footer; its
> "cap lists at 5" would truncate evidence tables and traversal denominators) or duplicate
> [estimation-standards](estimation-standards.md).

**Why this section exists**: Rules 1–6 govern what follows the answer. Nothing governed the answer
itself — a response could bury its conclusion under a wall of evidence and still satisfy every rule
in this standard by appending a correct Navigation Footer. A reader who cannot find the answer is
not helped by being told what to do next.

**These three rules are optional**, in the same sense as Rule 6: adopting projects are not required
to enable them, and existing skills need no retroactive update. A project MAY promote any of them to
required in its own configuration. What is *not* optional is that they have precise triggers — a rule
phrased so loosely that it never fires is indistinguishable from not having the rule.

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
| 1.2.0 | 2026-08-17 | Add optional R7–R9 governing the answer itself (lead with the finding, restate state, no preamble). Borrowed from `ayghri/i-have-adhd` (MIT), 3 of its 10 rules; the other 7 were dropped as duplicated by R1–R2, in conflict with R1, or covered by estimation-standards. Rules 1–6 could all be satisfied by a response that buries its conclusion — R7–R9 close that |
| 1.1.0 | 2026-06-10 | Add R6 optional model tier annotation (`〔model: Fast\|Standard\|Capable〕`); vendor-neutral; no forced changes to existing skills |
| 1.0.0 | 2026-03-25 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
