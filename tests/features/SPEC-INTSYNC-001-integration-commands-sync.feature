# [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md]
# [Derived from Draft]
# [Generated] BDD Feature - AI 工具整合命令對齊檢查

@SPEC-INTSYNC-001
Feature: AI 工具整合命令對齊檢查
  As a UDS maintainer
  I want integration files to be automatically checked for command coverage
  So that AI tool integrations stay aligned when new commands are added

  Background:
    Given the project root contains "skills/commands/" directory
    And the project root contains "integrations/REGISTRY.json"

  @AC-1
  Scenario: COMMAND-INDEX.json 包含所有已登記的 commands
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-1]
    Given "skills/commands/" contains 48 command markdown files
    And the excluded files are "README.md", "COMMAND-FAMILY-OVERVIEW.md", "guide.md"
    When "COMMAND-INDEX.json" is created and validated
    Then all non-excluded commands should be registered in the index
    And each command should belong to exactly one category

  @AC-2
  Scenario: REGISTRY.json tier 定義包含正確的 requiredCategories
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-2]
    Given REGISTRY.json has been extended with "requiredCategories" field
    When reading the "complete" tier definition
    Then "requiredCategories" should contain all defined categories
    When reading the "partial" tier definition
    Then "requiredCategories" should contain only "core"
    When reading the "minimal" tier definition
    Then "requiredCategories" should be an empty array
    When reading the "preview" tier definition
    Then "requiredCategories" should be an empty array

  @AC-3
  Scenario: Complete tier 工具缺少 command 引用時報錯
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-3]
    Given a complete tier agent "opencode" has integration files
    And the integration file does not mention command "observability"
    When running "check-integration-commands-sync.sh"
    Then the script should report missing command "observability" for "opencode"
    And the exit code should be non-zero

  @AC-4
  Scenario: Partial tier 工具不檢查非 core category commands
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-4]
    Given a partial tier agent "cline" has integration files
    And the integration file mentions all "core" category commands
    But the integration file does not mention "observability" from "ops" category
    When running "check-integration-commands-sync.sh"
    Then "cline" should pass the check without errors

  @AC-5
  Scenario: 偵測未登記的 command 檔案
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-5]
    Given "skills/commands/" contains a file "new-unregistered.md"
    And "new-unregistered" is not listed in "COMMAND-INDEX.json"
    When running "check-integration-commands-sync.sh"
    Then the script should report "Unregistered command: new-unregistered"

  @AC-6
  Scenario: Pre-release 流程中 Step 7.5 正確執行
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-6]
    Given "pre-release-check.sh" has been updated with Step 7.5
    When running the pre-release check sequence
    Then Step 7.5 should execute after Step 7 "AI Agent sync"
    And Step 7.5 should execute before Step 8 "Usage docs sync"
    And Step 7.5 should run "check-integration-commands-sync.sh"

  @AC-7
  Scenario: 腳本在 macOS/Linux 上正確運作
    # [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md:AC-7]
    Given the execution environment is macOS or Linux
    When running "check-integration-commands-sync.sh" with bash
    Then the script should complete without errors
    And the output format should match other check scripts (colored, with pass/fail indicators)
