---
source: ../../../core/chaos-engineering-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 20b92ddacd4c
status: current
---

# 混沌工程标准

> **语言**: 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范围**: universal
**许可**: CC BY 4.0
**参考**: [Principles of Chaos Engineering](https://principlesofchaos.org/), [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)

---

## 概述

本文件定义混沌工程标准，涵盖实验工作流、故障注入类型、安全护栏、渐进式混沌阶段、SLO 集成及实验记录模板。目标是通过科学化的混沌实验持续验证系统韧性。

---

## 1. 实验工作流

混沌实验遵循 4 步科学方法以验证系统韧性。

### 4 步流程

| 步骤 | 名称 | 说明 |
|------|------|------|
| **步骤 1** | **假设** | 定义稳态假设：“在故障 X 下，系统应维持行为 Y。”描述预期行为与可量测指标。 |
| **步骤 2** | **实验** | 设计并执行故障注入。记录实验参数、持续时间与范围。 |
| **步骤 3** | **观察** | 监控系统指标、日志与告警。对比实际行为与假设。 |
| **步骤 4** | **结论** | 分析结果：假设确认或推翻。记录发现与改进项目。 |

### 假设指引

规范的稳态假设应当：
- 定义“正常”状态的表现（例如：p99 延迟 < 200ms，错误率 < 0.1%）
- 明确指定正在测试的故障条件
- 阐明故障期间预期的系统行为
- 具备可证伪性与可量测性

---

## 2. 故障注入类型

五种标准故障注入类型涵盖了分布式系统中最常见的故障模式。

| 类型 | 说明 | 示例 |
|------|------|------|
| **Network Latency** | 注入网络延迟或丢包 | 增加 200ms 延迟、5% 丢包、DNS 解析延迟 |
| **Service Disruption** | 终止或降级服务实例 | 随机 kill pods、关闭可用区、重启服务 |
| **Resource Exhaustion** | 耗尽计算资源 | CPU 饱和、内存压力、磁盘空间耗尽、文件描述符耗尽 |
| **Dependency Failure** | 模拟外部依赖故障 | 数据库连接中断、第三方 API 返回 503、缓存不可用 |
| **Clock Skew** | 引入时钟漂移或 NTP 异常 | 时钟向前/向后偏移 5 分钟、NTP 服务中断 |

### 选择故障类型

基于以下维度选择故障注入类型：
- 系统架构与已知薄弱点
- 历史事件模式
- 依赖关键性分析
- SLO 风险评估

---

## 3. 安全护栏

每个混沌实验**必须**具备安全护栏，以防止不受控制的损害。

### 三大安全机制

| 机制 | 说明 | 示例 |
|------|------|------|
| **Blast Radius** | 将影响范围限制在受控子集内 | 最多影响 N% 流量、最多影响 M 个实例、仅限单区域 |
| **Auto-Stop** | 定义终止实验的自动停止条件 | 错误率超过阈值、延迟超过上限、健康检查失败次数超标 |
| **Rollback** | 提供一键移除所有注入故障并恢复正常状态的机制 | 用于还原所有故障注入的紧急开关（Kill switch）、自动化清理脚本、基础设施回滚 |

### 护栏要求

- 每次实验在执行前**必须**定义所有三大机制
- Auto-Stop 条件**必须**进行实时监控
- Rollback **必须**在实验开始前经过测试
- 执行期间**必须**有指定的“实验负责人”（experiment owner）在场

---

## 4. 渐进式混沌

混沌工程的采纳遵循渐进式的 3 阶段方法，每个阶段都具有在晋级前必须满足的前提条件。

### 3 阶段演进

| 阶段 | 环境 | 前提条件 |
|-------|-------------|---------------|
| **阶段 1** | **非生产** | 基础监控就位；团队理解混沌工程原则；已定义安全护栏 |
| **阶段 2** | **Staging** | 在阶段 1 完成 3 次以上成功的实验；部署了完整的可观测性系统；自动化回滚已验证 |
| **阶段 3** | **生产** | 阶段 2 完成且无重大问题；成熟的安全护栏已得到验证；获得管理层批准；事件响应计划就绪 |

### 阶段晋级标准

- 每个阶段都需要有前提条件已完成的书面凭证
- 阶段晋级决策应由团队进行评审
- 若发现新风险，退回上一阶段是可接受的

---

## 5. SLO 集成

混沌实验必须与 SLO 错误预算（Error Budget）管理协同进行，以避免对服务可靠性造成过度影响。

### 错误预算约束

| 规则 | 阈值 | 说明 |
|------|-----------|-------------|
| **单次实验限制** | **10%** | 单次混沌实验不得消耗超过总 Error Budget 的 10% |
| **暂停阈值** | **30%** | 当剩余 Error Budget 低于 30% 时，应暂停混沌实验 |
| **预算报告** | — | 来自混沌实验的所有 Error Budget 影响必须记录在 Error Budget 报告中 |

### 集成指引

- 在 Error Budget 充足（剩余 > 50%）时安排混沌实验
- 在运行可能影响 SLI 的实验前，与 SLO 负责人进行协调
- 尽可能将混沌引发的错误与常态错误分开追踪
- 在定期的 SLO 评审会议中审查混沌实验的影响

---

## 6. 实验记录模板

每个完成的混沌实验**必须**使用标准记录模板进行记录。

### 5 区段记录格式

| 区段 | 内容 |
|---------|---------|
| **假设** | 稳态假设描述、预期行为、可量测指标 |
| **方法** | 故障注入类型、参数、持续时间、blast radius、环境 |
| **结果** | 观察到的实际系统行为、指标变化、告警触发、用户影响 |
| **学习** | 假设确认或推翻、发现的弱点、非预期行为 |
| **行动** | 后续改进计划、负责人、时间线、相关 ticket |

### 记录示例

```markdown
## Chaos Experiment Record

### Hypothesis
Under a 200ms network latency injection on the payment service,
the checkout flow should complete within 3 seconds (p99) with zero failed transactions.

### Method
- **Type**: Network Latency
- **Target**: payment-service pods (2 of 6)
- **Parameters**: 200ms delay on all outbound requests
- **Duration**: 15 minutes
- **Blast Radius**: 33% of payment service instances
- **Environment**: Staging

### Result
- Checkout p99 latency increased to 2.8s (within threshold)
- 0 failed transactions
- 2 timeout alerts triggered (expected)
- No user-facing errors

### Learning
- Hypothesis CONFIRMED
- Retry logic worked as expected
- Timeout alert threshold may need adjustment (too sensitive)

### Action
- [ ] Adjust timeout alert threshold from 2s to 3s (owner: SRE team, by: next sprint)
- [ ] Add circuit breaker metrics to dashboard (owner: platform team, by: next sprint)
```

---

## 参考资料

- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)
- [Gremlin Chaos Engineering Guide](https://www.gremlin.com/chaos-engineering/)
- [AWS Fault Injection Simulator](https://aws.amazon.com/fis/)

---

*本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。*
