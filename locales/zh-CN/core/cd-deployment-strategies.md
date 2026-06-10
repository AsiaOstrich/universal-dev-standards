---
source: ../../../core/cd-deployment-strategies.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 0eeb697c2f07
status: current
---

# CD Deployment Strategies（CD 部署策略）

> **语言**: [English](../../../core/cd-deployment-strategies.md) | [繁體中文](../../zh-TW/core/cd-deployment-strategies.md) | 简体中文

## 概述

本标准定义四种主要部署策略的选用矩阵：Blue-Green、Canary、Rolling、Recreate。帮助团队根据流量规模、风险容忍度和基础设施成本，做出一致且有据可查的策略选择。

---

## 核心原则

- **三维决策**：根据流量规模 × 风险容忍度 × 基础设施成本选择策略
- **禁止直接上生产**：任何变更都必须先通过 staging 环境验证
- **零停机目标**：除非为内部工具或开发环境，否则应追求零停机部署

---

## 策略选用矩阵

| 策略 | 流量规模 | 风险容忍度 | 基础设施成本 | 停机时间 | 回滚时间 |
|------|---------|----------|------------|---------|---------|
| Blue-Green | 高 | 低 | 高 | 零 | < 30 秒 |
| Canary | 中至高 | 中 | 中 | 零 | < 2 分钟 |
| Rolling | 任意 | 中 | 低 | 极少 | 数分钟 |
| Recreate | 低 | 高 | 极低 | 数秒至数分钟 | 数分钟 |

---

## 各策略详细说明

### Blue-Green

**适用场景**：有状态服务、数据库兼容性变更、高 SLA API

**运作方式**：
- 维护两个完全相同的环境（Blue = 现有线上版，Green = 新版本）
- 完整部署并验证 Green 环境后，切换 Load Balancer 流量
- 问题发生时立即切回 Blue

**前置条件**：双环境基础设施、Load Balancer、健康检查

---

### Canary

**适用场景**：功能验证、A/B 测试、高风险变更

**流量渐进比例**：1% → 5% → 25% → 50% → 100%

**运作方式**：
- 先将少量流量导向新版本
- 监控指标，符合自动晋升规则则继续扩大
- 发现问题立即缩回 0%

**前置条件**：流量切分机制、可观测性、自动晋升规则

---

### Rolling

**适用场景**：无状态服务、标准更新、批处理 worker

**运作方式**：
- 依序更新每个实例，更新前进行健康检查
- 允许新旧版本短暂共存
- 资源效率最佳，但回滚需时较长

**前置条件**：多个服务实例、健康检查

---

### Recreate

**适用场景**：开发/测试环境、内部工具、单实例服务

**运作方式**：
- 停止所有现有实例，部署新版本，重新启动
- 最简单，但有停机时间

**前置条件**：无（最低门槛）

---

## 决策树

```
Q1: 需要零停機時間？
  → 否 → Recreate
  → 是 → Q2

Q2: 流量 > 10k req/min？
  → 是 → Q3（Blue-Green 或 Canary）
  → 否 → Rolling

Q3: 變更屬於高風險？
  → 是 → Canary
  → 否 → Q4

Q4: 基礎設施預算有限？
  → 是 → Rolling
  → 否 → Blue-Green
```

---

## 无 CI/CD 环境的替代做法

| 策略 | 替代方案 |
|------|---------|
| Blue-Green | 参见 no-cicd-deployment.ai.yaml 的 Shell Script 实现 |
| Canary | 使用 Nginx `split_clients` 或 HAProxy 做流量切分 |
| Rolling | 使用顺序式 rsync + 健康检查循环 |
| Recreate | 最简单 — 停止、部署、启动 |

---

## 相关标准

- [deployment-standards.md](../../../core/deployment-standards.md) — 部署基础原则
- [rollback-standards.md](../../../core/rollback-standards.md) — 回滚触发条件矩阵
- [no-cicd-deployment.md](../../../core/no-cicd-deployment.md) — 无 CI/CD 部署策略
- AI 格式：[../../../ai/standards/cd-deployment-strategies.ai.yaml](../../../ai/standards/cd-deployment-strategies.ai.yaml)


**Scope**: universal
