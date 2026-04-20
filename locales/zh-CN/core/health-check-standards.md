---
source: ../../../core/health-check-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 健康检查标准

> **语言**: [English](../../../core/health-check-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

健康检查标准：liveness / readiness / startup 三种 probe、深度 health check、结构化 JSON 响应。

业界常见错误：把 liveness 和 readiness 混用（健康检查检查外部依赖导致连锁重启）。本标准明确三种 probe 语义分离，定义深度 health check 的检查范围（仅关键依赖），并规范结构化 JSON 响应以便下游自动化处理。

---

## 核心规范

- Liveness probe 不得检查外部依赖（DB、下游 API），否则会造成连锁重启
- Readiness probe 可检查关键外部依赖，但仅关键（非全部依赖）
- 慢启动服务应使用 startup probe，启动完成后交棒给 liveness
- Health check 端点必须回传结构化 JSON，包含 status / dependencies / timestamp
- Health check 结果应作为 observability 的 Error signal 之一，连续 fail 触发 incident

---

## 三种 Probe 类型

### Liveness Probe

- **目的**：服务是否还存活（process 是否卡死）
- **建议端点**：`GET /health/live`
- **允许检查**：process 是否能响应 HTTP、内部 event loop 是否可用
- **禁止检查**：DB 连接、下游 API、消息队列（会造成连锁重启）
- **失败行为**：重启 pod / process
- **参数**：failureThreshold=3，periodSeconds=10

### Readiness Probe

- **目的**：是否可接收流量
- **建议端点**：`GET /health/ready`
- **允许检查**：自身 API 可用、DB 连接（若服务必须依赖 DB）、关键下游依赖、必要配置已加载
- **禁止检查**：非关键依赖（避免非关键故障造成服务被移出负载均衡）
- **失败行为**：移出负载均衡，不重启
- **参数**：failureThreshold=3，periodSeconds=5

### Startup Probe

- **目的**：启动期专用，替代慢启动服务的 liveness
- **建议端点**：`GET /health/startup`
- **检查项目**：启动过程所需资源（如缓存预热、index 加载）已完成
- **失败行为**：重启 pod（启动超时）
- **完成后**：停用，改由 liveness 接手
- **参数**：failureThreshold=30，periodSeconds=10

---

## 深度规则

| 层级 | 使用时机 | 检查范围 |
|------|---------|---------|
| Shallow | Liveness | process 是否可响应，不碰任何外部依赖 |
| Deep | Readiness | 自身 API 路由、DB ping（若必须）、关键下游 API ping |

**关键依赖的定义**：没有它服务就完全无法提供核心功能。

---

## 响应格式

**Content-Type**：`application/json`

| HTTP 状态码 | 含义 |
|------------|------|
| `200` | healthy — 所有关键依赖正常 |
| `503` | unhealthy — 至少一个关键依赖失败 |

**JSON Schema**：

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "<ISO-8601>",
  "uptime_seconds": 12345,
  "version": "1.0.0",
  "dependencies": {
    "database": {
      "status": "healthy | unhealthy",
      "latency_ms": 5,
      "last_check": "<ISO-8601>"
    },
    "upstream_api": {
      "status": "healthy | unhealthy",
      "latency_ms": 20
    }
  }
}
```

---

## 与 Observability 整合

- Health check 结果应作为 RED metric 的 Error 来源之一（Rate / Errors / Duration）
- 连续 N 次 health check failed 应触发 incident（对齐 incident-response）
- probe 延迟本身应被监控（异常缓慢可能是 resource_exhaustion 征兆）

---

## 情境示例

**情境 1：liveness 不检查 DB**
- 条件：DB 暂时无法连接
- Liveness 回传 200 healthy（不检查 DB），避免连锁重启

**情境 2：readiness 因关键依赖失败**
- 条件：关键下游 API 不可达
- Readiness 回传 503，pod 移出负载均衡但不重启

**情境 3：startup 后交棒 liveness**
- 条件：服务需 60s 预热缓存
- 前 60s startup probe 持续回 503，预热完成后交棒 liveness

---

## 错误码

| 代码 | 说明 |
|------|------|
| `HC-001` | `HEALTH_CHECK_FAILED` — 关键依赖失败 |
| `HC-002` | `HEALTH_CHECK_TIMEOUT` — probe 本身超时 |
| `HC-003` | `INVALID_DEPENDENCY_SET` — readiness 检查了非关键依赖（设计违规）|
