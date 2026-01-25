# Generated from: docs/specs/cli/testing/test-strategy.md
# Generator: /derive-bdd
# Generated at: 2026-01-25T00:00:00Z

@TEST-00 @test-strategy
Feature: CLI Test Strategy
  The testing system follows the testing pyramid principle
  with optimized test suites for different development scenarios.

  # [Source: docs/specs/cli/testing/test-strategy.md:AC-1]
  @AC-1 @testing-pyramid
  Scenario: Testing pyramid ratio is maintained
    Given the CLI test suite
    When test counts are analyzed
    Then unit tests comprise approximately 70% of total tests
    And integration tests comprise approximately 20% of total tests
    And E2E tests comprise approximately 10% of total tests
    And total test count exceeds 900

  @AC-1 @test-distribution
  Scenario: Test distribution by directory
    Given the test directory structure
    When tests are counted by directory
    Then cli/tests/unit/ contains the majority of tests
    And cli/tests/commands/ contains integration tests
    And cli/tests/e2e/ contains the fewest tests

  # [Source: docs/specs/cli/testing/test-strategy.md:AC-2]
  @AC-2 @quick-suite
  Scenario: Quick test suite executes under 6 seconds
    Given the quick test suite configuration
    When npm run test:quick is executed
    Then execution completes in under 6 seconds
    And all unit tests are included
    And E2E tests are excluded
    And exit code is 0 when all tests pass

  @AC-2 @fast-feedback
  Scenario: Quick suite provides fast development feedback
    Given a developer is making changes
    When they run the quick test suite
    Then they receive test results within seconds
    And can iterate rapidly on their changes

  # [Source: docs/specs/cli/testing/test-strategy.md:AC-3]
  @AC-3 @new-feature-tests
  Scenario: New features have corresponding tests
    Given a new feature is implemented
    When the feature code is committed
    Then new unit tests exist for new functions
    And integration tests exist for new command flows
    And test coverage does not decrease

  @AC-3 @precommit-validation
  Scenario: Pre-commit hook validates tests
    Given code changes are staged for commit
    When git commit is attempted
    Then pre-commit hook runs test:unit
    And commit is blocked if tests fail
    And commit proceeds if tests pass

  # [Source: docs/specs/cli/testing/test-strategy.md:AC-4]
  @AC-4 @cross-platform
  Scenario Outline: Cross-platform tests pass
    Given the full test suite
    When executed on "<platform>"
    Then all tests pass
    And path handling is correct for the platform
    And file operations work correctly

    Examples:
      | platform |
      | macOS    |
      | Linux    |
      | Windows  |

  @AC-4 @ci-matrix
  Scenario: CI matrix validates all platform and Node combinations
    Given the GitHub Actions workflow
    When CI runs on push or PR
    Then tests execute on macOS, Linux, and Windows
    And tests execute on Node.js 18, 20, and 22
    And all combinations must pass for CI success
