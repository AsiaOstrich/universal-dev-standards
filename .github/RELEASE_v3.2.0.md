# v3.2.0 - Claude Code Plugin Marketplace Support

## 🎉 New Features

### Plugin Marketplace Distribution
Users can now install all 14 skills with a single command through the Claude Code Plugin Marketplace!

**Installation:**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**Benefits:**
- ✅ Single-command installation
- ✅ Automatic updates when new versions are released
- ✅ All 14 skills loaded instantly
- ✅ No manual git clone required

---

## 📦 What's Included

### Plugin Configuration
- `.claude-plugin/plugin.json` - Plugin manifest with metadata
- `.claude-plugin/marketplace.json` - Marketplace distribution configuration
- `.claude-plugin/README.md` - Plugin documentation and maintenance guide

### Documentation Updates
- Updated installation instructions in README.md (English, 繁體中文, 简体中文)
- Added Method 1: Plugin Marketplace (Recommended)
- Maintained backward compatibility with script installation

### 14 Comprehensive Skills
- ai-collaboration-standards
- changelog-guide
- code-review-assistant
- commit-standards
- documentation-guide
- error-code-guide
- git-workflow-guide
- logging-guide
- project-structure-guide
- release-standards
- requirement-assistant
- spec-driven-dev
- test-coverage-assistant
- testing-guide

---

## 🔄 Changes Since v3.1.0

### Added
- **Plugin Marketplace Support**: Enable distribution via Claude Code Plugin Marketplace
- Plugin configuration files (`.claude-plugin/`)
- Method 1: Marketplace Installation in all README versions

### Changed
- Add conversation language requirement (Traditional Chinese) to CLAUDE.md for AI assistants
- Update all README versions (EN, zh-TW, zh-CN) with Plugin installation methods

### Fixed
- CLI version reading now uses package.json instead of hardcoded value

---

## 🌐 Multi-language Support

All three language versions now document:
- Plugin Marketplace as the recommended installation method
- Complete benefits and feature list
- Alternative script installation options

**Supported Languages:**
- 🇬🇧 English
- 🇹🇼 繁體中文 (Traditional Chinese)
- 🇨🇳 简体中文 (Simplified Chinese)

---

## 📊 Statistics

- **Total Commits**: 4
- **Files Updated**: 9
- **Supported Languages**: 3
- **Skills Count**: 14
- **Test Pass Rate**: 100% (68/68 tests)

---

## 🔗 Links

- **Plugin Marketplace**: AsiaOstrich/universal-dev-standards
- **Documentation**: [skills/claude-code/README.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/claude-code/README.md)
- **Changelog**: [CHANGELOG.md#320](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/CHANGELOG.md#320---2026-01-02)

---

## 💡 Migration Guide

### For New Users
Use the Plugin Marketplace (recommended):
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### For Existing Users
If you previously installed via script, the Plugin Marketplace installation will work alongside your existing installation. Project-level skills (`.claude/skills/`) take precedence over global skills.

---

**Full Changelog**: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.1.0...v3.2.0
