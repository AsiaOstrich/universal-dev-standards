# SPEC-010: Commands Installation Locale Support

> **Status**: Draft
> **Author**: AI Assistant
> **Date**: 2026-03-16
> **Issue**: [#7](https://github.com/AsiaOstrich/universal-dev-standards/issues/7)
> **Related Spec**: [SHARED-05 Skills Installation](skills-installation.md)

---

## 1. Objective

Add locale support to the slash commands installation pipeline, mirroring the existing skills locale support, so that `uds update` installs translated command files when a non-English locale is configured.

## 2. Problem Statement

### Current Behavior

- `uds update` correctly passes `locale` when installing **Skills** (SKILL.md gets translated description)
- `uds update` does **NOT** pass `locale` when installing **Commands** (slash commands always use English source)
- `.claude/skills/.manifest.json` may show `locale: "en"` even when user has configured `zh-tw`
- Translated command files exist at `locales/zh-TW/skills/commands/` but are never used

### Root Cause

| Function | File | Issue |
|----------|------|-------|
| `installSingleCommand()` | `skills-installer.js:527` | Hardcodes `COMMANDS_LOCAL_DIR` (English) |
| `installCommandsForAgent()` | `skills-installer.js:428` | No `locale` parameter |
| `installCommandsToMultipleAgents()` | `skills-installer.js:901` | No `locale` parameter |
| 3 call sites in `update.js` | `update.js:633,662,1238` | No locale passed |
| 3 call sites in `config.js` | `config.js` | No locale passed |
| 1 call site in `installers/skills-installer.js` | `installers/skills-installer.js` | No locale passed |
| 1 call site in `reconciler/plan-executor.js` | `reconciler/plan-executor.js` | No locale passed |

### Secondary Issue: Locale Fallback

When `manifest.options.display_language` is undefined (e.g., legacy manifest from older UDS versions), locale defaults to `'en'` even if `.standards/zh-tw.md` exists in the project.

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | Command installation functions accept and use `locale` parameter | P0 |
| REQ-002 | When locale is non-English and a translated command file exists, use the translated version | P0 |
| REQ-003 | When locale is non-English but no translated command file exists, fall back to English | P0 |
| REQ-004 | All call sites pass locale from `manifest.options.display_language` | P0 |
| REQ-005 | When `display_language` is missing, detect locale from `.standards/{locale}.md` file presence | P1 |

## 4. Acceptance Criteria

- **AC-1**: Given locale is `zh-TW` and `locales/zh-TW/skills/commands/bdd.md` exists, when `installCommandsForAgent` is called, then the installed `bdd.md` contains the zh-TW translated content
- **AC-2**: Given locale is `zh-TW` and `locales/zh-TW/skills/commands/commit.md` does NOT exist, when `installCommandsForAgent` is called, then the installed `commit.md` contains the English content (fallback)
- **AC-3**: Given `manifest.options.display_language` is `'zh-tw'`, when `uds update` installs commands, then locale `'zh-TW'` is passed to `installCommandsToMultipleAgents`
- **AC-4**: Given `manifest.options.display_language` is undefined but `.standards/zh-tw.md` exists, when `uds update` resolves locale, then locale `'zh-TW'` is detected as fallback
- **AC-5**: Given locale is `'en'`, when commands are installed, then behavior is identical to current (no regression)

## 5. Technical Design

### 5.1 New Function: `getLocalizedCommandsSourceDir(locale)`

**Location**: `cli/src/utils/skills-installer.js` (after `getLocalizedSkillsSourceDir`)

Mirrors `getLocalizedSkillsSourceDir` for the `commands` subdirectory:

```
bundled/locales/{locale}/skills/commands/  (npm install)
    ↓ fallback
locales/{locale}/skills/commands/          (dev environment)
    ↓ fallback
skills/commands/                           (English default)
```

### 5.2 API Changes: Add `locale` Parameter

| Function | Current Signature | New Parameter |
|----------|------------------|---------------|
| `installSingleCommand` | `(cmdName, targetDir, agent)` | `+ locale = 'en'` |
| `installCommandsForAgent` | `(agent, level, commandNames, projectPath)` | `+ locale = 'en'` |
| `installCommandsToMultipleAgents` | `(installations, commandNames, projectPath)` | `+ locale = 'en'` |

### 5.3 `installSingleCommand` Locale Logic

```
if isLocalizedLocale(locale):
  localizedPath = getLocalizedCommandsSourceDir(locale) + cmdName.md
  if exists(localizedPath):
    sourcePath = localizedPath
  else:
    sourcePath = COMMANDS_LOCAL_DIR + cmdName.md  (English fallback)
else:
  sourcePath = COMMANDS_LOCAL_DIR + cmdName.md
```

Note: Unlike skills, commands do NOT need frontmatter merging. Translated command files already contain the complete frontmatter (description, allowed-tools, etc.).

### 5.4 Call Site Updates

| File | Location | Change |
|------|----------|--------|
| `commands/update.js` | Line 633 | Add `cmdLocale` from `displayLanguageToLocale(manifest.options?.display_language)` |
| `commands/update.js` | Line 662 | Same |
| `commands/update.js` | Line 1238 | Same |
| `commands/config.js` | 3 call sites | Add locale parameter, import `displayLanguageToLocale` |
| `installers/skills-installer.js` | Line ~211 | Use `skillsConfig.locale` |
| `reconciler/plan-executor.js` | Line ~395 | Add locale from manifest |

### 5.5 New Function: `detectLocaleFromStandards(projectPath)`

**Location**: `cli/src/utils/locale.js`

Fallback detection when `manifest.options.display_language` is not set:

```javascript
// Check for .standards/{locale}.md files
// e.g., .standards/zh-tw.md → 'zh-TW'
// e.g., .standards/zh-cn.md → 'zh-CN'
// No match → null
```

### 5.6 Architecture Diagram

```
                    manifest.options.display_language
                              │
                              ▼
                   displayLanguageToLocale()
                              │
                    ┌─────────┴─────────┐
                    │ Has value?         │
                    ├── Yes ─► locale    │
                    └── No  ─► detectLocaleFromStandards()
                                        │
                              ┌─────────┴─────────┐
                              │ Found .standards/  │
                              │ {lang}.md?         │
                              ├── Yes ─► locale    │
                              └── No  ─► 'en'      │
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                    installSkillsTo...    installCommandsTo...
                    (locale ✅ 已有)      (locale ← 本次新增)
```

## 6. Test Plan

| Test | Type | Description |
|------|------|-------------|
| T-1 | Unit | `installSingleCommand` with `locale='zh-TW'` uses translated file |
| T-2 | Unit | `installSingleCommand` with `locale='zh-TW'` falls back to English when no translation |
| T-3 | Unit | `installSingleCommand` with `locale='en'` uses English (regression) |
| T-4 | Unit | `installCommandsForAgent` passes locale to `installSingleCommand` |
| T-5 | Unit | `installCommandsToMultipleAgents` passes locale through chain |
| T-6 | Unit | `detectLocaleFromStandards` returns `'zh-TW'` when `.standards/zh-tw.md` exists |
| T-7 | Unit | `detectLocaleFromStandards` returns `null` when no locale file exists |
| T-8 | Unit | `getLocalizedCommandsSourceDir` returns correct paths for each locale |

## 7. Out of Scope

- **翻譯內容補全**: 目前只有 3/34 命令有 zh-TW 翻譯。補齊翻譯是獨立工作，不在本 spec 範圍內。fallback 機制確保缺少翻譯時不會出錯。
- **Commands manifest locale 欄位**: Commands 目前沒有獨立的 manifest（使用 Skills 的 manifest）。不新增 Commands 專用 manifest。

## 8. Migration / Backward Compatibility

- 所有新參數都有預設值 `locale = 'en'`，不影響既有呼叫
- Fallback 偵測是額外層，不改變有 `display_language` 設定的專案行為
- 無 breaking changes

---

## Related Specifications

- [SHARED-05 Skills Installation](skills-installation.md) - 既有的 Skills locale 安裝機制
- [SHARED-08 i18n System](i18n-system.md) - CLI 多語系統
- [SPEC-005 CLI Hint Localization](SPEC-005-cli-hint-localization.md) - 先前的 locale 相關修復
