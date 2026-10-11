---
source: ../../../core/retry-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7179aacfc3cb
status: current
---

# 重试策略标准

> **语言**: [English](../../../core/retry-standards.md) | 简体中文

> **来源**: XSPEC-067 | **驱动来源**: DEC-043 Wave 1 Reliability Pack | **状态**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

重试策略标准 —— 延伸既有的 `circuit-breaker` 与 `failure-source-taxonomy`，补齐 retry 层的标准化规则。避免各组件各自实现重试造成行为不一致（无上限重试、无 jitter 导致 thundering herd）。与 `failure-source-taxonomy` 深度整合：依失败类型决定是否重试、重试几次、退避多久。

## 关键原则

- **指数退避加 full jitter**：所有重试逻辑必须使用 exponential + jitter，禁止固定间隔或无 jitter 的纯指数
- **明确重试上限**：必须有 `max_attempts`（默认 5），禁止无限重试
- **依 failureSource 分类**：先查 `failure-source-taxonomy`，fail-fast 类别不得重试
- **与 circuit-breaker 整合**：OPEN 状态下 fail-fast，不消耗 `max_attempts`；`retry_exhausted` 计入 failure count
- **重试可观察**：每次重试上报 `retry_attempted` / `retry_exhausted` 遥测事件

## 退避公式

```
wait_ms = min(cap_ms, base_ms * 2^attempt) * (0.5 + random() * 0.5)
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `base_ms` | 100 | 基础退避时间 |
| `cap_ms` | 30000 | 单次最长等待上限 |
| `max_attempts` | 5 | 最多重试次数（不含第 0 次原始调用）|
| `jitter_ratio` | 0.5 | Jitter 比例（±50%）|

## 失败来源重试规则

| 失败来源 | 是否重试 | 最多次数 | Base ms | 备注 |
|----------|---------|---------|---------|------|
| `transient_network` | 是 | 5 | 100 | 短暂网络抖动 |
| `rate_limit` | 是 | 3 | 1000 | 优先依 `Retry-After` |
| `upstream_unavailable` | 是 | 3 | 500 | 连续失败触发 breaker OPEN |
| `tool_failure` | 是 | 2 | 200 | 工具层失败多半非 transient |
| `prompt_delivery` | 是 | 2 | 100 | 超过后改走 model_switch |
| `authentication` | **否** | — | — | Fail-fast，重试不会变对 |
| `validation` | **否** | — | — | Fail-fast，input 错误不会自己变 |
| `policy_violation` | **否** | — | — | Fail-fast，禁止绕过 |
| `quota_exhausted` | **否** | — | — | Fail-fast，等待 reset |

## 使用示例

- **场景 1 —— 指数退避**：`failure_source=transient_network`，已重试 2 次。第 3 次 wait 范围 = `min(30000, 100 * 2^3) * [0.5..1.0] = 400~800ms`
- **场景 2 —— 401 Fail-fast**：API 返回 401 Unauthorized，`failure_source=authentication`。立即 fail-fast，不进入退避、不计入 breaker failure count
- **场景 3 —— Circuit Open 跳过**：breaker 为 OPEN，发起重试时立即返回 `CircuitOpenError`，不消耗 `max_attempts`

## 错误码

- `RETRY-001` — `RETRY_EXHAUSTED`（达到 max_attempts 仍失败）
- `RETRY-002` — `RETRY_SKIPPED_NON_RETRYABLE`（failureSource 属 fail-fast 类别）
- `RETRY-003` — `RETRY_SKIPPED_CIRCUIT_OPEN`（breaker OPEN 状态下跳过）

## 参考资料

- AI 优化版：[ai/standards/retry-standards.ai.yaml](../../../ai/standards/retry-standards.ai.yaml)
- XSPEC-067：DEC-043 Wave 1 Reliability Pack 跨项目规格
- DEC-043：UDS 覆盖完整性路线图（驱动来源）
- 相关：`circuit-breaker`, `failure-source-taxonomy`, `timeout-standards`, `recovery-recipe-registry`
- 业界：Netflix Hystrix retry, Google SRE Book Ch.22, AWS Architecture Blog — exponential backoff and jitter


**范围**: universal
