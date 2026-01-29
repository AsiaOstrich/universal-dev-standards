---
source: ../../core/logging-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-24
status: current
---

> **语言**: [English](../../core/logging-standards.md) | [简体中文](../../zh-TW/core/logging-standards.md) | 简体中文

# 日志标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有需要日志记录的应用程序

---

## 目的

本标准定义日志记录的最佳实践，确保日志的一致性、结构化和可操作性。

---

## 日志级别

### 标准级别

| 级别 | 代码 | 使用场景 | 生产环境 |
|------|-----|---------|---------|
| TRACE | 10 | 非常详细的调试信息 | 关闭 |
| DEBUG | 20 | 调试诊断信息 | 关闭 |
| INFO | 30 | 正常操作事件 | 开启 |
| WARN | 40 | 潜在问题、可恢复错误 | 开启 |
| ERROR | 50 | 需要关注的错误 | 开启 |
| FATAL | 60 | 致命故障、程序终止 | 开启 |

### 级别选择指南

| 问题 | 级别 |
|------|-----|
| 仅用于调试？ | DEBUG |
| 正常操作完成？ | INFO |
| 异常但可接受？ | WARN |
| 操作失败？ | ERROR |
| 无法继续？ | FATAL |

---

## 结构化日志

### 必要字段

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "用户登录成功",
  "service": "auth-service",
  "environment": "production"
}
```

### 推荐字段

```json
{
  "trace_id": "abc123",
  "span_id": "def456",
  "request_id": "req_67890",
  "user_id": "usr_12345",
  "duration_ms": 150
}
```

### 字段命名规范

- 使用 `snake_case`
- 跨服务保持一致
- 按领域添加前缀：`http_`、`db_`、`queue_`

---

## 敏感数据处理

### 绝不记录

- 密码或密钥
- API 密钥或令牌
- 信用卡号码
- 身份证号码
- 完整的认证令牌

### 脱敏处理

```javascript
// 错误
logger.info('登录尝试', { password: userPassword });

// 正确
logger.info('登录尝试', { password: '***REDACTED***' });

// 正确 - 部分脱敏
logger.info('卡片处理', { last_four: '4242' });
```

---

## 错误日志

### 必要字段

```json
{
  "level": "ERROR",
  "message": "数据库连接失败",
  "error_type": "ConnectionError",
  "error_message": "连接被拒绝",
  "error_code": "ECONNREFUSED",
  "stack": "Error: Connection refused\n    at connect (/app/db.js:45:11)..."
}
```

### 错误上下文

始终包含：
- 尝试执行的操作
- 相关标识符（user_id、request_id）
- 输入参数（已脱敏）
- 重试次数（如适用）

---

## 保留策略

| 日志级别 | 保留期限 |
|---------|---------|
| DEBUG | 7 天 |
| INFO | 30 天 |
| WARN | 90 天 |
| ERROR/FATAL | 1 年 |

---

## OpenTelemetry 整合

### 语义规范

OpenTelemetry 定义标准化的属性名称，确保跨工具的互操作性。

**资源属性**（服务身份）:

| 属性 | 说明 | 范例 |
|------|------|------|
| `service.name` | 逻辑服务名称 | `payment-service` |
| `service.version` | 服务版本 | `2.3.1` |
| `service.instance.id` | 唯一实例标识符 | `pod-abc123` |
| `deployment.environment` | 环境名称 | `production` |

**HTTP 属性**:

| 属性 | 说明 | 范例 |
|------|------|------|
| `http.request.method` | HTTP 方法 | `POST` |
| `http.route` | 路由模式 | `/api/v1/users/{id}` |
| `http.response.status_code` | 响应状态 | `200` |

**数据库属性**:

| 属性 | 说明 | 范例 |
|------|------|------|
| `db.system` | 数据库类型 | `postgresql` |
| `db.name` | 数据库名称 | `orders_db` |
| `db.operation` | 操作类型 | `SELECT` |

### 日志严重性对照

| 传统级别 | OTel 严重性 | OTel 数值 |
|---------|------------|----------|
| TRACE | TRACE | 1-4 |
| DEBUG | DEBUG | 5-8 |
| INFO | INFO | 9-12 |
| WARN | WARN | 13-16 |
| ERROR | ERROR | 17-20 |
| FATAL | FATAL | 21-24 |

---

## 可观测性三支柱整合

### 日志、指标、追踪关联

现代可观测性需要通过共享标识符关联三大支柱。

```
┌─────────────────────────────────────────────────────────────────┐
│                      可观测性三支柱                               │
├─────────────────────────────────────────────────────────────────┤
│   ┌──────────┐    trace_id    ┌──────────┐    trace_id    ┌──────────┐
│   │   LOGS   │◄──────────────►│  TRACES  │◄──────────────►│ METRICS  │
│   │  (事件)   │                │  (Spans) │                │ (计数器)  │
│   └──────────┘                └──────────┘                └──────────┘
│                    关联键: trace_id, span_id, service.name              │
└─────────────────────────────────────────────────────────────────┘
```

### 关联最佳实践

| 实践 | 好处 |
|------|------|
| 日志中始终包含 `trace_id` | 从日志跳转到完整追踪 |
| 在指标中加入 `trace_id` 作为 exemplar | 调查指标异常 |
| 使用一致的 `service.name` | 跨所有支柱筛选 |

---

## 基于日志的告警

### 告警设计原则

**1. 避免告警风暴**

```yaml
# 不好：每个错误都告警
- alert: ErrorOccurred
  expr: log_errors_total > 0  # ❌ 太吵杂

# 好：基于错误率告警
- alert: ErrorRateHigh
  expr: rate(log_errors_total[5m]) > 0.01  # ✅ 基于比率
  for: 5m
```

**2. 分组相关告警**

```yaml
group_by: ['service', 'error_type']
group_wait: 30s
group_interval: 5m
```

### 告警严重性指南

| 严重性 | 响应时间 | 条件范例 |
|--------|---------|---------|
| Critical | 立即（呼叫） | 服务宕机、数据丢失风险 |
| Warning | 数小时内 | 错误率升高、资源 80% |
| Info | 下个工作日 | 弃用警告、轻微异常 |

---

## 进阶关联模式

### 跨服务关联 ID

跨服务边界传播关联上下文：

**W3C Trace Context 头**:

```http
traceparent: 00-abc123def456-span789-01
tracestate: vendor=value
```

**消息队列传播**:

```json
{
  "headers": {
    "traceparent": "00-abc123-def456-01"
  },
  "body": {
    "order_id": "ORD-123"
  }
}
```

### 业务事务关联

对于多步骤业务流程：

```json
{
  "trace_id": "abc123",
  "business_correlation": {
    "transaction_id": "TXN-789",
    "order_id": "ORD-456",
    "flow_step": "3/5",
    "flow_name": "order_fulfillment"
  }
}
```

---

## 快速参考卡

### 必要字段检查清单

- [ ] timestamp（ISO 8601）
- [ ] level
- [ ] message
- [ ] 服务名称
- [ ] request_id 或 trace_id

### 安全检查清单

- [ ] 无密码或密钥
- [ ] 无完整令牌
- [ ] PII 已脱敏
- [ ] 永不记录信用卡
- [ ] 已配置保留策略

---

## 相关标准

- [测试标准](testing-standards.md) - 测试日志输出（或使用 `/testing-guide` 技能）
- [代码审查清单](code-review-checklist.md) - 审查日志实践

---

## 版本历史

| 版本 | 日期 | 变更 |
|-----|------|------|
| 1.2.0 | 2026-01-24 | 新增：OpenTelemetry 语义规范、可观测性三支柱整合、基于日志的告警、进阶关联模式 |
| 1.1.0 | 2026-01-05 | 新增：参考标准章节，包含 OWASP、RFC 5424、OpenTelemetry 和 12 Factor App |
| 1.0.0 | 2025-12-30 | 初始日志标准 |

---

## 参考标准

- [OWASP 日志备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) - 安全日志最佳实践
- [RFC 5424 - Syslog 协议](https://datatracker.ietf.org/doc/html/rfc5424) - 标准日志消息格式
- [OpenTelemetry 日志](https://opentelemetry.io/docs/specs/otel/logs/) - 现代可观测性标准
- [OpenTelemetry 语义规范](https://opentelemetry.io/docs/specs/semconv/) - 标准化属性命名
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) - 分布式追踪上下文传播
- [12 Factor App - 日志](https://12factor.net/logs) - 云原生日志原则
- [Google SRE - 基于 SLO 告警](https://sre.google/workbook/alerting-on-slos/) - 告警设计最佳实践

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
