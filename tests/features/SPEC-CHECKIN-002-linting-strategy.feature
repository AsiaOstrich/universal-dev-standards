# [Source: docs/specs/SPEC-CHECKIN-002-linting-strategy.md]
# [Generated] BDD scenarios for linting strategy content verification (checkin-standards extension)

@SPEC-CHECKIN-002
Feature: Linting Strategy Extension for checkin-standards
  As a developer
  I want a linting strategy integrated into checkin-standards
  So that lint rules are classified, auto-fix boundaries are clear, and teams stay consistent

  # --- REQ-1: Lint Rule Severity Classification ---

  @SPEC-CHECKIN-002 @AC-1
  Scenario: Three-level lint rule severity with CI behavior
    # [Source: SPEC-CHECKIN-002:REQ-1:AC-1]
    Given the checkin-standards.md standard exists
    When I read the "Linting Strategy" section
    Then it SHALL define three severity levels: Error, Warning, and Info
    And Error SHALL block CI (CI failure)
    And Warning SHALL pass CI but report issues
    And Info SHALL pass CI without reporting
    And each level SHALL include applicable scenarios and examples

  # --- REQ-1: Rule Classification Decision Tree ---

  @SPEC-CHECKIN-002 @AC-2
  Scenario: Decision tree for rule severity classification
    # [Source: SPEC-CHECKIN-002:REQ-1:AC-2]
    Given the checkin-standards.md standard exists
    When I read the rule classification decision guidance
    Then it SHALL provide a decision tree using bug, maintainability, and security as criteria
    And bug-causing violations SHALL map to Error
    And maintainability-reducing violations SHALL map to Warning
    And security-related violations SHALL map to Error

  # --- REQ-2: Auto-fix Strategy ---

  @SPEC-CHECKIN-002 @AC-3
  Scenario: Auto-fix classification with three categories and examples
    # [Source: SPEC-CHECKIN-002:REQ-2:AC-3]
    Given the checkin-standards.md standard exists
    When I read the "Auto-fix Strategy" section
    Then it SHALL define three auto-fix categories:
      | Category              | Condition                                |
      | Can auto-fix          | Fix is deterministic and preserves semantics |
      | Needs confirmation    | Fix may change semantics                 |
      | Forbidden to auto-fix | Fix requires understanding context       |
    And each category SHALL include concrete examples

  @SPEC-CHECKIN-002 @AC-4
  Scenario: Auto-fix timing in CI pipeline
    # [Source: SPEC-CHECKIN-002:REQ-2:AC-4]
    Given the checkin-standards.md standard exists
    When I read the auto-fix timing guidance
    Then it SHALL define three auto-fix timing recommendations:
      | Timing       | Behavior                                |
      | pre-commit   | Auto-fix safe rules (formatting)        |
      | CI pipeline  | Check only, never fix                   |
      | PR review    | Suggest fixes as review comments        |

  # --- REQ-3: Team Consistency Principles ---

  @SPEC-CHECKIN-002 @AC-5
  Scenario: Five team consistency principles
    # [Source: SPEC-CHECKIN-002:REQ-3:AC-5]
    Given the checkin-standards.md standard exists
    When I read the "Team Consistency Principles" section
    Then it SHALL define 5 core principles:
      | Principle                        |
      | Team decides style choices       |
      | Config committed to version control |
      | No debates after decision        |
      | Automation over manual enforcement |
      | Strict rules for new projects    |

  @SPEC-CHECKIN-002 @AC-6
  Scenario: Four-step gradual adoption for existing projects
    # [Source: SPEC-CHECKIN-002:REQ-3:AC-6]
    Given an existing project wants to adopt linting
    When I read the gradual adoption guidance
    Then it SHALL define 4 sequential adoption steps:
      | Step | Action                                       |
      | 1    | Enable strict rules only for new/modified files |
      | 2    | Allow disable comments with upper limit       |
      | 3    | Reduce disable count quarterly                |
      | 4    | Full enforcement                              |

  # --- REQ-4: Configuration Template ---

  @SPEC-CHECKIN-002 @AC-7
  Scenario: Language-agnostic lint configuration template
    # [Source: SPEC-CHECKIN-002:REQ-4:AC-7]
    Given the checkin-standards.md standard exists
    When I read the "Configuration Template" section
    Then it SHALL provide a language-agnostic configuration template
    And the template SHALL map rule categories to severity levels
    And it SHALL include auto_fix settings for save, commit, and CI
    And severity levels SHALL align with the three-level classification (error, warning, info)
