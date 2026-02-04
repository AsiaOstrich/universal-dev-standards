# SPEC-005: CLI Instruction Cleanup

> **Status**: Draft
> **Author**: Architect Agent
> **Date**: 2026-01-30

## 1. Objective

Remove English navigation hints like `(Use arrow keys)` and `(Press <space> to select...)` from CLI prompts to ensure a fully localized and clean user experience.

## 2. Problem Statement

Even after localization, `inquirer` automatically appends English instructions to prompts:
- List prompts: `(Use arrow keys)`
- Checkbox prompts: `(Press <space> to select, <a> to toggle all, <i> to invert selection)`

These break the immersion for non-English users and add visual clutter.

## 3. Proposed Changes

### 3.1 Hide Default Suffixes
- Explicitly set `suffix: ''` (empty string) for all `inquirer` prompts in `cli/src/prompts/`.
- Alternatively, patch `inquirer` behavior globally if possible.

### 3.2 Standardized Hints
- **Checkbox**: Ensure `checkboxHint` is displayed in the description area (already implemented for some, verify all).
- **List**: Add a new `listHint` to `messages.js` and display it in the description area for all List prompts.

**New Hint Text (List):**
- **en**: `(Use arrow keys to select, Enter to confirm)`
- **zh-tw**: `（使用方向鍵選擇，Enter 確認）`
- **zh-cn**: `（使用方向键选择，Enter 确认）`

## 4. Implementation Plan

1.  **Update `cli/src/i18n/messages.js`**:
    - Add `listHint` to `common` or top-level messages.
2.  **Update `cli/src/prompts/init.js`**:
    - For every prompt:
        - Add `suffix: ''` to the inquirer question object.
        - `console.log` the appropriate hint (`listHint` or `checkboxHint`) before the prompt.

## 5. Verification

- Run `uds init` in Chinese.
- Verify `(Use arrow keys)` is gone.
- Verify `（使用方向鍵選擇，Enter 確認）` appears in the description.
