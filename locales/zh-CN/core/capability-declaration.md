---
source: ../../../core/capability-declaration.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Fail-Closed 能力声明标准

> **语言**: [English](../../../core/capability-declaration.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

Fail-Closed 能力声明：工具 / Adapter 默认不安全，必须明确声明才视为安全。

各工具和 Adapter 的并发安全性、只读性等能力未明确声明，导致 Agent 编排时无法判断是否可并发调用。本标准要求所有工具和 Adapter 必须在接口中明确声明其能力属性，未声明的属性默认为 false（Fail-Closed）。

---

## 核心规范

- 所有工具（Tool）和 Adapter 必须声明能力接口（`CapabilityDeclaration`）
- `isConcurrencySafe` 默认 `false`（未声明 = 不可并发）
- `isReadOnly` 默认 `false`（未声明 = 可能修改状态）
- `supportsPartialFailure` 默认 `false`
- Agent 编排器在并发调用前必须检查 `isConcurrencySafe`

---

## CapabilityDeclaration 接口

```typescript
interface CapabilityDeclaration {
  toolId: string;

  // 并发安全性：未声明默认 false
  isConcurrencySafe: boolean;

  // 只读性：未声明默认 false（可能有副作用）
  isReadOnly: boolean;

  // 是否支持部分失败（单个操作失败不影响其他）
  supportsPartialFailure: boolean;

  // 最大并发数（isConcurrencySafe=true 时有效）
  maxConcurrency?: number;

  // 能力声明版本
  declarationVersion: string;
}
```

---

## Fail-Closed 规则

| 属性 | 默认值 | 含义 |
|------|--------|------|
| `isConcurrencySafe` | `false` | 未声明则禁止并发调用 |
| `isReadOnly` | `false` | 未声明则假设有副作用，需额外谨慎 |
| `supportsPartialFailure` | `false` | 未声明则任意失败视为全部失败 |

---

## 编排器检查流程

```
调用工具前：
1. 读取工具的 CapabilityDeclaration
2. 若需要并发调用且 isConcurrencySafe=false → 拒绝并发，改为串行
3. 若工具未提供 CapabilityDeclaration → 视为 isConcurrencySafe=false
4. 记录 capability_check_result 遥测事件
```

---

## 遥测事件

**`capability_check_result`**（每次能力检查时上报）

| 字段 | 类型 |
|------|------|
| `toolId` | `string` |
| `checkType` | `concurrency\|readonly\|partial_failure` |
| `declared` | `boolean` |
| `decision` | `allowed\|denied` |
| `timestamp` | `string` |

---

## 情境示例

**情境 1：并发安全检查**
- 条件：Agent 编排器需要并发调用 `file-writer` 工具
- `file-writer` 的 `isConcurrencySafe=false`
- 结果：编排器改为串行调用，记录 `capability_check_result`（decision=denied）

**情境 2：未声明能力（Fail-Closed）**
- 条件：旧版工具未提供 `CapabilityDeclaration`
- 结果：视为 `isConcurrencySafe=false, isReadOnly=false`，采用最保守策略

**情境 3：只读工具并发**
- 条件：`search-tool` 声明 `isReadOnly=true, isConcurrencySafe=true, maxConcurrency=5`
- 结果：允许最多 5 个并发调用

---

## 错误码

| 代码 | 说明 |
|------|------|
| `CAP-001` | `MISSING_CAPABILITY_DECLARATION` — 工具未提供能力声明，采用 Fail-Closed |
| `CAP-002` | `CONCURRENCY_DENIED` — isConcurrencySafe=false 但请求并发调用 |
| `CAP-003` | `MAX_CONCURRENCY_EXCEEDED` — 并发数超过 maxConcurrency 限制 |
