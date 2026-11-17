# Integration verification matrix

<!-- GENERATED from integrations/REGISTRY.json by scripts/generate-integration-matrix.mjs. Do not edit by hand:
     `npm run check:liveness` fails when this file no longer matches the registry. -->

**Spec**: XSPEC-357 R8 · **Procedure**: [INTEGRATION-VERIFICATION.md](INTEGRATION-VERIFICATION.md)

11 live tools; **0 of them passed all five cells.** The README's Verified column shows ✅ only for a tool whose five cells all passed; every other tool shows 🔬 plus the cells that did pass.

## The five cells

- **① Install**: `uds init` writes the UDS standards block into the file this tool reads.
- **② Agent reads it**: the tool opens the standards it is pointed to (the P7 probe).
- **③ Follows it in a task**: the tool applies the standards in a real task (the R4 probes).
- **④ Violation detected**: UDS itself catches a change that violates an installed standard, such as a malformed commit message (`uds check`, a commit-msg hook).
- **⑤ Still fine after update**: after `uds update` the tool's file is still correct.

A cell is ✅ with the date it was run, 🔬 not verified (with the reason below), ⌛ expired, or ❌ failed. Nothing is filled in on the strength of another cell: for example ③ never stands in for ②.

## Matrix

| Tool | ① Install | ② Agent reads it | ③ Follows it in a task | ④ Violation detected | ⑤ Still fine after update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude Code** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **OpenCode** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **Cursor** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **Cline** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **Windsurf** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **GitHub Copilot** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **OpenAI Codex** | ✅ 2026-11-17 | 🔬 not verified | ✅ 2026-07-23 | 🔬 not verified | ✅ 2026-11-17 |
| **Google Antigravity** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **Aider** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |
| **Continue.dev** | 🔬 not verified | 🔬 not verified | 🔬 not verified | 🔬 not verified | 🔬 not verified |
| **Roo Code** | ✅ 2026-11-17 | 🔬 not verified | 🔬 not verified | 🔬 not verified | ✅ 2026-11-17 |

## Notes and reasons that apply to several tools

- ① Install: AGENTS.md is shared with the other AGENTS.md tools; init cannot tell them apart and records both in the manifest.
- ② Agent reads it: Not run: no P7 run is on record for this tool. XSPEC-357 R8 AC-8.2 records this cell as not verified while P7 is unimplemented, and does not accept another cell as a substitute.
- ③ Follows it in a task: Not run. The tool is installed on the machine that verifies; XSPEC-357 R5 sets the order of the runs.
- ③ Follows it in a task: Not run: the tool is not installed on the machine that verifies.
- ④ Violation detected: Partly covered, and not entered as passed. Tested (see partialEvidence): `uds check --ci`, which the native pre-commit hook runs, exits 1 and names the file when an installed standard is edited or the UDS block is deleted from a tool's rules file; `uds simulate -s commit-message` fails a malformed message when someone runs it; with `uds init --with-hooks` the Claude Code hook refuses a malformed commit message. Not covered: for the other tools nothing checks a commit message at commit time by default, and `uds init` installs no git commit-msg hook, so the example XSPEC-357 R8 AC-8.4 gives, a malformed commit message, is not caught automatically. Whether the installed-standards integrity check alone should count as this cell is undecided.

## Evidence and reasons, per tool

### Claude Code (`claude-code`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. Not entered. A P7 run is on record (integrations/verification/claude-code/2026-08-22.md: 3 of 3 index-arm runs followed the scheme, judged blind by Codex). XSPEC-357 R8 AC-8.2 records this cell as not verified while P7 is unimplemented; whether this one-off run counts as P7 being implemented is undecided, so it has not been entered as this cell's result.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### OpenCode (`opencode`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js` (see the shared note above)
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### Cursor (`cursor`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### Cline (`cline`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### Windsurf (`windsurf`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### GitHub Copilot (`copilot`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### OpenAI Codex (`codex`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js` (see the shared note above)
- ② Agent reads it: 🔬 unverified. Not entered. A P7 run is on record (integrations/verification/codex/2026-08-22-P7.md: 1 of 3 index-arm runs followed the scheme, below the 2 of 3 bar, recorded there as a fail). XSPEC-357 R8 AC-8.2 records this cell as not verified while P7 is unimplemented; whether this one-off run counts as P7 being implemented is undecided, so the fail has not been entered as this cell's result.
- ③ Follows it in a task: ✅ 2026-07-23, evidence `integrations/verification/codex/2026-07-23.md` (codex-cli 0.145.0, UDS 6.1.1). 3 of 3 runs applied the certainty tags correctly. Verified with the skill at .agents/skills/ (the official path, which ai-agent-paths.js was corrected to in this same session). The uds init flow itself is not verified end-to-end for this target: init has no --ai-tool flag. On 2026-11-17 this result is 117 days old, past the 90-day shelf life of XSPEC-357 OQ2; scripts/check-integration-liveness.ts pins its own clock to 2026-07-23, so it does not report that.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### Google Antigravity (`antigravity`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`

### Aider (`aider`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`. Reached through the universal AGENTS.md that init writes for every project: init has no Aider-specific entry, so this shows the file REGISTRY.json names for Aider carries the block, not that init detects Aider.
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`. Same universal AGENTS.md route as (1).

### Continue.dev (`continue-dev`)

- ① Install: 🔬 unverified. `uds init` has no entry for this tool: it is not in the tool checklist and is not detected, so the install cannot be run for it. README names `.continue/config.json`, which init never writes, while REGISTRY.json names AGENTS.md; unresolved. Pinned by cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js (continue-dev).
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: 🔬 unverified. Depends on (1), which cannot be run for this tool: see (1).

### Roo Code (`roo-code`)

- ① Install: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
- ② Agent reads it: 🔬 unverified. See the shared reason above.
- ③ Follows it in a task: 🔬 unverified. See the shared reason above.
- ④ Violation detected: 🔬 unverified. See the shared reason above. Partial evidence: `cli/tests/e2e/xspec-357-r8-violation-detected.test.js`.
- ⑤ Still fine after update: ✅ 2026-11-17, evidence `cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js`
