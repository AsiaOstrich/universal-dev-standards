# [Source: docs/specs/SPEC-LAYERED-001-layered-claudemd.md]
# [Generated] BDD scenarios for layered CLAUDE.md context-aware loading

@SPEC-LAYERED-001
Feature: 分層 CLAUDE.md — Context-aware Loading
  As a developer using UDS in a large project
  I want layered CLAUDE.md files in subdirectories
  So that only relevant standards are loaded, reducing context token consumption by 80-90%

  # --- REQ-1: 標準→目錄映射 ---

  @SPEC-LAYERED-001 @AC-1
  Scenario: 資料庫標準映射到 database 目錄
    # [Source: SPEC-LAYERED-001:REQ-1:AC-1]
    Given a project with a "src/database/" directory
    When directory-mapper scans the project structure
    Then "database-standards" SHALL be mapped to "src/database/"

  @SPEC-LAYERED-001 @AC-2
  Scenario: 測試標準映射到 tests 目錄
    # [Source: SPEC-LAYERED-001:REQ-1:AC-2]
    Given a project with a "tests/" directory
    When directory-mapper scans the project structure
    Then testing-related standards SHALL be mapped to "tests/"

  @SPEC-LAYERED-001 @AC-1
  Scenario: API 標準映射到 api 目錄
    # [Derived: SPEC-LAYERED-001:REQ-1]
    Given a project with a "src/api/" directory
    When directory-mapper scans the project structure
    Then "api-design-standards" SHALL be mapped to "src/api/"

  @SPEC-LAYERED-001 @AC-3
  Scenario: 無匹配目錄的標準歸入根目錄
    # [Source: SPEC-LAYERED-001:REQ-1]
    Given a standard with no matching subdirectory
    When directory-mapper completes scanning
    Then that standard SHALL be assigned to the root CLAUDE.md

  # --- REQ-2: 分層 CLAUDE.md 生成 ---

  @SPEC-LAYERED-001 @AC-1 @AC-2
  Scenario: 子目錄 CLAUDE.md 包含 domain 標準全文
    # [Source: SPEC-LAYERED-001:REQ-2:AC-1,AC-2]
    Given directory-mapper has completed mapping
    When layered generation runs
    Then each matched subdirectory SHALL have a CLAUDE.md with domain-specific standards

  @SPEC-LAYERED-001 @AC-3
  Scenario: 根目錄 CLAUDE.md 只含摘要
    # [Source: SPEC-LAYERED-001:REQ-2:AC-3]
    Given layered mode is active
    When generating the root CLAUDE.md
    Then it SHALL contain only always-on standards summary
    And it SHALL NOT contain domain-specific full text

  @SPEC-LAYERED-001 @AC-1
  Scenario: UDS 標記區塊隔離
    # [Source: SPEC-LAYERED-001:REQ-2]
    Given a generated subdirectory CLAUDE.md
    When inspecting its content
    Then UDS-generated content SHALL be wrapped in UDS:STANDARDS:BEGIN/END markers

  # --- REQ-3: Init --content-layout ---

  @SPEC-LAYERED-001 @AC-1
  Scenario: layered 模式初始化
    # [Source: SPEC-LAYERED-001:REQ-3:AC-1]
    Given a project with subdirectories
    When I run "uds init --content-layout layered -y"
    Then subdirectory CLAUDE.md files SHALL be generated

  @SPEC-LAYERED-001 @AC-5
  Scenario: flat 模式為預設
    # [Source: SPEC-LAYERED-001:REQ-3:AC-5]
    Given a project
    When I run "uds init -y" without --content-layout
    Then only a single root CLAUDE.md SHALL be generated

  @SPEC-LAYERED-001 @AC-5
  Scenario: 無子目錄 fallback 到 flat 模式
    # [Source: SPEC-LAYERED-001:REQ-3:AC-5]
    Given a project with no matchable subdirectories
    When I run "uds init --content-layout layered -y"
    Then it SHALL fallback to flat mode
    And output a notice message

  # --- REQ-4: Update 保留自訂內容 ---

  @SPEC-LAYERED-001 @AC-4
  Scenario: update 不覆蓋自訂內容
    # [Source: SPEC-LAYERED-001:REQ-4:AC-4]
    Given user has added custom content outside UDS markers in "tests/CLAUDE.md"
    When I run "uds update"
    Then content inside UDS markers SHALL be updated
    And content outside UDS markers SHALL be preserved

  @SPEC-LAYERED-001 @AC-4
  Scenario: 新增子目錄時追加 CLAUDE.md
    # [Source: SPEC-LAYERED-001:REQ-4]
    Given user added a new "src/api/" directory after initial setup
    When I run "uds update"
    Then a new CLAUDE.md SHALL be generated in "src/api/"
