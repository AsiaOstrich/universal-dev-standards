# [CHECK-00] Check Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: CHECK-00

---

## Summary

The `uds check` command verifies the integrity and adoption status of Universal Development Standards (UDS) in a project. It validates file integrity, skill installations, integration references, and provides actionable reports.

---

## Motivation

The check command provides:
1. **Integrity Verification**: Detect tampered or missing files
2. **Adoption Status**: Show coverage of standards
3. **Repair Capability**: Restore modified/missing files
4. **Compliance Reporting**: Generate adoption reports

---

## Command Synopsis

```bash
uds check [options]

Options:
  -v, --verbose          Show detailed output
  -s, --summary          Show summary only
  --restore              Interactive restore mode
  --migrate              Migrate legacy manifest to latest schema
  --fix                  Auto-fix issues without prompting
  --json                 Output results as JSON
  -h, --help             Display help
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          uds check Command Flow                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                           │
│   │    Entry     │                                                           │
│   │ checkCommand │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                           │
│   │  Load        │                                                           │
│   │  Manifest    │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Check 1    │────▶│   Check 2    │────▶│   Check 3    │                │
│   │   Standards  │     │   Skills     │     │   Commands   │                │
│   │   Integrity  │     │   Integrity  │     │   Integrity  │                │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│          │                    │                    │                         │
│          └────────────────────┴────────────────────┘                         │
│                               │                                              │
│                               ▼                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Check 4    │────▶│   Check 5    │────▶│   Generate   │                │
│   │ Integration  │     │  Reference   │     │   Report     │                │
│   │   Blocks     │     │    Sync      │     │              │                │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Check Categories

### 1. Standards Integrity Check

Verify standard files in `.standards/` directory.

| Check | Method | Status |
|-------|--------|--------|
| File existence | `fs.existsSync()` | missing / present |
| Hash match | `compareFileHash()` | unchanged / modified |

See: [CHECK-01 Integrity Checking](01-integrity-checking.md)

### 2. Skills Integrity Check

Verify installed skills for each agent.

| Check | Method | Status |
|-------|--------|--------|
| Directory exists | `fs.existsSync()` | missing / present |
| SKILL.md exists | File check | missing / present |
| Hash match | `compareFileHash()` | unchanged / modified |

### 3. Commands Integrity Check

Verify installed slash commands for each agent.

| Check | Method | Status |
|-------|--------|--------|
| Command file exists | `fs.existsSync()` | missing / present |
| Hash match | `compareFileHash()` | unchanged / modified |

### 4. Integration Blocks Check

Verify UDS-managed content in integration files.

| Check | Method | Status |
|-------|--------|--------|
| File exists | `fs.existsSync()` | missing / present |
| UDS block exists | `extractMarkedContent()` | missing / present |
| Block hash match | `computeIntegrationBlockHash()` | unchanged / modified |

### 5. Reference Sync Check

Verify integration file references match installed standards.

| Check | Method | Status |
|-------|--------|--------|
| All standards referenced | Content analysis | synced / out-of-sync |
| No stale references | Content analysis | clean / stale refs |

See: [CHECK-02 Status Display](02-status-display.md)

---

## Check Results Structure

```typescript
interface CheckResults {
  /** Overall status */
  status: 'healthy' | 'issues' | 'critical';

  /** Manifest information */
  manifest: {
    version: string;
    udsVersion: string;
    level: number;
    lastUpdated: string;
  };

  /** Standards check results */
  standards: {
    total: number;
    unchanged: number;
    modified: string[];
    missing: string[];
  };

  /** Skills check results */
  skills: {
    total: number;
    unchanged: number;
    modified: string[];
    missing: string[];
  };

  /** Commands check results */
  commands: {
    total: number;
    unchanged: number;
    modified: string[];
    missing: string[];
  };

  /** Integration blocks check results */
  integrations: {
    total: number;
    healthy: number;
    modified: string[];
    missing: string[];
  };

  /** Reference sync status */
  references: {
    synced: boolean;
    outOfSync: string[];
    staleRefs: string[];
  };

  /** Recommendations */
  recommendations: string[];
}
```

---

## Status Definitions

### Overall Status

| Status | Condition | Exit Code |
|--------|-----------|-----------|
| `healthy` | All checks pass | 0 |
| `issues` | Non-critical issues (modified files) | 0 |
| `critical` | Missing files or invalid manifest | 1 |

### File Status

| Status | Meaning |
|--------|---------|
| `unchanged` | Hash matches stored value |
| `modified` | Hash differs from stored value |
| `missing` | File not found |

---

## Output Modes

### Default Output

```
🔍 Checking UDS adoption status...

📊 Manifest Info:
   Version: 3.3.0
   UDS Version: 4.1.0
   Level: 2 (Standard)
   Installed: 2026-01-20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Standards Integrity:
   ✓ 6/6 files unchanged

🎯 Skills Integrity:
   ✓ 4/4 skills unchanged

⌨️ Commands Integrity:
   ✓ 3/3 commands unchanged

🔧 Integration Files:
   ✓ 2/2 files healthy

🔗 Reference Sync:
   ✓ All references synchronized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Status: Healthy

All UDS components are intact and up to date.
```

### Summary Output (--summary)

```
🔍 UDS Check Summary

Status: ✅ Healthy
Version: 4.1.0 | Level: 2

Standards: 6/6 ✓ | Skills: 4/4 ✓ | Commands: 3/3 ✓
Integrations: 2/2 ✓ | References: Synced ✓
```

### Verbose Output (--verbose)

```
🔍 Checking UDS adoption status...

📊 Manifest Info:
   Path: /project/.standards/manifest.json
   Schema Version: 3.3.0
   UDS Version: 4.1.0
   Level: 2 (Standard)
   Format: ai
   Standards Scope: minimal
   Content Mode: index
   Installed: 2026-01-20T10:00:00.000Z
   AI Tools: claude-code, cursor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Standards Integrity (6 files):

   ✓ .standards/core/anti-hallucination.md
     Hash: sha256:abc123... | Size: 5234 bytes | Unchanged

   ✓ .standards/core/checkin-standards.md
     Hash: sha256:def456... | Size: 3456 bytes | Unchanged

   ⚠ .standards/core/commit-message-guide.md
     Hash: sha256:ghi789... → sha256:xyz999...
     Status: MODIFIED (local changes detected)

   ... (more files)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

... (continued verbose output)
```

### JSON Output (--json)

```json
{
  "status": "issues",
  "manifest": {
    "version": "3.3.0",
    "udsVersion": "4.1.0",
    "level": 2,
    "lastUpdated": "2026-01-20T10:00:00.000Z"
  },
  "standards": {
    "total": 6,
    "unchanged": 5,
    "modified": [".standards/core/commit-message-guide.md"],
    "missing": []
  },
  "skills": {
    "total": 4,
    "unchanged": 4,
    "modified": [],
    "missing": []
  },
  "commands": {
    "total": 3,
    "unchanged": 3,
    "modified": [],
    "missing": []
  },
  "integrations": {
    "total": 2,
    "healthy": 2,
    "modified": [],
    "missing": []
  },
  "references": {
    "synced": true,
    "outOfSync": [],
    "staleRefs": []
  },
  "recommendations": [
    "Run 'uds update' to restore modified files"
  ]
}
```

---

## Restore Mode (--restore)

Interactive mode to repair detected issues.

```
🔧 UDS Restore Mode

Issues detected:
   1. .standards/core/commit-message-guide.md (modified)
   2. .claude/skills/testing-guide/SKILL.md (missing)

? Select items to restore:
   ◉ commit-message-guide.md (restore from upstream)
   ◉ testing-guide skill (reinstall)

? Confirm restore? (y/N) y

Restoring...
   ✓ commit-message-guide.md restored
   ✓ testing-guide skill reinstalled

✅ Restore complete
```

See: [CHECK-03 Restore Operations](03-restore-operations.md)

---

## Migrate Mode (--migrate)

Migrate legacy manifest to latest schema.

```
🔄 Manifest Migration

Current schema: 3.1.0
Target schema: 3.3.0

Migrations to apply:
   • Add skillHashes field
   • Add commandHashes field
   • Add integrationBlockHashes field
   • Add declined field

? Proceed with migration? (Y/n) y

Migrating...
   ✓ Added skillHashes
   ✓ Added commandHashes
   ✓ Added integrationBlockHashes
   ✓ Added declined

✅ Migration complete (3.1.0 → 3.3.0)
```

---

## Error Handling

### Not Initialized

```
❌ Error: UDS is not initialized in this project.

Run 'uds init' to initialize UDS first.
```

### Invalid Manifest

```
❌ Error: Invalid manifest file.

The manifest at .standards/manifest.json is corrupted or invalid.

Options:
   • Run 'uds init --force' to reinitialize
   • Restore manifest from version control
```

### Permission Errors

```
❌ Error: Permission denied reading .standards/core/file.md

Check file permissions and try again.
```

---

## Acceptance Criteria

- [ ] Correctly reads and validates manifest
- [ ] Checks hash integrity for all standard files
- [ ] Checks hash integrity for all skill files
- [ ] Checks hash integrity for all command files
- [ ] Checks integration block integrity
- [ ] Detects out-of-sync references
- [ ] Generates accurate status reports
- [ ] Supports --verbose, --summary, --json output modes
- [ ] Restore mode repairs detected issues
- [ ] Migrate mode updates legacy manifests
- [ ] Returns correct exit codes (0 for healthy, 1 for critical)

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| SHARED-01 | Manifest Schema | Reading manifest |
| SHARED-02 | File Operations | File access |
| SHARED-03 | Hash Tracking | Integrity verification |
| SHARED-04 | Integration Generation | Block extraction |

---

## Related Specifications

- [CHECK-01 Integrity Checking](01-integrity-checking.md)
- [CHECK-02 Status Display](02-status-display.md)
- [CHECK-03 Restore Operations](03-restore-operations.md)
- [INIT-00 Init Overview](../init/00-init-overview.md)
- [UPDATE-00 Update Overview](../update/00-update-overview.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
