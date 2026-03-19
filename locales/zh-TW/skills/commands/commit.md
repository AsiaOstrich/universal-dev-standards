---
source: ../../../../skills/commands/commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Generate commit messages following Conventional Commits standard
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[description of changes | 變更描述]"
---

# Commit Message 助手

> **Language**: [English](../../../../skills/commands/commit.md) | 繁體中文

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

---

## 前置檢查

在產生 commit 前，AI 助手必須執行以下檢查：

| 檢查 | 指令 | 失敗時 |
|------|------|--------|
| 有 staged 變更 | `git diff --cached --stat` | → 引導使用者 `git add` |
| 無合併衝突 | `grep -r "<<<<<<< " --include="*.{js,ts,md,yaml}" .` | → 先解決衝突 |
| 測試通過（feat/fix）| `cd cli && npm run test:unit`（或專案測試指令）| → 先修復測試 |
| Spec 引用（feat/fix）| 檢查 `docs/specs/SPEC-*.md` 是否有活躍規格 | → 建議在 footer 加 `Refs: SPEC-XXX` |

### Spec 追蹤閘門

對於 `feat` 和 `fix` 類型的提交：
1. **檢查**：`ls docs/specs/SPEC-*.md 2>/dev/null` — 是否有活躍的規格？
2. **如果有規格**：建議在 commit footer 加入 `Refs: SPEC-XXX`
3. **如果沒有規格且變更顯著**（>3 個檔案或新 API）：建議透過 `/sdd` 建立規格
4. **模式**：這是建議性的（非阻斷）— 使用者可以不引用規格

---

## 工作流程

1. **檢查狀態** - 執行 `git status` 和 `git diff --staged` 了解變更
2. **分析變更** - 判斷類型（feat、fix、refactor 等）和範圍
3. **Spec 追蹤評估** - 評估此變更是否需要規格（見下方）
4. **產生訊息** - 按照以下格式建立 commit message：
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
5. **確認並提交** - 在執行 `git commit` 前請使用者確認

## Spec 追蹤評估

對於 `feat`/`fix` 類型的提交，評估是否應建立或連結規格。當以下情況時建議建立規格：變更檔案多（>3）、修改公開 API 簽名、或有顯著的新功能。`docs`/`style`/`chore`/`test` 類型可跳過。

如果有連結規格，在 commit footer 加入 `Refs: SPEC-XXX`。這是建議性的 — 使用者可以忽略。

## 提交類型

| 類型 | 使用時機 |
|------|---------|
| `feat` | 新功能 |
| `fix` | 修復錯誤 |
| `refactor` | 重構 |
| `docs` | 文件更新 |
| `style` | 格式調整 |
| `test` | 測試相關 |
| `perf` | 效能優化 |
| `chore` | 維護任務 |

## 使用方式

- `/commit` - 自動分析變更並建議 commit message
- `/commit fix login bug` - 根據提供的描述產生訊息

## 參考

- 完整標準：[commit-standards](../commit-standards/SKILL.md)
- 核心指南：[commit-message-guide](../../core/commit-message-guide.md)
