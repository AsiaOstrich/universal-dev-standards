---
scope: universal
description: |
  Guide runbook creation, organization, and validation.
  Use when: writing runbooks, reviewing operational procedures, planning drills, assessing coverage.
  Keywords: runbook, operations, incident, on-call, drill, SOP, 運維手冊, 演練.
---

# Runbook Assistant

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/runbook-assistant/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: Claude Code Skills

---

## Purpose

This skill helps teams write, organize, and validate runbooks for operational procedures and incident response. It covers the 5 runbook types, a standard 7-section template, writing quality principles, drill processes, and coverage reporting.

---

## Quick Reference (YAML Compressed)

```yaml
# === 5 RUNBOOK TYPES 五種類型 ===
types:
  alert_response:
    purpose: "Diagnose and fix a specific alert / 診斷並修復特定告警"
    example: "api-latency-high.md"
    trigger: "Alert fires"
  standard_operation:
    purpose: "Routine operational procedures / 例行維運程序"
    example: "database-backup-restore.md"
    trigger: "Scheduled or on-demand"
  emergency_procedure:
    purpose: "Major incident rapid response / 重大事件快速回應"
    example: "full-service-outage.md"
    trigger: "SEV-1 incident"
  change_procedure:
    purpose: "Planned change execution steps / 計畫變更執行步驟"
    example: "database-migration.md"
    trigger: "Change window"
  troubleshooting_guide:
    purpose: "General problem investigation / 一般問題調查"
    example: "memory-leak.md"
    trigger: "Ad-hoc investigation"

# === STANDARD TEMPLATE 標準範本 (7 Sections) ===
template_sections:
  1_overview:
    fields: ["Alert Name", "Severity (P1-P4)", "Related Services", "Last Updated", "Owner", "Last Drilled"]
  2_symptoms:
    content: "Observable behaviors — what users see, how system behaves / 可觀察的異常行為"
  3_impact_assessment:
    fields: ["Affected users scope", "Business impact (revenue, reputation)", "Upstream/downstream cascading"]
  4_diagnostic_steps:
    format: "Numbered steps with copy-paste commands and expected output / 編號步驟+可複製指令+預期輸出"
    branching: "If [condition A] → Scenario A; If [condition B] → Scenario B"
  5_fix_steps:
    format: "Per-scenario fix with verification command after each step / 每場景修復+每步驟驗證"
    include: ["Specific commands", "Verification check", "Estimated time"]
  6_escalation:
    fields: ["Contact person/team", "Channel (Slack/phone)", "Backup contact", "Time threshold"]
  7_post_actions:
    checklist: ["Update runbook", "Create postmortem if P1/P2", "Notify stakeholders", "Record MTTD/MTTR"]

optional_sections: ["Prerequisites", "Rollback Steps", "Related Runbooks", "Changelog"]

# === WRITING QUALITY 撰寫品質 (6 Principles) ===
six_principles:
  reproducible:
    rule: "Steps specific enough to copy-paste and execute / 步驟具體到可直接複製執行"
    good: "kubectl rollout restart deployment/payment-service -n production"
    bad: "Restart the payment service"
  unambiguous:
    rule: "Each step has exactly one interpretation / 每個步驟只有一種解讀"
    good: "Restart the payment-service Pod in the production namespace"
    bad: "Restart the service"
  decision_points:
    rule: "Branch conditions are explicit with clear criteria / 分支條件明確有具體判斷標準"
    good: "If CPU > 90%, execute Plan A; otherwise Plan B"
    bad: "If the server seems overloaded..."
  rollback:
    rule: "Failed fix steps have a fallback plan / 失敗的修復步驟有回退方案"
  verification:
    rule: "Each fix step has success confirmation / 每個修復步驟有成功驗證"
    good: "Run curl health-check and verify HTTP 200"
    bad: "Check that it's working"
  time_bounded:
    rule: "Expected completion time is stated / 標明預期完成時間"
    good: "This step typically takes 2-5 minutes"

anti_patterns:
  - {bad: "Contact the team", fix: "Name specific people and channels / 指名具體人員和頻道"}
  - {bad: "Check the logs", fix: "Provide exact log query / 提供精確的日誌查詢"}
  - {bad: "If needed, scale up", fix: "Define threshold and target / 定義閾值和目標"}
  - {bad: "Outdated commands", fix: "Regular review cycle / 定期審查週期"}

# === DRILL PROCESS 演練機制 ===
drill:
  schedule:
    highest: {condition: "P1 alert runbooks", frequency: "Monthly / 每月"}
    high: {condition: "P2 alert runbooks", frequency: "Quarterly / 每季"}
    medium: {condition: "Emergency procedures", frequency: "Quarterly / 每季"}
    low: {condition: "Other runbooks", frequency: "Bi-annually / 每半年"}
  recording:
    fields: ["Date", "Participants", "Result (Pass/Partial/Fail)", "Estimated vs Actual time", "Issues found", "Updates required"]
  failure_handling:
    1: "Immediately flag runbook as needing update / 立即標記需更新"
    2: "Create action item with owner and deadline / 建立待辦事項"
    3: "Re-drill after update / 更新後重新演練"
    4: "Not valid until re-drill passes / 重新演練通過前視為無效"

# === REVIEW CYCLES 審查週期 ===
review_cycles:
  alert_response: "Quarterly (3 months) / 每季"
  emergency_procedure: "Monthly / 每月"
  standard_operation: "Bi-annually (6 months) / 每半年"
  change_procedure: "After each use / 每次使用後"
  troubleshooting_guide: "Bi-annually (6 months) / 每半年"

staleness: "Runbook is stale when Last Updated exceeds review cycle or not drilled within drill cycle / 超過審查週期或演練週期即為過時"

# === COVERAGE REPORT 覆蓋率報告 ===
coverage:
  target:
    P1_P2: "100% alerts must have runbooks / P1/P2 告警必須 100% 有手冊"
    P3_P4: "> 80% alerts should have runbooks / P3/P4 告警應 > 80% 有手冊"
  report_format:
    columns: ["Alert Level", "Total Alerts", "With Runbook", "Coverage", "Target"]
  action: "List alerts without runbooks for creation / 列出無手冊的告警待建立"

# === DIRECTORY STRUCTURE 目錄結構 ===
organization:
  root: "docs/runbooks/"
  subdirs: ["alerts/", "operations/", "emergency/", "changes/", "troubleshooting/"]
  naming: "kebab-case, describe the PROBLEM not the solution / 描述問題而非解法"
  index: "README.md with runbook table (name, severity, services, date)"
```

---

## Integration with Related Skills / 與相關技能整合

| Skill | Integration Point | Description |
|-------|-------------------|-------------|
| `/observability --alerting` | Alert-to-Runbook linking | Every alert rule SHOULD include `runbook_url` annotation |
| `/incident` | Postmortem-to-Runbook flow | After postmortem: update existing or create new runbook for new failure modes |
| `/slo` | Burn rate alerts | SLO burn rate alerts should link to corresponding runbooks |

### Alert-to-Runbook Linking / 告警連結手冊

```yaml
# In alert rule definition
annotations:
  runbook_url: "https://wiki.example.com/runbooks/alerts/api-latency-high"
```

### Postmortem-to-Runbook Flow / 事後檢討到手冊流程

- Incident revealed runbook gaps → update the runbook
- Incident was new failure mode → create new runbook
- Link postmortem to runbook changelog

---

## Configuration Detection

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
2. Check `CONTRIBUTING.md` for "Runbook Standards" section
3. If not found, **default to standard runbook practices**

---

## Detailed Guidelines

For complete standards, see:
- [Runbook Standards](../../core/runbook-standards.md)

---

## Related Standards

- [Runbook Standards](../../core/runbook-standards.md) - Core standard
- [Alerting Standards](../../core/alerting-standards.md) - Alert design and runbook linking
- [Postmortem Standards](../../core/postmortem-standards.md) - Post-incident review
- [Observability Standards](../../core/observability-standards.md) - Monitoring and dashboards
- [Observability Assistant](../observability-assistant/SKILL.md) - Monitoring setup
- [SLO Assistant](../slo-assistant/SKILL.md) - SLO-based alerting

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
