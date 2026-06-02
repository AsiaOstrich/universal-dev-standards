---
source: ../../../../skills/slo-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 3c3397aec3fe
status: current
scope: universal
description: |
  指导 SLI/SLO/Error Budget 的定义与管理。
  使用时机：定义 SLO、选取 SLI、计算 error budget、设定可靠性目标。
  关键字：SLI、SLO、SLA、error budget、可靠性、burn rate、服务水准、错误预算。
---

# SLO Assistant

> **语言**：English | [繁體中文](../../locales/zh-TW/skills/slo-assistant/SKILL.md)

**版本**：1.0.0
**最后更新**：2026-04-01
**适用范围**：Claude Code Skills

---

## 目的

本技能帮助团队定义、实现并管理服务水准目标（Service Level Objectives）。内容涵盖针对不同服务类型的 SLI 选取、五步骤 SLO 设定方法论、Error Budget 计算与政策，以及开箱即用的模板。

---

## 快速参考（YAML 压缩版）

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

## 与相关技能的整合 / Integration with Related Skills

| 技能 | 整合点 | 说明 |
|-------|-------------------|-------------|
| `/observability` | SLI 数据来源 | 来自三大支柱的指标用于 SLI 计算 |
| `/incident` | SLO 影响评估 | 在事件报告中纳入已消耗与剩余的 Error Budget |
| `/sdd` | 规格中的 SLO | 新服务规格应包含 SLO 目标章节 |

### 事件回应中的 SLO / SLO in Incident Response

报告事件时，请纳入：
- **受影响的 SLI**：哪个指标受到影响
- **已消耗的 Error Budget**：分钟数或百分比
- **剩余预算**：当前窗口内还剩多少

### 规格驱动开发中的 SLO / SLO in Spec-Driven Development

使用 `/sdd` 定义新服务时，请新增一个 SLO 章节：
- 附理由的 SLI 选取
- 附论证的目标值
- Error Budget 政策选择

---

## 配置侦测

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 是否有 "Disabled Skills" 章节
2. 检查 `CONTRIBUTING.md` 是否有 "SLO Standards" 章节
3. 若未找到，**预设采用标准 SLO 实践**

---

## 详细准则

完整标准请参阅：
- [SLO Standards](../../core/slo-standards.md)

---

## 相关标准

- [SLO Standards](../../core/slo-standards.md) - 核心标准
- [Observability Standards](../../core/observability-standards.md) - 三大支柱框架
- [Alerting Standards](../../core/alerting-standards.md) - 基于 SLO 的告警
- [Performance Standards](../../core/performance-standards.md) - 性能目标
- [Observability Assistant](../observability-assistant/SKILL.md) - 监控设定
- [Runbook Assistant](../runbook-assistant/SKILL.md) - 告警回应程序

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | 首次发布 |

---

## 授权

本技能依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
