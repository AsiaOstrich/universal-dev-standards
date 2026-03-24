---
name: pr
scope: universal
description: |
  Guide pull request creation, review automation, and merge strategies.
  Use when: creating PRs, automating reviews, configuring merge policies.
  Keywords: pull request, PR, merge, review, GitHub, GitLab, 合併請求, 審查.
allowed-tools: Read, Grep, Glob, Bash(git:*, gh:*)
argument-hint: "[branch name or PR number | 分支名稱或 PR 編號]"
---

# PR Automation Assistant | PR 自動化助手

Streamline the pull request lifecycle from creation to merge.

簡化從建立到合併的 Pull Request 生命週期。

## PR Creation Checklist | PR 建立檢查清單

| Item | Rule | 規則 |
|------|------|------|
| Title | `<type>(<scope>): <summary>` under 70 chars | 70 字元內，遵循 conventional commits |
| Description | Use structured template below | 使用下方結構化模板 |
| Labels | At least one category label | 至少一個分類標籤 |
| Reviewers | Assign based on CODEOWNERS or domain | 依 CODEOWNERS 或領域指派 |
| Branch | Up to date with base branch | 與基礎分支同步 |

## PR Description Template | PR 描述模板

```markdown
## Summary | 摘要
<1-3 bullet points describing the change>

## Changes | 變更內容
- Added / Modified / Removed ...

## Test Plan | 測試計畫
- [ ] Unit tests pass
- [ ] Manual verification steps

## Screenshots | 截圖
(if UI changes)
```

## Merge Strategy Decision | 合併策略決策

| Strategy | When to Use | 使用時機 |
|----------|-------------|----------|
| **Squash merge** | Feature branches with messy commits | 功能分支，提交記錄零散 |
| **Merge commit** | Release branches, preserve history | 發布分支，保留完整歷史 |
| **Rebase** | Linear history, small changes | 線性歷史，小幅變更 |

## Auto-Review Triggers | 自動審查觸發條件

| Trigger | Threshold | Action | 動作 |
|---------|-----------|--------|------|
| PR size | > 400 lines changed | Request split | 要求拆分 |
| No tests | 0 test files changed | Block merge | 阻止合併 |
| CI failure | Any check fails | Block merge | 阻止合併 |
| Stale PR | > 7 days no activity | Notify author | 通知作者 |
| Draft PR | Marked as draft | Skip reviewers | 跳過審查者指派 |

## Workflow | 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► MERGE ──► CLEANUP
```

1. **Create** — Branch, commit, push, open PR with template
2. **Review** — Automated checks + human review
3. **Approve** — All checks green, required approvals met
4. **Merge** — Apply chosen merge strategy
5. **Cleanup** — Delete source branch, update linked issues

## Usage | 使用方式

```
/pr                  - Guide PR creation for current branch | 引導建立當前分支的 PR
/pr create           - Create PR with template | 使用模板建立 PR
/pr --template       - Show PR description template | 顯示 PR 描述模板
/pr review 123       - Review specific PR | 審查特定 PR
```

## Next Steps Guidance | 下一步引導

After `/pr` completes, the AI assistant should suggest:

> **PR 操作完成。建議下一步 / PR operation complete. Suggested next steps:**
> - 執行 `/review` 進行詳細程式碼審查 — Run detailed code review
> - 執行 `/commit` 修正審查發現的問題 — Fix issues found in review
> - 執行 `/changelog` 更新變更日誌 — Update changelog
> - 檢查 CI 狀態 → `gh pr checks` — Check CI status

## Reference | 參考

- Core standard: [code-review-checklist.md](../../core/code-review-checklist.md)
- Core standard: [git-workflow.md](../../core/git-workflow.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
