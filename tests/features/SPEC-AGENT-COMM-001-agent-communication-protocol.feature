# [Source: docs/specs/SPEC-AGENT-COMM-001-agent-communication-protocol.md]
# [Generated] BDD Feature — Agent Communication Protocol v1.0

@SPEC-AGENT-COMM-001
Feature: Agent Communication Protocol
  As a cross-project orchestrator
  I want a unified agent communication protocol
  So that agents from UDS, DevAP, and VibeOps can interoperate seamlessly

  # ──────────────────────────────────────────────
  # Requirement 1: Status Superset Protocol
  # ──────────────────────────────────────────────

  @AC-1
  Scenario: Status mapping completeness
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-1]
    Given the following project-specific status codes exist:
      | Project | Statuses                                                              |
      | UDS     | DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED                     |
      | DevAP   | success, failed, skipped, timeout, done_with_concerns, needs_context, blocked |
      | VibeOps | success, partial, failure                                             |
    When each status code is mapped to the unified status protocol
    Then every project-specific status SHALL have exactly one unified mapping
    And the unified status set SHALL contain: success, success_partial, failed, blocked, needs_context, skipped, timeout, unknown

  @AC-7
  Scenario: Unknown status resilience
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-7]
    Given a message with status code "custom_status" not in the unified status list
    When the receiver parses the message
    Then the status SHALL be mapped to "unknown"
    And a warning log SHALL be recorded with the original status code
    And execution SHALL NOT be interrupted

  # ──────────────────────────────────────────────
  # Requirement 2: Agent Envelope Protocol
  # ──────────────────────────────────────────────

  @AC-2
  Scenario: Envelope validation with all required fields
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-2]
    Given an envelope message with the following fields:
      | Field                | Value                          |
      | envelope_version     | 1.0                            |
      | message_id           | msg-550e8400-e29b-41d4-a716    |
      | source.agent_id      | builder-001                    |
      | source.agent_type    | builder                        |
      | source.project       | vibeops                        |
      | status               | success                        |
      | timestamp            | 2026-03-30T10:00:00Z           |
      | payload.artifact_type| code                           |
      | payload.artifact_id  | art-001                        |
    When the envelope is validated
    Then validation SHALL pass

  @AC-2
  Scenario: Envelope validation rejects missing required fields
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-2]
    Given an envelope message missing the "status" field
    When the envelope is validated
    Then validation SHALL fail with error "INVALID_ENVELOPE"
    And the error message SHALL indicate the missing field name

  @AC-3
  Scenario: Envelope forward compatibility
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-3]
    Given an envelope message with envelope_version "1.1"
    And the message contains an extra field "new_field_in_v1_1" with value "extra"
    And all v1.0 required fields are present
    When a v1.0 receiver parses the message
    Then all v1.0 fields SHALL be parsed correctly
    And the extra field SHALL be ignored without error

  # ──────────────────────────────────────────────
  # Requirement 3: Structured Handoff
  # ──────────────────────────────────────────────

  @AC-4
  Scenario: Handoff with selective artifact reference
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-4]
    Given Agent A produced 3 artifacts with IDs "art-001", "art-002", "art-003"
    When a handoff is created for Agent B referencing only "art-002"
    Then handoff.artifacts length SHALL be 1
    And handoff.artifacts[0].artifact_id SHALL be "art-002"

  @AC-5
  Scenario: Handoff decision traceability
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-5]
    Given a handoff with the following decision_log entry:
      | Field     | Value                              |
      | decision  | 選擇 REST 而非 GraphQL              |
      | reason    | 目標使用者為行動端，REST 快取較好      |
      | agent_id  | architect-001                      |
      | timestamp | 2026-03-30T09:55:00Z               |
    When a downstream agent reads the decision_log
    Then each entry SHALL contain "decision", "reason", "agent_id", "timestamp"
    And the decision chain SHALL be traceable to the originating agent

  # ──────────────────────────────────────────────
  # Requirement 4: Protocol Versioning
  # ──────────────────────────────────────────────

  @AC-6
  Scenario: Version incompatibility detection
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-6]
    Given a receiver that supports protocol versions "1.0" through "1.x"
    When a message with envelope_version "2.0" is received
    Then the receiver SHALL return a "VERSION_INCOMPATIBLE" error
    And the error SHALL include the supported version range "1.x"

  # ──────────────────────────────────────────────
  # Cross-Project Integration
  # ──────────────────────────────────────────────

  @AC-8
  Scenario: Cross-project round trip (DevAP → VibeOps → DevAP)
    # [Source: docs/specs/SPEC-AGENT-COMM-001:AC-8]
    Given DevAP orchestrator creates a task envelope for a VibeOps builder agent
    And the envelope conforms to v1.0 schema
    When VibeOps builder agent completes the task
    And returns a response envelope with status "success"
    Then DevAP SHALL parse the response envelope successfully
    And the status SHALL map to DevAP's internal "success" state
    And the payload.artifact_id SHALL be accessible
