---
source: ../../../core/logging-standards.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-06-10
source_hash: 7853d510d681
status: current
---

# 日誌標準

> **語言**: [English](../../../core/logging-standards.md) | 繁體中文

**版本**: 1.3.0
**最後更新**: 2026-05-26
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: RFC 5424、OpenTelemetry、W3C Trace Context
**參考**: [opentelemetry.io](https://opentelemetry.io/)

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

---

## OpenTelemetry 整合

### 語義慣例

OpenTelemetry 定義標準化的屬性名稱，確保跨工具的互操作性。

**資源屬性**（服務身份）:

| 屬性 | 說明 | 範例 |
|------|------|------|
| `service.name` | 邏輯服務名稱 | `payment-service` |
| `service.version` | 服務版本 | `2.3.1` |
| `service.instance.id` | 唯一實例識別碼 | `pod-abc123` |
| `deployment.environment` | 環境名稱 | `production` |

**HTTP 屬性**:

| 屬性 | 說明 | 範例 |
|------|------|------|
| `http.request.method` | HTTP 方法 | `POST` |
| `http.route` | 路由模式 | `/api/v1/users/{id}` |
| `http.response.status_code` | 回應狀態 | `200` |

**資料庫屬性**:

| 屬性 | 說明 | 範例 |
|------|------|------|
| `db.system` | 資料庫類型 | `postgresql` |
| `db.name` | 資料庫名稱 | `orders_db` |
| `db.operation` | 操作類型 | `SELECT` |

### 日誌嚴重性對照

| 傳統等級 | OTel 嚴重性 | OTel 數值 |
|---------|------------|----------|
| TRACE | TRACE | 1-4 |
| DEBUG | DEBUG | 5-8 |
| INFO | INFO | 9-12 |
| WARN | WARN | 13-16 |
| ERROR | ERROR | 17-20 |
| FATAL | FATAL | 21-24 |

---

## 可觀測性三支柱整合

### 日誌、指標、追蹤關聯

現代可觀測性需要透過共享識別碼關聯三大支柱。

```
┌─────────────────────────────────────────────────────────────────┐
│                      可觀測性三支柱                               │
├─────────────────────────────────────────────────────────────────┤
│   ┌──────────┐    trace_id    ┌──────────┐    trace_id    ┌──────────┐
│   │   LOGS   │◄──────────────►│  TRACES  │◄──────────────►│ METRICS  │
│   │  (事件)   │                │  (Spans) │                │ (計數器)  │
│   └──────────┘                └──────────┘                └──────────┘
│                    關聯鍵: trace_id, span_id, service.name              │
└─────────────────────────────────────────────────────────────────┘
```

### 關聯最佳實踐

| 實踐 | 好處 |
|------|------|
| 日誌中始終包含 `trace_id` | 從日誌跳轉到完整追蹤 |
| 在指標中加入 `trace_id` 作為 exemplar | 調查指標異常 |
| 使用一致的 `service.name` | 跨所有支柱篩選 |

---

## 基於日誌的告警

### 告警設計原則

**1. 避免告警風暴**

```yaml
# 不好：每個錯誤都告警
- alert: ErrorOccurred
  expr: log_errors_total > 0  # ❌ 太吵雜

# 好：基於錯誤率告警
- alert: ErrorRateHigh
  expr: rate(log_errors_total[5m]) > 0.01  # ✅ 基於比率
  for: 5m
```

**2. 分組相關告警**

```yaml
group_by: ['service', 'error_type']
group_wait: 30s
group_interval: 5m
```

### 告警嚴重性指南

| 嚴重性 | 回應時間 | 條件範例 |
|--------|---------|---------|
| Critical | 立即（呼叫） | 服務當機、資料遺失風險 |
| Warning | 數小時內 | 錯誤率升高、資源 80% |
| Info | 下個工作日 | 棄用警告、輕微異常 |

---

## 進階關聯模式

### 跨服務關聯 ID

跨服務邊界傳播關聯上下文：

**W3C Trace Context 標頭**:

```http
traceparent: 00-abc123def456-span789-01
tracestate: vendor=value
```

**訊息佇列傳播**:

```json
{
  "headers": {
    "traceparent": "00-abc123-def456-01"
  },
  "body": {
    "order_id": "ORD-123"
  }
}
```

### 業務交易關聯

對於多步驟業務流程：

```json
{
  "trace_id": "abc123",
  "business_correlation": {
    "transaction_id": "TXN-789",
    "order_id": "ORD-456",
    "flow_step": "3/5",
    "flow_name": "order_fulfillment"
  }
}
```

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

---

## 日誌檔案輪替政策

### 輪替政策——必須同時設定兩者

基於檔案的 log sink 設定**必須**包含以下**兩種**觸發器：

1. **時間輪替**（`rollingInterval: Day` 或等效設定）——用於按時間分區
2. **大小輪替**，且 `rollOnFileSizeLimit: true`（或等效設定）——用於處理流量突增

> **為何強制要求：** 大多數日誌函式庫預設有靜默的大小上限。當檔案達到上限，後續的日誌寫入會被**靜默丟棄**——沒有警告、沒有錯誤。應用程式繼續運行，而半天的日誌就此消失。同時明確設定兩種觸發器可避免這個陷阱。

### 生產環境的預設上限是危險的

| 函式庫 | 預設大小上限 | 達到上限時的行為 |
|---|---|---|
| Serilog File sink (.NET) | 1 GB | **靜默停止寫入**（`RollOnFileSizeLimit = false` 為預設值） |
| log4j RollingFileAppender | 除非設定否則無限制 | 相同——不輪替 = 丟棄 |
| Python `RotatingFileHandler` | 除非設定 `maxBytes` 否則無限制 | 無限制增長 |
| Winston `winston-daily-rotate-file` | 除非設定 `maxSize` 否則無限制 | 相同——不輪替 = 丟棄 |

若未明確設定基於大小的輪替，即等同接受上述其中一種失敗模式。

### 建議的起始值

| 參數 | 值 | 理由 |
|---|---|---|
| `fileSizeLimitBytes` | 100 MB | 平衡：小到可用編輯器開啟，大到不會過度輪替 |
| `rollOnFileSizeLimit` | `true` | 達到上限時，建立 `*-001.txt`、`*-002.txt`；**不要**丟棄 |
| `retainedFileCountLimit` | ≥ N×7，N = 每日最大預期輪替次數 | 避免過早刪除時間窗口內的日誌 |

### 各語言設定範例

**.NET / Serilog** (`appsettings.json`):

```json
{
  "Serilog": {
    "WriteTo": [{
      "Name": "File",
      "Args": {
        "path": "logs/app-.txt",
        "rollingInterval": "Day",
        "fileSizeLimitBytes": 104857600,
        "rollOnFileSizeLimit": true,
        "retainedFileCountLimit": 90
      }
    }]
  }
}
```

**Python** (`logging.handlers`):

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    filename="logs/app.log",
    maxBytes=104857600,   # 100 MB
    backupCount=90        # ~3 個月的輪替，假設低基數
)
# 若需要時間+大小的組合輪替，可搭配 TimedRotatingFileHandler 與大小檢查
# 或使用第三方函式庫如 concurrent-log-handler。
```

**Java / log4j2** (`log4j2.xml`):

```xml
<RollingFile name="App" fileName="logs/app.log"
             filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
  <PatternLayout pattern="%d %-5p %c{1.} - %m%n"/>
  <Policies>
    <TimeBasedTriggeringPolicy interval="1"/>
    <SizeBasedTriggeringPolicy size="100 MB"/>
  </Policies>
  <DefaultRolloverStrategy max="90"/>
</RollingFile>
```

**Node / Winston** (`winston-daily-rotate-file`):

```javascript
import DailyRotateFile from "winston-daily-rotate-file";

new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m",
  maxFiles: "90d"
});
```

### 操作 SOP——調查根因，勿只提高上限

若日誌檔案大小在預期的每日結束時達到 `fileSizeLimitBytes` 的 ≥ 90%，**在提高上限前先調查原因**。常見根本原因：

- 嘈雜的重試迴圈將每次嘗試以 INFO 記錄，而非 WARN 摘要
- 在正式環境中意外啟用了不受限制的 debug 日誌
- 一個上游失敗造成 stack trace 洪流
- 健康探針 / sidecar 污染了業務日誌

提高上限只是掩蓋了底層的噪音問題，並將下次中斷推遲。

### 失敗模式參考（真實事故）

一個正式 .NET Worker 只使用 `rollingInterval: Day`（未設定大小限制，Serilog 預設 1 GB 上限），在 07:31 達到上限，靜默丟棄所有日誌條目直到 13:00+，操作員才注意到 tail 停滯。連續五個每日檔案顯示 `~1,073,741,8XX bytes`（= 1 GiB，Serilog 預設值）。半天的正式診斷資料就此消失。若設定 `fileSizeLimitBytes` + `rollOnFileSizeLimit: true`，就會輪替至 `worker-YYYYMMDD_001.txt` 並保留這些事件。

---

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

### 輪替清單

- [ ] 已設定時間輪替（`rollingInterval: Day` 或等效設定）
- [ ] 已設定大小輪替，且 `rollOnFileSizeLimit: true`（或等效設定）
- [ ] `fileSizeLimitBytes` 已明確設定（預設上限是危險的）
- [ ] `retainedFileCountLimit` ≥ N×7 以涵蓋時間窗口內的輪替
- [ ] 已定義 90% 大小 SOP：調查噪音根因，勿只提高上限

---

**相關標準：**
- [測試標準](testing-standards.md) - 測試日誌輸出（或使用 `/testing-guide` 技能）
- [程式碼審查清單](code-review-checklist.md) - 審查日誌實踐

---

## 版本歷史

| 版本 | 日期 | 變更 |
|-----|------|------|
| 1.3.0 | 2026-05-26 | 新增：日誌檔案輪替政策——強制雙觸發器（時間 + 大小）輪替及危險預設警告、.NET/Python/Java/Node 各語言設定範例、操作 SOP（XSPEC-232 / 關閉 issue #111） |
| 1.2.0 | 2026-01-24 | 新增：OpenTelemetry 語義慣例、可觀測性三支柱整合、基於日誌的告警、進階關聯模式 |
| 1.1.0 | 2026-01-05 | 新增：參考標準章節，包含 OWASP、RFC 5424、OpenTelemetry 和 12 Factor App |
| 1.0.0 | 2025-12-30 | 初始日誌標準 |

---

## 參考標準

- [OWASP 日誌備忘單](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) - 安全日誌最佳實踐
- [RFC 5424 - Syslog 協定](https://datatracker.ietf.org/doc/html/rfc5424) - 標準日誌訊息格式
- [OpenTelemetry 日誌](https://opentelemetry.io/docs/specs/otel/logs/) - 現代可觀測性標準
- [OpenTelemetry 語義慣例](https://opentelemetry.io/docs/specs/semconv/) - 標準化屬性命名
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) - 分散式追蹤上下文傳播
- [12 Factor App - 日誌](https://12factor.net/logs) - 雲原生日誌原則
- [Google SRE - 基於 SLO 告警](https://sre.google/workbook/alerting-on-slos/) - 告警設計最佳實踐

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
