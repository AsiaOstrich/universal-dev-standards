---
source: skills/claude-code/documentation-guide/documentation-structure.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 文件結構參考

> **語言**: [English](../../../../../skills/claude-code/documentation-guide/documentation-structure.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供專案文件結構和檔案組織的參考指南。

---

## 標準專案結構

```
project-root/
├── README.md                    # 專案概述（必需）
├── CONTRIBUTING.md              # 貢獻指南
├── CHANGELOG.md                 # 版本歷史
├── LICENSE                      # 授權檔案
├── docs/                        # 詳細文件
│   ├── index.md                 # 文件索引
│   ├── getting-started.md       # 快速入門指南
│   ├── architecture.md          # 系統架構
│   ├── api-reference.md         # API 文件
│   ├── deployment.md            # 部署指南
│   └── troubleshooting.md       # 常見問題
└── examples/                    # 程式碼範例
    ├── basic-usage/
    └── README.md
```

---

## 不同專案類型的文件需求

| 文件 | 新專案 | 重構 | 遷移 | 維護 |
|------|:------:|:----:|:----:|:----:|
| **README.md** | ✅ | ✅ | ✅ | ✅ |
| **CONTRIBUTING.md** | ⚪ | ✅ | ✅ | ⚪ |
| **CHANGELOG.md** | ✅ | ✅ | ✅ | ✅ |
| **LICENSE** | ✅ | ✅ | ✅ | ✅ |
| **docs/architecture.md** | ✅ | ✅ | ✅ | ⚪ |
| **docs/api-reference.md** | ⚪ | ✅ | ✅ | ⚪ |
| **docs/deployment.md** | ✅ | ✅ | ✅ | ⚪ |

**圖例**: ✅ 必需 | ⚪ 建議 | ❌ 不需要

---

## 檔案命名慣例

### 根目錄檔案

使用**大寫**以便 GitHub/GitLab 自動識別：

| 檔案 | 原因 |
|------|------|
| `README.md` | GitHub 自動在倉庫頁面顯示 |
| `CONTRIBUTING.md` | GitHub 在建立 PR 時自動連結 |
| `CHANGELOG.md` | Keep a Changelog 慣例 |
| `LICENSE` | GitHub 自動偵測授權類型 |
| `CODE_OF_CONDUCT.md` | GitHub 社群標準 |
| `SECURITY.md` | GitHub 安全性公告 |

### docs/ 目錄檔案

使用**小寫短橫線**以利 URL 友善性：

✅ **正確**：
```
docs/
├── index.md
├── getting-started.md
├── api-reference.md
└── user-guide.md
```

❌ **錯誤**：
```
docs/
├── INDEX.md           # 大小寫不一致
├── GettingStarted.md  # PascalCase 不適合 URL
├── API_Reference.md   # snake_case 不一致
└── User Guide.md      # 空格會導致 URL 問題
```

---

## 文件範本

### README.md 範本

```markdown
# Project Name

簡短的一行描述。

## 功能特色

- 功能 1
- 功能 2
- 功能 3

## 安裝

```bash
npm install project-name
```

## 快速入門

```javascript
const lib = require('project-name');
lib.doSomething();
```

## 文件

完整文件請參閱 [docs/](docs/)。

## 貢獻

請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授權

[License Name](LICENSE)
```

### CONTRIBUTING.md 範本

```markdown
# 貢獻指南

## 開發環境設定

```bash
git clone https://github.com/org/repo
cd repo
npm install
```

## 工作流程

1. Fork 此倉庫
2. 建立功能分支：`git checkout -b feature/my-feature`
3. 遵循[提交標準](commit-message-format-link)提交變更
4. 推送分支：`git push origin feature/my-feature`
5. 建立 pull request

## 編碼標準

- 遵循專案風格指南
- 提交前執行 `npm run lint`
- 確保測試通過：`npm test`

## 程式碼審查流程

所有提交在合併前都需要審查。
```

### CHANGELOG.md 範本

```markdown
# Changelog

所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### Added
- 新功能

## [1.0.0] - YYYY-MM-DD

### Added
- 初始發布

[Unreleased]: https://github.com/org/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## docs/ 結構

### index.md - 文件中心

```markdown
# Documentation Index

## Getting Started
- [Quick Start](getting-started.md)
- [Installation](installation.md)

## Guides
- [User Guide](user-guide.md)
- [Developer Guide](developer-guide.md)

## Reference
- [API Reference](api-reference.md)
- [Configuration](configuration.md)

## Operations
- [Deployment](deployment.md)
- [Troubleshooting](troubleshooting.md)
```

### getting-started.md 結構

1. 先決條件
2. 安裝
3. 基本設定
4. 第一個範例
5. 下一步

### architecture.md 結構

1. 概述
2. 系統元件
3. 資料流
4. 設計決策
5. 技術堆疊
6. 安全架構

### api-reference.md 結構

1. API 概述
2. 驗證
3. 端點（依資源分組）
4. 請求/回應範例
5. 錯誤代碼
6. 速率限制

### deployment.md 結構

1. 先決條件
2. 環境設定
3. 設定
4. 部署步驟
5. 驗證
6. 回滾程序
7. 監控

### troubleshooting.md 結構

```markdown
## Problem: [Error Name]

**症狀**:
- 使用者看到的現象描述

**原因**:
- 發生此問題的原因

**解決方案**:
- 逐步修復步驟

**預防**:
- 未來如何避免
```

---

## 文件品質檢查清單

### 完整性

- [ ] 列出先決條件
- [ ] 記錄所有步驟
- [ ] 描述預期結果
- [ ] 涵蓋錯誤情境

### 可讀性

- [ ] 清晰、簡潔的語言
- [ ] 簡短段落（≤5 句）
- [ ] 包含程式碼範例
- [ ] 適當使用截圖/圖表

### 準確性

- [ ] 測試過程式碼範例
- [ ] 截圖是最新的
- [ ] 版本號碼正確
- [ ] 連結有效

### 可維護性

- [ ] 清晰的章節標題
- [ ] 邏輯性組織
- [ ] 易於更新
- [ ] 版本與軟體一致

---

## 交叉引用指南

### 何時連結

| 情況 | 動作 |
|-----------|--------|
| 提及其他文件 | 新增連結 |
| 引用 API 端點 | 連結到 api-reference.md |
| 討論架構 | 連結到 architecture.md |
| 新增文件 | 更新 index.md |

### 參考文獻區段

每份文件都應該以此結尾：

```markdown
## References

- [Related Document](path/to/doc.md)
- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)
```

---

## 相關標準

- [Documentation Structure](../../../../../core/documentation-structure.md)
- [Documentation Writing Standards](../../../../../core/documentation-writing-standards.md)
- [README Template](./readme-template.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：標準章節 (目的、相關標準、版本歷史、授權) |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
