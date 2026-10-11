---
source: ../../../../options/commit-message/bilingual.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 63b02832c937
status: current
---

# 双语 Commit 消息

> **语言**: [English](../../../../options/commit-message/bilingual.md) | 简体中文

**上层标准**: [Commit 消息指南](../../../../core/commit-message-guide.md)

---

## 概述

双语 commit 消息以结构化格式结合英文和中文。这种方式在保持国际可访问性的同时，为中文团队成员提供清晰的沟通。

## 适用场景

- 语言背景混合的团队
- 正在向国际标准转型的公司
- 同时拥有本地和国际贡献者的项目
- 需要双语文档的组织

## 格式

### 基本结构

```
<type>(<scope>): <English subject>

<English description>

<中文說明>

<footer>
```

### 替代格式

```
<type>(<scope>): <English> / <中文>

<Detailed English description>

<詳細中文說明>

<footer>
```

## 示例

### 功能

```
feat(auth): add two-factor authentication

Add support for TOTP-based two-factor authentication.
Users can enable 2FA from their security settings.

新增基於 TOTP 的雙因素驗證支援。
使用者可以從安全設定中啟用 2FA。

Closes #234
```

### 缺陷修复

```
fix(api): handle timeout in payment processing

The payment gateway timeout was causing silent failures.
Added proper error handling and user notification.

付款閘道逾時導致靜默失敗。
新增適當的錯誤處理和使用者通知。

Fixes #567
```

### 破坏性变更

```
feat(api): migrate to GraphQL API

BREAKING CHANGE: REST API endpoints are deprecated.
All clients must migrate to GraphQL by v3.0.

重大變更：REST API 端點已棄用。
所有客戶端必須在 v3.0 前遷移至 GraphQL。

Migration guide / 遷移指南：
- Replace REST calls with GraphQL queries
- 將 REST 呼叫替換為 GraphQL 查詢
- Update authentication headers
- 更新驗證標頭

Closes #789
```

### 文档

```
docs(readme): update installation guide

Add Docker-based installation instructions.
Update system requirements section.

新增基於 Docker 的安裝說明。
更新系統需求章節。
```

### 精简格式

对于较小的变更，使用行内双语格式：

```
fix(ui): correct button alignment / 修正按鈕對齊

style(css): update color scheme / 更新配色方案

docs: fix typo in README / 修正 README 錯字
```

## 撰写指南

### 主题行

| 指南 | Guideline |
|------|-----------|
| 英文在前，中文在后 | English first, Chinese second |
| 每种语言保持在 50 个字符以内 | Keep each language under 50 chars |
| 英文使用祈使语气 | Use imperative mood in English |
| 中文以动词开头 | Use action verbs in Chinese |

### 正文

1. **清楚分隔段落** - 不同语言之间使用空行分隔

2. **保持内容对应** - 两种语言应传达相同的信息

3. **英文优先** - 为了保持一致性和工具兼容性

4. **避免逐字翻译** - 根据各语言的习惯自然表达

## 配置

### Git Commit 模板

创建 `~/.gitmessage`：

```
# <type>(<scope>): <English subject>
# |<----  Max 50 characters  ---->|

# English description:


# 中文說明：


# References / 參考：
# Closes #
```

配置：

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @commitlint/config-conventional defaults both to 100, sized for
    // English-only commits. A bilingual header/body line repeats the same
    // content in English then Chinese, so 100 is too tight in practice —
    // this repo's own history (measured over 300 commits) runs header
    // p50=134/p95=192 and body-line p50=75/p95=110 characters.
    'header-max-length': [2, 'always', 250],
    'body-max-line-length': [2, 'always', 200],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ]
  }
};
```

## 最佳实践

### 建议

- 保持两种语言同步
- 使用一致的格式
- 审阅两种语言的版本
- 使用符合各语言习惯的惯用语

### 避免

- 在同一句子中混用语言
- 使用未经审阅的机器翻译
- 因为是“小变更”就省略其中一种语言
- 不必要地翻译技术术语

## AI 助手运行期纪律

本选项不仅适用于 commit 消息，也适用于以此双语模式撰写面向用户文字的 AI 助手。在长对话中，助手刚处理完大量非目标语言内容（代码、日志、英文文档）后，下一段回复容易漂移到错误的语言。

- **切换回复前先自检** — 处理完大量非目标语言内容后，在写下一段面向用户的文字之前，先确认将使用目标语言，不要等用户指出漂移才发现。

- **立即修正，不拖延** — 如果用户已经指出语言漂移，下一条回复就必须修正。不要反复道歉，也不要继续漂移。

## 技术术语

技术术语保持使用英文：

| 术语 | 用法 |
|------|------|
| API, REST, GraphQL | 不翻译 |
| CRUD 操作 | 不翻译 |
| Git 命令 | 不翻译 |
| 框架名称 | 不翻译 |

示例：

```
feat(api): add GraphQL subscription support

Implement real-time updates using GraphQL subscriptions.
WebSocket connection handles reconnection automatically.

實作使用 GraphQL subscriptions 的即時更新。
WebSocket 連線自動處理重新連線。
```

## 相关选项

- [English](./english.md) - 纯英文格式
- [Traditional Chinese](./traditional-chinese.md) - 纯繁体中文格式

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
