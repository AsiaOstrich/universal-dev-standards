# v3.2.1-beta.1 - Bug Fixes & Marketplace Support (Beta)

> ⚠️ **Beta Release**: This is a beta version for testing. Please report any issues before the stable release.

## 🐛 Bug Fixes

### CLI: Fixed Critical Issues

1. **Wildcard Path Handling**
   - Fixed 404 errors when downloading requirement templates
   - Replaced `templates/requirement-*.md` wildcard with explicit file paths:
     - `requirement-checklist.md`
     - `requirement-template.md`
     - `requirement-document-template.md`

2. **Process Hanging Issue**
   - Fixed CLI not exiting after `uds init`, `uds configure`, and `uds update` commands
   - Added explicit `process.exit(0)` to prevent inquirer readline interface blocking

## ✨ Enhancements

### CLI: Plugin Marketplace Support

- **New Installation Option**: "Plugin Marketplace (推薦)" in Skills installation prompt
- **Smart Tracking**: CLI now recognizes and tracks marketplace-installed Skills without attempting local installation
- **Status Display**: `uds check` command now displays marketplace installation status
- **Seamless Integration**: Full support for all three installation methods:
  - Plugin Marketplace (recommended)
  - User Level (`~/.claude/skills/`)
  - Project Level (`.claude/skills/`)

## 📊 Testing

- ✅ All 68 unit tests passing
- ✅ ESLint checks passing
- ✅ Version consistency verified

## 🧪 Beta Testing Checklist

Please test the following scenarios:

- [ ] Install via `npm install -g universal-dev-standards@3.2.1-beta.1`
- [ ] Run `uds init` and select "Plugin Marketplace" option
- [ ] Run `uds init` and select "User Level" option
- [ ] Run `uds init` and select "Project Level" option
- [ ] Verify no 404 errors for requirement templates
- [ ] Verify CLI exits properly after all commands
- [ ] Run `uds check` and verify status display

## 📦 Installation

### Test via npm

```bash
npm install -g universal-dev-standards@3.2.1-beta.1
```

### Test Locally

```bash
cd cli
npm install
node bin/uds.js init
```

## 🔄 Changes Since v3.2.0

| Type | Description |
|------|-------------|
| 🐛 Fix | Wildcard path handling causing 404 errors |
| 🐛 Fix | Process hanging after init/configure/update |
| ✨ Feature | Plugin Marketplace installation support |
| ✨ Feature | Marketplace status in check command |

## 📝 Files Changed

- `cli/package.json` - Version bump
- `.claude-plugin/plugin.json` - Version bump
- `.claude-plugin/marketplace.json` - Version bump
- `cli/src/commands/init.js` - Marketplace support, process.exit
- `cli/src/commands/configure.js` - process.exit
- `cli/src/commands/update.js` - process.exit
- `cli/src/commands/check.js` - Marketplace status display
- `cli/src/prompts/init.js` - Marketplace option
- `cli/standards-registry.json` - Wildcard path replacement
- `adoption/standards-registry.json` - Wildcard path replacement
- `CHANGELOG.md` - Beta release notes

## 🚀 Next Steps

After beta testing:
1. Collect feedback from beta testers
2. Address any issues found
3. Release stable v3.2.1

## 🐞 Report Issues

Please report any bugs or issues:
- GitHub Issues: https://github.com/AsiaOstrich/universal-dev-standards/issues
- Include `[v3.2.1-beta.1]` in the title

---

**Full Changelog**: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.2.0...v3.2.1-beta.1
