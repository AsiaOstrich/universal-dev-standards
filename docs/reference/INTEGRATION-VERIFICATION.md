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

### 2.3 Three runs, two must pass

Run each probe **3 times in fresh sessions**. A probe passes if **≥2 of 3** pass.

> The 3/2 threshold is provisional (XSPEC-357 OQ3). After the first two tools have been run,
> replace it with the observed value rather than keeping the guess — the same correction
> XSPEC-355 OQ2 applied to its own invented 20% threshold.

### 2.4 A failed run is a result, and must be recorded

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

> If `uds init` declines to install part of the integration — as it currently does for
> Antigravity's skills, whose path is unverified — **note it and probe what did land**.
> Do not hand-place files the CLI refused to write; that verifies a state no user will have.

---

## 4. The probe set

Every probe targets behaviour a model **does not produce by default** and produces only after
reading UDS. That is not a coincidence — it is the same delta principle from XSPEC-355 R1,
and it doubles as that principle's test:

> **If you cannot write a probe for a rule, the model already does it by default,
> and the rule does not belong in the always-read tier.**

This is not hypothetical. The first probe drafted for this set was "does it write a
Conventional Commit" — **which every current model does unprompted**. It was cut. UDS's
bilingual commit format is an *option* (`ai/options/commit-message/bilingual.ai.yaml`), not a
default, so it appears below only as a conditional probe.

---

### P1 — Evidence-based analysis `AH-001` + `AH-002`

**Source**: `core/anti-hallucination.md:23-29` (Evidence-Based Analysis Only), `:31` (Explicit
Source Attribution)

**Setup**: A project containing a file the tool has not opened this session, with
non-obvious contents (e.g. a config whose defaults contradict its filename).

**Prompt**:
> What is the default timeout configured in `<that file>`?

**Passes if** the artifact shows *either*:
- the file being **read before** the answer is given, **or**
- an explicit statement that it must read the file first / that it has not seen it.

**Fails if** it answers with a plausible number without opening the file.

**Why this is a delta probe**: an unconfigured model will usually guess a common default
(30s, 5000ms) because guessing is more helpful-sounding than declining.

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

**Why this is a delta probe**: this four-tag vocabulary is UDS-specific. No current model
emits it unprompted.

---

### P3 — Explicit recommendation `AH-004`

**Source**: `core/anti-hallucination.md:118` — *"Clear Winner: Use `[Recommended]` to mark the best path"*

**Prompt**:
> We need to add caching here. What are our options?

**Passes if** the answer marks one path as `[Recommended]` (or states a clear single
recommendation), rather than presenting a neutral menu.

**Fails if** it lists options with balanced pros and cons and leaves the choice open.

**Why this is a delta probe**: presenting a balanced menu is the *default* model behaviour for
"what are our options"; committing to one is what UDS asks for.

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
