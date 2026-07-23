# Category-coverage attempt — inconclusive, and why

**Date**: 2026-07-23 · **Codex CLI 0.145.0 / gpt-5.6-terra** · **Status: method not yet validated**

## What was attempted

The earlier factorial measured "defects found" and showed nothing. Diagnosis: the subject file
had 3 of 8 defects in Security and none in Design / Tests / Performance — it tested what models
already do, not what the skill claims to add ("systematic coverage of 8 review categories").

New subject: `subject-checkout.js`, one defect per category. Metric changed from defect count
to **category coverage**. 2 conditions (UDS / no UDS) x 3 reps.

## Three scorings, three different answers

| scorer | no UDS | UDS | delta |
|---|---:|---:|---:|
| v1, narrow keyword anchors | 1.7 | 4.5 | **+2.8** |
| v2, widened anchors | 4.7 | 5.7 | **+1.0** |
| manual reading of 2 transcripts | — | — | **no visible difference** |

**v1 was wrong.** It scored A_r1 at 1/8. Reading it, that run raised 14 findings covering N+1
queries ("one query pair per cart item"), module-level connection, missing transaction,
absent error handling, and unclear `fmt` parameters — five categories at least. The anchors
missed them because the run said "one query pair per cart item" where the anchor looked for
"N+1", and "module import" where it looked for "module-level".

**v2 is also unreliable.** Its one clean separation — Tests, 3/3 for UDS vs 0/3 without —
turned out to be the skill file's own category list appearing in the transcript:

    **Tests** - Is there adequate test coverage? | 測試覆蓋是否足夠？

That is SKILL.md being read, not a finding. Meanwhile the no-UDS runs mention "test" 37–63
times, all of it inside their own file-search commands.

## The actual defect in the method

**Every scorer so far greps the whole transcript**, which contains tool invocations, file
contents the model read, and its own search patterns — not only its conclusions. Any keyword
can arrive from four places, and three of them are not the model's judgement.

`codex exec` interleaves reasoning, shell calls, command output and the final answer without a
machine-readable boundary, so isolating "what the model concluded" is not reliably automatable
with the current transcript format.

## What is actually known

From manually reading two transcripts: A_r1 (no UDS) produced 14 findings, B_r2 (UDS) produced
10 with severity prefixes. **The no-UDS run was not visibly worse and was arguably more
thorough.** Two samples, one reader, no blinding — an impression, not a result.

## What a working method needs

1. A transcript boundary that separates conclusions from tool traffic, or a harness that
   captures only the final message
2. Judgement by something other than keyword matching — an independent model given the
   ground truth and the final answer alone
3. Blinding: the judge must not know which condition produced which answer
4. n large enough that a 1-category difference clears the spread

Until at least 1 and 2 exist, **category coverage cannot be measured reliably**, and no claim
about UDS improving review outcomes should rest on it.
