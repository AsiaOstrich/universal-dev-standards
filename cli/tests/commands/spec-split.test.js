import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  renameSync: vi.fn(),
  copyFileSync: vi.fn(),
}));

// Mock config-manager
vi.mock('../../src/utils/config-manager.js', () => ({
  config: {
    get: vi.fn((key, defaultValue) => {
      if (key === 'specs.path') return 'specs';
      return defaultValue;
    }),
  },
}));

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

// Mock chalk to pass through
vi.mock('chalk', () => {
  const passthrough = (s) => s;
  passthrough.red = passthrough;
  passthrough.green = passthrough;
  passthrough.yellow = passthrough;
  passthrough.cyan = passthrough;
  passthrough.gray = passthrough;
  passthrough.bold = passthrough;
  return { default: passthrough };
});

import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { checkbox, confirm } from '@inquirer/prompts';
import { specSplitCommand, extractACs, addDependsOn } from '../../src/commands/spec-split.js';

const SAMPLE_SPEC_MD = `## Micro-Spec: Complex Feature

**Status**: confirmed
**Created**: 2026-03-15
**Type**: feature
**Spec Mode**: standard
**Depends On**: none

**Intent**: Build a complex feature with multiple ACs

**Scope**: fullstack

**Acceptance**:
- [ ] AC-1: Implement the login form
- [ ] AC-2: Add form validation
- [ ] AC-3: Create API endpoint

**Confirmed**: Yes
`;

describe('extractACs', () => {
  it('should extract all acceptance criteria from markdown', () => {
    // Act
    const acs = extractACs(SAMPLE_SPEC_MD);

    // Assert
    expect(acs).toHaveLength(3);
    expect(acs[0].id).toBe('AC-1');
    expect(acs[1].id).toBe('AC-2');
    expect(acs[2].id).toBe('AC-3');
  });

  it('should return empty array when no ACs found', () => {
    const content = '## Micro-Spec: Empty\n\n**Acceptance**:\nNothing here';
    const acs = extractACs(content);
    expect(acs).toHaveLength(0);
  });

  it('should handle checked ACs', () => {
    const content = '- [x] AC-1: Done thing\n- [ ] AC-2: Not done';
    const acs = extractACs(content);
    expect(acs).toHaveLength(2);
  });
});

describe('addDependsOn', () => {
  it('should add depends_on when none exists (insert after Type)', () => {
    const content = '**Type**: feature\n**Scope**: general';
    const result = addDependsOn(content, 'SPEC-002-new');
    expect(result).toContain('**Depends On**: SPEC-002-new');
  });

  it('should append to existing depends_on', () => {
    const content = '**Depends On**: SPEC-001-old';
    const result = addDependsOn(content, 'SPEC-002-new');
    expect(result).toContain('SPEC-001-old, SPEC-002-new');
  });

  it('should replace "none" with the target', () => {
    const content = '**Depends On**: none';
    const result = addDependsOn(content, 'SPEC-002-new');
    expect(result).toContain('**Depends On**: SPEC-002-new');
    expect(result).not.toContain('none');
  });
});

describe('specSplitCommand', () => {
  let consoleSpy;
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    // Default: all paths exist
    existsSync.mockReturnValue(true);
    // Default: readdirSync returns empty for generateId
    readdirSync.mockReturnValue([]);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should exit with error when spec not found', async () => {
    // Arrange
    existsSync.mockReturnValue(false);

    // Act
    await specSplitCommand('SPEC-999-missing', {});

    // Assert
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should abort when spec has fewer than 2 ACs', async () => {
    // Arrange
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      '## Micro-Spec: Small\n**Status**: draft\n**Created**: 2026-01-01\n**Type**: feature\n**Spec Mode**: standard\n**Depends On**: none\n**Intent**: Small\n**Scope**: general\n**Acceptance**:\n- [ ] AC-1: Only one\n**Confirmed**: No'
    );

    // Act
    await specSplitCommand('SPEC-001-small', {});

    // Assert — should warn, not prompt
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('too few to split');
    expect(checkbox).not.toHaveBeenCalled();
  });

  // AC-5: Interactive split with mutual depends_on
  it('should split spec into two with mutual depends_on references', async () => {
    // Arrange
    existsSync.mockImplementation((path) => {
      if (path.includes('.backup')) return false;
      return true;
    });
    readFileSync.mockReturnValue(SAMPLE_SPEC_MD);
    // Simulate: user moves AC-3 to new spec
    checkbox.mockResolvedValue(['AC-3']);
    confirm.mockResolvedValue(true);

    // Act
    await specSplitCommand('SPEC-010-complex', {});

    // Assert — two specs should be written
    const writeCalls = writeFileSync.mock.calls;
    // Original spec updated (without AC-3, with depends_on to new spec)
    const originalWrite = writeCalls.find(c => c[0].includes('SPEC-010-complex'));
    expect(originalWrite).toBeDefined();
    expect(originalWrite[1]).toContain('AC-1');
    expect(originalWrite[1]).toContain('AC-2');
    expect(originalWrite[1]).not.toContain('AC-3');

    // New spec created (with AC-3, depends_on to original)
    const newSpecWrite = writeCalls.find(c => !c[0].includes('SPEC-010-complex') && c[0].includes('SPEC-'));
    expect(newSpecWrite).toBeDefined();
    expect(newSpecWrite[1]).toContain('AC-3');
    expect(newSpecWrite[1]).toContain('SPEC-010-complex'); // depends_on original

    // Console shows success
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Split complete');
  });

  it('should abort when user selects no ACs', async () => {
    // Arrange
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(SAMPLE_SPEC_MD);
    checkbox.mockResolvedValue([]);

    // Act
    await specSplitCommand('SPEC-010-complex', {});

    // Assert
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Must select some');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('should abort when user selects all ACs', async () => {
    // Arrange
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(SAMPLE_SPEC_MD);
    checkbox.mockResolvedValue(['AC-1', 'AC-2', 'AC-3']);

    // Act
    await specSplitCommand('SPEC-010-complex', {});

    // Assert
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Must select some');
  });

  it('should cancel when user declines confirmation', async () => {
    // Arrange
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(SAMPLE_SPEC_MD);
    checkbox.mockResolvedValue(['AC-2']);
    confirm.mockResolvedValue(false);

    // Act
    await specSplitCommand('SPEC-010-complex', {});

    // Assert
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('cancelled');
  });

  // AC-6: Backup original spec
  it('should backup original spec to specs/.backup/ before splitting', async () => {
    // Arrange
    existsSync.mockImplementation((path) => {
      if (path.includes('.backup')) return false;
      return true;
    });
    readFileSync.mockReturnValue(SAMPLE_SPEC_MD);
    checkbox.mockResolvedValue(['AC-3']);
    confirm.mockResolvedValue(true);

    // Act
    await specSplitCommand('SPEC-010-complex', {});

    // Assert — backup directory created
    const mkdirCalls = mkdirSync.mock.calls;
    const backupMkdir = mkdirCalls.find(c => c[0].includes('.backup'));
    expect(backupMkdir).toBeDefined();

    // Assert — copyFileSync called with backup path
    expect(copyFileSync).toHaveBeenCalledTimes(1);
    const copyCall = copyFileSync.mock.calls[0];
    expect(copyCall[0]).toContain('SPEC-010-complex.md');
    expect(copyCall[1]).toContain('.backup');
    expect(copyCall[1]).toContain('SPEC-010-complex-pre-split.md');
  });
});
