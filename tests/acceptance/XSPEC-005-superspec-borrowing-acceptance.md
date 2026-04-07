# XSPEC-005 Acceptance Tests — SuperSpec Borrowing Phase 1-2

**Specification**: [superspec-borrowing-phase1-2-spec.md](../../specs/superspec-borrowing-phase1-2-spec.md)
**Generated**: 2026-04-07
**Status**: Pending Review

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
| 1 | 準備 specs 和對應測試檔案（含 @AC-N 標記） | 檔案就緒 | [ ] |
| 2 | 執行 `uds lint` | 每個 spec 顯示 AC coverage 狀態 | [ ] |
| 3 | 檢查輸出 | 每個 spec 顯示 dependency validity 狀態 | [ ] |
| 4 | 檢查輸出 | 每個 spec 顯示 size 狀態 | [ ] |

**Prerequisites**: specs/ 和測試檔案存在
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-012: uds lint --json 輸出 JSON

**Source**: AC-12 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 執行 `uds lint --json` | stdout 輸出 JSON | [ ] |
| 2 | 解析 JSON | 結構包含 results 陣列和 summary 物件 | [ ] |
| 3 | 檢查每筆 result | 包含 coverage, deps, size 欄位 | [ ] |

**Prerequisites**: uds lint 命令可用
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-013: uds lint --ci 失敗時 exit code 1

**Source**: AC-13 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 建立包含 broken depends_on 的 spec | 檔案建立成功 | [ ] |
| 2 | 執行 `uds lint --ci` | 輸出含 fail 項 | [ ] |
| 3 | 檢查 exit code | `echo $?` 回傳 1 | [ ] |

**Prerequisites**: uds lint 支援 --ci flag
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

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
| 1 | 在含 git 歷史和 workflow state 的專案中執行 `uds sync` | 成功訊息 | [ ] |
| 2 | 確認 `.workflow-state/context.md` 存在 | 檔案存在 | [ ] |
| 3 | 確認包含 Git Status section | 含 Branch、Base、Recent Commits | [ ] |
| 4 | 確認包含 Workflow State section | 含 Spec、Phase、Next Steps | [ ] |
| 5 | 計算行數 | ≤ 500 行 | [ ] |

**Prerequisites**: git repo 已初始化，有 workflow state
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

---

### AT-017: uds sync 無 workflow state

**Source**: AC-17 from XSPEC-005

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | 在有 git 但無 .workflow-state/ 的專案中執行 `uds sync` | 成功訊息 | [ ] |
| 2 | 確認 `.workflow-state/context.md` 存在 | 檔案存在 | [ ] |
| 3 | 確認包含 Git Status section | 含 git 資訊 | [ ] |
| 4 | 確認不包含 Workflow State section | 無 workflow 區塊（或標示 "N/A"） | [ ] |

**Prerequisites**: git repo 已初始化，無 .workflow-state/
**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
**Notes**: _______________

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
| 2A | AT-011 | AC-11 | [ ] |
| 2A | AT-012 | AC-12 | [ ] |
| 2A | AT-013 | AC-13 | [ ] |
| 2B | AT-014 | AC-14 | [ ] |
| 2B | AT-015 | AC-15 | [ ] |
| 2C | AT-016 | AC-16 | [ ] |
| 2C | AT-017 | AC-17 | [ ] |
| 2C | AT-018 | AC-18 | [ ] |

**Overall Result**: [ ] Pass / [ ] Fail
**Sign-off**: _______________
**Date**: _______________
