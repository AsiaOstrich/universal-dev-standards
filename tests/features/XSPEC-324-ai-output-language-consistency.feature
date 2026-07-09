# [Source: dev-platform/cross-project/specs/XSPEC-324-ai-output-language-consistency.md]
# [Generated] BDD scenarios for AI output cross-conversation language/format consistency

@XSPEC-324
Feature: AI 輸出跨對話語言與格式一致性強化
  As a 長期與 AI 助手協作、維護 UDS 生態系的開發者
  I want AI 產出的檔案、commit message、對話回覆維持語言與格式一致
  So that 我不必事後發現語言跑掉或格式漂移才要求重寫

  # --- R1: self-review-protocol 新增「語言與術語一致性」檢查類別 ---

  @XSPEC-324 @AC-1
  Scenario: 偵測非目標語言字元混入已審查文件
    # [Source: XSPEC-324:R1:AC-1(a)]
    Given 一份符合 self-review-protocol 既有觸發條件的 markdown 檔案（修改 >50 行）
    And 該檔案內某段落混入日文假名（U+3040–U+30FF）或韓文諺文（U+AC00–U+D7A3）字元
    When AI 依 procedure.step_2 執行第 7 類 language_consistency 檢查
    Then 該處不一致 SHALL 被標記為待修正項目

  @XSPEC-324 @AC-1
  Scenario: 偵測同段落中英文夾雜違反雙語分段慣例
    # [Source: XSPEC-324:R1:AC-1(b)]
    Given 一份符合觸發條件的 markdown 檔案
    And 同一段落內同時出現中文與英文語句（未依既有雙語分段慣例分開）
    When 第 7 類檢查執行
    Then 該段落 SHALL 被標記為待修正項目

  @XSPEC-324 @AC-1
  Scenario: 偵測文件內慣用術語寫法不一致
    # [Source: XSPEC-324:R1:AC-1(c)]
    Given 一份符合觸發條件的 markdown 檔案
    And 同一份文件內「XSPEC」「DEC」「gate」「pipeline」等慣用術語出現不同寫法
    When 第 7 類檢查執行
    Then 該不一致 SHALL 被標記為待修正項目

  @XSPEC-324 @AC-1
  Scenario: 既有觸發範圍不因新增檢查類別而擴大
    # [Source: XSPEC-324:R1 note — 不新增觸發面]
    Given self-review-protocol 的 trigger_conditions（>50 行 markdown diff）維持不變
    When 第 7 類檢查加入 inconsistency_categories
    Then trigger_conditions 的內容 SHALL 與新增前逐位元相同

  # --- R2: UDS 自身 commitlint 新增 bilingual 格式規則 ---

  @XSPEC-324 @AC-2
  Scenario: 接受合規的雙語 commit message
    # [Source: XSPEC-324:R2:AC-2 — compliant case] [TODO: 需人工實作 commitlint custom rule]
    Given 一則 commit header 為「英文主旨. 中文主旨.」格式
    And body 依序包含英文段落與中文段落
    When commitlint 依新規則執行檢查
    Then 該 commit SHALL 通過檢查

  @XSPEC-324 @AC-2
  Scenario: 拒絕缺少中文 body 段落的 commit
    # [Source: XSPEC-324:R2:AC-2 — missing-chinese-body case] [TODO: 需人工實作 commitlint custom rule]
    Given 一則 commit header 符合雙語格式
    But body 僅有英文段落，無中文段落
    When commitlint 依新規則執行檢查
    Then 該 commit SHALL 被拒絕並回報缺少中文 body

  @XSPEC-324 @AC-2
  Scenario: 拒絕同段落中英夾雜的 commit body
    # [Source: XSPEC-324:R2:AC-2 — mixed-language-paragraph case] [TODO: 需人工實作 commitlint custom rule]
    Given 一則 commit body 中某段落同時包含中文與英文語句
    When commitlint 依新規則執行檢查
    Then 該 commit SHALL 被拒絕並回報語言混雜

  @XSPEC-324 @AC-3
  Scenario: 自動化 commit 不受新規則阻擋
    # [Source: XSPEC-324:R2:AC-3] [TODO: 需人工實作例外清單]
    Given 一則由 dependabot 或既有自動化流程產生的純英文 commit
    When commitlint 依新規則執行檢查
    Then 該 commit SHALL 不被阻擋（fail-open 例外清單生效）

  # --- R3: bilingual 選項新增「長對話語言漂移自我核對」行為規則 ---

  @XSPEC-324 @AC-4
  Scenario: 處理大量非目標語言內容後主動核對語言
    # [Source: XSPEC-324:R3:AC-4]
    Given 一個採用 UDS bilingual 選項的 AI 助手正在長對話中
    And 助手剛處理大量非目標語言內容（程式碼、英文文件）
    When 助手準備切換回面向使用者的說明文字
    Then 助手 SHALL 主動確認接下來文字使用目標語言，不需使用者提醒

  @XSPEC-324 @AC-4
  Scenario: 使用者指出語言跑掉後立即修正
    # [Source: XSPEC-324:R3:AC-4]
    Given 使用者已明確指出 AI 助手的回覆語言跑掉
    When 助手收到此回饋
    Then 助手 SHALL 立即修正
    And 助手 SHALL NOT 重複道歉拖延

  @XSPEC-324 @AC-4
  Scenario: 新規則格式與既有 bilingual 選項結構一致
    # [Source: XSPEC-324:R3:AC-4 — format consistency]
    Given bilingual.ai.yaml 既有 rules 與 anti_patterns 章節格式
    When 新增「長對話語言漂移自我核對」規則
    Then 新規則 SHALL 遵循既有欄位結構（id/trigger/instruction/priority）
    And SHALL 附帶 good/bad example，與既有 anti_patterns 慣例一致

  # --- 綜合驗證：本次變更自身的一致性 ---

  @XSPEC-324 @AC-5
  Scenario: 對本次 XSPEC-324 變更檔案跑一次含第 7 類的 self-review
    # [Source: XSPEC-324:AC-5]
    Given self-review-protocol.ai.yaml、bilingual.ai.yaml、commitlint.config.js 等三項變更已完成
    When AI 對這些變更檔案執行含新第 7 類別的 self-review-protocol
    Then SHALL 回報 0 項交叉引用不一致（或已在同一 commit 內修正）
