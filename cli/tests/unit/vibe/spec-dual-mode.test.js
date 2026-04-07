// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for Dual Mode (standard/boost) + Approach — AC-7, AC-8, AC-9, AC-10

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { MicroSpec } from '../../../src/vibe/micro-spec.js';

function makeSpec(overrides = {}) {
  return {
    title: 'Test Feature',
    status: 'draft',
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-07T00:00:00.000Z',
    type: 'feature',
    intent: 'Test intent',
    scope: 'general',
    acceptance: ['[ ] AC-1: test'],
    confirmed: false,
    notes: '',
    dependsOn: [],
    ...overrides,
  };
}

describe('XSPEC-005 AC-7~10: Dual Mode + Approach', () => {
  let tempDir;
  let microSpec;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'spec-mode-'));
    mkdirSync(join(tempDir, 'specs'), { recursive: true });
    microSpec = new MicroSpec({ cwd: tempDir, output: 'specs' });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── AC-7: --boost generates full SDD template ───

  describe('AC-7: boost mode toMarkdown generates full SDD sections', () => {
    it('should include Motivation section in boost mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('### Motivation');
    });

    it('should include Detailed Design section in boost mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('### Detailed Design');
    });

    it('should include Risks & Trade-offs section in boost mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('### Risks & Trade-offs');
    });

    it('should include Open Questions section in boost mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('### Open Questions');
    });

    it('should show "Spec Mode: boost" in header', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Spec Mode**: boost');
    });

    it('should use "## Spec:" title format for boost mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toMatch(/^## Spec: /m);
    });
  });

  // ─── AC-8: standard mode keeps micro-spec template ───

  describe('AC-8: standard mode toMarkdown keeps micro-spec format', () => {
    it('should NOT contain Motivation, Detailed Design, or Risks sections', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).not.toContain('### Motivation');
      expect(markdown).not.toContain('### Detailed Design');
      expect(markdown).not.toContain('### Risks & Trade-offs');
    });

    it('should show "Spec Mode: standard" in header', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Spec Mode**: standard');
    });

    it('should use "## Micro-Spec:" title format for standard mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toMatch(/^## Micro-Spec: /m);
    });
  });

  // ─── AC-9: approach field in boost mode ───

  describe('AC-9: approach field in boost mode', () => {
    it('should include "Approach: conventional" when set', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Approach**: conventional');
    });

    it('should include "Approach: exploratory" when set', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'exploratory' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).toContain('**Approach**: exploratory');
    });

    it('should NOT include Approach field in standard mode', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });

      // Act
      const markdown = microSpec.toMarkdown(spec);

      // Assert
      expect(markdown).not.toContain('**Approach**');
    });
  });

  // ─── fromMarkdown: spec_mode + approach parsing ───

  describe('fromMarkdown: spec_mode and approach parsing', () => {
    it('should parse "Spec Mode: boost" from markdown', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'conventional' });
      const markdown = microSpec.toMarkdown(spec);

      // Act
      const parsed = microSpec.fromMarkdown(markdown, 'SPEC-001');

      // Assert
      expect(parsed.specMode).toBe('boost');
    });

    it('should parse "Spec Mode: standard" from markdown', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });
      const markdown = microSpec.toMarkdown(spec);

      // Act
      const parsed = microSpec.fromMarkdown(markdown, 'SPEC-001');

      // Assert
      expect(parsed.specMode).toBe('standard');
    });

    it('should parse "Approach: exploratory" from boost markdown', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'exploratory' });
      const markdown = microSpec.toMarkdown(spec);

      // Act
      const parsed = microSpec.fromMarkdown(markdown, 'SPEC-001');

      // Assert
      expect(parsed.approach).toBe('exploratory');
    });
  });

  // ─── AC-10: backward compatibility ───

  describe('AC-10: backward compatibility with legacy specs', () => {
    it('should default specMode to "standard" when field is absent', () => {
      // Arrange — legacy format without Spec Mode field
      const legacyMarkdown = [
        '## Micro-Spec: Legacy Feature',
        '',
        '**Status**: draft',
        '**Created**: 2025-01-01',
        '**Type**: feature',
        '',
        '**Intent**: Fix the login bug',
        '',
        '**Scope**: cli/src/auth.js',
        '',
        '**Acceptance**:',
        '- [ ] Login works with valid credentials',
        '',
        '**Confirmed**: No',
        '',
        '**Notes**: none',
      ].join('\n');

      // Act
      const parsed = microSpec.fromMarkdown(legacyMarkdown, 'SPEC-LEGACY');

      // Assert
      expect(parsed.specMode).toBe('standard');
      expect(parsed.approach).toBeUndefined();
      expect(parsed.dependsOn).toEqual([]);
    });

    it('should roundtrip a standard-mode spec without data loss', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'standard' });
      const markdown = microSpec.toMarkdown(spec);

      // Act
      const parsed = microSpec.fromMarkdown(markdown, 'SPEC-RT');

      // Assert
      expect(parsed.title).toBe(spec.title);
      expect(parsed.intent).toBe(spec.intent);
      expect(parsed.specMode).toBe('standard');
      expect(parsed.dependsOn).toEqual([]);
    });

    it('should roundtrip a boost-mode spec without data loss', () => {
      // Arrange
      const spec = makeSpec({ specMode: 'boost', approach: 'exploratory', dependsOn: ['SPEC-002'] });
      const markdown = microSpec.toMarkdown(spec);

      // Act
      const parsed = microSpec.fromMarkdown(markdown, 'SPEC-RT');

      // Assert
      expect(parsed.specMode).toBe('boost');
      expect(parsed.approach).toBe('exploratory');
      expect(parsed.dependsOn).toEqual(['SPEC-002']);
    });
  });
});
