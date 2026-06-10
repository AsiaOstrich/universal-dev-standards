---
source: ../../../core/chaos-injection-tests.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 4aaf84b1c84c
status: current
---

# 混沌注入测试

> **语言**: [English](../../../core/chaos-injection-tests.md) | [繁體中文](../../zh-TW/core/chaos-injection-tests.md) | 简体中文

## 概述

混沌注入测试使失败场景可机器验证。`chaos-engineering-standards` 描述实验方法论，而本标准定义 AI Agent 系统所需的具体测试——LLM 超时、数据库断连、策略引擎失效，以及爆炸半径控制。

## 为什么 AI Agent 系统需要专属的混沌测试

传统软件只有少数外部依赖。AI Agent 系统使这一情况更加复杂：

- **LLM API**：高延迟、速率限制、非确定性失败
- **策略引擎**（OPA/Rego）：安全关键——必须在失败时关闭
- **向量存储 / 知识库**：检索失败影响输出质量
- **数据库**：操作中途断连可能损坏多步骤的 Agent 状态
- **对等 Agent**：在多 Agent 管线中，一个 Agent 崩溃不得级联影响其他 Agent

上述每种失败模式都需要专属测试，而不仅仅是操作手册中的一句说明。

## 需求摘要

| ID | 规则 | 依据 |
|----|------|-----------|
| REQ-CIT-001 | 每个外部依赖需要一个失败隔离测试 | 单一依赖失败不得级联 |
| REQ-CIT-002 | LLM 客户端必须处理超时和速率限制 | LLM 是最高风险依赖 |
| REQ-CIT-003 | 策略引擎不可用时必须默认为 DENY | 开放式失败是安全漏洞 |
| REQ-CIT-004 | 操作中途数据库断连必须干净回滚 | 部分写入会造成数据损坏 |
| REQ-CIT-005 | Agent 崩溃不得传播至不相关的 Agent | Agent 间爆炸半径必须有界 |

## 注入模式

### LLM 超时

```typescript
it('surfaces TimeoutError when LLM does not respond in time', async () => {
  const slowLlm = { complete: () => new Promise(() => {}) } // never resolves
  const agent = new PlannerAgent({ llm: slowLlm, timeoutMs: 100 })
  await expect(agent.run(input)).rejects.toThrow('TimeoutError')
})
```

### LLM 速率限制（429）

```typescript
it('retries with backoff on 429 and eventually surfaces RateLimitError', async () => {
  const rateLimitedLlm = mockLlm({ status: 429, retryAfter: 1 })
  const agent = new PlannerAgent({ llm: rateLimitedLlm })
  await expect(agent.run(input)).rejects.toThrow('RateLimitError')
  expect(rateLimitedLlm.callCount).toBeLessThanOrEqual(3) // respects retry policy
})
```

### 策略引擎停机（失败关闭）

```typescript
it('returns DENY when OPA sidecar is unavailable', async () => {
  const downOpa = { query: () => Promise.reject(new Error('ECONNREFUSED')) }
  const guardian = new GuardianAgent({ opa: downOpa })
  const result = await guardian.review(reviewable)
  expect(result.decision).toBe('DENY')
  expect(result.reason).toMatch(/policy engine unavailable/)
})
```

### 数据库断连

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

### Agent 崩溃控制

```typescript
it('pipeline continues when one agent throws', async () => {
  const crashingAgent = { run: () => { throw new Error('agent crash') } }
  const pipeline = new Pipeline({ agents: { planner: crashingAgent, builder: realBuilder } })
  
  const result = await pipeline.run(input, { skipFailedAgents: true })
  expect(result.completedAgents).toContain('builder')
  expect(result.failedAgents).toContain('planner')
})
```

## 安全规则

1. 绝对不要对生产环境或共享的测试数据库执行混沌测试
2. 在 `afterEach` 或 `finally` 块中始终清理注入的故障
3. 为混沌测试加上标签（`@chaos`），以在开发工作流程的快速单元测试运行中排除
4. 混沌测试可在 CI 的专属任务中运行，不纳入标准单元测试矩阵

## 反模式

- **在主处理器中捕获并忽略所有错误** — 这会对断言隐藏混沌失败
- **断连后不验证数据库状态** — 仅断言错误被抛出是不够的；必须断言没有写入部分数据
- **开放式策略引擎处理** — 策略路径中的任何模糊情况都必须解析为 DENY，而非 ALLOW

## 另请参阅

- `chaos-engineering-standards.ai.yaml` — 实验方法论与 SLO 集成
- `testing.ai.yaml` — 通用测试结构
- `secure-op.ai.yaml` — AI Agent 的失败关闭原则
- `security-standards.ai.yaml` — 安全不变量


**Scope**: universal
