---
name: changelog-guide
description: |
  依照 Keep a Changelog 格式撰寫與維護 CHANGELOG.md。
  使用時機：建立變更日誌條目、準備發布、記錄變更。
  關鍵字：changelog, release notes, CHANGELOG.md, keep a changelog, 變更日誌, 發布說明。
source: ../../../../../skills/claude-code/changelog-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 變更日誌指南

> **語言**: [English](../../../../../skills/claude-code/changelog-guide/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-30
**適用範圍**: Claude Code Skills

---

## 目的

此技能幫助依照 Keep a Changelog 格式撰寫與維護 CHANGELOG.md 檔案，確保清楚地向使用者傳達變更內容。

## 快速參考

### 檔案結構

```markdown
# 變更日誌

本專案的所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [未發布]

## [1.2.0] - 2025-12-15

### 新增
- 功能描述

### 變更
- 變更描述

### 修復
- 錯誤修復描述

[未發布]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

### 變更類別

| 類別 | 使用時機 | 範例 |
|------|----------|------|
| **新增 (Added)** | 新功能 | 新增深色模式支援 |
| **變更 (Changed)** | 現有功能的修改 | 搜尋效能提升 50% |
| **棄用 (Deprecated)** | 即將移除的功能 | 棄用 legacyParse() |
| **移除 (Removed)** | 已移除的功能 | 移除 Node.js 14 支援 |
| **修復 (Fixed)** | 錯誤修復 | 修復登入逾時問題 |
| **安全 (Security)** | 安全性修補 | 修復 XSS 漏洞 |

### Commit Type 對應 Changelog

| Commit Type | Changelog 類別 | 備註 |
|-------------|----------------|------|
| `feat` | **新增** | 新功能 |
| `fix` | **修復** | 錯誤修復 |
| `perf` | **變更** | 效能改善 |
| `security` | **安全** | 安全性修補 |
| `BREAKING CHANGE` | **變更** 或 **移除** | 加上 **BREAKING** 前綴 |
| `refactor`, `docs`, `style`, `test`, `chore` | *(通常省略)* | 對使用者無影響 |

## 條目格式

### 標準格式

```markdown
- [動作動詞] [變更內容] ([參考])
```

### 範例

```markdown
### 新增
- 新增可自訂小工具的使用者儀表板 (#123)
- 新增 PostgreSQL 15 支援 (PR #456)

### 變更
- **BREAKING**: API 回應格式從 XML 改為 JSON (#789)
- 更新最低 Node.js 版本至 18.0 (#101)

### 修復
- 修復處理大型檔案時的記憶體洩漏 (#112)
- 修復報表中日期格式錯誤 (#134)

### 安全
- 修復搜尋端點的 SQL 注入漏洞 (高風險, CVE-2025-12345)
```

## 詳細指南

完整標準請參考：
- [變更日誌標準](../../../core/changelog-standards.md)

### AI 優化格式（節省 Token）

AI 助手可使用 YAML 格式檔案以減少 Token 使用量：
- 基礎標準：`ai/standards/changelog.ai.yaml`

## 撰寫指南

### 為使用者撰寫，而非開發者

| ✅ 好 | ❌ 不好 | 原因 |
|-------|--------|------|
| 新增深色模式主題選項 | 使用 context 實作 ThemeProvider | 使用者可見的好處 |
| 修復慢速網路的登入逾時 | 修復 AuthService 中的競爭條件 | 影響描述 |
| 頁面載入速度提升 40% | 使用索引優化 SQL 查詢 | 可量化的成果 |

### 破壞性變更

務必清楚標記破壞性變更：

```markdown
### 變更
- **BREAKING**: 移除已棄用的 `getUserById()` 方法，請改用 `getUser()`
- **BREAKING**: 設定檔格式從 YAML 改為 TOML

### 移除
- **BREAKING**: 移除 Node.js 14 支援
```

### 安全公告

包含嚴重程度和 CVE（如有）：

```markdown
### 安全
- 修復搜尋端點的 SQL 注入漏洞 (高風險, CVE-2025-12345)
- 修復留言區的 XSS 漏洞 (中風險)
- 更新 `lodash` 相依套件以修補原型污染 (低風險)
```

## 版本標題格式

```markdown
## [版本] - YYYY-MM-DD
```

範例：
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [未發布]
```

## 排除規則

以下**不應**記錄在 CHANGELOG 中：

| 類別 | 範例 | 原因 |
|------|------|------|
| 建置輸出 | `dist/`, `build/` | 產生的檔案 |
| 相依套件 | `node_modules/`, lock 檔案 | 自動管理 |
| 本地設定 | `.env`, `*.local.json` | 環境特定 |
| IDE 設定 | `.vscode/`, `.idea/` | 開發者偏好 |
| 內部重構 | 程式碼風格、變數名稱 | 對使用者無影響 |

## 常見錯誤

| ❌ 錯誤 | ✅ 正確 |
|--------|--------|
| 沒有日期 | 使用 ISO 格式包含日期 |
| 缺少版本連結 | 在底部加入比較連結 |
| 內部術語 | 使用使用者友善的語言 |
| 過於技術性 | 專注於使用者影響 |
| 沒有分類 | 使用標準類別 |

---

## 設定偵測

此技能支援專案特定設定。

### 偵測順序

1. 檢查現有 `CHANGELOG.md` 格式
2. 檢查 `CONTRIBUTING.md` 中的變更日誌指南
3. 若無找到，**預設使用 Keep a Changelog 格式**

### 首次設定

若 CHANGELOG.md 不存在：

1. 建議使用標準範本建立
2. 建議在 `CONTRIBUTING.md` 中記錄指南：

```markdown
## 變更日誌指南

- 為所有使用者可見的變更更新 CHANGELOG.md
- 開發期間將條目加入 [未發布] 區段
- 使用標準類別：新增、變更、棄用、移除、修復、安全
- 引用 issue/PR 編號：`修復錯誤 (#123)`
- 使用 **BREAKING** 前綴標記破壞性變更
```

---

## 相關標準

- [變更日誌標準](../../../core/changelog-standards.md)
- [版本控制標準](../../../core/versioning.md)
- [提交訊息指南](../../../core/commit-message-guide.md)
- [發布標準技能](../release-standards/SKILL.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授權

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
