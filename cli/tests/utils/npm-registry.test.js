import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock https module
const mockGet = vi.fn();
vi.mock('https', () => ({
  default: {
    get: mockGet
  }
}));

// Import after mocking
const { fetchLatestVersion, checkForUpdates, clearCache } = await import('../../src/utils/npm-registry.js');

describe('npm-registry utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe('fetchLatestVersion', () => {
    it('should return version info on successful request', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': {
                latest: '3.5.0',
                beta: '3.6.0-beta.1'
              }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      const result = await fetchLatestVersion();

      expect(result).toEqual({
        latest: '3.5.0',
        beta: '3.6.0-beta.1',
        allTags: { latest: '3.5.0', beta: '3.6.0-beta.1' }
      });
    });

    it('should return null on non-200 status', async () => {
      const mockResponse = {
        statusCode: 404,
        on: vi.fn()
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      const result = await fetchLatestVersion();
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockGet.mockImplementation((url, opts, callback) => {
        const req = {
          on: vi.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
            return req;
          }),
          destroy: vi.fn()
        };
        return req;
      });

      const result = await fetchLatestVersion();
      expect(result).toBeNull();
    });

    it('should return null on timeout', async () => {
      mockGet.mockImplementation((url, opts, callback) => {
        const req = {
          on: vi.fn((event, handler) => {
            if (event === 'timeout') {
              handler();
            }
            return req;
          }),
          destroy: vi.fn()
        };
        return req;
      });

      const result = await fetchLatestVersion({ timeout: 100 });
      expect(result).toBeNull();
    });

    it('should return null on JSON parse error', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('not valid json');
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      const result = await fetchLatestVersion();
      expect(result).toBeNull();
    });

    it('should use cached result within TTL', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.5.0' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      // First call
      await fetchLatestVersion();
      // Second call should use cache
      await fetchLatestVersion();

      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkForUpdates', () => {
    it('should detect available update when current version is older', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.6.0', beta: '3.7.0-beta.1' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      const result = await checkForUpdates('3.5.0');

      expect(result.available).toBe(true);
      expect(result.latestVersion).toBe('3.6.0');
      expect(result.currentVersion).toBe('3.5.0');
    });

    it('should not detect update when current version is same', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.5.0' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      const result = await checkForUpdates('3.5.0');

      expect(result.available).toBe(false);
    });

    it('should check beta version when checkBeta is true', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.5.0', beta: '3.6.0-beta.5' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      // Must explicitly pass checkBeta: true to check beta versions
      const result = await checkForUpdates('3.6.0-beta.3', { checkBeta: true });

      expect(result.available).toBe(true);
      expect(result.latestVersion).toBe('3.6.0-beta.5');
      expect(result.isCurrentBeta).toBe(true);
      expect(result.checkedBeta).toBe(true);
    });

    it('should return offline status on network error', async () => {
      mockGet.mockImplementation((url, opts, callback) => {
        const req = {
          on: vi.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
            return req;
          }),
          destroy: vi.fn()
        };
        return req;
      });

      const result = await checkForUpdates('3.5.0');

      expect(result.offline).toBe(true);
      expect(result.available).toBe(false);
    });

    it('should use checkBeta option correctly', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.5.0', beta: '3.6.0-beta.1' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      // With checkBeta: true, should compare against beta
      clearCache();
      const resultWithBeta = await checkForUpdates('3.5.0', { checkBeta: true });
      expect(resultWithBeta.latestVersion).toBe('3.6.0-beta.1');
      expect(resultWithBeta.checkedBeta).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should allow fresh fetch after clearing cache', async () => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({
              'dist-tags': { latest: '3.5.0' }
            }));
          }
          if (event === 'end') {
            handler();
          }
          return mockResponse;
        })
      };

      mockGet.mockImplementation((url, opts, callback) => {
        callback(mockResponse);
        return { on: vi.fn(), destroy: vi.fn() };
      });

      // First call
      await fetchLatestVersion();
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second call (cached)
      await fetchLatestVersion();
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCache();

      // Third call (fresh fetch)
      await fetchLatestVersion();
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });
});
