# Flow-Based Testing

**Version**: 1.3.0
**Last Updated**: 2026-05-05
**Applicability**: All software projects with multi-step workflows
**Scope**: universal
**Industry Standards**: ISO/IEC/IEEE 29119-4 (Test Techniques), ISTQB Foundation Syllabus
**References**: Decision Table Testing (ISTQB), Pairwise Testing, State Transition Testing

[English](.) | [繁體中文](../locales/zh-TW/core/flow-based-testing.md)

---

## Purpose

This document defines a systematic methodology for testing multi-step processes. It addresses the gap between AC-centric tests (which verify individual behaviors in isolation) and flow-level tests (which verify sequential behavior with accumulated state and branch coverage).

---

## The Core Problem: AC-Centric vs. Flow-Centric Testing

AC-centric tests verify that each acceptance criterion works in isolation. However, they miss two critical categories of bugs:

1. **Step interaction bugs**: A bug that only manifests when Step 1's output becomes Step 2's input
2. **Branch coverage gaps**: Decision points that are never exercised with all possible values

**Example**: A pipeline has 8 steps. Each AC passes independently. But when the quota check in Step 3 depends on state accumulated in Steps 1 and 2, the interaction is never tested.

---

## Three-Step Flow Decomposition

### Step 1: Flow Identification

Before writing any test code, document:

- **Preconditions**: The system's initial state
- **Step sequence**: The ordered list of actions (Step 1 → Step N)
- **Decision points**: Every if/else/condition in the flow
- **Terminal states**: All possible end states (success + each distinct failure)

### Step 2: Decision Table Expansion

For each decision point, list all possible values. Then apply a coverage strategy:

| Strategy | When to Use | Scenario Count |
|----------|-------------|---------------|
| **Each-Choice** (minimum) | Low-risk flows, fast feedback | Sum of unique values |
| **Pairwise** | Medium-risk flows | ~N × max_values |
| **All-Combinations** | Auth, payment, security | Product of value counts |

**Decision Table Example**:

| Decision Point | Values |
|----------------|--------|
| Authorization | valid / expired / missing |
| Quota | sufficient / exceeded |
| External Service | available / timeout / error |

Each-Choice minimum: 3 + 2 + 3 = 8 scenarios (vs. the typical 1-2 that teams actually write).

### Step 3: Journey Test Structure

Write tests with shared state threading — a `ctx` object accumulates state across steps:

```typescript
describe("Flow: Create Order", () => {
  const ctx: { token?: string; orderId?: string } = {}

  it("Step 1: Login", async () => {
    ctx.token = await login(credentials)
    expect(ctx.token).toBeTruthy()
  })

  it("Step 2: Create order (uses Step 1 token)", async () => {
    ctx.orderId = await createOrder(ctx.token!, orderData)
    expect(ctx.orderId).toMatch(/^ord-/)
  })

  it("Step 3: Verify order state (uses Step 2 orderId)", async () => {
    const order = await getOrder(ctx.token!, ctx.orderId!)
    expect(order.status).toBe("pending")
  })
})

describe("Flow Branch: Quota exceeded path", () => {
  it("should return 429 and NOT create order when quota is exhausted", async () => {
    await exhaustQuota(testUser)
    const response = await attemptCreateOrder(testToken, orderData)
    expect(response.status).toBe(429)
    expect(response.body.code).toBe("QUOTA_EXCEEDED")
    // Verify side effects: no order was created
    const orders = await getOrders(testUser)
    expect(orders.length).toBe(0)
  })
})
```

---

## Anti-Patterns

- Testing only the happy path flow (missing failure terminal states)
- Resetting shared state between steps (breaks state threading)
- Testing each step in isolation without verifying accumulated state
- Using a single test for a flow with multiple decision points
- Applying All-Combinations to every flow (reserve for critical paths only)
- Not verifying side effects (or absence thereof) in branch tests

---

## Relationship to Other Standards

- **test-completeness-dimensions**: Dimensions 9 (Flow Completeness) and 10 (Branch Coverage) are defined here
- **behavior-driven-development**: BDD Scenario Outline tables map to decision table expansion
- **mock-boundary**: Flow tests must respect mock boundary rules (no mocking own module logic)
- **e2e-testing**: Journey tests run at ST or E2E level; flow tests can run at IT level with real DB

---

## Multi-Gate Flow Verification Model

Flow coverage is not a single pre-release check — it is a **progressive verification chain** across the entire SDLC. There are two fundamentally different questions that must be answered at different stages:

| Verification Type | Question | Executor | Timing |
|------------------|----------|----------|--------|
| **Coverage** | Are all terminal states tested? | Automated CI | Dev → Staging → Pre-UAT |
| **Correctness** | Are the terminal state definitions right? | Human UAT | UAT phase |

Confusing the two wastes UAT cycles on technical coverage issues that CI should have caught.

### Gate 0 — PRD Sign-off (Before Implementation Starts)

The three testability elements MUST be written into the PRD before a single line of code is written. Use `templates/requirement-template.md` §2.4 and §9.4:

| Element | PRD Section | When Required |
|---------|-------------|---------------|
| Preconditions + Ordered Steps | §2.4 | Flows with ≥ 3 steps |
| Decision Points list | §2.4 | Every branch condition |
| Terminal States list | §2.4 | All distinct end states |
| Decision Table (Each-Choice) | §9.4 | All flows |
| Upgrade to All-Combinations | §9.4 | Auth / payment / security |
| UAT acceptance script (pre-filled) | §9.4 | Before PRD approval |

> **Why at PRD stage?** Test engineers cannot derive branch coverage from a spec that only describes the happy path. Discovering missing decision points during test design wastes a full sprint.

### Gate 1 — PR Merge (Per Feature Branch)

Every PR that touches a flow with ≥ 3 steps MUST include automated tests covering the terminal states introduced or modified by that PR. Reviewers block merge if terminal states are added to §2.4 without corresponding tests.

### Gate 3 — Pre-UAT Deployment (Automated + QA Lead Sign-off)

CI must prove coverage completeness **before** UAT begins. UAT is for correctness validation, not technical testing.

Required CI checks:
- All Decision Table scenarios have a passing automated test
- Zero terminal states without test coverage
- Branch coverage ≥ 90% (or project-defined threshold)
- All-Combinations fully passing for auth / payment / security flows

> Deploying to UAT without Gate 3 forces business stakeholders to act as technical QA — a costly and demoralizing misuse of UAT time.

### Gate 4 — UAT Sign-off (Business Correctness, Pre-Production)

UAT validates that terminal state **definitions are correct** against real business rules, not that they are covered. Use the UAT Acceptance Script in §9.4 (derived directly from the Decision Table — no separate script creation needed):

- Business stakeholders sign off each row (terminal state)
- If UAT reveals a previously undefined terminal state: add it to §2.4 + Decision Table + automated test, re-run Gate 3, then resume UAT
- No new terminal states discovered during UAT = strong signal that §2.4 was thorough

### Gate Model Summary

```
PRD Sign-off
    │ Gate 0: §2.4 + §9.4 complete (Decision Points, Terminal States,
    │         Decision Table, UAT script pre-filled)
    ▼
Implementation + PR Reviews
    │ Gate 1: Each PR covering a flow includes terminal state tests
    ▼
Staging / Integration
    │ (no formal gate — CI green is sufficient)
    ▼
Pre-UAT Deployment
    │ Gate 3: CI proves 100% terminal state coverage + branch coverage ≥ 90%
    ▼
UAT Execution
    │ Gate 4: Business sign-off on terminal state correctness
    │         New terminal states → back to Gate 3 before proceeding
    ▼
Production
```

---

## RQM Integration

Gate 3 (Pre-UAT CI coverage gate) MUST produce a **`flow_gate_report.json`** artifact consumed by the Release Quality Manifest (`release-quality-manifest.md`, field `flow_gate_report`).

### flow_gate_report.json Schema

```json
{
  "generated_at": "2026-05-05T04:00:00Z",
  "commit": "abc1234",
  "flows": [
    {
      "flow_id": "login-authentication",
      "spec_ref": "docs/specs/SPEC-001.md#2.4",
      "decision_points": 3,
      "terminal_states": 7,
      "gate_0_complete": true,
      "gate_1_pr_coverage": true,
      "gate_3": {
        "all_scenarios_green": true,
        "terminal_states_covered": 7,
        "terminal_states_defined": 7,
        "branch_coverage_pct": 94,
        "coverage_target": 90,
        "all_combinations_required": false,
        "status": "pass"
      },
      "gate_4_uat_signoff": true
    }
  ],
  "summary": {
    "total_flows": 5,
    "gate_0_complete": true,
    "gate_1_pr_coverage": true,
    "gate_3_ci_pass": true,
    "gate_4_uat_signoff": true,
    "status": "pass"
  }
}
```

### Generation Script Hook

Add to CI after test run (Gate 3):

```bash
# scripts/generate-flow-gate-report.sh
node scripts/generate-flow-gate-report.mjs \
  --coverage-report coverage/coverage-summary.json \
  --flow-specs "docs/specs/**/*.md" \
  --uat-signoffs ".release-readiness/*.md" \
  --output flow_gate_report.json
```

The `summary.status` field feeds into `release-quality-manifest.yaml` under `flow_gate_report.status`.

---

## Quick Reference Checklist

```
Flow: ___________________

□ Step 1 — Flow Identification
  □ Preconditions documented
  □ Ordered step sequence listed
  □ All decision points extracted
  □ All terminal states defined

□ Step 2 — Decision Table
  □ Decision table created
  □ Coverage strategy chosen (Each-Choice / Pairwise / All-Combinations)
  □ Critical flows (auth/payment/security) → All-Combinations

□ Step 3 — Journey Test Structure
  □ Happy path journey test (shared ctx, sequential steps)
  □ Each branch outcome has its own describe block
  □ Branch tests verify both response AND absence of side effects
  □ No beforeEach resetting ctx between steps
```
