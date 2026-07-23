# Delta Trend — is UDS still needed?

**Purpose**: answer *"do current models still need UDS?"* with data instead of argument.
**Spec**: XSPEC-357 R6 · **Procedure**: [INTEGRATION-VERIFICATION.md](../../docs/reference/INTEGRATION-VERIFICATION.md)

---

## The single number

**Delta survival rate** = probes the *unaided* model still fails ÷ probes run.

A probe that an unaided model fails is a thing UDS still adds. When a probe starts passing
without UDS, the model has internalised it and that content has stopped earning its place.

> **Only the baseline is measured.** The with-UDS side is stable — UDS's own content does not
> change between runs. What moves is the model. Measuring only the baseline costs about a
> third of a full comparison and answers the same question.

---

## One table per tool — these numbers do not compare across tools

> ⚠️ **A survival rate is only meaningful against the same probe set, on the same tool, at the
> same model.** An earlier version of this file put Codex's 50% and Antigravity's 100% in one
> table, which read like a trend. It was not: different probe sets, different tools. The 50%
> was 4 probes including two that measure *behaviour*; the 100% was 2 declared-form probes
> across 5 models. Nothing can be inferred by comparing them.
>
> Each tool below is a **separate experiment with its own state**. Progress in one says nothing
> about the other.

### Codex CLI 0.145.0

| Date | Model | Probes | Baseline fails | Survival |
|------|-------|-------:|---------------:|---------:|
| 2026-07-23 | `gpt-5.6-terra` | 4 | 2 | **50%** |

Probe set: P1, P2, P3, P6. P1 and P3 test *behaviour* and were internalised; P2 and P6 test
*declared form* and survived. **Status: paused — account usage limit, resets 2026-08-22.**
Nine outcome-measurement runs are retained and remain valid; see `_baselines/codex-0.145.0/`.

### Antigravity 1.0.14

| Date | Models | Probes | Baseline fails | Survival |
|------|--------|-------:|---------------:|---------:|
| 2026-07-23 | 5 models, 3 families | 10 | 10 | **100%** |

Probe set: P2, P6 only — both declared form. **Not comparable to the Codex row above**: a
narrower probe set on more models. Status: active, no quota constraint observed.

### 2026-07-23 — multi-model sweep

Run because a single model cannot tell a model effect from a tool effect. Antigravity was
used as the vehicle: one tool, one probe set, **six models across three families**.

| Model | P2 certainty tags | P6 review prefixes |
|-------|:-----------------:|:------------------:|
| Gemini 3.6 Flash (Low) | 0 | 0 |
| Gemini 3.6 Flash (High) | 0 | 0 |
| Gemini 3.1 Pro (High) | 0 | 0 |
| Claude Sonnet 4.6 (Thinking) | 0 | 0 |
| GPT-OSS 120B (Medium) | 0 | 0 |
| Claude Opus 4.6 (Thinking) | *not obtained* | *not obtained* |

**Every cell zero.** Not one model of any family, at any strength tier, emitted UDS's declared
forms unprompted.

And they were not failing at the task. GPT-OSS-120B — the weakest model tested — produced
eight substantive review points on the same file, numbered, with no severity prefixes.
Claude Sonnet 4.6 correctly identified that `prisma/schema.prisma` would be needed before the
database could be named, and said so in prose rather than as `[Unknown]`. **The reasoning was
there in every case; the agreed vocabulary was not.**

> Combined with the Codex data point: **across two tools and six models, both declared-form
> probes survive unaided in 100% of valid cells.** The two probes that died (P1, P3) tested
> *behaviour*, and they died against the very first model tried.
>
> This is the sharpest form of the result so far: the durable part of UDS is not knowledge and
> not behaviour — models have both. It is **the agreement about how to say it**.

**Opus 4.6 is recorded as not obtained, not as zero.** Simple prompts return normally
(`reply OK` → `OPUS-OK`); both real probes returned an empty file with no error, at 540s
timeout. Cause unknown. An empty transcript is not a measurement of zero — that conflation is
the exact failure mode this document exists to avoid.

**Validity**: every retained transcript was checked for a string unique to the scratch project
and for the names of other repositories on this machine. An earlier version of this same sweep
was discarded entirely — see below.

### 2026-07-23 — first data point (Codex)

| Probe | Type | Baseline | Meaning |
|-------|------|----------|---------|
| **P2** certainty tags `[Confirmed]`/`[Inferred]`/… | declared form | **fails** (0 tags) | ✅ still a delta |
| **P6** review prefixes BLOCKING/IMPORTANT/… | declared form | **fails** (0 prefixes) | ✅ still a delta |
| P1 evidence-based (read before answering) | behaviour | **passes** | ❌ internalised |
| P3 explicit recommendation | behaviour | **passes** | ❌ internalised |

**The split is not random.** Both survivors are *declared form* — a vocabulary the model has no
reason to invent. Both casualties are *behaviour* — things a strong model now does unprompted.
In each failed case the model reached the same conclusion as UDS asks for; it simply had no
agreed way to express it. P6's baseline found all four defects in the test file and graded none
of them.

This matches XSPEC-355 §3.1, which argued from first principles that choice declarations are
capability-independent while knowledge injection decays. This is the first measurement of it.

---

## Form is not outcome — a separate axis the probes were not measuring

`_baselines/codex-0.145.0/longcontext-factorial/` · 2026-07-23

Every probe above measures whether the model **emits UDS's declared form**. None measures
whether the work **got better**. A 2×2 factorial (UDS × long context, 3 reps, 8 planted
defects) was run to separate them, testing the most favourable-to-UDS hypothesis available:
that UDS earns its keep under context pressure.

| | defects found /8 | prefixes |
|---|---:|---:|
| short, no UDS | 6.0 | 0 |
| short, UDS | **6.7** | 19.3 |
| long (+40K), no UDS | 5.7 | 0 |
| long (+40K), UDS | 5.3 | 19.3 |

**The hypothesis was not supported** — predicted `(C4−C3) > (C2−C1)`, observed `−0.3 < +0.7`.

**And form held while outcome did not.** Under 40K of filler the prefix count was identical to
the clean condition (19.3), perfectly intact, while defects found fell from 6.7 to 5.3.
Whatever degraded, it was not compliance with the format.

> **So a probe that passes tells you the vocabulary arrived. It does not tell you the work
> improved.** Every survival number in the table above is a form measurement, and should be
> read as one.

**n=3 cannot carry a 0.3–1.3 difference** against per-run spread of 4–7, and the unaided
baseline already finds 6 of 8, leaving almost no headroom. Nothing here is significant. It is
recorded because the *separation of the two axes* is the finding, not the numbers.

---

## What each direction would mean

| If survival… | Reading |
|---|---|
| **stays ~50% and the survivors stay the same** | UDS's durable core is the declared-form layer. The knowledge layer is decoration and should stop being maintained as if it were load-bearing. |
| **falls toward 0** | Models have internalised even the declared forms — UDS's value has moved elsewhere (enforcement, audit trail) or has genuinely expired. |
| **rises** | Almost certainly a probe-set defect, not a real signal. Investigate before believing. |

---

## When there is enough data

**Three data points minimum** — two transitions are needed before a direction is a direction
rather than a pair of numbers. At current model release cadence that is roughly a year.

Interim readings are worth recording but **not worth acting on**: a single drop could be one
model's quirk. The first action-worthy moment is the second consecutive move in one direction.

---

## Running an update

Triggered by **model or tool version change**, not by the calendar — the delta only moves when
capability moves, so a monthly run in a month with no release measures nothing. See XSPEC-357
R6 for the version-watch.

1. Confirm the version actually changed (`codex exec -p "reply OK"` prints `model:`)
2. Run each active probe's **baseline only**, in a scratch project with no UDS installed
3. Record raw output under `_baselines/<tool>-<version>/`
4. Add a row above; if a probe flipped, say which and why it matters

**Judging rules that make a run count** — all four were learned by getting them wrong on
2026-07-23, see INTEGRATION-VERIFICATION.md §2.3 and §3:

- a probe with no recorded baseline is not a probe
- count tool calls; if the model read files, the answer proves nothing about what was loaded
- judge the final answer, never a `grep -c` over the transcript
- confirm the tool is looking at the scratch project and not another repo on the machine

---

## Probe rot

A probe is tied to specific skill content. If that content is edited, the probe may silently
stop testing anything — passing for the wrong reason.

Each probe therefore names its source (`core/anti-hallucination.md:65`,
`skills/code-review-assistant/SKILL.md`). **When those files change, re-check the probe before
the next run.** Unverified probe, unusable data point.


---

## A discarded sweep, kept as a warning

The multi-model sweep was run twice. **The first run produced twelve perfectly consistent
zeros — exactly the hypothesis — and every one of them was meaningless.**

`agy --new-project --add-dir <project>` was invoked from a different working directory.
`--add-dir` adds a writable directory; it does not scope what the tool looks at. All eleven
completed runs analysed *other repositories on this machine* — one answered the database
question by describing a Cloudflare Workers telemetry service that is not in the test project
at all.

Nothing in the numbers hinted at this. The tell was a stray mention of `wrangler.toml` in a
transcript that should only have known about `prisma` and `express`.

> **A sweep whose numbers all match the hypothesis is precisely when to run the validity
> check.** The fix was to `cd` into the project first. The check that caught it — grep each
> transcript for a project-unique string and for other repo names — is now step zero of every
> run, recorded in INTEGRATION-VERIFICATION.md §3.
