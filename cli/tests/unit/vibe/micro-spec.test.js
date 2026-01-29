import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MicroSpec, SpecStatus } from '../../../src/vibe/micro-spec.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'node:fs';
import { join } from 'node:path';

// Mock modules
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  renameSync: vi.fn()
}));

vi.mock('../../../src/utils/config-manager.js', () => ({
  config: {
    get: vi.fn().mockReturnValue({
      generate: true,
      requireConfirmation: true,
      storage: '.uds/micro-specs/'
    })
  }
}));

describe('SpecStatus', () => {
  it('should have all expected status values', () => {
    expect(SpecStatus.DRAFT).toBe('draft');
    expect(SpecStatus.CONFIRMED).toBe('confirmed');
    expect(SpecStatus.ACTIVE).toBe('active');
    expect(SpecStatus.COMPLETED).toBe('completed');
    expect(SpecStatus.ARCHIVED).toBe('archived');
  });
});

describe('MicroSpec', () => {
  let microSpec;

  beforeEach(() => {
    vi.clearAllMocks();
    microSpec = new MicroSpec({ cwd: '/test/project' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should use default cwd if not provided', () => {
      const defaultSpec = new MicroSpec();
      expect(defaultSpec.cwd).toBe(process.cwd());
    });

    it('should set correct directories', () => {
      expect(microSpec.specsDir).toBe(join('/test/project', '.uds', 'micro-specs'));
      expect(microSpec.archiveDir).toBe(join('/test/project', '.uds', 'micro-specs', 'archive'));
    });
  });

  describe('generateId', () => {
    it('should generate ID with date prefix', () => {
      const id = microSpec.generateId('Test Feature');
      expect(id).toMatch(/^\d{4}-\d{2}-\d{2}-test-feature$/);
    });

    it('should handle special characters in title', () => {
      const id = microSpec.generateId('Add login/auth page!');
      expect(id).toMatch(/^\d{4}-\d{2}-\d{2}-add-login-auth-page$/);
    });

    it('should truncate long titles', () => {
      const longTitle = 'This is a very long title that should be truncated to fit within limits';
      const id = microSpec.generateId(longTitle);
      expect(id.length).toBeLessThanOrEqual(41); // date(10) + dash(1) + slug(30)
    });
  });

  describe('parseIntent', () => {
    it('should detect frontend scope', () => {
      const result = microSpec.parseIntent('Add a login button to the UI');
      expect(result.scope).toBe('frontend');
    });

    it('should detect backend scope', () => {
      const result = microSpec.parseIntent('Create an API endpoint for user auth');
      expect(result.scope).toBe('backend');
    });

    it('should detect fullstack scope', () => {
      const result = microSpec.parseIntent('Complete end-to-end user registration');
      expect(result.scope).toBe('fullstack');
    });

    it('should detect refactor type', () => {
      const result = microSpec.parseIntent('Refactor the code for better readability');
      expect(result.scope).toBe('refactor');
      expect(result.type).toBe('refactor');
    });

    it('should detect fix type', () => {
      const result = microSpec.parseIntent('Fix the login bug when password is empty');
      expect(result.scope).toBe('fix');
      expect(result.type).toBe('bugfix');
    });

    it('should extract title from first sentence', () => {
      const result = microSpec.parseIntent('Add user profile. With avatar upload. And settings.');
      expect(result.title).toBe('Add user profile');
    });

    it('should truncate long titles', () => {
      const result = microSpec.parseIntent('This is a very long description that exceeds fifty characters and should be truncated');
      expect(result.title.length).toBeLessThanOrEqual(50);
      expect(result.title).toContain('...');
    });
  });

  describe('generateAcceptanceCriteria', () => {
    it('should generate feature criteria', () => {
      const criteria = microSpec.generateAcceptanceCriteria('Add login page', 'feature');
      expect(criteria).toContain('[ ] Feature implemented as described');
      expect(criteria).toContain('[ ] No regressions introduced');
    });

    it('should generate bugfix criteria', () => {
      const criteria = microSpec.generateAcceptanceCriteria('Fix login error', 'bugfix');
      expect(criteria).toContain('[ ] Bug is fixed and verified');
      expect(criteria).toContain('[ ] Root cause addressed');
    });

    it('should generate refactor criteria', () => {
      const criteria = microSpec.generateAcceptanceCriteria('Refactor auth module', 'refactor');
      expect(criteria).toContain('[ ] Behavior unchanged');
      expect(criteria).toContain('[ ] Code quality improved');
    });

    it('should limit criteria to 5 items', () => {
      const longIntent = 'Add login, register, forgot password, reset password, profile, settings, logout, dashboard';
      const criteria = microSpec.generateAcceptanceCriteria(longIntent, 'feature');
      expect(criteria.length).toBeLessThanOrEqual(5);
    });
  });

  describe('create', () => {
    it('should create a micro-spec', () => {
      existsSync.mockReturnValue(false);

      const result = microSpec.create('Add a login page with email authentication');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
      expect(result.spec.status).toBe(SpecStatus.DRAFT);
      expect(result.spec.confirmed).toBe(false);
      expect(result.filepath).toContain('.uds/micro-specs');
      expect(result.markdown).toContain('## Micro-Spec:');
    });

    it('should use provided scope option', () => {
      existsSync.mockReturnValue(false);

      const result = microSpec.create('Add a feature', { scope: 'backend' });

      expect(result.spec.scope).toBe('backend');
    });
  });

  describe('toMarkdown', () => {
    it('should generate valid markdown', () => {
      const spec = {
        id: '2026-01-28-test',
        title: 'Test Feature',
        status: SpecStatus.DRAFT,
        createdAt: '2026-01-28T10:00:00.000Z',
        updatedAt: '2026-01-28T10:00:00.000Z',
        intent: 'Add a test feature',
        scope: 'frontend',
        type: 'feature',
        acceptance: ['[ ] Feature works', '[ ] Tests pass'],
        confirmed: false,
        notes: ''
      };

      const markdown = microSpec.toMarkdown(spec);

      expect(markdown).toContain('## Micro-Spec: Test Feature');
      expect(markdown).toContain('**Status**: draft');
      expect(markdown).toContain('**Intent**: Add a test feature');
      expect(markdown).toContain('**Scope**: frontend');
      expect(markdown).toContain('- [ ] Feature works');
      expect(markdown).toContain('**Confirmed**: No');
    });

    it('should include notes if present', () => {
      const spec = {
        id: '2026-01-28-test',
        title: 'Test',
        status: SpecStatus.DRAFT,
        createdAt: '2026-01-28',
        updatedAt: '2026-01-28',
        intent: 'Test',
        scope: 'general',
        type: 'feature',
        acceptance: [],
        confirmed: false,
        notes: 'Some important notes'
      };

      const markdown = microSpec.toMarkdown(spec);

      expect(markdown).toContain('**Notes**:');
      expect(markdown).toContain('Some important notes');
    });
  });

  describe('fromMarkdown', () => {
    it('should parse markdown back to spec object', () => {
      const markdown = `## Micro-Spec: Test Feature

**Status**: confirmed
**Created**: 2026-01-28
**Type**: feature

**Intent**: Add a test feature

**Scope**: frontend

**Acceptance**:
- [ ] Feature works
- [x] Tests pass

**Confirmed**: Yes
`;

      const spec = microSpec.fromMarkdown(markdown, '2026-01-28-test');

      expect(spec.id).toBe('2026-01-28-test');
      expect(spec.title).toBe('Test Feature');
      expect(spec.status).toBe('confirmed');
      expect(spec.type).toBe('feature');
      expect(spec.intent).toBe('Add a test feature');
      expect(spec.scope).toBe('frontend');
      expect(spec.acceptance).toHaveLength(2);
      expect(spec.confirmed).toBe(true);
    });
  });

  describe('list', () => {
    it('should return empty array when no specs exist', () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue([]);

      const specs = microSpec.list();

      expect(specs).toEqual([]);
    });

    it('should list and parse all specs', () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(['spec1.md', 'spec2.md']);
      readFileSync
        .mockReturnValueOnce('## Micro-Spec: Spec 1\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test 1\n**Scope**: frontend\n**Confirmed**: No')
        .mockReturnValueOnce('## Micro-Spec: Spec 2\n**Status**: confirmed\n**Created**: 2026-01-27\n**Type**: bugfix\n**Intent**: Test 2\n**Scope**: backend\n**Confirmed**: Yes');

      const specs = microSpec.list();

      expect(specs).toHaveLength(2);
      expect(specs[0].title).toBe('Spec 1');
      expect(specs[1].title).toBe('Spec 2');
    });

    it('should filter by status', () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(['spec1.md', 'spec2.md']);
      readFileSync
        .mockReturnValueOnce('## Micro-Spec: Draft\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No')
        .mockReturnValueOnce('## Micro-Spec: Confirmed\n**Status**: confirmed\n**Created**: 2026-01-27\n**Type**: feature\n**Intent**: Test\n**Scope**: backend\n**Confirmed**: Yes');

      const specs = microSpec.list({ status: 'draft' });

      expect(specs).toHaveLength(1);
      expect(specs[0].status).toBe('draft');
    });
  });

  describe('get', () => {
    it('should return null for non-existent spec', () => {
      existsSync.mockReturnValue(false);

      const spec = microSpec.get('non-existent');

      expect(spec).toBeNull();
    });

    it('should return parsed spec', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('## Micro-Spec: Test\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No');

      const spec = microSpec.get('2026-01-28-test');

      expect(spec).not.toBeNull();
      expect(spec.title).toBe('Test');
    });
  });

  describe('updateStatus', () => {
    it('should update spec status', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('## Micro-Spec: Test\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No');

      const spec = microSpec.updateStatus('2026-01-28-test', SpecStatus.CONFIRMED);

      expect(spec.status).toBe(SpecStatus.CONFIRMED);
      expect(spec.confirmed).toBe(true);
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should return null for non-existent spec', () => {
      existsSync.mockReturnValue(false);

      const result = microSpec.updateStatus('non-existent', SpecStatus.CONFIRMED);

      expect(result).toBeNull();
    });
  });

  describe('confirm', () => {
    it('should confirm a spec', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('## Micro-Spec: Test\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No');

      const spec = microSpec.confirm('2026-01-28-test');

      expect(spec.status).toBe(SpecStatus.CONFIRMED);
      expect(spec.confirmed).toBe(true);
    });
  });

  describe('archive', () => {
    it('should archive a spec', () => {
      existsSync.mockImplementation((path) => {
        if (path.includes('archive')) return true;
        return true;
      });
      readFileSync.mockReturnValue('## Micro-Spec: Test\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No');

      const success = microSpec.archive('2026-01-28-test');

      expect(success).toBe(true);
      expect(renameSync).toHaveBeenCalled();
    });

    it('should return false for non-existent spec', () => {
      existsSync.mockReturnValue(false);

      const success = microSpec.archive('non-existent');

      expect(success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a spec', () => {
      existsSync.mockReturnValue(true);

      const success = microSpec.delete('2026-01-28-test');

      expect(success).toBe(true);
      expect(unlinkSync).toHaveBeenCalled();
    });

    it('should return false for non-existent spec', () => {
      existsSync.mockReturnValue(false);

      const success = microSpec.delete('non-existent');

      expect(success).toBe(false);
    });
  });

  describe('getPromotePath', () => {
    it('should return correct promotion path', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('## Micro-Spec: Test\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Intent**: Test\n**Scope**: frontend\n**Confirmed**: No');

      const path = microSpec.getPromotePath('2026-01-28-test');

      expect(path).toContain('docs/specs/features');
      expect(path).toContain('2026-01-28-test.md');
    });

    it('should return null for non-existent spec', () => {
      existsSync.mockReturnValue(false);

      const path = microSpec.getPromotePath('non-existent');

      expect(path).toBeNull();
    });
  });
});
