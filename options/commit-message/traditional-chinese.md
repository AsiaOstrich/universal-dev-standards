# 繁體中文 Commit 訊息

> **Language**: English | [繁體中文](../../locales/zh-TW/options/commit-message/traditional-chinese.md)

**Parent Standard**: [Commit Message Guide](../../core/commit-message-guide.md)

---

## 概述

本選項定義以繁體中文撰寫 commit 訊息的標準。適合以中文為主要溝通語言的團隊，讓 commit 歷史更容易閱讀和理解。

## 適用情境

- 台灣或香港的開發團隊
- 內部專案（非開源）
- 中文為主要語言的組織
- 需要非技術人員閱讀 commit 歷史的專案

## 格式

### 基本結構

```
<類型>(<範圍>): <主題>

<內文>

<頁尾>
```

### 組成元素

| 元素 | 必填 | 說明 |
|------|------|------|
| 類型 | 是 | 變更類別（feat、fix、docs 等）|
| 範圍 | 否 | 影響的模組或元件 |
| 主題 | 是 | 簡短描述 |
| 內文 | 否 | 詳細說明 |
| 頁尾 | 否 | 參考連結、重大變更 |

## Commit 類型

| 類型 | 中文說明 | 範例 |
|------|----------|------|
| `feat` | 新功能 | `feat: 新增使用者驗證功能` |
| `fix` | 錯誤修復 | `fix: 修正登入逾時問題` |
| `docs` | 文件更新 | `docs: 更新 API 參考文件` |
| `style` | 格式調整 | `style: 修正工具模組縮排` |
| `refactor` | 程式碼重構 | `refactor: 簡化驗證邏輯` |
| `perf` | 效能優化 | `perf: 優化資料庫查詢` |
| `test` | 測試相關 | `test: 新增驗證模組單元測試` |
| `chore` | 維護作業 | `chore: 更新相依套件` |
| `ci` | CI/CD 變更 | `ci: 新增 GitHub Actions 工作流程` |
| `build` | 建置系統 | `build: 設定 webpack 生產環境` |

## 撰寫指南

### 主題行

1. **使用動詞開頭**：「新增功能」而非「功能新增」
2. **保持簡潔**：50 字元以內
3. **不加句號**：「新增功能」而非「新增功能。」
4. **具體明確**：「修正使用者服務空指標問題」而非「修正錯誤」

### 內文

1. **每行 72 字元**：保持終端機可讀性
2. **說明原因**：解釋為什麼要做這個變更
3. **使用列表**：多項變更時使用項目符號
4. **空行分隔**：與主題行以空行分隔

### 頁尾

1. **參考議題**：`關閉 #123`、`修復 #456`
2. **重大變更**：`重大變更: 說明`
3. **共同作者**：`Co-authored-by: 姓名 <email>`

## 範例

### 簡單功能

```
feat(auth): 新增密碼強度指示器

- 在密碼輸入時顯示強度條
- 輸入時顯示密碼要求
- 阻止提交弱密碼

關閉 #234
```

### 錯誤修復

```
fix(api): 處理付款閘道的空值回應

付款閘道在服務降級時偶爾會回傳 null 而非錯誤物件，
這導致結帳流程出現未處理的例外。

新增空值檢查和適當的錯誤處理，優雅地處理此邊緣案例。

修復 #567
```

### 重大變更

```
feat(api): 將驗證改為 JWT 權杖

重大變更：移除基於 Session 的驗證。
所有 API 客戶端必須使用 JWT 權杖進行驗證。

遷移指南：
1. 從 /auth/token 端點取得 JWT 權杖
2. 在 Authorization 標頭中包含權杖
3. 移除 session cookie 處理

關閉 #789
```

### 文件更新

```
docs(readme): 新增 Windows 安裝說明

- 新增 PowerShell 指令
- 包含 WSL 設定指南
- 新增疑難排解章節
```

### 程式碼重構

```
refactor(core): 將驗證抽取至獨立模組

將驗證邏輯從 UserService 移至專門的 ValidationService，
以獲得更好的關注點分離和可重用性。

無功能性變更。
```

## 反面教材

### 不良範例

```
# 太籠統
fix: 修正錯誤

# 沒有說明
更新使用者服務

# 太冗長
feat: 新增一個允許使用者上傳他們的個人頭像並自動調整大小為多種尺寸的新功能

# 無意義
進行中
雜項變更
暫存
```

### 改善範例

```
# 具體明確
fix(auth): 防止檔案上傳期間 session 逾時

# 簡潔並在內文補充細節
feat(users): 新增個人頭像上傳功能

支援 JPEG、PNG 和 WebP 格式。
圖片自動調整為 100x100、200x200 和 400x400 像素。

# 包含類型
refactor(users): 簡化服務層

# 目的清晰
feat(cache): 新增 Redis 支援 session 儲存
```

## 設定

### Git Commit 範本

建立 `~/.gitmessage`：

```
# <類型>(<範圍>): <主題>
# |<----  最多使用 50 個字元  ---->|

# 說明為什麼要做這個變更
# |<----   每行盡量限制在 72 個字元   ---->|

# 提供相關議題或 PR 的連結
# 例如：關閉 #23
```

設定 git：

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint 設定

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ]
  }
};
```

## 相關選項

- [English](./english.md) - 英文 Commit 訊息
- [Bilingual](./bilingual.md) - 中英雙語格式

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
