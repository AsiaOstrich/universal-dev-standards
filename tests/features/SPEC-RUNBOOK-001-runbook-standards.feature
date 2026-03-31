# [Source: docs/specs/SPEC-RUNBOOK-001-runbook-standards.md]
# [Generated] BDD scenarios for runbook standards content verification

@SPEC-RUNBOOK-001
Feature: Runbook Standards
  As a service operator
  I want a standard for writing, maintaining, and validating runbooks
  So that on-call engineers have clear, actionable procedures

  # --- REQ-1: Standard Template ---

  @SPEC-RUNBOOK-001 @AC-1
  Scenario: Runbook template has 7 required sections
    # [Source: SPEC-RUNBOOK-001:REQ-1:AC-1]
    Given the runbook-standards.md standard exists
    When I read the "Standard Template" section
    Then it SHALL define these 7 required sections:
      | Section              |
      | Overview             |
      | Symptoms             |
      | Impact assessment    |
      | Diagnostic steps     |
      | Fix steps            |
      | Escalation           |
      | Post-actions         |

  @SPEC-RUNBOOK-001 @AC-1
  Scenario: Template includes required metadata fields
    # [Source: SPEC-RUNBOOK-001:REQ-1:AC-1]
    Given the runbook-standards.md standard exists
    When I read the template metadata requirements
    Then it SHALL require:
      | Field           |
      | Alert name      |
      | Severity        |
      | Related services|
      | Last updated    |
      | Owner           |
      | Last drilled    |

  # --- REQ-2: Runbook Types ---

  @SPEC-RUNBOOK-001 @AC-2
  Scenario: Five runbook types with use cases
    # [Source: SPEC-RUNBOOK-001:REQ-2:AC-2]
    Given the runbook-standards.md standard exists
    When I read the "Runbook Types" section
    Then it SHALL define 5 types:
      | Type                   | Purpose                        |
      | Alert Response         | Diagnose and fix specific alert|
      | Standard Operation     | Routine operational procedures |
      | Emergency Procedure    | Major incident response        |
      | Change Procedure       | Planned change execution       |
      | Troubleshooting Guide  | General problem investigation  |

  # --- REQ-3: Validity Management ---

  @SPEC-RUNBOOK-001 @AC-3
  Scenario: Review cycles per runbook type
    # [Source: SPEC-RUNBOOK-001:REQ-3:AC-3]
    Given the runbook-standards.md standard exists
    When I read the "Validity Management" section
    Then it SHALL define review cycles:
      | Type                 | Cycle       |
      | Alert Response       | Quarterly   |
      | Emergency Procedure  | Monthly     |
      | Standard Operation   | Bi-annually |
      | Change Procedure     | After use   |
      | Troubleshooting Guide| Bi-annually |

  @SPEC-RUNBOOK-001 @AC-3
  Scenario: Staleness warning mechanism
    # [Source: SPEC-RUNBOOK-001:REQ-3:AC-3]
    Given the runbook-standards.md standard exists
    When I read the staleness detection guidance
    Then it SHALL define that runbooks past review cycle are flagged as needing review
    And it SHALL define that architecture changes trigger runbook review

  # --- REQ-4: Drill/Exercise Process ---

  @SPEC-RUNBOOK-001 @AC-4
  Scenario: Drill scheduling by priority
    # [Source: SPEC-RUNBOOK-001:REQ-4:AC-4]
    Given the runbook-standards.md standard exists
    When I read the "Drill / Exercise Process" section
    Then it SHALL define drill frequency:
      | Priority | Condition                | Frequency  |
      | Highest  | P1 alert runbooks        | Monthly    |
      | High     | P2 alert runbooks        | Quarterly  |
      | Medium   | Emergency procedures     | Quarterly  |
      | Low      | Other runbooks           | Bi-annually|

  @SPEC-RUNBOOK-001 @AC-5
  Scenario: Drill recording requirements
    # [Source: SPEC-RUNBOOK-001:REQ-4:AC-5]
    Given the runbook-standards.md standard exists
    When I read the drill recording format
    Then it SHALL require:
      | Field                           |
      | Drill date and participants     |
      | Runbook name                    |
      | Result (pass/partial/fail)      |
      | Issues found                    |
      | Estimated vs actual repair time |

  # --- REQ-5: Alert Integration ---

  @SPEC-RUNBOOK-001 @AC-6
  Scenario: Runbook coverage reporting
    # [Source: SPEC-RUNBOOK-001:REQ-5:AC-6]
    Given the runbook-standards.md standard exists
    When I read the "Integration Points" section
    Then it SHALL define coverage targets:
      | Alert Level | Coverage Target |
      | P1/P2       | 100%            |
      | P3/P4       | > 80%           |
    And it SHALL require listing alerts without runbooks

  # --- REQ-7: Writing Quality Guidelines ---

  @SPEC-RUNBOOK-001 @AC-7
  Scenario: Six writing quality principles
    # [Source: SPEC-RUNBOOK-001:REQ-7:AC-7]
    Given the runbook-standards.md standard exists
    When I read the "Writing Quality Guidelines" section
    Then it SHALL define 6 principles:
      | Principle      | Description                         |
      | Reproducible   | Steps specific enough to copy-paste |
      | Unambiguous    | Each step has one interpretation    |
      | Decision points| Branch conditions are explicit      |
      | Rollback       | Fallback plan for failed fixes      |
      | Verification   | Verification after each fix step    |
      | Time-bounded   | Expected completion time stated     |

  # --- REQ-8: Storage and Organization ---

  @SPEC-RUNBOOK-001 @AC-8
  Scenario: Directory structure by type
    # [Source: SPEC-RUNBOOK-001:REQ-8:AC-8]
    Given the runbook-standards.md standard exists
    When I read the "Organization and Storage" section
    Then it SHALL define subdirectories by type:
      | Directory        | Type                  |
      | alerts/          | Alert Response        |
      | operations/      | Standard Operation    |
      | emergency/       | Emergency Procedure   |
      | troubleshooting/ | Troubleshooting Guide |

  @SPEC-RUNBOOK-001 @AC-8
  Scenario: Naming convention uses kebab-case problem names
    # [Source: SPEC-RUNBOOK-001:REQ-8:AC-8]
    Given the runbook-standards.md standard exists
    When I read the "Naming Conventions" subsection
    Then it SHALL require kebab-case file names
    And it SHALL require names to reflect the problem, not the solution
    And it SHALL provide positive and negative examples
