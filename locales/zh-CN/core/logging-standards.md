---
source: ../../../core/logging-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../../core/logging-standards.md) | [简体中文](../../zh-TW/core/logging-standards.md) | 简体中文

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
- [代码审查指南](code-review-guide.md) - 审查日志实践

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
