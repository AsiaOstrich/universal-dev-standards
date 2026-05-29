---
name: knowledge-graph
source: ../../../../skills/knowledge-graph/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-30
status: current
description: "[UDS] 透過知識圖追蹤規格／決策／程式碼的影響鏈（引擎或 Markdown 後備）"
---

# 知識圖

> **語言**: [English](../../../../skills/knowledge-graph/SKILL.md) | 繁體中文

依據[知識圖記憶標準](../../../../core/knowledge-graph-memory.md)的關係 schema，回答橫跨規格、決策與程式碼的結構性問題——*「XSPEC-205 的完整影響鏈是什麼？」*。有無圖引擎皆可運作。

> **Implements**: XSPEC-237 Phase 5 — knowledge-graph skill（CodeSage opt-in）

## 模式選擇

回答**前**先判斷使用哪種模式：

| 條件 | 模式 |
|------|------|
| 設定了 `CODESAGE_URL`，或本機圖引擎 `/health` 有回應 | 服務模式（引擎）|
| 否則 | 降級模式（Markdown）|

## 工作流程

1. **解析目標**——將參數正規化為標準 id（`XSPEC-205`、`DEC-062`、函式名）。
2. **選擇模式**——探測圖引擎（服務）否則後備（降級）。
3. **服務模式（AC-5b）**——送出單一多跳查詢，呈現回傳的鏈（含跨域連結 code → spec → decision）：
   ```bash
   curl -s -X POST "$CODESAGE_URL/graph/impact-analysis" \
     -H 'content-type: application/json' \
     -d '{"nodeId":"XSPEC-205","maxHops":3}'
   ```
4. **降級模式（AC-5a）**——無引擎時，讀取目標文件，沿其 `impacts`/`impacted_by`/`supersedes`/`related` front-matter 與內文 `[[ref]]` 連結讀取被連結檔案，手動組出鏈（受讀取深度限制）。
5. **呈現鏈**——列出相連的 Spec 與 Decision、每跳的邊型別、以及（若有）各節點的 `confidence`，高者在前。
6. **說明使用的模式**——務必告知答案來自引擎或 Markdown 後備，以明確完整度。

## 關係 schema

見[知識圖記憶標準](../../../../core/knowledge-graph-memory.md)。front-matter 欄位：`related`、`impacts`、`impacted_by`、`supersedes`、`implements`。

## 下一步引導

- 降級模式若觸及讀取深度上限，告知使用者圖引擎（如 CodeSage）可給出完整鏈，以及如何設定 `CODESAGE_URL`。
- 若參照的 id 找不到，標示為待修的懸空參照。
- 主動提議為遍歷過的文件補上缺漏的 `impacts`/`impacted_by` front-matter。

## 參考

- 標準：[core/knowledge-graph-memory.md](../../../../core/knowledge-graph-memory.md)
- 引擎（opt-in）：[CodeSage](https://github.com/AsiaOstrich/CodeSage) — `@asiaostrich/codesage`
- 詳細指南：[guide.md](guide.md)
