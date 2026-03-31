# [Source: docs/specs/SPEC-SLO-001-slo-standards.md]
# [Generated] BDD scenarios for SLI/SLO/Error Budget standards content verification

@SPEC-SLO-001
Feature: SLI/SLO/Error Budget Standards
  As a service owner
  I want a standard for defining SLIs, SLOs, and Error Budgets
  So that I can systematically manage service quality commitments

  # --- REQ-1: SLI Selection ---

  @SPEC-SLO-001 @AC-1
  Scenario: SLI selection guide covers API services
    # [Source: SPEC-SLO-001:REQ-1:AC-1]
    Given the slo-standards.md standard exists
    When I read the "SLI Selection Guide" section for API services
    Then it SHALL recommend SLIs for:
      | SLI          | Measurement                          |
      | Availability | Successful requests / total requests  |
      | Latency      | Requests below threshold proportion   |
      | Quality      | Non-degraded responses proportion     |

  @SPEC-SLO-001 @AC-1
  Scenario: SLI selection guide covers batch jobs
    # [Source: SPEC-SLO-001:REQ-1:AC-1]
    Given the slo-standards.md standard exists
    When I read the "SLI Selection Guide" section for batch jobs
    Then it SHALL recommend SLIs for:
      | SLI        | Measurement                                |
      | Freshness  | Data update delay within threshold         |
      | Correctness| Correctly processed records proportion     |
      | Coverage   | Successfully processed batches proportion  |

  @SPEC-SLO-001 @AC-1
  Scenario: SLI selection guide covers frontend applications
    # [Source: SPEC-SLO-001:REQ-1:AC-1]
    Given the slo-standards.md standard exists
    When I read the "SLI Selection Guide" section for frontend applications
    Then it SHALL recommend SLIs for:
      | SLI               | Measurement                          |
      | Load performance  | LCP/FID/CLS in good range proportion |
      | Availability      | Successfully loaded pages proportion  |
      | Interaction delay | User action response below threshold  |

  # --- REQ-2: SLO Setting Methodology ---

  @SPEC-SLO-001 @AC-2
  Scenario: SLO setting process has 5 steps
    # [Source: SPEC-SLO-001:REQ-2:AC-2]
    Given the slo-standards.md standard exists
    When I read the "SLO Setting Methodology" section
    Then it SHALL define 5 steps:
      | Step | Description                       |
      | 1    | Select SLI                        |
      | 2    | Determine measurement window      |
      | 3    | Set target value                  |
      | 4    | Define compliance formula         |
      | 5    | Document SLO specification        |

  @SPEC-SLO-001 @AC-2
  Scenario: SLO target value selection guide
    # [Source: SPEC-SLO-001:REQ-2:AC-2]
    Given the slo-standards.md standard exists
    When I read the "Target Value Selection" subsection
    Then it SHALL contain a reference table with at least 5 target levels:
      | Target  | Monthly downtime allowed |
      | 99%     | 7.3 hours               |
      | 99.5%   | 3.65 hours              |
      | 99.9%   | 43.8 minutes            |
      | 99.95%  | 21.9 minutes            |
      | 99.99%  | 4.38 minutes            |

  # --- REQ-3: Error Budget Policy ---

  @SPEC-SLO-001 @AC-3
  Scenario: Error Budget calculation with concrete example
    # [Source: SPEC-SLO-001:REQ-3:AC-3]
    Given the slo-standards.md standard exists
    When I read the "Error Budget" section
    Then it SHALL include a calculation example with specific numbers
    And it SHALL show burn rate alert thresholds:
      | Consumption  | Threshold              | Action       |
      | Fast burn    | 2% budget in 1 hour    | Page         |
      | Medium burn  | 5% budget in 6 hours   | Alert        |
      | Slow burn    | 10% budget in 3 days   | Ticket       |

  @SPEC-SLO-001 @AC-4
  Scenario: Error Budget exhaustion policy options
    # [Source: SPEC-SLO-001:REQ-3:AC-4]
    Given the slo-standards.md standard exists
    When I read the "Budget Exhaustion Actions" subsection
    Then it SHALL offer at least 4 policy options:
      | Policy                  |
      | Freeze releases         |
      | Reliability sprint      |
      | Enhanced review         |
      | Lower SLO target        |

  # --- REQ-4: SLO Document Template ---

  @SPEC-SLO-001 @AC-7
  Scenario: SLO document template has 6 required sections
    # [Source: SPEC-SLO-001:REQ-4:AC-7]
    Given the slo-standards.md standard exists
    When I read the "SLO Document Template" section
    Then it SHALL include these required sections:
      | Section               |
      | Service information   |
      | SLI definition        |
      | SLO target            |
      | Error Budget policy   |
      | Stakeholders          |
      | Review cycle          |

  # --- REQ-5: SLO vs SLA ---

  @SPEC-SLO-001 @AC-6
  Scenario: Clear distinction between SLI, SLO, and SLA
    # [Source: SPEC-SLO-001:REQ-5:AC-6]
    Given the slo-standards.md standard exists
    When I read the "Key Concepts" section
    Then it SHALL define SLI as a measurement indicator for engineering teams
    And it SHALL define SLO as an internal target for engineering teams
    And it SHALL define SLA as an external contract for customers
    And it SHALL explain that violating SLO triggers Error Budget policy
    And it SHALL explain that violating SLA triggers contractual penalties

  @SPEC-SLO-001 @AC-6
  Scenario: SLO should be stricter than SLA
    # [Source: SPEC-SLO-001:REQ-5:AC-6]
    Given the slo-standards.md standard exists
    When I read the SLO vs SLA guidance
    Then it SHALL recommend setting SLO stricter than SLA
    And it SHALL provide an example (e.g., SLA 99.9% → SLO 99.95%)

  # --- REQ-6: Service Type Templates ---

  @SPEC-SLO-001 @AC-5
  Scenario: API service SLO template
    # [Source: SPEC-SLO-001:REQ-6:AC-5]
    Given the slo-standards.md standard exists
    When I read the "API Service Template" subsection
    Then it SHALL provide default SLI/SLO combinations:
      | SLI          | Default SLO |
      | Availability | 99.9%       |
      | Latency      | 99%         |
      | Error rate   | 99.9%       |

  @SPEC-SLO-001 @AC-5
  Scenario: Batch job SLO template
    # [Source: SPEC-SLO-001:REQ-6:AC-5]
    Given the slo-standards.md standard exists
    When I read the "Batch Job Template" subsection
    Then it SHALL provide default SLI/SLO combinations:
      | SLI            | Default SLO |
      | Freshness      | 99.5%       |
      | Correctness    | 99.99%      |
      | Completion rate| 99.9%       |

  @SPEC-SLO-001 @AC-5
  Scenario: Frontend application SLO template
    # [Source: SPEC-SLO-001:REQ-6:AC-5]
    Given the slo-standards.md standard exists
    When I read the "Frontend Application Template" subsection
    Then it SHALL provide default SLI/SLO combinations:
      | SLI                | Default SLO |
      | Load performance   | 90%         |
      | Interaction delay  | 95%         |
      | Visual stability   | 95%         |
