---
source: ../../../../skills/knowledge-graph/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 9c86b5a2a71d
status: current
---

# Knowledge Graph — 詳細指南

[SKILL.md](SKILL.md) 的配套說明。兩種運作模式的範例與引擎 API。

---

## 1. 服務模式（graph 引擎）

當有相容於 EngramGraph 的引擎可連線時，單次查詢即可回傳完整影響鏈。

### 影響分析

```bash
curl -s -X POST "$ENGRAM_URL/graph/impact-analysis" \
  -H 'content-type: application/json' \
  -d '{"nodeId":"XSPEC-205","maxHops":3}'
# => { "nodeId": "XSPEC-205",
#      "decisions": [ {"id":"DEC-062","title":"...","via":"direct"},
#                     {"id":"DEC-069","title":"...","via":"supersedes"} ] }
```

`via: "direct"` 表示該決策直接 IMPACTS 此 spec；`via: "supersedes"` 表示它透過 SUPERSEDES 影響鏈（≤ `maxHops`）連到此 spec。

### 信心回饋（SAGE）

```bash
curl -s -X POST "$ENGRAM_URL/graph/ingest" \
  -H 'content-type: application/json' \
  -d '{"type":"test_fail","functionId":"src/a.ts#execute"}'
```

降低該節點的信心值；之後讀取時會優先浮現信心較高的節點。

---

## 2. 降級模式（僅 Markdown）

不需要引擎。透過讀取檔案重建影響鏈：

1. 讀取目標文件（例如 `XSPEC-205`）。
2. 從其 front-matter（`impacts`、`impacted_by`、`supersedes`、`related`）與行內 `[[ref]]` 連結蒐集 id。
3. 對每個 id，讀取該文件並重複此過程，直到所需的跳數深度。
4. 依前綴分類每個 id（`XSPEC-*`/`SPEC-*` → Spec；`DEC-*`/`ADR-*` → Decision）並回報邊。

```bash
# find the documents
grep -rl "id: XSPEC-205" --include='*.md' .
# discover outbound references
grep -nE "(impacts|impacted_by|supersedes|related):|\[\[(XSPEC|DEC|ADR)-" path/to/XSPEC-205.md
```

降級模式永遠正確，但受限於你讀取了多少檔案；跨領域的程式碼連結（function → spec）通常只在服務模式中可用。

---

## 3. 等價性

兩種模式產生**相同形狀的答案**（一份相連的 Specs/Decisions 清單，附帶邊類型）。服務模式更快且更完整（可包含 code→spec→decision 的跳轉）；降級模式則是通用後備。務必告知使用者答案來自哪種模式。

---

## 參考

- [core/knowledge-graph-memory.md](../../core/knowledge-graph-memory.md)
- [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)
