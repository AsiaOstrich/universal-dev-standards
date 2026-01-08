---
name: logging-guide
description: |
  實作結構化日誌，包含正確的日誌層級和敏感資料處理。
  使用時機：新增日誌、除錯、設定可觀測性。
  關鍵字：logging, log level, structured logging, observability, 日誌, 記錄, 結構化日誌。
source: ../../../../../skills/claude-code/logging-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 日誌指南

> **語言**: [English](../../../../../skills/claude-code/logging-guide/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-30
**適用範圍**: Claude Code Skills

---

## 目的

此技能幫助在所有環境中實作一致、結構化且可操作的應用程式日誌。

## 快速參考

### 日誌層級

| 層級 | 代碼 | 使用時機 | 生產環境 |
|------|------|----------|----------|
| **TRACE** | 10 | 非常詳細的除錯資訊 | 關閉 |
| **DEBUG** | 20 | 詳細的除錯資訊 | 關閉 |
| **INFO** | 30 | 正常操作事件 | 開啟 |
| **WARN** | 40 | 潛在問題，可恢復 | 開啟 |
| **ERROR** | 50 | 需要注意的錯誤 | 開啟 |
| **FATAL** | 60 | 嚴重故障 | 開啟 |

### 層級選擇決策樹

```
只用於除錯？               → DEBUG（生產環境關閉）
正常操作完成？             → INFO
意外但沒問題的情況？       → WARN
操作失敗？                 → ERROR
應用程式無法繼續？         → FATAL
```

### 各層級使用時機

| 層級 | 範例 |
|------|------|
| **TRACE** | 函式進入/離開、迴圈迭代、變數值 |
| **DEBUG** | 狀態變更、設定值、查詢參數 |
| **INFO** | 應用啟動/關閉、使用者操作、排程任務 |
| **WARN** | 已棄用 API、重試嘗試、資源接近上限 |
| **ERROR** | 失敗的操作、捕獲的例外、整合失敗 |
| **FATAL** | 無法恢復的錯誤、啟動失敗、失去關鍵資源 |

## 結構化日誌

### 必要欄位

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "使用者登入成功",
  "service": "auth-service",
  "environment": "production"
}
```

### 建議欄位

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "使用者登入成功",
  "service": "auth-service",
  "environment": "production",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "usr_12345",
  "request_id": "req_67890",
  "duration_ms": 150,
  "http_method": "POST",
  "http_path": "/api/v1/login",
  "http_status": 200
}
```

### 欄位命名慣例

使用 `snake_case` 並加上領域前綴：

| 領域 | 常用欄位 |
|------|----------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| 資料庫 | db_query_type, db_table, db_duration_ms, db_rows_affected |
| 佇列 | queue_name, queue_message_id, queue_delay_ms |
| 使用者 | user_id, user_role, user_action |
| 請求 | request_id, trace_id, span_id |

## 詳細指南

完整標準請參考：
- [日誌標準](../../../core/logging-standards.md)

### AI 優化格式（節省 Token）

AI 助手可使用 YAML 格式檔案以減少 Token 使用量：
- 基礎標準：`ai/standards/logging.ai.yaml`

## 敏感資料處理

### 絕對不要記錄

- 密碼或機密
- API 金鑰或 Token
- 信用卡號碼
- 身分證字號
- 完整的認證 Token

### 遮罩或編修

```javascript
// 不好
logger.info('登入嘗試', { password: userPassword });

// 好
logger.info('登入嘗試', { password: '***已編修***' });

// 好 - 部分遮罩
logger.info('卡片已處理', { last_four: '4242' });
```

### PII 處理

- 盡可能記錄使用者 ID 而非電子郵件
- 對敏感查詢使用雜湊識別碼
- 設定資料保留政策

## 錯誤日誌

### 必要的錯誤欄位

```json
{
  "level": "ERROR",
  "message": "資料庫連線失敗",
  "error_type": "ConnectionError",
  "error_message": "連線被拒絕",
  "error_code": "ECONNREFUSED",
  "stack": "Error: Connection refused\n    at connect (/app/db.js:45:11)..."
}
```

### 錯誤上下文

務必包含：
- 嘗試的操作是什麼
- 相關識別碼（user_id, request_id）
- 輸入參數（已清理）
- 重試次數（如適用）

```javascript
logger.error('處理訂單失敗', {
  error_type: err.name,
  error_message: err.message,
  order_id: orderId,
  user_id: userId,
  retry_count: 2,
  stack: err.stack
});
```

## 日誌格式

### JSON 格式（生產環境）

```json
{"timestamp":"2025-01-15T10:30:00.123Z","level":"INFO","message":"請求完成","request_id":"req_123","duration_ms":45}
```

### 人類可讀格式（開發環境）

```
2025-01-15T10:30:00.123Z [INFO] 請求完成 request_id=req_123 duration_ms=45
```

## 效能考量

### 各環境的日誌量

| 環境 | 層級 | 策略 |
|------|------|------|
| 開發 | DEBUG | 所有日誌 |
| 測試 | INFO | 大部分日誌 |
| 生產 | INFO | 高流量端點採樣 |

### 高流量端點

- 使用採樣（每 100 筆記錄 1 筆）
- 聚合指標而非個別日誌
- 使用獨立的日誌串流

## 檢查清單

### 必要欄位

- [ ] timestamp（ISO 8601）
- [ ] level
- [ ] message
- [ ] service name
- [ ] request_id 或 trace_id

### 安全性

- [ ] 沒有密碼或機密
- [ ] 沒有完整 Token
- [ ] PII 已遮罩或雜湊
- [ ] 信用卡從不記錄
- [ ] 保留政策已設定

---

## 設定偵測

此技能支援專案特定設定。

### 偵測順序

1. 檢查現有的日誌程式庫設定
2. 檢查 `CONTRIBUTING.md` 中的日誌指南
3. 若無找到，**預設使用結構化 JSON 日誌**

### 首次設定

若未找到日誌標準：

1. 建議：「此專案尚未設定日誌標準。您要設定結構化日誌嗎？」
2. 建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## 日誌標準

### 日誌層級
- DEBUG: 僅開發環境，詳細診斷資訊
- INFO: 正常操作（啟動、使用者操作、任務）
- WARN: 意外但可恢復的情況
- ERROR: 需要調查的失敗

### 必要欄位
所有日誌必須包含：timestamp, level, message, service, request_id

### 敏感資料
絕不記錄：密碼、Token、信用卡、身分證字號
```

---

## 相關標準

- [日誌標準](../../../core/logging-standards.md)
- [錯誤碼標準](../../../core/error-code-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授權

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
