---
name: contract-test
scope: universal
description: |
  [UDS] Guide contract testing strategy for APIs and microservices.
  Use when: API contracts, microservices, consumer-driven testing, provider verification.
  Keywords: contract test, Pact, OpenAPI, consumer-driven, provider, 合約測試, API 合約.
allowed-tools: Read, Write, Glob, Grep
argument-hint: "[verify | consumer | provider | 策略選擇]"
---

# Contract Test Assistant | 合約測試助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/contract-test-assistant/SKILL.md)

Guide contract testing strategy selection, setup, and verification for APIs and microservices.

引導 API 和微服務的合約測試策略選擇、設定和驗證。

## What is Contract Testing? | 什麼是合約測試？

Contract testing verifies that services can communicate correctly by testing the agreements (contracts) between consumers and providers — without requiring all services to be running.

合約測試透過測試消費者和提供者之間的協議（合約）來驗證服務間的通訊正確性，不需要所有服務同時運行。

## Strategy Selection | 策略選擇

| Strategy | Best For | Tool | 適用場景 |
|----------|---------|------|---------|
| **Consumer-Driven** | Internal microservices, team owns both sides | Pact | 內部微服務，團隊同時擁有兩端 |
| **Provider-Driven** | Public APIs, OpenAPI-first design | OpenAPI + Prism | 公開 API，OpenAPI 優先設計 |
| **Bi-Directional** | Mixed ownership, gradual adoption | Pact + OpenAPI | 混合所有權，漸進採用 |

## Workflow | 工作流程

```
ASSESS ──► CHOOSE ──► DEFINE ──► IMPLEMENT ──► VERIFY
  評估架構    選擇策略    定義合約     實作測試      驗證合約
```

### 1. ASSESS — Evaluate Architecture | 評估架構
- How many services communicate?
- Who owns consumer vs provider?
- 有多少服務互相通訊？誰擁有消費者/提供者？

### 2. CHOOSE — Select Strategy | 選擇策略
- Consumer-Driven (Pact) vs Provider-Driven (OpenAPI)
- 消費者驅動 (Pact) vs 提供者驅動 (OpenAPI)

### 3. DEFINE — Create Contract | 定義合約
- Write consumer expectations or OpenAPI spec
- 撰寫消費者期望或 OpenAPI 規格

### 4. IMPLEMENT — Write Tests | 實作測試
- Consumer tests generate contracts
- Provider tests verify against contracts
- 消費者測試產生合約；提供者測試驗證合約

### 5. VERIFY — Run Verification | 驗證
- CI pipeline verifies contracts on every PR
- CI 管線在每個 PR 上驗證合約

## Commands | 指令

| Command | Action | 說明 |
|---------|--------|------|
| `/contract-test` | Interactive strategy selection | 互動式策略選擇 |
| `/contract-test consumer` | Guide consumer test setup | 引導消費者測試設定 |
| `/contract-test provider` | Guide provider test setup | 引導提供者測試設定 |
| `/contract-test verify` | Check contract coverage | 檢查合約覆蓋率 |

## Contract Coverage Report | 合約覆蓋率報告

```markdown
## Contract Coverage Report

| Consumer | Provider | Endpoint | Status |
|----------|----------|----------|--------|
| web-app | user-api | GET /users/:id | ✅ Verified |
| web-app | user-api | POST /users | ✅ Verified |
| mobile-app | auth-api | POST /login | ⚠️ Consumer only |
| admin-ui | report-api | GET /reports | ❌ No contract |

**Coverage**: 50% (2/4 endpoints verified both sides)
```

## Integration | 與其他技能的整合

| Skill | Integration | 整合方式 |
|-------|-------------|---------|
| `/api-design` | Define API contracts during design | 設計時定義 API 合約 |
| `/ci-cd` | Add contract verification to pipeline | 管線中加入合約驗證 |
| `/testing` | Contract tests as part of test strategy | 合約測試作為測試策略一部分 |

## Next Steps Guidance | 下一步引導

After `/contract-test` completes:

> **合約測試引導完成。建議下一步：**
> - 執行 `/ci-cd` 將合約驗證加入 CI 管線
> - 執行 `/api-design` 完善 API 設計
> - 執行 `/testing` 整合到整體測試策略

## Reference | 參考

- Detailed guide: [contract-testing.md](../../options/testing/contract-testing.md)
- Related: [api-design-assistant](../api-design-assistant/SKILL.md)

## AI Agent Behavior | AI 代理行為

When `/contract-test` is invoked:
1. **Assess** — Ask about architecture (monolith, microservices, number of APIs)
2. **Recommend** — Suggest strategy based on architecture
3. **Guide** — Walk through setup for chosen strategy
4. **Generate** — Create example contract test files
5. **Verify** — If `verify` subcommand, scan for contracts and report coverage
