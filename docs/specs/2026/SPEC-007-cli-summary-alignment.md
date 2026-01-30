# SPEC-007: CLI Summary Alignment & Defaults

> **Status**: Draft
> **Author**: Architect Agent
> **Date**: 2026-01-30

## 1. Objective

Align the final configuration summary with the prompt sequence and text, and fix the default selection for Adoption Level.

## 2. Issues & Solutions

### 2.1 Configuration Summary Mismatch
- **Issue**: Summary order does not match prompt flow.
- **Issue**: Summary values show internal codes (e.g., `github-flow`, `unit-testing`) instead of localized labels.
- **Fix**:
  - Reorder `displaySummary` in `cli/src/commands/init.js` to match `init-flow.js`.
  - Use `t().[key].choices` or specific label maps to translate internal values to UI text.

### 2.2 Adoption Level Default
- **Issue**: Defaults to Level 3.
- **Fix**: Set `default: 2` (value match) in `cli/src/prompts/init.js` -> `promptLevel`.

## 3. Implementation Plan

### 3.1 Update `cli/src/commands/init.js`
- Refactor `displaySummary` to use helper functions for value mapping.
- Align display order:
  1. Display Language
  2. AI Tools
  3. Skills
  4. Standards Scope
  5. Adoption Level
  6. Standards Format
  7. Standard Options (Git, Merge, Commit, Test)
  8. Languages/Frameworks
  9. Integrations
  10. Content Mode

### 3.2 Update `cli/src/prompts/init.js`
- Change `promptLevel` default to `2`.

## 4. Verification

- Run `uds init` (zh-cn/zh-tw).
- Verify default Level is 2.
- Verify Summary matches Prompt order.
- Verify Summary values are readable (e.g., "GitHub Flow" not "github-flow").
