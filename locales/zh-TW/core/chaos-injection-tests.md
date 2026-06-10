---
source: ../../../core/chaos-injection-tests.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 4aaf84b1c84c
status: current
---

# 混沌注入測試

> **語言**: [English](../../../core/chaos-injection-tests.md) | 繁體中文 | [简体中文](../../zh-CN/core/chaos-injection-tests.md)

## 概述

混沌注入測試使失敗情境可機器驗證。`chaos-engineering-standards` 描述實驗方法論，而本標準定義 AI Agent 系統所需的具體測試——LLM 逾時、資料庫斷線、策略引擎失效，以及爆炸半徑控制。

## 為什麼 AI Agent 系統需要專屬的混沌測試

傳統軟體只有少數外部依賴。AI Agent 系統使這一情況更加複雜：

- **LLM API**：高延遲、速率限制、非確定性失敗
- **策略引擎**（OPA/Rego）：安全關鍵——必須在失敗時關閉
- **向量儲存 / 知識庫**：檢索失敗影響輸出品質
- **資料庫**：操作中途斷線可能損壞多步驟的 Agent 狀態
- **對等 Agent**：在多 Agent 管線中，一個 Agent 崩潰不得串聯影響其他 Agent

上述每種失敗模式都需要專屬測試，而不僅僅是操作手冊中的一句說明。

## 需求摘要

| ID | 規則 | 依據 |
|----|------|-----------|
| REQ-CIT-001 | 每個外部依賴需要一個失敗隔離測試 | 單一依賴失敗不得串聯 |
| REQ-CIT-002 | LLM 客戶端必須處理逾時和速率限制 | LLM 是最高風險依賴 |
| REQ-CIT-003 | 策略引擎不可用時必須預設為 DENY | 開放式失敗是安全漏洞 |
| REQ-CIT-004 | 操作中途資料庫斷線必須乾淨回滾 | 部分寫入會造成資料損毀 |
| REQ-CIT-005 | Agent 崩潰不得傳播至不相關的 Agent | Agent 間爆炸半徑必須有界 |

## 注入模式

### LLM 逾時

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

### 策略引擎停機（失敗關閉）

```typescript
it('returns DENY when OPA sidecar is unavailable', async () => {
  const downOpa = { query: () => Promise.reject(new Error('ECONNREFUSED')) }
  const guardian = new GuardianAgent({ opa: downOpa })
  const result = await guardian.review(reviewable)
  expect(result.decision).toBe('DENY')
  expect(result.reason).toMatch(/policy engine unavailable/)
})
```

### 資料庫斷線

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

### Agent 崩潰控制

```typescript
it('pipeline continues when one agent throws', async () => {
  const crashingAgent = { run: () => { throw new Error('agent crash') } }
  const pipeline = new Pipeline({ agents: { planner: crashingAgent, builder: realBuilder } })
  
  const result = await pipeline.run(input, { skipFailedAgents: true })
  expect(result.completedAgents).toContain('builder')
  expect(result.failedAgents).toContain('planner')
})
```

## 安全規則

1. 絕對不要對生產環境或共享的測試資料庫執行混沌測試
2. 在 `afterEach` 或 `finally` 區塊中始終清理注入的故障
3. 為混沌測試加上標籤（`@chaos`），以在開發工作流程的快速單元測試執行中排除
4. 混沌測試可在 CI 的專屬工作中執行，不納入標準單元測試矩陣

## 反模式

- **在主處理器中捕獲並忽略所有錯誤** — 這會對斷言隱藏混沌失敗
- **斷線後不驗證資料庫狀態** — 僅斷言錯誤被拋出是不夠的；必須斷言沒有寫入部分資料
- **開放式策略引擎處理** — 策略路徑中的任何模糊情況都必須解析為 DENY，而非 ALLOW

## 另請參閱

- `chaos-engineering-standards.ai.yaml` — 實驗方法論與 SLO 整合
- `testing.ai.yaml` — 通用測試結構
- `secure-op.ai.yaml` — AI Agent 的失敗關閉原則
- `security-standards.ai.yaml` — 安全不變量


**Scope**: universal
