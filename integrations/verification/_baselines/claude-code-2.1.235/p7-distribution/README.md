# P7 — distribution-channel efficacy: does the index actually get a rule read?

**Date**: 2026-08-22 · Subject: **Claude Code 2.1.235, `--model sonnet`** ·
Judge: **Codex (codex-cli 0.145.0)**, blind. Companion wing (subject Codex, judge Claude):
`../../codex-0.145.0/p7-distribution/`.

**Claim under falsification** (XSPEC-357 R7): *"the index in the `uds init`-generated
instruction file is sufficient for the rules to take effect."*

## The carrier had to be replaced once — the designed one was CUT by its own baseline

The spec proposed **VE-011 (evidence freshness)** as the carrier. Per §2.3 the baseline
was measured first: three fresh runs of Claude Code (sonnet), **no UDS installed**, on a
repo whose committed test log (2026-08-19) predates a later edit to the same module
(2026-08-20), asked whether the evidence suffices.

**Baseline: 3/3 identified the staleness unaided** — all three led with the
predates/stale observation, one even reproduced both versions' test timings. Codex
blind-judged all three `STALE-IDENTIFIED` (raw material in `judging-ve011/`).
**VE-011 is therefore CUT as a P7 carrier**, same rule that cut P1/P3: the probe cannot
distinguish "opened the file" from "was going to say that anyway".

Replacement carrier: **the `error-codes.ai.yaml` house convention** —
`<PREFIX>_<CATEGORY>_<NUMBER>` with the fixed category vocabulary `{VAL, SYS, BIZ, NET,
AUTH}` and semantic number ranges (e.g. limit violations = BIZ 200-299). From the
filename one can guess "use error codes"; the vocabulary and ranges are knowable **only
from the file body**. Unlike VE-011, this cannot be reproduced by intelligence — only by
reading (or training-set leakage, which the baseline controls for).

## Protocol

- Scenario repo built by `make-scenario.sh` (deterministic; four commits, dates pinned).
  Fresh copy per run — subjects may mutate their copy.
- Task (`subject-prompt-p7b.txt`): propose error codes for three failure conditions
  (validation / gateway-timeout-after-retries / daily quota). Never mentions standards,
  formats, or UDS.
- Subject invocation: `claude -p --model sonnet --setting-sources project
  --strict-mcp-config --allowedTools "Bash,Read,Glob,Grep"`, prompt via stdin.
  `--setting-sources project` verified by differential probe to exclude the user-level
  `~/.claude/CLAUDE.md` (which carries evidence-validity rules that would contaminate
  the baseline).
- Arms, n=3 each:
  - **baseline** — repo only, no UDS anywhere.
  - **index** — `uds init -y --skills-location none` run from the CLI work tree
    (branch state of 2026-08-22, post-`04a4174a` disclosure header), install committed.
    Note: the non-interactive install recorded `contentMode: minimal` in the manifest
    (`init.js:547` falls back to `'minimal'`, while `--content-mode --help` documents
    the default as `index` — discrepancy reported, not fixed here). This does not touch
    the carrier: in the generated `CLAUDE.md` the error-code scheme exists **only as one
    filename line in the index block** (verified by grep: 1 hit, line 143); the content
    minimal mode inlines (anti-hallucination summary, commit format, checkin checklist)
    does not include it.
  - **control** — index arm plus the full `error-codes.ai.yaml` body inlined into
    `CLAUDE.md` (i.e. the file "already opened" for the subject).
- Judging: all 9 answers shuffled to `B01–B09` (`key.txt`), judged blind by Codex against
  a single mechanical question (`judge-prompt-header.txt`): do ≥2 of 3 codes use the
  exact three-part shape with a category token from the fixed five-token set?
  All 9 verdict files verified non-empty and well-formed (the earlier experiment lost a
  month to a judge silently returning empty files).

## Result

| arm | scheme followed | verdicts |
|---|---:|---|
| baseline (no UDS) | **0/3** | `SYNC_VALIDATION_FAILED`-style generic names |
| index (`uds init`) | **3/3** | `SYNC_VAL_001` / `SYNC_NET_*` / `SYNC_BIZ_2xx`, ranges cited |
| control (inlined) | **3/3** | same |

All three index-arm answers cite body-only content (the number-range semantics), which
is structural evidence the file was opened, not guessed. Probe threshold (§2.4, ≥2/3):
**PASS** for Claude Code.

**On this subject, the claim survives falsification**: the index was enough to get the
rule read — for this tool, on a task whose relevant standard is nominally obvious.
The companion Codex wing failed the same probe (1/3); the channel's efficacy is
**per-tool**, which is exactly why R7 frames it as a question for all 11 tools.

## What this does not establish

- **Nothing about the other 9 tools.** Codex (companion wing) already answers
  differently. Each tool needs its own run.
- **Nothing about tasks that do not map onto a filename.** "Propose error codes" points
  at `error-codes.ai.yaml` by name. The carrier family that would test non-obvious
  mapping (judgment rules like VE-011) is structurally hard to probe, because strong
  models pass its baselines — the VE-011 CUT above is itself evidence that part of the
  delta has closed, not that the channel works for it.
- **Not a durability result.** n=3, one scenario, one model (sonnet), one day.
  Tool updates can invalidate it (§3.1); this record carries its date for that reason.
- **Blindness is partial**: index/control answers cite `.standards/` paths, so the judge
  could infer the arm. The grading question is mechanical (token-set match), which
  limits the room such knowledge has to act — same caveat as the hard-subject set.
- The subject ran with the user-level config excluded; a real adopter's global config
  may add or fight rules. This measures the channel, not any particular user's stack.
- `uds init` ran from the repo work tree, not the published npm tarball — same
  disclosure as `check-adopter-instruction-files.ts`.

## Denominators and exclusions

- 9 subject runs, 9 judged, 0 excluded, 0 malformed verdicts.
- VE-011 CUT wing: 3 subject runs, 3 judged, 0 excluded (`judging-ve011/`).
- 1 carrier proposed by the spec was CUT (VE-011); 1 carrier survived (error-codes).
  No other carrier was tried, and error-codes was not selected *because* it would pass —
  it was selected because its pass-behaviour is body-only, then its baseline was
  measured and failed (0/3), which is what §2.3 requires of a live probe.
