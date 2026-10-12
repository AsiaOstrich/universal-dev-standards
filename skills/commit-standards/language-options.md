# Output Language Options

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/commit-standards/language-options.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides language options for commit message types (English, Traditional Chinese, or Bilingual).

---

## Option A: English (International)

Use for international teams and maximum tool compatibility.

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring |
| `docs` | Documentation |
| `style` | Formatting |
| `test` | Tests |
| `perf` | Performance |
| `build` | Build system |
| `ci` | CI/CD changes |
| `chore` | Maintenance |
| `revert` | Revert commit |
| `security` | Security fix |

**Example**:
```
feat(auth): Add OAuth2 Google login support
```

---

## Option B: Traditional Chinese (台灣團隊)

Use for local teams preferring native language. The **type stays English** (same list as Option A, so commitlint and other tools can read it); the **subject and body are Traditional Chinese**. A Chinese type such as `新增` is not allowed.

| Type | When to Use | 範例 |
|------|-------------|------|
| `feat` | New feature | `feat(auth): 加入 OAuth2 登入` |
| `fix` | Bug fix | `fix(api): 處理空值回應` |
| `refactor` | Code refactoring | `refactor(core): 簡化驗證邏輯` |
| `docs` | Documentation | `docs(readme): 更新安裝指南` |
| `style` | Formatting | `style(lint): 修正縮排` |
| `test` | Tests | `test(auth): 新增登入單元測試` |
| `perf` | Performance | `perf(query): 最佳化資料庫查詢` |
| `build` | Build system | `build(deps): 升級 lodash` |
| `ci` | CI/CD changes | `ci(github): 新增覆蓋率工作流程` |
| `chore` | Maintenance | `chore(deps): 更新開發相依套件` |
| `revert` | Revert commit | `revert: feat(auth): 加入 OAuth2 登入` |
| `security` | Security fix | `security(auth): 修正 XSS 漏洞` |

**Example**:
```
feat(auth): 實作 OAuth2 Google 登入支援
```

> Earlier versions listed Chinese types (`新增`, `修正`, ...). Migrate by writing the English type: `新增`→`feat`, `修正`→`fix`, `重構`→`refactor`, `文件`→`docs`, `樣式`→`style`, `測試`→`test`, `效能`→`perf`, `建置`→`build`, `整合`→`ci`, `維護`→`chore`, `回退`→`revert`, `安全`→`security`.

---

## Option C: Bilingual Mode (雙語對照)

Use English `type`/`scope` for tool compatibility, with bilingual subject/body.

**Format**:
```
<type>(<scope>): <English subject>. <中文主旨>。

<English body>

<中文主體>

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

---

## Language Selection Guide

| Factor | English | 中文 | Bilingual |
|--------|---------|------|----------|
| **Team** | International | Local | Mixed |
| **Tool compatibility** | ✅ Best | ⚠️ Limited | ✅ Good |
| **Changelog automation** | ✅ Full | ⚠️ Custom | ✅ Supported |
| **Open source** | ✅ Recommended | ❌ Not recommended | ✅ Good |

### Quick Selection

- **Open source project** → English (Option A)
- **Local team, internal project** → 中文 (Option B)
- **Local team with international collaboration** → Bilingual (Option C)

**Important**: Once chosen, use consistently. Do not mix languages.

---

## Project Configuration

Document your choice in `CONTRIBUTING.md`:

```markdown
## Output Language

This project uses **[English / Traditional Chinese / Bilingual]** commit types.

### Allowed Types
[List types based on your choice]

### Allowed Scopes
- auth: Authentication module
- api: API layer
- ui: User interface
[Add project-specific scopes]
```

---

## Related Standards

- [Commit Message Guide](../../core/commit-message-guide.md)
- [Conventional Commits Guide](./conventional-commits.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
