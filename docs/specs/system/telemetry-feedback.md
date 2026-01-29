# [SPEC-TELEMETRY-01] Telemetry & Feedback Loop / 遙測與回饋循環

**Priority**: P2
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-TELEMETRY-001
**Dependencies**: [SPEC-CASCADE-01 Cascading Config]

---

## Summary / 摘要

The Telemetry & Feedback Loop system collects anonymous usage data to improve UDS defaults, identify popular agents/workflows, and track rule violation patterns. It provides opt-in analytics with strong privacy guarantees.

遙測與回饋循環系統收集匿名使用資料以改善 UDS 預設值、識別熱門代理/工作流程，並追蹤規則違規模式。它提供具有強隱私保證的選擇加入分析。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Blind Optimization**: No data on which features are actually used
2. **Unknown Pain Points**: Can't identify which rules cause most friction
3. **Default Drift**: Defaults may not match actual user preferences
4. **Agent Quality**: No feedback on which agents get rolled back

### Solution / 解決方案

An opt-in telemetry system that:
- Collects anonymous, aggregated usage data
- Identifies popular patterns and pain points
- Informs default optimization
- Enables community-driven improvements

---

## User Stories / 使用者故事

### US-1: Opt-in Telemetry

```
As a privacy-conscious developer,
I want telemetry to be opt-in only,
So that my data isn't collected without consent.

作為注重隱私的開發者，
我想要遙測只能選擇加入，
讓我的資料不會在未經同意下被收集。
```

### US-2: Improvement Insights

```
As a UDS maintainer,
I want to see which rules are most often disabled,
So that I can improve or remove problematic defaults.

作為 UDS 維護者，
我想要看到哪些規則最常被停用，
讓我可以改善或移除有問題的預設值。
```

### US-3: Data Transparency

```
As a participating user,
I want to see exactly what data is collected,
So that I can make an informed decision about participation.

作為參與的使用者，
我想要確切看到收集了什麼資料，
讓我可以對參與做出知情決定。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Opt-in Only

**Given** UDS is installed
**When** first run or after update
**Then**:
- Telemetry is OFF by default
- User is prompted to opt-in (skippable)
- Setting saved to global config

```
Would you like to help improve UDS by sharing anonymous usage data?
This includes: command usage, rule violations (no code content), agent usage.

[Yes, I want to help] [No thanks] [What data is collected?]
```

### AC-2: Data Categories

**Given** telemetry is enabled
**When** data is collected
**Then** only these categories are included:

| Category | Data Collected | NOT Collected |
|----------|---------------|---------------|
| **Commands** | Command names, flags, success/fail | Arguments, file paths |
| **Rules** | Rule IDs, enable/disable actions | Rule configuration values |
| **Agents** | Agent names, run/rollback counts | Agent output, prompts |
| **Workflows** | Workflow names, step completion | Custom workflow content |
| **Errors** | Error types, stack traces | User data, file contents |

### AC-3: Privacy Guarantees

**Given** telemetry is enabled
**When** data is sent
**Then** privacy is ensured:

| Guarantee | Implementation |
|-----------|---------------|
| **No PII** | No emails, names, IP addresses |
| **No Code** | Never sends source code |
| **No Paths** | File paths are hashed/anonymized |
| **Aggregation** | Data batched and anonymized |
| **Transparency** | User can view pending data |

### AC-4: Data Viewing

**Given** I run `uds telemetry show`
**When** telemetry is enabled
**Then** I see pending data:

```
Pending Telemetry Data (not yet sent):

Commands (last 7 days):
  - uds init: 3 runs (3 success)
  - uds check: 12 runs (10 success, 2 fail)
  - uds workflow run: 2 runs (1 success, 1 rollback)

Rules:
  - no-console-log: disabled 2 times
  - test-coverage: configured (value hidden)

Agents:
  - code-architect: 5 runs, 0 rollbacks
  - reviewer: 3 runs, 1 rollback

This data will be sent on next sync. Run 'uds telemetry clear' to delete.
```

### AC-5: Data Control

**Given** telemetry is enabled
**When** user wants to control data
**Then** these commands work:

```bash
# Enable/disable
uds telemetry enable
uds telemetry disable

# View pending data
uds telemetry show

# Clear pending data
uds telemetry clear

# Force sync now
uds telemetry sync

# View privacy policy
uds telemetry policy
```

### AC-6: Aggregated Insights

**Given** sufficient telemetry data
**When** analysis is performed
**Then** insights include:

| Insight | Use Case |
|---------|----------|
| Most disabled rules | Improve defaults |
| Most rolled-back agents | Flag quality issues |
| Error patterns | Fix common issues |
| Feature adoption | Prioritize development |

---

## Technical Design / 技術設計

### Data Flow / 資料流

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Telemetry Data Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Local Collection                                                       │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Event Capture                                           │           │
│   │  • Command execution                                    │           │
│   │  • Rule changes                                         │           │
│   │  • Agent/workflow runs                                  │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Anonymization Layer                                     │           │
│   │  • Strip PII                                            │           │
│   │  • Hash file paths                                      │           │
│   │  • Remove code content                                  │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Local Storage (~/.uds/telemetry/)                       │           │
│   │  • events.json (pending events)                         │           │
│   │  • config.json (telemetry settings)                     │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (on sync)                                                      │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Aggregation Server (Optional)                           │           │
│   │  • Aggregate across users                               │           │
│   │  • Generate insights                                    │           │
│   │  • No individual tracking                               │           │
│   └────────────────────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Event Schema / 事件結構

```json
{
  "event_type": "command_run",
  "timestamp": "2026-01-28T10:30:00Z",
  "session_id": "anon-hash-12345",  // Random session ID
  "data": {
    "command": "check",
    "flags": ["--fix"],
    "success": true,
    "duration_ms": 1500
  },
  "environment": {
    "os": "darwin",
    "node_version": "20.x",
    "uds_version": "4.3.0"
  }
}
```

### Anonymization / 匿名化

```javascript
// telemetry/anonymizer.js
export function anonymize(event) {
  const anonymized = { ...event };

  // Hash session ID
  anonymized.session_id = hash(event.session_id);

  // Remove file paths
  if (anonymized.data.path) {
    anonymized.data.path = '[REDACTED]';
  }

  // Strip potential PII from errors
  if (anonymized.data.error) {
    anonymized.data.error = sanitizeError(anonymized.data.error);
  }

  return anonymized;
}
```

### Configuration / 配置

```yaml
# ~/.udsrc
telemetry:
  enabled: false              # Default: opt-out
  level: minimal              # minimal | standard | detailed

  sync:
    interval: 7d              # Sync every 7 days
    batch-size: 100           # Max events per sync

  exclude:
    - custom-commands         # Don't track custom commands
    - error-details           # Don't track error details
```

---

## Privacy Policy Summary / 隱私政策摘要

| Principle | Implementation |
|-----------|---------------|
| **Opt-in Only** | Telemetry disabled by default |
| **Transparency** | Users can view all pending data |
| **Control** | Users can delete data at any time |
| **Anonymity** | No PII, no tracking across sessions |
| **Purpose Limitation** | Data used only for UDS improvement |
| **Data Minimization** | Only essential data collected |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Privacy concerns | High | Strict opt-in, transparency |
| Data breach | High | No PII, anonymous data only |
| Server costs | Medium | Optional server, local-first |

---

## Out of Scope / 範圍外

- Real-time analytics dashboard
- Individual user tracking
- Crash reporting integration
- A/B testing framework

---

## Sync Checklist

### Starting from System Spec
- [ ] Create telemetry module
- [ ] Implement anonymization layer
- [ ] Create CLI commands
- [ ] Draft privacy policy
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [VS Code Telemetry](https://code.visualstudio.com/docs/getstarted/telemetry)
- [npm Telemetry Policy](https://docs.npmjs.com/cli/v9/using-npm/config#metrics-registry)
- [GDPR Compliance](https://gdpr.eu/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
