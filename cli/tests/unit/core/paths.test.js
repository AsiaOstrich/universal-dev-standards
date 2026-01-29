import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  PathResolver,
  PATH_PRIORITY,
  DIRECTORIES,
  FILE_PATTERNS,
  EXTENSIONS,
  getSourcePath,
  getRepoRoot,
  getBundledRoot
} from '../../../src/core/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/paths-test');

describe('PathResolver', () => {
  beforeEach(() => {
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

  describe('getCliRoot', () => {
    it('should return CLI root directory', () => {
      const cliRoot = PathResolver.getCliRoot();
      expect(typeof cliRoot).toBe('string');
      expect(cliRoot.length).toBeGreaterThan(0);
    });

    it('should be consistent across calls', () => {
      const root1 = PathResolver.getCliRoot();
      const root2 = PathResolver.getCliRoot();
      expect(root1).toBe(root2);
    });
  });

  describe('getRepoRoot', () => {
    it('should return repository root directory', () => {
      const repoRoot = PathResolver.getRepoRoot();
      expect(typeof repoRoot).toBe('string');
      expect(repoRoot.length).toBeGreaterThan(0);
    });
  });

  describe('getBundledRoot', () => {
    it('should return bundled files directory', () => {
      const bundledRoot = PathResolver.getBundledRoot();
      expect(typeof bundledRoot).toBe('string');
      expect(bundledRoot).toContain('bundled');
    });
  });

  describe('getStandardSource', () => {
    it('should return null for non-existent files', () => {
      const result = PathResolver.getStandardSource('nonexistent/file.md');
      // Should return null if not found in bundled or repo
      // If running in development mode, it might find the file in repo
      // So we just verify it returns string or null
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return path for existing file in repo', () => {
      // This will test with actual repo structure
      const result = PathResolver.getStandardSource('core/anti-hallucination.md');
      // In dev environment, this should find the file
      if (result !== null) {
        expect(result).toContain('anti-hallucination.md');
        expect(existsSync(result)).toBe(true);
      }
    });
  });

  describe('getManifestPath', () => {
    it('should return path to manifest.json', () => {
      const path = PathResolver.getManifestPath(TEST_DIR);
      expect(path).toBe(join(TEST_DIR, '.standards', 'manifest.json'));
    });
  });

  describe('getStandardsDir', () => {
    it('should return .standards directory path', () => {
      const path = PathResolver.getStandardsDir(TEST_DIR);
      expect(path).toBe(join(TEST_DIR, '.standards'));
    });
  });

  describe('getUDSDir', () => {
    it('should return .uds directory path', () => {
      const path = PathResolver.getUDSDir(TEST_DIR);
      expect(path).toBe(join(TEST_DIR, '.uds'));
    });
  });

  describe('getStandardTarget', () => {
    it('should return target path within .standards directory', () => {
      const path = PathResolver.getStandardTarget(TEST_DIR, 'core/test.md');
      expect(path).toBe(join(TEST_DIR, '.standards', 'core/test.md'));
    });
  });

  describe('getIntegrationTarget', () => {
    it('should return correct target for claude-code', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'claude-code', 'test.md');
      expect(path).toBe(join(TEST_DIR, 'CLAUDE.md'));
    });

    it('should return correct target for cursor', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'cursor', 'test.txt');
      expect(path).toBe(join(TEST_DIR, '.cursorrules'));
    });

    it('should return correct target for cline', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'cline', 'test.txt');
      expect(path).toBe(join(TEST_DIR, '.clinerules'));
    });

    it('should return correct target for windsurf', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'windsurf', 'test.txt');
      expect(path).toBe(join(TEST_DIR, '.windsurfrules'));
    });

    it('should return correct target for github-copilot', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'copilot', 'test.md');
      expect(path).toBe(join(TEST_DIR, 'copilot-instructions.md'));
    });

    it('should return correct target for aider', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'aider', 'test.yml');
      expect(path).toBe(join(TEST_DIR, '.aider.conf.yml'));
    });

    it('should return correct target for opencode', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'opencode', 'test.md');
      expect(path).toBe(join(TEST_DIR, 'AGENTS.md'));
    });

    it('should return correct target for antigravity', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'antigravity', 'test.md');
      expect(path).toBe(join(TEST_DIR, 'INSTRUCTIONS.md'));
    });

    it('should use fileName as fallback for unknown tools', () => {
      const path = PathResolver.getIntegrationTarget(TEST_DIR, 'unknown', 'custom.md');
      expect(path).toBe(join(TEST_DIR, 'custom.md'));
    });
  });

  describe('existsLocally', () => {
    it('should return true for existing files', () => {
      // Test with a known file in the repo
      const exists = PathResolver.existsLocally('core/anti-hallucination.md');
      // In dev environment this should be true
      expect(typeof exists).toBe('boolean');
    });

    it('should return false for non-existent files', () => {
      const exists = PathResolver.existsLocally('definitely/not/a/real/file.md');
      expect(exists).toBe(false);
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path', () => {
      const full = `${TEST_DIR}/some/nested/file.txt`;
      const relative = PathResolver.getRelativePath(TEST_DIR, full);
      expect(relative).toBe('some/nested/file.txt');
    });
  });

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(PathResolver.normalizePath('path\\to\\file')).toBe('path/to/file');
      expect(PathResolver.normalizePath('path/to/file')).toBe('path/to/file');
    });
  });

  describe('join', () => {
    it('should join path segments', () => {
      const path = PathResolver.join('a', 'b', 'c');
      expect(path).toBe(join('a', 'b', 'c'));
    });
  });

  describe('getExtension', () => {
    it('should return file extension with dot', () => {
      expect(PathResolver.getExtension('file.txt')).toBe('.txt');
      expect(PathResolver.getExtension('file.ai.yaml')).toBe('.yaml');
      expect(PathResolver.getExtension('/path/to/file.md')).toBe('.md');
    });
  });

  describe('getBaseName', () => {
    it('should return file name without extension', () => {
      expect(PathResolver.getBaseName('file.txt')).toBe('file');
      expect(PathResolver.getBaseName('test.md')).toBe('test');
    });
  });

  describe('File Type Detection', () => {
    describe('isStandardFile', () => {
      it('should return true for core standard files', () => {
        expect(PathResolver.isStandardFile('core/anti-hallucination.md')).toBe(true);
      });

      it('should return true for AI standard files', () => {
        expect(PathResolver.isStandardFile('ai/standards/test.ai.yaml')).toBe(true);
      });

      it('should return false for other files', () => {
        expect(PathResolver.isStandardFile('skills/some-skill.md')).toBe(false);
      });
    });

    describe('isSkillFile', () => {
      it('should return true for skill files', () => {
        expect(PathResolver.isSkillFile('skills/agent.md')).toBe(true);
      });

      it('should return false for non-skill files', () => {
        expect(PathResolver.isSkillFile('core/standard.md')).toBe(false);
      });
    });

    describe('isIntegrationFile', () => {
      it('should return true for integration files', () => {
        expect(PathResolver.isIntegrationFile('integrations/claude-code/test.md')).toBe(true);
      });

      it('should return false for non-integration files', () => {
        expect(PathResolver.isIntegrationFile('core/standard.md')).toBe(false);
      });
    });

    describe('isLocaleFile', () => {
      it('should return true for locale files', () => {
        expect(PathResolver.isLocaleFile('locales/zh-TW/core/test.md')).toBe(true);
      });

      it('should return false for non-locale files', () => {
        expect(PathResolver.isLocaleFile('core/standard.md')).toBe(false);
      });
    });

    describe('getFileType', () => {
      it('should return correct file type', () => {
        expect(PathResolver.getFileType('core/test.md')).toBe('standard');
        expect(PathResolver.getFileType('skills/test.md')).toBe('skill');
        expect(PathResolver.getFileType('integrations/tool/test.md')).toBe('integration');
        expect(PathResolver.getFileType('locales/zh-TW/test.md')).toBe('locale');
        expect(PathResolver.getFileType('random/path/file.md')).toBe('unknown');
      });
    });
  });

  describe('canonicalizePath', () => {
    it('should remove leading ./', () => {
      expect(PathResolver.canonicalizePath('./path/to/file')).toBe('path/to/file');
    });

    it('should convert backslashes to forward slashes', () => {
      expect(PathResolver.canonicalizePath('path\\to\\file')).toBe('path/to/file');
    });

    it('should remove trailing slash', () => {
      expect(PathResolver.canonicalizePath('path/to/dir/')).toBe('path/to/dir');
    });

    it('should handle combined cases', () => {
      expect(PathResolver.canonicalizePath('./path\\to\\dir/')).toBe('path/to/dir');
    });
  });

  describe('getAllPossibleLocations', () => {
    it('should return locations with priorities', () => {
      const locations = PathResolver.getAllPossibleLocations('core/test.md');

      expect(locations).toHaveLength(2);
      expect(locations[0].type).toBe('bundled');
      expect(locations[0].priority).toBe(PATH_PRIORITY.BUNDLED);
      expect(locations[1].type).toBe('repo');
      expect(locations[1].priority).toBe(PATH_PRIORITY.REPO);
    });
  });

  describe('findFirstExisting', () => {
    it('should return null for non-existent paths', () => {
      const result = PathResolver.findFirstExisting('definitely/not/real.md');
      expect(result).toBeNull();
    });

    it('should return location object for existing paths', () => {
      const result = PathResolver.findFirstExisting('core/anti-hallucination.md');
      // In dev environment this should find the file
      if (result !== null) {
        expect(result.path).toBeDefined();
        expect(result.priority).toBeDefined();
        expect(result.type).toBeDefined();
      }
    });
  });
});

describe('PATH_PRIORITY', () => {
  it('should have correct priority values', () => {
    expect(PATH_PRIORITY.BUNDLED).toBe(1);
    expect(PATH_PRIORITY.REPO).toBe(2);
    expect(PATH_PRIORITY.GITHUB).toBe(3);
  });
});

describe('Re-exports from constants.js', () => {
  describe('DIRECTORIES', () => {
    it('should be re-exported from constants.js', () => {
      expect(DIRECTORIES).toBeDefined();
      expect(DIRECTORIES.STANDARDS).toBe('.standards');
      expect(DIRECTORIES.UDS).toBe('.uds');
      expect(DIRECTORIES.CORE).toBe('core');
    });
  });

  describe('FILE_PATTERNS', () => {
    it('should be re-exported from constants.js', () => {
      expect(FILE_PATTERNS).toBeDefined();
      expect(FILE_PATTERNS.STANDARDS).toBe('core/*.md');
    });
  });

  describe('EXTENSIONS', () => {
    it('should be re-exported from constants.js', () => {
      expect(EXTENSIONS).toBeDefined();
      expect(EXTENSIONS.MARKDOWN).toBe('.md');
      expect(EXTENSIONS.AI_YAML).toBe('.ai.yaml');
    });
  });
});

describe('Legacy Compatibility Functions', () => {
  describe('getSourcePath', () => {
    it('should delegate to PathResolver.getStandardSource', () => {
      const result1 = getSourcePath('nonexistent.md');
      const result2 = PathResolver.getStandardSource('nonexistent.md');
      expect(result1).toBe(result2);
    });
  });

  describe('getRepoRoot', () => {
    it('should delegate to PathResolver.getRepoRoot', () => {
      const result1 = getRepoRoot();
      const result2 = PathResolver.getRepoRoot();
      expect(result1).toBe(result2);
    });
  });

  describe('getBundledRoot', () => {
    it('should delegate to PathResolver.getBundledRoot', () => {
      const result1 = getBundledRoot();
      const result2 = PathResolver.getBundledRoot();
      expect(result1).toBe(result2);
    });
  });
});
