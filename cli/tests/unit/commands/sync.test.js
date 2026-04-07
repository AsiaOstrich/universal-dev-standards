// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for sync command — AC-16, AC-17

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { generateContext } from '../../../src/commands/sync.js';

describe('XSPEC-005 AC-16+17: sync command (generateContext)', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'sync-test-'));
    // Initialize a git repo
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tempDir, stdio: 'ignore' });
    // Create initial commit
    writeFileSync(join(tempDir, 'README.md'), '# Test');
    execSync('git add . && git commit -m "init"', { cwd: tempDir, stdio: 'ignore' });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── AC-16: generates context.md ───

  describe('AC-16: generates context.md within 500 lines', () => {
    it('should create .workflow-state/context.md', () => {
      // Act
      generateContext(tempDir);

      // Assert
      const contextPath = join(tempDir, '.workflow-state', 'context.md');
      expect(existsSync(contextPath)).toBe(true);
    });

    it('should contain ## Git Status section', () => {
      // Act
      generateContext(tempDir);

      // Assert
      const content = readFileSync(join(tempDir, '.workflow-state', 'context.md'), 'utf-8');
      expect(content).toContain('## Git Status');
    });

    it('should contain branch name', () => {
      // Act
      generateContext(tempDir);

      // Assert
      const content = readFileSync(join(tempDir, '.workflow-state', 'context.md'), 'utf-8');
      expect(content).toMatch(/\*\*Branch\*\*/);
    });

    it('should not exceed 500 lines', () => {
      // Arrange — create many commits to pad output
      for (let i = 0; i < 30; i++) {
        writeFileSync(join(tempDir, `file${i}.txt`), `content ${i}`);
        execSync(`git add . && git commit -m "commit ${i}"`, { cwd: tempDir, stdio: 'ignore' });
      }

      // Act
      generateContext(tempDir);

      // Assert
      const content = readFileSync(join(tempDir, '.workflow-state', 'context.md'), 'utf-8');
      const lineCount = content.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(500);
    });

    it('should include workflow state when .workflow-state/*.yaml exists', () => {
      // Arrange
      mkdirSync(join(tempDir, '.workflow-state'), { recursive: true });
      writeFileSync(join(tempDir, '.workflow-state', 'current.yaml'), [
        'spec_id: SPEC-001',
        'current_phase: implement',
        'status: in_progress',
      ].join('\n'));

      // Act
      generateContext(tempDir);

      // Assert
      const content = readFileSync(join(tempDir, '.workflow-state', 'context.md'), 'utf-8');
      expect(content).toContain('## Workflow State');
      expect(content).toContain('SPEC-001');
    });
  });

  // ─── AC-17: works without workflow state ───

  describe('AC-17: works without workflow state', () => {
    it('should create context.md with git info only', () => {
      // Arrange — no .workflow-state/ directory

      // Act
      generateContext(tempDir);

      // Assert
      const content = readFileSync(join(tempDir, '.workflow-state', 'context.md'), 'utf-8');
      expect(content).toContain('## Git Status');
      expect(content).not.toContain('## Workflow State');
    });

    it('should still succeed and create the file', () => {
      // Act
      generateContext(tempDir);

      // Assert
      expect(existsSync(join(tempDir, '.workflow-state', 'context.md'))).toBe(true);
    });
  });
});
