---
name: orchestrate
source: ../../../../skills/orchestrate/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-07-16
source_hash: e66c388ce04a
scope: universal
description: |
  [UDS] 以 Claude 原生 Agent tool 编排多任务执行计划（DAG-based，无外部引擎）。
  Use when: executing a plan.json file with parallel/sequential task dependencies.
  Keywords: orchestrate, plan, execute, DAG, task plan, 编排, 执行计划, 并行.
argument-hint: "<plan.json> [--dry-run]"
---

# /orchestrate — 任务计划编排 Skill

> **语言**: [English](../../../../skills/orchestrate/SKILL.md) | 简体中文

## 用法

```
/orchestrate <plan.json>           # 执行计划
/orchestrate <plan.json> --dry-run # 仅验证，不执行
```

---

## 执行流程

### Step 1：读取与解析计划（Claude-native）

使用 Read tool 读取 plan.json，直接由 Claude 解析：

1. 读取 JSON 文件，解析为任务清单
2. 验证结构：`tasks` 非空、每个 task 含 `id`、`title`、`spec`
3. 安全扫描：检查 `task.spec` 是否含危险指令（`rm -rf /`、`DROP DATABASE`、`git push --force`）
   - 若发现安全问题，列出所有问题并**询问用户是否继续**
4. 拓扑排序：依 `depends_on` 字段将 tasks 分组为执行层（layers）
   - Layer 0：没有依赖的 tasks（可并行）
   - Layer N：依赖全部在 Layer 0..N-1 中的 tasks

若 `validation.valid` 为 false，输出错误信息并停止。

---

### Step 2：呈现执行计划

向用户显示解析结果：

```
计划：<project>  品质：<quality>
──────────────────────────────────
Layer 0 (并行)：T-001, T-002
Layer 1 (序列)：T-003 (依赖 T-001)
Layer 2 (序列)：T-004 (依赖 T-002, T-003)
──────────────────────────────────
共 4 个任务，3 个执行层
```

若使用 `--dry-run`：显示以上摘要后**立即停止**，不启动任何 Agent。

---

### Step 3：逐层执行

对 `layers` 数组中的每一层：

1. **同层并行**：同一层的 tasks 在同一消息中启动多个 Agent tool
2. **Agent tool 参数**：
   - `prompt`：task.spec + acceptance_criteria + user_intent 组合而成的执行提示
   - `isolation: "worktree"`：每个 task 在独立 git worktree 执行
   - `description`：`"Task {task.id}: {task.title}"`
3. **等待完成**：所有同层 agents 完成后，才进入下一层

**Agent 提示模板**：
```
Task: {task.title}

Spec:
{task.spec}

Acceptance Criteria:
{task.acceptance_criteria 逐条列出}

User Intent:
{task.user_intent}

After completing the task, run: {task.verify_command}
```

---

### Step 4：依赖失败处理

如果某个 task 的 agent 回报失败：
- 标记该 task 为 `failed`
- 后续层中 `depends_on` 包含该 task ID 的所有 tasks 标记为 `skipped`
- 继续执行不受影响的 tasks
- 最终报告中标示失败原因

---

### Step 5：Quality Gate

每个 task 完成后，若 task 定义了 `verify_command`：

1. 使用 Bash tool 执行 `verify_command`
2. **成功**：记录 `status: "success"`
3. **失败**：
   - 若 `quality` 为 `"strict"` 或 `"standard"`：启动 Fix Loop
   - Fix Loop：将错误输出回传给 agent，重新执行（最多 3 次）
   - 超过重试上限：标记为 `failed`

---

### Step 6：Judge 审查（可选）

如果 task 定义了 `judge: true`：
- 启动一个额外的 Agent tool 进行审查
- 提示：`审查 task {id} 的 git diff，依照 code-review 标准检查`
- Judge 结果附加到最终报告

---

### Step 7：产出报告

汇整所有 task 结果，输出执行报告：

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
    { "task_id": "T-003", "status": "skipped", "reason": "依赖任务失败" }
  ]
}
```

---

## 品质配置档

| Profile | 行为 |
|---------|------|
| `strict` | 全部检查 + Fix Loop 最多 5 次 |
| `standard` | lint + test + Fix Loop 最多 3 次（默认） |
| `minimal` | 仅跑 verify_command，不 Fix Loop |
| `none` | 不执行任何验证 |

---

## 重要注意事项

- 每个 Agent tool 的 `isolation: "worktree"` 会自动创建 git worktree
- `depends_on: []` 的 tasks 在同一层内全部并行
- 使用简体中文回复用户

---

## 版本历程

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 升格为 UDS 正式 Skill；Step 1 改为 Claude-native 解析（移除 plan-resolver-cli.js 依赖）；新增 Quality Gate / Fix Loop 章节（XSPEC-097 Phase 3） |
| 1.0.0 | 2026-04-09 | 初始发布（从上游迁移） |
