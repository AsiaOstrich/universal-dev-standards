# [SHARED-02] File Operations Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: SHARED-02

---

## Summary

This specification defines the file operations module (`copier.js`) which handles all file copying, reading, and writing operations for UDS standards, integrations, and manifest files.

---

## Motivation

Centralized file operations provide:
1. **Consistency**: Uniform error handling and logging
2. **Abstraction**: Hide file system complexity from commands
3. **Fallback Support**: GitHub download when local files unavailable
4. **Path Resolution**: Consistent path handling across platforms

---

## Detailed Design

### Module Location

```
cli/src/utils/copier.js
```

### Dependencies

```javascript
import fs from 'fs';
import path from 'path';
import { downloadFromGitHub } from './github.js';
```

---

## API Specification

### copyStandard

Copies a standard file from source to target directory.

```typescript
/**
 * Copy a standard file to the project's .standards directory
 *
 * @param sourcePath - Relative path from UDS root (e.g., "core/anti-hallucination.md")
 * @param targetDir - Subdirectory within .standards (e.g., "core")
 * @param projectPath - Absolute path to project root
 * @returns Promise<CopyResult>
 */
async function copyStandard(
  sourcePath: string,
  targetDir: string,
  projectPath: string
): Promise<CopyResult>;

interface CopyResult {
  success: boolean;
  error?: string;
  path?: string;        // Absolute path of copied file
  source?: 'local' | 'github';  // Source of the file
}
```

#### Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                    copyStandard Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Input: sourcePath, targetDir, projectPath                  │
│                                                              │
│   1. Resolve source path                                     │
│      └── Try local UDS installation first                    │
│          └── If not found, try GitHub download               │
│                                                              │
│   2. Create target directory                                 │
│      └── mkdir -p .standards/{targetDir}                     │
│                                                              │
│   3. Copy file                                               │
│      └── fs.copyFileSync(source, target)                     │
│                                                              │
│   4. Return result                                           │
│      └── { success: true, path: absolutePath }               │
│                                                              │
│   Error Handling:                                            │
│   - Source not found → { success: false, error: "..." }      │
│   - Permission denied → { success: false, error: "..." }     │
│   - GitHub unavailable → { success: false, error: "..." }    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Example Usage

```javascript
// Copy core standard
const result = await copyStandard(
  'core/anti-hallucination.md',
  'core',
  '/path/to/project'
);

if (result.success) {
  console.log(`Copied to: ${result.path}`);
  // Output: Copied to: /path/to/project/.standards/core/anti-hallucination.md
}

// Copy extension
const extResult = await copyStandard(
  'extensions/languages/typescript-style.md',
  'extensions/languages',
  '/path/to/project'
);
```

---

### copyIntegration

Copies an integration file template to project root.

```typescript
/**
 * Copy an integration file to the project root
 *
 * @param sourcePath - Relative path from UDS integrations (e.g., "integrations/claude-code.md")
 * @param targetPath - Relative path from project root (e.g., "CLAUDE.md")
 * @param projectPath - Absolute path to project root
 * @returns Promise<CopyResult>
 */
async function copyIntegration(
  sourcePath: string,
  targetPath: string,
  projectPath: string
): Promise<CopyResult>;
```

#### Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                   copyIntegration Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Input: sourcePath, targetPath, projectPath                 │
│                                                              │
│   1. Resolve source path                                     │
│      └── integrations/{sourcePath}                           │
│                                                              │
│   2. Create parent directories if needed                     │
│      └── For .github/copilot-instructions.md                 │
│                                                              │
│   3. Copy file                                               │
│      └── fs.copyFileSync(source, target)                     │
│                                                              │
│   4. Return result                                           │
│      └── { success: true, path: absolutePath }               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### writeManifest

Writes the manifest object to the manifest file.

```typescript
/**
 * Write manifest to .standards/manifest.json
 *
 * @param manifest - Manifest object to write
 * @param projectPath - Absolute path to project root
 * @returns void
 * @throws Error if write fails
 */
function writeManifest(manifest: Manifest, projectPath: string): void;
```

#### Behavior

```javascript
// Implementation details
function writeManifest(manifest, projectPath) {
  const standardsDir = path.join(projectPath, '.standards');
  const manifestPath = path.join(standardsDir, 'manifest.json');

  // Ensure directory exists
  if (!fs.existsSync(standardsDir)) {
    fs.mkdirSync(standardsDir, { recursive: true });
  }

  // Write with 2-space indentation for readability
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
}
```

---

### readManifest

Reads and parses the manifest file.

```typescript
/**
 * Read manifest from .standards/manifest.json
 *
 * @param projectPath - Absolute path to project root
 * @returns Manifest object or null if not found/invalid
 */
function readManifest(projectPath: string): Manifest | null;
```

#### Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                    readManifest Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Input: projectPath                                         │
│                                                              │
│   1. Build manifest path                                     │
│      └── {projectPath}/.standards/manifest.json              │
│                                                              │
│   2. Check file existence                                    │
│      └── If not exists → return null                         │
│                                                              │
│   3. Read and parse JSON                                     │
│      └── If parse error → log error, return null             │
│                                                              │
│   4. Return manifest object                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### isInitialized

Checks if a project has been initialized with UDS.

```typescript
/**
 * Check if project has UDS initialized
 *
 * @param projectPath - Absolute path to project root
 * @returns boolean - true if manifest exists
 */
function isInitialized(projectPath: string): boolean;
```

#### Implementation

```javascript
function isInitialized(projectPath) {
  const manifestPath = path.join(projectPath, '.standards', 'manifest.json');
  return fs.existsSync(manifestPath);
}
```

---

## Path Resolution

### UDS Installation Paths

```javascript
// Get UDS root directory
function getUDSRoot() {
  // During npm package usage
  return path.resolve(__dirname, '..', '..', '..');

  // During local development
  // return process.cwd();
}

// Get standards source path
function getStandardsSource(relativePath) {
  return path.join(getUDSRoot(), relativePath);
}
```

### Target Path Construction

```javascript
// Standard file target
function getStandardTarget(targetDir, filename, projectPath) {
  return path.join(projectPath, '.standards', targetDir, filename);
}

// Integration file target
function getIntegrationTarget(targetPath, projectPath) {
  return path.join(projectPath, targetPath);
}
```

---

## Error Handling

### Error Types

| Error | Cause | Handling |
|-------|-------|----------|
| `ENOENT` | Source file not found | Try GitHub fallback |
| `EACCES` | Permission denied | Return error result |
| `ENOSPC` | No disk space | Return error result |
| `JSON_PARSE` | Invalid manifest JSON | Return null, log warning |

### Error Result Format

```javascript
// Consistent error result
{
  success: false,
  error: "Human-readable error message"
}
```

### Logging

```javascript
// Error logging pattern
function logCopyError(operation, source, error) {
  console.error(`[${operation}] Failed to copy ${source}: ${error.message}`);
}
```

---

## GitHub Fallback

When local files are not available (e.g., after npm install), the module falls back to GitHub download.

```typescript
/**
 * Download file from GitHub repository
 *
 * @param repoPath - Repository path (e.g., "AsiaOstrich/universal-dev-standards")
 * @param filePath - File path within repo
 * @param targetPath - Local target path
 * @returns Promise<boolean> - Success status
 */
async function downloadFromGitHub(
  repoPath: string,
  filePath: string,
  targetPath: string
): Promise<boolean>;
```

### Fallback Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Fallback Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Try local file                                          │
│      └── fs.existsSync(localPath)                            │
│          └── If exists → use local                           │
│                                                              │
│   2. If local not found                                      │
│      └── downloadFromGitHub()                                │
│          ├── Build raw GitHub URL                            │
│          ├── Fetch content                                   │
│          └── Write to target                                 │
│                                                              │
│   3. If GitHub fails                                         │
│      └── Return error result                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform Considerations

### Path Separators

```javascript
// Always use path.join() for cross-platform compatibility
const targetPath = path.join(projectPath, '.standards', 'core', 'file.md');

// Never use string concatenation for paths
// BAD: projectPath + '/.standards/' + filename
```

### Line Endings

```javascript
// Preserve original line endings
// Do not convert LF <-> CRLF during copy
fs.copyFileSync(source, target);  // Binary-safe copy
```

### File Permissions

```javascript
// Respect original file permissions
// No need to set specific permissions on standards files
```

---

## Acceptance Criteria

- [ ] `copyStandard` successfully copies local files
- [ ] `copyStandard` falls back to GitHub when local unavailable
- [ ] `copyIntegration` creates parent directories as needed
- [ ] `writeManifest` creates `.standards/` directory if missing
- [ ] `readManifest` returns null for missing/invalid files
- [ ] `isInitialized` correctly detects UDS presence
- [ ] All operations work on Windows, macOS, and Linux
- [ ] Error results include meaningful messages

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| `fs` | Node.js file system module |
| `path` | Node.js path module |
| `./github.js` | GitHub download functionality |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Network failure during GitHub fallback | Medium | Medium | Retry with exponential backoff |
| File permission issues | Low | High | Clear error messages |
| Path encoding issues | Low | Medium | Use path.join() consistently |

---

## Implementation Reference

### Current Implementation (copier.js)

```javascript
// Simplified excerpt from actual implementation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function copyStandard(sourcePath, targetDir, projectPath) {
  try {
    // Resolve paths
    const sourceFullPath = path.join(__dirname, '..', '..', '..', sourcePath);
    const targetFullPath = path.join(projectPath, '.standards', targetDir, path.basename(sourcePath));

    // Ensure target directory exists
    const targetDirPath = path.dirname(targetFullPath);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }

    // Check if source exists locally
    if (fs.existsSync(sourceFullPath)) {
      fs.copyFileSync(sourceFullPath, targetFullPath);
      return { success: true, path: targetFullPath, source: 'local' };
    }

    // Fallback to GitHub
    const downloaded = await downloadFromGitHub(
      'AsiaOstrich/universal-dev-standards',
      sourcePath,
      targetFullPath
    );

    if (downloaded) {
      return { success: true, path: targetFullPath, source: 'github' };
    }

    return { success: false, error: `Source not found: ${sourcePath}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function writeManifest(manifest, projectPath) {
  const standardsDir = path.join(projectPath, '.standards');
  const manifestPath = path.join(standardsDir, 'manifest.json');

  if (!fs.existsSync(standardsDir)) {
    fs.mkdirSync(standardsDir, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export function readManifest(projectPath) {
  const manifestPath = path.join(projectPath, '.standards', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading manifest: ${error.message}`);
    return null;
  }
}

export function isInitialized(projectPath) {
  return fs.existsSync(path.join(projectPath, '.standards', 'manifest.json'));
}
```

---

## Related Specifications

- [SHARED-01 Manifest Schema](manifest-schema.md) - Manifest structure definition
- [SHARED-03 Hash Tracking](hash-tracking.md) - File integrity verification
- [INIT-03 Execution Stages](../init/03-execution-stages.md) - Init command file operations

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
