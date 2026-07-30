import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock registry
vi.mock('../../../src/utils/registry.js', () => ({
  getAllStandards: vi.fn(() => [
    {
      id: 'commit-message',
      category: 'core',
      source: { ai: 'ai/standards/commit-message.ai.yaml', human: 'core/commit-message-guide.md' },
      options: {
        outputLanguage: {
          choices: [
            { id: 'english', source: { ai: 'ai/options/commit-message/outputLanguage/english.ai.yaml' } },
            { id: 'bilingual', source: { ai: 'ai/options/commit-message/outputLanguage/bilingual.ai.yaml' } }
          ],
          default: 'english'
        }
      }
    },
    {
      id: 'testing',
      category: 'core',
      source: { ai: 'ai/standards/testing.ai.yaml', human: 'core/testing-standards.md' }
    },
    {
      id: 'anti-hallucination',
      category: 'core',
      source: { ai: 'ai/standards/anti-hallucination.ai.yaml' }
    }
  ]),
  getStandardSource: vi.fn((standard, format) => {
    if (typeof standard.source === 'string') return standard.source;
    return standard.source?.[format] || standard.source?.human || null;
  }),
  findOption: vi.fn((standard, catKey, optId) => {
    const cat = standard.options?.[catKey];
    if (!cat) return null;
    return cat.choices.find(c => c.id === optId) || null;
  }),
  getOptionSource: vi.fn((option, format) => {
    if (typeof option.source === 'string') return option.source;
    return option.source?.[format] || option.source?.human;
  })
}));

// Mock PathResolver
vi.mock('../../../src/core/paths.js', () => ({
  PathResolver: {
    getStandardSource: vi.fn((relPath) => `/bundled/${relPath}`)
  }
}));

// Mock hasher
vi.mock('../../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn(() => ({
    hash: 'sha256:abc123',
    size: 100
  })),
  computeIntegrationBlockHash: vi.fn()
}));

// Mock constants
// ⚠️ vi.mock 的工廠會被提升到檔頂，所以工具表必須定義在工廠**內部**——
// 放在頂層 const 會得到 "Cannot access 'MOCK_TOOLS' before initialization"。
vi.mock('../../../src/core/constants.js', () => {
  const MOCK_TOOLS = {
    'claude-code': { name: 'Claude Code', file: 'CLAUDE.md', format: 'markdown', category: 'primary', supports: ['skills', 'commands'] },
    'cursor': { name: 'Cursor', file: '.cursorrules', format: 'plaintext', category: 'secondary', supports: ['skills'] }
  };
  return {
    SUPPORTED_AI_TOOLS: MOCK_TOOLS,
    // `manifest.integrations` holds tool keys in some repos and file paths in
    // others (XSPEC-343 R1), so the calculator resolves through this helper.
    // Mirrors the real implementation rather than stubbing it to identity —
    // an identity stub would make the legacy-shape tests pass for the wrong reason.
    resolveToolKey: (entry) => {
      if (typeof entry !== 'string' || !entry) return null;
      if (MOCK_TOOLS[entry]) return entry;
      const norm = entry.replace(/\\/g, '/');
      for (const [key, cfg] of Object.entries(MOCK_TOOLS)) {
        if (norm === cfg.file || norm.endsWith(`/${cfg.file}`)) return key;
      }
      return null;
    }
  };
});

// Mock ai-agent-paths
vi.mock('../../../src/config/ai-agent-paths.js', () => ({
  getSkillsDirForAgent: vi.fn((agent, level, projectPath) => {
    if (agent === 'claude-code' && level === 'project') {
      return `${projectPath}/.claude/skills`;
    }
    return null;
  }),
  getCommandsDirForAgent: vi.fn((agent, level, projectPath) => {
    if (agent === 'claude-code' && level === 'project') {
      return `${projectPath}/.claude/commands`;
    }
    return null;
  })
}));

// Mock skills-installer
vi.mock('../../../src/utils/skills-installer.js', () => ({
  getAvailableSkillNames: vi.fn(() => ['commit-standards', 'testing-guide']),
  getAvailableCommandNames: vi.fn(() => ['commit', 'review-pr'])
}));

import { calculateDesiredState } from '../../../src/reconciler/desired-state-calculator.js';

describe('DesiredStateCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateDesiredState', () => {
    it('should return empty state for empty manifest', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.standards.size).toBe(0);
      expect(state.options.size).toBe(0);
      expect(state.integrations.size).toBe(0);
      expect(state.skills.size).toBe(0);
      expect(state.commands.size).toBe(0);
    });

    it('should calculate standard entries from manifest', () => {
      const manifest = {
        format: 'ai',
        standards: ['commit-message', 'testing'],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.standards.size).toBe(2);
      // Check that entries have the expected shape
      for (const [key, entry] of state.standards) {
        expect(entry.relativePath).toMatch(/^\.standards\//);
        expect(entry.category).toBe('standard');
        expect(entry.hash).toMatch(/^sha256:/);
      }
    });

    it('should skip standards not found in registry', () => {
      const manifest = {
        format: 'ai',
        standards: ['nonexistent-standard'],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.standards.size).toBe(0);
    });

    it('should calculate integration entries', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: ['claude-code', 'cursor'],
        options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.integrations.size).toBe(2);
      expect(state.integrations.has('CLAUDE.md')).toBe(true);
      expect(state.integrations.has('.cursorrules')).toBe(true);

      const claudeEntry = state.integrations.get('CLAUDE.md');
      expect(claudeEntry.category).toBe('integration');
      expect(claudeEntry.metadata.toolName).toBe('claude-code');
    });

    // XSPEC-343 R1：20/21 個採用 repo 的 manifest.integrations 存的是檔名而非工具鍵。
    // 舊版讀取端查表落空 → integrations 的 desired state 為空 →
    // reconciler 判「integration no longer configured」並計畫刪掉 CLAUDE.md 的 UDS 區塊。
    it('accepts the legacy file-path shape 20 of 21 adopter repos actually had', () => {
      const state = calculateDesiredState('/proj', {
        standards: [], integrations: ['CLAUDE.md']
      });
      expect(state.integrations.has('CLAUDE.md')).toBe(true);
    });

    it('accepts an absolute path — two adopter repos stored those', () => {
      const state = calculateDesiredState('/proj', {
        standards: [], integrations: ['/Users/x/GitHub/proj/CLAUDE.md']
      });
      expect(state.integrations.has('CLAUDE.md')).toBe(true);
    });

    it('does not treat a lookalike filename as the managed integration', () => {
      const state = calculateDesiredState('/proj', {
        standards: [], integrations: ['MY-CLAUDE.md']
      });
      expect(state.integrations.size).toBe(0);
    });

    it('should calculate option entries', () => {
      const manifest = {
        format: 'ai',
        standards: ['commit-message'],
        integrations: [],
        options: {
          'commit-message': {
            outputLanguage: 'bilingual'
          }
        },
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.options.size).toBe(1);
      const [key, entry] = [...state.options.entries()][0];
      expect(key).toContain('options/');
      expect(entry.category).toBe('option');
      expect(entry.metadata.optionId).toBe('bilingual');
    });

    it('should calculate skill entries for project installations', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: {
          installed: true,
          location: 'project',
          names: ['commit-standards'],
          version: '5.0.0',
          installations: [{ agent: 'claude-code', level: 'project' }]
        },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.skills.size).toBe(1);
      const key = 'skill:claude-code:project:commit-standards';
      expect(state.skills.has(key)).toBe(true);
      expect(state.skills.get(key).category).toBe('skill');
    });

    it('should calculate command entries for project installations', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: {
          installed: true,
          names: ['commit'],
          version: '5.0.0',
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.commands.size).toBe(1);
      const key = 'command:claude-code:project:commit';
      expect(state.commands.has(key)).toBe(true);
    });

    it('should use ai format by default', () => {
      const manifest = {
        standards: ['commit-message'],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      const entry = [...state.standards.values()][0];
      expect(entry.metadata.format).toBe('ai');
    });

    it('should handle multi-select options (array)', () => {
      const manifest = {
        format: 'ai',
        standards: ['commit-message'],
        integrations: [],
        options: {
          'commit-message': {
            outputLanguage: ['english', 'bilingual']
          }
        },
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.options.size).toBe(2);
    });
  });
});
