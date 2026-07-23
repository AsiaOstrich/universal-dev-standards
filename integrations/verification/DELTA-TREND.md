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

## Trend

| Date | Tool / model | Probes run | Baseline still fails | **Survival** |
|------|--------------|-----------:|---------------------:|-------------:|
| 2026-07-23 | Codex CLI 0.145.0 / `gpt-5.6-terra` | 4 | 2 | **50%** |

### 2026-07-23 — first data point

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
