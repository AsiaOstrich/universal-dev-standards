# [Source: docs/specs/SPEC-KT-001-knowledge-transfer-standards.md]
# [Generated] BDD scenarios for knowledge transfer standards content verification

@SPEC-KT-001
Feature: Knowledge Transfer Standards
  As a team lead
  I want comprehensive knowledge transfer standards covering Onboarding, Handoff, Bus Factor, and Code Tour
  So that knowledge does not disappear when team members leave

  # --- REQ-1: Onboarding Roadmap ---

  @SPEC-KT-001 @AC-1
  Scenario: 30-day Onboarding roadmap with 4 weeks
    # [Source: SPEC-KT-001:REQ-1:AC-1]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Onboarding Roadmap" section
    Then it SHALL define a 4-week roadmap (Week 1 through Week 4)
    And Week 1 SHALL cover environment and culture with a build/run deliverable
    And Week 2 SHALL cover architecture and code with Code Tour completion
    And Week 3 SHALL cover process and tools with a first PR deliverable
    And Week 4 SHALL cover independent contribution with Buddy evaluation

  @SPEC-KT-001 @AC-2
  Scenario: Onboarding checklist with 5 categories
    # [Source: SPEC-KT-001:REQ-1:AC-2]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Onboarding Checklist" section
    Then it SHALL define 5 categories of checklist items:
      | Category       |
      | Account Access |
      | Environment    |
      | Documentation  |
      | Meetings       |
      | First Tasks    |

  # --- REQ-2: Handoff Process ---

  @SPEC-KT-001 @AC-3
  Scenario: Handoff checklist with at least 6 items and timeline
    # [Source: SPEC-KT-001:REQ-2:AC-3]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Handoff Process" section
    Then it SHALL define at least 6 handoff items each with a timeline
    And items SHALL include ownership list, tacit knowledge recording, WIP handover, account transfer, runbook update, and buddy pairing

  @SPEC-KT-001 @AC-4
  Scenario: Knowledge record format with 5 fields
    # [Source: SPEC-KT-001:REQ-2:AC-4]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Knowledge Record Format" section
    Then each record SHALL contain 5 fields:
      | Field     |
      | Topic     |
      | Context   |
      | Steps     |
      | Pitfalls  |
      | Resources |

  # --- REQ-3: Bus Factor Assessment ---

  @SPEC-KT-001 @AC-5
  Scenario: Bus Factor assessment with 3 metrics and risk levels
    # [Source: SPEC-KT-001:REQ-3:AC-5]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Bus Factor Assessment" section
    Then it SHALL define 3 assessment metrics:
      | Metric                  | Risk Levels          |
      | Number of knowledgeable | 1=High, 2=Medium, 3+=Low |
      | Documentation coverage  | <30%=High, 30-70%=Medium, >70%=Low |
      | Last knowledge sharing  | >6mo=High, 3-6mo=Medium, <3mo=Low |

  @SPEC-KT-001 @AC-6
  Scenario: Knowledge diffusion strategies with at least 5 types
    # [Source: SPEC-KT-001:REQ-3:AC-6]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Knowledge Diffusion" section
    Then it SHALL define at least 5 strategies:
      | Strategy          |
      | Pair Programming  |
      | Tech Talk         |
      | Documentation     |
      | Code Review       |
      | On-call Rotation  |

  # --- REQ-4: Code Tour ---

  @SPEC-KT-001 @AC-7
  Scenario: Code Tour with at least 5 routes
    # [Source: SPEC-KT-001:REQ-4:AC-7]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Code Tour" section
    Then it SHALL define at least 5 tour routes:
      | Route         | Target Audience     |
      | Quick Start   | All newcomers       |
      | Request Flow  | Backend developers  |
      | Data Flow     | Data developers     |
      | Deploy Flow   | Deployers           |
      | Key Decisions | Architecture review |

  @SPEC-KT-001 @AC-8
  Scenario: Code Tour maintenance with 3 update rules
    # [Source: SPEC-KT-001:REQ-4:AC-8]
    Given the knowledge-transfer-standards.md standard exists
    When I read the "Code Tour Maintenance" section
    Then it SHALL define 3 update rules:
      | Change Type              | Action             |
      | Entry point/route change | MUST update tour   |
      | Internal refactor        | No update needed   |
      | New major feature        | SHOULD add route   |
