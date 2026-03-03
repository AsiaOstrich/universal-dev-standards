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
    return null;
  })
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
