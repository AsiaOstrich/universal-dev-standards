# [Source: docs/specs/SPEC-DEPRECATION-001-deprecation-standards.md]
# [Generated] BDD scenarios for deprecation standards content verification

@SPEC-DEPRECATION-001
Feature: Deprecation & Sunset Standards
  As a developer
  I want a comprehensive deprecation standard covering API retirement, feature sunset, and system decommission
  So that all deprecation activities follow a structured lifecycle

  # --- REQ-1: API Deprecation 流程 ---

  @SPEC-DEPRECATION-001 @AC-1
  Scenario: Sunset timeline defines 6 stages
    # [Source: SPEC-DEPRECATION-001:REQ-1:AC-1]
    Given the deprecation-standards.md standard exists
    When I read the "Sunset Timeline" section
    Then it SHALL define 6 stages: Announce, Deprecate, Migrate, Warn, Sunset, Archive
    And each stage SHALL have a time point and required actions

  @SPEC-DEPRECATION-001 @AC-2
  Scenario: HTTP Deprecation and Sunset headers defined
    # [Source: SPEC-DEPRECATION-001:REQ-1:AC-2]
    Given the deprecation-standards.md standard exists
    When I read the "HTTP Deprecation Headers" section
    Then it SHALL define the Deprecation header format
    And it SHALL define the Sunset header with RFC date format
    And it SHALL define the Link header with rel="successor-version"

  @SPEC-DEPRECATION-001 @AC-3
  Scenario: Version parallel period quantified
    # [Source: SPEC-DEPRECATION-001:REQ-1:AC-3]
    Given the deprecation-standards.md standard exists
    When I read the "Version Parallel Period" section
    Then it SHALL require maintenance for at least 6 months after new version GA
    And it SHALL require maintenance for at least 3 months after last active consumer migrates

  # --- REQ-2: 消費者通知策略 ---

  @SPEC-DEPRECATION-001 @AC-4
  Scenario: At least 5 notification channels defined
    # [Source: SPEC-DEPRECATION-001:REQ-2:AC-4]
    Given the deprecation-standards.md standard exists
    When I read the "Consumer Notification" section
    Then it SHALL define at least 5 notification channels including:
      | Channel              |
      | CHANGELOG            |
      | API Response Header  |
      | Email                |
      | API Documentation    |
      | Dashboard            |

  # --- REQ-3: Feature Sunset ---

  @SPEC-DEPRECATION-001 @AC-5
  Scenario: Feature sunset impact analysis with 5 dimensions
    # [Source: SPEC-DEPRECATION-001:REQ-3:AC-5]
    Given the deprecation-standards.md standard exists
    When I read the "Feature Sunset Impact Analysis" section
    Then it SHALL define 5 analysis dimensions:
      | Dimension   |
      | Usage       |
      | Dependency  |
      | Data        |
      | Contract    |
      | Alternative |

  @SPEC-DEPRECATION-001 @AC-6
  Scenario: Feature sunset execution checklist has at least 8 items
    # [Source: SPEC-DEPRECATION-001:REQ-3:AC-6]
    Given the deprecation-standards.md standard exists
    When I read the "Feature Sunset Execution Checklist" section
    Then it SHALL contain at least 8 checklist items
    And it SHALL include user notification, migration guide, code removal, and documentation update

  # --- REQ-4: 系統退役 (Decommission) ---

  @SPEC-DEPRECATION-001 @AC-7
  Scenario: System decommission defines 7 stages
    # [Source: SPEC-DEPRECATION-001:REQ-4:AC-7]
    Given the deprecation-standards.md standard exists
    When I read the "System Decommission" section
    Then it SHALL define 7 stages:
      | Stage                    |
      | Dependency Analysis      |
      | Consumer Migration       |
      | Data Archival            |
      | DNS/Redirect             |
      | Infrastructure Cleanup   |
      | Monitoring Removal       |
      | Documentation Archival   |

  @SPEC-DEPRECATION-001 @AC-8
  Scenario: Data archival defines retention for 4 data types
    # [Source: SPEC-DEPRECATION-001:REQ-4:AC-8]
    Given the deprecation-standards.md standard exists
    When I read the "Data Archival Strategy" section
    Then it SHALL define retention periods for 4 data types:
      | Data Type          |
      | User Data          |
      | Transaction Records|
      | Logs               |
      | Config/Code        |

  # --- REQ-5: 退役指標 ---

  @SPEC-DEPRECATION-001 @AC-9
  Scenario: Retirement tracking defines 4 metrics
    # [Source: SPEC-DEPRECATION-001:REQ-5:AC-9]
    Given the deprecation-standards.md standard exists
    When I read the "Retirement Metrics" section
    Then it SHALL define 4 tracking metrics:
      | Metric                    |
      | Consumer Migration Rate   |
      | Remaining Traffic         |
      | Dependency Cleanup Rate   |
      | Data Archival Completion  |
