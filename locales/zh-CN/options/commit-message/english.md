---
source: ../../../../options/commit-message/english.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9c2d5e760869
status: current
---

# 英文 Commit 消息

> **语言**: [English](../../../../options/commit-message/english.md) | 简体中文

**上层标准**: [Commit 消息指南](../../../../core/commit-message-guide.md)

---

## 概述

本选项定义完全使用英文撰写 commit 消息的标准。英文是软件开发中使用最广泛的语言，能让 commit 被全球开发者社区所理解。

## 适用场景

- 国际化团队
- 开源项目
- 有外部贡献者的项目
- 以英文为公司工作语言的组织
- 追求最大可访问性的项目

## 格式

### 基本结构

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 组成部分

| 组成部分 | 必填 | 说明 |
|----------|------|------|
| type | 是 | 变更类别（feat、fix、docs 等） |
| scope | 否 | 受影响的模块或组件 |
| subject | 是 | 简短描述（祈使语气） |
| body | 否 | 详细说明 |
| footer | 否 | 引用、破坏性变更 |

## Commit 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add user authentication` |
| `fix` | 缺陷修复 | `fix: resolve login timeout issue` |
| `docs` | 文档 | `docs: update API reference` |
| `style` | 格式调整 | `style: fix indentation in utils` |
| `refactor` | 代码重构 | `refactor: simplify validation logic` |
| `perf` | 性能 | `perf: optimize database queries` |
| `test` | 测试 | `test: add unit tests for auth module` |
| `chore` | 维护 | `chore: update dependencies` |
| `ci` | CI/CD 变更 | `ci: add GitHub Actions workflow` |
| `build` | 构建系统 | `build: configure webpack for production` |

## 撰写指南

### 主题行

1. **使用祈使语气**：写 "Add feature" 而不是 "Added feature"
2. **首字母不大写**：（冒号之后）写 "add feature" 而不是 "Add feature"
3. **结尾不加句号**：写 "add feature" 而不是 "add feature."
4. **保持在 50 个字符以内**：力求简洁
5. **具体明确**：写 "fix null pointer in user service" 而不是 "fix bug"

### 正文

1. **每行 72 个字符换行**：便于在终端中阅读
2. **说明做了什么以及为什么**：而不是怎么做（代码本身展示了怎么做）
3. **使用项目符号**：适用于多项变更
4. **与主题行分隔**：使用空行

### 页脚

1. **引用 issue**：`Closes #123`、`Fixes #456`
2. **注明破坏性变更**：`BREAKING CHANGE: description`
3. **添加共同作者**：`Co-authored-by: Name <email>`

## 示例

### 简单功能

```
feat(auth): add password strength indicator

- Display strength bar during password input
- Show requirements as user types
- Prevent submission of weak passwords

Closes #234
```

### 缺陷修复

```
fix(api): handle null response from payment gateway

The payment gateway occasionally returns null instead of an error
object when the service is degraded. This caused unhandled exceptions
in the checkout flow.

Added null check and appropriate error handling to gracefully
handle this edge case.

Fixes #567
```

### 破坏性变更

```
feat(api): change authentication to JWT tokens

BREAKING CHANGE: Session-based authentication is removed.
All API clients must now use JWT tokens for authentication.

Migration guide:
1. Obtain JWT token from /auth/token endpoint
2. Include token in Authorization header
3. Remove session cookie handling

Closes #789
```

### 文档

```
docs(readme): add installation instructions for Windows

- Add PowerShell commands
- Include WSL setup guide
- Add troubleshooting section
```

### 重构

```
refactor(core): extract validation into separate module

Move validation logic from UserService to dedicated
ValidationService for better separation of concerns and reusability.

No functional changes.
```

## 反模式

### 错误示例

```
# Too vague
fix: fix bug

# Past tense
fixed: fixed the login issue

# Too long
feat: add a new feature that allows users to upload their profile pictures and automatically resize them to multiple dimensions

# No type
update user service

# Meaningless
wip
misc changes
asdf
```

### 正确写法

```
# Specific
fix(auth): prevent session timeout during file upload

# Imperative
fix(auth): resolve login redirect loop

# Concise with body for details
feat(users): add profile picture upload

Support JPEG, PNG, and WebP formats. Images are automatically
resized to 100x100, 200x200, and 400x400 pixels.

# With type
refactor(users): simplify service layer

# Clear purpose
feat(cache): add Redis support for session storage
```

## 配置

### Git Commit 模板

创建 `~/.gitmessage`：

```
# <type>(<scope>): <subject>
# |<----  Using a maximum of 50 characters  ---->|

# Explain why this change is being made
# |<----   Try to limit each line to 72 characters   ---->|

# Provide links or keys to any relevant issues or PRs
# Example: Closes #23
```

配置 git：

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ],
    'subject-case': [2, 'always', 'lower-case']
  }
};
```

## 相关选项

- [Traditional Chinese](./traditional-chinese.md) - 使用繁体中文撰写 commit
- [Bilingual](./bilingual.md) - 中英文结合的格式

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
