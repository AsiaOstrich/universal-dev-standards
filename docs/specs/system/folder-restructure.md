# [SPEC-RESTRUCTURE-01] Folder Restructure / 資料夾重構

**Priority**: P2
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-RESTRUCTURE-001
**Dependencies**: [SPEC-UPGRADE-00 UDS Upgrade Command]

---

## Summary / 摘要

The Folder Restructure specification defines a cleaner, more intuitive directory structure for UDS. It consolidates related files, improves discoverability, and establishes naming conventions that scale with the project's growth.

資料夾重構規格定義 UDS 更清晰、更直觀的目錄結構。它整合相關檔案、改善可發現性，並建立隨專案成長可擴展的命名慣例。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Scattered Files**: Related files spread across multiple directories
2. **Confusing Names**: Some directory names are unclear (e.g., `skills/`)
3. **Deep Nesting**: Some paths are unnecessarily deep
4. **Inconsistent Patterns**: Different areas follow different conventions

### Solution / 解決方案

A restructured directory layout that:
- Groups related files logically
- Uses consistent, descriptive naming
- Reduces unnecessary nesting
- Scales for future additions

---

## Acceptance Criteria / 驗收條件

### AC-1: Proposed New Structure

**Given** the current structure is reorganized
**When** the restructure is complete
**Then** the new structure is:

```
universal-dev-standards/
├── README.md
├── CLAUDE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
│
├── standards/                    # (was: core/)
│   ├── commit-message-guide.md
│   ├── testing-standards.md
│   ├── code-review-checklist.md
│   └── ...
│
├── ai/                           # (was: skills/)
│   ├── agents/                   # AI agent definitions
│   │   ├── README.md
│   │   ├── code-architect.md
│   │   └── ...
│   ├── workflows/                # Workflow definitions
│   │   ├── README.md
│   │   ├── feature-dev.workflow.yaml
│   │   └── ...
│   └── skills/                   # Skill definitions
│       ├── README.md
│       ├── commit-standards/
│       └── ...
│
├── cli/                          # CLI tool (unchanged)
│   ├── src/
│   ├── tests/
│   └── package.json
│
├── integrations/                 # (unchanged)
│   ├── claude-code/
│   ├── cursor/
│   └── ...
│
├── locales/                      # (unchanged)
│   ├── zh-TW/
│   └── zh-CN/
│
├── docs/                         # Documentation
│   ├── specs/                    # Specifications
│   ├── guides/                   # (was: adoption/)
│   │   ├── quick-start.md
│   │   ├── enterprise.md
│   │   └── checklists/
│   ├── api/                      # API documentation
│   └── internal/                 # Internal docs
│
├── templates/                    # (unchanged)
│
└── scripts/                      # (unchanged)
```

### AC-2: Naming Conventions

**Given** directories and files are named
**When** conventions are applied
**Then** these rules are followed:

| Convention | Rule | Example |
|------------|------|---------|
| Directories | lowercase, kebab-case | `code-review/`, `test-helpers/` |
| Standards | lowercase, kebab-case, descriptive | `commit-message-guide.md` |
| Agents | lowercase, kebab-case | `code-architect.md` |
| Workflows | kebab-case with `.workflow.yaml` | `feature-dev.workflow.yaml` |
| Skills | kebab-case directories | `commit-standards/` |

### AC-3: Migration Path

**Given** users have existing UDS installations
**When** they upgrade
**Then** migration is handled:

| Old Path | New Path | Migration |
|----------|----------|-----------|
| `core/` | `standards/` | Symlink + redirect |
| `skills/` | `ai/` | Symlink + redirect |
| `adoption/` | `docs/guides/` | Symlink + redirect |

### AC-4: Backward Compatibility

**Given** external references to old paths
**When** restructure is complete
**Then**:
- Symlinks maintained for 2 major versions
- Deprecation warnings logged
- Documentation updated

### AC-5: CLI Path Updates

**Given** CLI references file paths
**When** restructure is complete
**Then**:
- Config file `standards-registry.json` updated
- Path resolution updated in all commands
- Tests updated to new paths

---

## Technical Design / 技術設計

### Migration Script / 遷移腳本

```bash
#!/bin/bash
# scripts/restructure-migrate.sh

# Create new directories
mkdir -p standards ai/{agents,workflows,skills} docs/{specs,guides,api,internal}

# Move files
mv core/* standards/
mv skills/agents/* ai/agents/
mv skills/workflows/* ai/workflows/
mv skills/* ai/skills/
mv adoption/* docs/guides/

# Create backward-compatible symlinks
ln -s standards core
ln -s ai skills
ln -s docs/guides adoption

echo "Restructure complete. Symlinks created for backward compatibility."
```

### CLI Configuration / CLI 配置

```javascript
// cli/src/config/paths.js
export const paths = {
  standards: 'standards/',      // was: core/
  agents: 'ai/agents/',         // was: skills/agents/
  workflows: 'ai/workflows/',   // was: skills/workflows/
  skills: 'ai/skills/',         // was: skills/
  guides: 'docs/guides/',       // was: adoption/

  // Deprecated paths (for compatibility)
  deprecated: {
    core: 'standards/',
    'skills': 'ai/',
    adoption: 'docs/guides/',
  },
};

export function resolvePath(requestedPath) {
  // Check if using deprecated path
  for (const [old, newPath] of Object.entries(paths.deprecated)) {
    if (requestedPath.startsWith(old)) {
      console.warn(`Deprecated path: ${old} → ${newPath}`);
      return requestedPath.replace(old, newPath);
    }
  }
  return requestedPath;
}
```

### Timeline / 時程

| Phase | Version | Actions |
|-------|---------|---------|
| Phase 1 | v5.0.0 | Implement new structure, create symlinks |
| Phase 2 | v5.x.x | Log deprecation warnings for old paths |
| Phase 3 | v6.0.0 | Remove symlinks, update all references |

---

## Before/After Comparison / 前後比較

### Current (Before) / 現行結構

```
universal-dev-standards/
├── core/                         # Standards (23 files)
├── skills/
│   └── claude-code/              # Deep nesting
│       ├── agents/
│       ├── workflows/
│       └── {25 skill directories}
├── adoption/                     # Adoption guides
├── templates/
├── integrations/
├── locales/
├── cli/
└── docs/
    └── specs/
```

### Proposed (After) / 建議結構

```
universal-dev-standards/
├── standards/                    # Clearer name
├── ai/                           # Consolidated AI content
│   ├── agents/
│   ├── workflows/
│   └── skills/
├── docs/
│   ├── specs/
│   ├── guides/                   # Was: adoption/
│   ├── api/
│   └── internal/
├── integrations/
├── locales/
├── cli/
├── templates/
└── scripts/
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking external links | High | Symlinks, redirects |
| User confusion | Medium | Clear migration guide |
| CI/CD breaks | Medium | Update automation first |

---

## Out of Scope / 範圍外

- Package structure changes
- CLI command renaming
- API endpoint changes
- Database schema changes

---

## Sync Checklist

### Starting from System Spec
- [ ] Create migration script
- [ ] Update CLI path configuration
- [ ] Update standards-registry.json
- [ ] Update all documentation
- [ ] Update CI/CD pipelines
- [ ] Create migration guide

---

## References / 參考資料

- [Upgrade Command Spec](../cli/upgrade/00-upgrade-overview.md)
- [Node.js Project Structure](https://github.com/nodejs/node)
- [Conventional Directory Layout](https://github.com/kriasoft/Folder-Structure-Conventions)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
