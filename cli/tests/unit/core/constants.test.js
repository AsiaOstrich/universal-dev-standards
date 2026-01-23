import { describe, it, expect } from 'vitest';
import {
  UDS_MARKERS,
  UDS_BLOCKS,
  SUPPORTED_AI_TOOLS,
  LEGACY_TOOL_MAPPINGS,
  FILE_EXTENSIONS,
  CONTENT_MODES,
  STANDARDS_SCOPES,
  STANDARD_FORMATS,
  ADOPTION_LEVELS,
  GIT_WORKFLOWS,
  MERGE_STRATEGIES,
  COMMIT_LANGUAGES,
  TEST_LEVELS,
  INSTALLATION_LOCATIONS,
  SKILL_CATEGORIES,
  DIRECTORIES,
  FILE_PATTERNS,
  HTTP_CONFIG,
  GITHUB_CONFIG,
  HASH_CONFIG,
  VALIDATION_PATTERNS,
  UI_CONFIG,
  DEFAULTS,
  FEATURE_FLAGS,
  ENV_VARS,
  CACHE_CONFIG,
  FILE_SIZE_LIMITS,
  TIMEOUTS,
  ERROR_SEVERITY,
  LOG_LEVELS,
  PERMISSIONS,
  ENCODINGS,
  STATUS_CODES,
  isToolSupported,
  getNormalizedToolName,
  getToolConfig,
  doesToolSupport,
  getToolFormat,
  getToolFileName
} from '../../../src/core/constants.js';

describe('Core Constants', () => {
  describe('UDS_MARKERS', () => {
    it('should have markdown markers', () => {
      expect(UDS_MARKERS.markdown.start).toBe('<!-- UDS:STANDARDS:START -->');
      expect(UDS_MARKERS.markdown.end).toBe('<!-- UDS:STANDARDS:END -->');
    });

    it('should have plaintext markers', () => {
      expect(UDS_MARKERS.plaintext.start).toBe('# === UDS:STANDARDS:START ===');
      expect(UDS_MARKERS.plaintext.end).toBe('# === UDS:STANDARDS:END ===');
    });

    it('should have yaml markers', () => {
      expect(UDS_MARKERS.yaml.start).toBe('# === UDS:START ===');
      expect(UDS_MARKERS.yaml.end).toBe('# === UDS:END ===');
    });

    it('should have json markers', () => {
      expect(UDS_MARKERS.json.start).toBe('/* === UDS:START === */');
      expect(UDS_MARKERS.json.end).toBe('/* === UDS:END === */');
    });
  });

  describe('UDS_BLOCKS', () => {
    it('should have all block types', () => {
      expect(UDS_BLOCKS.INTRO).toBe('INTRO');
      expect(UDS_BLOCKS.STANDARDS).toBe('STANDARDS');
      expect(UDS_BLOCKS.COMMANDS).toBe('COMMANDS');
      expect(UDS_BLOCKS.SKILLS).toBe('SKILLS');
      expect(UDS_BLOCKS.AGENTS).toBe('AGENTS');
      expect(UDS_BLOCKS.WORKFLOWS).toBe('WORKFLOWS');
      expect(UDS_BLOCKS.REFERENCES).toBe('REFERENCES');
    });
  });

  describe('SUPPORTED_AI_TOOLS', () => {
    it('should have claude-code configuration', () => {
      const claudeCode = SUPPORTED_AI_TOOLS['claude-code'];
      expect(claudeCode.name).toBe('Claude Code');
      expect(claudeCode.file).toBe('CLAUDE.md');
      expect(claudeCode.format).toBe('markdown');
      expect(claudeCode.category).toBe('primary');
      expect(claudeCode.supports).toContain('skills');
      expect(claudeCode.supports).toContain('commands');
      expect(claudeCode.supports).toContain('agents');
      expect(claudeCode.supports).toContain('workflows');
    });

    it('should have cursor configuration', () => {
      const cursor = SUPPORTED_AI_TOOLS['cursor'];
      expect(cursor.name).toBe('Cursor');
      expect(cursor.file).toBe('.cursorrules');
      expect(cursor.format).toBe('plaintext');
    });

    it('should have opencode configuration', () => {
      const opencode = SUPPORTED_AI_TOOLS['opencode'];
      expect(opencode.name).toBe('OpenCode');
      expect(opencode.file).toBe('AGENTS.md');
    });

    it('should have github-copilot configuration with nested path', () => {
      const copilot = SUPPORTED_AI_TOOLS['github-copilot'];
      expect(copilot.file).toBe('.github/copilot-instructions.md');
    });

    it('should have all primary and secondary tools', () => {
      const primaryTools = Object.entries(SUPPORTED_AI_TOOLS)
        .filter(([, config]) => config.category === 'primary');
      const secondaryTools = Object.entries(SUPPORTED_AI_TOOLS)
        .filter(([, config]) => config.category === 'secondary');

      expect(primaryTools.length).toBeGreaterThanOrEqual(2);
      expect(secondaryTools.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('LEGACY_TOOL_MAPPINGS', () => {
    it('should map legacy tool names', () => {
      expect(LEGACY_TOOL_MAPPINGS['codex']).toBe('opencode');
      expect(LEGACY_TOOL_MAPPINGS['gemini-cli']).toBe('opencode');
      expect(LEGACY_TOOL_MAPPINGS['copilot']).toBe('github-copilot');
    });
  });

  describe('FILE_EXTENSIONS', () => {
    it('should have correct extensions', () => {
      expect(FILE_EXTENSIONS.MARKDOWN).toBe('.md');
      expect(FILE_EXTENSIONS.AI_YAML).toBe('.ai.yaml');
      expect(FILE_EXTENSIONS.YAML).toBe('.yaml');
      expect(FILE_EXTENSIONS.JSON).toBe('.json');
      expect(FILE_EXTENSIONS.WORKFLOW).toBe('.workflow.yaml');
    });
  });

  describe('CONTENT_MODES', () => {
    it('should have all content modes', () => {
      expect(CONTENT_MODES.MINIMAL).toBe('minimal');
      expect(CONTENT_MODES.INDEX).toBe('index');
      expect(CONTENT_MODES.FULL).toBe('full');
    });
  });

  describe('STANDARDS_SCOPES', () => {
    it('should have scope options', () => {
      expect(STANDARDS_SCOPES.MINIMAL).toBe('minimal');
      expect(STANDARDS_SCOPES.FULL).toBe('full');
    });
  });

  describe('STANDARD_FORMATS', () => {
    it('should have format options', () => {
      expect(STANDARD_FORMATS.AI).toBe('ai');
      expect(STANDARD_FORMATS.HUMAN).toBe('human');
      expect(STANDARD_FORMATS.BOTH).toBe('both');
    });
  });

  describe('ADOPTION_LEVELS', () => {
    it('should have three levels', () => {
      expect(ADOPTION_LEVELS.LEVEL_1).toBe(1);
      expect(ADOPTION_LEVELS.LEVEL_2).toBe(2);
      expect(ADOPTION_LEVELS.LEVEL_3).toBe(3);
    });
  });

  describe('GIT_WORKFLOWS', () => {
    it('should have workflow types', () => {
      expect(GIT_WORKFLOWS.GITHUB_FLOW).toBe('github-flow');
      expect(GIT_WORKFLOWS.GITFLOW).toBe('gitflow');
      expect(GIT_WORKFLOWS.TRUNK_BASED).toBe('trunk-based');
    });
  });

  describe('DIRECTORIES', () => {
    it('should have directory names', () => {
      expect(DIRECTORIES.STANDARDS).toBe('.standards');
      expect(DIRECTORIES.UDS).toBe('.uds');
      expect(DIRECTORIES.CORE).toBe('core');
      expect(DIRECTORIES.AI).toBe('ai');
      expect(DIRECTORIES.LOCALES).toBe('locales');
      expect(DIRECTORIES.SKILLS).toBe('skills');
      expect(DIRECTORIES.AGENTS).toBe('agents');
      expect(DIRECTORIES.WORKFLOWS).toBe('workflows');
    });
  });

  describe('FILE_PATTERNS', () => {
    it('should have file patterns using DIRECTORIES', () => {
      expect(FILE_PATTERNS.STANDARDS).toBe('core/*.md');
      expect(FILE_PATTERNS.AI_STANDARDS).toBe('ai/standards/*.ai.yaml');
      expect(FILE_PATTERNS.LOCALES).toBe('locales/*/**.md');
      expect(FILE_PATTERNS.SKILLS).toBe('skills/**');
    });
  });

  describe('HTTP_CONFIG', () => {
    it('should have HTTP settings', () => {
      expect(HTTP_CONFIG.TIMEOUT).toBe(30000);
      expect(HTTP_CONFIG.MAX_RETRIES).toBe(3);
      expect(HTTP_CONFIG.USER_AGENT).toMatch(/^UDS-CLI\//);
    });
  });

  describe('GITHUB_CONFIG', () => {
    it('should have GitHub settings', () => {
      expect(GITHUB_CONFIG.REPO).toBe('AsiaOstrich/universal-dev-standards');
      expect(GITHUB_CONFIG.API_BASE).toBe('https://api.github.com');
      expect(GITHUB_CONFIG.DEFAULT_BRANCH).toBe('main');
    });
  });

  describe('HASH_CONFIG', () => {
    it('should have hash settings', () => {
      expect(HASH_CONFIG.ALGORITHM).toBe('sha256');
      expect(HASH_CONFIG.PREFIX).toBe('sha256:');
      expect(HASH_CONFIG.ENCODING).toBe('hex');
    });
  });

  describe('VALIDATION_PATTERNS', () => {
    it('should have valid regex patterns', () => {
      // Test semver pattern
      expect(new RegExp(VALIDATION_PATTERNS.SEMVER).test('1.2.3')).toBe(true);
      expect(new RegExp(VALIDATION_PATTERNS.SEMVER).test('1.2.3-beta.1')).toBe(true);
      expect(new RegExp(VALIDATION_PATTERNS.SEMVER).test('invalid')).toBe(false);

      // Test email pattern
      expect(new RegExp(VALIDATION_PATTERNS.EMAIL).test('test@example.com')).toBe(true);
      expect(new RegExp(VALIDATION_PATTERNS.EMAIL).test('invalid')).toBe(false);

      // Test URL pattern
      expect(new RegExp(VALIDATION_PATTERNS.URL).test('https://example.com')).toBe(true);
      expect(new RegExp(VALIDATION_PATTERNS.URL).test('http://example.com/path')).toBe(true);

      // Test repo pattern
      expect(new RegExp(VALIDATION_PATTERNS.REPO).test('owner/repo')).toBe(true);
    });
  });

  describe('PERMISSIONS', () => {
    it('should have correct bitwise values', () => {
      expect(PERMISSIONS.READABLE).toBe(1);  // 1 << 0 = 1
      expect(PERMISSIONS.WRITABLE).toBe(2);  // 1 << 1 = 2
      expect(PERMISSIONS.EXECUTABLE).toBe(4); // 1 << 2 = 4
      expect(PERMISSIONS.ALL).toBe(7);        // 1 | 2 | 4 = 7
    });

    it('should allow bitwise operations', () => {
      const readWrite = PERMISSIONS.READABLE | PERMISSIONS.WRITABLE;
      expect(readWrite).toBe(3);

      const hasRead = (readWrite & PERMISSIONS.READABLE) !== 0;
      const hasExec = (readWrite & PERMISSIONS.EXECUTABLE) !== 0;
      expect(hasRead).toBe(true);
      expect(hasExec).toBe(false);
    });
  });

  describe('DEFAULTS', () => {
    it('should have default values', () => {
      expect(DEFAULTS.LEVEL).toBe(2);
      expect(DEFAULTS.FORMAT).toBe('ai');
      expect(DEFAULTS.STANDARDS_SCOPE).toBe('minimal');
      expect(DEFAULTS.CONTENT_MODE).toBe('index');
      expect(DEFAULTS.WORKFLOW).toBe('github-flow');
      expect(DEFAULTS.MERGE_STRATEGY).toBe('squash');
      expect(DEFAULTS.COMMIT_LANGUAGE).toBe('english');
    });
  });

  describe('STATUS_CODES', () => {
    it('should have status codes', () => {
      expect(STATUS_CODES.SUCCESS).toBe('success');
      expect(STATUS_CODES.ERROR).toBe('error');
      expect(STATUS_CODES.WARNING).toBe('warning');
      expect(STATUS_CODES.SKIPPED).toBe('skipped');
      expect(STATUS_CODES.CANCELLED).toBe('cancelled');
      expect(STATUS_CODES.IN_PROGRESS).toBe('in_progress');
    });
  });
});

describe('Helper Functions', () => {
  describe('isToolSupported', () => {
    it('should return true for supported tools', () => {
      expect(isToolSupported('claude-code')).toBe(true);
      expect(isToolSupported('cursor')).toBe(true);
      expect(isToolSupported('opencode')).toBe(true);
    });

    it('should return true for legacy tool names', () => {
      expect(isToolSupported('codex')).toBe(true);
      expect(isToolSupported('copilot')).toBe(true);
    });

    it('should return false for unsupported tools', () => {
      expect(isToolSupported('nonexistent')).toBe(false);
      expect(isToolSupported('random-tool')).toBe(false);
    });
  });

  describe('getNormalizedToolName', () => {
    it('should return normalized name for legacy tools', () => {
      expect(getNormalizedToolName('codex')).toBe('opencode');
      expect(getNormalizedToolName('gemini-cli')).toBe('opencode');
      expect(getNormalizedToolName('copilot')).toBe('github-copilot');
    });

    it('should return same name for non-legacy tools', () => {
      expect(getNormalizedToolName('claude-code')).toBe('claude-code');
      expect(getNormalizedToolName('cursor')).toBe('cursor');
    });
  });

  describe('getToolConfig', () => {
    it('should return config for supported tools', () => {
      const config = getToolConfig('claude-code');
      expect(config).not.toBeNull();
      expect(config.name).toBe('Claude Code');
      expect(config.file).toBe('CLAUDE.md');
    });

    it('should return config for legacy tool names', () => {
      const config = getToolConfig('copilot');
      expect(config).not.toBeNull();
      expect(config.name).toBe('GitHub Copilot');
    });

    it('should return null for unsupported tools', () => {
      expect(getToolConfig('nonexistent')).toBeNull();
    });
  });

  describe('doesToolSupport', () => {
    it('should return true for supported features', () => {
      expect(doesToolSupport('claude-code', 'skills')).toBe(true);
      expect(doesToolSupport('claude-code', 'commands')).toBe(true);
      expect(doesToolSupport('claude-code', 'agents')).toBe(true);
      expect(doesToolSupport('claude-code', 'workflows')).toBe(true);
    });

    it('should return false for unsupported features', () => {
      expect(doesToolSupport('cursor', 'commands')).toBe(false);
      expect(doesToolSupport('cursor', 'agents')).toBe(false);
    });

    it('should handle legacy tool names', () => {
      expect(doesToolSupport('copilot', 'skills')).toBe(true);
    });

    it('should return falsy for nonexistent tools', () => {
      // Returns null when tool doesn't exist, which is falsy
      expect(doesToolSupport('nonexistent', 'skills')).toBeFalsy();
    });
  });

  describe('getToolFormat', () => {
    it('should return correct format', () => {
      expect(getToolFormat('claude-code')).toBe('markdown');
      expect(getToolFormat('cursor')).toBe('plaintext');
      expect(getToolFormat('aider')).toBe('yaml');
    });

    it('should return markdown as default for unknown tools', () => {
      expect(getToolFormat('unknown')).toBe('markdown');
    });
  });

  describe('getToolFileName', () => {
    it('should return correct file name', () => {
      expect(getToolFileName('claude-code')).toBe('CLAUDE.md');
      expect(getToolFileName('cursor')).toBe('.cursorrules');
      expect(getToolFileName('github-copilot')).toBe('.github/copilot-instructions.md');
    });

    it('should return fallback name for unknown tools', () => {
      expect(getToolFileName('unknown')).toBe('unknown.md');
    });
  });
});
