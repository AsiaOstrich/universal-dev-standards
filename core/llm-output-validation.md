# LLM 輸出驗證標準

> 標準 ID：`llm-output-validation`
> 版本：v1.0.0
> 最後更新：2026-05-05

---

## 為什麼需要 LLM 輸出驗證？

LLM 輸出具有**不確定性**：同一個 prompt 在不同時間、不同模型版本下可能產生格式不一致的輸出。如果不加以驗證，這些輸出可能在下游管線中造成靜默失敗（silent failure）——不是報錯，而是用了一個錯誤的預設值或 `undefined`。

LLM 輸出驗證包含三個層次：

| 層次 | 問題 | 工具 |
|------|------|------|
| 結構驗證 | 輸出格式是否正確？ | JSON Schema、Zod、Pydantic |
| 語意驗證 | 宣稱的事實是否有根據？ | NLI probe、Grounding check |
| 行為驗證 | Agent 是否正確拒絕越界請求？ | 紅隊語料庫、拒絕評估 |

---

## 一、Schema Contract Test（結構驗證）

### 核心概念

每個 AI Agent 應宣告一份 `output-schema.json`（JSON Schema 格式），並提供對應的 contract test。

**Contract test 的目的**：
- 確認 schema 本身是合法的 JSON Schema
- 確認 valid fixtures 通過驗證
- 確認 invalid fixtures（缺少必填欄位、型別錯誤、enum 違規）被拒絕

### 推薦目錄結構

```
agents/<agent-name>/
  output-schema.json       ← JSON Schema 定義
  __tests__/
    contract.test.ts       ← Contract test suite
  __fixtures__/
    valid.json             ← 真實 LLM 輸出 golden fixture
    invalid-missing-id.json ← 缺少必填欄位的 fixture
```

### TypeScript 範例（使用 Ajv）

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

### Python 範例（使用 Pydantic）

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

## 二、幻覺偵測（Semantic Validation）

### 什麼是幻覺？

LLM 產生「聽起來正確但實際上沒有根據」的內容。例如：
- 虛構的 API 文件 URL
- 不存在的資料庫欄位名稱
- 未在 context 中出現的 dependency 版本

### 偵測策略

| 策略 | 適用場景 | 自動化程度 |
|------|---------|-----------|
| **Schema 結構化輸出** | Agent 輸出 JSON，enum 限制可能值 | 高（自動） |
| **Grounding Check** | RAG 系統，回答需引用 context | 中（需 NLI 模型） |
| **信心度標記** | Agent 在輸出中包含 `confidence` 分數 | 中（需 prompt 設計） |
| **紅隊語料庫** | 主動測試越界請求的拒絕行為 | 高（自動） |

### 幻覺率目標

| Agent 類型 | Schema 合規率 | 事實幻覺率 |
|-----------|-------------|----------|
| 結構化 JSON Agent | ≥ 99% | ≤ 5% |
| RAG Agent | ≥ 95% | ≤ 5% |
| 對話 Agent | ≥ 90% | ≤ 10% |

---

## 三、Prompt 回歸測試

### 何時需要跑 Prompt 回歸測試？

- 修改任何 `agents/*/prompt.md`
- 模型版本升級（相同 prompt，不同 model）
- Schema 新增 required field

### 回歸測試流程

```bash
# 1. 修改前：用 temperature=0 記錄 golden output
vibeops run planner --input fixtures/planner-input.json --temp 0 > golden.json

# 2. 修改後：重跑並比對
vibeops run planner --input fixtures/planner-input.json --temp 0 > after.json

# 3. 用 contract test 驗證 after.json 仍符合 schema
npx vitest run agents/__tests__/contract.test.ts
```

---

## 四、品質閘門（Quality Gates）

| 閘門 | 閾值 | 強制程度 |
|------|------|---------|
| Schema 合規（CI） | 100% | Block merge |
| 空 object 拒絕（CI）| 100% | Block merge |
| Prompt 修改後回歸（CI）| schema 合規維持 | Block merge |
| 幻覺率（pre-release）| ≤ 5% | Advisory |

---

## 五、工具推薦

| 工具 | 語言 | 用途 |
|------|------|------|
| [Ajv](https://ajv.js.org/) | TypeScript/JS | JSON Schema contract test |
| [Zod](https://zod.dev/) | TypeScript | Runtime type validation |
| [Pydantic](https://docs.pydantic.dev/) | Python | Schema + type validation |
| [DeepEval](https://deepeval.com/) | Python | LLM 幻覺率、faithfulness 評分 |
| [Ragas](https://docs.ragas.io/) | Python | RAG grounded answer rate |

---

## 參考標準

- NIST AI RMF (AI 100-1, 2023) — AI 風險管理框架
- OWASP Top 10 for LLM Applications v1.1 — LLM01: Prompt Injection
- ISO/IEC 42001:2023 — AI 管理系統
- [UDS `security-testing.ai.yaml`](./security-testing.md) — SAST + DAST 整合
- [UDS `adversarial-test.ai.yaml`](./adversarial-test.md) — Prompt injection 紅隊標準
