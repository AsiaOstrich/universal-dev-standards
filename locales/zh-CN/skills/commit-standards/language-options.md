---
source: ../../../../skills/commit-standards/language-options.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 36fc9d639905
status: current
---

# 输出语言选项

> **语言**: [English](../../../../skills/commit-standards/language-options.md) | 简体中文

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
| `refactor` | 程序码重构 |
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

适用于偏好使用母语的本地团队。**类型维持英文**（与选项 A 同一份清单，commitlint 等工具才读得到）；**主旨与正文使用繁体中文**。不可使用 `新增` 这类中文类型。

| 类型 | 使用时机 | 范例 |
|------|----------|------|
| `feat` | 新功能 | `feat(auth): 加入 OAuth2 登入` |
| `fix` | Bug 修復 | `fix(api): 處理空值回應` |
| `refactor` | 重構 | `refactor(core): 簡化驗證邏輯` |
| `docs` | 文件更新 | `docs(readme): 更新安裝指南` |
| `style` | 格式化 | `style(lint): 修正縮排` |
| `test` | 測試 | `test(auth): 新增登入單元測試` |
| `perf` | 效能改進 | `perf(query): 最佳化資料庫查詢` |
| `build` | 建置系統 | `build(deps): 升級 lodash` |
| `ci` | CI/CD | `ci(github): 新增覆蓋率工作流程` |
| `chore` | 維護任務 | `chore(deps): 更新開發相依套件` |
| `revert` | 回退提交 | `revert: feat(auth): 加入 OAuth2 登入` |
| `security` | 安全修復 | `security(auth): 修正 XSS 漏洞` |

**范例**:
```
feat(auth): 實作 OAuth2 Google 登入支援
```

> 旧版曾列出中文类型（`新增`、`修正`……）。迁移方式：改写成英文类型——`新增`→`feat`、`修正`→`fix`、`重構`→`refactor`、`文件`→`docs`、`樣式`→`style`、`測試`→`test`、`效能`→`perf`、`建置`→`build`、`整合`→`ci`、`維護`→`chore`、`回退`→`revert`、`安全`→`security`。

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

- 集成 Google OAuth2 SDK
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
| **开源项目** | ✅ 推荐 | ❌ 不推荐 | ✅ 良好 |

### 快速选择

- **开源项目** → English（选项 A）
- **本地团队、内部项目** → 中文（选项 B）
- **本地团队但有国际协作** → Bilingual（选项 C）

**重要**: 一旦选定，请保持一致。不要混用语言。

---

## 项目配置

在 `CONTRIBUTING.md` 中记录你的选择：

```markdown
## Output Language

本项目使用 **[English / 繁体中文 / Bilingual]** commit 类型。

### 允许的类型
[根据你的选择列出类型]

### 允许的范围
- auth: 认证模组
- api: API 层
- ui: 使用者界面
[新增项目特定的范围]
```

---

## 相关标准

- [Commit Message Guide](../../../../core/commit-message-guide.md)
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
