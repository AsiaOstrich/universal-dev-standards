import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MissionManager, MissionType, MissionState } from '../../../src/missions/MissionManager.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Mock modules
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn()
}));

vi.mock('../../../src/vibe/micro-spec.js', () => {
  return {
    MicroSpec: class MockMicroSpec {
      get(specId) {
        if (specId === 'non-existent-spec') return null;
        return { id: specId, title: 'Test Spec' };
      }
    }
  };
});

describe('MissionType', () => {
  it('should have all expected mission types', () => {
    expect(MissionType.GENESIS).toBe('genesis');
    expect(MissionType.RENOVATE).toBe('renovate');
    expect(MissionType.MEDIC).toBe('medic');
    expect(MissionType.EXODUS).toBe('exodus');
    expect(MissionType.GUARDIAN).toBe('guardian');
  });
});

describe('MissionState', () => {
  it('should have all expected state values', () => {
    expect(MissionState.CREATED).toBe('created');
    expect(MissionState.PLANNING).toBe('planning');
    expect(MissionState.SPEC_PENDING).toBe('spec_pending');
    expect(MissionState.SPEC_CONFIRMED).toBe('spec_confirmed');
    expect(MissionState.IN_PROGRESS).toBe('in_progress');
    expect(MissionState.REVIEW).toBe('review');
    expect(MissionState.COMPLETED).toBe('completed');
    expect(MissionState.PAUSED).toBe('paused');
    expect(MissionState.CANCELLED).toBe('cancelled');
  });
});

describe('MissionManager', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new MissionManager({ cwd: '/test/project' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should use default cwd if not provided', () => {
      const defaultManager = new MissionManager();
      expect(defaultManager.cwd).toBe(process.cwd());
    });

    it('should set correct directories', () => {
      expect(manager.missionsDir).toBe(join('/test/project', '.uds', 'missions'));
      expect(manager.historyDir).toBe(join('/test/project', '.uds', 'missions', 'history'));
    });
  });

  describe('generateId', () => {
    it('should generate ID with type and date prefix', () => {
      const id = manager.generateId('genesis');
      expect(id).toMatch(/^genesis-\d{4}-\d{2}-\d{2}-[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = manager.generateId('genesis');
      const id2 = manager.generateId('genesis');
      // Random parts should be different
      expect(id1.split('-').pop()).not.toBe(id2.split('-').pop());
    });
  });

  describe('create', () => {
    it('should create a new mission', () => {
      existsSync.mockReturnValue(false);

      const mission = manager.create('genesis', 'Build a new app');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
      expect(mission.type).toBe('genesis');
      expect(mission.intent).toBe('Build a new app');
      expect(mission.state).toBe(MissionState.CREATED);
    });

    it('should throw error for invalid mission type', () => {
      existsSync.mockReturnValue(false);

      expect(() => manager.create('invalid', 'Test'))
        .toThrow('Invalid mission type');
    });

    it('should throw error if active mission exists', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'existing-mission',
        state: MissionState.IN_PROGRESS
      }));

      expect(() => manager.create('genesis', 'New mission'))
        .toThrow('Active mission exists');
    });

    it('should allow creating mission if previous is completed', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'completed-mission',
        state: MissionState.COMPLETED
      }));

      const mission = manager.create('renovate', 'Refactor code');
      expect(mission.type).toBe('renovate');
    });
  });

  describe('getCurrent', () => {
    it('should return null if no current mission', () => {
      existsSync.mockReturnValue(false);

      const result = manager.getCurrent();
      expect(result).toBeNull();
    });

    it('should return current mission', () => {
      existsSync.mockReturnValue(true);
      const missionData = {
        id: 'test-mission',
        type: 'genesis',
        state: MissionState.PLANNING
      };
      readFileSync.mockReturnValue(JSON.stringify(missionData));

      const result = manager.getCurrent();
      expect(result.id).toBe('test-mission');
    });
  });

  describe('get', () => {
    it('should return current mission by ID', () => {
      existsSync.mockReturnValue(true);
      const missionData = { id: 'current-id', type: 'genesis' };
      readFileSync.mockReturnValue(JSON.stringify(missionData));

      const result = manager.get('current-id');
      expect(result.id).toBe('current-id');
    });

    it('should return mission from history', () => {
      existsSync.mockImplementation((path) => {
        if (path.includes('current.json')) return true;
        if (path.includes('history')) return true;
        return false;
      });

      // Current mission has different ID
      readFileSync.mockImplementation((path) => {
        if (path.includes('current.json')) {
          return JSON.stringify({ id: 'different-id' });
        }
        return JSON.stringify({ id: 'history-id', type: 'medic' });
      });

      const result = manager.get('history-id');
      expect(result.id).toBe('history-id');
    });

    it('should return null for non-existent mission', () => {
      existsSync.mockReturnValue(false);

      const result = manager.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('isTerminalState', () => {
    it('should return true for completed state', () => {
      expect(manager.isTerminalState(MissionState.COMPLETED)).toBe(true);
    });

    it('should return true for cancelled state', () => {
      expect(manager.isTerminalState(MissionState.CANCELLED)).toBe(true);
    });

    it('should return false for non-terminal states', () => {
      expect(manager.isTerminalState(MissionState.CREATED)).toBe(false);
      expect(manager.isTerminalState(MissionState.PLANNING)).toBe(false);
      expect(manager.isTerminalState(MissionState.IN_PROGRESS)).toBe(false);
    });
  });

  describe('canTransition', () => {
    it('should allow valid transitions', () => {
      expect(manager.canTransition(MissionState.CREATED, MissionState.PLANNING)).toBe(true);
      expect(manager.canTransition(MissionState.PLANNING, MissionState.SPEC_PENDING)).toBe(true);
      expect(manager.canTransition(MissionState.IN_PROGRESS, MissionState.REVIEW)).toBe(true);
    });

    it('should disallow invalid transitions', () => {
      expect(manager.canTransition(MissionState.CREATED, MissionState.COMPLETED)).toBe(false);
      expect(manager.canTransition(MissionState.COMPLETED, MissionState.PLANNING)).toBe(false);
    });
  });

  describe('transition', () => {
    it('should transition to valid state', () => {
      existsSync.mockReturnValue(true);
      const missionData = {
        id: 'test-mission',
        state: MissionState.CREATED,
        checkpoints: []
      };
      readFileSync.mockReturnValue(JSON.stringify(missionData));

      const result = manager.transition(MissionState.PLANNING);

      expect(result.state).toBe(MissionState.PLANNING);
      expect(result.checkpoints).toHaveLength(1);
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should throw error for invalid transition', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        state: MissionState.CREATED,
        checkpoints: []
      }));

      expect(() => manager.transition(MissionState.COMPLETED))
        .toThrow('Invalid transition');
    });

    it('should throw error when no active mission', () => {
      existsSync.mockReturnValue(false);

      expect(() => manager.transition(MissionState.PLANNING))
        .toThrow('No active mission found');
    });
  });

  describe('addStep', () => {
    it('should add step to mission', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        steps: [],
        updatedAt: new Date().toISOString()
      }));

      const result = manager.addStep({ description: 'Test step' });

      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].description).toBe('Test step');
      expect(result.steps[0].id).toBe('step-1');
    });

    it('should throw error when no active mission', () => {
      existsSync.mockReturnValue(false);

      expect(() => manager.addStep({ description: 'Test' }))
        .toThrow('No active mission found');
    });
  });

  describe('updateStep', () => {
    it('should update step status', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        steps: [{ id: 'step-1', status: 'pending' }],
        updatedAt: new Date().toISOString()
      }));

      const result = manager.updateStep('step-1', 'completed');

      expect(result.steps[0].status).toBe('completed');
    });

    it('should throw error for non-existent step', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        steps: [],
        updatedAt: new Date().toISOString()
      }));

      expect(() => manager.updateStep('non-existent', 'completed'))
        .toThrow('Step not found');
    });
  });

  describe('linkSpec', () => {
    it('should link spec to mission', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        specs: [],
        updatedAt: new Date().toISOString()
      }));

      const result = manager.linkSpec('test-spec');

      expect(result.specs).toContain('test-spec');
    });

    it('should not duplicate spec links', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        specs: ['test-spec'],
        updatedAt: new Date().toISOString()
      }));

      const result = manager.linkSpec('test-spec');

      expect(result.specs.filter(s => s === 'test-spec')).toHaveLength(1);
    });
  });

  describe('getStatus', () => {
    it('should return inactive status when no mission', () => {
      existsSync.mockReturnValue(false);

      const status = manager.getStatus();

      expect(status.active).toBe(false);
      expect(status.message).toBe('No active mission');
    });

    it('should return active status with details', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test-mission',
        type: 'genesis',
        state: MissionState.PLANNING,
        intent: 'Build app',
        steps: [
          { status: 'completed' },
          { status: 'pending' }
        ],
        specs: ['spec-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const status = manager.getStatus();

      expect(status.active).toBe(true);
      expect(status.id).toBe('test-mission');
      expect(status.type).toBe('genesis');
      expect(status.progress).toBe('1/2 steps');
    });
  });

  describe('list', () => {
    it('should return empty array when no missions', () => {
      existsSync.mockReturnValue(false);

      const missions = manager.list();

      expect(missions).toEqual([]);
    });

    it('should filter by type', () => {
      existsSync.mockImplementation(() => true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'genesis-mission',
        type: 'genesis',
        createdAt: new Date().toISOString()
      }));
      readdirSync.mockReturnValue([]);

      const missions = manager.list({ type: 'renovate' });

      expect(missions).toHaveLength(0);
    });
  });

  describe('pause', () => {
    it('should pause mission', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        state: MissionState.IN_PROGRESS,
        checkpoints: []
      }));

      const result = manager.pause('Taking a break');

      expect(result.state).toBe(MissionState.PAUSED);
    });
  });

  describe('cancel', () => {
    it('should cancel mission', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        id: 'test',
        state: MissionState.PLANNING,
        checkpoints: []
      }));

      const result = manager.cancel('No longer needed');

      expect(result.state).toBe(MissionState.CANCELLED);
    });
  });

  describe('getWorkflowConfig', () => {
    it('should return config for genesis mission', () => {
      const config = manager.getWorkflowConfig(MissionType.GENESIS);

      expect(config).not.toBeNull();
      expect(config.steps).toContain('scaffold');
      expect(config.autoSpec).toBe(true);
    });

    it('should return config for medic mission', () => {
      const config = manager.getWorkflowConfig(MissionType.MEDIC);

      expect(config).not.toBeNull();
      expect(config.steps).toContain('diagnose');
      expect(config.autoSpec).toBe(false);
    });

    it('should return null for invalid type', () => {
      const config = manager.getWorkflowConfig('invalid');

      expect(config).toBeNull();
    });
  });
});
