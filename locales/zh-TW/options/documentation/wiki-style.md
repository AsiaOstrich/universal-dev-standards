---
source: options/documentation/wiki-style.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Wiki 風格文件

> **語言**: [English](../../../../options/documentation/wiki-style.md) | 繁體中文

**上層標準**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概觀

Wiki 風格文件提供一個可協作、易於編輯的知識庫。它非常適合內部文件、團隊知識分享，以及需要由多位貢獻者頻繁更新的內容。

## 最適用於

- 大型團隊
- 內部文件
- 知識庫
- 頻繁更新的內容
- 跨職能團隊

## 平台

| 平台 | 廠商 | 最適用於 | 主要特性 |
|----------|--------|----------|--------------|
| **Confluence** | Atlassian | 使用 Jira 的企業團隊 | 豐富的編輯器、範本、空間、權限 |
| **Notion** | Notion Labs | 新創公司、彈性需求 | 資料庫、範本、巢狀頁面、留言 |
| **GitHub Wiki** | GitHub | 開源、開發者 | 以 Git 為後盾、Markdown、隨 repo 免費 |
| **GitBook** | GitBook | 公開文件 | Git 同步、精美 UI、支援 API docs |

## 結構

### 頂層空間

| 空間 | 內容 |
|-------|---------|
| **Engineering** | 架構決策、技術標準、runbook |
| **Product** | 功能規格、roadmap、使用者研究 |
| **Team** | 新人上手、流程、會議紀錄 |

### 頁面階層

1. 概觀／索引頁
2. 分類頁
3. 細節頁
4. 相關連結

## 頁面範本

```markdown
# Page Title

**Last Updated:** YYYY-MM-DD
**Owner:** @username

## Overview

Brief description of what this page covers.

## Content

Main content here...

## Related Pages

- [Related Page 1](link)
- [Related Page 2](link)

## Changelog

| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | @user | Initial creation |
```

## 最佳實踐

- 為常見的頁面類型建立範本
- 使用一致的命名慣例
- 移動頁面時設定轉址
- 定期進行內容稽核
- 鼓勵留言與提問
- 在頁面之間慷慨地建立連結

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 頁面歸屬 | 指派一位負責人維持內容時效性 | Required |
| 頁面日期 | 標註最後更新日期 | Required |
| 連結相關內容 | 連結到相關頁面以提升可發現性 | Recommended |
| 季度審查 | 審查並更新陳舊內容 | Recommended |
| 封存過時內容 | 封存而非刪除舊內容 | Recommended |

## 與其他做法的比較

| 面向 | Wiki | Repo 中的 Markdown | 外部文件網站 |
|--------|------|------------------|-------------------|
| 編輯 | WYSIWYG／容易 | 需要 Git 知識 | 視情況而定 |
| 版本控制 | 內建 | 以 Git 為基礎 | 視平台而定 |
| 協作 | 優異 | 良好 | 良好 |
| 搜尋 | 內建 | GitHub 搜尋 | 視情況而定 |
| 存取控制 | 細緻 | repo 層級 | 視情況而定 |
| 離線存取 | 有限 | 完整 | 有限 |

## 相關選項

- [API Docs](./api-docs.md) - API 參考文件
- [Markdown Docs](./markdown-docs.md) - 純 Markdown 文件

---

## 參考資料

- [Confluence](https://www.atlassian.com/software/confluence)
- [Notion](https://www.notion.so/)
- [GitBook](https://www.gitbook.com/)

---

## 授權

本文件依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
