# Cross-judged measurement — two judges, and one of them exposed a bad defect

**Date**: 2026-07-24 · Reviews by **Codex CLI 0.145.0 / gpt-5.6-terra**
Judges: **Gemini 3.1 Pro (High)** and **Claude Sonnet 4.6 (Thinking)**, both via Antigravity

## Sample: 9, not 20

The target was n=10 per arm. Codex hit its account usage limit partway through
("try again at Aug 22nd, 2026"), so 11 of 20 runs returned an error instead of a review.
Usable: **5 no-UDS, 4 UDS**.

Those failures are detectable — no `tokens used` line — and were dropped rather than scored.
A truncated error page scores as zero findings, which would have looked like a real result.

## Judge agreement: 88% overall, and one defect that ruins it

| defect | judges agreed |
|---|---:|
| 1 hard-coded password | 8/8 |
| 2 N+1 queries | 8/8 |
| 3 payment not awaited | 7/8 |
| 4 no transaction | 8/8 |
| **5 no layering / module singleton** | **1/8** |
| 6 magic numbers | 8/8 |
| 7 meaningless names | 8/8 |
| 8 no tests | 8/8 |

**Defect 5 is not measurable as written.** Gemini scored it 0/9; Claude scored it 7/8. Two
competent judges reading identical text reached opposite conclusions on nearly every run — the
defect statement ("the HTTP handler directly holds the DB connection… no layering") is a
judgement about architecture, and the reviews discuss the module-level connection without
framing it as a layering problem. Whether that counts is a matter of interpretation.

> **Cross-validation earned its cost here.** With one judge, defect 5 would have been reported
> as a clean finding — 0/9 by Gemini, or 7/8 by Claude — and either would have been an artefact
> of which judge was asked.

The remaining seven defects agree at 55/56.

## Result, both judges

| | no UDS | UDS | delta |
|---|---:|---:|---:|
| Gemini 3.1 Pro | 3.60 (n=5) | 4.75 (n=4) | +1.15 |
| Claude Sonnet 4.6 | 4.40 (n=5) | 5.33 (n=3) | +0.93 |

Ranges overlap under both judges, so **the aggregate remains untrustworthy**. Both judges
agree on direction and rough size, which is worth something, but not significance.

## The one thing both judges see identically

| defect 8 — no tests for the payment path | no UDS | UDS |
|---|---:|---:|
| Gemini | **0/5** | **4/4** |
| Claude | **0/5** | **3/3** |

Total separation, both judges, zero disagreement. **Excluding defect 5 as unmeasurable, the
entire difference between conditions is this one row.** Every other defect is found at the same
rate with or without UDS.

Consistent with the n=3 run, now with an independent second judge.

## Still open

n=9 and blocked until the Codex quota resets. One subject file, one reviewing model. Defect 5
needs restating or removing before the next round. Judges were not themselves validated against
a human-labelled set — 88% agreement means they agree, not that they are right.
