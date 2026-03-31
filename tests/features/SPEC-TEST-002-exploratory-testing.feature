# [Source: docs/specs/SPEC-TEST-002-exploratory-testing.md]
# [Generated] BDD scenarios for exploratory testing standards content verification

@SPEC-TEST-002
Feature: Exploratory Testing Standards
  As a developer or tester
  I want exploratory testing standards covering SBTM, heuristics, session records, and automation complement
  So that exploratory testing is structured, repeatable, and feeds into automated regression

  # --- AC-1: Session-Based Test Management (SBTM) ---

  @SPEC-TEST-002 @AC-1
  Scenario: Standard defines SBTM with time box, charter, and session notes
    # [Source: SPEC-TEST-002:REQ-1:AC-1]
    Given the testing-standards.md standard exists
    When I read the "Exploratory Testing" section
    Then it SHALL define Session-Based Test Management (SBTM)
    And it SHALL specify a time box of 60-90 minutes
    And it SHALL require a charter for each session
    And it SHALL require session notes for recording

  # --- AC-2: SFDPOT Heuristics ---

  @SPEC-TEST-002 @AC-2
  Scenario: Standard defines SFDPOT heuristics with 6 dimensions
    # [Source: SPEC-TEST-002:REQ-2:AC-2]
    Given the testing-standards.md standard exists
    When I read the "Heuristics" subsection
    Then it SHALL define the following 6 SFDPOT dimensions:
      | Dimension  | English    |
      | Structure  | Structure  |
      | Function   | Function   |
      | Data       | Data       |
      | Platform   | Platform   |
      | Operations | Operations |
      | Time       | Time       |

  # --- AC-3: Session Record Template ---

  @SPEC-TEST-002 @AC-3
  Scenario: Standard provides session record template with 6 fields
    # [Source: SPEC-TEST-002:REQ-3:AC-3]
    Given the testing-standards.md standard exists
    When I read the "Session Record Template" subsection
    Then it SHALL include the following fields:
      | Field     |
      | Charter   |
      | Area      |
      | Duration  |
      | Notes     |
      | Bugs Found |
      | Follow-up |

  # --- AC-4: Automation Complement ---

  @SPEC-TEST-002 @AC-4
  Scenario: Standard defines exploratory-to-automation complement principle
    # [Source: SPEC-TEST-002:REQ-4:AC-4]
    Given the testing-standards.md standard exists
    When I read the "Automation Complement" subsection
    Then it SHALL state that exploratory findings feed into automated regression tests
    And it SHALL distinguish discovery (exploratory) from protection (automation)
