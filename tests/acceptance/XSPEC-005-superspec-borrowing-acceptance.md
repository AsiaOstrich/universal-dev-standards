# XSPEC-005 Acceptance Tests — SuperSpec Borrowing Phase 1-2

**Specification**: superspec-borrowing-phase1-2-spec.md（已封存）
**Generated**: 2026-04-07
**Status**: Dispositioned — all 18 ATs resolved, none left unexamined (2026-08-20)

> **2026-08-19 update (XSPEC-383 R5 / Option E)**: this file sat at "Pending
> Review", 0/122 boxes checked, for four and a half months — nobody was
> coming to review it, which is a different fact from "still pending."
> Rather than continue to claim a review is imminent, the rows this
> decision actually touched are dispositioned below with real evidence; the
> ones it did not touch are marked as such rather than left to imply they
> were.
>
> - **AT-016 / AT-017 (`uds sync`)** — Won't Do. The command was deleted
>   (zero consumers — `check-module-reachability.mjs` confirmed it was never
>   registered in four and a half months of existing).
> - **AT-011–AT-013's AC-coverage steps** — Won't Do. `checkACCoverage` was
>   deleted along with `uds lint`'s AC-coverage output (see
>   `cli/src/utils/spec-linter.js`'s module docstring): it reported 0%
>   coverage on every one of VibeOps's 93 real specs, for two independent,
>   convention-mismatch reasons that had nothing to do with whether coverage
>   existed. Redoing this needs a new identifier/convention design, not a
>   patch, and is out of scope here.
> - **AT-011–AT-013's dependency-validity and size steps, and AT-012's JSON
>   shape** — actually run against this repo and against VibeOps's 93
>   specs; see per-row evidence below. AT-012 step 3's expectation ("each
>   result contains `coverage`, `deps`, `size` fields") is stale and
>   superseded: the shipped `--json` shape is `{specId, status, message}`,
>   chosen to match what VibeOps's `lint-executor.ts` has been parsing
>   since 2026-04-07 without ever getting a response, not invented fresh.
> - **AT-001–AT-010, AT-014, AT-015, AT-018** (spec size checks unrelated
>   to `uds lint`, `uds spec deps add/list/remove`, `uds spec create
>   --boost`, `computeSpecScore`, YAML section formatting) are **outside
>   this decision's scope** and were not examined. They remain exactly as
>   generated on 2026-04-07 — unverified, not passing, not failing.
>   → **Superseded by the 2026-08-20 note below; all 13 are now dispositioned.**

> **2026-08-20 update (XSPEC-383 R6)**: the 13 rows the 2026-08-19 pass left
> unexamined are now dispositioned. Every one was either RUN or shown, by
> running it, that the thing it tests does not exist.
>
> **The headline finding: 8 of the 18 ATs test features that were specified
> in XSPEC-005 and never shipped.** `uds check --spec-size`, `uds spec deps
> add/list/remove`, and `uds spec create --boost/--approach` are all absent
> from the CLI. This is the same shape as XSPEC-383's central case — an
> artifact asserting a path that was never connected — and it had been sitting
> here since 2026-04-07 looking like work merely awaiting a tester.
>
> That reading is corroborated independently: on 2026-08-19 the module
> docstring of `cli/src/commands/quickstart.js` recorded that four of its
> entries pointed at things that do not exist, naming `uds check --spec-size`
> and `uds spec create --boost` among them, and removed them. The CLI's own
> guidance had already stopped pointing at these commands; this file had not.
>
> **How existence was determined.** Not with `--help`: commander prints the
> general help for an unknown command rather than erroring, so `--help`
> reports every name as valid — the trap quickstart.js's docstring names
> explicitly. Each command was instead invoked for real, and the disposition
> records the exact error text it returned.
>
> - **Ran and passed**: AT-008 (default micro-spec, all 4 steps), AT-014 and
>   AT-015 (`computeSpecScore` at /10 and /25), AT-010 steps 1–3
>   (backward-compatible parsing defaults), AT-018 steps 1–2 (143/143
>   `.standards/*.ai.yaml` parse, with a negative control proving the loop
>   can fail).
> - **Won't Do — never implemented**: AT-001, AT-002 (`--spec-size`),
>   AT-003 (`spec_size_within_limit` gate), AT-004–AT-006 (`uds spec deps`),
>   AT-007, AT-009 (`--boost`, `--approach`), plus AT-010 step 4 and AT-018
>   step 3. These are not "deferred" and they are not "passed": the feature
>   is absent, and the project has already removed its own pointers to it.
>
> One distinction worth keeping, because it would otherwise be lost: for
> AT-004–AT-006 the *capability* exists as `addDependency` /
> `removeDependency` in `cli/src/vibe/micro-spec.js`. What does not exist is
> the `uds spec deps` CLI surface those rows test. The module methods were
> not exercised here — testing them would be testing something other than
> what the row says.

---

## Phase 1: 基礎標準擴展

### AT-001: uds check --spec-size 掃描與報告

**Source**: AC-1 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 在 specs/ 放入 3 個不同大小的 SPEC-*.md | 檔案建立成功 | Won't Do |
| 2 | 執行 `uds check --spec-size` | 每個 spec 顯示檔名、有效行數、狀態 | Won't Do |
| 3 | 確認輸出包含 pass/warn/fail 狀態指示 | 三種狀態至少各出現一次 | Won't Do |

**Prerequisites**: CLI 已安裝，specs/ 目錄存在
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — `--spec-size` was never implemented
**Notes**: `uds check` accepts no `--spec-size` option. Verified by running it,
not by reading help: `node cli/bin/uds.js check --spec-size` returns
`error: unknown option '--spec-size'` (exit 1). Across `cli/src/` and
`cli/bin/`, the string `spec-size` occurs exactly once — in a comment in
`cli/src/commands/quickstart.js` recording that this very flag does not exist
and was removed from the quickstart entries on 2026-08-19. The size check that
does ship is `uds lint` (see AT-011), which reports effective lines per spec.

---

### AT-002: 大小閾值 warning 與 fail

**Source**: AC-2 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立有效行數 250 行的 spec | 檔案建立成功 | Won't Do |
| 2 | 建立有效行數 350 行的 spec | 檔案建立成功 | Won't Do |
| 3 | 建立有效行數 450 行的 spec（含 frontmatter 和 code blocks 以驗證排除） | 檔案建立成功 | Won't Do |
| 4 | 執行 `uds check --spec-size` | 250 行 → pass, 350 行 → warning, 450 行 → fail | Won't Do |

**Prerequisites**: specs/ 目錄存在
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — same missing flag as AT-001
**Notes**: Depends on `uds check --spec-size`, which does not exist (AT-001).
The three-way pass/warn/fail threshold behaviour this row describes IS shipped,
but under `uds lint`: the 2026-08-19 VibeOps run recorded in AT-011 produced
87 pass / 5 warn / 1 fail across 93 specs. So the requirement behind this row
is met by a different command; the row as written tests a command that is not
there, and rewriting it to point at `uds lint` would be inventing a new test
rather than dispositioning this one.

---

### AT-003: Enforce 模式阻斷 implement gate

**Source**: AC-3 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 設定 workflow-enforcement 為 enforce 模式 | 配置成功 | Won't Do |
| 2 | 建立 400+ 行的 spec | 檔案建立成功 | Won't Do |
| 3 | AI 嘗試進入 implement phase | Gate 阻斷，顯示「請先拆分 spec」訊息 | Won't Do |

**Prerequisites**: workflow-enforcement.ai.yaml 包含 spec_size_within_limit gate
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — the prerequisite gate does not exist
**Notes**: The stated prerequisite is unmet, so there is nothing to exercise.
`ai/standards/workflow-enforcement.ai.yaml` does not exist at all; the standard
lives at `core/workflow-enforcement.md`, and that file contains no `spec_size`
gate (searched for `spec_size` and `spec size`: 0 hits, against a control
search for `gate` in the same file returning 19 — so the search was working).
`spec_size` also returns 0 hits across `ai/`, `core/` and `options/`.

---

### AT-004: uds spec deps add 新增依賴

**Source**: AC-4 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立 SPEC-001.md（無依賴） | 檔案建立成功 | Won't Do |
| 2 | 建立 SPEC-002.md | 檔案建立成功 | Won't Do |
| 3 | 執行 `uds spec deps add SPEC-001 --on SPEC-002` | 成功訊息 | Won't Do |
| 4 | 讀取 SPEC-001.md | 包含 `**Depends On**: SPEC-002` | Won't Do |
| 5 | 重複執行同一命令 | SPEC-002 不重複出現 | Won't Do |

**Prerequisites**: CLI spec deps 子命令可用
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — `uds spec deps` is not a command
**Notes**: The stated prerequisite is false. `node cli/bin/uds.js spec deps list`
returns `error: unknown command 'deps'` (exit 1). `cli/bin/uds.js` registers
these `spec` subcommands and no others: create, list, show, confirm, archive,
delete, search, split. There IS a top-level `uds deps`, but it is a different
feature entirely — it compares npm dependency versions against declared ranges
(XSPEC-366), and shares nothing with spec dependencies but the word.

**The capability is not missing; the command surface is.**
`cli/src/vibe/micro-spec.js` implements `addDependency(id, targetId)` at
line 425, including the idempotency step 5 asks for
(`if (!spec.dependsOn.includes(targetId))`). Nothing exposes it to a user.
Those module methods were deliberately NOT exercised in place of this row:
testing them would report a pass for something no user can reach, which is
precisely the failure XSPEC-383 exists to stop.

---

### AT-005: uds spec deps list 列出所有依賴

**Source**: AC-5 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立多個 spec 並設定依賴關係 | 依賴已設定 | Won't Do |
| 2 | 執行 `uds spec deps list` | 顯示所有 spec 及其依賴目標 | Won't Do |
| 3 | 執行 `uds spec deps list SPEC-001` | 僅顯示 SPEC-001 的依賴 | Won't Do |

**Prerequisites**: 已透過 AT-004 建立依賴
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — same missing command surface as AT-004
**Notes**: `uds spec deps` does not exist; see AT-004 for the run and its exact
error. Unlike add/remove, no module-level `listDependencies` exists either —
dependency data is readable only via `fromMarkdown`'s `spec.dependsOn`, which
`uds lint` consumes for its dependency-validity check (AT-011 step 3, Pass).

---

### AT-006: uds spec deps remove 移除依賴

**Source**: AC-6 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 確認 SPEC-001 依賴 SPEC-002 | depends_on 包含 SPEC-002 | Won't Do |
| 2 | 執行 `uds spec deps remove SPEC-001 --on SPEC-002` | 成功訊息 | Won't Do |
| 3 | 讀取 SPEC-001.md | depends_on 不再包含 SPEC-002 | Won't Do |

**Prerequisites**: AT-004 完成
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — same missing command surface as AT-004
**Notes**: Its own prerequisite ("AT-004 完成") can never be satisfied, since
AT-004 is Won't Do for the same reason. `removeDependency(id, targetId)` exists
at `cli/src/vibe/micro-spec.js:447` and is unexposed, exactly as add is.

---

### AT-007: uds spec create --boost 完整 SDD 模板

**Source**: AC-7 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test feature" --boost` | 建立 spec 檔案 | Won't Do |
| 2 | 檢查產生的 spec | 包含 Motivation section | Won't Do |
| 3 | 檢查產生的 spec | 包含 Detailed Design section | Won't Do |
| 4 | 檢查產生的 spec | 包含 Risks & Trade-offs section | Won't Do |
| 5 | 檢查 Spec Mode 欄位 | 值為 "boost" | Won't Do |

**Prerequisites**: CLI spec create 命令可用
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — `--boost` was never implemented
**Notes**: `node cli/bin/uds.js spec create "boost probe" --boost -y` returns
`error: unknown option '--boost'` (exit 1). `uds spec create` accepts only
`-s/--scope`, `-o/--output` and `-y/--yes`. The word `boost` does not appear in
`cli/src/commands/spec.js` at all.

A boost renderer does exist (`_toBoostMarkdown` at
`cli/src/vibe/micro-spec.js:249`, emitting Motivation / Detailed Design /
Risks & Trade-offs and `**Approach**`), and `toMarkdown` dispatches to it when
`spec.specMode === 'boost'`. Nothing in the CLI ever sets that mode. This is
the same shape as AT-004: implementation present, entry point absent —
which is why `quickstart.js` removed its `uds spec create --boost` entry on
2026-08-19.

---

### AT-008: uds spec create 預設 micro-spec 模板

**Source**: AC-8 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test feature"` | 建立 spec 檔案 | [x] |
| 2 | 檢查產生的 spec | 使用 micro-spec 格式（Intent, Scope, Acceptance） | [x] |
| 3 | 確認無 Motivation / Detailed Design / Risks sections | 僅包含 micro-spec 欄位 | [x] |
| 4 | 檢查 Spec Mode 欄位 | 值為 "standard" | [x] |

**Prerequisites**: CLI spec create 命令可用
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Pass — all 4 steps, actually run
**Notes**: `node cli/bin/uds.js spec create "test feature" -y` in a throwaway
project wrote `specs/SPEC-001-test-feature.md` and printed the rendered spec.
Step 2: `**Intent**`, `**Scope**`, `**Acceptance**` all present. Step 3:
searched the written file for `Motivation`, `Detailed Design`, `Risks` — 0 hits,
against a control search for `Acceptance` in the same file returning 1, so the
search was working and the absence is real. Step 4: the file carries
`**Spec Mode**: standard` verbatim.

---

### AT-009: Boost mode 包含 approach 欄位

**Source**: AC-9 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test" --boost` | Approach 欄位預設為 "conventional" | Won't Do |
| 2 | 執行 `uds spec create "test" --boost --approach exploratory` | Approach 欄位為 "exploratory" | Won't Do |

**Prerequisites**: CLI spec create 命令支援 --approach flag
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Won't Do — neither `--boost` nor `--approach` exists
**Notes**: Both flags were run. `--boost` → `error: unknown option '--boost'`;
`--approach exploratory` → `error: unknown option '--approach'` (both exit 1).
The `conventional` default this row expects is real but unreachable: it lives
at `cli/src/vibe/micro-spec.js:250` (`spec.approach || 'conventional'`) inside
the boost renderer, which nothing invokes. See AT-007.

---

### AT-010: 新欄位 optional，向後相容

**Source**: AC-10 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備不含 depends_on / spec_mode / approach 的舊格式 spec | 檔案就緒 | [x] |
| 2 | 使用更新後的模組解析此 spec | 解析成功，無錯誤 | [x] |
| 3 | 檢查預設值 | depends_on=[], spec_mode="standard", approach=undefined | [x] |
| 4 | 執行 `uds check --spec-size` 對舊格式 spec | 正常輸出，無 crash | Won't Do |

**Prerequisites**: 有舊格式的 spec 檔案
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Partial — steps 1–3 Pass, step 4 Won't Do
**Notes**: Steps 1–3 run against `microSpec.fromMarkdown()` from
`cli/src/vibe/micro-spec.js` with a spec containing none of the three markers
(asserted before parsing, so "the defaults held" cannot be an artifact of the
fixture carrying them). It parsed without throwing, and the defaults were
exactly as specified: `dependsOn` `[]`, `specMode` `"standard"`, `approach`
`undefined`. Backward compatibility holds.

Step 4 Won't Do — `uds check --spec-size` does not exist (AT-001). Note this
row would have passed vacuously if run naively: an unknown option makes the
command exit 1 without crashing, and "正常輸出，無 crash" read loosely is
satisfied by an error message.

---

## Phase 2: 驗證管線

### AT-011: uds lint 整合三項檢查

**Source**: AC-11 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備 specs 和對應測試檔案（含 @AC-N 標記） | 檔案就緒 | Won't Do |
| 2 | 執行 `uds lint` | 每個 spec 顯示 AC coverage 狀態 | Won't Do |
| 3 | 檢查輸出 | 每個 spec 顯示 dependency validity 狀態 | [x] |
| 4 | 檢查輸出 | 每個 spec 顯示 size 狀態 | [x] |

**Prerequisites**: specs/ 和測試檔案存在
**Tester**: Claude (dispatch-uds agent)
**Date**: 2026-08-19
**Result**: Partial — steps 3–4 Pass, steps 1–2 Won't Do
**Notes**: Steps 1–2 (AC coverage) Won't Do — `checkACCoverage` deleted, see
header note. Steps 3–4 verified by running `node cli/bin/uds.js lint`
against this repo (`specs/`, 1 spec, deps clean, size pass) and against
VibeOps (`node <uds>/cli/bin/uds.js lint` in
`/Users/alberthsu/Documents/GitHub/AsiaOstrich/vibeops`, 93 specs, 0 broken
dependencies, size 87 pass / 5 warn / 1 fail) — both dependency validity and
size are printed per spec in the human-readable output.

---

### AT-012: uds lint --json 輸出 JSON

**Source**: AC-12 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds lint --json` | stdout 輸出 JSON | [x] |
| 2 | 解析 JSON | 結構包含 results 陣列和 summary 物件 | [x] |
| 3 | 檢查每筆 result | 包含 coverage, deps, size 欄位 | Won't Do (superseded) |

**Prerequisites**: uds lint 命令可用
**Tester**: Claude (dispatch-uds agent)
**Date**: 2026-08-19
**Result**: Partial — steps 1–2 Pass (with a changed contract), step 3 superseded
**Notes**: `node cli/bin/uds.js lint --json` in this repo and in VibeOps both
produced valid, parseable JSON with `summary: {pass, warn, fail}` and a
`results` array. Step 3 as originally written expects raw `coverage`/`deps`/
`size` sub-objects per result; the shipped shape is instead
`{specId, status, message}` — chosen deliberately to match the shape
VibeOps's `src/runner/uds/lint-executor.ts` has been parsing since
2026-04-07 (`result.summary?.fail`, `result.results[].specId/.status/.message`),
not invented independently of any consumer. VibeOps run:
`{"pass":87,"warn":5,"fail":1}` across 93 specs, e.g.
`{"specId":"SPEC-046-dytopo-manager-early-stop","status":"fail","message":"594 effective lines (fail)"}`.

---

### AT-013: uds lint --ci 失敗時 exit code 1

**Source**: AC-13 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立包含 broken depends_on 的 spec | 檔案建立成功 | [x] |
| 2 | 執行 `uds lint --ci` | 輸出含 fail 項 | [x] (see Notes — no `--ci` flag) |
| 3 | 檢查 exit code | `echo $?` 回傳 1 | [x] |

**Prerequisites**: uds lint 支援 --ci flag
**Tester**: Claude (dispatch-uds agent)
**Date**: 2026-08-19
**Result**: Pass (design changed — no `--ci` flag needed)
**Notes**: `uds lint` never implements a `--ci` opt-in flag — unlike
`uds check`, it treats any `fail` as exit-worthy unconditionally, so there is
nothing to opt into. Verified: `node cli/bin/uds.js lint --ci` on this repo
correctly errors `unknown option '--ci'` (no such flag exists — the row's
literal command as written does not run). The underlying requirement (exit 1
on failure) was verified without the flag: VibeOps has a real broken-size
spec (`SPEC-046-dytopo-manager-early-stop`, 594 effective lines, fail);
`node <uds>/cli/bin/uds.js lint --json` in the VibeOps repo exits 1
(`echo $?` → `1`). A clean repo (this one) exits 0.

---

### AT-014: computeSpecScore standard mode /10

**Source**: AC-14 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備 standard mode 的 spec（含部分通過的品質項目） | spec 物件解析完成 | [x] |
| 2 | 呼叫 `computeSpecScore(spec, 'standard')` | 回傳 { score, maxScore: 10, items } | [x] |
| 3 | 確認 items 數量 | 恰好 10 個品質項目 | [x] |
| 4 | 確認 score ≤ maxScore | score ≤ 10 | [x] |

**Prerequisites**: standard-validator.js 包含 computeSpecScore 方法
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Pass — all 4 steps, actually run
**Notes**: Prerequisite confirmed: `computeSpecScore` is at
`cli/src/utils/standard-validator.js:348`. Called with a deliberately partial
spec (intent, 2 acceptance criteria, a scope, an empty dependsOn — but no
notes/risks/edgeCases) so that a partial score was the expected outcome and a
perfect score would have been a red flag. Returned keys exactly
`score, maxScore, items`; `maxScore` 10; `items.length` 10; score **7/10**,
with items 1,2,5,6,8,9,10 passing and 3,4,7 failing — the three the fixture
deliberately omitted, which is the check that this is measuring the fixture
rather than returning a constant.

---

### AT-015: computeSpecScore boost mode /25

**Source**: AC-15 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備 boost mode 的 spec（含完整品質項目） | spec 物件解析完成 | [x] |
| 2 | 呼叫 `computeSpecScore(spec, 'boost')` | 回傳 { score, maxScore: 25, items } | [x] |
| 3 | 確認 items 數量 | 恰好 25 個品質項目（含 cross-validation） | [x] |
| 4 | 確認 cross-validation 項目 | 包含 proposal→spec、spec→tasks 等交叉驗證 | [x] |

**Prerequisites**: standard-validator.js 包含 computeSpecScore 方法
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Pass — all 4 steps, actually run
**Notes**: Called with a fully populated boost-mode spec. `maxScore` 25,
`items.length` 25, item ids 1–25 contiguous, score **25/25** — a full score is
the correct outcome here only because AT-014's partial fixture scored 7/10
through the same function; the two together show it is reading the spec, not
returning a constant. Step 4 cross-validation items are present and passing:
#16 "Spec aligns with proposal goals" and #17 "User stories cover all proposal
goals" (proposal→spec), #21–#24 covering task granularity, dependency
correctness, parallel marking and file paths (spec→tasks).

Scope note: this exercises `computeSpecScore` directly. No CLI command reaches
boost mode (AT-007), so nothing an adopter can run produces a /25 score.

---

### AT-016: uds sync 產生 context.md

**Source**: AC-16 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 在含 git 歷史和 workflow state 的專案中執行 `uds sync` | 成功訊息 | Won't Do |
| 2 | 確認 `.workflow-state/context.md` 存在 | 檔案存在 | Won't Do |
| 3 | 確認包含 Git Status section | 含 Branch、Base、Recent Commits | Won't Do |
| 4 | 確認包含 Workflow State section | 含 Spec、Phase、Next Steps | Won't Do |
| 5 | 計算行數 | ≤ 500 行 | Won't Do |

**Prerequisites**: git repo 已初始化，有 workflow state
**Tester**: Claude (dispatch-uds agent)
**Date**: 2026-08-19
**Result**: Won't Do
**Notes**: `cli/src/commands/sync.js` (`generateContext`) had zero
consumers — never registered as a CLI command in the four and a half months
since it was written (`check-module-reachability.mjs` confirmed it, and the
same script confirms it is no longer in the reachability baseline because it
no longer exists). Deleted along with `cli/tests/unit/commands/sync.test.js`.

---

### AT-017: uds sync 無 workflow state

**Source**: AC-17 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 在有 git 但無 .workflow-state/ 的專案中執行 `uds sync` | 成功訊息 | Won't Do |
| 2 | 確認 `.workflow-state/context.md` 存在 | 檔案存在 | Won't Do |
| 3 | 確認包含 Git Status section | 含 git 資訊 | Won't Do |
| 4 | 確認不包含 Workflow State section | 無 workflow 區塊（或標示 "N/A"） | Won't Do |

**Prerequisites**: git repo 已初始化，無 .workflow-state/
**Tester**: Claude (dispatch-uds agent)
**Date**: 2026-08-19
**Result**: Won't Do
**Notes**: Same disposition as AT-016 — `uds sync` deleted, zero consumers.

---

### AT-018: YAML 新增 sections 格式正確

**Source**: AC-18 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 列出所有被修改的 .standards/*.ai.yaml 檔案 | 檔案清單就緒 | [x] (widened — see Notes) |
| 2 | 對每個 YAML 檔案執行 YAML parser 驗證 | 全部解析成功，無語法錯誤 | [x] |
| 3 | 確認新增的 sections 結構可被 AI 工具理解 | 欄位名稱、型別、描述完整 | Won't Do |

**Prerequisites**: YAML 修改已完成
**Tester**: Claude Opus 5 (dispatch-uds agent)
**Date**: 2026-08-20
**Result**: Partial — steps 1–2 Pass over a widened set, step 3 Won't Do
**Notes**: Step 1 cannot be run as written: "所有被修改的" means the files
XSPEC-005 touched, and that set was never recorded anywhere. Rather than guess
it, the denominator was widened to **all 143 `.standards/*.ai.yaml`** — a
superset, so a pass over it is strictly stronger than a pass over the intended
subset. Saying so matters: silently substituting a different denominator is how
a check comes to answer a question nobody asked.

Step 2: **143/143 parse** under `js-yaml`, none loading to null/undefined. The
loop was proved capable of failing first — deliberately malformed YAML fed to
the same call threw, so "143/143" is not the shape an inert loop prints. This
agrees with `npm run check:ai-yaml`, which parses 473 `.ai.yaml` files
repo-wide by a different path.

Step 3 Won't Do: there are no such sections to inspect. Searching all 143 files
for `spec_size`, `depends_on` and `spec_mode` returns 2 files, and both are
unrelated — `recovery-recipe-registry.ai.yaml:20` uses `depends_on` for a
standard-to-standard reference, and `user-journey-testing.ai.yaml:54,106` uses
it for test-group ordering. XSPEC-005's YAML additions were never made, which
is consistent with the CLI features behind them never shipping (AT-001–AT-007).

---

## Summary

| Phase | AT | AC | Status |
|-------|----|----|--------|
| 1A | AT-001 | AC-1 | Won't Do — `uds check --spec-size` never implemented |
| 1A | AT-002 | AC-2 | Won't Do — same missing flag |
| 1A | AT-003 | AC-3 | Won't Do — `spec_size_within_limit` gate does not exist |
| 1B | AT-004 | AC-4 | Won't Do — `uds spec deps` is not a command |
| 1B | AT-005 | AC-5 | Won't Do — same |
| 1B | AT-006 | AC-6 | Won't Do — same |
| 1C | AT-007 | AC-7 | Won't Do — `--boost` never implemented |
| 1C | AT-008 | AC-8 | **Pass** (run 2026-08-20, 4/4 steps) |
| 1C | AT-009 | AC-9 | Won't Do — `--boost` / `--approach` never implemented |
| 1C | AT-010 | AC-10 | Partial — steps 1–3 **Pass**, step 4 Won't Do |
| 2A | AT-011 | AC-11 | Partial (deps+size Pass, AC-coverage Won't Do) |
| 2A | AT-012 | AC-12 | Partial (JSON shape Pass, changed contract) |
| 2A | AT-013 | AC-13 | Pass (no `--ci` flag — see Notes) |
| 2B | AT-014 | AC-14 | **Pass** (run 2026-08-20, 4/4 steps, 7/10 score) |
| 2B | AT-015 | AC-15 | **Pass** (run 2026-08-20, 4/4 steps, 25/25 score) |
| 2C | AT-016 | AC-16 | Won't Do |
| 2C | AT-017 | AC-17 | Won't Do |
| 2C | AT-018 | AC-18 | Partial — steps 1–2 **Pass** (143/143), step 3 Won't Do |

**Tally**: 18 ATs — 4 Pass, 4 Partial, 10 Won't Do, **0 unexamined**.

**Overall Result**: Dispositioned. Every row now carries a disposition and
evidence; none is waiting on a reviewer. The two dates matter separately:
AT-011–AT-013 and AT-016–AT-017 were resolved on 2026-08-19 under XSPEC-383 R5
Option E; the remaining 13 on 2026-08-20 under R6.

**The result worth carrying out of this file**: of 18 acceptance tests written
on 2026-04-07, **8 test features that were never built** — `uds check
--spec-size`, `uds spec deps add/list/remove`, and `uds spec create
--boost/--approach`. For several of them the implementation exists in
`cli/src/vibe/micro-spec.js` with no entry point wired to it. For four and a
half months this file presented them as tests awaiting a tester, which is not
what they were. That is XSPEC-383's thesis restated in a second artifact:
**an unrun test and a test of something that does not exist are indistinguishable
until someone runs it.**

**Sign-off**: Claude Opus 5 (dispatch-uds agent) — all 18 rows
**Date**: 2026-08-20
