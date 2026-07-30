import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock registry
vi.mock('../../../src/utils/registry.js', () => ({
  getAllStandards: vi.fn(() => [
    {
      id: 'commit-message',
      category: 'core',
      source: { ai: 'ai/standards/commit-message.ai.yaml', human: 'core/commit-message-guide.md' },
      options: {
        // 真實註冊表用 output_language（底線），舊 mock 寫 outputLanguage（駝峰）——
        // mock 自成一個世界，於是把不存在的形狀釘成了「通過」。（XSPEC-343 R2）
        output_language: {
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
      source: { ai: 'ai/standards/testing.ai.yaml', human: 'core/testing-standards.md' },
      options: {
        test_level: {
          choices: [
            { id: 'unit-testing', source: { ai: 'ai/options/testing/unit-testing.ai.yaml' } },
            { id: 'integration-testing', source: { ai: 'ai/options/testing/integration-testing.ai.yaml' } }
          ]
        }
      }
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
    OPTIONS_INSTALL_DIR: '.standards/options',
    MANIFEST_OPTION_BINDINGS: [
      { manifestKeys: ['workflow'], standardId: 'git-workflow', categoryKey: 'workflow' },
      { manifestKeys: ['merge_strategy'], standardId: 'git-workflow', categoryKey: 'merge_strategy' },
      { manifestKeys: ['output_language', 'commit_language'], standardId: 'commit-message', categoryKey: 'output_language' },
      { manifestKeys: ['test_levels'], standardId: 'testing', categoryKey: 'test_level' }
    ],
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
    if (agent === 'gemini-cli' && level === 'project') {
      return `${projectPath}/.gemini/commands`;
    }
    return null;
  }),
  getCommandFileExtension: vi.fn((agent) => (agent === 'gemini-cli' ? '.toml' : '.md'))
}));

// Mock skills-installer
vi.mock('../../../src/utils/skills-installer.js', () => ({
  getAvailableSkillNames: vi.fn(() => ['commit-standards', 'testing-guide']),
  getAvailableCommandNames: vi.fn(() => ['commit', 'review-pr'])
}));

import { calculateDesiredState } from '../../../src/reconciler/desired-state-calculator.js';
import { getAvailableSkillNames, getAvailableCommandNames } from '../../../src/utils/skills-installer.js';

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

    // XSPEC-343 R2. This test used to pass `{ 'commit-message': { outputLanguage:
    // 'bilingual' } }` — a nested shape no writer has ever produced. It pinned the
    // fiction the calculator believed, which is why the calculator's empty output
    // went unnoticed. `manifest.options` is flat, exactly as manifest-installer.js
    // writes it.
    it('should calculate option entries from the flat manifest shape', () => {
      const manifest = {
        format: 'ai',
        standards: ['commit-message'],
        integrations: [],
        options: {
          display_language: 'zh-tw',   // 行為設定，不裝檔案
          output_language: 'bilingual'
        },
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.options.size).toBe(1);
      const [key, entry] = [...state.options.entries()][0];
      // 安裝器把選項檔平放在 .standards/options/，不是 <standardId>/<categoryKey>/ 樹狀
      expect(key).toBe('.standards/options/bilingual.ai.yaml');
      expect(entry.category).toBe('option');
      expect(entry.metadata.optionId).toBe('bilingual');
    });

    // The regression that mattered: a repo whose manifest names its selections
    // must not have those very files diffed as unwanted.
    it('should not leave selected options out of the desired state', () => {
      const manifest = {
        format: 'ai',
        standards: ['commit-message'],
        integrations: [],
        options: { output_language: 'english' },
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.options.size).toBeGreaterThan(0);
      expect(state.options.has('.standards/options/english.ai.yaml')).toBe(true);
    });

    // XSPEC-343 R1/R2. `manifest.skills.names` is written once by `init` and by no
    // other code path — across five UDS upgrades machine-setup's stayed frozen at
    // its original 32 while the shipped set grew to 55, so 40 usable skills diffed
    // as "no longer in desired state". The desired set is what this UDS version
    // ships (every install call site passes `skillNames = null` = all of them),
    // deliberately *ignoring* the stale manifest list.
    it('should derive skills from what UDS ships, not from the stale manifest list', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: {
          installed: true,
          location: 'project',
          names: ['commit-standards'],   // stale: shipped set is [commit-standards, testing-guide]
          version: '5.0.0',
          installations: [{ agent: 'claude-code', level: 'project' }]
        },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.skills.size).toBe(2);
      const key = 'skill:claude-code:project:commit-standards';
      expect(state.skills.has(key)).toBe(true);
      expect(state.skills.get(key).category).toBe('skill');
      // The one the frozen list omitted must still be desired — otherwise it is
      // scheduled for deletion despite being installed and usable.
      expect(state.skills.has('skill:claude-code:project:testing-guide')).toBe(true);
    });

    // XSPEC-343 R2. `manifest.extensions` had no branch in the calculator at all —
    // the word appeared once in the whole reconciler, in the scanner's empty
    // initialiser. Every installed extension therefore fell outside the desired
    // state and was proposed for deletion while the manifest went on listing it.
    // Three repos lost their 717-line Traditional Chinese locale pack to this.
    it('should keep installed extensions in the desired state', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        extensions: ['extensions/locales/zh-tw.md'],
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.standards.has('.standards/zh-tw.md')).toBe(true);
      expect(state.standards.get('.standards/zh-tw.md').metadata.extensionSource)
        .toBe('extensions/locales/zh-tw.md');
    });

    it('should tolerate a missing or malformed extensions field', () => {
      const base = {
        format: 'ai', standards: [], integrations: [], options: {},
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };
      expect(calculateDesiredState('/project', base).standards.size).toBe(0);
      expect(calculateDesiredState('/project', { ...base, extensions: [null, ''] }).standards.size).toBe(0);
    });

    // Marketplace installs live inside the Claude Code plugin, not the project.
    // Computing a project-level desired state for them marks every on-disk skill
    // for deletion.
    it('should compute no project skill state for marketplace installs', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: {
          installed: true,
          location: 'marketplace',
          names: ['all-via-plugin'],
          version: '5.0.0',
          installations: [{ agent: 'claude-code', level: 'project' }]
        },
        commands: { installed: false, installations: [] }
      };

      expect(calculateDesiredState('/project', manifest).skills.size).toBe(0);
    });

    it('should derive commands from what UDS ships, not from the stale manifest list', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: {
          installed: true,
          names: ['commit'],   // stale: shipped set is [commit, review-pr]
          version: '5.0.0',
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.commands.size).toBe(2);
      expect(state.commands.has('command:claude-code:project:commit')).toBe(true);
      expect(state.commands.has('command:claude-code:project:review-pr')).toBe(true);
    });

    // An unreadable source tree yields an empty shipped list. Returning quietly
    // would leave `desired` empty, and every installed skill would diff as a
    // deletion — the exact shape this whole change exists to prevent. It has to
    // fail loudly instead.
    it('should throw rather than plan an empty desired state when the source is unreadable', () => {
      getAvailableSkillNames.mockReturnValueOnce([]);
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

      expect(() => calculateDesiredState('/project', manifest)).toThrow(/deleting every installed skill/);
    });

    it('should throw rather than plan an empty desired command state', () => {
      getAvailableCommandNames.mockReturnValueOnce([]);
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

      expect(() => calculateDesiredState('/project', manifest)).toThrow(/deleting every installed command/);
    });

    // The key drops the extension; the path must carry it, or a delete/create
    // action would target a file that does not exist.
    it('should use the agent-specific extension in command paths', () => {
      const manifest = {
        format: 'ai',
        standards: [],
        integrations: [],
        options: {},
        skills: { installed: false, installations: [] },
        commands: {
          installed: true,
          names: [],
          version: '5.0.0',
          installations: [{ agent: 'gemini-cli', level: 'project' }]
        }
      };

      const state = calculateDesiredState('/project', manifest);

      const entry = state.commands.get('command:gemini-cli:project:commit');
      expect(entry).toBeDefined();
      expect(entry.relativePath.endsWith('.toml')).toBe(true);
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

    // The real multi-select is `test_levels`, and its manifest key is plural while
    // the registry category is singular (`test_level`) — a mismatch the binding
    // table exists to absorb. (XSPEC-343 R2)
    it('should handle multi-select options (array) under a plural manifest key', () => {
      const manifest = {
        format: 'ai',
        standards: ['testing'],
        integrations: [],
        options: {
          test_levels: ['unit-testing', 'integration-testing']
        },
        skills: { installed: false, installations: [] },
        commands: { installed: false, installations: [] }
      };

      const state = calculateDesiredState('/project', manifest);

      expect(state.options.size).toBe(2);
      expect(state.options.has('.standards/options/unit-testing.ai.yaml')).toBe(true);
      expect(state.options.has('.standards/options/integration-testing.ai.yaml')).toBe(true);
    });
  });
});
