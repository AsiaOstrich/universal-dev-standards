---
source: ../../../../skills/commit-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  根據 Conventional Commits 規範產生格式正確的 commit message。
  使用時機：提交程式碼、撰寫 commit message、檢查提交格式。
  關鍵字：commit, conventional commits, 提交, 訊息, feat, fix, refactor。
---

# Commit Message 助手

> **語言**: [English](../../../../skills/commit-standards/SKILL.md) | 繁體中文

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## 工作流程

1. **檢查狀態** - 執行 `git status` 和 `git diff --staged` 了解變更內容
2. **分析變更** - 判斷類型（feat、fix、refactor 等）和範圍
3. **產生訊息** - 根據以下格式建立 commit message
4. **確認並提交** - 在執行 `git commit` 前詢問使用者確認

### 訊息格式

```
<type>(<scope>): <subject>
<body>
<footer>
```

## 提交類型

| 類型 | 使用時機 | When to Use |
|------|---------|-------------|
| `feat` | 新功能 | New feature |
| `fix` | 修復錯誤 | Bug fix |
| `refactor` | 重構（無功能變更） | Code refactoring |
| `docs` | 文件更新 | Documentation |
| `style` | 格式調整（無邏輯變更） | Formatting |
| `test` | 測試相關 | Tests |
| `perf` | 效能優化 | Performance |
| `chore` | 維護任務 | Maintenance |

## 規則

- **Subject**：祈使語氣、不加句號、首字母大寫、不超過 72 字元
- **Body**：說明**為什麼**進行變更，而非僅描述變更了什麼
- **Footer**：使用 `BREAKING CHANGE:` 標記破壞性變更，使用 `Fixes #123` 關聯 issue

## 使用方式

- `/commit` - 自動分析 staged 的變更並建議 commit message
- `/commit fix login bug` - 根據提供的描述產生訊息

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[commit-message-guide.md](../../../../core/commit-message-guide.md)
