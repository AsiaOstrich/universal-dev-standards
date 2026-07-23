# Blind-judged measurement — the first result from a method that holds up

**Date**: 2026-07-24 · Reviews by **Codex CLI 0.145.0 / gpt-5.6-terra** · Judged by
**Antigravity / Gemini 3.1 Pro (High)** · **Spec**: XSPEC-357 R6

Three earlier scorings of this same data gave +2.8, +1.0, and "no visible difference". All
three were keyword matching over whole transcripts, and all three were wrong for the same
reason: a transcript carries tool invocations, files the model read, and its own search
patterns — a keyword can arrive from four places and three of them are not the model's
judgement.

## The two fixes

**1. A real boundary.** `codex exec` emits `tokens used` exactly once, and everything after it
is the final answer alone. Verified: zero occurrences of `exec`, `/bin/zsh`, `SKILL.md` or
`succeeded in` after that line. Every earlier scorer read the whole file.

**2. An independent judge, given only the answer.** Antigravity/Gemini judges Codex's output —
the judge is never the tool under test. It receives the eight planted defects and one review
text, and returns eight YES/NO lines. It never sees the code, the condition, or the other runs.

Blinding is real but imperfect: file paths were stripped, runs shuffled under a fixed seed, and
severity markers removed (formatting only — no wording changed), because `BLOCKING`/`IMPORTANT`
would otherwise announce the condition outright.

## Result

| | defects found /8 | runs |
|---|---:|---|
| no UDS | **3.67** | 3, 4, 4 |
| UDS | **4.67** | 4, 5, 5 |

Difference +1.00, but the ranges overlap (3–4 vs 4–5), so **the aggregate is not trustworthy at
n=3**. The per-defect breakdown is where the signal is:

| defect | no UDS | UDS |
|---|---:|---:|
| 1 hard-coded production password | 3/3 | 3/3 |
| 2 N+1 queries in the loop | 1/3 | 1/3 |
| 3 payment fetch not awaited | 3/3 | 3/3 |
| 4 no transaction, stock unchecked | 3/3 | 3/3 |
| 5 no layering, module-level connection | **0/3** | **0/3** |
| 6 magic numbers 0.92 / 500 | **0/3** | **0/3** |
| 7 meaningless names in `fmt` | 1/3 | 1/3 |
| **8 no tests for the payment path** | **0/3** | **3/3** |

**Every row identical except one.** The entire +1.00 comes from defect 8.

## What this says

**UDS's measured contribution here is one thing: it makes the model notice that tests are
missing.** Verified by hand — the no-UDS finals do not contain the word "test" at all, while
the UDS runs say "no test script or visible test coverage for checkout's validation, stock
contention, rollback…".

That is a coherent result rather than a fluke. Absent tests are not visible *in* the file being
reviewed; noticing them requires stepping out to the project. A checklist is exactly the kind of
prompt that causes that step.

**And two defects were missed by both.** Layering (5) and magic numbers (6) went unreported in
all six runs, although the skill's category list names both Design and Quality. **Having the
category in the checklist did not produce coverage of it.** The list is not self-executing.

## Standing caveats

n=3. One judge, unreplicated — its own reliability is unmeasured. One subject file, one model,
one tool. Defect 8 is 0/3 vs 3/3, which is cleaner than the aggregate, but three runs is three
runs.
