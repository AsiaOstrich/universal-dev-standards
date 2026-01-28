# [SPEC-HITL-01] Human-in-the-Loop Protocol / 人機協作協議

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-HITL-001
**Dependencies**: [SPEC-CONFIG-01 Configuration System]

---

## Summary / 摘要

The Human-in-the-Loop (HITL) Protocol defines when and how AI agents must request human approval for critical operations. It establishes mandatory checkpoints for high-risk actions while minimizing friction for routine tasks.

人機協作（HITL）協議定義 AI 代理何時以及如何必須請求人類批准關鍵操作。它為高風險動作建立強制檢查點，同時將常規任務的摩擦降到最低。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **AI Autonomy Risk**: Fully autonomous AI can make irreversible mistakes
2. **Trust Building**: Users need to build confidence in AI decisions
3. **Compliance Requirements**: Some actions require human approval by policy
4. **No Standard Protocol**: Different tools handle human intervention inconsistently

### Solution / 解決方案

A standardized HITL Protocol that:
- Defines risk levels for different operation types
- Specifies mandatory and optional checkpoints
- Provides configurable approval workflows
- Integrates with UDS rules and Vibe Coding

---

## User Stories / 使用者故事

### US-1: Critical Operation Protection

```
As a developer using AI for database migrations,
I want the AI to require my approval before dropping tables,
So that I don't accidentally lose data.

作為使用 AI 進行資料庫遷移的開發者，
我想要 AI 在刪除資料表前需要我的批准，
讓不會意外丟失資料。
```

### US-2: Security-Sensitive Operations

```
As a security-conscious developer,
I want AI to pause before modifying authentication code,
So that I can review security-critical changes.

作為注重安全的開發者，
我想要 AI 在修改認證程式碼前暫停，
讓我可以審查安全關鍵的變更。
```

### US-3: Learning Mode

```
As a new team member learning the codebase,
I want AI to explain actions before taking them,
So that I can learn while the AI helps.

作為學習程式碼庫的新團隊成員，
我想要 AI 在執行動作前解釋，
讓我在 AI 幫助的同時學習。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Risk Level Classification

**Given** an operation is requested
**When** the HITL system evaluates it
**Then** it is classified into a risk level:

| Level | Name | Approval | Examples |
|-------|------|----------|----------|
| 0 | Routine | Auto-approve | Read files, search, format |
| 1 | Standard | Auto-approve (logged) | Write files, run tests |
| 2 | Elevated | Prompt if configured | Modify configs, install deps |
| 3 | Critical | Always prompt | Delete files, deploy, secrets |
| 4 | Restricted | Block unless override | Drop DB, force push, rm -rf |

### AC-2: Mandatory Checkpoints

**Given** a Level 3+ operation is requested
**When** AI attempts to execute
**Then**:
- Operation is paused
- Human is prompted with operation details
- Approval required before proceeding

**Mandatory Checkpoint Operations**:

| Category | Operations |
|----------|------------|
| **Data Destruction** | DELETE, DROP, TRUNCATE, rm, unlink |
| **Security** | Modify auth, change permissions, access secrets |
| **Deployment** | Deploy to production, publish packages |
| **Git** | Force push, reset --hard, branch -D |
| **Infrastructure** | Terraform apply, kubectl delete |

### AC-3: Configurable Thresholds

**Given** a project has HITL configuration
**When** operations are evaluated
**Then** configured thresholds are respected

```yaml
# .uds/config.yaml
hitl:
  default-threshold: 2  # Prompt for Level 2+

  overrides:
    - pattern: "*.test.js"
      threshold: 1  # Allow more automation for tests

    - pattern: "src/auth/**"
      threshold: 3  # Extra careful with auth

  always-prompt:
    - deploy
    - publish
    - database-migrate

  never-prompt:
    - format
    - lint
```

### AC-4: Approval UI Strategy

**Given** a checkpoint is triggered
**When** human is prompted
**Then** the UI adapts to the execution environment:

**Strategy A: Terminal Mode (CLI)**
- Interactive Inquirer prompt pauses execution.
- Shows diff/context in terminal.
```
⚠️ HITL Checkpoint (Level 3: Critical)
Operation: Delete file src/legacy/old-feature.js
[Approve] [Reject] [Show file]
```

**Strategy B: Chat Mode (Cursor/Windsurf/Claude Code)**
- Used when `UDS_INTERACTIVE_MODE=chat` is set.
- Output JSON-structured "Ask" to stdout.
- AI Agent parses this and asks user in natural language chat.
- User replies "Yes/No" in chat.
- AI Agent sends confirmation back to CLI via stdin or flag.

### AC-5: Audit Trail

**Given** any HITL checkpoint occurs
**When** decision is made
**Then** audit log is updated:

```json
{
  "timestamp": "2026-01-28T10:30:00Z",
  "operation": "delete-file",
  "target": "src/legacy/old-feature.js",
  "risk-level": 3,
  "decision": "approved",
  "user": "developer@example.com",
  "session": "vibe-session-123"
}
```

### AC-6: Learning Mode

**Given** I run `uds configure --hitl learning`
**When** any operation is performed
**Then**:
- All operations show explanation before execution
- User can approve/reject each step
- Threshold effectively becomes 0

---

## Technical Design / 技術設計

### Operation Classification / 操作分類

```javascript
// hitl/classifier.js
export function classifyOperation(operation) {
  const rules = [
    { pattern: /^rm -rf|drop table|truncate/i, level: 4 },
    { pattern: /^git (push --force|reset --hard)/i, level: 4 },
    { pattern: /^delete|remove|unlink/i, level: 3 },
    { pattern: /^deploy|publish|release/i, level: 3 },
    { pattern: /auth|secret|password|token/i, level: 3 },
    { pattern: /^install|npm|pip/i, level: 2 },
    { pattern: /^write|edit|modify/i, level: 1 },
    { pattern: /^read|search|list/i, level: 0 },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(operation)) {
      return rule.level;
    }
  }
  return 1; // Default to Standard
}
```

### Checkpoint Flow / 檢查點流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HITL Checkpoint Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   AI Operation Request                                                   │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 1. Classify Operation                                   │           │
│   │    • Pattern matching                                   │           │
│   │    • Context analysis                                   │           │
│   │    → Risk Level (0-4)                                  │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 2. Check Threshold                                      │           │
│   │    • Compare level vs configured threshold              │           │
│   │    • Apply overrides                                    │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ├── Level < Threshold ──→ Auto-approve (log)                     │
│        │                                                                │
│        ├── Level >= Threshold ──→ Prompt User                           │
│        │                                 │                              │
│        │                                 ├── Strategy A: Terminal      │
│        │                                 └── Strategy B: Chat Mode     │
│        │                                         (Async Wait)          │
│        │                                                                │
│        └── Level 4 + No Override ──→ Block                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### CLI Commands / CLI 命令

```bash
# Configure HITL threshold
uds configure --hitl <level>
uds configure --hitl learning  # Prompt for everything
uds configure --hitl minimal   # Only Level 4
uds configure --hitl balanced  # Level 2+ (default)

# View HITL audit log
uds hitl log
uds hitl log --last 10
uds hitl log --operation delete

# Override for single session
uds --hitl-level 1 workflow run feature-dev
```

### File Structure / 檔案結構

```
cli/src/
├── hitl/
│   ├── classifier.js         # Risk level classification
│   ├── checkpoint.js         # Checkpoint logic
│   ├── prompt.js             # User prompt UI (Terminal/Chat adapters)
│   └── audit.js              # Audit logging
└── config/
    └── hitl-defaults.js      # Default classifications
```

---

## Integration Points / 整合點

### With Vibe Coding

- In Vibe Mode, HITL thresholds can be relaxed
- Auto-Sweep at session end may trigger HITL checkpoints
- Learning Mode is recommended for new Vibe users

### With Agents

- Agents inherit HITL configuration
- Read-only agents skip most checkpoints
- Agent tool restrictions interact with HITL levels

### With Workflows

- Each workflow step is classified
- Conditional steps may have different thresholds
- Workflow can define step-level overrides

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Approval fatigue | Medium | Smart defaults, learning from approvals |
| Bypass security | High | Level 4 cannot be bypassed without explicit flag |
| Workflow interruption | Medium | Batch approvals for multiple operations |

---

## Out of Scope / 範圍外

- Multi-user approval workflows
- Time-based approval expiry
- Role-based approval matrix
- External approval systems (JIRA, etc.)

---

## Sync Checklist

### Starting from System Spec
- [ ] Create HITL module
- [ ] Integrate with agent execution
- [ ] Integrate with workflow executor
- [ ] Update Vibe Coding integration
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [Vibe Coding Integration Spec](./vibe-coding-integration.md)
- [Claude Code Permission Prompts](https://docs.anthropic.com/claude-code/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).