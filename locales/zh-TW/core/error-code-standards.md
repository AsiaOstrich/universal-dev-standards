---
source: ../../../core/error-code-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 錯誤碼標準

> 版本: 1.0.0 | 最後更新: 2025-12-30

## 概述

本文件定義跨應用程式的一致錯誤碼管理標準，以實現更好的除錯、監控和使用者體驗。

## 錯誤碼格式

### 標準格式

```
<前綴>_<類別>_<編號>
```

| 組成 | 描述 | 範例 |
|-----|------|------|
| 前綴 | 應用程式/服務識別碼 | AUTH, PAY, USR |
| 類別 | 錯誤類別 | VAL, SYS, BIZ |
| 編號 | 唯一數字識別碼 | 001, 100, 404 |

### 範例

```
AUTH_VAL_001    → 驗證驗證錯誤
PAY_SYS_503     → 支付系統不可用
USR_BIZ_100     → 使用者業務規則違反
API_NET_408     → API 網路逾時
```

## 錯誤類別

### 驗證錯誤 (VAL)

用戶端輸入驗證失敗。

| 代碼範圍 | 描述 |
|---------|------|
| *_VAL_001-099 | 欄位驗證 |
| *_VAL_100-199 | 格式驗證 |
| *_VAL_200-299 | 限制驗證 |

```javascript
// 範例
AUTH_VAL_001  // 缺少必填欄位：email
AUTH_VAL_101  // 無效的電子郵件格式
AUTH_VAL_201  // 密碼太短（最少 8 個字元）
```

### 業務邏輯錯誤 (BIZ)

業務規則違反。

| 代碼範圍 | 描述 |
|---------|------|
| *_BIZ_001-099 | 狀態違反 |
| *_BIZ_100-199 | 規則違反 |
| *_BIZ_200-299 | 限制違反 |

```javascript
// 範例
ORDER_BIZ_001  // 訂單已取消
ORDER_BIZ_101  // 超過 30 天無法退貨
ORDER_BIZ_201  // 超過每日購買限額
```

### 系統錯誤 (SYS)

內部系統故障。

| 代碼範圍 | 描述 |
|---------|------|
| *_SYS_001-099 | 內部錯誤 |
| *_SYS_100-199 | 資源錯誤 |
| *_SYS_500-599 | HTTP 對應系統錯誤 |

```javascript
// 範例
DB_SYS_001    // 資料庫查詢失敗
CACHE_SYS_101 // Redis 連線中斷
API_SYS_503   // 服務不可用
```

### 網路錯誤 (NET)

通訊和連線問題。

| 代碼範圍 | 描述 |
|---------|------|
| *_NET_001-099 | 連線錯誤 |
| *_NET_100-199 | 協議錯誤 |
| *_NET_400-599 | HTTP 對應網路錯誤 |

```javascript
// 範例
API_NET_001   // 連線被拒絕
API_NET_408   // 請求逾時
API_NET_502   // 閘道錯誤
```

### 身份驗證/授權錯誤 (AUTH)

安全相關錯誤。

| 代碼範圍 | 描述 |
|---------|------|
| *_AUTH_001-099 | 身份驗證失敗 |
| *_AUTH_100-199 | 授權失敗 |
| *_AUTH_200-299 | 令牌/工作階段錯誤 |

```javascript
// 範例
SEC_AUTH_001  // 無效的憑證
SEC_AUTH_101  // 權限不足
SEC_AUTH_201  // 令牌已過期
```

## 錯誤訊息結構

### 內部錯誤物件

```typescript
interface ApplicationError {
  // 核心欄位
  code: string;          // "AUTH_VAL_001"
  message: string;       // 日誌用技術訊息

  // 面向使用者
  userMessage: string;   // 本地化使用者訊息
  userMessageKey: string; // i18n 金鑰: "error.auth.val.001"

  // 情境
  field?: string;        // 受影響的欄位: "email"
  details?: object;      // 額外情境

  // 除錯
  timestamp: string;     // ISO 8601
  requestId: string;     // 關聯 ID
  stack?: string;        // 堆疊追蹤（僅開發環境）
}
```

### API 回應格式

```json
{
  "success": false,
  "error": {
    "code": "AUTH_VAL_001",
    "message": "電子郵件為必填欄位",
    "field": "email",
    "requestId": "req_abc123"
  }
}
```

### 多重錯誤回應

```json
{
  "success": false,
  "errors": [
    {
      "code": "AUTH_VAL_001",
      "message": "電子郵件為必填欄位",
      "field": "email"
    },
    {
      "code": "AUTH_VAL_201",
      "message": "密碼必須至少 8 個字元",
      "field": "password"
    }
  ],
  "requestId": "req_abc123"
}
```

## HTTP 狀態碼對應

將錯誤類別對應到 HTTP 狀態碼：

| 類別 | HTTP 狀態 | 描述 |
|-----|----------|------|
| VAL | 400 | 錯誤的請求 |
| BIZ | 422 | 無法處理的實體 |
| AUTH (001-099) | 401 | 未授權 |
| AUTH (100-199) | 403 | 禁止存取 |
| SYS | 500 | 內部伺服器錯誤 |
| NET | 502/503/504 | 閘道錯誤 |

## 國際化 (i18n)

### 訊息金鑰格式

```
error.<前綴>.<類別>.<編號>
```

### 翻譯檔案範例

```yaml
# en.yaml
error:
  auth:
    val:
      001: "Email is required"
      101: "Invalid email format"
    auth:
      001: "Invalid credentials"
      201: "Session expired"

# zh-TW.yaml
error:
  auth:
    val:
      001: "電子郵件為必填欄位"
      101: "電子郵件格式無效"
    auth:
      001: "帳號或密碼錯誤"
      201: "工作階段已過期"
```

### 動態參數

```yaml
# 含參數的範本
error:
  order:
    biz:
      201: "超過每日 {limit} 筆訂單的限制"

# 使用方式
formatMessage('error.order.biz.201', { limit: 10 })
// 輸出: "超過每日 10 筆訂單的限制"
```

## 錯誤碼登錄

### 集中定義

維護所有錯誤碼的單一真實來源：

```typescript
// errors/registry.ts
export const ErrorCodes = {
  // 身份驗證
  AUTH_VAL_001: {
    code: 'AUTH_VAL_001',
    httpStatus: 400,
    messageKey: 'error.auth.val.001',
    description: '電子郵件欄位為必填',
  },
  AUTH_VAL_101: {
    code: 'AUTH_VAL_101',
    httpStatus: 400,
    messageKey: 'error.auth.val.101',
    description: '電子郵件格式無效',
  },
  // ... 更多代碼
} as const;
```

### 使用模式

```typescript
import { ErrorCodes } from './errors/registry';

function validateEmail(email: string) {
  if (!email) {
    throw new AppError(ErrorCodes.AUTH_VAL_001);
  }
  if (!isValidEmail(email)) {
    throw new AppError(ErrorCodes.AUTH_VAL_101);
  }
}
```

## 文件需求

### 錯誤碼文件

每個錯誤碼應記錄：

1. **代碼**: 錯誤碼字串
2. **描述**: 此錯誤的含義
3. **原因**: 常見原因
4. **解決方案**: 如何修復
5. **範例**: 示例場景

```markdown
## AUTH_VAL_001

**描述**: 電子郵件欄位為必填

**原因**: 請求主體不包含電子郵件欄位

**解決方案**: 在請求主體中包含有效的電子郵件

**範例**:
// 缺少電子郵件
POST /api/register
{ "password": "secret123" }

// 正確
POST /api/register
{ "email": "user@example.com", "password": "secret123" }
```

## 快速參考卡

### 代碼格式

```
<前綴>_<類別>_<編號>
AUTH_VAL_001
```

### 類別

| 代碼 | 類別 | 用途 |
|-----|------|-----|
| VAL | 驗證 | 輸入驗證失敗 |
| BIZ | 業務 | 業務規則違反 |
| SYS | 系統 | 內部系統錯誤 |
| NET | 網路 | 通訊失敗 |
| AUTH | 驗證 | 安全相關錯誤 |

### HTTP 對應

| 類別 | 狀態 |
|-----|------|
| VAL | 400 |
| BIZ | 422 |
| AUTH | 401/403 |
| SYS | 500 |
| NET | 502/503 |

### 檢查清單

- [ ] 每個錯誤有唯一代碼
- [ ] 類別符合錯誤類型
- [ ] 使用者訊息已本地化
- [ ] HTTP 狀態正確
- [ ] 錯誤已記錄
- [ ] 代碼已登錄

---

**相關標準：**
- [日誌標準](logging-standards.md) - 錯誤日誌實踐
- [API 文件標準](api-documentation-standards.md) - 錯誤回應文件
