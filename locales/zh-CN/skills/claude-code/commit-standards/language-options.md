---
source: /skills/claude-code/commit-standards/language-options.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Commit Message 语言选项

> **语言**: [English](../../../../../skills/claude-code/commit-standards/language-options.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供 commit message 类型的语言选项（英文、繁体中文或双语）。

---

## 选项 A：英文（国际化）

适用于国际团队和最大化工具相容性。

| 类型 | 使用时机 |
|------|----------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 程式码重构 |
| `docs` | 文件更新 |
| `style` | 格式化 |
| `test` | 测试 |
| `perf` | 效能改进 |
| `build` | 建置系统 |
| `ci` | CI/CD 变更 |
| `chore` | 维护任务 |
| `revert` | 回退提交 |
| `security` | 安全修复 |

**范例**:
```
feat(auth): Add OAuth2 Google login support
```

---

## 选项 B：繁体中文（台湾团队）

适用于偏好使用母语的本地团队。

| 类型 | 使用时机 | English |
|------|----------|------|
| `新增` | 新功能 | feat |
| `修正` | Bug 修复 | fix |
| `重构` | 重构 | refactor |
| `文件` | 文件更新 | docs |
| `样式` | 格式化 | style |
| `测试` | 测试 | test |
| `效能` | 效能改进 | perf |
| `建置` | 建置系统 | build |
| `整合` | CI/CD | ci |
| `维护` | 维护任务 | chore |
| `回退` | 回退提交 | revert |
| `安全` | 安全修复 | security |

**范例**:
```
新增(认证): 实作 OAuth2 Google 登入支援
```

---

## 选项 C：双语模式（双语对照）

使用英文 `type`/`scope` 以获得工具相容性，搭配双语 subject/body。

**格式**:
```
<type>(<scope>): <English subject>. <中文主旨>。

<English body>

<中文主体>

<footer>
```

**范例**:
```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

- Add Google OAuth2 SDK integration
- Create callback endpoint for OAuth flow
- Store refresh tokens securely

实作 Google OAuth2 认证流程供使用者登入。

- 整合 Google OAuth2 SDK
- 建立 OAuth 流程回呼端点
- 安全储存更新权杖

Closes #123
```

---

## 语言选择指南

| 因素 | English | 中文 | Bilingual |
|--------|---------|------|----------|
| **团队** | 国际化 | 本地 | 混合 |
| **工具相容性** | ✅ 最佳 | ⚠️ 有限 | ✅ 良好 |
| **Changelog 自动化** | ✅ 完整 | ⚠️ 需客制化 | ✅ 支援 |
| **开源专案** | ✅ 推荐 | ❌ 不推荐 | ✅ 良好 |

### 快速选择

- **开源专案** → English（选项 A）
- **本地团队、内部专案** → 中文（选项 B）
- **本地团队但有国际协作** → Bilingual（选项 C）

**重要**: 一旦选定，请保持一致。不要混用语言。

---

## 专案配置

在 `CONTRIBUTING.md` 中记录你的选择：

```markdown
## Commit Message 语言

本专案使用 **[English / Traditional Chinese / Bilingual]** commit 类型。

### 允许的类型
[根据你的选择列出类型]

### 允许的范围
- auth: 认证模组
- api: API 层
- ui: 使用者介面
[新增专案特定的范围]
```

---

## 相关标准

- [Commit Message Guide](../../../../../core/commit-message-guide.md)
- [Conventional Commits Guide](./conventional-commits.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
