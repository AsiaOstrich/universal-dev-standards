---
source: ../../../../skills/git-workflow-guide/branch-naming.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 分支命名參考

> **语言**: [English](../../../../skills/git-workflow-guide/branch-naming.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 Git 分支命名慣例和規則的參考指南。

---

## 标准格式

```
<type>/<short-description>
```

---

## 分支类型

### 功能分支

| 类型 | 用途 | 範例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `feat/` | 簡写形式 | `feat/user-dashboard` |

### 修復分支

| 类型 | 用途 | 範例 |
|------|-------|---------|
| `fix/` | 错误修復 | `fix/memory-leak` |
| `bugfix/` | 替代形式 | `bugfix/login-error` |
| `hotfix/` | 緊急正式環境修復 | `hotfix/security-patch` |

### 其他类型

| 类型 | 用途 | 範例 |
|------|-------|---------|
| `refactor/` | 程序码重構 | `refactor/extract-service` |
| `docs/` | 僅文件更新 | `docs/api-reference` |
| `test/` | 测试新增 | `test/integration-tests` |
| `chore/` | 維護任务 | `chore/update-deps` |
| `perf/` | 效能改善 | `perf/optimize-query` |
| `style/` | 格式調整 | `style/code-format` |
| `ci/` | CI/CD 变更 | `ci/add-coverage` |
| `release/` | 發布准备 | `release/v1.2.0` |

---

## 命名規則

### 应該做的事

1. **使用小写**
   ```bash
   feature/user-auth    # ✅ 良好
   Feature/User-Auth    # ❌ 不好
   ```

2. **使用連字号分隔空格**
   ```bash
   feature/oauth-login  # ✅ 良好
   feature/oauth_login  # ❌ 不好（底线）
   feature/oauthlogin   # ❌ 不好（無分隔符号）
   ```

3. **具描述性但簡潔**
   ```bash
   feature/add-user-authentication  # ✅ 良好
   feature/auth                     # ⚠️ 太模糊
   feature/add-new-user-authentication-with-oauth2-and-jwt  # ❌ 太長
   ```

4. **包含問題编号（选择性）**
   ```bash
   feature/123-oauth-login   # ✅ 良好
   feature/GH-123-oauth      # ✅ 良好（GitHub issue）
   feature/JIRA-456-payment  # ✅ 良好（Jira ticket）
   ```

### 不应該做的事

1. **不要只使用問題编号**
   ```bash
   feature/123       # ❌ 不具描述性
   fix/456           # ❌ 修復什麼？
   ```

2. **不要使用特殊字元**
   ```bash
   feature/oauth@login  # ❌ 不允許 @
   feature/auth#123     # ❌ 不允許 #
   ```

3. **不要使用空格**
   ```bash
   feature/oauth login  # ❌ 不允許空格
   ```

---

## 範例

### 良好範例

```bash
# 功能分支
feature/user-authentication
feature/oauth2-google-login
feature/123-add-payment-gateway
feat/dashboard-analytics

# 修復分支
fix/null-pointer-payment
fix/memory-leak-session-cache
bugfix/login-redirect-loop
hotfix/critical-data-loss

# 其他分支
refactor/database-connection-pool
docs/update-installation-guide
test/add-integration-tests
chore/update-dependencies
perf/optimize-database-queries
release/v1.2.0
```

### 不良範例

```bash
# ❌ 不具描述性
feature/123
fix/bug
update

# ❌ 错误的大小写
Feature/OAuth-Login
FIX/Memory-Leak
HOTFIX/security

# ❌ 错误的分隔符号
feature/oauth_login
feature/oauth.login
feature/oauth login

# ❌ 無类型前綴
oauth-login
user-authentication
memory-leak-fix

# ❌ 太模糊
feature/update
fix/issue
chore/stuff

# ❌ 太長
feature/add-new-user-authentication-system-with-oauth2-jwt-and-session-management
```

---

## 快速验证

推送前，检查您的分支名称：

```bash
# 检查目前分支名称
git branch --show-current

# 验证格式（应符合模式）
# <type>/<description>
# - type: feature, fix, bugfix, hotfix, refactor, docs, test, chore, perf, style, ci, release
# - description: 小写、連字号分隔、具描述性
```

### 验证检查清单

- [ ] 以有效的类型前綴開頭（`feature/`、`fix/` 等）
- [ ] 全部小写
- [ ] 使用連字号（非底线或空格）
- [ ] 具描述性但簡潔（理想为 3-5 个单字）
- [ ] 無特殊字元（@、#、$ 等）

---

## 相关标准

- [Git 工作流程策略](./git-workflow.md)
- [Git 工作流程](../../../../core/git-workflow.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
