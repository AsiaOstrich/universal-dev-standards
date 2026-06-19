---
name: logging
description: |
  实现结构化日志，包含正确的日志级别和敏感数据处理。
  使用时机：新增日志、调试、设置可观测性。
  关键字：logging, log level, structured logging, observability, 日志, 记录, 结构化日志。
source: ../../../../skills/logging-guide/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-06-10
source_hash: 6b7244c91aa0
status: current
---

# 日志指南

> **语言**: [English](../../../../skills/logging-guide/SKILL.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-05-26
**适用范围**: Claude Code Skills

---

> **核心标准**: 本技能实现 [日志标准](../../../../core/logging-standards.md)。如需面向任何 AI 工具的完整方法论文档，请参阅核心标准。

## 目的

此技能帮助在所有环境中实现一致、结构化且可操作的应用程序日志。

## 快速参考

### 日志级别

| 级别 | 代码 | 使用时机 | 生产环境 |
|------|------|----------|----------|
| **TRACE** | 10 | 非常详细的调试信息 | 关闭 |
| **DEBUG** | 20 | 详细的调试信息 | 关闭 |
| **INFO** | 30 | 正常操作事件 | 开启 |
| **WARN** | 40 | 潜在问题，可恢复 | 开启 |
| **ERROR** | 50 | 需要关注的错误 | 开启 |
| **FATAL** | 60 | 严重故障 | 开启 |

### 级别选择决策树

```
只用于调试？               → DEBUG（生产环境关闭）
正常操作完成？             → INFO
意外但没问题的情况？       → WARN
操作失败？                 → ERROR
应用程序无法继续？         → FATAL
```

### 各级别使用时机

| 级别 | 示例 |
|------|------|
| **TRACE** | 函数进入/退出、循环迭代、变量值 |
| **DEBUG** | 状态变更、配置值、查询参数 |
| **INFO** | 应用启动/关闭、用户操作、定时任务 |
| **WARN** | 已弃用 API、重试尝试、资源接近上限 |
| **ERROR** | 失败的操作、捕获的异常、集成失败 |
| **FATAL** | 无法恢复的错误、启动失败、失去关键资源 |

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
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "用户登录成功",
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

### 字段命名规范

使用 `snake_case` 并加上领域前缀：

| 领域 | 常用字段 |
|------|----------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| 数据库 | db_query_type, db_table, db_duration_ms, db_rows_affected |
| 队列 | queue_name, queue_message_id, queue_delay_ms |
| 用户 | user_id, user_role, user_action |
| 请求 | request_id, trace_id, span_id |

## 详细指南

完整标准请参考：
- [日志标准](../../../../core/logging-standards.md)

### AI 优化格式（节省 Token）

AI 助手可使用 YAML 格式文件以减少 Token 使用量：
- 基础标准：`ai/standards/logging.ai.yaml`

## 敏感数据处理

### 绝不记录

- 密码或密钥
- API 密钥或令牌
- 信用卡号码
- 身份证号码
- 完整的认证令牌

### 脱敏处理

```javascript
// 不好
logger.info('登录尝试', { password: userPassword });

// 好
logger.info('登录尝试', { password: '***已脱敏***' });

// 好 - 部分脱敏
logger.info('卡片处理', { last_four: '4242' });
```

### PII 处理

- 尽可能记录用户 ID 而非电子邮件
- 对敏感查询使用哈希标识符
- 配置数据保留策略

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

务必包含：
- 尝试执行的操作是什么
- 相关标识符（user_id, request_id）
- 输入参数（已脱敏）
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

## 性能考量

### 各环境日志量

| 环境 | 级别 | 策略 |
|------|------|------|
| 开发 | DEBUG | 所有日志 |
| 预发布 | INFO | 大部分日志 |
| 生产 | INFO | 高流量端点采样 |

### 高流量端点

- 使用采样（每 100 条记录 1 条）
- 聚合指标而非单独日志
- 使用独立的日志流

## 日志文件轮转

基于文件的日志接收器**必须**同时设置**两个**轮转触发器——基于时间**和**基于大小。常见库（Serilog 1 GB、log4j/Winston/Python `RotatingFileHandler` 无上限）的默认大小上限会导致生产环境中的静默数据丢失。

```
✓ rollingInterval: Day                    # 基于时间
✓ fileSizeLimitBytes: 104857600 (100 MB)  # 基于大小
✓ rollOnFileSizeLimit: true               # 轮转，不丢弃
✓ retainedFileCountLimit: ≥ N*7           # N = 每天最大轮转次数
```

当日志文件大小在预计当天结束时达到 **`fileSizeLimitBytes` 的 ≥ 90%**，**先调查噪声根因**（嘈杂的重试循环 / 意外启用的调试日志 / 堆栈跟踪洪流），再提高上限。

> 含各语言（.NET Serilog / Python / Java log4j2 / Node Winston）配置示例及真实事故失败模式参考的完整规范，请参见核心标准中的 [日志文件轮转策略](../../core/logging-standards.md#日志文件轮转策略)。

## 检查清单

### 必要字段

- [ ] timestamp（ISO 8601）
- [ ] level
- [ ] message
- [ ] 服务名称
- [ ] request_id 或 trace_id

### 安全性

- [ ] 无密码或密钥
- [ ] 无完整令牌
- [ ] PII 已脱敏或哈希
- [ ] 信用卡从不记录
- [ ] 保留策略已配置

### 轮转

- [ ] 已设置时间轮转（`rollingInterval: Day` 或同等配置）
- [ ] 已设置大小轮转（`fileSizeLimitBytes` + `rollOnFileSizeLimit: true`）
- [ ] `retainedFileCountLimit` ≥ N×7（N = 每天最大轮转次数）
- [ ] 已定义 90% 大小 SOP（调查噪声，不要盲目提高上限）

---

## 配置检测

本技能支持项目特定配置。

### 检测顺序

1. 检查现有的日志库配置
2. 检查 `CONTRIBUTING.md` 中的日志指南
3. 若未找到，**默认使用结构化 JSON 日志**

### 首次设置

若未找到日志标准：

1. 建议："此项目尚未配置日志标准。是否要设置结构化日志？"
2. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 日志标准

### 日志级别
- DEBUG: 仅开发环境，详细诊断信息
- INFO: 正常操作（启动、用户操作、任务）
- WARN: 意外但可恢复的情况
- ERROR: 需要调查的失败

### 必要字段
所有日志必须包含：timestamp, level, message, service, request_id

### 敏感数据
绝不记录：密码、令牌、信用卡、身份证号码
```

---

## 下一步引导

`/logging` 完成后，AI 助手应建议：

> **日志标准已掌握。建议下一步 / Logging standards understood. Suggested next steps:**
> - 根据日志指南在代码中实现结构化日志 ⭐ **推荐** — 立即将日志标准应用到项目
> - 执行 `/errors` 设计错误码以配合日志系统 — 让错误追踪更高效
> - 执行 `/sdd` 将可观测性需求纳入规格 — 确保日志需求在规格中有定义

---

## 相关标准

- [日志标准](../../../../core/logging-standards.md)
- [错误码标准](../../../../core/error-code-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：日志文件轮转章节及核心标准轮转策略交叉引用；轮转检查清单（XSPEC-232） |
| 1.0.0 | 2025-12-30 | 初始发布 |

---

## 授权

本技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
