import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
// Future: import { config } from '../utils/config-manager.js';
import { MicroSpec } from '../vibe/micro-spec.js';

/**
 * Mission types supported by UDS
 */
export const MissionType = {
  GENESIS: 'genesis',      // New project from scratch (greenfield)
  RENOVATE: 'renovate',    // Refactor/improve existing code
  MEDIC: 'medic',          // Fix bugs, debug issues
  EXODUS: 'exodus',        // Migration (framework, language, etc.)
  GUARDIAN: 'guardian'     // Security audit, compliance check
};

/**
 * Mission states for the state machine
 */
export const MissionState = {
  CREATED: 'created',
  PLANNING: 'planning',
  SPEC_PENDING: 'spec_pending',
  SPEC_CONFIRMED: 'spec_confirmed',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

/**
 * Valid state transitions
 */
const STATE_TRANSITIONS = {
  [MissionState.CREATED]: [MissionState.PLANNING, MissionState.CANCELLED],
  [MissionState.PLANNING]: [MissionState.SPEC_PENDING, MissionState.PAUSED, MissionState.CANCELLED],
  [MissionState.SPEC_PENDING]: [MissionState.SPEC_CONFIRMED, MissionState.PLANNING, MissionState.CANCELLED],
  [MissionState.SPEC_CONFIRMED]: [MissionState.IN_PROGRESS, MissionState.PAUSED, MissionState.CANCELLED],
  [MissionState.IN_PROGRESS]: [MissionState.REVIEW, MissionState.PAUSED, MissionState.CANCELLED],
  [MissionState.REVIEW]: [MissionState.COMPLETED, MissionState.IN_PROGRESS, MissionState.CANCELLED],
  [MissionState.PAUSED]: [MissionState.PLANNING, MissionState.IN_PROGRESS, MissionState.CANCELLED],
  [MissionState.COMPLETED]: [],
  [MissionState.CANCELLED]: []
};

/**
 * MissionManager - State machine for goal-oriented development
 *
 * Manages mission lifecycle:
 * created → planning → spec_pending → spec_confirmed → in_progress → review → completed
 */
export class MissionManager {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.missionsDir = join(this.cwd, '.uds', 'missions');
    this.currentMissionFile = join(this.missionsDir, 'current.json');
    this.historyDir = join(this.missionsDir, 'history');
    this.microSpec = new MicroSpec({ cwd: this.cwd });
  }

  /**
   * Generate unique mission ID
   * @param {string} type - Mission type
   * @returns {string} Mission ID
   */
  generateId(type) {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}-${date}-${random}`;
  }

  /**
   * Create a new mission
   * @param {string} type - Mission type (genesis, renovate, medic, exodus, guardian)
   * @param {string} intent - Natural language description of the goal
   * @param {Object} options - Additional options
   * @returns {Object} Created mission object
   */
  create(type, intent, options = {}) {
    // Validate mission type
    const validTypes = Object.values(MissionType);
    const normalizedType = type.toLowerCase();

    if (!validTypes.includes(normalizedType)) {
      throw new Error(`Invalid mission type: ${type}. Valid types: ${validTypes.join(', ')}`);
    }

    // Check for active mission
    const current = this.getCurrent();
    if (current && !this.isTerminalState(current.state)) {
      throw new Error(`Active mission exists: ${current.id}. Complete or cancel it first.`);
    }

    // Ensure directories exist
    mkdirSync(this.missionsDir, { recursive: true });
    mkdirSync(this.historyDir, { recursive: true });

    const mission = {
      id: this.generateId(normalizedType),
      type: normalizedType,
      intent,
      state: MissionState.CREATED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      specs: [],
      checkpoints: [],
      metadata: options.metadata || {}
    };

    // Save as current mission
    writeFileSync(this.currentMissionFile, JSON.stringify(mission, null, 2));

    return mission;
  }

  /**
   * Get current active mission
   * @returns {Object|null} Current mission or null
   */
  getCurrent() {
    if (!existsSync(this.currentMissionFile)) {
      return null;
    }

    try {
      return JSON.parse(readFileSync(this.currentMissionFile, 'utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Get mission by ID from history
   * @param {string} id - Mission ID
   * @returns {Object|null} Mission or null
   */
  get(id) {
    // Check current mission first
    const current = this.getCurrent();
    if (current && current.id === id) {
      return current;
    }

    // Check history
    const historyFile = join(this.historyDir, `${id}.json`);
    if (existsSync(historyFile)) {
      try {
        return JSON.parse(readFileSync(historyFile, 'utf8'));
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Check if state is terminal (completed or cancelled)
   * @param {string} state - Mission state
   * @returns {boolean}
   */
  isTerminalState(state) {
    return state === MissionState.COMPLETED || state === MissionState.CANCELLED;
  }

  /**
   * Check if transition is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean}
   */
  canTransition(fromState, toState) {
    const allowedTransitions = STATE_TRANSITIONS[fromState];
    return allowedTransitions && allowedTransitions.includes(toState);
  }

  /**
   * Transition mission to new state
   * @param {string} toState - Target state
   * @param {Object} options - Transition options
   * @returns {Object} Updated mission
   */
  transition(toState, options = {}) {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    if (!this.canTransition(mission.state, toState)) {
      throw new Error(
        `Invalid transition: ${mission.state} → ${toState}. ` +
        `Allowed: ${STATE_TRANSITIONS[mission.state].join(', ') || 'none'}`
      );
    }

    const previousState = mission.state;
    mission.state = toState;
    mission.updatedAt = new Date().toISOString();

    // Add checkpoint
    mission.checkpoints.push({
      timestamp: mission.updatedAt,
      fromState: previousState,
      toState,
      reason: options.reason || '',
      metadata: options.metadata || {}
    });

    // Handle terminal states
    if (this.isTerminalState(toState)) {
      this.archiveMission(mission);
    } else {
      writeFileSync(this.currentMissionFile, JSON.stringify(mission, null, 2));
    }

    return mission;
  }

  /**
   * Archive completed/cancelled mission to history
   * @param {Object} mission - Mission to archive
   */
  archiveMission(mission) {
    mkdirSync(this.historyDir, { recursive: true });

    const historyFile = join(this.historyDir, `${mission.id}.json`);
    writeFileSync(historyFile, JSON.stringify(mission, null, 2));

    // Remove current mission file
    if (existsSync(this.currentMissionFile)) {
      unlinkSync(this.currentMissionFile);
    }
  }

  /**
   * Add a step to the current mission
   * @param {Object} step - Step object
   * @returns {Object} Updated mission
   */
  addStep(step) {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    const stepWithId = {
      id: `step-${mission.steps.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...step
    };

    mission.steps.push(stepWithId);
    mission.updatedAt = new Date().toISOString();
    writeFileSync(this.currentMissionFile, JSON.stringify(mission, null, 2));

    return mission;
  }

  /**
   * Update step status
   * @param {string} stepId - Step ID
   * @param {string} status - New status (pending, in_progress, completed, failed)
   * @param {Object} result - Optional result data
   * @returns {Object} Updated mission
   */
  updateStep(stepId, status, result = null) {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    const step = mission.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    step.status = status;
    step.updatedAt = new Date().toISOString();
    if (result) {
      step.result = result;
    }

    mission.updatedAt = new Date().toISOString();
    writeFileSync(this.currentMissionFile, JSON.stringify(mission, null, 2));

    return mission;
  }

  /**
   * Link a micro-spec to the mission
   * @param {string} specId - Micro-spec ID
   * @returns {Object} Updated mission
   */
  linkSpec(specId) {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    // Verify spec exists
    const spec = this.microSpec.get(specId);
    if (!spec) {
      throw new Error(`Micro-spec not found: ${specId}`);
    }

    if (!mission.specs.includes(specId)) {
      mission.specs.push(specId);
      mission.updatedAt = new Date().toISOString();
      writeFileSync(this.currentMissionFile, JSON.stringify(mission, null, 2));
    }

    return mission;
  }

  /**
   * Get mission status summary
   * @returns {Object} Status summary
   */
  getStatus() {
    const mission = this.getCurrent();
    if (!mission) {
      return {
        active: false,
        message: 'No active mission'
      };
    }

    const completedSteps = mission.steps.filter(s => s.status === 'completed').length;
    const totalSteps = mission.steps.length;

    return {
      active: true,
      id: mission.id,
      type: mission.type,
      state: mission.state,
      intent: mission.intent,
      progress: totalSteps > 0 ? `${completedSteps}/${totalSteps} steps` : 'No steps defined',
      specs: mission.specs.length,
      startedAt: mission.createdAt,
      lastUpdate: mission.updatedAt
    };
  }

  /**
   * List all missions from history
   * @param {Object} options - Filter options
   * @returns {Array} List of missions
   */
  list(options = {}) {
    const missions = [];

    // Add current mission if exists
    const current = this.getCurrent();
    if (current) {
      missions.push({ ...current, isCurrent: true });
    }

    // Add historical missions
    if (existsSync(this.historyDir)) {
      const files = readdirSync(this.historyDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const mission = JSON.parse(readFileSync(join(this.historyDir, file), 'utf8'));
            missions.push({ ...mission, isCurrent: false });
          } catch {
            // Skip invalid files
          }
        }
      }
    }

    // Apply filters
    let filtered = missions;

    if (options.type) {
      filtered = filtered.filter(m => m.type === options.type);
    }

    if (options.state) {
      filtered = filtered.filter(m => m.state === options.state);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }

  /**
   * Pause current mission
   * @param {string} reason - Reason for pausing
   * @returns {Object} Updated mission
   */
  pause(reason = '') {
    return this.transition(MissionState.PAUSED, { reason });
  }

  /**
   * Resume paused mission
   * @returns {Object} Updated mission
   */
  resume() {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    if (mission.state !== MissionState.PAUSED) {
      throw new Error('Mission is not paused');
    }

    // Resume to previous state before pause
    const lastCheckpoint = [...mission.checkpoints].reverse().find(
      cp => cp.toState === MissionState.PAUSED
    );

    const resumeState = lastCheckpoint?.fromState || MissionState.PLANNING;
    return this.transition(resumeState, { reason: 'Resumed from pause' });
  }

  /**
   * Cancel current mission
   * @param {string} reason - Reason for cancellation
   * @returns {Object} Cancelled mission
   */
  cancel(reason = '') {
    return this.transition(MissionState.CANCELLED, { reason });
  }

  /**
   * Complete current mission
   * @param {Object} summary - Completion summary
   * @returns {Object} Completed mission
   */
  complete(summary = {}) {
    const mission = this.getCurrent();
    if (!mission) {
      throw new Error('No active mission found');
    }

    // Must be in review state to complete
    if (mission.state !== MissionState.REVIEW) {
      throw new Error('Mission must be in review state to complete');
    }

    mission.completionSummary = {
      ...summary,
      completedAt: new Date().toISOString()
    };

    return this.transition(MissionState.COMPLETED, {
      reason: summary.notes || 'Mission completed'
    });
  }

  /**
   * Get workflow suggestions based on mission type
   * @param {string} type - Mission type
   * @returns {Object} Workflow configuration
   */
  getWorkflowConfig(type) {
    const configs = {
      [MissionType.GENESIS]: {
        steps: ['scaffold', 'setup', 'implement', 'test', 'document'],
        hitlThreshold: 2,
        autoSpec: true,
        description: 'Create a new project from scratch'
      },
      [MissionType.RENOVATE]: {
        steps: ['analyze', 'plan', 'refactor', 'test', 'review'],
        hitlThreshold: 2,
        autoSpec: true,
        description: 'Refactor and improve existing code'
      },
      [MissionType.MEDIC]: {
        steps: ['diagnose', 'reproduce', 'fix', 'verify', 'prevent'],
        hitlThreshold: 1,
        autoSpec: false,
        description: 'Debug and fix issues'
      },
      [MissionType.EXODUS]: {
        steps: ['audit', 'plan', 'migrate', 'validate', 'cleanup'],
        hitlThreshold: 1,
        autoSpec: true,
        description: 'Migrate to new technology/framework'
      },
      [MissionType.GUARDIAN]: {
        steps: ['scan', 'assess', 'remediate', 'verify', 'report'],
        hitlThreshold: 1,
        autoSpec: false,
        description: 'Security audit and compliance check'
      }
    };

    return configs[type] || null;
  }
}
