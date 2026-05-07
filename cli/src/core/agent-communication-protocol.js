/**
 * Agent Communication Protocol v1.0
 * Source: core/agent-communication-protocol.md
 * Spec: SPEC-AGENT-COMM-001
 */

// ─── Unified Status Codes ────────────────────────────

export const UNIFIED_STATUSES = [
  'success', 'success_partial', 'failed', 'blocked',
  'needs_context', 'skipped', 'timeout', 'unknown',
];

// Reference status mappings. `uds` is UDS's own native status set;
// the other two entries are illustrative example mappings showing how
// adoption-layer runtimes can plug their own status vocabularies into
// the unified status code set. Adoption layers should add their own
// keys (or call mapStatus with their own project name) — these example
// keys are not endorsements of any specific downstream product.
const STATUS_MAP = {
  uds: {
    DONE: 'success',
    DONE_WITH_CONCERNS: 'success_partial',
    NEEDS_CONTEXT: 'needs_context',
    BLOCKED: 'blocked',
  },
  adapter_example_a: {
    success: 'success',
    failed: 'failed',
    skipped: 'skipped',
    timeout: 'timeout',
    done_with_concerns: 'success_partial',
    needs_context: 'needs_context',
    blocked: 'blocked',
  },
  adapter_example_b: {
    success: 'success',
    partial: 'success_partial',
    failure: 'failed',
  },
};

/**
 * Map a project-specific status to unified status code.
 * Unknown statuses map to 'unknown' with a warning.
 * @param {string} status - Project-specific status code
 * @param {string} project - Source project (e.g. 'uds', 'adapter_example_a',
 *   'adapter_example_b', or any custom adoption-layer project key)
 * @returns {{ unified: string, warning?: { original: string, project: string } }}
 */
export function mapStatus(status, project) {
  const projectMap = STATUS_MAP[project];
  if (!projectMap) {
    return {
      unified: 'unknown',
      warning: { original: status, project, reason: `unknown project: ${project}` },
    };
  }

  const unified = projectMap[status];
  if (unified) {
    return { unified };
  }

  return {
    unified: 'unknown',
    warning: { original: status, project, reason: `unmapped status: ${status}` },
  };
}

// ─── Envelope Validation ─────────────────────────────

const REQUIRED_ENVELOPE_FIELDS = [
  'envelope_version',
  'message_id',
  'source',
  'status',
  'timestamp',
  'payload',
];

const REQUIRED_SOURCE_FIELDS = ['agent_id', 'agent_type', 'project'];
const REQUIRED_PAYLOAD_FIELDS = ['artifact_type', 'artifact_id'];
const VALID_ARTIFACT_TYPES = ['spec', 'code', 'test', 'review', 'plan', 'design'];

/**
 * Validate an envelope message against v1.0 schema.
 * @param {object} envelope - The envelope to validate
 * @returns {{ valid: boolean, error?: string, missingFields?: string[] }}
 */
export function validateEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'INVALID_ENVELOPE', missingFields: REQUIRED_ENVELOPE_FIELDS };
  }

  const missing = [];

  for (const field of REQUIRED_ENVELOPE_FIELDS) {
    if (envelope[field] === undefined || envelope[field] === null) {
      missing.push(field);
    }
  }

  if (envelope.source && typeof envelope.source === 'object') {
    for (const field of REQUIRED_SOURCE_FIELDS) {
      if (!envelope.source[field]) {
        missing.push(`source.${field}`);
      }
    }
  }

  if (envelope.payload && typeof envelope.payload === 'object') {
    for (const field of REQUIRED_PAYLOAD_FIELDS) {
      if (!envelope.payload[field]) {
        missing.push(`payload.${field}`);
      }
    }
    if (envelope.payload.artifact_type && !VALID_ARTIFACT_TYPES.includes(envelope.payload.artifact_type)) {
      return {
        valid: false,
        error: 'INVALID_ENVELOPE',
        missingFields: [],
        details: `invalid artifact_type: ${envelope.payload.artifact_type}`,
      };
    }
  }

  if (missing.length > 0) {
    return { valid: false, error: 'INVALID_ENVELOPE', missingFields: missing };
  }

  if (!UNIFIED_STATUSES.includes(envelope.status)) {
    return {
      valid: false,
      error: 'INVALID_ENVELOPE',
      missingFields: [],
      details: `invalid status: ${envelope.status}`,
    };
  }

  return { valid: true };
}

/**
 * Parse an envelope, extracting only v1.0 known fields.
 * Unknown fields are preserved in _extra.
 * @param {object} envelope - Raw envelope
 * @param {string} supportedMajor - Supported major version (e.g. '1')
 * @returns {object} Parsed envelope with _extra for unknown fields
 */
export function parseEnvelope(envelope, supportedMajor = '1') {
  const versionCheck = checkVersion(envelope.envelope_version, `${supportedMajor}.x`);
  if (!versionCheck.compatible) {
    throw new Error(versionCheck.error);
  }

  const knownFields = [
    'envelope_version', 'message_id', 'source', 'target',
    'status', 'timestamp', 'payload',
    'correlation_id', 'parent_message_id', 'metadata', 'concerns',
  ];

  const parsed = {};
  const extra = {};

  for (const [key, value] of Object.entries(envelope)) {
    if (knownFields.includes(key)) {
      parsed[key] = value;
    } else {
      extra[key] = value;
    }
  }

  if (Object.keys(extra).length > 0) {
    parsed._extra = extra;
  }

  return parsed;
}

// ─── Structured Handoff ──────────────────────────────

const REQUIRED_DECISION_FIELDS = ['decision', 'reason', 'agent_id', 'timestamp'];

/**
 * Create a handoff object with selective artifact references.
 * @param {object} options
 * @param {object} options.from - Sender { agent_id, agent_type, message_id }
 * @param {object} options.to - Receiver { agent_type }
 * @param {string[]} options.artifactIds - IDs of artifacts to include
 * @param {object[]} options.availableArtifacts - All available artifacts
 * @param {object[]} [options.decisionLog] - Decision log entries
 * @param {object[]} [options.pendingItems] - Pending items
 * @param {string[]} [options.constraints] - Constraint strings
 * @returns {object} Handoff object
 */
export function createHandoff({ from, to, artifactIds, availableArtifacts, decisionLog, pendingItems, constraints }) {
  const artifacts = availableArtifacts.filter(a => artifactIds.includes(a.artifact_id));

  const handoff = { from, to, artifacts };

  if (decisionLog) {
    for (const entry of decisionLog) {
      const result = validateDecisionEntry(entry);
      if (!result.valid) {
        throw new Error(`Invalid decision_log entry: missing ${result.missingFields.join(', ')}`);
      }
    }
    handoff.decision_log = decisionLog;
  }

  if (pendingItems) {
    handoff.pending_items = pendingItems;
  }

  if (constraints) {
    handoff.constraints = constraints;
  }

  return handoff;
}

/**
 * Validate a decision_log entry.
 * @param {object} entry
 * @returns {{ valid: boolean, missingFields?: string[] }}
 */
export function validateDecisionEntry(entry) {
  const missing = REQUIRED_DECISION_FIELDS.filter(f => !entry[f]);
  if (missing.length > 0) {
    return { valid: false, missingFields: missing };
  }
  return { valid: true };
}

// ─── Protocol Versioning ─────────────────────────────

/**
 * Check if an incoming protocol version is compatible.
 * @param {string} incoming - Incoming version (e.g. '2.0')
 * @param {string} supported - Supported range (e.g. '1.x')
 * @returns {{ compatible: boolean, error?: string, supportedRange?: string }}
 */
export function checkVersion(incoming, supported) {
  const incomingMajor = parseInt(incoming.split('.')[0], 10);
  const supportedMajor = parseInt(supported.split('.')[0], 10);

  if (incomingMajor !== supportedMajor) {
    return {
      compatible: false,
      error: 'VERSION_INCOMPATIBLE',
      supportedRange: supported,
    };
  }

  return { compatible: true };
}
