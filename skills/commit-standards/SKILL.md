---
name: commit
scope: universal
description: "[UDS] Generate commit messages following Conventional Commits standard"
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[description of changes | 變更描述]"
disable-model-invocation: true
---

# Commit Message Assistant | Commit Message 助手

Generate well-formatted commit messages following the Conventional Commits standard.

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## Workflow | 工作流程

0. **Detect language** - Read `.standards/manifest.json` → check `options.output_language`. If not found, default to `english`.
1. **Check status** - Run `git status` and `git diff --staged` to understand changes
2. **Analyze changes** - Determine the type (feat, fix, refactor, etc.) and scope
3. **Generate message** - Create a commit message following the format for the detected language (see below)
4. **Confirm and commit** - Ask user to confirm before executing `git commit`

### Message Format | 訊息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Commit Types | 提交類型

| Type | When to Use | 使用時機 |
|------|-------------|---------|
| `feat` | New feature | 新功能 |
| `fix` | Bug fix | 修復錯誤 |
| `refactor` | Code refactoring | 重構（無功能變更） |
| `docs` | Documentation | 文件更新 |
| `style` | Formatting | 格式調整（無邏輯變更） |
| `test` | Tests | 測試相關 |
| `perf` | Performance | 效能優化 |
| `chore` | Maintenance | 維護任務 |

## Rules | 規則

- **Subject**: imperative mood, no period, first letter capitalized, ≤ 72 characters
- **Body**: explain **WHY** the change was made, not just what changed
- **Footer**: use `BREAKING CHANGE:` for breaking changes, `Fixes #123` for issue refs

## Bilingual Format | 雙語格式

When `output_language` is `bilingual`, you MUST use this format:

```
<type>(<scope>): <English subject>. <中文主旨>.

<English body — explain what and why in English>

<中文本文 — 用中文說明做了什麼及為什麼>

<footer>
```

### MUST Rules | 必須遵守的規則

1. English body comes FIRST, Chinese body comes SECOND
2. Separate English and Chinese body with a blank line
3. NEVER mix languages within the same paragraph
4. NEVER omit the Chinese body — both languages are required
5. Footer (BREAKING CHANGE, Fixes #, Co-authored-by) goes LAST after both bodies

### Bilingual Example | 雙語範例

```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援.

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

## Traditional Chinese Format | 繁體中文格式

When `output_language` is `traditional-chinese`, use Chinese types and body:

```
功能(認證): 新增 OAuth2 Google 登入支援

實作 Google OAuth2 認證流程供使用者登入。

關閉 #123
```

## Usage | 使用方式

- `/commit` - Auto-analyze staged changes and suggest commit message
- `/commit fix login bug` - Generate message based on provided description

## Next Steps Guidance | 下一步引導

After `/commit` completes, the AI assistant should suggest:

> **提交完成。建議下一步 / Commit complete. Suggested next steps:**
> - 執行 `git push` 推送到遠端 ⭐ **Recommended / 推薦** — Push to remote
> - 準備發布時 → 執行 `/changelog` + `/release` — When preparing a release → Run `/changelog` + `/release`
> - 發現重複模式或規範摩擦 → 執行 `/audit --report` 回報 — Patterns or friction detected → Run `/audit --report` to submit feedback

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [commit-message-guide.md](../../core/commit-message-guide.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/commit`](../commands/commit.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/commit`](../commands/commit.md#ai-agent-behavior--ai-代理行為)
