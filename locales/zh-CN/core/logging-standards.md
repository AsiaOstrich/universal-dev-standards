---
source: ../../../core/logging-standards.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-07-08
source_hash: 732277ef939f
status: current
---

> **语言**: [English](../../../core/logging-standards.md) | 简体中文

# 日志标准

**版本**: 1.4.0
**最后更新**: 2026-06-17
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: RFC 5424, OpenTelemetry, W3C Trace Context
**参考**: [opentelemetry.io](https://opentelemetry.io/)

---

## 目的

本标准定义日志记录的最佳实践，确保日志的一致性、结构化和可操作性。

## 强制事件（Mandatory Events）

> **关闭** UDS issue [#108](https://github.com/AsiaOstrich/universal-dev-standards/issues/108)（XSPEC-234）。本标准其余部分定义**如何**写一条日志（级别／字段／PII 脱敏／轮转）；本节定义**何时必须写**——把「格式合规但实质沉默」的日志排除在外。

遵守所有格式规则、却**在关键时刻从不触发**的日志比没有日志还糟：它在事故发生时给人一种虚假的安全感。以下事件是**必须**写日志的 canonical 时机，每项声明 `when`／`must_log`／`must_NOT_log`／`level`／`rationale`。

### 为何需要（真实事故）

某次 PHP→.NET 迁移耗费 2 天诊断「发送失败、没有日志」，原因是**四层全部沉默**：

1. **负载均衡器将后端标记为 DOWN**（503）——health probe 超时；后端只记录了 probe 噪音，零业务事件。
2. **框架验证 reject**（如 ModelState／DTO 501）——校验框架在任何 handler 执行前就返回，**payload 从未被记录**。
3. **认证失败**只记录了「Account or password error」——**无 uid、无 source IP** → 无法排查。
4. **后台 worker 仍存活，但日志文件 0 字节**——没有机制检测到这种沉默。

以上都无法仅靠格式规则捕捉，强制事件补上这一缺口。

### 类目（9 个 canonical 事件）

| id | when（时机） | level | 核心必填字段（`must_log`） | `must_NOT_log` |
|----|------|-------|-----------------------------------|----------------|
| `application_startup` | 进程启动后、**接受请求前** | INFO | app_name, version, git_sha, environment, hostname, pid, listening_endpoints | secrets、完整连接字符串 |
| `request_received` | HTTP 中间件首次看到请求 | INFO / DEBUG | method, path, source_ip, request_id | request body、auth headers |
| `validation_failure` | schema / ModelState / DTO 验证被拒绝 | WARN | request_id, path, missing_fields[], payload_shape（仅字段名） | 字段**值**、PII |
| `authentication_failure` | 登录 / token 校验失败 | WARN | uid（尝试值）, source_ip, failure_reason | password、token 值 |
| `outbound_call_start` | 发起对外 HTTP/RPC 调用 | INFO | target_url（host+path）, request_id propagated, timeout_ms | credentials、bearer token |
| `outbound_call_complete` | 外部调用返回或失败 | INFO / WARN / ERROR | status_code **或** failure_phase（dns/tcp/tls/http）, elapsed_ms, retries | 含 PII 的 response body |
| `business_event` | 状态变更类业务操作完成 | INFO | operation_name, actor, target ids, outcome | 完整 record payload、PII |
| `heartbeat` | 长时间运行的后台服务，≥ 1 次 / 60 秒 | INFO | service_name, queue_depth, items_processed_since_last_heartbeat | — |
| `shutdown` | 进程退出（正常或致命） | INFO / ERROR | app_name, signal/reason, uptime_seconds, pending_work_count | — |

每个事件的 `rationale` 都对应一个真实失效模式：`validation_failure` ⇒ 事故 #2（payload 未记录）；`authentication_failure` 字段要求 ⇒ 事故 #3（无 uid/IP）；`heartbeat` + 沉默检测 ⇒ 事故 #4（0 字节日志）；`application_startup`/`shutdown` ⇒ 生命周期盲区；`outbound_call_*` ⇒「发送失败」却查不到调用痕迹。

### 场景

#### 场景：验证失败必须产生日志

- **GIVEN** API 端点收到缺少 `[Required]` 字段的 payload
- **WHEN** 框架在 handler 执行前自动 reject（如 400/501）
- **THEN** 必须写一条 WARN 日志，包含 `request_id`、`path`、`missing_fields[]`、`payload_shape`（仅字段名）
- **AND** 事后复盘可直接从日志重建失败原因

#### 场景：后台服务必须心跳（heartbeat）

- **GIVEN** worker 进程正在运行
- **WHEN** 60 秒内没有写入任何 INFO/WARN/ERROR
- **THEN** 必须写一条 `heartbeat` 日志，包含当前 queue depth 与自上次心跳以来的处理量
- **AND** 若连续 ≥ 2 倍心跳间隔（≥ 120 秒）未出现心跳，沉默检测器必须告警

### Compliant startup log 示例

```json
{
  "timestamp": "2026-06-17T08:00:00.000Z",
  "level": "INFO",
  "message": "application_startup",
  "event": "application_startup",
  "app_name": "payment-service",
  "version": "2.3.1",
  "git_sha": "a1b2c3d",
  "environment": "production",
  "hostname": "pod-abc123",
  "pid": 4711,
  "listening_endpoints": ["0.0.0.0:8080", "0.0.0.0:9090/metrics"]
}
```

### 后续规则

1. **访问日志分离**——health probe／liveness 流量不得污染业务事件日志。将 probe 路由至独立 sink／文件，避免其淹没或轮转掉业务事件（见事故 #1）。
2. **日志沉默检测 SLA**——服务应在连续 N 分钟无事件时告警，N ≤ 2 × `heartbeat` 间隔。缺少预期日志本身就是一种可告警条件（参见下方「Absence of Expected Logs」告警模式）。
3. **面向运维的日志可发现性**——返回给客户端的错误响应应携带 `request_id`，以便支持人员将用户报告的故障对应到后端日志，无需为查日志来回沟通。

> **交叉引用**：`heartbeat`／沉默检测与[日志文件轮转策略](#日志文件轮转策略)互补（0 字节／静默丢弃的日志是同一盲区的两个方向），并与 migration-assistant 的后台任务／副作用完整性互补（这些事件即是可观测的「已触发」证据）。

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

### 轮转检查清单

- [ ] 已设置时间轮转（`rollingInterval: Day` 或同等配置）
- [ ] 已设置大小轮转，`rollOnFileSizeLimit: true`（或同等配置）
- [ ] 已显式配置 `fileSizeLimitBytes`（默认上限会造成危害）
- [ ] `retainedFileCountLimit` ≥ N×7，以覆盖窗口内的轮转文件
- [ ] 已定义 90% 大小 SOP：调查噪声根因，不要盲目提高上限

---

## 日志文件轮转策略

### 轮转策略——必须同时设置两者

基于文件的日志接收器配置**必须**包含**两个**触发器：

1. **基于时间的轮转**（`rollingInterval: Day` 或同等配置）——按时间分区
2. **基于大小的轮转**，`rollOnFileSizeLimit: true`（或同等配置）——应对流量峰值

> **为何必须：** 大多数日志库默认带有静默的大小上限。当文件达到上限时，后续的日志写入会被**静默丢弃**——无任何警告或错误提示。应用程序继续运行，而半天的日志就此消失。同时显式设置两个触发器可避开这个陷阱。

### 生产环境中的默认上限危害

| 库 | 默认大小上限 | 达到上限时的行为 |
|---|---|---|
| Serilog File sink (.NET) | 1 GB | **静默停止写入**（`RollOnFileSizeLimit = false` 为默认值） |
| log4j RollingFileAppender | 未设置则无上限 | 同上——不轮转即丢弃 |
| Python `RotatingFileHandler` | 未设置 `maxBytes` 则无限 | 无限增长 |
| Winston `winston-daily-rotate-file` | 未设置 `maxSize` 则无上限 | 同上——不轮转即丢弃 |

若未显式配置基于大小的轮转，即是接受上述某种失败模式。

### 推荐初始值

| 参数 | 取值 | 说明 |
|---|---|---|
| `fileSizeLimitBytes` | 100 MB | 平衡：足够小以便编辑器打开，足够大以避免过多轮转 |
| `rollOnFileSizeLimit` | `true` | 达到上限时创建 `*-001.txt`、`*-002.txt`；**不要**丢弃 |
| `retainedFileCountLimit` | ≥ N×7（N = 每天最大预期轮转次数） | 避免过早删除窗口内的日志 |

### 各语言配置示例

**.NET / Serilog**（`appsettings.json`）：

```json
{
  "Serilog": {
    "WriteTo": [{
      "Name": "File",
      "Args": {
        "path": "logs/app-.txt",
        "rollingInterval": "Day",
        "fileSizeLimitBytes": 104857600,
        "rollOnFileSizeLimit": true,
        "retainedFileCountLimit": 90
      }
    }]
  }
}
```

**Python**（`logging.handlers`）：

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    filename="logs/app.log",
    maxBytes=104857600,   # 100 MB
    backupCount=90        # 低基数时约保留 3 个月的轮转文件
)
# 如需时间+大小组合轮转，可组合使用 TimedRotatingFileHandler 并检查大小，
# 或使用第三方库如 concurrent-log-handler。
```

**Java / log4j2**（`log4j2.xml`）：

```xml
<RollingFile name="App" fileName="logs/app.log"
             filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
  <PatternLayout pattern="%d %-5p %c{1.} - %m%n"/>
  <Policies>
    <TimeBasedTriggeringPolicy interval="1"/>
    <SizeBasedTriggeringPolicy size="100 MB"/>
  </Policies>
  <DefaultRolloverStrategy max="90"/>
</RollingFile>
```

**Node / Winston**（`winston-daily-rotate-file`）：

```javascript
import DailyRotateFile from "winston-daily-rotate-file";

new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m",
  maxFiles: "90d"
});
```

### 运营 SOP——调查根因，不要仅提高上限

若日志文件大小在预计当天结束时达到 `fileSizeLimitBytes` 的 ≥ 90%，**在提高上限之前先调查原因**。典型根因：

- 在 INFO 级别记录每次重试的嘈杂重试循环（应改为 WARN 摘要）
- 意外在生产环境启用的无限制 debug 日志
- 单个上游故障引发的堆栈跟踪洪流
- 健康探针 / sidecar 污染业务日志

提高上限只会掩盖底层噪声问题，并将下一次故障推迟到更远的未来。

### 失败模式参考（真实事故）

某生产 .NET Worker 仅使用 `rollingInterval: Day`（未设置大小限制，Serilog 默认 1 GB 上限），在 07:31 触达上限后静默丢弃了所有日志条目，直到 13:00+ 运维人员发现日志尾部已停止更新。连续 5 个日志文件均显示 `~1,073,741,8XX 字节`（= 1 GiB，Serilog 默认值）。半天的生产诊断数据就此丢失。同时设置 `fileSizeLimitBytes` 和 `rollOnFileSizeLimit: true` 本可在保留所有事件的情况下将文件轮转为 `worker-YYYYMMDD_001.txt`。

---

## 相关标准

- [测试标准](testing-standards.md) - 测试日志输出（或使用 `/testing-guide` 技能）
- [代码审查清单](code-review-checklist.md) - 审查日志实践

---

## 版本历史

| 版本 | 日期 | 变更 |
|-----|------|------|
| 1.4.0 | 2026-06-17 | 新增：强制事件类目——9 个 canonical「何时必须写日志」事件（when/must_log/must_NOT_log/level/rationale）、验证失败 + heartbeat 场景、compliant startup 示例、后续规则（访问日志分离、沉默检测 SLA、request_id 可发现性）（XSPEC-234 / 关闭 issue #108） |
| 1.3.0 | 2026-05-26 | 新增：日志文件轮转策略——强制双触发器（时间 + 大小）轮转，含默认上限危害警告、各语言（.NET/Python/Java/Node）配置示例、运营 SOP（XSPEC-232 / 关闭 issue #111） |
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
