# Execution History Repository Standards

**Applicability**: All AI-assisted software projects
**Scope**: universal
**Version**: 1.0.0

> Structured system for persisting agent execution artifacts with L1/L2/L3 tiered access model.

---

## 1. 概述

Execution History Repository 標準定義了 AI agent 執行歷史的 artifact 格式、目錄結構與分層存取模型。此標準為 Always-On Protocol，AI agent 自動遵循，不需要 slash command。

**適用場景：**
- AI agent 執行任務後需要留下可追溯的紀錄
- 團隊需要分析 agent 的執行效率與成功率
- 跨 session 需要參考先前的執行歷史來提升品質

---

## 2. 動機與研究依據

Meta-Harness 論文（arXiv:2603.28052）證實：給 agent 完整的先前執行歷史（而非壓縮摘要）能大幅提升效果。同一 benchmark 上 harness 設計差異可導致性能相差 **6 倍**。

**核心洞見：**
- 完整歷史 > 壓縮摘要
- 結構化格式 > 自由文字
- 分層存取 > 全量載入（token 效率）

---

## 3. 核心概念

### 3.1 Artifact 類型

每次 agent 執行完畢後，必須產出以下 artifacts：

**Required（6 個）：**

| Artifact | 檔案 | 格式 | 說明 |
|----------|------|------|------|
| task-description | `task-description.md` | Markdown | 任務目標、輸入、預期產出（≤ 2KB） |
| code-diff | `code-diff.patch` | Unified Diff | 本次執行產生的程式碼變更（≤ 50KB） |
| test-results | `test-results.json` | JSON | 測試執行結果（通過/失敗/跳過數量、失敗詳情） |
| execution-log | `execution-log.jsonl` | JSONL | 結構化執行日誌（每行一個事件） |
| token-usage | `token-usage.json` | JSON | Token 使用量明細（input/output/total，按步驟分） |
| final-status | `final-status.json` | JSON | 最終狀態（success/failure/partial，含摘要） |

**Optional（2 個）：**

| Artifact | 檔案 | 格式 | 條件 |
|----------|------|------|------|
| error-analysis | `error-analysis.md` | Markdown | status != success |
| agent-reasoning | `agent-reasoning.md` | Markdown | 選填 |

### 3.2 目錄結構

```
.execution-history/
├── storage.json                        # 儲存後端配置（可選，預設 local）
├── index.json                          # L1: 最近 50 個活躍 tasks 索引
├── index-archive.json                  # L1-ext: 歸檔 tasks 索引（> 90 天無新 run）
├── {task-id}/
│   ├── manifest.json                   # L2: 任務層級摘要
│   ├── {run-number}/                   # 三位數字（001-999）
│   │   ├── manifest.json               # L2: 單次執行摘要
│   │   ├── task-description.md          # Required
│   │   ├── code-diff.patch              # Required
│   │   ├── test-results.json            # Required
│   │   ├── execution-log.jsonl          # Required
│   │   ├── token-usage.json             # Required
│   │   ├── final-status.json            # Required
│   │   ├── error-analysis.md            # Optional
│   │   └── agent-reasoning.md           # Optional
│   └── ...
└── ...
```

### 3.3 L1/L2/L3 分層存取模型

| 層級 | 名稱 | 檔案 | Token 目標 | 跨專案 |
|------|------|------|-----------|--------|
| **L1** | 索引層 | `index.json` / `index-archive.json` | < 200 | ✅ |
| **L2** | 摘要層 | `manifest.json` | < 1,000/task | ❌ |
| **L3** | 完整紀錄層 | 各 artifact 檔案 | 不限 | ❌ |

**存取策略：** L1 篩選 → L2 摘要 → L3 深入（僅在需要時）

---

## 4. Schema 定義

### 4.1 index.json（L1）

```json
{
  "version": "1.0.0",
  "updated": "2026-04-02T15:30:00Z",
  "max_active_tasks": 50,
  "archive_threshold_days": 90,
  "tasks": [
    {
      "task_id": "impl-auth-flow",
      "task_name": "實作使用者驗證流程",
      "tags": ["auth", "api", "feature"],
      "latest_run": "003",
      "latest_status": "success",
      "latest_date": "2026-04-02",
      "total_runs": 3
    }
  ]
}
```

**L1 欄位：** `task_id`, `task_name`, `tags`, `latest_run`, `latest_status`, `latest_date`, `total_runs`

### 4.2 index-archive.json（L1-ext）

```json
{
  "version": "1.0.0",
  "updated": "2026-04-02T15:30:00Z",
  "description": "超過 90 天無新 run 的 tasks，從 index.json 自動歸檔至此",
  "tasks": [
    {
      "task_id": "init-project-scaffold",
      "task_name": "初始化專案腳手架",
      "tags": ["setup", "scaffold"],
      "latest_run": "002",
      "latest_status": "success",
      "latest_date": "2025-12-15",
      "total_runs": 2
    }
  ]
}
```

### 4.3 manifest.json（L2）

```json
{
  "task_id": "impl-auth-flow",
  "task_description_summary": "實作 JWT-based 使用者驗證流程，含登入、登出、token refresh",
  "run_history": [
    { "run": "001", "status": "failure", "date": "2026-03-30", "duration_s": 342, "tokens_total": 45200 },
    { "run": "002", "status": "partial", "date": "2026-04-01", "duration_s": 518, "tokens_total": 62100 },
    { "run": "003", "status": "success", "date": "2026-04-02", "duration_s": 287, "tokens_total": 38900 }
  ],
  "key_metrics": {
    "pass_rate": 0.33,
    "avg_tokens": 48733,
    "avg_duration_s": 382
  },
  "artifacts_available": ["task-description", "code-diff", "test-results", "execution-log", "token-usage", "final-status"],
  "failure_summary": "Run 001: JWT secret 未配置導致 token 簽發失敗；Run 002: refresh token 過期邏輯未處理邊界案例"
}
```

### 4.4 test-results.json

```json
{
  "timestamp": "2026-04-02T15:30:00Z",
  "summary": {
    "total": 42,
    "passed": 40,
    "failed": 1,
    "skipped": 1
  },
  "details": [
    {
      "test_name": "should_authenticate_user_with_valid_credentials",
      "status": "passed",
      "duration_ms": 120
    },
    {
      "test_name": "should_reject_expired_token",
      "status": "failed",
      "duration_ms": 85,
      "error_message": "Expected 401 but received 200"
    }
  ]
}
```

### 4.5 execution-log.jsonl

每行一個 JSON 物件：

```jsonl
{"timestamp": "2026-04-02T15:00:00Z", "level": "info", "event": "task_started", "details": {"task_id": "impl-auth-flow"}}
{"timestamp": "2026-04-02T15:01:23Z", "level": "info", "event": "tool_called", "tool_call": "Read", "tokens": 1500}
{"timestamp": "2026-04-02T15:05:00Z", "level": "error", "event": "test_failure", "details": {"test": "should_reject_expired_token"}}
```

### 4.6 token-usage.json

```json
{
  "total": {
    "input_tokens": 25000,
    "output_tokens": 13900
  },
  "breakdown": [
    { "step": "read_existing_code", "input_tokens": 8000, "output_tokens": 200 },
    { "step": "implement_auth_flow", "input_tokens": 5000, "output_tokens": 8000 },
    { "step": "run_tests", "input_tokens": 12000, "output_tokens": 5700 }
  ]
}
```

### 4.7 final-status.json

```json
{
  "status": "success",
  "summary": "JWT-based 驗證流程已實作完成，42 個測試全部通過",
  "timestamp": "2026-04-02T15:30:00Z",
  "duration_seconds": 287
}
```

失敗時：

```json
{
  "status": "failure",
  "summary": "JWT secret 未配置導致 token 簽發失敗",
  "timestamp": "2026-03-30T14:00:00Z",
  "duration_seconds": 342,
  "error": "ConfigurationError: JWT_SECRET environment variable is not set"
}
```

---

## 5. 儲存後端

### 5.1 Local（預設）

儲存在 repo 內的 `.execution-history/` 目錄。

**Git 策略：**
- L3 artifacts 不追蹤（納入 `.gitignore`）
- L1 `index.json` 可選追蹤

**.gitignore 規則：**
```gitignore
.execution-history/*/           # L3 artifacts 不追蹤
!.execution-history/index.json  # L1 索引可選追蹤
!.execution-history/index-archive.json  # L1 歸檔索引可選追蹤
```

### 5.2 FileServer

儲存在外部 FileServer（如 S3、MinIO、NAS、共享磁碟）。

**storage.json 配置：**
```json
{
  "backend": "file_server",
  "file_server_url": "https://minio.internal:9000/execution-history",
  "auth_method": "api_key",
  "sync_l1_to_local": true
}
```

| 欄位 | 類型 | 預設 | 說明 |
|------|------|------|------|
| `backend` | `"local"` \| `"file_server"` | `"local"` | 儲存後端 |
| `file_server_url` | string | — | FileServer 端點 URL |
| `auth_method` | `"none"` \| `"api_key"` \| `"oauth"` | `"none"` | 認證方式 |
| `sync_l1_to_local` | boolean | `true` | 是否將 L1 索引同步到本地 |

**FileServer 規則：**
- L1 索引始終同步到本地（`sync_l1_to_local: true`），確保離線可讀
- L2/L3 按需從 FileServer 拉取
- 寫入走 FileServer API，本地不留 L3 副本

---

## 6. 保留策略

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `max_runs_per_task` | 50 | 每個 task 最大保留 run 數 |
| `max_total_size_mb` | 500 | 總容量上限 |
| `cleanup_strategy` | `oldest_l3_first` | 清理策略 |

**清理規則：**
- 超過 `max_runs` 時，最舊的 run 的 L3 artifacts 被刪除
- L1 和 L2 索引永久保留（除非手動刪除）
- cleanup 以 task 為單位，不跨 task 清理

---

## 7. 敏感資料 Redaction

所有 artifact 在寫入前自動掃描並 redact 敏感資訊。

**預設 patterns：**

| Pattern | Label | 匹配目標 |
|---------|-------|---------|
| `sk-[a-zA-Z0-9_-]{20,}` | `API_KEY` | API 金鑰 |
| `ghp_[a-zA-Z0-9]{36}` | `GITHUB_TOKEN` | GitHub Token |
| `password\s*[:=]\s*\S+` | `PASSWORD` | 密碼 |
| `-----BEGIN .* PRIVATE KEY-----` | `PRIVATE_KEY` | 私鑰 |

**Redact 格式：** `[REDACTED:{label}]`

---

## 8. 跨專案存取規則

- 跨專案存取**僅限 L1 層級**（`index.json`）
- **不得**讀取 L2/L3 層級以遵守授權隔離
- L1 提供足夠的資訊進行篩選（task_id, task_name, tags, latest_status）

---

## 9. 使用範例

### Agent 讀取歷史的步驟

```
1. 讀取 .execution-history/index.json（L1）
   → 篩選相關任務（< 200 tokens）

2. 讀取相關任務的 manifest.json（L2）
   → 了解執行脈絡與歷史（< 1,000 tokens/task）

3. 僅在需要深入診斷時，讀取 L3 完整 artifacts
   → 讀取 code-diff.patch、test-results.json 等
```

### Agent 寫入歷史的步驟

```
1. 任務完成後，建立 .execution-history/{task-id}/{run-number}/ 目錄
2. 寫入所有 required artifacts（6 個檔案）
3. 寫入前對內容執行敏感資料 redaction
4. 更新 task 的 manifest.json（L2）
5. 更新根 index.json（L1）
6. 檢查 retention policy，清理超額 runs
7. 檢查是否有 stale tasks 需要歸檔
```

---

## 10. 相關標準

| 標準 | 關係 |
|------|------|
| [Developer Memory](developer-memory.md) | 同為 Always-On Protocol，記錄開發者洞見 |
| [Project Context Memory](project-context-memory.md) | 同為 Always-On Protocol，記錄專案決策 |
| [Workflow State Protocol](workflow-state-protocol.md) | 工作流程狀態管理 |
