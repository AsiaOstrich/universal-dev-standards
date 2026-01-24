# Feature: UI Language Consistency Across All Commands

## Overview | 概述

Ensure all UDS CLI commands display output in the language corresponding to the project's `commit_language` setting, unless explicitly overridden with the `--ui-lang` flag.

確保所有 UDS CLI 命令根據專案的 `commit_language` 設定顯示對應的 UI 語言，除非使用 `--ui-lang` 明確指定。

## Status | 狀態

**State**: Draft
**Created**: 2026-01-19
**Author**: AI Assistant

---

## Requirements | 需求

| ID | Requirement | 說明 | Priority |
|----|-------------|------|----------|
| REQ-001 | All commands read `manifest.options.commit_language` | 所有命令讀取專案的語言設定 | High |
| REQ-002 | Language mapping follows standard convention | 語言映射遵循標準慣例 | High |
| REQ-003 | `--ui-lang` flag takes precedence | CLI 參數優先於專案設定 | High |
| REQ-004 | Commands without manifest use default language | 無 manifest 時使用預設語言 | Medium |

### Language Mapping | 語言映射

| commit_language | UI Language |
|-----------------|-------------|
| `traditional-chinese` | `zh-tw` |
| `simplified-chinese` | `zh-cn` |
| `english` | `en` |
| `bilingual` | `en` |

---

## Current State Analysis | 現況分析

### ✅ Correctly Implemented | 已正確實作

| Command | File | Notes |
|---------|------|-------|
| `configure` | `cli/src/commands/configure.js:74-85` | Reference implementation |
| `update` | `cli/src/commands/update.js:145-156` | Reference implementation |

### ❌ Needs Modification | 需要修改

| Command | File | Current Issue |
|---------|------|---------------|
| `list` | `cli/src/commands/list.js` | Uses `getLanguage()` without setting; doesn't read manifest |
| `check` | `cli/src/commands/check.js` | Uses `getLanguage()` without setting; missing language setup |
| `skills` | `cli/src/commands/skills.js` | Doesn't read manifest; no language setting |

### ⚠️ Special Case | 特殊情況

| Command | File | Reason |
|---------|------|--------|
| `init` | `cli/src/commands/init.js` | Creates manifest (doesn't read it); relies on CLI flag |

---

## Technical Design | 技術設計

### Implementation Pattern | 實作模式

All commands should follow this pattern after checking initialization:

```javascript
// 1. Import required functions
import { t, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
import { readManifest, isInitialized } from '../utils/copier.js';

// 2. In command function, after reading manifest:
export async function commandName(options) {
  const projectPath = process.cwd();

  // Check initialization (use default language for error message)
  if (!isInitialized(projectPath)) {
    const common = t().commands.common;
    console.log(chalk.red(common.notInitialized));
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    const common = t().commands.common;
    console.log(chalk.red(common.couldNotReadManifest));
    return;
  }

  // Set UI language based on commit_language setting
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet()) {
    const langMap = {
      'traditional-chinese': 'zh-tw',
      'simplified-chinese': 'zh-cn',
      english: 'en',
      bilingual: 'en'
    };
    const uiLang = langMap[manifest.options?.commit_language] || 'en';
    setLanguage(uiLang);
  }

  // NOW get localized messages
  const msg = t().commands.commandName;
  // ... rest of command logic
}
```

---

## Implementation Plan | 實作計畫

### 1. Modify `list.js`

**File**: `cli/src/commands/list.js`

Changes:
1. Add imports: `setLanguage`, `isLanguageExplicitlySet`, `readManifest`, `isInitialized`
2. In `listCommand()`:
   - Check if initialized
   - Read manifest
   - Apply language setting logic
   - Then use `t()` for messages

### 2. Modify `check.js`

**File**: `cli/src/commands/check.js`

Changes:
1. Add imports: `setLanguage`, `isLanguageExplicitlySet`
2. In `checkCommand()` (after line 76 where manifest is read):
   - Apply language setting logic before using `t()`

### 3. Modify `skills.js`

**File**: `cli/src/commands/skills.js`

Changes:
1. Add imports: `setLanguage`, `isLanguageExplicitlySet`, `readManifest`, `isInitialized`
2. In `skillsCommand()`:
   - Check if initialized (graceful fallback for non-initialized projects)
   - Read manifest if available
   - Apply language setting logic
   - Then use `t()` for messages

---

## Files to Modify | 要修改的檔案

| File | Changes | Priority |
|------|---------|----------|
| `cli/src/commands/list.js` | Add language setting logic | High |
| `cli/src/commands/check.js` | Add language setting logic | High |
| `cli/src/commands/skills.js` | Add language setting logic | High |
| `cli/tests/e2e/list-flow.test.js` | Add `--ui-lang` tests | Medium |
| `cli/tests/e2e/check-flow.test.js` | Verify existing tests | Medium |
| `cli/tests/e2e/skills-flow.test.js` | Add `--ui-lang` tests | Medium |

---

## Test Plan | 測試計畫

### Unit Tests

- [ ] Verify `list.js` respects `commit_language` setting
- [ ] Verify `check.js` respects `commit_language` setting
- [ ] Verify `skills.js` respects `commit_language` setting

### E2E Tests

For each modified command:

```bash
# Test 1: Default behavior (no --ui-lang flag)
# In a project with traditional-chinese setting:
uds list     # Should display Traditional Chinese UI
uds check    # Should display Traditional Chinese UI
uds skills   # Should display Traditional Chinese UI

# Test 2: --ui-lang flag overrides project setting
uds list --ui-lang en     # Should display English UI
uds check --ui-lang en    # Should display English UI
uds skills --ui-lang en   # Should display English UI

# Test 3: Non-initialized project uses default language
# In a non-initialized project:
uds list     # Should display English UI (default)
uds check    # Should display English UI (default)
uds skills   # Should display English UI (default)
```

### Verification Commands

```bash
# Run all tests
cd cli && npm test

# Lint check
npm run lint

# Manual verification
node cli/bin/uds.js list              # Test in zh-tw project
node cli/bin/uds.js list --ui-lang en # Override to English
```

---

## Rollout Plan | 部署計畫

1. **Development**: Implement changes to all three commands
2. **Testing**: Run full test suite + manual verification
3. **Review**: Code review for consistency
4. **Release**: Include in next patch release

---

## Acceptance Criteria | 驗收標準

- [ ] All commands (`list`, `check`, `skills`) read `manifest.options.commit_language`
- [ ] All commands respect `--ui-lang` flag when explicitly set
- [ ] All existing tests pass (501 tests)
- [ ] New E2E tests added for `--ui-lang` flag
- [ ] Lint passes with no errors or warnings
- [ ] Manual verification passes for all three language scenarios
