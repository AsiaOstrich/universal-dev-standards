---
source: ../../../core/project-context-memory.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

# 專案情境記憶標準

> **語言**: [English](../../../core/project-context-memory.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-03-16
**適用性**: 所有使用 AI 助手的軟體專案
**範圍**: uds-specific

---

## 目的

本標準定義一個結構化系統，用於擷取、檢索和強制執行**專案特定**的情境、架構決策和領域知識。不同於開發者記憶（通用且可轉移），專案情境記憶作為特定程式碼庫的「長期大腦」，確保 AI 助手遵守本地慣例和歷史決策。

---

## 快速參考

### 記憶項目結構

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（`PRJ-YYYY-NNNN`） |
| `type` | enum | `decision` / `convention` / `structure` / `glossary` |
| `summary` | string | 一句話摘要 |
| `status` | enum | `active` / `proposed` / `deprecated` |
| `scope` | list | 適用的檔案或目錄 |

### 儲存位置

項目以 **Markdown + YAML Frontmatter** 格式儲存，確保人類可讀（文件）和機器可解析。

- **目錄**: `.project-context/`
- **格式**: `.md` 檔案

## 記憶類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `decision` | 架構或技術決策 | 「使用 PostgreSQL 而非 MongoDB」 |
| `convention` | 程式碼慣例 | 「API 回應必須使用 camelCase」 |
| `structure` | 專案結構規則 | 「測試檔案與原始碼平行放置」 |
| `glossary` | 領域術語定義 | 「'tenant' 指多租戶的獨立實例」 |

## 記憶生命週期

```
proposed → active → deprecated
```

| 狀態 | 說明 |
|------|------|
| `proposed` | 新提出但尚未團隊確認的項目 |
| `active` | 已確認且必須遵守的項目 |
| `deprecated` | 已過時但保留供歷史參考 |

## AI 助手行為

當 AI 助手在專案中工作時：

1. **載入** — 在工作階段開始時讀取 `.project-context/` 中的所有 `active` 項目
2. **遵守** — 所有建議和程式碼生成必須符合活躍的記憶項目
3. **提議** — 發現新的隱含慣例時，建議建立新的記憶項目
4. **衝突** — 如果使用者請求與活躍記憶衝突，必須提醒使用者

## 相關標準

- [情境感知載入](context-aware-loading.md)
- [反幻覺標準](anti-hallucination.md)
- [AI 協議標準](ai-agreement-standards.md)
