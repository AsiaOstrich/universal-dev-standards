---
source: ../../../../skills/claude-code/CONTRIBUTING.template.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

> **语言**: [English](../../../../skills/claude-code/CONTRIBUTING.template.md) | 繁体中文

# 贡献指南范本

> 将此档案复制到您的专案中并命名为 `CONTRIBUTING.md`，然后根据需要进行自订。
> 此范本包含 [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) 的配置区块。

---

## 停用的技能

<!--
所有技能预设为启用。
取消注解并列出您想要在此专案中停用的技能。
-->

<!--
- testing-guide
- release-standards
-->

---

## 开发标准

### Commit 讯息语言

此专案使用**英文** commit 类型。
<!-- 选项：English | Traditional Chinese | Bilingual -->

#### 允许的类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 错误修复 |
| `refactor` | 程式码重构 |
| `docs` | 文件 |
| `style` | 格式化 |
| `test` | 测试 |
| `perf` | 效能 |
| `build` | 建置系统 |
| `ci` | CI/CD 变更 |
| `chore` | 维护 |
| `revert` | 还原提交 |
| `security` | 安全性修复 |

#### 允许的范围

- `auth` - 认证模组
- `api` - API 层
- `ui` - 使用者介面
- `db` - 资料库
- `core` - 核心功能
<!-- 新增您专案特定的范围 -->

---

### 确定性标签语言

此专案使用**英文**确定性标签。
<!-- 选项：English | 中文 -->

#### 标签参考

| 标签 | 使用时机 |
|------|----------|
| `[Confirmed]` | 来自程式码/文件的直接证据 |
| `[Inferred]` | 从证据进行逻辑推论 |
| `[Assumption]` | 基于常见模式 |
| `[Unknown]` | 资讯不可用 |
| `[Need Confirmation]` | 需要使用者确认 |

---

### Git 工作流程

#### 分支策略

此专案使用 **GitHub Flow**。
<!-- 选项：GitFlow | GitHub Flow | Trunk-Based Development -->

#### 分支命名

格式：`<type>/<description>`

| Type | 用途 | 范例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` | 错误修复 | `fix/memory-leak` |
| `hotfix/` | 紧急修复 | `hotfix/security-patch` |
| `refactor/` | 程式码重构 | `refactor/extract-service` |
| `docs/` | 文件 | `docs/api-reference` |
| `chore/` | 维护 | `chore/update-deps` |
| `release/` | 发布准备 | `release/v1.2.0` |

#### 合并策略

- Feature 分支：**Squash Merge**
<!-- 选项：Merge Commit | Squash Merge | Rebase -->

---

## 程式码审查

### 注解前缀

| 前缀 | 需要的动作 |
|------|-----------|
| **BLOCKING** | 必须在合并前修复 |
| **IMPORTANT** | 应该修复 |
| **SUGGESTION** | 可选的改进 |
| **QUESTION** | 需要厘清 |
| **NOTE** | 资讯性 |

---

## 测试

### 最低覆盖率

| 层级 | 目标 |
|------|------|
| Unit Tests | 80% |
| Integration Tests | 60% |
| E2E Tests | 关键路径 |

---

## Pull Request 流程

1. 从 `main` 建立 feature 分支
2. 进行您的变更
3. 确保所有测试通过
4. 提交 pull request
5. 处理审查意见
6. 核准后合并

---

## 授权

贡献至此专案即表示您同意您的贡献将依专案授权进行授权。
