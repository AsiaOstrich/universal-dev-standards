# [Source: docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md]
# [Generated] BDD scenarios for Standards Self-Diagnosis System

@SPEC-SELFDIAG-001
Feature: Standards Self-Diagnosis System
  As a UDS maintainer or consumer
  I want automated health scoring and trend tracking for my standards installation
  So that I can proactively detect quality degradation and improve standards

  # --- REQ-1: Health Score System ---

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Self mode produces health score with 4 dimensions
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-1]
    Given I am in the UDS repository root
    When I run "uds audit --score --self"
    Then the output SHALL contain an overall score between 0 and 100
    And the output SHALL contain scores for "Completeness", "Freshness", "Consistency", "Coverage"

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Consumer mode produces health score
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-1]
    Given I am in a project with UDS initialized
    When I run "uds audit --score"
    Then the output SHALL contain an overall score between 0 and 100
    And the output SHALL contain scores for 4 dimensions

  @SPEC-SELFDIAG-001 @AC-2
  Scenario: JSON output includes mode field
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-2]
    Given I am in a project with UDS initialized
    When I run "uds audit --score --format json"
    Then the output SHALL be valid JSON
    And the JSON SHALL contain fields "score", "dimensions", "mode", "timestamp"

  @SPEC-SELFDIAG-001 @AC-5
  Scenario: CI mode exits with appropriate code
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-5]
    Given I am in a project with UDS initialized
    When I run "uds audit --score --ci --threshold 75"
    Then the exit code SHALL be 0 if score >= 75
    And the exit code SHALL be 1 if score < 75
    And the output SHALL contain only the numeric score

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Error when project not initialized
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-1]
    Given I am in a project without UDS initialized
    When I run "uds audit --score"
    Then the output SHALL contain an error message
    And the output SHALL suggest running "uds init"

  @SPEC-SELFDIAG-001 @AC-15
  Scenario: Graceful failure on corrupted manifest
    # [Source: SPEC-SELFDIAG-001:REQ-1:AC-15]
    Given ".standards/manifest.json" exists but contains invalid JSON
    When I run "uds audit --score"
    Then the exit code SHALL be 1
    And the output SHALL contain an error about manifest parsing
    And the output SHALL suggest running "uds update"

  # --- REQ-2: Four-Dimension Scoring ---

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Self mode completeness checks 5 sub-indicators
    # [Source: SPEC-SELFDIAG-001:REQ-2.1:AC-1]
    Given I am in the UDS repository with "--self" mode
    When the system calculates completeness
    Then it SHALL check for core .md, ai .yaml, skill, check script, and translation
    And the completeness score SHALL reflect the ratio of existing items

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Consumer mode completeness checks manifest vs files
    # [Source: SPEC-SELFDIAG-001:REQ-2.1:AC-1]
    Given I am in a consumer project
    When the system calculates completeness
    Then it SHALL compare manifest-declared standards vs actually existing files
    And the completeness score SHALL reflect the match ratio

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Self mode freshness uses git history
    # [Source: SPEC-SELFDIAG-001:REQ-2.2:AC-1]
    Given I am in the UDS repository with "--self" mode
    When the system calculates freshness
    Then files modified <30 days ago SHALL score 100
    And files modified 30-90 days ago SHALL score 75
    And files modified 90-180 days ago SHALL score 50
    And files modified >180 days ago SHALL score 25

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Consumer mode freshness uses manifest timestamps
    # [Source: SPEC-SELFDIAG-001:REQ-2.2:AC-1]
    Given I am in a consumer project
    When the system calculates freshness
    Then it SHALL compare upstream.version with the latest npm registry version
    And the freshness score SHALL reflect the version gap

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Consistency checks sync status
    # [Source: SPEC-SELFDIAG-001:REQ-2.3:AC-1]
    Given the project has core, ai yaml, and translation layers
    When the system calculates consistency
    Then it SHALL check core-yaml sync, translation sync, and manifest validity
    And the consistency score SHALL reflect the sync ratio

  @SPEC-SELFDIAG-001 @AC-1
  Scenario: Coverage checks verification scripts and tests
    # [Source: SPEC-SELFDIAG-001:REQ-2.4:AC-1]
    Given the project has installed standards
    When the system calculates coverage
    Then it SHALL check for corresponding check scripts and tests per standard
    And the coverage score SHALL reflect the coverage ratio

  # --- REQ-3: Trend Tracking ---

  @SPEC-SELFDIAG-001 @AC-3
  Scenario: Save score snapshot
    # [Source: SPEC-SELFDIAG-001:REQ-3:AC-3]
    Given I run "uds audit --score --save"
    When the score calculation completes
    Then a snapshot file SHALL be saved at ".uds/health-scores/YYYY-MM-DD.json"
    And the file SHALL contain score, dimensions, and timestamp

  @SPEC-SELFDIAG-001 @AC-4
  Scenario: Display trend from history
    # [Source: SPEC-SELFDIAG-001:REQ-3:AC-4]
    Given ".uds/health-scores/" contains multiple historical snapshots
    When I run "uds audit --score --trend"
    Then the output SHALL show score change over time

  @SPEC-SELFDIAG-001 @AC-4
  Scenario: Detect degradation
    # [Source: SPEC-SELFDIAG-001:REQ-3:AC-4]
    Given the latest score dropped more than 5 points from the previous
    When the trend analysis completes
    Then the output SHALL contain a degradation warning
    And it SHALL list the dimension with the largest drop

  # --- REQ-4: Scheduled Self-Diagnosis ---

  @SPEC-SELFDIAG-001 @AC-6
  Scenario: Weekly scheduled execution
    # [Source: SPEC-SELFDIAG-001:REQ-4:AC-6]
    Given ".github/workflows/scheduled-health.yml" is configured
    When the cron triggers at Monday 09:00 UTC
    Then the workflow SHALL run health score, dependency audit, and external reference check

  @SPEC-SELFDIAG-001 @AC-6
  Scenario: Auto-create issue on degradation
    # [Source: SPEC-SELFDIAG-001:REQ-4:AC-6]
    Given the health score is below 75 or dropped more than 5 from last week
    When the scheduled check completes
    Then a GitHub Issue SHALL be created with labels "auto-detected" and "standards-health"

  @SPEC-SELFDIAG-001 @AC-6
  Scenario: Manual workflow dispatch
    # [Source: SPEC-SELFDIAG-001:REQ-4:AC-6]
    Given a developer triggers the workflow manually via workflow_dispatch
    When the workflow executes
    Then it SHALL run the full diagnosis pipeline and produce a report

  # --- REQ-5: External Reference Check ---

  @SPEC-SELFDIAG-001 @AC-7
  Scenario: Detect broken links
    # [Source: SPEC-SELFDIAG-001:REQ-5:AC-7]
    Given standard files contain external URLs
    When the system checks URL reachability with concurrency limit 5 and timeout 10s
    Then unreachable URLs SHALL be reported as "link-rot"

  @SPEC-SELFDIAG-001 @AC-7
  Scenario: Detect outdated version references
    # [Source: SPEC-SELFDIAG-001:REQ-5:AC-7]
    Given standards reference specific technology versions like "Node.js 18"
    When the system compares against known latest versions
    Then outdated version references SHALL be flagged

  @SPEC-SELFDIAG-001 @AC-7
  Scenario: Offline fallback
    # [Source: SPEC-SELFDIAG-001:REQ-5:AC-7]
    Given the execution environment has no network access
    When the system attempts URL reachability checks
    Then it SHALL produce an offline warning
    And it SHALL skip URL checks and only run static version comparisons

  # --- REQ-6: Integration Smoke Tests ---

  @SPEC-SELFDIAG-001 @AC-8
  Scenario: Validate output format for all 13 AI tools
    # [Source: SPEC-SELFDIAG-001:REQ-6:AC-8]
    Given all 13 supported AI tools
    When "uds init" is simulated for each tool in an isolated temp directory
    Then each tool's output file SHALL exist and contain standards references

  @SPEC-SELFDIAG-001 @AC-8
  Scenario: Snapshot comparison
    # [Source: SPEC-SELFDIAG-001:REQ-6:AC-8]
    Given previously recorded output snapshots exist
    When tests re-execute after code changes
    Then outputs SHALL match snapshots or explicitly require snapshot updates

  @SPEC-SELFDIAG-001 @AC-8
  Scenario: Skill file validation
    # [Source: SPEC-SELFDIAG-001:REQ-6:AC-8]
    Given skills are installed for a tool
    When integration tests execute
    Then each skill file SHALL exist and contain valid content (no "undefined" or empty)

  # --- REQ-7: Context-Aware Hook Learning Loop ---

  @SPEC-SELFDIAG-001 @AC-9
  Scenario: Record trigger statistics
    # [Source: SPEC-SELFDIAG-001:REQ-7:AC-9]
    Given the inject-standards.js hook is triggered
    When the hook completes standard matching
    Then a stats entry SHALL be appended to ".uds/hook-stats.jsonl"
    And the entry SHALL contain timestamp, matched_count, matched_standards
    And the entry SHALL NOT contain full prompt content or file paths

  @SPEC-SELFDIAG-001 @AC-9
  Scenario: Opt-out of statistics recording
    # [Source: SPEC-SELFDIAG-001:REQ-7:AC-9]
    Given ".uds/config.json" has "hookStats" set to false
    When the hook is triggered
    Then the hook SHALL operate normally
    And no stats entry SHALL be written

  @SPEC-SELFDIAG-001 @AC-10
  Scenario: Stats write failure does not break hook
    # [Source: SPEC-SELFDIAG-001:REQ-7:AC-10]
    Given the stats file write fails (disk full, permission denied)
    When the hook is triggered
    Then the hook SHALL complete standard injection normally
    And the write failure SHALL be silently ignored

  @SPEC-SELFDIAG-001 @AC-11
  Scenario: Analyze trigger blind spots
    # [Source: SPEC-SELFDIAG-001:REQ-7:AC-11]
    Given ".uds/hook-stats.jsonl" contains >50 entries
    When I run "node scripts/analyze-hook-stats.mjs"
    Then the report SHALL list never-matched standards
    And the report SHALL list common keywords in zero-match prompts
    And the report SHALL include trigger improvement suggestions

  # --- REQ-8: Standards Effectiveness Protocol ---

  @SPEC-SELFDIAG-001 @AC-12
  Scenario: JSON Schema validates effectiveness reports
    # [Source: SPEC-SELFDIAG-001:REQ-8:AC-12]
    Given "specs/standards-effectiveness-schema.json" exists
    When a valid effectiveness report is validated against the schema
    Then validation SHALL pass

  @SPEC-SELFDIAG-001 @AC-13
  Scenario: Aggregate multiple reports
    # [Source: SPEC-SELFDIAG-001:REQ-8:AC-13]
    Given multiple effectiveness reports exist in a directory
    When I run "node scripts/aggregate-effectiveness.mjs <dir>"
    Then the output SHALL contain per-standard usage rate, compliance rate, friction rate

  @SPEC-SELFDIAG-001 @AC-13
  Scenario: Detect recurring unmatched issues
    # [Source: SPEC-SELFDIAG-001:REQ-8:AC-13]
    Given the same issue appears in 3+ reports' "unmatched_issues"
    When the aggregation completes
    Then the issue SHALL be flagged as a "suggested new standard" candidate

  # --- REQ-9: Cross-Product Version Alignment ---

  @SPEC-SELFDIAG-001 @AC-14
  Scenario: Produce version-manifest on release
    # [Source: SPEC-SELFDIAG-001:REQ-9:AC-14]
    Given UDS runs its release process
    When version update completes
    Then ".standards/version-manifest.json" SHALL be produced
    And it SHALL contain "uds_version", "standards_hash", "compatibility"

  @SPEC-SELFDIAG-001 @AC-14
  Scenario: Consumer version drift detection
    # [Source: SPEC-SELFDIAG-001:REQ-9:AC-14]
    Given a consumer project has UDS standards installed
    When CI runs the "check-uds-version-drift" step
    Then it SHALL compare local manifest version with npm registry latest
    And it SHALL warn if drift exceeds 1 minor version
