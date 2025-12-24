# Commit Message Guide
# Commit 訊息規範指南

**Version**: 1.2.3
**Last Updated**: 2025-12-24
**Applicability**: All projects using Git version control
**適用範圍**: 所有使用 Git 版本控制的專案

---

## Purpose | 目的

Standardized commit messages improve code review efficiency, facilitate automated changelog generation, and make project history searchable and understandable.

標準化的 commit 訊息提升程式碼審查效率、促進自動化變更日誌生成，並使專案歷史可搜尋、可理解。

---

## Basic Format | 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components | 組成元素

| Component   | Required    | Description                        |
| ----------- | ----------- | ---------------------------------- |
| `type`    | ✅ Yes      | Type of change                     |
| `scope`   | Optional    | Module/component affected          |
| `subject` | ✅ Yes      | Brief description (≤72 chars)     |
| `body`    | Recommended | Detailed explanation               |
| `footer`  | Optional    | Issue references, breaking changes |

---

## Type Classification | 類型分類

**PROJECT MUST CHOOSE ONE LANGUAGE** for types and use it consistently.

**專案必須選擇一種語言**用於類型並保持一致使用。

### Option A: English (International) | 英文（國際標準）

Use English types for international teams and maximum tool compatibility.

使用英文類型，適合國際團隊及最佳工具相容性。

| Type         | When to Use                                   | 使用時機                   |
| ------------ | --------------------------------------------- | -------------------------- |
| `feat`     | New feature                                   | 新功能                     |
| `fix`      | Bug fix                                       | Bug 修復                   |
| `refactor` | Code refactoring (no functional change)       | 重構（無功能變更）         |
| `docs`     | Documentation only                            | 僅文件更新                 |
| `style`    | Formatting, whitespace (no code logic change) | 格式化、空白（無邏輯變更） |
| `test`     | Adding or updating tests                      | 新增或更新測試             |
| `perf`     | Performance improvement                       | 效能改進                   |
| `build`    | Build system or dependencies                  | 建置系統或依賴             |
| `ci`       | CI/CD pipeline changes                        | CI/CD 管道變更             |
| `chore`    | Maintenance tasks                             | 維護任務                   |
| `revert`   | Revert previous commit                        | 回退先前提交               |
| `security` | Security vulnerability fix                    | 安全漏洞修復               |

### Option B: Traditional Chinese (Taiwanese Teams) | 繁體中文（台灣團隊適用）

Use Traditional Chinese types for local teams preferring native language commits.

使用繁體中文類型，適合偏好母語提交的本地團隊。

| 類型     | 使用時機             | English Equivalent |
| -------- | -------------------- | ------------------ |
| `新增` | 新功能               | feat               |
| `修正` | Bug 修復             | fix                |
| `重構` | 重構（無功能變更）   | refactor           |
| `文件` | 僅文件更新           | docs               |
| `樣式` | 格式化（無邏輯變更） | style              |
| `測試` | 新增或更新測試       | test               |
| `效能` | 效能改進             | perf               |
| `建置` | 建置系統或依賴       | build              |
| `整合` | CI/CD 管道變更       | ci                 |
| `維護` | 維護任務             | chore              |
| `回退` | 回退先前提交         | revert             |
| `安全` | 安全漏洞修復         | security           |

### Option C: Bilingual Mode (Recommended) | 雙語對照模式（推薦）

Use English `type` and `scope` for tool compatibility, with bilingual subject/body/footer.

使用英文 `type` 和 `scope` 以確保工具相容性，subject/body/footer 採用雙語對照。

**Format | 格式**:

```
<type>(<scope>): <English subject>. <中文主旨>。

<English body>

<中文主體>

<footer>
```

**Example | 範例**:

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

### Language Selection Guide | 語言選擇指南

Use this guide to choose the appropriate commit message language for your project:

使用此指南為您的專案選擇適當的 commit 訊息語言：

| Factor | English | 繁體中文 | Bilingual 雙語 |
|--------|---------|---------|----------------|
| **Team composition** | International/mixed | Local (Taiwan) | Mixed with local focus |
| **Tool compatibility** | ✅ Best | ⚠️ Limited | ✅ Good |
| **Changelog automation** | ✅ Full support | ⚠️ Custom config | ✅ Supported |
| **Onboarding** | Neutral | Easier for locals | Both benefit |
| **Open source** | ✅ Recommended | ❌ Not recommended | ✅ Good choice |

| 因素 | English | 繁體中文 | 雙語對照 |
|------|---------|---------|----------|
| **團隊組成** | 國際/混合 | 本地（台灣） | 混合但以本地為主 |
| **工具相容性** | ✅ 最佳 | ⚠️ 有限 | ✅ 良好 |
| **Changelog 自動化** | ✅ 完整支援 | ⚠️ 需自訂設定 | ✅ 支援 |
| **新人上手** | 中立 | 本地成員較易上手 | 兩者皆受益 |
| **開源專案** | ✅ 建議 | ❌ 不建議 | ✅ 好選擇 |

**Quick Selection | 快速選擇**:
- **Open source project** → English (Option A)
- **開源專案** → 英文（選項 A）
- **Local team, internal project** → Traditional Chinese (Option B)
- **本地團隊、內部專案** → 繁體中文（選項 B）
- **Local team with international collaboration** → Bilingual (Option C)
- **本地團隊但有國際協作** → 雙語對照（選項 C）

**Important | 重要**: Once chosen, **use consistently** across the entire project. Do not mix languages.

**重要**：一旦選定，請在整個專案中**一致使用**。勿混用語言。

---

**Project Decision Point**: Document your choice in `CONTRIBUTING.md` (choose ONE):

**專案決策點**: 在 `CONTRIBUTING.md` 中記錄你的選擇（選擇其一）：

```markdown
## Commit Message Language

<!-- Choose ONE of the following options: -->
<!-- 選擇以下其中一個選項： -->

<!-- Option A: English -->
This project uses **English** commit types (feat, fix, refactor, etc.)
本專案使用**英文** commit 類型（feat, fix, refactor 等）

<!-- Option B: Traditional Chinese -->
This project uses **Traditional Chinese** commit types (新增, 修正, 重構, etc.)
本專案使用**繁體中文** commit 類型（新增、修正、重構等）

<!-- Option C: Bilingual Mode -->
This project uses **Bilingual Mode** with English types/scopes and bilingual subject/body.
本專案使用**雙語對照模式**，type/scope 使用英文，subject/body 採用雙語對照。
```

---

## Scope Guidelines | 範圍指引

Scope indicates which part of the codebase is affected. Use short, recognizable names.

範圍指出程式碼庫的哪個部分受影響。使用簡短、可識別的名稱。

### Naming Rules | 命名規則

1. **Use lowercase**: All scopes should be lowercase (`auth`, not `Auth`)
   **使用小寫**: 所有範圍應使用小寫（`auth`，而非 `Auth`）
2. **Use hyphen for multi-word**: Separate words with hyphens (`user-profile`, not `userProfile`)
   **多字詞用連字號**: 使用連字號分隔多字詞（`user-profile`，而非 `userProfile`）
3. **Keep it short**: 1-2 words maximum
   **保持簡短**: 最多 1-2 個單詞

### Common Scopes | 常見範圍

**By Layer/Module | 依層級/模組**:

- `api`: API layer
- `ui`: User interface
- `auth`: Authentication/authorization
- `database`: Database layer
- `config`: Configuration
- `middleware`: Middleware layer

**By Feature | 依功能**:

- `login`: Login feature
- `payment`: Payment processing
- `notification`: Notifications
- `search`: Search functionality

**By File Type | 依檔案類型**:

- `tests`: Test files
- `docs`: Documentation files
- `build`: Build scripts
- `deps`: Dependencies

**Special Scopes | 特殊範圍**:

- `*`: Multiple scopes affected
- (no scope): Global changes

**Example Scopes for a Web API Project**:

```
auth, user, product, order, payment, notification,
database, config, middleware, api, tests, docs
```

---

## Subject Line | 主旨行

### Rules | 規則

1. **Length**: ≤72 characters (50 ideal)
   **長度**: ≤72 字元（50 為理想）
2. **Tense**: Use imperative mood ("Add feature" not "Added feature")
   **時態**: 使用祈使語氣（「Add feature」而非「Added feature」）
3. **Capitalization**: First letter capitalized
   **大寫**: 首字母大寫
4. **No period**: Don't end with a period (Exception: Bilingual Mode uses period as separator)
   **無句點**: 結尾不加句點（例外：雙語模式使用句點作為分隔符）
5. **Language**: Follow project policy (English or native language)
   **語言**: 遵循專案政策（英文或母語）

### Good Examples | 良好範例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
test(payment): Add unit tests for refund flow
perf(search): Implement index for full-text search
build(deps): Upgrade Express to 4.18.2
```

### Traditional Chinese Examples | 繁體中文範例

```
新增(認證): 實作 OAuth2 Google 登入支援
修正(API): 解決使用者 session 快取記憶體洩漏
重構(資料庫): 提取查詢建構器為獨立類別
文件(README): 更新 Node 20 安裝說明
測試(付款): 新增退款流程單元測試
效能(搜尋): 實作全文檢索索引
建置(依賴): 升級 Express 至 4.18.2
```

### Bad Examples | 不良範例

```
❌ "fixed bug" - Too vague, no scope
❌ "feat(auth): added google login and fixed a bug and refactored code" - Too long, multiple concerns
❌ "Update stuff." - Has period, too vague
❌ "Added OAuth2 login feature" - Past tense instead of imperative
❌ "WIP" - Not descriptive
```

---

## Body | 主體內容

Use the body to explain **WHY** the change was made, not **WHAT** was changed (the code shows what).

使用主體解釋**為何**做此變更，而非**變更了什麼**（程式碼已顯示變更內容）。

### Structure | 結構

- Use bullet points for multiple changes
- Wrap lines at 72 characters
- Separate from subject with a blank line
- Provide context and rationale

### Body Template | 主體範本

Use contextual headers based on the change type. Common patterns:

根據變更類型使用適當的標題。常見模式：

**For features | 新功能**:

```
Why this feature is needed:
What this implements:
Technical notes:
```

**For bug fixes | 修復**:

```
Why this occurred:
What this fix does:
Testing:
```

**For refactoring | 重構**:

```
Why this refactoring:
What this changes:
Migration:
```

**Generic template | 通用範本**:

```
<Subject line>

<Blank line>

Why:
- Reason 1
- Reason 2

What:
- Change 1
- Change 2

Notes:
- Context or considerations
```

### Examples | 範例

#### Example 1: Feature with Context

```
feat(payment): Add support for PayPal payment method

Why this change is needed:
- Customer survey shows 40% prefer PayPal
- Competitor analysis indicates missing payment option
- Q4 goal to increase payment method diversity

What this change does:
- Integrate PayPal SDK v2.0
- Add PayPal button to checkout page
- Implement webhook for payment confirmation
- Update payment history to show PayPal transactions

Technical notes:
- Used sandbox environment for testing
- Webhook signature validation implemented for security
```

#### Example 2: Bug Fix with Root Cause

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests to /users/:id could overwrite each other
- No optimistic locking or transaction isolation implemented
- Last write wins, causing data loss

What this fix does:
- Add version field to User model
- Implement optimistic locking check
- Return 409 Conflict if version mismatch
- Update API documentation with retry guidance

Testing:
- Added concurrent update test scenarios
- Verified with load test (100 concurrent updates)
```

#### Example 3: Traditional Chinese Body

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

## Footer | 頁尾

### Issue References | Issue 引用

Link commits to issue tracker:

```
Closes #123
Fixes #456
Resolves #789
Refs #101, #102
See also #999
```

**Supported Keywords** (GitHub, GitLab, Bitbucket):

- `Closes`, `Fixes`, `Resolves`: Automatically closes the issue
- `Refs`, `References`, `See also`: Links without closing

---

### Breaking Changes | 破壞性變更

**CRITICAL**: Always document breaking changes in footer.

**重要**: 永遠在頁尾記錄破壞性變更。

**Format**:

```
BREAKING CHANGE: <description>

Migration guide:
- Step 1
- Step 2
```

**Example**:

```
feat(api): Change user endpoint response format

- Flatten nested user object structure
- Remove deprecated `legacy_id` field
- Add `created_at` and `updated_at` timestamps

BREAKING CHANGE: User API response format changed

Old format:
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

New format:

```json
{
  "id": 123,
  "name": "John",
  "created_at": "2025-11-12T10:00:00Z",
  "updated_at": "2025-11-12T10:00:00Z"
}
```

Migration guide:

- Update API clients to remove `.data` wrapper
- Remove references to `legacy_id` field
- Use `created_at` instead of `createdAt` (snake_case)

Closes #234

```

---

## Complete Examples | 完整範例

### Example 1: Simple Fix (English)

```

fix(auth): Correct JWT expiration time calculation

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

Fixes #445

```

---

### Example 2: Feature with Multiple Parts (English)

```

feat(export): Add CSV export functionality for user data

Why this feature is needed:

- Admins need to export user lists for compliance audits
- Manual copy-paste from UI is error-prone
- Requested by legal and compliance teams

What this implements:

- New `/api/users/export` endpoint
- CSV generation using csv-writer library
- Streaming response to handle large datasets
- Date range filtering options
- Column selection (PII vs non-PII fields)

Technical notes:

- Streaming prevents memory issues with 100k+ users
- Export limited to admin role only
- PII fields require additional permission flag
- Rate limited to prevent abuse

Closes #567
Refs #234 (related compliance requirement)

```

---

### Example 3: Bilingual Mode - Simple Fix | 雙語對照模式 - 簡單修正

```

fix(auth): Correct JWT expiration time calculation. 修正 JWT 過期時間計算。

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

權杖因未考慮時區偏移而提早 1 小時過期。現已統一使用 UTC 時間。

Fixes #445

```

---

### Example 4: Bilingual Mode - Feature | 雙語對照模式 - 新功能

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

### Example 5: Bilingual Mode - Bug Fix with Root Cause | 雙語對照模式 - 含根因分析的 Bug 修正

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

### Example 6: Refactoring with Breaking Change (English)

```

refactor(database): Migrate from MySQL to PostgreSQL

Why this refactoring:

- PostgreSQL offers better JSON support for our use case
- Need advanced indexing features for full-text search
- Licensing considerations for cloud deployment

What this changes:

- Update database driver from mysql2 to pg
- Convert MySQL-specific queries to PostgreSQL syntax
- Update connection pooling configuration
- Migrate schema using migration scripts
- Update ORM configurations

Migration:

- Run `npm run db:backup` before upgrading
- Run `npm run db:migrate` to apply schema changes
- Update environment variables (see .env.example)

BREAKING CHANGE: Database engine changed from MySQL to PostgreSQL

Migration guide:

1. Backup existing MySQL database
2. Install PostgreSQL 15+
3. Update .env:
   - DATABASE_URL=postgresql://... (was mysql://...)
   - Remove MYSQL_* variables
4. Run migration: npm run db:migrate
5. Verify data integrity: npm run db:verify

Estimated downtime: 2-4 hours for production migration

Closes #890

```

---

### Example 7: Bilingual Mode - Breaking Change | 雙語對照模式 - 破壞性變更

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
- 將 MySQL 專用查詢轉換為 PostgreSQL 語法
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

## Anti-Patterns | 反模式

### ❌ Anti-Pattern 1: Vague Messages

```

fix: bug fix
refactor: code improvements
update: changes

```

**Problem**: No context, impossible to understand without reading code.

**✅ Fix**:
```

fix(login): Prevent duplicate session creation on rapid clicks
refactor(utils): Extract email validation regex to constants
feat(profile): Add avatar upload with image compression

```

---

### ❌ Anti-Pattern 2: Mixing Multiple Concerns

```

feat: add login, fix bugs, refactor database, update docs

```

**Problem**: Should be separate commits for reviewability and revertability.

**✅ Fix**: Split into separate commits:
```

feat(auth): Add OAuth2 login support
fix(api): Resolve null pointer in user lookup
refactor(database): Extract connection pool to separate module
docs(api): Update authentication endpoint documentation

```

---

### ❌ Anti-Pattern 3: Commit Message as Code Comments

```

fix: change line 45 from getUserById to getUserByEmail because the function was renamed

```

**Problem**: Too focused on implementation details instead of purpose.

**✅ Fix**:
```

fix(api): Use correct user lookup method in password reset

The password reset flow was calling getUserById with an email parameter,
causing lookups to fail. Now correctly calls getUserByEmail.

Fixes #789

```

---

### ❌ Anti-Pattern 4: No Body for Complex Changes

```

refactor(database): migrate to PostgreSQL

```

**Problem**: Breaking change with no migration guide or context.

**✅ Fix**: Add body with context and migration guide (see Example 3 above).

---

## Automation and Tooling | 自動化與工具

### Commit Message Linters | Commit 訊息檢查工具

**commitlint** (Node.js):
```bash
npm install --save-dev @commitlint/{cli,config-conventional}

# .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

**Git Hook** (enforce on commit):

```bash
# .git/hooks/commit-msg
#!/bin/sh
npx commitlint --edit $1
```

---

### Changelog Generation | 變更日誌生成

**standard-version** (Node.js):

```bash
npm install --save-dev standard-version

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Generates CHANGELOG.md from commits
npm run release
```

**git-chglog** (Go):

```bash
git-chglog --output CHANGELOG.md
```

---

## Project Configuration Template | 專案設定範本

Add to `CONTRIBUTING.md`:

```markdown
## Commit Message Format

### Type Language
This project uses **[English / Traditional Chinese / Bilingual 雙語對照]** commit types.

### Allowed Types
- feat / 新增: New features
- fix / 修正: Bug fixes
- refactor / 重構: Code refactoring
- docs / 文件: Documentation
- test / 測試: Tests
- perf / 效能: Performance improvements
- build / 建置: Build system
- ci / 整合: CI/CD changes
- chore / 維護: Maintenance
- security / 安全: Security fixes

### Allowed Scopes
- auth: Authentication module
- api: API layer
- ui: User interface
- database: Database layer
- [add your project-specific scopes]

### Subject Language
Commit subject lines should be in **[English/繁體中文/Bilingual 雙語]**.

### Examples

**English**:
```

feat(auth): Add OAuth2 support
fix(api): Resolve memory leak

```

**Traditional Chinese**:
```

新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏

```

**Bilingual Mode** (English first, Chinese follows):
**雙語模式**（英文在前，中文對照）:
```

feat(auth): Add OAuth2 support. 新增 OAuth2 支援。

Implement OAuth2 authentication flow.

實作 OAuth2 認證流程。

Closes #123

```

```

---

## Related Standards | 相關標準

- [Git Workflow Standards](git-workflow.md) - Git 工作流程標準
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入標準
- [Changelog Standards](changelog-standards.md) - 變更日誌標準
- [Versioning Standard](versioning.md) - 語義化版本標準

---

## Version History | 版本歷史

| Version | Date       | Changes                                                                                                                                                                                                                                              |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2.3   | 2025-12-24 | Added: Related Standards section |
| 1.2.2   | 2025-12-16 | Added: Language selection guide with decision matrix and quick selection tips 新增語言選擇指南，含決策矩陣和快速選擇提示 |
| 1.2.1   | 2025-12-09 | Improve Option A/B/C format consistency: unify title style, add description text 改善 Option A/B/C 格式一致性：統一標題風格、新增描述文字 |
| 1.2.0   | 2025-12-05 | Fix Option B type mapping (chore→維護); Add security type; Add scope naming rules; Clarify bilingual period exception; Improve templates 修正 Option B 類型對照（chore→維護）；新增 security 類型；新增 scope 命名規則；釐清雙語句點例外；改善範本 |
| 1.1.0   | 2025-12-05 | Add Bilingual Mode (Option C) with examples 新增雙語對照模式（選項 C）與範例                                                                                                                                                                         |
| 1.0.0   | 2025-11-12 | Initial guide published                                                                                                                                                                                                                              |

---

## References | 參考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## License | 授權

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
