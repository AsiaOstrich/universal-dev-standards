---
source: ../../../core/performance-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: b678e96a3ff1
status: current
---

# 性能标准

> **语言**: [English](../../../core/performance-standards.md) | [繁體中文](../../zh-TW/core/performance-standards.md) | 简体中文

**版本**: 1.2.0
**最后更新**: 2026-06-17
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: ISO/IEC 25010 Performance Efficiency
**参考**: [sre.google](https://sre.google/books/)

> **详细说明和优化技术请参阅 [性能指南](guides/performance-guide.md)**

---

## 目的

本标准定义软件性能工程的综合指南，涵盖性能需求、测试方法和监控实践。

**参考标准**:
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 性能效率
- [Google SRE Book](https://sre.google/books/) - 站点可靠性工程

---

## 性能需求模板

### NFR 格式

```markdown
### NFR-PERF-XXX: [Title]

**Category**: Performance Efficiency > [Time Behavior/Resource Utilization/Capacity]
**Priority**: P1/P2/P3

**Requirement**:
| Percentile | Target | Maximum |
|------------|--------|---------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |

**Conditions**: [Load, data volume, etc.]
**Measurement**: [Tool, sampling, reporting]
```

---

## 常见性能目标

| 系统类型 | 响应时间（p95） | 吞吐量 | 可用性 |
|-------------|---------------------|------------|--------------|
| **电商** | < 200ms | 1000+ rps | 99.9% |
| **内部工具** | < 500ms | 100+ rps | 99.5% |
| **批处理** | 不适用 | 10K+ 记录/分钟 | 99% |
| **实时系统** | < 50ms (p99) | 10K+ rps | 99.99% |
| **API 网关** | < 100ms | 5K+ rps | 99.95% |

---

## Core Web Vitals 目标

| 指标 | 目标 | 描述 |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 感知加载速度 |
| **INP** (Interaction to Next Paint) | < 200ms | 响应性 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 视觉稳定性 |

---

## 性能预算

```yaml
# Example Performance Budget
resources:
  total_size: 500KB
  javascript: 200KB
  css: 50KB
  images: 200KB
  fonts: 50KB

metrics:
  time_to_interactive: 3s
  first_contentful_paint: 1.5s
  speed_index: 3s

lighthouse_scores:
  performance: 90
  accessibility: 100
  best_practices: 100
  seo: 100
```

---

## 性能指标

### 百分位指南

| 百分位 | 含义 | 适用场景 |
|------------|---------|---------|
| **p50** | 中位数 | 典型用户体验 |
| **p90** | 90% 更快 | 大多数用户体验 |
| **p95** | 95% 更快 | SLA 阈值（常见） |
| **p99** | 99% 更快 | 大多数用户的最差情况 |
| **p99.9** | 99.9% 更快 | 高容量系统 |

### 四个黄金信号（SRE）

| 信号 | 测量内容 | 目标 |
|--------|-----------------|--------|
| **Latency** | 响应时间（p50, p95, p99） | < SLA |
| **Traffic** | 每秒请求数 | 取决于容量 |
| **Errors** | 错误率 % | < 0.1% |
| **Saturation** | 资源利用率 | 持续 < 70% |

---

## 告警阈值

| 指标 | 警告 | 严重 | 操作 |
|--------|---------|----------|--------|
| **p95 响应时间** | > 200ms | > 500ms | 调查、扩容 |
| **错误率** | > 0.1% | > 1% | 呼叫 on-call |
| **CPU 使用率** | > 70% | > 90% | 扩容、优化 |
| **内存使用率** | > 80% | > 95% | 扩容、排查泄漏 |
| **磁盘使用率** | > 80% | > 95% | 清理、扩容 |

---

## 容量规划阈值

| 资源 | 规划阈值 | 严重 |
|----------|---------|----------|
| **计算 (CPU)** | 持续 70% | 90% |
| **内存** | 80% | 95% |
| **存储** | 70% | 90% |
| **网络** | 60% | 80% |
| **数据库连接** | 80% | 95% |

---

## 连接池配置

| 参数 | 建议值 | 说明 |
|-----------|-------------|-------|
| **最小连接数** | 5-10 | 保持预热连接 |
| **最大连接数** | 20-100 | 取决于数据库和应用服务器 |
| **空闲超时** | 10-30 分钟 | 释放未使用的连接 |
| **连接超时** | 5-10 秒 | 遇到问题时快速失败 |

---

## 限流配置

| 端点类型 | 限制 | 突发 |
|---------------|-------|-------|
| **公开 API** | 100/分钟 | 10 |
| **已认证** | 1000/分钟 | 50 |
| **高级层级** | 10000/分钟 | 200 |
| **内部** | 无限制 | 不适用 |

---

## 性能测试频率

| 测试类型 | 开发环境 | 预发布环境 | 生产环境 |
|-----------|-------------|---------|------------|
| **单元性能** | 每次提交 | - | - |
| **负载测试** | 每周 | 每次发布 | 每月 |
| **压力测试** | 每月 | 每次发布 | 每季度 |
| **浸泡测试** | 每月 | 重大发布 | 每季度 |
| **峰值测试** | - | 重大发布 | 活动前 |

---

## 性能检查清单

### 开发阶段

- [ ] 定义并记录性能需求
- [ ] 建立性能预算
- [ ] 优化数据库查询（索引、EXPLAIN）
- [ ] 实施缓存策略
- [ ] 列表端点支持分页
- [ ] 长时间运行的操作采用异步处理
- [ ] 配置连接池

### 发布前

- [ ] 使用类生产数据完成负载测试
- [ ] 完成压力测试（找出断裂点）
- [ ] 在 CI/CD 中进行性能回归测试
- [ ] 达到 Core Web Vitals 目标（若为前端）
- [ ] 完成数据库查询分析
- [ ] 缓存命中率在可接受范围内
- [ ] 错误率低于阈值

### 生产环境

- [ ] 配置 APM 监控
- [ ] 创建性能仪表板
- [ ] 定义告警阈值
- [ ] 记录容量规划
- [ ] 编写性能问题 Runbook
- [ ] 安排定期性能审查

---

## 性能测试执行

### 测试类型定义

| 测试类型 | 目的 | 适用场景 |
|----------|------|----------|
| **Load Test** | 验证系统在预期负载下的行为 | 发布前验证、容量规划 |
| **Stress Test** | 找出系统极限与崩溃行为 | 架构变更、扩展验证 |
| **Soak Test** | 检测长时间运行下的内存泄漏或资源耗尽 | 重大发布、资源密集型服务 |
| **Spike Test** | 验证突发流量下的系统响应与恢复 | 营销活动前、促销事件 |

### Baseline 管理

#### 首次建立 Baseline

1. 在稳定版本上执行至少 3 次完整 Load Test
2. 取 p50、p95、p99 的中位数作为 baseline
3. 记录测试环境配置（硬件、数据量、并发数）
4. 将 baseline 与测试脚本一同存入版本控制

#### 漂移检测阈值

| 指标 | 可接受漂移 | 需调查 | 阻断 |
|------|-----------|--------|------|
| p50 Latency | < 5% | 5-15% | > 15% |
| p95 Latency | < 10% | 10-20% | > 20% |
| p99 Latency | < 10% | 10-25% | > 25% |
| Throughput | < 5% 下降 | 5-15% 下降 | > 15% 下降 |
| Error Rate | 无增加 | < 0.1% 增加 | > 0.1% 增加 |

#### Baseline 更新策略

- 架构重构后：必须（MUST）重新建立 baseline
- 硬件升级后：应该（SHOULD）更新 baseline
- 性能优化成功后：应该（SHOULD）将新值设为 baseline
- 所有 baseline 更新均必须（MUST）记录变更原因与日期

### CI 触发条件

并非每次 commit 都需要进行性能测试。使用以下触发条件矩阵：

| 触发条件 | Load Test | Stress Test | Soak Test | Spike Test |
|----------|-----------|-------------|-----------|------------|
| 每次 commit | 否 | 否 | 否 | 否 |
| PR 合并至 main | 是（精简） | 否 | 否 | 否 |
| Release tag | 是（完整） | 是 | 否 | 否 |
| 定时（每周） | 是 | 否 | 是 | 否 |
| 手动触发 | 是 | 是 | 是 | 是 |
| 性能相关文件变更 | 是（精简） | 否 | 否 | 否 |

### Performance Budget

类似于 SRE Error Budget 的概念，Performance Budget 定义了可容忍的性能劣化余量。

| 概念 | 定义 | 示例 |
|------|------|------|
| **性能目标** | 目标性能水平 | p99 < 200ms |
| **性能预算** | 允许的劣化余量 | p99 可劣化至 220ms（10%） |
| **预算消耗** | 累积劣化百分比 | 本季度已消耗 6% |
| **预算耗尽** | 触发冻结非必要变更 | 剩余 < 2% 时冻结 |

#### 劣化容忍度

- p99 延迟劣化不得超过 10%
- 吞吐量下降不得超过 5%
- 错误率增加不得超过 0.05%
- 预算按季度周期重置

### 测试报告格式

#### 报告模板

```markdown
## Performance Test Report

### Test Metadata
- **Date**: YYYY-MM-DD
- **Duration**: X minutes
- **Test Type**: Load / Stress / Soak / Spike
- **Environment**: staging / production-mirror

### Results Summary
| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| p50 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p95 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p99 Latency | Xms | Yms | +Z% | PASS/FAIL |
| Throughput | X rps | Y rps | -Z% | PASS/FAIL |
| Error Rate | X% | Y% | +Z% | PASS/FAIL |

### Pass/Fail Determination
- **Overall**: PASS / FAIL
- **Failed Criteria**: [list of exceeded thresholds]

### Trend Analysis
- Chart of last 10 runs with baseline markers
- Anomaly points highlighted

### Recommendations
- Action items based on results
```

#### 通过/失败判定规则

- 所有阻断级阈值均在限制范围内 → **PASS**
- 超过任何阻断级阈值 → **FAIL**
- 超过调查级阈值 → 记录为警告，不予阻断

#### 趋势图要求

- 包含至少最近 10 次运行以进行趋势对比
- 在图表上显示 baseline 标记
- 高亮显示超过阈值的异常数据点

---

## 迁移非功能对等 (XSPEC-286)

> [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9 轴迁移完整性矩阵的一部分（**轴 ⑥ —— 非功能**）。涵盖遗留系统重构 / 重写期间“功能正确、数据正确，但**其运行方式不同**”这一遗漏类别。本节在上述通用 baseline/漂移机制之上增加了**迁移特定**的前后对比语义；它**并不**替代通用的性能框架。

### 为什么这是一个真正的缺口

上述通用的 Baseline 管理回答的是“*当前版本*相对于*自身*先前的 baseline 是否发生回退”。它**并不**回答“**新**系统是否与其替代的**遗留**系统相匹配”。在重写（例如 PHP 单请求 → .NET 共享状态线程）中，遗留系统的延迟/吞吐量/隔离特性通常是**隐式且未记录在文档中的**，因此单请求功能对等和行为快照对等都可以通过，而系统却可能悄无声息地运行得更慢、耗尽更小的连接池，或丢失锁语义。

### 差分 Oracle，而非绝对阈值

迁移对等使用**遗留系统作为 baseline** 和**声明的容忍度**，而不是上表中的绝对目标。遗留系统测量得到的实际行为就是 oracle；“未超出声明的容忍度发生回退”即为通过标准。这使得偏离能够自我报告，而无需依赖某人记住去枚举每一条热点路径。

### 步骤 1 —— 机械化非功能 baseline 捕获 (R3)

遗留系统的非功能特性大部分是隐式的。应从遗留工件中**机械化地**（而非凭记忆）推导 baseline：

| 来源 | 推导出的 baseline 项目 |
|------|----------------------|
| 关键路由 / 控制器 | 每条关键路径的 p50 / p95 / p99 延迟 |
| 热点查询 / 慢查询日志 | 单查询延迟、扫描行数 |
| 后台作业 / cron | 作业持续时间、吞吐量（记录/分钟） |
| 连接池配置 | 最小/最大连接数、空闲/连接超时 |
| 超时 / 限流配置 | 每个端点的超时时间、请求数/分钟、突发量 |
| 事务配置 | 隔离级别（READ COMMITTED / REPEATABLE READ / SERIALIZABLE） |

捕获的集合**既是**回退关卡的对比 baseline，**又是**资源/限制对等（步骤 4）的待验证检查清单。

### 步骤 2 —— 性能回退差分关卡 (R1)

对于每个 baseline 路径，测量新系统中的对应路径，并在声明的容忍度范围内与**遗留 baseline** 进行对比。

| 指标 | 默认迁移容忍度 | 何时阻断 |
|------|----------------|----------|
| p50 延迟 | ≤ +10% vs 遗留系统 | > +10% |
| p95 延迟 | ≤ +15% vs 遗留系统 | > +15% |
| p99 延迟 | ≤ +20% vs 遗留系统 | > +20% |
| 吞吐量 | ≤ -10% vs 遗留系统 | 下降 > -10% |

容忍度是**按路径可配置的**（批处理作业与交互式端点有所不同）。首先在 **shadow**（仅测量，不阻断）模式下运行以收集样本并校准每条路径的容忍度，然后晋级为阻断模式。

**关卡时机**：UAT 之前（在签核前捕获回退）**以及**割接之后（捕获仅在真实生产负载下才会显现的回退）。

```markdown
## Migration Performance Parity Report — <path>

| Metric | Legacy baseline | New system | Δ | Tolerance | Status |
|--------|-----------------|------------|---|-----------|--------|
| p50 | [X]ms | [Y]ms | +[Z]% | +10% | PASS/FAIL |
| p95 | [X]ms | [Y]ms | +[Z]% | +15% | PASS/FAIL |
| p99 | [X]ms | [Y]ms | +[Z]% | +20% | PASS/FAIL |
| Throughput | [X] rps | [Y] rps | -[Z]% | -10% | PASS/FAIL |

**Mode**: shadow (measure-only) / blocking
**Overall**: PASS / FAIL
```

### 步骤 3 —— 并发隔离验证 (R2)

相同的资源（同一条记录 / 同一个账户余额 / 同一个序号）可能被多个并发操作访问。遗留系统的锁 / 事务隔离 / 顺序保证属于**隐式行为**，并且经常在重写中被改变——而**功能测试和行为快照对等都无法捕获这一点**（单请求对等 ≠ 并发对等，这与“单请求 ≠ 静态数据”属于同一类盲点）。

**方法**：通过并发压力触发竞态条件，然后断言**领域不变量**，而不是逐个检查输出。

| 不变量类别 | 示例断言 |
|------------|----------|
| 守恒性 | N 次并发转账后 `SUM(balance)` 保持不变 |
| 唯一性 | 并发分配下无重复序号 |
| 无丢失更新 | 最后写入者胜出（last-writer-wins）不会悄无声息地覆盖已提交的写入 |
| 顺序性 | 在并发情况下事件按保证的顺序应用 |

检测到**隔离级别降级**（例如遗留系统的 SERIALIZABLE → 新系统的 READ COMMITTED，或移除了行锁）将触发阻断。不变量本身由领域定义；当并发用例与状态流转或时间不变量重叠时，**状态机 / 时间维度的关注点由 XSPEC-287**（轴 ⑧）负责，而并发竞态由本节（轴 ⑥）负责——参见 XSPEC-287 §boundary。

**关卡时机**：UAT 之前。

### 步骤 4 —— 资源 / 限制对等 (R4)

验证遗留系统的资源限制没有因重写而**无意中**发生改变（超时从 30 秒悄悄降至 5 秒会导致长耗制作业失败；更小的连接池会使流量串行化）。添加到非功能对账检查清单中：

- [ ] 请求 / 操作**超时**与遗留系统相匹配（或变更已声明）
- [ ] **限流**（请求数/分钟、突发量）与遗留系统相匹配
- [ ] **连接池**最小/最大值及空闲/连接超时与遗留系统相匹配
- [ ] **批处理大小**与遗留系统相匹配
- [ ] **事务隔离级别**与遗留系统相匹配（与步骤 3 交叉检查）

每一项要么完全匹配，要么具有**已声明且合理解释的**差异（delta）。未声明的差异属于已知的回退风险，将阻断割接。

### 完整性声明（矩阵对齐）

当本节声明了全部三项要素时，迁移完整性矩阵的轴 ⑥ 即告满足：**推导（derive）**（步骤 1 机械化 baseline）、**判定依据（oracle）**（步骤 2 回退差分 + 步骤 3 不变量断言）以及**关卡时机（gate timing）**（UAT 之前 + 割接之后）。复用通用的 baseline/漂移机制以及 `observability-assistant` 测量机制——本节仅增加迁移的前后对比与并发隔离语义，并不重复构建通用的性能框架。

---

## 每次发布容量签核

本节定义了在生产发布前必须满足的**容量门禁**（`release-readiness-gate.md` 中的维度 10，Tier-3）。

### 容量预测

在每个发布候选版本之前，基于以下各项制定容量预测：

1. **基线（Baseline）**：峰值 TPS 和资源利用率（CPU、内存、数据库连接、存储增长率）的 90 天滑动平均值
2. **发布影响预估**：新功能带来的预期流量增量（例如，新通知流程带来 +15% TPS）
3. **季节性调整**：未来 30 天内任何已知的流量峰值（营销活动、季节性高峰）

### 余量阈值

| 指标 | 目标（PASS） | 警告区间 | 失败阈值 |
|------|--------------|----------|----------|
| 预计峰值下的 CPU 余量 | ≥ 30% | 20–30% | < 20% |
| 内存余量 | ≥ 25% | 15–25% | < 15% |
| 数据库连接池余量 | ≥ 40% | 25–40% | < 25% |
| 相比基线的 p99 延迟 | ≤ +5% | +5% 至 +10% | > +10% 回退 |
| 峰值负载下的错误率 | < 0.1% | 0.1–0.5% | > 0.5% |

### 负载测试要求

在最终完成容量签核之前，运行上述性能测试部分中定义的负载测试场景（至少包含浸泡测试 + 峰值测试）：

```bash
# Example: k6 capacity verification run
k6 run --vus 500 --duration 20m scripts/perf/soak-test.js
# Pass criterion: headroom metrics above, p99 within budget
```

### 签核凭证

容量门禁需要**两名具名签核人**——工程主管（Engineering Lead）和 SRE 主管（SRE Lead）：

```markdown
## Capacity Sign-off — <version>

**Projection date**: YYYY-MM-DD
**Baseline period**: last 90 days

| Metric | Baseline peak | Projected peak | Headroom | Status |
|--------|-------------|---------------|----------|--------|
| CPU | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| Memory | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| DB pool | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| p99 latency | [X]ms | [Y]ms | [±Z]% | PASS/WARN/FAIL |

**Load test artifact**: [link to load test report]

**Eng Lead sign-off**: _______________ Date: __________
**SRE Lead sign-off**: _______________ Date: __________
```

### 当 Tier-3 适用为 N/A 时

在以下情况下，容量签核为 `N/A`（需记录书面理由）：
- 项目 DAU < 100 且未预期会有显著流量增长
- 用户数固定的内部工具
- 静态内容 / 文档网站

---

## 相关标准

- [测试标准](testing-standards.md) - 性能测试集成
- [需求工程](requirement-engineering.md) - NFR 文档
- [日志标准](logging-standards.md) - 性能日志
- [代码审查清单](code-review-checklist.md) - 性能审查
- [部署标准](deployment-standards.md) - 部署前性能验证
- [发布就绪门禁](release-readiness-gate.md) - 维度 1（负载）与维度 10（容量）
- [行为快照](behavior-snapshot.md) - 功能对等预言机（补充迁移非功能对等性）
- [全覆盖测试](full-coverage-testing.md) - 并发维度交叉引用

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-06-17 | 新增迁移非功能对等性（XSPEC-286，维度 ⑥）：前/后差异回归门禁、并发隔离验证、资源/配额对等性、机械化基线捕获 |
| 1.1.0 | 2026-01-29 | 重构：拆分为规则 + 指南，将解释说明移至指南 |
| 1.0.0 | 2026-01-29 | 初始发布 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
