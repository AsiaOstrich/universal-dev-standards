# Bilingual Commit Messages / 雙語 Commit 訊息

> **Language**: English | [繁體中文](../../locales/zh-TW/options/commit-message/bilingual.md)

**Parent Standard**: [Commit Message Guide](../../core/commit-message-guide.md)

---

## Overview / 概述

Bilingual commit messages combine English and Traditional Chinese in a structured format. This approach maintains international accessibility while providing clear communication for Chinese-speaking team members.

雙語 commit 訊息以結構化格式結合英文和繁體中文。此方法在維持國際可及性的同時，為中文團隊成員提供清晰的溝通。

## Best For / 適用情境

- Teams with mixed language backgrounds / 語言背景混合的團隊
- Companies transitioning to international standards / 轉型為國際標準的公司
- Projects with both local and international contributors / 同時有本地和國際貢獻者的專案
- Organizations requiring bilingual documentation / 需要雙語文件的組織

## Format / 格式

### Basic Structure / 基本結構

```
<type>(<scope>): <English subject>

<English description>

<中文說明>

<footer>
```

### Alternative Format / 替代格式

```
<type>(<scope>): <English> / <中文>

<Detailed English description>

<詳細中文說明>

<footer>
```

## Examples / 範例

### Feature / 功能

```
feat(auth): add two-factor authentication

Add support for TOTP-based two-factor authentication.
Users can enable 2FA from their security settings.

新增基於 TOTP 的雙因素驗證支援。
使用者可以從安全設定中啟用 2FA。

Closes #234
```

### Bug Fix / 錯誤修復

```
fix(api): handle timeout in payment processing

The payment gateway timeout was causing silent failures.
Added proper error handling and user notification.

付款閘道逾時導致靜默失敗。
新增適當的錯誤處理和使用者通知。

Fixes #567
```

### Breaking Change / 重大變更

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

### Documentation / 文件

```
docs(readme): update installation guide

Add Docker-based installation instructions.
Update system requirements section.

新增基於 Docker 的安裝說明。
更新系統需求章節。
```

### Compact Format / 精簡格式

For smaller changes, use inline bilingual format:

對於較小的變更，使用行內雙語格式：

```
fix(ui): correct button alignment / 修正按鈕對齊

style(css): update color scheme / 更新配色方案

docs: fix typo in README / 修正 README 錯字
```

## Writing Guidelines / 撰寫指南

### Subject Line / 主題行

| Guideline | 指南 |
|-----------|------|
| English first, Chinese second | 英文優先，中文其次 |
| Keep each language under 50 chars | 每種語言保持 50 字元以內 |
| Use imperative mood in English | 英文使用祈使語氣 |
| Use action verbs in Chinese | 中文使用動詞開頭 |

### Body / 內文

1. **Separate sections clearly** - Use blank lines between languages
   **清楚分隔段落** - 語言之間使用空行

2. **Maintain parallel content** - Both languages should convey same information
   **維持平行內容** - 兩種語言應傳達相同資訊

3. **English first** - For consistency and tool compatibility
   **英文優先** - 為保持一致性和工具相容性

4. **Don't translate literally** - Adapt naturally to each language
   **避免逐字翻譯** - 自然地適應各語言

## Configuration / 設定

### Git Commit Template / Git Commit 範本

Create `~/.gitmessage`:

```
# <type>(<scope>): <English subject>
# |<----  Max 50 characters  ---->|

# English description:


# 中文說明：


# References / 參考：
# Closes #
```

Configure:

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint Configuration / Commitlint 設定

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100], // Longer for bilingual
    'body-max-line-length': [2, 'always', 100],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ]
  }
};
```

## Best Practices / 最佳實踐

### DO / 建議

- Keep both languages in sync / 保持兩種語言同步
- Use consistent formatting / 使用一致的格式
- Review both language versions / 審閱兩種語言版本
- Use language-appropriate idioms / 使用各語言適當的慣用語

### DON'T / 避免

- Mix languages within sentences / 在句子中混合語言
- Use machine translation without review / 使用未經審閱的機器翻譯
- Skip one language for "minor" changes / 「小變更」時跳過一種語言
- Translate technical terms unnecessarily / 不必要地翻譯技術術語

## Technical Terms / 技術術語

Keep technical terms in English:

保持技術術語使用英文：

| Term | Usage |
|------|-------|
| API, REST, GraphQL | Don't translate |
| CRUD operations | Don't translate |
| Git commands | Don't translate |
| Framework names | Don't translate |

Example:

```
feat(api): add GraphQL subscription support

Implement real-time updates using GraphQL subscriptions.
WebSocket connection handles reconnection automatically.

實作使用 GraphQL subscriptions 的即時更新。
WebSocket 連線自動處理重新連線。
```

## Related Options / 相關選項

- [English](./english.md) - English-only format / 純英文格式
- [Traditional Chinese](./traditional-chinese.md) - Chinese-only format / 純中文格式

---

## License / 授權條款

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**Source / 來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
