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
