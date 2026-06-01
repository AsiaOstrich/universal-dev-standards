---
name: commit-standards
source: ../../../../skills/commit-standards/SKILL.md
source_version: 1.0.0
source_hash: 8535f438ced8
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: "[UDS] 根據 Conventional Commits 規範產生格式正確的 commit message"
---

# Commit Message 助手

> **語言**: [English](../../../../skills/commit-standards/SKILL.md) | 繁體中文

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## 工作流程

0. **偵測語言** - 讀取 `.standards/manifest.json` → 檢查 `options.output_language`。若找不到，預設為 `english`。
1. **檢查狀態** - 執行 `git status` 和 `git diff --staged` 了解變更內容
2. **分析變更** - 判斷類型（feat、fix、refactor 等）和範圍
3. **產生訊息** - 依偵測到的語言，按以下對應格式建立 commit message（見下方）
4. **確認並提交** - 在執行 `git commit` 前詢問使用者確認

### 訊息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 提交類型

| 類型 | 使用時機 |
|------|---------|
| `feat` | 新功能 |
| `fix` | 修復錯誤 |
| `refactor` | 重構（無功能變更） |
| `docs` | 文件更新 |
| `style` | 格式調整（無邏輯變更） |
| `test` | 測試相關 |
| `perf` | 效能優化 |
| `chore` | 維護任務 |

## 規則

- **Subject**：祈使語氣、不加句號、首字母大寫、不超過 72 字元
- **Body**：說明**為什麼**進行變更，而非僅描述變更了什麼
- **Footer**：使用 `BREAKING CHANGE:` 標記破壞性變更，使用 `Fixes #123` 關聯 issue

## 雙語格式

當 `output_language` 為 `bilingual` 時，你必須使用以下格式：

```
<type>(<scope>): <English subject>. <中文主旨>.

<English body — explain what and why in English>

<中文本文 — 用中文說明做了什麼及為什麼>

<footer>
```

### 必須遵守的規則

1. 英文本文在前，中文本文在後
2. 英文本文與中文本文之間以空白行分隔
3. 嚴禁在同一段落內混用語言
4. 嚴禁省略中文本文——兩種語言皆為必填
5. Footer（BREAKING CHANGE、Fixes #、Co-authored-by）置於兩段本文之後的最末端

### 雙語範例

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

## 繁體中文格式

當 `output_language` 為 `traditional-chinese` 時，使用中文類型與本文：

```
功能(認證): 新增 OAuth2 Google 登入支援

實作 Google OAuth2 認證流程供使用者登入。

關閉 #123
```

## 使用方式

- `/commit` - 自動分析 staged 的變更並建議 commit message
- `/commit fix login bug` - 根據提供的描述產生訊息

## 下一步引導

`/commit` 完成後，AI 助手應建議：

> **提交完成。建議下一步：**
> - 執行 `git push` 推送到遠端 ⭐ **推薦** — 推送到遠端
> - 準備發布時 → 執行 `/changelog` + `/release` — 準備發布時執行
> - 發現重複模式或規範摩擦 → 執行 `/audit --report` 回報 — 偵測到模式或摩擦時回報意見

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[commit-message-guide.md](../../../../core/commit-message-guide.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/commit`](../commands/commit.md#ai-agent-behavior--ai-代理行為)
