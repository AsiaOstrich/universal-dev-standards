# AI Model Selection Strategy

> **Language**: English | [繁體中文](../locales/zh-TW/core/model-selection.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: AI-assisted development with multiple model tiers
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — subagent-driven-development (MIT)

---

## Purpose

Define a cost-effective strategy for selecting AI model tiers based on task complexity signals. Use the cheapest model that can handle the job, and escalate only when necessary.

定義基於任務複雜度的 AI 模型分級選擇策略。使用能勝任的最便宜模型，僅在必要時升級。

---

## Glossary

| Term | Definition |
|------|-----------|
| Model Tier | A classification level representing model capability and cost |
| Complexity Signal | Observable characteristics of a task that indicate required capability |
| Escalation | Upgrading to a higher-tier model after a lower tier fails |

---

## Core Principle — Cost Efficiency

> **Always start with the cheapest model tier that matches the task's complexity signals.**

始終使用與任務複雜度匹配的最便宜模型。

---

## Three-Tier Model Classification

### Tier 1: Fast（快速層）

**Purpose**: Mechanical implementation — single file, clear spec, no judgment needed.

機械性實作 — 單一檔案、明確規格、無需判斷。

**Complexity Signals**:
- Modifies a single file
- Specification is completely unambiguous
- No design judgment required
- Repetitive, pattern-based work

**Examples**:
- Update `package.json` version number
- Add a new export statement
- Fix a typo
- Rename a variable across a file

### Tier 2: Standard（標準層）

**Purpose**: Integration work — multiple files, requires judgment.

整合性實作 — 多檔案、需要判斷力。

**Complexity Signals**:
- Modifies 2–5 files
- Requires understanding inter-module relationships
- Needs some design judgment
- Cross-cutting but within a bounded context

**Examples**:
- Add an API endpoint (route + handler + test)
- Refactor a module's internal structure
- Implement a feature with database migration
- Write integration tests for a subsystem

### Tier 3: Capable（能力層）

**Purpose**: Architectural work — design, review, complex debugging.

架構性工作 — 設計、審查、複雜除錯。

**Complexity Signals**:
- Modifies 5+ files
- Requires architectural decisions
- Cross-module coordination
- Complex debugging or performance analysis
- Ambiguous requirements needing interpretation

**Examples**:
- Design a new subsystem architecture
- Review a large pull request
- Diagnose cross-service performance issues
- Refactor a major component with many dependents

---

## Selection Decision Flow

```
Analyze task complexity signals
  ├── Single file, clear spec, no judgment? → Tier 1 (Fast)
  ├── 2-5 files, some judgment needed?      → Tier 2 (Standard)
  └── 5+ files, architectural decisions?    → Tier 3 (Capable)
```

---

## Escalation Rules

When a model tier fails (returns `BLOCKED`), escalate to the next tier:

| Current Tier | On BLOCKED | Action |
|-------------|-----------|--------|
| Fast | → Standard | Re-dispatch with Standard tier |
| Standard | → Capable | Re-dispatch with Capable tier |
| Capable | → Human | Flag for human intervention |

### Escalation is Not Retry

Escalation means using a more capable model, not repeating the same action. The higher-tier model receives:
- The original task
- The lower-tier model's output and failure reason
- Additional context if available

升級不是重試。更高層級的模型會收到原始任務、低層級的輸出與失敗原因。

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| MS-001 | BLOCKED at Fast tier | Escalate to Standard | High |
| MS-002 | BLOCKED at Standard tier | Escalate to Capable | High |
| MS-003 | BLOCKED at Capable tier | Flag for human intervention | Critical |
| MS-004 | Task has ambiguous requirements | Start at Standard or higher | Medium |

---

## Cost Optimization Tips

1. **Batch simple tasks** — send multiple Fast-tier tasks in one session
2. **Pre-classify tasks** — use task metadata to auto-select tiers
3. **Track escalation rates** — high escalation from Fast → Standard may indicate poor task decomposition
4. **Review Capable usage** — ensure Capable-tier tasks genuinely need that level

---

## References

- **Superpowers**: [subagent-driven-development](https://github.com/obra/superpowers) (MIT)
- **Cost-Effective AI**: Principle of using the minimum capability needed

---

## LLM 能力管理（XSPEC-027）

> **Version**: 2.0.0 — 本節於 2026-04-13 新增，對應 XSPEC-027 Phase 1。

三層模型選擇策略處理「任務複雜度」維度；本節新增「模型能力維度」管理，用於多模型池環境。

### capability_dimensions — 能力維度分類

能力維度分為四大類，共 9 個子維度：

| 大類 | 子維度 | 說明 | 基準測試 |
|------|--------|------|---------|
| modality | vision | 圖片/截圖理解（UI 分析、圖表解讀） | internal-vision-bench |
| modality | audio | 語音理解能力 | future-audio-bench |
| modality | image_generation | 圖片生成能力 | provider-specific |
| reasoning | code_reasoning | 程式碼理解與生成品質 | humaneval-plus |
| reasoning | math_reasoning | 數學推理準確率 | gsm8k |
| reasoning | instruction_following | 複雜多步驟指令遵循率 | internal-instruction-bench |
| reasoning | long_context_quality | 長文件中間段資訊存取 | needle-in-haystack |
| output | structured_output | JSON/Schema 格式輸出成功率 | internal-json-bench |
| output | tool_use | Function Calling 正確率 | internal-tool-bench |
| language | multilingual_zh_tw | 繁體中文品質（本系統優先語言） | internal-zh-tw-bench |

**評分量表（1–5）**：

| 分數 | 意義 |
|------|------|
| 5 | 生產就緒 — 高準確率，可直接使用 |
| 4 | 良好 — 偶有遺漏，可接受 |
| 3 | 基本可用 — 需人工補充 |
| 2 | 部分可用 — 僅供參考 |
| 1 | 不可靠 — 不建議使用 |

### capability_registry — 模型能力登記表

各子專案依實際測試，在自己的 `capability_registry` 中維護每個模型的能力分數。

**格式**：
```yaml
- model_id: "provider/model-name"
  version_pinned: "版本鎖定識別（SHA、日期戳或 model_version）"
  pin_date: "YYYY-MM-DD"
  eol_date: "YYYY-MM-DD"  # 可選
  capabilities:
    "modality.vision": 4
    "reasoning.instruction_following": 5
    "output.structured_output": 5
```

**版本鎖定（DEC-031 D1）**：必須記錄 `version_pinned` 與 `pin_date`，避免模型靜默升級造成能力變化。

### routing_rules — 路由策略決策樹

根據模型能力分數，路由規則分三態：

```
任務需要 capability X
  ├── 模型得分 ≥ min_score            → SUPPORTED  — 正常執行
  ├── 模型得分 2–3（低於 min_score）  → DEGRADED   — 降級執行，產出標記 [DEGRADED]
  └── 模型得分 ≤ 1 或未登記           → UNSUPPORTED — 替代流程或提示用戶
```

**降智偵測（DEC-033）額外規則**：

| 規則 | 條件 | 動作 |
|------|------|------|
| CAP-004 | 降智偵測觸發 moderate 信號 | 啟動金絲雀測試，記錄降智警告 |
| CAP-005 | 降智偵測觸發 critical 信號 | 自動切換備用模型，上報 P1 Issue |

**選擇策略**：`pareto_weighted` — 優先選擇在所需維度得分最高、成本最低的模型。

### 與三層分級的關係

- **三層分級（Tier 1/2/3）** — 基於任務複雜度（How hard is the task?）
- **能力維度（XSPEC-027）** — 基於模型能力（Can this model do it?）

兩者並用：先依複雜度選擇 Tier，再依能力維度確認選中的模型支援任務所需的 capability。
