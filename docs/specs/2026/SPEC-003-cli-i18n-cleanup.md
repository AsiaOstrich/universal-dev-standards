# SPEC-003: CLI Prompt Internationalization Cleanup

> **Status**: Implemented
> **Author**: Architect Agent
> **Date**: 2026-01-30
> **Implemented**: 2026-01-30

## 1. Objective

Clean up CLI prompt options to strictly follow the selected `displayLanguage`. Currently, some prompts (e.g., Content Mode) display bilingual or mixed-language options even after the user has explicitly selected a language.

## 2. Problem Statement

When running `uds init`:
1. User selects language (e.g., "繁體中文").
2. Subsequent prompts like "Select content mode" show mixed options:
   - `Standard (推薦) - ...`
   - `Full Embed - ...`

Since the display language is already determined at the start of the flow, all subsequent options should be localized to that single language to provide a cleaner, more professional UI.

## 3. Proposed Changes

### 3.1 `cli/src/prompts/init.js`

Refactor prompt functions to accept `displayLanguage` (or use the globally set language) and return localized choice objects.

**Target Prompts:**
- `promptContentMode`
- `promptLevel`
- `promptFormat`
- `promptStandardsScope`
- `promptSkillsInstallLocation`

### 3.2 Implementation Strategy

Instead of static array definitions for choices, use functions that generate choices based on the current locale.

```javascript
// Before
choices: [
  { name: 'Standard (recommended) ...', value: 'index' }
]

// After
const t = getMessages(displayLanguage);
choices: [
  { name: t.prompts.contentMode.standard, value: 'index' }
]
```

## 4. Verification

- Run `uds init` with English -> Verify all options are pure English.
- Run `uds init` with Traditional Chinese -> Verify all options are pure Traditional Chinese.
