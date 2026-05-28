---
name: runbook
scope: universal
description: |
  Guide runbook creation, maintenance, and drill exercises.
  Use when: writing runbooks, planning drills, auditing runbook coverage, post-incident runbook updates.
  Keywords: runbook, operations, drill, on-call, procedure.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[create|drill|coverage] [alert name or type | 告警名稱或類型]"
---

# Runbook Assistant | Runbook 助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/runbook-assistant/SKILL.md)

Guide runbook writing, maintenance, drill exercises, and coverage reporting.

引導 Runbook 撰寫、維護、演練和覆蓋率報告。

## Capabilities | 功能

| Capability | Description | 說明 |
|------------|-------------|------|
| **Create Runbook** | Generate runbook from standard template (7 sections) | 從標準範本產生 Runbook |
| **Drill Planning** | Schedule and record drill exercises | 規劃和記錄演練 |
| **Coverage Report** | Check runbook coverage for P1-P4 alerts | 檢查告警的 Runbook 覆蓋率 |
| **Quality Review** | Verify runbook quality (6 principles) | 驗證 Runbook 品質 |
| **Staleness Check** | Identify overdue runbook reviews | 識別過期需審查的 Runbook |

## Usage | 使用方式

```bash
/runbook                              # Show runbook guide
/runbook create "api-latency-high"    # Create runbook for alert
/runbook drill                        # Plan drill exercises
/runbook coverage                     # Generate coverage report
```

## Next Steps Guidance | 下一步引導

> **Runbook 引導完成。建議下一步：**
> - 執行 `/observability --alerting` 連結告警到 Runbook ⭐ **推薦**
> - 執行 `/incident --postmortem` 從事故更新 Runbook
> - 執行 `/checkin` 提交變更

## Deploy Runbook — Mandatory Rule

Any deploy runbook that includes a destructive-update pattern (stop → swap → start) **MUST** follow the [Defensive Deployment Ordering](../../core/deployment-standards.md#defensive-deployment-ordering) sequence: extract to staging → verify → only then touch the live install. Skipping the verify step has caused real production outages.

任何包含 destructive-update（stop → swap → start）的部署 runbook **必須**遵循 [Defensive Deployment Ordering](../../core/deployment-standards.md#defensive-deployment-ordering) 順序：解壓到 staging → verify → 通過後才動 live install。跳過 verify 步驟已造成真實生產事故。

## Reference | 參考

- Core standard: [runbook-standards.md](../../core/runbook-standards.md)
- Related: [alerting-standards.md](../../core/alerting-standards.md)
- Related: [postmortem-standards.md](../../core/postmortem-standards.md)
- Related: [deployment-standards.md § Defensive Deployment Ordering](../../core/deployment-standards.md#defensive-deployment-ordering) — mandatory ordering for destructive deploys
- Related: [packaging-standards.md § Archive Format Integrity](../../core/packaging-standards.md#archive-format-integrity) — upstream pair to defensive ordering
