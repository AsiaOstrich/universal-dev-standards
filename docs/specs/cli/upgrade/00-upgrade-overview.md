# [SPEC-UPGRADE-00] UDS Upgrade Command / UDS 升級命令

**Priority**: P0
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: CLI-UPGRADE-001
**Dependencies**: [SPEC-SHARED-08 i18n-system, SPEC-SHARED-09 error-handling]

---

## Summary / 摘要

The `uds upgrade` command provides a seamless migration path for projects using older versions of UDS to upgrade to newer versions. It handles schema migrations, file relocations, and configuration updates automatically.

`uds upgrade` 命令為使用舊版 UDS 的專案提供無縫升級路徑。它自動處理 schema 遷移、檔案搬遷和配置更新。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Breaking Changes**: Major version updates often introduce breaking changes in file structure, configuration format, or CLI behavior
2. **Manual Migration**: Users currently must manually migrate configurations when upgrading
3. **Version Lock-in**: Fear of migration complexity prevents users from adopting new versions
4. **Inconsistent State**: Partial migrations leave projects in inconsistent states

**現有問題**：
1. **破壞性變更**：主版本更新經常引入檔案結構、配置格式或 CLI 行為的破壞性變更
2. **手動遷移**：使用者目前必須在升級時手動遷移配置
3. **版本鎖定**：遷移複雜性的恐懼阻止使用者採用新版本
4. **不一致狀態**：部分遷移使專案處於不一致狀態

### Solution / 解決方案

A dedicated `uds upgrade` command that:
- Detects current UDS version in project
- Identifies required migration steps
- Executes migrations with rollback capability
- Validates successful upgrade

專門的 `uds upgrade` 命令能夠：
- 偵測專案中的當前 UDS 版本
- 識別所需的遷移步驟
- 執行具有回滾能力的遷移
- 驗證成功升級

---

## User Stories / 使用者故事

### US-1: Automatic Version Detection

```
As a developer with a UDS v3.x project,
I want to run `uds upgrade` without specifying versions,
So that the CLI automatically detects my current version and upgrades to the latest.

作為有 UDS v3.x 專案的開發者，
我想要執行 `uds upgrade` 而不指定版本，
讓 CLI 自動偵測我的當前版本並升級到最新版。
```

### US-2: Safe Migration with Rollback

```
As a developer upgrading a production project,
I want the upgrade process to create backups,
So that I can rollback if something goes wrong.

作為升級生產專案的開發者，
我想要升級過程建立備份，
以便在出錯時可以回滾。
```

### US-3: Selective Upgrade

```
As a developer with custom configurations,
I want to preview migration changes before applying,
So that I can selectively approve or skip certain migrations.

作為有自訂配置的開發者，
我想要在套用前預覽遷移變更，
以便選擇性地批准或跳過某些遷移。
```

### US-4: Multi-Version Jump

```
As a developer upgrading from v2.x to v5.x,
I want the CLI to chain all required migrations,
So that I don't need to upgrade through each intermediate version.

作為從 v2.x 升級到 v5.x 的開發者，
我想要 CLI 串聯所有必需的遷移，
讓我不需要逐一升級每個中間版本。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Version Detection

**Given** a project directory with existing UDS files
**When** I run `uds upgrade --dry-run`
**Then** the CLI outputs:
- Current detected version
- Target version (latest or specified)
- List of required migrations

### AC-2: Backup Creation

**Given** I run `uds upgrade`
**When** migration starts
**Then**:
- A backup is created at `.uds-backup-{timestamp}/`
- Backup includes: `.uds/`, `.claude/`, `manifest.json`
- Backup path is displayed to user

### AC-3: Migration Execution

**Given** valid migration path exists
**When** I run `uds upgrade`
**Then**:
- Each migration step displays progress
- File moves are logged
- Configuration transforms are logged
- Final success message shows summary

### AC-4: Rollback Capability

**Given** a failed or interrupted upgrade
**When** I run `uds upgrade --rollback`
**Then**:
- Latest backup is detected
- All changes are reverted
- Project returns to pre-upgrade state

### AC-5: Interactive Mode

**Given** I run `uds upgrade --interactive`
**When** migrations are presented
**Then**:
- Each migration is shown with description
- User can approve/skip each migration
- Skipped migrations are logged

### AC-6: Version Targeting

**Given** I run `uds upgrade --to 4.2.0`
**When** current version is 3.5.0
**Then**:
- Only migrations up to v4.2.0 are applied
- Partial upgrade is supported

---

## Technical Design / 技術設計

### Migration Registry / 遷移註冊表

```javascript
// migrations/index.js
export const migrations = [
  {
    from: '3.x',
    to: '4.0.0',
    description: 'Migrate to new manifest schema',
    execute: migrateManifestV4,
    rollback: rollbackManifestV4,
  },
  {
    from: '4.0.x',
    to: '4.1.0',
    description: 'Add agent system support',
    execute: migrateAgentsV41,
    rollback: rollbackAgentsV41,
  },
  // ...
];
```

### File Structure / 檔案結構

```
cli/src/
├── commands/
│   └── upgrade.js           # uds upgrade command
├── utils/
│   └── migrator.js          # Migration engine
└── migrations/
    ├── index.js             # Migration registry
    ├── v3-to-v4.js          # v3 → v4 migrations
    ├── v4.0-to-v4.1.js      # v4.0 → v4.1 migrations
    └── v4.1-to-v4.2.js      # v4.1 → v4.2 migrations
```

### CLI Interface / CLI 介面

```bash
# Basic upgrade (auto-detect version, upgrade to latest)
uds upgrade

# Dry run (preview changes)
uds upgrade --dry-run

# Interactive mode
uds upgrade --interactive

# Target specific version
uds upgrade --to 4.2.0

# Rollback last upgrade
uds upgrade --rollback

# Force upgrade (skip confirmations)
uds upgrade --force
```

### Version Detection Logic / 版本偵測邏輯

```javascript
function detectVersion(projectDir) {
  // Check package.json devDependencies
  const pkg = readPackageJson(projectDir);
  if (pkg?.devDependencies?.['@anthropic/uds']) {
    return pkg.devDependencies['@anthropic/uds'];
  }

  // Check manifest.json
  const manifest = readManifest(projectDir);
  if (manifest?.version) {
    return manifest.version;
  }

  // Check legacy indicators
  if (existsSync('.uds/')) {
    return detectLegacyVersion(projectDir);
  }

  return null; // Not a UDS project
}
```

---

## Migration Examples / 遷移範例

### v3.x → v4.0.0

| Change | Migration |
|--------|-----------|
| `.uds.json` → `.uds/manifest.json` | File move + schema transform |
| `standards/` → `.uds/standards/` | Directory move |
| CLI config format | JSON → YAML transform |

### v4.0.x → v4.1.0

| Change | Migration |
|--------|-----------|
| Add `.claude/agents/` | Create directory |
| Add `.claude/workflows/` | Create directory |
| Manifest schema v1.1 | Add `agents` and `workflows` fields |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Mandatory backup before migration |
| Incompatible custom configs | Medium | Interactive mode for review |
| Network dependency for version check | Low | Offline mode with cached registry |

---

## Out of Scope / 範圍外

- Automatic dependency updates in `package.json`
- Git commit creation after upgrade
- CI/CD pipeline updates
- IDE configuration migration

---

## Sync Checklist

### Starting from CLI Command
- [ ] Update shared manifest schema if needed
- [ ] Update error handling for new errors
- [ ] Update translations (zh-TW, zh-CN)
- [ ] Add CLI test cases

---

## References / 參考資料

- [Manifest Schema](../shared/manifest-schema.md)
- [Error Handling](../shared/error-handling.md)
- [npm Release Workflow](../publishing/npm-release.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
