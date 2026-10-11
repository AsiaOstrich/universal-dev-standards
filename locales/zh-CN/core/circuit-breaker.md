---
source: ../../../core/circuit-breaker.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5e7ea0ed4762
status: current
---

# 断路器标准

> **语言**: [English](../../../core/circuit-breaker.md) | 简体中文

> **来源**: XSPEC-036 | **借鉴自**: claude-code-book Ch.2

## 概述

断路器（Circuit Breaker）模式保护 Agent 系统免于因反复失败而引发的 API 雪崩。连续失败达 `failureThreshold` 次后，断路器打开并立即拒绝所有请求——不必等待超时。冷却期过后，它允许一次探针调用来测试是否已恢复。

真实数据：在引入断路器之前，claude-code-book 测得每天约有 25 万次浪费的 API 调用，来自 1,279 个各自连续失败超过 50 次的会话（最多：连续失败 3,272 次）。

## 状态

```
CLOSED ──(N consecutive failures)──→ OPEN
OPEN   ──(cooldownMs elapsed)──→ HALF_OPEN
HALF_OPEN ──(probe success)──→ CLOSED
HALF_OPEN ──(probe failure)──→ OPEN
```

| 状态 | 行为 |
|------|------|
| **CLOSED** | 正常运行，请求照常转发 |
| **OPEN** | 所有请求立即以 `CircuitOpenError` 拒绝 |
| **HALF_OPEN** | 允许一次探针请求；成功 → CLOSED，失败 → OPEN |

## 配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `failureThreshold` | 3 | 打开前允许的连续失败次数 |
| `cooldownMs` | 30000 | OPEN → HALF_OPEN 的等待时间（毫秒） |
| `successThreshold` | 1 | 关闭所需的探针成功次数 |

## 接口

```typescript
interface CircuitBreaker {
  readonly name: string;
  readonly state: "CLOSED" | "HALF_OPEN" | "OPEN";
  execute<T>(fn: () => Promise<T>): Promise<T>; // throws CircuitOpenError when OPEN
  getState(): CircuitBreakerState;
  reset(): void; // admin manual reset
}
```

## 适用场景

- Fix Loop（采用层）重试
- LLM API 调用保护（采用层）
- Feedback Loop（采用层）重试
- FLARE 主动检索（采用层）检索重试
- 任何对外部依赖使用重试的组件

## 参考资料

- AI 优化版：[ai/standards/circuit-breaker.ai.yaml](../../../ai/standards/circuit-breaker.ai.yaml)
- XSPEC-036：跨项目规格
- 借鉴自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.2 `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`


**适用范围**: universal
