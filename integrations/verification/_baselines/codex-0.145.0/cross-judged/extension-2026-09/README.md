# Extending cross-judged to n=10 per arm (2026-09)

**Why**: `../README.md` stopped at 5 no-UDS / 4 UDS when the Codex quota ran out on 2026-07-24.
The 9 banked runs stay valid; this directory adds runs to the same set. Target: A (no UDS) r6–r10,
B (UDS) r5–r10 — 11 runs.

## Decisions taken before this batch (2026-09-17)

- **Defect 5 is dropped from scoring**, not restated. Restating it would change the instrument, and
  the 9 banked verdicts would have to be re-judged to stay comparable. Dropping keeps them valid;
  the analysis reports 7 defects.
- **Split across two days** so the account's free Codex allowance is not exhausted mid-batch again.

## Protocol — reconstructed from the July transcripts, not from memory

| | July 2026-07-23/24 | This batch | Evidence |
|---|---|---|---|
| Tool / model | codex-cli 0.145.0 / gpt-5.6-terra, reasoning effort none | same (pinned with `-m`; each run's header checked) | transcript headers |
| Subject | `src/checkout.js` + `package.json`, no git repo | same (`../../blind-judged/subject.js`; package.json recovered from a transcript's `cat`) | `category-coverage-attempt/A_r1.txt` |
| UDS arm | `.agents/skills/code-review-assistant/` | files taken from UDS commit `1213cd59` — the last change to that skill before 2026-07-24; the skill has changed three times since, so HEAD would be a different treatment | `SKILL.md` first 20 lines match transcript `B_r2` |
| Prompt | `Review src/checkout.js and list every issue you find.` | same text, **piped via stdin**; July passed it as an argument. The user message Codex records is identical | transcript `user` block |
| Sandbox | read-only | `-s read-only --skip-git-repo-check --ephemeral` | transcript header |

The top-level README's `-p "<prompt>"` is wrong for 0.145.0: `-p` is `--profile`.

Arm check: every B run read `SKILL.md`; no A run touched `.agents/` — the same pattern as July.

## Progress

| Day | Runs | Result |
|---|---|---|
| 2026-09-17 | A_r6 A_r7 A_r8 · B_r5 B_r6 B_r7 | 6/6 usable (`tokens used` present, model matched), no quota error |
| 2026-09-18 | A_r9 A_r10 · B_r8 B_r9 B_r10 | 5/5 usable, no quota error — **all 11 done** |

After the last run: extract the text after `tokens used`, strip paths and severity prefixes as in
`../../blind-judged/README.md`, shuffle the 11 new answers under a fixed seed into R10–R20, and judge
with the same two Antigravity models (Gemini 3.1 Pro (High), Claude Sonnet 4.6 (Thinking)) using
`../prompt.txt`.

`run.sh` is the runner used: `run.sh <dir-with-tmpl-A-and-tmpl-B> A_r9 B_r8 …`; it stops on the
first run without `tokens used` or with a different model.

## Result — n=10 per arm (Claude UDS 9: July's R05 verdict was empty)

Full tables in `analysis.md` (produced by `analyze.py ../ .`). Defect 5 excluded; 7 defects scored.

| judge | no UDS | UDS | delta |
|---|---:|---:|---:|
| Gemini 3.1 Pro (High) | 3.60 (n=10, 3–4) | 4.90 (n=10, 4–5) | **+1.30** |
| Claude Sonnet 4.6 (Thinking) | 3.30 (n=10, 3–4) | 4.78 (n=9, 4–5) | **+1.48** |

**Defect 8 (no tests for the payment path) still carries most of it**: 0/10 → 9/10 (Gemini),
0/10 → 8/9 (Claude). Unchanged from July, now at twice the sample.

**New at n=10: defect 2 (N+1 queries)** — 5/10 → 8/10 (Gemini), 4/10 → 8/9 (Claude). July read it as
"same rate either way" at n=3–5. Both judges now agree on a gap, but this is the first batch to show it;
treat it as a second candidate, not a finding, until it survives another round.

Defect 6 (magic numbers) is 0 in all 39 judged reviews, with or without UDS. The checklist names it;
it is never raised.

The ranges touch at 4 under both judges, so "UDS finds more" is now a consistent direction at n=10,
not a separation. The per-defect rows are where the evidence is.

## Method checks and what they showed

- **Scoring script reproduces July exactly**: with all 8 defects and July data only, `analyze.py`
  gives Gemini 3.60 / 4.75 and Claude 4.40 / 5.33 — the numbers in `../README.md`.
- **Judge drift check**: July answer R01 re-judged by Gemini today matched July's verdict on 7 of 7
  scored defects; the only change was defect 5 (NO → YES).
- ⚠️ **Defect 5 agreement moved from 1/8 in July to 11/11 now.** The judges' reading of it changed,
  which supports excluding it — and is a reminder that "same model name" on Antigravity is not a
  pinned version. The 7 scored defects agree 74/77 (July 55/56).
- **Two operational failures, both recovered and neither scored**: the first two judge calls hung
  with no output until killed (cause not established; every call run with `--log-file` and stdin from
  `/dev/null` completed — correlation, not proven cause); one Claude call returned empty twice on
  `503 No capacity available for model claude-sonnet-4-6` and succeeded on a manual retry.
- Blinding: 11 new answers shuffled with seed 20260918 into R10–R20 (`key.txt`); paths replaced with
  `<path>`, severity prefixes removed (`extract.py`) — formatting only, wording untouched.
