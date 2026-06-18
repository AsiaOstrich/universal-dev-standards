import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// XSPEC-292 §9.2 (T11): `init` must be transactional. A partial install (any
// installer reporting an error) must NOT write the final manifest (which is the
// "project is initialized" marker) and must roll back + exit non-zero, instead
// of leaving a half-initialized project that reports success.

vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((s) => s), gray: vi.fn((s) => s), green: vi.fn((s) => s),
    yellow: vi.fn((s) => s), red: vi.fn((s) => s), cyan: vi.fn((s) => s)
  }
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(), succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(), fail: vi.fn().mockReturnThis()
  }))
}));

vi.mock('../../src/utils/detect-self-adoption.js', () => ({
  guardAgainstSelfAdoption: vi.fn(() => true)
}));

vi.mock('../../src/core/manifest.js', () => ({
  manifestExists: vi.fn(() => false)
}));

vi.mock('../../src/utils/detector.js', () => ({
  detectAll: vi.fn(() => ({
    languages: { javascript: true }, frameworks: {}, aiTools: {}
  }))
}));

vi.mock('../../src/utils/config-manager.js', () => ({
  readInstallYaml: vi.fn(() => ({}))
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  getToolFilePath: vi.fn((tool) => (tool === 'claude-code' ? 'CLAUDE.md' : ''))
}));

const { mockInstallStandards } = vi.hoisted(() => ({
  mockInstallStandards: vi.fn()
}));

vi.mock('../../src/installers/standards-installer.js', () => ({
  installStandards: mockInstallStandards
}));

vi.mock('../../src/installers/integration-installer.js', () => ({
  installIntegrations: vi.fn(async () => ({
    integrations: [], errors: [], integrationBlockHashes: {}, manifestIntegrationConfigs: {}
  })),
  generateUniversalAgentsMd: vi.fn(async () => ({ path: null }))
}));

vi.mock('../../src/installers/skills-installer.js', () => ({
  installSkills: vi.fn(async () => {}),
  installCommands: vi.fn(async () => {})
}));

vi.mock('../../src/installers/manifest-installer.js', () => ({
  writeFinalManifest: vi.fn()
}));

import { initCommand } from '../../src/commands/init.js';
import { installStandards } from '../../src/installers/standards-installer.js';
import { writeFinalManifest } from '../../src/installers/manifest-installer.js';

describe('init transactionality (T11)', () => {
  let consoleLogs = [];
  let exitSpy;

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => { consoleLogs.push(args.join(' ')); });
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('does NOT write the manifest and exits non-zero when an installer fails', async () => {
    installStandards.mockResolvedValue({
      standards: ['core/test.md'], extensions: [],
      errors: ['core/test.md: EPERM: operation not permitted'], fileHashes: {}
    });

    await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

    // The completion marker must NOT be written for a partial install.
    expect(writeFinalManifest).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    const output = consoleLogs.join('\n');
    expect(output).toMatch(/rolled back|rollback|failed/i);
  });

  it('writes the manifest and exits 0 on a clean install', async () => {
    installStandards.mockResolvedValue({
      standards: ['core/test.md'], extensions: [], errors: [], fileHashes: {}
    });

    await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

    expect(writeFinalManifest).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
