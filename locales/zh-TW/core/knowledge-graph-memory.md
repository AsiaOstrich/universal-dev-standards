---
source: ../../../core/knowledge-graph-memory.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-30
status: current
---

# Knowledge Graph Memory Standards（知識圖記憶標準）

> **語言**: [English](../../../core/knowledge-graph-memory.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-05-30
**適用範圍**: 在「程式碼 + 規格／決策」語料上使用 AI 助手的專案
**Scope**: uds-specific

---

## 目的

本標準定義一套**關係 schema**，讓規格、決策與程式碼能以圖的方式遍歷——回答如*「我若修改 `execute()`，會影響哪些規格與決策？」*的問題。它與向量／語意記憶（找出*相似*的產物）互補，提供**結構遍歷**（找出*有關聯*的產物）。

此 schema 與引擎無關：以純 Markdown front-matter 表達，AI 助手可直接讀取（降級模式），亦可由可選的圖引擎（如 [EngramGraph](https://github.com/AsiaOstrich/EngramGraph)）索引以進行多跳查詢（服務模式）。

---

## 快速參考

### 關係 Front-Matter Schema

在規格／決策文件的 YAML front-matter 中加入以下可選欄位：

| 欄位 | 型別 | 方向 | 意義 |
|------|------|------|------|
| `related` | id 列表 | 無向 | 鬆散關聯的產物 |
| `impacts` | spec id 列表 | this → spec | 此決策改動那些規格 |
| `impacted_by` | decision id 列表 | decision → this | 那些決策改動此規格 |
| `supersedes` | decision id 列表 | this → decision | 此決策取代那些決策 |
| `implements` | spec id 列表 | code/spec → spec | 此產物實作那些規格 |

id 為產物識別碼（如 `XSPEC-205`、`DEC-062`、`ADR-001`）。內文的 `[[XSPEC-NNN]]` wiki 連結是等效但較低保真度的訊號。

### 節點種類

| 前綴 | 節點種類 |
|------|---------|
| `XSPEC-*` / `SPEC-*` | Spec |
| `DEC-*` / `ADR-*` | Decision |
| 函式／類別／模組（來自程式碼）| Code 節點 |

---

## 1. Schema

### 1.1 Front-Matter 範例

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

### 1.2 邊的推導

| 文件上的 front-matter | 推導出的邊 |
|----------------------|-----------|
| Decision `impacts: [SPEC]` | `IMPACTS`（Decision → Spec）|
| Spec `impacted_by: [DEC]` | `IMPACTS`（Decision → Spec）|
| Decision `supersedes: [DEC]` | `SUPERSEDES`（Decision → Decision）|
| Decision 內文 `[[XSPEC-NNN]]` 連結 | `IMPACTS`（Decision → Spec）|

邊是**冪等**的：同一關係從兩端宣告（決策的 `impacts` 與規格的 `impacted_by`）只產生一條邊，不會重複。

---

## 2. 兩種運作模式

本標準的消費者**必須**同時支援兩種模式：

### 2.1 降級模式（無引擎）

AI 助手讀取目標文件，沿其 front-matter／`[[ref]]` 連結讀取被連結檔案，手動組出影響鏈。隨時可用；受限於助手能讀取的檔案數。

### 2.2 服務模式（有圖引擎）

語料被索引進圖引擎；助手送出單一多跳查詢（如 `impact-analysis { nodeId, maxHops }`）取得完整鏈——包含降級模式會漏掉的跨域連結（code → spec → decision）。

> 正確實作在兩種模式下產生**相同形狀的答案**；服務模式只是更快更完整，並非本質不同。

---

## 3. Confidence（可選）

節點**可**帶 `confidence`，範圍 `[0.1, 1.0]`。回饋訊號（測試通過／失敗、人工修正、狀態變更）演化 confidence，讓讀取時優先浮現最被強化的產物。confidence 有下限（永不歸零），使連續失敗無法抹除重要節點。此為自我演化圖記憶（SAGE）的基礎。

---

## 4. 規則

1. 關係欄位**可選**且**附加**——缺少永不破壞工具。
2. 允許參照尚不存在的 id；它們成為 stub 節點，待目標文件出現時解析。
3. 從*擁有*該關係的一端宣告（決策擁有 `impacts`/`supersedes`；規格擁有 `impacted_by`），但兩端皆接受。
4. 圖引擎為 **opt-in**。未設定引擎時工具**必須**優雅降級為 Markdown 讀取。
5. 向量／語意記憶為**互補**而非取代——結構用圖遍歷，相似用向量。

---

## 相關標準

- [Project Context Memory](project-context-memory.md) — 每專案長期事實
- [Developer Memory](developer-memory.md) — 通用、可攜偏好
- [ADR Standards](adr-standards.md) — 餵入 Decision 節點的決策紀錄格式
