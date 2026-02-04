# SPEC-008: CLI Integration UX Refinement

> **Status**: Draft
> **Author**: Architect Agent
> **Date**: 2026-01-30

## 1. Objective

Refine the Integration Configuration UX by improving prompt clarity, removing English suffixes, and providing detailed configuration summaries.

## 2. Changes

### 2.1 Prompt Polish
- **Issue**: `(Press <space> to select...)` suffix appears in integration prompts.
- **Fix**: Add `suffix: ' '` to all prompts in `cli/src/prompts/integrations.js`.

### 2.2 Detailed Summary
- **Issue**: Summary only lists tools, not the configuration mode (Default/Custom/Merge).
- **Issue**: Custom mode details (selected categories) are hidden.
- **Fix**:
  - Add "Integration Config" line to summary.
  - For Custom mode, list selected rule categories.

## 3. Implementation Plan

1.  **Update `cli/src/prompts/integrations.js`**:
    - Add `suffix: ' '` to all prompts.
2.  **Update `cli/src/i18n/messages.js`**:
    - Add labels: `integrationConfigLabel`, `ruleCategoriesLabel`.
3.  **Update `cli/src/commands/init.js`**:
    - Enhance `displaySummary` to show integration mode and categories.
    - Implement `getCategoryLabel` helper using `RULE_CATEGORIES` (might need export/import adjustment).

## 4. Verification

- Run `uds init` -> Select "Custom" integration.
- Verify suffix is gone.
- Verify summary shows "Integration Config: Custom" and "Rule Categories: ...".
