---
name: incident
scope: universal
description: |
  Guide incident response, root cause analysis, and post-mortem documentation.
  Use when: production incident, outage response, post-mortem writing, RCA.
  Keywords: incident, outage, post-mortem, RCA, root cause, 事故, 故障, 根因分析.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[incident description or severity | 事故描述或嚴重程度]"
---

# Incident Response Assistant | 事故回應助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/incident-response-assistant/SKILL.md)

Guide structured incident response from detection through post-mortem.

引導結構化的事故回應流程，從偵測到事後檢討。

## Severity Classification | 嚴重程度分類

| Level | Name | Criteria | 標準 | Response Time |
|-------|------|----------|------|---------------|
| **SEV-1** | Critical 重大 | Full service outage, data loss | 全面服務中斷、資料遺失 | Immediate (< 15 min) |
| **SEV-2** | High 高 | Major feature degraded, partial outage | 主要功能降級、部分中斷 | < 30 min |
| **SEV-3** | Medium 中 | Minor feature affected, workaround exists | 次要功能受影響、有替代方案 | < 4 hours |
| **SEV-4** | Low 低 | Cosmetic issue, minimal user impact | 外觀問題、最小用戶影響 | Next business day |

## Response Workflow | 回應工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM
偵測         分級        緩解          解決         事後檢討
```

### 1. Detect — Identify the Incident | 偵測事故
- Monitor alerts, user reports, error spikes
- 監控告警、使用者回報、錯誤量飆升

### 2. Triage — Classify Severity | 分級嚴重程度
- Assign SEV level, identify Incident Commander (IC)
- 指定嚴重等級、識別事故指揮官（IC）

### 3. Mitigate — Reduce Impact | 緩解影響
- Apply temporary fix: rollback, feature flag, traffic shift
- 套用暫時修復：回滾、功能開關、流量切換

### 4. Resolve — Permanent Fix | 永久修復
- Root cause analysis, implement proper fix, deploy
- 根因分析、實作正確修復、部署

### 5. Post-Mortem — Learn & Improve | 事後檢討
- Document timeline, impact, root cause, action items
- 記錄時間軸、影響範圍、根因、行動項目

## Post-Mortem Template | 事後檢討模板

```markdown
## Post-Mortem: [Incident Title]
**Date**: YYYY-MM-DD  |  **Severity**: SEV-N  |  **Duration**: Xh Ym

### Timeline
| Time | Event |
|------|-------|
| HH:MM | Alert triggered / 告警觸發 |
| HH:MM | IC assigned / 指派事故指揮官 |
| HH:MM | Mitigation applied / 套用緩解措施 |
| HH:MM | Resolved / 解決 |

### Impact
- Users affected / 受影響用戶數: N
- Revenue impact / 營收影響: $N
- SLA breach / SLA 違反: Yes/No

### Root Cause
[Description of the underlying cause / 根本原因描述]

### Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Fix] | @name | YYYY-MM-DD | P0 |
```

## Communication Template | 溝通模板

```
[SEV-N] [Service Name] — [Brief Description]
Status: Investigating / Mitigating / Resolved
Impact: [Who is affected and how]
Next update: [Time]
```

## Usage | 使用方式

```bash
/incident                       # Show full incident response guide | 顯示完整事故回應指南
/incident "API 500 errors"      # Guided response for specific incident | 特定事故引導回應
/incident --post-mortem         # Generate post-mortem template | 產生事後檢討模板
/incident --sev1                # SEV-1 rapid response checklist | SEV-1 快速回應清單
```

## Next Steps Guidance | 下一步引導

After `/incident` completes, the AI assistant should suggest:

> **事故回應指引已提供。建議下一步 / Incident response guidance provided. Suggested next steps:**
> - 提交修復 → 執行 `/commit` 建立修復提交 ⭐ **Recommended / 推薦** — Create fix commit
> - 程式碼審查 → 執行 `/review` 審查修復變更 — Review fix changes
> - 記錄學習 → 執行 `/docs` 更新文件 — Document learnings
> - 安全審查 → 執行 `/security` 檢查安全影響 — Check security impact

## Reference | 參考

- Core standard: [deployment-standards.md](../../core/deployment-standards.md)
- Core standard: [logging.md](../../core/logging.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/incident`](../commands/incident.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/incident`](../commands/incident.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0 — Documentation content
