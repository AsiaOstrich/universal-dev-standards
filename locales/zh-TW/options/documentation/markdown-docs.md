---
source: options/documentation/markdown-docs.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Markdown 文件

> **語言**: [English](../../../../options/documentation/markdown-docs.md) | 繁體中文

**上層標準**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概觀

純 Markdown 文件是一種簡單、可攜的專案文件方式。檔案直接儲存在儲存庫中，以 Git 進行版本控制，並可在 GitHub 和 GitLab 等平台上原生呈現。

## 最適用於

- 開源專案
- 託管於 GitHub/GitLab 的專案
- 以開發者為中心的文件
- 想要簡單、可攜文件的專案
- 中小型專案

## 檔案結構

### 根目錄檔案

| File | Required | 用途 |
|------|----------|---------|
| `README.md` | Yes | 專案概覽、快速開始 |
| `CONTRIBUTING.md` | No | 貢獻指南 |
| `CHANGELOG.md` | No | 版本歷史 |
| `LICENSE` | Yes | 授權檔案 |

### docs/ 資料夾

**位置：** `docs/`
**命名慣例：** lowercase-kebab-case

#### 常見檔案

- `getting-started.md`
- `installation.md`
- `configuration.md`
- `api-reference.md`
- `troubleshooting.md`
- `faq.md`

#### 子目錄

| Directory | 用途 |
|-----------|---------|
| `guides/` | 操作指南 |
| `tutorials/` | 逐步教學 |
| `reference/` | API 與配置參考 |
| `ADR/` | 架構決策記錄 |

## README 範本

```markdown
# Project Name

Brief description of the project.

## Features

- Feature 1
- Feature 2

## Installation

npm install project-name

## Quick Start

import { something } from 'project-name';

## Documentation

See [docs/](./docs/) for full documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
```

## Markdown 最佳實踐

- 使用 ATX 樣式標題（`#`、`##`、`###`）
- 在標題前後加入空白行
- 使用指定語言的 fenced code block
- 將每行控制在 120 字元以內
- 對重複的 URL 使用 reference-style 連結

## 工具

| Tool | 用途 |
|------|---------|
| markdownlint | Lint markdown 檔案 |
| markdown-link-check | 檢查失效連結 |
| docsify | 產生文件網站 |
| mkdocs | 靜態網站產生器 |

## 規則

| 規則 | 說明 | 優先順序 |
|------|-------------|----------|
| 根目錄大寫 | 根目錄文件使用 UPPERCASE（README、CONTRIBUTING） | Required |
| docs lowercase-kebab | docs/ 檔案使用 lowercase-kebab-case | Required |
| 相對連結 | 內部連結使用相對路徑 | Required |
| 包含範例 | 為所有功能包含程式碼範例 | Recommended |

## 與其他方式的比較

| 面向 | 儲存庫內 Markdown | Wiki | 外部文件網站 |
|--------|------------------|------|-------------------|
| 版本控制 | 以 Git 為基礎 | 內建 | 視平台而定 |
| 編輯 | 需要 Git | WYSIWYG／簡易 | 不一定 |
| 離線存取 | 完整 | 有限 | 有限 |
| 搜尋 | GitHub 搜尋 | 內建 | 不一定 |

## 相關選項

- [API Docs](./api-docs.md) - API 參考文件
- [Wiki Style](./wiki-style.md) - Wiki 風格協作文件

---

## 參考資料

- [CommonMark](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Docsify](https://docsify.js.org/)
- [MkDocs](https://www.mkdocs.org/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
