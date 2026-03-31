# [Source: docs/specs/SPEC-ENV-002-iac-principles.md]
# [Generated] BDD scenarios for IaC principles extension content verification

@SPEC-ENV-002
Feature: IaC Principles Extension for environment-standards
  As a developer
  I want IaC core principles defined in the environment standard
  So that infrastructure management follows consistent, language-agnostic best practices

  # --- REQ-1: IaC Core Principles ---

  @SPEC-ENV-002 @AC-1
  Scenario: Standard defines 6 IaC core principles
    # [Source: SPEC-ENV-002:REQ-1:AC-1]
    Given the environment-standards.md standard exists
    When I read the "Infrastructure as Code (IaC) Principles" section
    Then it SHALL define the following 6 core principles:
      | Principle               | Description                              |
      | Declarative-first       | Describe desired state, not steps        |
      | Idempotency             | Multiple executions yield same result    |
      | Version Control         | All IaC code MUST be in Git              |
      | Modularity              | Reusable modules, avoid duplication      |
      | Environment Parameterization | Same module, different env parameters |
      | Immutable Infrastructure | Replace rather than modify on update    |

  @SPEC-ENV-002 @AC-1
  Scenario: Each IaC principle has a description
    # [Source: SPEC-ENV-002:REQ-1:AC-1]
    Given the environment-standards.md standard exists
    When I read the "Core Principles" subsection
    Then each principle SHALL have a corresponding description

  # --- REQ-2: IaC Code Review ---

  @SPEC-ENV-002 @AC-2
  Scenario: IaC code review checklist covers 4 aspects
    # [Source: SPEC-ENV-002:REQ-2:AC-2]
    Given the environment-standards.md standard exists
    When I read the "IaC Code Review Checklist" subsection
    Then it SHALL define 4 review aspects:
      | Aspect                   | Description                                |
      | Security                 | Least privilege, no hardcoded secrets      |
      | Cost Impact              | Resource increase awareness, cost estimate |
      | Rollback Feasibility     | Whether changes are reversible             |
      | Environment Consistency  | Whether parity is affected                 |

  # --- REQ-3: Drift Detection ---

  @SPEC-ENV-002 @AC-3
  Scenario: Drift detection defines periodic comparison and remediation
    # [Source: SPEC-ENV-002:REQ-3:AC-3]
    Given the environment-standards.md standard exists
    When I read the "Drift Detection" subsection
    Then it SHALL describe periodic comparison of actual state vs IaC definition
    And it SHALL describe team notification on drift discovery
    And it SHALL provide remediation options: update IaC or revert infrastructure
