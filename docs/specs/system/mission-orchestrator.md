# [SPEC-MISSION-01] Mission Orchestrator System / 任務編排系統

**Priority**: P2 (Roadmap)
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-MISSION-001
**Dependencies**: [SPEC-CONFIG-01, SPEC-VIBE-01]

---

## Summary / 摘要

The Mission Orchestrator is the "brain" of UDS v5.0. It transforms the CLI from a collection of tools into a goal-oriented development platform. It manages the lifecycle of "Missions" (like creating a new app, fixing a bug, or migrating a database), maintaining context, managing state, and adapting AI behavior to the specific risk profile of the mission.

任務編排器是 UDS v5.0 的「大腦」。它將 CLI 從工具集合轉變為目標導向的開發平台。它管理「任務」（如建立新應用程式、修復錯誤或遷移資料庫）的生命週期，維護上下文、管理狀態，並根據任務的特定風險概況調整 AI 行為。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1.  **Fragmented Workflows**: Developers currently stitch together `uds init`, `uds check`, and manual coding. The CLI doesn't know the "Goal".
2.  **Context Amnesia**: AI Agents often forget *why* a change is being made or what the original constraints were.
3.  **One-Size-Fits-All Risk**: A simple UI tweak and a database migration are treated with the same safety checks (either too strict or too loose).

### Solution / 解決方案

Introduce **Missions** as first-class citizens.
A Mission is a stateful container that defines:
- **The Goal** (Intent)
- **The Process** (Workflow DAG)
- **The Safety Rules** (Adaptive HITL)
- **The Definition of Done** (Verification Contract)

---

## Core Concepts / 核心概念

### 1. The Mission Stack (任務堆疊)

To handle context switching (e.g., pausing a feature dev to fix a critical bug), Missions are organized as a stack.

```mermaid
graph TD
    Stack[Mission Stack]
    Mission1[Mission A: Greenfield (Paused)]
    Mission2[Mission B: BugFix (Active)]
    
    Stack --> Mission2
    Mission2 --> Mission1
```

### 2. Mission Types (任務類型)

| ID | Name | Metaphor | Risk Profile | AI Mode |
|----|------|----------|--------------|---------|
| `genesis` | Greenfield | Architect | Low (New Code) | Agentic (High Autonomy) |
| `renovate` | Brownfield | Contractor | Medium | Copilot (Collaborative) |
| `medic` | BugFix | Doctor | Medium/High | Interactive Diagnosis |
| `exodus` | Migration | Transformer | High | HITL-Heavy |
| `guardian` | Hardening | Security Guard | High | Rule-Driven |

### 3. Adaptive Execution (自適應執行)

The Orchestrator dynamically adjusts `hitl.threshold` and `vibe-coding.mode` based on the active mission.

- **Genesis**: `hitl.threshold = 4` (Allow almost everything except destructive OS commands)
- **Medic**: `hitl.threshold = 2` (Confirm before writing fixes)
- **Exodus**: `hitl.threshold = 1` (Confirm every step)

---

## Technical Design / 技術設計

### Mission Context Schema

```typescript
interface MissionContext {
  id: string;              // UUID
  type: MissionType;       // 'genesis', 'medic', etc.
  status: 'active' | 'paused' | 'completed' | 'failed';
  
  intent: {
    original: string;      // "Fix the login bug"
    refined: string;       // "Fix null pointer in AuthController.ts"
  };

  state: {
    currentStep: string;
    completedSteps: string[];
    artifacts: string[];   // Created/Modified files
    driftScore: number;    // 0-100 (Deviation from plan)
  };

  config: {
    hitlLevel: number;
    allowedTools: string[];
  };
}
```

### CLI Commands

```bash
# Start a new mission
uds start genesis "MyNewApp"
uds start medic "Fix issue #123"

# List active missions
uds mission list

# Switch context
uds mission switch <mission-id>

# Resume paused mission
uds mission resume
```

---

## Interaction Flow / 互動流程

### Example: BugFix Mission (The "Medic")

1.  **Intake**:
    > User: `uds start medic "Login failing with 500 error"`
    > UDS: Initializing Medic Mission. Analyzing logs...

2.  **Diagnosis (Interactive)**:
    > AI: "I found a potential NullPointerException in `auth.ts`. Should I create a reproduction test case?"
    > User: "Yes." (HITL Level 2 confirmed)

3.  **Fix (Agentic)**:
    > AI: Writing test... Test failed (Reproduction successful).
    > AI: Applying fix...
    > AI: Running tests... Pass.

4.  **Verification (Contract)**:
    > UDS: Checking Done Criteria...
    > - [x] Reproduction Test Created
    > - [x] Tests Pass
    > - [x] No Regressions
    > Mission Complete. Commit?

---

## Integration / 整合

- **Config System**: Mission state is persisted in `.uds/missions/<id>.json`.
- **HITL**: The `MissionContext` is passed to the HITL classifier to determine dynamic thresholds.
- **Vibe Skill**: The AI System Prompt is updated with the current Mission Intent ("You are now a Medic. Be careful.").

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial architectural specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
