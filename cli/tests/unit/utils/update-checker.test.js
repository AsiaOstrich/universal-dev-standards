import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

vi.mock('fs');
vi.mock('os');
vi.mock('../../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(),
  compareVersions: vi.fn()
}));

const MOCK_HOME = '/home/user';
const UDS_DIR = path.join(MOCK_HOME, '.uds');
const CACHE_FILE = path.join(UDS_DIR, 'update-check.json');

describe('update-checker', () => {
  let readUpdateCache, writeUpdateCache, shouldThrottle, maybeCheckForUpdates, formatUpdateNotice;
  let checkForUpdates, compareVersions;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();
    os.homedir.mockReturnValue(MOCK_HOME);

    // Default env: TTY, not CI
    vi.stubGlobal('process', {
      ...process,
      env: { ...process.env, CI: undefined, CONTINUOUS_INTEGRATION: undefined, UDS_NO_UPDATE_CHECK: undefined },
      stdout: { ...process.stdout, isTTY: true }
    });

    const mod = await import('../../../src/utils/update-checker.js');
    readUpdateCache = mod.readUpdateCache;
    writeUpdateCache = mod.writeUpdateCache;
    shouldThrottle = mod.shouldThrottle;
    maybeCheckForUpdates = mod.maybeCheckForUpdates;
    formatUpdateNotice = mod.formatUpdateNotice;

    const registry = await import('../../../src/utils/npm-registry.js');
    checkForUpdates = registry.checkForUpdates;
    compareVersions = registry.compareVersions;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('readUpdateCache', () => {
    it('should return null when cache file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      expect(readUpdateCache()).toBeNull();
    });

    it('should return parsed cache data when file exists', () => {
      const cacheData = { lastChecked: '2026-03-17T10:00:00.000Z', latestVersion: '5.1.0' };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(cacheData));
      expect(readUpdateCache()).toEqual(cacheData);
    });

    it('should return null on invalid JSON', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not json');
      expect(readUpdateCache()).toBeNull();
    });
  });

  describe('writeUpdateCache', () => {
    it('should create directory and write cache file', () => {
      fs.existsSync.mockReturnValue(false);
      const data = { lastChecked: '2026-03-17T10:00:00.000Z', latestVersion: '5.1.0' };
      writeUpdateCache(data);
      expect(fs.mkdirSync).toHaveBeenCalledWith(UDS_DIR, { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CACHE_FILE,
        JSON.stringify(data, null, 2),
        'utf8'
      );
    });

    it('should skip mkdir if directory exists', () => {
      fs.existsSync.mockReturnValue(true);
      writeUpdateCache({ lastChecked: 'now' });
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should not throw on write error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => { throw new Error('EACCES'); });
      expect(() => writeUpdateCache({ x: 1 })).not.toThrow();
    });
  });

  describe('shouldThrottle', () => {
    it('should return false when cacheData is null', () => {
      expect(shouldThrottle(null)).toBe(false);
    });

    it('should return false when cacheData has no lastChecked', () => {
      expect(shouldThrottle({})).toBe(false);
    });

    it('should return true when within interval', () => {
      const recent = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      expect(shouldThrottle({ lastChecked: recent }, 86400000)).toBe(true);
    });

    it('should return false when past interval', () => {
      const old = new Date(Date.now() - 100000000).toISOString(); // ~28 hours ago
      expect(shouldThrottle({ lastChecked: old }, 86400000)).toBe(false);
    });
  });

  describe('maybeCheckForUpdates', () => {
    it('should return null in CI environment', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, CI: 'true' },
        stdout: { ...process.stdout, isTTY: true }
      });
      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should return null in CONTINUOUS_INTEGRATION environment', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, CONTINUOUS_INTEGRATION: 'true' },
        stdout: { ...process.stdout, isTTY: true }
      });
      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should return null when not TTY', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env },
        stdout: { ...process.stdout, isTTY: false }
      });
      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should return null when UDS_NO_UPDATE_CHECK is set', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, UDS_NO_UPDATE_CHECK: '1' },
        stdout: { ...process.stdout, isTTY: true }
      });
      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should return cached result when throttled and update available', async () => {
      const recent = new Date(Date.now() - 1000).toISOString();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastChecked: recent,
        latestVersion: '5.1.0',
        latestBeta: '5.2.0-beta.1'
      }));
      compareVersions.mockReturnValue(-1); // current < latest

      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toEqual({
        shouldNotify: true,
        currentVersion: '5.0.0',
        latestVersion: '5.1.0',
        latestBeta: '5.2.0-beta.1',
        fromCache: true
      });
      expect(checkForUpdates).not.toHaveBeenCalled();
    });

    it('should return null when throttled and no update', async () => {
      const recent = new Date(Date.now() - 1000).toISOString();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastChecked: recent,
        latestVersion: '5.0.0'
      }));
      compareVersions.mockReturnValue(0); // equal

      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should query npm when not throttled and return notify result', async () => {
      fs.existsSync.mockReturnValue(false); // no cache
      checkForUpdates.mockResolvedValue({
        available: true,
        offline: false,
        currentVersion: '5.0.0',
        latestVersion: '5.1.0',
        latestStable: '5.1.0',
        latestBeta: null
      });

      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toEqual({
        shouldNotify: true,
        currentVersion: '5.0.0',
        latestVersion: '5.1.0',
        latestBeta: null,
        fromCache: false
      });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should return null when npm says offline', async () => {
      fs.existsSync.mockReturnValue(false);
      checkForUpdates.mockResolvedValue({ available: false, offline: true });

      const result = await maybeCheckForUpdates('5.0.0');
      expect(result).toBeNull();
    });

    it('should return null when no update available', async () => {
      fs.existsSync.mockReturnValue(false);
      checkForUpdates.mockResolvedValue({
        available: false,
        offline: false,
        currentVersion: '5.1.0',
        latestVersion: '5.1.0',
        latestStable: '5.1.0'
      });

      const result = await maybeCheckForUpdates('5.1.0');
      expect(result).toBeNull();
    });
  });

  // [SPEC-CLI-UPDATE-NOTIFY] AC-2: 黑名單策略
  describe('shouldCheckUpdateForCommand', () => {
    let shouldCheckUpdateForCommand;

    beforeEach(async () => {
      const mod = await import('../../../src/utils/update-checker.js');
      shouldCheckUpdateForCommand = mod.shouldCheckUpdateForCommand;
    });

    // [Derived] AC-2: 黑名單指令不觸發更新檢查
    it('should return false for "update" command', () => {
      expect(shouldCheckUpdateForCommand('update')).toBe(false);
    });

    it('should return false for "simulate" command', () => {
      expect(shouldCheckUpdateForCommand('simulate')).toBe(false);
    });

    it('should return false for "fix" command', () => {
      expect(shouldCheckUpdateForCommand('fix')).toBe(false);
    });

    // [Derived] AC-2: 非黑名單指令觸發更新檢查
    it('should return true for "check" command', () => {
      expect(shouldCheckUpdateForCommand('check')).toBe(true);
    });

    it('should return true for "init" command', () => {
      expect(shouldCheckUpdateForCommand('init')).toBe(true);
    });

    it('should return true for "list" command', () => {
      expect(shouldCheckUpdateForCommand('list')).toBe(true);
    });

    it('should return true for "config" command', () => {
      expect(shouldCheckUpdateForCommand('config')).toBe(true);
    });

    it('should return true for "audit" command', () => {
      expect(shouldCheckUpdateForCommand('audit')).toBe(true);
    });

    it('should return true for "skills" command', () => {
      expect(shouldCheckUpdateForCommand('skills')).toBe(true);
    });
  });

  describe('formatUpdateNotice', () => {
    it('should format notice with default messages', () => {
      const result = { currentVersion: '5.0.0', latestVersion: '5.1.0' };
      const notice = formatUpdateNotice(result, {});
      expect(notice).toContain('┌');
      expect(notice).toContain('┘');
      expect(notice).toContain('5.0.0');
      expect(notice).toContain('5.1.0');
      expect(notice).toContain('npm update -g universal-dev-standards');
    });

    it('should use i18n messages when provided', () => {
      const result = { currentVersion: '5.0.0', latestVersion: '5.1.0' };
      const messages = {
        updateNotice: {
          header: '有新版本可用',
          command: 'npm update -g universal-dev-standards',
          disableHint: '設定 UDS_NO_UPDATE_CHECK=1 可關閉'
        }
      };
      const notice = formatUpdateNotice(result, messages);
      expect(notice).toContain('有新版本可用');
      expect(notice).toContain('5.0.0');
      expect(notice).toContain('5.1.0');
    });
  });

  // [SPEC-CLI-UPDATE-NOTIFY] AC-9: version-check-on-uds-operation priority 為 required
  describe('AI Agent version-check-on-uds-operation rule', () => {
    it('should have priority "required" in ai/standards/context-aware-loading.ai.yaml', async () => {
      const { readFileSync: realReadFileSync } = await vi.importActual('fs');
      const { resolve } = await import('path');
      const yamlPath = resolve(import.meta.dirname, '../../../../ai/standards/context-aware-loading.ai.yaml');
      const content = realReadFileSync(yamlPath, 'utf8');

      // Find the version-check-on-uds-operation block and verify priority
      const ruleMatch = content.match(/id:\s*version-check-on-uds-operation[\s\S]*?priority:\s*(\w+)/);
      expect(ruleMatch).not.toBeNull();
      expect(ruleMatch[1]).toBe('required');
    });

    it('should have priority "required" in .standards/context-aware-loading.ai.yaml', async () => {
      const { readFileSync: realReadFileSync } = await vi.importActual('fs');
      const { resolve } = await import('path');
      const yamlPath = resolve(import.meta.dirname, '../../../../.standards/context-aware-loading.ai.yaml');
      const content = realReadFileSync(yamlPath, 'utf8');

      const ruleMatch = content.match(/id:\s*version-check-on-uds-operation[\s\S]*?priority:\s*(\w+)/);
      expect(ruleMatch).not.toBeNull();
      expect(ruleMatch[1]).toBe('required');
    });
  });
});
