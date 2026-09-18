/**
 * XSPEC adopter-report Q3 (check side) — `uds check` never said Skills or
 * Commands were behind the latest UDS release; only `uds update --plan
 * --skills`/`--commands` computed that. A plain `uds check` (with or without
 * `--ci`) gave no signal at all that `uds update --skills` had anything to
 * do.
 *
 * Whether this fails `--ci`: modeled on the existing "Version: X -> Y" row
 * in the summary dashboard (checkCommand, around the `hasUpdate` check),
 * which reports the installed UDS release itself being behind with a bare
 * ⚠ and does NOT affect the exit code — "a newer release exists, you have
 * not run update yet" is normal, ambient state, not a compliance defect.
 * That is different in kind from XSPEC-418 R1 (an integration block found
 * MODIFIED/MISSING/ambiguous), which IS a defect and does fail --ci. Skills
 * and Commands version staleness is the same kind of thing as the top-level
 * version row, not the same kind of thing as a corrupted block, so it is
 * reported but does not fail --ci either.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

vi.mock('../../../src/utils/detect-self-adoption.js', () => ({
  detectSelfAdoption: vi.fn(() => false),
  detectSelfAdoptionDetailed: vi.fn(() => ({ isSelfAdoption: false, signals: [] })),
  guardAgainstSelfAdoption: vi.fn(() => true),
  formatSelfAdoptionRefuseMessage: vi.fn(() => []),
  formatSelfAdoptionForceWarning: vi.fn(() => [])
}));

vi.mock('../../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(() => Promise.resolve({ available: false, offline: true, message: 'Mocked' })),
  clearCache: vi.fn()
}));

const { mockGetMarketplaceSkillsInfo } = vi.hoisted(() => ({
  mockGetMarketplaceSkillsInfo: vi.fn(() => ({ installed: false }))
}));
vi.mock('../../../src/utils/github.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getMarketplaceSkillsInfo: mockGetMarketplaceSkillsInfo };
});

import { checkCommand } from '../../../src/commands/check.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/check-skills-commands-staleness-q3');

const createValidManifest = (overrides = {}) => ({
  version: '3.4.0',
  upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '2.1.0', installed: '2024-01-01' },
  level: 2,
  format: 'ai',
  standardsScope: 'minimal',
  contentMode: 'index',
  standards: [],
  extensions: [],
  integrations: [],
  integrationConfigs: {},
  options: {},
  aiTools: [],
  skills: { installed: false, location: 'marketplace', names: [], version: null, installations: [] },
  commands: { installed: false, names: [], installations: [] },
  methodology: null,
  fileHashes: {},
  skillHashes: {},
  commandHashes: {},
  integrationBlockHashes: {},
  ...overrides
});

describe('checkCommand — Skills/Commands version staleness (Q3)', () => {
  let originalCwd;
  let consoleLogs = [];
  let exitSpy;

  beforeEach(() => {
    originalCwd = process.cwd();
    consoleLogs = [];
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  function writeManifestFile(manifest) {
    mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.standards/manifest.json'), JSON.stringify(manifest, null, 2));
  }

  it('warns (without failing --ci) when an installed Skills version is behind', async () => {
    mkdirSync(join(TEST_DIR, '.claude/skills'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.claude/skills/.manifest.json'), JSON.stringify({ version: '0.9.0' }));
    writeManifestFile(createValidManifest({
      skills: {
        installed: true,
        location: 'project',
        names: [],
        version: '0.9.0',
        installations: [{ agent: 'claude-code', level: 'project' }]
      }
    }));

    await checkCommand({ ci: true, noInteractive: true });

    const output = consoleLogs.join('\n');
    expect(output).toMatch(/0\.9\.0/);
    expect(output).toContain('⚠');
    // Version staleness alone must not fail --ci (see file-level rationale).
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });

  it('says nothing extra when the installed Skills version matches the latest', async () => {
    // getRepositoryInfo() reads the real registry — this project's own
    // registry version, whatever it currently is, is "latest" by definition.
    const { getRepositoryInfo } = await import('../../../src/utils/registry.js');
    const latest = getRepositoryInfo().skills.version;

    mkdirSync(join(TEST_DIR, '.claude/skills'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.claude/skills/.manifest.json'), JSON.stringify({ version: latest }));
    writeManifestFile(createValidManifest({
      skills: {
        installed: true,
        location: 'project',
        names: [],
        version: latest,
        installations: [{ agent: 'claude-code', level: 'project' }]
      }
    }));

    await checkCommand({ ci: true, noInteractive: true });

    const output = consoleLogs.join('\n');
    expect(output).not.toMatch(/Skills.*out of date/i);
  });
});
