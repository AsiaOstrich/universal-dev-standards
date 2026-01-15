---
source: /skills/claude-code/commit-standards/conventional-commits.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Conventional Commits 指南

> **语言**: [English](../../../../../skills/claude-code/commit-standards/conventional-commits.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰写 conventional commit 消息的详细指南。

---

## 格式结构

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 組成元素

| 元素 | 必填 | 说明 |
|-----------|----------|-------------|
| `type` | ✅ 是 | 变更类型 |
| `scope` | 選填 | 受影響的模組/元件 |
| `subject` | ✅ 是 | 簡短描述（≤72 字元） |
| `body` | 建议填写 | 详细说明 |
| `footer` | 選填 | 議題引用、破壞性变更 |

---

## Commit 类型

### 主要类型

| 类型 | 使用时机 | 範例 |
|------|-------------|----------|
| `feat` | 为使用者新增功能 | `feat(cart): Add quantity selector` |
| `fix` | 为使用者修復错误 | `fix(login): Resolve password reset loop` |
| `docs` | 僅文件变更 | `docs(api): Add authentication examples` |
| `refactor` | 程序码变更但不涉及功能/修復 | `refactor(utils): Simplify date formatting` |

### 次要类型

| 类型 | 使用时机 | 範例 |
|------|-------------|----------|
| `style` | 格式化、空白字元 | `style: Apply prettier formatting` |
| `test` | 新增/更新测试 | `test(auth): Add login integration tests` |
| `perf` | 效能改进 | `perf(query): Add database index` |
| `build` | 建置系统、依賴套件 | `build(deps): Upgrade React to v18` |
| `ci` | CI/CD 流程 | `ci: Add deploy workflow` |
| `chore` | 維護任务 | `chore: Update .gitignore` |
| `revert` | 回復提交 | `revert: Revert "feat(auth): Add SSO"` |
| `security` | 安全性修復 | `security(auth): Fix XSS vulnerability` |

---

## Scope 指南

### 命名規則

1. **使用小写**: `auth`，而非 `Auth`
2. **多个单字使用連字号**: `user-profile`，而非 `userProfile`
3. **保持簡短**: 最多 1-2 个单字

### 常見 Scopes

**依层级**:
- `api`, `ui`, `database`, `config`, `middleware`

**依功能**:
- `auth`, `login`, `payment`, `notification`, `search`

**依文件类型**:
- `tests`, `docs`, `build`, `deps`

**特殊**:
- `*`: 影響多个範圍
- (無 scope): 全域变更

---

## Subject 行規則

1. **長度**: ≤72 字元（理想为 50）
2. **时態**: 祈使語氣
   - ✅ "Add feature"
   - ❌ "Added feature"
3. **大小写**: 首字母大写
4. **無句号**: 結尾不加句号
5. **具体明确**: 描述变更内容

### 範例

```
✅ feat(auth): Add OAuth2 Google login support
✅ fix(api): Resolve memory leak in session cache
✅ refactor(database): Extract query builder class

❌ fixed bug                    # 模糊、過去式
❌ feat(auth): added login.     # 過去式、有句号
❌ Update stuff                 # 太模糊
```

---

## Body 指南

说明**为什麼**，而非**做什麼**（程序码已經展示做什麼）。

### 範本

**功能类**:
```
Why this feature is needed:
- Reason 1
- Reason 2

What this implements:
- Implementation detail 1
- Implementation detail 2
```

**错误修復类**:
```
Why this occurred:
- Root cause explanation

What this fix does:
- Solution description

Testing:
- How it was tested
```

**重構类**:
```
Why this refactoring:
- Motivation

What this changes:
- Changes description

Migration:
- Migration steps if needed
```

---

## Footer 指南

### 議題引用

```
Closes #123     # 自动关閉議題
Fixes #456      # 自动关閉議題
Resolves #789   # 自动关閉議題
Refs #101       # 連結但不关閉
See also #999   # 相关引用
```

### 破壞性变更

```
BREAKING CHANGE: <description>

Migration guide:
- Step 1
- Step 2
```

---

## 完整範例

```
feat(export): Add CSV export functionality for user data

Why this feature is needed:
- Admins need to export user lists for compliance audits
- Manual copy-paste from UI is error-prone
- Requested by legal and compliance teams

What this implements:
- New /api/users/export endpoint
- CSV generation using csv-writer library
- Streaming response for large datasets
- Date range filtering options

Technical notes:
- Streaming prevents memory issues with 100k+ users
- Export limited to admin role only
- Rate limited to prevent abuse

Closes #567
Refs #234 (related compliance requirement)
```

---

## 反模式

### ❌ 模糊消息

```
fix: bug fix
refactor: code improvements
update: changes
```

### ❌ 混合多个关注点

```
feat: add login, fix bugs, refactor database
```

**修正**: 拆分成个别提交。

### ❌ Subject 中包含实作細节

```
fix: change line 45 from getUserById to getUserByEmail
```

**修正**: 著重於目的，而非实作。

---

## 相关标准

- [Commit Message Guide](../../../../../core/commit-message-guide.md)
- [Language Options](./language-options.md)
- [Git Workflow](../../../../../core/git-workflow.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增: 标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
