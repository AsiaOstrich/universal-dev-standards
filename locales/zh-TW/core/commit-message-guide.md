---
source: ../../../core/commit-message-guide.md
source_version: 1.2.3
translation_version: 1.2.3
last_synced: 2025-12-25
status: current
---

# Commit 訊息規範指南

> **語言**: [English](../../core/commit-message-guide.md) | 繁體中文

**版本**: 1.2.3
**最後更新**: 2025-12-24
**適用範圍**: 所有使用 Git 版本控制的專案

---

## 目的

標準化的 commit 訊息提升程式碼審查效率、促進自動化變更日誌生成，並使專案歷史可搜尋、可理解。

---

## 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 組成元素

| 元素      | 必要性 | 說明                         |
| --------- | ------ | ---------------------------- |
| `type`    | ✅ 是  | 變更類型                     |
| `scope`   | 選填   | 受影響的模組/元件            |
| `subject` | ✅ 是  | 簡短描述（≤72 字元）         |
| `body`    | 建議   | 詳細說明                     |
| `footer`  | 選填   | Issue 引用、破壞性變更       |

---

## 類型分類

**專案必須選擇一種語言**用於類型並保持一致使用。

### 選項 A: 英文（國際標準）

使用英文類型，適合國際團隊及最佳工具相容性。

| 類型       | 使用時機                   |
| ---------- | -------------------------- |
| `feat`     | 新功能                     |
| `fix`      | Bug 修復                   |
| `refactor` | 重構（無功能變更）         |
| `docs`     | 僅文件更新                 |
| `style`    | 格式化、空白（無邏輯變更） |
| `test`     | 新增或更新測試             |
| `perf`     | 效能改進                   |
| `build`    | 建置系統或依賴             |
| `ci`       | CI/CD 管道變更             |
| `chore`    | 維護任務                   |
| `revert`   | 回退先前提交               |
| `security` | 安全漏洞修復               |

### 選項 B: 繁體中文（台灣團隊適用）

使用繁體中文類型，適合偏好母語提交的本地團隊。

| 類型   | 使用時機             |
| ------ | -------------------- |
| `新增` | 新功能               |
| `修正` | Bug 修復             |
| `重構` | 重構（無功能變更）   |
| `文件` | 僅文件更新           |
| `樣式` | 格式化（無邏輯變更） |
| `測試` | 新增或更新測試       |
| `效能` | 效能改進             |
| `建置` | 建置系統或依賴       |
| `整合` | CI/CD 管道變更       |
| `維護` | 維護任務             |
| `回退` | 回退先前提交         |
| `安全` | 安全漏洞修復         |

### 選項 C: 雙語對照模式（推薦）

使用英文 `type` 和 `scope` 以確保工具相容性，subject/body/footer 採用雙語對照。

**格式**:

```
<type>(<scope>): <English subject>. <中文主旨>。

<English body>

<中文主體>

<footer>
```

**範例**:

```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

- Add Google OAuth2 SDK integration
- Create callback endpoint for OAuth flow
- Store refresh tokens securely

實作 Google OAuth2 認證流程供使用者登入。

- 整合 Google OAuth2 SDK
- 建立 OAuth 流程回呼端點
- 安全儲存更新權杖

Closes #123
```

### 語言選擇指南

使用此指南為您的專案選擇適當的 commit 訊息語言：

| 因素                | English  | 繁體中文     | 雙語對照  |
| ------------------- | -------- | ------------ | --------- |
| **團隊組成**        | 國際/混合 | 本地（台灣） | 混合但以本地為主 |
| **工具相容性**      | ✅ 最佳  | ⚠️ 有限     | ✅ 良好   |
| **Changelog 自動化** | ✅ 完整支援 | ⚠️ 需自訂設定 | ✅ 支援 |
| **新人上手**        | 中立     | 本地成員較易上手 | 兩者皆受益 |
| **開源專案**        | ✅ 建議  | ❌ 不建議    | ✅ 好選擇 |

**快速選擇**:
- **開源專案** → 英文（選項 A）
- **本地團隊、內部專案** → 繁體中文（選項 B）
- **本地團隊但有國際協作** → 雙語對照（選項 C）

**重要**：一旦選定，請在整個專案中**一致使用**。勿混用語言。

---

**專案決策點**: 在 `CONTRIBUTING.md` 中記錄你的選擇（選擇其一）：

```markdown
## Commit Message Language

<!-- 選擇以下其中一個選項： -->

<!-- 選項 A: 英文 -->
本專案使用**英文** commit 類型（feat, fix, refactor 等）

<!-- 選項 B: 繁體中文 -->
本專案使用**繁體中文** commit 類型（新增、修正、重構等）

<!-- 選項 C: 雙語對照模式 -->
本專案使用**雙語對照模式**，type/scope 使用英文，subject/body 採用雙語對照。
```

---

## 範圍指引

範圍指出程式碼庫的哪個部分受影響。使用簡短、可識別的名稱。

### 命名規則

1. **使用小寫**: 所有範圍應使用小寫（`auth`，而非 `Auth`）
2. **多字詞用連字號**: 使用連字號分隔多字詞（`user-profile`，而非 `userProfile`）
3. **保持簡短**: 最多 1-2 個單詞

### 常見範圍

**依層級/模組**:

- `api`: API 層
- `ui`: 使用者介面
- `auth`: 認證/授權
- `database`: 資料庫層
- `config`: 設定
- `middleware`: 中介層

**依功能**:

- `login`: 登入功能
- `payment`: 付款處理
- `notification`: 通知
- `search`: 搜尋功能

**依檔案類型**:

- `tests`: 測試檔案
- `docs`: 文件檔案
- `build`: 建置腳本
- `deps`: 依賴項目

**特殊範圍**:

- `*`: 多個範圍受影響
- (無範圍): 全域變更

**網路 API 專案的範圍範例**:

```
auth, user, product, order, payment, notification,
database, config, middleware, api, tests, docs
```

---

## 主旨行

### 規則

1. **長度**: ≤72 字元（50 為理想）
2. **時態**: 使用祈使語氣（「Add feature」而非「Added feature」）
3. **大寫**: 首字母大寫
4. **無句點**: 結尾不加句點（例外：雙語模式使用句點作為分隔符）
5. **語言**: 遵循專案政策（英文或母語）

### 繁體中文範例

```
新增(認證): 實作 OAuth2 Google 登入支援
修正(API): 解決使用者 session 快取記憶體洩漏
重構(資料庫): 提取查詢建構器為獨立類別
文件(README): 更新 Node 20 安裝說明
測試(付款): 新增退款流程單元測試
效能(搜尋): 實作全文檢索索引
建置(依賴): 升級 Express 至 4.18.2
```

### 不良範例

```
❌ "fixed bug" - 太模糊，無範圍
❌ "feat(auth): added google login and fixed a bug and refactored code" - 太長，多個關注點
❌ "Update stuff." - 有句點，太模糊
❌ "Added OAuth2 login feature" - 過去式而非祈使語氣
❌ "WIP" - 無描述性
```

---

## 主體內容

使用主體解釋**為何**做此變更，而非**變更了什麼**（程式碼已顯示變更內容）。

### 結構

- 多個變更使用項目符號
- 每行限制 72 字元
- 與主旨以空白行分隔
- 提供上下文和理由

### 主體範本

根據變更類型使用適當的標題。常見模式：

**新功能**:

```
為何需要此功能:
此變更實作內容:
技術備註:
```

**修復**:

```
問題發生原因:
修正內容:
測試:
```

**重構**:

```
重構原因:
變更內容:
遷移:
```

**通用範本**:

```
<主旨行>

<空白行>

為何:
- 原因 1
- 原因 2

內容:
- 變更 1
- 變更 2

備註:
- 上下文或考量事項
```

### 範例

#### 範例 1: 含上下文的功能

```
新增(通知): 實作電子郵件通知功能

為何需要此變更:
- 使用者反饋希望收到訂單狀態更新通知
- 減少客服查詢訂單狀態的工作量
- 提升使用者體驗與滿意度

此變更做了什麼:
- 整合 SendGrid API 發送電子郵件
- 新增 EmailTemplate 模組管理郵件範本
- 實作訂單狀態變更時觸發通知
- 新增使用者偏好設定以控制通知開關

技術備註:
- 使用佇列機制避免阻塞主流程
- 郵件發送失敗會重試 3 次
- 範本支援多語言（繁中、英文）
```

---

## 頁尾

### Issue 引用

連結 commit 至 issue 追蹤系統：

```
Closes #123
Fixes #456
Resolves #789
Refs #101, #102
See also #999
```

**支援的關鍵字**（GitHub、GitLab、Bitbucket）：

- `Closes`、`Fixes`、`Resolves`: 自動關閉 issue
- `Refs`、`References`、`See also`: 僅連結，不關閉

---

### 破壞性變更

**重要**: 永遠在頁尾記錄破壞性變更。

**格式**:

```
BREAKING CHANGE: <描述>

遷移指南:
- 步驟 1
- 步驟 2
```

**範例**:

```
feat(api): 變更使用者端點回應格式

- 扁平化巢狀使用者物件結構
- 移除已棄用的 `legacy_id` 欄位
- 新增 `created_at` 和 `updated_at` 時間戳記

BREAKING CHANGE: 使用者 API 回應格式已變更

舊格式:
```json
{
  "data": {
    "user": {
      "id": 123,
      "name": "John",
      "legacy_id": 456
    }
  }
}
```

新格式:

```json
{
  "id": 123,
  "name": "John",
  "created_at": "2025-11-12T10:00:00Z",
  "updated_at": "2025-11-12T10:00:00Z"
}
```

遷移指南:

- 更新 API 客戶端以移除 `.data` 包裝
- 移除對 `legacy_id` 欄位的引用
- 使用 `created_at` 而非 `createdAt`（snake_case）

Closes #234

```

---

## 完整範例

### 範例 1: 簡單修正（雙語對照）

```

fix(auth): Correct JWT expiration time calculation. 修正 JWT 過期時間計算。

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

權杖因未考慮時區偏移而提早 1 小時過期。現已統一使用 UTC 時間。

Fixes #445

```

---

### 範例 2: 功能（雙語對照）

```

feat(export): Add CSV export functionality for user data. 新增使用者資料 CSV 匯出功能。

Why this feature is needed:

- Admins need to export user lists for compliance audits
- Manual copy-paste from UI is error-prone
- Requested by legal and compliance teams

What this implements:

- New `/api/users/export` endpoint
- CSV generation using csv-writer library
- Streaming response to handle large datasets
- Date range filtering options

Technical notes:

- Streaming prevents memory issues with 100k+ users
- Export limited to admin role only

為何需要此功能:

- 管理員需匯出使用者清單以進行合規稽核
- 從 UI 手動複製貼上容易出錯
- 法務與合規團隊要求此功能

此變更實作內容:

- 新增 `/api/users/export` 端點
- 使用 csv-writer 函式庫生成 CSV
- 串流回應以處理大型資料集
- 日期範圍篩選選項

技術備註:

- 串流處理可避免 10 萬筆以上使用者的記憶體問題
- 匯出功能僅限管理員角色使用

Closes #567
Refs #234

```

---

### 範例 3: 含根因分析的 Bug 修正（雙語對照）

```

fix(api): Resolve race condition in concurrent user updates. 解決並發使用者更新的競爭條件。

Why this occurred:

- Two simultaneous PUT requests to /users/:id could overwrite each other
- No optimistic locking implemented

What this fix does:

- Add version field to User model
- Implement optimistic locking check
- Return 409 Conflict if version mismatch

Testing:

- Added concurrent update test scenarios
- Verified with load test (100 concurrent updates)

問題發生原因:

- 兩個同時發送至 /users/:id 的 PUT 請求可能互相覆蓋
- 未實作樂觀鎖定機制

修正內容:

- 新增版本欄位至 User 模型
- 實作樂觀鎖定檢查
- 版本不符時回傳 409 Conflict

測試:

- 新增並發更新測試情境
- 以負載測試驗證（100 個並發更新）

Fixes #789

```

---

### 範例 4: 破壞性變更（雙語對照）

```

refactor(database): Migrate from MySQL to PostgreSQL. 從 MySQL 遷移至 PostgreSQL。

Why this refactoring:

- PostgreSQL offers better JSON support for our use case
- Need advanced indexing features for full-text search

What this changes:

- Update database driver from mysql2 to pg
- Convert MySQL-specific queries to PostgreSQL syntax
- Update connection pooling configuration

BREAKING CHANGE: Database engine changed from MySQL to PostgreSQL

Migration guide:

1. Backup existing MySQL database
2. Install PostgreSQL 15+
3. Update .env: DATABASE_URL=postgresql://...
4. Run migration: npm run db:migrate
5. Verify data integrity: npm run db:verify

Estimated downtime: 2-4 hours

重構原因:

- PostgreSQL 提供更佳的 JSON 支援以符合我們的使用情境
- 需要進階索引功能支援全文檢索

變更內容:

- 更新資料庫驅動從 mysql2 至 pg
- 將 MySQL 專用查詢轉換為 PostgreSQL syntax
- 更新連線池設定

破壞性變更: 資料庫引擎從 MySQL 變更為 PostgreSQL

遷移指南:

1. 備份現有 MySQL 資料庫
2. 安裝 PostgreSQL 15+
3. 更新 .env 設定: DATABASE_URL=postgresql://...
4. 執行遷移腳本: npm run db:migrate
5. 驗證資料完整性: npm run db:verify

預估停機時間: 2-4 小時

Closes #890

```

---

## 反模式

### ❌ 反模式 1: 模糊訊息

```

fix: bug fix
refactor: code improvements
update: changes

```

**問題**: 無上下文，不閱讀程式碼無法理解。

**✅ 修正**:
```

fix(login): 防止快速點擊時重複建立 session
refactor(utils): 提取電子郵件驗證正規表示式至常數
feat(profile): 新增含圖片壓縮的頭像上傳功能

```

---

### ❌ 反模式 2: 混合多個關注點

```

feat: add login, fix bugs, refactor database, update docs

```

**問題**: 應分為多個 commit 以利審查和回退。

**✅ 修正**: 拆分為多個 commit：
```

feat(auth): 新增 OAuth2 登入支援
fix(api): 解決使用者查詢空指標問題
refactor(database): 提取連線池至獨立模組
docs(api): 更新認證端點文件

```

---

### ❌ 反模式 3: Commit 訊息當作程式碼註解

```

fix: change line 45 from getUserById to getUserByEmail because the function was renamed

```

**問題**: 過度聚焦於實作細節而非目的。

**✅ 修正**:
```

fix(api): 在密碼重設中使用正確的使用者查詢方法

密碼重設流程使用電子郵件參數呼叫 getUserById，
導致查詢失敗。現已正確呼叫 getUserByEmail。

Fixes #789

```

---

### ❌ 反模式 4: 複雜變更無主體說明

```

refactor(database): migrate to PostgreSQL

```

**問題**: 破壞性變更卻無遷移指南或上下文。

**✅ 修正**: 加入含上下文和遷移指南的主體（參見上方範例 4）。

---

## 自動化與工具

### Commit 訊息檢查工具

**commitlint**（Node.js）:
```bash
npm install --save-dev @commitlint/{cli,config-conventional}

# .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

**Git Hook**（在 commit 時強制執行）:

```bash
# .git/hooks/commit-msg
#!/bin/sh
npx commitlint --edit $1
```

---

### 變更日誌生成

**standard-version**（Node.js）:

```bash
npm install --save-dev standard-version

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# 從 commit 生成 CHANGELOG.md
npm run release
```

**git-chglog**（Go）:

```bash
git-chglog --output CHANGELOG.md
```

---

## 專案設定範本

加入至 `CONTRIBUTING.md`：

```markdown
## Commit Message Format

### 類型語言
本專案使用**[英文 / 繁體中文 / 雙語對照]** commit 類型。

### 允許的類型
- feat / 新增: 新功能
- fix / 修正: Bug 修復
- refactor / 重構: 程式碼重構
- docs / 文件: 文件
- test / 測試: 測試
- perf / 效能: 效能改進
- build / 建置: 建置系統
- ci / 整合: CI/CD 變更
- chore / 維護: 維護
- security / 安全: 安全修復

### 允許的範圍
- auth: 認證模組
- api: API 層
- ui: 使用者介面
- database: 資料庫層
- [新增你的專案特定範圍]

### 主旨語言
Commit 主旨行應使用**[英文/繁體中文/雙語]**。

### 範例

**繁體中文**:
```

新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏

```

**雙語模式**（英文在前，中文對照）:
```

feat(auth): Add OAuth2 support. 新增 OAuth2 支援。

Implement OAuth2 authentication flow.

實作 OAuth2 認證流程。

Closes #123

```

```

---

## 相關標準

- [Git Workflow Standards](git-workflow.md) - Git 工作流程標準
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入標準
- [Changelog Standards](changelog-standards.md) - 變更日誌標準
- [Versioning Standard](versioning.md) - 語義化版本標準

---

## 版本歷史

| 版本  | 日期       | 變更                                                                       |
| ----- | ---------- | -------------------------------------------------------------------------- |
| 1.2.3 | 2025-12-24 | 新增相關標準區段                                                           |
| 1.2.2 | 2025-12-16 | 新增語言選擇指南，含決策矩陣和快速選擇提示                                 |
| 1.2.1 | 2025-12-09 | 改善 Option A/B/C 格式一致性：統一標題風格、新增描述文字                   |
| 1.2.0 | 2025-12-05 | 修正 Option B 類型對照（chore→維護）；新增 security 類型；新增 scope 命名規則；釐清雙語句點例外；改善範本 |
| 1.1.0 | 2025-12-05 | 新增雙語對照模式（選項 C）與範例                                           |
| 1.0.0 | 2025-11-12 | 初版發布                                                                   |

---

## 參考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## 授權

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
