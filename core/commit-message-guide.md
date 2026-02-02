# Commit Message Guide

> **Language**: English | [繁體中文](../locales/zh-TW/core/commit-message-guide.md)

**Version**: 1.2.3
**Last Updated**: 2025-12-24
**Applicability**: All projects using Git version control
**Scope**: universal
**Industry Standards**: Conventional Commits 1.0.0
**References**: [conventionalcommits.org](https://www.conventionalcommits.org/)

---

## Purpose

Standardized commit messages improve code review efficiency, facilitate automated changelog generation, and make project history searchable and understandable.

---

## Basic Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

| Component   | Required    | Description                        |
| ----------- | ----------- | ---------------------------------- |
| `type`    | ✅ Yes      | Type of change                     |
| `scope`   | Optional    | Module/component affected          |
| `subject` | ✅ Yes      | Brief description (≤72 chars)     |
| `body`    | Recommended | Detailed explanation               |
| `footer`  | Optional    | Issue references, breaking changes |

---

## Type Classification

**PROJECT MUST CHOOSE ONE LANGUAGE** for types and use it consistently.

### Option A: English (International)

Use English types for international teams and maximum tool compatibility.

| Type         | When to Use                                   |
| ------------ | --------------------------------------------- |
| `feat`     | New feature                                   |
| `fix`      | Bug fix                                       |
| `refactor` | Code refactoring (no functional change)       |
| `docs`     | Documentation only                            |
| `style`    | Formatting, whitespace (no code logic change) |
| `test`     | Adding or updating tests                      |
| `perf`     | Performance improvement                       |
| `build`    | Build system or dependencies                  |
| `ci`       | CI/CD pipeline changes                        |
| `chore`    | Maintenance tasks                             |
| `revert`   | Revert previous commit                        |
| `security` | Security vulnerability fix                    |

### Option B: Traditional Chinese (Taiwanese Teams)

Use Traditional Chinese types for local teams preferring native language commits.

| Type   | When to Use          | English Equivalent |
| ------ | -------------------- | ------------------ |
| `新增` | New feature          | feat               |
| `修正` | Bug fix              | fix                |
| `重構` | Refactoring          | refactor           |
| `文件` | Documentation only   | docs               |
| `樣式` | Formatting only      | style              |
| `測試` | Adding/updating tests | test              |
| `效能` | Performance          | perf               |
| `建置` | Build system         | build              |
| `整合` | CI/CD changes        | ci                 |
| `維護` | Maintenance          | chore              |
| `回退` | Revert commit        | revert             |
| `安全` | Security fix         | security           |

### Option C: Bilingual Mode (Recommended)

Use English `type` and `scope` for tool compatibility, with bilingual subject/body/footer.

**Format**:

```
<type>(<scope>): <English subject>. <Chinese subject>.

<English body>

<Chinese body>

<footer>
```

**Example**:

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

### Language Selection Guide

Use this guide to choose the appropriate commit message language for your project:

| Factor | English | Traditional Chinese | Bilingual |
|--------|---------|---------------------|-----------|
| **Team composition** | International/mixed | Local (Taiwan) | Mixed with local focus |
| **Tool compatibility** | ✅ Best | ⚠️ Limited | ✅ Good |
| **Changelog automation** | ✅ Full support | ⚠️ Custom config | ✅ Supported |
| **Onboarding** | Neutral | Easier for locals | Both benefit |
| **Open source** | ✅ Recommended | ❌ Not recommended | ✅ Good choice |

**Quick Selection**:
- **Open source project** → English (Option A)
- **Local team, internal project** → Traditional Chinese (Option B)
- **Local team with international collaboration** → Bilingual (Option C)

**Important**: Once chosen, **use consistently** across the entire project. Do not mix languages.

---

**Project Decision Point**: Document your choice in `CONTRIBUTING.md` (choose ONE):

```markdown
## Commit Message Language

<!-- Choose ONE of the following options: -->

<!-- Option A: English -->
This project uses **English** commit types (feat, fix, refactor, etc.)

<!-- Option B: Traditional Chinese -->
This project uses **Traditional Chinese** commit types (新增, 修正, 重構, etc.)

<!-- Option C: Bilingual Mode -->
This project uses **Bilingual Mode** with English types/scopes and bilingual subject/body.
```

---

## Scope Guidelines

Scope indicates which part of the codebase is affected. Use short, recognizable names.

### Naming Rules

1. **Use lowercase**: All scopes should be lowercase (`auth`, not `Auth`)
2. **Use hyphen for multi-word**: Separate words with hyphens (`user-profile`, not `userProfile`)
3. **Keep it short**: 1-2 words maximum

### Common Scopes

**By Layer/Module**:

- `api`: API layer
- `ui`: User interface
- `auth`: Authentication/authorization
- `database`: Database layer
- `config`: Configuration
- `middleware`: Middleware layer

**By Feature**:

- `login`: Login feature
- `payment`: Payment processing
- `notification`: Notifications
- `search`: Search functionality

**By File Type**:

- `tests`: Test files
- `docs`: Documentation files
- `build`: Build scripts
- `deps`: Dependencies

**Special Scopes**:

- `*`: Multiple scopes affected
- (no scope): Global changes

**Example Scopes for a Web API Project**:

```
auth, user, product, order, payment, notification,
database, config, middleware, api, tests, docs
```

---

## Subject Line

### Rules

1. **Length**: ≤72 characters (50 ideal)
2. **Tense**: Use imperative mood ("Add feature" not "Added feature")
3. **Capitalization**: First letter capitalized
4. **No period**: Don't end with a period (Exception: Bilingual Mode uses period as separator)
5. **Language**: Follow project policy (English or native language)

### Good Examples

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
test(payment): Add unit tests for refund flow
perf(search): Implement index for full-text search
build(deps): Upgrade Express to 4.18.2
```

### Bad Examples

```
❌ "fixed bug" - Too vague, no scope
❌ "feat(auth): added google login and fixed a bug and refactored code" - Too long, multiple concerns
❌ "Update stuff." - Has period, too vague
❌ "Added OAuth2 login feature" - Past tense instead of imperative
❌ "WIP" - Not descriptive
```

---

## Body

Use the body to explain **WHY** the change was made, not **WHAT** was changed (the code shows what).

### Structure

- Use bullet points for multiple changes
- Wrap lines at 72 characters
- Separate from subject with a blank line
- Provide context and rationale

### Body Template

Use contextual headers based on the change type. Common patterns:

**For features**:

```
Why this feature is needed:
What this implements:
Technical notes:
```

**For bug fixes**:

```
Why this occurred:
What this fix does:
Testing:
```

**For refactoring**:

```
Why this refactoring:
What this changes:
Migration:
```

**Generic template**:

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

### Examples

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

---

## Footer

### Issue References

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

### Breaking Changes

**CRITICAL**: Always document breaking changes in footer with migration guidance.

**Requirements**:
1. Use `BREAKING CHANGE:` prefix in footer
2. Describe what changed and why
3. **MUST** include migration guide with actionable steps
4. Include before/after examples when possible

**Format**:

```
BREAKING CHANGE: <description>

Migration guide:
- Step 1: <specific action>
- Step 2: <specific action>
```

> **Why migration guide is required**: Breaking changes without migration paths frustrate users and slow adoption. Every breaking change MUST tell users exactly what to do.

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

## Complete Examples

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

### Example 3: Bilingual Mode - Simple Fix

```

fix(auth): Correct JWT expiration time calculation. 修正 JWT 過期時間計算。

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

權杖因未考慮時區偏移而提早 1 小時過期。現已統一使用 UTC 時間。

Fixes #445

```

---

### Example 4: Bilingual Mode - Feature

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

### Example 5: Bilingual Mode - Bug Fix with Root Cause

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

### Example 7: Bilingual Mode - Breaking Change

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

## Anti-Patterns

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

**✅ Fix**: Add body with context and migration guide (see Example 6 above).

---

## Automation and Tooling

### Commit Message Linters

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

### Changelog Generation

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

## Project Configuration Template

Add to `CONTRIBUTING.md`:

```markdown
## Commit Message Format

### Type Language
This project uses **[English / Traditional Chinese / Bilingual]** commit types.

### Allowed Types
- feat: New features
- fix: Bug fixes
- refactor: Code refactoring
- docs: Documentation
- test: Tests
- perf: Performance improvements
- build: Build system
- ci: CI/CD changes
- chore: Maintenance
- security: Security fixes

### Allowed Scopes
- auth: Authentication module
- api: API layer
- ui: User interface
- database: Database layer
- [add your project-specific scopes]

### Subject Language
Commit subject lines should be in **[English/繁體中文/Bilingual]**.

### Examples

**English**:
```

feat(auth): Add OAuth2 support
fix(api): Resolve memory leak

```

**Bilingual Mode** (English first, Chinese follows):
```

feat(auth): Add OAuth2 support. 新增 OAuth2 支援。

Implement OAuth2 authentication flow.

實作 OAuth2 認證流程。

Closes #123

```

```

---

## Related Standards

- [Git Workflow Standards](git-workflow.md)
- [Code Check-in Standards](checkin-standards.md)
- [Changelog Standards](changelog-standards.md)
- [Versioning Standard](versioning.md)

---

## Version History

| Version | Date       | Changes                                                                                                                                                                                                                                              |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2.3   | 2025-12-24 | Added: Related Standards section |
| 1.2.2   | 2025-12-16 | Added: Language selection guide with decision matrix and quick selection tips |
| 1.2.1   | 2025-12-09 | Improve Option A/B/C format consistency: unify title style, add description text |
| 1.2.0   | 2025-12-05 | Fix Option B type mapping (chore→維護); Add security type; Add scope naming rules; Clarify bilingual period exception; Improve templates |
| 1.1.0   | 2025-12-05 | Add Bilingual Mode (Option C) with examples |
| 1.0.0   | 2025-11-12 | Initial guide published                                                                                                                                                                                                                              |

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
