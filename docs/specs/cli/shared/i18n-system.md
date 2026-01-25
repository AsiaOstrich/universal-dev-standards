# [SHARED-08] i18n System Specification / 國際化系統規格

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Status**: Approved
**Spec ID**: SHARED-08

---

## Summary

This specification defines the internationalization (i18n) message system for the UDS CLI. The system provides multi-language support for all user-facing messages, enabling seamless language switching between English (en), Traditional Chinese (zh-tw), and Simplified Chinese (zh-cn).

本規格定義 UDS CLI 的國際化訊息系統。該系統為所有使用者介面訊息提供多語言支援，實現英語 (en)、繁體中文 (zh-tw) 和簡體中文 (zh-cn) 之間的無縫切換。

---

## Motivation

### Problem Statement / 問題陳述

1. CLI tools with hardcoded English messages limit accessibility for non-English users
2. Without centralized message management, translations become fragmented and inconsistent
3. Language detection from environment variables requires standardized handling

### Solution / 解決方案

A centralized i18n system that:
- Stores all messages in a single structured `messages` object
- Provides utility functions for language detection and message retrieval
- Supports runtime language switching via `--ui-lang` flag
- Falls back gracefully when translations are missing

---

## Detailed Design

### Source File

**Location**: `cli/src/i18n/messages.js` (~2,630 lines)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        i18n Message System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DATA STRUCTURE                                                     │
│  └── messages (Object)                                              │
│       ├── en (Object)         - English messages (~900 keys)        │
│       ├── zh-tw (Object)      - Traditional Chinese messages        │
│       └── zh-cn (Object)      - Simplified Chinese messages         │
│                                                                     │
│  STATE                                                              │
│  ├── currentLang (string)     - Current language ('en' default)    │
│  └── languageExplicitlySet (boolean) - Flag from --ui-lang         │
│                                                                     │
│  API FUNCTIONS                                                      │
│  ├── setLanguage(lang)        - Set current language               │
│  ├── setLanguageExplicit(lang)- Set language from --ui-lang flag   │
│  ├── isLanguageExplicitlySet()- Check if explicitly set            │
│  ├── getLanguage()            - Get current language code          │
│  ├── t()                      - Get messages for current language  │
│  ├── msg(path)                - Get message by dot-separated path  │
│  └── detectLanguage(locale)   - Detect from env/locale             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Message Categories

The `messages` object contains the following top-level categories:

| Category | Description | Example Keys |
|----------|-------------|--------------|
| `recommended` | Common labels | `'Recommended'` |
| `advanced` | Common labels | `'Advanced'` |
| `contentMode` | Content mode prompts | `title`, `description`, `question`, `choices` |
| `level` | Adoption level prompts | `title`, `description`, `question`, `choices` |
| `format` | Standards format prompts | `title`, `description`, `choices` |
| `scope` | Standards scope prompts | `title`, `description`, `choices` |
| `gitWorkflow` | Git workflow options | `title`, `question`, `choices`, `details` |
| `mergeStrategy` | Merge strategy options | `title`, `question`, `choices` |
| `testLevels` | Test level selection | `title`, `question`, `choices`, `pyramid` |
| `aiTools` | AI tools selection | `title`, `description`, `question`, `choices` |
| `skillsLocation` | Skills installation | `title`, `question`, `choices` |
| `commandsInstallation` | Commands installation | `title`, `question`, `choices` |
| `commitLanguage` | Commit message language | `title`, `question`, `choices` |
| `methodology` | Development methodology | `title`, `question`, `choices` |
| `commands` | Command-specific messages | `common`, `list`, `skills`, `check`, `init`, `update`, `configure` |

### API Functions

#### `setLanguage(lang: string): void`

Sets the current UI language. Falls back to `'en'` if language is not supported.

```javascript
setLanguage('zh-tw');  // Sets to Traditional Chinese
setLanguage('invalid'); // Falls back to English
```

#### `setLanguageExplicit(lang: string): void`

Sets language explicitly from `--ui-lang` flag. Marks as explicitly set to prevent auto-detection override.

```javascript
setLanguageExplicit('zh-tw');
isLanguageExplicitlySet(); // returns true
```

#### `isLanguageExplicitlySet(): boolean`

Returns whether language was explicitly set by user via `--ui-lang` flag.

#### `getLanguage(): string`

Returns the current language code (`'en'`, `'zh-tw'`, or `'zh-cn'`).

#### `t(): Object`

Returns the complete messages object for the current language. Falls back to English if current language is not found.

```javascript
const messages = t();
console.log(messages.contentMode.title); // "Content Mode:"
```

#### `msg(path: string): any`

Gets a specific message by dot-separated path. Returns `undefined` if path not found.

```javascript
msg('contentMode.title');           // "Content Mode:"
msg('commands.init.title');         // "Universal Development Standards - Initialize"
msg('nonexistent.path');            // undefined
```

#### `detectLanguage(locale: string | null): string`

Detects language from locale parameter or environment variables.

**Detection Priority**:
1. Explicit `locale` parameter (`'zh-tw'`, `'zh-cn'`)
2. Environment variables: `LANG`, `LC_ALL`, `LC_MESSAGES`
3. Default: `'en'`

```javascript
detectLanguage('zh-tw');     // 'zh-tw'
detectLanguage(null);        // Checks env vars, returns 'en' if no match
```

### Language Detection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Language Detection Priority                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. --ui-lang flag provided?                                        │
│     └── YES → setLanguageExplicit(flag)                            │
│                                                                     │
│  2. locale parameter provided? (e.g., 'zh-tw')                      │
│     └── YES → return locale                                        │
│                                                                     │
│  3. Environment variables (LANG, LC_ALL, LC_MESSAGES)?              │
│     └── Contains 'zh_tw' or 'zh-tw' → return 'zh-tw'               │
│     └── Contains 'zh_cn' or 'zh-cn' → return 'zh-cn'               │
│                                                                     │
│  4. Default → return 'en'                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

### AC-1: Language Setting Switches All Messages

**Given** the i18n system is initialized with default language (English)
**When** `setLanguage('zh-tw')` is called
**Then**
  - `getLanguage()` returns `'zh-tw'`
  - `t()` returns Traditional Chinese messages object
  - All subsequent `msg()` calls return Traditional Chinese strings

### AC-2: msg() Correctly Handles Nested Path Lookup

**Given** messages are structured with nested objects
**When** `msg('commands.init.title')` is called
**Then**
  - The function traverses `messages[lang].commands.init.title`
  - Returns the correct localized string
  - Returns `undefined` for non-existent paths

### AC-3: Missing Key Returns Fallback Gracefully

**Given** a message key exists in English but not in the current language
**When** `t()` is called with a non-existent language code
**Then**
  - The system falls back to English messages object
  - No errors are thrown
  - Partial paths return `undefined` without crashing

### AC-4: detectLanguage Handles Locale Formats Correctly

**Given** various locale format inputs
**When** `detectLanguage()` is called
**Then**
  - `'zh-tw'` → returns `'zh-tw'`
  - `'zh-cn'` → returns `'zh-cn'`
  - Environment with `LANG=zh_TW.UTF-8` → returns `'zh-tw'`
  - Environment with `LANG=zh_CN.UTF-8` → returns `'zh-cn'`
  - No locale or environment → returns `'en'`

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| None | Pure JavaScript module with no external dependencies |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Medium | Low | Fallback to English |
| Large file size | Low | Low | Lazy loading consideration for future |
| Inconsistent message structure | Medium | Medium | TypeScript types in future |

---

## Related Specifications

- [SHARED-06 UI Language Consistency](ui-lang-consistency.md) - Cross-command language handling
- [DESIGN-01 UI Language Option](../design/ui-language-option.md) - `--ui-lang` flag design

---

## Implementation Notes

### File Structure

```javascript
// cli/src/i18n/messages.js

// Message data (largest part of file)
export const messages = {
  en: { /* ~900 nested keys */ },
  'zh-tw': { /* ~900 nested keys */ },
  'zh-cn': { /* ~900 nested keys */ }
};

// State (module-level)
let currentLang = 'en';
let languageExplicitlySet = false;

// API Functions
export function setLanguage(lang) { /* ... */ }
export function setLanguageExplicit(lang) { /* ... */ }
export function isLanguageExplicitlySet() { /* ... */ }
export function getLanguage() { /* ... */ }
export function t() { /* ... */ }
export function msg(path) { /* ... */ }
export function detectLanguage(locale) { /* ... */ }
```

### Usage Examples

```javascript
import { setLanguage, t, msg, detectLanguage } from './i18n/messages.js';

// At CLI startup
const detectedLang = detectLanguage(options.uiLang || null);
setLanguage(detectedLang);

// In command handlers
console.log(t().commands.init.title);
console.log(msg('commands.check.standardsInitialized'));
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
