# 雙語 Commit 訊息

> **語言**: [English](../../../../options/commit-message/bilingual.md) | 繁體中文

**上層標準**: [Commit 訊息指南](../../core/commit-message-guide.md)

---

## 概述

雙語 commit 訊息以結構化格式結合英文和繁體中文。此方法在維持國際可及性的同時，為中文團隊成員提供清晰的溝通。

## 適用情境

- 語言背景混合的團隊
- 轉型為國際標準的公司
- 同時有本地和國際貢獻者的專案
- 需要雙語文件的組織

## 格式

### 基本結構

```
<type>(<scope>): <英文主題>

<英文說明>

<中文說明>

<footer>
```

### 替代格式

```
<type>(<scope>): <English> / <中文>

<詳細英文說明>

<詳細中文說明>

<footer>
```

## 範例

### 功能

```
feat(auth): add two-factor authentication

Add support for TOTP-based two-factor authentication.
Users can enable 2FA from their security settings.

新增基於 TOTP 的雙因素驗證支援。
使用者可以從安全設定中啟用 2FA。

Closes #234
```

### 錯誤修復

```
fix(api): handle timeout in payment processing

The payment gateway timeout was causing silent failures.
Added proper error handling and user notification.

付款閘道逾時導致靜默失敗。
新增適當的錯誤處理和使用者通知。

Fixes #567
```

### 重大變更

```
feat(api): migrate to GraphQL API

BREAKING CHANGE: REST API endpoints are deprecated.
All clients must migrate to GraphQL by v3.0.

重大變更：REST API 端點已棄用。
所有客戶端必須在 v3.0 前遷移至 GraphQL。

Migration guide / 遷移指南：
- Replace REST calls with GraphQL queries
- 將 REST 呼叫替換為 GraphQL 查詢

Closes #789
```

### 精簡格式

對於較小的變更，使用行內雙語格式：

```
fix(ui): correct button alignment / 修正按鈕對齊

style(css): update color scheme / 更新配色方案

docs: fix typo in README / 修正 README 錯字
```

## 撰寫指南

| 指南 | 說明 |
|------|------|
| 英文優先 | 英文放在中文之前 |
| 各語言 50 字元 | 每種語言保持簡潔 |
| 英文祈使語氣 | 使用動詞原形 |
| 中文動詞開頭 | 新增、修正、更新等 |

## 最佳實踐

### 建議

- 保持兩種語言同步
- 使用一致的格式
- 審閱兩種語言版本
- 使用各語言適當的慣用語

### 避免

- 在句子中混合語言
- 使用未經審閱的機器翻譯
- 「小變更」時跳過一種語言
- 不必要地翻譯技術術語

## 技術術語

保持技術術語使用英文：

| 術語 | 使用方式 |
|------|----------|
| API、REST、GraphQL | 不翻譯 |
| CRUD 操作 | 不翻譯 |
| Git 指令 | 不翻譯 |
| 框架名稱 | 不翻譯 |

## 相關選項

- [英文](./english.md) - 純英文格式
- [繁體中文](./traditional-chinese.md) - 純中文格式

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
