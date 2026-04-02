# SPEC-E2E-001 ATDD Traceability Matrix

- **Status**: Draft

> [Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md]
> [Generated] AC ↔ BDD ↔ TDD 追蹤表

## AC → BDD Scenario 對應

| AC | 條件 | BDD Scenario | TDD Test File | Status |
|----|------|-------------|---------------|--------|
| AC-1 | 分類 AC 為 e2e/unit/integration-suitable | 篩選適合 E2E 的 AC | ac-suitability.test.js | [TODO] |
| AC-2 | 純邏輯型 AC 被排除 | 排除純邏輯型 AC | ac-suitability.test.js | [TODO] |
| AC-3 | 使用者流程型 AC 被識別 | 識別使用者流程型 AC | ac-suitability.test.js | [TODO] |
| AC-4 | 空 feature 輸出提示 | 空 feature 檔案 | ac-suitability.test.js | [TODO] |
| AC-5 | 不存在路徑輸出錯誤 | feature 檔案不存在 | ac-suitability.test.js | [TODO] |
| AC-6 | 偵測 Playwright | 偵測 Playwright | framework-detection.test.js | [TODO] |
| AC-7 | 偵測 Cypress | 偵測 Cypress | framework-detection.test.js | [TODO] |
| AC-8 | 偵測 Vitest E2E | 偵測 Vitest（CLI E2E 模式） | framework-detection.test.js | [TODO] |
| AC-9 | 無框架提示選擇 | 無法偵測框架 | framework-detection.test.js | [TODO] |
| AC-10 | 多框架提示選擇 | 多框架並存 | framework-detection.test.js | [TODO] |
| AC-11 | 分析編碼模式+輸出摘要 | 學習既有測試模式 | pattern-analysis.test.js | [TODO] |
| AC-12 | 無測試用預設模板 | 無既有測試 | pattern-analysis.test.js | [TODO] |
| AC-13 | 從 .feature 生成骨架 | 從 feature 檔案生成 E2E 骨架 | skeleton-generation.test.js | [TODO] |
| AC-14 | 從 SPEC 委派 /derive e2e | 從 SDD 規格生成 E2E 骨架 | skeleton-generation.test.js | [TODO] |
| AC-15 | 骨架含 fixture 引導 | 生成包含 fixture 引導 | skeleton-generation.test.js | [TODO] |
| AC-16 | --analyze 輸出覆蓋報告 | 掃描覆蓋差距 | coverage-analysis.test.js | [TODO] |
| AC-17 | 建議 /ac-coverage-assistant | 與 ac-coverage-assistant 整合 | coverage-analysis.test.js | [TODO] |

## 覆蓋統計

| 指標 | 數值 |
|------|------|
| AC 總數 | 17 |
| BDD Scenario 數 | 17 |
| TDD Test File 數 | 5 |
| TDD Test Case 數 | 17 |
| 覆蓋率 | 100% (17/17 AC) |

## 檔案索引

| 工件類型 | 路徑 |
|----------|------|
| Spec | `docs/specs/skills/SPEC-E2E-001-e2e-skill.md` |
| BDD Feature | `tests/features/SPEC-E2E-001-e2e-skill.feature` |
| TDD — REQ-1 | `cli/tests/unit/e2e-skill/ac-suitability.test.js` |
| TDD — REQ-2 | `cli/tests/unit/e2e-skill/framework-detection.test.js` |
| TDD — REQ-3 | `cli/tests/unit/e2e-skill/pattern-analysis.test.js` |
| TDD — REQ-4 | `cli/tests/unit/e2e-skill/skeleton-generation.test.js` |
| TDD — REQ-5 | `cli/tests/unit/e2e-skill/coverage-analysis.test.js` |
| ATDD | `docs/specs/skills/SPEC-E2E-001-atdd-traceability.md` (本文件) |
