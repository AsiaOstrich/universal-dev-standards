---
source: ../../../../skills/checkin-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: c408d7d9b5ab
status: current
description: |
  引導提交前品质关卡和簽入工作流程。
  使用时机：提交程序码、准备提交、品质关卡验证。
  关鍵字：commit, checkin, pre-commit, quality gate, git add, 提交, 簽入, 品质关卡.
---

# 签入助手

> **语言**: [English](../../../../skills/checkin-assistant/guide.md) | [繁體中文](../../../zh-TW/skills/checkin-assistant/guide.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-01-12
**适用范围**：Claude Code Skills

---

## 目的

此技能引导开发人员完成提交前的质量关卡，确保每次提交都能维护代码库的稳定性并遵循最佳实践。

**注意**：此技能专注于**何时以及如何提交**。有关 PR 期间的代码审查，请参阅[代码审查助手](../code-review-assistant/SKILL.md)。

---

## 快速参考（YAML 压缩格式）

```yaml
# === CORE PHILOSOPHY ===
every_commit_should:
  - "Be a complete logical unit of work"
  - "Leave codebase in working state"
  - "Be reversible without breaking functionality"
  - "Contain its own tests (for new features)"
  - "Be understandable to future developers"

# === MANDATORY CHECKLIST ===
checklist:
  build:
    - "Code compiles (zero errors)"
    - "Dependencies satisfied"
    verify: "Run build command, exit code 0"

  tests:
    - "All existing tests pass (100%)"
    - "New code has tests"
    - "Coverage not decreased"
    verify: "Run test suite, check coverage"

  quality:
    - "Follows coding standards"
    - "No code smells (methods≤50, nesting≤3, complexity≤10)"
    - "No hardcoded secrets"
    - "No security vulnerabilities"
    verify: "Run linter, security scanner"

  docs:
    - "API docs updated"
    - "README updated (if needed)"
    - "CHANGELOG updated (user-facing changes → [Unreleased])"

  workflow:
    - "Branch naming correct (feature/, fix/, docs/, chore/)"
    - "Commit message formatted (conventional commits)"
    - "Synced with target branch"

# === NEVER COMMIT WHEN ===
blockers:
  - "Build has errors"
  - "Tests are failing"
  - "Feature incomplete (would break functionality)"
  - "Contains WIP/TODO in critical logic"
  - "Contains debugging code (console.log, print)"
  - "Contains commented-out code blocks"

# === COMMIT TIMING ===
good_times:
  - completed_unit: "Feature fully implemented with tests"
  - bug_fixed: "Bug fixed with regression test"
  - independent_refactor: "Refactoring complete, all tests pass"
  - runnable_state: "Code compiles, app can run"

bad_times:
  - "Build failures"
  - "Test failures"
  - "Incomplete features"
  - "Experimental code with scattered TODOs"

# === GRANULARITY ===
ideal_commit:
  files: "1-10 (split if >10)"
  lines: "50-300"
  scope: "Single concern"

split_rules:
  combine: ["feature + its tests", "tightly related multi-file changes"]
  separate: ["Feature A + B", "refactor + new feature", "bugfix + incidental refactor"]

# === SPECIAL SCENARIOS ===
emergency_leave:
  recommended: "git stash save 'WIP: description'"
  alternative: "Create wip/ branch"
  prohibited: "Commit WIP directly on feature branch"

experimental:
  branch: "experiment/topic-name"
  rules: "Free commits (no strict format)"
  success: "Clean up, squash, merge to feature"
  failure: "Document lessons, delete branch"

hotfix:
  branch: "hotfix/issue-name from main"
  rules: "Minimize changes, only fix the problem"
  message: "fix(scope): [URGENT] description"
```

---

## 检查清单视觉格式

每次提交前使用此检查清单：

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 PRE-COMMIT CHECKLIST                                        │
├─────────────────────────────────────────────────────────────────┤
│  🔨 BUILD                                                       │
│  □ Code compiles successfully (zero errors)                     │
│  □ All dependencies satisfied                                   │
├─────────────────────────────────────────────────────────────────┤
│  🧪 TESTS                                                       │
│  □ All existing tests pass (100%)                               │
│  □ New code has corresponding tests                             │
│  □ Test coverage not decreased                                  │
├─────────────────────────────────────────────────────────────────┤
│  ✨ CODE QUALITY                                                │
│  □ Follows project coding standards                             │
│  □ No hardcoded secrets or credentials                          │
│  □ No security vulnerabilities                                  │
├─────────────────────────────────────────────────────────────────┤
│  📝 DOCUMENTATION                                               │
│  □ API documentation updated (if applicable)                    │
│  □ CHANGELOG updated (user-facing changes)                      │
├─────────────────────────────────────────────────────────────────┤
│  🔄 WORKFLOW                                                    │
│  □ Branch naming follows convention                             │
│  □ Commit message follows conventional commits                  │
│  □ Synced with target branch (no conflicts)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 签入触发点

### 何时提示提交

| 触发条件 | 状况 | 提醒强度 |
|---------|------|----------|
| 阶段完成 | 完成一个开发阶段 | 建议 |
| 检查点 | 达到定义的检查点 | 建议 |
| 变更累积 | 文件 ≥5 或行数 ≥200 | 建议 |
| 连续跳过 | 连续跳过提交 3 次 | 警告 |
| 工作完成 | 完成前有未提交的变更 | 强烈建议 |

### 提醒格式

```
┌────────────────────────────────────────────────┐
│ 🔔 Check-in Checkpoint                         │
├────────────────────────────────────────────────┤
│ Phase 1 completed                              │
│                                                │
│ Change Statistics:                             │
│   - Files: 5                                   │
│   - Added: 180 lines                           │
│   - Deleted: 12 lines                          │
│                                                │
│ Test Status: ✅ Passed                         │
│                                                │
│ Suggested commit message:                      │
│   feat(module): complete Phase 1 setup         │
│                                                │
│ Options:                                       │
│   [1] Commit now (will show git commands)      │
│   [2] Commit later, continue to next phase     │
│   [3] View detailed changes                    │
└────────────────────────────────────────────────┘
```

### 跳过警告

连续跳过 3 次后：

```
⚠️ Warning: You have skipped check-in 3 times consecutively
Current accumulated changes: 15 files, +520 lines
Recommend committing soon to avoid changes becoming too large to review
```

---

## AI 助手工作流程

当 AI 完成代码变更时，遵循此工作流程：

### 步骤 1：评估时机

```
✅ Complete: "Implemented user registration with validation, tests, and docs"
⚠️ Incomplete: "Added registration form but backend validation pending"
❌ Not Ready: "Started working on registration, several TODOs remain"
```

### 步骤 2：运行检查清单

```
### Checklist Results

✅ Build: npm run build succeeded
✅ Code Quality: Follows project standards
⚠️ Tests: Unit tests pass, integration tests need verification
✅ Documentation: JSDoc comments added
✅ Commit Message: Prepared following conventional commits
```

### 步骤 3：提示用户

```markdown
## Please Confirm Check-in

Completed: [Brief description]

### Checklist Results
✅ Build passes
✅ Tests pass
✅ Code quality verified
✅ Documentation updated

Suggested commit message:
```
feat(auth): add OAuth2 Google login support

- Implement OAuth2 flow with Google provider
- Add user session management
- Include unit tests for auth service

Refs #123
```

Proceed with commit?
```

### 步骤 4：等待确认

**AI 必须**：
- ✅ 等待用户明确批准
- ✅ 提供清晰的检查清单摘要
- ✅ 允许用户拒绝或请求更改

**AI 绝不能**：
- ❌ 自动执行 `git add`
- ❌ 自动执行 `git commit`
- ❌ 自动执行 `git push`

---

## 常见违规

### ❌ WIP 提交

```bash
# Bad
git commit -m "WIP"
git commit -m "save work"

# Solution: Use git stash
git stash save "WIP: feature description"
```

### ❌ 被注释的代码

```javascript
// Bad: Committing commented old code
// const oldValue = calculate(x);
const newValue = calculateV2(x);

// Solution: Delete commented code, rely on git history
const newValue = calculateV2(x);
```

### ❌ 混合关注点

```bash
# Bad: One commit with multiple unrelated changes
git commit -m "fix bug and refactor and add feature"

# Solution: Separate commits
git commit -m "fix(module-a): resolve null pointer"
git commit -m "refactor(module-b): extract validation"
git commit -m "feat(module-c): add CSV export"
```

---

## 目录卫生

提交前，验证没有不需要的文件：

```bash
# Check for IDE artifacts in staging
git diff --cached --name-only | grep -E '\.idea|\.vs/|\.DS_Store'

# Check for abnormal directories
git ls-files | grep -E '^\$'

# Unstage unwanted files
git reset HEAD <file>
```

### 常见应排除的产物

| Pattern | Source | Action |
|---------|--------|--------|
| `.idea/` | JetBrains | gitignore |
| `.vs/` | Visual Studio | gitignore |
| `.DS_Store` | macOS | gitignore |
| `Thumbs.db` | Windows | gitignore |

---

## 配置检测

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的“Disabled Skills”部分
2. 检查 `CONTRIBUTING.md` 中的“Check-in Standards”部分
3. 检查 pre-commit hooks 配置
4. 如果未找到，**默认使用标准检查清单**

### 首次设置

如果未找到配置：

1. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Check-in Standards

### Build Commands
```bash
npm run build
```

### Test Commands
```bash
npm test
```

### Quality Commands
```bash
npm run lint
```

### Minimum Coverage
- Line: 80%
- Branch: 75%
```

---

## 详细指南

完整标准请参见：
- [签入标准](../../core/checkin-standards.md)

---

## 相关标准

- [签入标准](../../core/checkin-standards.md) - 核心标准
- [提交消息指南](../../core/commit-message-guide.md) - 消息格式
- [代码审查检查清单](../../core/code-review-checklist.md) - PR 审查
- [代码审查助手](../code-review-assistant/SKILL.md) - 审查技能
- [提交标准技能](../commit-standards/SKILL.md) - 提交消息技能

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | 初始发布 |

---

## 授权

此技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
