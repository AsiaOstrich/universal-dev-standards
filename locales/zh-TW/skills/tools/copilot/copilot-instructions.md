---
source: ../../../skills/copilot/copilot-instructions.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Copilot 指示
<!-- 來源：https://github.com/AsiaOstrich/universal-dev-standards -->
<!-- 版本：1.0.0 -->

## 開發標準

生成程式碼建議時遵循這些標準。

### 提交訊息

使用 Conventional Commits 格式：
```
<類型>(<範圍>): <主題>
```

**類型：**
- `feat` - 新功能
- `fix` - 錯誤修正
- `refactor` - 程式碼重構
- `docs` - 文件
- `test` - 測試
- `chore` - 維護

**範例：**
- `feat(auth): add OAuth2 login`
- `fix(api): handle null user`

### 程式碼品質

生成程式碼時：
- 使用描述性的變數/函式名稱
- 遵循單一職責原則
- 避免程式碼重複
- 適當處理錯誤
- 驗證輸入

### 安全

始終包含：
- 輸入驗證
- 參數化查詢（防 SQL 注入）
- 輸出編碼（防 XSS）
- 不硬編碼憑證

### 測試

生成測試時遵循：
- AAA 模式：Arrange → Act → Assert
- FIRST 原則：Fast、Independent、Repeatable、Self-validating、Timely
- 邊界案例覆蓋

### 文件

對於公開 API：
- 包含 JSDoc/docstring 註解
- 記錄參數和回傳值
- 提供使用範例

### Git

分支命名：
- `feature/*` - 新功能
- `fix/*` - 錯誤修正
- `hotfix/*` - 緊急修正

### AI 協作

當不確定時：
- 詢問釐清問題
- 明確說明假設
- 適時提供多個選項
