# [Source: docs/specs/SPEC-PM-001-postmortem-standards.md]
# [Generated] BDD scenarios for postmortem standards content verification

@SPEC-PM-001
Feature: Blameless Postmortem Standards
  As an incident commander
  I want a standard for conducting blameless postmortems
  So that incidents produce actionable learnings and prevent recurrence

  # --- REQ-1: Trigger Conditions ---

  @SPEC-PM-001 @AC-1
  Scenario: Mandatory postmortem trigger conditions
    # [Source: SPEC-PM-001:REQ-1:AC-1]
    Given the postmortem-standards.md standard exists
    When I read the "Trigger Conditions" section
    Then it SHALL define mandatory triggers:
      | Condition                              |
      | SEV-1 incident (always)                |
      | SEV-2 incident lasting > 1 hour        |
      | Any incident involving data loss       |
      | Any incident causing SLA breach        |
      | Any incident involving security breach |

  @SPEC-PM-001 @AC-1
  Scenario: Recommended postmortem trigger conditions
    # [Source: SPEC-PM-001:REQ-1:AC-1]
    Given the postmortem-standards.md standard exists
    When I read the "Recommended" triggers subsection
    Then it SHALL include:
      | Condition                                       |
      | SEV-2 incident lasting < 1 hour                 |
      | SEV-3 recurring incident (2+ in 30 days)        |
      | Near-miss with large potential impact            |
      | Team member request                             |

  @SPEC-PM-001 @AC-1
  Scenario: Postmortem exemption conditions
    # [Source: SPEC-PM-001:REQ-1:AC-1]
    Given the postmortem-standards.md standard exists
    When I read the "Exempt" triggers subsection
    Then it SHALL define when postmortem can be skipped

  # --- REQ-2: Blameless Principles ---

  @SPEC-PM-001 @AC-2
  Scenario: Five core blameless beliefs
    # [Source: SPEC-PM-001:REQ-2:AC-2]
    Given the postmortem-standards.md standard exists
    When I read the "Blameless Principles" section
    Then it SHALL define 5 core beliefs:
      | Principle         |
      | Humans make errors|
      | Focus on systems  |
      | Psychological safety |
      | Learning-oriented |
      | Behavior description |

  @SPEC-PM-001 @AC-2
  Scenario: Blameless language examples with do/don't
    # [Source: SPEC-PM-001:REQ-2:AC-2]
    Given the postmortem-standards.md standard exists
    When I read the "Language Guidelines" subsection
    Then it SHALL provide positive examples (system-focused language)
    And it SHALL provide negative examples (blame-focused language)

  # --- REQ-3: Postmortem Execution Process ---

  @SPEC-PM-001 @AC-3
  Scenario: Timeline from incident resolution to final report
    # [Source: SPEC-PM-001:REQ-3:AC-3]
    Given the postmortem-standards.md standard exists
    When I read the "Postmortem Process" section
    Then it SHALL define 5 milestones:
      | Milestone               | Deadline                     |
      | Collect timeline        | Within 24 hours of resolution|
      | Write draft             | Within 48 hours of resolution|
      | Hold meeting            | Within 3 business days       |
      | Finalize and publish    | Within 24 hours of meeting   |
      | Track action items      | Ongoing                      |

  @SPEC-PM-001 @AC-4
  Scenario: Meeting facilitation with 6 agenda items
    # [Source: SPEC-PM-001:REQ-3:AC-4]
    Given the postmortem-standards.md standard exists
    When I read the "Meeting Facilitation Guide" subsection
    Then it SHALL define 6 meeting segments:
      | Segment            | Duration |
      | Opening            | 5 min    |
      | Timeline review    | 15 min   |
      | Impact assessment  | 10 min   |
      | Root cause analysis| 20 min   |
      | Improvement ideas  | 15 min   |
      | Summary            | 5 min    |

  # --- REQ-4: Root Cause Analysis Methods ---

  @SPEC-PM-001 @AC-5
  Scenario: At least 5 RCA methods with applicable scenarios
    # [Source: SPEC-PM-001:REQ-4:AC-5]
    Given the postmortem-standards.md standard exists
    When I read the "Root Cause Analysis Methods" section
    Then it SHALL define at least 5 methods:
      | Method            | Use Case                          |
      | 5 Whys            | Linear causation, single root     |
      | Ishikawa          | Multi-factor, categorized         |
      | Fault Tree (FTA)  | Complex systems, multi-path       |
      | Timeline Analysis | Time-dependent, multi-participant |
      | Change Analysis   | Recent change caused issue        |

  @SPEC-PM-001 @AC-5
  Scenario: Distinction between root cause, trigger, and contributing factor
    # [Source: SPEC-PM-001:REQ-4:AC-5]
    Given the postmortem-standards.md standard exists
    When I read the "Root Cause vs Trigger vs Contributing Factor" subsection
    Then it SHALL define:
      | Type          | Definition                                |
      | Root Cause    | If removed, incident would not have occurred |
      | Trigger       | Event that directly caused the incident     |
      | Contributing  | Worsened impact but not the root cause      |

  # --- REQ-5: Enhanced Postmortem Template ---

  @SPEC-PM-001 @AC-6
  Scenario: Template has 10 sections
    # [Source: SPEC-PM-001:REQ-5:AC-6]
    Given the postmortem-standards.md standard exists
    When I read the full postmortem template
    Then it SHALL contain these 10 sections:
      | Section                        |
      | Summary                        |
      | Impact assessment              |
      | Timeline                       |
      | Root cause analysis            |
      | Detection and response review  |
      | What went well                 |
      | What needs improvement         |
      | Action items                   |
      | Related documents              |
      | Review record                  |

  # --- REQ-6: Action Items Lifecycle ---

  @SPEC-PM-001 @AC-7
  Scenario: Action items classification in 4 types
    # [Source: SPEC-PM-001:REQ-6:AC-7]
    Given the postmortem-standards.md standard exists
    When I read the "Action Items Lifecycle" section
    Then it SHALL classify actions into 4 types:
      | Type     | Purpose                    |
      | Prevent  | Prevent root cause recurrence |
      | Detect   | Detect problem earlier       |
      | Mitigate | Reduce impact scope and time |
      | Process  | Improve response procedures  |

  @SPEC-PM-001 @AC-7
  Scenario: Action items status tracking with 5 states
    # [Source: SPEC-PM-001:REQ-6:AC-7]
    Given the postmortem-standards.md standard exists
    When I read the status tracking guidance
    Then it SHALL define 5 states:
      | State       |
      | Open        |
      | In Progress |
      | Done        |
      | Verified    |
      | Blocked     |

  @SPEC-PM-001 @AC-7
  Scenario: Overdue action item handling
    # [Source: SPEC-PM-001:REQ-6:AC-7]
    Given the postmortem-standards.md standard exists
    When I read the overdue handling guidance
    Then it SHALL define escalation at 7, 14, and 30 day overdue marks

  # --- REQ-7: Organizational Learning ---

  @SPEC-PM-001 @AC-8
  Scenario: Incident trend analysis with 5 dimensions
    # [Source: SPEC-PM-001:REQ-7:AC-8]
    Given the postmortem-standards.md standard exists
    When I read the "Organizational Learning" section
    Then it SHALL define 5 trend analysis dimensions:
      | Dimension                    |
      | Root cause type distribution |
      | Service distribution         |
      | MTTR trend                   |
      | MTTD trend                   |
      | Recurring root cause ratio   |

  @SPEC-PM-001 @AC-8
  Scenario: Learning-to-standards pipeline
    # [Source: SPEC-PM-001:REQ-7:AC-8]
    Given the postmortem-standards.md standard exists
    When I read the "Learning-to-Standards Pipeline" subsection
    Then it SHALL describe how trend findings translate to:
      | Output                      |
      | Updated core standards      |
      | New or updated runbooks     |
      | Modified alert rules        |
      | Retrospective discussion    |

  # --- REQ-8: Simplified Postmortem ---

  @SPEC-PM-001 @AC-9
  Scenario: Simplified template with 5 fields
    # [Source: SPEC-PM-001:REQ-8:AC-9]
    Given the postmortem-standards.md standard exists
    When I read the "Simplified Template" subsection
    Then it SHALL require only 5 fields:
      | Field                |
      | Date/severity/duration|
      | Root cause (1 line)  |
      | Fix (1 line)         |
      | Action items         |
      | Related links        |
