# SPEC-FLOW-001 Traceability Matrix / 追蹤矩陣

**Generated at**: 2026-04-02
**Spec**: SPEC-FLOW-001 自訂 SDLC 流程引擎

## AC → BDD Scenario Mapping

| AC | BDD Scenario | Feature File |
|----|-------------|--------------|
| AC-1 | 解析合法的 Flow YAML | SPEC-FLOW-001.feature:L14 |
| AC-1 | 驗證 Flow YAML 必填欄位 | SPEC-FLOW-001.feature:L20 |
| AC-1 | 支援命名條件 | SPEC-FLOW-001.feature:L32 |
| AC-1 | 支援屬性比對條件 | SPEC-FLOW-001.feature:L38 |
| AC-2 | 驗證命令引用 | SPEC-FLOW-001.feature:L26 |
| AC-3 | SDD 流程轉換 | SPEC-FLOW-001.feature:L48 |
| AC-3 | TDD 循環流程 | SPEC-FLOW-001.feature:L54 |
| AC-3 | BDD 流程轉換 | SPEC-FLOW-001.feature:L60 |
| AC-3 | 內建流程可被列出 | SPEC-FLOW-001.feature:L66 |
| AC-4 | 繼承預設流程 | SPEC-FLOW-001.feature:L74 |
| AC-5 | 覆寫 stage 的 steps | SPEC-FLOW-001.feature:L80 |
| AC-5 | 覆寫 gate 閾值 | SPEC-FLOW-001.feature:L86 |
| AC-5 | 插入新 stage | SPEC-FLOW-001.feature:L92 |
| AC-5 | 移除步驟 | SPEC-FLOW-001.feature:L98 |
| AC-6 | 多層繼承 | SPEC-FLOW-001.feature:L104 |
| AC-7 | 定義獨立閘門 | SPEC-FLOW-001.feature:L112 |
| AC-7 | 行內閘門定義 | SPEC-FLOW-001.feature:L130 |
| AC-8 | Blocking 閘門阻止進行 | SPEC-FLOW-001.feature:L118 |
| AC-8 | Warning 閘門允許繼續 | SPEC-FLOW-001.feature:L124 |
| AC-9 | 不可移除閘門 | SPEC-FLOW-001.feature:L136 |
| AC-10 | 自動儲存狀態 | SPEC-FLOW-001.feature:L144 |
| AC-10 | 恢復中斷的流程 | SPEC-FLOW-001.feature:L150 |
| AC-10 | 過期流程警告 | SPEC-FLOW-001.feature:L156 |
| AC-11 | 狀態格式相容 | SPEC-FLOW-001.feature:L162 |
| AC-12 | 互動式建立流程 | SPEC-FLOW-001.feature:L170 |
| AC-13 | 列出可用流程 | SPEC-FLOW-001.feature:L176 |
| AC-14 | 驗證流程 | SPEC-FLOW-001.feature:L182 |
| AC-15 | 比較兩個流程 | SPEC-FLOW-001.feature:L188 |
| AC-16 | 匯出流程 bundle | SPEC-FLOW-001.feature:L196 |
| AC-17 | 匯入流程 bundle | SPEC-FLOW-001.feature:L202 |
| AC-17 | 匯入衝突處理 | SPEC-FLOW-001.feature:L208 |
| AC-17 | Bundle 驗證 | SPEC-FLOW-001.feature:L214 |

## AC → TDD Test Mapping

| AC | Test File | Test Description |
|----|-----------|------------------|
| AC-1 | flow-parser.test.js | should parse valid Flow YAML with id and stages |
| AC-1 | flow-parser.test.js | should report missing required fields |
| AC-1 | flow-parser.test.js | should report missing stages field |
| AC-1 | condition-evaluator.test.js | should evaluate named condition (6 tests) |
| AC-1 | condition-evaluator.test.js | should evaluate property match (5 tests) |
| AC-2 | flow-parser.test.js | should report error when referencing non-existent command |
| AC-4 | flow-inheritance.test.js | should inherit all stages from base flow |
| AC-5 | flow-inheritance.test.js | should add steps via add_steps |
| AC-5 | flow-inheritance.test.js | should override gate threshold |
| AC-5 | flow-inheritance.test.js | should insert new stage after specified stage |
| AC-5 | flow-inheritance.test.js | should remove steps via remove_steps |
| AC-6 | flow-inheritance.test.js | should resolve multi-level inheritance chain |
| AC-6 | flow-inheritance.test.js | should enforce maximum inheritance depth |
| AC-7 | gate-loader.test.js | should load external gate definition via ref |
| AC-7 | gate-loader.test.js | should execute inline gate definition |
| AC-8 | gate-loader.test.js | should block stage transition when blocking gate fails |
| AC-8 | gate-loader.test.js | should warn but allow continue when warning gate fails |
| AC-8 | gate-loader.test.js | should timeout gate after configured duration |
| AC-8 | gate-loader.test.js | should use default timeout of 30 seconds |
| AC-8 | gate-loader.test.js | should cap timeout at 600 seconds maximum |
| AC-9 | gate-loader.test.js | should prevent removal of gate marked removable: false |
| AC-10 | flow-engine.test.js | should save state when transitioning to next stage |
| AC-10 | flow-engine.test.js | should offer to resume interrupted flow |
| AC-10 | flow-engine.test.js | should warn when flow state is older than 7 days |
| AC-11 | flow-engine.test.js | should produce state file compatible with workflow-state-protocol |
| AC-12 | flow-cli.test.js | should create flow YAML via interactive prompts |
| AC-13 | flow-cli.test.js | should list built-in and custom flows with labels |
| AC-14 | flow-cli.test.js | should report all errors for invalid flow |
| AC-14 | flow-cli.test.js | should report success for valid flow |
| AC-15 | flow-cli.test.js | should show added, removed, and modified differences |
| AC-16 | flow-bundler.test.js | should export flow with referenced gates |
| AC-16 | flow-bundler.test.js | should export flow without gates when no refs |
| AC-17 | flow-bundler.test.js | should import bundle to .uds/ directories |
| AC-17 | flow-bundler.test.js | should not overwrite without --force |
| AC-17 | flow-bundler.test.js | should overwrite with --force |
| AC-17 | flow-bundler.test.js | should report error for non-existent base flow |

## Coverage Summary

| AC | BDD Scenarios | TDD Tests | Status |
|----|:---:|:---:|:---:|
| AC-1 | 4 | 9 | Covered |
| AC-2 | 1 | 1 | Covered |
| AC-3 | 4 | 0 | BDD only (validation tests) |
| AC-4 | 1 | 1 | Covered |
| AC-5 | 4 | 4 | Covered |
| AC-6 | 1 | 2 | Covered |
| AC-7 | 2 | 2 | Covered |
| AC-8 | 2 | 5 | Covered |
| AC-9 | 1 | 1 | Covered |
| AC-10 | 3 | 3 | Covered |
| AC-11 | 1 | 1 | Covered |
| AC-12 | 1 | 1 | Covered |
| AC-13 | 1 | 1 | Covered |
| AC-14 | 1 | 2 | Covered |
| AC-15 | 1 | 1 | Covered |
| AC-16 | 1 | 2 | Covered |
| AC-17 | 3 | 4 | Covered |
| **Total** | **31** | **40** | **17/17 AC covered** |
