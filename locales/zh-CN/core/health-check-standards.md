---
source: ../../../core/health-check-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: d8020bc66eac
status: current
---

# 健康检查标准

> **语言**: [English](../../../core/health-check-standards.md) | 简体中文

> **来源**: XSPEC-067 | **驱动来源**: DEC-043 Wave 1 Reliability Pack | **状态**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

健康检查标准 —— 业界常见错误是把 liveness 和 readiness 混用（健康检查检查外部依赖导致连锁重启）。本标准明确三种 probe 的语义分离、定义深度 health check 的检查范围（仅关键依赖），并规范结构化 JSON 响应以便下游自动化处理。与 observability 整合，作为 RED metric 的 Error 来源之一。

## 关键原则

- **Liveness 不碰外部依赖**：liveness 失败会造成 pod 重启；若依赖 DB，DB 故障时会造成所有 pod 连锁重启
- **Readiness 仅检查关键依赖**：非关键依赖不纳入，避免边缘故障导致服务被下线
- **慢启动用 startup probe**：启动完成后交棒给 liveness
- **结构化 JSON 响应**：包含 `status` / `dependencies` / `timestamp` / `version`
- **作为 observability signal**：连续失败（达到 probe threshold）时依 [alerting-standards](alerting-standards.md) 触发告警——由 alerting 定义触发时机、严重性映射与路由（`HC-001 HEALTH_CHECK_FAILED` 为告警来源之一），health-check 只负责发出 signal，不自行决定通知对象

## Probe 类型

| Probe | 端点 | 检查内容 | 失败时 | 阈值 |
|-------|------|---------|--------|------|
| **liveness** | `GET /health/live` | process 可响应 HTTP、内部 event loop | 重启 pod | 3 次失败 |
| **readiness** | `GET /health/ready` | 自身 API、DB ping（若必要）、关键下游 | 移出负载均衡（不重启）| 3 次失败 |
| **startup** | `GET /health/startup` | 启动过程所需资源就绪 | 重启 pod（启动超时）| 30 次失败 |

### Liveness 禁止的检查

- DB 连接（DB 故障时 liveness 失败 → pod 重启 → 启动更多 client → DB 更糟）
- 下游 API（会造成连锁重启）
- 消息队列

## 深度规则

- **Shallow（liveness）**：process 是否可响应，不碰任何外部依赖
- **Deep（readiness）**：自身 API 路由、DB ping、关键下游 API ping（关键 = 没有它，服务就完全无法提供核心功能）

## 响应格式

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "2026-04-17T10:00:00Z",
  "uptime_seconds": 3600,
  "dependencies": {
    "database": {"status": "healthy", "latency_ms": 5, "last_check": "..."},
    "upstream_api": {"status": "healthy", "latency_ms": 42, "last_check": "..."}
  },
  "version": "1.2.3"
}
```

- HTTP 200 → healthy
- HTTP 503 → unhealthy（至少一个关键依赖失败）

## 使用示例

- **场景 1 —— Liveness 不检查 DB**：DB 连接池耗尽，liveness 仍返回 200（liveness 不检查 DB），避免所有 pod 重启
- **场景 2 —— Readiness 失败**：关键下游 API 不可达，readiness 返回 503，pod 移出 LB；process 不重启
- **场景 3 —— Startup → Liveness 交棒**：服务需要 60s 预热缓存，startup probe 在前 60s 持续返回 503，预热完成后改由 liveness 接手

## 错误码

- `HC-001` — `HEALTH_CHECK_FAILED`（关键依赖失败）
- `HC-002` — `HEALTH_CHECK_TIMEOUT`（probe 本身超时）
- `HC-003` — `INVALID_DEPENDENCY_SET`（readiness 检查了非关键依赖，设计违规）

## 参考资料

- AI 优化版：[ai/standards/health-check-standards.ai.yaml](../../../ai/standards/health-check-standards.ai.yaml)
- XSPEC-067：DEC-043 Wave 1 Reliability Pack 跨项目规格
- DEC-043：UDS 覆盖完整性路线图（驱动来源）
- 相关：`deployment-standards`, `circuit-breaker`, `alerting-standards`（probe 连续失败 → 告警触发与路由）, observability-standards（XSPEC-063 规划中）
- 业界：Kubernetes probes, Microsoft eShop health checks, Google SRE Book Ch.6


**范围**: universal
