---
source: ../../../../options/commit-message/bilingual.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 双语 Commit 讯息

> **语言**: [English](../../../../options/commit-message/bilingual.md) | 繁体中文

**上层标准**: [Commit 讯息指南](../../core/commit-message-guide.md)

---

## 概述

双语 commit 讯息以结构化格式结合英文和繁体中文。此方法在维持国际可及性的同时，为中文团队成员提供清晰的沟通。

## 适用情境

- 语言背景混合的团队
- 转型为国际标准的公司
- 同时有本地和国际贡献者的专案
- 需要双语文件的组织

## 格式

### 基本结构

```
<type>(<scope>): <英文主题>

<英文说明>

<中文说明>

<footer>
```

### 替代格式

```
<type>(<scope>): <English> / <中文>

<详细英文说明>

<详细中文说明>

<footer>
```

## 范例

### 功能

```
feat(auth): add two-factor authentication

Add support for TOTP-based two-factor authentication.
Users can enable 2FA from their security settings.

新增基于 TOTP 的双因素验证支援。
使用者可以从安全设定中启用 2FA。

Closes #234
```

### 错误修复

```
fix(api): handle timeout in payment processing

The payment gateway timeout was causing silent failures.
Added proper error handling and user notification.

付款闸道逾时导致静默失败。
新增适当的错误处理和使用者通知。

Fixes #567
```

### 重大变更

```
feat(api): migrate to GraphQL API

BREAKING CHANGE: REST API endpoints are deprecated.
All clients must migrate to GraphQL by v3.0.

重大变更：REST API 端点已弃用。
所有客户端必须在 v3.0 前迁移至 GraphQL。

Migration guide / 迁移指南：
- Replace REST calls with GraphQL queries
- 将 REST 呼叫替换为 GraphQL 查询

Closes #789
```

### 精简格式

对于较小的变更，使用行内双语格式：

```
fix(ui): correct button alignment / 修正按钮对齐

style(css): update color scheme / 更新配色方案

docs: fix typo in README / 修正 README 错字
```

## 撰写指南

| 指南 | 说明 |
|------|------|
| 英文优先 | 英文放在中文之前 |
| 各语言 50 字元 | 每种语言保持简洁 |
| 英文祈使语气 | 使用动词原形 |
| 中文动词开头 | 新增、修正、更新等 |

## 最佳实践

### 建议

- 保持两种语言同步
- 使用一致的格式
- 审阅两种语言版本
- 使用各语言适当的惯用语

### 避免

- 在句子中混合语言
- 使用未经审阅的机器翻译
- 「小变更」时跳过一种语言
- 不必要地翻译技术术语

## 技术术语

保持技术术语使用英文：

| 术语 | 使用方式 |
|------|----------|
| API、REST、GraphQL | 不翻译 |
| CRUD 操作 | 不翻译 |
| Git 指令 | 不翻译 |
| 框架名称 | 不翻译 |

## 相关选项

- [英文](./english.md) - 纯英文格式
- [繁体中文](./traditional-chinese.md) - 纯中文格式

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
