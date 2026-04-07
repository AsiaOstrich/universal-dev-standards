// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for spec dependency tracking — AC-4, AC-5, AC-6

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { MicroSpec } from '../../../src/vibe/micro-spec.js';

/**
 * Helper: generate a minimal spec markdown with optional depends_on
 */
function generateSpecMarkdown({ title = 'Test Feature', dependsOn = null } = {}) {
  const lines = [
    `## Micro-Spec: ${title}`,
    '',
    '**Status**: draft',
    '**Created**: 2026-04-07',
    '**Type**: feature',
  ];

  if (dependsOn !== null) {
    lines.push(`**Depends On**: ${dependsOn.length > 0 ? dependsOn.join(', ') : 'none'}`);
  }

  lines.push(
    '',
    '**Intent**: Test intent',
    '',
    '**Scope**: general',
    '',
    '**Acceptance**:',
    '- [ ] AC-1: Test criterion',
    '',
    '**Confirmed**: No',
    '',
    '**Notes**: none',
  );

  return lines.join('\n');
}

describe('XSPEC-005 AC-4~6: Spec Dependency Tracking', () => {
  let tempDir;
  let microSpec;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'spec-deps-'));
    mkdirSync(join(tempDir, 'specs'), { recursive: true });
    microSpec = new MicroSpec({ cwd: tempDir, output: 'specs' });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── toMarkdown: depends_on 支援 ───

  describe('toMarkdown: depends_on field rendering', () => {
    it('should render "Depends On: none" when dependsOn is empty array', () => {
      // Arrange
      const spec = {
        title: 'Test',
        status: 'draft',
        createdAt: '2026-04-07T00:00:00.000Z',
        type: 'feature',
        intent: 'Test',
        scope: 'general',
        acceptance: ['[ ] AC-1: test'],
        confirmed: false,
        notes: '',
        dependsOn: [],
      };

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Depends On**: none');
    });

    it('should render "Depends On: SPEC-002" when dependsOn has one item', () => {
      // Arrange
      const spec = {
        title: 'Test',
        status: 'draft',
        createdAt: '2026-04-07T00:00:00.000Z',
        type: 'feature',
        intent: 'Test',
        scope: 'general',
        acceptance: ['[ ] AC-1: test'],
        confirmed: false,
        notes: '',
        dependsOn: ['SPEC-002'],
      };

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Depends On**: SPEC-002');
    });

    it('should render comma-separated list for multiple dependencies', () => {
      // Arrange
      const spec = {
        title: 'Test',
        status: 'draft',
        createdAt: '2026-04-07T00:00:00.000Z',
        type: 'feature',
        intent: 'Test',
        scope: 'general',
        acceptance: ['[ ] AC-1: test'],
        confirmed: false,
        notes: '',
        dependsOn: ['SPEC-001', 'SPEC-003'],
      };

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Depends On**: SPEC-001, SPEC-003');
    });
  });

  // ─── fromMarkdown: depends_on 解析 ───

  describe('fromMarkdown: depends_on field parsing', () => {
    it('should parse "Depends On: none" as empty array', () => {
      // Arrange
      const content = generateSpecMarkdown({ dependsOn: [] });

      // Act
      const spec = microSpec.fromMarkdown(content, 'SPEC-001');

      // Assert
      expect(spec.dependsOn).toEqual([]);
    });

    it('should parse single dependency', () => {
      // Arrange
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002'] });

      // Act
      const spec = microSpec.fromMarkdown(content, 'SPEC-001');

      // Assert
      expect(spec.dependsOn).toEqual(['SPEC-002']);
    });

    it('should parse multiple dependencies', () => {
      // Arrange
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-001', 'SPEC-003'] });

      // Act
      const spec = microSpec.fromMarkdown(content, 'SPEC-001');

      // Assert
      expect(spec.dependsOn).toEqual(['SPEC-001', 'SPEC-003']);
    });

    it('should default to empty array when Depends On field is absent', () => {
      // Arrange — legacy spec without depends_on
      const content = generateSpecMarkdown({ dependsOn: null });

      // Act
      const spec = microSpec.fromMarkdown(content, 'SPEC-001');

      // Assert
      expect(spec.dependsOn).toEqual([]);
    });
  });

  // ─── AC-4: addDependency ───

  describe('AC-4: addDependency', () => {
    it('should add a dependency to a spec file on disk', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: [] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act
      microSpec.addDependency(specId, 'SPEC-002');

      // Assert — re-read and verify
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      expect(updated).toContain('**Depends On**: SPEC-002');
    });

    it('should not duplicate an existing dependency', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002'] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act
      microSpec.addDependency(specId, 'SPEC-002');

      // Assert
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      const matches = updated.match(/SPEC-002/g);
      expect(matches).toHaveLength(1);
    });

    it('should append to existing dependencies', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002'] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act
      microSpec.addDependency(specId, 'SPEC-003');

      // Assert
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      expect(updated).toContain('**Depends On**: SPEC-002, SPEC-003');
    });
  });

  // ─── AC-6: removeDependency ───

  describe('AC-6: removeDependency', () => {
    it('should remove a dependency from a spec file on disk', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002'] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act
      microSpec.removeDependency(specId, 'SPEC-002');

      // Assert
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      expect(updated).toContain('**Depends On**: none');
      expect(updated).not.toMatch(/SPEC-002/);
    });

    it('should keep other dependencies when removing one', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002', 'SPEC-003'] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act
      microSpec.removeDependency(specId, 'SPEC-002');

      // Assert
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      expect(updated).toContain('**Depends On**: SPEC-003');
      expect(updated).not.toMatch(/SPEC-002/);
    });

    it('should handle removing a non-existent dependency gracefully', () => {
      // Arrange
      const specId = 'SPEC-001';
      const content = generateSpecMarkdown({ dependsOn: ['SPEC-002'] });
      writeFileSync(join(tempDir, 'specs', `${specId}.md`), content);

      // Act — removing SPEC-099 which doesn't exist
      microSpec.removeDependency(specId, 'SPEC-099');

      // Assert — original dependency unchanged
      const updated = readFileSync(join(tempDir, 'specs', `${specId}.md`), 'utf-8');
      expect(updated).toContain('**Depends On**: SPEC-002');
    });
  });
});
