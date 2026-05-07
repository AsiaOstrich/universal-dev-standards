---
source: ../../../core/agent-communication-protocol.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# Agent 通信协议

> **语言**: [English](../../../core/agent-communication-protocol.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-30
**适用性**: 跨采用层 AI Agent 编排（任意 Adapter / Pipeline / Agent runtime 消费 UDS 标准）
**范围**: 通用 (Universal)
**相关标准**: [代理派遣](./agent-dispatch.md)、[AI 模型选择策略](./model-selection.md)
**规格**: [SPEC-AGENT-COMM-001](../../../docs/specs/SPEC-AGENT-COMM-001-agent-communication-protocol.md)

---

## 目的

定义跨 AsiaOstrich 产品线的统一 AI Agent 通信协议。建立可互通的状态码、消息 Envelope 格式、结构化 Handoff 与协议版本管理，让不同项目的 Agent 无需自定义转接器即可通信。

---

## 术语表

| 术语 | 定义 |
|------|------|
| Envelope | 包含元数据与载荷的标准化消息封装 |
| Handoff | Agent 之间的结构化上下文传递对象 |
| Status Protocol | Agent 完成状态的统一集合 |
| Artifact | Agent 产出的具类型输出（spec、code、test、review、plan、design） |
| Correlation ID | 连接同一任务链中消息的共享标识符 |

---

## 核心原则 — 协议优先于惯例

> **Agent 间的互通性通过明确的协议合约实现，而非隐式的 prompt 惯例。**

---

## 1. 统一状态协议

### 1.1 状态码

八个标准化状态码构成所有项目特定状态的超集：

| 状态 | 说明 |
|------|------|
| `success` | 任务成功完成 |
| `success_partial` | 完成但有疑虑需记录 |
| `failed` | 任务执行失败 |
| `blocked` | 无法继续，需升级处理 |
| `needs_context` | 需要更多上下文（重新派遣） |
| `skipped` | 任务被有意略过 |
| `timeout` | 任务超时 |
| `unknown` | 无法识别的状态（降级） |

### 1.2 跨采用层映射

跨采用层状态码对映表（informative example，采用层自订自己的对映）：

| 统一状态 | UDS | Adapter Example A | Adapter Example B |
|----------|-----|-------------------|-------------------|
| `success` | DONE | success | success |
| `success_partial` | DONE_WITH_CONCERNS | done_with_concerns | partial |
| `failed` | — | failed | failure |
| `blocked` | BLOCKED | blocked | — |
| `needs_context` | NEEDS_CONTEXT | needs_context | — |
| `skipped` | — | skipped | — |
| `timeout` | — | timeout | — |
| `unknown` | — | — | — |

### 1.3 规则

1. **无损映射**：每个项目特定状态必须映射到恰好一个统一状态。
2. **Unknown 降级**：无法识别的状态码必须映射到 `unknown` 并记录警告。
3. **不中断**：接收到 `unknown` 不得中断执行流程。

---

## 2. Agent Envelope 协议

### 2.1 必要字段（8 个）

每个 Agent 消息必须包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `envelope_version` | string | 协议版本（MAJOR.MINOR） |
| `message_id` | string (UUID) | 唯一消息标识符 |
| `source` | object | 发送方：`{ agent_id, agent_type, project }` |
| `target` | object | 接收方：`{ agent_id?, agent_type }`（广播时可选） |
| `status` | string | 统一状态码 |
| `timestamp` | string (ISO 8601) | 消息创建时间 |
| `payload.artifact_type` | string | 以下之一：spec、code、test、review、plan、design |
| `payload.artifact_id` | string | 唯一 Artifact 标识符 |

### 2.2 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `correlation_id` | string | 连接同一任务链中的消息 |
| `parent_message_id` | string | 引用父消息（用于响应） |
| `metadata` | object | 可扩展元数据（model_tier、token_usage、duration_ms） |
| `concerns` | string[] | 状态为 `success_partial` 时记录的问题 |

### 2.3 验证规则

1. 缺少必要字段的消息必须以 `INVALID_ENVELOPE` 错误拒绝。
2. 错误消息必须指出哪些字段缺失。
3. 具有无效 `status` 值的消息必须被拒绝。

### 2.4 向前兼容性

1. 接收方必须解析所有已知字段并忽略未知字段。
2. 转发时必须保留（不移除）未知字段。
3. 相同 MAJOR 版本保证向后兼容。

---

## 3. 结构化 Handoff

### 3.1 目的

以明确的上下文传递取代隐式的 prompt 拼接。

### 3.2 Handoff 结构

| 字段 | 必要 | 说明 |
|------|------|------|
| `from` | 是 | 发送方：`{ agent_id, agent_type, message_id }` |
| `to` | 是 | 接收方：`{ agent_type }`（实例由编排器分配） |
| `artifacts` | 是 | `{ artifact_id, artifact_type, summary }` 数组 |
| `decision_log` | 否 | `{ decision, reason, agent_id, timestamp }` 数组 |
| `pending_items` | 否 | `{ item, priority, context? }` 数组 |
| `constraints` | 否 | 约束条件字符串数组 |

### 3.3 规则

1. **选择性引用**：Handoff 应通过 ID 引用 Artifact，而非嵌入完整内容。
2. **决策可追溯性**：每个 `decision_log` 项目必须包含所有四个字段。
3. **上下文链**：下游 Agent 可追溯决策至原始 Agent 与时间戳。

---

## 4. 协议版本管理

### 4.1 版本格式

`MAJOR.MINOR`，采用语义化版本原则：

- **MAJOR** 递增：破坏性变更（新增必要字段、移除字段、语义变更）
- **MINOR** 递增：向后兼容的新增（新增可选字段、新增 Artifact 类型）

### 4.2 兼容性规则

| 情境 | 行为 |
|------|------|
| 相同 MAJOR，较高 MINOR | 解析已知字段，忽略未知字段 |
| 不同 MAJOR | 返回 `VERSION_INCOMPATIBLE` 错误，附带支持范围 |

### 4.3 版本路线图

| 版本 | 内容 |
|------|------|
| **v1.0** | 状态映射、Envelope、Handoff（本标准） |
| **v1.1** | 具类型 Artifact Schema（每种 artifact_type 的 JSON Schema） |
| **v1.2** | 增量 Checkpoint 格式 |
| **v2.0** | Agent 能力注册表、DAG 调度协议 |

---

## 快速参考

```
┌─────────────────────── Envelope ───────────────────────┐
│ envelope_version: "1.0"                                 │
│ message_id: "msg-uuid"                                  │
│ source: { agent_id, agent_type, project }               │
│ target: { agent_type }                                  │
│ status: success | success_partial | failed | blocked    │
│         | needs_context | skipped | timeout | unknown   │
│ timestamp: "ISO 8601"                                   │
│ payload: { artifact_type, artifact_id, content }        │
│ ── optional ──                                          │
│ correlation_id, parent_message_id, metadata, concerns   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────── Handoff ────────────────────────┐
│ from: { agent_id, agent_type, message_id }              │
│ to: { agent_type }                                      │
│ artifacts: [{ artifact_id, artifact_type, summary }]    │
│ ── optional ──                                          │
│ decision_log: [{ decision, reason, agent_id, ts }]      │
│ pending_items: [{ item, priority, context? }]           │
│ constraints: [string]                                   │
└─────────────────────────────────────────────────────────┘
```
