---
scope: universal
description: |
  Guide SLI/SLO/Error Budget definition and management.
  Use when: defining SLOs, selecting SLIs, calculating error budgets, setting reliability targets.
  Keywords: SLI, SLO, SLA, error budget, reliability, burn rate, 服務水準, 錯誤預算.
---

# SLO Assistant

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/slo-assistant/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: Claude Code Skills

---

## Purpose

This skill helps teams define, implement, and manage Service Level Objectives. It covers SLI selection for different service types, a 5-step SLO setting methodology, Error Budget calculation and policies, and ready-to-use templates.

---

## Quick Reference (YAML Compressed)

```yaml
# === KEY CONCEPTS 核心概念 ===
definitions:
  SLI: "Service Level Indicator — quantitative measurement of service behavior / 服務品質的量化量測"
  SLO: "Service Level Objective — internal target for SLI over a window / SLI 的內部目標值"
  SLA: "Service Level Agreement — external contract with penalties / 外部合約，違反有罰則"
  error_budget: "Allowed unreliability = 1 - SLO target / 允許的不可靠度"

relationship: "SLI ── measures ──► SLO ── stricter than ──► SLA"
rule: "SLO should be stricter than SLA to provide buffer / SLO 應比 SLA 嚴格以提供緩衝"

# === SLI SELECTION GUIDE SLI 選取指南 ===
sli_by_service_type:
  api_services:
    availability: "Non-5xx / Total requests"
    latency: "Requests below duration threshold / Total"
    quality: "Non-degraded responses / Total"
  batch_jobs:
    freshness: "Time since last success within threshold"
    correctness: "Correctly processed / Total records"
    coverage: "Completed batches / Scheduled batches"
  frontend:
    load_performance: "LCP<2.5s, FID<100ms, CLS<0.1 / Total pages"
    availability: "Successful loads / Total loads"
    interaction_delay: "Actions with response < threshold / Total"

sli_quick_select:
  api: "→ Availability + Latency + Quality"
  batch: "→ Freshness + Correctness + Coverage"
  frontend: "→ LCP/FID/CLS + Availability"

# === 5-STEP SLO METHODOLOGY 五步驟設定法 ===
slo_methodology:
  step_1_select_sli: "Choose 1-3 most meaningful SLIs per service / 每個服務選 1-3 個最有意義的 SLI"
  step_2_measurement_window:
    rolling_28d: "Recommended; smooths weekly patterns / 推薦，平滑週間波動"
    calendar_month: "Aligns with business reporting / 對齊業務報告週期"
  step_3_set_target:
    "99%": "7.3h downtime/month — internal tools / 內部工具"
    "99.5%": "3.65h — general B2B / 一般 B2B"
    "99.9%": "43.8min — consumer-facing / 面向消費者"
    "99.95%": "21.9min — financial, healthcare / 金融、醫療"
    "99.99%": "4.38min — infrastructure, payments / 基礎設施"
    tip: "Don't set higher than you can sustain / 別設得比你能維持的更高"
  step_4_compliance_formula: |
    SLO Compliance = (Good Events / Total Events) x 100%
    Define: Good Events, Total Events, Window, Target
  step_5_document: "Record using SLO Document Template / 使用 SLO 文件範本記錄"

iterative_adjustment:
  budget_underused: "Consider tightening SLO / 考慮收緊 SLO"
  budget_exhausted_often: "Loosen SLO or invest in reliability / 放寬或投資可靠性"
  users_unhappy_despite_meeting: "Revisit SLI selection / 重新檢視 SLI 選取"
  team_burnout: "SLO may be too aggressive / SLO 可能過於激進"

# === ERROR BUDGET 錯誤預算 ===
error_budget:
  formula: "Budget = 1 - SLO Target"
  example: "99.9% over 28d → 0.1% → 40.32 min allowed downtime"
  quick_calc: "Budget = (1 - target) x window_minutes"

burn_rate_alerting:
  fast_burn: {threshold: "2% in 1h", action: "Page (P1)", meaning: "Budget gone in ~2 days"}
  medium_burn: {threshold: "5% in 6h", action: "Alert (P2)", meaning: "Budget gone in ~5 days"}
  slow_burn: {threshold: "10% in 3d", action: "Ticket (P3)", meaning: "May exhaust before month end"}

budget_exhaustion_policies:
  freeze_releases: "Halt non-reliability features until recovery / 凍結非可靠性功能發布"
  reliability_sprint: "Dedicate sprint to reliability / 專注衝刺可靠性改善"
  enhanced_review: "Additional production-readiness review / 加強生產就緒審查"
  lower_slo: "Reduce target after stakeholder agreement / 經利害關係人同意後降低目標"
  rule: "Agree on policy BEFORE budget exhaustion / 在預算耗盡前就達成政策共識"

# === SLO TEMPLATES 範本庫 ===
templates:
  api_service:
    availability: {sli: "Non-5xx / Total", default_slo: "99.9%"}
    latency: {sli: "P99 < threshold / Total", default_slo: "99%"}
    error_rate: {sli: "Non-5xx+timeout / Total", default_slo: "99.9%"}
  batch_job:
    freshness: {sli: "Max delay < threshold", default_slo: "99.5%"}
    correctness: {sli: "Correct / Total", default_slo: "99.99%"}
    completion: {sli: "Completed / Scheduled", default_slo: "99.9%"}
  frontend:
    load_perf: {sli: "LCP<2.5s proportion", default_slo: "90%"}
    interaction: {sli: "FID<100ms proportion", default_slo: "95%"}
    visual: {sli: "CLS<0.1 proportion", default_slo: "95%"}
```

---

## Integration with Related Skills / 與相關技能整合

| Skill | Integration Point | Description |
|-------|-------------------|-------------|
| `/observability` | SLI data source | Metrics from three pillars feed SLI calculations |
| `/incident` | SLO impact assessment | Include Error Budget consumed and remaining in incident reports |
| `/sdd` | SLO in specs | New service specs SHOULD include SLO targets section |

### SLO in Incident Response / 事件回應中的 SLO

When reporting incidents, include:
- **Affected SLI**: Which indicator was impacted
- **Error Budget consumed**: Minutes or percentage
- **Remaining budget**: How much is left in the window

### SLO in Spec-Driven Development / 規格驅動開發中的 SLO

When defining new services with `/sdd`, add an SLO section:
- SLI selection with rationale
- Target value with justification
- Error Budget policy choice

---

## Configuration Detection

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
2. Check `CONTRIBUTING.md` for "SLO Standards" section
3. If not found, **default to standard SLO practices**

---

## Detailed Guidelines

For complete standards, see:
- [SLO Standards](../../core/slo-standards.md)

---

## Related Standards

- [SLO Standards](../../core/slo-standards.md) - Core standard
- [Observability Standards](../../core/observability-standards.md) - Three pillars framework
- [Alerting Standards](../../core/alerting-standards.md) - SLO-based alerting
- [Performance Standards](../../core/performance-standards.md) - Performance targets
- [Observability Assistant](../observability-assistant/SKILL.md) - Monitoring setup
- [Runbook Assistant](../runbook-assistant/SKILL.md) - Alert response procedures

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
