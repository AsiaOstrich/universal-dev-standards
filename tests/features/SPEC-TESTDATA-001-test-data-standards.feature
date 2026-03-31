# [Source: docs/specs/SPEC-TESTDATA-001-test-data-standards.md]
# [Generated] BDD scenarios for test data standards content verification

@SPEC-TESTDATA-001
Feature: Test Data Standards
  As a developer
  I want a comprehensive test data standard covering strategies, anonymization, and isolation
  So that test data is reliable, secure, and maintainable

  # --- REQ-1: Test Data Strategies ---

  @SPEC-TESTDATA-001 @AC-1
  Scenario: Standard defines three test data strategies
    # [Source: SPEC-TESTDATA-001:REQ-1:AC-1]
    Given the test-data-standards.md standard exists
    When I read the "Test Data Strategies" section
    Then it SHALL define the three strategies: inline data, fixture files, and seed scripts
    And it SHALL map each strategy to appropriate test levels (Unit / Integration / E2E)

  @SPEC-TESTDATA-001 @AC-1
  Scenario: Strategy selection guide for test levels
    # [Source: SPEC-TESTDATA-001:REQ-1:AC-1]
    Given the test-data-standards.md standard exists
    When I read the strategy selection guide
    Then it SHALL recommend inline data for unit tests
    And it SHALL recommend fixture files for integration tests
    And it SHALL recommend seed scripts for E2E tests

  # --- REQ-2: Data Anonymization Rules ---

  @SPEC-TESTDATA-001 @AC-2
  Scenario: Anonymization rules cover five PII fields
    # [Source: SPEC-TESTDATA-001:REQ-2:AC-2]
    Given the test-data-standards.md standard exists
    When I read the "Data Anonymization" section
    Then it SHALL define anonymization methods for each PII field:
      | Field   | Technique               |
      | Name    | Faker or pseudonym      |
      | Email   | Domain replacement      |
      | Phone   | Format-preserving mask  |
      | Address | Generalization          |
      | ID      | Hash or sequential      |

  # --- REQ-3: Fixture and Schema Sync ---

  @SPEC-TESTDATA-001 @AC-3
  Scenario: Fixture files sync with schema migrations
    # [Source: SPEC-TESTDATA-001:REQ-3:AC-3]
    Given the test-data-standards.md standard exists
    When I read the "Fixture and Schema Migration Sync" section
    Then it SHALL define rules for updating fixtures when schema changes
    And it SHALL recommend automated detection of stale fixtures

  # --- REQ-4: Test Isolation Principles ---

  @SPEC-TESTDATA-001 @AC-4
  Scenario: Each test creates and destroys its own data
    # [Source: SPEC-TESTDATA-001:REQ-4:AC-4]
    Given the test-data-standards.md standard exists
    When I read the "Test Isolation" section
    Then it SHALL define that each test creates its own data
    And it SHALL define that each test cleans up its own data
    And it SHALL prohibit shared mutable state between tests

  # --- REQ-5: Factory Pattern ---

  @SPEC-TESTDATA-001 @AC-5
  Scenario: Factory Pattern supports default overrides
    # [Source: SPEC-TESTDATA-001:REQ-5:AC-5]
    Given the test-data-standards.md standard exists
    When I read the "Factory Pattern" section
    Then it SHALL define factories with sensible defaults
    And it SHALL allow overriding default values per test
    And it SHALL support creating associated/related data

  # --- REQ-6: Anti-Patterns ---

  @SPEC-TESTDATA-001 @AC-6
  Scenario: Anti-pattern list covers at least four patterns
    # [Source: SPEC-TESTDATA-001:REQ-6:AC-6]
    Given the test-data-standards.md standard exists
    When I read the "Anti-Patterns" section
    Then it SHALL list at least 4 anti-patterns including:
      | Anti-Pattern              |
      | Shared mutable data       |
      | Hardcoded IDs             |
      | Execution order dependency|
      | Using production data     |
    And each anti-pattern SHALL include why it is harmful and what to do instead
