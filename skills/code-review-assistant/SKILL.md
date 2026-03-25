---
name: review
scope: universal
description: "[UDS] Perform systematic code review with checklist"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 檔案路徑或分支名稱]"
disable-model-invocation: true
---

# Code Review Assistant | 程式碼審查助手

Perform systematic code review using standardized checklists and comment prefixes.

執行系統性的程式碼審查，使用標準化的檢查清單和評論前綴。

## Workflow | 工作流程

1. **Identify changes** - Get diff of files to review via `git diff` or `git show`
2. **Apply checklist** - Check each review category systematically
3. **Generate report** - Output findings with standard comment prefixes
4. **Summarize** - Provide overall assessment and recommended actions

## Review Categories | 審查類別

1. **Functionality** - Does it work correctly? | 功能是否正確？
2. **Design** - Is the architecture appropriate? | 架構是否合適？
3. **Quality** - Is the code clean and maintainable? | 程式碼是否乾淨可維護？
4. **Readability** - Is it easy to understand? | 是否容易理解？
5. **Tests** - Is there adequate test coverage? | 測試覆蓋是否足夠？
6. **Security** - Are there any vulnerabilities? | 是否有安全漏洞？
7. **Performance** - Is it efficient? | 是否有效率？
8. **Error Handling** - Are errors handled properly? | 錯誤處理是否妥當？

## Comment Prefixes | 評論前綴

| Prefix | Meaning | Action | 動作 |
|--------|---------|--------|------|
| **BLOCKING** | Must fix before merge | Required | 必須修復 |
| **IMPORTANT** | Should fix | Recommended | 建議修復 |
| **SUGGESTION** | Nice-to-have | Optional | 可選改善 |
| **QUESTION** | Need clarification | Discuss | 需要討論 |
| **NOTE** | Informational | FYI | 僅供參考 |

## Usage | 使用方式

- `/review` - Review all changes in current branch
- `/review src/auth.js` - Review specific file
- `/review feature/login` - Review specific branch

## Next Steps Guidance | 下一步引導

After `/review` completes, the AI assistant should suggest:

> **程式碼審查完成。建議下一步 / Code review complete. Suggested next steps:**
> - 有 ❗ BLOCKING 項目 → 修復後重新執行 `/review` — Fix issues then re-run `/review`
> - 全部通過 → 執行 `/checkin` 品質關卡 ⭐ **Recommended / 推薦** — All passed → Run `/checkin` quality gates
> - 僅有 💡 SUGGESTION → 執行 `/commit` 提交變更 — Only suggestions → Run `/commit`
> - 審查中發現規範不實用或缺失 → 執行 `/audit --report` 回報 — Found impractical or missing standards → Run `/audit --report`

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [code-review-checklist.md](../../core/code-review-checklist.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/review`](../commands/review.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/review`](../commands/review.md#ai-agent-behavior--ai-代理行為)
