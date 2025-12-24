# Commit Message Language Options

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

Use for local teams preferring native language.

| 類型 | 使用時機 | English |
|------|----------|----------|
| `新增` | 新功能 | feat |
| `修正` | Bug 修復 | fix |
| `重構` | 重構 | refactor |
| `文件` | 文件更新 | docs |
| `樣式` | 格式化 | style |
| `測試` | 測試 | test |
| `效能` | 效能改進 | perf |
| `建置` | 建置系統 | build |
| `整合` | CI/CD | ci |
| `維護` | 維護任務 | chore |
| `回退` | 回退提交 | revert |
| `安全` | 安全修復 | security |

**Example**:
```
新增(認證): 實作 OAuth2 Google 登入支援
```

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
## Commit Message Language

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

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
