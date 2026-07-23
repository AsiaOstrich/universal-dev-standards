# Codex CLI 0.145.0 — experiment state

**Status**: ⏸ **paused, not abandoned** · **Resumes**: 2026-08-22 (account usage limit)
**Model**: `gpt-5.6-terra` · **All data below is retained and valid**

---

## Why paused

Partway through scaling the outcome measurement to n=10 per arm, the account hit its Codex
usage limit:

```
ERROR: You've hit your usage limit. Upgrade to Plus to continue using Codex,
or try again at Aug 22nd, 2026 5:03 PM.
```

11 of 20 runs returned an error page instead of a review. **Those 11 are excluded, not
scored** — they are detectable by the absence of a `tokens used` line, and an error page would
otherwise score as "zero findings", which looks exactly like a real negative result.

## What is banked here

| Experiment | n | Status | Location |
|---|---|---|---|
| Listing-capacity probe (60 canary skills, 13,740 chars) | 1 | ✅ conclusive | `truncation-60skills.txt` |
| P6 baseline vs with-UDS (form) | 1+1 | ✅ conclusive | `P6-code-review-*.txt` |
| P1 / P3 baselines (cut probes) | 2 | ✅ conclusive | `P1-CUT.txt`, `P3-CUT.txt` |
| Long-context factorial (outcome) | 12 | ⚠️ inconclusive by design | `longcontext-factorial/` |
| Category-coverage attempt | 6 | ❌ scoring invalid | `category-coverage-attempt/` |
| Blind-judged outcome | 6 | ✅ valid | `blind-judged/` |
| **Cross-judged outcome, 2 judges** | **9** | ✅ **valid, extend when quota returns** | `cross-judged/` |

## What resuming means

The measurement method is validated as of 2026-07-24 — transcript boundary, independent blind
judge, cross-judge agreement at 88% on 7 of 8 defects. **So the 9 runs already banked in
`cross-judged/` do not need re-running.** Resuming means adding runs to that set, not starting
over.

Two changes before the next batch:

1. **Defect 5 must be restated or dropped.** "The HTTP handler directly holds the DB connection
   and calls payment, with no layering" — judges agreed on it 1 time out of 8. Gemini scored it
   0/9, Claude 7/8. It is a judgement about architecture, and the reviews discuss the
   module-level connection without framing it as layering. As written it measures the judge,
   not the review.
2. **Target n.** 5/4 today. n=10 per arm needs 11 more runs.

## What this data already supports

Excluding defect 5 as unmeasurable, **the entire measured difference between UDS and no-UDS is
one row**: the model notices that the payment path has no tests (0/5 → 4/4 under Gemini,
0/5 → 3/3 under Claude, zero judge disagreement). Every other defect is found at the same rate
either way.

That is a finding about **this subject file, this model, this tool**. It does not transfer to
other tools — see the warning at the top of `../../DELTA-TREND.md`.
