---
name: knowledge-graph
scope: partial
description: "[UDS] Trace spec/decision/code impact chains via a knowledge graph (engine or Markdown fallback)"
allowed-tools: Read, Glob, Grep, Bash(curl:*)
argument-hint: "[artifact id, e.g. XSPEC-205 | 產物 id]"
---

# Knowledge Graph | 知識圖

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/knowledge-graph/SKILL.md)

Answer structural questions across specs, decisions, and code — *"what is the full impact chain of XSPEC-205?"* — using the [Knowledge Graph Memory](../../core/knowledge-graph-memory.md) relationship schema. Works with or without a graph engine.

回答橫跨規格、決策與程式碼的結構性問題——*「XSPEC-205 的完整影響鏈是什麼？」*——依據[知識圖記憶標準](../../core/knowledge-graph-memory.md)的關係 schema。有無圖引擎皆可運作。

> **Implements**: XSPEC-237 Phase 5 — knowledge-graph skill (EngramGraph opt-in)

## Mode Selection | 模式選擇

Detect which mode to use **before** answering:

| Condition | Mode |
|-----------|------|
| `ENGRAM_URL` set, or a local graph engine responds on `/health` | Service mode (engine) |
| Otherwise | Degraded mode (Markdown) |

## Workflow | 工作流程

1. **Resolve the target** — normalise the argument to a canonical id (`XSPEC-205`, `DEC-062`, a function name).
2. **Choose mode** — probe for a graph engine (service) else fall back (degraded).
3. **Service mode (AC-5b)** — issue a single multi-hop query and present the returned chain, including cross-domain links (code → spec → decision):
   ```bash
   curl -s -X POST "$ENGRAM_URL/graph/impact-analysis" \
     -H 'content-type: application/json' \
     -d '{"nodeId":"XSPEC-205","maxHops":3}'
   ```
4. **Degraded mode (AC-5a)** — with no engine, read the target document, follow its `impacts`/`impacted_by`/`supersedes`/`related` front-matter and inline `[[ref]]` links by reading the linked files, and assemble the chain manually (bounded by reading depth).
5. **Present the chain** — list the connected Specs and Decisions, the edge type for each hop, and (if present) each node's `confidence`, highest first.
6. **State the mode used** — always say whether the answer came from the engine or Markdown fallback, so completeness is clear.

## Relationship Schema | 關係 schema

See [knowledge-graph-memory](../../core/knowledge-graph-memory.md). Front-matter fields: `related`, `impacts`, `impacted_by`, `supersedes`, `implements`. Edge derivation: Decision `impacts` Spec → IMPACTS; Decision `supersedes` Decision → SUPERSEDES.

關係欄位與邊推導見[知識圖記憶標準](../../core/knowledge-graph-memory.md)。

## Next Steps Guidance | 下一步引導

- If degraded mode hit a reading-depth limit, tell the user a graph engine (e.g. EngramGraph) would give a complete chain, and how to set `ENGRAM_URL`.
- If a referenced id was not found, surface it as a dangling reference to fix.
- Offer to add missing `impacts`/`impacted_by` front-matter to the documents you traversed.

## Reference | 參考

- Standard: [core/knowledge-graph-memory.md](../../core/knowledge-graph-memory.md)
- Engine (opt-in): [EngramGraph](https://github.com/AsiaOstrich/EngramGraph) — `engramgraph`
- Detailed guide: [guide.md](guide.md)
