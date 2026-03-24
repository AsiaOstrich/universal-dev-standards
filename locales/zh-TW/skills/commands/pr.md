---
source: ../../../../skills/commands/pr.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide Pull Request creation, review automation and merge strategies"
allowed-tools: Read, Grep, Glob, Bash(git:*, gh:*)
argument-hint: "[branch name or PR number | 分支名稱或 PR 編號]"
---

# PR 自動化助手

引導 Pull Request 建立、審查自動化和合併策略。

## 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► MERGE ──► CLEANUP
```

## 使用方式

- `/pr` - 開始互動式 PR 建立
- `/pr create` - 從目前分支建立 PR
- `/pr --template` - 使用 PR 模板
- `/pr review 123` - 審查指定 PR

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/pr` | 檢查當前分支狀態，詢問建立或審查 PR |
| `/pr create` | 分析當前分支差異，建立 PR |
| `/pr --template` | 使用 PR 模板建立 |
| `/pr review <number>` | 審查指定 PR |

### Interaction Script | 互動腳本

#### CREATE 階段
1. 確認當前分支和目標分支
2. 分析 commits，生成 PR title 和 description
3. 展示 PR 內容預覽

🛑 **STOP**: PR 內容確認後等待使用者確認建立

#### REVIEW 階段
1. 取得 PR 差異
2. 執行程式碼審查（套用 `/review` 標準）
3. 展示審查結果

🛑 **STOP**: 審查結果展示後等待使用者決定

### Stop Points | 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| CREATE | PR 內容預覽後 | 確認建立 |
| REVIEW | 審查結果後 | 決定後續行動 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無遠端分支 | 建議先 push |
| PR 已存在 | 展示現有 PR，詢問是否更新 |
| CI 檢查失敗 | 列出失敗項目，建議修復 |

## 參考

- 完整標準：[pr-automation-assistant](../pr-automation-assistant/SKILL.md)
