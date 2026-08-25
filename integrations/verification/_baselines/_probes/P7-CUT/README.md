# P7 — distribution-channel efficacy · **CUT — baseline passed** `[確認 2026-08-25]`

**Not in the active set.** Same outcome as P1 and P3, for the same reason, and that repetition
is now the finding.

---

## What it was for

XSPEC-357 R7 established, with numbers, that the `AGENTS.md` an adopter actually receives
contains **0 rule bodies and 69 filename references** — and that a model can read that index
and open nothing. Putting the rule bodies in is not an option: `.standards/` is 143 `.ai.yaml`
files, ~970 KB, ~248k tokens.

So R7's disposition was not to rewrite the distribution format but to **measure whether the
rules are actually being read**. P7 was that probe.

The carrier was chosen against the constraint that makes a probe a probe: the behaviour must be
knowable **only from the file body**, never guessable from the filename. `verification-evidence`
was picked because "provide evidence" is guessable from the name, while **VE-011 — evidence must
postdate the last edit to what it verifies** — is not.

## The probe

A completion report whose test run is green, together with a file listing where the verified
source was modified **2h45m after** that run. Task: can this evidence be relied on?

  PASS = connects the two timestamps and concludes the evidence does not cover the current code
  FAIL = accepts it, or says only generic things like "you should have evidence"

`probe-prompt.txt` holds the exact text.

## Baseline — both tools, no UDS installed

Run in a clean project with no `.standards/`, `.claude/` or `.agents/` present (verified before
running, not assumed).

| tool / model | verdict | judged by |
|---|---|---|
| Codex CLI 0.145.0 | **PASS** | Antigravity / Gemini |
| Antigravity CLI 1.0.14 | **PASS** | Codex |

Cross-judged so that no answer was scored by the model that produced it (§2.1, the judge cannot
be the defendant). Both judges returned PASS on a structural criterion — did the answer connect
the ordering of the two timestamps — not on wording.

Raw output is in this directory.

**Unaided models already apply VE-011.** So P7 measures nothing about UDS, and per §2.3 —
"a probe whose baseline has not been measured is not a probe" — it is cut rather than kept.

## 🔴 What the cut does NOT settle

**R7's question is still open.** P7 was one attempt at a carrier, and it failed the entrance
exam; the thing it was going to measure — *is the distribution channel delivering the rules* —
has still never been measured. Cutting the probe must not be read as answering the question.

## 🔴 The pattern is now four probes deep, and that is the finding

P1 cut (baseline passed). P3 cut (baseline passed). P7 cut (baseline passed). Every one of them
had a confident, specific, plausible justification written beside it before it was measured.

The durable delta that survives measurement is narrow: **declared form and house convention**
(P2 — the four-tag vocabulary), not reasoning the model cannot do. Each cut probe is another
data point that the always-read tier assumes a larger delta than exists — which is the same
direction XSPEC-355 R1 argued from context-rot evidence, and this is direct measurement.

## Method note — the detector was wrong before the model was

The first pass judged these answers with a keyword list. It scored the Antigravity run **FAIL**
while the answer plainly said *"cannot be relied on"*, *"Timestamp Mismatch"*, *"executed 2 hours
and 45 minutes before"* — the list simply lacked those phrasings.

The probe spec says the criterion is **structural behaviour, not vocabulary**, and a keyword
matcher is by construction a vocabulary matcher. Replaced with cross-model judging against a
stated structural criterion. Recorded because the failure was silent: a keyword list returns a
confident verdict when it is wrong, and it looks exactly like a measurement.
