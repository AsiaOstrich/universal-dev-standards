---
name: orchestrate
version: 2.0.0
scope: universal
description: |
  Orchestrate multi-task execution plans using Claude's native Agent tool (DAG-based, no external engine).
  Use when: executing a plan.json file with parallel/sequential task dependencies.
  Keywords: orchestrate, plan, execute, DAG, task plan, 編排, 執行計畫, 並行.
argument-hint: "<plan.json> [--dry-run]"
---

# /orchestrate — 任務計畫編排 Skill

## 用法

```
/orchestrate <plan.json>           # 執行計畫
/orchestrate <plan.json> --dry-run # 僅驗證，不執行
```

---

## 執行流程

### Step 1: 讀取與解析計畫（Claude-native）

使用 Read tool 讀取 plan.json，直接由 Claude 解析：

1. 讀取 JSON 檔案，解析為任務清單
2. 驗證結構：`tasks` 非空、每個 task 含 `id`、`title`、`spec`
3. 安全掃描：檢查 `task.spec` 是否含危險指令（`rm -rf /`、`DROP DATABASE`、`git push --force`）
   - 若發現安全問題，列出所有問題並**詢問使用者是否繼續**
4. 拓撲排序：依 `depends_on` 欄位將 tasks 分組為執行層（layers）
   - Layer 0：沒有依賴的 tasks（可並行）
   - Layer N：依賴全部在 Layer 0..N-1 中的 tasks

若 `validation.valid` 為 false，輸出錯誤訊息並停止。

---

### Step 2: 呈現執行計畫

向使用者顯示解析結果：

```
計畫：<project>  品質：<quality>
──────────────────────────────────
Layer 0 (並行)：T-001, T-002
Layer 1 (序列)：T-003 (依賴 T-001)
Layer 2 (序列)：T-004 (依賴 T-002, T-003)
──────────────────────────────────
共 4 個任務，3 個執行層
```

若使用 `--dry-run`：顯示以上摘要後**立即停止**，不啟動任何 Agent。

---

### Step 3: 逐層執行

對 `layers` 陣列中的每一層：

1. **同層並行**：同一層的 tasks 在同一訊息中啟動多個 Agent tool
2. **Agent tool 參數**：
   - `prompt`：task.spec + acceptance_criteria + user_intent 組合而成的執行提示
   - `isolation: "worktree"`：每個 task 在獨立 git worktree 執行
   - `description`：`"Task {task.id}: {task.title}"`
3. **等待完成**：所有同層 agents 完成後，才進入下一層

**Agent 提示範本**：
```
Task: {task.title}

Spec:
{task.spec}

Acceptance Criteria:
{task.acceptance_criteria 逐條列出}

User Intent:
{task.user_intent}

After completing the task, run: {task.verify_command}
```

---

### Step 4: 依賴失敗處理

如果某個 task 的 agent 回報失敗：
- 標記該 task 為 `failed`
- 後續層中 `depends_on` 包含該 task ID 的所有 tasks 標記為 `skipped`
- 繼續執行不受影響的 tasks
- 最終報告中標示失敗原因

---

### Step 5: Quality Gate

每個 task 完成後，若 task 定義了 `verify_command`：

1. 使用 Bash tool 執行 `verify_command`
2. **成功**：記錄 `status: "success"`
3. **失敗**：
   - 若 `quality` 為 `"strict"` 或 `"standard"`：啟動 Fix Loop
   - Fix Loop：將錯誤輸出回傳給 agent，重新執行（最多 3 次）
   - 超過重試上限：標記為 `failed`

---

### Step 6: Judge 審查（選用）

如果 task 定義了 `judge: true`：
- 啟動一個額外的 Agent tool 進行審查
- 提示：`審查 task {id} 的 git diff，依照 code-review 標準檢查`
- Judge 結果附加到最終報告

---

### Step 7: 產出報告

彙整所有 task 結果，輸出執行報告：

```json
{
  "summary": {
    "total_tasks": 4,
    "succeeded": 3,
    "failed": 1,
    "skipped": 0,
    "total_duration_ms": 120000
  },
  "tasks": [
    { "task_id": "T-001", "status": "success", "duration_ms": 30000 },
    { "task_id": "T-002", "status": "failed",  "error": "..." },
    { "task_id": "T-003", "status": "skipped", "reason": "依賴任務失敗" }
  ]
}
```

---

## 品質設定檔

| Profile | 行為 |
|---------|------|
| `strict` | 全部檢查 + Fix Loop 最多 5 次 |
| `standard` | lint + test + Fix Loop 最多 3 次（預設） |
| `minimal` | 僅跑 verify_command，不 Fix Loop |
| `none` | 不執行任何驗證 |

---

## 重要注意事項

- 每個 Agent tool 的 `isolation: "worktree"` 會自動建立 git worktree
- `depends_on: []` 的 tasks 在同一層內全部並行
- 使用繁體中文回覆使用者

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 升格為 UDS 正式 Skill；Step 1 改為 Claude-native 解析（移除 plan-resolver-cli.js 依賴）；新增 Quality Gate / Fix Loop 章節（XSPEC-097 Phase 3） |
| 1.0.0 | 2026-04-09 | 初始發布（從上游遷移） |
