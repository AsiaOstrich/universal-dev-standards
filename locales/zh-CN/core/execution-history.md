---
source: ../../../core/execution-history.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# 执行历史存储库标准

> **语言**: [English](../../../core/execution-history.md) | 简体中文

**版本**: 1.0.0
**适用性**: 所有 AI 辅助软件项目
**范围**: 通用 (Universal)

> 以 L1/L2/L3 分层访问模型持久化 agent 执行产物的结构化系统。

---

## 1. 概述

Execution History Repository 标准定义了 AI agent 执行历史的 artifact 格式、目录结构与分层访问模型。此标准为 Always-On Protocol，AI agent 自动遵循，不需要 slash command。

**适用场景：**
- AI agent 执行任务后需要留下可追溯的记录
- 团队需要分析 agent 的执行效率与成功率
- 跨 session 需要参考先前的执行历史来提升质量

---

## 2. 动机与研究依据

Meta-Harness 论文（arXiv:2603.28052）证实：给 agent 完整的先前执行历史（而非压缩摘要）能大幅提升效果。同一 benchmark 上 harness 设计差异可导致性能相差 **6 倍**。

**核心洞见：**
- 完整历史 > 压缩摘要
- 结构化格式 > 自由文本
- 分层访问 > 全量加载（token 效率）

---

## 3. 核心概念

### 3.1 Artifact 类型

每次 agent 执行完毕后，必须产出以下 artifacts：

**Required（6 个）：**

| Artifact | 文件 | 格式 | 说明 |
|----------|------|------|------|
| task-description | `task-description.md` | Markdown | 任务目标、输入、预期产出（≤ 2KB） |
| code-diff | `code-diff.patch` | Unified Diff | 本次执行产生的代码变更（≤ 50KB） |
| test-results | `test-results.json` | JSON | 测试执行结果（通过/失败/跳过数量、失败详情） |
| execution-log | `execution-log.jsonl` | JSONL | 结构化执行日志（每行一个事件） |
| token-usage | `token-usage.json` | JSON | Token 使用量明细（input/output/total，按步骤分） |
| final-status | `final-status.json` | JSON | 最终状态（success/failure/partial，含摘要） |

**Optional（2 个）：**

| Artifact | 文件 | 格式 | 条件 |
|----------|------|------|------|
| error-analysis | `error-analysis.md` | Markdown | status != success |
| agent-reasoning | `agent-reasoning.md` | Markdown | 选填 |

### 3.2 目录结构

```
.execution-history/
├── storage.json                        # 存储后端配置（可选，默认 local）
├── index.json                          # L1: 最近 50 个活跃 tasks 索引
├── index-archive.json                  # L1-ext: 归档 tasks 索引（> 90 天无新 run）
├── {task-id}/
│   ├── manifest.json                   # L2: 任务层级摘要
│   ├── {run-number}/                   # 三位数字（001-999）
│   │   ├── manifest.json               # L2: 单次执行摘要
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

### 3.3 L1/L2/L3 分层访问模型

| 层级 | 名称 | 文件 | Token 目标 | 跨项目 |
|------|------|------|-----------|--------|
| **L1** | 索引层 | `index.json` / `index-archive.json` | < 200 | ✅ |
| **L2** | 摘要层 | `manifest.json` | < 1,000/task | ❌ |
| **L3** | 完整记录层 | 各 artifact 文件 | 不限 | ❌ |

**访问策略：** L1 筛选 → L2 摘要 → L3 深入（仅在需要时）

---

## 4. Schema 定义

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
      "task_name": "实现用户验证流程",
      "tags": ["auth", "api", "feature"],
      "latest_run": "003",
      "latest_status": "success",
      "latest_date": "2026-04-02",
      "total_runs": 3
    }
  ]
}
```

**L1 字段：** `task_id`、`task_name`、`tags`、`latest_run`、`latest_status`、`latest_date`、`total_runs`

### 4.2 index-archive.json（L1-ext）

```json
{
  "version": "1.0.0",
  "updated": "2026-04-02T15:30:00Z",
  "description": "超过 90 天无新 run 的 tasks，从 index.json 自动归档至此",
  "tasks": [
    {
      "task_id": "init-project-scaffold",
      "task_name": "初始化项目脚手架",
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
  "task_description_summary": "实现 JWT-based 用户验证流程，含登录、登出、token refresh",
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
  "failure_summary": "Run 001: JWT secret 未配置导致 token 签发失败；Run 002: refresh token 过期逻辑未处理边界案例"
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

每行一个 JSON 对象：

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
  "summary": "JWT-based 验证流程已实现完成，42 个测试全部通过",
  "timestamp": "2026-04-02T15:30:00Z",
  "duration_seconds": 287
}
```

失败时：

```json
{
  "status": "failure",
  "summary": "JWT secret 未配置导致 token 签发失败",
  "timestamp": "2026-03-30T14:00:00Z",
  "duration_seconds": 342,
  "error": "ConfigurationError: JWT_SECRET environment variable is not set"
}
```

---

## 5. 存储后端

### 5.1 Local（默认）

存储在 repo 内的 `.execution-history/` 目录。

**Git 策略：**
- L3 artifacts 不追踪（纳入 `.gitignore`）
- L1 `index.json` 可选追踪

**.gitignore 规则：**
```gitignore
.execution-history/*/           # L3 artifacts 不追踪
!.execution-history/index.json  # L1 索引可选追踪
!.execution-history/index-archive.json  # L1 归档索引可选追踪
```

### 5.2 FileServer

存储在外部 FileServer（如 S3、MinIO、NAS、共享磁盘）。

**storage.json 配置：**
```json
{
  "backend": "file_server",
  "file_server_url": "https://minio.internal:9000/execution-history",
  "auth_method": "api_key",
  "sync_l1_to_local": true
}
```

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `backend` | `"local"` \| `"file_server"` | `"local"` | 存储后端 |
| `file_server_url` | string | — | FileServer 端点 URL |
| `auth_method` | `"none"` \| `"api_key"` \| `"oauth"` | `"none"` | 认证方式 |
| `sync_l1_to_local` | boolean | `true` | 是否将 L1 索引同步到本地 |

**FileServer 规则：**
- L1 索引始终同步到本地（`sync_l1_to_local: true`），确保离线可读
- L2/L3 按需从 FileServer 拉取
- 写入走 FileServer API，本地不留 L3 副本

---

## 6. 保留策略

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `max_runs_per_task` | 50 | 每个 task 最大保留 run 数 |
| `max_total_size_mb` | 500 | 总容量上限 |
| `cleanup_strategy` | `oldest_l3_first` | 清理策略 |

**清理规则：**
- 超过 `max_runs` 时，最旧的 run 的 L3 artifacts 被删除
- L1 和 L2 索引永久保留（除非手动删除）
- cleanup 以 task 为单位，不跨 task 清理

---

## 7. 敏感数据 Redaction

所有 artifact 在写入前自动扫描并 redact 敏感信息。

**默认 patterns：**

| Pattern | Label | 匹配目标 |
|---------|-------|---------|
| `sk-[a-zA-Z0-9_-]{20,}` | `API_KEY` | API 密钥 |
| `ghp_[a-zA-Z0-9]{36}` | `GITHUB_TOKEN` | GitHub Token |
| `password\s*[:=]\s*\S+` | `PASSWORD` | 密码 |
| `-----BEGIN .* PRIVATE KEY-----` | `PRIVATE_KEY` | 私钥 |

**Redact 格式：** `[REDACTED:{label}]`

---

## 8. 跨项目访问规则

- 跨项目访问**仅限 L1 层级**（`index.json`）
- **不得**读取 L2/L3 层级以遵守授权隔离
- L1 提供足够的信息进行筛选（task_id、task_name、tags、latest_status）

---

## 9. 使用示例

### Agent 读取历史的步骤

```
1. 读取 .execution-history/index.json（L1）
   → 筛选相关任务（< 200 tokens）

2. 读取相关任务的 manifest.json（L2）
   → 了解执行脉络与历史（< 1,000 tokens/task）

3. 仅在需要深入诊断时，读取 L3 完整 artifacts
   → 读取 code-diff.patch、test-results.json 等
```

### Agent 写入历史的步骤

```
1. 任务完成后，创建 .execution-history/{task-id}/{run-number}/ 目录
2. 写入所有 required artifacts（6 个文件）
3. 写入前对内容执行敏感数据 redaction
4. 更新 task 的 manifest.json（L2）
5. 更新根 index.json（L1）
6. 检查 retention policy，清理超额 runs
7. 检查是否有 stale tasks 需要归档
```

---

## 10. 相关标准

| 标准 | 关系 |
|------|------|
| [Developer Memory](./developer-memory.md) | 同为 Always-On Protocol，记录开发者洞见 |
| [Project Context Memory](./project-context-memory.md) | 同为 Always-On Protocol，记录项目决策 |
| [Workflow State Protocol](./workflow-state-protocol.md) | 工作流程状态管理 |
