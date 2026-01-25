# [SHARED-09] Error Handling Specification / 錯誤處理規格

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Status**: Approved
**Spec ID**: SHARED-09

---

## Summary

This specification defines the standardized error handling system for the UDS CLI. The system provides a hierarchy of error classes, error codes registry, and utility functions for consistent error creation, handling, and reporting across all CLI commands.

本規格定義 UDS CLI 的標準化錯誤處理系統。該系統提供錯誤類別層次結構、錯誤碼登錄表，以及用於在所有 CLI 命令中一致建立、處理和報告錯誤的工具函數。

---

## Motivation

### Problem Statement / 問題陳述

1. Inconsistent error handling leads to poor user experience and debugging difficulties
2. Error messages without codes make programmatic error handling impossible
3. No standard pattern for converting exceptions to result objects
4. Unclear distinction between recoverable and non-recoverable errors

### Solution / 解決方案

A comprehensive error handling system that:
- Defines a base `UDSError` class with specialized subclasses by category
- Provides a registry of error codes with message templates
- Offers utility functions for error creation, normalization, and result patterns
- Classifies errors by recoverability for retry logic

---

## Detailed Design

### Source File

**Location**: `cli/src/core/errors.js` (~400 lines)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Error Handling System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ERROR CLASS HIERARCHY                                              │
│  └── UDSError (base)                                                │
│       ├── ManifestError    - category: 'manifest'                   │
│       ├── FileError        - category: 'file'                       │
│       ├── NetworkError     - category: 'network'                    │
│       ├── ValidationError  - category: 'validation'                 │
│       └── AIError          - category: 'ai'                         │
│                                                                     │
│  ERROR CODES REGISTRY                                               │
│  └── ERROR_CODES (Object)                                           │
│       ├── Manifest: MANIFEST_NOT_FOUND, MANIFEST_INVALID, ...       │
│       ├── File: FILE_NOT_FOUND, FILE_COPY_FAILED, ...               │
│       ├── Network: DOWNLOAD_FAILED, NETWORK_TIMEOUT, ...            │
│       ├── Validation: INVALID_INPUT, VALIDATION_FAILED, ...         │
│       ├── AI: AI_TOOL_NOT_SUPPORTED, AI_CONFIG_INVALID, ...         │
│       └── User: USER_CANCELLED, PROJECT_NOT_INITIALIZED, ...        │
│                                                                     │
│  ERROR MESSAGES REGISTRY                                            │
│  └── ERROR_MESSAGES (Object)                                        │
│       └── Templates with {param} placeholders                       │
│                                                                     │
│  UTILITY FUNCTIONS                                                  │
│  ├── createError(code, params, details, category)                   │
│  ├── handleResult(result, context)                                  │
│  ├── normalizeError(error, defaultCode, context)                    │
│  ├── isUserError(error), isNetworkError(error)                      │
│  ├── isRecoverableError(error)                                      │
│  ├── asyncErrorHandler(fn, context)                                 │
│  ├── syncErrorHandler(fn, context)                                  │
│  ├── createResult(success, data, error, details)                    │
│  ├── success(data, details)                                         │
│  └── failure(error, code, details)                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Error Class Hierarchy

#### Base Class: `UDSError`

```javascript
class UDSError extends Error {
  constructor(code, message, details = {}, category = 'system')

  // Properties
  name: string           // 'UDSError'
  code: string           // Error code (e.g., 'MANIFEST_NOT_FOUND')
  message: string        // Human-readable message
  details: Object        // Additional context
  category: string       // Error category
  timestamp: string      // ISO 8601 timestamp

  // Methods
  toResult(): Object     // Convert to { success: false, error, code, ... }
  toJSON(): Object       // Full JSON representation
  getUserMessage(): string // User-friendly message
}
```

#### Specialized Error Classes

| Class | Category | Use Case |
|-------|----------|----------|
| `ManifestError` | `'manifest'` | Manifest file operations |
| `FileError` | `'file'` | File system operations |
| `NetworkError` | `'network'` | Download/fetch operations |
| `ValidationError` | `'validation'` | Input validation failures |
| `AIError` | `'ai'` | AI tool integration errors |

### Error Codes Registry

```javascript
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
```

### Error Messages with Templates

```javascript
export const ERROR_MESSAGES = {
  [ERROR_CODES.MANIFEST_NOT_FOUND]: 'UDS not initialized in this project. Run `uds init` first.',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found: {path}',
  [ERROR_CODES.FILE_COPY_FAILED]: 'Failed to copy file: {source} → {target}',
  [ERROR_CODES.DOWNLOAD_FAILED]: 'Failed to download file: {url}',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input: {input}',
  [ERROR_CODES.AI_TOOL_NOT_SUPPORTED]: 'AI tool not supported: {tool}',
  // ... more templates
};
```

### Utility Functions

#### `createError(code, params, details, category)`

Creates an error with message template substitution and appropriate error class.

```javascript
const error = createError('FILE_NOT_FOUND', { path: '/test.txt' });
// error.message = 'File not found: /test.txt'
// error instanceof FileError (if category = 'file')
```

#### `handleResult(result, context)`

Throws error if result indicates failure, returns result if successful.

```javascript
const data = handleResult(result, 'file read'); // throws on failure
```

#### `normalizeError(error, defaultCode, context)`

Converts any error to UDSError. Returns UDSError as-is, wraps regular Error.

#### Error Type Checkers

- `isUserError(error)`: Returns true for user-initiated errors
- `isNetworkError(error)`: Returns true for network-related errors
- `isRecoverableError(error)`: Returns true for errors that can be retried

#### Error Handler Wrappers

- `asyncErrorHandler(fn, context)`: Wraps async function, catches errors → result
- `syncErrorHandler(fn, context)`: Wraps sync function, catches errors → result

#### Result Pattern Functions

- `success(data, details)`: Creates `{ success: true, data, ... }`
- `failure(error, code, details)`: Creates `{ success: false, error, ... }`
- `createResult(success, data, error, details)`: Generic result builder

---

## Acceptance Criteria

### AC-1: Error Classes Correctly Inherit and Categorize

**Given** the error class hierarchy is defined
**When** specialized error instances are created
**Then**
  - `ManifestError` has `name = 'ManifestError'` and `category = 'manifest'`
  - `FileError` has `name = 'FileError'` and `category = 'file'`
  - `NetworkError` has `name = 'NetworkError'` and `category = 'network'`
  - `ValidationError` has `name = 'ValidationError'` and `category = 'validation'`
  - `AIError` has `name = 'AIError'` and `category = 'ai'`
  - All inherit from `UDSError` which inherits from `Error`

### AC-2: Error Code Message Template Parameter Substitution

**Given** error message templates with `{param}` placeholders
**When** `createError(code, params)` is called
**Then**
  - `createError('FILE_NOT_FOUND', { path: '/a.txt' })` → message contains `/a.txt`
  - `createError('FILE_COPY_FAILED', { source: 'a', target: 'b' })` → message contains both `a` and `b`
  - Multiple occurrences of same placeholder are all replaced
  - Unknown codes return `Unknown error: {code}` message

### AC-3: Error Handler Functions Correctly Wrap Exceptions

**Given** async or sync functions that may throw
**When** wrapped with error handler functions
**Then**
  - `asyncErrorHandler(fn)`: Returns result on success, returns `{ success: false }` on error
  - `syncErrorHandler(fn)`: Returns result on success, returns `{ success: false }` on error
  - `handleResult(failResult)`: Throws `UDSError`
  - `normalizeError(regularError)`: Returns `UDSError` with original message preserved

### AC-4: Result Pattern Provides Consistent Structure

**Given** the result pattern functions
**When** creating success or failure results
**Then**
  - `success(data)` returns `{ success: true, data, error: null }`
  - `success()` without data returns `{ success: true, error: null }` (no data property)
  - `failure(msg)` returns `{ success: false, error: msg, details: { code: 'OPERATION_FAILED' } }`
  - `failure(msg, code)` uses provided code
  - `failure(msg, code, { extra: 'info' })` includes extra details

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| None | Pure JavaScript module with no external dependencies |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Error code collisions | Low | Medium | Namespaced codes by category |
| Missing error handlers | Medium | Low | Comprehensive test coverage |
| Inconsistent usage | Medium | Medium | Code review, documentation |

---

## Related Specifications

- [SHARED-01 Manifest Schema](manifest-schema.md) - Uses ManifestError
- [SHARED-02 File Operations](file-operations.md) - Uses FileError

---

## Implementation Notes

### Error Flow Example

```javascript
import {
  createError,
  handleResult,
  asyncErrorHandler,
  success,
  failure
} from '../core/errors.js';

// Creating errors
const error = createError('FILE_NOT_FOUND', { path: '/config.json' }, {}, 'file');
throw error;

// Result pattern
async function readConfig() {
  try {
    const data = await fs.readFile(path);
    return success(JSON.parse(data));
  } catch (err) {
    return failure(`Failed to read config: ${err.message}`, 'FILE_PARSE_FAILED');
  }
}

// Handling results
const result = await readConfig();
if (!result.success) {
  console.error(result.error);
  process.exit(1);
}

// Or throw on failure
const data = handleResult(await readConfig(), 'config read');
```

### Recoverable Error Logic

```javascript
import { isRecoverableError, isNetworkError } from '../core/errors.js';

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (!isRecoverableError(error) || i === retries - 1) {
        throw error;
      }
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
