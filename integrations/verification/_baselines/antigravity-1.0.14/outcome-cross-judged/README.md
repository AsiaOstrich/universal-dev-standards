# Antigravity outcome measurement — the opposite result from Codex

**Date**: 2026-07-24 · Reviews by **agy 1.0.14 / Gemini 3.6 Flash (High)**
Judges: **Gemini 3.1 Pro (High)** and **Claude Sonnet 4.6 (Thinking)** — neither is the
reviewing model. Same subject file, same 8 defects, same blind protocol as the Codex set.

---

## Result

| judge | no UDS | UDS | delta |
|---|---:|---:|---:|
| Gemini 3.1 Pro | 6.40 (n=5) | 5.80 (n=5) | **−0.60** |
| Claude Sonnet 4.6 | 6.20 (n=5) | 5.80 (n=5) | **−0.40** |

Both judges: negative. Ranges overlap, so this is **not** evidence of harm — but it is
squarely not the Codex result, which was +1.15 / +0.93 under the same two judges.

## Side by side — this is why one table per tool was the right call

| | Codex / gpt-5.6-terra | Antigravity / Gemini 3.6 Flash |
|---|---:|---:|
| unaided baseline | 3.60 – 4.40 | **6.20 – 6.40** |
| with UDS | 4.75 – 5.33 | 5.80 |
| delta | **+1.15 / +0.93** | **−0.60 / −0.40** |

**The unaided baselines differ by ~2.5 defects out of 8.** Gemini 3.6 Flash finds most of this
file's problems without help; gpt-5.6-terra does not. Averaging these two tools together would
have produced a number describing neither.

## The defect that carried the whole Codex result does nothing here

| defect 8 — no tests for the payment path | no UDS | UDS |
|---|---:|---:|
| Codex (both judges) | 0/5 | **4/4, 3/3** |
| **Antigravity (both judges)** | **0/5** | **0/5** |

On Codex, this single row was the entire measured benefit of UDS. On Antigravity, UDS is
installed, the skill is loaded (verified separately — `agy` reads project-level
`.agents/skills/`), and the model still never mentions missing tests.

**The same skill, the same checklist, and the prompt it produces in one model it does not
produce in another.**

## Two rows move the wrong way

| defect | no UDS | UDS |
|---|---:|---:|
| 5 module-load DB connection | 5/5 | 3/5 (Gemini) · 4/5 (Claude) |
| 6 magic numbers | 2/5 | 1/5 (both) |

Both judges see the same direction. With n=5 and overlapping ranges this is not a
demonstration of harm, but it is the first time any condition has moved *down*, and it is the
shape the "could it backfire" question was asking about. Worth a larger n before dismissing.

## Ceiling

The unaided baseline is 6.2–6.4 of 8. **At most 1.6 defects of headroom exist**, so no design
at this sample size can resolve a positive effect even if one is there. A harder subject file
is required before the Antigravity arm can say anything about benefit.

## Method note: fixing defect 5 worked

Judge agreement on defect 5 was **1/8** in the Codex round, when it was phrased as an
architectural judgement ("no layering"). Restated as an observable fact — the connection is
created at module load, outside any function — agreement is now **9/10**, and overall judge
agreement rose from 88% to **96%**.

That is a measurable improvement to the instrument, independent of what it measured.
