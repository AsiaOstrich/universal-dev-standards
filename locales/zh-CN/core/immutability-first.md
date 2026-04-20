---
source: ../../../core/immutability-first.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 不可变性优先原则

> **语言**: [English](../../../core/immutability-first.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

不可变性优先原则：DTO 字段 readonly，防止并发 Agent 竞态条件。

多个 Agent 并发执行时，共享状态的可变对象容易产生竞态条件（race condition）。本标准要求所有跨 Agent 边界传递的数据对象（DTO）默认使用 readonly 字段，并提供安全修改的替代模式（返回新实例而非原地修改）。

---

## 核心规范

- 所有 DTO（Data Transfer Object）字段默认必须声明为 `readonly`
- 跨 Agent 边界传递的对象必须是不可变的（immutable）
- 需要修改时，必须返回新实例（而非原地修改）
- 深层嵌套对象的所有层级都必须是 readonly
- 集合（数组/Map）使用 `ReadonlyArray` / `ReadonlyMap`

---

## IMM 规则

| 规则 | 说明 |
|------|------|
| `IMM-001` | DTO 所有字段声明为 `readonly` |
| `IMM-002` | 嵌套对象使用 `Readonly<T>` 递归包装 |
| `IMM-003` | 数组使用 `ReadonlyArray<T>` 而非 `T[]` |
| `IMM-004` | 禁止对跨 Agent 边界的对象使用原地修改（`push`、`splice`、直接赋值）|
| `IMM-005` | 需要修改时，使用展开运算符（spread）返回新实例 |

---

## TypeScript 示例

```typescript
// 正确：不可变 DTO
interface TaskResult {
  readonly taskId: string;
  readonly status: 'succeeded' | 'failed';
  readonly outputs: ReadonlyArray<string>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

// 正确：通过展开运算符创建新实例
function updateStatus(result: TaskResult, newStatus: TaskResult['status']): TaskResult {
  return { ...result, status: newStatus };
}

// 错误：原地修改（违反 IMM-004）
// result.status = 'succeeded'; // TypeScript 会报错
```

---

## 情境示例

**情境 1：并发 Agent 读取同一 DTO**
- 条件：两个 Agent 并发读取 `TaskResult` 对象
- 结果：因为字段是 readonly，无需加锁，不存在竞态条件

**情境 2：需要更新状态**
- 条件：Agent A 需要将 `TaskResult.status` 从 `failed` 改为 `succeeded`
- 结果：通过 `{ ...result, status: 'succeeded' }` 返回新对象，不修改原始对象

**情境 3：集合操作**
- 条件：需要向 `outputs` 数组添加新元素
- 结果：`{ ...result, outputs: [...result.outputs, newOutput] }`

---

## 错误码

| 代码 | 说明 |
|------|------|
| `IMM-001` | `MUTABLE_DTO_FIELD` — DTO 字段缺少 readonly 声明 |
| `IMM-002` | `MUTABLE_NESTED_OBJECT` — 嵌套对象未使用 Readonly 包装 |
| `IMM-003` | `MUTABLE_ARRAY` — 使用可变数组而非 ReadonlyArray |
| `IMM-004` | `IN_PLACE_MUTATION` — 对跨 Agent 边界对象执行原地修改 |
