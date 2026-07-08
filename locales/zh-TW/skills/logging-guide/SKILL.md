---
name: logging
description: "[UDS] 實作結構化日誌，包含正確的日誌層級和敏感資料處理"
source: ../../../../skills/logging-guide/SKILL.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-07-08
source_hash: cf114de1df86
status: current
---

# 日誌指南

> **語言**: [English](../../../../skills/logging-guide/SKILL.md) | 繁體中文

**版本**: 1.4.0
**最後更新**: 2026-06-19
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

## 強制事件

把每則日誌格式化得再完美，但**在真正關鍵的時刻卻從不觸發**，比什麼都沒有還糟——它會在事故當下給人虛假的安心感。核心標準定義了**9 個必須產生日誌記錄的標準事件**。若日誌設定遵守層級／欄位規則卻遺漏這些事件，就是「規範上合格、實質上沉默」。務必全部實作這 9 項：

| 事件 id | 時機 | 層級 | 核心必要欄位 | 不可記錄 |
|----------|------|-------|----------------------|--------------|
| `application_startup` | 開機後、**接受請求前** | INFO | app_name, version, git_sha, environment, hostname, pid, listening_endpoints | secrets、完整連線字串 |
| `request_received` | Middleware 首次看到請求時 | INFO / DEBUG | method, path, source_ip, request_id | request body、auth headers |
| `validation_failure` | schema / ModelState / DTO 驗證拒絕時 | WARN | request_id, path, missing_fields[], payload_shape（僅 keys） | 欄位**值**、PII |
| `authentication_failure` | 登入 / token 驗證失敗時 | WARN | uid（嘗試值）, source_ip, failure_reason | password、token 值 |
| `outbound_call_start` | 發起對外 HTTP/RPC 呼叫時 | INFO | target_url（host+path）, 傳遞的 request_id, timeout_ms | credentials、bearer tokens |
| `outbound_call_complete` | 外部呼叫返回或失敗時 | INFO / WARN / ERROR | status_code **或** failure_phase（dns/tcp/tls/http）, elapsed_ms, retries | 含 PII 的 response body |
| `business_event` | 具狀態改變的業務操作完成時 | INFO | operation_name, actor, target ids, outcome | 完整 record payload、PII |
| `heartbeat` | 長期執行的背景服務，≥ 1 次 / 60 秒 | INFO | service_name, queue_depth, items_processed_since_last_heartbeat | — |
| `shutdown` | 行程結束時（正常或致命錯誤） | INFO / ERROR | app_name, signal/reason, uptime_seconds, pending_work_count | — |

**為何是這些事件**——每一項都補上一個真實的事故盲區：靜默的 `validation_failure` 會隱藏未記錄的 payload；`authentication_failure` 若缺 `uid`／`source_ip` 就無法調查；缺少 `heartbeat` 代表 0-byte 的日誌檔不會被察覺；沒有 `outbound_call_*` 會讓「送出失敗」變成一場找不到任何呼叫痕跡、耗時 2 天的追查。

> 背景服務若在 60 秒內未寫入任何 INFO/WARN/ERROR，**必須**發出一則 `heartbeat`；若連續 ≥ 2 倍間隔（≥ 120 秒）都沒有出現，沉默偵測器**必須**告警。

完整目錄（每個事件的 `when`／`must_log`／`must_NOT_log`／`rationale` 及合規範例），請參閱核心[日誌標準](../../core/logging-standards.md#強制事件-mandatory-events)的**強制事件**章節。

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
- [日誌標準](../../core/logging-standards.md)

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

## 日誌檔案輪替

基於檔案的 log sink **必須**同時設定兩種輪替觸發器——時間輪替**與**大小輪替。常見函式庫的預設大小上限（Serilog 1 GB、log4j/Winston/Python `RotatingFileHandler` 無上限）在正式環境中會造成靜默資料遺失。

```
✓ rollingInterval: Day                    # 時間輪替
✓ fileSizeLimitBytes: 104857600 (100 MB)  # 大小輪替
✓ rollOnFileSizeLimit: true               # 輪替，不要丟棄
✓ retainedFileCountLimit: ≥ N*7           # N = 每日最大輪替次數
```

當日誌檔案在預期的每日結束時達到 **`fileSizeLimitBytes` 的 ≥ 90%**，**調查噪音根因**（嘈雜的重試迴圈 / 不受限制的 debug 日誌 / stack trace 洪流），不要只提高上限。

> 含各語言設定範例（.NET Serilog / Python / Java log4j2 / Node Winston）及真實事故失敗模式參考的完整規格：請參閱核心標準的[日誌檔案輪替政策](../../core/logging-standards.md#日誌檔案輪替政策)。

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

### 輪替

- [ ] 已設定時間輪替（`rollingInterval: Day` 或等效設定）
- [ ] 已設定大小輪替（`fileSizeLimitBytes` + `rollOnFileSizeLimit: true`）
- [ ] `retainedFileCountLimit` ≥ N×7（N = 每日最大輪替次數）
- [ ] 已定義 90% 大小 SOP（調查噪音，勿只提高上限）

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

- [日誌標準](../../core/logging-standards.md)
- [錯誤碼標準](../../core/error-code-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.4.0 | 2026-06-19 | 新增：強制事件章節（9 個標準事件），消弭技能與核心標準之間的內容漂移；版號與核心日誌標準 v1.4.0 對齊（XSPEC-070 Phase 2） |
| 1.1.0 | 2026-05-26 | 新增：日誌檔案輪替章節及指向核心標準輪替政策的交叉連結；輪替清單（XSPEC-232） |
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授權

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)


## Next Steps Guidance | 下一步引導

After `/logging` completes, the AI assistant should suggest:

> **日誌標準已掌握。建議下一步 / Logging standards understood. Suggested next steps:**
> - 根據日誌指南在程式碼中實作結構化日誌 ⭐ **Recommended / 推薦** — 立即將日誌標準應用到專案 / Apply logging standards to the project immediately
> - 執行 `/errors` 設計錯誤碼以配合日誌系統 — 讓錯誤追蹤更有效率 / Make error tracking more efficient
> - 執行 `/sdd` 將可觀測性需求納入規格 — 確保日誌需求在規格中有定義 / Ensure logging requirements are defined in specs

