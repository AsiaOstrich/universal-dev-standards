# Chaos Injection Tests

## Overview

Chaos injection tests make failure scenarios machine-verifiable. Where `chaos-engineering-standards` describes the experiment methodology, this standard defines the specific tests required for AI agent systems — LLM timeouts, database disconnects, policy engine failures, and blast-radius containment.

## Why AI Agent Systems Need Dedicated Chaos Tests

Traditional software has a handful of external dependencies. AI agent systems compound this:

- **LLM API**: high latency, rate limits, non-deterministic failures
- **Policy engine** (OPA/Rego): security-critical — must fail closed
- **Vector store / knowledge base**: retrieval failures affect output quality
- **Database**: mid-operation disconnects can corrupt multi-step agent state
- **Peer agents**: in multi-agent pipelines, one agent crash must not cascade

Each of these failure modes needs a dedicated test, not just a comment in a runbook.

## Requirements Summary

| ID | Rule | Rationale |
|----|------|-----------|
| REQ-CIT-001 | Each external dependency needs a failure isolation test | Single dependency failure must not cascade |
| REQ-CIT-002 | LLM client must handle timeout and rate-limit | LLM is the highest-risk dependency |
| REQ-CIT-003 | Policy engine unavailability must default to DENY | Fail-open is a security vulnerability |
| REQ-CIT-004 | DB disconnect mid-operation must roll back cleanly | Partial writes cause data corruption |
| REQ-CIT-005 | Agent crash must not propagate to unrelated agents | Inter-agent blast radius must be bounded |

## Injection Patterns

### LLM Timeout

```typescript
it('surfaces TimeoutError when LLM does not respond in time', async () => {
  const slowLlm = { complete: () => new Promise(() => {}) } // never resolves
  const agent = new PlannerAgent({ llm: slowLlm, timeoutMs: 100 })
  await expect(agent.run(input)).rejects.toThrow('TimeoutError')
})
```

### LLM Rate Limit (429)

```typescript
it('retries with backoff on 429 and eventually surfaces RateLimitError', async () => {
  const rateLimitedLlm = mockLlm({ status: 429, retryAfter: 1 })
  const agent = new PlannerAgent({ llm: rateLimitedLlm })
  await expect(agent.run(input)).rejects.toThrow('RateLimitError')
  expect(rateLimitedLlm.callCount).toBeLessThanOrEqual(3) // respects retry policy
})
```

### Policy Engine Down (Fail-Closed)

```typescript
it('returns DENY when OPA sidecar is unavailable', async () => {
  const downOpa = { query: () => Promise.reject(new Error('ECONNREFUSED')) }
  const guardian = new GuardianAgent({ opa: downOpa })
  const result = await guardian.review(reviewable)
  expect(result.decision).toBe('DENY')
  expect(result.reason).toMatch(/policy engine unavailable/)
})
```

### Database Disconnect

```typescript
it('rolls back transaction on mid-operation DB disconnect', async () => {
  const db = createTestDb()
  await seedRows(db, [{ id: 1, name: 'alice' }])
  
  // Force disconnect after first write in the transaction
  let writeCount = 0
  const hookedDb = hookAfterWrite(db, () => {
    if (++writeCount === 1) db.close()
  })
  
  await expect(runner.executeWithDb(hookedDb, plan)).rejects.toThrow()
  
  const freshDb = createTestDb()
  const rows = freshDb.prepare('SELECT * FROM records').all()
  expect(rows).toHaveLength(1) // original row preserved, partial write rolled back
})
```

### Agent Crash Containment

```typescript
it('pipeline continues when one agent throws', async () => {
  const crashingAgent = { run: () => { throw new Error('agent crash') } }
  const pipeline = new Pipeline({ agents: { planner: crashingAgent, builder: realBuilder } })
  
  const result = await pipeline.run(input, { skipFailedAgents: true })
  expect(result.completedAgents).toContain('builder')
  expect(result.failedAgents).toContain('planner')
})
```

## Safety Rules

1. Never run chaos tests against production or shared staging databases
2. Always clean up injected faults in `afterEach` or `finally` blocks
3. Tag chaos tests (`@chaos`) to exclude from fast unit test runs in developer workflow
4. Chaos tests may run in CI on a dedicated job, not in the standard unit test matrix

## Anti-Patterns

- **Catching and ignoring all errors in the main handler** — this hides chaos failures from assertions
- **Not verifying database state after disconnect** — asserting the error is thrown is not enough; assert no partial data was written
- **Fail-open policy engine handling** — any ambiguity in the policy path must resolve to DENY, not ALLOW

## See Also

- `chaos-engineering-standards.ai.yaml` — experiment methodology and SLO integration
- `testing.ai.yaml` — general test structure
- `secure-op.ai.yaml` — Fail-Closed principle for AI agents
- `security-standards.ai.yaml` — security invariants


**Scope**: universal
