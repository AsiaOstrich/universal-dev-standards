import { describe, it, expect } from 'vitest';
import { computeDiff, formatPlan, createEmptyPlan } from '../../../src/reconciler/diff-engine.js';

/**
 * Helper: build a minimal FileEntry for testing.
 */
function entry(relativePath, hash = null, category = 'standard', metadata = {}) {
  return { relativePath, hash, size: hash ? 100 : null, category, sourcePath: null, metadata };
}

describe('DiffEngine', () => {
  describe('computeDiff', () => {
    it('should return empty plan when both states are empty', () => {
      const desired = { standards: new Map(), options: new Map(), integrations: new Map(), skills: new Map(), commands: new Map() };
      const actual = { standards: new Map(), options: new Map(), integrations: new Map(), skills: new Map(), commands: new Map() };

      const plan = computeDiff(desired, actual);

      expect(plan.actions).toEqual([]);
      expect(plan.summary.create).toBe(0);
      expect(plan.summary.update).toBe(0);
      expect(plan.summary.delete).toBe(0);
      expect(plan.summary.unchanged).toBe(0);
    });

    it('should detect missing files as create actions', () => {
      const desired = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:abc')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.create).toBe(1);
      expect(plan.actions[0].type).toBe('create');
      expect(plan.actions[0].path).toBe('a.yaml');
    });

    it('should detect matching hashes as unchanged', () => {
      const desired = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:same')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:same')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.unchanged).toBe(1);
      expect(plan.actions.length).toBe(0);
    });

    it('should detect hash mismatch as update', () => {
      const desired = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:new')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:old')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.update).toBe(1);
      expect(plan.actions[0].type).toBe('update');
    });

    it('should detect extra UDS files as delete', () => {
      const desired = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map([['a.yaml', entry('.standards/a.yaml', 'sha256:abc')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.delete).toBe(1);
      expect(plan.actions[0].type).toBe('delete');
    });

    it('should force update when --force is used', () => {
      const desired = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:same')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map([['a.yaml', entry('a.yaml', 'sha256:same')]]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual, { force: true });

      expect(plan.summary.update).toBe(1);
      expect(plan.actions[0].reason).toContain('force');
    });

    it('should handle integration files with migrate_block', () => {
      const desired = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map([['CLAUDE.md', entry('CLAUDE.md', null, 'integration', { toolName: 'claude-code', format: 'markdown' })]]),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map([['CLAUDE.md', entry('CLAUDE.md', 'sha256:block123', 'integration', { toolName: 'claude-code', hasMarkers: true, blockHash: { blockHash: 'sha256:block123' } })]]),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.migrate_block).toBeGreaterThan(0);
      const migrateAction = plan.actions.find(a => a.type === 'migrate_block');
      expect(migrateAction).toBeDefined();
      expect(migrateAction.category).toBe('integration');
    });

    it('should create integration when file is missing', () => {
      const desired = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map([['CLAUDE.md', entry('CLAUDE.md', null, 'integration', { toolName: 'claude-code' })]]),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.create).toBe(1);
      expect(plan.actions[0].type).toBe('create');
    });

    it('should warn about non-UDS files in actual but not desired', () => {
      const desired = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map([['CLAUDE.md', entry('CLAUDE.md', null, 'integration', { toolName: 'claude-code', hasMarkers: false })]]),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.warnings.length).toBeGreaterThan(0);
      expect(plan.warnings[0]).toContain('not UDS-managed');
    });

    it('should handle skills without hash tracking', () => {
      const desired = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map([['skill:claude:project:test', entry('.claude/skills/test', null, 'skill', { agent: 'claude', skillName: 'test' })]]),
        commands: new Map()
      };
      const actual = {
        standards: new Map(),
        options: new Map(),
        integrations: new Map(),
        skills: new Map([['skill:claude:project:test', entry('.claude/skills/test', null, 'skill', { agent: 'claude', skillName: 'test' })]]),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      // Skills without hash should be marked for update
      expect(plan.summary.update).toBe(1);
    });

    it('should handle mixed categories', () => {
      const desired = {
        standards: new Map([
          ['a.yaml', entry('a.yaml', 'sha256:new')],
          ['b.yaml', entry('b.yaml', 'sha256:same')]
        ]),
        options: new Map([['opt.yaml', entry('opt.yaml', 'sha256:opt')]]),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };
      const actual = {
        standards: new Map([
          ['a.yaml', entry('a.yaml', 'sha256:old')],
          ['b.yaml', entry('b.yaml', 'sha256:same')],
          ['c.yaml', entry('.standards/c.yaml', 'sha256:extra')]
        ]),
        options: new Map(),
        integrations: new Map(),
        skills: new Map(),
        commands: new Map()
      };

      const plan = computeDiff(desired, actual);

      expect(plan.summary.update).toBe(1);  // a.yaml hash differs
      expect(plan.summary.unchanged).toBe(1); // b.yaml same
      expect(plan.summary.create).toBe(1);  // opt.yaml missing
      expect(plan.summary.delete).toBe(1);  // c.yaml extra
    });
  });

  describe('formatPlan', () => {
    it('should format empty plan', () => {
      const plan = createEmptyPlan();
      const text = formatPlan(plan);

      expect(text).toContain('No changes needed');
    });

    it('should format plan with actions', () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: 'a.yaml', reason: 'missing' },
          { type: 'update', category: 'standard', path: 'b.yaml', reason: 'hash mismatch' },
          { type: 'delete', category: 'standard', path: 'c.yaml', reason: 'not in desired' }
        ],
        summary: { create: 1, update: 1, delete: 1, unchanged: 0, migrate_block: 0 },
        warnings: []
      };

      const text = formatPlan(plan);

      expect(text).toContain('Create (1)');
      expect(text).toContain('Update (1)');
      expect(text).toContain('Delete (1)');
      expect(text).toContain('a.yaml');
    });

    it('should include warnings', () => {
      const plan = {
        actions: [],
        summary: { create: 0, update: 0, delete: 0, unchanged: 5, migrate_block: 0 },
        warnings: ['Something looks odd']
      };

      const text = formatPlan(plan);

      expect(text).toContain('Something looks odd');
    });
  });

  describe('createEmptyPlan', () => {
    it('should return plan with zero counts', () => {
      const plan = createEmptyPlan();

      expect(plan.actions).toEqual([]);
      expect(plan.summary.create).toBe(0);
      expect(plan.summary.update).toBe(0);
      expect(plan.summary.delete).toBe(0);
      expect(plan.summary.unchanged).toBe(0);
      expect(plan.warnings).toEqual([]);
    });
  });
});
