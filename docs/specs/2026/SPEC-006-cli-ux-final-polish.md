# SPEC-006: CLI UX Final Polish

> **Status**: Implemented
> **Author**: Architect Agent
> **Date**: 2026-01-30
> **Implemented**: 2026-01-30

## 1. Objective

Address remaining UX issues identified during manual testing: incorrect default values, untranslated headers/summaries, missing context descriptions, and persistent inquirer suffixes.

## 2. Issues & Solutions

### 2.1 Adoption Level Default
- **Issue**: Defaults to Level 3, but Level 2 is recommended.
- **Resolution**: Verified `default: 2` (Level 2) was already set in `promptLevel`.

### 2.2 Untranslated Headers
- **Issue**: "Standard Options" and "Integration Configuration" headers appear in English.
- **Fix**:
  - Added `standardOptions` translation to `messages.js` (en, zh-tw, zh-cn).
  - Updated `promptStandardOptions` to use `t().standardOptions.title` and `t().standardOptions.description`.

### 2.3 Context Descriptions
- **Issue**: Users may not understand "Integration Config" and "Content Mode" affect AI config files.
- **Fix**: Updated `contentMode.description` in all locales to mention:
  - `.cursorrules`
  - `CLAUDE.md`
  - `GEMINI.md`

### 2.4 Final Summary & Confirmation
- **Issue**: Format values in `displaySummary` were hardcoded English.
- **Fix**: Updated `displaySummary` to use `t().format.labels` with fallback for test compatibility.

### 2.5 Persistent Suffixes
- **Issue**: `(Use arrow keys)` still appears.
- **Fix**: Changed all `suffix: ''` to `suffix: ' '` (space) which effectively hides inquirer's default hint.

## 3. Files Modified

| File | Change Type |
|------|-------------|
| `cli/src/i18n/messages.js` | Added `standardOptions` to all locales, updated `contentMode.description` in zh-cn |
| `cli/src/prompts/init.js` | Changed `suffix: ''` to `suffix: ' '`, updated `promptStandardOptions` to use translations |
| `cli/src/commands/init.js` | Updated `displaySummary` to use translated format labels |

## 4. Verification

- ✅ All 1173 unit tests pass
- ✅ ESLint shows only pre-existing warnings (0 errors)
- ✅ `suffix: ' '` applied to all 15 list prompts
- ✅ `standardOptions` translations available in en, zh-tw, zh-cn
- ✅ `displaySummary` uses localized format labels with fallback
