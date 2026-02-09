import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoSweep, SweepActions } from '../../../src/vibe/auto-sweep.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

// Mock modules
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

vi.mock('../../../src/hitl/manager.js', () => ({
  hitl: {
    enforce: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../../../src/utils/config-manager.js', () => ({
  config: {
    get: vi.fn().mockReturnValue({
      enabled: true,
      actions: ['remove-console-logs', 'flag-dead-code', 'suggest-types']
    })
  }
}));

describe('SweepActions', () => {
  describe('REMOVE_CONSOLE_LOG', () => {
    it('should match console.log statements', () => {
      const pattern = SweepActions.REMOVE_CONSOLE_LOG.pattern;
      expect('console.log("test");'.match(pattern)).toBeTruthy();
      expect('console.debug("test");'.match(pattern)).toBeTruthy();
      expect('console.error("test");'.match(pattern)).toBeTruthy();
    });

    it('should have risk level 1 (Standard)', () => {
      expect(SweepActions.REMOVE_CONSOLE_LOG.risk).toBe(1);
    });
  });

  describe('REMOVE_DEBUGGER', () => {
    it('should match debugger statements', () => {
      const pattern = SweepActions.REMOVE_DEBUGGER.pattern;
      expect('debugger;'.match(pattern)).toBeTruthy();
      expect('debugger'.match(pattern)).toBeTruthy();
    });

    it('should have risk level 1 (Standard)', () => {
      expect(SweepActions.REMOVE_DEBUGGER.risk).toBe(1);
    });
  });

  describe('FLAG_TODO_FIXME', () => {
    it('should match TODO/FIXME comments', () => {
      const pattern = SweepActions.FLAG_TODO_FIXME.pattern;
      expect('// TODO: fix this'.match(pattern)).toBeTruthy();
      expect('// FIXME: broken'.match(pattern)).toBeTruthy();
      expect('// XXX: hack'.match(pattern)).toBeTruthy();
    });

    it('should have risk level 0 (Routine - detection only)', () => {
      expect(SweepActions.FLAG_TODO_FIXME.risk).toBe(0);
    });
  });

  describe('SUGGEST_TYPES', () => {
    it('should be applicable to TypeScript files', () => {
      expect(SweepActions.SUGGEST_TYPES.applicable).toContain('.ts');
      expect(SweepActions.SUGGEST_TYPES.applicable).toContain('.tsx');
    });

    it('should have risk level 0 (Suggestion only)', () => {
      expect(SweepActions.SUGGEST_TYPES.risk).toBe(0);
    });
  });
});

describe('AutoSweep', () => {
  let sweep;

  beforeEach(() => {
    vi.clearAllMocks();
    sweep = new AutoSweep({ cwd: '/test/project', dryRun: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should use default options', () => {
      const defaultSweep = new AutoSweep();
      expect(defaultSweep.dryRun).toBe(true);
      expect(defaultSweep.verbose).toBe(false);
    });

    it('should accept custom options', () => {
      const customSweep = new AutoSweep({
        cwd: '/custom/path',
        dryRun: false,
        verbose: true
      });
      expect(customSweep.cwd).toBe('/custom/path');
      expect(customSweep.dryRun).toBe(false);
      expect(customSweep.verbose).toBe(true);
    });
  });

  describe('getChangedFiles', () => {
    it('should return empty array when no git changes', () => {
      execSync.mockReturnValue('');
      const files = sweep.getChangedFiles();
      expect(files).toEqual([]);
    });

    it('should return only code files', () => {
      execSync
        .mockReturnValueOnce('src/app.js\nsrc/style.css\n')
        .mockReturnValueOnce('src/utils.ts\nREADME.md\n');

      const files = sweep.getChangedFiles();
      expect(files).toContain('src/app.js');
      expect(files).toContain('src/utils.ts');
      expect(files).not.toContain('src/style.css');
      expect(files).not.toContain('README.md');
    });

    it('should deduplicate staged and unstaged files', () => {
      execSync
        .mockReturnValueOnce('src/app.js\n')
        .mockReturnValueOnce('src/app.js\nsrc/utils.js\n');

      const files = sweep.getChangedFiles();
      expect(files.filter(f => f === 'src/app.js')).toHaveLength(1);
    });

    it('should handle git errors gracefully', () => {
      execSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      const files = sweep.getChangedFiles();
      expect(files).toEqual([]);
    });
  });

  describe('scanFile', () => {
    it('should return error for non-existent files', () => {
      existsSync.mockReturnValue(false);
      const result = sweep.scanFile('missing.js');
      expect(result.error).toBe('File not found');
      expect(result.issues).toEqual([]);
    });

    it('should detect console.log statements', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(`
        function test() {
          console.log("debug");
          console.error("error");
          return true;
        }
      `);

      const result = sweep.scanFile('test.js');
      const consoleIssue = result.issues.find(i => i.type === 'console-log');
      expect(consoleIssue).toBeDefined();
      expect(consoleIssue.count).toBe(2);
      expect(consoleIssue.fixable).toBe(true);
    });

    it('should detect debugger statements', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(`
        function test() {
          debugger;
          return true;
        }
      `);

      const result = sweep.scanFile('test.js');
      const debuggerIssue = result.issues.find(i => i.type === 'debugger');
      expect(debuggerIssue).toBeDefined();
      expect(debuggerIssue.count).toBe(1);
      expect(debuggerIssue.fixable).toBe(true);
    });

    it('should detect TODO/FIXME comments', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(`
        // TODO: implement this
        // FIXME: broken logic
        function test() {
          return true;
        }
      `);

      const result = sweep.scanFile('test.js');
      const todoIssue = result.issues.find(i => i.type === 'todo-comments');
      expect(todoIssue).toBeDefined();
      expect(todoIssue.count).toBe(2);
      expect(todoIssue.fixable).toBe(false);
    });

    it('should detect any types in TypeScript files', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(`
        function test(data: any): any {
          return data;
        }
      `);

      const result = sweep.scanFile('test.ts');
      const anyTypeIssue = result.issues.find(i => i.type === 'any-types');
      expect(anyTypeIssue).toBeDefined();
      expect(anyTypeIssue.count).toBe(2);
      expect(anyTypeIssue.fixable).toBe(false);
    });

    it('should not detect any types in JavaScript files', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(`
        // any comment here
        function test() {}
      `);

      const result = sweep.scanFile('test.js');
      const anyTypeIssue = result.issues.find(i => i.type === 'any-types');
      expect(anyTypeIssue).toBeUndefined();
    });
  });

  describe('sweep', () => {
    it('should return message when no changed files', async () => {
      execSync.mockReturnValue('');
      const results = await sweep.sweep();
      expect(results.filesScanned).toBe(0);
      expect(results.message).toBe('No changed files to sweep');
    });

    it('should aggregate results from multiple files', async () => {
      execSync
        .mockReturnValueOnce('src/a.js\n')
        .mockReturnValueOnce('src/b.js\n');

      existsSync.mockReturnValue(true);
      readFileSync
        .mockReturnValueOnce('console.log("a");')
        .mockReturnValueOnce('console.log("b"); debugger;');

      const results = await sweep.sweep();
      expect(results.filesScanned).toBe(2);
      expect(results.totalIssues).toBe(3); // 1 + 2
      expect(results.summary.consoleLogs).toBe(2);
      expect(results.summary.debuggers).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('should generate markdown report', () => {
      const results = {
        timestamp: '2026-01-28T10:00:00.000Z',
        filesScanned: 2,
        totalIssues: 3,
        totalFixed: 0,
        files: [
          {
            file: 'test.js',
            issues: [
              { type: 'console-log', action: SweepActions.REMOVE_CONSOLE_LOG, count: 2, fixable: true }
            ]
          }
        ],
        summary: {
          consoleLogs: 2,
          debuggers: 1,
          todoComments: 0,
          anyTypes: 0
        }
      };

      const report = sweep.generateReport(results);
      expect(report).toContain('# Auto-Sweep Report');
      expect(report).toContain('Files Scanned | 2');
      expect(report).toContain('Console Logs | 2');
      expect(report).toContain('Dry Run (Preview)');
      expect(report).toContain('test.js');
    });
  });

  describe('saveReport', () => {
    it('should create reports directory and save file', () => {
      existsSync.mockReturnValue(false);
      const reportPath = sweep.saveReport('# Report');

      expect(mkdirSync).toHaveBeenCalledWith(
        join('/test/project', '.uds', 'reports'),
        { recursive: true }
      );
      expect(writeFileSync).toHaveBeenCalled();
      expect(reportPath).toContain(join('.uds', 'reports', 'sweep-'));
      expect(reportPath).toContain('.md');
    });
  });
});
