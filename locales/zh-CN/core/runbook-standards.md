---
source: ../../../core/runbook-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 1edd254d08d6
status: current
---

# Runbook 标准

> **语言**: [English](../../../core/runbook-standards.md) | [繁體中文](../../zh-TW/core/runbook-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有具有生产服务的软件项目
**范围**: universal
**行业标准**: PagerDuty Runbook Best Practices, Google SRE
**参考**: [PagerDuty](https://www.pagerduty.com/), [sre.google](https://sre.google/)

---

## 概述

本文档定义了 Runbook（操作程序）的编写、组织、维护和验证标准。Runbook 是一套有文档记录的步骤，供操作人员遵循以诊断和解决特定问题或执行例行操作。

---

## Runbook 类型

| 类型 | 用途 | 示例 | 触发方式 |
|------|------|------|---------|
| **告警响应** | 诊断并修复特定告警 | `api-latency-high.md` | 告警触发 |
| **标准操作** | 例行操作程序 | `database-backup-restore.md` | 定时或按需 |
| **紧急程序** | 重大事件快速响应 | `full-service-outage.md` | SEV-1 事件 |
| **变更程序** | 计划性变更执行步骤 | `database-migration.md` | 变更窗口 |
| **故障排除指南** | 一般问题调查方法 | `memory-leak.md` | 临时调查 |

---

## 标准模板

### 必需章节

每个 Runbook 必须包含以下 7 个章节：

```markdown
# Runbook: [Problem Name]

## Overview
- **Alert Name**: [alert name or N/A]
- **Severity**: P1/P2/P3/P4
- **Related Services**: [service names]
- **Last Updated**: YYYY-MM-DD
- **Owner**: @owner
- **Last Drilled**: YYYY-MM-DD

## Symptoms
[What does the user see? How does the system behave?]
- [Observable symptom 1]
- [Observable symptom 2]

## Impact Assessment
- **Affected users**: [scope]
- **Business impact**: [revenue, reputation, compliance]
- **Upstream/downstream effects**: [cascading impact]

## Diagnostic Steps
1. **Check [component]**
   ```bash
   # Specific command to run
   kubectl get pods -n production | grep payment
   ```
   Expected output: [what to look for]

2. **Verify [metric]**
   Dashboard: [link]
   Normal range: [X-Y]

3. **Determine root cause**
   - If [condition A] → go to Fix Steps: Scenario A
   - If [condition B] → go to Fix Steps: Scenario B

## Fix Steps
### Scenario A: [Root Cause A]
1. [Step with specific command]
   ```bash
   kubectl rollout restart deployment/payment-service -n production
   ```
2. **Verify fix**: [how to confirm it worked]
   ```bash
   curl -s https://api.example.com/health | jq .status
   ```
   Expected: `"healthy"`
3. **Estimated time**: 2-5 minutes

### Scenario B: [Root Cause B]
1. [Alternative fix steps]

## Escalation
- If above steps don't resolve within [time]:
  - Contact: [team/person] via [channel]
  - Escalation phone: [number]
  - Backup contact: [person]

## Post-Actions
- [ ] Update this runbook if new information found
- [ ] Create postmortem if P1/P2 (see [Postmortem Standards](postmortem-standards.md))
- [ ] Notify stakeholders via [channel]
- [ ] Record incident metrics (MTTD, MTTR)
```

### 可选章节

| 章节 | 何时包含 |
|------|---------|
| **前置条件** | 需要特殊访问权限或工具时 |
| **回滚步骤** | 修复步骤具有副作用时 |
| **相关 Runbook** | 问题经常同时发生时 |
| **变更日志** | 适用于频繁更新的 Runbook |

---

## 编写质量指南

### 六项原则

编写在压力下依然有效的 Runbook——当值班工程师感到疲惫、充满压力且在凌晨 3 点工作时：

| 原则 | 描述 | 正确示例 | 错误示例 |
|------|------|----------|----------|
| **可复现** | 步骤足够具体，可以直接复制粘贴并执行 | `kubectl rollout restart deployment/payment-service -n production` | “重启支付服务” |
| **无歧义** | 每个步骤只有唯一种解释 | “重启 `production` 命名空间中的 `payment-service` Pod” | “重启服务” |
| **决策点** | 分支条件明确且具有清晰标准 | “如果 CPU > 90%，执行方案 A；否则执行方案 B” | “如果服务器看起来过载……” |
| **回滚** | 失败的修复步骤具有后备方案 | “如果回滚失败，执行紧急程序：full-service-outage.md” | （未提及回滚） |
| **验证** | 每个修复步骤都有确认成功的方法 | “运行 `curl health-check` 并验证 HTTP 200 响应” | “检查其是否正常工作” |
| **有时间限制** | 标明预期完成时间 | “该步骤通常需要 2-5 分钟” | （无时间预估） |

### 常见反模式

| 反模式 | 问题 | 修复方法 |
|--------|------|----------|
| “联系团队” | 哪个团队？哪个渠道？ | 指定具体人员和渠道 |
| “查看日志” | 哪些日志？在哪里？搜索什么？ | 提供精确的日志查询 |
| “如果需要，扩容” | 何时需要？扩容到多少？ | 定义阈值和目标 |
| 过期的命令 | 命令引用了已移除的服务 | 定期审查周期 |

---

## 组织与存储

### 目录结构

```
docs/runbooks/
├── README.md                          # Index and search guide
├── alerts/                            # Alert Response runbooks
│   ├── api-latency-high.md
│   ├── disk-space-low.md
│   └── database-connection-pool.md
├── operations/                        # Standard Operation runbooks
│   ├── database-backup-restore.md
│   └── secret-rotation.md
├── emergency/                         # Emergency Procedure runbooks
│   ├── full-service-outage.md
│   └── data-breach-response.md
├── changes/                           # Change Procedure runbooks
│   ├── database-migration.md
│   └── major-version-upgrade.md
└── troubleshooting/                   # Troubleshooting Guide runbooks
    ├── memory-leak.md
    └── performance-degradation.md
```

### 命名规范

使用 kebab-case 文件名，描述**问题**而非解决方案：

- ✅ `api-latency-high.md` — 描述问题
- ✅ `disk-space-low.md` — 描述问题
- ✅ `database-connection-pool.md` — 描述问题领域
- ❌ `restart-api-server.md` — 描述的是解决方案，而非问题
- ❌ `runbook-001.md` — 无意义的递增序号
- ❌ `RUNBOOK_API.md` — 错误的大小写规范

### 索引

在 runbooks 目录下维护一个 `README.md` 索引：

```markdown
# Runbooks Index

## Alert Response
| Runbook | Severity | Services | Last Updated |
|---------|----------|----------|-------------|
| [API Latency High](alerts/api-latency-high.md) | P2 | api-gateway | 2026-03-15 |

## Emergency Procedures
| Runbook | Services | Last Updated |
|---------|----------|-------------|
| [Full Service Outage](emergency/full-service-outage.md) | all | 2026-03-01 |
```

---

## 有效性管理

### 审查周期

每种 Runbook 类型都有强制性的审查周期：

| 类型 | 审查周期 | 审查者 |
|------|-------------|----------|
| 告警响应 | 每季（每 3 个月） | 值班团队 |
| 紧急程序 | 每月 | 工程主管 |
| 标准操作 | 每半年（每 6 个月） | 运维团队 |
| 变更程序 | 每次使用后 | 变更执行者 |
| 故障排除指南 | 每半年（每 6 个月） | 领域专家 |

### 陈旧检测

当满足以下条件时，Runbook 被视为**陈旧**（**stale**）：
- `Last Updated` 日期超过其类型的审查周期
- Runbook 未在其演练周期内进行演练

陈旧的 Runbook 应在索引中标记 ⚠️，并优先进行审查。

### 架构变更触发条件

当发生以下任何变更时，必须审查相关 Runbook：

| 变更类型 | 受影响的 Runbook |
|-------------|------------------|
| 服务拆分/合并 | 所有引用该服务的 Runbook |
| 数据库迁移 | 数据库相关 Runbook |
| 基础设施变更（云区域、云厂商） | 所有紧急 + 运维 Runbook |
| 监控/告警工具变更 | 所有告警响应 Runbook |
| 团队重组 | 所有 Runbook 的 Escalation 章节 |

---

## 演练流程

### 排期

| 优先级 | 条件 | 演练频率 |
|----------|-----------|-----------------|
| 最高 | P1 告警 Runbook | 每月 |
| 高 | P2 告警 Runbook | 每季 |
| 中 | 紧急程序 | 每季 |
| 低 | 其他 Runbook | 每半年 |

### 记录

每次演练后，记录结果：

```markdown
## Drill Record: [Runbook Name]

- **Date**: YYYY-MM-DD
- **Participants**: @name1, @name2
- **Runbook**: [link]
- **Result**: ✅ Pass / ⚠️ Partial Pass / ❌ Fail
- **Estimated Repair Time**: X minutes (per runbook)
- **Actual Repair Time**: Y minutes (during drill)
- **Issues Found**:
  - [Issue 1: description]
  - [Issue 2: description]
- **Runbook Updates Required**:
  - [ ] [Update description]
```

### 失败处理

当演练发现 Runbook 步骤无法执行时：

1. **立即**将 Runbook 标记为需要更新
2. 创建包含负责人和截止日期的行动项
3. 应用更新后重新演练
4. 在重新演练通过前，不得将该 Runbook 视为有效

---

## 集成点

### 告警关联 Runbook

每个告警规则都应包含 `runbook_url` 注解：

```yaml
annotations:
  runbook_url: "https://wiki.example.com/runbooks/alerts/api-latency-high"
```

当告警触发时，通知会自动包含 Runbook 链接。

### 事后检讨到 Runbook 流程

在完成事后检讨后（参见 [Postmortem 标准](postmortem-standards.md)）：
- 如果事故暴露了现有 Runbook 中的缺失 → 更新 Runbook
- 如果事故是一种新的失效模式 → 创建新的 Runbook
- 将事后检讨链接至 Runbook 的变更日志

### 覆盖率报告

定期生成 Runbook 覆盖率报告：

| 告警级别 | 告警总数 | 具有 Runbook | 覆盖率 | 目标 |
|-------------|-------------|-------------|---------|--------|
| P1/P2 | N | N | 100% | 100% |
| P3/P4 | N | N | X% | > 80% |

**没有 Runbook 的告警**（需要采取行动）：
- `[P2] database-replication-lag` — 需要 Runbook
- `[P3] disk-io-high` — 需要 Runbook

---

## Quick Reference Card

### Runbook 检查清单
```
□ Has Overview with metadata (alert, severity, owner)
□ Has Symptoms section
□ Has Impact Assessment
□ Has numbered Diagnostic Steps with commands
□ Has Fix Steps with verification after each
□ Has Escalation with specific contacts
□ Has Post-Actions checklist
□ Uses kebab-case filename (problem, not solution)
□ Last Updated date is current
□ Has been drilled within cycle
```

---

## 参考资料

- [PagerDuty Runbook Authoring Guide](https://www.pagerduty.com/) — Runbook 编写的行业最佳实践
- [Google SRE — Managing Incidents](https://sre.google/sre-book/managing-incidents/) — 事件管理背景
- [Incident.io — Runbook Best Practices](https://incident.io/) — 现代 Runbook 模式

---

**相关标准：**
- [告警标准](alerting-standards.md) — 告警设计与 Runbook 链接要求
- [Postmortem 标准](postmortem-standards.md) — 事后检讨与行动项目
- [日志标准](logging-standards.md) — 用于诊断的结构化日志
- [可观测性标准](observability-standards.md) — 监控与仪表板

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：模板、类型、有效性、演练、集成 |

---

## 许可

本标准基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
