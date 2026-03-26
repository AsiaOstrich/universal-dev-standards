import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  copyFileSync: vi.fn()
}));

// Mock os module
vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/testuser')
}));

// Mock https module
const { mockHttpsGet } = vi.hoisted(() => ({
  mockHttpsGet: vi.fn()
}));

vi.mock('https', () => ({
  default: {
    get: mockHttpsGet
  }
}));

// Mock timers/promises to avoid real delays in tests
const { mockDelay } = vi.hoisted(() => ({
  mockDelay: vi.fn(() => Promise.resolve())
}));

vi.mock('timers/promises', () => ({
  setTimeout: mockDelay
}));

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync } from 'fs';
import {
  getSkillsDir,
  getProjectSkillsDir,
  getInstalledSkillsInfo,
  getProjectInstalledSkillsInfo,
  getMarketplaceSkillsInfo,
  writeSkillsManifest,
  hasLocalSkills,
  getLocalSkillsDir,
  installSkillFromLocal,
  installSkillToDir,
  downloadFromGitHub,
  downloadFromSkillsRepo
} from '../../src/utils/github.js';

describe('GitHub Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSkillsDir', () => {
    it('should return user skills directory path', () => {
      const result = getSkillsDir();

      expect(result).toBe(join('/home/testuser', '.claude', 'skills'));
    });
  });

  describe('getProjectSkillsDir', () => {
    it('should return project skills directory path', () => {
      const result = getProjectSkillsDir('/my/project');

      expect(result).toBe(join('/my/project', '.claude', 'skills'));
    });
  });

  describe('getInstalledSkillsInfo', () => {
    it('should return null when skills directory does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = getInstalledSkillsInfo();

      expect(result).toBeNull();
    });

    it('should return info without version when manifest does not exist but directory does', () => {
      existsSync
        .mockReturnValueOnce(false)  // manifest doesn't exist
        .mockReturnValueOnce(true);   // skills dir exists

      const result = getInstalledSkillsInfo();

      expect(result).toEqual({
        installed: true,
        version: null,
        source: 'unknown'
      });
    });

    it('should return manifest info when manifest exists', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        version: '1.0.0',
        source: 'universal-dev-standards',
        installedDate: '2024-01-15'
      }));

      const result = getInstalledSkillsInfo();

      expect(result).toEqual({
        installed: true,
        version: '1.0.0',
        source: 'universal-dev-standards',
        installedDate: '2024-01-15'
      });
    });

    it('should handle JSON parse errors', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('invalid json');

      const result = getInstalledSkillsInfo();

      expect(result).toEqual({
        installed: true,
        version: null,
        source: 'unknown'
      });
    });
  });

  describe('getProjectInstalledSkillsInfo', () => {
    it('should return null when skills directory does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = getProjectInstalledSkillsInfo('/my/project');

      expect(result).toBeNull();
    });

    it('should return info with location when manifest exists', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        version: '1.0.0',
        source: 'universal-dev-standards',
        installedDate: '2024-01-15'
      }));

      const result = getProjectInstalledSkillsInfo('/my/project');

      expect(result).toEqual({
        installed: true,
        version: '1.0.0',
        source: 'universal-dev-standards',
        installedDate: '2024-01-15',
        location: 'project'
      });
    });

    it('should return unknown source when dir exists but no manifest', () => {
      existsSync
        .mockReturnValueOnce(false)  // manifest doesn't exist
        .mockReturnValueOnce(true);   // skills dir exists

      const result = getProjectInstalledSkillsInfo('/my/project');

      expect(result).toEqual({
        installed: true,
        version: null,
        source: 'unknown',
        location: 'project'
      });
    });
  });

  describe('writeSkillsManifest', () => {
    it('should create directory if it does not exist', () => {
      existsSync.mockReturnValue(false);

      writeSkillsManifest('1.0.0');

      expect(mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });

    it('should write manifest with version and date', () => {
      existsSync.mockReturnValue(true);

      writeSkillsManifest('1.0.0');

      expect(writeFileSync).toHaveBeenCalled();
      const call = writeFileSync.mock.calls[0];
      const manifest = JSON.parse(call[1]);
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.source).toBe('universal-dev-standards');
      expect(manifest.installedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should write to custom target directory', () => {
      existsSync.mockReturnValue(true);

      writeSkillsManifest('1.0.0', '/custom/skills');

      expect(writeFileSync).toHaveBeenCalledWith(
        join('/custom/skills', '.manifest.json'),
        expect.any(String)
      );
    });
  });

  describe('hasLocalSkills', () => {
    it('should return true when local skills directory exists', () => {
      existsSync.mockReturnValue(true);

      const result = hasLocalSkills();

      expect(result).toBe(true);
    });

    it('should return false when local skills directory does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = hasLocalSkills();

      expect(result).toBe(false);
    });
  });

  describe('getLocalSkillsDir', () => {
    it('should return local skills directory path', () => {
      const result = getLocalSkillsDir();

      expect(result).toContain('skills');
      expect(result).toContain('claude-code');
    });
  });

  describe('installSkillFromLocal', () => {
    it('should return error when source directory does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = installSkillFromLocal('test-skill');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Skill directory not found');
    });

    it('should copy files from source to target', () => {
      existsSync
        .mockReturnValueOnce(true)   // source exists
        .mockReturnValueOnce(false); // target doesn't exist
      readdirSync.mockReturnValue(['SKILL.md', 'README.md']);
      copyFileSync.mockReturnValue(undefined);

      const result = installSkillFromLocal('test-skill');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(mkdirSync).toHaveBeenCalled();
      expect(copyFileSync).toHaveBeenCalledTimes(2);
    });

    it('should handle copy errors', () => {
      existsSync
        .mockReturnValueOnce(true)  // source exists
        .mockReturnValueOnce(true); // target exists
      readdirSync.mockReturnValue(['SKILL.md']);
      copyFileSync.mockImplementation(() => {
        throw new Error('Copy failed');
      });

      const result = installSkillFromLocal('test-skill');

      expect(result.files[0].success).toBe(false);
      expect(result.files[0].error).toBe('Copy failed');
    });
  });

  describe('installSkillToDir', () => {
    it('should return error when source directory does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = installSkillToDir('test-skill', '/target/skills');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Skill directory not found');
    });

    it('should copy files to custom target directory', () => {
      existsSync
        .mockReturnValueOnce(true)   // source exists
        .mockReturnValueOnce(false); // target doesn't exist
      readdirSync.mockReturnValue(['SKILL.md']);
      copyFileSync.mockReturnValue(undefined);

      const result = installSkillToDir('test-skill', '/custom/skills');

      expect(result.success).toBe(true);
      expect(result.path).toBe(join('/custom/skills', 'test-skill'));
    });
  });

  describe('getMarketplaceSkillsInfo', () => {
    it('should return null when plugins file does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = getMarketplaceSkillsInfo();

      expect(result).toBeNull();
    });

    it('should return null when no universal-dev-standards plugin found', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        version: 2,
        plugins: {
          'other-plugin@marketplace': [{ version: '1.0.0' }]
        }
      }));

      const result = getMarketplaceSkillsInfo();

      expect(result).toBeNull();
    });

    it('should return plugin info when universal-dev-standards is found and cache exists', () => {
      existsSync
        .mockReturnValueOnce(true)  // plugins file exists
        .mockReturnValueOnce(true); // cache directory exists
      readFileSync.mockReturnValue(JSON.stringify({
        version: 2,
        plugins: {
          'universal-dev-standards@asia-ostrich': [{
            scope: 'user',
            installPath: '/Users/test/.claude/plugins/cache/asia-ostrich/universal-dev-standards/3.5.0-beta.3',
            version: '3.5.0-beta.3',
            installedAt: '2026-01-13T01:53:03.151Z',
            lastUpdated: '2026-01-13T01:53:03.151Z'
          }]
        }
      }));
      // Mock cache directory contents (no version folders to avoid version override)
      readdirSync.mockReturnValue([]);

      const result = getMarketplaceSkillsInfo();

      expect(result).toEqual({
        installed: true,
        version: '3.5.0-beta.3',
        installPath: '/Users/test/.claude/plugins/cache/asia-ostrich/universal-dev-standards/3.5.0-beta.3',
        installedAt: '2026-01-13T01:53:03.151Z',
        lastUpdated: '2026-01-13T01:53:03.151Z',
        source: 'marketplace',
        pluginKey: 'universal-dev-standards@asia-ostrich'
      });
    });

    it('should handle JSON parse errors', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue('invalid json');

      const result = getMarketplaceSkillsInfo();

      expect(result).toBeNull();
    });

    it('should handle empty plugin array', () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({
        version: 2,
        plugins: {
          'universal-dev-standards@asia-ostrich': []
        }
      }));

      const result = getMarketplaceSkillsInfo();

      expect(result).toBeNull();
    });

    it('should return null when JSON record exists but cache directory is missing (stale record)', () => {
      // Scenario: Plugin was uninstalled but installed_plugins.json was not cleaned up
      existsSync
        .mockReturnValueOnce(true)   // plugins file exists
        .mockReturnValueOnce(false); // cache directory does NOT exist (plugin uninstalled)
      readFileSync.mockReturnValue(JSON.stringify({
        version: 2,
        plugins: {
          'universal-dev-standards@asia-ostrich': [{
            scope: 'user',
            installPath: '/Users/test/.claude/plugins/cache/asia-ostrich/universal-dev-standards/3.5.0-beta.3',
            version: '3.5.0-beta.3',
            installedAt: '2026-01-13T01:53:03.151Z',
            lastUpdated: '2026-01-13T01:53:03.151Z'
          }]
        }
      }));

      const result = getMarketplaceSkillsInfo();

      // Should return null because cache directory is missing (stale record)
      expect(result).toBeNull();
    });

    it('should return plugin info when cache directory exists and has version folders', () => {
      existsSync
        .mockReturnValueOnce(true)  // plugins file exists
        .mockReturnValueOnce(true); // cache directory exists
      readFileSync.mockReturnValue(JSON.stringify({
        version: 2,
        plugins: {
          'universal-dev-standards@asia-ostrich': [{
            scope: 'user',
            installPath: '/Users/test/.claude/plugins/cache/asia-ostrich/universal-dev-standards/3.5.0-beta.3',
            version: '3.5.0-beta.3',
            installedAt: '2026-01-13T01:53:03.151Z',
            lastUpdated: '2026-01-13T01:53:03.151Z'
          }]
        }
      }));
      // Simulate cache directory with multiple versions
      readdirSync.mockReturnValue(['3.5.0-beta.3', '4.0.0']);

      const result = getMarketplaceSkillsInfo();

      expect(result).not.toBeNull();
      expect(result.installed).toBe(true);
      // Should pick the latest version from cache directory
      expect(result.version).toBe('4.0.0');
      expect(result.source).toBe('marketplace');
    });
  });

  // Helper to create a mock HTTP response
  function createMockResponse(statusCode, body = '', headers = {}) {
    const listeners = {};
    const res = {
      statusCode,
      headers,
      on: vi.fn((event, handler) => {
        listeners[event] = handler;
        return res;
      })
    };
    // Schedule data and end events
    process.nextTick(() => {
      if (listeners.data && body) listeners.data(body);
      if (listeners.end) listeners.end();
    });
    return res;
  }

  // Helper to create a mock request with error
  function createMockRequestWithError(errorCode) {
    return {
      on: vi.fn((event, handler) => {
        if (event === 'error') {
          process.nextTick(() => {
            const err = new Error(`Network error: ${errorCode}`);
            err.code = errorCode;
            handler(err);
          });
        }
        return { on: vi.fn() };
      })
    };
  }

  describe('downloadFromGitHub', () => {
    it('should download content on 200', async () => {
      mockHttpsGet.mockImplementation((_url, callback) => {
        const res = createMockResponse(200, 'file content');
        callback(res);
        return { on: vi.fn() };
      });

      const result = await downloadFromGitHub('core/test.md');

      expect(result).toBe('file content');
    });

    it('should follow 301 redirects', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          const res = createMockResponse(301, '', { location: 'https://redirect.example.com/file' });
          callback(res);
        } else {
          const res = createMockResponse(200, 'redirected content');
          callback(res);
        }
        return { on: vi.fn() };
      });

      const result = await downloadFromGitHub('core/test.md');

      expect(result).toBe('redirected content');
    });

    it('should throw on 404 without retry', async () => {
      mockHttpsGet.mockImplementation((_url, callback) => {
        const res = createMockResponse(404);
        callback(res);
        return { on: vi.fn() };
      });

      await expect(downloadFromGitHub('core/missing.md'))
        .rejects.toThrow('GitHub returned 404');
      // 404 is not retryable — should only call once
      expect(mockHttpsGet).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 and succeed on second attempt', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          const res = createMockResponse(429, '', { 'retry-after': '1' });
          callback(res);
        } else {
          const res = createMockResponse(200, 'success after retry');
          callback(res);
        }
        return { on: vi.fn() };
      });

      const result = await downloadFromGitHub('core/test.md');

      expect(result).toBe('success after retry');
      expect(mockHttpsGet).toHaveBeenCalledTimes(2);
      expect(mockDelay).toHaveBeenCalledTimes(1);
    });

    it('should respect Retry-After header on 429', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          const res = createMockResponse(429, '', { 'retry-after': '5' });
          callback(res);
        } else {
          const res = createMockResponse(200, 'ok');
          callback(res);
        }
        return { on: vi.fn() };
      });

      await downloadFromGitHub('core/test.md');

      expect(mockDelay).toHaveBeenCalledWith(5000);
    });

    it('should retry on 503', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          const res = createMockResponse(503);
          callback(res);
        } else {
          const res = createMockResponse(200, 'recovered');
          callback(res);
        }
        return { on: vi.fn() };
      });

      const result = await downloadFromGitHub('core/test.md');

      expect(result).toBe('recovered');
      expect(mockHttpsGet).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries exhausted on 429', async () => {
      mockHttpsGet.mockImplementation((_url, callback) => {
        const res = createMockResponse(429);
        callback(res);
        return { on: vi.fn() };
      });

      await expect(downloadFromGitHub('core/test.md'))
        .rejects.toThrow('GitHub returned 429');
      // Initial attempt + 3 retries = 4 calls
      expect(mockHttpsGet).toHaveBeenCalledTimes(4);
      expect(mockDelay).toHaveBeenCalledTimes(3);
    });

    it('should retry on ECONNRESET network error', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          // Return object that emits error
          return createMockRequestWithError('ECONNRESET');
        }
        const res = createMockResponse(200, 'recovered from network error');
        callback(res);
        return { on: vi.fn() };
      });

      const result = await downloadFromGitHub('core/test.md');

      expect(result).toBe('recovered from network error');
      expect(mockHttpsGet).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff when no Retry-After header', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount <= 3) {
          const res = createMockResponse(429);
          callback(res);
        } else {
          const res = createMockResponse(200, 'ok');
          callback(res);
        }
        return { on: vi.fn() };
      });

      await downloadFromGitHub('core/test.md');

      // Exponential backoff: 1000, 2000, 4000
      expect(mockDelay).toHaveBeenNthCalledWith(1, 1000);
      expect(mockDelay).toHaveBeenNthCalledWith(2, 2000);
      expect(mockDelay).toHaveBeenNthCalledWith(3, 4000);
    });
  });

  describe('downloadFromSkillsRepo', () => {
    it('should download content on 200', async () => {
      mockHttpsGet.mockImplementation((_url, callback) => {
        const res = createMockResponse(200, 'skill content');
        callback(res);
        return { on: vi.fn() };
      });

      const result = await downloadFromSkillsRepo('test-skill/SKILL.md');

      expect(result).toBe('skill content');
    });

    it('should retry on 429', async () => {
      let callCount = 0;
      mockHttpsGet.mockImplementation((_url, callback) => {
        callCount++;
        if (callCount === 1) {
          const res = createMockResponse(429);
          callback(res);
        } else {
          const res = createMockResponse(200, 'skill after retry');
          callback(res);
        }
        return { on: vi.fn() };
      });

      const result = await downloadFromSkillsRepo('test-skill/SKILL.md');

      expect(result).toBe('skill after retry');
      expect(mockHttpsGet).toHaveBeenCalledTimes(2);
    });
  });
});
