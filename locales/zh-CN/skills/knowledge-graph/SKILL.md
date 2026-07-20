---
name: knowledge-graph
source: ../../../../skills/knowledge-graph/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-09
source_hash: 2a10faf2dd4c
status: current
description: |
  [UDS] 通过知识图追踪规格／决策／代码的影响链（引擎或 Markdown 后备）
---

# 知识图

> **语言**: [English](../../../../skills/knowledge-graph/SKILL.md) | 简体中文

依据[知识图记忆标准](../../../../core/knowledge-graph-memory.md)的关系 schema，回答横跨规格、决策与代码的结构性问题——*「XSPEC-205 的完整影响链是什么？」*。有无图引擎皆可运作。

> **Implements**: XSPEC-237 Phase 5 — knowledge-graph skill（EngramGraph opt-in）

## 模式选择

回答**前**先判断使用哪种模式：

| 条件 | 模式 |
|------|------|
| 设定了 `ENGRAM_URL`，或本机图引擎 `/health` 有响应 | 服务模式（引擎）|
| 否则 | 降级模式（Markdown）|

## 工作流程

1. **解析目标**——将参数规范化为标准 id（`XSPEC-205`、`DEC-062`、函数名）。
2. **选择模式**——探测图引擎（服务）否则后备（降级）。
3. **服务模式（AC-5b）**——发出单一多跳查询，呈现返回的链（含跨域链接 code → spec → decision）：
   ```bash
   curl -s -X POST "$ENGRAM_URL/graph/impact-analysis" \
     -H 'content-type: application/json' \
     -d '{"nodeId":"XSPEC-205","maxHops":3}'
   ```
4. **降级模式（AC-5a）**——无引擎时，读取目标文件，沿其 `impacts`/`impacted_by`/`supersedes`/`related` front-matter 与正文 `[[ref]]` 链接读取被链接文件，手动组出链（受读取深度限制）。
5. **呈现链**——列出相连的 Spec 与 Decision、每跳的边类型、以及（若有）各节点的 `confidence`，高者在前。
6. **说明使用的模式**——务必告知答案来自引擎或 Markdown 后备，以明确完整度。

## 关系 schema

见[知识图记忆标准](../../../../core/knowledge-graph-memory.md)。front-matter 字段：`related`、`impacts`、`impacted_by`、`supersedes`、`implements`。边推导：Decision `impacts` Spec → IMPACTS；Decision `supersedes` Decision → SUPERSEDES。

## 下一步引导

- 降级模式若触及读取深度上限，告知用户图引擎（如 EngramGraph）可给出完整链，以及如何设定 `ENGRAM_URL`。
- 若引用的 id 找不到，标示为待修的悬空引用。
- 主动提议为遍历过的文件补上缺漏的 `impacts`/`impacted_by` front-matter。

## 参考

- 标准：[core/knowledge-graph-memory.md](../../../../core/knowledge-graph-memory.md)
- 引擎（opt-in）：[EngramGraph](https://github.com/AsiaOstrich/EngramGraph) — `engramgraph`
- 详细指南：[guide.md](guide.md)
