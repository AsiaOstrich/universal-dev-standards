---
source: ../../../core/deployment-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/deployment-standards.md) | 简体中文

# 部署标准

**版本**: 1.0.0
**最后更新**: 2026-02-09
**适用范围**: 所有具有部署流水线的软件项目
**范围**: universal
**行业标准**: Twelve-Factor App, Google SRE — Release Engineering, DORA State of DevOps
**参考**: [12factor.net](https://12factor.net/), [sre.google](https://sre.google/books/), [dora.dev](https://dora.dev/)

---

## 目的

本标准定义安全部署软件到生产环境的指南，涵盖部署策略、功能标志、回滚流程、环境一致性和部署效能指标。

**参考标准**:
- [The Twelve-Factor App](https://12factor.net/) — Factor X: Dev/Prod Parity
- [Google SRE Book — Release Engineering](https://sre.google/sre-book/release-engineering/)
- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [DORA State of DevOps Report](https://dora.dev/)

---

## 核心原则

| 原则 | 描述 |
|------|------|
| **部署 ≠ 发布** | 将代码部署到生产环境与向用户暴露是独立动作；使用功能标志控制暴露 |
| **渐进式暴露** | 向逐渐增大的受众推出变更：内部 → 金丝雀 → 百分比 → 全面可用 |
| **快速回滚** | 每次部署必须有经过测试的回滚路径，5 分钟内执行完毕 |
| **环境一致性** | 保持开发、预发布和生产环境尽可能相似（Twelve-Factor App Factor X） |
| **全面自动化** | 手动部署步骤容易出错；自动化构建、测试、部署和回滚 |
| **全面监控** | 带可观测性部署；无法度量就无法安全部署 |

---

## 部署策略选择

| 策略 | 使用场景 | 回滚速度 | 资源成本 | 复杂度 |
|------|---------|---------|---------|--------|
| **滚动更新** | 无状态服务、标准更新 | 中等（分钟） | 低（无额外基础设施） | 低 |
| **蓝绿部署** | 零停机要求、数据库兼容变更 | 快速（秒，DNS/LB 切换） | 高（2× 基础设施） | 中等 |
| **金丝雀部署** | 高风险变更、大用户量 | 快速（重定向流量） | 中等（部分额外基础设施） | 高 |
| **功能标志** | 解耦部署与发布、A/B 测试 | 即时（关闭开关） | 低（代码级别） | 中等 |

### 决策指南

```
是否需要零停机？
├── 是 → 变更是否高风险或大规模？
│         ├── 是 → 金丝雀部署
│         └── 否 → 蓝绿部署
└── 否 → 变更是否在功能标志后面？
          ├── 是 → 功能标志（随时部署）
          └── 否 → 滚动更新
```

---

## 部署验证

### 成功标准

部署在观测窗口内满足以下**所有**条件时视为成功：

| 条件 | 阈值 | 观测窗口 |
|------|------|----------|
| **Error rate** | ≤ 部署前 baseline + 0.1% | 5 分钟 |
| **P99 latency** | ≤ 部署前 baseline × 1.2 | 5 分钟 |
| **Health check** | 100% 通过率 | 持续 |
| **Smoke tests** | 100% 通过率 | 部署后 2 分钟内 |

任一条件失败应触发自动 rollback 或通知 on-call 工程师。

### 观测期

| 部署类型 | 最短观测期 | 关键观测指标 |
|----------|-----------|-------------|
| **Canary** | 每流量阶段 15 分钟 | Error rate、Latency、业务指标 |
| **Blue-Green** | 切换后 5 分钟 | Health check、Error rate |
| **Rolling** | 整个上线期间 | 每批次 Health check |
| **Feature Flag** | 首次启用 24 小时 | 业务指标、用户反馈 |

### Smoke Test 要求

部署后 Smoke Test 必须自动执行，至少涵盖：

| # | 测试项目 | 预期结果 | 超时 |
|---|----------|----------|------|
| 1 | Health check endpoint 返回 200 | HTTP 200 + status "healthy" | 5 秒 |
| 2 | 核心 API endpoints 可用（至少 3 条关键路径） | HTTP 2xx | 10 秒/条 |
| 3 | 数据库连接正常 | 查询成功执行 | 5 秒 |
| 4 | 外部依赖服务可达 | 连接检查成功 | 10 秒/项 |
| 5 | 总执行时间 | 所有测试完成 | 最长 60 秒 |

Smoke Test 失败必须阻断部署并触发 rollback。

---

## 相关标准

- [安全标准](security-standards.md)
- [性能标准](performance-standards.md)
- [测试标准](testing-standards.md)
- [签入标准](checkin-standards.md) - 部署前质量关卡
- [Changelog 标准](changelog-standards.md) - 记录已部署变更
- [Git 工作流标准](git-workflow.md) - 分支策略与发布流程
- [版本标准](versioning.md) - 发布版本号码

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
