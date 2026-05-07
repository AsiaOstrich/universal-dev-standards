# Execution History Repository Standard — 開發規格

**狀態**: Archived
**建立日期**: 2026-04-02
**參考實作**: 外部採用層實作（上游 SPEC-008，Phase 1-3 已實作）

> **本文件為自足規格**，包含所有實作所需的完整 schema 定義、範例和設計決策。
> 不需要讀取外部專案的文件即可進行開發。

---

## 摘要

在 UDS 中新增 `execution-history` 標準，定義 agent 執行歷史的 artifact 格式、目錄結構與分層存取模型。此標準將透過 `uds init` 安裝到下游專案，供 AI 工具（Claude Code、OpenCode 等）自動遵循。

## 動機

Meta-Harness 論文（arXiv:2603.28052）證實：給 agent 完整的先前執行歷史（而非壓縮摘要）能大幅提升效果。同一 benchmark 上 harness 設計差異可導致性能相差 6 倍。目前缺乏統一標準來規範執行歷史的保留格式。

---

## 設計決策（已決議）

| # | 問題 | 決議 | 理由 |
|---|------|------|------|
| 1 | 儲存方式 | **雙後端**：預設 local（L3 gitignore、L1 可選追蹤）；可配置外部 FileServer | 執行歷史是 append-only log，大量 artifacts 不適合 git |
| 2 | 大量 task 效能 | **分層索引**：`index.json`（最近 50 活躍 tasks）+ `index-archive.json`（> 90 天歸檔） | 最相關資訊先呈現（< 200 tokens） |
| 3 | run-number 格式 | **三位數字 001-999**，timestamp 存在 manifest.json 中 | 簡潔可讀可排序 |
| 4 | 標準分類 | `always-on-protocol`（與 developer-memory 一致） | AI 自動遵循，不需 slash command |

---

## 要新增/修改的檔案

### 1. `ai/standards/execution-history.ai.yaml`（新增）

AI 優化版標準。格式參照 `developer-memory.ai.yaml`。

**完整 YAML 內容（直接作為實作依據）：**

```yaml
# Execution History Repository Standards - AI Optimized
# Source: core/execution-history.md

standard:
  id: execution-history
  name: "Execution History Repository Standards"
  description: "Structured system for persisting agent execution artifacts with L1/L2/L3 tiered access model"
  guidelines:
    - "每次 agent 任務執行完畢後，必須產出 required artifacts"
    - "歷史以檔案系統目錄結構組織，支援直接路徑存取"
    - "提供 L1/L2/L3 三層存取，平衡資訊量與 token 成本"
    - "敏感資訊在寫入時自動 redact"
    - "跨專案僅共享 L1 層級，遵守授權隔離"

  meta:
    version: "1.0.0"
    updated: "2026-04-02"
    source: core/execution-history.md
    description: "基於 Meta-Harness 論文洞見，建立跨專案執行歷史標準"

  schema:
    storage:
      description: "執行歷史為 append-only log，支援兩種儲存後端"
      backends:
        local:
          description: "儲存在 repo 內的 .execution-history/ 目錄"
          git_policy: |
            L3 artifacts 不追蹤（納入 .gitignore），L1 index.json 可選追蹤。
            歷史本質是寫入後不變動的 log，不適合 git 追蹤大量變動。
          gitignore_rules: |
            .execution-history/*/           # L3 artifacts 不追蹤
            !.execution-history/index.json  # L1 索引可選追蹤
            !.execution-history/index-archive.json  # L1 歸檔索引可選追蹤
          when_to_use: "個人開發、小型專案、或不需跨環境共享歷史時"
        file_server:
          description: "儲存在外部 FileServer（如 S3、MinIO、NAS、共享磁碟）"
          config_file: ".execution-history/storage.json"
          config_schema:
            backend: { type: string, enum: [local, file_server] }
            file_server_url: { type: string, description: "FileServer 端點 URL" }
            auth_method: { type: string, enum: [none, api_key, oauth], default: none }
            sync_l1_to_local: { type: boolean, default: true, description: "是否將 L1 索引同步到本地" }
          when_to_use: "團隊協作、跨環境共享、歷史量大、或需要長期保存時"
          rules:
            - "L1 索引始終同步到本地（sync_l1_to_local: true），確保離線可讀"
            - "L2/L3 按需從 FileServer 拉取"
            - "寫入走 FileServer API，本地不留 L3 副本"
      default_backend: local

    directory_structure:
      root: ".execution-history/"
      layout: |
        .execution-history/
        ├── storage.json                        # 儲存後端配置（可選，預設 local）
        ├── index.json                          # L1: 最近 50 個活躍 tasks 索引
        ├── index-archive.json                  # L1-ext: 歸檔 tasks 索引（> 90 天無新 run）
        ├── {task-id}/
        │   ├── manifest.json                   # L2: 任務層級摘要
        │   ├── {run-number}/                   # 三位數字（001-999）
        │   │   ├── manifest.json               # L2: 單次執行摘要
        │   │   ├── task-description.md          # Required: 任務描述
        │   │   ├── code-diff.patch              # Required: 程式碼變更
        │   │   ├── test-results.json            # Required: 測試結果
        │   │   ├── execution-log.jsonl          # Required: 執行日誌
        │   │   ├── token-usage.json             # Required: Token 使用量
        │   │   ├── final-status.json            # Required: 最終狀態
        │   │   ├── error-analysis.md            # Optional: 錯誤分析
        │   │   └── agent-reasoning.md           # Optional: Agent 推理過程
        │   └── ...
        └── ...
      index_strategy:
        description: "分層索引策略，平衡即時性與歷史完整性"
        active_index: "index.json — 最近 50 個活躍 tasks（< 200 tokens 目標）"
        archive_index: "index-archive.json — 超過 90 天無新 run 的 tasks 自動歸檔"
        archive_trigger: "task 最後一次 run 距今 > 90 天"
        reactivate_trigger: "歸檔 task 有新 run 時自動移回 active index"

    artifacts:
      required:
        - id: task-description
          file: "task-description.md"
          format: markdown
          description: "任務目標、輸入、預期產出"
          max_size: "2KB"
        - id: code-diff
          file: "code-diff.patch"
          format: "unified diff"
          description: "本次執行產生的程式碼變更"
          max_size: "50KB"
        - id: test-results
          file: "test-results.json"
          format: json
          description: "測試執行結果（通過/失敗/跳過數量、失敗詳情）"
          schema_ref: "#/definitions/test-results"
        - id: execution-log
          file: "execution-log.jsonl"
          format: jsonl
          description: "結構化執行日誌（每行一個事件）"
          schema_ref: "#/definitions/log-entry"
        - id: token-usage
          file: "token-usage.json"
          format: json
          description: "Token 使用量明細（input/output/total，按步驟分）"
          schema_ref: "#/definitions/token-usage"
        - id: final-status
          file: "final-status.json"
          format: json
          description: "最終狀態（success/failure/partial，含摘要）"
          schema_ref: "#/definitions/final-status"
      optional:
        - id: error-analysis
          file: "error-analysis.md"
          format: markdown
          description: "失敗時的根因分析"
          condition: "status != success"
        - id: agent-reasoning
          file: "agent-reasoning.md"
          format: markdown
          description: "Agent 的推理過程與決策紀錄"

    access_layers:
      L1:
        name: "索引層"
        files:
          active: "index.json"
          archive: "index-archive.json"
        target_tokens: "< 200 (active), 按需 (archive)"
        fields:
          - task_id
          - task_name
          - tags
          - latest_run
          - latest_status
          - latest_date
          - total_runs
        cross_project_access: true
      L2:
        name: "摘要層"
        file: "manifest.json"
        target_tokens: "< 1,000 per task"
        fields:
          - task_description_summary
          - run_history
          - key_metrics
          - artifacts_available
          - failure_summary
        cross_project_access: false
      L3:
        name: "完整紀錄層"
        file: "各 artifact 檔案"
        target_tokens: "不限"
        description: "直接讀取 run 目錄下的個別 artifact 檔案"
        cross_project_access: false

    retention_policy:
      configurable: true
      defaults:
        max_runs_per_task: 50
        max_total_size_mb: 500
        cleanup_strategy: "oldest_l3_first"
      rules:
        - "超過 max_runs 時，最舊的 run 的 L3 artifacts 被刪除"
        - "L1 和 L2 索引永久保留（除非手動刪除）"
        - "cleanup 以 task 為單位，不跨 task 清理"

    sensitive_data:
      redact_on_write: true
      sensitive_patterns:
        - pattern: "sk-[a-zA-Z0-9_-]{20,}"
          label: "API_KEY"
        - pattern: "ghp_[a-zA-Z0-9]{36}"
          label: "GITHUB_TOKEN"
        - pattern: "password\\s*[:=]\\s*\\S+"
          label: "PASSWORD"
        - pattern: "-----BEGIN .* PRIVATE KEY-----"
          label: "PRIVATE_KEY"
      redact_format: "[REDACTED:{label}]"

  definitions:
    test-results:
      type: object
      required: [timestamp, summary, details]
      properties:
        timestamp:
          type: string
          format: "ISO 8601"
        summary:
          type: object
          properties:
            total: { type: integer }
            passed: { type: integer }
            failed: { type: integer }
            skipped: { type: integer }
        details:
          type: array
          items:
            type: object
            properties:
              test_name: { type: string }
              status: { type: string, enum: [passed, failed, skipped] }
              duration_ms: { type: integer }
              error_message: { type: string }

    log-entry:
      type: object
      required: [timestamp, level, event]
      properties:
        timestamp: { type: string, format: "ISO 8601" }
        level: { type: string, enum: [debug, info, warn, error] }
        event: { type: string }
        details: { type: object }
        tool_call: { type: string }
        tokens: { type: integer }

    token-usage:
      type: object
      required: [total, breakdown]
      properties:
        total:
          type: object
          properties:
            input_tokens: { type: integer }
            output_tokens: { type: integer }
        breakdown:
          type: array
          items:
            type: object
            properties:
              step: { type: string }
              input_tokens: { type: integer }
              output_tokens: { type: integer }

    final-status:
      type: object
      required: [status, summary, timestamp]
      properties:
        status: { type: string, enum: [success, failure, partial] }
        summary: { type: string }
        timestamp: { type: string, format: "ISO 8601" }
        duration_seconds: { type: number }
        error: { type: string }

  rules:
    - id: record-on-completion
      trigger: "Agent 任務執行完畢（無論成功或失敗）"
      instruction: >
        在任務完成後，依據 storage.json 配置的後端（預設 local），
        將所有 required artifacts 寫入 .execution-history/{task-id}/{run-number}/ 目錄，
        並更新 task manifest.json 和根 index.json。
        若使用 file_server 後端，寫入走 FileServer API，
        同時將 L1 索引同步到本地。
      priority: required

    - id: use-l1-first
      trigger: "Agent 需要參考先前執行歷史"
      instruction: >
        先讀取 .execution-history/index.json（L1）篩選相關任務，
        再讀取相關任務的 manifest.json（L2）了解脈絡，
        僅在需要深入診斷時才讀取 L3 完整 artifacts。
      priority: required

    - id: redact-sensitive
      trigger: "寫入任何 artifact 到 .execution-history/"
      instruction: >
        在寫入前，掃描內容中的 sensitive_patterns，
        將匹配內容替換為 [REDACTED:{label}] 格式。
      priority: required

    - id: respect-retention
      trigger: "新 run 寫入後，檢查 retention_policy"
      instruction: >
        檢查該 task 的 run 數量是否超過 max_runs_per_task，
        若超過則刪除最舊 run 的 L3 artifacts，保留 L1/L2 索引。
      priority: recommended

    - id: archive-stale-tasks
      trigger: "index.json 更新時，檢查是否有 task 需要歸檔"
      instruction: >
        若 index.json 中某 task 的 latest_date 距今超過 90 天，
        將該 task 從 index.json 移至 index-archive.json。
        若歸檔 task 有新 run 寫入，自動移回 index.json。
        index.json 最多保留 50 個活躍 tasks。
      priority: recommended

    - id: cross-project-l1-only
      trigger: "從其他專案讀取執行歷史"
      instruction: >
        跨專案存取僅限 L1 層級（index.json），
        不得讀取 L2/L3 層級以遵守授權隔離。
      priority: required

  storage:
    directory: ".execution-history/"
    format: "JSON + Markdown + JSONL + Patch"

  architecture:
    classification: always-on-protocol
    note: >
      Execution History 是 Always-On Protocol，
      與 developer-memory、project-context-memory 同層級。
      AI 自動遵循所有 rules，不需要 slash command。
```

---

## JSON 範例（供 core/execution-history.md 使用）

### storage.json（儲存後端配置）

**Local（預設，可省略此檔案）：**
```json
{ "backend": "local" }
```

**FileServer：**
```json
{
  "backend": "file_server",
  "file_server_url": "https://minio.internal:9000/execution-history",
  "auth_method": "api_key",
  "sync_l1_to_local": true
}
```

### index.json（L1 — 活躍索引）

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
    },
    {
      "task_id": "fix-rate-limiter",
      "task_name": "修復 Rate Limiter 記憶體洩漏",
      "tags": ["bugfix", "performance", "rate-limit"],
      "latest_run": "001",
      "latest_status": "failure",
      "latest_date": "2026-04-01",
      "total_runs": 1
    }
  ]
}
```

### index-archive.json（L1-ext — 歸檔索引）

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

### manifest.json（L2 — task 層級）

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

---

### 2. `core/execution-history.md`（新增）

完整 Markdown 參考文件。

**章節大綱：**

1. **概述** — 標準目的與適用場景
2. **動機與研究依據** — Meta-Harness 論文洞見（同一 benchmark 性能差 6 倍）
3. **核心概念**
   - Artifact 類型（6 required + 2 optional，詳見上方 YAML schema.artifacts）
   - 目錄結構圖（詳見上方 YAML schema.directory_structure.layout）
   - L1/L2/L3 分層存取模型（詳見上方 YAML schema.access_layers）
4. **Schema 定義**
   - index.json（L1）— 使用上方 JSON 範例
   - manifest.json（L2）— 使用上方 JSON 範例
   - 各 artifact 格式（使用上方 YAML definitions 區塊）
5. **儲存後端**
   - Local（預設）：gitignore 規則（詳見上方 YAML schema.storage.backends.local）
   - FileServer：storage.json 配置（詳見上方 JSON 範例）
6. **保留策略** — max_runs=50, archive_threshold=90天, cleanup=oldest_l3_first
7. **敏感資料 Redaction** — 4 個預設 patterns（API key, GitHub token, password, private key）
8. **跨專案存取規則** — L1 only（cross_project_access: true 僅限 L1）
9. **使用範例** — Agent 讀取歷史的步驟（L1 篩選 → L2 摘要 → L3 深入）
10. **相關標準** — developer-memory, project-context-memory, workflow-state-protocol

### 3. `specs/schemas/execution-history-*.schema.json`（新增 6 個）

從 `execution-history.ai.yaml` 的 `definitions` 區塊匯出獨立的 JSON Schema 檔案，供採用層在 CI 中做合約測試。

| Schema 檔案 | 驗證對象 |
|-------------|---------|
| `execution-history-index.schema.json` | index.json（L1） |
| `execution-history-manifest.schema.json` | manifest.json（L2） |
| `execution-history-test-results.schema.json` | test-results.json |
| `execution-history-log-entry.schema.json` | execution-log.jsonl 每行 |
| `execution-history-token-usage.schema.json` | token-usage.json |
| `execution-history-final-status.schema.json` | final-status.json |

每個 schema 須包含 `version` 欄位（與 `execution-history.ai.yaml` 的 `meta.version` 一致），用於跨專案版本追蹤。

### 4. `cli/standards-registry.json`（修改）

在 `standards` 陣列中新增 entry：

```json
{
  "id": "execution-history",
  "name": "Execution History Repository Standards",
  "nameZh": "執行歷史倉庫標準",
  "source": {
    "human": "core/execution-history.md",
    "ai": "ai/standards/execution-history.ai.yaml"
  },
  "category": "reference",
  "skillName": null,
  "description": "Structured system for persisting agent execution artifacts with L1/L2/L3 tiered access model"
}
```

---

## 驗收條件

### AC-1: AI 標準 YAML 可載入

- **GIVEN** `ai/standards/execution-history.ai.yaml` 已建立
- **WHEN** 執行 `node -e "require('js-yaml').load(require('fs').readFileSync('ai/standards/execution-history.ai.yaml'))"`
- **THEN** 解析成功且無錯誤，且 `standard.id` 為 `"execution-history"`

### AC-2: YAML Schema 包含完整 definitions

- **GIVEN** `execution-history.ai.yaml` 已建立
- **WHEN** 檢查 `definitions` 區塊
- **THEN** 包含 4 個 schema 定義：`test-results`、`log-entry`、`token-usage`、`final-status`

### AC-3: Core Markdown 參考文件完整

- **GIVEN** `core/execution-history.md` 已建立
- **WHEN** 檢查章節結構
- **THEN** 包含規格定義的 10 個章節，且 JSON 範例與 YAML schema 一致

### AC-4: Registry 註冊成功

- **GIVEN** `cli/standards-registry.json` 已更新
- **WHEN** 執行 `node cli/bin/uds.js list`
- **THEN** 輸出包含 `execution-history` 標準，且 `category` 為 `"reference"`、`skillName` 為 `null`

### AC-5: JSON Schema 檔案可驗證

- **GIVEN** `specs/schemas/execution-history-*.schema.json` 6 個檔案已建立
- **WHEN** 對每個 schema 檔案執行 JSON 解析
- **THEN** 全部解析成功，且各 schema 的 `version` 欄位與 YAML `meta.version` 一致

### AC-6: 與同類標準架構對齊

- **GIVEN** `execution-history` 標準完成
- **WHEN** 比對 `developer-memory` 和 `project-context-memory` 的 registry entry 結構
- **THEN** `category`、`skillName`、`source` 格式一致；`architecture.classification` 為 `always-on-protocol`

### AC-7: 同步檢查通過

- **GIVEN** 所有檔案已建立並更新
- **WHEN** 執行 `./scripts/check-standards-sync.sh`
- **THEN** 無 `execution-history` 相關的同步錯誤

---

## 驗證方式

| 項目 | 方法 | 對應 AC |
|------|------|---------|
| YAML 語法 | `node -e "require('js-yaml').load(require('fs').readFileSync('ai/standards/execution-history.ai.yaml'))"` | AC-1 |
| Schema 完整性 | 檢查 definitions 包含 4 個 schema | AC-2 |
| Markdown 結構 | 確認 10 章節完整、範例可讀 | AC-3 |
| Registry JSON | `node cli/bin/uds.js list` 顯示 execution-history | AC-4 |
| JSON Schema | 6 個 schema 檔案可解析且版本一致 | AC-5 |
| 架構對齊 | 比對 developer-memory registry entry | AC-6 |
| 同步檢查 | `./scripts/check-standards-sync.sh` | AC-7 |

---

## 實作注意事項

- `architecture.classification` 設為 `always-on-protocol`（與 developer-memory 一致）
- 不需要建立 skill 或 slash command（此標準由 AI 自動遵循）
- `category` 為 `reference`（非 skill）
- Markdown 中的 JSON Schema 範例直接引用 XSPEC-003-SDD 的 definitions 區塊
