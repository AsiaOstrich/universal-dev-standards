---
source: ../../../core/circuit-breaker.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 断路器标准

> **语言**: [English](../../../core/circuit-breaker.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

通用断路器标准：三态状态机（CLOSED/HALF_OPEN/OPEN）、阈值配置、与遥测整合。

各模块各自实现断路器导致行为不一致（阈值不同、HALF_OPEN 探针逻辑各异、遥测事件命名混乱）。本标准提供统一的状态机定义、配置键名，以及必须上报的遥测事件，确保 DevAP/VibeOps/telemetry 三端可互相理解断路器状态。

---

## 核心规范

- 断路器必须实现三态：CLOSED / HALF_OPEN / OPEN
- `failureThreshold`、`successThreshold`、`cooldownMs` 必须可配置，有默认值
- 触发转换时必须上报 `circuit_state_change` 遥测事件
- HALF_OPEN 状态下只允许单次探针请求（不允许并发探针）
- 所有断路器实例必须可通过 `circuitId` 唯一标识

---

## 状态机

| 状态 | 说明 |
|------|------|
| **CLOSED** | 正常状态，放行所有请求；连续失败计数 |
| **HALF_OPEN** | 冷却后的探针状态；放行单次探针请求 |
| **OPEN** | 开路状态，拒绝所有请求；等待冷却期 |

### 状态转换规则

```
CLOSED → OPEN       : 连续失败 >= failureThreshold
OPEN → HALF_OPEN    : 冷却期（cooldownMs）到期
HALF_OPEN → CLOSED  : 探针成功 >= successThreshold
HALF_OPEN → OPEN    : 探针失败（立即重新开路）
```

---

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `failureThreshold` | `3` | 触发 OPEN 的连续失败次数 |
| `successThreshold` | `1` | 从 HALF_OPEN 恢复到 CLOSED 所需的成功次数 |
| `cooldownMs` | `30000` | OPEN 状态冷却时间（毫秒）|
| `circuitId` | 必填 | 断路器唯一标识符 |

---

## 遥测事件

**`circuit_state_change`**（每次状态转换时上报）

| 字段 | 类型 |
|------|------|
| `circuitId` | `string` |
| `fromState` | `CLOSED\|HALF_OPEN\|OPEN` |
| `toState` | `CLOSED\|HALF_OPEN\|OPEN` |
| `reason` | `string` |
| `failureCount` | `number` |
| `timestamp` | `string` |

---

## 情境示例

**情境 1：CLOSED → OPEN**
- 条件：连续 3 次调用下游 API 失败（failureThreshold=3）
- 结果：断路器转 OPEN，后续请求立即回传 `CircuitOpenError`

**情境 2：OPEN → HALF_OPEN → CLOSED**
- 条件：冷却 30s 后放行探针请求，探针成功
- 结果：断路器恢复 CLOSED，失败计数重置

**情境 3：HALF_OPEN → OPEN（探针失败）**
- 条件：探针请求失败
- 结果：立即重新开路，重新进入冷却期

---

## 错误码

| 代码 | 说明 |
|------|------|
| `CB-001` | `CIRCUIT_OPEN` — 断路器为 OPEN 状态，请求被拒绝 |
| `CB-002` | `PROBE_REJECTED` — HALF_OPEN 状态下拒绝并发探针 |
| `CB-003` | `CONFIG_INVALID` — 断路器配置参数无效 |
