# [SHARED-03] Hash Tracking Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: SHARED-03

---

## Summary

This specification defines the hash tracking module (`hasher.js`) which provides SHA-256 based file integrity verification for UDS standards, skills, commands, and integration blocks.

---

## Motivation

Hash tracking enables:
1. **Tamper Detection**: Identify files modified outside UDS workflow
2. **Update Decisions**: Skip unchanged files during updates
3. **Restore Capability**: Detect and restore modified files
4. **Audit Trail**: Track file changes over time

---

## Detailed Design

### Module Location

```
cli/src/utils/hasher.js
```

### Dependencies

- Node.js `crypto` module for SHA-256 hashing
- Node.js `fs` module for file reading
- Node.js `path` module for path handling

---

## Hash Format

### Hash String Format

```
hash := "sha256:" + hexstring(64)

Examples:
- "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" (empty file)
- "sha256:a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a" (content)
```

### HashInfo Structure

```typescript
interface HashInfo {
  /** SHA-256 hash with "sha256:" prefix */
  hash: string;

  /** File size in bytes */
  size: number;

  /** Installation timestamp (ISO 8601) - optional */
  installedAt?: string;
}
```

---

## API Specification

### computeFileHash

Computes SHA-256 hash and size for a file.

```typescript
/**
 * Compute SHA-256 hash and size of a file
 *
 * @param filePath - Absolute path to file
 * @returns HashInfo or null if file doesn't exist
 */
function computeFileHash(filePath: string): HashInfo | null;
```

#### Usage Example

```javascript
const hashInfo = computeFileHash('/path/to/file.md');
// Result:
// {
//   hash: "sha256:abc123...",
//   size: 5234
// }
```

---

### compareFileHash

Compares current file hash with stored hash.

```typescript
/**
 * Compare file's current hash with stored hash info
 *
 * @param filePath - Absolute path to file
 * @param storedInfo - Previously stored HashInfo
 * @returns CompareResult - 'unchanged' | 'modified' | 'missing'
 */
function compareFileHash(
  filePath: string,
  storedInfo: HashInfo
): 'unchanged' | 'modified' | 'missing';
```

#### Comparison Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   compareFileHash Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Input: filePath, storedInfo                                │
│                                                              │
│   1. Check file existence                                    │
│      └── If not exists → return 'missing'                    │
│                                                              │
│   2. Compute current hash                                    │
│      └── computeFileHash(filePath)                           │
│                                                              │
│   3. Compare hashes                                          │
│      ├── If match → return 'unchanged'                       │
│      └── If different → return 'modified'                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### computeDirectoryHashes

Computes hashes for all files in a directory.

```typescript
/**
 * Compute hashes for all files in a directory
 *
 * @param dirPath - Absolute path to directory
 * @param baseKey - Prefix for hash keys (e.g., "claude-code/project")
 * @returns Record<string, HashInfo> - Map of relative paths to hash info
 */
function computeDirectoryHashes(
  dirPath: string,
  baseKey: string
): Record<string, HashInfo>;
```

#### Usage Example

```javascript
const skillHashes = computeDirectoryHashes(
  '/path/to/project/.claude/skills/commit-standards',
  'claude-code/project/commit-standards'
);

// Result:
// {
//   "claude-code/project/commit-standards/SKILL.md": {
//     hash: "sha256:abc...",
//     size: 3456
//   },
//   "claude-code/project/commit-standards/examples/example.md": {
//     hash: "sha256:def...",
//     size: 1234
//   }
// }
```

---

### computeIntegrationBlockHash

Computes hash of UDS-managed content block within an integration file.

```typescript
/**
 * Compute hash of UDS block content in integration file
 *
 * @param filePath - Absolute path to integration file
 * @param markerPattern - Regex or string to identify UDS blocks
 * @returns HashInfo or null if no block found
 */
function computeIntegrationBlockHash(
  filePath: string,
  markerPattern?: RegExp
): HashInfo | null;
```

#### UDS Block Markers

Integration files contain UDS-managed blocks marked by special comments:

**Markdown format:**
```markdown
<!-- UDS:START -->
... UDS managed content ...
<!-- UDS:END -->
```

**Plaintext format:**
```
# === UDS:START ===
... UDS managed content ...
# === UDS:END ===
```

---

### verifyAllHashes

Batch verification of multiple files against stored hashes.

```typescript
/**
 * Verify multiple files against stored hashes
 *
 * @param fileHashes - Map of file paths to stored HashInfo
 * @param basePath - Base path for resolving relative paths
 * @returns VerificationResult
 */
function verifyAllHashes(
  fileHashes: Record<string, HashInfo>,
  basePath: string
): VerificationResult;

interface VerificationResult {
  unchanged: string[];   // Files that match
  modified: string[];    // Files that differ
  missing: string[];     // Files not found
  total: number;         // Total files checked
}
```

---

## Hash Storage in Manifest

### Standards File Hashes

```json
{
  "fileHashes": {
    ".standards/core/anti-hallucination.md": {
      "hash": "sha256:abc123...",
      "size": 5234,
      "installedAt": "2026-01-23T10:00:00.000Z"
    },
    ".standards/core/checkin-standards.md": {
      "hash": "sha256:def456...",
      "size": 3456,
      "installedAt": "2026-01-23T10:00:00.000Z"
    }
  }
}
```

### Skill File Hashes

```json
{
  "skillHashes": {
    "claude-code/project/commit-standards/SKILL.md": {
      "hash": "sha256:ghi789...",
      "size": 2345
    },
    "claude-code/project/commit-standards/commit-message.ai.yaml": {
      "hash": "sha256:jkl012...",
      "size": 1234
    }
  }
}
```

### Command File Hashes

```json
{
  "commandHashes": {
    "claude-code/uds-init.md": {
      "hash": "sha256:mno345...",
      "size": 876
    },
    "claude-code/uds-check.md": {
      "hash": "sha256:pqr678...",
      "size": 654
    }
  }
}
```

### Integration Block Hashes

```json
{
  "integrationBlockHashes": {
    "CLAUDE.md": {
      "hash": "sha256:stu901...",
      "size": 4567
    },
    ".cursorrules": {
      "hash": "sha256:vwx234...",
      "size": 3456
    }
  }
}
```

---

## Integrity Check Flow

### Check Command Flow

```
┌─────────────────────────────────────────────────────────────┐
│               Integrity Check Flow (check.js)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Load manifest                                           │
│      └── readManifest(projectPath)                           │
│                                                              │
│   2. Verify standard files                                   │
│      └── for each entry in manifest.fileHashes:              │
│          └── compareFileHash(path, storedInfo)               │
│                                                              │
│   3. Verify skill files                                      │
│      └── for each entry in manifest.skillHashes:             │
│          └── compareFileHash(path, storedInfo)               │
│                                                              │
│   4. Verify command files                                    │
│      └── for each entry in manifest.commandHashes:           │
│          └── compareFileHash(path, storedInfo)               │
│                                                              │
│   5. Verify integration blocks                               │
│      └── for each entry in manifest.integrationBlockHashes:  │
│          └── computeIntegrationBlockHash(path)               │
│          └── compare with stored                             │
│                                                              │
│   6. Report results                                          │
│      ├── Show unchanged count                                │
│      ├── Show modified files                                 │
│      └── Show missing files                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Update Decision Flow

```
┌─────────────────────────────────────────────────────────────┐
│             Update Decision Flow (update.js)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   For each standard to update:                               │
│                                                              │
│   1. Check if file exists locally                            │
│      └── If missing → always update                          │
│                                                              │
│   2. Compare local hash with upstream hash                   │
│      └── If same → skip (already up to date)                 │
│                                                              │
│   3. Compare local hash with stored hash                     │
│      ├── If same → safe to update (no local changes)         │
│      └── If different → prompt user (local modifications)    │
│                                                              │
│   4. Perform update                                          │
│      └── Update hash in manifest after copy                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Caching

For batch operations, hash results can be cached to avoid recomputing the same file multiple times.

### Streaming for Large Files

For files larger than 10MB, streaming should be used to avoid memory issues:
- Read file in chunks
- Update hash incrementally
- Track total size during streaming

---

## Edge Cases

### Empty Files

Empty files have a valid hash (the SHA-256 hash of empty content).

### Binary Files

Binary files are hashed the same way as text files.

### Symlinks

Follow symlinks by default - compute hash of target file.

### Missing Stored Hash

Handle legacy manifests without hashes by skipping integrity check or computing and storing hashes.

---

## Acceptance Criteria

- [ ] `computeFileHash` returns correct SHA-256 hash
- [ ] `computeFileHash` returns null for non-existent files
- [ ] `compareFileHash` correctly identifies unchanged files
- [ ] `compareFileHash` correctly identifies modified files
- [ ] `compareFileHash` correctly identifies missing files
- [ ] `computeDirectoryHashes` recursively processes all files
- [ ] `computeIntegrationBlockHash` extracts and hashes UDS blocks
- [ ] Hash format follows "sha256:" prefix convention
- [ ] Large files (>10MB) are handled without memory issues

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Node.js `crypto` | SHA-256 hashing |
| Node.js `fs` | File system access |
| Node.js `path` | Path handling |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hash collision | Extremely Low | High | SHA-256 is collision-resistant |
| Performance on large repos | Medium | Medium | Use streaming for large files |
| Race conditions | Low | Medium | Atomic operations where possible |

---

## Related Specifications

- [SHARED-01 Manifest Schema](manifest-schema.md) - Hash storage structure
- [SHARED-02 File Operations](file-operations.md) - File reading operations
- [CHECK-01 Integrity Checking](../check/01-integrity-checking.md) - Hash verification usage

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
