# [Source: docs/specs/SPEC-DERIVE-001-multi-level-test-derivation.md]
# [Generated] BDD scenarios for multi-level test derivation

@SPEC-DERIVE-001
Feature: Multi-Level Test Derivation
  As a developer
  I want /derive to generate tests across the full testing pyramid
  So that I get Unit, Integration, and E2E test skeletons from a single command

  @SPEC-DERIVE-001 @AC-1
  Scenario: Test level decision tree covers 3 levels
    Given the forward-derivation-standards.md standard exists
    When I read the "Test Level Decision Tree" section
    Then it SHALL provide a decision tree that classifies ACs into:
      | Level       | Trigger                                    |
      | E2E         | UI operations (click, navigate, redirect)  |
      | Integration | Multi-service interaction, external API     |
      | Unit        | Single function, pure logic                |

  @SPEC-DERIVE-001 @AC-2
  Scenario: IT skeleton has Setup/Request/Assert/Teardown
    Given an AC describing API endpoint behavior
    When /derive it is executed
    Then the skeleton SHALL contain Setup, Request, Assert, and Teardown sections

  @SPEC-DERIVE-001 @AC-3
  Scenario: IT has 4 interface templates
    Given the forward-derivation-standards.md standard exists
    When I read the "Integration Test Derivation" section
    Then it SHALL define 4 interface templates:
      | Interface         |
      | HTTP API          |
      | Database          |
      | Message Queue     |
      | Service-to-Service|

  @SPEC-DERIVE-001 @AC-4
  Scenario: E2E skeleton has 5 sections
    Given a .feature with UI-related scenarios
    When /derive e2e is executed
    Then the skeleton SHALL contain Environment, Navigation, Interaction, Assertion, Cleanup

  @SPEC-DERIVE-001 @AC-5
  Scenario: Gherkin step mapping
    Given a .feature scenario with Given/When/Then
    When mapping to E2E skeleton
    Then Given maps to Navigation, When maps to Interaction, Then maps to Assertion

  @SPEC-DERIVE-001 @AC-6
  Scenario: 7 derive subcommands
    Given the /derive command
    When listing subcommands
    Then it SHALL have: bdd, tdd, atdd, contracts, it, e2e, all

  @SPEC-DERIVE-001 @AC-7
  Scenario: /derive all produces 4-layer output
    Given a SPEC file with multiple ACs
    When /derive all is executed
    Then it produces .feature + .test + .it.test + .e2e.test files

  @SPEC-DERIVE-001 @AC-8
  Scenario: AC Level Summary in output
    Given a SPEC with multiple ACs
    When derivation completes
    Then output includes an AC Level Summary table with suggested level and rationale

  @SPEC-DERIVE-001 @AC-9
  Scenario: Respects test_levels configuration
    Given manifest has test_levels: ['unit-testing', 'integration-testing']
    When /derive all is executed
    Then E2E derivation is skipped
    And a message indicates E2E is not in project configuration
