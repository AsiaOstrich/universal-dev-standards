import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/scanner-test');

// Mock manifest.js — readManifest
vi.mock('../../../src/core/manifest.js', () => ({
  readManifest: vi.fn(() => null)
}));

// Mock hasher.js
vi.mock('../../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn((filePath) => {
    // Return different hashes based on file content to simulate real behavior
    return { hash: `sha256:hash-of-${filePath.split('/').pop()}`, size: 100 };
  }),
  computeIntegrationBlockHash: vi.fn((filePath) => {
    if (filePath.includes('CLAUDE.md')) {
      return { blockHash: 'sha256:block123', blockSize: 50, fullHash: 'sha256:full123', fullSize: 200 };
    }
    return null;
  })
}));

// Mock constants
vi.mock('../../../src/core/constants.js', () => ({
  SUPPORTED_AI_TOOLS: {
    'claude-code': { name: 'Claude Code', file: 'CLAUDE.md', format: 'markdown' },
    'cursor': { name: 'Cursor', file: '.cursorrules', format: 'plaintext' }
  },
  UDS_MARKERS: {
    markdown: { start: '<!-- UDS:STANDARDS:START -->', end: '<!-- UDS:STANDARDS:END -->' },
    plaintext: { start: '# === UDS:STANDARDS:START ===', end: '# === UDS:STANDARDS:END ===' }
  }
}));

// Mock skills-installer — provenance test for scanned skills/commands (XSPEC-343 R2).
// UDS ships `known-skill` and the non-skill sibling `_shared`; `my-own-skill` is
// the adopter's.
vi.mock('../../../src/utils/skills-installer.js', () => ({
  getSkillsSourceEntryNames: vi.fn(() => new Set(['known-skill', '_shared'])),
  getAvailableCommandNames: vi.fn(() => ['commit'])
}));

// Mock ai-agent-paths
vi.mock('../../../src/config/ai-agent-paths.js', () => ({
  getSkillsDirForAgent: vi.fn((agent, level, projectPath) => {
    if (agent === 'claude-code' && level === 'project') {
      return join(projectPath, '.claude', 'skills');
    }
    return null;
  }),
  getCommandsDirForAgent: vi.fn((agent, level, projectPath) => {
    if (agent === 'claude-code' && level === 'project') {
      return join(projectPath, '.claude', 'commands');
    }
    if (agent === 'gemini-cli' && level === 'project') {
      return join(projectPath, '.gemini', 'commands');
    }
    return null;
  }),
  getCommandFileExtension: vi.fn((agent) => (agent === 'gemini-cli' ? '.toml' : '.md'))
}));

import { scanActualState, legacyDiscovery } from '../../../src/reconciler/actual-state-scanner.js';
import { readManifest } from '../../../src/core/manifest.js';

describe('ActualStateScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('scanActualState', () => {
    it('should return empty state for empty project', () => {
      const manifest = {
        standards: [],
        integrations: [],
        skills: { installations: [] },
        commands: { installations: [] }
      };

      const state = scanActualState(TEST_DIR, manifest);

      expect(state.standards.size).toBe(0);
      expect(state.integrations.size).toBe(0);
    });

    it('should scan .standards/ directory for standard files', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'commit-message.ai.yaml'), 'content');
      writeFileSync(join(standardsDir, 'testing.ai.yaml'), 'content');

      const state = scanActualState(TEST_DIR, { standards: [], integrations: [], skills: { installations: [] }, commands: { installations: [] } });

      expect(state.standards.size).toBe(2);
      expect(state.standards.has('.standards/commit-message.ai.yaml')).toBe(true);
      expect(state.standards.has('.standards/testing.ai.yaml')).toBe(true);
    });

    it('should skip manifest.json in standards scan', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'manifest.json'), '{}');
      writeFileSync(join(standardsDir, 'testing.ai.yaml'), 'content');

      const state = scanActualState(TEST_DIR, { standards: [], integrations: [], skills: { installations: [] }, commands: { installations: [] } });

      expect(state.standards.size).toBe(1);
      expect(state.standards.has('.standards/manifest.json')).toBe(false);
    });

    it('should scan options subdirectory', () => {
      const optionsDir = join(TEST_DIR, '.standards', 'options', 'commit-message', 'lang');
      mkdirSync(optionsDir, { recursive: true });
      writeFileSync(join(optionsDir, 'english.ai.yaml'), 'content');

      const state = scanActualState(TEST_DIR, { standards: [], integrations: [], skills: { installations: [] }, commands: { installations: [] } });

      expect(state.options.size).toBe(1);
    });

    it('should scan integration files', () => {
      writeFileSync(join(TEST_DIR, 'CLAUDE.md'), '<!-- UDS:STANDARDS:START -->\ncontent\n<!-- UDS:STANDARDS:END -->');

      const state = scanActualState(TEST_DIR, { standards: [], integrations: [], skills: { installations: [] }, commands: { installations: [] } });

      expect(state.integrations.size).toBe(1);
      expect(state.integrations.has('CLAUDE.md')).toBe(true);
    });

    it('should include hash info for standard files', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.ai.yaml'), 'content');

      const state = scanActualState(TEST_DIR, { standards: [], integrations: [], skills: { installations: [] }, commands: { installations: [] } });

      const entry = state.standards.get('.standards/test.ai.yaml');
      expect(entry.hash).toMatch(/^sha256:/);
      expect(entry.size).toBe(100);
    });

    it('should scan skill directories', () => {
      const skillsDir = join(TEST_DIR, '.claude', 'skills', 'commit-standards');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), 'skill content');

      const manifest = {
        standards: [],
        integrations: [],
        skills: {
          installed: true,
          installations: [{ agent: 'claude-code', level: 'project' }]
        },
        commands: { installations: [] }
      };

      const state = scanActualState(TEST_DIR, manifest);

      expect(state.skills.size).toBe(1);
      expect(state.skills.has('skill:claude-code:project:commit-standards')).toBe(true);
    });

    it('should scan command directories', () => {
      const cmdsDir = join(TEST_DIR, '.claude', 'commands');
      mkdirSync(cmdsDir, { recursive: true });
      writeFileSync(join(cmdsDir, 'commit.md'), 'command content');

      const manifest = {
        standards: [],
        integrations: [],
        skills: { installations: [] },
        commands: {
          installed: true,
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      };

      const state = scanActualState(TEST_DIR, manifest);

      expect(state.commands.size).toBe(1);
      expect(state.commands.has('command:claude-code:project:commit')).toBe(true);
    });

    // XSPEC-343 R2. Gemini CLI installs commands as `.toml`; the scanner stripped
    // a hard-coded `.md`, so the key stayed `commit.toml` and never matched the
    // desired key `commit` — every Gemini command diffed as an orphan to delete.
    it('should strip the agent-specific command extension (.toml for gemini-cli)', () => {
      const cmdsDir = join(TEST_DIR, '.gemini', 'commands');
      mkdirSync(cmdsDir, { recursive: true });
      writeFileSync(join(cmdsDir, 'commit.toml'), 'command content');

      const manifest = {
        standards: [],
        integrations: [],
        skills: { installations: [] },
        commands: {
          installed: true,
          installations: [{ agent: 'gemini-cli', level: 'project' }]
        }
      };

      const state = scanActualState(TEST_DIR, manifest);

      expect(state.commands.has('command:gemini-cli:project:commit')).toBe(true);
      expect(state.commands.has('command:gemini-cli:project:commit.toml')).toBe(false);
      // The path must keep the extension even though the key drops it.
      expect(state.commands.get('command:gemini-cli:project:commit').relativePath)
        .toBe(join('.gemini', 'commands', 'commit.toml'));
    });

    // XSPEC-343 R2. Everything under the skills folder used to count as UDS's to
    // delete, so a plan for a repo with hand-written skills proposed removing
    // them — dev-platform's would have removed fourteen.
    it('should mark adopter-authored skills as not UDS-managed', () => {
      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(skillsDir, 'known-skill'), { recursive: true });
      mkdirSync(join(skillsDir, '_shared'), { recursive: true });
      mkdirSync(join(skillsDir, 'my-own-skill'), { recursive: true });
      writeFileSync(join(skillsDir, 'known-skill', 'SKILL.md'), 'x');
      writeFileSync(join(skillsDir, 'my-own-skill', 'SKILL.md'), 'x');

      const manifest = {
        standards: [], integrations: [],
        skills: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }] },
        commands: { installations: [] }
      };

      const state = scanActualState(TEST_DIR, manifest);
      const meta = (n) => state.skills.get(`skill:claude-code:project:${n}`).metadata;

      expect(meta('known-skill').udsManaged).toBe(true);
      // A non-skill sibling an older CLI copied in — still ours, still cleanable.
      expect(meta('_shared').udsManaged).toBe(true);
      expect(meta('my-own-skill').udsManaged).toBe(false);
    });

    // Regression pin for the interaction between two separately-correct fixes.
    // `skillHashes` was once a second provenance signal, safe only because the
    // hasher was recording 2 entries for 78 skills. Fixing the hasher (6.2.2)
    // populated it with every file under the skills folder, so an adopter's own
    // skill gained a hash and became a deletion candidate — re-opening the very
    // defect the provenance check exists to close. A populated skillHashes must
    // not make anything deletable that UDS does not ship.
    it('should keep adopter skills safe even when skillHashes covers them', () => {
      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      for (const n of ['my-own-skill', 'retired-skill', 'known-skill']) {
        mkdirSync(join(skillsDir, n), { recursive: true });
        writeFileSync(join(skillsDir, n, 'SKILL.md'), 'x');
      }

      const manifest = {
        standards: [], integrations: [],
        skills: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }] },
        commands: { installations: [] },
        // The post-6.2.2 shape: a hash for every file the scanner walked.
        skillHashes: {
          'claude-code/project/my-own-skill/SKILL.md': { hash: 'sha256:a' },
          'claude-code/project/retired-skill/SKILL.md': { hash: 'sha256:b' },
          'claude-code/project/known-skill/SKILL.md': { hash: 'sha256:c' }
        }
      };

      const state = scanActualState(TEST_DIR, manifest);
      const meta = (n) => state.skills.get(`skill:claude-code:project:${n}`).metadata;

      // Hand-written: never ours, hash or no hash.
      expect(meta('my-own-skill').udsManaged).toBe(false);
      // Once shipped, since removed: indistinguishable from the adopter's own work
      // on disk, so it is warned about rather than deleted. Deliberate cost.
      expect(meta('retired-skill').udsManaged).toBe(false);
      // Still shipped by UDS: ours, and still cleanable.
      expect(meta('known-skill').udsManaged).toBe(true);
    });

    // XSPEC-343 R2. `.manifest.json` is written by UDS's own command installer.
    // Counting it as a command made the reconciler propose deleting its own
    // installation record.
    it('should not treat the installer bookkeeping file as a command', () => {
      const cmdsDir = join(TEST_DIR, '.claude', 'commands');
      mkdirSync(cmdsDir, { recursive: true });
      writeFileSync(join(cmdsDir, 'commit.md'), 'command content');
      writeFileSync(join(cmdsDir, '.manifest.json'), '{"commands":["commit"]}');

      const manifest = {
        standards: [],
        integrations: [],
        skills: { installations: [] },
        commands: {
          installed: true,
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      };

      const state = scanActualState(TEST_DIR, manifest);

      expect(state.commands.size).toBe(1);
      expect(state.commands.has('command:claude-code:project:.manifest.json')).toBe(false);
    });
  });

  describe('legacyDiscovery', () => {
    it('should discover standards from .standards/ directory', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'commit-message.ai.yaml'), 'content');
      writeFileSync(join(standardsDir, 'testing.ai.yaml'), 'content');

      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.standards).toContain('commit-message');
      expect(result.syntheticManifest.standards).toContain('testing');
    });

    it('should discover integrations with UDS markers', () => {
      writeFileSync(
        join(TEST_DIR, 'CLAUDE.md'),
        '# My Project\n<!-- UDS:STANDARDS:START -->\nUDS content\n<!-- UDS:STANDARDS:END -->\n'
      );

      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.integrations).toContain('claude-code');
    });

    it('should set version to unknown for legacy discovery', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });

      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.upstream.version).toBe('unknown');
    });

    it('should return synthetic manifest with schema 3.3.0', () => {
      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.version).toBe('3.3.0');
    });

    it('should discover skill installations', () => {
      const skillsDir = join(TEST_DIR, '.claude', 'skills', 'my-skill');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), 'content');

      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.skills.installed).toBe(true);
      expect(result.syntheticManifest.skills.installations.length).toBeGreaterThan(0);
    });

    it('should return empty state for completely clean project', () => {
      const result = legacyDiscovery(TEST_DIR);

      expect(result.syntheticManifest.standards).toEqual([]);
      expect(result.syntheticManifest.integrations).toEqual([]);
    });
  });
});
