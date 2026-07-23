# Long-context factorial experiment — does UDS help, or only look like it?

**Date**: 2026-07-23 · **Tool**: Codex CLI 0.145.0 / `gpt-5.6-terra` · **Spec**: XSPEC-357 R6

## Why this exists

Every probe before this one measured **form**: did the model emit `[Confirmed]`, did it emit
`BLOCKING`. None measured **outcome**: did the review actually get better. A review that
carries the right prefixes and misses the bug is decoration, and possibly worse than nothing.

It also tested the most favourable-to-UDS hypothesis available: that UDS earns its keep under
context pressure, which short clean probes cannot see.

## Design

`subject-orders.js` — 8 planted defects, 2 intended baits. `ground-truth.md` has the key.
Filler for the long conditions: 40,000 characters of real, unrelated production code
(telemetry service), prepended and explicitly marked as background.

| | no UDS | UDS skill at `.agents/skills/` |
|---|---|---|
| **short context** | C1 | C2 |
| **long context (+40K)** | C3 | C4 |

3 repetitions each, 12 runs.

## Results

| Condition | defects found /8 | false positives | prefixes |
|-----------|-----------------:|----------------:|---------:|
| C1 short, no UDS | 6.0 | 0.3 | 0 |
| C2 short, UDS | **6.7** | 0.0 | 19.3 |
| C3 long, no UDS | 5.7 | 0.3 | 0 |
| C4 long, UDS | 5.3 | 0.0 | 19.3 |

    UDS effect, short context   (C2-C1)  +0.7
    UDS effect, long context    (C4-C3)  -0.3
    long-context cost, no UDS   (C3-C1)  -0.3
    long-context cost, with UDS (C4-C2)  -1.3

## What this shows, stated no more strongly than the data allows

**The hypothesis was not supported.** The prediction was `(C4−C3) > (C2−C1)` — UDS mattering
more under pressure. Observed: `−0.3 < +0.7`, the opposite direction.

**Form held while outcome did not.** C4 emitted 19.3 prefixes per run, identical to C2 — the
declared form survived 40K of filler perfectly intact — while defects found fell from 6.7 to
5.3. Whatever degraded, it was not compliance with the format. **This is the sharpest evidence
so far that form adherence and purpose achievement are separate things**, and the probe set
until now measured only the first.

**n=3 cannot carry these differences.** Per-run spread is wide (C1: 7,6,5 · C3: 6,7,4). A gap
of 0.3–1.3 defects sits inside that noise. Nothing here is significant; treat every number
above as a pointer to a bigger experiment, not a finding.

**Ceiling effect.** The unaided baseline already finds 6 of 8. With at most 2 defects of
headroom, no design at this sample size can resolve a real effect. A harder subject file is
needed before rerunning.

## The ground truth was wrong, and the models caught it

`parseCount` was listed as bait B2 — "error is handled and rethrown, this is correct". It is
not correct: `Number.parseInt` does not throw, so the `catch` is unreachable and invalid input
returns `NaN` silently. Several runs identified this precisely. **They were right and the key
was wrong.**

Scoring also under-counted at least once: a run flagged the exact line of the `0.87` magic
number but diagnosed it as floating-point currency error, so the keyword anchor missed it.
Position correct, diagnosis different — the scorer has no way to judge that.

> **A ground truth is itself a claim, and this one shipped with a defect.** Before the next
> round, the key must be reviewed by something other than its author — the same rule already
> written down for probes (§2.1, the judge is never the tool under test) applies to the answer
> sheet.

## What a conclusive version needs

1. A subject file hard enough that the unaided baseline lands near 50%, not 75%
2. n ≥ 10 per cell, and a stated significance test rather than eyeballed means
3. A ground truth reviewed independently of whoever wrote it
4. Scoring on position **and** diagnosis, not keyword anchors alone
