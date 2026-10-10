---
source: ../../../core/agent-dispatch.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: d18ca22786b3
status: current
---

> **语言**: [English](../../../core/agent-dispatch.md) | 简体中文

# 代理派遣与并行协调

**版本**: 1.0.0
**最后更新**: 2026-03-20
**适用范围**: 使用多代理编排的 AI 辅助开发
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — dispatching-parallel-agents, subagent-driven-development (MIT)

---

## 目的

定义 AI 子代理的并行派遣、工作协调与状态回报标准。确保高效并行化的同时，防止文件冲突与集成失败。

---

## 术语表

| 术语 | 定义 |
|------|------|
| 子代理 | 由编排器生成的用于处理特定任务的 AI 代理 |
| 独立域 | 与其他任务没有共享可变状态的任务范围 |
| 状态协议 | 子代理必须回报的标准化返回状态 |
| 文件冲突 | 多个代理同时修改同一文件 |

---

## 核心原则 — 并行前先确认独立性

> **派遣代理并行执行前，必须验证其任务域是独立的（无共享可变状态）。**

---

## Prompt 设计原则

每个子代理的 prompt 必须遵循三个原则：

### 1. 聚焦（Focused）

每个代理只处理单一问题域，不混合无关任务。

### 2. 自足（Self-contained）

Prompt 包含执行所需的完整上下文，代理不需要额外提问或搜索。

### 3. 明确输出（Specific Output）

明确定义期望的返回格式。

---

## 状态协议

每个子代理完成时必须回报以下四种状态之一：

| 状态 | 说明 | 编排器动作 |
|------|------|-----------|
| `DONE` | 任务成功完成 | 继续下一个任务 |
| `DONE_WITH_CONCERNS` | 已完成，但有需要记录的疑虑 | 记录疑虑，继续 |
| `NEEDS_CONTEXT` | 需要更多上下文才能完成 | 注入上下文，重新派遣（不是重试） |
| `BLOCKED` | 无法完成，需要升级处理 | 升级模型等级或拆分任务 |

### 状态判定流程

```
Agent completes work
  ├── All acceptance criteria met? → DONE
  ├── Criteria met but concerns exist? → DONE_WITH_CONCERNS
  ├── Missing information to proceed? → NEEDS_CONTEXT
  └── Fundamentally unable to complete? → BLOCKED
```

---

## 冲突检测

并行代理返回时，编排器必须：

1. **检查文件冲突** — 是否有多个代理修改了同一文件？
2. **运行完整测试套件** — 合并所有变更后验证集成
3. **解决冲突** — 自动解决，或标记交由人工审查

```
Agent A (modifies: src/auth.ts, src/auth.test.ts)  ─┐
                                                      ├─→ Conflict check → Integration test
Agent B (modifies: src/api.ts, src/api.test.ts)     ─┘
```

---

## 规则

| ID | 触发条件 | 动作 | 优先级 |
|----|---------|------|--------|
| AD-001 | 多个代理编辑同一文件 | 标记冲突，要求合并解决 | Critical |
| AD-002 | 代理回报 BLOCKED | 升级模型等级并重试一次 | High |
| AD-003 | 所有并行代理完成 | 运行完整测试套件验证集成 | High |

---

## 示例

### 正确：并行的独立任务

```yaml
# Two agents working on independent modules
Agent 1:
  task: "Add rate limiting to /api/users endpoint"
  files: [src/api/users.ts, src/api/users.test.ts]

Agent 2:
  task: "Add caching to /api/products endpoint"
  files: [src/api/products.ts, src/api/products.test.ts]

# No shared files → safe to parallelize
```

### 错误：并行的相依任务

```yaml
# Two agents modifying shared state
Agent 1:
  task: "Refactor database connection pool"
  files: [src/db.ts]  # ⚠️ shared file

Agent 2:
  task: "Add connection retry logic"
  files: [src/db.ts]  # ⚠️ conflict!
```

---

## 参考资料

- **Superpowers**: [dispatching-parallel-agents](https://github.com/obra/superpowers), [subagent-driven-development](https://github.com/obra/superpowers) (MIT)
- **MapReduce**: 概念性的并行执行模型
- **Actor Model**: 独立代理的通信模式
