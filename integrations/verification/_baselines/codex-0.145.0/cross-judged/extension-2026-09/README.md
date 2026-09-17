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
| next | A_r9 A_r10 · B_r8 B_r9 B_r10 | — |

After the last run: extract the text after `tokens used`, strip paths and severity prefixes as in
`../../blind-judged/README.md`, shuffle the 11 new answers under a fixed seed into R10–R20, and judge
with the same two Antigravity models (Gemini 3.1 Pro (High), Claude Sonnet 4.6 (Thinking)) using
`../prompt.txt`.

`run.sh` is the runner used: `run.sh <dir-with-tmpl-A-and-tmpl-B> A_r9 B_r8 …`; it stops on the
first run without `tokens used` or with a different model.
