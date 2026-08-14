# Verification Evidence Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/verification-evidence.md)

**Version**: 1.3.0
**Last Updated**: 2026-08-14
**Applicability**: All AI-assisted development workflows
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## Purpose

Establish an "Iron Law" that no task can be claimed as complete without verification evidence, and ensure that the evidence itself holds up. This standard guards two distinct failures:

1. **Claiming success without evidence** — the agent asserts what it never checked (the Iron Law).
2. **Evidence that does not support its claim** — the agent *did* check, and the checking tool silently did not work (Evidence Validity, added in v1.2.0).

The first is a form of hallucination. **The second is not** — nothing was invented; a real command produced a real output that meant something other than what it appeared to mean. Both end in the same place: a completion claim that isn't true.

建立「鐵律」：無驗證證據不可聲稱完成——並確保**證據本身站得住腳**。本標準防兩種不同的失敗：

1. **無證據就宣稱成功**——代理斷言它從未查過的事（Iron Law）。
2. **證據撐不起它的主張**——代理**確實查了**，而查詢工具靜默地沒有運作（證據有效性，v1.2.0 新增）。

前者是幻覺的一種，**後者不是**——沒有任何東西被捏造，是一個真實的指令產生了真實的輸出，而那個輸出的意思不是它看起來的意思。兩者殊途同歸：一個不成立的完成聲明。

---

## Glossary

| Term | Definition |
|------|-----------|
| Verification Evidence | A structured record of a verification command's execution and result |
| Iron Law | The absolute rule: no evidence = no completion claim |
| RED-GREEN Cycle | Proving a bug fix by showing the test fails before and passes after the fix |
| Exit Code | The numeric return value of a command. **`0 = success` is the tool's convention, not a guarantee** — see Evidence Validity |
| Environment Layer | Which environment the evidence was collected from (`local` / `uat` / `prd`) |
| Evidence Validity | Whether the evidence *itself* is trustworthy — i.e. whether the verification command actually ran and actually measured what it claims |
| Silent Tool Failure | A verification command that fails to run, or runs without measuring anything, yet produces output indistinguishable from a genuine result |
| Evidence Freshness | Whether evidence was produced by a run executed *after* the most recent edit to the code, prompt, or configuration under test — not carried over from a run against an earlier state |

---

## The Iron Law

> **No verification evidence = no completion claim.**

無驗證證據 = 不可聲稱完成。

An agent saying "it's done" is not evidence. The verification must be independently executable and produce observable output.

代理聲稱「已完成」不是證據。驗證必須是可獨立執行且產生可觀察輸出的。

### Non-Evidence Claims

None of the following constitute verification evidence:

| Claim | Why it isn't evidence |
|-------|----------------------|
| "Done." | No observable output |
| "It should work now." | No verification was executed |
| "I changed the code." | A modification is not a verification |
| "The tests should pass." | A prediction is not a fact |
| "The command returned 0." | Only if the command could have measured the claim — see Evidence Validity |

---

## Evidence Format

Every verification must produce a structured evidence record:

```json
{
  "command": "pnpm test -- --filter core",
  "exit_code": 0,
  "output": "Tests: 47 passed, 0 failed\nDuration: 3.2s",
  "timestamp": "2026-03-20T14:30:00Z",
  "environment_layer": "local"
}
```

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes | The actual verification command executed |
| `exit_code` | number | Yes | Command exit code. **Interpret via Evidence Validity — this field is a claim, not a fact** |
| `output` | string | Yes | Command output (truncated to 2000 chars, preserving key info) |
| `timestamp` | string | Yes | Execution time in ISO 8601 format |
| `environment_layer` | string | Conditional | Which layer the evidence came from (`local` / `uat` / `prd`). **Required for any AC with an external service dependency** (SMS, payment, IdP); when absent, the AC's verification level is treated as local-only |

---

## Evidence Types

| Type | Applies to | Example |
|------|-----------|---------|
| **Test result** | Feature work, bug fixes | `npm test` output |
| **Type check** | Statically typed codebases | `pnpm tsc --noEmit` reporting no errors |
| **Build success** | Compilation, packaging | `npm run build` exiting 0 |
| **Lint clean** | Code quality | `npm run lint` reporting no errors |
| **RED-GREEN** | Bug fixes | Failing before the fix → passing after |
| **Health probe** | Deployed services | `curl https://<service>/health` — declare `environment_layer`; a probe against `localhost` verifies the local process, not the deployment |
| **Manual verification** | UI changes, visual behaviour | Screenshot or screen recording |

---

## Environment Layers

> **Iron Law (Environment)**: before acceptance, establish *which dimensions of this flow this environment layer is capable of verifying at all*.

驗收前必須確認「此環境層次能驗證此流程的哪些維度」。

A passing test proves nothing about a dimension the environment cannot exercise. A `local` run with a mocked payment gateway does not verify the payment integration — it verifies the mock. Evidence must therefore declare where it was collected.

| Layer | Meaning |
|-------|---------|
| `local` | Developer machine or CI; external dependencies typically mocked or stubbed |
| `uat` | Staging environment with real (or sandbox) external services |
| `prd` | Production |

For an AC that depends on an external service, `local`-only evidence is **insufficient**: either supply `uat`/`prd` evidence, or declare the gap explicitly. See VE-005 / VE-006.

> The declaration goes in the project's **Environment Stratification Responsibility Matrix** (`docs/testing/environment-stratification-matrix.md` or the test plan) — a per-project deliverable defined by the `deployment-standards` standard, which answers "which test flows can be fully verified in which environment?". Mark the un-verifiable combinations ⚠️/❌ there rather than leaving them implied by a passing local run.

---

## RED-GREEN Cycle

For bug fixes and regression tests, verification requires showing both the failure and the fix:

### Step 1: RED — Prove the Bug Exists

Run the test **before** the fix to confirm it fails:

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 1,
  "output": "FAIL: expected null to equal { name: 'test' }",
  "timestamp": "2026-03-20T14:25:00Z"
}
```

### Step 2: Apply the Fix

Make the code change.

### Step 3: GREEN — Prove the Fix Works

Run the test **after** the fix to confirm it passes:

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 0,
  "output": "PASS: 12 tests passed",
  "timestamp": "2026-03-20T14:28:00Z"
}
```

### Step 4: Record Both

The evidence record must include both RED and GREEN phases.

回歸測試必須展示 RED → GREEN 循環，兩個階段的證據都必須記錄。

---

## Evidence Validity

> **The evidence can lie. Verify the evidence, not just the claim.**

證據本身會騙人。要驗的不只是「有沒有證據」，還有「這個證據成不成立」。

The Iron Law stops an agent from claiming success **without** evidence. It does not stop the opposite failure: the agent *does* run a verification, the command *does* return, `exit_code` *is* `0` — **and the output is meaningless**, because the command never actually measured anything.

This is not hallucination. Hallucination is inventing what you did not check. This is the reverse: **you checked, and the checking tool lied to you.** The `anti-hallucination` standard does not cover it — every prohibition there is a form of "don't make things up", and here nothing was made up.

### The five validity rules

**1. `exit_code = 0` means success only for tools that return 0 on success.**

The convention is near-universal, which is exactly why it goes unquestioned. When a tool fails **by design** in the situation under test, its non-zero exit code carries no information about the artefact — read the *output* instead. The inverse holds too: a non-zero exit code does not establish that the thing under test is broken.

**2. "Empty output" / "not found" / `0` is not the same as "it isn't there."**

Before concluding absence, establish that the query tool *ran successfully*: it was not `command not found`, it was not denied permission, its arguments were not consumed by an intervening shell. **Verify the query tool works before trusting the query's silence.**

**3. Commands that test for existence must not discard stderr.**

Suppressing stderr (`2>/dev/null` and equivalents) silences precisely the channel that would have reported "this tool is broken". The failure then wears the same clothes as a true negative.

**4. A pipeline's exit code does not belong to any single stage in it.**

With `set -o pipefail`, `producer | grep -q pattern` inherits a non-zero from `producer` regardless of whether `grep` matched. When the decision depends on content, **capture the output first, then evaluate it** — do not let a pipeline collapse two questions into one number.

**5. Evidence must postdate the last edit to what it verifies.**

A verification run captured *before* the most recent change to the code, prompt, or configuration under test proves something — just not the thing being claimed. The trap is silent: the full suite ran green, something was edited afterward (a prompt, a config value, a threshold), and only a narrower check (lint, a partial suite) ran after that edit — yet the earlier green run gets cited as evidence for the current state. **Evidence is a single fresh execution captured after the last edit, not the most recent execution that happened to pass.**

### Stale Evidence — a failure shape

Rules 1–4 assume the evidence was collected in the right place and read correctly. They say nothing about *when*. A command that ran, measured correctly, and returned a true result can still fail to support a completion claim, if something changed after it ran.

**Shape of the failure**: the full test suite runs and passes. Afterward, a prompt or a configuration value is edited — no test exercises that edit directly. Before committing, only `lint` is run, and it also passes. The commit is made citing "tests pass" as evidence. CI then fails, red on a test that pins the exact content that was just changed — the suite that "passed" ran against a version of the artefact that no longer exists by the time the claim was made.

規則 1–4 假設證據**在正確的地方**被蒐集且被正確解讀。它們沒有回答「**什麼時候**」這個問題。一個執行了、量測正確、也回傳真結果的指令，依然可能撐不起一個完成聲明——如果它跑完之後有東西又變了。

**失效樣態**：完整測試套件跑過且通過。之後，某個提示詞或設定值被編輯——沒有任何測試直接涵蓋那次編輯。提交前只跑了 `lint`，也通過。commit 引用「測試通過」作為證據。接著 CI 紅在一個釘住剛剛被改掉那份內容的測試上——那個「通過」的套件，跑的是一個在主張被提出時已經不存在的版本。

### Evidence of the failure mode

The following are real verification commands run by an AI agent on 2026-07-17, each of which produced a confident, wrong conclusion that was then reported as fact:

| Verification command | `exit_code` | Output | Ground truth |
|---|:---:|---|---|
| `sudo -n find /backup/immich -type f 2>/dev/null \| wc -l` | **0** | `0` | `sudo` failed for lack of a tty, `2>/dev/null` ate the error, empty input made `wc -l` print `0`. **31 files existed.** Reported as "the backups are empty" |
| `gpg --list-packets <valid-file.gpg>` | **≠ 0** | Well-formed packet listing | The host holds no private key **by design**; gpg always exits non-zero here. **The file was valid.** Acted on by deleting a good encrypted backup |
| `gpg … \| grep -q "tag=1"` under `pipefail` | **≠ 0** | grep *did* match | The pipeline inherited gpg's non-zero; the match was irrelevant. **Deleted a good backup a second time** |
| `grep -c "${VAR}/path" file` over SSH in double quotes | **0** | `0` | `${VAR}` was expanded by the *local* shell to an empty string; the remote grep searched for the wrong text |
| `gpg --import key.asc 2>/dev/null` | — | (empty) | gpg **was not installed**; `command not found` went to the suppressed stderr |
| `until ! ssh host 'systemctl is-active svc'; do …` | — | loop exited | **A failed SSH connection and a finished service produce the same exit code.** The "result" read afterwards was a stale value from a previous run |
| `du -sh /data/*` as an unprivileged user | **0** | `4.0K` | Unreadable directories were reported as near-empty rather than as errors |
| `case "$tag" in *M*)` searching for monthly snapshots | **0** | (no match) | The tag's actual value was `monthly` — no capital `M`. Nearly became "there are no monthly snapshots" |

**Four of these had `exit_code = 0` and were false; two had `exit_code ≠ 0` and were true.** The field was unreliable in both directions — and in both of the non-zero cases, following VE-002 ("mark verification failed, trigger fix loop") destroyed a healthy artefact.

> **Provenance**: all instances come from a single day's work by a single agent (Claude Opus 4.8), recorded in AsiaOstrich XSPEC-340. The sample is dense but narrow. It is offered as evidence rather than proof — though note that every failure above originates in the *semantics of the tools* (sudo, gpg, pipefail, POSIX exit codes), not in any property of the model, so any agent driving the same tools is exposed to the same traps.

---

## Trust Rules

| Rule | Description |
|------|-------------|
| Agent says "done" but no `verification_evidence` | Mark as **unverified** |
| `verification_evidence` exists but `exit_code ≠ 0` | Mark as **verification failed** — **unless** the tool is known to exit non-zero in the state under test (Evidence Validity rule 1), in which case judge by output |
| `exit_code = 0` but the command could not have measured the claim | Mark as **unverified** — a passing command that ran in the wrong place, or never ran at all, is not evidence |
| Evidence asserts absence (`0`, empty, "not found") | Mark as **unverified** until the query tool is shown to have executed successfully |
| Evidence's timestamp precedes the most recent edit to what it verifies | Mark as **stale** — re-run after the edit; do not cite the earlier pass |
| Multiple verification steps | **All** steps must pass |
| Agent provides evidence for wrong command | Mark as **unverified** |

---

## Narrow Coverage Must Be Registered, Not Just Disclosed

Evidence Validity and the Environment Stratification Matrix both allow a documented gap — an environment that cannot exercise a dimension, a check whose measurement is narrower than the claim it is cited for. A written disclosure of that gap is not, by itself, enough: prose is cheaper than closing the gap, and a disclosure that is never revisited quietly becomes a permanent excuse for evidence that no longer supports what it is used to support.

**Requirement**: any such documented gap must also be registered in a dated exception inventory — external to the standard or the matrix entry itself — naming the gap, its reason, and a review or expiry date. A footnote with no corresponding inventory entry does not satisfy this rule.

**Falsifiable condition**: an inventory entry left unchanged across two consecutive review cycles means the disclosure has become an escape hatch, and the rule is violated for that entry — not "partially satisfied", violated. The inventory's location, format, and cadence are left to the adopting project; this standard requires only that one exists and that entries move.

This is the same requirement as [class-level-fix](class-level-fix.md)'s narrow-coverage rule, applied to verification evidence rather than to class-level checks: in both cases, a disclosure that never has to change is not a disclosure — it is a permanent exemption wearing a disclosure's clothes.

Evidence Validity 與 Environment Stratification Matrix 都允許一個被記錄下來的缺口——一個無法驗證某個維度的環境層次、一項量測範圍窄於它所支撐主張的檢查。單純寫下這個缺口本身並不夠：散文比真正補上缺口便宜，而一個從未被重新檢視的揭露，會悄悄變成「這份證據其實撐不起它被用來支撐的主張」的永久藉口。

**要求**：任何這一類已記錄的缺口，必須同時登記到一份**帶到期日的例外清冊**——獨立於標準本文或 matrix 條目本身之外——指名缺口、其成因、並附上覆核或到期日期。只有一則註腳而沒有對應清冊條目，不滿足本條。

**可證偽條件**：一則清冊條目連續兩期審查都未變動，代表該揭露已經變成逃生口，本條對該條目失效——不是「部分滿足」，是失效。清冊放在哪裡、什麼格式、多久審一次，留給採用專案自行決定；本標準只要求「有這麼一份東西存在，且條目會動」。

這與 [class-level-fix](class-level-fix.md) 的窄涵蓋規則是同一條要求，套用在驗證證據而非類別層檢查上：兩種情況下，一個永遠不必改變的揭露都不是揭露，是一份穿著揭露外衣的永久豁免。

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| VE-001 | Agent reports success without verification_evidence | Downgrade to `done_with_concerns` | Critical |
| VE-002 | `exit_code ≠ 0` in evidence | Mark verification failed, trigger fix loop — **after** confirming the tool returns 0 on success in this state (see VE-007) | High |
| VE-003 | Bug fix without RED-GREEN cycle | Request both RED and GREEN evidence | High |
| VE-004 | Output exceeds 2000 chars | Truncate but preserve error messages and summary lines | Medium |
| VE-005 | AC has an external service dependency (SMS, payment, IdP) | Evidence must declare `environment_layer`; local-only evidence is insufficient | Required |
| VE-006 | AC with external dependency marked done, no `environment_layer` | Downgrade to `done_with_concerns`; require the layer declaration or a ⚠️/❌ entry in the environment-stratification-matrix | High |
| VE-007 | The verification tool exits non-zero in the state under test **by design** | VE-002 does not apply. Judge by output content; **do not trigger a fix loop against a healthy artefact** | Critical |
| VE-008 | Evidence claims absence (`0`, empty output, "not found") | Invalid until the query tool is shown to have run successfully. Re-run without stderr suppression | High |
| VE-009 | An existence/absence check suppresses stderr (`2>/dev/null` or equivalent) | Evidence does not stand. Re-run with stderr visible | High |
| VE-010 | Evidence's `exit_code` comes from a pipeline (esp. under `pipefail`) | The code attributes to no single stage. Capture the output and evaluate content instead | Medium |
| VE-011 | Evidence's execution timestamp precedes the most recent edit to the artefact it claims to verify | Mark **stale** — not valid evidence for the current state; require a fresh single run captured after the edit | High |
| VE-012 | A documented evidence/coverage gap (environment-stratification ⚠️/❌, or any check narrower than the claim it supports) has no entry in a dated exception inventory | Disclosure alone does not satisfy this rule — require a registered, dated inventory entry naming the gap and its review/expiry | Required |

---

## Output Truncation Guidelines

When verification output exceeds 2000 characters:

1. **Keep**: Error messages, failure summaries, test counts, final status line
2. **Remove**: Verbose progress output, stack traces for passing tests, duplicate lines
3. **Mark truncation**: Add `[... truncated ...]` where content was removed

---

## Examples

### Good: Complete Evidence

```yaml
verification_evidence:
  - command: "pnpm test"
    exit_code: 0
    output: "Test Suites: 12 passed\nTests: 147 passed\nTime: 8.3s"
    timestamp: "2026-03-20T14:30:00Z"
  - command: "pnpm lint"
    exit_code: 0
    output: "No issues found"
    timestamp: "2026-03-20T14:30:05Z"
```

### Bad: No Evidence

```yaml
status: success
message: "I've completed the task and everything should work now."
# ❌ No verification_evidence — violates Iron Law
```

### Bad: Evidence That Cannot Support Its Claim

```yaml
claim: "The backup directory is empty — backups are not running."
verification_evidence:
  - command: "sudo -n find /backup/immich -type f 2>/dev/null | wc -l"
    exit_code: 0
    output: "0"
    timestamp: "2026-07-17T13:05:00Z"
# ❌ Passes the Iron Law: evidence exists, exit_code is 0, output is concrete.
# ❌ Violates VE-008, VE-009, VE-010:
#      - claims absence without showing the query tool ran (VE-008)
#      - suppresses the stderr that said "sudo: a terminal is required" (VE-009)
#      - the exit code is the pipeline's, i.e. `wc -l`'s — `find` never ran (VE-010)
#    31 files were present. Directory listed as empty because nothing looked.
```

### Good: The Same Check, Made Valid

```yaml
claim: "The backup directory holds 31 files."
verification_evidence:
  - command: "ssh host 'sudo find /backup/immich -type f | wc -l'"   # stderr not suppressed
    exit_code: 0
    output: "31"
    timestamp: "2026-07-17T13:07:00Z"
    environment_layer: "prd"
# ✅ stderr would have surfaced a sudo/permission failure instead of printing 0
# ✅ single-quoted so ${...} is not expanded by the local shell before transit
```

---

## Related Standards

- [Anti-Hallucination](anti-hallucination.md) — the complementary standard. It prevents *fabricated* claims (asserting what was never checked); Evidence Validity covers the opposite failure — claims that **were** checked, by a tool that silently did not work.
- [Systematic Debugging](systematic-debugging.md) — how to investigate once evidence shows a real failure
- [Checkin Standards](checkin-standards.md) — where completion claims are gated
- [Test Governance](test-governance.md) — which tests are required, and therefore which evidence must exist
- [Testing Standards](testing-standards.md) — how the tests that produce most evidence are written
- [Agent Dispatch](agent-dispatch.md) — delegated work returns claims that need this standard applied to them
- [Deployment Standards](deployment-standards.md) — defines the Environment Stratification Responsibility Matrix referenced by VE-005 / VE-006
- [Class-Level Fix](class-level-fix.md) — the same narrow-coverage-must-be-registered requirement (VE-012), applied to class-level checks rather than to verification evidence

---

## References

- **Superpowers**: [verification-before-completion](https://github.com/obra/superpowers) (MIT)
- **Test-Driven Development**: RED-GREEN-REFACTOR cycle
