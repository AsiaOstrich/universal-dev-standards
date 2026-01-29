# [SPEC-RULES-00] Rules Command Overview / Rules 命令概覽

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: CLI-RULES-001
**Dependencies**: [SPEC-CASCADE-01 Cascading Config]

---

## Summary / 摘要

The `uds rules` command provides a unified interface for managing development rules across the project. It allows users to list, enable, disable, and customize rules that govern code quality, commit formats, testing requirements, and more.

`uds rules` 命令提供統一介面來管理專案中的開發規則。它允許使用者列出、啟用、停用和自訂控制程式碼品質、提交格式、測試需求等的規則。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Hidden Rules**: Users don't know what rules UDS enforces
2. **All-or-Nothing**: Can't selectively enable/disable rules
3. **No Customization**: Can't adjust rule severity or parameters
4. **Scattered Configuration**: Rules defined in multiple places

### Solution / 解決方案

A dedicated `uds rules` command that:
- Lists all available rules with descriptions
- Allows enabling/disabling individual rules
- Supports rule configuration (severity, parameters)
- Integrates with cascading configuration

---

## User Stories / 使用者故事

### US-1: Rule Discovery

```
As a developer new to UDS,
I want to see all available rules,
So that I understand what UDS can enforce.

作為 UDS 新手開發者，
我想要查看所有可用規則，
讓我了解 UDS 可以強制執行什麼。
```

### US-2: Selective Enforcement

```
As a project lead with legacy code,
I want to disable certain rules temporarily,
So that we can adopt UDS gradually.

作為有舊程式碼的專案負責人，
我想要暫時停用某些規則，
讓我們可以逐步採用 UDS。
```

### US-3: Rule Customization

```
As a team with specific conventions,
I want to customize rule parameters,
So that rules match our existing practices.

作為有特定慣例的團隊，
我想要自訂規則參數，
讓規則符合我們現有的做法。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Rule Listing

**Given** I run `uds rules list`
**When** the command executes
**Then** output shows all rules:

```
Rules (12 total, 10 enabled):

Commit Rules
  ✓ commit-format       Conventional commits format        enabled
  ✓ commit-scope        Require scope in commits           enabled
  ○ commit-sign-off     Require sign-off line              disabled

Testing Rules
  ✓ test-required       Tests required for features        enabled
  ✓ test-coverage       Minimum coverage threshold         enabled (80%)

Code Quality Rules
  ✓ no-console-log      No console.log in production       enabled
  ✓ no-todo-comments    No TODO without issue link         enabled
```

### AC-2: Rule Toggle

**Given** I run `uds rules enable commit-sign-off`
**When** the command executes
**Then**:
- Rule is enabled in project config
- Confirmation message displayed
- Future `uds check` includes this rule

**Given** I run `uds rules disable no-console-log`
**When** the command executes
**Then**:
- Rule is disabled in project config
- Confirmation message displayed

### AC-3: Rule Configuration

**Given** I run `uds rules configure test-coverage --min 70`
**When** the command executes
**Then**:
- Rule parameter is saved
- Confirmation shows new value

**Given** I run `uds rules configure commit-format --pattern "type: subject"`
**When** the command executes
**Then**:
- Custom pattern is saved and used

### AC-4: Rule Info

**Given** I run `uds rules info commit-format`
**When** the command executes
**Then** output shows:

```
Rule: commit-format
Category: Commit
Status: enabled
Severity: error

Description:
  Enforces conventional commits format: type(scope): subject

Parameters:
  types: feat, fix, docs, chore, test, refactor, style
  require-scope: false
  max-subject-length: 72

Examples:
  ✓ feat(auth): add login button
  ✓ fix: resolve null pointer
  ✗ Added new feature
  ✗ FEAT: uppercase not allowed
```

### AC-5: Severity Levels

**Given** I run `uds rules configure commit-format --severity warn`
**When** the command executes
**Then**:
- Rule violations produce warnings instead of errors
- CI/CD still passes with warnings

| Severity | Behavior |
|----------|----------|
| `error` | Blocks operation (default) |
| `warn` | Shows warning, continues |
| `info` | Informational only |
| `off` | Disabled |

### AC-6: Rule Categories

**Given** rules are organized by category
**When** I run `uds rules list --category commit`
**Then** only commit-related rules are shown

| Category | Rules |
|----------|-------|
| `commit` | commit-format, commit-scope, commit-sign-off |
| `testing` | test-required, test-coverage, test-naming |
| `code` | no-console-log, no-todo-comments, no-debug |
| `security` | no-secrets, no-unsafe-code, dependency-audit |
| `documentation` | readme-required, api-docs |

---

## Technical Design / 技術設計

### Rule Definition / 規則定義

```javascript
// rules/commit-format.js
export default {
  id: 'commit-format',
  name: 'Commit Format',
  category: 'commit',
  severity: 'error',
  description: 'Enforces conventional commits format',

  parameters: {
    types: {
      type: 'array',
      default: ['feat', 'fix', 'docs', 'chore', 'test', 'refactor', 'style'],
      description: 'Allowed commit types',
    },
    'require-scope': {
      type: 'boolean',
      default: false,
      description: 'Require scope in parentheses',
    },
  },

  check(context, params) {
    const { commitMessage } = context;
    const pattern = buildPattern(params);
    if (!pattern.test(commitMessage)) {
      return {
        valid: false,
        message: `Commit message does not match format: ${params.types.join('|')}(scope): subject`,
      };
    }
    return { valid: true };
  },
};
```

### Configuration Storage / 配置儲存

```yaml
# .uds/config.yaml
rules:
  commit-format:
    enabled: true
    severity: error
    params:
      types: [feat, fix, docs, chore]
      require-scope: true

  test-coverage:
    enabled: true
    severity: warn
    params:
      min: 70

  no-console-log:
    enabled: false
```

### CLI Commands / CLI 命令

```bash
# List all rules
uds rules list
uds rules list --category commit
uds rules list --enabled
uds rules list --disabled

# Toggle rules
uds rules enable <rule-id>
uds rules disable <rule-id>

# Configure rules
uds rules configure <rule-id> --param value
uds rules configure test-coverage --min 80
uds rules configure commit-format --severity warn

# Rule information
uds rules info <rule-id>

# Reset to defaults
uds rules reset <rule-id>
uds rules reset --all
```

### File Structure / 檔案結構

```
cli/src/
├── commands/
│   └── rules.js              # uds rules command
├── rules/
│   ├── index.js              # Rule registry
│   ├── commit-format.js
│   ├── commit-scope.js
│   ├── test-required.js
│   ├── test-coverage.js
│   └── no-console-log.js
└── utils/
    └── rule-engine.js        # Rule execution engine
```

---

## Built-in Rules / 內建規則

### Commit Rules

| Rule ID | Description | Default |
|---------|-------------|---------|
| `commit-format` | Conventional commits format | enabled |
| `commit-scope` | Require scope | disabled |
| `commit-sign-off` | Require DCO sign-off | disabled |
| `commit-ticket` | Require ticket reference | disabled |

### Testing Rules

| Rule ID | Description | Default |
|---------|-------------|---------|
| `test-required` | Tests required for features | enabled |
| `test-coverage` | Minimum coverage | enabled (80%) |
| `test-naming` | Test naming convention | enabled |

### Code Quality Rules

| Rule ID | Description | Default |
|---------|-------------|---------|
| `no-console-log` | No console.log | enabled |
| `no-todo-comments` | No TODO without link | disabled |
| `no-debug` | No debugger statements | enabled |

### Security Rules

| Rule ID | Description | Default |
|---------|-------------|---------|
| `no-secrets` | No hardcoded secrets | enabled |
| `no-unsafe-code` | No unsafe code patterns | enabled |
| `dependency-audit` | Check vulnerable deps | enabled |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Too many rules overwhelm users | Medium | Good defaults, categories |
| Rule conflicts | Low | Conflict detection |
| Performance with many rules | Low | Lazy loading |

---

## Out of Scope / 範圍外

- Custom rule creation (future enhancement)
- Rule sharing between projects
- IDE integration for rule hints
- Auto-fix for rule violations

---

## Sync Checklist

### Starting from CLI Command
- [ ] Create `rules.js` command
- [ ] Create rule engine utility
- [ ] Define built-in rules
- [ ] Integrate with cascading config
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Cascading Config Spec](../system/cascading-config.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
