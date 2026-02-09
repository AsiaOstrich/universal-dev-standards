---
source: ../../../../skills/forward-derivation/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-02-10
status: current
description: |
  從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。
  使用時機：從規格推導測試、產生 BDD/TDD/ATDD 工件。
  關鍵字：derive, forward, BDD, TDD, ATDD, spec, 推演, 衍生, 規格, 場景。
---

# 正向推演

> **語言**: [English](../../../../skills/forward-derivation/SKILL.md) | 繁體中文

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## 子命令

| 子命令 | 說明 | 輸出 | Output |
|--------|------|------|--------|
| `all` | 生成 BDD + TDD（預設） | `.feature` + `.test.*` | `.feature` + `.test.*` |
| `bdd` | 僅生成 BDD 場景 | `.feature` | `.feature` |
| `tdd` | 僅生成 TDD 骨架 | `.test.*` | `.test.*` |
| `atdd` | 生成 ATDD 測試表格 | `.md`（Markdown 表格） | `.md` (Markdown tables) |

## 工作流程

1. **讀取規格** - 分析輸入的 `SPEC-XXX.md` 檔案
2. **擷取 AC** - 解析所有驗收條件
3. **生成工件** - 建立 BDD/TDD/ATDD 輸出
4. **驗證** - 確保 AC 與生成項目之間的 1:1 對應

## 防幻覺規則

| 規則 | 說明 | Rule | Description |
|------|------|------|-------------|
| **1:1 對應** | 每個 AC 對應一個測試/場景 | 1:1 Mapping | Every AC has exactly one test/scenario |
| **可追溯性** | 所有工件引用規格與 AC 編號 | Traceability | All artifacts reference Spec ID and AC ID |
| **禁止捏造** | 不新增規格外的場景 | No Invention | Do not add scenarios not in the spec |

## 產生工件標籤

| 標籤 | 含義 | Tag | Meaning |
|------|------|-----|---------|
| `[Source]` | 直接來自規格 | Source | Direct content from spec |
| `[Derived]` | 從來源轉換 | Derived | Transformed from source |
| `[Generated]` | AI 產生的結構 | Generated | AI-generated structure |
| `[TODO]` | 需人工實作 | TODO | Requires human implementation |

## 使用方式

- `/derive all specs/SPEC-001.md` - 推演 BDD + TDD
- `/derive bdd specs/SPEC-001.md` - 僅推演 BDD 場景
- `/derive tdd specs/SPEC-001.md` - 僅推演 TDD 骨架
- `/derive atdd specs/SPEC-001.md` - 推演 ATDD 表格

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[forward-derivation-standards.md](../../../../core/forward-derivation-standards.md)
