---
source: ../../../core/runbook-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# Runbook 标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义 Runbook（操作程序）的编写、组织、维护和验证标准。Runbook 是一组有文档记录的步骤，供操作人员遵循以诊断和解决特定问题或执行例行操作。

---

## Runbook 类型

| 类型 | 用途 | 示例 | 触发方式 |
|------|------|------|---------|
| **告警响应** | 诊断并修复特定告警 | `api-latency-high.md` | 告警触发 |
| **标准操作** | 例行操作程序 | `database-backup-restore.md` | 调度或按需 |
| **紧急程序** | 重大事件快速响应 | `full-service-outage.md` | SEV-1 事件 |
| **变更程序** | 计划性变更执行步骤 | `database-migration.md` | 变更窗口 |
| **故障排除指南** | 一般问题调查方法 | `memory-leak.md` | 临时调查 |

---

## 标准模板

每个 Runbook 必须包含以下 7 个章节：

1. **Overview** — 告警名称、严重度、相关服务、所有者、最后演练日期
2. **Symptoms** — 用户看到什么？系统如何表现？
3. **Impact Assessment** — 受影响用户、业务影响、上下游效应
4. **Diagnostic Steps** — 带有具体命令的编号步骤
5. **Fix Steps** — 按根因分场景的修复步骤，每步骤后验证
6. **Escalation** — 具体联系人与条件
7. **Post-Actions** — 事后检查清单

---

## 命名规范

使用 kebab-case 文件名，描述**问题**而非解决方案：

- `api-latency-high.md` — 描述问题
- `disk-space-low.md` — 描述问题
- ~~`restart-api-server.md`~~ — 描述的是解决方案，不恰当

---

## 有效性管理

### 审查周期

| 类型 | 审查周期 | 审查者 |
|------|---------|--------|
| 告警响应 | 每季（每 3 个月） | 值班团队 |
| 紧急程序 | 每月 | 工程主管 |
| 标准操作 | 每半年 | 运维团队 |
| 变更程序 | 每次使用后 | 变更执行者 |
| 故障排除指南 | 每半年 | 领域专家 |

---

## Quick Reference Card

### Runbook 检查清单
```
□ 具有 Overview 与元数据（告警、严重度、所有者）
□ 具有 Symptoms 章节
□ 具有 Impact Assessment
□ 具有编号的 Diagnostic Steps（含命令）
□ 具有 Fix Steps（每步骤后有验证）
□ 具有 Escalation（含具体联系人）
□ 具有 Post-Actions 检查清单
□ 使用 kebab-case 文件名（问题，非解决方案）
□ Last Updated 日期为最新
□ 已在周期内完成演练
```

---

**相关标准：**
- [告警标准](alerting-standards.md) — 告警设计与 Runbook 链接要求
- [Postmortem 标准](postmortem-standards.md) — 事后检讨与行动项目
- [可观测性标准](observability-standards.md) — 监控与仪表板

# Runbook 标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义 Runbook（操作手册）的撰写格式、维护流程、有效性验证和演练机制。

## Runbook 类型

| 类型 | 用途 |
|------|------|
| 告警响应 | 诊断和修复特定告警 |
| 标准操作 | 日常运维操作程序 |
| 紧急程序 | 重大事故快速响应 |
| 变更程序 | 计划性变更执行步骤 |
| 排错指南 | 通用问题排查方法 |

## 相关标准

- [告警标准](alerting-standards.md)
- [事后检讨标准](postmortem-standards.md)

## 许可

CC BY 4.0
