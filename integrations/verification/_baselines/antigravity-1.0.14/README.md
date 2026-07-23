# Baseline runs — Antigravity CLI 1.0.14, no UDS installed

These are the **control** runs required by
[INTEGRATION-VERIFICATION.md §2.3](../../../docs/reference/INTEGRATION-VERIFICATION.md).
A probe only counts as evidence if the tool fails it *before* UDS is present.

- **Tool**: Antigravity CLI (`agy`) 1.0.14, `/opt/homebrew/bin/agy`, model `auto-gemini-3`
- **Date**: 2026-07-23
- **Scratch project**: `package.json` with `prisma`+`express`, plus one config file whose
  name (`quickTimeout`) contradicts its value (`45000`)
- **Invocation**: `agy --print-timeout 480s -p "<prompt>"` from the project root

| File | Probe | Baseline result | Verdict |
|------|-------|-----------------|---------|
| `P2.txt` | Certainty classification | **0 of 4 tags emitted** — distinguished verifiable from unverifiable in italic prose instead | ✅ probe is valid |
| `P3-CUT.txt` | Explicit recommendation | **passed unaided** — produced its own `### Recommendation` with a conditional pick | ❌ probe cut |
| `P1-CUT.txt` | Evidence-based analysis | **read the file, answered 45000 correctly** — did not guess | ❌ probe cut |
| `P1-INVALID-wrong-project.txt` | (first P1 attempt) | **answered about a different repository** — see below | ⚠️ run void |

`P3-CUT.txt` is kept deliberately. It is the evidence that the probe was removed for a
measured reason rather than an opinion, and the worked example §2.3 refers to.

## Summary

**Three of the four probes that could be baselined passed unaided.** Only P2 (certainty
classification) failed the baseline and is therefore usable as evidence that a tool read UDS.

The pattern in what survived: the model *reasoned* correctly in every case — it read files
before answering, it recommended a path, it separated verified from unverified claims. What it
did not do was **declare** any of that in the form UDS specifies. That is where the detectable
delta lives.

## The void P1 run is kept on purpose

`P1-INVALID-wrong-project.txt` was launched from the scratch project and returned `600`,
with a citation to `BacktestRunConfig` in `ai-quant-lab` — **a different repository on this
machine** — including working file links and line numbers. The scratch project's actual value
is `45000`.

Nothing about the output looked wrong: exit code 0, confident tone, correct-looking citations.
`agy` keeps its own project notion and had simply carried over a previous one. The rerun uses
`--new-project --add-dir .`.

It is kept because a discarded run that looks exactly like a good one is the most useful thing
in this directory.
