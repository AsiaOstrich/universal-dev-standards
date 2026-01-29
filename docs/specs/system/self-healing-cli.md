# [SPEC-HEAL-01] Self-Healing CLI / 自動修正 CLI

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-HEAL-001
**Dependencies**: [SPEC-RULES-00 Rules Command]

---

## Summary / 摘要

The Self-Healing CLI provides automatic fix capabilities when `uds check` fails. Instead of just reporting violations, `uds fix --auto` uses AI to analyze and correct issues, reducing developer friction and maintaining code quality.

自動修正 CLI 在 `uds check` 失敗時提供自動修復能力。`uds fix --auto` 不只報告違規，還使用 AI 分析和修正問題，減少開發者摩擦並維持程式碼品質。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Manual Fix Burden**: Developers must manually fix each violation
2. **Friction Creates Resistance**: Too many errors lead to disabling checks
3. **Inconsistent Fixes**: Different developers fix issues differently
4. **Time Consuming**: Simple fixes take disproportionate time

### Solution / 解決方案

An AI-powered `uds fix` command that:
- Automatically fixes common violations
- Uses AI for complex fixes when patterns don't match
- Provides preview mode for review before applying
- Learns from accepted fixes to improve suggestions

---

## User Stories / 使用者故事

### US-1: Automatic Fix

```
As a developer with multiple rule violations,
I want to run a single command to fix them all,
So that I can quickly resolve issues and continue coding.

作為有多個規則違規的開發者，
我想要執行單一命令修復所有問題，
讓我可以快速解決問題並繼續編碼。
```

### US-2: Preview Before Apply

```
As a careful developer,
I want to preview proposed fixes before applying,
So that I can verify the changes are appropriate.

作為謹慎的開發者，
我想要在套用前預覽建議的修復，
讓我可以驗證變更是否適當。
```

### US-3: Selective Fixing

```
As a developer with specific concerns,
I want to fix only certain categories of violations,
So that I can address issues incrementally.

作為有特定關注的開發者，
我想要只修復某些類別的違規，
讓我可以逐步處理問題。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Basic Auto-Fix

**Given** `uds check` reports violations
**When** I run `uds fix --auto`
**Then**:
- Each fixable violation is corrected
- Unfixable violations are reported
- Summary shows: fixed, skipped, failed

```
$ uds fix --auto

Fixing 5 violations...

✓ commit-format: Fixed in .git/COMMIT_EDITMSG
✓ no-console-log: Removed 3 console.log statements
✓ test-naming: Renamed 2 test files
⊘ no-secrets: Requires manual review (API key detected)
✗ test-coverage: Cannot auto-fix (code changes needed)

Summary: 3 fixed, 1 skipped (manual), 1 failed
```

### AC-2: Preview Mode

**Given** I run `uds fix --preview`
**When** fixes are calculated
**Then**:
- Proposed changes are shown as diffs
- User can approve/reject each fix
- No changes applied until approved

```
$ uds fix --preview

Proposed fixes:

1. no-console-log in src/utils.js
   - Line 42: console.log("debug") → (removed)
   - Line 87: console.log(data) → (removed)

   [Apply] [Skip] [Show context]

2. test-naming in tests/
   - user.test.js → user.spec.js
   - auth.test.js → auth.spec.js

   [Apply] [Skip] [Show context]
```

### AC-3: AI-Powered Fixes

**Given** a violation requires complex fixing
**When** pattern-based fix fails
**Then**:
- AI analyzes the context
- AI proposes a fix
- User approves before applying

```
$ uds fix --auto

no-todo-comments in src/auth.js:42
  TODO: Handle edge case

AI suggests replacing with:
  // TODO(#123): Handle edge case when token is expired
  // Issue: https://github.com/org/repo/issues/123

[Apply AI fix] [Edit manually] [Skip]
```

### AC-4: Category Filtering

**Given** I want to fix only specific violations
**When** I run `uds fix --category commit`
**Then** only commit-related violations are fixed

```bash
uds fix --category commit    # Only commit rules
uds fix --category testing   # Only testing rules
uds fix --rule no-console-log  # Specific rule
```

### AC-5: Dry Run

**Given** I run `uds fix --dry-run`
**When** fixes are calculated
**Then**:
- Shows what would be changed
- No actual changes made
- Exit code indicates fixable count

### AC-6: Integration with Check

**Given** I run `uds check --fix`
**When** violations are found
**Then**:
- Check runs first
- Fixable issues are auto-fixed
- Remaining issues reported

---

## Technical Design / 技術設計

### Fix Registry / 修復註冊表

```javascript
// fixes/index.js
export const fixes = {
  'no-console-log': {
    type: 'pattern',
    patterns: [
      { match: /console\.log\(.*\);?\n?/g, replace: '' },
      { match: /console\.warn\(.*\);?\n?/g, replace: '' },
    ],
  },

  'commit-format': {
    type: 'transform',
    transform: (message) => {
      // Convert "Added feature X" → "feat: add feature X"
      const match = message.match(/^Added (.+)$/i);
      if (match) {
        return `feat: add ${match[1].toLowerCase()}`;
      }
      return null; // Can't auto-fix
    },
  },

  'no-todo-comments': {
    type: 'ai',
    prompt: `
      The following TODO comment needs an issue link.
      Suggest creating an issue and linking it.
      Current: {violation}
      Context: {context}
    `,
  },
};
```

### Fix Pipeline / 修復流水線

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Fix Pipeline                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Violation                                                              │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 1. Pattern Matching                                     │           │
│   │    • Try regex-based fixes                              │           │
│   │    • Fast, deterministic                                │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (if fails)                                                     │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 2. Transform Function                                   │           │
│   │    • Apply rule-specific logic                          │           │
│   │    • Handles complex cases                              │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (if fails)                                                     │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 3. AI Analysis                                          │           │
│   │    • Send context to AI                                 │           │
│   │    • Get fix suggestion                                 │           │
│   │    • Requires user approval                             │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (if fails)                                                     │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 4. Manual Required                                      │           │
│   │    • Mark as unfixable                                  │           │
│   │    • Provide guidance                                   │           │
│   └────────────────────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### CLI Commands / CLI 命令

```bash
# Auto-fix all violations
uds fix --auto

# Preview mode
uds fix --preview

# Dry run
uds fix --dry-run

# Filter by category
uds fix --category commit
uds fix --category testing

# Filter by rule
uds fix --rule no-console-log

# Interactive mode
uds fix --interactive

# Combined with check
uds check --fix
```

### File Structure / 檔案結構

```
cli/src/
├── commands/
│   └── fix.js               # uds fix command
├── fixes/
│   ├── index.js             # Fix registry
│   ├── pattern-fixer.js     # Regex-based fixer
│   ├── transform-fixer.js   # Transform functions
│   └── ai-fixer.js          # AI-powered fixer
└── utils/
    └── diff-viewer.js       # Preview diff display
```

---

## Fixability Matrix / 可修復矩陣

| Rule | Fix Type | Auto-Fixable |
|------|----------|--------------|
| `commit-format` | Transform | Yes (simple cases) |
| `no-console-log` | Pattern | Yes |
| `no-debug` | Pattern | Yes |
| `test-naming` | Transform | Yes |
| `no-todo-comments` | AI | Needs approval |
| `test-coverage` | - | No (code changes) |
| `no-secrets` | - | No (security review) |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect auto-fix | High | Preview mode, backup before fix |
| AI hallucination | Medium | Require approval for AI fixes |
| Over-reliance on auto-fix | Low | Education, not all rules fixable |

---

## Out of Scope / 範圍外

- Machine learning from fix patterns
- Cross-project fix sharing
- IDE auto-fix integration
- Real-time fix suggestions

---

## Sync Checklist

### Starting from System Spec
- [ ] Create `fix.js` command
- [ ] Create fix registry and fixers
- [ ] Integrate with rules engine
- [ ] Update translations (zh-TW, zh-CN)
- [ ] Add AI fixer integration

---

## References / 參考資料

- [ESLint --fix](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)
- [Rules Command Spec](../cli/rules/00-rules-overview.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
