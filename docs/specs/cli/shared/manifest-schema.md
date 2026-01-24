# [SHARED-01] Manifest Schema Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: SHARED-01

---

## Summary

This specification defines the structure, versioning, and validation rules for the UDS manifest file (`.standards/manifest.json`). The manifest is the central data store that tracks all UDS-related state in a project.

---

## Motivation

The manifest file serves as:
1. **Single Source of Truth**: All UDS state in one location
2. **Version Tracking**: Track installed UDS version and schema version
3. **Integrity Verification**: Store hashes for tamper detection
4. **Configuration Store**: Persist user choices across sessions

---

## Detailed Design

### File Location

```
<project-root>/
└── .standards/
    └── manifest.json
```

### Schema Version History

| Schema Version | UDS Version | Key Changes |
|----------------|-------------|-------------|
| 1.0.0 | 1.x | Initial schema |
| 2.0.0 | 2.x | Added `level`, `format` |
| 3.0.0 | 3.x | Added `aiTools`, `skills` |
| 3.1.0 | 3.1.x | Added `fileHashes` |
| 3.2.0 | 3.2.x | Added `standardsScope`, `contentMode` |
| 3.3.0 | 4.x | Added `skillHashes`, `commandHashes`, `integrationBlockHashes`, `declined` |

### Complete Schema Definition (v3.3.0)

```typescript
/**
 * UDS Manifest Schema v3.3.0
 * Central configuration and state tracking for UDS installations
 */
interface Manifest {
  /**
   * Manifest schema version (semver)
   * Used for migration logic
   */
  version: string;

  /**
   * Upstream repository information
   */
  upstream: {
    /** Repository identifier (e.g., "AsiaOstrich/universal-dev-standards") */
    repo: string;
    /** UDS version installed (semver) */
    version: string;
    /** Installation timestamp (ISO 8601) */
    installed: string;
  };

  /**
   * Adoption level (1-3)
   * Level 1: Core standards only
   * Level 2: Core + workflow standards
   * Level 3: Full standards suite
   */
  level: 1 | 2 | 3;

  /**
   * Standard file format
   * - 'ai': AI-optimized format (.ai.yaml)
   * - 'human': Human-readable format (.md)
   * - 'both': Both formats installed
   */
  format: 'ai' | 'human' | 'both';

  /**
   * Scope of standards installed
   * - 'minimal': Core standards only
   * - 'full': All standards including extensions
   */
  standardsScope: 'minimal' | 'full';

  /**
   * Integration file content mode
   * - 'minimal': Reference-only content
   * - 'index': Standard index with descriptions
   * - 'full': Full standard content embedded
   */
  contentMode: 'minimal' | 'index' | 'full';

  /**
   * List of installed standard file paths
   * Relative to .standards/ directory
   */
  standards: string[];

  /**
   * List of installed extension file paths
   * Relative to .standards/ directory
   */
  extensions: string[];

  /**
   * List of generated integration file paths
   * Relative to project root
   */
  integrations: string[];

  /**
   * Standard configuration options
   */
  options: ManifestOptions;

  /**
   * Selected AI tools for integration
   */
  aiTools: AIToolName[];

  /**
   * Skills installation configuration
   */
  skills: SkillsConfig;

  /**
   * Commands installation configuration
   */
  commands: CommandsConfig;

  /**
   * File integrity hashes for standards
   * Key: relative path from project root
   */
  fileHashes: Record<string, HashInfo>;

  /**
   * File integrity hashes for skills
   * Key: "agent/level/skill-name/filename"
   */
  skillHashes: Record<string, HashInfo>;

  /**
   * File integrity hashes for commands
   * Key: "agent/command-name.md"
   */
  commandHashes: Record<string, HashInfo>;

  /**
   * UDS block hashes for integration files
   * Key: integration file path
   */
  integrationBlockHashes: Record<string, HashInfo>;

  /**
   * Features user has declined to adopt
   * Prevents re-prompting on update
   */
  declined?: DeclinedFeatures;
}

/**
 * Configuration options for standards
 */
interface ManifestOptions {
  /** Git workflow type */
  workflow?: 'github-flow' | 'gitflow' | 'trunk-based';
  /** Merge strategy preference */
  merge_strategy?: 'merge' | 'squash' | 'rebase';
  /** Commit message language */
  commit_language?: 'english' | 'chinese' | 'bilingual';
  /** Test levels to include */
  test_levels?: ('unit-testing' | 'integration-testing' | 'e2e-testing')[];
}

/**
 * Skills installation configuration
 */
interface SkillsConfig {
  /** Whether skills are installed */
  installed: boolean;
  /** Installation location type */
  location?: 'project' | 'user' | 'marketplace';
  /** List of installed skill names */
  names?: string[];
  /** UDS version of installed skills */
  version?: string;
  /** Per-agent installation details */
  installations?: AgentInstallation[];
}

/**
 * Commands installation configuration
 */
interface CommandsConfig {
  /** Whether commands are installed */
  installed: boolean;
  /** List of installed command names */
  names?: string[];
  /** Per-agent installation details */
  installations?: AgentInstallation[];
}

/**
 * Per-agent installation record
 */
interface AgentInstallation {
  /** Agent identifier */
  agent: AIToolName;
  /** Installation level */
  level: 'project' | 'user' | 'marketplace';
}

/**
 * File hash information for integrity tracking
 */
interface HashInfo {
  /** SHA-256 hash with prefix "sha256:" */
  hash: string;
  /** File size in bytes */
  size: number;
  /** Installation timestamp (ISO 8601) - optional */
  installedAt?: string;
}

/**
 * Features user has explicitly declined
 */
interface DeclinedFeatures {
  /** Declined agents */
  agents?: string[];
  /** Declined workflows */
  workflows?: string[];
  /** Declined skills */
  skills?: string[];
}

/**
 * Supported AI tool identifiers
 */
type AIToolName =
  | 'claude-code'
  | 'opencode'
  | 'cursor'
  | 'windsurf'
  | 'cline'
  | 'roo'
  | 'aider'
  | 'copilot'
  | 'antigravity';
```

### Minimal Valid Manifest

```json
{
  "version": "3.3.0",
  "upstream": {
    "repo": "AsiaOstrich/universal-dev-standards",
    "version": "4.1.0",
    "installed": "2026-01-23T10:00:00.000Z"
  },
  "level": 1,
  "format": "ai",
  "standardsScope": "minimal",
  "contentMode": "index",
  "standards": ["core/anti-hallucination.md"],
  "extensions": [],
  "integrations": ["CLAUDE.md"],
  "options": {},
  "aiTools": ["claude-code"],
  "skills": { "installed": false },
  "commands": { "installed": false },
  "fileHashes": {}
}
```

### Complete Example Manifest

```json
{
  "version": "3.3.0",
  "upstream": {
    "repo": "AsiaOstrich/universal-dev-standards",
    "version": "4.1.0",
    "installed": "2026-01-23T10:00:00.000Z"
  },
  "level": 2,
  "format": "ai",
  "standardsScope": "full",
  "contentMode": "index",
  "standards": [
    "core/anti-hallucination.md",
    "core/checkin-standards.md",
    "core/commit-message-guide.md",
    "core/code-review-checklist.md"
  ],
  "extensions": [
    "extensions/languages/typescript-style.md"
  ],
  "integrations": [
    "CLAUDE.md",
    ".cursorrules"
  ],
  "options": {
    "workflow": "github-flow",
    "merge_strategy": "squash",
    "commit_language": "english",
    "test_levels": ["unit-testing", "integration-testing"]
  },
  "aiTools": ["claude-code", "cursor"],
  "skills": {
    "installed": true,
    "location": "project",
    "names": ["commit-standards", "testing-guide"],
    "version": "4.1.0",
    "installations": [
      { "agent": "claude-code", "level": "project" }
    ]
  },
  "commands": {
    "installed": true,
    "names": ["uds-init", "uds-check"],
    "installations": [
      { "agent": "claude-code", "level": "project" }
    ]
  },
  "fileHashes": {
    ".standards/core/anti-hallucination.md": {
      "hash": "sha256:abc123...",
      "size": 5234,
      "installedAt": "2026-01-23T10:00:00.000Z"
    }
  },
  "skillHashes": {
    "claude-code/project/commit-standards/SKILL.md": {
      "hash": "sha256:def456...",
      "size": 3456
    }
  },
  "commandHashes": {
    "claude-code/uds-check.md": {
      "hash": "sha256:ghi789...",
      "size": 2123
    }
  },
  "integrationBlockHashes": {
    "CLAUDE.md": {
      "hash": "sha256:jkl012...",
      "size": 4567
    }
  },
  "declined": {
    "agents": ["code-reviewer"],
    "workflows": ["pr-workflow"]
  }
}
```

---

## API Functions

### Reading Manifest

```javascript
// copier.js
export function readManifest(projectPath) {
  // Returns: Manifest object or null if not found
  // Handles: File not found, JSON parse errors
}

export function isInitialized(projectPath) {
  // Returns: boolean - true if manifest exists
}
```

### Writing Manifest

```javascript
// copier.js
export function writeManifest(manifest, projectPath) {
  // Writes manifest with 2-space JSON indentation
  // Creates .standards/ directory if not exists
}
```

### Version Migration

```javascript
// Pseudo-code for migration logic
function migrateManifest(manifest) {
  const currentVersion = manifest.version;

  if (semver.lt(currentVersion, '3.1.0')) {
    // Add fileHashes if missing
    manifest.fileHashes = manifest.fileHashes || {};
  }

  if (semver.lt(currentVersion, '3.2.0')) {
    // Add standardsScope and contentMode
    manifest.standardsScope = manifest.standardsScope || 'minimal';
    manifest.contentMode = manifest.contentMode || 'index';
  }

  if (semver.lt(currentVersion, '3.3.0')) {
    // Add skill/command/integration block hashes
    manifest.skillHashes = manifest.skillHashes || {};
    manifest.commandHashes = manifest.commandHashes || {};
    manifest.integrationBlockHashes = manifest.integrationBlockHashes || {};
  }

  manifest.version = CURRENT_SCHEMA_VERSION;
  return manifest;
}
```

---

## Validation Rules

### Required Fields

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `version` | string | ✅ | - |
| `upstream` | object | ✅ | - |
| `upstream.repo` | string | ✅ | - |
| `upstream.version` | string | ✅ | - |
| `upstream.installed` | string | ✅ | - |
| `level` | number | ✅ | - |
| `format` | string | ✅ | - |
| `standardsScope` | string | ✅ (v3.2.0+) | 'minimal' |
| `contentMode` | string | ✅ (v3.2.0+) | 'index' |
| `standards` | array | ✅ | [] |
| `extensions` | array | ✅ | [] |
| `integrations` | array | ✅ | [] |
| `options` | object | ✅ | {} |
| `aiTools` | array | ✅ | [] |
| `skills` | object | ✅ | { installed: false } |
| `commands` | object | ✅ | { installed: false } |
| `fileHashes` | object | ✅ (v3.1.0+) | {} |

### Value Constraints

| Field | Constraint |
|-------|------------|
| `version` | Valid semver |
| `level` | 1, 2, or 3 |
| `format` | 'ai', 'human', or 'both' |
| `standardsScope` | 'minimal' or 'full' |
| `contentMode` | 'minimal', 'index', or 'full' |
| `aiTools` | Array of valid AI tool names |
| `skills.location` | 'project', 'user', or 'marketplace' |

### Hash Format

```
hash := "sha256:" + hexstring(64)
Example: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

---

## Backward Compatibility

### Legacy Manifest Detection

```javascript
function isLegacyManifest(manifest) {
  return !manifest.version ||
         semver.lt(manifest.version, '3.0.0');
}
```

### Migration Strategy

1. **Read**: Always attempt to read existing manifest
2. **Detect**: Check schema version
3. **Migrate**: Apply incremental migrations
4. **Preserve**: Keep unknown fields for forward compatibility
5. **Write**: Update version number after migration

### Graceful Degradation

| Missing Field | Behavior |
|---------------|----------|
| `fileHashes` | Disable integrity checking |
| `skillHashes` | Disable skill integrity checking |
| `contentMode` | Default to 'index' |
| `declined` | Treat all features as not declined |

---

## Acceptance Criteria

- [ ] Manifest schema version is `3.3.0`
- [ ] All required fields are present and valid
- [ ] Hash values follow `sha256:` prefix format
- [ ] Date values are valid ISO 8601 timestamps
- [ ] Level is constrained to 1, 2, or 3
- [ ] AI tool names are from valid set
- [ ] Legacy manifests are migrated correctly
- [ ] Unknown fields are preserved during read/write

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| SHARED-02 | File read/write operations |
| SHARED-03 | Hash computation for integrity |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema migration failure | Low | High | Backup before migration |
| Data loss on version upgrade | Low | High | Preserve unknown fields |
| Circular dependency | Medium | Medium | Lazy loading pattern |

---

## Implementation Notes

### File Operations

```javascript
// Reading with error handling
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

// Writing with directory creation
export function writeManifest(manifest, projectPath) {
  const standardsDir = path.join(projectPath, '.standards');
  const manifestPath = path.join(standardsDir, 'manifest.json');

  if (!fs.existsSync(standardsDir)) {
    fs.mkdirSync(standardsDir, { recursive: true });
  }

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
}
```

---

## Related Specifications

- [SHARED-02 File Operations](file-operations.md)
- [SHARED-03 Hash Tracking](hash-tracking.md)
- [INIT-00 Init Overview](../init/00-init-overview.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
