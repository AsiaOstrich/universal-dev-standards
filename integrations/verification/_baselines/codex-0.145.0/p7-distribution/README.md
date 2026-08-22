# P7 — distribution-channel efficacy, Codex wing: the index still mostly fails here

**Date**: 2026-08-22 · Subject: **Codex (codex-cli 0.145.0, model gpt-5.6-terra)** ·
Judge: **Claude (fresh sonnet subagent)**, blind — Codex could not judge this wing
because it is the defendant (§2.1). Protocol, scenario generator, prompts and the CUT
record for the originally proposed carrier live in the companion wing:
`../../claude-code-2.1.235/p7-distribution/`.

## Protocol delta from the companion wing

- Subject invocation: `cat subject-prompt-p7b.txt | codex exec --skip-git-repo-check
  --ephemeral -s read-only -o <answer>.txt`, cwd inside the scenario repo.
- **index arm** repos are copies of the same `uds init -y --skills-location none`
  install used by the Claude wing; Codex consumes the generated **`AGENTS.md`**
  (5,889 bytes, index-only, with the post-`04a4174a` disclosure header:
  *"This file is an index, not the standards … open the relevant file"*).
- Arms: baseline (no UDS) ×3, index ×3. No control arm was run for Codex —
  the Claude wing's control already establishes that the rule works when inlined,
  and the question here is the channel, not the rule.
- Judging: answers shuffled to `C01–C06` (`key.txt`), judged by a fresh Claude agent
  given only the mechanical rubric (`judge-prompt-header.txt`) and the six files.
  All 6 verdicts non-empty and well-formed.

## Result

| arm | scheme followed |
|---|---:|
| baseline (no UDS) | **0/3** |
| index (`uds init` AGENTS.md) | **1/3** |

Probe threshold (§2.4, ≥2/3): **FAIL**.

**The session logs say precisely how it fails, and it is a new shape** (raw logs in
`session-logs/`):

- run 3 (the pass): ran `rg --files -g 'AGENTS.md' -g '.standards/*.yaml' …`, found and
  opened `error-codes.ai.yaml`, produced `SYNC_VAL_001 / SYNC_NET_504 / SYNC_BIZ_200`.
- runs 1–2 (the failures): **did open a standards file — the wrong one.** Both read
  `.standards/anti-hallucination.ai.yaml` — the **first file listed in the index** —
  and never touched `error-codes.ai.yaml`, the one their task needed. Their answers are
  indistinguishable from baseline.

2026-07-23 measured "reads the index, opens nothing" (P2: 0 tags). Post-disclosure the
behaviour is now "opens *something* from the index" — the disclosure header appears to
push toward opening files, but **selection is positional, not by task relevance**.
The channel's remaining defect is not "won't open"; it is "won't pick".

## What this does not establish

- n=3 per arm, one scenario, one task, one day, one Codex version/model. The 1/3 could
  be a 33% coin, not a stable rate; more runs would be needed to say which.
- It does not measure whether the disclosure header *caused* the open-something
  behaviour — no arm was run against the pre-disclosure AGENTS.md. "Appears to push"
  above is an inference from comparing to the 2026-07-23 record, which used a
  different probe (P2) and an older Codex.
- Blindness is partial for the passing answer (it names no `.standards` path, but its
  code shape reveals the arm to anyone who knows the scheme). The rubric is mechanical.
- The judge is a Claude subagent spawned by the same orchestrator that ran the
  experiment; it received only the rubric and the shuffled files, but it is not a
  third organisation's tool the way the cross-judged sets are.

## Denominators and exclusions

6 subject runs, 6 judged, 0 excluded, 0 malformed verdicts.
