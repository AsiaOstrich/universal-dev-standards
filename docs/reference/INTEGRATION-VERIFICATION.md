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
| **Does the tool actually behave accordingly?** | **This procedure** |
| Is the tool still alive? | `deprecated` in the registry |

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
| **P1** evidence-based | "models guess rather than decline" | **read the file, answered correctly** | **cut** |
| **P2** certainty tags | "four-tag vocabulary is UDS-specific" | **zero tags emitted** | **✅ active** |
| **P3** explicit recommendation | "models present balanced menus" | **produced its own `### Recommendation`** | **cut** |
| P4 / P5 | conditional | not yet run | pending |

**Three of four testable assumptions about default model behaviour were wrong**, and every one
of them had a confident, specific, plausible-sounding justification written next to it.

This is a result about UDS, not just about the probe set: **the delta between "what a current
model does unaided" and "what UDS asks for" is much smaller than the always-read tier assumes.**
XSPEC-355 R1 argued that on evidence about context rot and instruction density; this is the
first direct measurement of the delta itself, and it points the same way — harder.

What survives is instructive. P2 works **not** because the model fails to reason about
certainty — it did distinguish verified from unverified perfectly well — but because it does
not *declare* certainty in the form UDS specifies. The durable part of the always-read tier
looks like **declared form and house convention**, not knowledge.

---

### ~~P1 — Evidence-based analysis `AH-001` + `AH-002`~~ · **CUT — baseline passed** `[確認 2026-07-23]`

**Not in the active set.**

The probe asked for a config value in a file the tool had not opened, passing if the file was
read before answering rather than guessed. The stated delta reasoning was that an unconfigured
model guesses a common default (30s, 5000ms) because guessing sounds more helpful than
declining.

**Baseline run** — Antigravity CLI 1.0.14, no UDS, `--new-project --add-dir .`: it listed the
two project files, opened `src/config.js`, and answered **45000** — the correct value, from a
file deliberately named `quickTimeout` to make guessing attractive. It did not guess.

**Why it could not be salvaged**: same shape as P3. What remains is that UDS asks for an
explicit `[Source: <path>]` attribution while the baseline used a markdown file link. That is
a vocabulary difference, and §2.2 rules out matching on exact tokens.

Baseline: `integrations/verification/_baselines/antigravity-1.0.14/P1-CUT.txt`.

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

### ~~P3 — Explicit recommendation `AH-004`~~ · **CUT — baseline passed** `[確認 2026-07-23]`

**Not in the active set.** Kept here as the worked example for §2.3.

The probe was: *"We need to add caching here. What are our options?"*, passing if the answer
committed to one path instead of presenting a neutral menu. The stated delta reasoning was
that a balanced menu is default model behaviour.

**Baseline run** — Antigravity CLI 1.0.14, no UDS installed, `probe-project` scratch repo:
the answer produced five options, a comparison table, **and its own `### Recommendation`
section** with a conditional recommendation (single-server → `node-cache`, multi-server →
Redis + `Cache-Control`). It passed the probe without ever having seen UDS.

**Why it could not be salvaged**: the remaining difference is that UDS asks for the literal
`[Recommended]` marker. Testing for that string is text matching, which §2.2 rules out as
too brittle to survive run-to-run variation. A probe that can only distinguish UDS by an exact
token is measuring vocabulary, not behaviour.

> This does **not** mean `AH-004` should leave the always-read tier — a house style for how
> recommendations are marked is a legitimate choice declaration. It means AH-004 is not
> **detectable from the outside**, so it cannot serve as evidence that a tool read UDS.

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

**Requires**: the scratch project configured `uds config --lang zh-TW` or the bilingual commit
option. Skip otherwise.

**Prompt**:
> Commit this change.

**Passes if** the message follows the **configured option's** template
(`<type>(<scope>): <English subject>. <Chinese subject>.`) — not merely Conventional Commits,
which the model does anyway.

**Why this is a delta probe**: the shape is only knowable by reading the project's UDS option.

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
