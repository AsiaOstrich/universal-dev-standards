# Knowledge Graph Memory Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/knowledge-graph-memory.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-30
**Applicability**: Projects using AI assistants across code + specification/decision corpora
**Scope**: uds-specific

---

## Purpose

This standard defines a **relationship schema** so that specifications, decisions, and code can be traversed as a graph — answering questions like *"if I change `execute()`, which specs and decisions are affected?"*. It complements vector/semantic memory (which finds *similar* artifacts) with **structural traversal** (which finds *connected* artifacts).

The schema is engine-agnostic: it is expressed as plain Markdown front-matter that an AI assistant can read directly (degraded mode), and that an optional graph engine (e.g. [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)) can index for multi-hop queries (service mode).

---

## Quick Reference

### Relationship Front-Matter Schema

Add these optional fields to a spec/decision document's YAML front-matter:

| Field | Type | Direction | Meaning |
|-------|------|-----------|---------|
| `related` | list of ids | undirected | Loosely associated artifacts |
| `impacts` | list of spec ids | this → spec | This decision changes those specs |
| `impacted_by` | list of decision ids | decision → this | Those decisions change this spec |
| `supersedes` | list of decision ids | this → decision | This decision replaces those |
| `implements` | list of spec ids | code/spec → spec | This artifact realises those specs |

Ids are artifact identifiers (e.g. `XSPEC-205`, `DEC-062`, `ADR-001`). Inline `[[XSPEC-NNN]]` wiki-links in the body are an equivalent, lower-fidelity signal.

### Node Kinds

| Prefix | Node kind |
|--------|-----------|
| `XSPEC-*` / `SPEC-*` | Spec |
| `DEC-*` / `ADR-*` | Decision |
| function / class / module (from code) | Code node |

---

## 1. Schema

### 1.1 Front-Matter Example

```markdown
---
id: XSPEC-205
title: Agent/Role Spec SDD Variant
status: Implemented
impacted_by: [DEC-062]
related: [XSPEC-204]
---
```

```markdown
---
id: DEC-069
title: EngramGraph Architecture
date: 2026-05-27
supersedes: [DEC-057]
impacts: [XSPEC-237]
---
```

### 1.2 Edge Derivation

| Front-matter on doc | Derived edge |
|---------------------|--------------|
| Decision `impacts: [SPEC]` | `IMPACTS` (Decision → Spec) |
| Spec `impacted_by: [DEC]` | `IMPACTS` (Decision → Spec) |
| Decision `supersedes: [DEC]` | `SUPERSEDES` (Decision → Decision) |
| `[[XSPEC-NNN]]` link in a Decision body | `IMPACTS` (Decision → Spec) |

Edges are **idempotent**: declaring the same relationship from both ends (a decision's `impacts` and the spec's `impacted_by`) yields one edge, not two.

---

## 2. Two Operating Modes

A consumer of this standard MUST work in both modes:

### 2.1 Degraded Mode (no engine)

The AI assistant reads the target document, follows its front-matter / `[[ref]]` links by reading the linked files, and assembles the impact chain manually. Always available; bounded by how many files the assistant can read.

### 2.2 Service Mode (graph engine available)

The corpus is indexed into a graph engine; the assistant issues a single multi-hop query (e.g. `impact-analysis { nodeId, maxHops }`) and receives the full chain — including cross-domain links (code → spec → decision) that degraded mode would miss.

> A correct implementation produces the **same answer shape** in both modes; service mode is faster and more complete, not different in kind.

---

## 3. Confidence (optional)

Nodes MAY carry a `confidence` in `[0.1, 1.0]`. Feedback signals (test pass/fail, human correction, status changes) evolve confidence so that reads can surface the most-reinforced artifacts first. Confidence has a floor (never zero) so a run of failures cannot erase an important node. This is the basis of self-evolving graph memory (SAGE).

---

## 4. Rules

1. Relationship fields are **optional** and **additive** — absence never breaks tooling.
2. Reference ids that do not (yet) exist are allowed; they become stub nodes resolved when the target document appears.
3. Declare each relationship from the side that *owns* it (a decision owns `impacts`/`supersedes`; a spec owns `impacted_by`), but either side is accepted.
4. The graph engine is **opt-in**. Tools MUST degrade gracefully to Markdown reading when no engine is configured.
5. Vector/semantic memory is **complementary**, not replaced — use graph traversal for structure, vectors for similarity.

---

## Related Standards

- [Project Context Memory](project-context-memory.md) — per-project long-term facts
- [Developer Memory](developer-memory.md) — universal, transferable preferences
- [ADR Standards](adr-standards.md) — decision record format that feeds Decision nodes
