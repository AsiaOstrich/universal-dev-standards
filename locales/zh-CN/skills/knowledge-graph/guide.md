---
source: ../../../../skills/knowledge-graph/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 9c86b5a2a71d
status: current
---

# Knowledge Graph — 详细指南

[SKILL.md](SKILL.md) 的配套说明。两种运行模式的范例以及引擎 API。

---

## 1. 服务模式（graph 引擎）

当存在可访问的 EngramGraph 兼容引擎时，单次查询即可返回完整的影响链。

### 影响分析

```bash
curl -s -X POST "$ENGRAM_URL/graph/impact-analysis" \
  -H 'content-type: application/json' \
  -d '{"nodeId":"XSPEC-205","maxHops":3}'
# => { "nodeId": "XSPEC-205",
#      "decisions": [ {"id":"DEC-062","title":"...","via":"direct"},
#                     {"id":"DEC-069","title":"...","via":"supersedes"} ] }
```

`via: "direct"` 表示该决策直接 IMPACTS（影响）此规格；`via: "supersedes"` 表示它通过 SUPERSEDES 链（≤ `maxHops`）触达此规格。

### 信心反馈（SAGE）

```bash
curl -s -X POST "$ENGRAM_URL/graph/ingest" \
  -H 'content-type: application/json' \
  -d '{"type":"test_fail","functionId":"src/a.ts#execute"}'
```

降低该节点的信心值；后续读取时会优先呈现信心更高的节点。

---

## 2. 降级模式（仅 Markdown）

无需引擎。通过读取文件来重建影响链：

1. 读取目标文档（例如 `XSPEC-205`）。
2. 从其 front-matter（`impacts`、`impacted_by`、`supersedes`、`related`）以及行内 `[[ref]]` 链接中收集 id。
3. 对每个 id，读取对应文档并重复此过程，直到达到所需的跳数深度。
4. 按前缀对每个 id 分类（`XSPEC-*`/`SPEC-*` → 规格；`DEC-*`/`ADR-*` → 决策）并报告边（edges）。

```bash
# find the documents
grep -rl "id: XSPEC-205" --include='*.md' .
# discover outbound references
grep -nE "(impacts|impacted_by|supersedes|related):|\[\[(XSPEC|DEC|ADR)-" path/to/XSPEC-205.md
```

降级模式始终是正确的，但受限于你读取的文件数量；跨域的代码链接（function → spec）通常只在服务模式下才可获得。

---

## 3. 等价性

两种模式产生**相同形状的答案**（一组带边类型、互相关联的规格／决策列表）。服务模式更快也更完整（它可以包含 code→spec→decision 的跳转）；降级模式是通用的后备方案。务必告知用户答案来自哪种模式。

---

## 参考

- [core/knowledge-graph-memory.md](../../core/knowledge-graph-memory.md)
- [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)
