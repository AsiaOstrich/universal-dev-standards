---
source: ../../../core/llm-output-validation.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 8b7fc8543760
status: current
---

# LLM 输出验证标准

> **语言**: [English](../../../core/llm-output-validation.md) | [繁體中文](../../zh-TW/core/llm-output-validation.md) | 简体中文

> 标准 ID：`llm-output-validation`
> 版本：v1.0.0
> 最后更新：2026-05-05

---

## 为什么需要 LLM 输出验证？

LLM 输出具有**不确定性**：同一个 prompt 在不同时间、不同模型版本下可能产生格式不一致的输出。如果不加以验证，这些输出可能在下游管线中造成静默失败（silent failure）——不是报错，而是用了一个错误的默认值或 `undefined`。

LLM 输出验证包含三个层次：

| 层次 | 问题 | 工具 |
|------|------|------|
| 结构验证 | 输出格式是否正确？ | JSON Schema、Zod、Pydantic |
| 语义验证 | 声称的事实是否有依据？ | NLI probe、Grounding check |
| 行为验证 | Agent 是否正确拒绝越界请求？ | 红队语料库、拒绝评估 |

---

## 一、Schema Contract Test（结构验证）

### 核心概念

每个 AI Agent 应声明一份 `output-schema.json`（JSON Schema 格式），并提供对应的 contract test。

**Contract test 的目的**：
- 确认 schema 本身是合法的 JSON Schema
- 确认 valid fixtures 通过验证
- 确认 invalid fixtures（缺少必填字段、类型错误、enum 违规）被拒绝

### 推荐目录结构

```
agents/<agent-name>/
  output-schema.json       ← JSON Schema 定義
  __tests__/
    contract.test.ts       ← Contract test suite
  __fixtures__/
    valid.json             ← 真實 LLM 輸出 golden fixture
    invalid-missing-id.json ← 缺少必填欄位的 fixture
```

### TypeScript 示例（使用 Ajv）

```typescript
import Ajv from "ajv"
import schema from "../output-schema.json"
import validFixture from "../__fixtures__/valid.json"

const ajv = new Ajv({ strict: false })
const validate = ajv.compile(schema)

// 測試 1：Schema 本身是合法的 JSON Schema
it("schema is valid JSON Schema", () => {
  expect(ajv.validateSchema(schema)).toBe(true)
})

// 測試 2：Valid fixture 通過驗證
it("valid fixture passes schema", () => {
  expect(validate(validFixture)).toBe(true)
})

// 測試 3：空 object 被拒絕
it("empty object is rejected", () => {
  expect(validate({})).toBe(false)
})

// 測試 4：缺少 source_agent 被拒絕
it("object missing source_agent is rejected", () => {
  const { source_agent, ...without } = validFixture
  expect(validate(without)).toBe(false)
})
```

### Python 示例（使用 Pydantic）

```python
from pydantic import ValidationError
from your_module import AgentOutput

# 測試 valid fixture
valid_data = { "version": "1.0.0", "source_agent": "planner", ... }
output = AgentOutput(**valid_data)  # 不拋出 exception

# 測試 invalid fixture
try:
    AgentOutput(version="bad-format", source_agent="planner")
    assert False, "Should have raised"
except ValidationError:
    pass  # 預期行為
```

---

## 二、幻觉检测（Semantic Validation）

### 什么是幻觉？

LLM 产生「听起来正确但实际上没有依据」的内容。例如：
- 虚构的 API 文档 URL
- 不存在的数据库字段名称
- 未在 context 中出现的 dependency 版本

### 检测策略

| 策略 | 适用场景 | 自动化程度 |
|------|---------|-----------|
| **Schema 结构化输出** | Agent 输出 JSON，enum 限制可能值 | 高（自动） |
| **Grounding Check** | RAG 系统，回答需引用 context | 中（需 NLI 模型） |
| **置信度标记** | Agent 在输出中包含 `confidence` 分数 | 中（需 prompt 设计） |
| **红队语料库** | 主动测试越界请求的拒绝行为 | 高（自动） |

### 幻觉率目标

| Agent 类型 | Schema 合规率 | 事实幻觉率 |
|-----------|-------------|----------|
| 结构化 JSON Agent | ≥ 99% | ≤ 5% |
| RAG Agent | ≥ 95% | ≤ 5% |
| 对话 Agent | ≥ 90% | ≤ 10% |

---

## 三、Prompt 回归测试

### 何时需要跑 Prompt 回归测试？

- 修改任何 `agents/*/prompt.md`
- 模型版本升级（相同 prompt，不同 model）
- Schema 新增 required field

### 回归测试流程

```bash
# 1. 修改前：用 temperature=0 記錄 golden output
ai-agent run planner --input fixtures/planner-input.json --temp 0 > golden.json

# 2. 修改後：重跑並比對
ai-agent run planner --input fixtures/planner-input.json --temp 0 > after.json

# 3. 用 contract test 驗證 after.json 仍符合 schema
npx vitest run agents/__tests__/contract.test.ts
```

---

## 四、质量门禁（Quality Gates）

| 门禁 | 阈值 | 强制程度 |
|------|------|---------|
| Schema 合规（CI） | 100% | Block merge |
| 空 object 拒绝（CI）| 100% | Block merge |
| Prompt 修改后回归（CI）| schema 合规维持 | Block merge |
| 幻觉率（pre-release）| ≤ 5% | Advisory |

---

## 五、工具推荐

| 工具 | 语言 | 用途 |
|------|------|------|
| [Ajv](https://ajv.js.org/) | TypeScript/JS | JSON Schema contract test |
| [Zod](https://zod.dev/) | TypeScript | Runtime type validation |
| [Pydantic](https://docs.pydantic.dev/) | Python | Schema + type validation |
| [DeepEval](https://deepeval.com/) | Python | LLM 幻觉率、faithfulness 评分 |
| [Ragas](https://docs.ragas.io/) | Python | RAG grounded answer rate |

---

## 参考标准

- NIST AI RMF (AI 100-1, 2023) — AI 风险管理框架
- OWASP Top 10 for LLM Applications v1.1 — LLM01: Prompt Injection
- ISO/IEC 42001:2023 — AI 管理体系
- [UDS `security-testing.ai.yaml`](../../../core/security-testing.md) — SAST + DAST 集成
- [UDS `adversarial-test.ai.yaml`](../../../core/adversarial-test.md) — Prompt injection 红队标准


**Scope**: universal
