---
source: ../../../../skills/ai-collaboration-standards/certainty-labels.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-25
status: current
---

# 確定性標籤參考

> **語言**: [English](../../../../skills/ai-collaboration-standards/certainty-labels.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 AI 回應中使用的確定性標籤和來源類型的參考。

---

## 標籤對照表（英文 / 中文）

| English Tag | 中文標籤 | 使用時機 |
|-------------|---------|----------|
| `[Confirmed]` | `[已確認]` | 來自程式碼/文件的直接證據 |
| `[Inferred]` | `[推論]` | 基於證據的邏輯推論 |
| `[Assumption]` | `[假設]` | 基於常見模式（需要驗證） |
| `[Unknown]` | `[未知]` | 資訊不可用 |
| `[Need Confirmation]` | `[待確認]` | 需要使用者澄清 |

---

## 來源類型

| 來源類型 | 標籤 | 說明 | 可靠性 |
|-------------|-----|-------------|-------------|
| 專案程式碼 | `[Source: Code]` | 直接從程式碼庫讀取 | ⭐⭐⭐⭐⭐ 最高 |
| 專案文件 | `[Source: Docs]` | README、Wiki、行內註解 | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | 附帶 URL 的官方文件 | ⭐⭐⭐⭐ 高 |
| 網路搜尋 | `[Source: Search]` | 搜尋結果（包含日期） | ⭐⭐⭐ 中等 |
| AI 知識 | `[Source: Knowledge]` | AI 訓練資料（需要驗證） | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | 來自使用者對話的資訊 | ⭐⭐⭐ 中等 |

---

## 使用範例

### 在技術文件中

```markdown
## 系統架構分析

`[Confirmed]` 系統使用 ASP.NET Core 8.0 框架 [Source: Code] Program.cs:1
`[Confirmed]` 資料庫使用 SQL Server [Source: Code] appsettings.json:12
`[Inferred]` 基於 Repository Pattern 的使用，系統可能採用 DDD 架構
`[Assumption]` 快取機制可能使用 Redis（需要確認設定）
`[Need Confirmation]` 是否應該支援多租戶？
```

### 在程式碼審查中

```markdown
## 審查意見

`[Confirmed]` src/Services/AuthService.cs:45 - 密碼驗證缺乏暴力破解防護
`[Inferred]` 這裡可能需要速率限制
`[Need Confirmation]` 是否已有其他層級的防護機制？
```

---

## 最佳實踐

### 1. 一致性

- 在整個文件中使用相同語言的標籤（全中文或全英文）
- 團隊應在 `CONTRIBUTING.md` 中指定偏好語言

### 2. 來源引用

- 中文標籤仍需要來源引用
- 格式：`[已確認]` 陳述 [Source: Code] file_path:line_number

### 3. 團隊協議

- 在專案開始時決定使用中文或英文標籤
- 記錄在 `CONTRIBUTING.md` 或 `.standards/` 目錄中

---

## 快速決策指南

```
你是否讀取了實際的程式碼/文件？
├── 是 → [Confirmed] / [已確認]
└── 否
    ├── 你能從現有證據推論嗎？
    │   ├── 是 → [Inferred] / [推論]
    │   └── 否
    │       ├── 這是常見模式嗎？
    │       │   ├── 是 → [Assumption] / [假設]
    │       │   └── 否 → [Unknown] / [未知]
    └── 使用者需要澄清嗎？
        └── 是 → [Need Confirmation] / [待確認]
```

---

## 相關標準

- [防幻覺指南](./anti-hallucination.md)
- [防幻覺標準](../../core/anti-hallucination.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權條款） |

---

## 授權條款

本文件依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
