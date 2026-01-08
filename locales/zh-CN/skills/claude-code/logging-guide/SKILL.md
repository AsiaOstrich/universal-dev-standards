---
name: logging-guide
description: |
  实作结构化日志，包含正确的日志层级和敏感资料处理。
  使用时机：新增日志、除错、设定可观测性。
  关键字：logging, log level, structured logging, observability, 日志, 记录, 结构化日志。
source: ../../../../../skills/claude-code/logging-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 日志指南

> **语言**: [English](../../../../../skills/claude-code/logging-guide/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: Claude Code Skills

---

## 目的

此技能帮助在所有环境中实作一致、结构化且可操作的应用程式日志。

## 快速参考

### 日志层级

| 层级 | 代码 | 使用时机 | 生产环境 |
|------|------|----------|----------|
| **TRACE** | 10 | 非常详细的除错资讯 | 关闭 |
| **DEBUG** | 20 | 详细的除错资讯 | 关闭 |
| **INFO** | 30 | 正常操作事件 | 开启 |
| **WARN** | 40 | 潜在问题，可恢复 | 开启 |
| **ERROR** | 50 | 需要注意的错误 | 开启 |
| **FATAL** | 60 | 严重故障 | 开启 |

### 层级选择决策树

```
只用于除错？               → DEBUG（生产环境关闭）
正常操作完成？             → INFO
意外但没问题的情况？       → WARN
操作失败？                 → ERROR
应用程式无法继续？         → FATAL
```

### 各层级使用时机

| 层级 | 范例 |
|------|------|
| **TRACE** | 函式进入/离开、回圈迭代、变数值 |
| **DEBUG** | 状态变更、设定值、查询参数 |
| **INFO** | 应用启动/关闭、使用者操作、排程任务 |
| **WARN** | 已弃用 API、重试尝试、资源接近上限 |
| **ERROR** | 失败的操作、捕获的例外、整合失败 |
| **FATAL** | 无法恢复的错误、启动失败、失去关键资源 |

## 结构化日志

### 必要栏位

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "使用者登入成功",
  "service": "auth-service",
  "environment": "production"
}
```

### 建议栏位

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "使用者登入成功",
  "service": "auth-service",
  "environment": "production",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "usr_12345",
  "request_id": "req_67890",
  "duration_ms": 150,
  "http_method": "POST",
  "http_path": "/api/v1/login",
  "http_status": 200
}
```

### 栏位命名惯例

使用 `snake_case` 并加上领域前缀：

| 领域 | 常用栏位 |
|------|----------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| 资料库 | db_query_type, db_table, db_duration_ms, db_rows_affected |
| 伫列 | queue_name, queue_message_id, queue_delay_ms |
| 使用者 | user_id, user_role, user_action |
| 请求 | request_id, trace_id, span_id |

## 详细指南

完整标准请参考：
- [日志标准](../../../core/logging-standards.md)

### AI 优化格式（节省 Token）

AI 助手可使用 YAML 格式档案以减少 Token 使用量：
- 基础标准：`ai/standards/logging.ai.yaml`

## 敏感资料处理

### 绝对不要记录

- 密码或机密
- API 金钥或 Token
- 信用卡号码
- 身分证字号
- 完整的认证 Token

### 遮罩或编修

```javascript
// 不好
logger.info('登入尝试', { password: userPassword });

// 好
logger.info('登入尝试', { password: '***已编修***' });

// 好 - 部分遮罩
logger.info('卡片已处理', { last_four: '4242' });
```

### PII 处理

- 尽可能记录使用者 ID 而非电子邮件
- 对敏感查询使用杂凑识别码
- 设定资料保留政策

## 错误日志

### 必要的错误栏位

```json
{
  "level": "ERROR",
  "message": "资料库连线失败",
  "error_type": "ConnectionError",
  "error_message": "连线被拒绝",
  "error_code": "ECONNREFUSED",
  "stack": "Error: Connection refused\n    at connect (/app/db.js:45:11)..."
}
```

### 错误上下文

务必包含：
- 尝试的操作是什么
- 相关识别码（user_id, request_id）
- 输入参数（已清理）
- 重试次数（如适用）

```javascript
logger.error('处理订单失败', {
  error_type: err.name,
  error_message: err.message,
  order_id: orderId,
  user_id: userId,
  retry_count: 2,
  stack: err.stack
});
```

## 日志格式

### JSON 格式（生产环境）

```json
{"timestamp":"2025-01-15T10:30:00.123Z","level":"INFO","message":"请求完成","request_id":"req_123","duration_ms":45}
```

### 人类可读格式（开发环境）

```
2025-01-15T10:30:00.123Z [INFO] 请求完成 request_id=req_123 duration_ms=45
```

## 效能考量

### 各环境的日志量

| 环境 | 层级 | 策略 |
|------|------|------|
| 开发 | DEBUG | 所有日志 |
| 测试 | INFO | 大部分日志 |
| 生产 | INFO | 高流量端点采样 |

### 高流量端点

- 使用采样（每 100 笔记录 1 笔）
- 聚合指标而非个别日志
- 使用独立的日志串流

## 检查清单

### 必要栏位

- [ ] timestamp（ISO 8601）
- [ ] level
- [ ] message
- [ ] service name
- [ ] request_id 或 trace_id

### 安全性

- [ ] 没有密码或机密
- [ ] 没有完整 Token
- [ ] PII 已遮罩或杂凑
- [ ] 信用卡从不记录
- [ ] 保留政策已设定

---

## 设定侦测

此技能支援专案特定设定。

### 侦测顺序

1. 检查现有的日志程式库设定
2. 检查 `CONTRIBUTING.md` 中的日志指南
3. 若无找到，**预设使用结构化 JSON 日志**

### 首次设定

若未找到日志标准：

1. 建议：「此专案尚未设定日志标准。您要设定结构化日志吗？」
2. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 日志标准

### 日志层级
- DEBUG: 仅开发环境，详细诊断资讯
- INFO: 正常操作（启动、使用者操作、任务）
- WARN: 意外但可恢复的情况
- ERROR: 需要调查的失败

### 必要栏位
所有日志必须包含：timestamp, level, message, service, request_id

### 敏感资料
绝不记录：密码、Token、信用卡、身分证字号
```

---

## 相关标准

- [日志标准](../../../core/logging-standards.md)
- [错误码标准](../../../core/error-code-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始发布 |

---

## 授权

此技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
