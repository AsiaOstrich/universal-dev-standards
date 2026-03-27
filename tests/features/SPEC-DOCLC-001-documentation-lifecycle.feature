# [Source: docs/specs/SPEC-DOCLC-001-documentation-lifecycle.md]
# [Generated] BDD scenarios for documentation lifecycle standard content verification

@SPEC-DOCLC-001
Feature: Documentation Lifecycle Standard
  As a developer
  I want a standard that defines when to update and check documentation
  So that documentation stays in sync with code changes

  # --- REQ-1: Core Principles ---

  @SPEC-DOCLC-001 @AC-1
  Scenario: Standard defines co-update principle
    # [Source: SPEC-DOCLC-001:REQ-1:AC-1]
    Given the documentation-lifecycle.md standard exists
    When I read the "Core Principles" section
    Then it SHALL define the "Co-update Principle"
    And it SHALL state that code authors are responsible for updating documentation in the same PR

  @SPEC-DOCLC-001 @AC-1
  Scenario: Standard defines shift-left principle
    # [Source: SPEC-DOCLC-001:REQ-1:AC-1]
    Given the documentation-lifecycle.md standard exists
    When I read the "Core Principles" section
    Then it SHALL define the "Shift-left Principle"
    And it SHALL emphasize that earlier detection reduces fix cost

  # --- REQ-2: Documentation Update Triggers ---

  @SPEC-DOCLC-001 @AC-2
  Scenario: Trigger matrix covers required change types
    # [Source: SPEC-DOCLC-001:REQ-2:AC-2]
    Given the documentation-lifecycle.md standard exists
    When I read the "Documentation Update Triggers" section
    Then it SHALL contain a trigger × document type matrix
    And the matrix SHALL cover at least these trigger types:
      | Trigger Type        |
      | New feature         |
      | API change          |
      | Breaking change     |
      | Bug fix             |
      | Dependency upgrade  |
      | Configuration change|
      | Architecture change |

  @SPEC-DOCLC-001 @AC-2
  Scenario: Trigger matrix covers required document types
    # [Source: SPEC-DOCLC-001:REQ-2:AC-2]
    Given the documentation-lifecycle.md standard exists
    When I read the trigger matrix
    Then it SHALL cover at least these document types:
      | Document Type       |
      | README              |
      | API documentation   |
      | CHANGELOG           |
      | Architecture (ADR)  |
      | User guide          |
      | Translation files   |

  @SPEC-DOCLC-001 @AC-2
  Scenario: Trigger matrix distinguishes MUST and SHOULD
    # [Source: SPEC-DOCLC-001:REQ-2:AC-2]
    Given the documentation-lifecycle.md standard exists
    When I read the trigger matrix
    Then each cell SHALL be marked as "MUST", "SHOULD", or "N/A"

  # --- REQ-3: Documentation Check Pyramid ---

  @SPEC-DOCLC-001 @AC-3
  Scenario: Check pyramid defines Level 1 - Commit
    # [Source: SPEC-DOCLC-001:REQ-3:AC-3]
    Given the documentation-lifecycle.md standard exists
    When I read the "Documentation Check Pyramid" section
    Then Level 1 (Commit) SHALL define automated, seconds-level checks
    And it SHALL include link validity and file existence checks

  @SPEC-DOCLC-001 @AC-3
  Scenario: Check pyramid defines Level 2 - PR Review
    # [Source: SPEC-DOCLC-001:REQ-3:AC-3]
    Given the documentation-lifecycle.md standard exists
    When I read the "Documentation Check Pyramid" section
    Then Level 2 (PR Review) SHALL define semi-automated, minutes-level checks
    And it SHALL include doc-code sync verification and content review

  @SPEC-DOCLC-001 @AC-3
  Scenario: Check pyramid defines Level 3 - Release
    # [Source: SPEC-DOCLC-001:REQ-3:AC-3]
    Given the documentation-lifecycle.md standard exists
    When I read the "Documentation Check Pyramid" section
    Then Level 3 (Release) SHALL define comprehensive checks
    And it SHALL include version consistency, translation sync, and coverage verification

  # --- REQ-4: Hard Checks vs Soft Checks ---

  @SPEC-DOCLC-001 @AC-4
  Scenario: Standard defines hard checks
    # [Source: SPEC-DOCLC-001:REQ-4:AC-4]
    Given the documentation-lifecycle.md standard exists
    When I read the "Hard Checks vs Soft Checks" section
    Then hard checks SHALL include:
      | Hard Check                |
      | Version number consistency|
      | File existence            |
      | Link validity             |
      | Translation sync status   |
      | Feature count accuracy    |

  @SPEC-DOCLC-001 @AC-4
  Scenario: Standard defines soft checks
    # [Source: SPEC-DOCLC-001:REQ-4:AC-4]
    Given the documentation-lifecycle.md standard exists
    When I read the "Hard Checks vs Soft Checks" section
    Then soft checks SHALL include:
      | Soft Check                    |
      | Content correctness           |
      | Example code runnability      |
      | Release notes accuracy        |
      | Migration guide completeness  |

  # --- REQ-5: Responsibility Matrix ---

  @SPEC-DOCLC-001 @AC-5
  Scenario: Standard defines responsibility matrix
    # [Source: SPEC-DOCLC-001:REQ-5:AC-5]
    Given the documentation-lifecycle.md standard exists
    When I read the "Responsibility Matrix" section
    Then it SHALL contain a table with columns for document type, responsible role, update timing, and check method

  @SPEC-DOCLC-001 @AC-5
  Scenario: PR reviewer can use responsibility matrix
    # [Source: SPEC-DOCLC-001:REQ-5:AC-5]
    Given a PR reviewer is checking a code change PR
    When they consult the responsibility matrix
    Then they can determine which documentation updates are required for the change type

  # --- Cross-cutting ---

  @SPEC-DOCLC-001 @AC-6
  Scenario: Standard is tool-agnostic
    # [Source: SPEC-DOCLC-001:AC-6]
    Given the documentation-lifecycle.md standard exists
    When I read the entire standard
    Then it SHALL NOT depend on any specific tool, language, or framework

  @SPEC-DOCLC-001 @AC-7
  Scenario: Standard references complementary standards
    # [Source: SPEC-DOCLC-001:AC-7]
    Given the documentation-lifecycle.md standard exists
    When I read the "Integration with Other Standards" section
    Then it SHALL reference documentation-structure.md
    And it SHALL reference documentation-writing-standards.md

  @SPEC-DOCLC-001 @AC-8
  Scenario: Translations are synchronized
    # [Source: SPEC-DOCLC-001:AC-8]
    Given the documentation-lifecycle.md standard exists
    When I check the locales directories
    Then locales/zh-TW/core/documentation-lifecycle.md SHALL exist
    And locales/zh-CN/core/documentation-lifecycle.md SHALL exist
