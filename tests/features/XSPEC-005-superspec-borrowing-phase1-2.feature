# [Source: specs/superspec-borrowing-phase1-2-spec.md]
# [Generated] BDD scenarios for SuperSpec Borrowing Phase 1-2
# [Derived] Refined with concrete examples and business language

@XSPEC-005
Feature: SuperSpec Borrowing — UDS Phase 1-2
  As a UDS developer
  I want to borrow 6 features from SuperSpec framework
  So that UDS gains artifact size control, dependency tracking, dual mode, lint, scoring, and context sync

  # ─── Phase 1A: Artifact Size Control ───

  @XSPEC-005 @AC-1
  Scenario: uds check --spec-size scans specs and reports pass/warn/fail
    # [Source: XSPEC-005:AC-1]
    Given specs/ directory contains the following files:
      | File                  | Effective Lines |
      | SPEC-001-login.md     | 150             |
      | SPEC-002-auth.md      | 350             |
      | SPEC-003-payment.md   | 450             |
    When I run "uds check --spec-size"
    Then the output SHALL contain a table with each spec's name, effective line count, and status:
      | File                  | Lines | Status  |
      | SPEC-001-login.md     | 150   | pass    |
      | SPEC-002-auth.md      | 350   | warning |
      | SPEC-003-payment.md   | 450   | fail    |

  @XSPEC-005 @AC-2
  Scenario Outline: Spec size thresholds classify pass, warning, and fail
    # [Source: XSPEC-005:AC-2]
    Given a spec file with <effective_lines> effective lines
    And the effective line count excludes YAML frontmatter and fenced code blocks
    When I run "uds check --spec-size"
    Then the status SHALL be "<expected_status>"

    Examples:
      | effective_lines | expected_status | reason                      |
      | 250             | pass            | ≤ 300 target                |
      | 300             | pass            | exactly at target boundary  |
      | 301             | warning         | exceeds 300 target          |
      | 400             | warning         | exactly at hard cap boundary|
      | 401             | fail            | exceeds 400 hard cap        |

  @XSPEC-005 @AC-3
  Scenario: Enforce mode blocks implement gate for oversized specs
    # [Source: XSPEC-005:AC-3]
    Given workflow-enforcement is configured with mode "enforce"
    And the current spec has 450 effective lines exceeding the 400-line hard cap
    When the AI attempts to enter the "implement" phase
    Then the gate SHALL block with message:
      """
      STOP — Spec 超過 400 行 hard cap。請先使用 `uds spec split` 或手動拆分為子 specs（用 depends_on 串聯），再進入實作階段。
      """

  # ─── Phase 1B: Spec Dependency Tracking ───

  @XSPEC-005 @AC-4
  Scenario: uds spec deps add updates depends_on field
    # [Source: XSPEC-005:AC-4]
    Given a spec "SPEC-001" exists with "Depends On: none"
    And a spec "SPEC-002" exists
    When I run "uds spec deps add SPEC-001 --on SPEC-002"
    Then SPEC-001 SHALL contain "**Depends On**: SPEC-002"
    And running the same command again SHALL not duplicate SPEC-002

  @XSPEC-005 @AC-5
  Scenario: uds spec deps list shows all dependency relationships
    # [Source: XSPEC-005:AC-5]
    Given the following specs and dependencies exist:
      | Spec     | Depends On        |
      | SPEC-001 | SPEC-002          |
      | SPEC-002 | none              |
      | SPEC-003 | SPEC-001, SPEC-002|
    When I run "uds spec deps list"
    Then the output SHALL display:
      | Spec     | Dependencies       |
      | SPEC-001 | SPEC-002           |
      | SPEC-003 | SPEC-001, SPEC-002 |
    And specs without dependencies SHALL be omitted from the list

  @XSPEC-005 @AC-6
  Scenario: uds spec deps remove removes a dependency
    # [Source: XSPEC-005:AC-6]
    Given a spec "SPEC-001" has "**Depends On**: SPEC-002, SPEC-003"
    When I run "uds spec deps remove SPEC-001 --on SPEC-002"
    Then SPEC-001 SHALL contain "**Depends On**: SPEC-003"
    And SPEC-002 SHALL no longer appear in the depends_on list

  # ─── Phase 1C: Dual Mode + Approach ───

  @XSPEC-005 @AC-7
  Scenario: uds spec create with --boost generates full SDD template
    # [Source: XSPEC-005:AC-7]
    Given the CLI is available
    When I run "uds spec create 'payment gateway' --boost"
    Then the generated spec SHALL contain these sections in order:
      | Section              |
      | Motivation           |
      | Detailed Design      |
      | Acceptance Criteria  |
      | Risks & Trade-offs   |
      | Open Questions       |
    And the header SHALL show "**Spec Mode**: boost"

  @XSPEC-005 @AC-8
  Scenario: uds spec create without --boost keeps micro-spec template
    # [Source: XSPEC-005:AC-8]
    Given the CLI is available
    When I run "uds spec create 'login fix'"
    Then the generated spec SHALL contain these micro-spec fields:
      | Field      |
      | Intent     |
      | Scope      |
      | Acceptance |
      | Confirmed  |
      | Notes      |
    And the header SHALL show "**Spec Mode**: standard"
    And the spec SHALL NOT contain "Motivation" or "Detailed Design" sections

  @XSPEC-005 @AC-9
  Scenario Outline: Boost mode spec includes approach field
    # [Source: XSPEC-005:AC-9]
    Given the CLI is available
    When I run "uds spec create 'feature' --boost --approach <approach>"
    Then the generated spec SHALL contain "**Approach**: <approach>"

    Examples:
      | approach      |
      | conventional  |
      | exploratory   |

  @XSPEC-005 @AC-10
  Scenario: New fields are optional and backward compatible
    # [Source: XSPEC-005:AC-10]
    Given an existing spec in legacy format:
      """
      ## Micro-Spec: Legacy Feature

      **Status**: Draft
      **Created**: 2025-01-01
      **Type**: feature

      **Intent**: Fix the login bug

      **Scope**: cli/src/auth.js

      **Acceptance**:
      - [ ] Login works with valid credentials

      **Confirmed**: No

      **Notes**: none
      """
    When the spec is parsed by the updated micro-spec module
    Then parsing SHALL succeed without errors
    And the defaults SHALL be:
      | Field      | Default Value |
      | depends_on | []            |
      | spec_mode  | standard      |
      | approach   | (undefined)   |

  # ─── Phase 2A: Cross-Reference Validation ───

  @XSPEC-005 @AC-11
  Scenario: uds lint checks AC coverage, dependency validity, and size
    # [Source: XSPEC-005:AC-11]
    Given the following project state:
      | Spec     | ACs  | Tests with @AC tags | Depends On | Effective Lines |
      | SPEC-001 | 3    | 3 (@AC-1..3)        | none       | 250             |
      | SPEC-002 | 3    | 1 (@AC-1 only)      | SPEC-001   | 350             |
      | SPEC-003 | 2    | 0                   | SPEC-099   | 450             |
    When I run "uds lint"
    Then the output SHALL show:
      | Spec     | AC Coverage | Deps              | Size        |
      | SPEC-001 | 3/3 pass    | ok                | 250 pass    |
      | SPEC-002 | 1/3 warn    | ok                | 350 warning |
      | SPEC-003 | 0/2 fail    | SPEC-099 broken   | 450 fail    |

  @XSPEC-005 @AC-12
  Scenario: uds lint --json outputs JSON format
    # [Source: XSPEC-005:AC-12]
    Given specs/ directory contains at least one spec file
    When I run "uds lint --json"
    Then the output SHALL be valid JSON with this structure:
      """
      {
        "results": [
          {
            "spec": "SPEC-001",
            "acCoverage": { "covered": [], "orphans": [], "coverage": 1.0 },
            "deps": { "valid": [], "broken": [] },
            "size": { "effectiveLines": 0, "status": "pass" }
          }
        ],
        "summary": { "pass": 0, "warn": 0, "fail": 0 }
      }
      """

  @XSPEC-005 @AC-13
  Scenario: uds lint --ci exits with code 1 on failure
    # [Source: XSPEC-005:AC-13]
    Given a spec "SPEC-003" with "**Depends On**: SPEC-099"
    And "SPEC-099" does not exist in specs/ directory
    When I run "uds lint --ci"
    Then the exit code SHALL be 1
    And the output SHALL indicate the broken dependency

  # ─── Phase 2B: Checklist Scoring ───

  @XSPEC-005 @AC-14
  Scenario: Spec quality score returns /10 for standard mode
    # [Source: XSPEC-005:AC-14]
    Given a standard-mode spec with the following attributes:
      | Attribute                            | Present |
      | Background and motivation clear      | yes     |
      | Goals measurable                     | yes     |
      | Non-goals explicit                   | no      |
      | Risks identified                     | no      |
      | Impact scope assessed                | yes     |
      | Requirements splittable              | yes     |
      | Boundary conditions identified       | no      |
      | Technical solution concrete          | yes     |
      | Dependencies clear                   | yes     |
      | No blocking open questions           | yes     |
    When the spec quality score is calculated
    Then the result SHALL be "7/10"
    And it SHALL list 10 checklist items with pass/fail for each

  @XSPEC-005 @AC-15
  Scenario: Spec quality score returns /25 for boost mode
    # [Source: XSPEC-005:AC-15]
    Given a boost-mode spec evaluated against 25 checklist items
    And the items include these categories:
      | Category           | Items |
      | Proposal Quality   | 5     |
      | Spec Completeness  | 5     |
      | Spec Consistency   | 5     |
      | Task Executability | 5     |
      | Cross Validation   | 5     |
    When the spec quality score is calculated
    Then the result SHALL have maxScore of 25
    And the cross-validation category SHALL verify proposal-to-spec and spec-to-task traceability

  # ─── Phase 2C: Git-Diff Context Sync ───

  @XSPEC-005 @AC-16
  Scenario: uds sync generates context.md within 500 lines
    # [Source: XSPEC-005:AC-16]
    Given a project with:
      | Attribute          | Value                          |
      | Branch             | feature/payment                |
      | Base branch        | main                           |
      | Commits since base | 5                              |
      | Workflow state      | spec_id: SPEC-001, phase: implement |
    When I run "uds sync"
    Then ".workflow-state/context.md" SHALL be created
    And it SHALL contain "## Git Status" with branch and commit info
    And it SHALL contain "## Workflow State" with spec and phase info
    And the total line count SHALL not exceed 500

  @XSPEC-005 @AC-17
  Scenario: uds sync works without workflow state
    # [Source: XSPEC-005:AC-17]
    Given a project with git history
    And no .workflow-state/ directory exists
    When I run "uds sync"
    Then ".workflow-state/context.md" SHALL be created
    And it SHALL contain "## Git Status" section
    And it SHALL NOT contain "## Workflow State" section

  @XSPEC-005 @AC-18
  Scenario: New YAML sections are well-formed and AI-parseable
    # [Source: XSPEC-005:AC-18]
    Given the following .standards/ YAML files have been updated:
      | File                                       | New Section              |
      | spec-driven-development.ai.yaml            | spec-size-control rule   |
      | spec-driven-development.ai.yaml            | dependency-tracking rule |
      | spec-driven-development.ai.yaml            | checklist-scoring rule   |
      | workflow-enforcement.ai.yaml               | spec_size_within_limit   |
      | workflow-state-protocol.ai.yaml            | spec_mode field          |
      | workflow-state-protocol.ai.yaml            | context-sync rule        |
      | acceptance-criteria-traceability.ai.yaml   | lintable_fields          |
    When each file is parsed by a YAML parser
    Then all files SHALL parse without syntax errors
    And each new section SHALL contain "description" and "when" or "type" fields
