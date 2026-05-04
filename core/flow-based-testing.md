# Flow-Based Testing

**Version**: 1.0.0
**Last Updated**: 2026-05-04
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
