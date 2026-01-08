---
source: skills/claude-code/git-workflow-guide/branch-naming.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 分支命名参考

> **语言**: [English](../../../../../skills/claude-code/git-workflow-guide/branch-naming.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供 Git 分支命名惯例和规则的参考指南。

---

## 标准格式

```
<type>/<short-description>
```

---

## 分支类型

### 功能分支

| 类型 | 用途 | 范例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `feat/` | 简写形式 | `feat/user-dashboard` |

### 修复分支

| 类型 | 用途 | 范例 |
|------|-------|---------|
| `fix/` | 错误修复 | `fix/memory-leak` |
| `bugfix/` | 替代形式 | `bugfix/login-error` |
| `hotfix/` | 紧急正式环境修复 | `hotfix/security-patch` |

### 其他类型

| 类型 | 用途 | 范例 |
|------|-------|---------|
| `refactor/` | 程式码重构 | `refactor/extract-service` |
| `docs/` | 仅文件更新 | `docs/api-reference` |
| `test/` | 测试新增 | `test/integration-tests` |
| `chore/` | 维护任务 | `chore/update-deps` |
| `perf/` | 效能改善 | `perf/optimize-query` |
| `style/` | 格式调整 | `style/code-format` |
| `ci/` | CI/CD 变更 | `ci/add-coverage` |
| `release/` | 发布准备 | `release/v1.2.0` |

---

## 命名规则

### 应该做的事

1. **使用小写**
   ```bash
   feature/user-auth    # ✅ 良好
   Feature/User-Auth    # ❌ 不好
   ```

2. **使用连字号分隔空格**
   ```bash
   feature/oauth-login  # ✅ 良好
   feature/oauth_login  # ❌ 不好（底线）
   feature/oauthlogin   # ❌ 不好（无分隔符号）
   ```

3. **具描述性但简洁**
   ```bash
   feature/add-user-authentication  # ✅ 良好
   feature/auth                     # ⚠️ 太模糊
   feature/add-new-user-authentication-with-oauth2-and-jwt  # ❌ 太长
   ```

4. **包含问题编号（选择性）**
   ```bash
   feature/123-oauth-login   # ✅ 良好
   feature/GH-123-oauth      # ✅ 良好（GitHub issue）
   feature/JIRA-456-payment  # ✅ 良好（Jira ticket）
   ```

### 不应该做的事

1. **不要只使用问题编号**
   ```bash
   feature/123       # ❌ 不具描述性
   fix/456           # ❌ 修复什么？
   ```

2. **不要使用特殊字元**
   ```bash
   feature/oauth@login  # ❌ 不允许 @
   feature/auth#123     # ❌ 不允许 #
   ```

3. **不要使用空格**
   ```bash
   feature/oauth login  # ❌ 不允许空格
   ```

---

## 范例

### 良好范例

```bash
# 功能分支
feature/user-authentication
feature/oauth2-google-login
feature/123-add-payment-gateway
feat/dashboard-analytics

# 修复分支
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

### 不良范例

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

# ❌ 无类型前缀
oauth-login
user-authentication
memory-leak-fix

# ❌ 太模糊
feature/update
fix/issue
chore/stuff

# ❌ 太长
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
# - description: 小写、连字号分隔、具描述性
```

### 验证检查清单

- [ ] 以有效的类型前缀开头（`feature/`、`fix/` 等）
- [ ] 全部小写
- [ ] 使用连字号（非底线或空格）
- [ ] 具描述性但简洁（理想为 3-5 个单字）
- [ ] 无特殊字元（@、#、$ 等）

---

## 相关标准

- [Git 工作流程策略](./git-workflow.md)
- [Git 工作流程](../../../../../core/git-workflow.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
