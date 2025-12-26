import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listCommand } from '../../src/commands/list.js';

describe('List Command', () => {
  let consoleLogs = [];
  let exitSpy;

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listCommand', () => {
    it('should display all standards without filters', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Universal Development Standards');
      expect(output).toContain('Total:');
    });

    it('should filter by level 1', () => {
      listCommand({ level: '1' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Level 1');
      expect(output).toContain('Essential');
    });

    it('should filter by level 2', () => {
      listCommand({ level: '2' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Level 2');
      expect(output).toContain('Recommended');
    });

    it('should filter by level 3', () => {
      listCommand({ level: '3' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Level 3');
      expect(output).toContain('Enterprise');
    });

    it('should filter by category skill', () => {
      listCommand({ category: 'skill' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category: Skill');
    });

    it('should filter by category reference', () => {
      listCommand({ category: 'reference' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category: Reference Document');
    });

    it('should exit with error for invalid level', () => {
      expect(() => listCommand({ level: '4' })).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error: Level must be 1, 2, or 3');
    });

    it('should exit with error for invalid category', () => {
      expect(() => listCommand({ category: 'invalid' })).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain("Error: Unknown category 'invalid'");
    });

    it('should show version info', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Version:');
    });

    it('should show hint for init command', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('uds init');
    });
  });
});
