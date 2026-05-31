# Knowledge Graph — Detailed Guide | 詳細指南

Companion to [SKILL.md](SKILL.md). Worked examples of both operating modes and the engine API.

[SKILL.md](SKILL.md) 的配套說明。兩種運作模式的範例與引擎 API。

---

## 1. Service Mode (graph engine) | 服務模式

When an EngramGraph-compatible engine is reachable, a single query returns the full chain.

### Impact analysis | 影響分析

```bash
curl -s -X POST "$ENGRAM_URL/graph/impact-analysis" \
  -H 'content-type: application/json' \
  -d '{"nodeId":"XSPEC-205","maxHops":3}'
# => { "nodeId": "XSPEC-205",
#      "decisions": [ {"id":"DEC-062","title":"...","via":"direct"},
#                     {"id":"DEC-069","title":"...","via":"supersedes"} ] }
```

`via: "direct"` means the decision IMPACTS the spec directly; `via: "supersedes"` means it reaches the spec through a SUPERSEDES chain (≤ `maxHops`).

### Confidence feedback (SAGE) | 信心回饋

```bash
curl -s -X POST "$ENGRAM_URL/graph/ingest" \
  -H 'content-type: application/json' \
  -d '{"type":"test_fail","functionId":"src/a.ts#execute"}'
```

Lowers the node's confidence; reads then surface higher-confidence nodes first.

---

## 2. Degraded Mode (Markdown only) | 降級模式

No engine required. Reconstruct the chain by reading files:

1. Read the target document (e.g. `XSPEC-205`).
2. Collect ids from its front-matter (`impacts`, `impacted_by`, `supersedes`, `related`) and inline `[[ref]]` links.
3. For each id, read that document and repeat up to the desired hop depth.
4. Classify each id by prefix (`XSPEC-*`/`SPEC-*` → Spec; `DEC-*`/`ADR-*` → Decision) and report the edges.

```bash
# find the documents
grep -rl "id: XSPEC-205" --include='*.md' .
# discover outbound references
grep -nE "(impacts|impacted_by|supersedes|related):|\[\[(XSPEC|DEC|ADR)-" path/to/XSPEC-205.md
```

Degraded mode is always correct but bounded by how many files you read; cross-domain code links (function → spec) are usually only available in service mode.

---

## 3. Equivalence | 等價性

Both modes produce the **same answer shape** (a list of connected Specs/Decisions with edge types). Service mode is faster and more complete (it can include code→spec→decision hops); degraded mode is the universal fallback. Always tell the user which mode produced the answer.

兩種模式產生**相同形狀的答案**。服務模式更快更完整；降級模式為通用後備。務必告知使用者答案來自哪種模式。

---

## Reference | 參考

- [core/knowledge-graph-memory.md](../../core/knowledge-graph-memory.md)
- [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)
