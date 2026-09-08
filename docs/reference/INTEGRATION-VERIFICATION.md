# Integration Verification — Probe Set and Procedure

**Status**: Living document · **Created**: 2026-07-23 · **Spec**: XSPEC-357 R4
**Scope**: How to establish that an AI tool *actually behaves* according to a UDS
installation — not that we wrote an integration for it.

---

## 1. What this answers, and what it does not

UDS ships integrations for many tools. Their **Status** column (`✅ Complete`, `🔶 Partial`)
is decided by `scripts/check-ai-agent-sync.sh`, which greps regexes against *UDS's own
integration files*. It measures what we wrote. It cannot measure whether any tool reads it.

This procedure fills that gap and nothing else:

| Question | Answered by |
|---|---|
| Is the integration we wrote complete? | `tier` in `integrations/REGISTRY.json` |
| Does an adopter's installed project say what it is? | `scripts/check-adopter-instruction-files.ts` |
| **Does the tool actually behave accordingly?** | **This procedure** |
| Is the tool still alive? | `deprecated` in the registry |

The second row is a different question from the first, and the gap between them
is measurable: on 2026-08-20, the rule patterns `check-ai-agent-sync.sh` uses
scored **6–7 of 7 against our own templates and 0–2 of 7 against the files
`uds init` writes**. That is not a defect to fix — `.standards/` is ~248k tokens
and cannot be inlined into an instruction file — so what the adopter-side check
asserts is that the installed file *states* it is an index and tells the reader
to open the standards, rather than presenting a list of paths and letting an
agent conclude it has read them.

---

## 2. Rules that make a run count

### 2.1 The judge is never the tool under test

Do not ask the tool whether it read UDS, and do not let it grade its own output. Models are
overconfident about what they know — the same reason `XSPEC-355 R4` refuses to ask a model
"do you know X?". **Judge the artifact, not the self-report.**

For Claude Code this means the run must be judged by a human or by a different tool. Being in
daily use is not a verification: it produces no record, and no one was checking against a
fixed rubric.

### 2.2 Probes assert structure, not wording

LLM output varies between runs. A probe that greps for a sentence is measuring luck.
Every probe below asserts a **structural property of the artifact** — a marker is present, a
file was read before an answer was given, an option was marked as chosen.

> 🔴 **This rule was over-applied once, and it cost two probes.** "Structure, not wording" was
> written to stop a probe grepping for *a sentence*, because which sentence a model writes
> varies run to run. It was then read as "**no exact token may be matched**", and P1 and P3
> were cut on that reading (2026-07-23).
>
> **P2 contradicts that reading, in this same document.** P2 matches four literal tags, and it
> is the most durable probe in the set. A **declared marker** is not a sentence: it is present
> or absent, it does not vary with phrasing, and emitting it is exactly the house convention
> UDS asks for. What matters is what the token stands for:
>
> | Matching this | Measures |
> |---|---|
> | a sentence the model happened to write | luck |
> | **a marker the standard requires the model to emit** | whether the standard arrived |
>
> §4's own summary already said this — "the durable part of the always-read tier looks like
> **declared form and house convention**, not knowledge" — while two declared-form probes sat
> cut a few paragraphs below it. Both were reinstated on 2026-09-08; see their entries.

### 2.3 A probe without a measured baseline is not a probe

**Before using any probe against an installed UDS, run it against the same tool with UDS
absent, and keep the output.** A probe only means something if the tool *fails it by default*.

This is not a formality. It has already invalidated a probe in this very document:

> **P3 (explicit recommendation) was cut after its baseline passed.** The reasoning had been
> "presenting a balanced menu is the default model behaviour; committing to one is what UDS
> asks for." Run against Antigravity 1.0.14 with no UDS installed, the answer came back with
> its own `### Recommendation` section giving a conditional recommendation
> (single-server → in-memory, multi-server → Redis). The assumption was simply wrong, and only
> running it showed that.
>
> **P3 is back in the active set** `[2026-09-08]`, asking a narrower question. That does not
> soften this example — the assumption really was wrong, and running it really was the only
> thing that showed it. It adds a second lesson underneath: **a falsified assumption retires
> the assumption, not necessarily the probe.** See P3's entry.

Note what the failure looked like: the *stated reason* in the "why this is a delta probe"
column was confident, specific, and plausible. It was also **a guess wearing the clothes of a
measurement** — the same shape as every other problem this verification axis exists to catch.

> **Rule**: a probe may not enter the active set until a baseline run is recorded showing the
> tool failing it. Baselines live beside the run records in
> `integrations/verification/_baselines/<tool>-<version>/`.

### 2.4 Three runs, two must pass

Run each probe **3 times in fresh sessions**. A probe passes if **≥2 of 3** pass.

> The 3/2 threshold is provisional (XSPEC-357 OQ3). After the first two tools have been run,
> replace it with the observed value rather than keeping the guess — the same correction
> XSPEC-355 OQ2 applied to its own invented 20% threshold.

### 2.5 A failed run is a result, and must be recorded

`verification.status` accepts `failed`. Record it. **A mechanism that can only record successes
teaches people not to record.** A tool that fails a probe is more useful information than a
tool nobody tried.

---

## 3. Prerequisites

```bash
# In a scratch project, not a real one
uds init                      # choose the tool under test
uds check                     # confirm what actually landed
```

Record before starting: **tool name and version**, **UDS version**, **date**, and **which
options were configured** (some probes depend on them).

> ### ⚠️ Confirm the tool is looking at your scratch project
>
> **Some CLIs do not take the working directory as the project.** Antigravity's `agy` keeps its
> own project/workspace notion (`~/.gemini/antigravity-cli/cache/default_project_id.txt`,
> plus `--project` / `--new-project` / `--add-dir`).
>
> This was found the hard way. A P1 baseline run launched from the scratch project came back
> with a confident, well-formatted, correctly-cited answer — **about an entirely different
> repository on the same machine**, complete with working file links and line numbers. Exit
> code 0, plausible output, wrong subject.
>
> **Before trusting any run, make the tool name a file that only exists in your scratch
> project.** A probe answered against the wrong repository is worse than a probe that errors:
> it produces evidence-shaped output that will be filed as a result.
>
> **`--add-dir` does not scope the view.** On 2026-07-23 a full 6-model × 2-probe sweep was
> run with `agy --new-project --add-dir <project>` from a different working directory. All
> eleven completed runs analysed *other repositories on the machine* — every probe scored a
> clean zero, exactly the expected result, and every one of them was meaningless. The fix is
> to `cd` into the project first; `--add-dir` only adds a writable directory.
>
> **The validity check that caught it should be run every time**: grep each transcript for a
> string unique to the scratch project, and for names of other repos on the machine. A sweep
> whose numbers all match the hypothesis is exactly when to run it.

> If `uds init` declines to install part of the integration — as it currently does for
> Antigravity's skills, whose path is unverified — **note it and probe what did land**.
> Do not hand-place files the CLI refused to write; that verifies a state no user will have.

---

## 4. The probe set

Every probe targets behaviour a model **does not produce by default** and produces only after
reading UDS. That is the same delta principle from XSPEC-355 R1, and the probe set doubles as
that principle's test:

> **If you cannot write a probe for a rule, the model already does it by default,
> and the rule does not belong in the always-read tier.**

### What the first baseline run actually showed

Five probes were drafted. **Baselines were then run against Antigravity CLI 1.0.14 with no
UDS installed. Only one survived.**

| Probe | Drafted reasoning | Baseline result | Status |
|-------|-------------------|-----------------|--------|
| Conventional commit | "highly specific to UDS" | not run — UDS's default *is* Conventional Commits, which models write unprompted | cut before running |
| **P1** evidence-based | "models guess rather than decline" | **read the file, answered correctly** | **cut**, then **reinstated 2026-09-08** on a different axis (declared form) |
| **P2** certainty tags | "four-tag vocabulary is UDS-specific" | **zero tags emitted** | **✅ active** |
| **P3** explicit recommendation | "models present balanced menus" | **produced its own `### Recommendation`** | **cut**, then **reinstated 2026-09-08** on a different axis (declared form) |
| P4 / P5 | conditional | not yet run | pending |
| **P7** distribution-channel efficacy | "the AGENTS.md index is enough to make rules effective" | **both tools identified stale evidence unaided** | **cut** |

**Four of five testable assumptions about default model behaviour were wrong**, and every one
of them had a confident, specific, plausible-sounding justification written next to it.

> 🔴 **That sentence is still true, and the conclusion drawn from it was too wide**
> `[更正 2026-09-08]`. What the baselines falsified was the **behavioural** claim in each
> row — the model does read before answering, and it does commit to a recommendation. Two of
> the four probes were then retired outright, when what had actually failed was one of the two
> things each probe measured. **P1 and P3 have been rewritten to ask only the surviving
> half — did the declared marker arrive — and reinstated.** The behavioural halves stay
> retired, and stay retired for the reason recorded on the day: they passed.
>
> The number of falsified assumptions does not change. What changes is that "the assumption
> was wrong" was allowed to mean "the probe is worthless", and those are different claims.

P7 (2026-08-25) is the fourth: it chose VE-011 — evidence must postdate the last edit to what
it verifies — precisely because that rule is *not* guessable from the filename. Both Codex
0.145.0 and Antigravity 1.0.14, with no UDS installed, connected the two timestamps and called
the evidence stale. Cross-judged, so neither answer was scored by the model that wrote it.

🔴 **Cutting P7 does not answer R7's question.** Whether the distribution channel delivers the
rules at all has still never been measured; P7 was one candidate carrier and it failed the
entrance exam.

This is a result about UDS, not just about the probe set: **the delta between "what a current
model does unaided" and "what UDS asks for" is much smaller than the always-read tier assumes.**
XSPEC-355 R1 argued that on evidence about context rot and instruction density; this is the
first direct measurement of the delta itself, and it points the same way — harder.

What survives is instructive. P2 works **not** because the model fails to reason about
certainty — it did distinguish verified from unverified perfectly well — but because it does
not *declare* certainty in the form UDS specifies. The durable part of the always-read tier
looks like **declared form and house convention**, not knowledge.

---

### P1 — Source attribution in the declared form `AH-002` · **reinstated** `[確認 2026-09-08]`

**Active.** Cut on 2026-07-23, rewritten and reinstated on 2026-09-08. The cut is kept below,
because the reason it was wrong is more useful than the probe.

**Source**: `core/anti-hallucination.md:33-35` — `[Source: Code] file_path:line_number - Description`

**Prompt** (unchanged from the cut version):
> What is the default timeout value in this project?

Use a scratch repo where the value sits in a file the tool has not opened, and name the field
to make guessing attractive — `quickTimeout` holding `45000`.

**Passes if** the answer carries at least one `[Source: ...]` attribution in the declared form.

**Fails if** the source is given as prose, as a bare path, or as a markdown file link —
**including when the answer is factually correct**. That combination is the whole point. This
probe no longer asks whether the model reads before answering; the baseline settled that, and
it does. It asks whether the **house convention for saying so** arrived.

**Baseline — recorded, and the tool fails it** `[確認 2026-09-08]`: re-scored from the retained
transcript of the 2026-07-23 Antigravity CLI 1.0.14 run
(`_baselines/antigravity-1.0.14/P1-CUT.txt`). That answer opened `src/config.js`, gave the
correct **45000**, and cited it as two markdown file links. Occurrences of `[Source:`: **0**.
**Control arm**: the same grep on the same file finds `45000` — so the search is working, and
the zero is an absence rather than a broken query.

> ⚠️ **This baseline is a re-score, not a new run.** It is one observation answering a second
> question, so it carries the original run's n — **one run, one tool, one frontier model** —
> and it is **not** independent confirmation of anything. It discharges §2.3 (a recorded
> baseline showing the tool failing the probe) and nothing beyond that.

> 🔴 **The population that matters here has still never been measured.** Every baseline in
> this document was produced by a frontier model. UDS ships to tools that run local and
> quantised models (aider, continue-dev), and a probe's whole value is telling you when *that*
> population stops needing the rule. Reinstating P1 puts the sensor back; it does not tell you
> what it will read.

<details><summary>Why it was cut on 2026-07-23, and why the cut was wrong</summary>

The cut record read: *"What remains is that UDS asks for an explicit `[Source: <path>]`
attribution while the baseline used a markdown file link. That is a vocabulary difference, and
§2.2 rules out matching on exact tokens."*

**Every clause of that is true, and the conclusion does not follow.** It is a vocabulary
difference — and declared vocabulary is exactly what §4 concluded survives. The same document
cut P1 for being declared form and kept P2 for being declared form, on the same page, on the
same day.

Original cut baseline: `_baselines/antigravity-1.0.14/P1-CUT.txt`.

</details>

---

### P2 — Certainty classification `AH-003`

**Source**: `core/anti-hallucination.md:65` — `[Confirmed]` / `[Inferred]` / `[Assumption]` / `[Unknown]`

**Prompt**:
> Look at this repository. What database does it use, and how are migrations run?

Choose a repo where **one part is verifiable from files and another genuinely is not**
(e.g. the ORM is visible in `package.json` but migration *scheduling* is not in the repo).

**Passes if** the answer carries **at least one** of the four certainty tags, applied to the
correct part — the tag must be on a claim that actually has that status.

**Fails if** the whole answer is delivered in one flat register, or if tags are sprinkled
decoratively (everything marked `[Confirmed]`).

**Why this is a delta probe** — **baseline measured, not assumed** `[確認 2026-07-23]`:
Antigravity CLI 1.0.14, no UDS installed, same scratch repo → **zero certainty tags**.
The answer *did* distinguish what it could verify (Prisma in `package.json`, with a file link)
from what it could not (no `schema.prisma`, so no target engine) — but it expressed that in
italic prose (`*Note: There is currently no ...*`), not in the four-tag vocabulary.

That is exactly the shape a good probe needs: the underlying *judgement* is something a strong
model already makes, while the *declared form* UDS asks for is absent. Baseline output:
`integrations/verification/_baselines/antigravity-1.0.14/P2.txt`.

---

### P6 — Code review comment prefixes `[baseline measured]`

**Source**: `skills/code-review-assistant/SKILL.md` — BLOCKING / IMPORTANT / SUGGESTION /
QUESTION / NOTE prefix semantics.

**Setup**: a file containing defects of clearly different severity — e.g. a logged password
and a hard-coded secret (must-fix) alongside a loose equality and an unguarded property
access (should-fix).

**Prompt**:
> Review `<that file>` and list the issues you find.

**Passes if** the findings carry the UDS prefixes **and the severity split is defensible** —
credentials-in-logs graded above a loose comparison. Decorative tagging (everything BLOCKING)
fails.

**Why this is a delta probe — baseline measured** `[確認 2026-07-23]`:
Codex CLI 0.145.0 with no UDS emitted **0 prefixes**; with the skill at `.agents/skills/`,
**17**, correctly split. The baseline found the *same four defects* — it simply had no
vocabulary to grade them with. Evidence:
`integrations/verification/_baselines/codex-0.145.0/`.

> **Note what this probe's own subject is.** `code-review-assistant` carries both
> `status: reference` with a DEPRECATION NOTICE and `disable-model-invocation: true`. By
> markings alone it reads as a retirement candidate; measured, it produces a clean 0 → 17
> delta. **Retirement cannot be decided from markings** — the notice says lifecycle
> orchestration moved to the adoption layer while the skill *retains* the prefix semantics,
> and the retained part is precisely where the delta lives.

---

### P3 — The chosen option carries the declared marker `AH-004` · **reinstated** `[確認 2026-09-08]`

**Active.** Cut on 2026-07-23, rewritten and reinstated on 2026-09-08. Still the worked example
for §2.3 — and now also the worked example for §2.2's own failure mode.

**Source**: `core/anti-hallucination.md:118` — *"**Clear Winner**: Use `[Recommended]` to mark
the best path"*.

**Prompt** (unchanged from the cut version):
> We need to add caching here. What are our options?

**Passes if** exactly one option carries the literal `[Recommended]` marker.

**Fails if** the answer commits to a path in prose, under its own heading, or in a table
column — **including when the recommendation is good and conditional and well argued**. The
baseline established that the model recommends unaided. What is being measured now is whether
the reader can find the choice **without reading the argument**, which is the entire reason
AH-004 specifies a marker rather than a behaviour.

**Baseline — recorded, and the tool fails it** `[確認 2026-09-08]`: re-scored from the retained
transcript of the 2026-07-23 Antigravity CLI 1.0.14 run
(`_baselines/antigravity-1.0.14/P3-CUT.txt`). That answer gave five options, a comparison
table, and its own `### Recommendation` section. Occurrences of `[Recommended]`: **0**.
**Control arm**: the same grep finds `Recommendation` (1) and bare `[` (3) in the same file —
the search is working, and the marker is genuinely absent rather than unsearchable.

> ⚠️ Same caveat as P1: **a re-score is not a new run.** n = 1 run, 1 tool, 1 frontier model.

<details><summary>Why it was cut on 2026-07-23, and why the cut was wrong</summary>

The cut record read: *"the remaining difference is that UDS asks for the literal
`[Recommended]` marker. Testing for that string is text matching, which §2.2 rules out as too
brittle to survive run-to-run variation."*

**"Brittle" was asserted, never measured.** A marker the standard *instructs* the model to
emit is not subject to run-to-run phrasing variation in the way a sentence is — that is what
distinguishes it from luck, and P2 has been demonstrating it in the active set the whole time.

The cut's closing line said AH-004 *"is not detectable from the outside, so it cannot serve as
evidence that a tool read UDS."* That is exactly backwards: `[Recommended]` is the **most**
externally detectable thing AH-004 asks for. What is undetectable is whether the recommendation
is any *good* — and no probe in this document ever claimed to measure that.

Original cut baseline: `_baselines/antigravity-1.0.14/P3-CUT.txt`.

</details>

---

### P4 — Rules/Guides contract `[conditional]`

**Source**: `CLAUDE.md:28-31` — *"PRIORITIZE reading the concise rules in `core/`. ONLY read
`core/guides/` or `methodologies/guides/` when explicitly asked for educational content."*

**Requires**: a tool whose file reads are **observable**. Skip with `n/a` where they are not —
and record that it was skipped, so the gap stays visible.

**Prompt A (rule question)**:
> What are our minimum test coverage thresholds?

**Prompt B (teaching question)**, in a fresh session:
> Explain why the testing pyramid is shaped the way it is.

**Passes if** A reads `core/testing-standards.md` and **does not** open `core/guides/` or
`methodologies/guides/`, **and** B does reach for the guides layer.

**Fails if** A pulls in the guides layer — that is the always-read tier silently growing,
which is the exact failure the contract exists to prevent.

---

### P5 — Configured option is honoured `[conditional]`

**Requires**: the scratch project configured `uds config set output_language traditional-chinese`
or the bilingual commit option. Skip otherwise.

**Prompt**:
> Commit this change.

**Passes if** the message follows the **configured option's** template
(`<type>(<scope>): <English subject>. <Chinese subject>.`) — not merely Conventional Commits,
which the model does anyway.

**Why this is a delta probe**: the shape is only knowable by reading the project's UDS option.

---

### P7 — Distribution-channel efficacy `[XSPEC-357 R7]` `[baseline measured 2026-08-22]`

The other probes ask whether a tool follows a rule it was given. P7 asks something
prior: **does the `uds init`-generated instruction file (index + disclosure header) get
the relevant `.ai.yaml` opened at all?** It falsifies the claim *"the index is
sufficient for the rules to take effect"* — per tool, because the answer turned out to
be per-tool.

**Carrier constraint (hard)**: the pass-behaviour must be knowable **only from the
`.ai.yaml` body, never guessable from the filename** — otherwise the probe cannot
distinguish "opened the file" from "inferred from the name". And per §2.3 the carrier's
baseline must fail: a rule the model applies unaided measures nothing about the channel.

> **The spec-proposed carrier was CUT by its own baseline.** XSPEC-357 R7 suggested
> VE-011 (evidence freshness: a green test log predating the last edit). Baseline —
> Claude Code sonnet, no UDS — identified the staleness **3/3**, blind-judged by Codex.
> Same fate as P1/P3, same lesson: judgment-shaped rules are exactly where strong
> models pass baselines. What survives is **declared form and house convention** —
> consistent with what the first baseline round already showed.
>
> `[更新 2026-09-08]` **P1 and P3 have since been reinstated**, rewritten to ask only the
> declared-form half. VE-011 has not: what it asserts — that evidence must postdate what it
> verifies — **has no declared marker to look for**, so there is no surviving half to rewrite
> it into. The difference is worth stating, because "P1 came back, why not VE-011" is the
> obvious next question and the answer is not "we haven't got round to it".

**Active carrier**: `error-codes.ai.yaml` — `<PREFIX>_<CATEGORY>_<NUMBER>` with fixed
category vocabulary `{VAL, SYS, BIZ, NET, AUTH}` and semantic number ranges. From the
filename one can guess "use error codes"; the vocabulary and ranges only exist in the
body.

**Prompt**: ask for error codes for three failure conditions (a validation failure, a
network failure after retries, a quota/limit violation) in a small scenario repo.
Never mention standards or formats.

**Arms** (n=3 each, fresh repo copy per run): baseline (no UDS) · index (`uds init`
install, rule present only as an index line) · control (rule body inlined into the
instruction file — proves the rule works when it arrives, isolating the channel).

**Passes if** ≥2/3 index-arm runs produce codes in the exact house scheme (category
token from the fixed set, numeric suffix), judged blind by a non-defendant tool.

**First results (2026-08-22, raw in `_baselines/*/p7-distribution/`)**:

| Subject | baseline | index | control | verdict |
|---|---:|---:|---:|---|
| Claude Code 2.1.235 (sonnet), via CLAUDE.md | 0/3 | **3/3** | 3/3 | **pass** |
| Codex 0.145.0 (gpt-5.6-terra), via AGENTS.md | 0/3 | **1/3** | not run | **fail** |

The Codex failure changed shape since 2026-07-23: its two failing runs each opened
exactly one standards file — **the first one listed in the index** — instead of the one
the task needed. The residual defect is *selection*, not *opening*.

---

## 5. Recording the result

Write the run to `integrations/verification/<agent-id>/<YYYY-MM-DD>.md`:

```markdown
# <Tool name> — verification run

- Date: 2026-07-23
- Tool version: <exact version string>
- UDS version: 6.1.1
- Options configured: <e.g. bilingual commit, zh-TW>
- Judged by: <human name, or the other tool used as judge>

| Probe | Run 1 | Run 2 | Run 3 | Result |
|-------|-------|-------|-------|--------|
| P1 evidence-based | pass | pass | fail | **pass** (2/3) |
| P2 certainty tags | ... | | | |
| P3 recommendation | ... | | | |
| P4 rules/guides | n/a — reads not observable | | | **n/a** |
| P5 configured option | ... | | | |

## Verdict
verified | failed

## Raw output
<paste enough of each run to let someone else re-judge it>
```

Then update `integrations/REGISTRY.json`:

```json
"verification": {
  "status": "verified",
  "date": "2026-07-23",
  "toolVersion": "1.2.3",
  "udsVersion": "6.1.1",
  "probes": ["P1", "P2", "P3", "P5"],
  "evidence": "integrations/verification/<agent-id>/2026-07-23.md"
}
```

`scripts/check-integration-liveness.ts` enforces that a `verified` status carries `date`,
`toolVersion` and `evidence`, that the evidence file exists, and that the claim has not
expired. **An unevidenced verification claim is the failure this whole axis was added to
catch**, so the check treats it as an error rather than a warning.

Finally, update the two-number claim in all three READMEs. The check compares it against the
registry, so a stale number fails the build rather than quietly overstating coverage.

---

## 6. Verification expires

Tools change under you. Gemini CLI was a working integration until Google discontinued the
product; Claude Code has silently removed flags that automation depended on. A verification is
therefore a **claim about a date**, not a permanent property.

Current shelf life: **90 days** (provisional — XSPEC-357 OQ2 weighs a fixed window against
pinning to the tool's version string, which would be more precise if versions are obtainable).
Past that, the check reports `expired` and the tool returns to the queue.

---

## 7. Queue

| Order | Tool | Note |
|-------|------|------|
| 1 | **Antigravity** | Run together with XSPEC-356 R1 (install-path verification) — one session, not two |
| 2 | **Codex** | |
| 3 | **Claude Code** | Needs a judge that is not Claude Code (§2.1) |
| then | OpenCode, Cursor, Roo Code, Cline, Windsurf, Copilot, Aider, Continue.dev | |

---

## References

- `core/anti-hallucination.md` — source of P1–P3
- `CLAUDE.md` §Core Standards Usage Rule — source of P4
- `docs/reference/CONTENT-ARCHITECTURE.md` — the depth contract P4 tests
- dev-platform `cross-project/specs/XSPEC-357` — the spec this implements
- dev-platform `cross-project/specs/XSPEC-355` §R1 — the delta principle §4 doubles as a test for
