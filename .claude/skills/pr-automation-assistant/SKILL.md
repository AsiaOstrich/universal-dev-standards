---
source: ../../../../skills/pr-automation-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: "[UDS] 引導 Pull Request 建立、審查自動化和合併策略"
name: pr
allowed-tools: Read, Grep, Glob, Bash(git:*, gh:*)
scope: universal
argument-hint: "[branch name or PR number | 分支名稱或 PR 編號]"
---

# PR 自動化助手

> **語言**: [English](../../../../skills/pr-automation-assistant/SKILL.md) | 繁體中文

簡化從建立到合併的 Pull Request 生命週期。

## PR 建立檢查清單

| 項目 | 規則 |
|------|------|
| 標題 | `<type>(<scope>): <summary>`，70 字元內 |
| 描述 | 使用結構化模板 |
| 標籤 | 至少一個分類標籤 |
| 審查者 | 依 CODEOWNERS 或領域指派 |
| 分支 | 與基礎分支同步 |

## PR 描述模板

```markdown
## 摘要
<1-3 個重點描述變更>

## 變更內容
- 新增 / 修改 / 移除 ...

## 測試計畫
- [ ] 單元測試通過
- [ ] 手動驗證步驟

## 截圖
（如有 UI 變更）
```

## 合併策略決策

| 策略 | 使用時機 |
|------|----------|
| **Squash merge** | 功能分支，提交記錄零散 |
| **Merge commit** | 發布分支，保留完整歷史 |
| **Rebase** | 線性歷史，小幅變更 |

## 自動審查觸發條件

| 觸發條件 | 閾值 | 動作 |
|----------|------|------|
| PR 大小 | > 400 行變更 | 要求拆分 |
| 無測試 | 0 個測試檔案變更 | 阻止合併 |
| CI 失敗 | 任何檢查失敗 | 阻止合併 |
| 過期 PR | > 7 天無活動 | 通知作者 |
| 草稿 PR | 標記為草稿 | 跳過審查者指派 |

## 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► MERGE ──► CLEANUP
```

## 使用方式

- `/pr` - 引導建立當前分支的 PR
- `/pr create` - 使用模板建立 PR
- `/pr --template` - 顯示 PR 描述模板
- `/pr review 123` - 審查特定 PR

## 下一步引導

`/pr` 完成後，AI 助手應建議：

> **PR 操作完成。建議下一步：**
> - 執行 `/review` 進行詳細程式碼審查
> - 執行 `/commit` 修正審查發現的問題
> - 執行 `/changelog` 更新變更日誌
> - 檢查 CI 狀態 → `gh pr checks`

## 參考

- 核心規範：[code-review-checklist.md](../../../../core/code-review-checklist.md)
- 核心規範：[git-workflow.md](../../../../core/git-workflow.md)
