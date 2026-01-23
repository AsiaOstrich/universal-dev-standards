# [UPDATE-00] Update Command Overview

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: UPDATE-00

---

## Summary

The `uds update` command updates Universal Development Standards (UDS) in a project to the latest version. It handles version checking, incremental updates, and feature detection for new capabilities.

---

## Motivation

The update command provides:
1. **Version Management**: Keep standards current with latest UDS release
2. **Incremental Updates**: Only update changed files
3. **Feature Discovery**: Detect and offer new features (agents, workflows)
4. **Conflict Resolution**: Handle local modifications gracefully

---

## Command Synopsis

```bash
uds update [options]

Options:
  -y, --yes              Non-interactive mode, accept all updates
  --check-only           Check for updates without applying
  --force                Force update even if local modifications exist
  --skip-cli             Skip CLI self-update check
  --sync-refs            Sync integration file references
  -h, --help             Display help
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          uds update Command Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                           │
│   │    Entry     │                                                           │
│   │updateCommand │                                                           │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Phase 1    │────▶│   Phase 2    │────▶│   Phase 3    │                │
│   │   Version    │     │   Content    │     │   Feature    │                │
│   │   Checking   │     │   Update     │     │  Detection   │                │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│          │                    │                    │                         │
│          ▼                    ▼                    ▼                         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │ Compare with │     │ Update files │     │ Offer new    │                │
│   │ npm registry │     │ - Standards  │     │ features:    │                │
│   │ Check CLI    │     │ - Skills     │     │ - Agents     │                │
│   │ version      │     │ - Commands   │     │ - Workflows  │                │
│   └──────────────┘     │ - Integrations│    │ - Skills     │                │
│                        └──────────────┘     └──────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Update Phases

### Phase 1: Version Checking

**Purpose**: Determine if updates are available.

| Check | Source | Action |
|-------|--------|--------|
| UDS Version | npm registry | Compare installed vs latest |
| CLI Version | npm registry | Check for CLI updates |
| Manifest | Local file | Read current installation state |

See: [UPDATE-01 Version Checking](01-version-checking.md)

### Phase 2: Content Update

**Purpose**: Update standards, skills, commands, and integrations.

| Component | Update Logic |
|-----------|-------------|
| Standards | Copy new/changed files, preserve local modifications |
| Skills | Update if version changed |
| Commands | Update if version changed |
| Integrations | Regenerate with preserved user content |

See: [UPDATE-02 Standards Update](02-standards-update.md)

### Phase 3: Feature Detection

**Purpose**: Detect and offer new features introduced since last update.

| Feature Type | Detection | Offer |
|--------------|-----------|-------|
| Agents | Compare available vs installed | Prompt to install |
| Workflows | Compare available vs installed | Prompt to install |
| Skills | Check for new skills at level | Prompt to install |

See: [UPDATE-03 Feature Detection](03-feature-detection.md)

---

## State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Update Command State Machine                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐                                                                │
│   │  IDLE   │                                                                │
│   └────┬────┘                                                                │
│        │ update()                                                            │
│        ▼                                                                     │
│   ┌─────────────┐                                                            │
│   │ CHECKING    │──── !isInitialized() ────▶ Error: Run init first          │
│   │ INIT        │                                                            │
│   └──────┬──────┘                                                            │
│          │ initialized                                                       │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ CHECKING    │                                                            │
│   │ VERSION     │──── compareVersions() ───▶ { current, latest }            │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ├── latest == current ───▶ "Already up to date"                    │
│          │                                                                   │
│          ▼ latest > current                                                  │
│   ┌─────────────┐                                                            │
│   │ CHECKING    │                                                            │
│   │ CLI VERSION │──── checkCLIVersion() ──▶ Suggest CLI update if needed    │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ CONFIRMING  │──── --yes flag ────────▶ Skip confirmation                │
│   │ UPDATE      │                                                            │
│   └──────┬──────┘                                                            │
│          │ confirmed                                                         │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ CHECKING    │                                                            │
│   │ INTEGRITY   │──── compareHashes() ───▶ { unchanged, modified }          │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ├── has modifications ───▶ Prompt: Overwrite/Skip/Backup           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ UPDATING    │                                                            │
│   │ STANDARDS   │──── copyStandard() ───▶ Update standard files             │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ UPDATING    │                                                            │
│   │ SKILLS      │──── installSkills() ──▶ Update skill files                │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ REGENERATING│                                                            │
│   │ INTEGRATIONS│──── writeIntegrationFile() ──▶ Regenerate AI configs      │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ DETECTING   │                                                            │
│   │ FEATURES    │──── detectNewFeatures() ──▶ { agents, workflows }         │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ├── new features available ───▶ Prompt: Install new features?      │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                            │
│   │ UPDATING    │                                                            │
│   │ MANIFEST    │──── writeManifest() ──▶ Update manifest                   │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────┐                                                                │
│   │ SUCCESS │                                                                │
│   └─────────┘                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Update Options

### --check-only

Only check for updates without applying them.

```
$ uds update --check-only

📊 Update Check Results:

Current Version: 4.0.0
Latest Version:  4.1.0

Updates available:
  • 3 standards updated
  • 2 new skills available
  • 1 new workflow available

Run 'uds update' to apply updates.
```

### --sync-refs

Synchronize integration file references without full update.

```
$ uds update --sync-refs

🔄 Syncing integration references...

   CLAUDE.md:
   ✓ Updated references to 5 standards

   .cursorrules:
   ✓ Updated references to 5 standards

✅ References synchronized
```

### --force

Force update even if local modifications exist.

```
$ uds update --force

⚠️  Warning: Local modifications detected:
   • .standards/core/commit-message-guide.md (modified)

Proceeding with --force flag. Local modifications will be overwritten.
```

---

## Conflict Resolution

### Modification Detection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Modification Detection Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each file to update:                                                   │
│                                                                              │
│   1. Get stored hash from manifest                                           │
│   2. Compute current file hash                                               │
│   3. Compare hashes                                                          │
│                                                                              │
│   ├── Hash matches → Safe to update                                          │
│   │                                                                          │
│   └── Hash differs → Local modification detected                             │
│       │                                                                      │
│       ▼                                                                      │
│       Prompt user:                                                           │
│       ┌─────────────────────────────────────────────────────┐               │
│       │ ? Local modifications detected in file.md           │               │
│       │   ○ Overwrite with latest version                   │               │
│       │   ○ Keep local version (skip update)                │               │
│       │   ○ Create backup and overwrite                     │               │
│       │   ○ View diff                                       │               │
│       └─────────────────────────────────────────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Conflict Resolution Options

| Option | Behavior |
|--------|----------|
| Overwrite | Replace local file with latest version |
| Keep | Skip this file, keep local modifications |
| Backup | Copy local to `.backup`, then overwrite |
| Diff | Show differences, then re-prompt |

---

## Output Examples

### Successful Update

```
🔄 Updating Universal Development Standards...

📊 Version Info:
   Current: 4.0.0 → Latest: 4.1.0

📋 Updating standards...
   ✓ core/commit-message-guide.md (updated)
   ✓ core/testing-standards.md (updated)
   - core/anti-hallucination.md (unchanged)
   - core/checkin-standards.md (unchanged)

🎯 Updating skills...
   ✓ commit-standards (updated)
   ✓ testing-guide (updated)

🔧 Regenerating integrations...
   ✓ CLAUDE.md (regenerated)
   ✓ .cursorrules (regenerated)

✨ New features available:
   • code-reviewer agent
   • pr-workflow workflow

? Install new features? (Y/n)

📝 Updating manifest...
   ✓ .standards/manifest.json

════════════════════════════════════════════════════════════════════════════════

✅ Updated to version 4.1.0

Changes:
   • 2 standards updated
   • 2 skills updated
   • 2 integrations regenerated
   • 1 agent installed
   • 1 workflow installed

════════════════════════════════════════════════════════════════════════════════
```

### Already Up to Date

```
🔄 Checking for updates...

✅ Already up to date (version 4.1.0)

Last checked: 2026-01-23 10:30:00
```

---

## Acceptance Criteria

- [ ] Correctly detects available updates via npm registry
- [ ] Compares file hashes to detect local modifications
- [ ] Prompts for conflict resolution when modifications detected
- [ ] Updates standards while preserving unmodified local files
- [ ] Updates skills and commands correctly
- [ ] Regenerates integration files with preserved user content
- [ ] Detects and offers new features (agents, workflows)
- [ ] Updates manifest with new version and hashes
- [ ] Supports --check-only, --force, --sync-refs options
- [ ] Works in interactive and non-interactive modes

---

## Dependencies

| Spec ID | Name | Dependency Type |
|---------|------|-----------------|
| SHARED-01 | Manifest Schema | Data structure |
| SHARED-02 | File Operations | File copying |
| SHARED-03 | Hash Tracking | Integrity checking |
| SHARED-04 | Integration Generation | Regeneration |
| SHARED-05 | Skills Installation | Skill updates |

---

## Related Specifications

- [UPDATE-01 Version Checking](01-version-checking.md)
- [UPDATE-02 Standards Update](02-standards-update.md)
- [UPDATE-03 Feature Detection](03-feature-detection.md)
- [INIT-00 Init Overview](../init/00-init-overview.md)
- [CHECK-00 Check Overview](../check/00-check-overview.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
