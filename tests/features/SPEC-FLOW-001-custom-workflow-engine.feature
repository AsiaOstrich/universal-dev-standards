# Generated from: docs/specs/SPEC-FLOW-001-custom-workflow-engine.md
# Generator: /derive bdd
# Generated at: 2026-04-02
# AC Coverage: AC-1 through AC-17

@SPEC-FLOW-001
Feature: 自訂 SDLC 流程引擎
  [Source] UDS 使用者能以 YAML 定義自訂開發流程，
  將 48+ 個命令/活動作為積木自由編排，
  透過繼承預設流程和可插拔閘門保障品質底線。

  # ============================================================
  # REQ-1: Flow YAML Schema
  # ============================================================

  @AC-1 @REQ-1 @happy-path
  Scenario: 解析合法的 Flow YAML
    # [Source] SPEC-FLOW-001 REQ-1 Scenario 1
    Given 使用者在 ".uds/flows/" 建立 "my-flow.flow.yaml" 包含合法的 id 和 stages 結構
    When Flow Engine 載入該檔案
    Then 成功解析並回傳 Flow 物件，包含所有 stages、steps 和 gates

  @AC-1 @REQ-1 @error-handling
  Scenario: 驗證 Flow YAML 必填欄位
    # [Source] SPEC-FLOW-001 REQ-1 Scenario 2
    Given Flow YAML 缺少 "id" 必填欄位
    When Flow Engine 嘗試載入
    Then 回報具體缺少的欄位名稱和位置

  @AC-2 @REQ-1 @error-handling
  Scenario: 驗證命令引用
    # [Source] SPEC-FLOW-001 REQ-1 Scenario 3
    Given Flow YAML 中 step 引用 "command: /nonexistent"
    When Flow Engine 驗證
    Then 回報「命令 /nonexistent 不存在」並列出可用命令清單

  @AC-1 @REQ-1 @condition
  Scenario: 支援命名條件
    # [Source] SPEC-FLOW-001 REQ-1 Scenario 4
    Given step 定義 "when: scope_includes_api" 命名條件
    When 當前變更不涉及 API
    Then 該 step 被標記為 skipped，不影響流程進行

  @AC-1 @REQ-1 @condition
  Scenario: 支援屬性比對條件
    # [Source] SPEC-FLOW-001 REQ-1 Scenario 5
    Given step 定義 when 為屬性比對物件 scope "includes api" 和 files_changed "**/*.controller.js"
    When 當前變更不符合任一條件
    Then 該 step 被標記為 skipped，不影響流程進行

  # ============================================================
  # REQ-2: 預設流程轉換
  # ============================================================

  @AC-3 @REQ-2 @built-in
  Scenario: SDD 流程轉換
    # [Source] SPEC-FLOW-001 REQ-2 Scenario 1
    Given SDD 流程定義為 Discuss、Proposal、Review、Implementation、Verification、Archive 六個階段
    When 以 Flow YAML 格式表達
    Then 產生的 "sdd.flow.yaml" 包含 6 個 stages，每個 stage 的 steps 和 gates 與現行行為一致

  @AC-3 @REQ-2 @built-in
  Scenario: TDD 循環流程
    # [Source] SPEC-FLOW-001 REQ-2 Scenario 2
    Given TDD 流程定義為 Red、Green、Refactor 三個階段且可循環
    When 以 Flow YAML 格式表達
    Then 正確表達循環特性，refactor stage 完成後可選擇回到 red 或結束

  @AC-3 @REQ-2 @built-in
  Scenario: BDD 流程轉換
    # [Source] SPEC-FLOW-001 REQ-2 Scenario 3
    Given BDD 流程定義為 Discovery、Formulation、Automation、Living Docs 四個階段
    When 以 Flow YAML 格式表達
    Then 每個 phase 包含對應的 checklist items 作為 gate 條件

  @AC-3 @REQ-2 @built-in
  Scenario: 內建流程可被列出
    # [Source] SPEC-FLOW-001 REQ-2 Scenario 4
    Given 系統啟動
    When 查詢可用流程
    Then SDD、TDD、BDD 顯示為 "[built-in]"，且可被 extends 引用

  # ============================================================
  # REQ-3: Flow Inheritance
  # ============================================================

  @AC-4 @REQ-3 @inheritance
  Scenario: 繼承預設流程
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 1
    Given 自訂流程 YAML 包含 "extends: sdd"
    When Flow Engine 解析
    Then 繼承 SDD 的所有 stages、steps 和 gates

  @AC-5 @REQ-3 @inheritance
  Scenario: 覆寫 stage 的 steps
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 2
    Given 繼承流程使用 overrides 在 "derive" stage 新增 "/security" step
    When Flow Engine 合併
    Then "derive" stage 包含原有的 steps 加上新增的 "/security"

  @AC-5 @REQ-3 @inheritance
  Scenario: 覆寫 gate 閾值
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 3
    Given 繼承流程使用 overrides 將 coverage gate threshold 從 80 改為 90
    When 執行到該 gate
    Then 使用覆寫後的 threshold 90 進行檢查

  @AC-5 @REQ-3 @inheritance
  Scenario: 插入新 stage
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 4
    Given 使用 insert 在 "design" stage 之後插入 "security-review" stage
    When Flow Engine 組裝最終流程
    Then "security-review" stage 出現在 "design" 之後、下一個原始 stage 之前

  @AC-5 @REQ-3 @inheritance
  Scenario: 移除步驟
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 5
    Given 使用 remove_steps 移除 "/pr" 命令
    When Flow Engine 組裝
    Then "/pr" 不出現在任何 stage 的 steps 中

  @AC-6 @REQ-3 @inheritance
  Scenario: 多層繼承
    # [Source] SPEC-FLOW-001 REQ-3 Scenario 6
    Given 組織流程 "extends: sdd"，團隊流程 "extends: org-flow"
    When Flow Engine 解析團隊流程
    Then 最終流程為 SDD、組織覆寫、團隊覆寫的合併結果

  # ============================================================
  # REQ-4: 可插拔品質閘門
  # ============================================================

  @AC-7 @REQ-4 @gate
  Scenario: 定義獨立閘門
    # [Source] SPEC-FLOW-001 REQ-4 Scenario 1
    Given 使用者建立 ".uds/gates/security-gate.gate.yaml" 定義 checks 和 on_failure
    When 流程中以 "ref: security-gate" 引用
    Then 閘門邏輯被正確載入並在該 stage 結束時執行

  @AC-8 @REQ-4 @gate
  Scenario: Blocking 閘門阻止進行
    # [Source] SPEC-FLOW-001 REQ-4 Scenario 2
    Given 閘門 type 為 "blocking"，檢查未通過
    When 嘗試進入下一個 stage
    Then 阻止轉換，顯示失敗原因和 on_failure.suggest 中的建議命令

  @AC-8 @REQ-4 @gate
  Scenario: Warning 閘門允許繼續
    # [Source] SPEC-FLOW-001 REQ-4 Scenario 3
    Given 閘門 type 為 "warning"，檢查未通過
    When 嘗試進入下一個 stage
    Then 顯示警告訊息，詢問使用者是否繼續

  @AC-7 @REQ-4 @gate
  Scenario: 行內閘門定義
    # [Source] SPEC-FLOW-001 REQ-4 Scenario 4
    Given 流程中直接定義 "type: inline" 閘門
    When 執行到該 gate
    Then 正確執行行內定義的檢查邏輯

  @AC-9 @REQ-4 @gate
  Scenario: 不可移除閘門
    # [Source] SPEC-FLOW-001 REQ-4 Scenario 5
    Given 閘門定義 "removable: false"
    When 繼承流程嘗試移除該閘門
    Then 驗證失敗並回報「此閘門為強制要求，不可移除」

  # ============================================================
  # REQ-5: Flow 狀態持久化
  # ============================================================

  @AC-10 @REQ-5 @state
  Scenario: 自動儲存狀態
    # [Source] SPEC-FLOW-001 REQ-5 Scenario 1
    Given 使用者完成一個 stage
    When 進入下一個 stage
    Then 狀態檔案 ".workflow-state/flow-{id}.yaml" 更新 current_phase 和 phases_completed

  @AC-10 @REQ-5 @state
  Scenario: 恢復中斷的流程
    # [Source] SPEC-FLOW-001 REQ-5 Scenario 2
    Given 上次 session 中斷在 "design" stage
    When 使用者重新啟動流程
    Then 提示「偵測到未完成的流程，是否繼續？」

  @AC-10 @REQ-5 @state
  Scenario: 過期流程警告
    # [Source] SPEC-FLOW-001 REQ-5 Scenario 3
    Given 流程狀態超過 7 天未更新
    When 嘗試恢復
    Then 顯示「此流程已超過 7 天未更新」警告，允許使用者選擇繼續或放棄

  @AC-11 @REQ-5 @state
  Scenario: 狀態格式相容
    # [Source] SPEC-FLOW-001 REQ-5 Scenario 4
    Given Flow Engine 產生的狀態檔案
    When 與現有 workflow-state-protocol 比較
    Then 格式完全相容，包含 workflow、spec_id、current_phase、status、updated、phases_completed

  # ============================================================
  # REQ-6: Flow CLI 命令
  # ============================================================

  @AC-12 @REQ-6 @cli
  Scenario: 互動式建立流程
    # [Source] SPEC-FLOW-001 REQ-6 Scenario 1
    Given 執行 "uds flow create"
    When 進入互動模式
    Then 引導使用者選擇 base flow、新增排序 stages、設定 gates，最終產生 ".uds/flows/{name}.flow.yaml"

  @AC-13 @REQ-6 @cli
  Scenario: 列出可用流程
    # [Source] SPEC-FLOW-001 REQ-6 Scenario 2
    Given 執行 "uds flow list"
    When 專案有內建和自訂流程
    Then 列出所有流程，標注 "[built-in]" 或 "[custom]"，顯示 stages 數量和 extends 來源

  @AC-14 @REQ-6 @cli
  Scenario: 驗證流程
    # [Source] SPEC-FLOW-001 REQ-6 Scenario 3
    Given 執行 "uds flow validate my-flow"
    When 流程定義有邏輯問題
    Then 回報所有錯誤和警告，附修正建議

  @AC-15 @REQ-6 @cli
  Scenario: 比較兩個流程
    # [Source] SPEC-FLOW-001 REQ-6 Scenario 4
    Given 執行 "uds flow diff sdd my-flow"
    When 兩個流程有差異
    Then 顯示 stages、steps、gates 的新增、移除、修改清單

  # ============================================================
  # REQ-7: Flow Export / Import
  # ============================================================

  @AC-16 @REQ-7 @bundle
  Scenario: 匯出流程 bundle
    # [Source] SPEC-FLOW-001 REQ-7 Scenario 1
    Given 執行 "uds flow export my-flow -o my-flow.bundle.yaml"
    When 流程引用了外部 gate 定義
    Then 產生的 bundle 包含 flow 定義和所有被引用的 gate 定義，形成自包含的單一檔案

  @AC-17 @REQ-7 @bundle
  Scenario: 匯入流程 bundle
    # [Source] SPEC-FLOW-001 REQ-7 Scenario 2
    Given 執行 "uds flow import my-flow.bundle.yaml"
    When bundle 格式合法
    Then flow 安裝至 ".uds/flows/"，gates 安裝至 ".uds/gates/"，且不覆寫已存在的同名檔案

  @AC-17 @REQ-7 @bundle
  Scenario: 匯入衝突處理
    # [Source] SPEC-FLOW-001 REQ-7 Scenario 3
    Given 執行 "uds flow import" 且 ".uds/flows/" 已有同名流程
    When 未使用 "--force" flag
    Then 提示衝突並詢問使用者是否覆寫、重新命名或取消

  @AC-17 @REQ-7 @bundle
  Scenario: Bundle 驗證
    # [Source] SPEC-FLOW-001 REQ-7 Scenario 4
    Given 匯入一個 bundle
    When bundle 中的 flow 使用 extends 引用不存在的 base flow
    Then 回報錯誤「base flow 不存在，請先安裝」
