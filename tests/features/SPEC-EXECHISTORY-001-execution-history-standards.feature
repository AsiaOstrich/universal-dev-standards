# [Source: specs/execution-history-spec.md]
# [Generated] BDD scenarios for execution-history standards content verification

@SPEC-EXECHISTORY-001
Feature: Execution History Repository Standards
  As an AI agent
  I want a structured execution history standard with tiered access
  So that past execution artifacts are preserved and efficiently retrievable

  # --- AC-1: AI 標準 YAML 可載入 ---

  @SPEC-EXECHISTORY-001 @AC-1
  Scenario: YAML standard file is parseable with correct identity
    # [Source: specs/execution-history-spec.md:AC-1]
    Given the file "ai/standards/execution-history.ai.yaml" exists
    When I parse it as YAML
    Then parsing SHALL succeed without errors
    And "standard.id" SHALL be "execution-history"
    And "standard.name" SHALL be "Execution History Repository Standards"

  # --- AC-2: YAML Schema 包含完整 definitions ---

  @SPEC-EXECHISTORY-001 @AC-2
  Scenario: YAML contains all 4 schema definitions
    # [Source: specs/execution-history-spec.md:AC-2]
    Given the file "ai/standards/execution-history.ai.yaml" exists
    When I check the "definitions" block
    Then it SHALL contain a "test-results" definition
    And it SHALL contain a "log-entry" definition
    And it SHALL contain a "token-usage" definition
    And it SHALL contain a "final-status" definition
    And the total number of definitions SHALL be 4

  # --- AC-3: Core Markdown 參考文件完整 ---

  @SPEC-EXECHISTORY-001 @AC-3
  Scenario: Core Markdown contains all 10 sections
    # [Source: specs/execution-history-spec.md:AC-3]
    Given the file "core/execution-history.md" exists
    When I check the section structure
    Then it SHALL contain the following sections:
      | Section      |
      | 概述         |
      | 動機         |
      | 核心概念     |
      | Schema 定義  |
      | 儲存後端     |
      | 保留策略     |
      | 敏感資料     |
      | 跨專案存取   |
      | 使用範例     |
      | 相關標準     |

  # --- AC-4: Registry 註冊成功 ---

  @SPEC-EXECHISTORY-001 @AC-4
  Scenario: Standard is registered in standards-registry.json
    # [Source: specs/execution-history-spec.md:AC-4]
    Given the file "cli/standards-registry.json" exists
    When I search for an entry with id "execution-history"
    Then the entry SHALL exist
    And "category" SHALL be "reference"
    And "skillName" SHALL be null
    And "source.human" SHALL be "core/execution-history.md"
    And "source.ai" SHALL be "ai/standards/execution-history.ai.yaml"

  # --- AC-5: JSON Schema 檔案可驗證 ---

  @SPEC-EXECHISTORY-001 @AC-5
  Scenario: All 6 JSON Schema files are valid and version-consistent
    # [Source: specs/execution-history-spec.md:AC-5]
    Given the following schema files exist in "specs/schemas/":
      | File                                          |
      | execution-history-index.schema.json           |
      | execution-history-manifest.schema.json        |
      | execution-history-test-results.schema.json    |
      | execution-history-log-entry.schema.json       |
      | execution-history-token-usage.schema.json     |
      | execution-history-final-status.schema.json    |
    When I parse each file as JSON
    Then all 6 files SHALL parse successfully
    And each file's "version" field SHALL match the YAML "meta.version" value "1.0.0"

  # --- AC-6: 與同類標準架構對齊 ---

  @SPEC-EXECHISTORY-001 @AC-6
  Scenario: Architecture aligns with developer-memory standard
    # [Source: specs/execution-history-spec.md:AC-6]
    Given the "execution-history" entry exists in standards-registry.json
    And the "developer-memory" entry exists in standards-registry.json
    When I compare their registry entry structures
    Then both SHALL have "category" equal to "reference"
    And both SHALL have "skillName" equal to null
    And both SHALL have "source" with "human" and "ai" fields
    And the YAML "architecture.classification" SHALL be "always-on-protocol"

  # --- AC-7: 同步檢查通過 ---

  @SPEC-EXECHISTORY-001 @AC-7
  Scenario: Standards sync check passes
    # [Source: specs/execution-history-spec.md:AC-7]
    Given the files "ai/standards/execution-history.ai.yaml" and "core/execution-history.md" both exist
    When I check the YAML "meta.source" field
    Then it SHALL point to "core/execution-history.md"
    And running the standards sync check SHALL report no errors for "execution-history"
