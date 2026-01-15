---
name: error-code-guide
description: |
  设计一致的错误码，遵循 PREFIX_CATEGORY_NUMBER 格式。
  使用时机：定義错误码、建立错误处理、设计 API。
  关鍵字：error code, error handling, error format, API errors, 错误码, 错误处理。
source: ../../../../../skills/claude-code/error-code-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 错误码指南

> **语言**: [English](../../../../../skills/claude-code/error-code-guide/SKILL.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-30
**適用範圍**: Claude Code Skills

---

## 目的

此技能幫助设计一致的错误码，遵循标准格式，实現更好的除錯、監控和使用者体驗。

## 快速參考

### 错误码格式

```
<前綴>_<类别>_<编号>
```

| 元素 | 说明 | 範例 |
|------|------|------|
| 前綴 (PREFIX) | 应用/服务識别码 | AUTH, PAY, USR |
| 类别 (CATEGORY) | 错误类别 | VAL, SYS, BIZ |
| 编号 (NUMBER) | 唯一數字識别码 | 001, 100, 404 |

### 範例

```
AUTH_VAL_001    → 认证验证错误
PAY_SYS_503     → 付款系统無法使用
USR_BIZ_100     → 使用者商业規則違規
API_NET_408     → API 网络逾时
```

### 错误类别

| 类别 | 全名 | 说明 | HTTP 状态码 |
|------|------|------|-------------|
| **VAL** | Validation | 客户端输入验证失败 | 400 |
| **BIZ** | Business | 商业規則違規 | 422 |
| **SYS** | System | 內部系统错误 | 500 |
| **NET** | Network | 通訊错误 | 502/503/504 |
| **AUTH** | Auth | 安全相关错误 | 401/403 |

### 类别编号範圍

| 範圍 | 说明 | 範例 |
|------|------|------|
| *_VAL_001-099 | 欄位验证 | 缺少必填欄位 |
| *_VAL_100-199 | 格式验证 | 電子郵件格式無效 |
| *_VAL_200-299 | 約束验证 | 密码太短 |
| *_BIZ_001-099 | 状态違規 | 订单已取消 |
| *_BIZ_100-199 | 規則違規 | 超過 30 天無法退貨 |
| *_BIZ_200-299 | 限制違規 | 超過每日限制 |
| *_AUTH_001-099 | 认证 | 帳号密码错误 |
| *_AUTH_100-199 | 授权 | 权限不足 |
| *_AUTH_200-299 | Token/Session | Token 已過期 |

## HTTP 状态码对应

| 类别 | HTTP 状态码 | 说明 |
|------|-------------|------|
| VAL | 400 | Bad Request |
| BIZ | 422 | Unprocessable Entity |
| AUTH (001-099) | 401 | Unauthorized |
| AUTH (100-199) | 403 | Forbidden |
| SYS | 500 | Internal Server Error |
| NET | 502/503/504 | Gateway errors |

## 详细指南

完整标准請參考：
- [错误码标准](../../../core/error-code-standards.md)

### AI 優化格式（节省 Token）

AI 助手可使用 YAML 格式文件以減少 Token 使用量：
- 基礎标准：`ai/standards/error-codes.ai.yaml`

## 错误响应格式

### 单一错误

```json
{
  "success": false,
  "error": {
    "code": "AUTH_VAL_001",
    "message": "電子郵件为必填欄位",
    "field": "email",
    "requestId": "req_abc123"
  }
}
```

### 多个错误

```json
{
  "success": false,
  "errors": [
    {
      "code": "AUTH_VAL_001",
      "message": "電子郵件为必填欄位",
      "field": "email"
    },
    {
      "code": "AUTH_VAL_201",
      "message": "密码至少需要 8 个字元",
      "field": "password"
    }
  ],
  "requestId": "req_abc123"
}
```

## 內部错误物件

```typescript
interface ApplicationError {
  // 核心欄位
  code: string;          // "AUTH_VAL_001"
  message: string;       // 技術消息（用於日誌）

  // 使用者界面
  userMessage: string;   // 本地化使用者消息
  userMessageKey: string; // i18n 鍵值: "error.auth.val.001"

  // 上下文
  field?: string;        // 相关欄位: "email"
  details?: object;      // 附加信息

  // 除錯
  timestamp: string;     // ISO 8601
  requestId: string;     // 关联 ID
}
```

## 國际化 (i18n)

### 消息鍵值格式

```
error.<前綴>.<类别>.<编号>
```

### 翻譯文件範例

```yaml
# en.yaml
error:
  auth:
    val:
      001: "Email is required"
      101: "Invalid email format"
    auth:
      001: "Invalid credentials"

# zh-TW.yaml
error:
  auth:
    val:
      001: "電子郵件为必填欄位"
      101: "電子郵件格式無效"
    auth:
      001: "帳号或密码错误"
```

## 範例

### ✅ 良好的错误码

```javascript
AUTH_VAL_001  // 缺少必填欄位: email
AUTH_VAL_101  // 電子郵件格式無效
ORDER_BIZ_001 // 订单已取消
ORDER_BIZ_201 // 超過每日購买限制
DB_SYS_001    // 数据庫查詢失败
SEC_AUTH_001  // 帳号密码错误
SEC_AUTH_201  // Token 已過期
```

### ❌ 不良的错误码

```javascript
ERR_001       // 太模糊，没有前綴或类别
INVALID       // 不具描述性
error         // 不是错误码
AUTH_ERROR    // 缺少编号
```

## 检查清单

- [ ] 每个错误有唯一代码
- [ ] 类别符合错误类型
- [ ] 使用者消息已本地化
- [ ] HTTP 状态码正确
- [ ] 错误已记录文件
- [ ] 代码已加入註冊表

---

## 设置偵测

此技能支援项目特定设置。

### 偵测順序

1. 检查程序码庫中現有的错误码模式
2. 检查 `CONTRIBUTING.md` 中的错误码指南
3. 若無找到，**预设使用 PREFIX_CATEGORY_NUMBER 格式**

### 首次设置

若未找到错误码标准：

1. 建议：「此项目尚未设置错误码标准。您要建立错误码註冊表嗎？」
2. 建议建立 `errors/registry.ts`：

```typescript
export const ErrorCodes = {
  AUTH_VAL_001: {
    code: 'AUTH_VAL_001',
    httpStatus: 400,
    messageKey: 'error.auth.val.001',
    description: '電子郵件欄位为必填',
  },
  // ... 更多错误码
} as const;
```

---

## 相关标准

- [错误码标准](../../../core/error-code-standards.md)
- [日誌标准](../../../core/logging-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授权

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
