---
name: plan
source: ../../../../skills/plan/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-02
source_hash: 6fbb1a1b8040
scope: universal
description: |
  [UDS] 从 Spec 文档、OpenSpec 变更或自由文本需求生成 plan.json。
  Use when: converting specifications into executable task plans for /orchestrate.
  Keywords: plan, spec, task plan, 计划, 规格, 任务, plan.json, DAG.
argument-hint: "[spec-file.md | openspec-dir/ | \"需求描述文本\" | (交互模式)]"
---

# /plan — 从 Spec 自动生成 plan.json

> **语言**: [English](../../../../skills/plan/SKILL.md) | 简体中文

## 用法

```
/plan <spec-file.md>              # Spec 模式（自有格式 / SpecKit）
/plan <openspec-change-dir/>      # OpenSpec 模式
/plan "需求描述文本"               # 需求模式
/plan                             # 交互模式（自动检测）
```

---

## 执行流程

### Step 1：输入识别与格式检测

根据参数类型判断使用模式：

**参数是 .md 文件：**
1. 读取文件内容
2. 检测格式：
   - 含 `## Requirements` **且** `## Technical Design` → **自有格式**（SPEC-NNN-*.md）
   - 含 `## Summary` **且** `## Detailed Design` → **SpecKit 格式**
   - 其他 .md → 尝试解析为通用 Spec（按自有格式处理，缺少的字段由 AI 补充）

**参数是目录：**
1. 检查是否含 `proposal.md` + `tasks.md` → **OpenSpec 格式**
2. 否则报错：「此目录不符合 OpenSpec 结构」

**参数是字符串描述（非文件路径）：**
→ **需求模式**

**无参数：**
→ **交互模式**
1. 检测 `openspec/` 目录存在？ → 列出 changes 让用户选择
2. 检测 `specs/*.md` 存在？ → 列出可用 Spec 让用户选择
3. 都没有 → 进入需求模式问答

---

### Step 2：项目 Context 收集

读取目标项目的关键信息：

1. **CLAUDE.md / AGENTS.md** — 语言、框架、测试工具、开发规范
2. **package.json / pyproject.toml** — 可用 scripts（build, test, lint）

从 Context 推断：
- 主要语言（TypeScript / Python / 其他）
- 默认 verify_command（如 `pnpm build && pnpm test`、`pytest -x`）
- 默认 lint_command（如 `pnpm lint`、`ruff check .`）

---

### Step 3：Spec 解析

依检测到的格式，解析 Spec 内容：

#### 自有格式（SPEC-NNN-*.md）

提取以下区段：
- **Summary / Motivation** → 理解背景与需求动机
- **Requirements (REQ-NNN)** → 功能需求列表
- **Acceptance Criteria (AC-N)** → Given/When/Then 验收条件
- **Technical Design** → Phase 分层、每个 Phase 的实现项目
- **Test Plan** → 测试清单
- **Risks** → 风险评估

#### OpenSpec（change 目录）

读取以下文件：
- `proposal.md` → Why（动机）、What Changes（变更项目）、Impact
- `tasks.md` → `- [ ]` checklist 项目
- `design.md`（若存在）→ 技术决策
- `specs/*/spec.md`（若存在）→ Requirements（SHALL / MUST 语句）、Scenarios

#### SpecKit（SPEC-ID.md）

提取以下区段：
- **Summary / Motivation** → 背景
- **Detailed Design** → 技术实现步骤
- **Acceptance Criteria** → checkbox 验收条件
- **Dependencies** → 外部依赖
- **Risks** → 风险

---

### Step 4：Task 切分

依格式套用不同映射规则：

#### 自有格式映射规则

| Spec 区段 | plan.json 字段 | 映射规则 |
|-----------|---------------|----------|
| Technical Design > Phase | 一组 tasks | 每个 Phase 的每个实现项目 = 1 个 task |
| Phase 实现项目描述 | `task.spec` | 合并：项目描述 + 相关 REQ + 技术细节 |
| Acceptance Criteria (AC-N) | `task.acceptance_criteria` | 分配到最相关的 task |
| Summary / Motivation | `task.user_intent` | 提取与 task 最相关的意图 |
| Test Plan | `task.verify_command` | 推断测试命令 |

#### OpenSpec 映射规则

| OpenSpec 文件 | plan.json 字段 | 映射规则 |
|--------------|---------------|----------|
| `tasks.md` 的 checklist 项目 | tasks | 每个 `- [ ]` 项目 = 1 个 task |
| `proposal.md` > Why | `task.user_intent` | 所有 tasks 共用 |
| `proposal.md` > What Changes | 融入 `task.spec` | 提供变更上下文 |
| `design.md` 技术细节 | 融入 `task.spec` | 补充实现指引 |
| `specs/*/spec.md` > Scenarios | `task.acceptance_criteria` | 每个 Scenario 映射为一条 criteria |
| `specs/*/spec.md` > Requirements | 融入 `task.spec` | SHALL / MUST 语句转为具体实现指引 |

---

### Step 5：依赖推断

为 tasks 建立 `depends_on` 关系：

1. **Phase / Stage 顺序**：后面的 Phase 的第一个 task depends_on 前面 Phase 的最后一个 task
2. **同 Phase 内顺序**：类型定义 → 实现 → 集成 → 测试
3. **文件依赖**：A 创建的文件被 B import → B depends_on A
4. **无依赖的 tasks**：`depends_on: []`（可并行）

---

### Step 6：verify_command 推断

依以下优先顺序推断：

1. **Test Plan / Scenarios 有明确测试项** → 对应测试命令
2. **TypeScript 项目** → `pnpm build && pnpm test`
3. **Python 项目** → `pytest -x`
4. **其他** → 使用 Step 2 收集的项目 scripts
5. **无法推断** → 不设（后续质量警告会提醒）

---

### Step 7：质量设置

- 默认 `quality: "standard"`
- 用户可在交互确认时调整

---

### Step 8：组装 plan.json

```json
{
  "project": "<项目名称>",
  "quality": "standard",
  "defaults": {
    "max_turns": 30,
    "max_budget_usd": 2.0,
    "verify_command": "<推断的默认验证命令>"
  },
  "tasks": [
    {
      "id": "T-001",
      "title": "<task 标题>",
      "spec": "<详细的 task 规格说明>",
      "depends_on": [],
      "verify_command": "<task 层级验证命令（可选）>",
      "acceptance_criteria": ["<验收条件 1>"],
      "user_intent": "<用户意图>"
    }
  ]
}
```

**注意事项：**
- Task ID 格式：`T-NNN`（如 T-001, T-002）
- `spec` 字段应详尽——它是 agent 执行任务的唯一规格输入
- `acceptance_criteria` 每条都必须是可观察、可验证的

---

### Step 9：验证（Claude-native）

Claude 对 plan.json 执行以下验证（无需外部引擎）：

1. **结构验证**：`tasks` 数组存在且非空、每个 task 含必填字段（id, title, spec）
2. **DAG 合法性**：`depends_on` 中的所有 ID 均存在、无循环依赖
3. **安全扫描**：task.spec 不含危险命令（`rm -rf /`、`DROP DATABASE`、`git push --force`）
4. **质量警告**：task 缺少 verify_command、spec 过短（< 20 字）等

若发现问题，在呈现前先自动修正（若可修正）或标示警告。

---

### Step 10：呈现与确认

向用户呈现生成结果：

1. **摘要表格**：
   ```
   | Task ID | 标题 | 依赖 | 验证命令 |
   |---------|------|------|----------|
   | T-001   | ...  | -    | ...      |
   | T-002   | ...  | T-001| ...      |
   ```

2. **DAG 拓扑**：
   ```
   Layer 0: T-001, T-002（并行）
   Layer 1: T-003（依赖 T-001）
   Layer 2: T-004（依赖 T-002, T-003）
   ```

3. **质量设置**：`quality: standard`

4. **质量警告**（若有）

5. **询问用户**：确认或修改？确认后写入文件（默认路径：`plans/<spec-name>.plan.json`）

---

## 版本历程

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 升格为 UDS 正式 Skill；移除 [DEVAP] 标记；Step 9 改为 Claude-native 验证（XSPEC-097 Phase 3） |
| 1.0.0 | 2026-04-09 | 初始发布（从上游迁移） |
