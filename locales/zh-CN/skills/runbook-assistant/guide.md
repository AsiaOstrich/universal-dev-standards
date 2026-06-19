---
source: ../../../../skills/runbook-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 79012dab91fb
status: current
scope: universal
description: |
  指导 runbook 的创建、组织与验证。
  使用时机：编写 runbook、审查运维流程、规划演练、评估覆盖率。
  关键词：runbook、运维、incident、on-call、演练、SOP、运维手册、演练。
---

# Runbook Assistant

> **语言**: [English](../../../../skills/runbook-assistant/guide.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-04-01
**适用范围**：Claude Code Skills

---

## 目的

本 skill 帮助团队编写、组织和验证用于运维流程和 incident 响应的 runbook。它涵盖 5 种 runbook 类型、标准的 7 节模板、编写质量原则、演练流程以及覆盖率报告。

---

## 快速参考（YAML 压缩版）

```yaml
# === 5 RUNBOOK TYPES 五种类型 ===
types:
  alert_response:
    purpose: "Diagnose and fix a specific alert / 诊断并修复特定告警"
    example: "api-latency-high.md"
    trigger: "Alert fires"
  standard_operation:
    purpose: "Routine operational procedures / 例行运维流程"
    example: "database-backup-restore.md"
    trigger: "Scheduled or on-demand"
  emergency_procedure:
    purpose: "Major incident rapid response / 重大事件快速响应"
    example: "full-service-outage.md"
    trigger: "SEV-1 incident"
  change_procedure:
    purpose: "Planned change execution steps / 计划变更执行步骤"
    example: "database-migration.md"
    trigger: "Change window"
  troubleshooting_guide:
    purpose: "General problem investigation / 一般问题排查"
    example: "memory-leak.md"
    trigger: "Ad-hoc investigation"

# === STANDARD TEMPLATE 标准模板 (7 Sections) ===
template_sections:
  1_overview:
    fields: ["Alert Name", "Severity (P1-P4)", "Related Services", "Last Updated", "Owner", "Last Drilled"]
  2_symptoms:
    content: "Observable behaviors — what users see, how system behaves / 可观察的异常行为"
  3_impact_assessment:
    fields: ["Affected users scope", "Business impact (revenue, reputation)", "Upstream/downstream cascading"]
  4_diagnostic_steps:
    format: "Numbered steps with copy-paste commands and expected output / 编号步骤+可复制命令+预期输出"
    branching: "If [condition A] → Scenario A; If [condition B] → Scenario B"
  5_fix_steps:
    format: "Per-scenario fix with verification command after each step / 每场景修复+每步骤验证"
    include: ["Specific commands", "Verification check", "Estimated time"]
  6_escalation:
    fields: ["Contact person/team", "Channel (Slack/phone)", "Backup contact", "Time threshold"]
  7_post_actions:
    checklist: ["Update runbook", "Create postmortem if P1/P2", "Notify stakeholders", "Record MTTD/MTTR"]

optional_sections: ["Prerequisites", "Rollback Steps", "Related Runbooks", "Changelog"]

# === WRITING QUALITY 编写质量 (6 Principles) ===
six_principles:
  reproducible:
    rule: "Steps specific enough to copy-paste and execute / 步骤具体到可直接复制执行"
    good: "kubectl rollout restart deployment/payment-service -n production"
    bad: "Restart the payment service"
  unambiguous:
    rule: "Each step has exactly one interpretation / 每个步骤只有一种解读"
    good: "Restart the payment-service Pod in the production namespace"
    bad: "Restart the service"
  decision_points:
    rule: "Branch conditions are explicit with clear criteria / 分支条件明确有具体判断标准"
    good: "If CPU > 90%, execute Plan A; otherwise Plan B"
    bad: "If the server seems overloaded..."
  rollback:
    rule: "Failed fix steps have a fallback plan / 失败的修复步骤有回退方案"
  verification:
    rule: "Each fix step has success confirmation / 每个修复步骤有成功验证"
    good: "Run curl health-check and verify HTTP 200"
    bad: "Check that it's working"
  time_bounded:
    rule: "Expected completion time is stated / 标明预期完成时间"
    good: "This step typically takes 2-5 minutes"

anti_patterns:
  - {bad: "Contact the team", fix: "Name specific people and channels / 指名具体人员和频道"}
  - {bad: "Check the logs", fix: "Provide exact log query / 提供精确的日志查询"}
  - {bad: "If needed, scale up", fix: "Define threshold and target / 定义阈值和目标"}
  - {bad: "Outdated commands", fix: "Regular review cycle / 定期审查周期"}

# === DRILL PROCESS 演练机制 ===
drill:
  schedule:
    highest: {condition: "P1 alert runbooks", frequency: "Monthly / 每月"}
    high: {condition: "P2 alert runbooks", frequency: "Quarterly / 每季"}
    medium: {condition: "Emergency procedures", frequency: "Quarterly / 每季"}
    low: {condition: "Other runbooks", frequency: "Bi-annually / 每半年"}
  recording:
    fields: ["Date", "Participants", "Result (Pass/Partial/Fail)", "Estimated vs Actual time", "Issues found", "Updates required"]
  failure_handling:
    1: "Immediately flag runbook as needing update / 立即标记需更新"
    2: "Create action item with owner and deadline / 建立待办事项"
    3: "Re-drill after update / 更新后重新演练"
    4: "Not valid until re-drill passes / 重新演练通过前视为无效"

# === REVIEW CYCLES 审查周期 ===
review_cycles:
  alert_response: "Quarterly (3 months) / 每季"
  emergency_procedure: "Monthly / 每月"
  standard_operation: "Bi-annually (6 months) / 每半年"
  change_procedure: "After each use / 每次使用后"
  troubleshooting_guide: "Bi-annually (6 months) / 每半年"

staleness: "Runbook is stale when Last Updated exceeds review cycle or not drilled within drill cycle / 超过审查周期或演练周期即为过时"

# === COVERAGE REPORT 覆盖率报告 ===
coverage:
  target:
    P1_P2: "100% alerts must have runbooks / P1/P2 告警必须 100% 有手册"
    P3_P4: "> 80% alerts should have runbooks / P3/P4 告警应 > 80% 有手册"
  report_format:
    columns: ["Alert Level", "Total Alerts", "With Runbook", "Coverage", "Target"]
  action: "List alerts without runbooks for creation / 列出无手册的告警待建立"

# === DIRECTORY STRUCTURE 目录结构 ===
organization:
  root: "docs/runbooks/"
  subdirs: ["alerts/", "operations/", "emergency/", "changes/", "troubleshooting/"]
  naming: "kebab-case, describe the PROBLEM not the solution / 描述问题而非解法"
  index: "README.md with runbook table (name, severity, services, date)"
```

---

## 与相关技能整合 / Integration with Related Skills

| Skill | 整合点 | 说明 |
|-------|-------------------|-------------|
| `/observability --alerting` | 告警与 Runbook 关联 | 每条告警规则都应包含 `runbook_url` 注解 |
| `/incident` | 事后检讨到 Runbook 流程 | 事后检讨后：更新现有 runbook 或为新的故障模式创建新 runbook |
| `/slo` | 燃尽率告警 | SLO 燃尽率告警应链接到对应的 runbook |

### 告警关联手册 / Alert-to-Runbook Linking

```yaml
# In alert rule definition
annotations:
  runbook_url: "https://wiki.example.com/runbooks/alerts/api-latency-high"
```

### 事后检讨到手册流程 / Postmortem-to-Runbook Flow

- incident 揭露了 runbook 的缺漏 → 更新该 runbook
- incident 是全新的故障模式 → 创建新的 runbook
- 将事后检讨链接到 runbook 的变更日志

---

## 配置检测

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的 "Disabled Skills" 章节
2. 检查 `CONTRIBUTING.md` 中的 "Runbook Standards" 章节
3. 若未找到，**默认采用标准 runbook 实践**

---

## 详细指南

完整标准请参见：
- [Runbook Standards](../../core/runbook-standards.md)

---

## 相关标准

- [Runbook Standards](../../core/runbook-standards.md) - 核心标准
- [Alerting Standards](../../core/alerting-standards.md) - 告警设计与 runbook 关联
- [Postmortem Standards](../../core/postmortem-standards.md) - incident 后审查
- [Observability Standards](../../core/observability-standards.md) - 监控与仪表盘
- [Observability Assistant](../observability-assistant/SKILL.md) - 监控设置
- [SLO Assistant](../slo-assistant/SKILL.md) - 基于 SLO 的告警

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | 首次发布 |

---

## 许可证

本 skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
