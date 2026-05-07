// [Source: docs/specs/SPEC-AGENT-COMM-001-agent-communication-protocol.md]
// TDD Tests — Agent Communication Protocol v1.0
// [Derived] from 8 Acceptance Criteria

import { describe, it, expect } from 'vitest';
import {
  UNIFIED_STATUSES,
  mapStatus,
  validateEnvelope,
  parseEnvelope,
  createHandoff,
  validateDecisionEntry,
  checkVersion,
} from '../../../src/core/agent-communication-protocol.js';

// ─────────────────────────────────────────────────
// SPEC-AGENT-COMM-001: Agent Communication Protocol
// ─────────────────────────────────────────────────

describe('SPEC-AGENT-COMM-001: Agent Communication Protocol', () => {

  // ═══════════════════════════════════════════════
  // Requirement 1: Status Superset Protocol
  // ═══════════════════════════════════════════════

  describe('AC-1: Status Mapping Completeness', () => {

    it('should map all UDS status codes to unified codes', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-1]
      expect(mapStatus('DONE', 'uds').unified).toBe('success');
      expect(mapStatus('DONE_WITH_CONCERNS', 'uds').unified).toBe('success_partial');
      expect(mapStatus('NEEDS_CONTEXT', 'uds').unified).toBe('needs_context');
      expect(mapStatus('BLOCKED', 'uds').unified).toBe('blocked');
    });

    it('should map all adapter_example_a status codes to unified codes', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-1]
      // adapter_example_a: illustrative seven-state status vocabulary
      expect(mapStatus('success', 'adapter_example_a').unified).toBe('success');
      expect(mapStatus('failed', 'adapter_example_a').unified).toBe('failed');
      expect(mapStatus('skipped', 'adapter_example_a').unified).toBe('skipped');
      expect(mapStatus('timeout', 'adapter_example_a').unified).toBe('timeout');
      expect(mapStatus('done_with_concerns', 'adapter_example_a').unified).toBe('success_partial');
      expect(mapStatus('needs_context', 'adapter_example_a').unified).toBe('needs_context');
      expect(mapStatus('blocked', 'adapter_example_a').unified).toBe('blocked');
    });

    it('should map all adapter_example_b status codes to unified codes', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-1]
      // adapter_example_b: illustrative three-state status vocabulary
      expect(mapStatus('success', 'adapter_example_b').unified).toBe('success');
      expect(mapStatus('partial', 'adapter_example_b').unified).toBe('success_partial');
      expect(mapStatus('failure', 'adapter_example_b').unified).toBe('failed');
    });

    it('should define exactly 8 unified status codes', () => {
      // [Source: SPEC-AGENT-COMM-001:§4.1]
      expect(UNIFIED_STATUSES).toHaveLength(8);
      expect(UNIFIED_STATUSES).toEqual([
        'success', 'success_partial', 'failed', 'blocked',
        'needs_context', 'skipped', 'timeout', 'unknown',
      ]);
    });
  });

  describe('AC-7: Unknown Status Resilience', () => {

    it('should map unknown status to "unknown" with warning', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-7]
      const result = mapStatus('custom_status', 'adapter_example_b');
      expect(result.unified).toBe('unknown');
      expect(result.warning).toBeDefined();
      expect(result.warning.original).toBe('custom_status');
    });

    it('should map unknown project to "unknown" with warning', () => {
      const result = mapStatus('success', 'unknown_project');
      expect(result.unified).toBe('unknown');
      expect(result.warning).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════
  // Requirement 2: Agent Envelope Protocol
  // ═══════════════════════════════════════════════

  describe('AC-2: Envelope Validation', () => {

    const validEnvelope = {
      envelope_version: '1.0',
      message_id: 'msg-550e8400-e29b-41d4-a716',
      source: {
        agent_id: 'builder-001',
        agent_type: 'builder',
        project: 'adapter_example_b',
      },
      status: 'success',
      timestamp: '2026-03-30T10:00:00Z',
      payload: {
        artifact_type: 'code',
        artifact_id: 'art-001',
        content: {},
      },
    };

    it('should accept a valid v1.0 envelope', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-2]
      const result = validateEnvelope(validEnvelope);
      expect(result.valid).toBe(true);
    });

    it('should reject envelope missing required field "status"', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-2]
      const { status, ...incomplete } = validEnvelope;
      const result = validateEnvelope(incomplete);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_ENVELOPE');
      expect(result.missingFields).toContain('status');
    });

    it('should reject envelope with invalid status code', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-2]
      const envelope = { ...validEnvelope, status: 'invalid_status' };
      const result = validateEnvelope(envelope);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_ENVELOPE');
    });

    it('should reject null envelope', () => {
      const result = validateEnvelope(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_ENVELOPE');
    });
  });

  describe('AC-3: Envelope Forward Compatibility', () => {

    it('should parse v1.1 envelope with v1.0 parser (ignore unknown fields)', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-3]
      const v11Envelope = {
        envelope_version: '1.1',
        message_id: 'msg-002',
        source: { agent_id: 'test-001', agent_type: 'test', project: 'uds' },
        status: 'success',
        timestamp: '2026-03-30T10:00:00Z',
        payload: { artifact_type: 'test', artifact_id: 'art-002', content: {} },
        new_field_in_v1_1: 'extra_data',
      };

      const parsed = parseEnvelope(v11Envelope, '1');
      expect(parsed.status).toBe('success');
      expect(parsed.message_id).toBe('msg-002');
      expect(parsed).not.toHaveProperty('new_field_in_v1_1');
      expect(parsed._extra).toEqual({ new_field_in_v1_1: 'extra_data' });
    });
  });

  // ═══════════════════════════════════════════════
  // Requirement 3: Structured Handoff
  // ═══════════════════════════════════════════════

  describe('AC-4: Handoff Artifact Reference', () => {

    it('should create handoff with selective artifact references', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-4]
      const allArtifacts = [
        { artifact_id: 'art-001', artifact_type: 'spec', summary: 'API spec' },
        { artifact_id: 'art-002', artifact_type: 'design', summary: 'Data model' },
        { artifact_id: 'art-003', artifact_type: 'code', summary: 'Implementation' },
      ];

      const handoff = createHandoff({
        from: { agent_id: 'architect-001', agent_type: 'architect', message_id: 'msg-001' },
        to: { agent_type: 'builder' },
        artifactIds: ['art-002'],
        availableArtifacts: allArtifacts,
      });

      expect(handoff.artifacts).toHaveLength(1);
      expect(handoff.artifacts[0].artifact_id).toBe('art-002');
    });
  });

  describe('AC-5: Handoff Decision Traceability', () => {

    it('should include all required fields in decision_log entries', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-5]
      const decisionEntry = {
        decision: '選擇 REST 而非 GraphQL',
        reason: '目標使用者為行動端，REST 快取較好',
        agent_id: 'architect-001',
        timestamp: '2026-03-30T09:55:00Z',
      };

      const result = validateDecisionEntry(decisionEntry);
      expect(result.valid).toBe(true);
    });

    it('should reject decision_log entry missing required fields', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-5]
      const incompleteEntry = { decision: '選擇 REST' };

      const result = validateDecisionEntry(incompleteEntry);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('reason');
      expect(result.missingFields).toContain('agent_id');
      expect(result.missingFields).toContain('timestamp');
    });

    it('should throw when creating handoff with invalid decision_log', () => {
      expect(() => createHandoff({
        from: { agent_id: 'a', agent_type: 'a', message_id: 'm' },
        to: { agent_type: 'b' },
        artifactIds: [],
        availableArtifacts: [],
        decisionLog: [{ decision: 'partial' }],
      })).toThrow('Invalid decision_log entry');
    });
  });

  // ═══════════════════════════════════════════════
  // Requirement 4: Protocol Versioning
  // ═══════════════════════════════════════════════

  describe('AC-6: Version Incompatibility Detection', () => {

    it('should detect incompatible major version', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-6]
      const result = checkVersion('2.0', '1.x');
      expect(result.compatible).toBe(false);
      expect(result.error).toBe('VERSION_INCOMPATIBLE');
      expect(result.supportedRange).toBe('1.x');
    });

    it('should accept compatible minor version', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-6]
      const result = checkVersion('1.3', '1.x');
      expect(result.compatible).toBe(true);
    });

    it('should reject when parseEnvelope receives incompatible version', () => {
      const v2Envelope = {
        envelope_version: '2.0',
        message_id: 'msg-v2',
        source: { agent_id: 'x', agent_type: 'x', project: 'uds' },
        status: 'success',
        timestamp: '2026-03-30T10:00:00Z',
        payload: { artifact_type: 'code', artifact_id: 'a', content: {} },
      };

      expect(() => parseEnvelope(v2Envelope, '1')).toThrow('VERSION_INCOMPATIBLE');
    });
  });

  // ═══════════════════════════════════════════════
  // Cross-Project Integration
  // ═══════════════════════════════════════════════

  describe('AC-8: Cross-Project Round Trip', () => {

    it('should complete adapter_a → adapter_b → adapter_a round trip', () => {
      // [Source: SPEC-AGENT-COMM-001:AC-8]
      // Two illustrative adoption-layer adapters (A and B) exchanging
      // envelopes via the unified protocol.

      // Adapter A creates request
      const request = {
        envelope_version: '1.0',
        message_id: 'msg-adapter-a-001',
        source: { agent_id: 'orchestrator-001', agent_type: 'orchestrator', project: 'adapter_example_a' },
        target: { agent_type: 'builder' },
        status: 'success',
        timestamp: '2026-03-30T10:00:00Z',
        payload: { artifact_type: 'spec', artifact_id: 'art-spec-001', content: {} },
      };

      // Validate request
      expect(validateEnvelope(request).valid).toBe(true);

      // Adapter B responds
      const response = {
        envelope_version: '1.0',
        message_id: 'msg-adapter-b-001',
        source: { agent_id: 'builder-001', agent_type: 'builder', project: 'adapter_example_b' },
        target: { agent_id: 'orchestrator-001', agent_type: 'orchestrator' },
        status: 'success',
        timestamp: '2026-03-30T10:05:00Z',
        payload: { artifact_type: 'code', artifact_id: 'art-code-001', content: {} },
        parent_message_id: request.message_id,
      };

      // Adapter A validates and parses response
      expect(validateEnvelope(response).valid).toBe(true);
      const parsed = parseEnvelope(response);
      expect(parsed.status).toBe('success');
      expect(parsed.payload.artifact_id).toBe('art-code-001');
      expect(parsed.parent_message_id).toBe('msg-adapter-a-001');

      // Map adapter B's status to unified vocabulary
      const mapped = mapStatus(parsed.status, 'adapter_example_b');
      expect(mapped.unified).toBe('success');
    });
  });
});
