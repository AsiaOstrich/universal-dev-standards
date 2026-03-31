# [Source: docs/specs/SPEC-TECHDEBT-001-tech-debt-standards.md]
# [Generated] BDD scenarios for tech debt management standards content verification

@SPEC-TECHDEBT-001
Feature: Tech Debt Management Standards
  As a developer
  I want a comprehensive tech debt management standard covering taxonomy, registry, budget, and metrics
  So that technical debt is visible, measurable, and systematically managed

  # --- REQ-1: Tech Debt Taxonomy ---

  @SPEC-TECHDEBT-001 @AC-1
  Scenario: Standard defines six tech debt types
    # [Source: SPEC-TECHDEBT-001:REQ-1:AC-1]
    Given the tech-debt-standards.md standard exists
    When I read the "Tech Debt Taxonomy" section
    Then it SHALL define the following 6 types:
      | Type             | Description                          |
      | Design           | Architecture or design decision debt |
      | Code             | Code quality issues                  |
      | Test             | Test coverage or quality gaps        |
      | Documentation    | Missing or outdated documentation    |
      | Dependency       | Outdated or risky dependencies       |
      | Infrastructure   | Infrastructure configuration issues  |
    And each type SHALL have definition, common sources, and impact

  @SPEC-TECHDEBT-001 @AC-1
  Scenario: Standard distinguishes deliberate vs inadvertent debt
    # [Source: SPEC-TECHDEBT-001:REQ-1:AC-1]
    Given the tech-debt-standards.md standard exists
    When I read the taxonomy section
    Then it SHALL distinguish between Deliberate and Inadvertent debt
    And Deliberate debt SHALL require documenting the decision rationale

  # --- REQ-2: Tech Debt Registry ---

  @SPEC-TECHDEBT-001 @AC-2
  Scenario: Registry template contains 11 required fields
    # [Source: SPEC-TECHDEBT-001:REQ-2:AC-2]
    Given the tech-debt-standards.md standard exists
    When I read the "Tech Debt Registry" section
    Then it SHALL define a registry entry template with 11 fields:
      | Field               |
      | ID                  |
      | Title               |
      | Type                |
      | Source               |
      | Impact              |
      | Estimated Cost      |
      | Interest            |
      | Priority            |
      | Owner               |
      | Created Date        |
      | Target Resolution   |

  @SPEC-TECHDEBT-001 @AC-2
  Scenario: Registry provides storage options
    # [Source: SPEC-TECHDEBT-001:REQ-2:AC-2]
    Given the tech-debt-standards.md standard exists
    When I read the registry storage guidance
    Then it SHALL provide file-based and issue-based storage options

  # --- REQ-3: Tech Debt Budget ---

  @SPEC-TECHDEBT-001 @AC-3
  Scenario: Budget guidelines for three team states
    # [Source: SPEC-TECHDEBT-001:REQ-3:AC-3]
    Given the tech-debt-standards.md standard exists
    When I read the "Tech Debt Budget" section
    Then it SHALL define budget ratios for 3 team states:
      | Team State              | Recommended Ratio |
      | New project (< 6 months)| 10%               |
      | Mature project (stable) | 15%               |
      | High-debt project       | 20-30%            |

  @SPEC-TECHDEBT-001 @AC-3
  Scenario: Budget usage tracking requirements
    # [Source: SPEC-TECHDEBT-001:REQ-3:AC-3]
    Given the tech-debt-standards.md standard exists
    When I read the budget tracking guidance
    Then it SHALL require reporting budget usage rate, resolved debts, new debts, and net change

  # --- REQ-4: Impact Assessment Matrix ---

  @SPEC-TECHDEBT-001 @AC-4
  Scenario: 3x3 impact matrix produces P0-P3 priorities
    # [Source: SPEC-TECHDEBT-001:REQ-4:AC-4]
    Given the tech-debt-standards.md standard exists
    When I read the "Impact Assessment Matrix" section
    Then it SHALL define a 3x3 matrix of Impact x Effort
    And it SHALL produce priorities P0, P1, P2, and P3
    And P0 SHALL be assigned to high-impact, easy-fix items

  @SPEC-TECHDEBT-001 @AC-4
  Scenario: Interest concept defined
    # [Source: SPEC-TECHDEBT-001:REQ-4:AC-4]
    Given the tech-debt-standards.md standard exists
    When I read the interest concept section
    Then it SHALL define time interest, risk interest, and talent interest

  # --- REQ-5: Quantitative Metrics ---

  @SPEC-TECHDEBT-001 @AC-5
  Scenario: Five tracking metrics defined
    # [Source: SPEC-TECHDEBT-001:REQ-5:AC-5]
    Given the tech-debt-standards.md standard exists
    When I read the "Metrics" section
    Then it SHALL define 5 quantitative metrics:
      | Metric                  | Target Trend        |
      | Total debt volume       | Stable or declining |
      | Debt ratio              | < 1.0               |
      | Average age             | < 90 days            |
      | Type distribution       | No single > 40%     |
      | High priority ratio     | < 20%               |

  # --- REQ-6: Development Workflow Integration ---

  @SPEC-TECHDEBT-001 @AC-6
  Scenario: Commit marking format for introducing debt
    # [Source: SPEC-TECHDEBT-001:REQ-6:AC-6]
    Given the tech-debt-standards.md standard exists
    When I read the "Commit Marking" section
    Then it SHALL define a commit footer format for introducing debt
    And the format SHALL follow: "Tech-Debt: TD-NNN (introduced: description)"

  @SPEC-TECHDEBT-001 @AC-6
  Scenario: Commit marking format for resolving debt
    # [Source: SPEC-TECHDEBT-001:REQ-6:AC-6]
    Given the tech-debt-standards.md standard exists
    When I read the "Commit Marking" section
    Then it SHALL define a commit footer format for resolving debt
    And the format SHALL follow: "Tech-Debt: TD-NNN (resolved: description)"
