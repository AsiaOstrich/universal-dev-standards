# Cross-Flow Regression

> **Language**: English | [繁體中文](../locales/zh-TW/core/cross-flow-regression.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-05
**Applicability**: All software projects with multiple user flows or business processes
**Scope**: universal
**Industry Standards**: ISTQB Advanced Test Analyst (Regression Test Strategy)
**References**: `core/flow-based-testing.md`, `core/testing-standards.md`

---

## Purpose

This standard defines cross-flow regression testing — verifying that changes to one flow do not break other flows, and that **combinations of flows** behave correctly when executed in sequence.

### Boundary with `flow-based-testing.md`

| Standard | Scope | What It Catches |
|----------|-------|----------------|
| `flow-based-testing.md` (Multi-Gate Model) | Single flow: Decision Points, Terminal States, Decision Table | Intra-flow branch coverage gaps |
| **This standard** | Multiple flows: interaction, shared state, sequential composition | Inter-flow contamination, accumulated-state bugs, regression across flows |

These are complementary, not overlapping. A project needs both.

---

## Why Cross-Flow Bugs Are Distinct

Intra-flow testing (Multi-Gate) proves that "Login" handles all 7 terminal states. But it cannot detect:

- **State contamination**: after a failed "Create Order" (FAIL_QUOTA_EXCEEDED), the quota counter is corrupted → next "Create Order" attempt fails even after quota resets
- **Shared resource conflicts**: "Report Generation" and "Data Export" running concurrently corrupt a shared temp directory
- **Sequential dependency**: "Cancel Subscription" succeeds, but the subsequent "Reactivate" flow assumes subscription still exists → NullPointerException

---

## Cross-Flow Test Suite Definition

### Tier-1: Critical User Journeys (CUJ)

Critical User Journeys are end-to-end sequences spanning ≥ 2 flows that represent core business value paths. Every release must include a CUJ regression suite.

**CUJ identification**:
1. List all flows (from requirement-template §2.4)
2. Identify pairs/triples that share state or are commonly executed in sequence
3. Tag business-critical combinations (purchase, onboarding, authentication + downstream)

**CUJ Coverage Requirement**:

| Metric | Tier-2 Threshold (default) | Tier-1 Critical Path |
|--------|--------------------------|---------------------|
| CUJ pass rate | ≥ 95% | 100% |
| Business-critical flow combos | 100% | 100% |

### Tier-2: Regression on Flow Change

When any flow's §2.4 (Decision Points, Terminal States) is modified, the full CUJ suite must re-run — not just the tests for the changed flow. The triggering logic:

```bash
# In CI: detect flow spec changes
changed_flows=$(git diff origin/main... --name-only | grep -E "requirement-template|SPEC.*\.md")
if [ -n "$changed_flows" ]; then
  npm run test:cross-flow-regression
fi
```

### Tier-3: Concurrency and Shared Resource Tests

For projects with concurrent user operations:
- Two users executing the same flow simultaneously
- Flow A and Flow B sharing a write resource
- Long-running Flow (async) interacting with a short Flow result

---

## Test Structure

Cross-flow regression tests use **sequential state threading** across flows (extending the `ctx` pattern from `flow-based-testing.md`):

```typescript
describe("CUJ: Register → Verify Email → Create First Order", () => {
  const ctx: {
    userId?: string
    token?: string
    orderId?: string
  } = {}

  // Flow 1: Register
  it("Flow-1 Step 1: Register new user", async () => {
    ctx.userId = await registerUser({ email: testEmail, plan: "trial" })
    expect(ctx.userId).toBeDefined()
  })

  // Flow 2: Email Verification (depends on Flow 1 output)
  it("Flow-2 Step 1: Verify email token", async () => {
    const token = await getEmailToken(ctx.userId!)
    ctx.token = await verifyEmail(token)
    expect(ctx.token).toBeDefined()
  })

  // Flow 3: Create Order (depends on Flow 2 auth token)
  it("Flow-3 Step 1: Create first order", async () => {
    ctx.orderId = await createOrder(ctx.token!, orderPayload)
    expect(ctx.orderId).toMatch(/^ord-/)
  })

  // Cross-flow verification: order state reflects trial plan limits
  it("Cross-flow: Trial plan quota enforced on first order", async () => {
    const order = await getOrder(ctx.token!, ctx.orderId!)
    expect(order.quota_applied).toBe("trial")
  })
})
```

### Cross-Flow Failure Isolation

When a cross-flow test fails, the failure message must identify **which flow** introduced the state corruption:

```typescript
// BAD: generic assertion
expect(result).toBe("success")

// GOOD: includes flow context
expect(result).toBe("success")  // Flow-3 depends on Flow-2 token being valid
                                 // If this fails, check Flow-2 email verification output
```

---

## Release Gate Integration

Cross-flow regression is **Dimension 6** in `release-readiness-gate.md` (Tier-2).

### Trigger Conditions

| Trigger | Scope |
|---------|-------|
| Every release candidate | Full CUJ suite |
| PR modifying any flow §2.4 | Full CUJ suite (pre-merge) |
| Post-deploy to staging | Smoke subset of CUJ |
| Post-deploy to production | Critical path CUJ only (canary) |

### Evidence for Sign-off

```
| 6 | Cross-flow Regression | PASS | CUJ suite: 47/47 passed; 0 flow-interaction failures | QA Lead |
```

### WARN Threshold

- ≥ 95% CUJ pass rate but < 100% → WARN with specific failed CUJ documented and root-caused
- < 95% CUJ pass rate → FAIL (release blocked)
- Business-critical combo fails → FAIL regardless of overall rate

---

## Anti-Patterns

- **Running cross-flow tests only when CI is slow** — they must run on every release candidate by definition
- **Testing each flow in isolation and calling it "regression"** — flow isolation is covered by Multi-Gate; cross-flow must have inter-flow state dependencies
- **Reusing the same `ctx` object across unrelated `describe` blocks** — each CUJ needs a clean, isolated `ctx`; contamination between CUJs masks bugs
- **No flow attribution in failure messages** — cross-flow failures are hard to debug; always indicate which upstream flow produced the corrupted state
- **Treating CUJ failures as flaky** — cross-flow state bugs are deterministic; "flaky" cross-flow tests are almost always a symptom of shared state corruption

---

## Relationship to Other Standards

- **`flow-based-testing.md`** — intra-flow gate (prerequisite for cross-flow)
- **`testing-standards.md`** — regression layer in the testing pyramid
- **`release-readiness-gate.md`** — Dimension 6 (Tier-2)
- **`e2e-testing.md`** — CUJ tests typically run at E2E or System Test level

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | Initial release: CUJ definition, sequential state threading, release gate criteria, Tier-1/2/3 classification |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
