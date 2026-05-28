---
name: spec-derive
source: ../../../../skills/spec-derivation/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-28
scope: partial
description: "[UDS] 從規格衍生 BDD 場景、TDD 骨架或 ATDD 表格"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file>"
prerequisites: ["spec-approved"]
disable-model-invocation: true
---

# 正向推演

> **語言**: [English](../../../../skills/spec-derivation/SKILL.md) | 繁體中文

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## 子命令

| 子命令 | 說明 | 輸出 |
|--------|------|------|
| `all` | 完整推演管線（BDD + TDD + IT + E2E + ATDD + Contracts） | `.feature` + `.test.*` + `.it.test.*` + `.e2e.test.*` + `.md` + `.json` |
| `bdd` | 僅生成 BDD 場景 | `.feature` |
| `tdd` | 僅生成 TDD 骨架 | `.test.*` |
| `it` | 生成整合測試骨架 | `.it.test.*` |
| `e2e` | 生成 E2E 測試骨架 | `.e2e.test.*` |
| `atdd` | 生成 ATDD 測試表格 | `.md`（Markdown 表格） |

## 工作流程

1. **讀取 Spec** — 分析輸入的 `SPEC-XXX.md` 檔案
2. **抽取 AC** — 解析所有驗收條件
3. **生成工件** — 建立 BDD / TDD / ATDD 輸出
4. **驗證** — 確認 AC 與生成項目為一對一對應

## 防幻覺規則

| 規則 | 說明 |
|------|------|
| **1:1 對應** | 每個 AC 對應一個測試 / 場景 |
| **追溯性** | 所有工件都引用 Spec ID 與 AC ID |
| **不發明** | 不新增規格外的場景 |

## 產生工件標籤

| 標籤 | 含義 |
|------|------|
| `[Source]` | 直接來自規格的內容 |
| `[Derived]` | 從來源轉換而來 |
| `[Generated]` | AI 生成的結構 |
| `[TODO]` | 需人工實作 |

## 使用方式

```
/derive all specs/SPEC-001.md           - 完整推演管線
/derive bdd specs/SPEC-001.md           - 僅推演 BDD 場景
/derive tdd specs/SPEC-001.md           - 僅推演 TDD 骨架
/derive it specs/SPEC-001.md            - 推演整合測試骨架
/derive e2e specs/SPEC-001.md           - 推演 E2E 測試骨架
/derive atdd specs/SPEC-001.md          - 推演 ATDD 表格
```

## 下一步引導

`/derive` 完成後，AI 助手應建議：

> **測試工件已產生。建議下一步：**
> - 執行 `/tdd` 開始紅綠重構循環 ⭐ **推薦**
> - 執行 `/bdd` 細化 Gherkin 場景
> - 檢查產生的 `[TODO]` 標記並補齊實作

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心標準：[forward-derivation-standards.md](../../../../core/forward-derivation-standards.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/derive`](../../../../skills/commands/derive.md#ai-agent-behavior--ai-代理行為)
