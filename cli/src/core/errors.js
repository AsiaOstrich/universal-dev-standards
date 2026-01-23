/**
 * UDS Error Handling System
 * Provides standardized error classes and utilities for the UDS CLI
 */

/**
 * Base UDS Error class
 */
export class UDSError extends Error {
  /**
   * @param {string} code - Error code (e.g., 'MANIFEST_NOT_FOUND')
   * @param {string} message - Human-readable error message
   * @param {Object} details - Additional error details
   * @param {string} category - Error category (system, user, network, etc.)
   */
  constructor(code, message, details = {}, category = 'system') {
    super(message);
    this.name = 'UDSError';
    this.code = code;
    this.details = details;
    this.category = category;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Convert error to result object
   * @returns {Object} Result object with success=false
   */
  toResult() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
      category: this.category
    };
  }

  /**
   * Convert error to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      category: this.category,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Get user-friendly message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    if (this.category === 'user') {
      return this.message;
    }
    return `An error occurred: ${this.message} (Code: ${this.code})`;
  }
}

/**
 * Manifest-related errors
 */
export class ManifestError extends UDSError {
  constructor(code, message, details = {}) {
    super(code, message, details, 'manifest');
    this.name = 'ManifestError';
  }
}

/**
 * File operation errors
 */
export class FileError extends UDSError {
  constructor(code, message, details = {}) {
    super(code, message, details, 'file');
    this.name = 'FileError';
  }
}

/**
 * Network/download errors
 */
export class NetworkError extends UDSError {
  constructor(code, message, details = {}) {
    super(code, message, details, 'network');
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends UDSError {
  constructor(code, message, details = {}) {
    super(code, message, details, 'validation');
    this.name = 'ValidationError';
  }
}

/**
 * AI tool integration errors
 */
export class AIError extends UDSError {
  constructor(code, message, details = {}) {
    super(code, message, details, 'ai');
    this.name = 'AIError';
  }
}

/**
 * Error codes registry
 */
export const ERROR_CODES = {
  // Manifest errors
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  MANIFEST_INVALID: 'MANIFEST_INVALID',
  MANIFEST_MIGRATION_FAILED: 'MANIFEST_MIGRATION_FAILED',
  MANIFEST_VERSION_MISMATCH: 'MANIFEST_VERSION_MISMATCH',
  
  // File errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_NOT_ACCESSIBLE: 'FILE_NOT_ACCESSIBLE',
  FILE_COPY_FAILED: 'FILE_COPY_FAILED',
  FILE_DELETE_FAILED: 'FILE_DELETE_FAILED',
  FILE_PARSE_FAILED: 'FILE_PARSE_FAILED',
  DIR_CREATE_FAILED: 'DIR_CREATE_FAILED',
  
  // Network errors
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  INVALID_URL: 'INVALID_URL',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_CONFIG: 'INVALID_CONFIG',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // AI errors
  AI_TOOL_NOT_SUPPORTED: 'AI_TOOL_NOT_SUPPORTED',
  AI_CONFIG_INVALID: 'AI_CONFIG_INVALID',
  AI_INSTALL_FAILED: 'AI_INSTALL_FAILED',
  
  // System errors
  PROCESS_FAILED: 'PROCESS_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_SPACE_INSUFFICIENT: 'DISK_SPACE_INSUFFICIENT',
  
  // User errors
  USER_CANCELLED: 'USER_CANCELLED',
  USER_INPUT_INVALID: 'USER_INPUT_INVALID',
  PROJECT_NOT_INITIALIZED: 'PROJECT_NOT_INITIALIZED'
};

/**
 * Standardized error message templates
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.MANIFEST_NOT_FOUND]: 'UDS not initialized in this project. Run `uds init` first.',
  [ERROR_CODES.MANIFEST_INVALID]: 'The UDS manifest file is corrupted or invalid.',
  [ERROR_CODES.MANIFEST_MIGRATION_FAILED]: 'Failed to migrate manifest to the latest version.',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found: {path}',
  [ERROR_CODES.FILE_COPY_FAILED]: 'Failed to copy file: {source} → {target}',
  [ERROR_CODES.DOWNLOAD_FAILED]: 'Failed to download file: {url}',
  [ERROR_CODES.NETWORK_OFFLINE]: 'Network connection unavailable. Please check your internet connection.',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input: {input}',
  [ERROR_CODES.AI_TOOL_NOT_SUPPORTED]: 'AI tool not supported: {tool}',
  [ERROR_CODES.PROJECT_NOT_INITIALIZED]: 'UDS is not initialized in this project.',
  [ERROR_CODES.USER_CANCELLED]: 'Operation cancelled by user.'
};

/**
 * Create error with standardized message
 * @param {string} code - Error code
 * @param {Object} params - Parameters to substitute in message
 * @param {Object} details - Additional error details
 * @param {string} category - Error category
 * @returns {UDSError} Error instance
 */
export function createError(code, params = {}, details = {}, category = 'system') {
  let message = ERROR_MESSAGES[code] || `Unknown error: ${code}`;
  
  // Substitute parameters in message
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  // Select appropriate error class based on category
  let ErrorClass = UDSError;
  switch (category) {
    case 'manifest':
      ErrorClass = ManifestError;
      break;
    case 'file':
      ErrorClass = FileError;
      break;
    case 'network':
      ErrorClass = NetworkError;
      break;
    case 'validation':
      ErrorClass = ValidationError;
      break;
    case 'ai':
      ErrorClass = AIError;
      break;
  }

  return new ErrorClass(code, message, { ...params, ...details }, category);
}

/**
 * Handle operation result and throw error if failed
 * @param {Object} result - Operation result
 * @param {string} context - Context description
 * @returns {any} Result data if successful
 * @throws {UDSError} If result indicates failure
 */
export function handleResult(result, context = 'operation') {
  if (!result || !result.success) {
    const error = result.error || 'Unknown error';
    const code = result.code || 'OPERATION_FAILED';
    const details = result.details || { context };
    
    throw createError(code, { error }, details);
  }
  
  return result;
}

/**
 * Convert any error to UDSError
 * @param {Error|UDSError} error - Error to convert
 * @param {string} defaultCode - Default error code if not a UDSError
 * @param {string} context - Context for the error
 * @returns {UDSError} UDSError instance
 */
export function normalizeError(error, defaultCode = 'UNKNOWN_ERROR', context = '') {
  if (error instanceof UDSError) {
    return error;
  }
  
  const code = ERROR_CODES[defaultCode] ? defaultCode : 'UNKNOWN_ERROR';
  const details = {
    originalError: error.message,
    context: context || error.stack?.split('\n')[1]?.trim()
  };
  
  return createError(code, { error: error.message }, details);
}

/**
 * Check if error is user-related
 * @param {Error|UDSError} error - Error to check
 * @returns {boolean} True if user error
 */
export function isUserError(error) {
  if (error instanceof UDSError) {
    return error.category === 'user' || error.code === ERROR_CODES.USER_CANCELLED;
  }
  return false;
}

/**
 * Check if error is network-related
 * @param {Error|UDSError} error - Error to check
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  if (error instanceof UDSError) {
    return error.category === 'network';
  }
  return error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED';
}

/**
 * Check if error is recoverable
 * @param {Error|UDSError} error - Error to check
 * @returns {boolean} True if recoverable
 */
export function isRecoverableError(error) {
  if (error instanceof UDSError) {
    return [
      ERROR_CODES.NETWORK_TIMEOUT,
      ERROR_CODES.NETWORK_OFFLINE,
      ERROR_CODES.USER_CANCELLED,
      ERROR_CODES.PROCESS_FAILED
    ].includes(error.code);
  }
  
  return isNetworkError(error) || isUserError(error);
}

/**
 * Error handler wrapper for async functions
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error handling
 * @returns {Function} Wrapped function that returns result object
 */
export function asyncErrorHandler(fn, context = 'operation') {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const udsError = normalizeError(error, 'OPERATION_FAILED', context);
      return udsError.toResult();
    }
  };
}

/**
 * Synchronous error handler wrapper
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error handling
 * @returns {Function} Wrapped function that returns result object
 */
export function syncErrorHandler(fn, context = 'operation') {
  return (...args) => {
    try {
      const result = fn(...args);
      return result;
    } catch (error) {
      const udsError = normalizeError(error, 'OPERATION_FAILED', context);
      return udsError.toResult();
    }
  };
}

/**
 * Create a consistent result object
 * @param {boolean} success - Whether operation succeeded
 * @param {any} data - Result data if successful
 * @param {string} error - Error message if failed
 * @param {Object} details - Additional details
 * @returns {Object} Result object
 */
export function createResult(success, data = null, error = null, details = {}) {
  const result = {
    success,
    error,
    details
  };
  
  if (success && data !== null) {
    result.data = data;
  }
  
  return result;
}

/**
 * Create success result
 * @param {any} data - Result data
 * @param {Object} details - Additional details
 * @returns {Object} Success result
 */
export function success(data = null, details = {}) {
  return createResult(true, data, null, details);
}

/**
 * Create error result
 * @param {string} error - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional details
 * @returns {Object} Error result
 */
export function failure(error, code = 'OPERATION_FAILED', details = {}) {
  return createResult(false, null, error, { code, ...details });
}

/**
 * Log error with context
 * @param {Error|UDSError} error - Error to log
 * @param {string} context - Context description
 * @param {Object} metadata - Additional metadata
 */
export function logError(error, context = '', metadata = {}) {
  const udsError = normalizeError(error);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: udsError.toJSON(),
    metadata
  };
  
  // In a real implementation, this would write to a log file
  // For now, just console.error with structured info
  console.error('UDS Error:', JSON.stringify(logEntry, null, 2));
}