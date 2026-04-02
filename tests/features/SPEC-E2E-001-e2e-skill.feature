# [Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md]
# [Generated] BDD scenarios for /e2e Skill
# Generator: /derive bdd
# Generated at: 2026-04-02
# AC Coverage: AC-1 through AC-17

@SPEC-E2E-001
Feature: /e2e 斜線命令 — 從 BDD 場景生成 E2E 測試骨架
  [Source] 補完 UDS 測試金字塔的 E2E 層引導。
  從 BDD .feature 場景或 SDD 規格出發，
  偵測專案的 E2E 框架、分析既有測試模式，
  並生成框架適配的 E2E 測試骨架。

  # ============================================================
  # REQ-1: AC 適用性分析
  # ============================================================

  @AC-1 @REQ-1 @happy-path
  Scenario: 篩選適合 E2E 的 AC
    # [Source] SPEC-E2E-001 REQ-1 Scenario 1
    Given 一個 ".feature" 檔案包含 10 個 Scenario
    When 執行 "/e2e --analyze <feature-file>"
    Then 系統將每個 Scenario 分類為 "e2e-suitable"、"unit-suitable" 或 "integration-suitable"
    And 輸出分類結果表格

  @AC-2 @REQ-1 @classification
  Scenario: 排除純邏輯型 AC
    # [Source] SPEC-E2E-001 REQ-1 Scenario 2
    Given 一個 Scenario 描述純計算邏輯（如排序演算法）
    When 系統進行 E2E 適用性分析
    Then 該 Scenario 被標記為 "unit-suitable"
    And 附帶原因說明

  @AC-3 @REQ-1 @classification
  Scenario: 識別使用者流程型 AC
    # [Source] SPEC-E2E-001 REQ-1 Scenario 3
    Given 一個 Scenario 描述跨多步驟的使用者操作流程
    When 系統進行 E2E 適用性分析
    Then 該 Scenario 被標記為 "e2e-suitable"

  @AC-4 @REQ-1 @error-handling
  Scenario: 空 feature 檔案
    # [Source] SPEC-E2E-001 REQ-1 Scenario 4
    Given 一個 ".feature" 檔案不包含任何 Scenario
    When 執行 "/e2e --analyze <feature-file>"
    Then 系統輸出提示「此 feature 檔案不包含可分析的 Scenario」
    And 不產生分類結果

  @AC-5 @REQ-1 @error-handling
  Scenario: feature 檔案不存在
    # [Source] SPEC-E2E-001 REQ-1 Scenario 5
    Given 指定的 ".feature" 檔案路徑不存在
    When 執行 "/e2e <non-existent-file>"
    Then 系統輸出錯誤訊息「找不到檔案：<path>」
    And 列出 "tests/features/" 下可用的 feature 檔案

  # ============================================================
  # REQ-2: E2E 框架偵測
  # ============================================================

  @AC-6 @REQ-2 @happy-path
  Scenario: 偵測 Playwright
    # [Source] SPEC-E2E-001 REQ-2 Scenario 1
    Given 專案的 "package.json" 包含 "@playwright/test" 依賴
    When 執行 "/e2e" 命令
    Then 系統偵測到 Playwright 並使用 Playwright 模板生成測試

  @AC-7 @REQ-2 @happy-path
  Scenario: 偵測 Cypress
    # [Source] SPEC-E2E-001 REQ-2 Scenario 2
    Given 專案的 "package.json" 包含 "cypress" 依賴且存在 "cypress.config.*"
    When 執行 "/e2e" 命令
    Then 系統偵測到 Cypress 並使用 Cypress 模板生成測試

  @AC-8 @REQ-2 @happy-path
  Scenario: 偵測 Vitest（CLI E2E 模式）
    # [Source] SPEC-E2E-001 REQ-2 Scenario 3
    Given 專案使用 Vitest 且有 "tests/e2e/" 目錄
    When 執行 "/e2e" 命令
    Then 系統偵測到 Vitest E2E 模式並使用 Vitest 模板生成測試

  @AC-9 @REQ-2 @error-handling
  Scenario: 無法偵測框架
    # [Source] SPEC-E2E-001 REQ-2 Scenario 4
    Given 專案沒有已知的 E2E 測試框架
    When 執行 "/e2e" 命令
    Then 系統提示使用者選擇框架
    And 列出支援的選項（Playwright、Cypress、Vitest）

  @AC-10 @REQ-2 @edge-case
  Scenario: 多框架並存
    # [Source] SPEC-E2E-001 REQ-2 Scenario 5
    Given 專案的 "package.json" 同時包含 "@playwright/test" 和 "cypress" 依賴
    When 執行 "/e2e" 命令
    Then 系統列出偵測到的所有框架
    And 提示使用者選擇要使用哪一個

  # ============================================================
  # REQ-3: 既有模式分析
  # ============================================================

  @AC-11 @REQ-3 @happy-path
  Scenario: 學習既有測試模式
    # [Source] SPEC-E2E-001 REQ-3 Scenario 1
    Given 專案有 3 個以上既有的 E2E 測試檔案
    When 執行 "/e2e" 命令
    Then 系統生成的測試使用相同的 import 來源和 helper 函式
    And 輸出模式摘要供使用者確認

  @AC-12 @REQ-3 @fallback
  Scenario: 無既有測試
    # [Source] SPEC-E2E-001 REQ-3 Scenario 2
    Given 專案的 E2E 測試目錄為空
    When 執行 "/e2e" 命令
    Then 系統使用框架的預設最佳實踐模板生成測試

  # ============================================================
  # REQ-4: E2E 測試骨架生成
  # ============================================================

  @AC-13 @REQ-4 @happy-path
  Scenario: 從 feature 檔案生成 E2E 骨架
    # [Source] SPEC-E2E-001 REQ-4 Scenario 1
    Given 一個 ".feature" 檔案且已完成 AC 篩選和框架偵測
    When 執行 "/e2e <feature-file>"
    Then 系統生成對應的 E2E 測試檔案
    And 每個 "e2e-suitable" 的 Scenario 對應一個 test case
    And test case 包含 "[TODO]" 標記指示需手動實作的部分
    And 追蹤標籤引用原始 Scenario（"@SPEC-XXX @AC-N"）

  @AC-14 @REQ-4 @delegation
  Scenario: 從 SDD 規格生成 E2E 骨架
    # [Source] SPEC-E2E-001 REQ-4 Scenario 2
    Given 一個 "SPEC-XXX.md" 規格檔案
    When 執行 "/e2e <spec-file>"
    Then 系統委派 "/derive e2e" 生成基礎骨架
    And 套用框架模板和既有模式進行後處理

  @AC-15 @REQ-4 @fixture
  Scenario: 生成包含 fixture 引導
    # [Source] SPEC-E2E-001 REQ-4 Scenario 3
    Given E2E 測試需要測試數據（如 DB seed、API mock）
    When 系統生成測試骨架
    Then 測試檔案包含 "beforeAll"/"beforeEach" 區塊
    And 附帶 "[TODO]" 標記提示需要準備的 fixture

  # ============================================================
  # REQ-5: 覆蓋差距分析
  # ============================================================

  @AC-16 @REQ-5 @happy-path
  Scenario: 掃描覆蓋差距
    # [Source] SPEC-E2E-001 REQ-5 Scenario 1
    Given 專案有多個 ".feature" 檔案和少數 ".e2e.test.*" 檔案
    When 執行 "/e2e --analyze"
    Then 系統輸出覆蓋報告包含有 E2E 覆蓋的 feature 數量
    And 包含缺少 E2E 覆蓋的 feature 清單
    And 包含建議的優先順序（依風險/複雜度）

  @AC-17 @REQ-5 @integration
  Scenario: 與 ac-coverage-assistant 整合
    # [Source] SPEC-E2E-001 REQ-5 Scenario 2
    Given 執行 "/e2e --analyze" 已產生覆蓋報告
    When 使用者希望更詳細的 AC 層級追蹤
    Then 系統建議執行 "/ac-coverage-assistant"
