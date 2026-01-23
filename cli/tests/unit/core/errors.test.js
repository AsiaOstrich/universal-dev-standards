import { describe, it, expect, vi } from 'vitest';
import {
  UDSError,
  ManifestError,
  FileError,
  NetworkError,
  ValidationError,
  AIError,
  ERROR_CODES,
  ERROR_MESSAGES,
  createError,
  handleResult,
  normalizeError,
  isUserError,
  isNetworkError,
  isRecoverableError,
  asyncErrorHandler,
  syncErrorHandler,
  createResult,
  success,
  failure
} from '../../../src/core/errors.js';

describe('Error Classes', () => {
  describe('UDSError', () => {
    it('should create error with all properties', () => {
      const error = new UDSError('TEST_CODE', 'Test message', { key: 'value' }, 'test');

      expect(error.name).toBe('UDSError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ key: 'value' });
      expect(error.category).toBe('test');
      expect(error.timestamp).toBeDefined();
    });

    it('should have default category of system', () => {
      const error = new UDSError('CODE', 'message');
      expect(error.category).toBe('system');
    });

    it('should convert to result object', () => {
      const error = new UDSError('CODE', 'message', { detail: 'info' }, 'category');
      const result = error.toResult();

      expect(result.success).toBe(false);
      expect(result.error).toBe('message');
      expect(result.code).toBe('CODE');
      expect(result.details).toEqual({ detail: 'info' });
      expect(result.category).toBe('category');
    });

    it('should convert to JSON', () => {
      const error = new UDSError('CODE', 'message', {}, 'cat');
      const json = error.toJSON();

      expect(json.name).toBe('UDSError');
      expect(json.code).toBe('CODE');
      expect(json.message).toBe('message');
      expect(json.category).toBe('cat');
      expect(json.timestamp).toBeDefined();
      expect(json.stack).toBeDefined();
    });

    it('should return user-friendly message for user errors', () => {
      const userError = new UDSError('CODE', 'User did something wrong', {}, 'user');
      expect(userError.getUserMessage()).toBe('User did something wrong');
    });

    it('should return formatted message for system errors', () => {
      const systemError = new UDSError('SYS_CODE', 'Internal issue');
      expect(systemError.getUserMessage()).toBe('An error occurred: Internal issue (Code: SYS_CODE)');
    });
  });

  describe('Specialized Error Classes', () => {
    it('should create ManifestError', () => {
      const error = new ManifestError('MANIFEST_INVALID', 'Invalid manifest');
      expect(error.name).toBe('ManifestError');
      expect(error.category).toBe('manifest');
    });

    it('should create FileError', () => {
      const error = new FileError('FILE_NOT_FOUND', 'File not found');
      expect(error.name).toBe('FileError');
      expect(error.category).toBe('file');
    });

    it('should create NetworkError', () => {
      const error = new NetworkError('DOWNLOAD_FAILED', 'Download failed');
      expect(error.name).toBe('NetworkError');
      expect(error.category).toBe('network');
    });

    it('should create ValidationError', () => {
      const error = new ValidationError('INVALID_INPUT', 'Bad input');
      expect(error.name).toBe('ValidationError');
      expect(error.category).toBe('validation');
    });

    it('should create AIError', () => {
      const error = new AIError('AI_TOOL_NOT_SUPPORTED', 'Tool not supported');
      expect(error.name).toBe('AIError');
      expect(error.category).toBe('ai');
    });
  });
});

describe('ERROR_CODES', () => {
  it('should have manifest error codes', () => {
    expect(ERROR_CODES.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
    expect(ERROR_CODES.MANIFEST_INVALID).toBe('MANIFEST_INVALID');
    expect(ERROR_CODES.MANIFEST_MIGRATION_FAILED).toBe('MANIFEST_MIGRATION_FAILED');
  });

  it('should have file error codes', () => {
    expect(ERROR_CODES.FILE_NOT_FOUND).toBe('FILE_NOT_FOUND');
    expect(ERROR_CODES.FILE_COPY_FAILED).toBe('FILE_COPY_FAILED');
    expect(ERROR_CODES.DIR_CREATE_FAILED).toBe('DIR_CREATE_FAILED');
  });

  it('should have network error codes', () => {
    expect(ERROR_CODES.DOWNLOAD_FAILED).toBe('DOWNLOAD_FAILED');
    expect(ERROR_CODES.NETWORK_TIMEOUT).toBe('NETWORK_TIMEOUT');
    expect(ERROR_CODES.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE');
  });

  it('should have user error codes', () => {
    expect(ERROR_CODES.USER_CANCELLED).toBe('USER_CANCELLED');
    expect(ERROR_CODES.USER_INPUT_INVALID).toBe('USER_INPUT_INVALID');
    expect(ERROR_CODES.PROJECT_NOT_INITIALIZED).toBe('PROJECT_NOT_INITIALIZED');
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have message templates', () => {
    expect(ERROR_MESSAGES[ERROR_CODES.MANIFEST_NOT_FOUND]).toContain('uds init');
    expect(ERROR_MESSAGES[ERROR_CODES.FILE_NOT_FOUND]).toContain('{path}');
    expect(ERROR_MESSAGES[ERROR_CODES.USER_CANCELLED]).toContain('cancelled');
  });
});

describe('createError', () => {
  it('should create error with message substitution', () => {
    const error = createError('FILE_NOT_FOUND', { path: '/test/file.txt' });

    expect(error.message).toBe('File not found: /test/file.txt');
    expect(error.code).toBe('FILE_NOT_FOUND');
  });

  it('should create error with multiple substitutions', () => {
    const error = createError('FILE_COPY_FAILED', { source: 'a.txt', target: 'b.txt' });

    expect(error.message).toContain('a.txt');
    expect(error.message).toContain('b.txt');
  });

  it('should select appropriate error class based on category', () => {
    const manifestError = createError('MANIFEST_NOT_FOUND', {}, {}, 'manifest');
    expect(manifestError).toBeInstanceOf(ManifestError);

    const fileError = createError('FILE_NOT_FOUND', {}, {}, 'file');
    expect(fileError).toBeInstanceOf(FileError);

    const networkError = createError('DOWNLOAD_FAILED', {}, {}, 'network');
    expect(networkError).toBeInstanceOf(NetworkError);

    const validationError = createError('INVALID_INPUT', {}, {}, 'validation');
    expect(validationError).toBeInstanceOf(ValidationError);

    const aiError = createError('AI_TOOL_NOT_SUPPORTED', {}, {}, 'ai');
    expect(aiError).toBeInstanceOf(AIError);
  });

  it('should handle unknown error codes', () => {
    const error = createError('UNKNOWN_CODE');
    expect(error.message).toContain('Unknown error');
  });
});

describe('handleResult', () => {
  it('should return result on success', () => {
    const result = { success: true, data: 'test' };
    const handled = handleResult(result);

    expect(handled).toEqual(result);
  });

  it('should throw error on failure', () => {
    const result = { success: false, error: 'Something went wrong', code: 'TEST_ERROR' };

    expect(() => handleResult(result)).toThrow();
  });

  it('should throw error for null result', () => {
    expect(() => handleResult(null)).toThrow();
  });

  it('should throw error for undefined result', () => {
    expect(() => handleResult(undefined)).toThrow();
  });
});

describe('normalizeError', () => {
  it('should return UDSError as-is', () => {
    const original = new UDSError('CODE', 'message');
    const normalized = normalizeError(original);

    expect(normalized).toBe(original);
  });

  it('should convert regular Error to UDSError', () => {
    const original = new Error('Regular error');
    const normalized = normalizeError(original, 'FILE_NOT_FOUND');

    expect(normalized).toBeInstanceOf(UDSError);
    expect(normalized.details.originalError).toBe('Regular error');
  });

  it('should use default code for unknown errors', () => {
    const original = new Error('Test');
    const normalized = normalizeError(original);

    expect(normalized.code).toBe('UNKNOWN_ERROR');
  });
});

describe('Error Type Checking', () => {
  describe('isUserError', () => {
    it('should return true for user category errors', () => {
      const error = new UDSError('CODE', 'message', {}, 'user');
      expect(isUserError(error)).toBe(true);
    });

    it('should return true for USER_CANCELLED errors', () => {
      const error = new UDSError(ERROR_CODES.USER_CANCELLED, 'Cancelled');
      expect(isUserError(error)).toBe(true);
    });

    it('should return false for system errors', () => {
      const error = new UDSError('CODE', 'message', {}, 'system');
      expect(isUserError(error)).toBe(false);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(isUserError(error)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network category UDSErrors', () => {
      const error = new NetworkError('DOWNLOAD_FAILED', 'Failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ECONNRESET errors', () => {
      const error = new Error('Connection reset');
      error.code = 'ECONNRESET';
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ENOTFOUND errors', () => {
      const error = new Error('DNS not found');
      error.code = 'ENOTFOUND';
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ECONNREFUSED errors', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for file errors', () => {
      const error = new FileError('FILE_NOT_FOUND', 'Not found');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isRecoverableError', () => {
    it('should return true for timeout errors', () => {
      const error = new UDSError(ERROR_CODES.NETWORK_TIMEOUT, 'Timeout');
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should return true for offline errors', () => {
      const error = new UDSError(ERROR_CODES.NETWORK_OFFLINE, 'Offline');
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should return true for user cancelled errors', () => {
      const error = new UDSError(ERROR_CODES.USER_CANCELLED, 'Cancelled');
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network issue');
      error.code = 'ECONNRESET';
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should return false for permanent errors', () => {
      const error = new ManifestError(ERROR_CODES.MANIFEST_INVALID, 'Invalid');
      expect(isRecoverableError(error)).toBe(false);
    });
  });
});

describe('Error Handlers', () => {
  describe('asyncErrorHandler', () => {
    it('should return result on success', async () => {
      const fn = async () => ({ success: true, data: 'test' });
      const wrapped = asyncErrorHandler(fn);

      const result = await wrapped();
      expect(result.success).toBe(true);
      expect(result.data).toBe('test');
    });

    it('should catch errors and return result object', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      const wrapped = asyncErrorHandler(fn, 'test operation');

      const result = await wrapped();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('syncErrorHandler', () => {
    it('should return result on success', () => {
      const fn = () => ({ success: true, data: 'test' });
      const wrapped = syncErrorHandler(fn);

      const result = wrapped();
      expect(result.success).toBe(true);
    });

    it('should catch errors and return result object', () => {
      const fn = () => {
        throw new Error('Sync error');
      };
      const wrapped = syncErrorHandler(fn, 'test operation');

      const result = wrapped();
      expect(result.success).toBe(false);
    });
  });
});

describe('Result Functions', () => {
  describe('createResult', () => {
    it('should create success result with data', () => {
      const result = createResult(true, { key: 'value' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.error).toBeNull();
    });

    it('should create failure result with error', () => {
      const result = createResult(false, null, 'Error message', { code: 'ERR' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error message');
      expect(result.details.code).toBe('ERR');
    });

    it('should not include data on success with null data', () => {
      const result = createResult(true, null);

      expect(result.success).toBe(true);
      expect('data' in result).toBe(false);
    });
  });

  describe('success', () => {
    it('should create success result', () => {
      const result = success('test data');

      expect(result.success).toBe(true);
      expect(result.data).toBe('test data');
      expect(result.error).toBeNull();
    });

    it('should create success result with details', () => {
      const result = success('data', { meta: 'info' });

      expect(result.details.meta).toBe('info');
    });

    it('should create success result without data', () => {
      const result = success();

      expect(result.success).toBe(true);
      expect('data' in result).toBe(false);
    });
  });

  describe('failure', () => {
    it('should create failure result', () => {
      const result = failure('Something went wrong');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
      expect(result.details.code).toBe('OPERATION_FAILED');
    });

    it('should create failure result with custom code', () => {
      const result = failure('Error', 'CUSTOM_CODE');

      expect(result.details.code).toBe('CUSTOM_CODE');
    });

    it('should create failure result with additional details', () => {
      const result = failure('Error', 'CODE', { file: 'test.js', line: 42 });

      expect(result.details.file).toBe('test.js');
      expect(result.details.line).toBe(42);
    });
  });
});
