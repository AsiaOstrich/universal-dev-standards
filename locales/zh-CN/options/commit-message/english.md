---
source: ../../../../options/commit-message/english.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 英文 Commit 讯息

> **语言**: [English](../../../../options/commit-message/english.md) | 繁体中文

**上层标准**: [Commit 讯息指南](../../../../core/commit-message-guide.md)

---

## 概述

此选项定义完全使用英文撰写 commit 讯息的标准。英文是软体开发中使用最广泛的语言，使 commit 对全球开发者社群都可理解。

## 适用情境

- 国际团队
- 开源专案
- 有外部贡献者的专案
- 以英文为公司语言的组织
- 追求最大可及性的专案

## 格式

### 基本结构

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 组成元素

| 元素 | 必填 | 说明 |
|------|------|------|
| type | 是 | 变更类别（feat、fix、docs 等）|
| scope | 否 | 影响的模组或元件 |
| subject | 是 | 简短描述（祈使语气）|
| body | 否 | 详细说明 |
| footer | 否 | 参考连结、重大变更 |

## Commit 类型

| 类型 | 说明 | 范例 |
|------|------|------|
| `feat` | 新功能 | `feat: add user authentication` |
| `fix` | 错误修复 | `fix: resolve login timeout issue` |
| `docs` | 文件更新 | `docs: update API reference` |
| `style` | 格式调整 | `style: fix indentation in utils` |
| `refactor` | 程式码重构 | `refactor: simplify validation logic` |
| `perf` | 效能优化 | `perf: optimize database queries` |
| `test` | 测试相关 | `test: add unit tests for auth module` |
| `chore` | 维护作业 | `chore: update dependencies` |

## 撰写指南

### 主题行

1. **使用祈使语气**：「Add feature」而非「Added feature」
2. **冒号后不大写**：「add feature」而非「Add feature」
3. **结尾不加句号**：「add feature」而非「add feature.」
4. **保持 50 字元以内**：简洁扼要
5. **具体明确**：「fix null pointer in user service」而非「fix bug」

### 内文

1. **每行 72 字元**：在终端机中保持可读性
2. **说明「什么」和「为什么」**：而非「如何」（程式码会显示如何）
3. **使用项目符号**：多项变更时
4. **与主题分隔**：使用空行

## 范例

### 简单功能

```
feat(auth): add password strength indicator

- Display strength bar during password input
- Show requirements as user types
- Prevent submission of weak passwords

Closes #234
```

### 错误修复

```
fix(api): handle null response from payment gateway

The payment gateway occasionally returns null instead of an error
object when the service is degraded. This caused unhandled exceptions
in the checkout flow.

Added null check and appropriate error handling to gracefully
handle this edge case.

Fixes #567
```

### 重大变更

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

## 相关选项

- [繁体中文](./traditional-chinese.md) - 繁体中文 Commit 讯息
- [双语](./bilingual.md) - 中英双语格式

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
