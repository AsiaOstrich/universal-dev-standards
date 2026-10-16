---
source: ../../../core/feature-flag-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 98660be33d76
status: current
---

# Feature Flag 管理标准

> **语言**: [English](../../../core/feature-flag-standards.md) | [繁體中文](../../zh-TW/core/feature-flag-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: Martin Fowler Feature Toggles, LaunchDarkly Best Practices
**参考资料**: [martinfowler.com/articles/feature-toggles.html](https://martinfowler.com/articles/feature-toggles.html)

---

## 概述

本文档定义 Feature Flag（又称 Feature Toggle）在整个生命周期中的管理标准。Feature Flag 是控制功能发布、实验和运营安全的一项强大技术，但如果缺乏适当管理，它们会累积为技术债并增加系统复杂性。

---

## 1. Flag Types / Flag 类型

所有 Feature Flag 必须分类为以下四种类型之一，每种类型都有自己的管理策略：

| 类型 | 用途 | 管理策略 (Management Strategy) | 生命周期 |
|------|---------|-------------------------------|----------|
| **Release** | 控制渐进式功能发布 | 生命周期短；完全发布后移除 | 临时 |
| **Experiment** | A/B 测试与数据驱动决策 | 设定时限；实验结束后移除 | 临时 |
| **Ops** | 运营控制（熔断器、Kill Switch） | 长期存在；每季审查 | 永久（附带审查） |
| **Permission** | 基于用户/角色的访问控制 | 长期存在；绑定到授权模型 | 永久 |

### 类型详情

- **Release**：用于将部署与发布解耦。渐进式启用功能（金丝雀、百分比发布）。功能完全发布后必须移除。
- **Experiment**：用于 A/B 测试和多变量实验。创建前必须定义明确的成功指标。在收集数据并做出决策后移除。
- **Ops**：用于运营安全，例如熔断器、速率限制器和优雅降级。可以无限期保留，但必须接受季度审查。
- **Permission**：用于按用户角色、订阅层级或权限对功能进行门控。生命周期与业务授权模型绑定。

---

## 2. Naming Conventions / 命名惯例

### 模式

所有 Flag 名称必须遵循以下模式：`<type>_<feature>_<context>`

| 组件 | 说明 | 示例 |
|-----------|-------------|---------|
| `type` | Flag 类型前缀 | `release`, `experiment`, `ops`, `permission` |
| `feature` | 功能或系统名称 | `new_checkout`, `pricing_page`, `payment` |
| `context` | 具体上下文或变体 | `flow`, `v2`, `circuit_breaker`, `dashboard` |

### 正面示例 (✅)

| Flag 名称 | 类型 | 说明 |
|-----------|------|-------------|
| `release_new_checkout_flow` | Release | 新结账流程发布 |
| `experiment_pricing_page_v2` | Experiment | 定价页面 A/B 测试 |
| `ops_payment_circuit_breaker` | Ops | 支付服务 Circuit Breaker |
| `permission_admin_dashboard` | Permission | 管理后台访问控制 |

### 反面示例 (❌)

| 不良名称 | 问题 |
|----------|---------|
| `flag1` | 无类型前缀，无有意义名称 |
| `new_feature` | 缺少类型前缀和上下文 |
| `test_thing_temp` | 模糊不清，无类型前缀，暗示临时性但无生命周期 |

---

## 3. Lifecycle Stages / 生命周期阶段

每个 Feature Flag 都会经历 6 个生命周期阶段：

```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (if TTL exceeded)
```

| 阶段 | 说明 | 进入准则 | 退出准则 |
|-------|-------------|---------------|--------------|
| **Created** | Flag 在配置中已定义但尚未启用 | Flag 定义已合并到代码库 | Flag 在任何环境中开启 |
| **Active** | Flag 使用中，控制功能行为 | Flag 在至少一个环境中启用 | 做出功能决策（发布完成或实验结束） |
| **Validated** | Flag 背后的功能确认正常运作 | 发布达到 100% 或已收集实验数据 | 已创建清理工单 |
| **Cleanup** | Flag 正在从代码库中移除 | 清理工作已开始 | 所有 Flag 引用已移除 |
| **Removed** | Flag 已从所有代码和配置中完全移除 | 代码库中不再残留任何引用 | 终态 |
| **Expired** | Flag 超过其 TTL 且未推进 | 在 Created、Active 或 Validated 阶段超过 TTL | 必须转入 Cleanup 或在有充分理由的情况下续期 |

---

## 4. TTL (Time-To-Live) / 存活时间限制

每种 Flag 类型都有明确定义的 TTL，以防止 Flag 累积：

| 类型 | 默认 TTL | 最大 TTL | 超过 TTL 时的动作 |
|------|-------------|---------|-------------------|
| **Release** | 2 周 | 4 周 | 自动标记为 Expired，触发清理流程 |
| **Experiment** | 4 周 | 8 周 | 自动标记为 Expired，要求结论报告 |
| **Ops** | 无限 | 无限（季度审查） | 每季审查，未审查者标记为待确认 |
| **Permission** | 无限 | 无限（年度审查） | 年度审查，确认是否仍需要 |

### TTL 强制执行

- 当 Flag 超过其 TTL 时，系统必须自动将其标记为 **Expired**
- 过期的 Flag 必须在下一个 Sprint 内处理
- 延长必须经过明确审批并附带书面理由

---

## 5. Audit / 审计

### 4 Audit Dimensions / 4 个审计检查维度

定期审计必须跨这四个维度检查每个 Flag：

| 维度 | 说明 | 检查方法 |
|-----------|-------------|-------------|
| **存活时间** | Flag 存活时间 vs 其 TTL | 将创建日期与 TTL 策略进行比较 |
| **使用状态** | Flag 是否正被活跃评估 | 检查运行时评估日志 |
| **代码引用** | 多少代码位置引用了该 Flag | 静态分析 / 代码搜索 |
| **测试影响** | Flag 如何影响测试套件的行为 | 分析测试配置与分支 |

### Audit Report Format / 审计报告格式

每份审计报告必须包含以下章节：

| 章节 | 说明 |
|---------|-------------|
| **Flag 总数**（按类型分组） | 按类型（Release、Experiment、Ops、Permission）分组的 Flag 总数 |
| **过期 Flag 清单** | 所有超过其 TTL 的 Flag 清单 |
| **本季清理 Flag 数** | 当前季度清理的 Flag 数量 |
| **Flag 趋势（增减）** | 显示 Flag 数量随时间净变化的趋势 |

---

## 6. Decay Detection / 腐化检测

当 Flag 超过其 TTL 或出现腐化迹象（未被使用、未被引用）时，系统必须执行以下自动动作：

| # | 动作 | 说明 |
|---|--------|-------------|
| 1 | **标记为 Expired** | 自动将 Flag 转入 Expired 生命周期阶段 |
| 2 | **技术债登记（建立条目）** | 创建包含 Flag 详情、Owner 以及建议动作的技术债登记条目 |
| 3 | **通知 Owner** | 通过已配置的渠道（电子邮件、Slack 等）向 Flag 的 Owner 发送通知 |
| 4 | **Sprint Planning 提醒** | 将过期的 Flag 添加到下一次 Sprint Planning 议程中以排定优先级 |

---

## 7. Cleanup Checklist / 清理检查表

移除 Feature Flag 时，请遵循以下 5 步检查表：

- [ ] **Step 1: 移除 Flag 判断代码** — 移除所有引用该 Flag 的条件代码分支。保留胜出的代码路径。
- [ ] **Step 2: 移除 Flag 配置** — 从所有配置文件、环境变量和 Feature Flag 服务中移除 Flag 定义。
- [ ] **Step 3: 更新相关测试** — 更新或移除专门测试 flag-on/flag-off 行为的测试。确保剩余测试反映永久状态。
- [ ] **Step 4: 更新文档** — 更新引用该 Flag 的所有文档、Runbook 或架构图。
- [ ] **Step 5: 验证所有环境** — 验证 Flag 是否已从所有环境（dev、staging、production）中移除，并且未残留任何引用。

---

## 8. Testing Principles / 测试原则

使用 Feature Flag 时，请遵循以下 4 条测试原则：

### Principle 1: 测试两种状态 (Test Both States: on/off)

每个 Feature Flag 必须有覆盖启用 (on) 和禁用 (off) 两种状态的测试。这可确保无论 Flag 的值为何，系统都能正确运作。

### Principle 2: 避免组合爆炸 (Avoid Combination Explosion)

当存在多个 Flag 时，切勿测试所有可能的组合（2^N 呈指数级增长）。相反：
- 在 on/off 状态下独立测试每个 Flag
- 仅测试代表真实部署场景的特定组合
- 使用基于风险的测试来识别关键组合

### Principle 3: 默认值测试 (Test Default Values)

始终测试使用 Flag 默认值时的系统行为。这是新用户或新环境将体验到的状态。确保默认值安全且有完备文档记录。

### Principle 4: 环境隔离 (Environment Isolation)

测试中的 Flag 值必须与其他环境隔离：
- 测试不应依赖外部 Feature Flag 服务
- 使用测试本地的 Flag 配置
- 确保单个测试中的 Flag 状态变更不会影响其他测试

---

## 快速参考卡

### Flag 类型选择
```
Gradual feature rollout?         → Release
A/B testing or experiment?       → Experiment
Operational safety control?      → Ops
User/role access control?        → Permission
```

### 生命周期流程
```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (TTL exceeded)
```

### TTL 速查参考
```
Release:    2 weeks default, 4 weeks max
Experiment: 4 weeks default, 8 weeks max
Ops:        Unlimited (quarterly review)
Permission: Unlimited (annual review)
```

---

## 参考资料

- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) — Feature Toggle 类型与模式的全面指南
- [LaunchDarkly — Feature Flag Best Practices](https://launchdarkly.com/blog/feature-flag-best-practices/) — Flag 管理的行业最佳实践
- [Pete Hodgson — Feature Toggles (aka Feature Flags)](https://www.martinfowler.com/articles/feature-toggles.html) — Toggle 类型的详细分类

---

**相关标准：**
- [测试标准](testing-standards.md) — 测试要求与模式
- [部署标准](deployment-standards.md) — 包含金丝雀和蓝绿部署的部署策略
- [日志标准](logging-standards.md) — 记录 Feature Flag 决策以实现可观测性

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始发布：Flag 类型、命名惯例、生命周期、TTL、审计、腐化检测、清理检查表、测试原则 |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
