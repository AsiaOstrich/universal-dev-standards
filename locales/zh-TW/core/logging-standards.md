---
source: ../../../core/logging-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-05
status: current
---

# 日誌標準

> 版本: 1.1.0 | 最後更新: 2026-01-05

## 概述

本文件定義日誌標準，確保所有環境中的應用程式日誌具有一致性、結構化且可操作。

## 日誌等級

### 標準日誌等級

| 等級 | 代碼 | 使用時機 | 生產環境 |
|------|------|---------|---------|
| TRACE | 10 | 非常詳細的除錯資訊 | 關閉 |
| DEBUG | 20 | 詳細的除錯資訊 | 關閉 |
| INFO | 30 | 正常操作事件 | 開啟 |
| WARN | 40 | 潛在問題、可恢復的錯誤 | 開啟 |
| ERROR | 50 | 需要關注的錯誤 | 開啟 |
| FATAL | 60 | 關鍵故障、應用程式終止 | 開啟 |

### 等級選擇指南

**TRACE**: 用於非常詳細的診斷輸出
- 函數進入/退出
- 迴圈迭代
- 除錯時的變數值

**DEBUG**: 用於診斷資訊
- 狀態變更
- 設定值
- 查詢參數

**INFO**: 用於正常操作事件
- 應用程式啟動/關閉
- 使用者操作完成
- 排程任務執行
- 外部服務呼叫完成

**WARN**: 用於潛在問題
- 已棄用的 API 使用
- 重試嘗試
- 資源接近限制
- 觸發後備行為

**ERROR**: 用於需要關注的錯誤
- 需要調查的失敗操作
- 有影響的已捕獲例外
- 整合失敗
- 資料驗證失敗

**FATAL**: 用於關鍵故障
- 無法恢復的錯誤
- 啟動失敗
- 關鍵資源遺失

## 結構化日誌

### 必要欄位

所有日誌條目應包含：

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

加入情境相關欄位：

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

- 欄位名稱使用 `snake_case`
- 跨服務使用一致的名稱
- 加上領域前綴：`http_`、`db_`、`queue_`

| 領域 | 常用欄位 |
|------|---------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| 資料庫 | db_query_type, db_table, db_duration_ms, db_rows_affected |
| 佇列 | queue_name, queue_message_id, queue_delay_ms |
| 使用者 | user_id, user_role, user_action |
| 請求 | request_id, trace_id, span_id |

## 敏感資料處理

### 絕不記錄

- 密碼或機密
- API 金鑰或令牌
- 信用卡號碼
- 身分證字號
- 完整的驗證令牌

### 遮罩或編輯

```javascript
// 錯誤
logger.info('登入嘗試', { password: userPassword });

// 正確
logger.info('登入嘗試', { password: '***REDACTED***' });

// 正確 - 部分遮罩
logger.info('卡片已處理', { last_four: '4242' });
```

### 個人識別資訊 (PII) 處理

- 盡可能記錄使用者 ID，而非電子郵件地址
- 對敏感查詢使用雜湊識別碼
- 設定資料保留政策

## 日誌格式標準

### JSON 格式（建議用於生產環境）

```json
{"timestamp":"2025-01-15T10:30:00.123Z","level":"INFO","message":"請求完成","request_id":"req_123","duration_ms":45}
```

### 人類可讀格式（開發環境）

```
2025-01-15T10:30:00.123Z [INFO] 請求完成 request_id=req_123 duration_ms=45
```

### 多行訊息

對於堆疊追蹤或大型資料：
- 主日誌條目保持單行
- 將堆疊追蹤包含在 `stack` 欄位中
- 使用 `...(truncated)` 截斷大型資料

## 錯誤日誌

### 必要錯誤欄位

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

### 錯誤情境

始終包含：
- 嘗試執行的操作
- 相關識別碼（user_id、request_id）
- 輸入參數（已清理）
- 重試次數（如適用）

```javascript
logger.error('訂單處理失敗', {
  error_type: err.name,
  error_message: err.message,
  order_id: orderId,
  user_id: userId,
  retry_count: 2,
  stack: err.stack
});
```

## 關聯與追蹤

### 請求關聯

使用 `request_id` 關聯單一請求內的所有日誌：

```javascript
// 中介軟體設定 request_id
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || generateId();
  res.setHeader('x-request-id', req.requestId);
  next();
});

// 後續所有日誌都包含它
logger.info('處理請求', { request_id: req.requestId });
```

### 分散式追蹤

對於微服務，包含：
- `trace_id`：整個請求流程的唯一 ID
- `span_id`：此特定操作的 ID
- `parent_span_id`：呼叫操作的 ID

## 效能考量

### 日誌量管理

| 環境 | 等級 | 量策略 |
|------|------|--------|
| 開發 | DEBUG | 所有日誌 |
| 預備 | INFO | 大部分日誌 |
| 生產 | INFO | 高流量採樣 |

### 高流量端點

對於每秒呼叫數千次的端點：
- 使用採樣（每 100 個記錄 1 個）
- 使用聚合指標而非個別日誌
- 使用獨立的日誌串流

### 非同步日誌

- 生產環境使用非同步/緩衝日誌
- 設定適當的緩衝區大小
- 優雅處理緩衝區溢位

## 日誌聚合

### 建議技術堆疊

| 元件 | 選項 |
|------|------|
| 收集 | Fluentd, Filebeat, Vector |
| 儲存 | Elasticsearch, Loki, CloudWatch |
| 視覺化 | Kibana, Grafana, Datadog |
| 告警 | PagerDuty, OpsGenie, Slack |

### 保留政策

| 日誌等級 | 保留期間 |
|---------|---------|
| DEBUG | 7 天 |
| INFO | 30 天 |
| WARN | 90 天 |
| ERROR/FATAL | 1 年 |

## 快速參考卡

### 日誌等級選擇

```
只是除錯用途？           → DEBUG（生產環境關閉）
正常操作完成？           → INFO
意外但可接受的情況？      → WARN
操作失敗？              → ERROR
應用程式無法繼續？       → FATAL
```

### 必要欄位檢查清單

- [ ] timestamp（ISO 8601）
- [ ] level
- [ ] message
- [ ] 服務名稱
- [ ] request_id 或 trace_id

### 安全檢查清單

- [ ] 無密碼或機密
- [ ] 無完整令牌
- [ ] PII 已遮罩或雜湊
- [ ] 永不記錄信用卡
- [ ] 已設定保留政策

---

**相關標準：**
- [測試標準](testing-standards.md) - 測試日誌輸出（或使用 `/testing-guide` 技能）
- [程式碼審查清單](code-review-checklist.md) - 審查日誌實踐

---

## 版本歷史

| 版本 | 日期 | 變更 |
|-----|------|------|
| 1.1.0 | 2026-01-05 | 新增：參考標準章節，包含 OWASP、RFC 5424、OpenTelemetry 和 12 Factor App |
| 1.0.0 | 2025-12-30 | 初始日誌標準 |

---

## 參考標準

- [OWASP 日誌備忘單](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) - 安全日誌最佳實踐
- [RFC 5424 - Syslog 協定](https://datatracker.ietf.org/doc/html/rfc5424) - 標準日誌訊息格式
- [OpenTelemetry 日誌](https://opentelemetry.io/docs/specs/otel/logs/) - 現代可觀測性標準
- [12 Factor App - 日誌](https://12factor.net/logs) - 雲原生日誌原則

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
