---
source: ../../../core/commit-message-guide.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-10-16
source_hash: 8bf9a79dc6d1
status: current
---

# 提交消息指南

> **语言**: [English](../../../core/commit-message-guide.md) | [繁體中文](../../zh-TW/core/commit-message-guide.md) | 简体中文

**版本**: 1.4.0
**最后更新**: 2026-10-12
**适用范围**: 所有使用 Git 版本控制的项目
**范畴**: 通用
**行业标准**: Conventional Commits 1.0.0
**参考资料**: [conventionalcommits.org](https://www.conventionalcommits.org/)

---

## 目的

标准化的提交消息可提高代码审查效率，促进自动化变更日志生成，并使项目历史易于搜索与理解。

---

## 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 组成部分

| 组成部分    | 必要性      | 说明                               |
| ----------- | ----------- | ---------------------------------- |
| `type`    | ✅ 是       | 变更类型                           |
| `scope`   | 可选        | 受影响的模块/组件                  |
| `subject` | ✅ 是       | 简短描述（≤72 字符）               |
| `body`    | 建议提供    | 详细说明                           |
| `footer`  | 可选        | Issue 引用、破坏性变更             |

---

## 类型分类

**项目必须选择一种语言**作为类型并在整个项目中保持一致。

### 选项 A：英文（国际化）

适用于国际化团队以及需要最大工具兼容性的场景。

| 类型         | 使用时机                                      |
| ------------ | --------------------------------------------- |
| `feat`     | 新功能                                        |
| `fix`      | 错误修复                                      |
| `refactor` | 代码重构（无功能变更）                        |
| `docs`     | 仅文档变更                                    |
| `style`    | 格式调整、空白符（无代码逻辑变更）            |
| `test`     | 添加或更新测试                                |
| `perf`     | 性能改进                                      |
| `build`    | 构建系统或外部依赖变更                        |
| `ci`       | CI/CD 流水线变更                              |
| `chore`    | 日常维护任务                                  |
| `revert`   | 回滚先前的提交                                |
| `security` | 安全漏洞修复                                  |

### 选项 B：繁体中文（中国台湾团队）

使用**选项 A 的英文类型**，搭配繁体中文的主题（subject）与正文（body），适用于偏好母语提交的本地团队。类型保持英文是因为工具需要读取它（commitlint 的 `type-enum`、变更日志生成器、`uds simulate`）；只有主题和正文使用中文。**不允许**使用类似 `新增` 的中文类型。

| 类型       | 使用时机              | 示例                              |
| ---------- | --------------------- | --------------------------------- |
| `feat`     | 新功能                | `feat(auth): 加入 OAuth2 登入`     |
| `fix`      | 错误修复              | `fix(api): 處理空值回應`           |
| `refactor` | 代码重构              | `refactor(core): 簡化驗證邏輯`     |
| `docs`     | 仅文档变更            | `docs(readme): 更新安裝指南`       |
| `style`    | 仅格式调整            | `style(lint): 修正縮排`            |
| `test`     | 添加/更新测试         | `test(auth): 新增登入單元測試`     |
| `perf`     | 性能改进              | `perf(query): 最佳化資料庫查詢`    |
| `build`    | 构建系统              | `build(deps): 升級 lodash`         |
| `ci`       | CI/CD 变更            | `ci(github): 新增覆蓋率工作流程`   |
| `chore`    | 日常维护              | `chore(deps): 更新開發相依套件`    |
| `revert`   | 回滚提交              | `revert: feat(auth): 加入 OAuth2 登入` |
| `security` | 安全修复              | `security(auth): 修正 XSS 漏洞`    |

> **1.4.0 变更** (XSPEC-475)：此选项的早期版本列出了中文类型（`新增`、`修正` 等）。它们已不再被允许；曾使用这些类型的项目应通过将其替换为英文等效项来进行迁移（`新增` → `feat`、`修正` → `fix`、`重構` → `refactor`、`文件` → `docs`、`樣式` → `style`、`測試` → `test`、`效能` → `perf`、`建置` → `build`、`整合` → `ci`、`維護` → `chore`、`回退` → `revert`、`安全` → `security`）。

### 选项 C：双语模式（推荐）

使用英文的 `type` 和 `scope` 以保证工具兼容性，主题/正文/页脚则采用双语。

**格式**:

```
<type>(<scope>): <English subject>. <Chinese subject>.

<English body>

<Chinese body>

<footer>
```

**示例**:

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

> **注意**: 此配置项在项目清单中名为 `output_language`。它同时控制提交消息语言与文档语言。关于此配置项如何影响文档的详细信息，请参阅 [documentation-writing-standards.md](documentation-writing-standards.md#documentation-language-configuration)。

### 语言选择指南

使用本指南为您的项目选择合适的提交消息语言：

| 考量因素 | 英文 | 繁体中文 | 双语 |
|--------|---------|---------------------|-----------|
| **团队构成** | 国际化/混合团队 | 本地团队（中国台湾） | 混合团队且以本地为主 |
| **工具兼容性** | ✅ 最佳 | ⚠️ 受限 | ✅ 良好 |
| **变更日志自动化** | ✅ 完全支持 | ⚠️ 需自定义配置 | ✅ 支持 |
| **新人入职培训** | 中立 | 本地成员更容易上手 | 双双获益 |
| **开源项目** | ✅ 推荐 | ❌ 不推荐 | ✅ 良好选择 |

**快速选择**:
- **开源项目** → 英文（选项 A）
- **本地团队、内部项目** → 繁体中文（选项 B）
- **有国际协作的本地团队** → 双语（选项 C）

**重要说明**: 一旦选定，必须在整个项目中**一致使用**。请勿混用多种语言配置。

---

**项目决策点**: 在 `CONTRIBUTING.md` 中记录您的选择（单选）：

```markdown
## Output Language

<!-- Choose ONE of the following options: -->

<!-- Option A: English -->
This project uses **English** commit types (feat, fix, refactor, etc.)

<!-- Option B: Traditional Chinese -->
This project uses **English** commit types (feat, fix, refactor, etc.) with **Traditional Chinese** subjects and bodies

<!-- Option C: Bilingual Mode -->
This project uses **Bilingual Mode** with English types/scopes and bilingual subject/body.
```

---

## 作用域（Scope）指南

作用域用于指明代码库中受影响的部分。请使用简短且辨识度高的名称。

### 命名规则

1. **使用小写**: 所有作用域应使用小写字母（例如 `auth`，而非 `Auth`）
2. **多词使用连字符**: 词之间使用连字符分隔（例如 `user-profile`，而非 `userProfile`）
3. **保持简短**: 最多 1-2 个词

### 常用作用域

**按架构层/模块划分**:

- `api`: API 层
- `ui`: 用户界面
- `auth`: 认证/授权
- `database`: 数据库层
- `config`: 配置
- `middleware`: 中间件层

**按功能划分**:

- `login`: 登录功能
- `payment`: 支付处理
- `notification`: 通知
- `search`: 搜索功能

**按文件类型划分**:

- `tests`: 测试文件
- `docs`: 文档文件
- `build`: 构建脚本
- `deps`: 依赖项

**特殊作用域**:

- `*`: 涉及多个作用域
- （无 scope）: 全局变更

**Web API 项目示例作用域**:

```
auth, user, product, order, payment, notification,
database, config, middleware, api, tests, docs
```

---

## 主题行

### 规则

1. **长度**：≤72 个字符（推荐 50 个字符）
2. **时态**：使用祈使语气（"Add feature" 而非 "Added feature"）
3. **大小写**：首字母大写
4. **无句号**：结尾不加句号（例外：双语模式使用句号作为分隔符）
5. **语言**：遵循项目规范（英文或母语）

### 良好示例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
test(payment): Add unit tests for refund flow
perf(search): Implement index for full-text search
build(deps): Upgrade Express to 4.18.2
```

### 不良示例

```
❌ "fixed bug" - Too vague, no scope
❌ "feat(auth): added google login and fixed a bug and refactored code" - Too long, multiple concerns
❌ "Update stuff." - Has period, too vague
❌ "Added OAuth2 login feature" - Past tense instead of imperative
❌ "WIP" - Not descriptive
```

---

## 正文

使用正文解释**为什么**进行此变更，而不是变更了**什么**（代码本身已体现了改动内容）。

### 结构

- 针对多项变更使用项目符号列表
- 在 72 个字符处折行
- 与主题行之间用空行隔开
- 提供背景上下文与合理性理由

### 正文模板

根据变更类型使用符合上下文的标题。常见模式：

**针对新功能**：

```
Why this feature is needed:
What this implements:
Technical notes:
```

**针对错误修复**：

```
Why this occurred:
What this fix does:
Testing:
```

**针对重构**：

```
Why this refactoring:
What this changes:
Migration:
```

**通用模板**：

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

### 示例

#### 示例 1：带背景的新功能

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

#### 示例 2：带根本原因的错误修复

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

### Issue 引用

将提交关联到 Issue 追踪系统：

```
Closes #123
Fixes #456
Resolves #789
Refs #101, #102
See also #999
```

**支持的关键字**（GitHub、GitLab、Bitbucket）：

- `Closes`、`Fixes`、`Resolves`：自动关闭 Issue
- `Refs`、`References`、`See also`：仅建立关联而不关闭

### 自定义引用 Footer

当提交关联到规格、设计文档或外部追踪系统时，在页脚中使用一致的前缀进行引用：

```
Refs: <PREFIX>-<ID>
```

**按项目类型的常见前缀**：

| 前缀 | 使用场景 | 示例 |
|--------|----------|---------|
| `SPEC-` | 规格驱动开发 | `Refs: SPEC-042` |
| `JIRA-` | Jira 工单 | `Refs: JIRA-1234` |
| `FEATURE-` | 内部功能追踪 | `Refs: FEATURE-001` |
| `RFC-` | 提案文档 | `Refs: RFC-012` |

**示例**：

```
feat(auth): Add OAuth2 login support

Implement OAuth2 authentication flow.

Refs: SPEC-042
Closes #123
```

选择与您项目追踪系统相符的前缀并保持一致使用。

---

### 破坏性变更

**关键要求**：务必在页脚中记录破坏性变更并提供迁移指引。

**要求**：
1. 在页脚中使用 `BREAKING CHANGE:` 前缀
2. 描述变更了什么以及为什么变更
3. **必须**包含带有可操作步骤的迁移指南
4. 尽可能包含变更前/变更后示例

**格式**：

```
BREAKING CHANGE: <description>

Migration guide:
- Step 1: <specific action>
- Step 2: <specific action>
```

> **为什么必须提供迁移指南**：没有迁移路径的破坏性变更会令用户受挫并延缓采用。每个破坏性变更都必须明确告知用户该怎么做。

**示例**：

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

## 完整示例

### 示例 1：简单修复（英文）

```

fix(auth): Correct JWT expiration time calculation

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

Fixes #445

```

---

### 示例 2：包含多个部分的功能（英文）

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

### 示例 3：双语模式 - 简单修复

```

fix(auth): Correct JWT expiration time calculation. 修正 JWT 過期時間計算。

The token was expiring 1 hour early due to timezone offset not being accounted for. Now using UTC time consistently.

權杖因未考慮時區偏移而提早 1 小時過期。現已統一使用 UTC 時間。

Fixes #445

```

---

### 示例 4：双语模式 - 功能

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

### 示例 5：双语模式 - 包含根本原因的错误修复

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

### 示例 6：包含破坏性变更的重构（英文）

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

### 示例 7：双语模式 - 破坏性变更

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

## 反模式

### ❌ 反模式 1：模糊不清的消息

```

fix: bug fix
refactor: code improvements
update: changes

```

**问题**：缺乏上下文，不阅读代码就无法理解。

**✅ 修复**：
```

fix(login): Prevent duplicate session creation on rapid clicks
refactor(utils): Extract email validation regex to constants
feat(profile): Add avatar upload with image compression

```

---

### ❌ 反模式 2：混合多个关注点

```

feat: add login, fix bugs, refactor database, update docs

```

**问题**：为了便于审查与回滚，应拆分为独立的提交。

**✅ 修复**：拆分为独立的提交：
```

feat(auth): Add OAuth2 login support
fix(api): Resolve null pointer in user lookup
refactor(database): Extract connection pool to separate module
docs(api): Update authentication endpoint documentation

```

---

### ❌ 反模式 3：将提交消息当作代码注释

```

fix: change line 45 from getUserById to getUserByEmail because the function was renamed

```

**问题**：过于关注实现细节而非意图。

**✅ 修复**：
```

fix(api): Use correct user lookup method in password reset

The password reset flow was calling getUserById with an email parameter,
causing lookups to fail. Now correctly calls getUserByEmail.

Fixes #789

```

---

### ❌ 反模式 4：复杂变更未提供正文

```

refactor(database): migrate to PostgreSQL

```

**问题**：破坏性变更未提供迁移指南或上下文。

**✅ 修复**：添加包含上下文和迁移指南的正文（参见上文示例 6）。

---

## 自动化与工具链

### 提交消息检查工具（Linters）

**commitlint** (Node.js):
```bash
npm install --save-dev @commitlint/{cli,config-conventional}

# .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

**Git Hook**（在提交时强制执行）：

```bash
# .git/hooks/commit-msg
#!/bin/sh
npx commitlint --edit $1
```

---

### 变更日志生成

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

## 项目配置模板

添加到 `CONTRIBUTING.md`：

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

## 相关标准

- [Git 工作流程标准](git-workflow.md)
- [代码签入标准](checkin-standards.md)
- [变更日志标准](changelog-standards.md)
- [版本控制标准](versioning.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.4.0 | 2026-10-12 | 变更：选项 B（繁体中文）采用英文类型配合繁体中文主题与正文；不再允许使用中文类型（新增、修正……）（XSPEC-475 OQ1）。新增迁移对照表 |
| 1.3.0 | 2026-03-16 | 新增：规格引用页脚规范（Refs: SPEC-XXX） |
| 1.2.3 | 2025-12-24 | 新增：相关标准章节 |
| 1.2.2 | 2025-12-16 | 新增：语言选择指南，包含决策矩阵与快速选择建议 |
| 1.2.1 | 2025-12-09 | 改进选项 A/B/C 的格式一致性：统一标题样式，补充说明文本 |
| 1.2.0 | 2025-12-05 | 修复选项 B 的类型映射（chore→维护）；新增 security 类型；新增 scope 命名规则；阐明双语末尾句号例外规则；改进模板 |
| 1.1.0 | 2025-12-05 | 新增双语模式（选项 C）及示例 |
| 1.0.0 | 2025-11-12 | 初始指南发布 |

---

## 参考资料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## 许可证

本指南采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
