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
3. Question messages also show bilingual format:
   - `選擇內容模式 / Select content mode:`

Since the display language is already determined at the start of the flow, all subsequent options and question messages should be localized to that single language to provide a cleaner, more professional UI.

## 3. Implementation

### 3.1 Phase 1: Choice Labels (Completed)

Added `labels` sub-objects to translation resources in `cli/src/i18n/messages.js`:

| Block | Labels Added |
|-------|-------------|
| `contentMode.labels` | `index`, `full`, `minimal` |
| `level.labels` | `1`, `2`, `3` |
| `format.labels` | `ai`, `human`, `both` |
| `scope.labels` | `minimal`, `full` |
| `methodology.labels` | `tdd`, `bdd`, `sdd`, `atdd`, `none` |

Modified 7 prompt functions in `cli/src/prompts/init.js` to use `msg.labels.*` instead of hardcoded strings:
- `promptContentMode`
- `promptLevel`
- `promptFormat`
- `promptStandardsScope`
- `promptMethodology`
- `promptAdoptionLevel`
- `promptContentModeChange`

Added missing `methodology` object definition in zh-cn locale.

### 3.2 Phase 2: Question Messages (Completed)

Removed bilingual format from all `question` strings in `messages.js`, except for `displayLanguage` (which must remain bilingual as the user hasn't chosen a language yet).

**zh-tw questions updated:**
- `contentMode.question`: `'選擇內容模式：'`
- `level.question`: `'選擇採用等級：'`
- `format.question`: `'選擇標準格式：'`
- `scope.question`: `'選擇安裝範圍：'`
- `gitWorkflow.question`: `'選擇 Git 分支策略：'`
- `mergeStrategy.question`: `'選擇合併策略：'`
- `testLevels.question`: `'選擇測試層級：'`
- `skillsLocation.question`: `'Skills 要安裝在哪裡？'`
- `commitLanguage.question`: `'選擇 commit 訊息語言：'`
- `installMode.question`: `'選擇安裝模式：'`
- `adoptionLevelConfig.question`: `'選擇新的採用等級：'`
- `methodology.question`: `'你想使用哪種開發方法論？'`
- `manageAITools.question`: `'你想做什麼？'`
- `skillsUpdate.question`: `'你想做什麼？'`
- All `integration.*` questions

**zh-cn questions updated:**
- Same pattern as zh-tw (Simplified Chinese equivalents)

## 4. Files Modified

| File | Change Type |
|------|-------------|
| `cli/src/i18n/messages.js` | Added `labels`, updated `question` strings |
| `cli/src/prompts/init.js` | Use `msg.labels.*` for choice names |
| `cli/src/prompts/integrations.js` | No changes needed (already uses `t()`) |

## 5. Verification

- ✅ All 1173 unit tests pass
- ✅ ESLint shows no new errors
- ✅ `displayLanguage` remains bilingual (correct behavior)
- ✅ All other prompts display single-language options and questions

## 6. Design Decision

**Exception: `displayLanguage` prompt**

The first prompt (`displayLanguage`) must remain bilingual/multilingual because:
1. At that point, the user hasn't selected a language yet
2. We need to show options in multiple languages so users can identify their preferred language
3. This is the standard UX pattern for language selection screens
