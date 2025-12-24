---
source: skills/claude-code/documentation-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
name: documentation-guide
description: |
  Guide documentation structure, README content, and project documentation best practices.
  Use when: creating README, documentation, docs folder, project setup.
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, 文件, 說明文件.
---

# 文件指南

> **語言**: [English](../../../../../skills/claude-code/documentation-guide/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本 Skill 提供專案文件結構、README 內容和文件最佳實踐的指導。

## 快速參考

### 必要專案檔案

| 檔案 | 必要性 | 用途 |
|------|:------:|------|
| `README.md` | ✅ | 專案概述、快速入門 |
| `CONTRIBUTING.md` | 建議 | 貢獻指南 |
| `CHANGELOG.md` | 建議 | 版本歷史 |
| `LICENSE` | ✅ (開源) | 授權資訊 |

### 文件完整性檢查清單

- [ ] README.md 存在且包含必要章節
- [ ] 安裝說明清楚明確
- [ ] 提供使用範例
- [ ] 貢獻指南已記錄
- [ ] 已指定授權

## 詳細指南

完整標準請參閱：
- [文件結構](./documentation-structure.md)
- [README 範本](./readme-template.md)

## README.md 必要章節

### 最小可行 README

```markdown
# 專案名稱

簡短的單行描述。

## 安裝

```bash
npm install your-package
```

## 使用

```javascript
const lib = require('your-package');
lib.doSomething();
```

## 授權

MIT
```

### 建議的 README 章節

1. **專案名稱與描述**
2. **徽章** (CI 狀態、覆蓋率、npm 版本)
3. **功能** (項目符號列表)
4. **安裝**
5. **快速入門 / 使用**
6. **文件** (連結至 docs/)
7. **貢獻** (連結至 CONTRIBUTING.md)
8. **授權**

## docs/ 目錄結構

```
docs/
├── index.md              # 文件索引
├── getting-started.md    # 快速入門指南
├── architecture.md       # 系統架構
├── api-reference.md      # API 文件
├── deployment.md         # 部署指南
└── troubleshooting.md    # 常見問題
```

## 檔案命名規範

### 根目錄 (大寫)

```
README.md          # ✅ GitHub 自動顯示
CONTRIBUTING.md    # ✅ GitHub 在 PR 中自動連結
CHANGELOG.md       # ✅ Keep a Changelog 慣例
LICENSE            # ✅ GitHub 自動偵測
```

### docs/ 目錄 (小寫-連字號)

```
docs/getting-started.md     # ✅ URL 友善
docs/api-reference.md       # ✅ URL 友善
docs/GettingStarted.md      # ❌ 大小寫問題
docs/API_Reference.md       # ❌ 不一致
```

## 範例

### 良好的 README.md

```markdown
# MyProject

一個適用於 Node.js 的快速、輕量級 JSON 解析器。

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/myproject.svg)](https://www.npmjs.com/package/myproject)

## 功能

- 比標準 JSON.parse 快 10 倍
- 支援串流
- 使用 TypeScript 類型安全

## 安裝

```bash
npm install myproject
```

## 快速入門

```javascript
const { parse } = require('myproject');

const data = parse('{"name": "test"}');
console.log(data.name); // "test"
```

## 文件

完整文件請參閱 [docs/](docs/)。

## 貢獻

貢獻指南請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授權

MIT - 詳見 [LICENSE](LICENSE)
```

### 良好的 CHANGELOG.md

```markdown
# 變更日誌

此專案的所有重要變更都將記錄在此檔案中。

## [未發布]

### 新增
- 新功能 X

## [1.2.0] - 2025-12-15

### 新增
- OAuth2 身份驗證支援
- 新的 API 端點 `/users/profile`

### 變更
- 改進錯誤訊息

### 修復
- 修復 session 快取中的記憶體洩漏

## [1.1.0] - 2025-11-01

### 新增
- 初始版本
```

---

## 配置偵測

此 Skill 支援專案特定的文件配置。

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 中的「停用 Skills」區段
   - 如果列出此 Skill，則此專案停用該功能
2. 檢查 `CONTRIBUTING.md` 中的「文件語言」區段
3. 檢查現有文件結構
4. 若未找到，**預設為英文**

### 文件稽核

審查專案時，請檢查：

| 項目 | 檢查方式 |
|------|----------|
| README 存在 | 根目錄有檔案 |
| README 完整 | 包含安裝、使用、授權章節 |
| CONTRIBUTING 存在 | 檔案存在 (團隊專案) |
| CHANGELOG 存在 | 檔案存在 (版本化專案) |
| docs/ 組織良好 | 有 index.md、邏輯結構 |
| 連結正常運作 | 內部連結正確解析 |

### 首次設定

如果缺少文件：

1. 詢問使用者：「此專案沒有完整的文件。應該使用哪種語言？(English / 中文)」
2. 使用者選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## 文件語言

此專案使用 **[選擇的選項]** 作為文件語言。
<!-- 選項：English | 中文 -->
```

3. 從 README.md 開始 (必要)
4. 新增 LICENSE (開源專案)
5. 新增 CONTRIBUTING.md (團隊專案)
6. 建立 docs/ 結構 (複雜專案)

### 配置範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## 文件語言

此專案使用 **English** 作為文件語言。
<!-- 選項：English | 中文 -->
```

---

## 相關標準

- [文件撰寫標準](../../../../../core/documentation-writing-standards.md)
- [文件結構標準](../../../../../core/documentation-structure.md)
- [變更日誌標準](../../../../../core/changelog-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：標準章節 (目的、相關標準、版本歷史、授權) |

---

## 授權

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
