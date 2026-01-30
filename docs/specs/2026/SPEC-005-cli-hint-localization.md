# SPEC-005: CLI Hint Localization

> **Status**: Implemented
> **Author**: Architect Agent
> **Date**: 2026-01-30
> **Implemented**: 2026-01-30

## 1. Objective

Remove inquirer's default English operation hints (e.g., "Use arrow keys..." for list, "Press space to select..." for checkbox) and replace them with localized custom hints.

## 2. Problem Statement

When running `uds init`:
1. Inquirer.js automatically appends English operation instructions after each prompt
2. For list prompts: Shows `(Use arrow keys)` in English
3. For checkbox prompts: Shows `(Press <space> to select, <a> to toggle all, <i> to invert selection)` in English

Since the CLI supports multiple languages, these hints should also be localized.

## 3. Implementation

### 3.1 Added listHint to messages.js

Added `listHint` translation strings to all three locales at the root level (same level as `checkboxHint`):

| Locale | listHint |
|--------|----------|
| en | `(Use arrow keys to select, Enter to confirm)` |
| zh-tw | `（使用方向鍵選擇，Enter 確認）` |
| zh-cn | `（使用方向键选择，Enter 确认）` |

### 3.2 Modified prompt functions in init.js

**For List-type prompts:**
- Added `suffix: ''` to hide inquirer's default hint
- Added `console.log(chalk.gray(`  ${t().listHint}`));` before the prompt

**For Checkbox-type prompts:**
- Added `instructions: false` to hide inquirer's default hint (or kept existing)
- Ensured `console.log(chalk.gray(`  ${t().checkboxHint}`));` is shown before the prompt

### 3.3 Functions Modified

| Function | Type | Changes |
|----------|------|---------|
| `promptDisplayLanguage` | List | Added suffix, listHint display |
| `promptAITools` | Checkbox | Already had instructions:false |
| `promptSkillsInstallLocation` | Checkbox | Already had instructions:false |
| `promptCommandsInstallation` | Checkbox | Already had instructions:false |
| `promptSkillsUpdate` | List | Added suffix, listHint display |
| `promptStandardsScope` | List | Added suffix, listHint display |
| `promptFormat` | List | Added suffix, listHint display |
| `promptGitWorkflow` | List | Added suffix, listHint display |
| `promptMergeStrategy` | List | Added suffix, listHint display |
| `promptCommitLanguage` | List | Added suffix, listHint display |
| `promptTestLevels` | Checkbox | Added instructions:false, checkboxHint display |
| `promptLevel` | List | Added suffix, listHint display |
| `promptLanguage` | Checkbox | Added instructions:false, checkboxHint display |
| `promptFramework` | Checkbox | Added instructions:false, checkboxHint display |
| `promptInstallMode` | List | Added suffix, listHint display |
| `promptIntegrations` | Checkbox | Added instructions:false, checkboxHint display |
| `promptContentMode` | List | Added suffix, listHint display |
| `promptManageAITools` | List + Checkbox | Added suffix/instructions:false, hints display |
| `promptAdoptionLevel` | List | Added suffix, listHint display |
| `promptContentModeChange` | List | Added suffix, listHint display |
| `promptMethodology` | List | Added suffix, listHint display |
| `promptSkillsUpgrade` | List | Added suffix, listHint display |

## 4. Files Modified

| File | Change Type |
|------|-------------|
| `cli/src/i18n/messages.js` | Added `listHint` to en, zh-tw, zh-cn |
| `cli/src/prompts/init.js` | Added suffix:'', instructions:false, and hint displays |

## 5. Verification

- ✅ All 1173 unit tests pass
- ✅ ESLint shows only pre-existing warnings (0 errors)
- ✅ List prompts show localized listHint
- ✅ Checkbox prompts show localized checkboxHint

## 6. Technical Notes

### Why `suffix: ''` instead of `instructions: false`?

- `instructions: false` only works for checkbox prompts
- `suffix: ''` works for list prompts by removing the default suffix that inquirer appends

### Why display hints before prompts?

- This approach gives us full control over the hint formatting and positioning
- We can use chalk for consistent gray styling
- The hint appears in context with other prompt information (title, description)
