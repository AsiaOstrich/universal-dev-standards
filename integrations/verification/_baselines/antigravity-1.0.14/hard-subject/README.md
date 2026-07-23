# Harder subject — the flat line, and the two defects nothing touches

**Date**: 2026-07-24 · Reviews by **agy 1.0.14 / Gemini 3.6 Flash (High)**
Judge: **Gemini 3.1 Pro (High)** only — see caveat.

## Why a new subject

The previous file had an unaided baseline of 6.2–6.4 of 8, leaving no headroom for a positive
effect to show. `refund.js` was built to be harder: every defect is a **cross-function
inconsistency or a silent failure**, the kind a strong model can miss, and each is phrased as
an *observable fact* rather than an architectural judgement (which is what made defect 5
unmeasurable last round).

Eight defects: a lowercase/uppercase status mismatch across two functions that makes every
order permanently non-refundable; two functions using different tax rates; `===` on an HMAC;
`.includes()` in a loop; a catch that logs and then returns `{ ok: true }`; a test file that
passes while asserting only types; boolean-parameter call sites; and a declared-but-unused
`force` parameter.

## Result — one judge, but a very clean one

| | defects found /8 | runs |
|---|---:|---|
| no UDS | **6.00** | 6, 6, 6, 6, 6 |
| UDS | **6.00** | 6, 6, 6, 6, 6 |

Delta **0.00**, and — unusually — **identical per defect**, not merely equal on average:

| defect | no UDS | UDS |
|---|---:|---:|
| 1 cross-function case mismatch | 5/5 | 5/5 |
| 2 inconsistent tax rate | 5/5 | 5/5 |
| 3 HMAC timing attack | 5/5 | 5/5 |
| 4 O(n²) dedupe | 5/5 | 5/5 |
| 5 catch logs then returns ok | 5/5 | 5/5 |
| **6 test asserts only types** | **0/5** | **0/5** |
| **7 boolean-parameter call sites** | **0/5** | **0/5** |
| 8 unused `force` parameter | 5/5 | 5/5 |

Ten reviews, every one scoring exactly 6/8, hitting exactly the same six defects and missing
exactly the same two — with or without UDS.

## What the two blind spots are

**Defect 6 is test *quality*.** The model finds real bugs but never observes that the existing
tests, which pass, could not catch any of them. This is the third subject in a row where a
test-related defect is the one models do not see unaided (Codex: "no tests"; here: "tests that
test nothing").

**Defect 7 is readability at the call site.** Both misses are things visible only by relating
two places in the code, not by reading one span.

**UDS did not close either gap.** The code-review skill's category list names Tests and
Readability explicitly. Naming a category in the checklist did not produce coverage of it —
consistent with every earlier round.

## Caveats — this one is weaker than the Codex cross-judged set

**Single judge.** The second judge failed to produce output: `agy` returns an empty file for
Claude Sonnet 4.6 (Thinking) and for GPT-OSS 120B when the prompt is long, on 9 of 10 and 10 of
10 attempts respectively. Same failure earlier stopped Opus 4.6 from being measured. This is an
Antigravity/model stability issue, not a data problem, but it means the +0.00 here rests on one
judge and cannot be cross-validated on this machine right now. Codex would be the external
judge; Codex is quota-blocked until 2026-08-22.

**Baseline still 6/8, not the 4/8 targeted.** Gemini 3.6 Flash is simply good at this kind of
file. Reaching real headroom would need defects subtle enough that the ground truth itself
becomes arguable — at which point the judge disagreement, not the skill effect, dominates.

n=5 per arm.
