# Agent Communication Protocol

> **Language**: English | [繁體中文](../locales/zh-TW/core/agent-communication-protocol.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-30
**Applicability**: Cross-project AI agent orchestration (UDS / DevAP / VibeOps)
**Scope**: universal
**Related Standards**: [Agent Dispatch](./agent-dispatch.md), [Model Selection](./model-selection.md)
**Spec**: [SPEC-AGENT-COMM-001](../docs/specs/SPEC-AGENT-COMM-001-agent-communication-protocol.md)

---

## Purpose

Define a unified communication protocol for AI agents across the AsiaOstrich product stack. This standard establishes interoperable status codes, message envelope format, structured handoff, and protocol versioning — enabling agents from different projects to communicate without custom adapters.

定義跨 AsiaOstrich 產品線的統一 AI Agent 通訊協定。建立可互通的狀態碼、訊息信封格式、結構化交接與協定版本管理，讓不同專案的 Agent 無需自訂轉接器即可溝通。

---

## Glossary

| Term | Definition |
|------|-----------|
| Envelope | A standardized message wrapper containing metadata and payload |
| Handoff | A structured context transfer object between agents |
| Status Protocol | The unified set of agent completion states |
| Artifact | A typed output produced by an agent (spec, code, test, review, plan, design) |
| Correlation ID | A shared identifier linking messages in the same task chain |

---

## Core Principle — Protocol Over Convention

> **Agent interoperability is achieved through explicit protocol contracts, not implicit prompt conventions.**

Agent 間的互通性透過明確的協定合約實現，而非隱式的 prompt 慣例。

---

## 1. Unified Status Protocol

### 1.1 Status Codes

Eight standardized status codes form a superset of all project-specific states:

八個標準化狀態碼構成所有專案特定狀態的超集：

| Status | Description | 說明 |
|--------|------------|------|
| `success` | Task completed successfully | 任務成功完成 |
| `success_partial` | Completed with concerns logged | 完成但有疑慮需記錄 |
| `failed` | Task execution failed | 任務執行失敗 |
| `blocked` | Cannot proceed, needs escalation | 無法繼續，需升級處理 |
| `needs_context` | Requires additional context (re-dispatch) | 需要更多上下文 |
| `skipped` | Task intentionally skipped | 任務被有意略過 |
| `timeout` | Task exceeded time limit | 任務超時 |
| `unknown` | Unrecognized status (fallback) | 無法識別的狀態（降級） |

### 1.2 Cross-Project Mapping

跨專案狀態碼映射表：

| Unified | UDS | DevAP | VibeOps |
|---------|-----|-------|---------|
| `success` | DONE | success | success |
| `success_partial` | DONE_WITH_CONCERNS | done_with_concerns | partial |
| `failed` | — | failed | failure |
| `blocked` | BLOCKED | blocked | — |
| `needs_context` | NEEDS_CONTEXT | needs_context | — |
| `skipped` | — | skipped | — |
| `timeout` | — | timeout | — |
| `unknown` | — | — | — |

### 1.3 Rules

1. **Lossless mapping**: Every project-specific status MUST map to exactly one unified status.
2. **Unknown fallback**: Unrecognized status codes MUST map to `unknown` with a warning log.
3. **No interruption**: Receiving `unknown` MUST NOT interrupt execution flow.

---

## 2. Agent Envelope Protocol

### 2.1 Required Fields (8)

Every agent message MUST include these fields:

| Field | Type | Description |
|-------|------|-------------|
| `envelope_version` | string | Protocol version (MAJOR.MINOR) |
| `message_id` | string (UUID) | Unique message identifier |
| `source` | object | Sender: `{ agent_id, agent_type, project }` |
| `target` | object | Receiver: `{ agent_id?, agent_type }` (optional for broadcast) |
| `status` | string | Unified status code |
| `timestamp` | string (ISO 8601) | Message creation time |
| `payload.artifact_type` | string | One of: spec, code, test, review, plan, design |
| `payload.artifact_id` | string | Unique artifact identifier |

### 2.2 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `correlation_id` | string | Links messages in the same task chain |
| `parent_message_id` | string | Reference to parent message (for responses) |
| `metadata` | object | Extensible metadata (model_tier, token_usage, duration_ms) |
| `concerns` | string[] | Issues logged when status is `success_partial` |

### 2.3 Validation Rules

1. Messages missing required fields MUST be rejected with `INVALID_ENVELOPE` error.
2. The error MUST indicate which fields are missing.
3. Messages with invalid `status` values MUST be rejected.

### 2.4 Forward Compatibility

1. Receivers MUST parse all known fields and ignore unknown fields.
2. Unknown fields MUST be preserved (not stripped) when forwarding.
3. Same MAJOR version guarantees backward compatibility.

---

## 3. Structured Handoff

### 3.1 Purpose

Replace implicit prompt injection with explicit context transfer between agents.

以明確的上下文傳遞取代隱式的 prompt 拼接。

### 3.2 Handoff Structure

| Field | Required | Description |
|-------|----------|-------------|
| `from` | Yes | Sender: `{ agent_id, agent_type, message_id }` |
| `to` | Yes | Receiver: `{ agent_type }` (instance assigned by orchestrator) |
| `artifacts` | Yes | Array of `{ artifact_id, artifact_type, summary }` |
| `decision_log` | No | Array of `{ decision, reason, agent_id, timestamp }` |
| `pending_items` | No | Array of `{ item, priority, context? }` |
| `constraints` | No | Array of constraint strings |

### 3.3 Rules

1. **Selective reference**: Handoffs SHOULD reference artifacts by ID, not embed full content.
2. **Decision traceability**: Each `decision_log` entry MUST include all four fields.
3. **Context chain**: Downstream agents CAN trace decisions back to the originating agent and timestamp.

---

## 4. Protocol Versioning

### 4.1 Version Format

`MAJOR.MINOR` using semantic versioning principles:

- **MAJOR** increment: Breaking changes (new required fields, removed fields, changed semantics)
- **MINOR** increment: Backward-compatible additions (new optional fields, new artifact types)

### 4.2 Compatibility Rules

| Scenario | Behavior |
|----------|----------|
| Same MAJOR, higher MINOR | Parse known fields, ignore unknown |
| Different MAJOR | Return `VERSION_INCOMPATIBLE` error with supported range |

### 4.3 Version Roadmap

| Version | Content |
|---------|---------|
| **v1.0** | Status mapping, Envelope, Handoff (this standard) |
| **v1.1** | Typed Artifact Schemas (JSON Schema per artifact_type) |
| **v1.2** | Incremental Checkpoint format |
| **v2.0** | Agent Capability Registry, DAG scheduling protocol |

---

## Quick Reference

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
