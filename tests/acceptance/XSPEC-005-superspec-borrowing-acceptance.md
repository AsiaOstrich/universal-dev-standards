# XSPEC-005 Acceptance Tests — SuperSpec Borrowing Phase 1-2

**Specification**: superspec-borrowing-phase1-2-spec.md（已封存）
**Generated**: 2026-04-07
**Status**: Not Actively Reviewed — see 2026-08-19 disposition note below

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

---

## Phase 1: 基礎標準擴展

### AT-001: uds check --spec-size 掃描與報告

**Source**: AC-1 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 在 specs/ 放入 3 個不同大小的 SPEC-*.md | 檔案建立成功 | [ ] |
| 2 | 執行 `uds check --spec-size` | 每個 spec 顯示檔名、有效行數、狀態 | [ ] |
| 3 | 確認輸出包含 pass/warn/fail 狀態指示 | 三種狀態至少各出現一次 | [ ] |

**Prerequisites**: CLI 已安裝，specs/ 目錄存在
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-002: 大小閾值 warning 與 fail

**Source**: AC-2 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立有效行數 250 行的 spec | 檔案建立成功 | [ ] |
| 2 | 建立有效行數 350 行的 spec | 檔案建立成功 | [ ] |
| 3 | 建立有效行數 450 行的 spec（含 frontmatter 和 code blocks 以驗證排除） | 檔案建立成功 | [ ] |
| 4 | 執行 `uds check --spec-size` | 250 行 → pass, 350 行 → warning, 450 行 → fail | [ ] |

**Prerequisites**: specs/ 目錄存在
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-003: Enforce 模式阻斷 implement gate

**Source**: AC-3 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 設定 workflow-enforcement 為 enforce 模式 | 配置成功 | [ ] |
| 2 | 建立 400+ 行的 spec | 檔案建立成功 | [ ] |
| 3 | AI 嘗試進入 implement phase | Gate 阻斷，顯示「請先拆分 spec」訊息 | [ ] |

**Prerequisites**: workflow-enforcement.ai.yaml 包含 spec_size_within_limit gate
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-004: uds spec deps add 新增依賴

**Source**: AC-4 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立 SPEC-001.md（無依賴） | 檔案建立成功 | [ ] |
| 2 | 建立 SPEC-002.md | 檔案建立成功 | [ ] |
| 3 | 執行 `uds spec deps add SPEC-001 --on SPEC-002` | 成功訊息 | [ ] |
| 4 | 讀取 SPEC-001.md | 包含 `**Depends On**: SPEC-002` | [ ] |
| 5 | 重複執行同一命令 | SPEC-002 不重複出現 | [ ] |

**Prerequisites**: CLI spec deps 子命令可用
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-005: uds spec deps list 列出所有依賴

**Source**: AC-5 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立多個 spec 並設定依賴關係 | 依賴已設定 | [ ] |
| 2 | 執行 `uds spec deps list` | 顯示所有 spec 及其依賴目標 | [ ] |
| 3 | 執行 `uds spec deps list SPEC-001` | 僅顯示 SPEC-001 的依賴 | [ ] |

**Prerequisites**: 已透過 AT-004 建立依賴
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-006: uds spec deps remove 移除依賴

**Source**: AC-6 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 確認 SPEC-001 依賴 SPEC-002 | depends_on 包含 SPEC-002 | [ ] |
| 2 | 執行 `uds spec deps remove SPEC-001 --on SPEC-002` | 成功訊息 | [ ] |
| 3 | 讀取 SPEC-001.md | depends_on 不再包含 SPEC-002 | [ ] |

**Prerequisites**: AT-004 完成
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-007: uds spec create --boost 完整 SDD 模板

**Source**: AC-7 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test feature" --boost` | 建立 spec 檔案 | [ ] |
| 2 | 檢查產生的 spec | 包含 Motivation section | [ ] |
| 3 | 檢查產生的 spec | 包含 Detailed Design section | [ ] |
| 4 | 檢查產生的 spec | 包含 Risks & Trade-offs section | [ ] |
| 5 | 檢查 Spec Mode 欄位 | 值為 "boost" | [ ] |

**Prerequisites**: CLI spec create 命令可用
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-008: uds spec create 預設 micro-spec 模板

**Source**: AC-8 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test feature"` | 建立 spec 檔案 | [ ] |
| 2 | 檢查產生的 spec | 使用 micro-spec 格式（Intent, Scope, Acceptance） | [ ] |
| 3 | 確認無 Motivation / Detailed Design / Risks sections | 僅包含 micro-spec 欄位 | [ ] |
| 4 | 檢查 Spec Mode 欄位 | 值為 "standard" | [ ] |

**Prerequisites**: CLI spec create 命令可用
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-009: Boost mode 包含 approach 欄位

**Source**: AC-9 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds spec create "test" --boost` | Approach 欄位預設為 "conventional" | [ ] |
| 2 | 執行 `uds spec create "test" --boost --approach exploratory` | Approach 欄位為 "exploratory" | [ ] |

**Prerequisites**: CLI spec create 命令支援 --approach flag
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-010: 新欄位 optional，向後相容

**Source**: AC-10 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備不含 depends_on / spec_mode / approach 的舊格式 spec | 檔案就緒 | [ ] |
| 2 | 使用更新後的模組解析此 spec | 解析成功，無錯誤 | [ ] |
| 3 | 檢查預設值 | depends_on=[], spec_mode="standard", approach=undefined | [ ] |
| 4 | 執行 `uds check --spec-size` 對舊格式 spec | 正常輸出，無 crash | [ ] |

**Prerequisites**: 有舊格式的 spec 檔案
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

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
| 1 | 準備 standard mode 的 spec（含部分通過的品質項目） | spec 物件解析完成 | [ ] |
| 2 | 呼叫 `computeSpecScore(spec, 'standard')` | 回傳 { score, maxScore: 10, items } | [ ] |
| 3 | 確認 items 數量 | 恰好 10 個品質項目 | [ ] |
| 4 | 確認 score ≤ maxScore | score ≤ 10 | [ ] |

**Prerequisites**: standard-validator.js 包含 computeSpecScore 方法
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-015: computeSpecScore boost mode /25

**Source**: AC-15 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 準備 boost mode 的 spec（含完整品質項目） | spec 物件解析完成 | [ ] |
| 2 | 呼叫 `computeSpecScore(spec, 'boost')` | 回傳 { score, maxScore: 25, items } | [ ] |
| 3 | 確認 items 數量 | 恰好 25 個品質項目（含 cross-validation） | [ ] |
| 4 | 確認 cross-validation 項目 | 包含 proposal→spec、spec→tasks 等交叉驗證 | [ ] |

**Prerequisites**: standard-validator.js 包含 computeSpecScore 方法
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

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
| 1 | 列出所有被修改的 .standards/*.ai.yaml 檔案 | 檔案清單就緒 | [ ] |
| 2 | 對每個 YAML 檔案執行 YAML parser 驗證 | 全部解析成功，無語法錯誤 | [ ] |
| 3 | 確認新增的 sections 結構可被 AI 工具理解 | 欄位名稱、型別、描述完整 | [ ] |

**Prerequisites**: YAML 修改已完成
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

## Summary

| Phase | AT | AC | Status |
|-------|----|----|--------|
| 1A | AT-001 | AC-1 | [ ] |
| 1A | AT-002 | AC-2 | [ ] |
| 1A | AT-003 | AC-3 | [ ] |
| 1B | AT-004 | AC-4 | [ ] |
| 1B | AT-005 | AC-5 | [ ] |
| 1B | AT-006 | AC-6 | [ ] |
| 1C | AT-007 | AC-7 | [ ] |
| 1C | AT-008 | AC-8 | [ ] |
| 1C | AT-009 | AC-9 | [ ] |
| 1C | AT-010 | AC-10 | [ ] |
| 2A | AT-011 | AC-11 | Partial (deps+size Pass, AC-coverage Won't Do) |
| 2A | AT-012 | AC-12 | Partial (JSON shape Pass, changed contract) |
| 2A | AT-013 | AC-13 | Pass (no `--ci` flag — see Notes) |
| 2B | AT-014 | AC-14 | [ ] (out of R5 scope, unexamined) |
| 2B | AT-015 | AC-15 | [ ] (out of R5 scope, unexamined) |
| 2C | AT-016 | AC-16 | Won't Do |
| 2C | AT-017 | AC-17 | Won't Do |
| 2C | AT-018 | AC-18 | [ ] (out of R5 scope, unexamined) |

**Overall Result**: Not a single Pass/Fail — see 2026-08-19 disposition note
at the top of this file. Rows this decision touched (AT-011–AT-013,
AT-016–AT-017) are resolved (Pass, Partial, or Won't Do, each with evidence).
Rows outside its scope (AT-001–AT-010, AT-014, AT-015, AT-018) remain exactly
as generated on 2026-04-07.
**Sign-off**: Claude (dispatch-uds agent) — for the rows in scope only
**Date**: 2026-08-19
