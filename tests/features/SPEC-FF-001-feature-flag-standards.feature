# [Source: docs/specs/SPEC-FF-001-feature-flag-standards.md]
# [Generated] BDD scenarios for feature flag standards content verification

@SPEC-FF-001
Feature: Feature Flag Management Standards
  As a developer
  I want a comprehensive feature flag management standard
  So that flags are properly typed, named, lifecycle-managed, audited, and tested

  # --- REQ-1: Feature Flag 類型分類 ---

  @SPEC-FF-001 @AC-1
  Scenario: Standard defines 4 flag types
    # [Source: SPEC-FF-001:REQ-1:AC-1]
    Given the feature-flag-standards.md standard exists
    When I read the "Flag Types" section
    Then it SHALL define 4 flag types:
      | Type       | Purpose                              | Expected Lifespan |
      | Release    | 控制未完成功能的可見性               | 短期（1-4 週）    |
      | Experiment | A/B 測試和功能實驗                   | 中期（2-8 週）    |
      | Ops        | 運維開關（降級、熔斷）               | 長期或永久        |
      | Permission | 基於角色/用戶的功能存取              | 長期              |

  @SPEC-FF-001 @AC-1
  Scenario: Each flag type has management strategy
    # [Source: SPEC-FF-001:REQ-1:AC-1]
    Given the feature-flag-standards.md standard exists
    When I read the type definitions
    Then each type SHALL have a defined management strategy
    And Release flags SHALL be removed immediately after feature launch
    And Experiment flags SHALL be removed after experiment ends

  # --- REQ-2: Flag 命名慣例 ---

  @SPEC-FF-001 @AC-2
  Scenario: Naming convention follows type_feature_context pattern
    # [Source: SPEC-FF-001:REQ-2:AC-2]
    Given the feature-flag-standards.md standard exists
    When I read the "Naming Conventions" section
    Then it SHALL define the pattern: <type>_<feature>_<context>
    And it SHALL provide positive examples:
      | Example                          |
      | release_new_checkout_flow        |
      | experiment_pricing_page_v2       |
      | ops_payment_circuit_breaker      |
      | permission_admin_dashboard       |

  @SPEC-FF-001 @AC-2
  Scenario: Naming convention includes negative examples
    # [Source: SPEC-FF-001:REQ-2:AC-2]
    Given the feature-flag-standards.md standard exists
    When I read the "Naming Conventions" section
    Then it SHALL provide negative examples:
      | Bad Example      | Reason         |
      | flag1            | 無意義         |
      | new_feature      | 太模糊         |
      | test_thing_temp  | 未遵循格式     |

  # --- REQ-3: Flag 生命週期管理 ---

  @SPEC-FF-001 @AC-3
  Scenario: Lifecycle defines 6 stages
    # [Source: SPEC-FF-001:REQ-3:AC-3]
    Given the feature-flag-standards.md standard exists
    When I read the "Lifecycle Management" section
    Then it SHALL define 6 lifecycle stages:
      | Stage     | Description                              |
      | Created   | Flag 建立，預設關閉                       |
      | Active    | Flag 在部分或全部環境啟用                 |
      | Validated | 功能驗證完成，決定保留或移除              |
      | Cleanup   | 移除 Flag 程式碼和配置                    |
      | Removed   | Flag 完全清除                             |
      | Expired   | 超過 TTL 但未處理，轉為技術債             |

  @SPEC-FF-001 @AC-3
  Scenario: Lifecycle flow from Created to Removed
    # [Source: SPEC-FF-001:REQ-3:AC-3]
    Given the feature-flag-standards.md standard exists
    When I read the lifecycle flow diagram
    Then it SHALL show the progression: Created → Active → Validated → Cleanup → Removed
    And it SHALL show Expired as a branch from TTL exceeded

  # --- REQ-3: TTL 定義 ---

  @SPEC-FF-001 @AC-4
  Scenario: TTL defined for each flag type
    # [Source: SPEC-FF-001:REQ-3:AC-4]
    Given the feature-flag-standards.md standard exists
    When I read the "TTL" subsection
    Then it SHALL define default and maximum TTL per type:
      | Type       | Default TTL | Max TTL |
      | Release    | 2 週        | 4 週    |
      | Experiment | 4 週        | 8 週    |
      | Ops        | 無限        | —       |
      | Permission | 無限        | —       |
    And it SHALL define actions when TTL is exceeded

  # --- REQ-4: Flag 審計流程 ---

  @SPEC-FF-001 @AC-5
  Scenario: Quarterly audit has 4 check dimensions
    # [Source: SPEC-FF-001:REQ-4:AC-5]
    Given the feature-flag-standards.md standard exists
    When I read the "Audit Process" section
    Then it SHALL define 4 audit check dimensions:
      | Dimension    | Question                         |
      | 存活時間     | 是否超過 TTL？                   |
      | 使用狀態     | 是否在所有環境都啟用？           |
      | 程式碼參考   | 有多少程式碼位置引用？           |
      | 測試影響     | 是否導致測試複雜度增加？         |

  @SPEC-FF-001 @AC-5
  Scenario: Audit report format defined
    # [Source: SPEC-FF-001:REQ-4:AC-5]
    Given the feature-flag-standards.md standard exists
    When I read the "Audit Report" subsection
    Then it SHALL define report contents including:
      | Report Element                  |
      | Flag 總數（按類型和狀態分組）   |
      | 過期 Flag 清單                  |
      | 本季清理的 Flag 數              |
      | Flag 趨勢（增減）              |

  # --- REQ-5: Flag 腐化偵測 ---

  @SPEC-FF-001 @AC-6
  Scenario: Decay detection triggers automatic actions
    # [Source: SPEC-FF-001:REQ-5:AC-6]
    Given a flag has exceeded its TTL
    When the system performs decay detection
    Then it SHALL execute the following actions:
      | Step | Action                                  |
      | 1    | 標記 Flag 為 Expired                    |
      | 2    | 在技術債登記簿中建立條目                |
      | 3    | 通知 Flag Owner                         |
      | 4    | 在下次 Sprint Planning 中提醒           |

  @SPEC-FF-001 @AC-7
  Scenario: Cleanup checklist has 5 steps
    # [Source: SPEC-FF-001:REQ-5:AC-7]
    Given a flag is decided to be cleaned up
    When the developer follows the cleanup checklist
    Then it SHALL contain 5 steps:
      | Step | Action                                    |
      | 1    | 移除所有 Flag 判斷程式碼（保留啟用分支） |
      | 2    | 移除 Flag 配置/定義                      |
      | 3    | 更新相關測試（移除 Flag 變體測試）       |
      | 4    | 更新文件（如有提及 Flag）                |
      | 5    | 驗證所有環境正常                         |

  # --- REQ-6: Flag 測試策略 ---

  @SPEC-FF-001 @AC-8
  Scenario: Testing strategy defines 4 principles
    # [Source: SPEC-FF-001:REQ-6:AC-8]
    Given the feature-flag-standards.md standard exists
    When I read the "Testing Strategy" section
    Then it SHALL define 4 testing principles:
      | Principle      | Description                                  |
      | 測試兩種狀態   | Flag on 和 off 都需要測試                     |
      | 避免組合爆炸   | 不需測試所有 Flag 組合；只測直接影響的 Flag    |
      | 預設值測試     | 確保 Flag 關閉時的行為正確（安全降級）        |
      | 環境隔離       | 測試環境的 Flag 狀態不受生產影響              |
